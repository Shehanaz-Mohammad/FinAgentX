
import os
try:
    from crewai import LLM
    print("Successfully imported crewai.LLM")
except ImportError as e:
    print(f"Failed to import crewai.LLM: {e}")

try:
    import google.generativeai
    print("Successfully imported google.generativeai")
except ImportError as e:
    print(f"Failed to import google.generativeai: {e}")

try:
    llm = LLM(model="gemini/gemini-1.5-flash", api_key=os.getenv("GEMINI_API_KEY"))
    print("Successfully initialized LLM with gemini-1.5-flash")
except Exception as e:
    print(f"Failed to initialize LLM: {e}")
