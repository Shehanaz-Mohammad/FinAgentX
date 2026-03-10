// Simple session manager shared by all pages
function createSession() {
  let sessionId = localStorage.getItem("finagentx_session");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("finagentx_session", sessionId);
  }
  return sessionId;
}
window.session_id = createSession();
console.log("FinAgentX session:", session_id);
