import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Bell, User, Settings, Star, PlusCircle, 
  ChevronDown, MoreHorizontal, Plus, AudioLines, ArrowUp, Sparkles, Heart, X, Clock, Trash2, Shield, Smartphone, Monitor, Database, Globe, Zap, Key, Hexagon,
  Image as ImageIcon, FileText, Video, HelpCircle, Info, Film
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasBackground } from './components/CanvasBackground';
import { AILoadingIndicator } from './components/AILoadingIndicator';
import { HeaderSpotlight } from './components/HeaderSpotlight';
import { LoginPage } from './components/LoginPage';
import { NotificationPanel, NotificationItem } from './components/NotificationPanel';
import { ProfilePage } from './components/ProfilePage';
import { HelpPage } from './components/HelpPage';
import { AboutPage } from './components/AboutPage';
import { TermsAgreementModal } from './components/TermsAgreementModal';
import { PromoAnimation } from './components/PromoAnimation';
import { AccountSettings } from './components/settings/AccountSettings';
import { PrivacySettings } from './components/settings/PrivacySettings';

type Role = 'user' | 'model';

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  name: string;
  url?: string;
  base64?: string;
  mimeType?: string;
}

interface Message {
  role: Role;
  text: string;
  attachments?: Attachment[];
}

interface ChatHistoryItem {
  id: string;
  title: string;
  isFavorite: boolean;
  messages: Message[];
}

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AI_MODELS = [
  { id: "gemini-3.5-flash", label: "xsp-3pro", provider: "gemini" },
  { id: "openai", label: "xsp-coder", provider: "pollinations" }
];
export default function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhotoURL, setUserPhotoURL] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [showModelMenu, setShowModelMenu] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const agreed = localStorage.getItem('xhzell_terms_agreed') === 'true';
      setHasAgreedTerms(agreed);
      
      if (user) {
        setIsAuthenticated(true);
        let name = user.displayName || user.email?.split('@')[0] || 'User';
        let photo = '';
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name) name = data.name;
            if (data.photoURL) photo = data.photoURL;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
        setUserName(name);
        setUserPhotoURL(photo);
      } else {
        setIsAuthenticated(false);
        setUserName('');
        setUserPhotoURL('');
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeChatId, setActiveChatId] = useState('1');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
    const saved = localStorage.getItem("xhzell_chat_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [{ id: "1", title: "Percakapan baru", isFavorite: false, messages: [] }];
  });

  useEffect(() => {
    localStorage.setItem("xhzell_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);


  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setNotifications(prev => prev.filter(n => n.id !== 'install-prompt'));
      }
    }
  };

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('xhzell_install_dismissed') && !isAppInstalled) {
         setShowInstallPopup(true);
         setTimeout(() => {
           setShowInstallPopup(false);
         }, 3000);
         
         // Add notification
         setNotifications(prev => {
           if (prev.find(n => n.id === 'install-prompt')) return prev;
           return [{
             id: 'install-prompt',
             title: 'Install Aplikasi',
             message: 'Install XhzellAI ke layar utama agar terasa seperti aplikasi native.',
             isRead: false,
             timestamp: new Date(),
             action: handleInstallClick,
             actionLabel: 'Install'
           }, ...prev];
         });
      }
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setShowInstallPopup(false);
      setNotifications(prev => prev.filter(n => n.id !== 'install-prompt'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAppInstalled, deferredPrompt]);




  const activeChat = chatHistory.find(c => c.id === activeChatId) || chatHistory[0] || { id: 'fallback', title: 'Percakapan baru', isFavorite: false, messages: [] };
  const messages = activeChat.messages;
  const isFavorite = activeChat.isFavorite;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const isAutoScrollRef = useRef(true);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      isAutoScrollRef.current = isNearBottom;
    }
  };

  const toggleFavorite = () => {
    setChatHistory(prev => prev.map(item => 
      item.id === activeChatId ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const updateActiveChatMessages = (newMessages: Message[], generateTitle = false) => {
    setChatHistory(prev => prev.map(item => {
      if (item.id === activeChatId) {
        return { 
          ...item, 
          messages: newMessages,
          title: generateTitle && newMessages.length > 0 ? newMessages[0].text.slice(0, 30) + (newMessages[0].text.length > 30 ? '...' : '') : item.title 
        };
      }
      return item;
    }));
  };

  const handleNewChat = () => {
    const newId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    setChatHistory(prev => [
      { id: newId, title: 'Percakapan baru', isFavorite: false, messages: [] },
      ...prev
    ]);
    setActiveChatId(newId);
  };

  const deleteChat = (id: string) => {
    setChatHistory(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      const remaining = chatHistory.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    isAutoScrollRef.current = true;
    const userText = input.trim();
    setInput('');
    const currentAttachments = [...pendingAttachments];
    setPendingAttachments([]);
    setShowAttachmentMenu(false);
    
    const newMessages: Message[] = [...activeChat.messages, { 
      role: 'user', 
      text: userText, 
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined 
    }];
    const shouldGenerateTitle = activeChat.messages.length === 0;
    updateActiveChatMessages(newMessages, shouldGenerateTitle);
    setIsLoading(true);

    try {
      const contents = newMessages.map(m => {
        const parts: any[] = [];
        if (m.text) {
          parts.push({ text: m.text });
        }
        if (m.attachments) {
          m.attachments.forEach(att => {
            if (att.base64 && att.mimeType) {
              parts.push({
                inlineData: {
                  data: att.base64,
                  mimeType: att.mimeType
                }
              });
            }
          });
        }
        // Fallback for empty parts to avoid Gemini API error
        if (parts.length === 0) {
           parts.push({ text: " " });
        }
        return {
          role: m.role,
          parts: parts
        };
      });
      const selectedModelObj = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, model: selectedModel, provider: selectedModelObj.provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server sedang sibuk. Silakan coba beberapa saat lagi.');
      }
      
      updateActiveChatMessages([...newMessages, { role: 'model', text: data.text }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMessage = error.message || "Server sedang sibuk. Silakan coba beberapa saat lagi.";
      updateActiveChatMessages([...newMessages, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttachment = (type: 'file' | 'image' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    if (type === 'image') input.accept = 'image/*';
    if (type === 'video') input.accept = 'video/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          const newAttachment: Attachment = {
            id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
            type,
            name: file.name,
            url: URL.createObjectURL(file),
            base64: base64String,
            mimeType: file.type
          };
          setPendingAttachments(prev => [...prev, newAttachment]);
          setShowAttachmentMenu(false);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const favorites = chatHistory.filter(h => h.isFavorite);
  const regularHistory = chatHistory.filter(h => !h.isFavorite);

  if (!isAuthReady) {
    return null;
  }

  return (
    <div className="relative h-[100dvh] w-full text-white font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col select-none">
      <CanvasBackground />

      <AnimatePresence>
        {showInstallPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-[#18181b]/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 flex items-center gap-4 min-w-[300px] transform-gpu"
          >
            <div className="flex-1 flex flex-col">
              <span className="text-white font-medium text-sm">Install Aplikasi XhzellAI</span>
              <span className="text-gray-400 text-xs">Tambahkan ke layar utama Anda</span>
            </div>
            <button 
              onClick={() => {
                 setShowInstallPopup(false);
                 handleInstallClick();
              }}
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              Install
            </button>
            <button 
              onClick={() => {
                 setShowInstallPopup(false);
                 localStorage.setItem('xhzell_install_dismissed', 'true');
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <LoginPage key="login" onLoginSuccess={(name) => {
            setUserName(name);
            setIsAuthenticated(true);
            localStorage.setItem('xhzell_auth', 'true');
            localStorage.setItem('xhzell_user', name);
            setNotifications([{
              id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
              title: `Halo, ${name}!`,
              message: 'Selamat datang di XhzellAI. Senang melihat Anda di sini!',
              isRead: false,
              timestamp: new Date()
            }]);
          }} />
        ) : !hasAgreedTerms ? (
          <TermsAgreementModal 
            key="terms" 
            onAgree={() => {
              setHasAgreedTerms(true);
              localStorage.setItem('xhzell_terms_agreed', 'true');
            }} 
          />
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col"
          >
            <AnimatePresence>
              {showSettings && (
                <SettingsPage 
                  onClose={() => setShowSettings(false)} 
                  onLogout={async () => {
                    await signOut(auth);
                    setShowSettings(false);
                  }}
                />
              )}
              {showProfile && (
                <ProfilePage
                  onClose={() => setShowProfile(false)}
                  onProfileUpdated={(name, photo) => {
                    setUserName(name);
                    setUserPhotoURL(photo);
                  }}
                />
              )}
              {showHelp && (
                <HelpPage onClose={() => setShowHelp(false)} />
              )}
              {showAbout && (
                <AboutPage onClose={() => setShowAbout(false)} />
              )}
              {showNotifications && (
                <NotificationPanel 
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkAsRead={(id) => {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                  }}
                  onDelete={(id) => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                  }}
                  onDeleteAll={() => setNotifications([])}
                />
              )}
            </AnimatePresence>

            {/* Sidebar Overlay and Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/20"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: '-110%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-110%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-2 left-2 bottom-2 transform-gpu will-change-transform will-change-opacity md:top-4 md:left-4 md:bottom-4 w-72 md:w-80 z-50 bg-[#18181b]/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <img src="/logo-app.jpg" alt="XhzellAI Logo" className="w-8 h-8 rounded-full object-cover" />
                  <h2 className="text-2xl font-serif italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                    XhzellAI
                  </h2>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                >
                  <X className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pr-2">
                {favorites.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Favorites</h3>
                    <div className="space-y-1">
                      {favorites.map(item => (
                        <SwipeableChatHistoryItem
                          key={item.id}
                          item={item}
                          activeChatId={activeChatId}
                          selectChat={selectChat}
                          deleteChat={deleteChat}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">History</h3>
                  <div className="space-y-1">
                    {regularHistory.map(item => (
                        <SwipeableChatHistoryItem
                          key={item.id}
                          item={item}
                          activeChatId={activeChatId}
                          selectChat={selectChat}
                          deleteChat={deleteChat}
                        />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setShowHelp(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Bantuan & Dukungan</span>
                </button>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setShowAbout(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  <div className="p-1.5 bg-pink-500/20 rounded-lg text-pink-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Tentang XhzellAI</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Animated Background Canvas */}
      <AnimatedBackground />

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col flex-1 w-full overflow-hidden">
        <HeaderSpotlight isLoading={isLoading} />
        {/* Top Navigation */}
      <header className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] flex-shrink-0 max-w-7xl mx-auto w-full relative">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
        </motion.button>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-[#18181b]/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/10 space-x-1">
          <div className="relative">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowNotifications(!showNotifications)} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-[#18181b]"></span>
              )}
            </motion.button>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setShowProfile(true)}
            className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            {userPhotoURL ? (
               <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-purple-500/80 flex items-center justify-center overflow-hidden shadow-sm">
                 <img src={userPhotoURL} alt="Profile" className="w-full h-full object-cover" />
               </div>
            ) : userName ? (
               <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-purple-500/80 flex items-center justify-center text-xs md:text-sm font-bold text-white uppercase shadow-sm">
                 {userName.charAt(0)}
               </div>
            ) : (
               <User className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </motion.button>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={toggleFavorite}
            className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-all flex-shrink-0 group"
          >
            <Star className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${isFavorite ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-300 group-hover:text-white'}`} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={handleNewChat}
            className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
          </motion.button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
      >
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div 
              key="welcome"
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: "easeIn" }}
              className="h-full flex flex-col items-center justify-center opacity-70"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                  animate={{ opacity: [0, 1, 0.8, 1], scale: [0.8, 1.2, 1], rotate: 0 }}
                  transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute -top-6 -right-6 text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                >
                  <Heart className="w-5 h-5 fill-red-500" />
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight animate-shimmer-text drop-shadow-sm pb-2">
                  Welcome to Xhzell AI.
                </h1>
                
                {/* Sliding glowing line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-full">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
                  />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-3xl mx-auto space-y-6 w-full pb-10 transform-gpu will-change-transform will-change-opacity"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={`${activeChatId}-${idx}`} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex w-full transform-gpu will-change-transform will-change-opacity ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`
                        max-w-[85%] md:max-w-[85%] select-text
                        ${msg.role === 'user' 
                          ? 'user-bubble-animated relative bg-white/10 border border-white/10 backdrop-blur-sm text-white rounded-3xl rounded-br-sm px-5 py-3.5 shadow-sm' 
                          : 'bg-transparent text-gray-100 px-2 py-2'
                        }
                      `}
                    >
                  {msg.role === 'user' ? (
                    <div className="flex flex-col gap-2">
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1">
                          {msg.attachments.map(att => (
                            <div key={att.id} className="flex items-center space-x-2 bg-white/20 border border-white/20 rounded-xl px-3 py-2 shadow-sm">
                              {att.type === 'image' && <ImageIcon size={18} className="text-purple-300" />}
                              {att.type === 'video' && <Video size={18} className="text-rose-300" />}
                              {att.type === 'file' && <FileText size={18} className="text-blue-300" />}
                              <span className="text-sm font-medium text-white truncate max-w-[150px]">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.text && <div className="whitespace-pre-wrap font-sans text-[15px] md:text-base tracking-wide">{msg.text}</div>}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-gray-400 bg-white/5 inline-flex items-center self-start px-2 py-1 rounded-md border border-white/10 mb-1">
                        <Sparkles size={12} className="mr-1.5 text-purple-400" />
                        {AI_MODELS.find(m => m.id === selectedModel)?.label || "AI"}
                      </div>
                      <div className="markdown-body prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-headings:font-semibold prose-a:text-purple-400 font-sans text-[15px] md:text-base tracking-wide">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  )}
                  </div>
              </motion.div>
            ))}

            </AnimatePresence>
            {isLoading && (
              <div className="flex w-full justify-start mt-2">
                <div className="max-w-[85%] md:max-w-[75%] px-2 py-2">
                  <AILoadingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Input Area */}
      <div className="w-full p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-6 md:pb-[max(2rem,env(safe-area-inset-bottom))] flex justify-center flex-shrink-0 relative z-10">
        <div className="w-full max-w-3xl relative transform-gpu bg-[#18181b]/90 backdrop-blur-md rounded-[32px] p-4 shadow-2xl border border-white/10 transition-all focus-within:bg-[#18181b] focus-within:border-white/20">
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 w-full flex justify-center space-x-2 mb-3 z-50 origin-bottom"
              >
                {[
                  { type: 'file', icon: <FileText size={14} />, label: 'Dokumen', color: 'bg-blue-500/20 text-blue-400' },
                  { type: 'image', icon: <ImageIcon size={14} />, label: 'Gambar', color: 'bg-purple-500/20 text-purple-400' },
                  { type: 'video', icon: <Video size={14} />, label: 'Video', color: 'bg-rose-500/20 text-rose-400' }
                ].map((item, i) => (
                  <motion.button
                    key={item.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 15 }}
                    onClick={() => handleAddAttachment(item.type as 'file' | 'image' | 'video')}
                    className="flex items-center space-x-1.5 bg-[#27272a]/95 hover:bg-[#3f3f46] border border-white/10 rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md transition-colors"
                  >
                    <div className={`p-1 rounded-full ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-200 whitespace-nowrap">{item.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 w-full flex justify-center space-x-2 mb-3 z-50 origin-bottom"
              >
                {[
                  { type: 'create_image', icon: <ImageIcon size={14} />, label: 'Buat/Edit Gambar', color: 'bg-emerald-500/20 text-emerald-400' },
                  { type: 'search_image', icon: <Globe size={14} />, label: 'Pencarian Gambar', color: 'bg-amber-500/20 text-amber-400' }
                ].map((item, i) => (
                  <motion.button
                    key={item.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 15 }}
                    onClick={() => {
                        setShowMoreMenu(false);
                        alert("Fitur " + item.label + " segera hadir!");
                    }}
                    className="flex items-center space-x-1.5 bg-[#27272a]/95 hover:bg-[#3f3f46] border border-white/10 rounded-full px-3 py-1.5 shadow-xl backdrop-blur-md transition-colors"
                  >
                    <div className={`p-1 rounded-full ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-200 whitespace-nowrap">{item.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-2">
              <AnimatePresence>
                {pendingAttachments.map((att) => (
                  <motion.div
                    key={att.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative flex items-center bg-white/10 border border-white/10 rounded-xl p-2 pr-8"
                  >
                    <div className="mr-2 text-gray-300">
                      {att.type === 'image' && <ImageIcon size={16} className="text-purple-400" />}
                      {att.type === 'video' && <Video size={16} className="text-rose-400" />}
                      {att.type === 'file' && <FileText size={16} className="text-blue-400" />}
                    </div>
                    <span className="text-xs text-gray-200 truncate max-w-[120px]">{att.name}</span>
                    <button
                      onClick={() => removePendingAttachment(att.id)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tulis sesuatu..."
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none text-base min-h-[40px] max-h-[200px] overflow-y-auto px-2"
            rows={1}
            autoFocus
          />
          
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <div className="flex items-center space-x-2 relative">
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                onClick={() => {
                  setShowModelMenu(!showModelMenu);
                  if (showMoreMenu) setShowMoreMenu(false);
                  if (showAttachmentMenu) setShowAttachmentMenu(false);
                }}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 h-9 md:h-10 border border-white/5 whitespace-nowrap flex-shrink-0"
              >
                <span className="text-xs md:text-sm font-medium text-gray-200 truncate max-w-[80px] md:max-w-[120px] inline-block align-bottom">
                  {AI_MODELS.find(m => m.id === selectedModel)?.label || "Select Model"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-[#27272a]/95 border border-white/10 rounded-xl shadow-xl backdrop-blur-md overflow-hidden z-50 origin-bottom-left"
                  >
                    {AI_MODELS.map((modelItem) => (

                      <button
                        key={modelItem.id}
                        onClick={() => {
                          setSelectedModel(modelItem.id);
                          setShowModelMenu(false);
                          handleNewChat();
                        }}

                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedModel === modelItem.id ? 'bg-white/10 text-white font-medium' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {modelItem.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => {
                  setShowMoreMenu(!showMoreMenu);
                  if (showAttachmentMenu) setShowAttachmentMenu(false);
                  if (showModelMenu) setShowModelMenu(false);
                }}
                className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 transition-colors rounded-full border flex-shrink-0 ${showMoreMenu ? 'bg-white/20 border-white/20' : 'bg-white/10 border-white/5 hover:bg-white/20'}`}
              >
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  if (showMoreMenu) setShowMoreMenu(false);
                  if (showModelMenu) setShowModelMenu(false);
                }}
                className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 transition-colors rounded-full border flex-shrink-0 ${showAttachmentMenu ? 'bg-white/20 border-white/20' : 'bg-white/10 border-white/5 hover:bg-white/20'}`}
              >
                <Plus className={`w-4 h-4 md:w-5 md:h-5 text-gray-300 transition-transform duration-300 ${showAttachmentMenu ? 'rotate-45' : ''}`} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/5 flex-shrink-0">
                <AudioLines className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSubmit()}
                disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:hover:bg-white/20 transition-colors rounded-full border border-white/5 flex-shrink-0"
              >
                <ArrowUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeableChatHistoryItem({ 
  item, 
  activeChatId, 
  selectChat, 
  deleteChat 
}: { 
  item: ChatHistoryItem, 
  activeChatId: string, 
  selectChat: (id: string) => void, 
  deleteChat: (id: string) => void 
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  return (
    <div className="relative overflow-hidden rounded-2xl group w-full">
      <AnimatePresence>
        {showDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 right-0 flex justify-end items-center bg-red-500/80 rounded-2xl z-10"
          >
            <div className="flex space-x-1 pr-3">
               {!confirmDelete ? (
                 <>
                   <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                   <button onClick={(e) => { e.stopPropagation(); setShowDelete(false); }} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Batal"><X className="w-4 h-4" /></button>
                 </>
               ) : (
                 <>
                   <span className="text-xs text-white font-medium self-center mr-2">Yakin?</span>
                   <button onClick={(e) => { e.stopPropagation(); deleteChat(item.id); }} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-bold transition-colors">Ya</button>
                   <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} className="px-3 py-1 bg-black/20 hover:bg-black/30 rounded-full text-white text-xs font-bold transition-colors">Batal</button>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset }) => {
          if (offset.x < -40) {
            setShowDelete(true);
            setConfirmDelete(false);
          } else {
            setShowDelete(false);
            setConfirmDelete(false);
          }
        }}
        onClick={() => { if (!showDelete) selectChat(item.id) }}
        className={`w-full text-left p-3 rounded-2xl transition-all flex items-center space-x-3 bg-transparent cursor-pointer ${item.id === activeChatId ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5'}`}
      >
        {item.isFavorite ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" /> : <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <span className={`text-sm truncate ${item.id === activeChatId ? 'text-white font-medium' : 'text-gray-400 group-hover:text-white'}`}>
          {item.title}
        </span>
      </motion.div>
    </div>
  );
}

function SettingsPage({ onClose, onLogout }: { onClose: () => void, onLogout: () => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const dummySettings = [
    { id: 'akun', icon: <User size={20} />, title: 'Akun' },
    { id: 'privasi', icon: <Shield size={20} />, title: 'Privasi' },
    { id: 'notifikasi', icon: <Bell size={20} />, title: 'Notifikasi' },
    { id: 'tampilan', icon: <Monitor size={20} />, title: 'Tampilan' },
    { id: 'penyimpanan', icon: <Database size={20} />, title: 'Penyimpanan' },
    { id: 'bahasa', icon: <Globe size={20} />, title: 'Bahasa' },
    { id: 'api-keys', icon: <Key size={20} />, title: 'API Keys' },
    { id: 'performa', icon: <Zap size={20} />, title: 'Performa' },
    { id: 'perangkat', icon: <Smartphone size={20} />, title: 'Perangkat' },
    { id: 'lanjutan', icon: <Hexagon size={20} />, title: 'Lanjutan' },
    { id: 'galeri', icon: <Film size={20} />, title: 'Galeri' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: '20px' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '20px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute inset-0 z-[200] bg-black/90 transform-gpu will-change-transform will-change-opacity backdrop-blur-md flex flex-col p-4 md:p-8 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col mb-12">
        <AnimatePresence mode="wait">
          {activeMenu === 'akun' ? (
            <AccountSettings key="akun" onBack={() => setActiveMenu(null)} onLogout={onLogout} />
          ) : activeMenu === 'privasi' ? (
            <PrivacySettings key="privasi" onBack={() => setActiveMenu(null)} />
          ) : activeMenu === 'galeri' ? (
            <PromoAnimation key="galeri" onClose={() => setActiveMenu(null)} />
          ) : (
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <div className="flex items-center justify-between mt-8 mb-10">
                <h2 className="text-3xl font-serif italic text-white tracking-wide">Pengaturan</h2>
                <motion.button 
                  whileTap={{ scale: 0.9 }} 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-200" />
                </motion.button>
              </div>

              <div className="flex flex-col space-y-3">
                {dummySettings.map(setting => (
                  <motion.div 
                    key={setting.id}
                    onClick={() => {
                      if (setting.id === 'akun' || setting.id === 'galeri') {
                        setActiveMenu(setting.id);
                      }
                    }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    className="flex items-start p-4 md:p-5 rounded-3xl bg-white/5 border border-white/5 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-300 mr-5 flex-shrink-0">
                      {setting.icon}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-white font-medium text-lg">{setting.title}</h3>
                    </div>
                  </motion.div>
                ))}

                <motion.div 
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  onClick={onLogout}
                  className="flex items-start p-4 md:p-5 rounded-3xl bg-red-500/10 border border-red-500/20 cursor-pointer transition-colors mt-8"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mr-5 flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-red-400 font-medium text-lg mb-0.5">Keluar</h3>
                    <p className="text-red-400/70 text-sm leading-relaxed">Akhiri sesi dan keluar dari akun.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#000000]">
      <div className="absolute inset-0 opacity-80 mix-blend-screen transform-gpu">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-purple-600/40 rounded-full blur-[80px] animate-blob transform-gpu" />
        <div className="absolute top-1/3 right-1/4 w-[35vw] h-[35vw] bg-pink-600/40 rounded-full blur-[80px] animate-blob animation-delay-2000 transform-gpu" />
        <div className="absolute bottom-1/4 left-1/3 w-[45vw] h-[45vw] bg-blue-600/40 rounded-full blur-[80px] animate-blob animation-delay-4000 transform-gpu" />
      </div>
    </div>
  );
}

