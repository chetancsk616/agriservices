import os
import base64
import requests
import google.generativeai as genai
import json
import streamlit as st
from dotenv import load_dotenv
from PIL import Image
import io

# --- Page Configuration ---
st.set_page_config(
    page_title="Agri-Assistant",
    page_icon="🌿",
    layout="centered",
    initial_sidebar_state="auto",
)

# --- Load API Keys ---
# Use Streamlit's secrets management for deployment
load_dotenv()
try:
    gemini_api_key = os.getenv("GOOGLE_API_KEY") or st.secrets["GOOGLE_API_KEY"]
    plant_id_api_key = os.getenv("PLANT_ID_API_KEY") or st.secrets["PLANT_ID_API_KEY"]
except (KeyError, FileNotFoundError):
    st.error("API keys not found. Please set them in your environment variables or Streamlit secrets.")
    st.stop()


# --- API Call Functions ---
def get_gemini_response(prompt):
    """Calls the Gemini API and returns the text response."""
    try:
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return f"Sorry, I encountered an error trying to connect to the Gemini AI model: {e}"

def analyze_plant_image(image_bytes):
    """Analyzes an image with the Plant.id API and returns the JSON analysis."""
    try:
        img_data = base64.b64encode(image_bytes).decode('utf-8')
        payload = {"images": [img_data], "disease_details": ["common_names", "description", "treatment"]}
        headers = {"Content-Type": "application/json", "Api-Key": plant_id_api_key}
        url = "https://api.plant.id/v2/health_assessment"
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print(f"Error calling Plant.id API: {e}")
        return {"error": f"Failed to analyze image with Plant.id API: {e}"}


# --- Streamlit App UI ---

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "Hello! How can I help you with your crops today?"}]
if "staged_image" not in st.session_state:
    st.session_state.staged_image = None
# FIXED: Add a key for the file uploader to allow resetting it after submission
if "uploader_key" not in st.session_state:
    st.session_state.uploader_key = 0

# Display Title and Subheader
st.title("🌿 Agri-Assistant Chatbot")
st.caption("Your AI-powered guide for farming success")

# Display chat messages from history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        if "image" in message and message["image"] is not None:
            st.image(message["image"], width=200)
        if "content" in message and message["content"] is not None:
            st.markdown(message["content"])

# --- Combined Input Area at the bottom ---
st.divider()

# Create columns for the input layout
col1, col2 = st.columns([0.2, 0.8])

# File uploader button in the first column
with col1:
    # FIXED: Use the key from session state to control the uploader
    uploaded_file = st.file_uploader(
        "Upload an image", 
        type=["jpg", "jpeg", "png"], 
        label_visibility="collapsed", 
        key=f"uploader_{st.session_state.uploader_key}"
    )
    if uploaded_file:
        # When a file is uploaded, stage it in the session state
        st.session_state.staged_image = {
            "bytes": uploaded_file.getvalue(),
            "caption": uploaded_file.name
        }

# Display the staged image preview and a manual remove button
if st.session_state.staged_image:
    st.image(st.session_state.staged_image["bytes"], caption=f"Ready to send: {st.session_state.staged_image['caption']}", width=100)
    if st.button("Remove Image", key="remove_image"):
        st.session_state.staged_image = None
        # FIXED: Increment the key to ensure the uploader widget itself is cleared
        st.session_state.uploader_key += 1
        st.rerun() 

# Use st.chat_input for the text and main send button
if prompt := st.chat_input("Ask your question here..."):
    
    user_message = {"role": "user", "content": prompt}
    staged_image_data = st.session_state.staged_image
    
    if staged_image_data:
        user_message["image"] = staged_image_data["bytes"]
        with st.chat_message("user"):
            st.image(staged_image_data["bytes"], width=200)
            st.markdown(prompt)
    else:
        with st.chat_message("user"):
            st.markdown(prompt)
            
    st.session_state.messages.append(user_message)

    # --- API Call Logic ---
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            if staged_image_data:
                plant_id_analysis = analyze_plant_image(staged_image_data["bytes"])
                plant_id_analysis_text = json.dumps(plant_id_analysis, indent=2)
                gemini_prompt = f"""
                You are an expert agricultural assistant. A farmer asks: "{prompt if prompt else 'Please analyze this image and tell me what is wrong with my plant and how to fix it.'}"
                Here is a technical analysis from a plant disease database:
                ```json
                {plant_id_analysis_text}
                ```
                Your task is to interpret the JSON and provide a simple, clear summary and actionable solutions for the farmer. Explain the main disease, its probability, and list any organic or chemical treatments found in the JSON. If the plant is healthy, state that. Use a friendly, helpful tone.
                """
                response = get_gemini_response(gemini_prompt)
                st.markdown(response)
            else:
                gemini_prompt = f"You are a helpful agricultural assistant for Indian farmers. Answer this question: \"{prompt}\""
                response = get_gemini_response(gemini_prompt)
                st.markdown(response)

    st.session_state.messages.append({"role": "assistant", "content": response})
    
    # CRITICAL FIX: Clear the staged image from session state after processing
    st.session_state.staged_image = None
    
    # FIXED: Increment the key to reset the file uploader widget, ensuring it's empty on the next run
    st.session_state.uploader_key += 1
    
    st.rerun()
