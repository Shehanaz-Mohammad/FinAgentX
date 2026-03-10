// Sales agent: EMI and basic explanation
function process(text){
  // extremely naive parsing for demo
  const lower = text.toLowerCase();
  let amount = 200000; // default 2L
  let tenureYears = 2;
  let rate = 0.16;

  const matchAmt = lower.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|k)/);
  if(matchAmt){
    const num = parseFloat(matchAmt[1]);
    if(matchAmt[2].startsWith("l")) amount = num * 100000;
    if(matchAmt[2] === "k") amount = num * 1000;
  }

  const matchTenure = lower.match(/(\d+)\s*(year|years|yr|yrs)/);
  if(matchTenure){
    tenureYears = parseInt(matchTenure[1]);
  }

  const n = tenureYears * 12;
  const r = rate/12;
  const emi = Math.round((amount * r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1));

  const msg = `Based on a mock rate of 16% for ₹${amount.toLocaleString("en-IN")} over ${tenureYears} years, your estimated EMI is about ₹${emi.toLocaleString("en-IN")} per month.`;

  return { amount, tenureYears, rate, emi, message: msg };
}

module.exports = { process };
