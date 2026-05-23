// ============================================================
// ADD SKILL MODAL — Caixa de mensagem para adicionar habilidade via IA
// ============================================================
import { useState } from "react";
import { generateSkillWithAI, AIGeneratedSkill } from "@/lib/gemini";
import { Sparkles, X, Loader2 } from "lucide-react";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (skill: AIGeneratedSkill) => void;
  currentGoalCount: number;
}

export default function AddSkillModal({ isOpen, onClose, onAdd, currentGoalCount }: AddSkillModalProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const skill = await generateSkillWithAI(input.trim(), currentGoalCount);
      onAdd(skill);
      setInput("");
      onClose();
    } catch (e) {
      setError("Erro ao gerar habilidade. Verifique sua API key no arquivo .env e tente novamente.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleGenerate();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mission-card rounded-2xl p-6 space-y-5 shadow-2xl border border-primary/30">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Add New Skill</h2>
              
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs text-white/50 font-medium font-mono uppercase tracking-wider">
            What skill or habit do you want to learn?
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Play guitar, Learn Spanish, Morning meditation..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            autoFocus
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Info */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
          <p className="text-xs text-white/50 leading-relaxed">
            💡 A complete roadmap will be generated including <strong className="text-white/70">study steps</strong>, <strong className="text-white/70">timers</strong>, <strong className="text-white/70">resources</strong>, and <strong className="text-white/70">activities</strong> — all tailored to your goal.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || loading}
            className="flex-1 py-2.5 rounded-xl bg-primary/80 hover:bg-primary text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Roadmap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
