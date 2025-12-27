import os

env_path = os.path.join('backend', '.env')
key = "GEMINI_API_KEY=AIzaSyAxWu2ojI5ZrseU8qyqP4wEB4oSTwzSRkI"

try:
    with open(env_path, "a") as f:
        f.write("\n" + key + "\n")
    print(f"Successfully appended key to {env_path}")
except Exception as e:
    print(f"Error: {e}")
