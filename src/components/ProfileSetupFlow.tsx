import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChevronRight, ChevronDown } from 'lucide-react';

interface ProfileSetupFlowProps {
  onComplete: () => void;
}

const MONTHS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

export const ProfileSetupFlow: React.FC<ProfileSetupFlowProps> = ({ onComplete }) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    day: '',
    month: '',
    year: '',
    gender: ''
  });
  const [progress, setProgress] = useState(0);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCreatingAccount) {
      // Simulate account creation animation for 3 seconds
      const duration = 3000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setProgress((currentStep / steps) * 100);
        if (currentStep >= steps) {
          clearInterval(timer);
          setTimeout(() => setIsCreatingAccount(false), 200); // slight delay before switching
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isCreatingAccount]);

  const canProceed = formData.fullName && formData.day && formData.month && formData.year && formData.gender;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      localStorage.setItem('xhzell_profile_data', JSON.stringify(formData));
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {isCreatingAccount ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
               <User className="w-10 h-10 text-gray-400" />
            </div>
            
            <div className="w-full space-y-4">
                <h2 className="text-xl font-bold text-white tracking-wide text-center">Menyiapkan Akun Anda...</h2>
                
                {/* Chrome-style colorful bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)',
                      backgroundSize: '200% 100%'
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center animate-pulse">Mohon tunggu sebentar, kami sedang mengoptimalkan profil Anda.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col"
          >
            <div className="mb-8">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Lengkapi Data Diri</h2>
              <p className="text-gray-400 text-sm">Beri tahu kami sedikit tentang diri Anda untuk menyesuaikan pengalaman.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all"
                  placeholder="Masukkan nama lengkap..."
                />
              </div>

              {/* Tanggal Lahir (Tanggal, Bulan, Tahun) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Tanggal Lahir</label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all text-center"
                    placeholder="DD"
                  />
                  <div className="relative" ref={monthDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                      className="w-full h-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-2 text-white focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all flex items-center justify-between"
                    >
                      <span className="truncate flex-1 text-center">
                        {formData.month ? MONTHS.find(m => m.value === formData.month)?.label : <span className="text-gray-600">Bulan</span>}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isMonthDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 top-full left-0 w-full mt-2 bg-[#27272a] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 max-h-48 overflow-y-auto custom-scrollbar"
                        >
                          {MONTHS.map((month) => (
                            <button
                              key={month.value}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, month: month.value });
                                setIsMonthDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm ${formData.month === month.value ? 'bg-purple-500/20 text-purple-400' : 'text-gray-200'}`}
                            >
                              {month.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all text-center"
                    placeholder="YYYY"
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'Laki-laki' })}
                    className={`py-3.5 px-4 rounded-2xl border transition-all ${formData.gender === 'Laki-laki' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'Perempuan' })}
                    className={`py-3.5 px-4 rounded-2xl border transition-all ${formData.gender === 'Perempuan' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!canProceed}
                  className="w-full group relative flex items-center justify-center space-x-2 bg-white text-black font-semibold rounded-2xl py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:hover:bg-white overflow-hidden"
                >
                  <span className="relative z-10">Lanjutkan</span>
                  <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
