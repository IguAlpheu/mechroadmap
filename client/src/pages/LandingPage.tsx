// ============================================================
// Lumeo — Landing Page
// ============================================================
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Zap, Map, TrendingUp, BookOpen, CheckCircle2 } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";

const EXAMPLE_SKILLS = [
  "Learn guitar",
  "Master Python",
  "Speak Japanese",
  "Build with React",
  "Practice meditation",
  "Study calculus",
  "Learn to draw",
  "Get fit",
];

interface LandingPageProps {
  authed: boolean;
}

export default function LandingPage({ authed }: LandingPageProps) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState(EXAMPLE_SKILLS[0]);
  const [visible, setVisible] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (authed) navigate("/dashboard");
  }, [authed, navigate]);

  // Rotate placeholder examples
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % EXAMPLE_SKILLS.length;
      setPlaceholder(EXAMPLE_SKILLS[i]);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    const dest = input.trim() ? `/login?skill=${encodeURIComponent(input.trim())}` : "/login";
    navigate(dest);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleStart();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AuroraBackground intensity="medium" />
      <div className="starfield absolute inset-0 opacity-25" />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(60% 0.22 240), oklch(50% 0.24 240))",
              boxShadow: "0 0 16px oklch(58% 0.22 240 / 40%)",
            }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Lumeo</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
        >
          Sign in
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] px-4 text-center">
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)",
          }}
          className="max-w-3xl mx-auto space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary font-medium">
            <Zap className="w-3 h-3" />
            AI-powered learning roadmaps
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Learn anything.
            <br />
            <span className="gradient-text-blue">Build your roadmap.</span>
          </h1>

          {/* Sub */}
          <p className="text-white/55 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Type any skill you want to master — Lumeo generates a complete,
            step-by-step learning plan with curated resources and daily progress tracking.
          </p>

          {/* Input + CTA */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="lumeo-input flex-1 text-base"
              style={{ fontSize: "1rem" }}
            />
            <button
              onClick={handleStart}
              className="lumeo-btn flex items-center justify-center gap-2 whitespace-nowrap px-6"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-white/25 text-xs">
            Free to try · No credit card required
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="mono-label">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              From zero to structured in seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <BookOpen className="w-5 h-5" />,
                title: "Type your skill",
                description:
                  "Tell Lumeo what you want to learn — anything from guitar to calculus, a new language to a fitness habit.",
              },
              {
                icon: <Map className="w-5 h-5" />,
                title: "Get your roadmap",
                description:
                  "Our AI instantly creates a personalized plan: study steps, curated resources, timers, and daily activities.",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Track your progress",
                description:
                  "Mark steps complete, claim daily streaks, and watch your progress heatmap fill up over time.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="lumeo-card rounded-2xl p-6 space-y-4"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-primary"
                  style={{ background: "oklch(58% 0.22 240 / 12%)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-base">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="relative z-10 py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="mono-label">What's included</span>
              <h2 className="text-3xl font-bold text-white leading-snug">
                Everything you need to actually follow through
              </h2>
              <div className="space-y-3">
                {[
                  "AI-generated step-by-step study plan",
                  "Curated resources and reading lists",
                  "Pomodoro-style study timers",
                  "Daily streak tracking",
                  "Activity heatmap (like GitHub)",
                  "Personal notes and annotations",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock skill card */}
            <div className="lumeo-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎸</span>
                <div>
                  <p className="mono-label text-xs">SKILL 01 — GUITAR</p>
                  <h3 className="text-white font-bold text-base">Master the Guitar</h3>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Open chords & posture", done: true },
                  { label: "Basic strumming patterns", done: true },
                  { label: "Chord transitions", done: false },
                  { label: "Your first song", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                        step.done
                          ? "bg-primary/80 text-white"
                          : "border border-white/20"
                      }`}
                    >
                      {step.done && (
                        <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        step.done ? "text-white/40 line-through" : "text-white/70"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs text-white/40">2 of 8 steps complete</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-1/4 bg-primary rounded-full" />
                  </div>
                  <span className="mono-label text-xs">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to start learning?
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="lumeo-btn inline-flex items-center gap-2 text-base px-8 py-4"
          >
            Create your first roadmap
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/5 text-center">
        <p className="text-white/25 text-xs">
          © {new Date().getFullYear()} Lumeo · Built to help you actually learn things.
        </p>
      </footer>
    </div>
  );
}
