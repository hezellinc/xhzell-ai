import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Bell, User, Settings, Star, PlusCircle, 
  ChevronDown, MoreHorizontal, Plus, AudioLines, ArrowUp, Sparkles, Heart, X, Clock, Trash2, Shield, Smartphone, Monitor, Database, Globe, Zap, Key, Hexagon
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasBackground } from './components/CanvasBackground';
import { AILoadingIndicator } from './components/AILoadingIndicator';

type Role = 'user' | 'model';

interface Message {
  role: Role;
  text: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  isFavorite: boolean;
  messages: Message[];
}

export default function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeChatId, setActiveChatId] = useState('1');
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Percakapan baru', isFavorite: false, messages: [] },
  ]);

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
    const newId = Date.now().toString();
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
    if (!input.trim() || isLoading) return;

    isAutoScrollRef.current = true;
    const userText = input.trim();
    setInput('');
    
    const newMessages: Message[] = [...activeChat.messages, { role: 'user', text: userText }];
    const shouldGenerateTitle = activeChat.messages.length === 0;
    updateActiveChatMessages(newMessages, shouldGenerateTitle);
    setIsLoading(true);

    try {
      const history = activeChat.messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history }),
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      
      const data = await res.json();
      updateActiveChatMessages([...newMessages, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error(error);
      updateActiveChatMessages([...newMessages, { role: 'model', text: 'Maaf, terjadi kesalahan saat memproses permintaan Anda.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const favorites = chatHistory.filter(h => h.isFavorite);
  const regularHistory = chatHistory.filter(h => !h.isFavorite);

  return (
    <div className="relative h-[100dvh] w-full text-white font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col select-none">
      <CanvasBackground />
      <AnimatePresence>
        {showSettings && (
          <SettingsPage onClose={() => setShowSettings(false)} />
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full w-72 md:w-80 z-50 bg-[#18181b]/90 backdrop-blur-md border-r border-white/10 p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                  XhzellAI
                </h2>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Animated Background Canvas */}
      <AnimatedBackground />

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col flex-1 w-full overflow-hidden">
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
          <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <User className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
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
              className="max-w-3xl mx-auto space-y-6 w-full pb-10"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                    <div className="whitespace-pre-wrap font-sans text-[15px] md:text-base tracking-wide">{msg.text}</div>
                  ) : (
                    <div className="markdown-body prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-headings:font-semibold prose-a:text-purple-400 font-sans text-[15px] md:text-base tracking-wide">
                      <Markdown>{msg.text}</Markdown>
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
        <div className="w-full max-w-3xl bg-[#18181b]/90 backdrop-blur-md rounded-[32px] p-4 shadow-2xl border border-white/10 transition-all focus-within:bg-[#18181b] focus-within:border-white/20">
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
            <div className="flex items-center space-x-2">
              <motion.button whileTap={{ scale: 0.95 }} className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 h-9 md:h-10 border border-white/5 whitespace-nowrap flex-shrink-0">
                <span className="text-xs md:text-sm font-medium text-gray-200">xhzell_flash</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>
              
              <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/5 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/5 flex-shrink-0">
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/5 flex-shrink-0">
                <AudioLines className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:hover:bg-white/20 transition-colors rounded-full border border-white/5 flex-shrink-0"
              >
                <ArrowUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      </div>
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

function SettingsPage({ onClose }: { onClose: () => void }) {
  const dummySettings = [
    { id: 1, icon: <User size={20} />, title: 'Akun', description: 'Kelola informasi pribadi dan keamanan.' },
    { id: 2, icon: <Shield size={20} />, title: 'Privasi', description: 'Atur siapa yang bisa melihat aktivitasmu.' },
    { id: 3, icon: <Bell size={20} />, title: 'Notifikasi', description: 'Pilih apa yang ingin kamu dengar dari kami.' },
    { id: 4, icon: <Monitor size={20} />, title: 'Tampilan', description: 'Tema gelap, terang, dan preferensi visual.' },
    { id: 5, icon: <Database size={20} />, title: 'Penyimpanan', description: 'Kelola cache dan data percakapan.' },
    { id: 6, icon: <Globe size={20} />, title: 'Bahasa', description: 'Ubah bahasa antarmuka aplikasi.' },
    { id: 7, icon: <Key size={20} />, title: 'API Keys', description: 'Atur kunci API model khusus.' },
    { id: 8, icon: <Zap size={20} />, title: 'Performa', description: 'Optimalkan kecepatan dan animasi.' },
    { id: 9, icon: <Smartphone size={20} />, title: 'Perangkat', description: 'Sesi aktif di berbagai perangkat.' },
    { id: 10, icon: <Hexagon size={20} />, title: 'Lanjutan', description: 'Fitur eksperimental dan developer.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: '20px' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '20px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col mb-12">
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
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              className="flex items-start p-4 md:p-5 rounded-3xl bg-white/5 border border-white/5 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gray-300 mr-5 flex-shrink-0">
                {setting.icon}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-white font-medium text-lg mb-0.5">{setting.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{setting.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    // Use a lower resolution multiplier to improve performance drastically on mobile
    const resolution = window.innerWidth < 768 ? 0.5 : 0.75;

    const resize = () => {
      canvas.width = window.innerWidth * resolution;
      canvas.height = window.innerHeight * resolution;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      // Slower animation on mobile
      time += window.innerWidth < 768 ? 0.003 : 0.005;
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      
      // Blob 1 (Purple/Blue mix)
      const x1 = width / 2 + Math.sin(time) * minDim * 0.3;
      const y1 = height / 2 + Math.cos(time * 0.8) * minDim * 0.3;
      const r1 = minDim * 0.7;
      
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0, 'rgba(147, 51, 234, 0.15)');
      g1.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
      g1.addColorStop(1, 'rgba(147, 51, 234, 0)');
      
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Blob 2 (Pink/Orange mix)
      const x2 = width / 2 + Math.sin(time * 1.2 + Math.PI) * minDim * 0.25;
      const y2 = height / 2 + Math.cos(time * 0.9 + Math.PI) * minDim * 0.25;
      const r2 = minDim * 0.65;
      
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0, 'rgba(236, 72, 153, 0.12)');
      g2.addColorStop(0.5, 'rgba(249, 115, 22, 0.04)');
      g2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);
      
      // Blob 3 (Blue accent)
      const x3 = width / 2 + Math.sin(time * 0.7 + Math.PI / 2) * minDim * 0.35;
      const y3 = height / 2 + Math.cos(time * 1.1 + Math.PI / 2) * minDim * 0.35;
      const r3 = minDim * 0.6;
      
      const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3);
      g3.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      g3.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0 opacity-80 w-full h-full"
    />
  );
}
