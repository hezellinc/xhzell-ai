import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Bell, Volume2, VolumeX, Sparkles, Smartphone, Check, Send, AlertCircle, Info, Sliders } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { NotificationItem } from '../NotificationPanel';

interface NotificationSettingsProps {
  onBack: () => void;
  onAddNotification: (notif: NotificationItem) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack, onAddNotification }) => {
  const { notificationSettings, updateNotificationSettings, playNotifSound } = useSettings();
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleTogglePush = async () => {
    if (!('Notification' in window)) {
      setShowToast('Browser Anda tidak mendukung notifikasi sistem.');
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    if (!notificationSettings.pushEnabled) {
      if (Notification.permission === 'default') {
        const res = await Notification.requestPermission();
        setBrowserPermission(res);
        if (res === 'granted') {
          updateNotificationSettings({ pushEnabled: true });
          setShowToast('Notifikasi sistem/browser berhasil diaktifkan!');
        } else {
          updateNotificationSettings({ pushEnabled: false });
          setShowToast('Izin notifikasi ditolak oleh browser.');
        }
      } else if (Notification.permission === 'granted') {
        updateNotificationSettings({ pushEnabled: true });
        setShowToast('Notifikasi sistem diaktifkan.');
      } else {
        setShowToast('Izin notifikasi diblokir di browser. Harap izinkan melalui pengaturan browser Anda.');
      }
    } else {
      updateNotificationSettings({ pushEnabled: false });
      setShowToast('Notifikasi sistem dinonaktifkan.');
    }
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleTestNotification = () => {
    // Play audio sound if enabled
    if (notificationSettings.soundEnabled) {
      playNotifSound();
    }

    // Trigger system browser notification if enabled & permitted
    if (notificationSettings.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('XhzellAI - Uji Coba Notifikasi', {
          body: 'Notifikasi sistem Anda berfungsi dengan baik!',
          icon: '/Xhzell-logo-transparant.jpg'
        });
      } catch (e) {
        console.error('System notification error:', e);
      }
    }

    // Add to in-app notification list
    const newNotif: NotificationItem = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7),
      title: 'Uji Coba Notifikasi',
      message: 'Sistem notifikasi Anda telah dikonfigurasi dan berfungsi dengan normal.',
      isRead: false,
      timestamp: new Date()
    };
    onAddNotification(newNotif);

    setShowToast('Notifikasi uji coba telah dikirim!');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col"
    >
      {/* Toast Banner */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex items-center space-x-3 px-5 py-3 bg-zinc-900/90 backdrop-blur-xl border border-amber-500/30 rounded-full shadow-2xl text-xs md:text-sm text-amber-200"
          >
            <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-4 mt-8 mb-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-200" />
        </motion.button>
        <div>
          <h2 className="text-3xl font-serif italic text-white tracking-wide">Notifikasi</h2>
          <p className="text-xs text-gray-400 mt-0.5">Atur bagaimana dan kapan Anda menerima pemberitahuan</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick Test Action Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-medium text-sm">Uji Coba Notifikasi</h4>
              <p className="text-xs text-gray-400 mt-0.5">Kirim notifikasi sampel untuk memastikan pengaturan Anda aktif.</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTestNotification}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Uji Coba</span>
          </motion.button>
        </div>

        {/* System & Push Notifications */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Smartphone className="w-6 h-6 text-amber-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-white">Notifikasi Sistem & Browser</h3>
                <p className="text-xs text-gray-400">Tampilkan pemberitahuan desktop/mobile saat aplikasi diminimalkan.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Izinkan Notifikasi Browser</h4>
                <p className="text-xs text-gray-400">
                  Status Izin Browser: {' '}
                  <span className={`font-semibold ${
                    browserPermission === 'granted' ? 'text-emerald-400' :
                    browserPermission === 'denied' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {browserPermission === 'granted' ? 'Diizinkan' : browserPermission === 'denied' ? 'Diblokir' : 'Belum Dikonfirmasi'}
                  </span>
                </p>
              </div>
              <button 
                onClick={handleTogglePush}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${notificationSettings.pushEnabled ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: notificationSettings.pushEnabled ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sound & Alert Preferences */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            {notificationSettings.soundEnabled ? (
              <Volume2 className="w-6 h-6 text-blue-400 mr-3" />
            ) : (
              <VolumeX className="w-6 h-6 text-gray-400 mr-3" />
            )}
            <div>
              <h3 className="text-lg font-medium text-white">Suara & Efek Peringatan</h3>
              <p className="text-xs text-gray-400">Putar nada saat ada respons atau peringatan baru</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Suara Notifikasi</h4>
                <p className="text-xs text-gray-400">Bunyikan nada lembut saat notifikasi masuk.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={playNotifSound}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-blue-400 flex items-center space-x-1"
                  title="Tes Nada"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tes</span>
                </button>
                <button 
                  onClick={() => updateNotificationSettings({ soundEnabled: !notificationSettings.soundEnabled })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${notificationSettings.soundEnabled ? 'bg-amber-500' : 'bg-gray-600'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 rounded-full bg-white absolute top-1"
                    initial={false}
                    animate={{ left: notificationSettings.soundEnabled ? '24px' : '4px' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories / Types of Notifications */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center mb-6">
            <Sliders className="w-6 h-6 text-purple-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-white">Kategori Notifikasi</h3>
              <p className="text-xs text-gray-400">Pilih jenis pemberitahuan yang ingin Anda terima</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* AI Response Done */}
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <h4 className="text-white font-medium text-sm mb-1 flex items-center">
                  <Sparkles className="w-4 h-4 text-purple-400 mr-2 inline" />
                  Respons AI Selesai
                </h4>
                <p className="text-xs text-gray-400">Peringatkan saat AI selesai menghasilkan jawaban panjang atau gambar.</p>
              </div>
              <button 
                onClick={() => updateNotificationSettings({ aiResponseNotif: !notificationSettings.aiResponseNotif })}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${notificationSettings.aiResponseNotif ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: notificationSettings.aiResponseNotif ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* System & Feature Updates */}
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <h4 className="text-white font-medium text-sm mb-1 flex items-center">
                  <Info className="w-4 h-4 text-blue-400 mr-2 inline" />
                  Pembaruan Fitur & Sistem
                </h4>
                <p className="text-xs text-gray-400">Dapatkan berita tentang model AI baru, perbaikan, dan pengumuman aplikasi.</p>
              </div>
              <button 
                onClick={() => updateNotificationSettings({ systemNotif: !notificationSettings.systemNotif })}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${notificationSettings.systemNotif ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: notificationSettings.systemNotif ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* Tips & Recommendations */}
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <h4 className="text-white font-medium text-sm mb-1 flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-2 inline" />
                  Tips & Rekomendasi Prompt
                </h4>
                <p className="text-xs text-gray-400">Saran mingguan untuk memaksimalkan penggunaan fitur XhzellAI.</p>
              </div>
              <button 
                onClick={() => updateNotificationSettings({ marketingNotif: !notificationSettings.marketingNotif })}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${notificationSettings.marketingNotif ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 rounded-full bg-white absolute top-1"
                  initial={false}
                  animate={{ left: notificationSettings.marketingNotif ? '24px' : '4px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
