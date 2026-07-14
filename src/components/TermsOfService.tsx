import React from 'react';
import { motion } from 'motion/react';
import { X, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
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
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Syarat Penggunaan</h2>
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
            Selamat datang di XhzellAI. Terima kasih telah menggunakan layanan kami. Dengan mengakses dan menggunakan XhzellAI, Anda menyetujui syarat dan ketentuan berikut ini. Harap membacanya dengan saksama.
          </p>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">1. Penggunaan Layanan</h3>
            <p>
              Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah dan dengan cara yang tidak melanggar hak atau membatasi penggunaan orang lain terhadap layanan kami. XhzellAI dirancang untuk membantu produktivitas, pembelajaran, dan kreativitas Anda.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">2. Akun Anda</h3>
            <p>
              Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Semua aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya. Kami berhak membatalkan akun jika terjadi pelanggaran terhadap kebijakan kami.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">3. Batasan Tanggung Jawab</h3>
            <p>
              XhzellAI berbasis kecerdasan buatan dan dapat menghasilkan informasi yang mungkin tidak sepenuhnya akurat. Kami selalu menyarankan agar Anda memverifikasi informasi krusial sebelum menggunakannya. Kami tidak bertanggung jawab atas kerugian apa pun yang mungkin timbul dari penggunaan platform ini.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-100 mb-2">4. Perubahan Layanan</h3>
            <p>
              Kami terus berinovasi dan meningkatkan kualitas layanan kami. Oleh karena itu, fitur XhzellAI dapat berubah dari waktu ke waktu, dan kami dapat menambah, mengubah, atau menghapus fitur tanpa pemberitahuan sebelumnya.
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
