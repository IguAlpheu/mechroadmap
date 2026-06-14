import { useState, useEffect, useRef } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import {
  ArrowLeft,
  Download,
  Trash2,
  User,
  Loader2,
  ShieldCheck,
  Flame,
  Zap,
  Share2,
  Check,
  Bell,
  BellOff,
  Copy,
} from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import {
  getCurrentUser,
  getSkills,
  deleteAccount,
  exportUserData,
  getProgress,
} from "@/lib/storage";
import { supabase } from "@/lib/supabase";

interface AccountUser {
  email?: string;
  created_at?: string;
  id?: string;
}

interface HeatCell {
  date: string;
  active: boolean;
}

/* ─── Mini Heatmap (4 weeks × 7 days) ─── */
function MiniHeatmap({ color }: { color: string }) {
  const cells: HeatCell[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // aggregate across all skills
    let totalHours = 0;
    try {
      for (let k = 0; k < localStorage.length; k++) {
        const key = localStorage.key(k) ?? "";
        if (key.startsWith(`day-hours-`) && key.endsWith(`-${dateStr}`)) {
          totalHours += parseFloat(localStorage.getItem(key) || "0");
        }
      }
    } catch (_) {}
    cells.push({ date: dateStr, active: totalHours > 0 });
  }

  // group into 4 columns of 7
  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((cell, di) => (
            <div
              key={`${wi}-${di}`}
              title={cell.date}
              className="w-3.5 h-3.5 rounded-sm transition-all"
              style={{
                background: cell.active
                  ? `oklch(from ${color} l c h / 0.85)`
                  : "var(--border)",
                boxShadow: cell.active
                  ? `0 0 4px oklch(from ${color} l c h / 0.4)`
                  : "none",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AccountPage() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [skillCount, setSkillCount] = useState(0);
  const [totalStreak, setTotalStreak] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [loadingExport, setLoadingExport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifGranted, setNotifGranted] = useState<NotificationPermission>("default");
  const cardRef = useRef<HTMLDivElement>(null);

  // Primary skill color (from first skill, fallback to primary)
  const [themeColor, setThemeColor] = useState("oklch(76% 0.16 82)");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    document.title = "Minha Conta — Lumeo";

    if ("Notification" in window) {
      setNotifGranted(Notification.permission);
    }

    async function load() {
      const u = await getCurrentUser();
      if (!u) { navigate("/login"); return; }

      const sbUser = supabase ? (await supabase.auth.getUser()).data.user : null;
      setUser({
        email: sbUser?.email ?? u.email ?? "—",
        created_at: sbUser?.created_at ?? u.created_at ?? undefined,
        id: sbUser?.id ?? u.id,
      });

      const skills = await getSkills();
      setSkillCount(skills.length);

      if (skills[0]?.color) setThemeColor(skills[0].color);

      // Aggregate streak across all skills
      let streak = 0;
      for (const s of skills) {
        const p = await getProgress(s.id);
        streak += p.streak ?? 0;
      }
      setTotalStreak(streak);

      // Count active days (from localStorage day-hours keys)
      const activeDaysSet = new Set<string>();
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) ?? "";
          if (key.startsWith("day-hours-")) {
            const parts = key.split("-");
            const dateStr = parts.slice(-3).join("-");
            const val = parseFloat(localStorage.getItem(key) || "0");
            if (val > 0) activeDaysSet.add(dateStr);
          }
        }
      } catch (_) {}
      setActiveDays(activeDaysSet.size);
    }
    load();
    return () => clearTimeout(t);
  }, [navigate]);

  async function handleExport() {
    setLoadingExport(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lumeo-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingExport(false);
    }
  }

  async function handleDelete() {
    if (deleteInput !== "CONFIRMAR") return;
    setLoadingDelete(true);
    setDeleteError("");
    try {
      await deleteAccount();
      navigate("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Something went wrong.");
      setLoadingDelete(false);
    }
  }

  async function handleShareProfile() {
    const name = user?.email?.split("@")[0] ?? "estudante";
    const text =
      `🎓 Meu perfil no Lumeo:\n` +
      `👤 ${name}\n` +
      `📚 ${skillCount} habilidade${skillCount !== 1 ? "s" : ""} em progresso\n` +
      `🔥 ${totalStreak} dias de streak acumulados\n` +
      `📅 ${activeDays} dias ativos de estudo\n\n` +
      `Crie seus roadmaps personalizados em lumeo.app`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      alert(text);
    }
  }

  async function handleNotifToggle() {
    if (!("Notification" in window)) {
      alert("Seu navegador não suporta notificações.");
      return;
    }
    if (notifGranted === "granted") {
      // Can't revoke programmatically — guide user
      alert(
        "Para desativar, acesse as configurações do navegador → Notificações → Lumeo → Bloquear."
      );
      return;
    }
    const result = await Notification.requestPermission();
    setNotifGranted(result);
    if (result === "granted") {
      // Schedule a test notification
      setTimeout(() => {
        new Notification("Lumeo 🔥", {
          body: "Notificações de streak ativadas! Te veremos amanhã.",
          icon: "/pwa-192x192.png",
        });
        // Store preference
        localStorage.setItem("lumeo_notif_enabled", "true");
      }, 800);
    }
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <AuroraBackground intensity="low" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="max-w-xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <span className="text-sm font-semibold text-foreground/80">Minha Conta</span>
        </div>
      </header>

      {/* Content */}
      <main
        className="relative z-10 flex-1 flex items-start justify-center px-6 py-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        <div className="w-full max-w-xl space-y-5">

          {/* ── Premium Profile Card ── */}
          <div
            ref={cardRef}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: `0 0 60px oklch(from ${themeColor} l c h / 0.12)`,
            }}
          >
            {/* Glow backdrop */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% -10%, oklch(from ${themeColor} l c h / 0.12) 0%, transparent 70%)`,
              }}
            />

            <div className="relative p-6 space-y-5">
              {/* Top row: avatar + info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `oklch(from ${themeColor} l c h / 0.15)`,
                      border: `1.5px solid oklch(from ${themeColor} l c h / 0.3)`,
                      boxShadow: `0 0 20px oklch(from ${themeColor} l c h / 0.2)`,
                    }}
                  >
                    <User className="w-6 h-6" style={{ color: themeColor }} />
                    {totalStreak > 0 && (
                      <div
                        className="absolute -bottom-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                        style={{
                          background: "linear-gradient(135deg, #f97316, #ea580c)",
                          boxShadow: "0 0 12px rgba(249,115,22,0.5)",
                          color: "white",
                        }}
                      >
                        🔥
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground/90 text-base leading-tight truncate max-w-[200px]">
                      {user?.email?.split("@")[0] ?? "—"}
                    </p>
                    <p className="text-xs text-foreground/40 mt-0.5 truncate max-w-[200px]">
                      {user?.email ?? "—"}
                    </p>
                    <p className="text-[10px] text-foreground/30 mt-1">
                      Conta criada em {formatDate(user?.created_at)}
                    </p>
                  </div>
                </div>

                {/* Share button */}
                <button
                  onClick={handleShareProfile}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: `oklch(from ${themeColor} l c h / 0.12)`,
                    border: `1px solid oklch(from ${themeColor} l c h / 0.25)`,
                    color: themeColor,
                  }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado!" : "Compartilhar"}
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  icon={<Zap className="w-3.5 h-3.5" />}
                  label="Habilidades"
                  value={String(skillCount)}
                  color={themeColor}
                />
                <StatPill
                  icon={<Flame className="w-3.5 h-3.5" />}
                  label="Streak total"
                  value={`${totalStreak}d`}
                  color="#f97316"
                />
                <StatPill
                  icon={<Share2 className="w-3.5 h-3.5" />}
                  label="Dias ativos"
                  value={String(activeDays)}
                  color={themeColor}
                />
              </div>

              {/* Mini Heatmap */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">
                  Atividade — últimas 4 semanas
                </p>
                <MiniHeatmap color={themeColor} />
              </div>
            </div>
          </div>

          {/* ── Daily Notifications ── */}
          <div className="lumeo-card rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {notifGranted === "granted" ? (
                <Bell className="w-4 h-4 text-primary flex-shrink-0" />
              ) : (
                <BellOff className="w-4 h-4 text-foreground/30 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground/80">
                  Lembretes diários
                </p>
                <p className="text-xs text-foreground/40 mt-0.5">
                  {notifGranted === "granted"
                    ? "Ativado — você receberá lembretes para manter seu streak."
                    : "Receba uma notificação diária para manter sua consistência."}
                </p>
              </div>
            </div>
            <button
              onClick={handleNotifToggle}
              className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={
                notifGranted === "granted"
                  ? {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }
                  : {
                      background: "var(--muted)",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              {notifGranted === "granted" ? "Ativado ✓" : "Ativar"}
            </button>
          </div>

          {/* ── Privacy & Data ── */}
          <div className="lumeo-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground/90">Privacidade e Dados</h2>
            </div>

            <p className="text-xs text-foreground/40 leading-relaxed">
              De acordo com a LGPD (Lei 13.709/2018), você tem direito de exportar e excluir seus
              dados a qualquer momento.{" "}
              <a href="#/privacy" className="text-primary hover:underline">
                Saiba mais
              </a>
              .
            </p>

            {/* Export */}
            <div className="flex items-start justify-between gap-4 pt-2">
              <div>
                <p className="text-sm font-medium text-foreground/80">Exportar meus dados</p>
                <p className="text-xs text-foreground/40 mt-0.5">
                  Baixe todas suas habilidades e progresso em formato JSON.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={loadingExport}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] transition-colors disabled:opacity-50"
              >
                {loadingExport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Exportar
              </button>
            </div>

            {/* Delete */}
            <div className="border-t border-white/[0.06] pt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-red-400">Excluir minha conta</p>
                <p className="text-xs text-foreground/40 mt-0.5">
                  Remove permanentemente todos os seus dados. Essa ação é irreversível.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteInput("");
                  setDeleteError("");
                }}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          </div>

          {/* Legal links */}
          <div className="flex gap-4 justify-center text-xs text-foreground/30">
            <a href="#/terms" className="hover:text-foreground/60 transition-colors">
              Termos de Uso
            </a>
            <span>·</span>
            <a href="#/privacy" className="hover:text-foreground/60 transition-colors">
              Política de Privacidade
            </a>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm lumeo-card rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-400">
                Excluir conta permanentemente
              </h3>
              <p className="text-xs text-foreground/50 leading-relaxed">
                Esta ação é <strong className="text-foreground/70">irreversível</strong>. Todas as
                suas habilidades, progresso e histórico de estudos serão removidos
                permanentemente.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-foreground/40">
                Digite <strong className="text-foreground/70">CONFIRMAR</strong> para continuar:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="CONFIRMAR"
                className="lumeo-input"
                autoFocus
                disabled={loadingDelete}
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loadingDelete}
                className="flex-1 px-4 py-2 text-sm rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-foreground/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput !== "CONFIRMAR" || loadingDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingDelete ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Excluir conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */
function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl px-3 py-3 space-y-1.5"
      style={{
        background: "var(--muted)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
          {label}
        </span>
      </div>
      <p className="text-xl font-black text-foreground/90 leading-none">{value}</p>
    </div>
  );
}
