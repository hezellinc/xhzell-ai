import React, { useEffect, useRef } from 'react';

export const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    class Orb {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      angle: number;
      speed: number;

      constructor(x: number, y: number, radius: number, color: string) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.001 + Math.random() * 0.002;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }

      update() {
        // Soft floating motion using sine/cosine
        this.angle += this.speed;
        this.x = this.baseX + Math.cos(this.angle) * 150;
        this.y = this.baseY + Math.sin(this.angle) * 150;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initOrbs = () => {
      const minDimension = Math.min(width, height);
      return [
        new Orb(width * 0.2, height * 0.2, minDimension * 0.6, 'rgba(255, 105, 180, 0.12)'), // Pink
        new Orb(width * 0.8, height * 0.8, minDimension * 0.7, 'rgba(59, 130, 246, 0.12)'), // Blue
        new Orb(width * 0.6, height * 0.3, minDimension * 0.5, 'rgba(239, 68, 68, 0.08)'),   // Red
        new Orb(width * 0.3, height * 0.7, minDimension * 0.6, 'rgba(249, 115, 22, 0.08)'),  // Orange
      ];
    };

    let orbs = initOrbs();

    let resizeTimeout: any;
    const handleResizeEnd = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        orbs = initOrbs();
      }, 200);
    };
    window.addEventListener('resize', handleResizeEnd);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      orbs.forEach(orb => {
        orb.update();
        orb.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', handleResizeEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 bg-transparent transition-colors duration-500"
    />
  );
};
