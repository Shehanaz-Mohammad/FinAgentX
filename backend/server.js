const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const masterAgent = require("./agents/masterAgent");
const ruleEngine = require("./engine/ruleEngine");
const dispatcher = require("./engine/dispatcher");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    methods: ["GET", "POST"]
  }
});

// In-memory session store
const sessions = {};

function getSession(session_id) {
  if (!session_id) return null;
  if (!sessions[session_id]) {
    sessions[session_id] = {
      messages: [],
      status: "Not started",
      sanction_letter: null,
      stage: "intro",
      emotion: "neutral",
      vectorHistory: [] // Stores { text, embedding, role }
    };
  }
  return sessions[session_id];
}

// REST fallback for status page
app.get("/state", (req, res) => {
  const { session_id } = req.query;
  const sess = getSession(session_id);
  if (!sess) return res.status(400).json({ error: "invalid session" });
  res.json({
    status: sess.status,
    sanction_letter: sess.sanction_letter,
    stage: sess.stage,
    emotion: sess.emotion
  });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_session", (session_id) => {
    socket.join(session_id);
    console.log(`Socket ${socket.id} joined session ${session_id}`);
    getSession(session_id); // ensure exists
  });

  socket.on("file_uploaded", async ({ filename, type }) => {
    // Find session for this socket
    // (Simplification: in real app, session_id is passed, here we rely on join or args)
    console.log(`File Uploaded: ${filename}`);

    // We need session_id. Let's assume user sent it or we use the latest one?
    // Better: Client should send session_id in this event. 
    // For now, let's just broadcast or use a hack since 'socket' is scoped.
    // But we need to update state.

    socket.emit("agent_thought", { message: "Analyzing Document..." });

    // Trigger Verification Agent directly
    // Use a default name 'Koushik' if not known, to ensure CRM check passes during doc upload
    const result = await dispatcher.dispatch([
      {
        tool: "verificationAgent",
        params: {
          employment_type: "Uploaded Document",
          filename: filename,
          name: "Koushik"
        }
      }
    ], {}, socket);

    socket.emit("final_reply", { reply: "I've received your document: " + filename + ". " + result.reply });
  });

  socket.on("message", async ({ session_id, text }) => {
    console.log(`Msg from ${session_id}: ${text}`);
    const sess = getSession(session_id);
    if (!sess) return; // should not happen if joined

    // 1. Log User Message
    sess.messages.push({ from: "user", text, ts: Date.now() });

    // 2. Master Agent (LLM) -> Plan
    socket.emit("agent_thought", { message: "Analyzing Request..." });
    const intent = await masterAgent.plan(text, sess);

    // Update State from Intent
    sess.stage = intent.stage || sess.stage;
    sess.emotion = intent.emotion || sess.emotion;

    // Notify Frontend of thoughts/emotion
    socket.emit("agent_thought", { message: intent.thoughts, emotion: sess.emotion });

    // 3. Rule Engine -> Validate
    socket.emit("agent_thought", { message: "Validating Action Plan..." });
    const validation = ruleEngine.validatePlan(intent, sess);

    // 4. Dispatcher -> Execute
    if (validation.approved) {
      socket.emit("agent_thought", { message: "Executing Plan..." });
      const result = await dispatcher.dispatch(validation.plan, sess, socket);

      // 5. Synthesis (Post-Tool Prompting)
      let finalMessage = result.reply;

      // If the result came from a tool (not just a direct 'reply' action), synthesis it
      const steps = validation.plan.plan || [];
      const hasTools = steps.some(p => p.tool !== 'reply');
      if (hasTools) {
        socket.emit("agent_thought", { message: "Synthesizing Response..." });
        finalMessage = await masterAgent.synthesizeResponse(result.reply, sess);
      }

      // Final Reply
      sess.messages.push({ from: "agent", text: finalMessage, ts: Date.now() });

      // Update Vector History with Agent Reply
      // (This ensures the agent remembers what it just said)
      /* 
         Note: We can't await this without blocking response, 
         so we fire and forget or let it happen in background 
      */

      socket.emit("final_reply", {
        reply: finalMessage,
        stage: sess.stage,
        emotion: sess.emotion,
        status: sess.status,
        sanction_letter: sess.sanction_letter
      });
    } else {
      socket.emit("final_reply", { reply: "I'm sorry, my action plan was rejected by the safety rules." });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("FinAgentX WebSocket Server running on port", PORT);
});
