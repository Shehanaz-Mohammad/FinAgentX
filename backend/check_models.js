const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function checkSpecificModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // The user insists on gemini-2.5-flash. Let's test it and variants.
    const candidates = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash" // Baseline control
    ];

    console.log("Checking specific models...");

    for (const m of candidates) {
        try {
            process.stdout.write(`Testing model: '${m}' ... `);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test");
            const response = await result.response;
            console.log("SUCCESS ✅");
        } catch (e) {
            console.log("FAILED ❌");
            if (e.response) {
                console.log(`   Status: ${e.response.status} ${e.response.statusText}`);
            } else {
                console.log(`   Error: ${e.message.split('\n')[0]}`);
            }
        }
    }
}

checkSpecificModel();
