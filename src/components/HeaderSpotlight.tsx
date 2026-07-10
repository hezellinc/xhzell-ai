import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderSpotlightProps {
  isLoading: boolean;
}

export const HeaderSpotlight: React.FC<HeaderSpotlightProps> = ({ isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!show) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let startTime = Date.now();
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 150; // Height of the header spotlight area
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const render = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = elapsed * 0.002;
      
      // Create spotlight gradients moving slowly
      const cx1 = canvas.width * 0.3 + Math.sin(time) * canvas.width * 0.2;
      const cy1 = 0;
      const r1 = canvas.width * 0.5;
      
      const cx2 = canvas.width * 0.7 + Math.cos(time * 1.2) * canvas.width * 0.2;
      const cy2 = 0;
      const r2 = canvas.width * 0.5;
      
      // Blue spotlight
      const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, r1);
      grad1.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // blue-500
      grad1.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Pink spotlight
      const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
      grad2.addColorStop(0, 'rgba(236, 72, 153, 0.5)'); // pink-500
      grad2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-0 w-full h-[150px] pointer-events-none z-0"
        />
      )}
    </AnimatePresence>
  );
};
