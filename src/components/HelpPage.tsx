import React from 'react';
import { motion } from 'motion/react';
import { X, HelpCircle, Mail, MessageSquare, BookOpen } from 'lucide-react';

interface HelpPageProps {
  onClose: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onClose }) => {
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
        className="w-full max-w-2xl bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <HelpCircle className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Bantuan & Dukungan</h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-full hover:bg-white/5 hover:text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            Punya pertanyaan atau butuh bantuan saat menggunakan XhzellAI? Kami siap membantu. Berikut adalah sumber daya yang dapat Anda gunakan untuk menemukan jawaban.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium text-gray-200">Panduan Pengguna</h3>
              </div>
              <p className="text-xs text-gray-400">
                Pelajari dasar-dasar menggunakan asisten AI, mengelola riwayat chat, dan mengatur profil Anda.
              </p>
            </div>
            
            <div className="p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-medium text-gray-200">FAQ (Tanya Jawab)</h3>
              </div>
              <p className="text-xs text-gray-400">
                Jawaban cepat atas pertanyaan yang paling sering diajukan mengenai layanan kami.
              </p>
            </div>
          </div>
          
          <div className="p-5 border border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-transparent">
            <h3 className="font-medium text-gray-200 mb-2">Hubungi Tim Kami</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Jika Anda tidak menemukan jawaban yang Anda cari atau mengalami kendala teknis, jangan ragu untuk menghubungi kami secara langsung.
            </p>
            <a href="mailto:support@xhzell.com" className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/5 rounded-lg transition-colors text-sm text-gray-200">
              <Mail className="w-4 h-4" />
              <span>support@xhzell.com</span>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
