import { useState } from 'react';
import { useProgressData } from '@/hooks/useProgressData';
import { useResetAllData } from '@/hooks/useResetData';
import ProgressRing from './ProgressRing';

interface GoalProgressRing {
  id: string;
  name: string;
  emoji: string;
  color: string;
  targetHours: number;
}

const goalMeta: GoalProgressRing[] = [
  { id: 'coding',       name: 'Coding',       emoji: '💻', color: '#46b9ff', targetHours: 400 },
  { id: 'japanese',     name: 'Japanese',     emoji: '🎌', color: '#ec4899', targetHours: 350 },
  { id: 'discipline',   name: 'Discipline',   emoji: '⚡', color: '#ffd700', targetHours: 200 },
  { id: 'calculus',     name: 'Calculus',     emoji: '∫',  color: '#10b981', targetHours: 300 },
  { id: 'mechatronics', name: 'Mechatronics', emoji: '🤖', color: '#8b5cf6', targetHours: 350 },
  { id: 'flstudio',     name: 'FL Studio',    emoji: '🎵', color: '#ec4899', targetHours: 250 },
  { id: 'webdev',       name: 'Web Dev',      emoji: '🌐', color: '#00f5ff', targetHours: 300 },
];

export default function GlobalProgressOverview() {
  const { progressData } = useProgressData();
  const { resetAll } = useResetAllData();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!progressData || 'goalId' in progressData) return null;

  const globalData = progressData;

  const goalProgresses = goalMeta.map((goal) => {
    const goalData = globalData.goalProgresses[goal.id];
    const hoursLogged = goalData?.totalHoursLogged || 0;
    const stepsCompleted = goalData?.completedSteps || 0;
    const totalSteps = goalData?.totalSteps || 8;

    // Progress is based on hours logged (capped at 100%)
    const hoursPct = Math.min(100, Math.round((hoursLogged / goal.targetHours) * 100));
    // Steps progress as secondary reference
    const stepsPct = totalSteps > 0 ? Math.round((stepsCompleted / totalSteps) * 100) : 0;
    // Use whichever is higher (hours or steps give partial credit)
    const progress = Math.max(hoursPct, stepsPct);

    return { ...goal, progress, hoursLogged: hoursLogged.toFixed(1), stepsCompleted, totalSteps };
  });

  const avgProgress = Math.round(
    goalProgresses.reduce((sum, g) => sum + g.progress, 0) / goalProgresses.length
  );
  const totalHoursLogged = Math.round(globalData.totalHoursLogged * 10) / 10;
  const totalStepsCompleted = goalProgresses.reduce((sum, g) => sum + g.stepsCompleted, 0);
  const totalStepsAll = goalProgresses.reduce((sum, g) => sum + g.totalSteps, 0);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    resetAll();
  }

  return (
    <div className="space-y-6">
      {/* Top row: Overall Progress + Reset button */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="mission-card rounded-lg p-4 flex-1 min-w-[180px]">
          <p className="text-xs text-white/60 mb-2">Overall Progress</p>
          <p className="text-3xl font-bold text-primary">{avgProgress}%</p>
          <p className="text-xs text-white/40 mt-2">
            {totalHoursLogged}h logged · {totalStepsCompleted}/{totalStepsAll} steps
          </p>
        </div>

        {/* Reset All Progress button */}
        <div className="mission-card rounded-lg p-4 flex flex-col justify-between gap-3 min-w-[200px]">
          <div>
            <p className="text-xs text-white/60 mb-1">Danger Zone</p>
            <p className="text-xs text-white/35 leading-relaxed">
              Wipes all activities, streaks, timers and steps.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95"
            style={{
              background: confirmReset ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.1)",
              color: confirmReset ? "#f87171" : "#ef444480",
              border: confirmReset ? "1px solid #ef444480" : "1px solid #ef444425",
              boxShadow: confirmReset ? "0 0 12px rgba(239,68,68,0.2)" : "none",
            }}
          >
            {confirmReset ? "⚠ Confirm — Reset Everything" : "🗑 Reset All Progress"}
          </button>
        </div>
      </div>

      {/* Goal Progress Rings */}
      <div className="mission-card rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Goal Progress Rings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {goalProgresses.map((goal) => (
            <div key={goal.id} className="flex flex-col items-center gap-3">
              <div className="text-2xl">{goal.emoji}</div>
              <ProgressRing
                progress={goal.progress}
                size={100}
                strokeWidth={6}
                color={goal.color}
                label={goal.name}
                showPercentage={true}
              />
              <p className="text-xs text-white/40 text-center">
                {goal.hoursLogged}h / {goal.targetHours}h
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mission-card rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Breakdown</h3>
        <div className="space-y-4">
          {goalProgresses.map((goal) => (
            <div key={goal.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.emoji}</span>
                  <span className="text-sm text-white/70">{goal.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span>{goal.stepsCompleted}/{goal.totalSteps} steps</span>
                  <span className="font-semibold text-white">{goal.progress}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: goal.color,
                    boxShadow: `0 0 8px ${goal.color}80`,
                  }}
                />
              </div>
              <p className="text-xs text-white/30">{goal.hoursLogged}h / {goal.targetHours}h target</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
