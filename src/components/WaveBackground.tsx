"use client";

import { useEffect, useRef } from "react";

// --- CONFIGURATION ---
const WAVE_COUNT = 5;           // Number of overlapping waves
const PARTICLE_COUNT = 800;     // Number of particles
const WAVE_SPEED = 0.01;        // Slower speed for ultra-smooth movement
const PARTICLE_SPEED = 1.5;     // Particle horizontal speed
const BASE_AMPLITUDE = 100;     // Base vertical amplitude
const PARTICLE_JITTER = 0.15;   // Vertical jitter for particles

class Particle {
  x: number;
  y: number;
  radius: number;
  hue: number;
  lifetime: number;
  maxLifetime: number;

  constructor(x: number, y: number, hue: number) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 1.5 + 0.8;
    this.hue = hue;
    this.maxLifetime = 120 + Math.random() * 150;
    this.lifetime = 0;
  }

  update() {
    this.x += PARTICLE_SPEED * (0.7 + Math.random() * 0.5);
    this.y += (Math.random() - 0.5) * PARTICLE_JITTER;
    this.lifetime++;
  }

  isDead(width: number) {
    return this.lifetime >= this.maxLifetime || this.x > width;
  }
}

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const center = height / 2;

    const particles: Particle[] = [];
    let time = 0;
    let animationFrameId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // --- Smooth Wave Function ---
    const getWaveY = (x: number, t: number, amp: number, freq: number, phase: number) => {
      // Smoothed combination of sine waves
      const y1 = Math.sin(x * freq + t * phase) * amp;
      const y2 = Math.sin(x * freq * 1.2 + t * phase * 0.6) * (amp * 0.35);
      const y3 = Math.sin(x * freq * 0.5 + t * phase * 0.8) * (amp * 0.2);
      return center + y1 + y2 + y3;
    };

    const getHue = (x: number) => {
      const pos = x / width;
      if (pos < 0.25) return 0 + pos * 50;       // Red → Orange-Red
      if (pos < 0.5) return 20 + (pos - 0.25) * 40; // Orange → Yellow-Orange
      if (pos < 0.75) return 40 + (pos - 0.5) * 25; // Yellow → Light Yellow
      return 50;                                  // Subtle golden end
    };

    const animate = () => {
      // --- Gradient Background for Warm Brown Login Box ---
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#2e1c0e"); // Dark brown top
      bgGradient.addColorStop(0.5, "#4b2e1b"); // Medium brown center
      bgGradient.addColorStop(1, "#7b4c2f"); // Warm brown bottom
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // --- DRAW WAVES ---
      for (let i = WAVE_COUNT; i >= 1; i--) {
        ctx.beginPath();
        const amp = BASE_AMPLITUDE + i * 12; // Slightly smaller amplitude for smoothness
        const freq = 0.0035;                 // Lower frequency for longer waves
        const phase = 0.4 + i * 0.05;
        const thickness = 3 + i * 2.5;

        for (let x = 0; x <= width; x += 1) {
          const y = getWaveY(x, time, amp, freq, phase);
          ctx.lineTo(x, y);
        }

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "hsl(0, 80%, 35%)");      // Deep Red
        gradient.addColorStop(0.25, "hsl(20, 80%, 45%)");  // Orange-Red
        gradient.addColorStop(0.5, "hsl(35, 90%, 50%)");   // Warm Yellow-Orange
        gradient.addColorStop(0.75, "hsl(50, 90%, 55%)");  // Golden Yellow
        gradient.addColorStop(1, "hsl(40, 80%, 45%)");     // Soft Orange

        ctx.strokeStyle = gradient;
        ctx.lineWidth = thickness;

        ctx.shadowColor = `hsl(${i * 15}, 100%, 60%)`;
        ctx.shadowBlur = (WAVE_COUNT - i) * 16 + 12;

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      // --- PARTICLES ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.isDead(width)) particles.splice(i, 1);
      }

      while (particles.length < PARTICLE_COUNT) {
        const startX = 0;
        const startY = getWaveY(startX, time, BASE_AMPLITUDE + 25, 0.0035, 0.55) + (Math.random() - 0.5) * 60;
        particles.push(new Particle(startX, startY, getHue(startX)));
      }

      particles.forEach((p) => {
        const currentHue = getHue(p.x);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.shadowBlur = p.radius * 5;
        ctx.shadowColor = `hsl(${currentHue}, 100%, 80%)`;
        const lightness = 75 + Math.abs(Math.sin(p.lifetime * 0.08) * 15);
        ctx.fillStyle = `hsl(${currentHue}, 100%, ${lightness}%)`;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      });

      time += WAVE_SPEED;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-20 w-full h-full" />;
}
