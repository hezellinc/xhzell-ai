import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, User, Image as ImageIcon } from 'lucide-react';
import { CanvasBackground } from './CanvasBackground';
import { AILoadingIndicator } from './AILoadingIndicator';

interface PromoAnimationProps {
  onClose: () => void;
}

export const PromoAnimation: React.FC<PromoAnimationProps> = ({ onClose }) => {
  const [scene, setScene] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  const fullText = "Create a beautiful galaxy landscape using the xspace-coder model";

  useEffect(() => {
    let timer: any;
    
    // Scene 0: Start -> wait 1s -> Scene 1
    if (scene === 0) {
      timer = setTimeout(() => setScene(1), 500);
    }
    // Scene 1: Intro texts (0-4s)
    else if (scene === 1) {
      timer = setTimeout(() => setScene(2), 4000);
    }
    // Scene 2: Features (4-8s)
    else if (scene === 2) {
      timer = setTimeout(() => setScene(3), 4000);
    }
    // Scene 3: Typing Preview (8-16s)
    else if (scene === 3) {
      // Typewriter effect
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setScene(4), 500); // Move to sending state
        }
      }, 50); // ~3.5s for 70 chars
      
      return () => {
        clearInterval(typeInterval);
        clearTimeout(timer);
      };
    }
    // Scene 4: User Sent & AI Loading (13-17s)
    else if (scene === 4) {
      timer = setTimeout(() => setScene(5), 3000); // Show loading for 3s
    }
    // Scene 5: AI Responded with highlight (17-21s)
    else if (scene === 5) {
      timer = setTimeout(() => setScene(6), 4000);
    }
    // Scene 6: CTA and Developer Info (21-26s)
    else if (scene === 6) {
      timer = setTimeout(() => setScene(7), 5000);
    }

    return () => clearTimeout(timer);
  }, [scene]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-black overflow-hidden flex items-center justify-center font-sans text-white transform-gpu"
    >
      <CanvasBackground />
      
      {/* Background Gradient Animation Specific for Promo */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 animate-pulse pointer-events-none" />

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/10"
      >
        <X size={20} />
      </button>

      <div className="relative z-10 w-full h-full max-w-4xl mx-auto flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          
          {/* SCENE 1: Intro */}
          {scene === 1 && (
            <div className="flex flex-col items-center justify-center gap-8 text-center" key="scene1">
              <motion.h1 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              >
                Meet the Next Generation AI
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="text-2xl md:text-4xl font-medium text-gray-300"
              >
                Powered by <span className="font-semibold text-white">xspace-coder</span>
              </motion.h2>
            </div>
          )}

          {/* SCENE 2: Features */}
          {scene === 2 && (
            <div className="flex flex-col items-center justify-center gap-8 text-center" key="scene2">
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-md"
              >
                <Sparkles className="text-blue-400" size={32} />
                <span className="text-3xl font-medium">Seamless Code Generation</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-md"
              >
                <ImageIcon className="text-pink-400" size={32} />
                <span className="text-3xl font-medium">Stunning Image Generation</span>
              </motion.div>
            </div>
          )}

          {/* SCENE 3-5: Typing Preview */}
          {(scene >= 3 && scene <= 5) && (
            <div className="w-full max-w-2xl flex flex-col justify-end h-full pb-20" key="scene345">
              
              <div className="flex-1 overflow-hidden flex flex-col justify-end gap-6 pb-6">
                <AnimatePresence>
                  {/* User Message */}
                  {scene >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[85%] bg-white text-black px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-lg">
                        {fullText}
                      </div>
                    </motion.div>
                  )}

                  {/* AI Loading & Response */}
                  {scene >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="flex justify-start"
                    >
                      {scene === 4 ? (
                        <div className="max-w-[85%] bg-[#18181b]/80 border border-white/10 backdrop-blur-md px-5 py-4 rounded-2xl rounded-tl-sm relative user-bubble-animated">
                           <AILoadingIndicator />
                        </div>
                      ) : (
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="max-w-[85%] bg-[#18181b]/90 border border-white/20 backdrop-blur-md px-5 py-4 rounded-2xl rounded-tl-sm relative overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />
                           <div className="flex flex-col gap-4 relative z-10">
                              <p className="text-[15px] leading-relaxed text-gray-200">
                                Sure, here is the stunning galaxy landscape you requested:
                              </p>
                              <div className="w-full h-48 bg-gradient-to-br from-indigo-900 via-purple-800 to-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-300" />
                                <Sparkles className="relative z-10 text-white/50" size={32} />
                              </div>
                           </div>
                           
                           {/* Pulsing highlight effect line */}
                           <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-full">
                              <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: 'loop' }}
                                className="w-full h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent drop-shadow-[0_0_8px_rgba(59,130,246,1)]"
                              />
                           </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Box */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full bg-[#18181b]/90 backdrop-blur-md rounded-full p-2 pl-6 shadow-2xl border border-white/10 flex items-center gap-4"
              >
                <div className="flex-1 text-white text-[15px] relative">
                  {scene === 3 ? (
                    <>
                      {typedText}
                      <motion.span 
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-[2px] h-[18px] bg-blue-400 ml-1 align-middle"
                      />
                    </>
                  ) : (
                    <span className="text-gray-500">Ask something...</span>
                  )}
                </div>
                <div className={`p-2 rounded-full ${scene === 4 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'} transition-colors`}>
                  <Send size={18} className={scene >= 4 ? 'translate-x-0.5' : ''} />
                </div>
              </motion.div>

            </div>
          )}

          {/* SCENE 6: Call to Action */}
          {scene >= 6 && (
            <div className="flex flex-col items-center justify-center gap-12 text-center" key="scene6">
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-bold"
              >
                Experience it now.
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-xl text-gray-400">Install or visit our website</p>
                <a href="#" className="relative group text-2xl font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  xhzellai.com
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                    className="absolute -bottom-1 left-0 h-[2px] bg-blue-400"
                  />
                </a>
              </motion.div>

              {scene === 7 && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-10 flex flex-col items-center gap-2"
                >
                  <span className="text-sm text-gray-500 uppercase tracking-widest">Developed By</span>
                  <span className="text-2xl font-serif italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                    Xhzell
                  </span>
                </motion.div>
              )}
            </div>
          )}

        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: scene === 0 ? '0%' : scene === 7 ? '100%' : `${(scene / 7) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

    </motion.div>
  );
};
