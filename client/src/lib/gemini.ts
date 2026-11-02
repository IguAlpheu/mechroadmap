// ============================================================
// Lumeo — AI Roadmap Generator (Groq Cloud)
// Prioritizes fast server-side /api/generate-skill route,
// with direct client Groq fallback when VITE_GROQ_API_KEY is available.
// ============================================================

export interface StudyStep {
  id: number;
  title: string;
  description: string;
  duration: string;
}

export interface ResourceLink {
  name: string;
  url: string;
}

export interface ResourceCard {
  name: string;
  role: string;
  why: string;
  resources: ResourceLink[];
  time: string;
  priority: number;
  color: string;
  badge: string;
}

export interface AIGeneratedSkill {
  id: string;
  label: string;
  emoji: string;
  number: string;
  title: string;
  titleHighlight: string;
  description: string;
  color: string;
  timers: Array<{ title: string; totalWeeks: number; color: string }>;
  studySteps: StudyStep[];
  resources: ResourceCard[];
  barData: Array<{ name: string; hours: number; color: string }>;
}

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#10b981", "#f59e0b", "#06b6d4", "#f97316",
];

// Active Groq models in order of priority
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
];

function buildPrompt(userInput: string): string {
  return `You are an expert in creating structured, inspiring study plans and learning roadmaps.
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
    },
    {
      "name": "Recurso 2",
      "role": "...",
      "why": "...",
      "time": "...",
      "badge": "Prioridade 2",
      "links": [{ "name": "...", "url": "https://..." }]
    },
    {
      "name": "Recurso 3",
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
}

// Direct call to Groq Cloud API with model fallback
async function callGroqDirect(apiKey: string, userInput: string): Promise<any> {
  const prompt = buildPrompt(userInput);
  let lastError: Error | null = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error?.message || `Groq HTTP ${response.status}`;
        lastError = new Error(message);
        if (
          response.status === 404 ||
          message.includes("does not exist") ||
          message.includes("access")
        ) {
          continue;
        }
        continue;
      }

      const text = data.choices?.[0]?.message?.content || "";
      if (!text) {
        lastError = new Error("Resposta vazia da API Groq.");
        continue;
      }

      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch (err: unknown) {
      if (err instanceof Error) lastError = err;
    }
  }

  throw lastError || new Error("Falha ao comunicar com os modelos Groq.");
}

// Convert parsed JSON into complete AIGeneratedSkill structure
function formatSkillData(
  parsed: any,
  userInput: string,
  goalIndex: number
): AIGeneratedSkill {
  const color = COLORS[goalIndex % COLORS.length];
  const secondColor = COLORS[(goalIndex + 1) % COLORS.length];
  const thirdColor = COLORS[(goalIndex + 2) % COLORS.length];
  const fourthColor = COLORS[(goalIndex + 3) % COLORS.length];
  const colorPalette = [color, secondColor, thirdColor, fourthColor];

  const id =
    userInput
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 24) +
    "-" +
    Date.now().toString(36);

  const goalNumber = goalIndex + 1;
  const label = parsed.label || userInput;

  return {
    id,
    label,
    emoji: parsed.emoji || "🎯",
    number: `// SKILL ${String(goalNumber).padStart(2, "0")} — ${label.toUpperCase()}`,
    title: parsed.title || "Domine o ",
    titleHighlight: parsed.titleHighlight || label,
    description: parsed.description || `Plano completo para aprender ${userInput}.`,
    color,
    timers: Array.isArray(parsed.timers) && parsed.timers.length > 0
      ? parsed.timers.map((t: { title?: string; totalWeeks?: number }, i: number) => ({
          title: t.title || `Fase ${i + 1}`,
          totalWeeks: typeof t.totalWeeks === "number" ? t.totalWeeks : (i + 1) * 3,
          color: colorPalette[i % colorPalette.length],
        }))
      : [
          { title: "Fundamentos", totalWeeks: 4, color },
          { title: "Desenvolvimento", totalWeeks: 6, color: secondColor },
          { title: "Prática Avançada", totalWeeks: 8, color: thirdColor },
          { title: "Maestria", totalWeeks: 12, color: fourthColor },
        ],
    studySteps: Array.isArray(parsed.studySteps) && parsed.studySteps.length > 0
      ? parsed.studySteps.map((s: { id?: number; title?: string; description?: string; duration?: string }, i: number) => ({
          id: typeof s.id === "number" ? s.id : i + 1,
          title: s.title || `Passo ${i + 1}`,
          description: s.description || "",
          duration: s.duration || "5 horas",
        }))
      : [
          { id: 1, title: "Introdução e Fundamentos", description: "Compreender os conceitos essenciais.", duration: "5 horas" },
          { id: 2, title: "Prática Inicial", description: "Primeiros exercícios e repetição.", duration: "8 horas" },
        ],
    resources: Array.isArray(parsed.resources) && parsed.resources.length > 0
      ? parsed.resources.map((r: any, i: number) => ({
          name: r.name || `Recurso ${i + 1}`,
          role: r.role || "Material de apoio",
          why: r.why || "Excelente para iniciar e praticar.",
          resources: Array.isArray(r.links)
            ? r.links
            : Array.isArray(r.resources)
            ? r.resources
            : [{ name: r.name || "Link", url: "https://google.com" }],
          time: r.time || "2-4 semanas",
          priority: i + 1,
          color: colorPalette[i % colorPalette.length],
          badge: r.badge || `Prioridade ${i + 1}`,
        }))
      : [
          {
            name: "Guia Oficial e Documentação",
            role: "Referência principal",
            why: "Fonte mais confiável para aprender os conceitos com precisão.",
            resources: [{ name: "Documentação", url: "https://google.com" }],
            time: "2-4 semanas",
            priority: 1,
            color,
            badge: "Prioridade 1",
          },
        ],
    barData: Array.isArray(parsed.barData) && parsed.barData.length > 0
      ? parsed.barData.map((b: { name?: string; hours?: number }, i: number) => ({
          name: b.name || `Fase ${i + 1}`,
          hours: typeof b.hours === "number" ? b.hours : 20 * (i + 1),
          color: colorPalette[i % colorPalette.length],
        }))
      : [
          { name: "Fase 1", hours: 20, color },
          { name: "Fase 2", hours: 40, color: secondColor },
          { name: "Fase 3", hours: 60, color: thirdColor },
          { name: "Fase 4", hours: 80, color: fourthColor },
        ],
  };
}

export async function generateSkillWithAI(
  userInput: string,
  goalIndex: number
): Promise<AIGeneratedSkill> {
  if (!userInput.trim()) {
    throw new Error("Por favor, digite o nome da habilidade que deseja aprender.");
  }

  let parsed: any = null;
  let serverError = "";

  // 1. Try server endpoint (/api/generate-skill)
  try {
    const apiRes = await fetch("/api/generate-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput: userInput.trim(), goalIndex }),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data?.parsed) {
        parsed = data.parsed;
      }
    } else {
      const errData = await apiRes.json().catch(() => ({}));
      serverError = errData?.error || `HTTP ${apiRes.status}`;
      console.warn("[Lumeo AI] /api/generate-skill response error:", serverError);
    }
  } catch (err: unknown) {
    console.warn("[Lumeo AI] /api/generate-skill unreachable, trying client fallback:", err);
  }

  // 2. If server call didn't yield parsed data, try direct client-side Groq call
  if (!parsed) {
    const clientKey = import.meta.env.VITE_GROQ_API_KEY;
    if (clientKey) {
      try {
        parsed = await callGroqDirect(clientKey, userInput);
      } catch (err: unknown) {
        console.error("[Lumeo AI] Direct Groq call failed:", err);
        if (!serverError && err instanceof Error) serverError = err.message;
      }
    }
  }

  // 3. Fallback error
  if (!parsed) {
    throw new Error(
      serverError
        ? `Erro ao gerar cronograma: ${serverError}`
        : "Não foi possível gerar a trilha no momento. Verifique sua conexão e tente novamente."
    );
  }

  return formatSkillData(parsed, userInput, goalIndex);
}
