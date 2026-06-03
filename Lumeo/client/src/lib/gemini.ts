// ============================================================
// Lumeo — AI Roadmap Generator (Groq)
// API key must be set in .env as VITE_GROQ_API_KEY
// Get a free key at: https://console.groq.com/keys
// ============================================================

const API_URL = `https://api.groq.com/openai/v1/chat/completions`;

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

function getApiKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "VITE_GROQ_API_KEY is not set. Create a .env file in client/ with:\nVITE_GROQ_API_KEY=your_key_here\nGet a free key at https://console.groq.com/keys"
    );
  }
  return key;
}

export async function generateSkillWithAI(
  userInput: string,
  goalIndex: number
): Promise<AIGeneratedSkill> {
  const apiKey = getApiKey();
  const color = COLORS[goalIndex % COLORS.length];
  const secondColor = COLORS[(goalIndex + 1) % COLORS.length];
  const thirdColor = COLORS[(goalIndex + 2) % COLORS.length];
  const fourthColor = COLORS[(goalIndex + 3) % COLORS.length];

  const prompt = `You are an expert in creating study plans and learning roadmaps.
The user wants to learn: "${userInput}"

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

IMPORTANT: Use real, verified URLs. Be specific and practical. Return ONLY valid JSON.`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert learning coach. Always respond with valid JSON only, no markdown, no explanation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Groq API error: ${message}`);
  }

  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Empty response from Groq API.");

  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  const id =
    userInput
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 24) +
    "-" +
    Date.now().toString(36);

  const goalNumber = goalIndex + 1;

  return {
    id,
    label: parsed.label,
    emoji: parsed.emoji,
    number: `// SKILL ${String(goalNumber).padStart(2, "0")} — ${parsed.label.toUpperCase()}`,
    title: parsed.title,
    titleHighlight: parsed.titleHighlight,
    description: parsed.description,
    color,
    timers: parsed.timers.map(
      (t: { title: string; totalWeeks: number }, i: number) => ({
        title: t.title,
        totalWeeks: t.totalWeeks,
        color: [color, secondColor, thirdColor, fourthColor][i] ?? color,
      })
    ),
    studySteps: parsed.studySteps,
    resources: parsed.resources.map(
      (
        r: {
          name: string;
          role: string;
          why: string;
          time: string;
          badge: string;
          links: ResourceLink[];
        },
        i: number
      ) => ({
        name: r.name,
        role: r.role,
        why: r.why,
        resources: r.links ?? [],
        time: r.time,
        priority: i + 1,
        color: [color, secondColor, thirdColor, fourthColor][i] ?? color,
        badge: r.badge,
      })
    ),
    barData: parsed.barData.map(
      (b: { name: string; hours: number }, i: number) => ({
        name: b.name,
        hours: b.hours,
        color: [color, secondColor, thirdColor, fourthColor][i] ?? color,
      })
    ),
  };
}
