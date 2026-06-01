import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { Plus, LogOut, Zap, Sparkles, X, Loader2, TrendingUp, Clock, Flame, ChevronRight, Search } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import { getSkills, saveSkill, deleteSkill, getProgress, getStreak, StoredSkill, getAuth } from "@/lib/storage";
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
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    setSkills(getSkills());
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filtered = search.trim()
    ? skills.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase()))
    : skills;

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
      setGenError(e instanceof Error ? e.message : "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Remove this skill roadmap? This cannot be undone.")) return;
    deleteSkill(id);
    setSkills(getSkills());
  };

  const totalStreak = skills.reduce((sum, s) => sum + getStreak(s.id), 0);
  const avgProgress = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + getProgress(s), 0) / skills.length)
    : 0;

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackground intensity="low" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-background/70 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, oklch(60% 0.22 240), oklch(50% 0.24 240))", boxShadow: "0 0 14px oklch(58% 0.22 240 / 35%)" }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Lumeo</span>
        </div>
        <div className="flex items-center gap-3">
          {auth && <span className="text-white/35 text-sm hidden sm:block">{auth.username}</span>}
          <button onClick={() => { onLogout(); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-10 space-y-8"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.45s cubic-bezier(0.23,1,0.32,1), transform 0.45s cubic-bezier(0.23,1,0.32,1)" }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="mono-label mb-1.5">Your learning hub</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {skills.length === 0 ? "What do you want to learn?" : `${skills.length} skill${skills.length !== 1 ? "s" : ""} tracked`}
            </h1>
          </div>
          <button onClick={() => setModalOpen(true)} className="lumeo-btn flex items-center gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            New skill
          </button>
        </div>

        {/* Stats */}
        {skills.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: <Zap className="w-4 h-4" />, label: "Skills", value: skills.length },
              { icon: <Flame className="w-4 h-4" />, label: "Streak days", value: totalStreak },
              { icon: <TrendingUp className="w-4 h-4" />, label: "Avg progress", value: `${avgProgress}%` },
            ].map((s, i) => (
              <div key={i} className="lumeo-card rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">{s.icon}<span className="text-xs text-white/35">{s.label}</span></div>
                <p className="text-2xl font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        {skills.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your skills..."
              className="lumeo-input pl-10"
            />
          </div>
        )}

        {/* Grid */}
        {skills.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-12">No skills match "{search}"</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i}
                onClick={() => navigate(`/skill/${skill.id}`)}
                onDelete={(e) => handleDelete(e, skill.id)} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }} />
          <div className="relative w-full max-w-md lumeo-card rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(58% 0.22 240 / 12%)" }}>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-white font-bold">Add a skill</h2>
              </div>
              <button onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }} className="text-white/30 hover:text-white/70 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium">What do you want to learn?</label>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                placeholder="e.g. Play piano, Learn Rust, Speak French..."
                className="lumeo-input" autoFocus disabled={generating} />
            </div>

            <div className="rounded-xl p-3 text-xs text-white/40 leading-relaxed"
              style={{ background: "oklch(58% 0.22 240 / 6%)", border: "1px solid oklch(58% 0.22 240 / 12%)" }}>
              Lumeo generates a complete roadmap — steps, resources, timers, and phases — tailored to your goal.
            </div>

            {genError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{genError}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/45 hover:text-white/70 hover:bg-white/5 text-sm font-medium transition-all">
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={!input.trim() || generating}
                className="lumeo-btn flex-1 flex items-center justify-center gap-2 py-2.5">
                {generating ? (<><Loader2 className="w-4 h-4 animate-spin" />Generating...</>) : (<><Sparkles className="w-4 h-4" />Generate</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillCard({ skill, index, onClick, onDelete }: { skill: StoredSkill; index: number; onClick: () => void; onDelete: (e: React.MouseEvent) => void; }) {
  const progress = getProgress(skill);
  const streak = getStreak(skill.id);

  return (
    <div onClick={onClick}
      className="lumeo-card rounded-2xl p-5 cursor-pointer group space-y-4"
      style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${skill.color}15` }}>
            {skill.emoji}
          </div>
          <div>
            <p className="mono-label text-[10px]" style={{ color: skill.color }}>{skill.label.toUpperCase()}</p>
            <h3 className="text-white font-semibold text-sm leading-tight mt-0.5">
              {skill.title}<span style={{ color: skill.color }}> {skill.titleHighlight}</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" />{streak}
            </div>
          )}
          <button onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/30">{skill.studySteps?.length ?? 0} steps</span>
          <span className="mono-label text-[10px]" style={{ color: skill.color }}>{progress}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: skill.color, boxShadow: `0 0 6px ${skill.color}50` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-white/25">
          <Clock className="w-3 h-3" />
          {skill.createdAt ? new Date(skill.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
        </div>
        <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          Open <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "oklch(58% 0.22 240 / 10%)" }}>
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-white font-semibold">No skills yet</h2>
        <p className="text-white/35 text-sm max-w-xs">Add your first skill and get a complete, personalized learning roadmap.</p>
      </div>
      <button onClick={onAdd} className="lumeo-btn flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add your first skill
      </button>
    </div>
  );
}
