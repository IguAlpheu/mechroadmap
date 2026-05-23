import { useState, useEffect } from "react";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { getGlobalProgress, getActiveGoalIds } from "@/hooks/useProgressData";

const defaultGoalEmojis: Record<string, string> = {
  coding: "💻", japanese: "🇯🇵", discipline: "⚡",
  calculus: "∫", mechatronics: "🤖", flstudio: "🎵", webdev: "🌐",
};

function getGoalEmoji(id: string): string {
  if (defaultGoalEmojis[id]) return defaultGoalEmojis[id];
  try {
    const custom: Array<{ id: string; emoji: string }> =
      JSON.parse(localStorage.getItem('user-custom-goals') || '[]');
    return custom.find(g => g.id === id)?.emoji || '⭐';
  } catch { return '⭐'; }
}

export default function DailyDashboard() {
  const [todayHours, setTodayHours] = useState(0);
  const [totalStreak, setTotalStreak] = useState(0);
  const [activeGoals, setActiveGoals] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [goalIds, setGoalIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      const ids = getActiveGoalIds();
      setGoalIds(ids);

      const today = new Date().toISOString().split("T")[0];

      // Hours today
      let hours = 0;
      ids.forEach(id => {
        hours += parseFloat(localStorage.getItem(`day-hours-${id}-${today}`) || "0");
      });
      setTodayHours(Math.round(hours * 10) / 10);

      // Active goals today
      const active = ids.filter(id =>
        parseFloat(localStorage.getItem(`day-hours-${id}-${today}`) || "0") > 0
      );
      setActiveGoals(active);

      // Best streak
      const streaks = ids.map(id => parseInt(localStorage.getItem(`streak-${id}`) || "0"));
      setTotalStreak(Math.max(...streaks, 0));

      // Overall progress
      const global = getGlobalProgress();
      setOverallProgress(global.overallProgress);
    };

    update();
    window.addEventListener("progress-updated", update);
    window.addEventListener("storage", update);
    window.addEventListener("goals-updated", update);
    const interval = setInterval(update, 2000);
    return () => {
      window.removeEventListener("progress-updated", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("goals-updated", update);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={18} className="text-primary" />
        <h2 className="text-lg font-bold text-white font-display">Today's Dashboard</h2>
        <span className="mono-label text-xs ml-auto">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Stats row — 3 cards, no missions done */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <Clock size={18} className="text-primary mx-auto" />
          <p className="text-2xl font-black font-mono text-primary">{todayHours}h</p>
          <p className="text-xs text-white/40">Studied today</p>
        </div>
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <Flame size={18} className="text-orange-400 mx-auto" />
          <p className="text-2xl font-black font-mono text-orange-400">{totalStreak}</p>
          <p className="text-xs text-white/40">Best streak</p>
        </div>
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <TrendingUp size={18} className="text-emerald-400 mx-auto" />
          <p className="text-2xl font-black font-mono text-emerald-400">{overallProgress}%</p>
          <p className="text-xs text-white/40">Overall progress</p>
        </div>
      </div>

      {/* Active goals today — updates dynamically */}
      <div className="mission-card rounded-xl p-4">
        <p className="text-xs text-white/50 mb-3 font-medium">
          Goals active today · {goalIds.length} total
        </p>
        <div className="flex flex-wrap gap-2">
          {goalIds.map(id => {
            const isActive = activeGoals.includes(id);
            return (
              <span
                key={id}
                className="text-lg px-2 py-1 rounded-lg transition-all"
                style={{
                  background: isActive ? "oklch(60% 0.2 240 / 0.2)" : "oklch(100% 0 0 / 0.04)",
                  border: isActive ? "1px solid oklch(60% 0.2 240 / 0.4)" : "1px solid oklch(100% 0 0 / 0.08)",
                  filter: isActive ? "none" : "grayscale(1) opacity(0.4)",
                }}
                title={id}
              >
                {getGoalEmoji(id)}
              </span>
            );
          })}
          {goalIds.length === 0 && (
            <p className="text-xs text-white/30">No goals yet — add your first skill!</p>
          )}
          {goalIds.length > 0 && activeGoals.length === 0 && (
            <p className="text-xs text-white/30">No goals studied yet — start a timer!</p>
          )}
        </div>
      </div>
    </div>
  );
}
