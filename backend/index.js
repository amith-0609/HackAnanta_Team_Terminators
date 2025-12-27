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


app.post("/api/generate-roadmap", async (req, res) => {
    try {
        const { title, description, content } = req.body;
        console.log(`🗺️ Generating roadmap for: ${title}`);

        const prompt = `Create a detailed step-by-step study roadmap for learning about "${title}".
        Description: ${description}
        
        Context/Content: ${content ? content.substring(0, 2000) : "No specific content provided, generate based on title."}

        Return the response STRICTLY as a valid JSON object with the following structure. Do not allow any other text outside the JSON.
        {
            "title": "Roadmap Title",
            "description": "Brief description of the learning path",
            "modules": [
                {
                    "title": "Module Title",
                    "description": "What to learn in this module",
                    "topics": ["Topic 1", "Topic 2"]
                }
            ]
        }`;

        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
                { role: "system", content: "You are an expert educational curriculum designer. You output strict JSON." },
                { role: "user", content: prompt }
            ],
        });

        let rawContent = completion.choices[0].message.content;
        // Cleanup markdown code blocks if present
        rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        
        let roadmap;
        try {
            roadmap = JSON.parse(rawContent);
        } catch (parseError) {
            console.error("Failed to parse JSON:", rawContent);
            // Fallback manually constructed structure if parsing fails
            roadmap = {
                title: `Roadmap for ${title}`,
                description: "AI generated roadmap (Parsing fallback)",
                modules: [
                    {
                         title: "Overview", 
                         description: "Introduction to the topic", 
                         topics: ["Basics", "Key Concepts"] 
                    }
                ]
            };
        }

        res.json(roadmap);
    } catch (err) {
        console.error("Error generating roadmap:", err);
        res.status(500).json({ error: "Failed to generate roadmap" });
    }
});

app.listen(5001, () => {

    console.log("Backend running on http://localhost:5001");
});
