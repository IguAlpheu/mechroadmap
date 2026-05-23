// ============================================================
// Skill Generator — AI-powered roadmap generation
// ============================================================

const API_KEY = "AIzaSyCZTdxe4InOK2XSDbspLMc-LFRPZ3bH5zg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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
  studySteps: Array<{ id: number; title: string; description: string; duration: string }>;
  resources: Array<{
    name: string;
    role: string;
    why: string;
    resources: Array<{ name: string; url: string }>;
    time: string;
    priority: number;
    color: string;
    badge: string;
  }>;
  barData: Array<{ name: string; hours: number; color: string }>;
}

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#10b981", "#f59e0b", "#ef4444", "#06b6d4",
];

export async function generateSkillWithAI(userInput: string, goalIndex: number): Promise<AIGeneratedSkill> {
  if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
    throw new Error("API key not configured. Add your key to the .env file.");
  }

  const color = COLORS[goalIndex % COLORS.length];
  const secondColor = COLORS[(goalIndex + 1) % COLORS.length];
  const thirdColor = COLORS[(goalIndex + 2) % COLORS.length];
  const fourthColor = COLORS[(goalIndex + 3) % COLORS.length];

  const prompt = `You are an expert in creating study plans and learning roadmaps.
The user wants to learn: "${userInput}"

Generate a complete plan in JSON with EXACTLY this structure (no markdown, no code blocks, pure JSON only):

{
  "emoji": "(one relevant emoji)",
  "label": "(short skill name, max 2 words in English)",
  "title": "(short motivational phrase in English, e.g. 'Master the ')",
  "titleHighlight": "(one or two words in English that complete the phrase, e.g. 'Piano')",
  "description": "(2-3 sentences in English explaining why this skill is important)",
  "studySteps": [
    { "id": 1, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 2, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 3, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 4, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 5, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 6, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 7, "title": "Step title", "description": "What you will learn", "duration": "X hours" },
    { "id": 8, "title": "Step title", "description": "What you will learn", "duration": "X hours" }
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
      "role": "What this resource covers",
      "why": "Why this is the best resource (1-2 sentences)",
      "time": "X-Y months",
      "badge": "#1 Priority",
      "links": [
        { "name": "Resource name", "url": "https://real-url.com" },
        { "name": "Another resource", "url": "https://real-url.com" }
      ]
    },
    {
      "name": "Resource 2",
      "role": "...",
      "why": "...",
      "time": "...",
      "badge": "#2 Priority",
      "links": [{ "name": "...", "url": "https://..." }]
    },
    {
      "name": "Resource 3",
      "role": "...",
      "why": "...",
      "time": "...",
      "badge": "#3 Priority",
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

IMPORTANT: Use real, verified URLs. Return ONLY the JSON, nothing else.`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  // Read body once, then handle errors
  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Request failed: ${message}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Empty response from API");

  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  const id = userInput
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 20) + "-" + Date.now().toString(36);

  const goalNumber = goalIndex + 1;

  return {
    id,
    label: parsed.label,
    emoji: parsed.emoji,
    number: `// GOAL ${String(goalNumber).padStart(2, "0")} — ${parsed.label.toUpperCase()}`,
    title: parsed.title,
    titleHighlight: parsed.titleHighlight,
    description: parsed.description,
    color,
    timers: parsed.timers.map((t: { title: string; totalWeeks: number }, i: number) => ({
      title: t.title,
      totalWeeks: t.totalWeeks,
      color: [color, secondColor, thirdColor, fourthColor][i] ?? color,
    })),
    studySteps: parsed.studySteps,
    resources: parsed.resources.map((r: {
      name: string; role: string; why: string; time: string; badge: string;
      links: Array<{ name: string; url: string }>;
    }, i: number) => ({
      name: r.name,
      role: r.role,
      why: r.why,
      resources: r.links ?? [],
      time: r.time,
      priority: i + 1,
      color: [color, secondColor, thirdColor, fourthColor][i] ?? color,
      badge: r.badge,
    })),
    barData: parsed.barData.map((b: { name: string; hours: number }, i: number) => ({
      name: b.name,
      hours: b.hours,
      color: [color, secondColor, thirdColor, fourthColor][i] ?? color,
    })),
  };
}
