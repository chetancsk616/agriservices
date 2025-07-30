import os
import base64
import requests
import google.generativeai as genai
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS to allow your frontend to make requests
CORS(app)

# --- API Configurations ---
try:
    gemini_api_key = os.getenv("GOOGLE_API_KEY")
    if not gemini_api_key:
        raise ValueError("GOOGLE_API_KEY not found. Please set it in your .env file.")
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    gemini_model = None

plant_id_api_key = os.getenv("PLANT_ID_API_KEY")
if not plant_id_api_key:
    print("Warning: PLANT_ID_API_KEY not found. The disease detector will not work.")

# --- Unified Chat Endpoint ---
@app.route('/analyze-chat', methods=['POST'])
def analyze_chat():
    """
    This single endpoint handles three cases:
    1. Text-only questions -> Gemini
    2. Image-only questions -> Plant.id -> Gemini
    3. Image + Text questions -> Plant.id -> Gemini
    """
    if 'question' not in request.form and 'image' not in request.files:
        return jsonify({'error': 'No question or image provided'}), 400

    question = request.form.get('question', '')
    image_file = request.files.get('image')

    # --- Case 1: Text-only question ---
    if not image_file:
        if not gemini_model:
            return jsonify({"error": "Gemini API is not configured on the server."}), 503
        
        prompt = f"""
        You are a helpful and experienced agricultural assistant for Indian farmers.
        A farmer has the following question: "{question}"
        Provide a clear, practical, and actionable answer.
        """
        try:
            response = gemini_model.generate_content(prompt)
            return jsonify({'answer': response.text})
        except Exception as e:
            print(f"Error during Gemini API call: {e}")
            return jsonify({'error': 'Failed to get a response from the AI model.'}), 500

    # --- Case 2 & 3: Image is present ---
    if not plant_id_api_key:
        return jsonify({'error': 'Plant.id API key is not configured on the server.'}), 503

    # Step 1: Analyze the image with Plant.id
    try:
        img_data = base64.b64encode(image_file.read()).decode('utf-8')
        plant_id_payload = {
            "images": [img_data],
            "disease_details": ["common_names", "url", "description", "treatment"]
        }
        headers = {"Content-Type": "application/json", "Api-Key": plant_id_api_key}
        url = "https://api.plant.id/v2/health_assessment"
        
        res = requests.post(url, json=plant_id_payload, headers=headers)
        res.raise_for_status()
        plant_id_analysis = res.json()
        plant_id_analysis_text = json.dumps(plant_id_analysis, indent=2)

    except requests.exceptions.RequestException as e:
        print(f"Error calling Plant.id API: {e}")
        details = e.response.text if e.response else "No response from API"
        return jsonify({'error': f'Failed to analyze image with Plant.id API. Details: {details}'}), 502

    # Step 2: Send the analysis and question to Gemini for a comprehensive answer
    if not gemini_model:
        return jsonify({"error": "Gemini API is not configured on the server."}), 503

    gemini_prompt = f"""
    You are an expert agricultural assistant. Your task is to provide a comprehensive and easy-to-understand answer to a farmer.
    You have been given a technical analysis from a plant disease database in JSON format, and an optional question from the farmer.

    **Farmer's Question:** "{question if question else 'Please analyze this image and tell me what is wrong with my plant and how to fix it.'}"

    **Technical Disease Analysis (JSON from Plant.id):**
    ```json
    {plant_id_analysis_text}
    ```

    **Your Instructions:**
    1.  **Interpret the JSON:** Read the JSON data. If `is_plant` is false, state that it doesn't look like a plant. If it is a plant, identify the main disease(s), their probability, and any suggested treatments. If the plant is healthy, state that clearly.
    2.  **Summarize the Problem:** In simple, clear language, explain what the problem is. Start by directly addressing the farmer. For example, "It looks like your plant might have...".
    3.  **Provide Actionable Solutions:** Based on the 'treatment' section of the JSON and your own knowledge, provide a list of clear, step-by-step solutions. If the `treatment` key exists, use it. Separate them into "Organic Solutions" and "Chemical Solutions".
    4.  **Address the Farmer's Question:** Ensure your final answer directly addresses the farmer's original question if they provided one.
    5.  **Friendly Tone:** Use a helpful and empathetic tone. Format the response with Markdown for readability (e.g., using bolding and lists).
    """
    
    try:
        response = gemini_model.generate_content(gemini_prompt)
        return jsonify({'answer': response.text})
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return jsonify({'error': 'Analyzed image but failed to get a final response from the AI model.'}), 500
