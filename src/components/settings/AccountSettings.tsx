import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, User, Mail, Camera, Save, Key, Trash2 } from 'lucide-react';
import { auth, db } from '../../firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AccountSettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onBack, onLogout }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
      
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || user.displayName || '');
            setPhotoURL(data.photoURL || user.photoURL || '');
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

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile(user, { displayName: name, photoURL });
      
      await setDoc(doc(db, 'users', user.uid), {
        name,
        photoURL,
        updatedAt: new Date()
      }, { merge: true });

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-300" />
        </button>
        <h2 className="text-2xl font-serif italic text-white tracking-wide">Pengaturan Akun</h2>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-6 p-6 rounded-3xl bg-white/5 border border-white/5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">Foto Profil</h3>
            <p className="text-sm text-gray-400">Ganti foto profil dengan memasukkan URL gambar.</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
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
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="Nama Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">URL Foto Profil (Opsional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Camera className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
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
