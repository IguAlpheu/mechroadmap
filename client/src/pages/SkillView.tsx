// ============================================================
// Lumeo — Skill View (full roadmap detail page)
// ============================================================
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Flame, CheckCircle2, Circle,
  ExternalLink, Clock, LogOut, Zap, BookOpen,
  Timer, BarChart2
} from "lucide-react";
import { getSkillById, getStreak, StoredSkill } from "@/lib/storage";

interface SkillViewProps {
  skillId: string;
  onLogout: () => void;
}

type Tab = "roadmap" | "resources" | "timer" | "progress";

export default function SkillView({ skillId, onLogout }: SkillViewProps) {
  const [, navigate] = useLocation();
  const [skill, setSkill] = useState<StoredSkill | null>(null);
  const [tab, setTab] = useState<Tab>("roadmap");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    const s = getSkillById(skillId);
    if (!s) { navigate("/dashboard"); return; }
    setSkill(s);
    setStreak(getStreak(skillId));

    // Load completed steps
    try {
      const raw = localStorage.getItem(`steps-${skillId}`);
      if (raw) setCompletedSteps(JSON.parse(raw));
    } catch { /* noop */ }

    // Check streak claimed today
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem(`streak-lastclicked-${skillId}`);
    setStreakClaimed(lastClaim === today);

    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [skillId, navigate]);

  // Timer tick
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setTimerActive(false);
          setTimerMode((m) => (m === "focus" ? "break" : "focus"));
          return m => m === "focus" ? 5 * 60 : 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const toggleStep = (stepId: number) => {
    const next = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];
    setCompletedSteps(next);
    localStorage.setItem(`steps-${skillId}`, JSON.stringify(next));
  };

  const claimStreak = () => {
    if (streakClaimed) return;
    const today = new Date().toDateString();
    const lastKey = `streak-lastclicked-${skillId}`;
    const savedLast = localStorage.getItem(lastKey);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = savedLast === yesterday.toDateString();
    const newStreak = wasYesterday || streak === 0 ? streak + 1 : 1;
    setStreak(newStreak);
    setStreakClaimed(true);
    localStorage.setItem(`streak-${skillId}`, newStreak.toString());
    localStorage.setItem(lastKey, today);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(timerMode === "focus" ? 25 * 60 : 5 * 60);
  };

  if (!skill) return null;

  const progress = skill.studySteps?.length
    ? Math.round((completedSteps.length / skill.studySteps.length) * 100)
    : 0;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "roadmap", label: "Roadmap", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "resources", label: "Resources", icon: <ExternalLink className="w-3.5 h-3.5" /> },
    { id: "timer", label: "Timer", icon: <Timer className="w-3.5 h-3.5" /> },
    { id: "progress", label: "Progress", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-background/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </button>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">{skill.emoji}</span>
            <span className="text-white text-sm font-medium truncate max-w-[160px] sm:max-w-xs">
              {skill.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => { onLogout(); navigate("/"); }}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>

      <main
        className="max-w-4xl mx-auto px-4 py-8 space-y-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out)",
        }}
      >
        {/* Hero header */}
        <div className="lumeo-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="mono-label" style={{ color: skill.color }}>
                {skill.number}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {skill.title}
                <span style={{ color: skill.color }}> {skill.titleHighlight}</span>
              </h1>
              <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                {skill.description}
              </p>
            </div>

            {/* Streak card */}
            <div
              className="flex-shrink-0 rounded-xl p-4 space-y-3 min-w-[160px]"
              style={{ background: `${skill.color}10`, border: `1px solid ${skill.color}25` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-white/50">Daily streak</span>
                </div>
                <span className="text-2xl font-black" style={{ color: skill.color }}>
                  {streak}
                </span>
              </div>
              <button
                onClick={claimStreak}
                disabled={streakClaimed}
                className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                style={
                  streakClaimed
                    ? { background: `${skill.color}15`, color: `${skill.color}80`, cursor: "default" }
                    : {
                        background: skill.color,
                        color: "#fff",
                        boxShadow: `0 0 14px ${skill.color}40`,
                      }
                }
              >
                {streakClaimed ? "✓ Claimed today" : "🔥 Claim streak"}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/35">
                {completedSteps.length} of {skill.studySteps?.length ?? 0} steps complete
              </span>
              <span className="mono-label" style={{ color: skill.color }}>
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: skill.color,
                  boxShadow: `0 0 10px ${skill.color}50`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-full overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={
                tab === t.id
                  ? { background: skill.color, color: "#fff", boxShadow: `0 0 12px ${skill.color}40` }
                  : { color: "oklch(55% 0.02 240)", background: "transparent" }
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "roadmap" && (
          <RoadmapTab
            skill={skill}
            completedSteps={completedSteps}
            onToggle={toggleStep}
          />
        )}
        {tab === "resources" && <ResourcesTab skill={skill} />}
        {tab === "timer" && (
          <TimerTab
            timerSeconds={timerSeconds}
            timerActive={timerActive}
            timerMode={timerMode}
            skill={skill}
            onToggle={() => setTimerActive((a) => !a)}
            onReset={resetTimer}
            onSwitch={() => {
              setTimerActive(false);
              const next = timerMode === "focus" ? "break" : "focus";
              setTimerMode(next);
              setTimerSeconds(next === "focus" ? 25 * 60 : 5 * 60);
            }}
            formatTime={formatTime}
          />
        )}
        {tab === "progress" && (
          <ProgressTab skill={skill} completedSteps={completedSteps} progress={progress} />
        )}
      </main>
    </div>
  );
}

// ── Roadmap Tab ───────────────────────────────────────────────

function RoadmapTab({
  skill,
  completedSteps,
  onToggle,
}: {
  skill: StoredSkill;
  completedSteps: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="space-y-3">
      {(skill.studySteps ?? []).map((step, i) => {
        const done = completedSteps.includes(step.id);
        return (
          <div
            key={step.id}
            onClick={() => onToggle(step.id)}
            className="lumeo-card rounded-xl p-4 cursor-pointer flex items-start gap-4 group"
            style={done ? { opacity: 0.55 } : {}}
          >
            <div className="flex-shrink-0 mt-0.5">
              {done ? (
                <CheckCircle2
                  className="w-5 h-5 transition-colors"
                  style={{ color: skill.color }}
                />
              ) : (
                <Circle className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="mono-label text-[10px] text-white/25">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                {step.duration && (
                  <div className="flex items-center gap-1 text-[10px] text-white/25">
                    <Clock className="w-2.5 h-2.5" />
                    {step.duration}
                  </div>
                )}
              </div>
              <h3
                className={`text-sm font-semibold ${done ? "text-white/40 line-through" : "text-white"}`}
              >
                {step.title}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Resources Tab ─────────────────────────────────────────────

function ResourcesTab({ skill }: { skill: StoredSkill }) {
  return (
    <div className="space-y-4">
      {(skill.resources ?? []).map((res, i) => (
        <div key={i} className="lumeo-card rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${res.color}20`, color: res.color }}
                >
                  {res.badge}
                </span>
                <span className="text-white/25 text-xs">{res.time}</span>
              </div>
              <h3 className="text-white font-semibold text-base">{res.name}</h3>
              <p className="text-white/45 text-xs">{res.role}</p>
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${res.color}15` }}
            >
              <BookOpen className="w-4 h-4" style={{ color: res.color }} />
            </div>
          </div>

          <p className="text-white/50 text-sm leading-relaxed border-t border-white/5 pt-3">
            {res.why}
          </p>

          {(res.resources ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {res.resources.map((link, j) => (
                <a
                  key={j}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: `${res.color}12`,
                    color: res.color,
                    border: `1px solid ${res.color}25`,
                  }}
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Timer Tab ─────────────────────────────────────────────────

function TimerTab({
  timerSeconds,
  timerActive,
  timerMode,
  skill,
  onToggle,
  onReset,
  onSwitch,
  formatTime,
}: {
  timerSeconds: number;
  timerActive: boolean;
  timerMode: "focus" | "break";
  skill: StoredSkill;
  onToggle: () => void;
  onReset: () => void;
  onSwitch: () => void;
  formatTime: (s: number) => string;
}) {
  const total = timerMode === "focus" ? 25 * 60 : 5 * 60;
  const percent = ((total - timerSeconds) / total) * 100;
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="lumeo-card rounded-2xl p-8 flex flex-col items-center gap-8">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/8">
        {(["focus", "break"] as const).map((m) => (
          <button
            key={m}
            onClick={() => timerMode !== m && onSwitch()}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
            style={
              timerMode === m
                ? { background: skill.color, color: "#fff" }
                : { color: "oklch(55% 0.02 240)" }
            }
          >
            {m === "focus" ? "Focus · 25m" : "Break · 5m"}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(100% 0 0 / 6%)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={skill.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s linear",
              filter: `drop-shadow(0 0 8px ${skill.color}60)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white font-mono">
            {formatTime(timerSeconds)}
          </span>
          <span className="text-xs text-white/35 mt-1 capitalize">{timerMode}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 text-sm font-medium transition-all"
        >
          Reset
        </button>
        <button
          onClick={onToggle}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: timerActive ? "oklch(100% 0 0 / 8%)" : skill.color,
            color: timerActive ? "oklch(90% 0 0)" : "#fff",
            border: timerActive ? "1px solid oklch(100% 0 0 / 15%)" : "none",
            boxShadow: timerActive ? "none" : `0 0 20px ${skill.color}40`,
          }}
        >
          {timerActive ? "Pause" : "Start"}
        </button>
      </div>

      <p className="text-xs text-white/25 text-center max-w-xs">
        Focus on your study steps. Take a break every 25 minutes.
      </p>
    </div>
  );
}

// ── Progress Tab ──────────────────────────────────────────────

function ProgressTab({
  skill,
  completedSteps,
  progress,
}: {
  skill: StoredSkill;
  completedSteps: number[];
  progress: number;
}) {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Overall", value: `${progress}%` },
          { label: "Steps done", value: completedSteps.length },
          { label: "Steps left", value: (skill.studySteps?.length ?? 0) - completedSteps.length },
          { label: "Total steps", value: skill.studySteps?.length ?? 0 },
        ].map((stat, i) => (
          <div key={i} className="lumeo-card rounded-xl p-4 space-y-1 text-center">
            <p className="text-xs text-white/35">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Phase breakdown */}
      {(skill.barData ?? []).length > 0 && (
        <div className="lumeo-card rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">Study phase breakdown</h3>
          <div className="space-y-3">
            {skill.barData.map((bar, i) => {
              const maxHours = Math.max(...skill.barData.map((b) => b.hours));
              const barW = maxHours > 0 ? (bar.hours / maxHours) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{bar.name}</span>
                    <span className="text-white/35">{bar.hours}h</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barW}%`,
                        background: bar.color,
                        boxShadow: `0 0 8px ${bar.color}50`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timers/phases */}
      {(skill.timers ?? []).length > 0 && (
        <div className="lumeo-card rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">Learning phases</h3>
          <div className="grid grid-cols-2 gap-3">
            {skill.timers.map((timer, i) => (
              <div
                key={i}
                className="rounded-xl p-3 space-y-1"
                style={{
                  background: `${timer.color}10`,
                  border: `1px solid ${timer.color}20`,
                }}
              >
                <p className="text-xs text-white/40">{timer.title}</p>
                <p className="font-bold text-sm" style={{ color: timer.color }}>
                  {timer.totalWeeks} weeks
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
