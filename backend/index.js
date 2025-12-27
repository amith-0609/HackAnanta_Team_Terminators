import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

app.post("/chat", async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
                { role: "system", content: "You are CampusBot, a campus assistant." },
                { role: "user", content: req.body.message }
            ],
        });

        res.json({
            reply: completion.choices[0].message.content,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI failed" });
    }
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});
