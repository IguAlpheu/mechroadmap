import { useState, useEffect } from "react";
import { Flame, Target, CheckCircle2, ChevronUp } from "lucide-react";
import { getDailyChallenge, calculateLevel, ChallengeLevel } from "@/data/challenges";
import { getGoalProgress } from "@/hooks/useProgressData";

interface DailyMissionProps {
  goalId: string;
  color: string;
}

const levelLabels: Record<ChallengeLevel, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const levelColors: Record<ChallengeLevel, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export default function DailyMission({ goalId, color }: DailyMissionProps) {
  const [streak, setStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [level, setLevel] = useState<ChallengeLevel>('beginner');
  const [challenge, setChallenge] = useState("");

  const today = new Date().toDateString();
  const streakKey = `streak-${goalId}`;
  const lastKey = `streak-last-${goalId}`;
  const completedKey = `mission-completed-${goalId}-${today}`;
  const ratingsKey = `session-ratings-${goalId}`;

  useEffect(() => {
    // Load streak
    const savedStreak = parseInt(localStorage.getItem(streakKey) || "0");
    const savedLast = localStorage.getItem(lastKey);
    setStreak(savedStreak);
    setCanClaim(savedLast !== today);
    setCompleted(localStorage.getItem(completedKey) === "true");

    // Calculate level
    const progress = getGoalProgress(goalId);
    const ratings = JSON.parse(localStorage.getItem(ratingsKey) || "[]");

    // Get total timer hours for this goal
    let timerHours = 0;
    for (let i = 1; i <= 8; i++) {
      const t = parseInt(localStorage.getItem(`step-timer-${goalId}-step-${i}`) || "0");
      timerHours += t / 3600;
    }
    // Also count day-based hours
    const dayHoursTotal = Object.keys(localStorage)
      .filter(k => k.startsWith(`day-hours-${goalId}-`))
      .reduce((sum, k) => sum + parseFloat(localStorage.getItem(k) || "0"), 0);

    const calculatedLevel = calculateLevel(
      goalId,
      Math.max(timerHours, dayHoursTotal),
      progress.completedSteps,
      progress.totalSteps,
      ratings
    );
    setLevel(calculatedLevel);
    setChallenge(getDailyChallenge(goalId, calculatedLevel));
  }, [goalId]);

  const handleClaim = () => {
    if (!canClaim) return;

    const savedLast = localStorage.getItem(lastKey);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = savedLast === yesterday.toDateString();
    const newStreak = wasYesterday || streak === 0 ? streak + 1 : 1;

    setStreak(newStreak);
    setCanClaim(false);
    setCompleted(true);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    localStorage.setItem(streakKey, newStreak.toString());
    localStorage.setItem(lastKey, today);
    localStorage.setItem(completedKey, "true");

    // Mark on heatmap
    const dateStr = new Date().toISOString().split("T")[0];
    const dayKey = `day-hours-${goalId}-${dateStr}`;
    const existing = parseFloat(localStorage.getItem(dayKey) || "0");
    if (existing === 0) localStorage.setItem(dayKey, "0.5");

    window.dispatchEvent(new Event("progress-updated"));
  };

  return (
    <div className="mission-card rounded-xl p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={18} style={{ color }} />
          <span className="text-white font-semibold text-sm">Daily Mission</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Level badge */}
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${levelColors[level]}20`,
              color: levelColors[level],
              border: `1px solid ${levelColors[level]}40`,
            }}
          >
            {levelLabels[level]}
          </span>
          {/* Streak */}
          <div className="flex items-center gap-1">
            <Flame size={16} style={{ color }} />
            <span className="text-lg font-black font-mono" style={{ color }}>{streak}</span>
          </div>
        </div>
      </div>

      {/* Challenge */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: `${color}10`, border: `1px solid ${color}25` }}
      >
        <p className="text-sm text-white/80 leading-relaxed">{challenge}</p>

        {!completed ? (
          <button
            onClick={handleClaim}
            disabled={!canClaim}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${pulse ? "scale-105" : ""}`}
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: "white",
              boxShadow: `0 0 12px ${color}40`,
            }}
          >
            🔥 Concluir Missão de Hoje
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2">
            <CheckCircle2 size={16} style={{ color }} />
            <span className="text-sm font-semibold" style={{ color }}>
              Missão concluída hoje!
            </span>
          </div>
        )}
      </div>

      {/* Progress to next level */}
      <LevelProgress goalId={goalId} level={level} color={color} />
    </div>
  );
}

function LevelProgress({ goalId, level, color }: { goalId: string; level: ChallengeLevel; color: string }) {
  const progress = getGoalProgress(goalId);
  const stepRatio = progress.totalSteps > 0
    ? (progress.completedSteps / progress.totalSteps) * 100
    : 0;

  if (level === 'advanced') {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40">
        <ChevronUp size={12} />
        <span>Nível máximo atingido</span>
      </div>
    );
  }

  const nextLevel = level === 'beginner' ? 'Intermediário' : 'Avançado';
  const threshold = level === 'beginner' ? 30 : 70;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/40">
        <span>Progresso para {nextLevel}</span>
        <span>{Math.round(stepRatio)}% / {threshold}%</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((stepRatio / threshold) * 100, 100)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
