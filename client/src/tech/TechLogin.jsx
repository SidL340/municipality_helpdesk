import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Cpu, ArrowLeft, Shield } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function TechLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/admin/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));

      if (res.data.user.role !== 'super_tech') {
        toast.error('यो पोर्टल प्राविधिक प्रमुख (Tech Head) को लागि मात्र हो।');
        return;
      }

      toast.success(`स्वागतम्, ${res.data.user.full_name || 'Tech Head'}`);
      navigate('/tech/requests');
    } catch (err) {
      toast.error(err.response?.data?.error || 'लगइन असफल भयो');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#17143a] to-[#0a081a] flex flex-col justify-between items-center p-4 select-none text-white">
      {/* Top Bar */}
      <div className="w-full max-w-md pt-2 flex items-center justify-between text-white/80 text-xs">
        <Link to="/" className="flex items-center gap-1.5 hover:text-white font-bold transition">
          <ArrowLeft size={16} /> नागरिक सहायता कक्ष (Kiosk)
        </Link>
        <span className="font-bold text-amber-300">Nirmala Tech Innovations</span>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-purple-500/30 animate-in zoom-in-95 duration-200 my-auto text-gray-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Cpu size={34} />
          </div>
          <h1 className="text-2xl font-black text-purple-950">
            प्राविधिक नियन्त्रण लगइन
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Central Tech Head & Engineering Control Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Tech Admin Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-purple-700 outline-none transition"
                placeholder="Tech Admin Username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-purple-700 outline-none transition"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-extrabold rounded-2xl shadow-xl transition-all text-sm mt-2 active:scale-95"
          >
            {loading ? 'प्रमाणीकरण हुँदैछ...' : 'Tech Login (लगइन गर्नुहोस्)'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 font-semibold">
            System Engineering: <strong className="text-purple-900">Nirmala Tech Innovations Pvt. Ltd.</strong>
          </p>
        </div>
      </div>

      <footer className="text-center text-xs text-white/40 pb-2">
        प्राविधिक नियन्त्रण प्रणाली © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
