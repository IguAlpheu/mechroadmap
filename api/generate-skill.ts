// ============================================================
// Lumeo — Vercel Serverless Function: /api/generate-skill
// Proxies requests to the Groq API so the key never reaches
// the client bundle.
// Set GROQ_API_KEY (no VITE_ prefix) in Vercel env vars.
// ============================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[generate-skill] GROQ_API_KEY env var not set on server.");
    return res.status(500).json({ error: "AI service is not configured. Contact support." });
  }

  const idx = typeof goalIndex === "number" ? goalIndex : 0;
  const userLevel = level || "Beginner";
  const hoursPerWeek = weeklyHours || 5;

  const prompt = `You are an expert in creating study plans and learning roadmaps.
The user wants to learn: "${userInput}"
User experience level: "${userLevel}"
Available study time: ${hoursPerWeek} hours per week.

Tailor the learning plan exactly to this profile. Adjust the depth of description, step durations, and phase weeks so they fit a ${userLevel} studying ${hoursPerWeek} hours/week.
Generate a complete, practical learning plan in JSON with EXACTLY this structure (pure JSON only, no markdown):

{
  "emoji": "(one relevant emoji)",
  "label": "(short skill name, max 2 words in English)",
  "title": "(short motivational phrase, e.g. 'Master the ')",
  "titleHighlight": "(1-2 words that complete the phrase, e.g. 'Piano')",
  "description": "(2-3 sentences explaining why this skill matters and what the learner will achieve)",
  "studySteps": [
    { "id": 1, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 2, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 3, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 4, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 5, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 6, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 7, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" },
    { "id": 8, "title": "Step title", "description": "What you will learn and practice", "duration": "X hours" }
  ],
  "timers": [
    { "title": "Phase 1 name", "totalWeeks": 4 },
    { "title": "Phase 2 name", "totalWeeks": 6 },
    { "title": "Phase 3 name", "totalWeeks": 8 },
    { "title": "Phase 4 name", "totalWeeks": 12 }
  ],
  "resources": [
    {
      "name": "Resource name",
      "role": "What this resource covers specifically",
      "why": "Why this is the best starting point (1-2 sentences)",
      "time": "X-Y weeks",
      "badge": "#1 Priority",
      "links": [
        { "name": "Resource name", "url": "https://real-verified-url.com" },
        { "name": "Another resource", "url": "https://real-verified-url.com" }
      ]
    },
    {
      "name": "Resource 2", "role": "...", "why": "...", "time": "...", "badge": "#2 Priority",
      "links": [{ "name": "...", "url": "https://..." }]
    },
    {
      "name": "Resource 3", "role": "...", "why": "...", "time": "...", "badge": "#3 Priority",
      "links": [{ "name": "...", "url": "https://..." }]
    }
  ],
  "barData": [
    { "name": "Phase 1", "hours": 20 },
    { "name": "Phase 2", "hours": 40 },
    { "name": "Phase 3", "hours": 60 },
    { "name": "Phase 4", "hours": 80 }
  ]
}

IMPORTANT: Use real, verified URLs. Be specific and practical. Return ONLY valid JSON.`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
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

    const data = await groqRes.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!groqRes.ok) {
      const message = data?.error?.message ?? `Groq HTTP ${groqRes.status}`;
      console.error("[generate-skill] Groq error:", message);
      return res.status(502).json({ error: message });
    }

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) {
      return res.status(502).json({ error: "Empty response from AI." });
    }

    // Forward parsed JSON along with metadata the client needs
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({ parsed, goalIndex: idx });
  } catch (err) {
    console.error("[generate-skill] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
