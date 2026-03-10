// ruleEngine.js
// Validates the Plan from Master Agent
// Authoritative layer

function validatePlan(plan, session) {
    // Deep copy/log plan
    const approvedPlan = {
        ...plan
    };
    const overrides = [];

    console.log("[RuleEngine] Validating plan:", JSON.stringify(plan.plan));

    // Example Rule: "Compliance Check"
    // For now, we will just act as a pass-through that logs validation
    // In a real system, we would check for risky tools or invalid params.

    return {
        approved: true,
        plan: approvedPlan,
        overrides
    };
}

module.exports = {
    validatePlan
};
