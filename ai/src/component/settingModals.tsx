import React, { useState } from 'react';
import { 
  X, Settings, Sun, Moon, Lock, HelpCircle, 
  Shield, Send, Database, Check, Trash2, AlertTriangle, Loader
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  chatHistory: any[];
  // ── TAMBAHAN: prop baru untuk hapus semua history ──────────────────
  onClearAllHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, theme, setTheme, chatHistory, onClearAllHistory
}) => {
  const [activeTab, setActiveTab] = useState('umum');
  const [helpMessage, setHelpMessage] = useState('');
  const [selectedChatBlockchain, setSelectedChatBlockchain] = useState<number | null>(null);

  // ── State tambahan ─────────────────────────────────────────────────
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [blockchainLink, setBlockchainLink] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // ──────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════════════
  // FITUR 3 — EmailJS
  // Ganti 3 nilai di bawah ini dengan nilai dari akun EmailJS Anda
  // Panduan: https://www.emailjs.com → Account → General → Public Key
  // ══════════════════════════════════════════════════════════════════
  const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleSendHelp = async () => {
    if (!helpMessage.trim()) return;
    setEmailStatus('loading');
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id:  EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id:     EMAILJS_PUBLIC_KEY,
          template_params: { message: helpMessage }
        })
      });
      if (res.ok) {
        setEmailStatus('success');
        setHelpMessage('');
        setTimeout(() => setEmailStatus('idle'), 3000);
      } else {
        setEmailStatus('error');
        setTimeout(() => setEmailStatus('idle'), 3000);
      }
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };
  // ══════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════
  // FITUR 2 — Web3.Storage (IPFS / Blockchain gratis)
  // Daftar di https://web3.storage → Create API Token → tempel di bawah
  // ══════════════════════════════════════════════════════════════════
 const PINATA_API_KEY      = import.meta.env.VITE_PINATA_API_KEY;
 const PINATA_API_SECRET   = import.meta.env.VITE_PINATA_API_SECRET;
 
const handleBlockchainSync = async () => {
  const chatToSync = chatHistory.find(c => c.id === selectedChatBlockchain);
  if (!chatToSync) return;

  setBlockchainStatus('loading');
  setBlockchainLink('');

  try {
    const chatData = {
      title:    chatToSync.title,
      messages: chatToSync.messages,
      savedAt:  new Date().toISOString(),
      platform: 'Paint AI R&D'
    };

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    formData.append('file', blob, `paint-ai-${chatToSync.id}.json`);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key':    PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET
      },
      body: formData
    });

    const data = await res.json();

    if (data.IpfsHash) {
      setBlockchainStatus('success');
      setBlockchainLink(`https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
    } else {
      throw new Error('Gagal mendapat hash');
    }
  } catch {
    setBlockchainStatus('error');
  }
};
  // ══════════════════════════════════════════════════════════════════

  const tabs = [
    { id: 'umum',    label: 'Umum',         icon: Settings   },
    { id: 'data',    label: 'Privasi & Data', icon: Lock      },
    { id: 'bantuan', label: 'Bantuan',       icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-sm">
      <div className={`border border-[#8b5a2b]/30 rounded-4xl w-full max-w-4xl h-150 flex overflow-hidden shadow-2xl transition-all duration-500 ${
        theme === 'dark' ? 'bg-[#1e1a17] text-[#dcd7d4]' : 'bg-[#fdfcfb] text-[#4a3a2e]'
      }`}>
        
        {/* ── Sidebar Modal (tidak diubah) ── */}
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
                  activeTab === tab.id
                    ? 'bg-[#8b5a2b] text-white shadow-lg'
                    : 'text-gray-500 hover:bg-[#8b5a2b]/10'
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Konten Modal ── */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#8b5a2b]/10 rounded-full text-gray-400 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">

            {/* ══ TAB UMUM ══════════════════════════════════════════════════ */}
            {activeTab === 'umum' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold mb-6">Pengaturan Umum</h3>
                <div className="space-y-6">

                  {/* Tema Visual (tidak diubah) */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-[#8b5a2b]/10">
                    <div>
                      <p className="font-bold">Tema Visual</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih tampilan gelap atau terang untuk seluruh platform
                      </p>
                    </div>
                    <div className="flex gap-2 p-1 bg-black/10 rounded-xl border border-[#8b5a2b]/20 transition-all">
                      <button 
                        onClick={() => setTheme('dark')} 
                        className={`p-2 rounded-lg transition-all ${
                          theme === 'dark'
                            ? 'bg-[#8b5a2b] text-white shadow-md'
                            : 'text-gray-400 hover:text-[#8b5a2b]'
                        }`}
                        title="Mode Gelap"
                      >
                        <Moon size={22} />
                      </button>
                      <button 
                        onClick={() => setTheme('light')} 
                        className={`p-2 rounded-lg transition-all ${
                          theme === 'light'
                            ? 'bg-[#8b5a2b] text-white shadow-md'
                            : 'text-gray-400 hover:text-[#8b5a2b]'
                        }`}
                        title="Mode Terang"
                      >
                        <Sun size={22} />
                      </button>
                    </div>
                  </div>

                  {/* ── FITUR 1: Hapus Semua History Log ───────────────────── */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                    <div>
                      <p className="font-bold text-red-500">Hapus Semua History Log</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Seluruh riwayat percakapan dihapus permanen dari UI dan database
                      </p>
                    </div>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      disabled={chatHistory.length === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shrink-0 ml-4"
                    >
                      <Trash2 size={14} /> Hapus Semua
                    </button>
                  </div>
                  {/* ──────────────────────────────────────────────────────── */}

                </div>
              </div>
            )}

            {/* ══ TAB PRIVASI & DATA ════════════════════════════════════════ */}
            {activeTab === 'data' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold mb-6">Privasi & Data</h3>
                <div className="space-y-6">

                  <div className={`p-4 rounded-xl border flex gap-4 ${
                    theme === 'dark'
                      ? 'bg-[#8b5a2b]/10 border-[#8b5a2b]/20'
                      : 'bg-[#8b5a2b]/5 border-[#8b5a2b]/10'
                  }`}>
                    <Shield className="text-[#8b5a2b] shrink-0" size={24} />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Pilih riwayat percakapan untuk diabadikan ke <b>IPFS</b> — jaringan
                      penyimpanan terdesentralisasi gratis. Data tersimpan permanen dengan
                      link unik sebagai bukti kepemilikan. Tidak perlu wallet atau crypto.
                    </p>
                  </div>

                  {/* Daftar history log untuk dipilih */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {chatHistory.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-6">
                        Belum ada riwayat percakapan
                      </p>
                    )}
                    {chatHistory.map((chat) => (
                      <div 
                        key={chat.id} 
                        onClick={() => {
                          setSelectedChatBlockchain(chat.id);
                          setBlockchainStatus('idle');
                          setBlockchainLink('');
                        }}
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

                  {/* ── FITUR 2: Tombol simpan ke IPFS/Blockchain ─────────── */}
                  <button 
                    onClick={handleBlockchainSync}
                    disabled={!selectedChatBlockchain || blockchainStatus === 'loading'}
                    className="w-full py-4 rounded-2xl bg-[#8b5a2b] text-white font-bold flex justify-center items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {blockchainStatus === 'loading' ? (
                      <><Loader size={18} className="animate-spin" /> Menyimpan ke IPFS...</>
                    ) : blockchainStatus === 'success' ? (
                      <><Check size={18} /> Berhasil Disimpan!</>
                    ) : (
                      <><Database size={18} /> Simpan ke Blockchain (IPFS)</>
                    )}
                  </button>

                  {/* Tampilkan link IPFS setelah berhasil */}
                  {blockchainStatus === 'success' && blockchainLink && (
                    <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                      <p className="text-xs font-bold text-green-500 mb-1">
                        ✓ Data tersimpan permanen di IPFS!
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Simpan link ini sebagai bukti penyimpanan:
                      </p>
                      <a
                        href={blockchainLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#8b5a2b] underline break-all hover:opacity-70 transition-all"
                      >
                        {blockchainLink}
                      </a>
                    </div>
                  )}

                  {blockchainStatus === 'error' && (
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                      <p className="text-xs text-red-500">
                        ⚠️ Gagal menyimpan. Pastikan token Web3.Storage sudah diisi dengan benar di kode.
                      </p>
                    </div>
                  )}
                  {/* ──────────────────────────────────────────────────────── */}

                </div>
              </div>
            )}
            
            {/* ══ TAB BANTUAN ═══════════════════════════════════════════════ */}
            {activeTab === 'bantuan' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold mb-6">Hubungi Developer</h3>
                <div className="space-y-4">

                  <textarea 
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Tuliskan kendala atau pertanyaan Anda tentang platform ini..."
                    className={`w-full h-32 p-4 rounded-2xl border border-[#8b5a2b]/20 focus:border-[#8b5a2b] outline-none transition-all resize-none ${
                      theme === 'dark' ? 'bg-[#14110f]' : 'bg-white'
                    }`}
                  />

                  {/* ── FITUR 3: Kirim via EmailJS ─────────────────────────── */}
                  <button 
                    onClick={handleSendHelp}
                    disabled={!helpMessage.trim() || emailStatus === 'loading'}
                    className="w-full py-4 rounded-2xl bg-[#8b5a2b] text-white font-bold flex justify-center items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {emailStatus === 'loading' ? (
                      <><Loader size={18} className="animate-spin" /> Mengirim...</>
                    ) : emailStatus === 'success' ? (
                      <><Check size={18} /> Pesan Terkirim!</>
                    ) : emailStatus === 'error' ? (
                      <><AlertTriangle size={18} /> Gagal, Coba Lagi</>
                    ) : (
                      <><Send size={18} /> Kirim ke Rafli</>
                    )}
                  </button>

                  {emailStatus === 'success' && (
                    <p className="text-xs text-green-500 text-center font-bold">
                      ✓ Pesan berhasil dikirim ke email Rafli!
                    </p>
                  )}
                  {emailStatus === 'error' && (
                    <p className="text-xs text-red-500 text-center">
                      Gagal kirim. Pastikan EmailJS sudah dikonfigurasi di kode.
                    </p>
                  )}
                  {/* ──────────────────────────────────────────────────────── */}

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ══ Modal Konfirmasi Hapus Semua History ═════════════════════════════ */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-200lex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`p-8 rounded-4xl max-w-sm w-full shadow-2xl text-center border animate-in zoom-in duration-200 ${
            theme === 'dark'
              ? 'bg-[#1e1a17] border-[#8b5a2b]/30 text-[#dcd7d4]'
              : 'bg-white border-gray-200 text-[#4a3a2e]'
          }`}>
            <div className="bg-red-500/10 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black mb-3 uppercase tracking-tighter">
              Hapus Semua History?
            </h3>
            <p className="text-xs text-gray-500 mb-8 leading-relaxed font-bold uppercase tracking-widest px-2">
              Seluruh {chatHistory.length} percakapan akan dihapus permanen dari UI dan database.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  theme === 'dark'
                    ? 'bg-[#2b2522] text-[#dcd7d4] border border-[#8b5a2b]/10'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onClearAllHistory();
                  setShowClearConfirm(false);
                  setSelectedChatBlockchain(null);
                  setBlockchainStatus('idle');
                  setBlockchainLink('');
                }}
                className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════════════════════════════ */}

    </div>
  );
};

export default SettingsModal;