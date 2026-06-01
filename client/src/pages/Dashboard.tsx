// ============================================================
// Lumeo — Dashboard
// ============================================================
import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import {
  Plus, LogOut, Zap, Sparkles, X, Loader2,
  TrendingUp, Clock, Flame, ChevronRight
} from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import {
  getSkills, saveSkill, deleteSkill, getProgress,
  getStreak, StoredSkill, getAuth
} from "@/lib/storage";
import { generateSkillWithAI } from "@/lib/gemini";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [, navigate] = useLocation();
  const [skills, setSkills] = useState<StoredSkill[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [visible, setVisible] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    setSkills(getSkills());
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setGenerating(true);
    setGenError("");
    try {
      const skill = await generateSkillWithAI(input.trim(), skills.length);
      const stored = saveSkill(skill);
      setSkills(getSkills());
      setInput("");
      setModalOpen(false);
      navigate(`/skill/${stored.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate roadmap.";
      setGenError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Remove this skill roadmap?")) return;
    deleteSkill(id);
    setSkills(getSkills());
  };

  const totalStreak = skills.reduce((sum, s) => sum + getStreak(s.id), 0);
  const totalProgress = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + getProgress(s), 0) / skills.length)
    : 0;

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackground intensity="low" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-background/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(60% 0.22 240), oklch(50% 0.24 240))",
              boxShadow: "0 0 14px oklch(58% 0.22 240 / 35%)",
            }}
          >
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Lumeo</span>
        </div>
        <div className="flex items-center gap-3">
          {auth && (
            <span className="text-white/40 text-sm hidden sm:block">
              {auth.username}
            </span>
          )}
          <button
            onClick={() => { onLogout(); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-4 py-10 space-y-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="mono-label mb-2">Your learning hub</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {skills.length === 0
                ? "What do you want to learn?"
                : `${skills.length} skill${skills.length > 1 ? "s" : ""} in progress`}
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="lumeo-btn flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New skill
          </button>
        </div>

        {/* Stats — only shown when there are skills */}
        {skills.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: <Zap className="w-4 h-4" />,
                label: "Skills",
                value: skills.length,
              },
              {
                icon: <Flame className="w-4 h-4" />,
                label: "Total streak",
                value: totalStreak,
              },
              {
                icon: <TrendingUp className="w-4 h-4" />,
                label: "Avg. progress",
                value: `${totalProgress}%`,
              },
            ].map((stat, i) => (
              <div key={i} className="lumeo-card rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  {stat.icon}
                  <span className="text-xs text-white/40">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skill grid */}
        {skills.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill, i) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                index={i}
                onClick={() => navigate(`/skill/${skill.id}`)}
                onDelete={(e) => handleDelete(e, skill.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Add Skill Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }}
          />
          <div className="relative w-full max-w-md lumeo-card rounded-2xl p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(58% 0.22 240 / 15%)" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-white font-bold text-base">New skill roadmap</h2>
              </div>
              <button
                onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }}
                className="text-white/30 hover:text-white/70 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                placeholder="e.g. Play guitar, Learn Spanish, Master Python..."
                className="lumeo-input"
                autoFocus
                disabled={generating}
              />
            </div>

            {/* Info */}
            <div
              className="rounded-xl p-3 text-xs text-white/45 leading-relaxed"
              style={{ background: "oklch(58% 0.22 240 / 7%)", border: "1px solid oklch(58% 0.22 240 / 15%)" }}
            >
              Lumeo will generate a complete roadmap — study steps, resources, timers, and daily activities — tailored to your goal.
            </div>

            {/* Error */}
            {genError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {genError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!input.trim() || generating}
                className="lumeo-btn flex-1 flex items-center justify-center gap-2 py-2.5"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skill Card ────────────────────────────────────────────────

function SkillCard({
  skill,
  index,
  onClick,
  onDelete,
}: {
  skill: StoredSkill;
  index: number;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const progress = getProgress(skill);
  const streak = getStreak(skill.id);

  return (
    <div
      onClick={onClick}
      className="lumeo-card rounded-2xl p-5 cursor-pointer group space-y-4"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${skill.color}18` }}
          >
            {skill.emoji}
          </div>
          <div>
            <p className="mono-label text-xs" style={{ color: skill.color }}>
              {skill.label.toUpperCase()}
            </p>
            <h3 className="text-white font-semibold text-sm leading-tight mt-0.5">
              {skill.title}
              <span style={{ color: skill.color }}> {skill.titleHighlight}</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" />
              {streak}
            </div>
          )}
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/35">
            {skill.studySteps?.length ?? 0} steps total
          </span>
          <span className="mono-label text-xs" style={{ color: skill.color }}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-1 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: skill.color,
              boxShadow: `0 0 8px ${skill.color}60`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <Clock className="w-3 h-3" />
          {skill.createdAt
            ? new Date(skill.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "—"}
        </div>
        <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Open
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-5 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "oklch(58% 0.22 240 / 10%)" }}
      >
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-white font-semibold text-lg">No skills yet</h2>
        <p className="text-white/40 text-sm max-w-xs">
          Add your first skill and Lumeo will generate a complete learning roadmap for you.
        </p>
      </div>
      <button onClick={onAdd} className="lumeo-btn flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add your first skill
      </button>
    </div>
  );
}
