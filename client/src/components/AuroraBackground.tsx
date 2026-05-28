// ============================================================
// Lumeo — Aurora Background (CSS-only, no Three.js required)
// ============================================================

interface AuroraBackgroundProps {
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export default function AuroraBackground({
  intensity = "medium",
  className = "",
}: AuroraBackgroundProps) {
  const opacityMap = { low: 0.35, medium: 0.55, high: 0.75 };
  const op = opacityMap[intensity];

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Blob 1 — large blue, top-left drift */}
      <div
        style={{
          position: "absolute",
          width: "70%",
          height: "70%",
          top: "-10%",
          left: "-15%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, oklch(55% 0.22 240 / 0.6) 0%, transparent 70%)",
          filter: "blur(72px)",
          animation: "aurora-drift-1 18s ease-in-out infinite",
          opacity: op,
        }}
      />
      {/* Blob 2 — indigo, top-right */}
      <div
        style={{
          position: "absolute",
          width: "55%",
          height: "55%",
          top: "-5%",
          right: "-10%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, oklch(55% 0.22 270 / 0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-drift-2 22s ease-in-out infinite",
          opacity: op * 0.8,
        }}
      />
      {/* Blob 3 — cyan accent, center */}
      <div
        style={{
          position: "absolute",
          width: "45%",
          height: "45%",
          top: "20%",
          left: "30%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, oklch(60% 0.2 210 / 0.4) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "aurora-drift-3 26s ease-in-out infinite",
          opacity: op * 0.7,
        }}
      />
      {/* Blob 4 — deep blue, bottom */}
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: "60%",
          bottom: "-20%",
          left: "10%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, oklch(45% 0.2 250 / 0.4) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "aurora-drift-4 30s ease-in-out infinite",
          opacity: op * 0.6,
        }}
      />
      {/* Noise overlay for texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0% 0 0 / 0.03) 2px, oklch(0% 0 0 / 0.03) 4px)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
