import React from 'react';
import { motion } from 'motion/react';
import { X, Info, Sparkles } from 'lucide-react';

interface AboutPageProps {
  onClose: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Info className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Tentang XhzellAI</h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-full hover:bg-white/5 hover:text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mb-6 overflow-hidden border border-white/20">
            <img src="/logo-app.jpg" alt="XhzellAI Logo" className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-2xl font-semibold text-white mb-2">XhzellAI</h1>
          <p className="text-gray-400 text-sm mb-6">Versi 1.0.0</p>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            XhzellAI adalah asisten kecerdasan buatan serbaguna yang didesain untuk menjadi pendamping Anda dalam meningkatkan produktivitas, menyelesaikan masalah, dan mengeksplorasi ide-ide kreatif dengan antarmuka yang bersih dan interaktif.
          </p>
          
          <div className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-400 space-y-2 text-left">
            <div className="flex justify-between">
              <span>Pengembang</span>
              <span className="text-gray-200">Xhzell</span>
            </div>
            <div className="flex justify-between">
              <span>Ditenagai Oleh</span>
              <span className="text-gray-200">Xspace Models</span>
            </div>
            <div className="flex justify-between">
              <span>Hak Cipta</span>
              <span className="text-gray-200">© 2026 Xhzell. All rights reserved.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
