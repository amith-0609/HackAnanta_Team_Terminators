import google.generativeai as genai
import os

key = "AIzaSyAxWu2ojI5ZrseU8qyqP4wEB4oSTwzSRkI"
genai.configure(api_key=key)

print("Listing available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
