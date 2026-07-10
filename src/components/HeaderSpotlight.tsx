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
      
      // Create spotlight gradients moving slowly (blob / half-moon effect)
      const r1 = Math.min(canvas.width * 0.6, 500);
      const cx1 = canvas.width * 0.35 + Math.sin(time) * canvas.width * 0.15;
      const cy1 = -30; // slightly above so it looks like a half-moon/blob coming from top
      
      const r2 = Math.min(canvas.width * 0.6, 500);
      const cx2 = canvas.width * 0.65 + Math.cos(time * 1.2) * canvas.width * 0.15;
      const cy2 = -30;
      
      // Calculate scale to ensure the gradient fully fades out within canvas.height
      // We want the gradient's bottom edge (cy + r) * scaleY <= canvas.height
      const scaleY1 = canvas.height / (r1 + cy1);
      const scaleY2 = canvas.height / (r2 + cy2);
      
      // Blue spotlight (Blob 1)
      ctx.save();
      ctx.scale(1, scaleY1);
      const grad1 = ctx.createRadialGradient(cx1, cy1/scaleY1, 0, cx1, cy1/scaleY1, r1);
      grad1.addColorStop(0, 'rgba(59, 130, 246, 0.7)'); // blue-500
      grad1.addColorStop(0.4, 'rgba(59, 130, 246, 0.3)');
      grad1.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height / scaleY1);
      ctx.restore();
      
      // Pink spotlight (Blob 2)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.scale(1, scaleY2);
      const grad2 = ctx.createRadialGradient(cx2, cy2/scaleY2, 0, cx2, cy2/scaleY2, r2);
      grad2.addColorStop(0, 'rgba(236, 72, 153, 0.7)'); // pink-500
      grad2.addColorStop(0.4, 'rgba(236, 72, 153, 0.3)');
      grad2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height / scaleY2);
      ctx.restore();
      
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
