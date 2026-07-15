import { useState, useEffect, useRef } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowLeft, Flame, CheckCircle2, Circle, ExternalLink, Clock, LogOut, BookOpen, Timer, BarChart2, StickyNote, Play, Square, RotateCcw, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { getSkillById, getProgress, saveProgress, updateLastStudied, getProgressPercent, StoredSkill } from "@/lib/storage";
import { playFocusEnd, playBreakEnd, playStepComplete, playStreakClaim } from "@/lib/sounds";
import { motion, AnimatePresence } from "framer-motion";

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

  // Focus Timer state
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

  // Timer Tick
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
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const progress = getProgressPercent(skill, completedSteps);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "roadmap", label: "Cronograma", icon: <BookOpen className="w-4 h-4" /> },
    { id: "resources", label: "Recursos", icon: <ExternalLink className="w-4 h-4" /> },
    { id: "timer", label: "Foco (Timer)", icon: <Timer className="w-4 h-4" /> },
    { id: "progress", label: "Estatísticas", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "notes", label: "Anotações", icon: <StickyNote className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--background)" }}>
      
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sticky top-0 z-20 backdrop-blur-md border-b border-border bg-background/55">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")}
            className="lumeo-btn-ghost px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
          <span className="text-muted-foreground/35">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xl p-1.5 rounded-lg" style={{ background: `${skill.color}15` }}>{skill.emoji}</span>
            <span className="text-sm font-bold truncate max-w-[140px] sm:max-w-xs" style={{ color: "var(--foreground)" }}>
              {skill.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => { onLogout(); navigate("/"); }}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.4s cubic-bezier(0.23,1,0.32,1), transform 0.4s cubic-bezier(0.23,1,0.32,1)" }}>

        {/* Left Side: Tabs Switcher and Tab View (Spans 8 columns on md) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex gap-1.5 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide border border-border bg-muted/20">
            {TABS.map((t) => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap min-w-0"
                style={tab === t.id
                  ? { background: skill.color, color: "var(--primary-foreground)", boxShadow: `0 8px 20px -8px ${skill.color}` }
                  : { color: "var(--muted-foreground)" }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-[400px]"
          >
            {tab === "roadmap" && <RoadmapTab skill={skill} completedSteps={completedSteps} onToggle={toggleStep} />}
            {tab === "resources" && <ResourcesTab skill={skill} />}
            {tab === "timer" && <TimerTab timerSeconds={timerSeconds} timerActive={timerActive} timerMode={timerMode} sessions={sessions} skill={skill} onToggle={() => setTimerActive((a) => !a)} onReset={() => { setTimerActive(false); setTimerSeconds(timerMode === "focus" ? 25 * 60 : 5 * 60); }} onSwitch={switchTimer} fmt={fmt} />}
            {tab === "progress" && <ProgressTab skill={skill} completedSteps={completedSteps} progress={progress} />}
            {tab === "notes" && <NotesTab notes={notes} onChange={saveNotes} />}
          </motion.div>
        </div>

        {/* Right Side: Sticky Status Panel (Spans 4 columns on md) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Sticky Container */}
          <div className="sticky top-24 space-y-6">
            
            {/* Streak & Milestone Stats Card */}
            <div className="lumeo-card p-6 space-y-5 bg-card/45 backdrop-blur-md">
              <p className="mono-label text-[10px]" style={{ color: skill.color }}>Progresso Geral</p>
              
              {/* Progress visual */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{completedSteps.length} de {skill.studySteps?.length ?? 0} lições</span>
                  <span style={{ color: skill.color }}>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, background: skill.color, boxShadow: `0 0 10px ${skill.color}50` }} />
                </div>
              </div>

              {/* Streak info */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400 animate-pulse fill-current" />
                  <div>
                    <h4 className="text-xs font-extrabold" style={{ color: "var(--foreground)" }}>Ofensiva</h4>
                    <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
                  </div>
                </div>
                <span className="text-3xl font-black" style={{ color: skill.color }}>{streak}</span>
              </div>

              <button 
                onClick={claimStreak} 
                disabled={streakClaimed || loadingProgress}
                className="w-full py-3 rounded-full text-xs font-extrabold transition-all border border-transparent shadow-md active:scale-97 cursor-pointer"
                style={streakClaimed
                  ? { background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "default" }
                  : { background: skill.color, color: "var(--primary-foreground)", boxShadow: `0 6px 18px -4px ${skill.color}` }}
              >
                {streakClaimed ? "✓ Dia Reivindicado" : "🔥 Reivindicar Ofensiva"}
              </button>
            </div>

            {/* Micro Details Info */}
            <div className="lumeo-card p-5 space-y-3 bg-card/20 text-xs">
              <h4 className="font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Sobre a trilha</h4>
              <p className="leading-relaxed text-muted-foreground">{skill.description}</p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

/* Roadmap timeline list with vertical line connecting nodes */
function RoadmapTab({ skill, completedSteps, onToggle }: { skill: StoredSkill; completedSteps: number[]; onToggle: (id: number) => void }) {
  return (
    <div className="relative pl-6 space-y-4">
      {/* Dashed pathway line */}
      <div 
        className="absolute left-9 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-border"
        style={{ borderColor: "oklch(from var(--border) l c h / 60%)" }}
      />

      {(skill.studySteps ?? []).map((step, i) => {
        const done = completedSteps.includes(step.id);
        return (
          <motion.div 
            key={step.id} 
            onClick={() => onToggle(step.id)}
            whileHover={{ x: 2 }}
            className={`lumeo-card p-4.5 cursor-pointer flex items-start gap-4 transition-all relative ${done ? "bg-card/25 border-border/40 opacity-70" : "bg-card/65 border-border"}`}
          >
            {/* Step marker */}
            <div className="flex-shrink-0 z-10 mt-1 relative flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border">
              {done ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: skill.color }} />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="mono-label text-[9px] font-bold" style={{ color: skill.color }}>ETAPA {String(i + 1).padStart(2, "0")}</span>
                {step.duration && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60">
                    <Clock className="w-3 h-3" />{step.duration}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold leading-snug" style={{ color: done ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: done ? "line-through" : "none" }}>
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ResourcesTab({ skill }: { skill: StoredSkill }) {
  return (
    <div className="space-y-4">
      {(skill.resources ?? []).map((res, i) => (
        <div key={i} className="lumeo-card p-6 space-y-4 bg-card/65 border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${res.color}15`, color: res.color, border: `1px solid ${res.color}25` }}>{res.badge}</span>
                <span className="text-xs text-muted-foreground font-semibold font-mono">{res.time}</span>
              </div>
              <h3 className="font-extrabold text-base pt-1" style={{ color: "var(--foreground)" }}>{res.name}</h3>
              <p className="text-xs text-muted-foreground font-medium">{res.role}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${res.color}15`, border: `1px solid ${res.color}25` }}>
              <BookOpen className="w-4.5 h-4.5" style={{ color: res.color }} />
            </div>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed pt-3 text-muted-foreground border-t border-border">
            {res.why}
          </p>
          {(res.resources ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {res.resources.map((link, j) => (
                <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border"
                  style={{ background: `${res.color}10`, color: res.color, borderColor: `${res.color}25` }}>
                  <span>{link.name}</span>
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

function TimerTab({ timerSeconds, timerActive, timerMode, sessions, skill, onToggle, onReset, onSwitch, fmt }: {
  timerSeconds: number; timerActive: boolean; timerMode: "focus" | "break"; sessions: number;
  skill: StoredSkill; onToggle: () => void; onReset: () => void; onSwitch: () => void; fmt: (s: number) => string;
}) {
  const total = timerMode === "focus" ? 25 * 60 : 5 * 60;
  const pct = ((total - timerSeconds) / total) * 100;
  const size = 220, sw = 8, r = (size - sw) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="lumeo-card p-8 flex flex-col items-center gap-8 bg-card/65 border-border">
      
      {/* Mode selectors */}
      <div className="flex gap-2 p-1.5 rounded-2xl border border-border bg-muted/20">
        {(["focus", "break"] as const).map((m) => (
          <button key={m} onClick={() => timerMode !== m && onSwitch()}
            className="px-4.5 py-2 rounded-xl text-xs font-extrabold transition-all"
            style={timerMode === m
              ? { background: skill.color, color: "var(--primary-foreground)" }
              : { color: "var(--muted-foreground)" }}>
            {m === "focus" ? "Foco · 25m" : "Pausa · 5m"}
          </button>
        ))}
      </div>

      {/* Circle countdown visualizer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={skill.color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 10px ${skill.color}50)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4.5xl font-black font-mono tracking-tight" style={{ color: "var(--foreground)" }}>
            {fmt(timerSeconds)}
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase mt-1" style={{ color: skill.color }}>{timerMode === "focus" ? "Sessão de Foco" : "Intervalo"}</span>
          {sessions > 0 && <span className="text-[9px] font-bold text-muted-foreground font-mono mt-1">{sessions} concluída{sessions !== 1 ? "s" : ""}</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button onClick={onReset} className="lumeo-btn-ghost gap-2 h-10 px-5 text-xs font-bold">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
        <button onClick={onToggle}
          className="h-10 px-8 rounded-full text-xs font-extrabold transition-all shadow-md active:scale-97 cursor-pointer"
          style={timerActive
            ? { background: "rgba(255, 255, 255, 0.05)", color: "var(--foreground)", border: "1px solid var(--border)" }
            : { background: skill.color, color: "var(--primary-foreground)", boxShadow: `0 6px 16px -4px ${skill.color}` }}>
          {timerActive ? "Pausar" : "Iniciar Foco"}
        </button>
      </div>
      
      <p className="text-[10px] text-center text-muted-foreground font-medium max-w-xs leading-relaxed">
        Use a técnica Pomodoro: 25 minutos de atenção plena, seguidos de 5 minutos de repouso mental.
      </p>
    </div>
  );
}

function ProgressTab({ skill, completedSteps, progress }: { skill: StoredSkill; completedSteps: number[]; progress: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Progresso Geral", value: `${progress}%` },
          { label: "Concluído", value: completedSteps.length },
          { label: "Restante", value: (skill.studySteps?.length ?? 0) - completedSteps.length },
          { label: "Total Lições", value: skill.studySteps?.length ?? 0 },
        ].map((s, i) => (
          <div key={i} className="lumeo-card p-4.5 text-center space-y-1 bg-card/65 border-border">
            <p className="text-[10px] mono-label font-bold" style={{ color: skill.color }}>{s.label.toUpperCase()}</p>
            <p className="text-2.5xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{s.value}</p>
          </div>
        ))}
      </div>
      {(skill.barData ?? []).length > 0 && (
        <div className="lumeo-card p-6 space-y-5 bg-card/65 border-border">
          <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Carga Horária por Fase</h3>
          <div className="space-y-4">
            {skill.barData.map((bar, i) => {
              const max = Math.max(...skill.barData.map((b) => b.hours));
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">{bar.name}</span>
                    <span className="text-muted-foreground/80 font-mono">{bar.hours}h</span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${max > 0 ? (bar.hours/max)*100 : 0}%`, background: bar.color, boxShadow: `0 0 6px ${bar.color}40` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {(skill.timers ?? []).length > 0 && (
        <div className="lumeo-card p-6 space-y-4 bg-card/65 border-border">
          <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Fases de Aprendizado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {skill.timers.map((timer, i) => (
              <div key={i} className="rounded-xl p-4 space-y-1 border"
                style={{ background: `${timer.color}10`, borderColor: `${timer.color}20` }}>
                <p className="text-[10px] mono-label font-bold" style={{ color: timer.color }}>FASE {String(i + 1).padStart(2, "0")}</p>
                <h4 className="font-extrabold text-sm" style={{ color: "var(--foreground)" }}>{timer.title}</h4>
                <p className="font-semibold text-xs text-muted-foreground font-mono">{timer.totalWeeks} semanas estimadas</p>
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
      <div className="lumeo-card p-6 space-y-4 bg-card/65 border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Caderno de Notas</h3>
          <span className="text-[10px] text-muted-foreground font-mono">{notes.length} caracteres · Salvo automaticamente</span>
        </div>
        <textarea value={notes} onChange={(e) => onChange(e.target.value)}
          placeholder="Escreva seus insights, resumos, dúvidas ou qualquer lembrete para esta meta..."
          className="w-full min-h-[300px] resize-none lumeo-input text-xs sm:text-sm leading-relaxed p-4 bg-background/25 border-border"
          style={{ fontFamily: "inherit" }} />
      </div>
    </div>
  );
}

