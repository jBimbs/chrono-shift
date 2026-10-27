"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number; // px per second
  vy: number; // px per second (negative = rising)
  alpha: number;
  phase: number;
  speed: number; // twinkle speed
};

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let last = performance.now();

    function make(): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 14,
        vy: -(4 + Math.random() * 18),
        alpha: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.4,
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.max(40, Math.floor((w * h) / 12000)));
      particles = Array.from({ length: count }, make);
    }

    function draw(t: number, dt: number) {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          // wrap around the edges
          if (p.y < -5) {
            p.y = h + 5;
            p.x = Math.random() * w;
          }
          if (p.x < -5) p.x = w + 5;
          if (p.x > w + 5) p.x = -5;
        }

        const twinkle = reduceMotion
          ? 1
          : 0.55 + 0.45 * Math.sin(t / 1000 * p.speed + p.phase);
        const a = p.alpha * twinkle;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${a})`;
        ctx!.shadowColor = "rgba(255,255,255,0.8)";
        ctx!.shadowBlur = p.r * 4;
        ctx!.fill();
      }
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      draw(performance.now(), 0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[2]"
    />
  );
}