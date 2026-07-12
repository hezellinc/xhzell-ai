const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /{activeMenu === 'akun' \? \(/,
  `{activeMenu === 'akun' ? (
            <AccountSettings key="akun" onBack={() => setActiveMenu(null)} onLogout={onLogout} />
          ) : activeMenu === 'galeri' ? (
            <PromoAnimation key="galeri" onClose={() => setActiveMenu(null)} />
          ) : (`
);

code = code.replace(
  /<AccountSettings key="akun" onBack={\(\) => setActiveMenu\(null\)} onLogout={onLogout} \/>/,
  ``
);

fs.writeFileSync('src/App.tsx', code);
