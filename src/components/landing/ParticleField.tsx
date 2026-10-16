"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#a855f7", "#22d3ee", "#f472b6"];

// Hafif parçacık arka planı — reduce-motion ve gizli sekmede pasif kalır
export default function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = window.innerWidth < 640 ? 26 : 46;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00045,
      vy: (Math.random() - 0.5) * 0.00045,
      r: 0.8 + Math.random() * 1.9,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: 0.25 + Math.random() * 0.45,
    }));

    const step = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx * (t % 1000);
        p.y += p.vy * (t % 1000);
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02) p.y = -0.02;
      }
      // bağlantı
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ax = a.x * w;
        const ay = a.y * h;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = ax - b.x * w;
          const dy = ay - b.y * h;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - d / 110) * 0.13})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
        ctx.fillStyle = a.color;
        ctx.globalAlpha = a.a;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none ${className}`} aria-hidden />;
}
