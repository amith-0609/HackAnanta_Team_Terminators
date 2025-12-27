
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCxW1Ww9Ybw2F-dBa5OmAP6sPKSbhHjCz0";

async function test() {
    console.log("-----------------------------------------");
    console.log("Testing ALL Models with Key:", apiKey.substring(0, 5) + "...");
    console.log("-----------------------------------------");

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

    for (const modelName of models) {
        try {
            console.log(`\n👉 Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.countTokens("Hello");
            console.log(`✅ SUCCESS! ${modelName} is working.`);
            return;
        } catch (e) {
            console.log(`❌ Failed (${modelName}): ${e.status || "Unknown Error"}`);
            if (e.message) console.log("   Msg: " + e.message.substring(0, 100) + "...");
        }
    }

    console.log("\n-----------------------------------------");
    console.log("❌ ALL MODELS FAILED.");
}

test();
