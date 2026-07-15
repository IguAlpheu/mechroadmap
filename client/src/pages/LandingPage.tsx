import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowRight, Zap, CheckCircle2, BookOpen, BarChart2, Clock, Flame, Sparkles, Smartphone, Play, Circle, ChevronRight } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["guitarra", "programação", "inglês", "xadrez", "design", "finanças", "falar em público", "fotografia"];

export default function LandingPage({ authed }: { authed: boolean }) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Interactive Sandbox Demo State
  const [demoSteps, setDemoSteps] = useState([
    { id: 0, label: "Postura e Acordes Abertos (C, G, D)", done: true, duration: "1h" },
    { id: 1, label: "Batidas básicas e ritmo", done: true, duration: "2h" },
    { id: 2, label: "Transição rápida entre acordes", done: false, duration: "1.5h" },
    { id: 3, label: "Sua primeira música completa", done: false, duration: "3h" },
  ]);
  const [demoStreak, setDemoStreak] = useState(4);
  const [demoTimerSeconds, setDemoTimerSeconds] = useState(25 * 60);
  const [demoTimerActive, setDemoTimerActive] = useState(false);

  useEffect(() => {
    if (authed) navigate("/dashboard");
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [authed, navigate]);

  useEffect(() => {
    const iv = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setFading(false);
      }, 250);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  // Demo timer countdown
  useEffect(() => {
    let tInterval: ReturnType<typeof setInterval>;
    if (demoTimerActive) {
      tInterval = setInterval(() => {
        setDemoTimerSeconds((s) => (s > 0 ? s - 1 : 25 * 60));
      }, 1000);
    }
    return () => clearInterval(tInterval);
  }, [demoTimerActive]);

  const toggleDemoStep = (id: number) => {
    setDemoSteps((steps) =>
      steps.map((s) => {
        if (s.id === id) {
          const nextDone = !s.done;
          if (nextDone && steps.filter((step) => step.id !== id && step.done).length === steps.length - 1) {
            setDemoStreak((st) => st + 1);
          } else if (!nextDone && steps.filter((step) => step.done).length === steps.length) {
            setDemoStreak((st) => Math.max(4, st - 1));
          }
          return { ...s, done: nextDone };
        }
        return s;
      })
    );
  };

  const doneCount = demoSteps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / demoSteps.length) * 100);

  const start = () => {
    const val = input.trim();
    navigate(val ? `/login?skill=${encodeURIComponent(val)}` : "/login");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--background)" }}>
      <AuroraBackground intensity="medium" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto backdrop-blur-xs">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:rotate-12 duration-300"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", boxShadow: "0 0 20px var(--primary-glow)" }}>
            <Zap className="w-4.5 h-4.5" style={{ color: "var(--primary-foreground)" }} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ color: "var(--foreground)" }}>Lumeo</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <ThemeToggle />
          <button onClick={() => navigate("/login")}
            className="lumeo-btn-ghost px-5 py-2 text-xs font-semibold">
            Entrar
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-16 items-center min-h-[85vh]">
        
        {/* Left: Text & Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 space-y-8 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase"
            style={{ border: "1px solid oklch(from var(--primary) l c h / 20%)", background: "oklch(from var(--primary) l c h / 6%)", color: "var(--primary)" }}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            CRONOGRAMAS DE ESTUDO COM IA
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black leading-[1.08] tracking-tight" style={{ color: "var(--foreground)" }}>
            Domine qualquer <br />
            <span className="gradient-text-gold inline-block min-w-[260px] relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block"
                >
                  {WORDS[wordIdx]}.
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            <span className="shimmer-text">Construa o hábito.</span>
          </h1>

          <p className="text-base sm:text-lg max-w-xl leading-relaxed font-normal text-muted-foreground" style={{ color: "var(--muted-foreground)" }}>
            Digite qualquer objetivo. O Lumeo gera instantaneamente um plano de estudos passo a passo estruturado por IA, com recursos selecionados, temporizadores integrados e progresso dinâmico.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg w-full">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              placeholder="Ex: Tocar piano, Programar em Rust..."
              className="lumeo-input flex-1 text-base h-12" />
            <button onClick={start} className="lumeo-btn h-12 gap-2 text-sm font-bold group relative overflow-hidden px-6">
              Começar Grátis 
              <motion.div
                className="inline-block"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </button>
          </div>

          <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
            Experimente grátis · Sem cartão de crédito · Funciona no celular e computador
          </p>
        </motion.div>

        {/* Right: Interactive Sandbox Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5 relative"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-2xl -z-10 transform translate-x-4 translate-y-4" />
          
          {/* Double-Bezel Card Outer */}
          <div className="lumeo-card p-6 space-y-6 bg-card/45 backdrop-blur-md">
            
            {/* Interactive Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-primary/10">🎸</span>
                <div>
                  <span className="mono-label text-[10px]" style={{ color: "var(--primary)" }}>DEMO INTERATIVA</span>
                  <h3 className="font-bold text-base mt-0.5" style={{ color: "var(--foreground)" }}>
                    Aprender Guitarra
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{demoStreak} Dias</span>
              </div>
            </div>

            {/* Steps Sandbox */}
            <div className="space-y-2.5">
              {demoSteps.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => toggleDemoStep(s.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/25 cursor-pointer transition-all hover:bg-background/70 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {s.done ? (
                        <CheckCircle2 className="w-5 h-5 text-primary fill-primary/15" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <span 
                      className="text-xs sm:text-sm transition-all"
                      style={{ 
                        color: s.done ? "var(--muted-foreground)" : "var(--foreground)", 
                        textDecoration: s.done ? "line-through" : "none",
                        opacity: s.done ? 0.6 : 1
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">{s.duration}</span>
                </div>
              ))}
            </div>

            {/* Bottom Status bar */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border">
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); setDemoTimerActive(!demoTimerActive); }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${demoTimerActive ? "bg-red-500/15 text-red-400 border border-red-500/35" : "bg-primary/15 text-primary border border-primary/30"}`}
                >
                  <Play className={`w-3.5 h-3.5 ${demoTimerActive ? "animate-pulse fill-current" : "fill-current"}`} />
                </button>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">Foco diário</p>
                  <p className="text-sm font-bold font-mono tracking-tight" style={{ color: "var(--foreground)" }}>
                    {formatTime(demoTimerSeconds)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-mono">Progresso</p>
                  <p className="text-xs font-bold" style={{ color: "var(--primary)" }}>{progressPct}% concluído</p>
                </div>
                <div className="relative w-16 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* How it Works / Bento Features Grid */}
      <section className="relative z-10 py-24 px-6 border-t border-border/40 bg-background/35">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="mono-label">O ecossistema Lumeo</span>
            <h2 className="text-3.5xl sm:text-4.5xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
              Tudo o que você precisa para evoluir
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Elimine o caos do planejamento e foque apenas na execução. Nossa plataforma integra inteligência e hábito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: AI Cronogramas */}
            <div className="lumeo-card p-7 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">FUNCIONALIDADE 01</span>
              </div>
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Cronogramas gerados instantaneamente por IA</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Nossos algoritmos decompõem qualquer habilidade em etapas organizadas e progressivas. Cada passo vem com sugestões de recursos de qualidade (vídeos, tutoriais e artigos) para você não perder tempo pesquisando.
                </p>
              </div>
              {/* Flowchart Mockup */}
              <div className="pt-4 flex items-center justify-around gap-2 max-w-md mx-auto">
                <span className="text-xs bg-muted border border-border px-3 py-1.5 rounded-full font-bold">Ideia</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs bg-primary/15 border border-primary/30 text-primary px-3 py-1.5 rounded-full font-bold">IA Lumeo</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs bg-muted border border-border px-3 py-1.5 rounded-full font-bold">Estrutura Ativa</span>
              </div>
            </div>

            {/* Bento 2: Streak Gamification */}
            <div className="lumeo-card p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-orange-400/10 text-orange-400">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">ESTATÍSTICA</span>
              </div>
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Fidelidade e Ofensiva</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Nosso sistema de ofensiva recompensa sua consistência diária. Cada dia de estudo concluído consolida seu aprendizado.
                </p>
              </div>
            </div>

            {/* Bento 3: Pomodoro Focus */}
            <div className="lumeo-card p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">FOCO</span>
              </div>
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Foco Sem Distrações</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Use o timer Pomodoro integrado em cada trilha. Registre suas horas líquidas de estudo diretamente em seus históricos.
                </p>
              </div>
            </div>

            {/* Bento 4: PWA Offline */}
            <div className="lumeo-card p-7 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">INSTALAÇÃO</span>
              </div>
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Funciona em Qualquer Lugar — Mesmo Offline</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Adicione o Lumeo na tela inicial do seu celular ou desktop como PWA. Tenha acesso rápido aos seus cronogramas e registre seus estudos mesmo quando estiver totalmente sem internet.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-28 px-6 text-center border-t border-border/40 bg-gradient-to-b from-transparent to-primary/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="text-3.5xl sm:text-5xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            Pronto para dominar uma nova habilidade?
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Junte-se a milhares de estudantes que pararam de colecionar cursos e começaram a construir hábitos reais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/login")} className="lumeo-btn h-12 gap-2 text-sm font-bold px-8">
              Criar meu Cronograma <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/login")} className="lumeo-btn-ghost h-12 text-sm font-bold px-6">
              Ver Demonstração
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6 text-center border-t border-border/40">
        <p className="text-xs text-muted-foreground opacity-60">
          © {new Date().getFullYear()} Lumeo. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

