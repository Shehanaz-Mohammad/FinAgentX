from litellm import completion
import os
from dotenv import load_dotenv

load_dotenv()

try:
    print("Testing LiteLLM with gemini/gemini-2.5-flash-lite...")
    response = completion(
        model="gemini/gemini-2.5-flash-lite",
        messages=[{"role": "user", "content": "Hello, are you working?"}],
    )
    print("Success!")
    print("Response:", response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
    # Fallback check for 1.5 if 2.5 fails
    print("\n---")
    print("Detailed Error Check: Make sure 'litellm' is installed and GEMINI_API_KEY is set.")
