import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; life: number;
  color?: string; angle?: number; rotSpeed?: number;
}

const COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];
const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";

function createParticles(canvas: HTMLCanvasElement, type: string) {
  const ctx = canvas.getContext("2d")!;
  const particles: Particle[] = [];
  let animId: number;
  let time = 0;

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);

  const counts: Record<string, number> = {
    snow: 80, rain: 150, stars: 60, bubbles: 30, confetti: 60,
    fireflies: 40, aurora: 0, matrix: 50, geometric: 25,
    sakura: 35, sparkle: 50, smoke: 20, neon_grid: 0, bokeh: 25, waves: 0,
  };
  const count = counts[type] || 60;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: type === "matrix" ? Math.floor(Math.random() * (canvas.width / 14)) * 14 : Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (type === "confetti" ? 2 : type === "sakura" ? 1 : 0.5),
      vy: type === "rain" ? 8 + Math.random() * 6 : type === "snow" ? 0.5 + Math.random() * 1.5 : type === "bubbles" ? -(0.3 + Math.random() * 0.7) : type === "confetti" ? 1 + Math.random() * 2 : type === "sakura" ? 0.5 + Math.random() * 1 : type === "matrix" ? 2 + Math.random() * 4 : type === "smoke" ? -(0.2 + Math.random() * 0.3) : 0,
      size: type === "rain" ? 1.5 : type === "bokeh" ? 10 + Math.random() * 30 : type === "smoke" ? 20 + Math.random() * 40 : type === "sakura" ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
      opacity: type === "bokeh" ? 0.05 + Math.random() * 0.12 : type === "smoke" ? 0.03 + Math.random() * 0.06 : 0.3 + Math.random() * 0.5,
      life: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.016;

    if (type === "aurora") {
      drawAurora(ctx, canvas, time);
    } else if (type === "neon_grid") {
      drawNeonGrid(ctx, canvas, time);
    } else if (type === "waves") {
      drawWaves(ctx, canvas, time);
    } else {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.02;
        if (p.angle !== undefined && p.rotSpeed) p.angle += p.rotSpeed;

        if (type === "fireflies") {
          p.x += Math.sin(p.life) * 0.5;
          p.y += Math.cos(p.life * 0.7) * 0.5;
          p.opacity = 0.2 + Math.abs(Math.sin(p.life)) * 0.6;
        }
        if (type === "sparkle") {
          p.x += Math.sin(p.life * 1.5) * 0.3;
          p.y += Math.cos(p.life) * 0.3;
          p.opacity = Math.abs(Math.sin(p.life * 2)) * 0.8;
        }

        // Wrap
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        if (p.y < -20 && (type === "bubbles" || type === "smoke")) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        ctx.globalAlpha = p.opacity;

        if (type === "snow") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff"; ctx.fill();
        } else if (type === "rain") {
          ctx.strokeStyle = "rgba(174,194,224,0.5)"; ctx.lineWidth = p.size * 0.5;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx, p.y + p.vy * 0.5); ctx.stroke();
        } else if (type === "stars") {
          p.opacity = 0.2 + Math.abs(Math.sin(p.life)) * 0.7;
          ctx.globalAlpha = p.opacity;
          drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.4);
          ctx.fillStyle = "#fde68a"; ctx.fill();
        } else if (type === "bubbles") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(147,197,253,0.4)"; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fill();
        } else if (type === "confetti") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle || 0) * Math.PI / 180);
          ctx.fillStyle = p.color || COLORS[0];
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          ctx.restore();
        } else if (type === "fireflies") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          g.addColorStop(0, "rgba(250,204,21,0.8)"); g.addColorStop(1, "rgba(250,204,21,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2); ctx.fill();
        } else if (type === "sakura") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle || 0) * Math.PI / 180);
          ctx.fillStyle = `rgba(255,${150 + Math.floor(Math.random() * 30)},${180 + Math.floor(Math.random() * 30)},${p.opacity})`;
          ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else if (type === "matrix") {
          ctx.fillStyle = `rgba(0,255,65,${p.opacity})`;
          ctx.font = "14px monospace";
          ctx.fillText(MATRIX_CHARS[Math.floor(p.life * 10) % MATRIX_CHARS.length], p.x, p.y);
        } else if (type === "geometric") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle || 0) * Math.PI / 180);
          ctx.strokeStyle = p.color || COLORS[0]; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.15 + Math.abs(Math.sin(p.life)) * 0.15;
          const sides = 3 + Math.floor(p.life) % 4;
          ctx.beginPath();
          for (let s = 0; s <= sides; s++) {
            const a = (s / sides) * Math.PI * 2;
            const method = s === 0 ? "moveTo" : "lineTo";
            ctx[method](Math.cos(a) * p.size * 4, Math.sin(a) * p.size * 4);
          }
          ctx.closePath(); ctx.stroke(); ctx.restore();
          p.x += Math.sin(p.life * 0.3) * 0.2; p.y += Math.cos(p.life * 0.2) * 0.2;
        } else if (type === "sparkle") {
          drawStar(ctx, p.x, p.y, 4, p.size * 1.5, p.size * 0.3);
          ctx.fillStyle = "#ffffff"; ctx.fill();
        } else if (type === "smoke") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          g.addColorStop(0, `rgba(200,200,200,${p.opacity})`); g.addColorStop(1, "rgba(200,200,200,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          p.size += 0.05; p.opacity *= 0.999;
          if (p.opacity < 0.005) { p.y = canvas.height + 20; p.size = 20 + Math.random() * 40; p.opacity = 0.03 + Math.random() * 0.06; }
        } else if (type === "bokeh") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color || COLORS[0]; ctx.fill();
          p.x += Math.sin(p.life * 0.2) * 0.3; p.y += Math.cos(p.life * 0.15) * 0.2;
        }
      }
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  };

  draw();
  return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    ctx[i === 0 ? "moveTo" : "lineTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawAurora(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) {
  const colors = [
    [0, 255, 128], [0, 200, 255], [128, 0, 255], [0, 255, 200],
  ];
  for (let layer = 0; layer < 4; layer++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 4) {
      const y = canvas.height * 0.3 + Math.sin(x * 0.003 + time * 0.5 + layer) * 60 + Math.sin(x * 0.007 + time * 0.3 + layer * 2) * 40 + layer * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    const c = colors[layer];
    const g = ctx.createLinearGradient(0, canvas.height * 0.2, 0, canvas.height * 0.7);
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.08)`);
    g.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},0.04)`);
    g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = g; ctx.fill();
  }
}

function drawNeonGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) {
  const spacing = 60;
  const perspective = canvas.height * 0.6;
  ctx.strokeStyle = "rgba(0,255,255,0.12)"; ctx.lineWidth = 0.5;
  for (let x = 0; x <= canvas.width; x += spacing) {
    const wave = Math.sin(x * 0.01 + time) * 5;
    ctx.beginPath(); ctx.moveTo(x, perspective + wave); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = perspective; y <= canvas.height; y += spacing * 0.5) {
    const wave = Math.sin(y * 0.02 + time * 0.5) * 3;
    ctx.beginPath(); ctx.moveTo(0, y + wave); ctx.lineTo(canvas.width, y + wave); ctx.stroke();
  }
  const glow = ctx.createLinearGradient(0, perspective - 20, 0, perspective + 20);
  glow.addColorStop(0, "rgba(255,0,255,0)"); glow.addColorStop(0.5, "rgba(255,0,255,0.08)"); glow.addColorStop(1, "rgba(255,0,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, perspective - 20, canvas.width, 40);
}

function drawWaves(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) {
  const waveColors = ["rgba(59,130,246,0.06)", "rgba(16,185,129,0.05)", "rgba(139,92,246,0.04)", "rgba(236,72,153,0.03)"];
  for (let w = 0; w < 4; w++) {
    ctx.beginPath(); ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 3) {
      const y = canvas.height * (0.6 + w * 0.08) + Math.sin(x * 0.004 + time * (0.3 + w * 0.1) + w * 1.5) * 40 + Math.sin(x * 0.008 + time * 0.2) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height); ctx.closePath();
    ctx.fillStyle = waveColors[w]; ctx.fill();
  }
}

export default function OverlayEffects() {
  const { overlayEffect } = useSiteSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!overlayEffect.enabled || overlayEffect.type === "none" || !canvasRef.current) return;
    return createParticles(canvasRef.current, overlayEffect.type);
  }, [overlayEffect]);

  if (!overlayEffect.enabled || overlayEffect.type === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ mixBlendMode: ["snow", "rain", "smoke"].includes(overlayEffect.type) ? "screen" : "normal" }}
    />
  );
}
