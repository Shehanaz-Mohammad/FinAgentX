// Sanction agent: generate simple text sanction letter
function generate(session) {
  const emiInfo = session.emi_info || {};
  const amount = emiInfo.amount || 200000;
  const tenureYears = emiInfo.tenureYears || 2;
  const rate = (emiInfo.rate || 0.14) * 100;
  const emi = emiInfo.emi || 0;

  const letter = `
FINAGENTX — SANCTION LETTER (DEMO)

Dear Customer,

We are pleased to inform you that your personal loan has been sanctioned as per the following indicative terms.


Sanctioned Amount : ₹${amount.toLocaleString("en-IN")}
Interest Rate     : ${rate.toFixed(2)}% p.a. (fixed for demo)
Tenure            : ${tenureYears} years
Estimated EMI     : ₹${emi.toLocaleString("en-IN")} per month

Please note:
• This is a demo sanction for hackathon purposes only.
• In a real implementation, KYC, income, and bureau checks would be completed before final disbursal.
• Terms are illustrative and subject to change in a production system.

Thank you for using FinAgentX.
  `;

  return { letter };
}

module.exports = { generate };
