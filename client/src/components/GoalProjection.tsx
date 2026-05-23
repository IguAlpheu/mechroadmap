import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProgressData } from '@/hooks/useProgressData';

interface ProjectionData {
  week: number;
  actual: number;
  projected: number;
  target: number;
}

const goalHourTargets: { [key: string]: number } = {
  coding: 400,
  japanese: 350,
  discipline: 200,
  calculus: 300,
  mechatronics: 350,
  flstudio: 250,
  webdev: 300,
};

export default function GoalProjection({ goalId }: { goalId: string }) {
  const { progressData } = useProgressData(goalId);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [completionDate, setCompletionDate] = useState<Date | null>(null);
  const [onTrack, setOnTrack] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!progressData || !('goalId' in progressData)) return;

    const goalProgress = progressData as any;
    const totalHours = goalHourTargets[goalId] || 400;
    const currentProgress = goalProgress.totalHoursLogged || 0;

    // Only show if goal has started (has logged hours or completed steps)
    if (currentProgress === 0 && goalProgress.completedSteps === 0) {
      setHasStarted(false);
      return;
    }

    setHasStarted(true);

    // Generate projection data based on actual pace (52 weeks = 1 year)
    const data: ProjectionData[] = [];
    const totalWeeks = 52;
    
    // Calculate current week based on progress
    const currentWeek = Math.max(1, Math.ceil((currentProgress / totalHours) * totalWeeks));
    
    // Calculate average hours per week based on actual progress
    const avgHoursPerWeek = currentProgress / Math.max(1, currentWeek);

    for (let week = 1; week <= totalWeeks; week++) {
      // Actual: what has been completed so far
      const actual = week <= currentWeek ? currentProgress : 0;
      
      // Projected: based on current pace
      const projected = Math.min(
        currentProgress + avgHoursPerWeek * Math.max(0, week - currentWeek),
        totalHours
      );
      
      // Target: linear path to completion
      const target = (week / totalWeeks) * totalHours;

      data.push({
        week,
        actual: Math.round(actual),
        projected: Math.round(projected),
        target: Math.round(target),
      });
    }

    setProjectionData(data);

    // Calculate completion date (corrected for 52 weeks)
    const completionWeek = avgHoursPerWeek > 0 
      ? Math.ceil((totalHours - currentProgress) / avgHoursPerWeek) + currentWeek
      : totalWeeks + 1;
    
    const date = new Date();
    date.setDate(date.getDate() + (completionWeek - currentWeek) * 7);
    setCompletionDate(date);

    // Check if on track (comparing actual vs target at current week)
    const targetAtCurrentWeek = (currentWeek / totalWeeks) * totalHours;
    const isOnTrack = currentProgress >= targetAtCurrentWeek * 0.9;
    setOnTrack(isOnTrack);
  }, [progressData, goalId]);

  if (!hasStarted) {
    return null;
  }

  if (projectionData.length === 0 || !completionDate) {
    return null;
  }

  const currentProgress = (progressData as any)?.totalHoursLogged || 0;
  const totalHours = goalHourTargets[goalId] || 400;
  const completionWeek = projectionData.findIndex((d) => d.projected >= totalHours) + 1;
  const daysRemaining = Math.max(0, 52 * 7 - completionWeek * 7);

  return (
    <div className="space-y-4">
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="mission-card rounded-lg p-4">
          <p className="text-xs text-white/60 mb-2">Current Progress</p>
          <p className="text-3xl font-bold text-primary">
            {Math.round((currentProgress / totalHours) * 100)}%
          </p>
          <p className="text-xs text-white/40 mt-2">
            {currentProgress.toFixed(1)} / {totalHours} hours
          </p>
        </div>

        <div className="mission-card rounded-lg p-4">
          <p className="text-xs text-white/60 mb-2">Estimated Completion</p>
          <p className="text-lg font-bold text-accent">
            {completionDate.toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: '2-digit',
            })}
          </p>
          <p className="text-xs text-white/40 mt-2">Week {Math.min(completionWeek, 52)} of 52</p>
        </div>

        <div
          className={`mission-card rounded-lg p-4 border ${
            onTrack ? 'border-green-500/50' : 'border-yellow-500/50'
          }`}
        >
          <p className="text-xs text-white/60 mb-2">Status</p>
          <p
            className={`text-lg font-bold ${
              onTrack ? 'text-green-400' : 'text-yellow-400'
            }`}
          >
            {onTrack ? '✓ On Track' : '⚠ Behind'}
          </p>
          <p className="text-xs text-white/40 mt-2">
            {onTrack ? 'Maintaining pace' : 'Increase pace'}
          </p>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="mission-card rounded-lg p-4">
        <p className="text-sm font-semibold text-white mb-4">
          Progress Projection (52 Weeks)
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={projectionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="week"
              stroke="rgba(255,255,255,0.3)"
              label={{
                value: 'Week',
                position: 'insideBottomRight',
                offset: -5,
                fill: 'rgba(255,255,255,0.5)',
              }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.5)',
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(70,185,255,0.5)',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#46b9ff"
              strokeWidth={2}
              dot={false}
              name="Actual Progress"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#00d9ff"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Projected Path"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="rgba(70,185,255,0.3)"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Target Path"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
