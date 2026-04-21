import React, { useState, useRef, useEffect } from 'react';
import LogoCat from '../logo/LogoCat.png';

import { 
  Plus, MessageSquare, Settings, Send, Beaker, 
  User, Bot, Info, ShieldCheck, Database,
  Menu, X, MapPin, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const AiPaintSpecialist: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'assistant', 
      content: 'Sistem R&D Siap. Logika Zinc Chromate Brown diaktifkan. Ada kendala korosi berat atau kebutuhan spesifikasi coating hari ini?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newUserMsg: Message = { id: Date.now(), role: 'user', content: input };
    setMessages([...messages, newUserMsg]);
    setInput('');

    setTimeout(() => {
      const aiMsg: Message = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: 'Analisis Selesai: Untuk substrat dengan tingkat oksidasi coklat, gunakan sistem sandblasting Sa 2.5 sebelum aplikasi primer Zinc Chromate Brown 75 mikron.' 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#1a1614] text-[#dcd7d4] font-sans selection:bg-[#8b5a2b]/40">
      
      {/* --- COLLAPSIBLE SIDEBAR --- */}
      <aside className={`relative transition-all duration-300 ease-in-out bg-[#14110f] border-r border-[#8b5a2b]/20 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden border-none'}`}>
        <div className="p-5 flex flex-col h-full min-w-[280px]">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <img className='w-16 h-16 rounded-full object-cover' src={LogoCat} alt="profile" />
            <div className="flex items-center">
              <span className="text-5xl font-black tracking-tighter text-[#8b5a2b]">P</span><span className="text-sm font-black tracking-tighter text-[#8b5a2b]">AI</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
             <button className="flex items-center gap-3 w-full bg-[#8b5a2b] p-3.5 rounded-2xl text-[#1a1614] font-bold mb-6 hover:scale-[0.98] transition-all shadow-lg">
              <Plus size={18} />
              Percakapan Baru
            </button>

            <p className="text-[10px] font-black text-[#8b5a2b]/40 uppercase tracking-[0.2em] px-2 mb-2">Main Menu</p>
            
            <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#8b5a2b]/10 text-sm font-bold text-[#dcd7d4]/70 hover:text-[#8b5a2b] transition-all">
              <MapPin size={18} />
              Toko Cat Terdekat
            </button>

            <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#8b5a2b]/10 text-sm font-bold text-[#dcd7d4]/70 hover:text-[#8b5a2b] transition-all">
              <MessageSquare size={18} />
              Percakapan
            </button>

            <div className="mt-6">
               <p className="text-[10px] font-black text-[#8b5a2b]/40 uppercase tracking-[0.2em] px-2 mb-2">System</p>
               <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#8b5a2b]/10 text-sm font-bold text-[#dcd7d4]/70 hover:text-[#8b5a2b] transition-all">
                <Settings size={18} />
                Setelan
              </button>
              <button className="flex items-center gap-3 w-full p-3.5 rounded-xl hover:bg-[#8b5a2b]/10 text-sm font-bold text-[#dcd7d4]/70 hover:text-[#8b5a2b] transition-all">
                <HelpCircle size={18} />
                Bantuan
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative bg-[#1a1614]">
        
        {/* Header with Sidebar Toggle & Profile */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#1a1614]/80 backdrop-blur-md border-b border-[#8b5a2b]/10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#8b5a2b]/10 rounded-lg text-[#8b5a2b] transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* User Profile Section (Right) */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-[#8b5a2b] uppercase">Rafli Specialist</p>
              <p className="text-[9px] text-green-500 font-bold uppercase tracking-tighter">Verified R&D</p>
            </div>
            <div className="relative">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rafli" 
                alt="Profile" 
                className="w-10 h-10 rounded-xl border-2 border-[#8b5a2b]/50 group-hover:border-[#8b5a2b] transition-all shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1614]"></div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-5 md:gap-8 max-w-4xl mx-auto w-full group ${
                msg.role === 'assistant' ? 'bg-[#8b5a2b]/5 p-8 rounded-[40px] border border-[#8b5a2b]/10' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-[18px] flex-shrink-0 flex items-center justify-center shadow-2xl transition-all ${
                msg.role === 'assistant' 
                ? 'bg-[#8b5a2b] text-[#1a1614]' 
                : 'bg-[#2b2522] text-[#8b5a2b] border border-[#8b5a2b]/20'
              }`}>
                {msg.role === 'assistant' ? <Bot size={24} /> : <User size={24} />}
              </div>
              <div className="flex-1 space-y-3">
                <p className={`font-black text-xs uppercase tracking-[0.2em] ${
                  msg.role === 'assistant' ? 'text-[#8b5a2b]' : 'text-gray-500'
                }`}>
                  {msg.role === 'assistant' ? 'R&D AI Agent' : 'User Access'}
                </p>
                <div className="text-[#dcd7d4] leading-[1.8] text-[16px]">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} className="h-20" />
        </div>

        {/* Input Bar */}
        <div className="px-6 pb-10 pt-4 bg-gradient-to-t from-[#1a1614] via-[#1a1614] to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-[#8b5a2b] rounded-[30px] blur opacity-5 group-focus-within:opacity-10 transition duration-1000"></div>
            <div className="relative flex items-center bg-[#14110f] border border-[#8b5a2b]/20 rounded-[28px] p-2.5 pr-6 shadow-2xl">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Diskusikan masalah korosi atau formulasi..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#dcd7d4] placeholder-[#8b5a2b]/20 p-3 text-[15px]"
              />
              <button 
                onClick={handleSend}
                className="bg-[#8b5a2b] p-3.5 rounded-2xl text-[#1a1614] hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-center text-[9px] text-[#8b5a2b]/30 mt-5 font-black uppercase tracking-[0.4em]">
              ZINC CHROMATE BROWN PROTOCOL &bull; SECURE NODES
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8b5a2b33; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AiPaintSpecialist;