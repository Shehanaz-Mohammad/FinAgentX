from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {key[:5]}...")

try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        verbose=True,
        google_api_key=key
    )
    print("LLM Initialized:", llm)
    print("Testing invoke...")
    res = llm.invoke("Hello, are you there?")
    print("Response:", res.content)
except Exception as e:
    print("ERROR:", e)
