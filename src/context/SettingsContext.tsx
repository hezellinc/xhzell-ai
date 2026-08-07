import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';
type FontFamily = 'default' | 'geomini' | 'inter' | 'roboto' | 'arimo' | 'opensans';
type FontSize = 'small' | 'medium' | 'large';

export interface NotificationSettingsState {
  pushEnabled: boolean;
  soundEnabled: boolean;
  aiResponseNotif: boolean;
  systemNotif: boolean;
  marketingNotif: boolean;
}

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  notificationSettings: NotificationSettingsState;
  updateNotificationSettings: (settings: Partial<NotificationSettingsState>) => void;
  playNotifSound: () => void;
}

const DEFAULT_NOTIF_SETTINGS: NotificationSettingsState = {
  pushEnabled: false,
  soundEnabled: true,
  aiResponseNotif: true,
  systemNotif: true,
  marketingNotif: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'dark';
  });
  
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem('app-font') as FontFamily) || 'default';
  });
  
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('app-fontsize') as FontSize) || 'medium';
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsState>(() => {
    const saved = localStorage.getItem('app-notification-settings');
    if (saved) {
      try { return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(saved) }; } catch (e) { console.error(e); }
    }
    return DEFAULT_NOTIF_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(`${theme}-mode`);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-font', fontFamily);
    document.documentElement.setAttribute('data-font', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('app-fontsize', fontSize);
    document.documentElement.setAttribute('data-fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('app-notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettingsState>) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const playNotifSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }, []);

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      fontFamily, setFontFamily,
      fontSize, setFontSize,
      notificationSettings,
      updateNotificationSettings,
      playNotifSound
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
