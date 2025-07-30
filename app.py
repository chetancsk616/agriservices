# app.py
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
# For local development, you can use a .env file
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

# Initialize session state for chat messages
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "Hello! How can I help you with your crops today?"}]

# Display Title
st.title("🌿 Agri-Assistant Chatbot")
st.caption("Your AI-powered guide for farming success")

# Display chat messages from history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        # Check if there's an image to display with the message
        if "image" in message:
            st.image(message["image"], width=200)
        # Display the text content
        st.markdown(message["content"])

# --- Chat Input and File Uploader ---
# We use columns to place the file uploader "inside" the chat input area visually
col1, col2 = st.columns([0.85, 0.15])

with col1:
    prompt = st.text_input("Ask a question about your crops...", key="chat_input", placeholder="Type your question or upload an image...")

with col2:
    st.write("") # for vertical alignment
    st.write("") # for vertical alignment
    uploaded_file = st.file_uploader(" ", type=["jpg", "jpeg", "png"], label_visibility="collapsed")


# --- Handle User Input ---
if uploaded_file or prompt:
    # Handle image upload
    if uploaded_file:
        image_bytes = uploaded_file.getvalue()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Add user message to chat
        st.session_state.messages.append({"role": "user", "content": prompt or "Please analyze this image.", "image": image})
        
        with st.chat_message("user"):
            st.image(image, width=200)
            if prompt:
                st.markdown(prompt)

        # Show a thinking message
        with st.chat_message("assistant"):
            with st.spinner("Analyzing image and preparing response..."):
                # 1. Get analysis from Plant.id
                plant_id_analysis = analyze_plant_image(image_bytes)
                plant_id_analysis_text = json.dumps(plant_id_analysis, indent=2)

                # 2. Create a new prompt for Gemini
                gemini_prompt = f"""
                You are an expert agricultural assistant. A farmer asks: "{prompt if prompt else 'Please analyze this image and tell me what is wrong with my plant and how to fix it.'}"
                Here is a technical analysis from a plant disease database:
                ```json
                {plant_id_analysis_text}
                ```
                Your task is to interpret the JSON and provide a simple, clear summary and actionable solutions for the farmer. Explain the main disease, its probability, and list any organic or chemical treatments found in the JSON. If the plant is healthy, state that. Use a friendly, helpful tone.
                """
                # 3. Get the final response from Gemini
                response = get_gemini_response(gemini_prompt)
                st.markdown(response)
        
        # Add assistant's response to chat history
        st.session_state.messages.append({"role": "assistant", "content": response})

    # Handle text-only input
    elif prompt:
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                gemini_prompt = f"You are a helpful agricultural assistant for Indian farmers. Answer this question: \"{prompt}\""
                response = get_gemini_response(gemini_prompt)
                st.markdown(response)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
    
    # Rerun the app to clear the input fields
    st.rerun()
