/**
 * GET BETTER PROJECT — Home Page
 * Design: Deep dark navy/black, neon blue accents, Outfit display font,
 * JetBrains Mono labels, mission-card glass panels, starfield background
 */
import { useState, useEffect, useRef } from "react";
import { useResetAllData } from "@/hooks/useResetData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Timer from "@/components/Timer";
import StreakButton from "@/components/StreakButton";
import DailyChallenge from "@/components/DailyChallenge";
import ProgressiveStudySteps from "@/components/ProgressiveStudySteps";
import FinishedStudies from "@/components/FinishedStudies";
import StudyHeatmap from "@/components/StudyHeatmap";
import GoalProjection from "@/components/GoalProjection";
import ResourceRecommendations from "@/components/ResourceRecommendations";
import GlobalProgressOverview from "@/components/GlobalProgressOverview";
import ProgressActivities from "@/components/ProgressActivities";
import NotesAndFiles from "@/components/NotesAndFiles";
import AddSkillModal from "@/components/AddSkillModal";
import { Sparkles } from "lucide-react";
import {
  overviewChartData,
  goalTabs,
  studySteps,
  goalDefinitions,
} from "@/data/goals";

// ── Hero images (original CDN URLs) ──
 const HERO_BG = 
      "/BackgroundSITE.png"; 

// ── Intersection observer hook ──
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── MonoLabel ──
function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono-label inline-block mb-3 text-xs font-medium">{children}</span>
  );
}

// ── Badge ──
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full transition-smooth"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {label}
    </span>
  );
}

// ── Resource Link ──
function ResourceLink({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-primary hover:text-primary-light transition-smooth group py-1.5"
    >
      <span className="w-1 h-1 rounded-full bg-primary group-hover:bg-primary-light flex-shrink-0 transition-smooth" />
      <span className="group-hover:underline">{name}</span>
    </a>
  );
}

// ── Goal Section ──
function GoalSection({ goalId }: { goalId: string }) {
  const { ref, inView } = useInView();
  const goal = goalDefinitions[goalId];
  const steps = studySteps[goalId] || [];
  const [challenge, setChallenge] = useState("");

  if (!goal) return null;

  return (
    <div
      ref={ref}
      className={`space-y-4 ${inView ? "animate-fade-in-up" : "opacity-0"}`}
    >
      {/* Header */}
      <div className="mb-6 space-y-3">
        <MonoLabel>{goal.number}</MonoLabel>
        <h2 className="text-4xl font-bold text-white font-display leading-tight">
          {goal.title}
          <span className="gradient-text-blue">{goal.titleHighlight}</span>
        </h2>
        <p className="text-white/60 text-base max-w-2xl leading-relaxed">{goal.description}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 h-10 gap-1">
          <TabsTrigger value="overview" className="text-sm font-medium">Overview</TabsTrigger>
          <TabsTrigger value="timers" className="text-sm font-medium">Timers</TabsTrigger>
          <TabsTrigger value="progress" className="text-sm font-medium">Progress</TabsTrigger>
          <TabsTrigger value="resources" className="text-sm font-medium">Resources</TabsTrigger>
          <TabsTrigger value="notes" className="text-sm font-medium">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Study Heatmap */}
          <StudyHeatmap goalId={goalId} />
        </TabsContent>

        {/* Timers Tab */}
        <TabsContent value="timers" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goal.timers.slice(0, 2).map((t) => (
              <Timer key={t.title} title={t.title} totalWeeks={t.totalWeeks} color={t.color} goalId={goalId} />
            ))}
          </div>
          {goal.timers.length > 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goal.timers.slice(2).map((t) => (
                <Timer key={t.title} title={t.title} totalWeeks={t.totalWeeks} color={t.color} goalId={goalId} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mission-card rounded-xl p-6">
              <StreakButton
                objectiveId={goalId}
                color={goal.color}
                onStreakComplete={(c) => setChallenge(c)}
              />
            </div>
            <div className="mission-card rounded-xl p-6">
              <DailyChallenge
                objectiveId={goalId}
                color={goal.color}
                challenge={challenge}
              />
            </div>
          </div>
          <div className="mission-card rounded-xl p-6">
            <ProgressiveStudySteps
              objectiveId={goalId}
              steps={steps}
              color={goal.color}
            />
          </div>
          <div className="mission-card rounded-xl p-6">
            <FinishedStudies objectiveId={goalId} color={goal.color} />
          </div>
          <div className="mission-card rounded-xl p-6">
            <ProgressActivities goalId={goalId} />
          </div>
          {/* Goal Projection — shows automatically once you log hours */}
          <GoalProjection goalId={goalId} />
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          {/* Resource Recommendations */}
          <ResourceRecommendations goalId={goalId} progress={35} />
          
          {/* Curated Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 font-display">Curated Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goal.resources.map((resource, idx) => (
              <div
                key={idx}
                className="mission-card rounded-xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Badge label={resource.badge} color={resource.color} />
                    <h3 className="text-base font-bold text-white mt-2 font-display">
                      {resource.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-1">{resource.role}</p>
                  </div>
                  <span
                    className="mono-label text-xs whitespace-nowrap"
                    style={{ color: resource.color }}
                  >
                    {resource.time}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{resource.why}</p>
                <div className="space-y-2 pt-2 border-t border-white/10">
                  {resource.resources.map((r, i) => (
                    <ResourceLink key={i} name={r.name} url={r.url} />
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>
        </TabsContent>

        {/* Notes & Files Tab */}
        <TabsContent value="notes" className="space-y-4">
          <NotesAndFiles goalId={goalId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Main Home Component ──
export default function Home() {
  const [activeGoal, setActiveGoal] = useState("coding");
  const [scrolled, setScrolled] = useState(false);
  const { resetAll } = useResetAllData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalHours = overviewChartData.reduce((sum, d) => sum + d.hours, 0) + 600 + 1000;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        {/* Starfield */}
        <div className="absolute inset-0 starfield opacity-30" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
        

          {/* Label */}
          <MonoLabel>OBJECTIVE PLANNER · 2026</MonoLabel>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white font-display leading-tight">
            Now it's the start of
            <br />
            <span className="gradient-text-blue">everything</span>
            <br />
            Even if you fail, never give up
          </h1>

          {/* Subtext */}
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            This is the first step. A complete system to transform your current
            self to be your future best version.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-4">
            {[
              { value: "7", label: "Total Goals" },
              { value: `${Math.round(totalHours / 10) * 10}+`, label: "Est. Study Hours" },
              { value: "18", label: "Months to Complete" },
              { value: "20+", label: "Skills to Master" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono gradient-text-blue">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 mt-2 font-display font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30" />
        </div>
      </section>

      {/* ── Global Progress Overview Section ── */}
      <section className="py-20 px-4 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <GlobalProgressOverview />
        </div>
      </section>



      {/* ── Goal Navigation (sticky) ── */}
      <section
        ref={navRef}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-sm shadow-lg"
            : "bg-background"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {goalTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveGoal(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeGoal === tab.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setShowAddSkill(true)}
              className="ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>
        </div>
      </section>

      {/* ── Active Goal Content ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <GoalSection goalId={activeGoal} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4 border-t border-white/5 text-center text-white/40 text-sm space-y-4">
        <p className="font-medium">Mechatronics Roadmap 2025–2026</p>
        <p className="text-xs">
          The journey of 1,000 hours begins with a single line of code. Lock in.
        </p>

        {/* Reset All Progress */}
        <div className="pt-2 flex flex-col items-center gap-2">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-red-500/50 hover:text-red-400 transition-colors border border-red-500/20 hover:border-red-500/50 px-4 py-2 rounded-lg"
            >
              🗑 Reset All Progress
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-red-400">This will erase ALL data. Are you sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={resetAll}
                  className="text-xs text-white bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-white/50 hover:text-white/80 px-4 py-2 rounded-lg border border-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* ── Add Skill Modal ── */}
      <AddSkillModal
        isOpen={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        onAdd={(skill) => {
          console.log("New skill generated:", skill);
          setShowAddSkill(false);
        }}
        currentGoalCount={goalTabs.length}
      />
    </div>
  );
}
