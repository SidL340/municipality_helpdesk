import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Landmark, ArrowLeft, Send } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function WardLogin() {
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

      if (res.data.user.role === 'super_tech') {
        navigate('/tech/requests');
      } else {
        navigate('/admin/dashboard');
      }
      toast.success(`स्वागतम्, ${res.data.user.full_name || res.data.user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'प्रयोगकर्ता नाम वा पासवर्ड मिलेन');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002b70] via-[#001f52] to-[#001129] flex flex-col justify-between items-center p-4 select-none">
      {/* Top Bar */}
      <div className="w-full max-w-md pt-2 flex items-center justify-between text-white/80 text-xs">
        <Link to="/" className="flex items-center gap-1.5 hover:text-white font-bold transition">
          <ArrowLeft size={16} /> नागरिक सहायता कक्ष (Kiosk)
        </Link>
        <span className="font-semibold">वडा कार्यालय पोर्टल</span>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200 my-auto text-gray-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#002b70] flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Landmark size={34} />
          </div>
          <h1 className="text-2xl font-black text-[#002b70]">
            वडा कार्यालय लगइन
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Ward Administration & Secretary Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              प्रयोगकर्ता नाम (Username)
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-[#002b70] outline-none transition"
                placeholder="Username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              पासवर्ड (Password)
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-[#002b70] outline-none transition"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#002b70] hover:bg-[#00173d] disabled:bg-gray-400 text-white font-extrabold rounded-2xl shadow-xl transition-all text-sm mt-2 active:scale-95"
          >
            {loading ? 'प्रमाणीकरण हुँदैछ...' : 'लगइन गर्नुहोस् (Login)'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
          <Link
            to="/register-ward"
            className="text-xs text-[#002b70] hover:underline font-bold inline-flex items-center gap-1"
          >
            <Send size={13} /> नयाँ वडा दर्ता अनुरोध (Request Ward Onboarding)
          </Link>

          <p className="text-[11px] text-gray-400">
            Developed by: <strong className="text-gray-700">Nirmala Tech Innovations Pvt. Ltd.</strong>
          </p>
        </div>
      </div>

      <footer className="text-center text-xs text-white/40 pb-2">
        डिजिटल स्थानीय तह प्रणाली © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
