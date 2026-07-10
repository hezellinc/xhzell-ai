import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Mail, Camera, Save, Key, Trash2, Calendar, ChevronDown, Pencil, Check } from 'lucide-react';
import { auth, db } from '../../firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AccountSettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onBack, onLogout }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  
  const [showDayMenu, setShowDayMenu] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
      setAccountId(user.uid);
      
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || user.displayName || '');
            setPhotoURL(data.photoURL || user.photoURL || '');
            if (data.dob) {
              setDobDay(data.dob.day || '');
              setDobMonth(data.dob.month || '');
              setDobYear(data.dob.year || '');
            }
          } else {
            setName(user.displayName || '');
            setPhotoURL(user.photoURL || '');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setName(user.displayName || '');
          setPhotoURL(user.photoURL || '');
        }
      };
      fetchUserData();
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran gambar maksimal 5MB sebelum dikompresi' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with 0.7 quality for JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoURL(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      let authUpdateData: any = { displayName: name };
      if (!photoURL.startsWith('data:image')) {
        authUpdateData.photoURL = photoURL;
      }
      
      await updateProfile(user, authUpdateData);
      
      await setDoc(doc(db, 'users', user.uid), {
        name,
        photoURL,
        dob: {
          day: dobDay,
          month: dobMonth,
          year: dobYear
        },
        updatedAt: serverTimestamp()
      }, { merge: true });

      setIsSaved(true);
      setIsEditing(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal memperbarui profil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Mohon isi kata sandi saat ini dan baru.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setMessage({ type: 'success', text: 'Kata sandi berhasil diubah.' });
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordChange(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mengubah kata sandi. Pastikan kata sandi saat ini benar.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteUser(user);
      onLogout();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert('Mohon login ulang untuk menghapus akun Anda.');
        onLogout();
      } else {
        alert('Gagal menghapus akun: ' + error.message);
      }
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      {/* iPhone style blur notification */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white font-medium">Pembaruan berhasil disimpan!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-300" />
          </button>
          <h2 className="text-2xl font-serif italic text-white tracking-wide">Pengaturan Akun</h2>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2.5 rounded-full transition-colors ${isEditing ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/5">
          <div className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} onClick={() => isEditing && fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden border-4 border-[#18181b]">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            {isEditing && (
              <>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full shadow-lg border-2 border-[#18181b]">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
              disabled={!isEditing}
            />
          </div>
          <h3 className="text-xl font-medium text-white mt-4">{name || 'Pengguna'}</h3>
          <p className="text-sm text-gray-400 mt-1">{email}</p>
        </div>

        {/* Profile Details */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="Nama Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">ID Akun</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Key className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={accountId}
                readOnly
                className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-gray-400 font-mono text-sm select-all focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">ID unik ini dapat digunakan untuk mengakses fitur premium nantinya.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Tanggal Lahir</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Day Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => {
                    setShowDayMenu(!showDayMenu);
                    setShowMonthMenu(false);
                    setShowYearMenu(false);
                  }}
                  className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white flex items-center justify-between focus:outline-none focus:border-purple-500 transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className={dobDay ? 'text-white' : 'text-gray-500'}>{dobDay || 'Hari'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <AnimatePresence>
                  {showDayMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-[#27272a] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                    >
                      {days.map(d => (
                        <div
                          key={d}
                          onClick={() => {
                            setDobDay(d);
                            setShowDayMenu(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${dobDay === d ? 'bg-white/5 text-white font-medium' : 'text-gray-300'}`}
                        >
                          {d}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Month Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => {
                    setShowMonthMenu(!showMonthMenu);
                    setShowDayMenu(false);
                    setShowYearMenu(false);
                  }}
                  className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white flex items-center justify-between focus:outline-none focus:border-purple-500 transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className={dobMonth ? 'text-white text-sm truncate' : 'text-gray-500'}>{dobMonth || 'Bulan'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </button>
                <AnimatePresence>
                  {showMonthMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-[#27272a] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                    >
                      {MONTHS.map(m => (
                        <div
                          key={m}
                          onClick={() => {
                            setDobMonth(m);
                            setShowMonthMenu(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${dobMonth === m ? 'bg-white/5 text-white font-medium' : 'text-gray-300'}`}
                        >
                          {m}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => {
                    setShowYearMenu(!showYearMenu);
                    setShowDayMenu(false);
                    setShowMonthMenu(false);
                  }}
                  className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white flex items-center justify-between focus:outline-none focus:border-purple-500 transition-colors ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className={dobYear ? 'text-white' : 'text-gray-500'}>{dobYear || 'Tahun'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <AnimatePresence>
                  {showYearMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-[#27272a] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                    >
                      {years.map(y => (
                        <div
                          key={y}
                          onClick={() => {
                            setDobYear(y);
                            setShowYearMenu(false);
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${dobYear === y ? 'bg-white/5 text-white font-medium' : 'text-gray-300'}`}
                        >
                          {y}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving || !isEditing || isSaved}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                isSaved 
                  ? 'bg-gray-700 text-gray-300 opacity-80 cursor-default'
                  : 'bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Berhasil disimpan' : isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">Keamanan</h3>
          
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="flex items-center space-x-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-200 w-full"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Ubah Kata Sandi</div>
                <div className="text-xs text-gray-400 mt-0.5">Perbarui kata sandi akun Anda</div>
              </div>
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Kata Sandi Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Perbarui Sandi
                </button>
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center space-x-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors text-red-400 w-full"
            >
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Hapus Akun</div>
                <div className="text-xs text-red-400/70 mt-0.5">Tindakan ini tidak dapat dibatalkan</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}
    </motion.div>
  );
};
