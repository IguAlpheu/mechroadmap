// Lumeo — Elegant Background
// Subtle deep-space particle field with slow golden light rays
import { useEffect, useRef } from "react";

interface AuroraBackgroundProps {
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export default function AuroraBackground({
  intensity = "medium",
  className = "",
}: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const opMap = { low: 0.5, medium: 0.8, high: 1.0 };
    const op = opMap[intensity];
    let W = 0, H = 0, t = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    const isLight = () => document.documentElement.classList.contains("light");

    // Stars
    const STARS = 120;
    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.00008 + 0.00002,
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Light beams — slow diagonal golden shafts
    const BEAMS = 3;
    const beams = Array.from({ length: BEAMS }, (_, i) => ({
      x: (i + 0.5) / BEAMS,
      width: 0.15 + Math.random() * 0.1,
      angle: -0.3 + Math.random() * 0.2,
      speed: 0.00015 + Math.random() * 0.0001,
      phase: (i / BEAMS) * Math.PI * 2,
    }));

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      const light = isLight();

      // Background gradient
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H) * 0.8);
      if (light) {
        bg.addColorStop(0, "rgba(255,252,240,1)");
        bg.addColorStop(1, "rgba(245,238,220,1)");
      } else {
        bg.addColorStop(0, "rgba(14,12,8,1)");
        bg.addColorStop(1, "rgba(6,5,3,1)");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Light beams
      beams.forEach((b) => {
        const cx = (b.x + Math.sin(t * b.speed * 100 + b.phase) * 0.08) * W;
        const alpha = (0.5 + 0.5 * Math.sin(t * 0.4 + b.phase)) * op;

        ctx.save();
        ctx.translate(cx, 0);
        ctx.rotate(b.angle);

        const bw = b.width * W;
        const grad = ctx.createLinearGradient(-bw, 0, bw, 0);
        if (light) {
          grad.addColorStop(0, "rgba(210,160,40,0)");
          grad.addColorStop(0.5, `rgba(210,160,40,${alpha * 0.08})`);
          grad.addColorStop(1, "rgba(210,160,40,0)");
        } else {
          grad.addColorStop(0, "rgba(200,150,30,0)");
          grad.addColorStop(0.5, `rgba(200,150,30,${alpha * 0.07})`);
          grad.addColorStop(1, "rgba(200,150,30,0)");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(-bw, -H * 0.1, bw * 2, H * 1.2);
        ctx.restore();
      });

      // Vignette glow at bottom
      const vign = ctx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, W * 0.7);
      if (light) {
        vign.addColorStop(0, `rgba(190,140,20,${0.04 * op})`);
        vign.addColorStop(1, "rgba(190,140,20,0)");
      } else {
        vign.addColorStop(0, `rgba(180,130,10,${0.06 * op})`);
        vign.addColorStop(1, "rgba(180,130,10,0)");
      }
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, W, H);

      // Stars (dark mode only)
      if (!light) {
        stars.forEach((s) => {
          s.twinkle += s.speed * 60;
          const alpha = (0.3 + 0.4 * Math.abs(Math.sin(s.twinkle))) * op;
          const goldish = Math.random() > 0.85;
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
          ctx.fillStyle = goldish
            ? `rgba(220,180,80,${alpha * 0.9})`
            : `rgba(255,255,255,${alpha * 0.6})`;
          ctx.fill();
        });
      }

      // Subtle grid lines (very faint)
      const gridAlpha = light ? 0.025 : 0.018;
      ctx.strokeStyle = light
        ? `rgba(180,140,30,${gridAlpha * op})`
        : `rgba(180,140,30,${gridAlpha * op})`;
      ctx.lineWidth = 0.5;
      const cols = 12;
      const rows = 8;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo((i / cols) * W, 0);
        ctx.lineTo((i / cols) * W, H);
        ctx.stroke();
      }
      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (i / rows) * H);
        ctx.lineTo(W, (i / rows) * H);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 1 }}
    />
  );
}
