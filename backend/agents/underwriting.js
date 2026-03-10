// Underwriting agent: mock score based on previous info
function evaluate(session){
  // make a fun fake rule
  const baseScore = 720;
  const score = baseScore + Math.floor(Math.random()*40) - 20; // 700‑760

  const approved = score >= 710;
  const message = approved
    ? `Your mock credit score is around ${score}, which looks good. I'm approving this in principle.`
    : `Your mock credit score is around ${score}, which is slightly below our cut‑off. So this may need manual review.`;

  return { score, approved, message };
}

module.exports = { evaluate };
