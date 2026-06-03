import { useState, useEffect, useRef } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowLeft, Flame, CheckCircle2, Circle, ExternalLink, Clock, LogOut, BookOpen, Timer, BarChart2, StickyNote } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { getSkillById, getProgress, saveProgress, updateLastStudied, getProgressPercent, StoredSkill } from "@/lib/storage";
import { playFocusEnd, playBreakEnd, playStepComplete, playStreakClaim } from "@/lib/sounds";

interface SkillViewProps {
  skillId: string;
  onLogout: () => void;
}

type Tab = "roadmap" | "resources" | "timer" | "progress" | "notes";

export default function SkillView({ skillId, onLogout }: SkillViewProps) {
  const [, navigate] = useLocation();
  const [skill, setSkill] = useState<StoredSkill | null>(null);
  const [tab, setTab] = useState<Tab>("roadmap");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [notes, setNotes] = useState("");
  const [visible, setVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      const s = await getSkillById(skillId);
      if (!s) { navigate("/dashboard"); return; }
      setSkill(s);
      await updateLastStudied(skillId);

      const p = await getProgress(skillId);
      setCompletedSteps(p.completedSteps);
      setStreak(p.streak);
      setNotes(p.notes);

      const today = new Date().toISOString().split("T")[0];
      setStreakClaimed(p.streakLastClaimed === today);
      setLoadingProgress(false);
      setTimeout(() => setVisible(true), 60);
    };
    init();
  }, [skillId, navigate]);

  // Timer tick
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            setTimerActive(false);
            if (timerMode === "focus") {
              playFocusEnd();
              setSessions((n) => n + 1);
              setTimerMode("break");
              return 5 * 60;
            } else {
              playBreakEnd();
              setTimerMode("focus");
              return 25 * 60;
            }
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive, timerMode]);

  const toggleStep = async (stepId: number) => {
    const next = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];
    setCompletedSteps(next);
    if (!completedSteps.includes(stepId)) playStepComplete();
    await saveProgress(skillId, { completedSteps: next });
  };

  const claimStreak = async () => {
    if (streakClaimed) return;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    const newStreak = (await getProgress(skillId)).streakLastClaimed === yStr || streak === 0
      ? streak + 1 : 1;
    setStreak(newStreak);
    setStreakClaimed(true);
    playStreakClaim();
    await saveProgress(skillId, { streak: newStreak, streakLastClaimed: today });
  };

  const saveNotes = (val: string) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      saveProgress(skillId, { notes: val });
    }, 800);
  };

  const switchTimer = () => {
    setTimerActive(false);
    const next = timerMode === "focus" ? "break" : "focus";
    setTimerMode(next);
    setTimerSeconds(next === "focus" ? 25 * 60 : 5 * 60);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (!skill) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
    </div>
  );

  const progress = getProgressPercent(skill, completedSteps);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "roadmap", label: "Roadmap", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "resources", label: "Resources", icon: <ExternalLink className="w-3.5 h-3.5" /> },
    { id: "timer", label: "Timer", icon: <Timer className="w-3.5 h-3.5" /> },
    { id: "progress", label: "Progress", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: "notes", label: "Notes", icon: <StickyNote className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 sticky top-0 z-20 backdrop-blur-md"
        style={{ borderBottom: "1px solid var(--border)", background: "oklch(from var(--background) l c h / 70%)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "var(--muted-foreground)" }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Back</span>
          </button>
          <span style={{ color: "var(--border)" }}>/</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">{skill.emoji}</span>
            <span className="text-sm font-medium truncate max-w-[140px] sm:max-w-xs" style={{ color: "var(--foreground)" }}>
              {skill.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => { onLogout(); navigate("/"); }}
            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--muted-foreground)" }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.4s cubic-bezier(0.23,1,0.32,1), transform 0.4s cubic-bezier(0.23,1,0.32,1)" }}>

        {/* Hero */}
        <div className="lumeo-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <p className="mono-label text-xs" style={{ color: skill.color }}>{skill.number}</p>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: "var(--foreground)" }}>
                {skill.title}<span style={{ color: skill.color }}> {skill.titleHighlight}</span>
              </h1>
              <p className="text-sm leading-relaxed max-w-lg" style={{ color: "var(--muted-foreground)" }}>
                {skill.description}
              </p>
            </div>

            <div className="flex-shrink-0 rounded-xl p-4 space-y-3 min-w-[150px]"
              style={{ background: `${skill.color}10`, border: `1px solid ${skill.color}22` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Streak</span>
                </div>
                <span className="text-2xl font-black" style={{ color: skill.color }}>{streak}</span>
              </div>
              <button onClick={claimStreak} disabled={streakClaimed || loadingProgress}
                className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                style={streakClaimed
                  ? { background: `${skill.color}12`, color: `${skill.color}70`, cursor: "default" }
                  : { background: skill.color, color: "var(--primary-foreground)", boxShadow: `0 0 14px ${skill.color}40` }}>
                {streakClaimed ? "✓ Done today" : "🔥 Claim"}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--muted-foreground)" }}>
                {completedSteps.length} of {skill.studySteps?.length ?? 0} steps
              </span>
              <span className="mono-label" style={{ color: skill.color }}>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: skill.color, boxShadow: `0 0 10px ${skill.color}50` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide"
          style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-0"
              style={tab === t.id
                ? { background: skill.color, color: "var(--primary-foreground)", boxShadow: `0 0 10px ${skill.color}35` }
                : { color: "var(--muted-foreground)" }}>
              {t.icon}
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "roadmap" && <RoadmapTab skill={skill} completedSteps={completedSteps} onToggle={toggleStep} />}
        {tab === "resources" && <ResourcesTab skill={skill} />}
        {tab === "timer" && <TimerTab timerSeconds={timerSeconds} timerActive={timerActive} timerMode={timerMode} sessions={sessions} skill={skill} onToggle={() => setTimerActive((a) => !a)} onReset={() => { setTimerActive(false); setTimerSeconds(timerMode === "focus" ? 25 * 60 : 5 * 60); }} onSwitch={switchTimer} fmt={fmt} />}
        {tab === "progress" && <ProgressTab skill={skill} completedSteps={completedSteps} progress={progress} />}
        {tab === "notes" && <NotesTab notes={notes} onChange={saveNotes} />}
      </main>
    </div>
  );
}

function RoadmapTab({ skill, completedSteps, onToggle }: { skill: StoredSkill; completedSteps: number[]; onToggle: (id: number) => void }) {
  return (
    <div className="space-y-2.5">
      {(skill.studySteps ?? []).map((step, i) => {
        const done = completedSteps.includes(step.id);
        return (
          <div key={step.id} onClick={() => onToggle(step.id)}
            className="lumeo-card rounded-xl p-4 cursor-pointer flex items-start gap-4 group"
            style={{ opacity: done ? 0.5 : 1 }}>
            <div className="flex-shrink-0 mt-0.5">
              {done
                ? <CheckCircle2 className="w-5 h-5" style={{ color: skill.color }} />
                : <Circle className="w-5 h-5 transition-colors" style={{ color: "var(--border)" }} />}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="mono-label text-[10px]" style={{ opacity: 0.4 }}>STEP {String(i + 1).padStart(2, "0")}</span>
                {step.duration && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                    <Clock className="w-2.5 h-2.5" />{step.duration}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold" style={{ color: done ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: done ? "line-through" : "none" }}>
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResourcesTab({ skill }: { skill: StoredSkill }) {
  return (
    <div className="space-y-4">
      {(skill.resources ?? []).map((res, i) => (
        <div key={i} className="lumeo-card rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${res.color}18`, color: res.color }}>{res.badge}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{res.time}</span>
              </div>
              <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{res.name}</h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{res.role}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${res.color}12` }}>
              <BookOpen className="w-4 h-4" style={{ color: res.color }} />
            </div>
          </div>
          <p className="text-sm leading-relaxed pt-3" style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)" }}>
            {res.why}
          </p>
          {(res.resources ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {res.resources.map((link, j) => (
                <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: `${res.color}10`, color: res.color, border: `1px solid ${res.color}22` }}>
                  {link.name}<ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TimerTab({ timerSeconds, timerActive, timerMode, sessions, skill, onToggle, onReset, onSwitch, fmt }: {
  timerSeconds: number; timerActive: boolean; timerMode: "focus" | "break"; sessions: number;
  skill: StoredSkill; onToggle: () => void; onReset: () => void; onSwitch: () => void; fmt: (s: number) => string;
}) {
  const total = timerMode === "focus" ? 25 * 60 : 5 * 60;
  const pct = ((total - timerSeconds) / total) * 100;
  const size = 200, sw = 10, r = (size - sw) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="lumeo-card rounded-2xl p-8 flex flex-col items-center gap-8">
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
        {(["focus", "break"] as const).map((m) => (
          <button key={m} onClick={() => timerMode !== m && onSwitch()}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={timerMode === m
              ? { background: skill.color, color: "var(--primary-foreground)" }
              : { color: "var(--muted-foreground)" }}>
            {m === "focus" ? "Focus · 25m" : "Break · 5m"}
          </button>
        ))}
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={skill.color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 8px ${skill.color}55)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color: "var(--foreground)", fontFamily: "JetBrains Mono, monospace" }}>
            {fmt(timerSeconds)}
          </span>
          <span className="text-xs mt-1 capitalize" style={{ color: "var(--muted-foreground)" }}>{timerMode}</span>
          {sessions > 0 && <span className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>{sessions} session{sessions !== 1 ? "s" : ""}</span>}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onReset} className="lumeo-btn-ghost px-5 py-2.5 text-sm">Reset</button>
        <button onClick={onToggle}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={timerActive
            ? { background: "var(--accent)", color: "var(--foreground)", border: "1px solid var(--border)" }
            : { background: skill.color, color: "var(--primary-foreground)", boxShadow: `0 0 20px ${skill.color}40` }}>
          {timerActive ? "Pause" : "Start"}
        </button>
      </div>
      <p className="text-xs text-center max-w-xs" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
        25 minutes of focused work, then a 5-minute break.
      </p>
    </div>
  );
}

function ProgressTab({ skill, completedSteps, progress }: { skill: StoredSkill; completedSteps: number[]; progress: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overall", value: `${progress}%` },
          { label: "Done", value: completedSteps.length },
          { label: "Remaining", value: (skill.studySteps?.length ?? 0) - completedSteps.length },
          { label: "Total", value: skill.studySteps?.length ?? 0 },
        ].map((s, i) => (
          <div key={i} className="lumeo-card rounded-xl p-4 text-center space-y-1">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            <p className="text-2xl font-black" style={{ color: "var(--foreground)" }}>{s.value}</p>
          </div>
        ))}
      </div>
      {(skill.barData ?? []).length > 0 && (
        <div className="lumeo-card rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Study load by phase</h3>
          <div className="space-y-3">
            {skill.barData.map((bar, i) => {
              const max = Math.max(...skill.barData.map((b) => b.hours));
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>{bar.name}</span>
                    <span style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>{bar.hours}h</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${max > 0 ? (bar.hours/max)*100 : 0}%`, background: bar.color, boxShadow: `0 0 6px ${bar.color}40` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {(skill.timers ?? []).length > 0 && (
        <div className="lumeo-card rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Learning phases</h3>
          <div className="grid grid-cols-2 gap-3">
            {skill.timers.map((timer, i) => (
              <div key={i} className="rounded-xl p-3 space-y-1"
                style={{ background: `${timer.color}10`, border: `1px solid ${timer.color}20` }}>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{timer.title}</p>
                <p className="font-bold text-sm" style={{ color: timer.color }}>{timer.totalWeeks} weeks</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotesTab({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="lumeo-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Your notes</h3>
          <span className="text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>{notes.length} chars · auto-saved</span>
        </div>
        <textarea value={notes} onChange={(e) => onChange(e.target.value)}
          placeholder="Jot down key insights, questions, or anything you want to remember..."
          className="w-full min-h-[280px] resize-none lumeo-input text-sm leading-relaxed"
          style={{ fontFamily: "inherit" }} />
      </div>
    </div>
  );
}
