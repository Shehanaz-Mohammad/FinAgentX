const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function check15() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Checking gemini-1.5-flash...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("SUCCESS ✅ 1.5-flash is working.");
    } catch (e) {
        console.log("FAIL ❌ 1.5-flash failed.");
        console.log(e.message);
    }
}
check15();
