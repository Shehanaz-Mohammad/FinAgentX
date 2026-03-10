const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System Instruction for the Master Agent
const SYSTEM_PROMPT = `
You are the Master Agent for FinAgentX.
Your goal is to understand the user's intent and orchestrate the right tools.

available_tools = [
  {
    "tool": "salesAgent", 
    "description": "Calculates EMI/Loan offers. Use when user asks about loan cost, tenure, EMI, or 'how much'.", 
    "params": { "amount": "number (default 200000)", "tenure": "number (years, default 2)" }
  },
  {
    "tool": "verificationAgent",
    "description": "Verifies documents or employment. Use when user says 'I am employed', 'I work at...', OR uploads a file.",
    "params": { 
      "employment_type": "string (e.g. 'salaried', 'self-employed')",
      "name": "string (extract from user input if available, e.g. 'I am Koushik')",
      "filename": "string (if a file was uploaded)"
    }
  },
  {
    "tool": "underwritingAgent",
    "description": "Checks credit/bureau eligibility. Use when user asks 'am I eligible', 'check status', or after verification is done.",
    "params": { "context": "string (session summary)" }
  },
  {
    "tool": "sanctionAgent",
    "description": "Generates sanction letter. Use ONLY if underwriting is approved.",
    "params": {}
  },
  {
    "tool": "reply",
    "description": "General chat response if no tool is needed.",
    "params": { "text": "string" }
  }
]

History is provided in the prompt.
Output JSON ONLY. Format:
{
  "thought": "Reasoning...",
  "plan": [
    { "tool": "toolName", "params": { ... }, "action": "Reason for action" }
  ]
}
`;

async function plan(userText, session) {
  // RAG / History Logic (Simplified for Groq context window)
  const historyText = (session.messages || []).map(m => `${m.from === 'user' ? 'User' : 'Agent'}: ${m.text}`).slice(-5).join("\n");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Session Context:\n${historyText}\n\nCurrent User Input: "${userText}"\n\nReturn JSON plan.` }
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const txt = completion.choices[0].message.content;
    const cleanJson = txt.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Master Agent Planning Error:", e);
    return {
      thought: "Error in planning, falling back to reply.",
      plan: [{ tool: "reply", params: { text: "I'm having trouble thinking right now. Please try again." }, action: "error_fallback" }]
    };
  }
}

async function synthesizeResponse(toolResult, session) {
  const historyText = (session.messages || []).map(m => `${m.from === 'user' ? 'User' : 'Agent'}: ${m.text}`).slice(-3).join("\n");

  const messages = [
    { role: "system", content: "You are FinAgentX, a helpful loan assistant. Synthesize the trusted tool output into a friendly, natural response for the user. Keep it concise." },
    { role: "user", content: `History:\n${historyText}\n\nTool Result: ${toolResult}\n\nGenerate natural response:` }
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (e) {
    console.error("Synthesis Error:", e);
    return toolResult; // Fallback to raw output
  }
}

module.exports = {
  plan,
  synthesizeResponse
};