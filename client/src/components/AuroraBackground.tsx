// ============================================================
// Lumeo — Aurora Background (Canvas + CSS hybrid)
// Dark: Violet/Indigo animated aurora
// Light: Golden amber aurora — fully isolated palettes
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

    const isLight = () => document.documentElement.classList.contains("light");

    // Noise helpers
    const hash = (n: number) => {
      const x = Math.sin(n) * 43758.5453123;
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
        a *= 0.5;
        freq *= 2.1;
      }
      return v;
    };

    // Dark mode: violet/indigo aurora streams
    const darkStreams = [
      { hue: 270, speed: 0.00018, amplitude: 0.28, yBase: 0.30, width: 0.55 },
      { hue: 250, speed: 0.00022, amplitude: 0.22, yBase: 0.50, width: 0.45 },
      { hue: 290, speed: 0.00015, amplitude: 0.32, yBase: 0.70, width: 0.40 },
      { hue: 220, speed: 0.00020, amplitude: 0.18, yBase: 0.20, width: 0.35 },
    ];

    // Light mode: golden amber aurora streams
    const lightStreams = [
      { hue: 40,  speed: 0.00018, amplitude: 0.28, yBase: 0.30, width: 0.55 },
      { hue: 30,  speed: 0.00022, amplitude: 0.22, yBase: 0.50, width: 0.45 },
      { hue: 50,  speed: 0.00015, amplitude: 0.32, yBase: 0.70, width: 0.40 },
      { hue: 35,  speed: 0.00020, amplitude: 0.18, yBase: 0.20, width: 0.35 },
    ];

    // Dark mode: blob orbs (violet/purple)
    const darkBlobs = [
      { hue: 270, x: 0.25, y: 0.35, r: 0.30, speed: 0.00012 },
      { hue: 245, x: 0.75, y: 0.60, r: 0.25, speed: 0.00016 },
      { hue: 290, x: 0.50, y: 0.20, r: 0.20, speed: 0.00010 },
    ];

    // Light mode: golden blob orbs
    const lightBlobs = [
      { hue: 42, x: 0.25, y: 0.35, r: 0.30, speed: 0.00012 },
      { hue: 35, x: 0.75, y: 0.60, r: 0.25, speed: 0.00016 },
      { hue: 50, x: 0.50, y: 0.20, r: 0.20, speed: 0.00010 },
    ];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      const light = isLight();
      const streams = light ? lightStreams : darkStreams;
      const blobs = light ? lightBlobs : darkBlobs;

      // ── Aurora streams ──
      for (let si = 0; si < streams.length; si++) {
        const s = streams[si];
        const phase = t * s.speed;
        const alpha = op * (0.4 + 0.25 * Math.sin(phase * 1.3 + si));
        const hue = s.hue + Math.sin(phase * 0.5) * 15;

        const x0 = 0, x1 = W;
        const cx = W * 0.5;
        const cy = H * (s.yBase + s.amplitude * Math.sin(phase + si));

        const grad = ctx.createLinearGradient(x0, cy, x1, cy);

        if (light) {
          // Golden/amber streaks for light mode — extremely soft, light, low saturation
          grad.addColorStop(0, `hsla(${hue},50%,60%,0)`);
          grad.addColorStop(0.35, `hsla(${hue},60%,65%,${alpha * 0.15})`);
          grad.addColorStop(0.5, `hsla(${hue},65%,68%,${alpha * 0.25})`);
          grad.addColorStop(0.65, `hsla(${hue},60%,65%,${alpha * 0.15})`);
          grad.addColorStop(1, `hsla(${hue},50%,60%,0)`);
        } else {
          // Violet/indigo streaks for dark mode — rich and vibrant
          grad.addColorStop(0, `hsla(${hue},80%,55%,0)`);
          grad.addColorStop(0.35, `hsla(${hue},85%,60%,${alpha * 0.5})`);
          grad.addColorStop(0.5, `hsla(${hue},90%,65%,${alpha * 0.85})`);
          grad.addColorStop(0.65, `hsla(${hue},85%,60%,${alpha * 0.5})`);
          grad.addColorStop(1, `hsla(${hue},80%,55%,0)`);
        }

        ctx.save();

        ctx.beginPath();
        const steps = 60;
        for (let xi = 0; xi <= steps; xi++) {
          const px = (xi / steps) * W;
          const nx = px / W * 3.0;
          const ny = fbm(nx + phase * 0.5, si * 1.7 + phase * 0.3) - 0.5;
          const py = cy + ny * H * s.amplitude * 0.7;
          const hw = W * s.width * 0.5;

          if (xi === 0) {
            ctx.moveTo(px, py - hw);
          } else {
            ctx.lineTo(px, py - hw);
          }
        }
        for (let xi = steps; xi >= 0; xi--) {
          const px = (xi / steps) * W;
          const nx = px / W * 3.0;
          const ny = fbm(nx + phase * 0.5, si * 1.7 + phase * 0.3) - 0.5;
          const py = cy + ny * H * s.amplitude * 0.7;
          const hw = W * s.width * 0.5;
          ctx.lineTo(px, py + hw);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // ── Blob orbs ──
      for (let bi = 0; bi < blobs.length; bi++) {
        const b = blobs[bi];
        const phase = t * b.speed;
        const bx = W * (b.x + 0.12 * Math.sin(phase + bi * 1.3));
        const by = H * (b.y + 0.10 * Math.cos(phase * 0.8 + bi));
        const br = Math.min(W, H) * b.r;

        const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const bAlpha = op * (0.3 + 0.15 * Math.sin(phase * 1.1));

        if (light) {
          bGrad.addColorStop(0, `hsla(${b.hue},55%,70%,${bAlpha * 0.3})`);
          bGrad.addColorStop(0.5, `hsla(${b.hue},50%,65%,${bAlpha * 0.12})`);
          bGrad.addColorStop(1, `hsla(${b.hue},45%,60%,0)`);
        } else {
          bGrad.addColorStop(0, `hsla(${b.hue},80%,60%,${bAlpha})`);
          bGrad.addColorStop(0.5, `hsla(${b.hue},75%,50%,${bAlpha * 0.5})`);
          bGrad.addColorStop(1, `hsla(${b.hue},70%,40%,0)`);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.restore();
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
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "blur(72px)", transform: "scale(1.15)", opacity: 0.95 }}
      />
    </div>
  );
}