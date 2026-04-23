import React, { useState, useRef, useEffect } from 'react';
import LogoCat from '../logo/LogoCat.png';
import { 
  Plus, MessageSquare, Settings, Send, Beaker, 
  User, Bot, Info, ShieldCheck, MapPin, 
  Menu, X, Trash2, AlertTriangle, HelpCircle 
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
  // --- States ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  
  // State untuk Modal Hapus
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: number | null}>({
    show: false,
    id: null
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Handlers ---

  // 1. Fungsi Membuat Percakapan Baru (Simpan yang lama otomatis jika ada isinya)
  const startNewChat = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || "Percakapan Baru";
      const newSession: ChatSession = {
        id: activeChatId || Date.now(),
        title: firstUserMsg.substring(0, 30),
        messages: [...messages]
      };

      setChatHistory(prev => {
        const exists = prev.find(s => s.id === newSession.id);
        if (exists) return prev.map(s => s.id === newSession.id ? newSession : s);
        return [newSession, ...prev];
      });
    }

    setMessages([]);
    setActiveChatId(null);
  };

  // 2. Fungsi Memuat Chat Lama
  const loadChat = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveChatId(session.id);
  };

  // 3. Logika Hapus Percakapan
  const triggerDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setShowDeleteModal({ show: true, id: id });
  };

  const confirmDelete = () => {
    if (showDeleteModal.id) {
      const idToDelete = showDeleteModal.id;
      setChatHistory(prev => prev.filter(chat => chat.id !== idToDelete));
      
      // Jika chat yang dihapus sedang dibuka, kosongkan layar ke mode awal
      if (activeChatId === idToDelete || (messages.length > 0 && chatHistory.length <= 1)) {
        setMessages([]);
        setActiveChatId(null);
      }
    }
    setShowDeleteModal({ show: false, id: null });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg: Message = { id: Date.now(), role: 'user', content: input };
    const currentMessages = [...messages, newUserMsg];
    setMessages(currentMessages);
    setInput('');

    // Simulasi Jawaban AI R&D
    setTimeout(() => {
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: 'Analisis R&D Selesai: Berdasarkan deskripsi Anda, substrat terdeteksi mengalami degradasi adhesi. Rekomendasi: Gunakan primer Zinc Chromate Brown 75 mikron setelah pembersihan mekanik Sa 2.5.' 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#1a1614] text-[#dcd7d4] font-sans selection:bg-[#8b5a2b]/40 overflow-hidden text-sm">
      
      {/* --- SIDEBAR --- */}
      <aside className={`relative transition-all duration-300 ease-in-out bg-[#14110f] border-r border-[#8b5a2b]/20 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-0 border-none'}`}>
        <div className="p-5 flex flex-col h-full min-w-[280px]">
          {/* Logo Section */}
          <div className="flex items-center gap-2 px-2 mb-10">
            <img className='w-12 h-12 rounded-full object-cover border border-[#8b5a2b]/30 shadow-lg shadow-[#8b5a2b]/10' src={LogoCat} alt="logo" />
            <div className="flex items-center text-[#8b5a2b]">
              <span className="text-4xl font-black tracking-tighter">P</span>
              <span className="text-xs font-black tracking-[0.3em] mt-2 ml-0.5">AI</span>
            </div>
          </div>

          <button onClick={startNewChat} className="flex items-center gap-3 w-full bg-[#8b5a2b] p-3.5 rounded-2xl text-[#1a1614] font-bold mb-6 hover:scale-[0.98] active:scale-95 transition-all shadow-lg">
            <Plus size={18} /> Percakapan Baru
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            <p className="text-[10px] font-black text-[#8b5a2b]/40 uppercase tracking-[0.2em] px-2 mb-4">History Log</p>
            {chatHistory.length === 0 ? (
                <p className="text-[10px] text-gray-600 px-2 italic">Belum ada riwayat...</p>
            ) : (
                chatHistory.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => loadChat(chat)}
                      className={`group flex items-center justify-between gap-2 w-full p-3 rounded-xl cursor-pointer transition-all border ${activeChatId === chat.id ? 'bg-[#8b5a2b]/20 border-[#8b5a2b]/40' : 'border-transparent hover:bg-[#8b5a2b]/10'}`}
                    >
                      <div className="flex items-center gap-3 truncate text-xs">
                        <MessageSquare size={14} className={activeChatId === chat.id ? 'text-[#8b5a2b]' : 'text-gray-500'} />
                        <span className="truncate font-medium">{chat.title}</span>
                      </div>
                      <button onClick={(e) => triggerDelete(e, chat.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-4 border-t border-[#8b5a2b]/10 space-y-1">
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#8b5a2b]/10 text-xs font-bold transition-all"><MapPin size={16} /> Toko Cat Terdekat</button>
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#8b5a2b]/10 text-xs font-bold transition-all"><Settings size={16} /> Setelan</button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative bg-[#1a1614]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#1a1614]/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#8b5a2b]/10 rounded-lg text-[#8b5a2b] transition-colors">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right hidden sm:block text-xs">
              <p className="font-black text-[#8b5a2b] uppercase">Rafli Specialist</p>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Verified R&D</p>
            </div>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rafli" alt="Profile" className="w-10 h-10 rounded-xl border-2 border-[#8b5a2b]/50 group-hover:border-[#8b5a2b] shadow-lg transition-all" />
          </div>
        </header>

        {/* Chat Area & Dynamic Welcome View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {messages.length === 0 ? (
            // --- TAMPILAN AWAL (CENTRAL INPUT) ---
            <div className="h-full gap-7 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-700">
              <h2 className="text-5xl font-black text-[#dcd7d4] mb-3 tracking-tighter">Cat nya kenapa?</h2>
              <div className="w-full max-w-2xl px-4">
                <div className="relative flex items-center bg-[#14110f] border border-[#8b5a2b]/30 rounded-[32px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] focus-within:border-[#8b5a2b] transition-all duration-500">
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Jelaskan masalah cat atau parameter kimia Anda..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[#dcd7d4] px-4 text-lg placeholder:text-[#8b5a2b]/20"
                  />
                  <button onClick={handleSend} className="bg-[#8b5a2b] p-4 rounded-[22px] text-[#1a1614] hover:scale-105 active:scale-95 transition-all shadow-lg">
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // --- TAMPILAN CHAT AKTIF ---
            <div className="p-4 md:p-12 space-y-10 animate-in slide-in-from-bottom-6 duration-500">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-5 md:gap-8 max-w-4xl mx-auto w-full group ${msg.role === 'assistant' ? 'bg-[#8b5a2b]/5 p-8 rounded-[40px] border border-[#8b5a2b]/10 shadow-xl' : 'p-2 px-6'}`}>
                  <div className={`w-12 h-12 rounded-[20px] flex-shrink-0 flex items-center justify-center shadow-2xl transition-all ${msg.role === 'assistant' ? 'bg-[#8b5a2b] text-[#1a1614]' : 'bg-[#2b2522] text-[#8b5a2b] border border-[#8b5a2b]/20'}`}>
                    {msg.role === 'assistant' ? <Bot size={24} /> : <User size={24} />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className={`font-black text-[10px] uppercase tracking-[0.3em] ${msg.role === 'assistant' ? 'text-[#8b5a2b]' : 'text-[#8b5a2b]/40'}`}>{msg.role === 'assistant' ? 'R&D AI Agent' : 'Authorized User'}</p>
                    <div className="text-[#dcd7d4] leading-[1.9] text-[16px] font-medium opacity-90">{msg.content}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} className="h-32" />
            </div>
          )}
        </div>

        {/* --- INPUT BAWAH (Sticky Bottom) --- */}
        {messages.length > 0 && (
          <div className="px-6 pb-10 pt-4 bg-gradient-to-t from-[#1a1614] via-[#1a1614] to-transparent animate-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-[#8b5a2b] rounded-[30px] blur opacity-5 group-focus-within:opacity-10 transition duration-1000"></div>
              <div className="relative flex items-center bg-[#14110f] border border-[#8b5a2b]/20 rounded-[28px] p-2 pr-6 shadow-2xl transition-all duration-300">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder="Kirim instruksi R&D lanjutan..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[#dcd7d4] p-4 text-[15px] placeholder:text-[#8b5a2b]/20" 
                />
                <button onClick={handleSend} className="bg-[#8b5a2b] p-3.5 rounded-2xl text-[#1a1614] hover:scale-105 active:scale-95 transition-all shadow-lg">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL ALERT HAPUS (ZINC BROWN THEME) --- */}
        {showDeleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1c1e14] border border-[#8b5a2b]/40 p-10 rounded-[45px] max-w-sm w-full shadow-[0_0_80px_rgba(0,0,0,0.6)] text-center scale-in-center animate-in zoom-in duration-300">
              <div className="bg-red-500/10 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-red-500/5">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#dcd7d4] mb-3 uppercase tracking-tighter text-[#8b5a2b]">Hapus Log?</h3>
              <p className="text-xs text-gray-500 mb-10 leading-relaxed font-bold uppercase tracking-widest px-4">
                Apakah yakin ingin menghapus percakapan tersebut dari basis data?
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteModal({ show: false, id: null })} className="flex-1 py-5 rounded-[22px] bg-[#2b2522] text-[#dcd7d4] font-black uppercase text-[10px] tracking-widest border border-[#8b5a2b]/10 hover:bg-[#3d3430] transition-all">Batal</button>
                <button onClick={confirmDelete} className="flex-1 py-5 rounded-[22px] bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">Hapus</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8b5a2b33; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8b5a2b66; }
      `}</style>
    </div>
  );
};

export default AiPaintSpecialist;