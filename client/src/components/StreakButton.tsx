import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { markTodayStudied } from "./StudyHeatmap";

interface StreakButtonProps {
  objectiveId: string;
  color: string;
  onStreakComplete?: (challenge: string) => void;
}

export default function StreakButton({ objectiveId, color, onStreakComplete }: StreakButtonProps) {
  const [streak, setStreak] = useState(0);
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  const [canClick, setCanClick] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const streakKey = `streak-${objectiveId}`;
    const lastKey = `streak-lastclicked-${objectiveId}`;
    const savedStreak = localStorage.getItem(streakKey);
    const savedLast = localStorage.getItem(lastKey);

    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedLast) setLastClicked(savedLast);

    const today = new Date().toDateString();
    if (savedLast === today) setCanClick(false);
  }, [objectiveId]);

  const handleClaim = () => {
    if (!canClick) return;

    const today = new Date().toDateString();

    // Check if yesterday was claimed to maintain streak
    const lastKey = `streak-lastclicked-${objectiveId}`;
    const savedLast = localStorage.getItem(lastKey);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = savedLast === yesterday.toDateString();
    const newStreak = wasYesterday || streak === 0 ? streak + 1 : 1;

    const streakKey = `streak-${objectiveId}`;
    setStreak(newStreak);
    setLastClicked(today);
    setCanClick(false);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);

    localStorage.setItem(streakKey, newStreak.toString());
    localStorage.setItem(lastKey, today);

    // Mark today in the heatmap calendar
    markTodayStudied(objectiveId);

    const challenges = [
      "Study for 30 minutes today",
      "Complete one lesson",
      "Review yesterday's material",
      "Practice for 45 minutes",
      "Teach someone what you learned",
    ];
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    if (onStreakComplete) onStreakComplete(challenge);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={20} style={{ color }} />
          <span className="text-white font-semibold text-sm">Daily Streak</span>
        </div>
        <span className="text-2xl font-black font-mono" style={{ color }}>
          {streak}
        </span>
      </div>

      <button
        onClick={handleClaim}
        disabled={!canClick}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
          pulse ? "scale-105" : ""
        } ${!canClick ? "opacity-50 cursor-not-allowed" : ""}`}
        style={{
          background: canClick
            ? `linear-gradient(135deg, ${color}, ${color}dd)`
            : `${color}30`,
          color: canClick ? "white" : color,
          border: `1px solid ${color}60`,
          boxShadow: canClick ? `0 0 15px ${color}40` : "none",
        }}
      >
        {canClick ? "🔥 Claim Daily Streak" : "✓ Streak Claimed Today"}
      </button>

      {!canClick && (
        <p className="text-xs text-white/40 text-center">
          Come back tomorrow to continue your streak!
        </p>
      )}
      {canClick && (
        <p className="text-xs text-white/40 text-center">
          Click "Claim Daily Streak" to mark today on your calendar
        </p>
      )}
    </div>
  );
}
