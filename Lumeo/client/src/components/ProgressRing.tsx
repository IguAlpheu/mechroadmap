interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#46b9ff',
  backgroundColor = 'rgba(255,255,255,0.1)',
  label,
  showPercentage = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
              filter: `drop-shadow(0 0 4px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className="text-lg font-bold" style={{ color }}>{Math.round(clampedProgress)}%</span>
          )}
          {label && <span className="text-xs text-white/60 mt-1 text-center px-1">{label}</span>}
        </div>
      </div>
    </div>
  );
}
