import React, { useState } from 'react';

interface LoginProps {
  onSwitch: () => void;
  onLoginSuccess: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1614] text-[#dcd7d4]">
      <form onSubmit={handleLogin} className="bg-[#14110f] p-8 rounded-4xl border border-[#8b5a2b]/20 w-96 shadow-2xl">
        <h2 className="text-3xl font-black mb-6 text-[#8b5a2b] tracking-tighter">LOGIN</h2>
        {error && <p className="text-red-500 text-xs mb-4 font-bold uppercase">{error}</p>}
        
        <input type="text" placeholder="Nama" className="w-full p-3 mb-4 bg-[#1a1614] border border-[#8b5a2b]/20 rounded-xl focus:outline-none" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        
        <input type="password" placeholder="Password" className="w-full p-3 mb-6 bg-[#1a1614] border border-[#8b5a2b]/20 rounded-xl focus:outline-none" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        
        <button type="submit" className="w-full bg-[#8b5a2b] p-3 rounded-xl font-bold hover:scale-[0.98] transition-all">MASUK</button>
        <p className="mt-4 text-xs text-center">Belum punya akun? <span onClick={onSwitch} className="text-[#8b5a2b] cursor-pointer font-bold">Sign Up</span></p>
      </form>
    </div>
  );
};

export default Login;