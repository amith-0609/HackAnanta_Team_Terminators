import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import cors from "cors";
import axios from "axios";

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

// JobSpy Python Server Proxy Endpoint
app.get("/api/jobs", async (req, res) => {
    try {
        const {
            query = 'software engineer intern',
            location = 'United States',
            results_wanted = 20
        } = req.query;

        // Proxy to Python JobSpy server using axios
        const url = `http://127.0.0.1:5002/api/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&results_wanted=${results_wanted}`;

        console.log('📡 Proxying to Python server:', url);

        const response = await axios.get(url, { timeout: 10000 });

        console.log('✅ Python server returned', response.data.count || 0, 'jobs');
        res.json(response.data);
    } catch (err) {
        console.error('❌ Error connecting to Python server:', err.message);
        res.status(500).json({
            error: 'Failed to fetch jobs from Python server',
            details: err.message
        });
    }
});

app.listen(5001, () => {
    console.log("Backend running on http://localhost:5001");
});
