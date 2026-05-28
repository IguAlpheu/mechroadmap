# Lumeo

**Learn anything. Build your roadmap.**

Lumeo is an AI-powered learning platform that generates complete, personalized study roadmaps for any skill you want to learn — from guitar to calculus, Python to Japanese.

## What was changed from MechRoadmap

- **Renamed** to Lumeo, full rebrand including colors, fonts, and copy
- **New landing page** with animated aurora background, rotating input placeholder, and feature sections
- **Real auth flow** (register → login) with local username/password storage — replaces the single-button fake login
- **API key security** — moved from hardcoded string in source to `VITE_GEMINI_API_KEY` env variable
- **Proper routing** with wouter: `/`, `/login`, `/dashboard`, `/skill/:id`
- **Dashboard redesign** — skills as cards with progress bars, streak badges, and deletion
- **Skill view redesign** — 4 focused tabs (Roadmap, Resources, Timer, Progress) instead of 5 bloated ones
- **Removed** hardcoded mechatronics goals, global reset button, and redundant components
- **Centralized storage** — all localStorage keys in `lib/storage.ts`, no collisions
- **CSS-only aurora** — no Three.js dependency required

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/IguAlpheu/mechroadmap
cd mechroadmap/client
npm install
```

### 2. Configure the Gemini API key

Create a `.env` file in the `client/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your key:

```
VITE_GEMINI_API_KEY=your_key_here
```

Get a free key at: https://aistudio.google.com/app/apikey

> **Important:** never commit `.env` to git. It's already in `.gitignore`.

### 3. Add to Vercel

In your Vercel project settings → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `VITE_GEMINI_API_KEY` | your key |

### 4. Run locally

```bash
npm run dev
```

---

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui components
- Gemini 2.0 Flash API
- wouter (routing)
- localStorage (persistence)
