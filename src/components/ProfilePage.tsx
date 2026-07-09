import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Camera, Save, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ProfilePageProps {
  onClose: () => void;
  onProfileUpdated: (name: string, photoURL: string) => void;
}

export function ProfilePage({ onClose, onProfileUpdated }: ProfilePageProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || '');
          setBio(data.bio || '');
          setPhotoURL(data.photoURL || '');
        } else {
          setName(auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || '');
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }
    
    setIsSaving(true);
    setError('');
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(docRef, {
        name,
        bio,
        photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });
      onProfileUpdated(name, photoURL);
      onClose();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) { // Limit to ~200kb for base64 as per rules
         setError('Ukuran foto terlalu besar (maks. 200KB)');
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '20px' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '20px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto"
    >
      <div className="w-full max-w-md mx-auto flex flex-col mb-12">
        <div className="flex items-center justify-between mt-8 mb-8">
          <h2 className="text-3xl font-serif italic text-white tracking-wide">Profil</h2>
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-gray-200" />
          </motion.button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
             <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col items-center">
               <div className="relative group">
                 <div className="w-24 h-24 rounded-full bg-purple-500/20 border border-purple-500/30 overflow-hidden flex items-center justify-center mb-4">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-white font-bold uppercase">{name.charAt(0)}</span>
                    )}
                 </div>
                 <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                 </label>
               </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-400 ml-1">Nama</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Nama Anda"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 ml-1">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                placeholder="Ceritakan sedikit tentang Anda"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Simpan Profil</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
