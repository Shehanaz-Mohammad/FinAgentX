from dotenv import load_dotenv
import os

# Load env vars FIRST before importing anything else
load_dotenv()

# Forcefully ensure the key is in os.environ for libraries that check it directly
if "GEMINI_API_KEY" in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

from flask import Flask, request, jsonify
from crew_logic import run_loan_crew

app = Flask(__name__)

@app.route('/run-crew', methods=['POST'])
def run_crew():
    try:
        data = request.json
        # task_type: 'sales', 'verification', 'underwriting'
        task_type = data.get('task_type', 'sales')
        inputs = data.get('inputs', {})
        
        result = run_loan_crew(task_type, inputs)
        
        # CrewAI returns a CrewOutput object, we need the raw string
        result_text = result.raw if hasattr(result, 'raw') else str(result)
        
        return jsonify({"status": "success", "result": result_text})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
