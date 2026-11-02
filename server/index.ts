import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env automatically in local/Node environments if available
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  }
} catch {
  // Ignore if .env is missing or already provided by host environment
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
];

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // API Route: Generate Skill Roadmap
  app.post("/api/generate-skill", async (req, res) => {
    const { userInput, goalIndex } = req.body as {
      userInput?: string;
      goalIndex?: number;
    };

    if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
      return res.status(400).json({ error: "userInput is required" });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
    }

    const prompt = `You are an expert in creating structured, inspiring study plans and learning roadmaps.
The user wants to learn: "${userInput.trim()}"

CRITICAL INSTRUCTIONS:
1. Respond in the SAME LANGUAGE as the user's input (e.g. if the user inputs in Portuguese, write title, titleHighlight, description, studySteps, timers, and resources in Portuguese; if English, write in English).
2. The 'label' should be 1-2 words in the language of the input (e.g. "Violão", "Python", "Rust", "Francês").
3. Return pure JSON only with NO markdown fences, NO preamble, and NO explanation.

Generate a complete, practical learning plan in JSON with EXACTLY this structure:
{
  "emoji": "(one relevant emoji)",
  "label": "(short skill name, max 2 words)",
  "title": "(short motivational opening, e.g. 'Domine o ' or 'Master the ')",
  "titleHighlight": "(1-2 words that complete the title, e.g. 'Violão' or 'Guitar')",
  "description": "(2-3 sentences explaining why this skill matters and what the learner will achieve)",
  "studySteps": [
    { "id": 1, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 2, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 3, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 4, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 5, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 6, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 7, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" },
    { "id": 8, "title": "Step title", "description": "What you will learn and practice", "duration": "X horas" }
  ],
  "timers": [
    { "title": "Fase 1", "totalWeeks": 4 },
    { "title": "Fase 2", "totalWeeks": 6 },
    { "title": "Fase 3", "totalWeeks": 8 },
    { "title": "Fase 4", "totalWeeks": 12 }
  ],
  "resources": [
    {
      "name": "Nome do recurso",
      "role": "O que este recurso cobre",
      "why": "Por que é o melhor ponto de partida",
      "time": "X-Y semanas",
      "badge": "Prioridade 1",
      "links": [
        { "name": "Nome", "url": "https://real-verified-url.com" }
      ]
    }
  ],
  "barData": [
    { "name": "Fase 1", "hours": 20 },
    { "name": "Fase 2", "hours": 40 },
    { "name": "Fase 3", "hours": 60 },
    { "name": "Fase 4", "hours": 80 }
  ]
}

IMPORTANT: Use real, verified URLs. Return ONLY valid JSON.`;

    let lastError = "All AI models failed.";
    for (const model of GROQ_MODELS) {
      try {
        const groqRes = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert learning coach. Always respond with valid JSON only, no markdown, no explanation.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" },
          }),
        });

        const data = (await groqRes.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          error?: { message?: string };
        };

        if (!groqRes.ok) {
          lastError = data?.error?.message ?? `Groq HTTP ${groqRes.status}`;
          continue;
        }

        const text = data.choices?.[0]?.message?.content ?? "";
        if (!text) continue;

        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        return res.status(200).json({ parsed, goalIndex: goalIndex || 0 });
      } catch (err: unknown) {
        if (err instanceof Error) lastError = err.message;
      }
    }

    return res.status(502).json({ error: lastError });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all other routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
