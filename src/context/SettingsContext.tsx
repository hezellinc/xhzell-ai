"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';
type FontFamily = 'default' | 'geomini' | 'inter' | 'roboto' | 'arimo' | 'opensans';
type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [fontFamily, setFontFamily] = useState<FontFamily>('default');
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    const t = localStorage.getItem('app-theme') as Theme;
    if (t) setTheme(t);
    const f = localStorage.getItem('app-font') as FontFamily;
    if (f) setFontFamily(f);
    const s = localStorage.getItem('app-fontsize') as FontSize;
    if (s) setFontSize(s);
  }, []);

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

  return (
    <SettingsContext.Provider value={{ theme, setTheme, fontFamily, setFontFamily, fontSize, setFontSize }}>
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
