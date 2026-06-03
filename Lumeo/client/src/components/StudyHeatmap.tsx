import { useState, useEffect, useCallback } from 'react';

interface HeatmapData {
  date: string;
  hours: number;
  intensity: number; // 0-4
}

// Mark today as studied in the heatmap — called by StreakButton
// Uses a separate boolean key so it doesn't inflate the hours stats
export function markTodayStudied(goalId: string) {
  const today = new Date().toISOString().split('T')[0];
  const key = `heatmap-streak-${goalId}-${today}`;
  localStorage.setItem(key, '1');
  // Notify all listeners (same tab + other tabs)
  window.dispatchEvent(new Event('progress-updated'));
  window.dispatchEvent(new StorageEvent('storage'));
}

export default function StudyHeatmap({ goalId }: { goalId: string }) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);

  const loadData = useCallback(() => {
    const data: HeatmapData[] = [];
    for (let i = 83; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const heatKey    = `heatmap-${goalId}-${dateStr}`;       // horas do heatmap legado
      const dayKey     = `day-hours-${goalId}-${dateStr}`;      // horas de timers
      const streakKey  = `heatmap-streak-${goalId}-${dateStr}`; // marcação de streak (sem horas)

      const heatHours  = parseFloat(localStorage.getItem(heatKey) || '0');
      const dayHours   = parseFloat(localStorage.getItem(dayKey)  || '0');
      const totalHours = heatHours + dayHours;
      const streakMark = localStorage.getItem(streakKey) === '1';

      // Intensity: se só tem streak (sem horas), usa intensity 1 (mínimo visível)
      const intensity =
        totalHours === 0 && !streakMark ? 0
        : totalHours === 0 && streakMark ? 1
        : totalHours < 1 ? 1
        : totalHours < 2 ? 2
        : totalHours < 3 ? 3
        : 4;

      data.push({ date: dateStr, hours: Math.round(totalHours * 10) / 10, intensity });
    }
    setHeatmapData(data);
  }, [goalId]);

  useEffect(() => {
    loadData();
    window.addEventListener('progress-updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('progress-updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  // Group days into weeks (columns)
  const weeks: HeatmapData[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Stats derived from real data
  const totalHours = heatmapData.reduce((sum, d) => sum + d.hours, 0);
  const activeDays = heatmapData.filter(d => d.hours > 0).length;
  const avgHours = activeDays > 0 ? (totalHours / activeDays).toFixed(1) : '0.0';

  // Streak: consecutive days from today backwards with any activity OR streak mark
  let streak = 0;
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    const d = heatmapData[i];
    const streakKey = `heatmap-streak-${goalId}-${d.date}`;
    const hasActivity = d.hours > 0 || localStorage.getItem(streakKey) === '1';
    if (hasActivity) streak++;
    else break;
  }

  const getColor = (intensity: number) => {
    const colors = [
      'bg-white/5',
      'bg-blue-900/40',
      'bg-blue-700/60',
      'bg-blue-500/80',
      'bg-blue-400',
    ];
    return colors[intensity] ?? colors[0];
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mission-card rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Total Hours (12w)</p>
          <p className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}</p>
        </div>
        <div className="mission-card rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-accent">{avgHours}h</p>
        </div>
        <div className="mission-card rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Streak</p>
          <p className="text-2xl font-bold text-accent">{streak} {streak === 1 ? 'day' : 'days'}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mission-card rounded-lg p-4 overflow-x-auto">
        <p className="text-sm font-semibold text-white mb-3">Study Activity (12 Weeks)</p>

        <div className="flex gap-1">
          {/* Day labels column */}
          <div className="flex flex-col gap-1 pr-2 justify-start">
            {dayLabels.map((day, i) => (
              <div key={i} className="w-8 h-8 flex items-center justify-center text-xs text-white/40">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-8 h-8 rounded-md transition-all cursor-default hover:ring-2 hover:ring-primary/50 ${getColor(day.intensity)}`}
                    title={`${day.date}: ${day.hours}h studied`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
          <span className="text-xs text-white/60">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/5" />
            <div className="w-3 h-3 rounded-sm bg-blue-900/40" />
            <div className="w-3 h-3 rounded-sm bg-blue-700/60" />
            <div className="w-3 h-3 rounded-sm bg-blue-500/80" />
            <div className="w-3 h-3 rounded-sm bg-blue-400" />
          </div>
          <span className="text-xs text-white/60">More</span>
          {activeDays > 0 && (
            <span className="ml-auto text-xs text-white/40">{activeDays} active day{activeDays !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
}
