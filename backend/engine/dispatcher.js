
// dispatcher.js
// Executes the plan
const axios = require('axios');
const sanctionAgent = require('../agents/sanction');

async function callPythonCrew(taskType, inputs) {
  try {
    const res = await axios.post("http://localhost:8000/run-crew", {
      task_type: taskType,
      inputs: inputs
    });
    return res.data.result;
  } catch (e) {
    if (e.response && e.response.data) {
      console.error("Python Crew Detailed Error:", JSON.stringify(e.response.data));
    } else {
      console.error("Python Crew Error:", e.message);
    }
    return "Error contacting Worker Agents.";
  }
}

async function dispatch(planData, session, socket) {
  const steps = planData.plan || [];
  let finalReply = "";

  for (const step of steps) {
    console.log("[Dispatcher] Executing:", step.tool, step.action);

    // Notify client
    socket.emit('agent_working', { tool: step.tool, action: step.action });

    let result = "";

    if (step.tool === 'salesAgent') {
      // Delegate to Python Sales Crew
      const { amount, tenure } = step.params || {};
      result = await callPythonCrew('sales', { amount, tenure, context: JSON.stringify(step.params) });
      finalReply += result + " ";

    } else if (step.tool === 'verificationAgent') {
      // Delegate to Python Verifier
      result = await callPythonCrew('verification', {
        employment_type: step.params.employment_type || "unknown",
        name: step.params.name,
        filename: step.params.filename
      });
      finalReply += result + " ";

    } else if (step.tool === 'underwritingAgent') {
      // Delegate to Python Underwriter
      // Strip heavy vectorHistory from session before sending
      const lightSession = { ...session };
      delete lightSession.vectorHistory;

      result = await callPythonCrew('underwriting', { context: JSON.stringify(lightSession) });
      // Parse simple result for approval logic (Naïve)
      // Parse simple result for approval logic
      const approved = result.toLowerCase().includes("approve") && !result.toLowerCase().includes("reject");

      // Extract Dynamic Rate if present (Format: "Approved Rate: 10.5%")
      const rateMatch = result.match(/Rate:\s*(\d+(\.\d+)?)%/i);
      let contextRate = 0.14; // fallback
      if (rateMatch && rateMatch[1]) {
        contextRate = parseFloat(rateMatch[1]) / 100;
        console.log("[Dispatcher] Extracted Dynamic Rate:", contextRate);
      }

      session.underwriting = { approved, message: result };

      // Store for sanction agent
      if (!session.emi_info) session.emi_info = {};
      session.emi_info.rate = contextRate;

      finalReply += result + " ";

    } else if (step.tool === 'sanctionAgent') {
      if (session.underwriting && session.underwriting.approved) {
        const sanc = sanctionAgent.generate(session);
        session.sanction_letter = sanc.letter;
        session.status = "Sanctioned";

        // Emit explicit event for UI to handle the document
        socket.emit("sanction_generated", { letter: sanc.letter });

        finalReply += " I have generated the sanction letter. You can download it now.";
      } else {
        finalReply += " Sanction pending approval.";
      }

    } else if (step.tool === 'reply') {
      finalReply += step.params.text + " ";
    }
  }

  return { reply: finalReply.trim() };
}

module.exports = {
  dispatch
};

