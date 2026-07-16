import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ImageIcon } from 'lucide-react';

export const AILoadingIndicator: React.FC<{ isImageMode?: boolean }> = ({ isImageMode }) => {
  const [loadingText, setLoadingText] = useState("Membuat Gambar...");
  const texts = [
    "Membuat Gambar...",
    "Menambahkan detail...",
    "Memoles warna...",
    "Menerapkan gaya seni..."
  ];

  useEffect(() => {
    if (!isImageMode) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isImageMode]);

  if (isImageMode) {
    return (
      <div className="flex flex-col gap-2 w-64">
        <span className="text-sm text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          {loadingText}
        </span>
        <div className="w-full h-48 rounded-xl bg-white/5 relative overflow-hidden border border-white/10 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ width: "200%" }}
            animate={{ x: ["-100%", "50%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <ImageIcon className="w-8 h-8 text-white/20 animate-pulse relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 w-fit shadow-sm">
      <div className="relative flex items-center justify-center w-6 h-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-red-500"
          style={{ filter: 'blur(2px)' }}
          animate={{
            rotate: 360,
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-red-500"
          animate={{
            rotate: -360,
          }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: "linear" }
          }}
        />
        <div className="absolute inset-[2px] bg-black/80 rounded-full flex items-center justify-center">
           <Sparkles className="w-3 h-3 text-white/90" />
        </div>
      </div>
      
      <div className="flex items-center space-x-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: i === 0 ? '#c084fc' : i === 1 ? '#60a5fa' : '#f87171'
            }}
            animate={{
              y: ["0%", "-60%", "0%"],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
};
