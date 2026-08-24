import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, Cpu, Landmark, ArrowLeft, Send } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('tech_admin');
  const [password, setPassword] = useState('tech123');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/admin/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      toast.success(`स्वागतम्, ${res.data.user.full_name || res.data.user.username}`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'लगइन असफल भयो');
    } finally {
      setLoading(false);
    }
  };

  const setRolePreset = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002b70] via-[#001f52] to-[#001129] flex flex-col justify-between items-center p-4">
      {/* Top Bar */}
      <div className="w-full max-w-md pt-2 flex items-center justify-between text-white/80 text-xs">
        <Link to="/" className="flex items-center gap-1.5 hover:text-white font-bold transition">
          <ArrowLeft size={16} /> नागरिक सहायता कक्ष (Kiosk)
        </Link>
        <span className="font-semibold">वडा तथा प्राविधिक लगइन</span>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-7 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200 my-auto">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#003893] flex items-center justify-center mx-auto mb-2 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#003893]">
            प्रशासक तथा प्राविधिक लगइन
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Ward Administration & Tech Control Portal
          </p>
        </div>

        {/* 2 Simple Role Tabs */}
        <div className="mb-5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setRolePreset('ward32_admin', 'ward123')}
              className={`p-2.5 rounded-xl text-left text-xs font-bold transition border ${
                username === 'ward32_admin'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Landmark size={15} />
                <span>Ward Admin</span>
              </div>
              <span className="text-[10px] block opacity-90 mt-0.5">वडा कार्यालय / सचिव</span>
            </button>

            <button
              type="button"
              onClick={() => setRolePreset('tech_admin', 'tech123')}
              className={`p-2.5 rounded-xl text-left text-xs font-bold transition border ${
                username === 'tech_admin'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Cpu size={15} />
                <span>Tech Head</span>
              </div>
              <span className="text-[10px] block opacity-90 mt-0.5">प्राविधिक प्रमुख</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Username (प्रयोगकर्ता नाम)
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#003893] outline-none transition"
                placeholder="ward32_admin / tech_admin"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Password (पासवर्ड)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#003893] outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#003893] hover:bg-[#00225c] disabled:bg-gray-400 text-white font-extrabold rounded-xl shadow-lg transition-all text-sm mt-1"
          >
            {loading ? 'प्रमाणीकरण हुँदैछ...' : 'लगइन गर्नुहोस् (Login)'}
          </button>
        </form>

        {/* New Ward Onboarding Request Link */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <Link
            to="/register-ward"
            className="text-xs text-[#003893] hover:underline font-bold inline-flex items-center gap-1"
          >
            <Send size={13} /> नयाँ वडा दर्ता अनुरोध पेश गर्नुहोस् (Request Ward Access)
          </Link>
        </div>

        <div className="mt-3 text-center">
          <p className="text-[11px] text-gray-500 font-semibold">
            Developed by: <strong className="text-[#003893]">Nirmala Tech Innovations Pvt. Ltd.</strong>
          </p>
        </div>
      </div>

      <footer className="text-center text-xs text-white/40 pb-2">
        डिजिटल स्थानीय तह प्रणाली © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
