import React, { useState } from 'react';

interface SignUpProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitch, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Password tidak cocok!');
    }

    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      alert('Registrasi Berhasil! Silahkan Login.');
      onSwitch(); // Pindah ke halaman login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1614] text-[#dcd7d4]">
      <form onSubmit={handleSubmit} className="bg-[#14110f] p-8 rounded-[32px] border border-[#8b5a2b]/20 w-96 shadow-2xl">
        <h2 className="text-3xl font-black mb-6 text-[#8b5a2b] tracking-tighter">SIGN UP</h2>
        {error && <p className="text-red-500 text-xs mb-4 font-bold uppercase">{error}</p>}
        
        <input type="text" placeholder="Nama" className="w-full p-3 mb-4 bg-[#1a1614] border border-[#8b5a2b]/20 rounded-xl focus:outline-none focus:border-[#8b5a2b]" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        
        <input type="email" placeholder="Email" className="w-full p-3 mb-4 bg-[#1a1614] border border-[#8b5a2b]/20 rounded-xl focus:outline-none focus:border-[#8b5a2b]" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        
        <input type="password" placeholder="Password" className="w-full p-3 mb-4 bg-[#1a1614] border border-[#8b5a2b]/20 rounded-xl focus:outline-none focus:border-[#8b5a2b]" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        
        <input type="password" placeholder="Ulangi Password" className="w-full p-3 mb-6 bg-[#1a1614] border border-[#8b5a2b]/20 rounded-xl focus:outline-none focus:border-[#8b5a2b]" 
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
        
        <button type="submit" className="w-full bg-[#8b5a2b] p-3 rounded-xl font-bold hover:scale-[0.98] transition-all">DAFTAR</button>
        <p className="mt-4 text-xs text-center">Sudah punya akun? <span onClick={onSwitch} className="text-[#8b5a2b] cursor-pointer font-bold">Login</span></p>
      </form>
    </div>
  );
};

export default SignUp;