
import React, { useEffect, useRef } from 'react';
import { NovaResponse } from '../types';

interface BackgroundMatrixProps {
    audioLevel?: number;
    novaState?: NovaResponse | null;
}

const BackgroundMatrix: React.FC<BackgroundMatrixProps> = ({ audioLevel = 0, novaState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shockwaves = useRef<{r: number, opacity: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Star/Particle System
    const particles: {x: number, y: number, z: number, size: number}[] = [];
    for(let i=0; i<120; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.5,
            size: Math.random() * 1.5
        });
    }

    const animate = () => {
      // Logic for sleep state
      const isSleeping = novaState?.wake_state === 'sleep';
      const globalSpeedFactor = isSleeping ? 0.2 : 1;
      const globalAlphaFactor = isSleeping ? 0.3 : 1;

      // Clear with slight trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * globalAlphaFactor})`; 
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.55; 
      const intensity = Math.min(1, audioLevel / 80) * globalAlphaFactor;

      // 1. DYNAMIC CORE
      const coreSize = (100 + (intensity * 50));
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 3);
      gradient.addColorStop(0, `rgba(34, 211, 238, ${(0.1 + intensity * 0.2) * globalAlphaFactor})`);
      gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.05 * globalAlphaFactor})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. SHOCKWAVES (Triggered by voice peaks)
      if (audioLevel > 25 && Math.random() > 0.9 && !isSleeping) {
          shockwaves.current.push({ r: 50, opacity: 0.8 });
      }

      shockwaves.current.forEach((sw, i) => {
          sw.r += (4 + (intensity * 5)) * globalSpeedFactor;
          sw.opacity *= 0.96;
          
          if (sw.opacity < 0.01) {
              shockwaves.current.splice(i, 1);
          } else {
              ctx.beginPath();
              ctx.ellipse(cx, cy, sw.r, sw.r * 0.4, 0, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(34, 211, 238, ${sw.opacity * globalAlphaFactor})`;
              ctx.lineWidth = 2;
              ctx.stroke();
          }
      });

      // 3. 3D FLOOR GRID
      ctx.beginPath();
      ctx.strokeStyle = `rgba(6, 182, 212, ${(0.15 + intensity * 0.1) * globalAlphaFactor})`;
      ctx.lineWidth = 1;
      
      const horizon = cy;
      const fov = 300;
      
      // Vertical Lines
      for (let x = -width; x < width * 2; x += 100) {
           const xOffset = x - cx;
           ctx.moveTo(cx + xOffset * 0.1, horizon);
           ctx.lineTo(x, height);
      }

      // Horizontal Lines
      const speed = Date.now() * 0.05 * globalSpeedFactor + (intensity * 100);
      for (let z = 0; z < 20; z++) {
          const depth = (z * 100 + speed) % 2000;
          if (depth < 10) continue;
          const y = horizon + (fov * 100) / depth;
          if (y > height) continue;
          
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 4. PARTICLES
      ctx.fillStyle = '#22d3ee';
      particles.forEach(p => {
          p.y -= (0.2 + (intensity * 2)) * globalSpeedFactor; // Rise speed
          if (p.y < 0) p.y = height;
          
          const alpha = (Math.random() * 0.5 + 0.2) * globalAlphaFactor;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    const handleResize = () => {
        if (!canvasRef.current) return;
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
    };
  }, [audioLevel, novaState]);

  return (
    <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-lighten"
    />
  );
};

export default BackgroundMatrix;
