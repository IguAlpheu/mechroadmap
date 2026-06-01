import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowRight, Zap, CheckCircle2, BookOpen, BarChart2, Clock } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import ThemeToggle from "@/components/ThemeToggle";

const WORDS = ["guitar", "Python", "Japanese", "calculus", "chess", "design", "trading", "drawing", "French", "finance"];

export default function LandingPage({ authed }: { authed: boolean }) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (authed) navigate("/dashboard");
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [authed, navigate]);

  useEffect(() => {
    const iv = setInterval(() => {
      setFading(true);
      setTimeout(() => { setWordIdx((i) => (i + 1) % WORDS.length); setFading(false); }, 280);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  const start = () => navigate(input.trim() ? `/login?skill=${encodeURIComponent(input.trim())}` : "/login");

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <AuroraBackground intensity="medium" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", boxShadow: "0 0 18px var(--primary-glow)" }}>
            <Zap className="w-4 h-4" style={{ color: "var(--primary-foreground)" }} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--foreground)" }}>Lumeo</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => navigate("/login")}
            className="text-sm px-4 py-2 rounded-xl transition-colors"
            style={{ color: "var(--muted-foreground)" }}>
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] px-4 text-center">
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s cubic-bezier(0.23,1,0.32,1), transform 0.65s cubic-bezier(0.23,1,0.32,1)" }}
          className="max-w-3xl mx-auto space-y-8">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ border: "1px solid oklch(from var(--primary) l c h / 30%)", background: "oklch(from var(--primary) l c h / 8%)", color: "var(--primary)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--primary)" }} />
            AI-powered learning roadmaps
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.04] tracking-tight" style={{ color: "var(--foreground)" }}>
            Learn{" "}
            <span className="gradient-text-gold inline-block w-[200px] sm:w-[260px] md:w-[300px] text-left"
              style={{ opacity: fading ? 0 : 1, transition: "opacity 0.28s ease" }}>
              {WORDS[wordIdx]}.
            </span>
            <br />
            <span className="shimmer-text">Build the habit.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-lg mx-auto leading-relaxed font-light" style={{ color: "var(--muted-foreground)" }}>
            Type any skill. Get a complete, structured roadmap with curated resources,
            step-by-step guidance, and daily progress tracking — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto w-full">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              placeholder={`e.g. ${WORDS[wordIdx]}`}
              className="lumeo-input flex-1 text-base" />
            <button onClick={start} className="lumeo-btn flex items-center justify-center gap-2 whitespace-nowrap px-6">
              Start learning <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
            Free to try · No credit card · Your data syncs across devices
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-2">
            <p className="mono-label">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--foreground)" }}>
              From idea to action in 3 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <BookOpen className="w-5 h-5" />, step: "01", title: "Name your skill", body: "Type anything — a language, instrument, sport, subject, or habit. Lumeo handles the rest." },
              { icon: <Zap className="w-5 h-5" />, step: "02", title: "Get your roadmap", body: "A complete plan appears instantly: structured steps, curated resources, and time estimates." },
              { icon: <BarChart2 className="w-5 h-5" />, step: "03", title: "Track every day", body: "Mark steps complete, claim daily streaks, and watch your progress compound over time." },
            ].map((f, i) => (
              <div key={i} className="lumeo-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(from var(--primary) l c h / 12%)", color: "var(--primary)" }}>
                    {f.icon}
                  </div>
                  <span className="mono-label" style={{ opacity: 0.25 }}>{f.step}</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="relative z-10 py-16 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="mono-label">What you get</p>
            <h2 className="text-3xl font-bold leading-snug" style={{ color: "var(--foreground)" }}>
              Every tool you need to follow through
            </h2>
            <div className="space-y-3">
              {["Step-by-step study roadmap","Curated resources and links","Focus timer with session tracking","Daily streak system","Phase-by-phase progress view","Personal notes per skill","Offline access via PWA","Synced across all your devices"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lumeo-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎸</span>
              <div>
                <p className="mono-label text-[10px]">SKILL 01 — GUITAR</p>
                <h3 className="font-bold text-sm mt-0.5" style={{ color: "var(--foreground)" }}>
                  Master the <span style={{ color: "var(--primary)" }}>Guitar</span>
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              {[{ label: "Posture and open chords", done: true },{ label: "Basic strumming patterns", done: true },{ label: "Chord transitions", done: false },{ label: "Your first full song", done: false }].map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={s.done ? { background: "var(--primary)" } : { border: "1px solid var(--border)" }}>
                    {s.done && <CheckCircle2 className="w-3 h-3" style={{ color: "var(--primary-foreground)" }} strokeWidth={3} />}
                  </div>
                  <span className="text-sm" style={{ color: s.done ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.5 : 1 }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <Clock className="w-3 h-3" /> 2 of 8 steps
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full w-1/4 rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 6px var(--primary-glow)" }} />
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
          <h2 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Ready to start?</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Pick a skill. Lumeo builds the rest.</p>
          <button onClick={() => navigate("/login")} className="lumeo-btn inline-flex items-center gap-2 px-8 py-3.5 text-base">
            Build my roadmap <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 py-8 px-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.4 }}>
          © {new Date().getFullYear()} Lumeo
        </p>
      </footer>
    </div>
  );
}
