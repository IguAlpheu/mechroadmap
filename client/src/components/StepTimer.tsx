import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { logHoursToday } from '@/hooks/useProgressData';

interface StepTimerProps {
  stepId: string;
  stepName: string;
  goalId: string;
}

export default function StepTimer({ stepId, stepName, goalId }: StepTimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const storageKey = `step-timer-${goalId}-${stepId}`;
  const sessionsKey = `step-sessions-${goalId}-${stepId}`;

  // Track unlogged seconds for accurate batching
  const unloggedSeconds = useRef(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey);
    const savedSessions = localStorage.getItem(sessionsKey);
    if (savedTime) setTime(parseInt(savedTime));
    if (savedSessions) setSessions(parseInt(savedSessions));
  }, [storageKey, sessionsKey]);

  // Timer logic — log every 60s, flush remaining on pause
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(storageKey, newTime.toString());
          unloggedSeconds.current += 1;
          if (unloggedSeconds.current >= 60) {
            logHoursToday(goalId, 1 / 60);
            unloggedSeconds.current = 0;
            window.dispatchEvent(new Event('progress-updated'));
          }
          return newTime;
        });
      }, 1000);
    } else {
      // Flush remaining seconds when paused
      if (unloggedSeconds.current > 0) {
        logHoursToday(goalId, unloggedSeconds.current / 3600);
        unloggedSeconds.current = 0;
        window.dispatchEvent(new Event('progress-updated'));
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, storageKey, goalId]);

  const toggleTimer = () => setIsRunning((r) => !r);

  const resetTimer = () => {
    // Flush before resetting
    if (unloggedSeconds.current > 0) {
      logHoursToday(goalId, unloggedSeconds.current / 3600);
      unloggedSeconds.current = 0;
      window.dispatchEvent(new Event('progress-updated'));
    }
    setTime(0);
    setIsRunning(false);
    localStorage.setItem(storageKey, '0');
  };

  const completeSession = () => {
    const newSessions = sessions + 1;
    setSessions(newSessions);
    localStorage.setItem(sessionsKey, newSessions.toString());
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mission-card rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{stepName}</p>
          <p className="text-xs text-white/50 mt-1">Step Timer</p>
        </div>
        <span className="text-xs text-white/40">{sessions} sessions</span>
      </div>

      {/* Timer Display */}
      <div className="bg-background/50 rounded-lg p-4 text-center">
        <p className="text-3xl font-mono font-bold text-primary tracking-wider">
          {formatTime(time)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-md transition-smooth active:scale-95"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-md transition-smooth active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Complete Session Button */}
      <button
        onClick={completeSession}
        className="w-full px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md text-sm font-medium transition-smooth active:scale-95"
      >
        ✓ Complete Session
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-white/50">Total Time</p>
          <p className="text-sm font-semibold text-white mt-1">{(time / 3600).toFixed(1)}h</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/50">Avg Session</p>
          <p className="text-sm font-semibold text-white mt-1">
            {sessions > 0 ? `${(time / sessions / 60).toFixed(0)}m` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
