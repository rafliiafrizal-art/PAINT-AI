import React, { useState } from 'react';
import { 
  X, Settings, Sun, Moon, Lock, HelpCircle, 
  Shield, Send, Database, Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Props Integrasi Global
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  chatHistory: any[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, theme, setTheme, chatHistory 
}) => {
  const [activeTab, setActiveTab] = useState('umum');
  const [helpMessage, setHelpMessage] = useState('');
  const [selectedChatBlockchain, setSelectedChatBlockchain] = useState<number | null>(null);

  if (!isOpen) return null;

  // Fungsi Kirim Bantuan ke Email
  const handleSendHelp = () => {
    const subject = encodeURIComponent("Bantuan Platform Ai Paint");
    const body = encodeURIComponent(helpMessage);
    window.location.href = `mailto:rapliisosiall@gmail.com?subject=${subject}&body=${body}`;
    setHelpMessage('');
  };

  // Fungsi Sinkronisasi Blockchain (Code Sederhana untuk Backend)
  const handleBlockchainSync = () => {
    const chatToSync = chatHistory.find(c => c.id === selectedChatBlockchain);
    if (chatToSync) {
      console.log("Data siap dikirim ke Backend Blockchain:", chatToSync);
      alert(`Berhasil! Sesi "${chatToSync.title}" telah disiapkan untuk integrasi Blockchain.`);
    }
  };

  const tabs = [
    { id: 'umum', label: 'Umum', icon: Settings },
    { id: 'data', label: 'Privasi & Data', icon: Lock },
    { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-sm">
      <div className={`border border-[#8b5a2b]/30 rounded-[32px] w-full max-w-4xl h-[600px] flex overflow-hidden shadow-2xl transition-all duration-500 ${
        theme === 'dark' ? 'bg-[#1e1a17] text-[#dcd7d4]' : 'bg-[#fdfcfb] text-[#4a3a2e]'
      }`}>
        
        {/* Sidebar Modal */}
        <div className={`w-64 border-r border-[#8b5a2b]/10 p-6 flex flex-col transition-colors ${
          theme === 'dark' ? 'bg-[#14110f]' : 'bg-[#f7f3f0]'
        }`}>
          <h2 className="text-xl font-bold mb-8 px-2 text-[#8b5a2b]">Setelan</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-[#8b5a2b] text-white shadow-lg' : 'text-gray-500 hover:bg-[#8b5a2b]/10'
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Konten Modal */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 flex justify-end">
            <button onClick={onClose} className="p-2 hover:bg-[#8b5a2b]/10 rounded-full text-gray-400 transition-all">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
            {/* TAB UMUM (Hanya Tema Visual) */}
            {activeTab === 'umum' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold mb-6">Pengaturan Umum</h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-[#8b5a2b]/10">
                    <div>
                      <p className="font-bold">Tema Visual</p>
                      <p className="text-xs text-gray-500 mt-1">Pilih tampilan gelap atau terang untuk seluruh platform</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-black/10 rounded-xl border border-[#8b5a2b]/20 transition-all">
                      <button 
                        onClick={() => setTheme('dark')} 
                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-[#8b5a2b] text-white shadow-md' : 'text-gray-400 hover:text-[#8b5a2b]'}`}
                        title="Mode Gelap"
                      >
                        <Moon size={22} />
                      </button>
                      <button 
                        onClick={() => setTheme('light')} 
                        className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-[#8b5a2b] text-white shadow-md' : 'text-gray-400 hover:text-[#8b5a2b]'}`}
                        title="Mode Terang"
                      >
                        <Sun size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB PRIVASI & DATA (Blockchain Logic) */}
            {activeTab === 'data' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold mb-6">Privasi & Data</h3>
                <div className="space-y-6">
                  <div className={`p-4 rounded-xl border flex gap-4 ${theme === 'dark' ? 'bg-[#8b5a2b]/10 border-[#8b5a2b]/20' : 'bg-[#8b5a2b]/5 border-[#8b5a2b]/10'}`}>
                    <Shield className="text-[#8b5a2b] shrink-0" size={24} />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Pilih riwayat percakapan untuk diabadikan ke dalam <b>Data Identity Blockchain</b>. Data akan dienkripsi sebelum diproses.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {chatHistory.map((chat) => (
                      <div 
                        key={chat.id} 
                        onClick={() => setSelectedChatBlockchain(chat.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition-all ${
                          selectedChatBlockchain === chat.id 
                          ? 'border-[#8b5a2b] bg-[#8b5a2b]/20 text-[#8b5a2b]' 
                          : 'border-transparent bg-black/5 hover:bg-[#8b5a2b]/5'
                        }`}
                      >
                        <span className="truncate font-medium">{chat.title}</span>
                        {selectedChatBlockchain === chat.id && <Check size={14} />}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleBlockchainSync}
                    className="w-full py-4 rounded-2xl bg-[#8b5a2b] text-white font-bold flex justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    disabled={!selectedChatBlockchain}
                  >
                    <Database size={18} /> Simpan ke Blockchain
                  </button>
                </div>
              </div>
            )}
            
            {/* TAB BANTUAN (Email Support) */}
            {activeTab === 'bantuan' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold mb-6">Hubungi Developer</h3>
                <div className="space-y-4">
                  <textarea 
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Tuliskan kendala atau pertanyaan Anda tentang platform ini..."
                    className={`w-full h-32 p-4 rounded-2xl border border-[#8b5a2b]/20 focus:border-[#8b5a2b] outline-none transition-all ${
                      theme === 'dark' ? 'bg-[#14110f]' : 'bg-white'
                    }`}
                  />
                  <button 
                    onClick={handleSendHelp}
                    className="w-full py-4 rounded-2xl bg-[#8b5a2b] text-white font-bold flex justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Send size={18} /> Kirim ke Rafli
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;