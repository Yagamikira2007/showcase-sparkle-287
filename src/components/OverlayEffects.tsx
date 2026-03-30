import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useEffect, useRef } from "react";

function createParticles(canvas: HTMLCanvasElement, type: string) {
  const ctx = canvas.getContext("2d")!;
  const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number }[] = [];
  let animId: number;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const count = type === "snow" ? 80 : type === "rain" ? 150 : type === "bubbles" ? 30 : type === "fireflies" ? 40 : type === "confetti" ? 60 : 60;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (type === "snow" ? 0.5 : type === "confetti" ? 2 : 0.3),
      vy: type === "rain" ? 8 + Math.random() * 6 : type === "snow" ? 0.5 + Math.random() * 1.5 : type === "bubbles" ? -(0.3 + Math.random() * 0.7) : type === "confetti" ? 1 + Math.random() * 2 : 0,
      size: type === "rain" ? 1.5 : type === "snow" ? 2 + Math.random() * 3 : type === "bubbles" ? 3 + Math.random() * 6 : type === "confetti" ? 4 + Math.random() * 4 : 2 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
      life: Math.random() * Math.PI * 2,
    });
  }

  const colors = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.02;

      if (type === "fireflies") {
        p.x += Math.sin(p.life) * 0.5;
        p.y += Math.cos(p.life * 0.7) * 0.5;
        p.opacity = 0.2 + Math.abs(Math.sin(p.life)) * 0.6;
      }

      // Wrap around
      if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
      if (p.y < -10 && type === "bubbles") { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.x < -10) p.x = canvas.width + 10;

      ctx.globalAlpha = p.opacity;

      if (type === "snow") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      } else if (type === "rain") {
        ctx.strokeStyle = "rgba(174,194,224,0.5)";
        ctx.lineWidth = p.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx, p.y + p.vy * 0.5);
        ctx.stroke();
      } else if (type === "stars") {
        p.opacity = 0.2 + Math.abs(Math.sin(p.life)) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fde68a";
        ctx.fill();
      } else if (type === "bubbles") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(147,197,253,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (type === "confetti") {
        ctx.fillStyle = colors[Math.floor(p.life * 3) % colors.length];
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      } else if (type === "fireflies") {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, "rgba(250,204,21,0.8)");
        gradient.addColorStop(1, "rgba(250,204,21,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  };

  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
  };
}

export default function OverlayEffects() {
  const { overlayEffect } = useSiteSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!overlayEffect.enabled || overlayEffect.type === "none" || !canvasRef.current) return;
    const cleanup = createParticles(canvasRef.current, overlayEffect.type);
    return cleanup;
  }, [overlayEffect]);

  if (!overlayEffect.enabled || overlayEffect.type === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ mixBlendMode: overlayEffect.type === "snow" || overlayEffect.type === "rain" ? "screen" : "normal" }}
    />
  );
}
