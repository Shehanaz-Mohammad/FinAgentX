// Verification agent: mock KYC/CRM check
function check(text){
  const lower = text.toLowerCase();
  let segment = "salaried";
  if(lower.includes("self") || lower.includes("business")){
    segment = "self‑employed";
  }

  const message = `Got it, tagging you as ${segment}. For the demo, I'm marking KYC and basic checks as 'OK'.`;
  return { segment, kyc_ok:true, existing_customer:true, message };
}

module.exports = { check };
