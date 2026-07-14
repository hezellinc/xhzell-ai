import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
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
        className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Kebijakan Privasi</h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-full hover:bg-white/5 hover:text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-300 space-y-5 leading-relaxed">
          <p>
            Privasi Anda sangat penting bagi kami di XhzellAI. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform kami.
          </p>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">1. Informasi yang Kami Kumpulkan</h3>
            <p>
              Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun (alamat email, nama), dan interaksi percakapan yang Anda lakukan dengan AI, untuk meningkatkan kualitas layanan dan pengalaman Anda.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">2. Penggunaan Informasi</h3>
            <p>
              Informasi yang kami kumpulkan digunakan untuk mengoperasikan, memelihara, dan menyediakan fitur layanan, serta berkomunikasi dengan Anda (seperti mengirimkan pemberitahuan penting terkait akun).
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">3. Keamanan Data</h3>
            <p>
              Kami menerapkan standar keamanan terbaik di kelasnya untuk melindungi data Anda dari akses, perubahan, atau pengungkapan yang tidak sah. Data percakapan dan akun Anda disimpan menggunakan enkripsi canggih di infrastruktur cloud yang aman.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">4. Berbagi Informasi</h3>
            <p>
              Kami tidak akan menjual, menyewakan, atau membagikan informasi identifikasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran mereka tanpa persetujuan eksplisit Anda.
            </p>
          </div>

          <p className="text-xs text-gray-500 pt-4 border-t border-white/5">
            Terakhir diperbarui: 10 Juli 2026
          </p>
        </div>
        
        <div className="p-5 border-t border-white/5 flex-shrink-0 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            Tutup
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
