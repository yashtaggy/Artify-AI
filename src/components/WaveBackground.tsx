"use client";

import { useEffect, useRef } from "react";

// --- CONFIGURATION ---
const WAVE_COUNT = 5;           // Number of overlapping waves
const PARTICLE_COUNT = 800;     // Number of particles
const WAVE_SPEED = 0.01;        // Slower speed for ultra-smooth movement
const PARTICLE_SPEED = 1.5;     // Particle horizontal speed
const BASE_AMPLITUDE = 100;     // Base vertical amplitude
const PARTICLE_JITTER = 0.15;   // Vertical jitter for particles

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

    // --- Vibrant Hue Cycle for Particles (Violet, Green, Coral) ---
    const getHue = (x: number) => {
      // Cycles through a range of hues for the vibrant, ethereal effect
      const pos = (x / width) * 5; // Cycle 5 times across the width
      return (260 + pos * 35) % 360; // Start at Violet (260) and shift dramatically
    };

    const animate = () => {
      // --- Gradient Background (Deep Blue/Violet matching Dark Mode) ---
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "hsl(240, 20%, 8%)");    // Deep Lapis Blue top
      bgGradient.addColorStop(0.5, "hsl(250, 25%, 12%)"); // Medium Violet center
      bgGradient.addColorStop(1, "hsl(260, 30%, 15%)");   // Deep Violet bottom
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // --- DRAW WAVES ---
      for (let i = WAVE_COUNT; i >= 1; i--) {
        ctx.beginPath();
        const amp = BASE_AMPLITUDE + i * 12; // Amplitude control
        const freq = 0.0035;                 // Frequency control
        const phase = 0.4 + i * 0.05;
        const thickness = 3 + i * 2.5;

        for (let x = 0; x <= width; x += 1) {
          const y = getWaveY(x, time, amp, freq, phase);
          ctx.lineTo(x, y);
        }

        // High-Vibrancy Gradient for Waves
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "hsl(260, 90%, 75%)");    // Primary Violet
        gradient.addColorStop(0.25, "hsl(120, 80%, 60%)");  // Hyper Green
        gradient.addColorStop(0.5, "hsl(0, 100%, 68%)");   // Neon Coral
        gradient.addColorStop(0.75, "hsl(200, 90%, 70%)");  // Bright Cyan
        gradient.addColorStop(1, "hsl(260, 90%, 75%)");     // Primary Violet

        ctx.strokeStyle = gradient;
        ctx.lineWidth = thickness;

        // Shadow uses a hue that shifts based on the wave layer
        const shadowHue = (260 + i * 40) % 360; 
        ctx.shadowColor = `hsl(${shadowHue}, 100%, 65%)`;
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
        // Particles glow brightly with high lightness
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
