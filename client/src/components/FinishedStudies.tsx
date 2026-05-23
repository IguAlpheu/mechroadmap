import { useEffect, useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";

interface FinishedEntry {
  step?: string;
  challenge?: string;
  description?: string;
  date: string;
}

interface FinishedStudiesProps {
  objectiveId: string;
  color: string;
}

export default function FinishedStudies({ objectiveId, color }: FinishedStudiesProps) {
  const [entries, setEntries] = useState<FinishedEntry[]>([]);

  useEffect(() => {
    // Collect completed steps from localStorage
    const allEntries: FinishedEntry[] = [];
    const stepsKey = `steps-completed-${objectiveId}`;
    const saved = localStorage.getItem(stepsKey);
    if (saved) {
      try {
        const ids = JSON.parse(saved) as number[];
        ids.forEach((id) => {
          allEntries.push({
            step: `Step #${id} completed`,
            date: new Date().toDateString(),
          });
        });
      } catch {
        // ignore
      }
    }
    setEntries(allEntries);
  }, [objectiveId]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 size={32} className="mx-auto mb-2 text-white/20" />
        <p className="text-white/40 text-sm">
          Complete study steps to see your finished studies history here
        </p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, FinishedEntry[]> = {};
  entries.forEach((e) => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">Finished Studies</h3>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Calendar size={14} />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
            <div
              className="space-y-2 pl-4 border-l-2"
              style={{ borderColor: `${color}40` }}
            >
              {grouped[date].map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg"
                  style={{ background: `${color}08` }}
                >
                  <CheckCircle2
                    size={16}
                    style={{ color }}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {entry.step || entry.challenge}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-white/50 truncate">{entry.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        className="rounded-lg p-3 text-center text-sm"
        style={{ background: `${color}15` }}
      >
        <p style={{ color }}>
          <span className="font-bold">{entries.length}</span> studies completed
        </p>
      </div>
    </div>
  );
}
