import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Shield, Eye, Database, Trash2, History, AlertTriangle } from 'lucide-react';

interface PrivacySettingsProps {
  onBack: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onBack }) => {
  const [dataCollection, setDataCollection] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [activityHistory, setActivityHistory] = useState(true);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleDeleteHistory = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setMessage({ type: 'success', text: 'Riwayat percakapan berhasil dihapus.' });
      setTimeout(() => setMessage(null), 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col"
    >
      <div className="flex items-center space-x-4 mt-8 mb-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-200" />
        </motion.button>
        <h2 className="text-3xl font-serif italic text-white tracking-wide">Privasi</h2>
      </div>

      <div className="space-y-6">
        {/* Toggle Switches */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-pink-400 mr-3" />
            <h3 className="text-lg font-medium text-white">Kontrol Data Anda</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Pengumpulan Data Anonim</h4>
                <p className="text-sm text-gray-400">Bantu kami meningkatkan aplikasi dengan membagikan data penggunaan secara anonim.</p>
              </div>
              <button 
                onClick={() => setDataCollection(!dataCollection)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${dataCollection ? 'bg-pink-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: dataCollection ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Personalisasi AI</h4>
                <p className="text-sm text-gray-400">Izinkan AI untuk mempelajari preferensi Anda demi memberikan respon yang lebih relevan.</p>
              </div>
              <button 
                onClick={() => setPersonalization(!personalization)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${personalization ? 'bg-pink-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: personalization ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Simpan Riwayat Aktivitas</h4>
                <p className="text-sm text-gray-400">Simpan otomatis percakapan Anda untuk diakses kembali nanti.</p>
              </div>
              <button 
                onClick={() => setActivityHistory(!activityHistory)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${activityHistory ? 'bg-pink-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: activityHistory ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Delete History */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <History className="w-6 h-6 text-orange-400 mr-3" />
            <h3 className="text-lg font-medium text-white">Riwayat Percakapan</h3>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-4">
              <h4 className="text-white font-medium flex items-center mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                Hapus Semua Riwayat
              </h4>
              <p className="text-sm text-red-200/70">Tindakan ini akan menghapus semua riwayat percakapan dari perangkat ini secara permanen. Tidak dapat dibatalkan.</p>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteHistory}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex-shrink-0 flex items-center justify-center min-w-[120px]"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </>
              )}
            </motion.button>
          </div>
          
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-3 rounded-lg text-sm text-center ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
