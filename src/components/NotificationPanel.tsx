import React from 'react';
import { motion } from 'motion/react';
import { X, Bell, Trash2 } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  action?: () => void;
  actionLabel?: string;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onDelete,
  onDeleteAll
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-16 right-4 md:right-8 w-80 z-50 bg-[#18181b]/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[400px]"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-200" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Notifikasi</h3>
        </div>
        <div className="flex space-x-2">
          {notifications.length > 0 && (
            <button 
              onClick={onDeleteAll}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-red-400"
              title="Hapus Semua"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Tidak ada notifikasi baru
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <motion.div 
                key={notif.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-colors relative group ${notif.isRead ? 'bg-white/5 border border-white/5' : 'bg-white/10 border border-white/10'}`}
              >
                {!notif.isRead && (
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
                <div className="pl-4 pr-6">
                  <h4 className={`text-sm font-medium ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>{notif.title}</h4>
                  <p className={`text-xs mt-1 ${notif.isRead ? 'text-gray-500' : 'text-gray-400'}`}>{notif.message}</p>
                  {notif.action && <button onClick={(e) => { e.stopPropagation(); notif.action!(); }} className="mt-2 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-white">{notif.actionLabel || "Aksi"}</button>}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
