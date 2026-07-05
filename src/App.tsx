import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Bell, User, Settings, Star, PlusCircle, 
  ChevronDown, MoreHorizontal, Plus, AudioLines, ArrowUp, Sparkles, X, Clock, Trash2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

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
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState('1');
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Percakapan baru', isFavorite: false, messages: [] },
    { 
      id: '2', 
      title: 'Teori Relativitas', 
      isFavorite: true, 
      messages: [
        { role: 'user', text: 'Jelaskan teori relativitas secara singkat.' },
        { role: 'model', text: 'Teori relativitas terdiri dari dua bagian: relativitas khusus dan relativitas umum, yang diajukan oleh Albert Einstein.\n\n1. **Relativitas Khusus** (1905): Menyatakan bahwa hukum fisika sama untuk semua pengamat yang tidak bergerak dipercepat, dan bahwa kecepatan cahaya dalam vakum sama untuk semua pengamat, terlepas dari kecepatan relatif mereka. Ini menghasilkan konsep bahwa ruang dan waktu saling terkait dalam "ruang-waktu".\n\n2. **Relativitas Umum** (1915): Memperluas ini dengan memasukkan gravitasi. Einstein mengusulkan bahwa gravitasi bukanlah gaya tarikan seperti yang dipikirkan Newton, melainkan kelengkungan ruang-waktu yang disebabkan oleh massa dan energi.' }
      ]
    },
    { 
      id: '3', 
      title: 'Resep nasi goreng', 
      isFavorite: false, 
      messages: [
        { role: 'user', text: 'Apa resep nasi goreng sederhana?' },
        { role: 'model', text: 'Berikut resep nasi goreng sederhana:\n\n**Bahan:**\n- 2 piring nasi putih (dingin)\n- 2 siung bawang putih, cincang halus\n- 3 siung bawang merah, iris\n- 1 butir telur\n- 2 sdm kecap manis\n- Garam dan merica secukupnya\n- Minyak untuk menumis\n\n**Cara membuat:**\n1. Panaskan minyak, orak-arik telur, lalu sisihkan di pinggir wajan.\n2. Tumis bawang putih dan merah hingga harum.\n3. Masukkan nasi, aduk rata dengan bumbu dan telur.\n4. Tambahkan kecap manis, garam, dan merica. Aduk terus hingga matang merata.\n5. Sajikan selagi hangat!' }
      ]
    },
  ]);

  const activeChat = chatHistory.find(c => c.id === activeChatId) || chatHistory[0];
  const messages = activeChat.messages;
  const isFavorite = activeChat.isFavorite;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timer);
  }, []);
  
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
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

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
    <div className="relative h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 tracking-tight"
            >
              Welcome to Xhzell AI.
            </motion.h1>
          </motion.div>
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
              className="absolute top-0 left-0 h-full w-72 md:w-80 z-50 bg-white/5 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col shadow-2xl"
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
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top Navigation */}
      <header className="flex items-center justify-between p-4 flex-shrink-0 max-w-7xl mx-auto w-full relative">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
        </motion.button>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/5 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/10 space-x-1">
          <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <User className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
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
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-70">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400"
            >
              Welcome to Xhzell AI.
            </motion.h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 w-full pb-10">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[85%] md:max-w-[85%] 
                    ${msg.role === 'user' 
                      ? 'bg-white/15 backdrop-blur-md text-white rounded-3xl rounded-br-sm px-5 py-3.5 border border-white/10 shadow-sm' 
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
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] md:max-w-[75%] px-2 py-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="text-sm font-medium tracking-wider uppercase animate-shimmer-text">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Input Area */}
      <div className="w-full p-4 pb-6 md:p-6 md:pb-8 flex justify-center flex-shrink-0 relative z-10">
        <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-[32px] p-4 shadow-2xl border border-white/10 transition-all focus-within:bg-white/10 focus-within:border-white/20">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tulis sesuatu..."
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none text-xs md:text-sm min-h-[40px] max-h-[200px] overflow-y-auto px-2"
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

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      time += 0.005;
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      
      // Blob 1 (Purple/Blue mix)
      const x1 = width / 2 + Math.sin(time) * minDim * 0.3;
      const y1 = height / 2 + Math.cos(time * 0.8) * minDim * 0.3;
      const r1 = minDim * 0.6;
      
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0, 'rgba(147, 51, 234, 0.15)');
      g1.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
      g1.addColorStop(1, 'rgba(147, 51, 234, 0)');
      
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Blob 2 (Pink/Orange mix)
      const x2 = width / 2 + Math.sin(time * 1.2 + Math.PI) * minDim * 0.25;
      const y2 = height / 2 + Math.cos(time * 0.9 + Math.PI) * minDim * 0.25;
      const r2 = minDim * 0.55;
      
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0, 'rgba(236, 72, 153, 0.12)');
      g2.addColorStop(0.5, 'rgba(249, 115, 22, 0.04)');
      g2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);
      
      // Blob 3 (Blue accent)
      const x3 = width / 2 + Math.sin(time * 0.7 + Math.PI / 2) * minDim * 0.35;
      const y3 = height / 2 + Math.cos(time * 1.1 + Math.PI / 2) * minDim * 0.35;
      const r3 = minDim * 0.5;
      
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
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
