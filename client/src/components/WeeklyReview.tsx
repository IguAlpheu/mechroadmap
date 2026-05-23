import { useState, useEffect } from "react";
import { BarChart2, Flame, Target, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { getActiveGoalIds } from "@/hooks/useProgressData";

const defaultGoalLabels: Record<string, string> = {
  coding: "💻 Coding", japanese: "🇯🇵 Japanese", discipline: "⚡ Discipline",
  calculus: "∫ Calculus", mechatronics: "🤖 Mechatronics", flstudio: "🎵 FL Studio", webdev: "🌐 Web Dev",
};
const defaultGoalColors: Record<string, string> = {
  coding: "#3b82f6", japanese: "#ec4899", discipline: "#f59e0b",
  calculus: "#10b981", mechatronics: "#8b5cf6", flstudio: "#ec4899", webdev: "#3b82f6",
};

function getGoalLabel(id: string): string {
  if (defaultGoalLabels[id]) return defaultGoalLabels[id];
  try {
    const custom: Array<{ id: string; emoji: string; label: string }> =
      JSON.parse(localStorage.getItem("user-custom-goals") || "[]");
    const g = custom.find(g => g.id === id);
    return g ? `${g.emoji} ${g.label}` : id;
  } catch { return id; }
}

function getGoalColor(id: string): string {
  if (defaultGoalColors[id]) return defaultGoalColors[id];
  try {
    const custom: Array<{ id: string; color: string }> =
      JSON.parse(localStorage.getItem("user-custom-goals") || "[]");
    return custom.find(g => g.id === id)?.color || "#3b82f6";
  } catch { return "#3b82f6"; }
}

interface GoalWeekData {
  id: string;
  hoursThisWeek: number;
  hoursLastWeek: number;
  missionsCompleted: number;
  streak: number;
  studied: boolean;
}

export default function WeeklyReview() {
  const [weekData, setWeekData] = useState<GoalWeekData[]>([]);
  const [totalThisWeek, setTotalThisWeek] = useState(0);
  const [totalLastWeek, setTotalLastWeek] = useState(0);
  const [totalMissions, setTotalMissions] = useState(0);

  useEffect(() => {
    const activeIds = getActiveGoalIds();
    const data: GoalWeekData[] = activeIds.map(id => {
      let hoursThisWeek = 0;
      let hoursLastWeek = 0;
      let missionsCompleted = 0;

      // Last 7 days (this week)
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayStr = d.toDateString();
        hoursThisWeek += parseFloat(localStorage.getItem(`day-hours-${id}-${dateStr}`) || "0");
        if (localStorage.getItem(`mission-completed-${id}-${dayStr}`) === "true") {
          missionsCompleted++;
        }
      }

      // Previous 7 days (last week)
      for (let i = 7; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        hoursLastWeek += parseFloat(localStorage.getItem(`day-hours-${id}-${dateStr}`) || "0");
      }

      const streak = parseInt(localStorage.getItem(`streak-${id}`) || "0");

      return {
        id,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        hoursLastWeek: Math.round(hoursLastWeek * 10) / 10,
        missionsCompleted,
        streak,
        studied: hoursThisWeek > 0,
      };
    });

    setWeekData(data);
    setTotalThisWeek(Math.round(data.reduce((s, d) => s + d.hoursThisWeek, 0) * 10) / 10);
    setTotalLastWeek(Math.round(data.reduce((s, d) => s + d.hoursLastWeek, 0) * 10) / 10);
    setTotalMissions(data.reduce((s, d) => s + d.missionsCompleted, 0));
  }, []);

  const notStarted = weekData.filter(d => !d.studied);
  const weekDiff = totalThisWeek - totalLastWeek;
  const improved = weekDiff > 0;

  // Get current week label
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BarChart2 size={18} className="text-primary" />
        <h2 className="text-lg font-bold text-white font-display">Weekly Review</h2>
        <span className="mono-label text-xs ml-auto">{weekLabel}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <p className="text-2xl font-black font-mono text-primary">{totalThisWeek}h</p>
          <p className="text-xs text-white/40">This week</p>
        </div>
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            {improved ? (
              <TrendingUp size={14} className="text-emerald-400" />
            ) : (
              <TrendingDown size={14} className="text-red-400" />
            )}
            <p className={`text-2xl font-black font-mono ${improved ? "text-emerald-400" : "text-red-400"}`}>
              {improved ? "+" : ""}{Math.round(weekDiff * 10) / 10}h
            </p>
          </div>
          <p className="text-xs text-white/40">vs last week ({totalLastWeek}h)</p>
        </div>
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <p className="text-2xl font-black font-mono text-cyan-400">{totalMissions}/49</p>
          <p className="text-xs text-white/40">Missions done</p>
        </div>
        <div className="mission-card rounded-xl p-4 text-center space-y-1">
          <p className="text-2xl font-black font-mono text-amber-400">{7 - notStarted.length}/7</p>
          <p className="text-xs text-white/40">Goals touched</p>
        </div>
      </div>

      {/* Goals breakdown */}
      <div className="mission-card rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Hours per Goal</h3>
        <div className="space-y-3">
          {weekData.map(goal => {
            const color = getGoalColor(goal.id);
            const maxHours = Math.max(...weekData.map(d => d.hoursThisWeek), 1);
            const barWidth = (goal.hoursThisWeek / maxHours) * 100;
            const diff = goal.hoursThisWeek - goal.hoursLastWeek;

            return (
              <div key={goal.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{getGoalLabel(goal.id)}</span>
                  <div className="flex items-center gap-2">
                    {diff !== 0 && (
                      <span className={diff > 0 ? "text-emerald-400" : "text-red-400"}>
                        {diff > 0 ? "+" : ""}{Math.round(diff * 10) / 10}h
                      </span>
                    )}
                    <span className="font-bold text-white">{goal.hoursThisWeek}h</span>
                    <span className="text-white/30">·</span>
                    <div className="flex items-center gap-0.5">
                      <Flame size={10} style={{ color }} />
                      <span style={{ color }}>{goal.streak}</span>
                    </div>
                    <span className="text-white/30">·</span>
                    <Target size={10} className="text-white/40" />
                    <span className="text-white/40">{goal.missionsCompleted}/7</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barWidth}%`,
                      background: color,
                      boxShadow: `0 0 6px ${color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Not started warning */}
      {notStarted.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: "#f59e0b10", border: "1px solid #f59e0b30" }}
        >
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-400">Goals not touched this week</p>
            <p className="text-xs text-white/50 mt-1">
              {notStarted.map(d => getGoalLabel(d.id)).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Missions missed */}
      {(() => {
        const missed = weekData.filter(d => d.studied && d.missionsCompleted < 7);
        if (missed.length === 0) return null;
        return (
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: "#ef444410", border: "1px solid #ef444430" }}
          >
            <Target size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Missed daily missions</p>
              <div className="text-xs text-white/50 mt-1 space-y-0.5">
                {missed.map(d => (
                  <p key={d.id}>
                    {getGoalLabel(d.id)}: {d.missionsCompleted}/7 completed ({7 - d.missionsCompleted} missed)
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
