import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv, Plugin } from "vite";

function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "dev-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/generate-skill" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");
            try {
              const { userInput, goalIndex } = JSON.parse(body || "{}");
              if (!userInput || typeof userInput !== "string" || !userInput.trim()) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "userInput is required" }));
                return;
              }

              const apiKey =
                env.GROQ_API_KEY ||
                env.VITE_GROQ_API_KEY ||
                process.env.GROQ_API_KEY ||
                process.env.VITE_GROQ_API_KEY;

              if (!apiKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: "GROQ_API_KEY is not set." }));
                return;
              }

              const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
              const GROQ_MODELS = [
                "openai/gpt-oss-120b",
                "qwen/qwen3.8-27b",
                "llama-3.3-70b-versatile",
              ];

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

              let lastError = "All models failed";
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

                  const data = await groqRes.json();
                  if (!groqRes.ok) {
                    lastError = data?.error?.message || `HTTP ${groqRes.status}`;
                    continue;
                  }

                  const text = data.choices?.[0]?.message?.content || "";
                  if (!text) continue;

                  const clean = text.replace(/```json|```/g, "").trim();
                  const parsed = JSON.parse(clean);

                  res.statusCode = 200;
                  res.end(JSON.stringify({ parsed, goalIndex: goalIndex || 0 }));
                  return;
                } catch (err: unknown) {
                  if (err instanceof Error) lastError = err.message;
                }
              }

              res.statusCode = 502;
              res.end(JSON.stringify({ error: lastError }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : "Internal error",
                })
              );
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");

  return {
    plugins: [react(), tailwindcss(), jsxLocPlugin(), devApiPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      strictPort: false,
      host: true,
      allowedHosts: ["localhost", "127.0.0.1"],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
