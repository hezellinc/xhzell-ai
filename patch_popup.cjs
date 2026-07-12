const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const popupJSX = `
      <AnimatePresence>
        {showInstallPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-[#18181b]/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 flex items-center gap-4 min-w-[300px] transform-gpu"
          >
            <div className="flex-1 flex flex-col">
              <span className="text-white font-medium text-sm">Install Aplikasi XhzellAI</span>
              <span className="text-gray-400 text-xs">Tambahkan ke layar utama Anda</span>
            </div>
            <button 
              onClick={() => {
                 setShowInstallPopup(false);
                 handleInstallClick();
              }}
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              Install
            </button>
            <button 
              onClick={() => {
                 setShowInstallPopup(false);
                 localStorage.setItem('xhzell_install_dismissed', 'true');
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace(/<CanvasBackground \/>/, '<CanvasBackground />\n' + popupJSX);

fs.writeFileSync('src/App.tsx', code);
