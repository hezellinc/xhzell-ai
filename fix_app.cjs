const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /{activeMenu === 'akun' \? \([\s\S]*?\) : \(/m,
  `{activeMenu === 'akun' ? (
            <AccountSettings key="akun" onBack={() => setActiveMenu(null)} onLogout={onLogout} />
          ) : activeMenu === 'galeri' ? (
            <PromoAnimation key="galeri" onClose={() => setActiveMenu(null)} />
          ) : (`
);

fs.writeFileSync('src/App.tsx', code);
