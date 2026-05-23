import { useState, useEffect } from 'react';

export interface ProgressData {
  goalId: string;
  completedSteps: number;
  totalSteps: number;
  totalHoursLogged: number;
  sessionCount: number;
  lastSessionDate: string | null;
  dailyStreak: number;
}

export interface GlobalProgressData {
  overallProgress: number;
  totalHoursLogged: number;
  totalCompletion: number;
  goalProgresses: { [key: string]: ProgressData };
}

// Calculate daily streak
function calculateStreak(): number {
  const streakKey = 'daily-streak-date';
  const streakCountKey = 'daily-streak-count';

  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(streakKey);
  const currentCount = parseInt(localStorage.getItem(streakCountKey) || '0');

  if (lastDate === today) {
    return currentCount;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    const newCount = currentCount + 1;
    localStorage.setItem(streakCountKey, newCount.toString());
    localStorage.setItem(streakKey, today);
    return newCount;
  }

  localStorage.setItem(streakCountKey, '1');
  localStorage.setItem(streakKey, today);
  return 1;
}

// Log hours for a specific goal on today's date
// Call this whenever a timer session ends
export function logHoursToday(goalId: string, hours: number) {
  const today = new Date().toISOString().split('T')[0];
  const dayKey = `day-hours-${goalId}-${today}`;
  const existing = parseFloat(localStorage.getItem(dayKey) || '0');
  localStorage.setItem(dayKey, (existing + hours).toFixed(2));
}

// Get progress for a specific goal
export function getGoalProgress(goalId: string): ProgressData {
  const stepsKey = `steps-completed-${goalId}`;
  const totalSteps = 8;

  const completedStepsStr = localStorage.getItem(stepsKey);
  const completedSteps = completedStepsStr ? JSON.parse(completedStepsStr).length : 0;

  // Calculate total hours from all step timers
  let totalHoursLogged = 0;
  for (let i = 1; i <= totalSteps; i++) {
    const stepTimerKey = `step-timer-${goalId}-step-${i}`;
    const time = parseInt(localStorage.getItem(stepTimerKey) || '0');
    totalHoursLogged += time / 3600;
  }

  // Count sessions
  let sessionCount = 0;
  for (let i = 1; i <= totalSteps; i++) {
    const sessKey = `step-sessions-${goalId}-step-${i}`;
    const count = parseInt(localStorage.getItem(sessKey) || '0');
    sessionCount += count;
  }

  return {
    goalId,
    completedSteps,
    totalSteps,
    totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
    sessionCount,
    lastSessionDate: localStorage.getItem(`last-session-${goalId}`) || null,
    dailyStreak: calculateStreak(),
  };
}

// Get global progress across all goals
export function getGlobalProgress(): GlobalProgressData {
  const goalIds = ['coding', 'japanese', 'discipline', 'calculus', 'mechatronics', 'flstudio', 'webdev'];
  const goalProgresses: { [key: string]: ProgressData } = {};

  let totalHoursLogged = 0;
  let totalCompletedSteps = 0;
  let totalSteps = 0;

  goalIds.forEach((goalId) => {
    const progress = getGoalProgress(goalId);
    goalProgresses[goalId] = progress;
    totalHoursLogged += progress.totalHoursLogged;
    totalCompletedSteps += progress.completedSteps;
    totalSteps += progress.totalSteps;
  });

  const overallProgress = totalSteps > 0 ? Math.round((totalCompletedSteps / totalSteps) * 100) : 0;

  return {
    overallProgress,
    totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
    totalCompletion: overallProgress, // same calculation — kept for API compatibility
    goalProgresses,
  };
}

// Hook to use progress data with reactivity
export function useProgressData(goalId?: string) {
  const [progressData, setProgressData] = useState<ProgressData | GlobalProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateProgress = () => {
      if (goalId) {
        setProgressData(getGoalProgress(goalId));
      } else {
        setProgressData(getGlobalProgress());
      }
      setLoading(false);
    };

    updateProgress();

    window.addEventListener('storage', updateProgress);
    window.addEventListener('focus', updateProgress);
    // Custom event for same-tab updates
    window.addEventListener('progress-updated', updateProgress);

    return () => {
      window.removeEventListener('storage', updateProgress);
      window.removeEventListener('focus', updateProgress);
      window.removeEventListener('progress-updated', updateProgress);
    };
  }, [goalId]);

  return { progressData, loading };
}

// Calculate completion date based on pace
export function calculateCompletionDate(
  totalHours: number,
  hoursLogged: number,
  startDate: Date,
  targetDays: number = 540
): { completionDate: Date; isOnTrack: boolean; daysRemaining: number } {
  const hoursRemaining = totalHours - hoursLogged;
  const daysPassed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const avgHoursPerDay = daysPassed > 0 ? hoursLogged / daysPassed : 0;

  const daysNeeded = avgHoursPerDay > 0 ? Math.ceil(hoursRemaining / avgHoursPerDay) : targetDays;
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);

  const isOnTrack = daysNeeded <= targetDays;
  const daysRemaining = Math.max(0, targetDays - daysPassed);

  return { completionDate, isOnTrack, daysRemaining };
}