import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Captcha
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [notification, setNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    generateCaptcha();
  }, [isLogin]);
  
  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setUserCaptcha('');
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      showNotification(`Selamat datang, ${user.displayName || user.email?.split('@')[0] || 'User'}`);
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (email && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          if (!userCredential.user.emailVerified) {
             await signOut(auth);
             alert("Silakan verifikasi email Anda terlebih dahulu. Cek kotak masuk atau folder spam Anda.");
             return;
          }
          showNotification('Berhasil login');
        } catch (error: any) {
          console.error("Login Error:", error);
          alert(error.message || "Gagal login");
        }
      }
    } else {
      if (password !== confirmPassword) {
         alert("Password tidak cocok");
         return;
      }
      if (userCaptcha !== captchaCode) {
         generateCaptcha();
         alert("Kode keamanan salah");
         return;
      }
      if (email && password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
          await signOut(auth); // Log them out immediately until they verify
          alert("Berhasil mendaftar! Tautan verifikasi telah dikirim ke email Anda. Silakan verifikasi sebelum login.");
          setIsLogin(true); // Switch to login view
        } catch (error: any) {
          console.error("Register Error:", error);
          alert(error.message || "Gagal mendaftar");
        }
      }
    }
  };
  
  const showNotification = (message: string) => {
    setIsSuccess(true);
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
      const username = email.split('@')[0] || 'User';
      onLoginSuccess(username);
    }, 1500); // lightweight delay
  };

  return (
     <motion.div 
       key="login-page"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0, transition: { duration: 0.5 } }}
       className="absolute inset-0 z-50 flex flex-col justify-between overflow-y-auto no-scrollbar"
     >
        {/* Notification Popup - iPhone Style */}
        <AnimatePresence>
          {notification.show && (
             <motion.div
               initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
               animate={{ opacity: 1, y: 24, scale: 1, x: '-50%' }}
               exit={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               className="fixed top-0 left-1/2 z-[60] px-6 py-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center space-x-3 will-change-transform"
             >
               <CheckCircle2 className="w-5 h-5 text-green-400" />
               <span className="text-white font-medium text-sm tracking-wide">{notification.message}</span>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between p-6 w-full flex-shrink-0">
           <h2 className="text-2xl font-serif italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
              XhzellAI
           </h2>
           <button 
             onClick={() => { setIsLogin(!isLogin); generateCaptcha(); }}
             className="px-5 py-2 rounded-full border border-white/40 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
             disabled={isSuccess}
           >
              {isLogin ? 'Daftar' : 'Masuk'}
           </button>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
           <AnimatePresence mode="wait">
             <motion.div 
               key={isLogin ? 'login' : 'register'}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="w-full max-w-md bg-[#18181b]/50 backdrop-blur-xl rounded-[32px] p-6 md:p-8 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
             >
                <h1 className="text-2xl font-semibold mb-8 text-center text-gray-100">
                   {isLogin ? 'Masuk' : 'Daftar'}
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Email</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                         <input 
                           type="email" 
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all"
                           placeholder="Masukkan email..."
                           disabled={isSuccess}
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                      <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                         <input 
                           type={showPassword ? "text" : "password"}
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all"
                           placeholder="Masukkan password..."
                           disabled={isSuccess}
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                         >
                           {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                   
                   {!isLogin && (
                     <>
                       <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Konfirmasi Password</label>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                             <input 
                               type={showConfirmPassword ? "text" : "password"}
                               required
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all"
                               placeholder="Ulangi password..."
                               disabled={isSuccess}
                             />
                             <button 
                               type="button" 
                               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                             >
                               {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                             </button>
                          </div>
                       </div>
                       
                       <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Kode Keamanan</label>
                          <div className="flex space-x-3">
                             <div className="flex-1 relative">
                                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input 
                                  type="text" 
                                  required
                                  value={userCaptcha}
                                  onChange={(e) => setUserCaptcha(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 transition-all"
                                  placeholder="Masukkan kode..."
                                  disabled={isSuccess}
                                />
                             </div>
                             <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-6 font-mono text-xl tracking-widest select-none shadow-inner text-gray-300 relative overflow-hidden">
                                {/* Scratch pattern overlay */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                <span className="relative z-10 blur-[0.5px] line-through decoration-white/40 decoration-2">{captchaCode}</span>
                             </div>
                          </div>
                       </div>
                     </>
                   )}
                   
                   <button 
                     type="submit"
                     disabled={isSuccess}
                     className="w-full bg-white text-black font-semibold rounded-2xl py-3.5 mt-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
                   >
                     {isLogin ? 'Masuk' : 'Daftar'}
                   </button>
                </form>
                
                <div className="flex items-center space-x-4 my-6">
                   <div className="flex-1 h-px bg-white/10"></div>
                   <span className="text-gray-500 text-sm font-medium">or</span>
                   <div className="flex-1 h-px bg-white/10"></div>
                </div>
                
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSuccess}
                  className="w-full flex items-center justify-center space-x-3 bg-transparent border border-white/20 text-white rounded-2xl py-3.5 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                   </svg>
                   <span className="font-medium">Google</span>
                </button>
             </motion.div>
           </AnimatePresence>
        </div>
        
        {/* Footer */}
        <footer className="p-6 text-center flex-shrink-0">
           <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
             Dengan mendaftar atau login, Anda menyetujui Syarat Penggunaan dan Kebijakan Privasi XhzellAI.
           </p>
        </footer>
     </motion.div>
  );
};
