import { useState, useEffect, useRef } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowRight, Zap, CheckCircle2, BookOpen, BarChart2, Clock } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";

const ROTATING_WORDS = ["guitar", "Python", "Japanese", "calculus", "design", "trading", "chess", "drawing"];

interface LandingPageProps {
  authed: boolean;
}

export default function LandingPage({ authed }: LandingPageProps) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authed) navigate("/dashboard");
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [authed, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setFading(false);
      }, 300);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    const dest = input.trim()
      ? `/login?skill=${encodeURIComponent(input.trim())}`
      : "/login";
    navigate(dest);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AuroraBackground intensity="medium" />
      <div className="starfield absolute inset-0 opacity-20" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(60% 0.22 240), oklch(50% 0.24 240))", boxShadow: "0 0 16px oklch(58% 0.22 240 / 40%)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Lumeo</span>
        </div>
        <button onClick={() => navigate("/login")}
          className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[86vh] px-4 text-center">
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s cubic-bezier(0.23,1,0.32,1), transform 0.6s cubic-bezier(0.23,1,0.32,1)" }}
          className="max-w-3xl mx-auto space-y-8">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-xs text-primary font-medium tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-powered learning roadmaps
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-[4.5rem] font-black text-white leading-[1.05] tracking-tight">
            Learn{" "}
            <span className="relative inline-block w-[220px] sm:w-[280px] text-left">
              <span
                className="gradient-text-blue"
                style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s ease", display: "inline-block" }}>
                {ROTATING_WORDS[wordIndex]}.
              </span>
            </span>
            <br />
            <span className="text-white/30">Build the habit.</span>
          </h1>

          <p className="text-white/50 text-lg sm:text-xl max-w-lg mx-auto leading-relaxed font-light">
            Type any skill. Get a complete, structured roadmap with curated resources,
            study steps, and daily progress tracking — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto w-full">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder={`e.g. ${ROTATING_WORDS[wordIndex]}`}
              className="lumeo-input flex-1 text-base"
            />
            <button onClick={handleStart} className="lumeo-btn flex items-center justify-center gap-2 whitespace-nowrap px-6">
              Start learning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-white/20 text-xs tracking-wide">No credit card · Your data stays local</p>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-2">
            <p className="mono-label">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">From idea to action in 3 steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <BookOpen className="w-5 h-5" />, step: "01", title: "Name your skill", body: "Type anything — a language, instrument, sport, subject, or habit. Lumeo handles the rest." },
              { icon: <Zap className="w-5 h-5" />, step: "02", title: "Get your roadmap", body: "A complete plan appears instantly: structured steps, curated resources, and time estimates." },
              { icon: <BarChart2 className="w-5 h-5" />, step: "03", title: "Track every day", body: "Mark steps complete, claim daily streaks, and watch your progress build over time." },
            ].map((f, i) => (
              <div key={i} className="lumeo-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary" style={{ background: "oklch(58% 0.22 240 / 10%)" }}>
                    {f.icon}
                  </div>
                  <span className="mono-label text-white/15">{f.step}</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview card */}
      <section className="relative z-10 py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="mono-label">What you get</p>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Every tool you need to follow through
            </h2>
            <div className="space-y-3">
              {[
                "Step-by-step study roadmap",
                "Curated resources and links",
                "Focus timer (Pomodoro-style)",
                "Daily streak tracking",
                "Phase-by-phase progress view",
                "Personal notes per skill",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock card */}
          <div className="lumeo-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎸</span>
              <div>
                <p className="mono-label text-[10px]">SKILL 01 — GUITAR</p>
                <h3 className="text-white font-bold text-sm mt-0.5">Master the Guitar</h3>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Posture and open chords", done: true },
                { label: "Basic strumming patterns", done: true },
                { label: "Chord transitions", done: false },
                { label: "Your first full song", done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${s.done ? "bg-primary" : "border border-white/15"}`}>
                    {s.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm ${s.done ? "text-white/30 line-through" : "text-white/65"}`}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Clock className="w-3 h-3" />
                2 of 8 steps
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full w-1/4 bg-primary rounded-full" style={{ boxShadow: "0 0 6px oklch(58% 0.22 240 / 60%)" }} />
                </div>
                <span className="mono-label text-[10px]">25%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-white">Ready to start?</h2>
          <p className="text-white/40 text-sm">Pick a skill. Lumeo builds the rest.</p>
          <button onClick={() => { inputRef.current?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="lumeo-btn inline-flex items-center gap-2 px-8 py-3.5 text-base">
            Build my roadmap
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/5 text-center">
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Lumeo</p>
      </footer>
    </div>
  );
}
