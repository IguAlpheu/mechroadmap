// ============================================================
// Lumeo — Aurora Background (Canvas + CSS hybrid)
// Breathtaking animated aurora with gold/white color palette
// ============================================================

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

    const opMap = { low: 0.5, medium: 0.75, high: 1.0 };
    const op = opMap[intensity];
    let t = 0;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    // Check if light mode
    const isLight = () => document.documentElement.classList.contains("light");

    // Noise function (simplex-like approximation)
    const hash = (n: number) => {
      let x = Math.sin(n) * 43758.5453123;
      return x - Math.floor(x);
    };
    const noise2d = (x: number, y: number) => {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = hash(ix + iy * 57);
      const b = hash(ix + 1 + iy * 57);
      const c = hash(ix + (iy + 1) * 57);
      const d = hash(ix + 1 + (iy + 1) * 57);
      return (a + (b - a) * ux + (c - a) * uy + (d - b - c + a) * ux * uy);
    };
    const fbm = (x: number, y: number, octaves = 4) => {
      let v = 0, a = 0.5, freq = 1.8;
      for (let i = 0; i < octaves; i++) {
        v += a * noise2d(x * freq, y * freq);
        a *= 0.5; freq *= 2.1;
      }
      return v;
    };

    // Aurora streaks
    interface Streak {
      phase: number;
      speed: number;
      yBase: number;
      hue: number;
      width: number;
      amp: number;
    }

    const streaks: Streak[] = Array.from({ length: 7 }, (_, i) => ({
      phase: (i / 7) * Math.PI * 2,
      speed: 0.0003 + i * 0.00008,
      yBase: 0.15 + (i / 7) * 0.55,
      hue: 75 + i * 6,       // gold range: 75–115
      width: 0.08 + i * 0.03,
      amp: 0.06 + i * 0.02,
    }));

    // Floating particles
    interface Particle {
      x: number; y: number; size: number;
      speed: number; phase: number; opacity: number;
    }
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 2.5,
      speed: 0.0002 + Math.random() * 0.0004,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.2 + Math.random() * 0.6,
    }));

    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, W, H);

      const light = isLight();

      // ── Background gradient ──
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.5, W * 0.8);
      if (light) {
        bgGrad.addColorStop(0, "rgba(255,252,240,0)");
        bgGrad.addColorStop(1, "rgba(240,230,210,0)");
      } else {
        bgGrad.addColorStop(0, "rgba(20,15,5,0)");
        bgGrad.addColorStop(1, "rgba(5,4,2,0)");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Aurora streaks ──
      streaks.forEach((s, si) => {
        const phase = t * s.speed * 1000 + s.phase;
        const noiseShift = fbm(t * 0.3 + si * 0.7, t * 0.2 + si * 0.5);
        const yCenter = (s.yBase + Math.sin(phase * 0.7) * s.amp + (noiseShift - 0.5) * s.amp * 1.5) * H;
        const bandH = s.width * H;

        const grad = ctx.createLinearGradient(0, yCenter - bandH, 0, yCenter + bandH);
        const alpha = op * (0.3 + 0.25 * Math.sin(phase * 1.3 + si));
        const hue = s.hue + Math.sin(phase * 0.5) * 12;

        if (light) {
          grad.addColorStop(0, `hsla(${hue},55%,55%,0)`);
          grad.addColorStop(0.35, `hsla(${hue},60%,50%,${alpha * 0.4})`);
          grad.addColorStop(0.5, `hsla(${hue},65%,48%,${alpha * 0.7})`);
          grad.addColorStop(0.65, `hsla(${hue},60%,50%,${alpha * 0.4})`);
          grad.addColorStop(1, `hsla(${hue},55%,55%,0)`);
        } else {
          grad.addColorStop(0, `hsla(${hue},70%,60%,0)`);
          grad.addColorStop(0.35, `hsla(${hue},75%,65%,${alpha * 0.5})`);
          grad.addColorStop(0.5, `hsla(${hue},80%,70%,${alpha})`);
          grad.addColorStop(0.65, `hsla(${hue},75%,65%,${alpha * 0.5})`);
          grad.addColorStop(1, `hsla(${hue},70%,60%,0)`);
        }

        ctx.save();
        ctx.filter = `blur(${32 + si * 8}px)`;

        // Wavy path
        ctx.beginPath();
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * W;
          const nx = i / steps;
          const waveFbm = fbm(nx * 2.5 + t * 0.4 + si, t * 0.25 + si * 1.1);
          const waveY = yCenter + (waveFbm - 0.5) * bandH * 1.8 + Math.sin(nx * Math.PI * 3 + phase * 2) * bandH * 0.3;
          if (i === 0) ctx.moveTo(x, waveY - bandH);
          else ctx.lineTo(x, waveY - bandH);
        }
        for (let i = steps; i >= 0; i--) {
          const x = (i / steps) * W;
          const nx = i / steps;
          const waveFbm = fbm(nx * 2.5 + t * 0.4 + si, t * 0.25 + si * 1.1);
          const waveY = yCenter + (waveFbm - 0.5) * bandH * 1.8 + Math.sin(nx * Math.PI * 3 + phase * 2) * bandH * 0.3;
          ctx.lineTo(x, waveY + bandH);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // ── Gold nebula blobs ──
      const blobs = [
        { x: 0.2, y: 0.3, r: 0.35, speed: 0.8, hue: 82 },
        { x: 0.75, y: 0.2, r: 0.3, speed: 1.1, hue: 72 },
        { x: 0.5, y: 0.7, r: 0.4, speed: 0.6, hue: 90 },
      ];
      blobs.forEach((b, i) => {
        const bx = (b.x + Math.sin(t * b.speed * 0.4 + i) * 0.08) * W;
        const by = (b.y + Math.cos(t * b.speed * 0.3 + i) * 0.06) * H;
        const br = b.r * Math.min(W, H);
        const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const ba = op * 0.12;

        if (light) {
          bGrad.addColorStop(0, `hsla(${b.hue},60%,55%,${ba * 0.8})`);
          bGrad.addColorStop(0.5, `hsla(${b.hue},55%,50%,${ba * 0.4})`);
          bGrad.addColorStop(1, `hsla(${b.hue},50%,45%,0)`);
        } else {
          bGrad.addColorStop(0, `hsla(${b.hue},80%,65%,${ba})`);
          bGrad.addColorStop(0.5, `hsla(${b.hue},70%,55%,${ba * 0.5})`);
          bGrad.addColorStop(1, `hsla(${b.hue},60%,45%,0)`);
        }

        ctx.save();
        ctx.filter = "blur(60px)";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.restore();
      });

      // ── Floating particles (stars/dust) ──
      if (!light) {
        particles.forEach((p) => {
          p.y -= p.speed;
          p.x += Math.sin(t * 0.8 + p.phase) * 0.0003;
          if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
          const px = p.x * W, py = p.y * H;
          const lifeAlpha = Math.min(p.y * 10, 1) * Math.min((1 - p.y) * 10, 1);
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,240,180,${p.opacity * lifeAlpha * op * 0.7})`;
          ctx.fill();
        });
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
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 1 }}
      />
    </div>
  );
}
