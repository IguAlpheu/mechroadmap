import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { Plus, LogOut, Zap, Sparkles, X, Loader2, TrendingUp, Clock, Flame, ChevronRight, Search } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { getSkills, saveSkill, deleteSkill, getProgress, getProgressPercent, StoredSkill, getCurrentUser } from "@/lib/storage";
import { generateSkillWithAI } from "@/lib/gemini";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [, navigate] = useLocation();
  const [skills, setSkills] = useState<StoredSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user?.email) setUserEmail(user.email.split("@")[0]);
      const data = await getSkills();
      setSkills(data);
      setLoading(false);
      setTimeout(() => setVisible(true), 60);
    };
    init();
  }, []);

  const filtered = search.trim()
    ? skills.filter((s) =>
        s.label.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase())
      )
    : skills;

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setGenerating(true);
    setGenError("");
    try {
      const skill = await generateSkillWithAI(input.trim(), skills.length);
      const stored = await saveSkill(skill);
      setSkills(await getSkills());
      setInput("");
      setModalOpen(false);
      navigate(`/skill/${stored.id}`);
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "Não foi possível gerar o cronograma.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja remover este cronograma? Esta ação não pode ser desfeita.")) return;
    await deleteSkill(id);
    setSkills(await getSkills());
  };

  // Progress and Streaks
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [streakMap, setStreakMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!skills.length) return;
    const loadProgress = async () => {
      const pMap: Record<string, number> = {};
      const sMap: Record<string, number> = {};
      await Promise.all(skills.map(async (s) => {
        const p = await getProgress(s.id);
        pMap[s.id] = getProgressPercent(s, p.completedSteps);
        sMap[s.id] = p.streak;
      }));
      setProgressMap(pMap);
      setStreakMap(sMap);
    };
    loadProgress();
  }, [skills]);

  const totalStreak = Object.values(streakMap).reduce((a, b) => Math.max(a, b), 0); // Max streak across all skills
  const avgProgress = skills.length
    ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / skills.length)
    : 0;

  return (
    <div className="relative min-h-screen pb-16" style={{ background: "var(--background)" }}>
      <AuroraBackground intensity="low" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sticky top-0 backdrop-blur-md border-b border-border bg-background/55">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", boxShadow: "0 0 14px var(--primary-glow)" }}>
            <Zap className="w-4 h-4" style={{ color: "var(--primary-foreground)" }} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-base tracking-tight cursor-pointer" onClick={() => navigate("/")} style={{ color: "var(--foreground)" }}>Lumeo</span>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent text-muted-foreground border border-border">
              Olá, <span style={{ color: "var(--foreground)" }}>{userEmail}</span>
            </span>
          )}
          <ThemeToggle />
          <button onClick={() => { onLogout(); navigate("/"); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-border hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "var(--muted-foreground)" }}>
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.45s cubic-bezier(0.23,1,0.32,1), transform 0.45s cubic-bezier(0.23,1,0.32,1)" }}>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="mono-label mb-1">CENTRAL DE APRENDIZADO</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
              {loading ? "Carregando..." : skills.length === 0 ? "O que você quer dominar?" : `${skills.length} trilha${skills.length !== 1 ? "s" : ""} ativa${skills.length !== 1 ? "s" : ""}`}
            </h1>
          </div>
          <button onClick={() => setModalOpen(true)} className="lumeo-btn flex items-center gap-2 self-start sm:self-auto px-5 h-10 text-xs font-extrabold shadow-md">
            <Plus className="w-4 h-4" /> Nova Habilidade
          </button>
        </div>

        {/* Bento Stats Grid */}
        {!loading && skills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stats Card 1: Progress (Spans 2 columns on md) */}
            <div className="lumeo-card p-6 flex flex-col justify-between md:col-span-2 min-h-[140px] space-y-4">
              <div>
                <p className="mono-label text-[10px] mb-1">PROGRESSO MÉDIO DAS METAS</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4.5xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{avgProgress}%</span>
                  <span className="text-xs text-muted-foreground font-medium">concluído acumulado</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${avgProgress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">O aprendizado diário constrói maestria duradoura.</p>
              </div>
            </div>

            {/* Stats Card 2: Maximum Streak */}
            <div className="lumeo-card p-6 flex flex-col justify-between min-h-[140px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mono-label text-[10px] mb-1" style={{ color: "oklch(70% 0.19 35)" }}>OFENSIVA ATUAL</p>
                  <span className="text-4.5xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{totalStreak}</span>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-400/10 text-orange-400 animate-pulse">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium pt-3 border-t border-border">Dias seguidos de foco ativo.</p>
            </div>
          </div>
        )}

        {/* Search */}
        {skills.length > 3 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar suas habilidades..." className="lumeo-input pl-11 h-11" />
          </div>
        )}

        {/* Grid of skills */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : skills.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="lumeo-card p-12 text-center text-muted-foreground">Nenhuma habilidade coincide com "{search}"</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i}
                progress={progressMap[skill.id] ?? 0}
                streak={streakMap[skill.id] ?? 0}
                onClick={() => navigate(`/skill/${skill.id}`)}
                onDelete={(e) => handleDelete(e, skill.id)} />
            ))}
          </div>
        )}
      </main>

      {/* Command Menu Style Add Skill Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }} 
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md lumeo-card p-6 space-y-5 shadow-2xl bg-card/95 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm" style={{ color: "var(--foreground)" }}>Nova Meta de Aprendizado</h2>
                    <p className="text-[10px] text-muted-foreground">IA gerará uma trilha completa em segundos</p>
                  </div>
                </div>
                <button onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">O que você deseja aprender?</label>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                  placeholder="Ex: Tocar teclado, Programar Rust, Falar Francês..."
                  className="lumeo-input h-11" autoFocus disabled={generating} />
              </div>

              <div className="rounded-xl p-3.5 text-xs leading-relaxed border border-primary/20 bg-primary/5 text-muted-foreground">
                Dica: Seja específico! Em vez de "música", tente "tocar ukulele básico". Quanto mais específico, melhor o cronograma.
              </div>

              {genError && (
                <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">{genError}</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setModalOpen(false); setGenError(""); setInput(""); }}
                  className="lumeo-btn-ghost flex-1 py-2.5 text-xs font-bold">Cancelar</button>
                <button onClick={handleGenerate} disabled={!input.trim() || generating}
                  className="lumeo-btn flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold">
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" />Criar Trilha</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillCard({ skill, index, progress, streak, onClick, onDelete }: {
  skill: StoredSkill; index: number; progress: number; streak: number;
  onClick: () => void; onDelete: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick} 
      className="lumeo-card p-5 cursor-pointer group space-y-4 relative"
      style={{
        boxShadow: hovered 
          ? `0 15px 35px -10px ${skill.color}25, inset 0 1px 1px rgba(255,255,255,0.06)` 
          : "0 4px 15px -8px rgba(0,0,0,0.1)",
        borderColor: hovered ? skill.color : "var(--border)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{ background: `${skill.color}15`, border: `1px solid ${skill.color}25` }}>{skill.emoji}</div>
          <div>
            <p className="mono-label text-[9px] font-bold" style={{ color: skill.color }}>{skill.label.toUpperCase()}</p>
            <h3 className="font-extrabold text-sm leading-tight mt-0.5" style={{ color: "var(--foreground)" }}>
              {skill.title}<span style={{ color: skill.color }}> {skill.titleHighlight}</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
              <Flame className="w-3 h-3 fill-current" />{streak}d
            </div>
          )}
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:text-red-400 hover:bg-red-500/10"
            style={{ color: "var(--muted-foreground)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span style={{ color: "var(--muted-foreground)" }}>{skill.studySteps?.length ?? 0} lições</span>
          <span className="mono-label text-[10px] font-bold" style={{ color: skill.color }}>{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: skill.color, boxShadow: `0 0 10px ${skill.color}40` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/20">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ opacity: 0.7 }}>
          <Clock className="w-3.5 h-3.5" />
          <span>{skill.createdAt ? new Date(skill.createdAt).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }) : "—"}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0"
          style={{ color: skill.color }}>
          Estudar <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="lumeo-card p-10 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto mt-12 bg-card/30">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary animate-bounce">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="space-y-2">
        <h2 className="font-extrabold text-lg" style={{ color: "var(--foreground)" }}>Nenhum cronograma ainda</h2>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          O Lumeo gera um plano de estudos personalizado para qualquer habilidade. Escolha um objetivo e comece agora.
        </p>
      </div>
      <button onClick={onAdd} className="lumeo-btn flex items-center gap-2 text-xs font-extrabold h-10 px-6">
        <Plus className="w-4 h-4" /> Criar minha primeira trilha
      </button>
    </div>
  );
}

