import React, { useState, useRef, useEffect } from 'react';
import LogoCat from '../logo/LogoCat.png';
import SettingsModal from './settingModals';

import { 
  Plus, MessageSquare, Settings, Send, Beaker, 
  User, Bot, Info, ShieldCheck, MapPin, 
  Menu, X, Trash2, AlertTriangle, HelpCircle,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';

// --- Interfaces ---
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  messages: Message[];
}

const AiPaintSpecialist: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});
  const [isSettingOpen,  setIsSettingOpen] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: number | null}>({
    show: false,
    id: null
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'; 
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; 
    }
  }, [input]);

  const toggleExpand = (id: number) => {
    setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newUserMsg: Message = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    setTimeout(() => {
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: 'Analisis R&D Selesai: Berdasarkan parameter kimia yang Anda berikan, substrat terdeteksi mengalami degradasi adhesi akibat kontaminasi permukaan. Rekomendasi: Gunakan primer Zinc Chromate Brown dengan ketebalan 75 mikron setelah pembersihan mekanik standar Sa 2.5 untuk hasil optimal.' 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || "Percakapan Baru";
      const newSession: ChatSession = {
        id: activeChatId || Date.now(),
        title: firstUserMsg.substring(0, 30),
        messages: [...messages]
      };
      setChatHistory(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)]);
    }
    setMessages([]);
    setActiveChatId(null);
    setInput('');
  };

  const loadChat = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveChatId(session.id);
  };

  const confirmDelete = () => {
    if (showDeleteModal.id) {
      setChatHistory(prev => prev.filter(chat => chat.id !== showDeleteModal.id));
      if (activeChatId === showDeleteModal.id) {
        setMessages([]);
        setActiveChatId(null);
      }
    }
    setShowDeleteModal({ show: false, id: null });
  };

  return (
    <div className={`flex h-screen font-sans selection:bg-[#8b5a2b]/40 overflow-hidden text-sm transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#1a1614] text-[#dcd7d4]' : 'bg-[#fdfcfb] text-[#4a3a2e]'
    }`}>
      
      <aside className={`relative transition-all duration-300 ease-in-out border-[#8b5a2b]/20 flex flex-col ${
        theme === 'dark' ? 'bg-[#14110f]' : 'bg-[#f7f3f0]'
      } ${isSidebarOpen ? 'w-72 border-r' : 'w-0 border-none overflow-hidden'}`}>
        <div className="p-5 flex flex-col h-full min-w-[280px]">
          <div className="flex items-center gap-2 px-2 mb-10 text-[#8b5a2b]">
            <img className='w-12 h-12 rounded-full object-cover border border-[#8b5a2b]/30 shadow-lg' src={LogoCat} alt="logo" />
            <div className="flex items-center">
              <span className="text-4xl font-black tracking-tighter">P</span>
              <span className="text-xs font-black tracking-[0.3em] mt-2 ml-0.5">AI</span>
            </div>
          </div>

          <button onClick={startNewChat} className="flex items-center gap-3 w-full bg-[#8b5a2b] p-3.5 rounded-2xl text-white font-bold mb-6 hover:scale-[0.98] transition-all shadow-lg">
            <Plus size={18} /> Percakapan Baru
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            <p className="text-[10px] font-black text-[#8b5a2b]/40 uppercase tracking-[0.2em] px-2 mb-4">History Log</p>
            {chatHistory.map((chat) => (
              <div key={chat.id} onClick={() => loadChat(chat)} className={`group flex items-center justify-between gap-2 p-3 rounded-xl cursor-pointer transition-all border ${activeChatId === chat.id ? 'bg-[#8b5a2b]/20 border-[#8b5a2b]/40' : 'border-transparent hover:bg-[#8b5a2b]/10'}`}>
                <div className="flex items-center gap-3 truncate text-xs">
                  <MessageSquare size={14} className={activeChatId === chat.id ? 'text-[#8b5a2b]' : 'text-gray-500'} />
                  <span className="truncate font-medium">{chat.title}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal({ show: true, id: chat.id }); }} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-[#8b5a2b]/10 space-y-1">
              <button onClick={() => window.open('https://www.google.com/maps/search/toko+cat+terdekat', '_blank')} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#8b5a2b]/10 text-xs font-bold transition-all"><MapPin size={16} /> Toko Cat Terdekat</button>
              <button onClick={() => setIsSettingOpen(true)} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#8b5a2b]/10 text-xs font-bold transition-all"><Settings size={16} /> Setelan</button>
          </div>

          <SettingsModal 
            isOpen={isSettingOpen} 
            onClose={() => setIsSettingOpen(false)} 
            theme={theme} 
            setTheme={setTheme} 
            chatHistory={chatHistory} 
          />
        </div>
      </aside>

      <main className={`flex-1 flex flex-col relative transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a1614]' : 'bg-[#fdfcfb]'}`}>
        
        <header className={`h-16 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-30 transition-colors ${
          theme === 'dark' ? 'bg-[#1a1614]/80' : 'bg-white/80'
        }`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#8b5a2b]/10 rounded-lg text-[#8b5a2b] transition-colors">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-4 group cursor-pointer text-right">
            <div className="hidden sm:block text-xs">
              <p className="font-black text-[#8b5a2b] uppercase text-[10px]">Rafli Specialist</p>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Verified R&D</p>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rafli" alt="Profile" className="w-10 h-10 rounded-xl border-2 border-[#8b5a2b]/50 shadow-lg transition-all" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
              <h2 className={`text-5xl font-black mb-8 tracking-tighter text-center transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-[#4a3a2e]'
              }`}>Cat nya kenapa?</h2>
              
              <div className="w-full max-w-2xl px-4">
                {/* MODIFIKASI: Border dihapus dari input tengah */}
                <div className={`relative flex items-end rounded-[40px] p-2 shadow-2xl transition-all duration-500 ${
                  theme === 'dark' ? 'bg-[#14110f]' : 'bg-white'
                }`}>
                  <textarea 
                    ref={textAreaRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Jelaskan masalah cat atau parameter kimia Anda..." 
                    className={`flex-1 bg-transparent border-none focus:ring-0 focus:outine-none outline-none px-4 py-4 text-lg placeholder:text-[#8b5a2b]/20 resize-none max-h-48 custom-scrollbar ${
                      theme === 'dark' ? 'text-white' : 'text-[#4a3a2e]'
                    }`}
                  />
                  <button onClick={handleSend} className="bg-[#8b5a2b] p-4 rounded-[22px] text-white hover:scale-105 active:scale-95 transition-all shadow-lg mb-1 mr-1">
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 md:py-12 space-y-10 max-w-5xl mx-auto w-full">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] min-w-0 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-xl ${
                      msg.role === 'assistant' ? 'bg-[#8b5a2b] text-white' : 'bg-[#2b2522] text-[#8b5a2b] border border-[#8b5a2b]/20'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} overflow-hidden w-full`}>
                      <p className={`font-black text-[9px] uppercase tracking-[0.2em] mb-1.5 ${msg.role === 'assistant' ? 'text-[#8b5a2b]' : 'text-[#8b5a2b]/40'}`}>
                        {msg.role === 'assistant' ? 'R&D AI Agent' : 'Authorized User'}
                      </p>
                      <div className="flex items-start gap-3 group w-full relative">
                        <div className="flex flex-col items-center gap-1 order-first">
                          <button onClick={() => copyToClipboard(msg.content, msg.id)} className="mt-2 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-[#2b2522] text-[#8b5a2b] border border-[#8b5a2b]/20 hover:scale-90 relative">
                            {copiedId === msg.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        {/* MODIFIKASI: Fitur Show More/Less untuk teks panjang (500 karakter) */}
                        <div className={`relative p-4 rounded-2xl shadow-xl border leading-relaxed text-[15px] transition-all duration-500 whitespace-pre-wrap break-all md:break-words flex-1 ${
                          msg.role === 'assistant' 
                          ? (theme === 'dark' ? 'bg-[#8b5a2b]/5 border-[#8b5a2b]/10 text-[#dcd7d4]' : 'bg-gray-100 border-gray-200 text-[#4a3a2e]') 
                          : 'bg-[#8b5a2b] border-[#8b5a2b]/20 text-white'
                        } ${!expandedMessages[msg.id] && msg.content.length > 500 ? 'max-h-40 overflow-hidden relative' : 'h-auto'}`}>
                          {msg.content}
                          {!expandedMessages[msg.id] && msg.content.length > 500 && (
                            <div className={`absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t pointer-events-none ${
                              theme === 'dark' ? 'from-[#1a1614]' : 'from-gray-100'
                            }`} />
                          )}
                        </div>
                      </div>
                      {/* MODIFIKASI: Tombol toggle untuk pesan panjang */}
                      {msg.content.length > 500 && (
                        <button onClick={() => toggleExpand(msg.id)} className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase text-[#8b5a2b] hover:opacity-70 transition-all">
                          {expandedMessages[msg.id] ? <><ChevronUp size={14}/> Sembunyikan</> : <><ChevronDown size={14}/> Lihat Selengkapnya</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} className="h-32" />
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className={`px-6 pb-10 pt-4 bg-gradient-to-t z-40 transition-colors ${
            theme === 'dark' ? 'from-[#1a1614] via-[#1a1614]' : 'from-[#fdfcfb] via-[#fdfcfb]'
          }`}>
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-[#8b5a2b] rounded-[30px] blur opacity-5 group-focus-within:opacity-10 transition duration-1000"></div>
              {/* MODIFIKASI: Border dihapus dari input bawah */}
              <div className={`relative flex items-end rounded-[28px] p-2 pr-2 shadow-2xl transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#14110f]' : 'bg-white'
              }`}>
                <textarea 
                  ref={textAreaRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Kirim instruksi R&D lanjutan..." 
                  className={`flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none px-4 py-3 text-lg placeholder:text-[#8b5a2b]/20 resize-none max-h-48 custom-scrollbar ${
                    theme === 'dark' ? 'text-white' : 'text-[#4a3a2e]'
                  }`} 
                />
                <button onClick={handleSend} className="bg-[#8b5a2b] p-3.5 rounded-2xl text-white hover:scale-105 active:scale-95 transition-all shadow-lg mb-1 mr-1"><Send size={18} /></button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal.show && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`p-8 rounded-[32px] max-w-sm w-full shadow-2xl text-center border animate-in zoom-in duration-300 ${
              theme === 'dark' ? 'bg-[#1e1a17] border-[#8b5a2b]/30 text-[#dcd7d4]' : 'bg-white border-gray-200 text-[#4a3a2e]'
            }`}>
              <div className="bg-red-500/10 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter">Hapus Log?</h3>
              <p className="text-xs text-gray-500 mb-8 leading-relaxed font-bold uppercase tracking-widest px-4">
                Apakah yakin ingin menghapus percakapan tersebut dari history?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal({ show: false, id: null })} 
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    theme === 'dark' ? 'bg-[#2b2522] text-[#dcd7d4] border border-[#8b5a2b]/10' : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AiPaintSpecialist;