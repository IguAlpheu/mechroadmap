// ============================================================
// Lumeo — Vercel Serverless Function: /api/generate-skill
// Proxies requests to the Groq API so the key never reaches
// the client bundle.
// ============================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Prioritized Groq models with automatic fallback
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS if called from different origin or development
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userInput, goalIndex, level, weeklyHours } = req.body as {
    userInput?: string;
    goalIndex?: number;
    level?: "Beginner" | "Intermediate" | "Advanced";
    weeklyHours?: number;
  };

  if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
    return res.status(400).json({ error: "userInput is required and must be a non-empty string" });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.error("[generate-skill] GROQ_API_KEY env var not set on server.");
    return res.status(500).json({ error: "AI service is not configured. Contact support." });
  }

  const idx = typeof goalIndex === "number" ? goalIndex : 0;
  const userLevel = level || "Beginner";
  const hoursPerWeek = weeklyHours || 5;

  const prompt = `You are an expert in creating structured, inspiring study plans and learning roadmaps.
The user wants to learn: "${userInput.trim()}"
User experience level: "${userLevel}"
Available study time: ${hoursPerWeek} hours per week.

CRITICAL INSTRUCTIONS:
1. Respond in the SAME LANGUAGE as the user's input (e.g. if the user inputs in Portuguese, write title, titleHighlight, description, studySteps, timers, and resources in Portuguese).
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
      "name": "Resource name",
      "role": "What this resource covers specifically",
      "why": "Why this is the best starting point (1-2 sentences)",
      "time": "X-Y semanas",
      "badge": "Prioridade 1",
      "links": [
        { "name": "Resource name", "url": "https://real-verified-url.com" },
        { "name": "Another resource", "url": "https://real-verified-url.com" }
      ]
    },
    {
      "name": "Resource 2",
      "role": "...",
      "why": "...",
      "time": "...",
      "badge": "Prioridade 2",
      "links": [{ "name": "...", "url": "https://..." }]
    },
    {
      "name": "Resource 3",
      "role": "...",
      "why": "...",
      "time": "...",
      "badge": "Prioridade 3",
      "links": [{ "name": "...", "url": "https://..." }]
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

  let lastErrorMessage = "Failed to communicate with AI provider.";

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[generate-skill] Attempting Groq model: ${model}`);
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
        const message = data?.error?.message ?? `Groq HTTP ${groqRes.status}`;
        console.warn(`[generate-skill] Groq model ${model} error:`, message);
        lastErrorMessage = message;

        // If the model does not exist or user lacks access, try the next fallback model
        if (
          groqRes.status === 404 ||
          message.includes("does not exist") ||
          message.includes("access")
        ) {
          continue;
        }

        // For other errors (like rate limit), continue fallback as well
        continue;
      }

      const text = data.choices?.[0]?.message?.content ?? "";
      if (!text) {
        lastErrorMessage = "Empty response from AI.";
        continue;
      }

      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      console.log(`[generate-skill] Successfully generated with model: ${model}`);
      return res.status(200).json({ parsed, goalIndex: idx });
    } catch (err: unknown) {
      console.warn(`[generate-skill] Error with model ${model}:`, err);
      if (err instanceof Error) lastErrorMessage = err.message;
    }
  }

  console.error("[generate-skill] All Groq models failed. Last error:", lastErrorMessage);
  return res.status(502).json({ error: lastErrorMessage });
}
