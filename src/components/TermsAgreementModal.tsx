import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';

interface TermsAgreementModalProps {
  onAgree: () => void;
}

export const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({ onAgree }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const canProceed = termsChecked && privacyChecked;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-8 text-center border-b border-white/5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Selamat Datang di XhzellAI</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sebelum memulai, mohon luangkan waktu sebentar untuk membaca dan menyetujui persyaratan penggunaan serta kebijakan privasi kami.
            </p>
          </div>

          <div className="p-6 space-y-4 bg-black/20">
            <label className="flex items-start p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 bg-gray-800"
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                  Saya menyetujui Syarat Penggunaan
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Aturan dasar mengenai penggunaan layanan XhzellAI.
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
                className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
              </button>
            </label>

            <label className="flex items-start p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900 bg-gray-800"
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                  Saya menyetujui Kebijakan Privasi
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Bagaimana kami melindungi dan mengelola data Anda.
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacy(true);
                }}
                className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </label>
          </div>

          <div className="p-6 border-t border-white/5">
            <motion.button
              whileTap={canProceed ? { scale: 0.98 } : {}}
              onClick={() => {
                if (canProceed) {
                  onAgree();
                }
              }}
              disabled={!canProceed}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                canProceed 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Lanjutkan ke Aplikasi</span>
              {canProceed ? <ChevronRight className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 opacity-50" />}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      </AnimatePresence>
    </>
  );
};
