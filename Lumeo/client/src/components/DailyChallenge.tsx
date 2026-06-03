import { useState, useEffect } from "react";
import { Target, CheckCircle2 } from "lucide-react";

interface DailyChallengeProps {
  objectiveId: string;
  color: string;
  challenge: string;
}

export default function DailyChallenge({ objectiveId, color, challenge }: DailyChallengeProps) {
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(challenge);

  useEffect(() => {
    const today = new Date().toDateString();
    const key = `challenge-completed-${objectiveId}-${today}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCompletedChallenges(JSON.parse(saved));
      } catch {
        setCompletedChallenges([]);
      }
    }
  }, [objectiveId]);

  useEffect(() => {
    if (challenge) setCurrentChallenge(challenge);
  }, [challenge]);

  const handleComplete = () => {
    if (!currentChallenge) return;
    const today = new Date().toDateString();
    const key = `challenge-completed-${objectiveId}-${today}`;
    const updated = [...completedChallenges, currentChallenge];
    setCompletedChallenges(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setCurrentChallenge("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target size={20} style={{ color }} />
        <span className="text-white font-semibold text-sm">Daily Challenge</span>
      </div>

      {currentChallenge ? (
        <div
          className="rounded-xl p-3 space-y-3"
          style={{ background: `${color}10`, border: `1px solid ${color}30` }}
        >
          <p className="text-sm text-white/80">{currentChallenge}</p>
          <button
            onClick={handleComplete}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-all text-white"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: `0 0 10px ${color}40`,
            }}
          >
            Mark Complete ✓
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-3 text-center" style={{ background: `${color}08` }}>
          <p className="text-xs text-white/40">
            {completedChallenges.length > 0
              ? `${completedChallenges.length} challenge${completedChallenges.length > 1 ? "s" : ""} completed today!`
              : "Claim your daily streak to unlock today's challenge"}
          </p>
        </div>
      )}

      {completedChallenges.length > 0 && (
        <div className="space-y-1">
          {completedChallenges.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/40">
              <CheckCircle2 size={12} style={{ color }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
