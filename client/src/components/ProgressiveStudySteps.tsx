import { useState, useEffect } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import StepTimer from "./StepTimer";

interface StudyStep {
  id: number;
  title: string;
  description: string;
  duration: string;
}

interface ProgressiveStudyStepsProps {
  objectiveId: string;
  steps: StudyStep[];
  color: string;
}

export default function ProgressiveStudySteps({
  objectiveId,
  steps,
  color,
}: ProgressiveStudyStepsProps) {
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const key = `steps-completed-${objectiveId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const ids = JSON.parse(saved) as number[];
        setCompletedIds(ids);
        // Find next uncompleted step
        const nextIdx = steps.findIndex((s) => !ids.includes(s.id));
        setCurrentIndex(nextIdx >= 0 ? nextIdx : steps.length);
      } catch {
        setCompletedIds([]);
      }
    }
  }, [objectiveId, steps]);

  const currentStep = steps[currentIndex];
  const progress = (completedIds.length / steps.length) * 100;

  const handleComplete = () => {
    if (!currentStep) return;
    const updated = [...completedIds, currentStep.id];
    setCompletedIds(updated);
    localStorage.setItem(`steps-completed-${objectiveId}`, JSON.stringify(updated));
    const nextIdx = steps.findIndex((s) => !updated.includes(s.id));
    setCurrentIndex(nextIdx >= 0 ? nextIdx : steps.length);
  };

  const handleSkip = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < steps.length) setCurrentIndex(nextIdx);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color }} />
          <span className="text-white font-semibold text-sm">Study Progress</span>
        </div>
        <span className="text-xs font-mono" style={{ color }}>
          {completedIds.length}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>

      {/* Current step card */}
      {currentStep && (
        <div
          className="rounded-2xl p-6 space-y-4 border-2"
          style={{
            background: `${color}08`,
            borderColor: `${color}40`,
          }}
        >
          <div className="flex items-start gap-3">
            <BookOpen
              size={24}
              style={{ color }}
              className="flex-shrink-0 mt-1"
            />
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg">{currentStep.title}</h4>
              <p className="text-white/70 text-sm mt-1">{currentStep.description}</p>
              <p className="text-xs text-white/50 mt-2">⏱️ {currentStep.duration}</p>
            </div>
          </div>

          {/* Step Timer */}
          <StepTimer stepId={`step-${currentStep.id}`} stepName={currentStep.title} goalId={objectiveId} />

          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="flex-1 py-2 rounded-lg font-semibold transition-all text-white"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                boxShadow: `0 0 15px ${color}60`,
              }}
            >
              Complete Step ✓
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2 rounded-lg font-semibold transition-all text-white/70 border"
              style={{
                borderColor: `${color}40`,
                background: `${color}08`,
              }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {!currentStep && completedIds.length === steps.length && (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: `${color}15`, border: `1px solid ${color}40` }}
        >
          <p className="text-sm font-bold" style={{ color }}>
            🎉 All steps completed!
          </p>
        </div>
      )}

      {/* All steps list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <p className="text-xs text-white/50 font-semibold">All Steps</p>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{
              background:
                idx === currentIndex
                  ? `${color}20`
                  : completedIds.includes(step.id)
                  ? `${color}10`
                  : "transparent",
              borderLeft: `3px solid ${
                completedIds.includes(step.id) || idx === currentIndex
                  ? color
                  : `${color}40`
              }`,
            }}
          >
            {completedIds.includes(step.id) ? (
              <CheckCircle2 size={16} style={{ color }} className="flex-shrink-0" />
            ) : (
              <BookOpen
                size={16}
                style={{ color: idx === currentIndex ? color : `${color}40` }}
                className="flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  completedIds.includes(step.id)
                    ? "line-through text-white/30"
                    : idx === currentIndex
                    ? "text-white"
                    : "text-white/50"
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-white/30 truncate">{step.duration}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-lg p-3 text-center text-sm"
        style={{ background: `${color}15` }}
      >
        <p style={{ color }}>
          <span className="font-bold">{completedIds.length}</span> studies completed
        </p>
      </div>
    </div>
  );
}
