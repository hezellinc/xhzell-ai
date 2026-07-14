import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Monitor, Moon, Sun, Type, ALargeSmall } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface AppearanceSettingsProps {
  onBack: () => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ onBack }) => {
  const { theme, setTheme, fontFamily, setFontFamily, fontSize, setFontSize } = useSettings();

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
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h2 className="text-3xl font-serif italic text-white tracking-wide">Tampilan</h2>
      </div>

      <div className="space-y-6">
        {/* Tema */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <Monitor className="w-6 h-6 text-purple-400 mr-3" />
            <h3 className="text-lg font-medium text-white">Tema Aplikasi</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                theme === 'light' ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Sun className={`w-8 h-8 mb-3 ${theme === 'light' ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className={`font-medium ${theme === 'light' ? 'text-purple-400' : 'text-white'}`}>Terang</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                theme === 'dark' ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Moon className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-white'}`}>Gelap</span>
            </button>
          </div>
        </div>

        {/* Font Family */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <Type className="w-6 h-6 text-amber-400 mr-3" />
            <h3 className="text-lg font-medium text-white">Gaya Huruf</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 'default', label: 'Default (Bawaan)' },
              { id: 'geomini', label: 'Geomini' },
              { id: 'inter', label: 'Inter' },
              { id: 'roboto', label: 'Roboto' },
              { id: 'arimo', label: 'Arimo' },
              { id: 'opensans', label: 'Open Sans' },
            ].map((font) => (
              <button
                key={font.id}
                onClick={() => setFontFamily(font.id as any)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  fontFamily === font.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={`font-medium ${fontFamily === font.id ? 'text-amber-400' : 'text-white'}`}>
                  {font.label}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  fontFamily === font.id ? 'border-amber-500' : 'border-gray-500'
                }`}>
                  {fontFamily === font.id && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ukuran Font */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <ALargeSmall className="w-6 h-6 text-emerald-400 mr-3" />
            <h3 className="text-lg font-medium text-white">Ukuran Teks</h3>
          </div>
          
          <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
            {[
              { id: 'small', label: 'A', className: 'text-sm' },
              { id: 'medium', label: 'A', className: 'text-base' },
              { id: 'large', label: 'A', className: 'text-xl font-medium' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id as any)}
                className={`flex-1 py-3 flex items-center justify-center rounded-lg transition-all ${
                  fontSize === size.id ? 'bg-white/10 text-emerald-400 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={size.className}>{size.label}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center">
            Menyesuaikan ukuran teks secara keseluruhan di dalam aplikasi.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
