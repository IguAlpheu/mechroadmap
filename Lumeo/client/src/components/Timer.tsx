import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { logHoursToday } from "@/hooks/useProgressData";

interface TimerProps {
  title: string;
  totalWeeks: number;
  color: string;
  goalId: string; // NEW: needed to log hours per goal
}

export default function Timer({ title, totalWeeks, color, goalId }: TimerProps) {
  const totalSeconds = totalWeeks * 7 * 24 * 3600;
  const storageKey = `timer-${title.replace(/\s+/g, "-").toLowerCase()}`;

  const [elapsed, setElapsed] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track seconds accumulated this session to log in batches
  const secondsThisMinute = useRef(0);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          localStorage.setItem(storageKey, next.toString());

          // Log to heatmap every 60 seconds (1 minute = 1/3600 hours)
          secondsThisMinute.current += 1;
          if (secondsThisMinute.current >= 60) {
            logHoursToday(goalId, 1 / 60); // log 1 minute = 0.01667h
            secondsThisMinute.current = 0;
            // Notify other components that progress updated
            window.dispatchEvent(new Event('progress-updated'));
          }

          return next;
        });
      }, 1000);
    } else {
      // When paused, log any remaining seconds
      if (secondsThisMinute.current > 0) {
        logHoursToday(goalId, secondsThisMinute.current / 3600);
        secondsThisMinute.current = 0;
        window.dispatchEvent(new Event('progress-updated'));
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, storageKey, goalId]);

  const formatTime = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const progress = (elapsed / totalSeconds) * 100;

  const handleReset = () => {
    setElapsed(0);
    setRunning(false);
    secondsThisMinute.current = 0;
    localStorage.setItem(storageKey, "0");
  };

  return (
    <div className="mission-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white/90 font-display">{title}</h3>
        <span className="mono-label" style={{ color }}>
          {totalWeeks} weeks
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="text-4xl font-black font-mono tracking-wider" style={{ color }}>
          {formatTime(elapsed)}
        </div>
        <p className="text-xs text-white/40">{Math.round(progress)}% complete</p>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
          style={{
            background: running ? `${color}20` : `${color}40`,
            border: `1px solid ${color}60`,
            color,
          }}
        >
          {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
          style={{
            background: `${color}20`,
            border: `1px solid ${color}60`,
            color,
          }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
