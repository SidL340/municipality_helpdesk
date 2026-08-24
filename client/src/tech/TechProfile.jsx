import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, ShieldCheck, Cpu, KeyRound } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function TechProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/admin/profile');
      setForm((prev) => ({
        ...prev,
        username: res.data.username || '',
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
      }));
    } catch (err) {
      toast.error('प्रोफाइल लोड गर्न सकिएन');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (form.new_password) {
      if (form.new_password !== form.confirm_password) {
        toast.error('नयाँ पासवर्ड र कन्फर्म पासवर्ड मिलेन');
        return;
      }
      if (!form.current_password) {
        toast.error('पासवर्ड परिवर्तन गर्न हालको पासवर्ड अनिवार्य छ');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.post('/admin/profile', {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        current_password: form.current_password || undefined,
        new_password: form.new_password || undefined,
      });

      // Update local storage
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      toast.success(res.data.message || 'प्रोफाइल अद्यावधिक भयो');

      setForm((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'अद्यावधिक असफल भयो');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-bold animate-pulse">प्रोफाइल लोड हुँदैछ...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Cpu className="text-purple-700" size={26} /> प्राविधिक प्रोफाइल तथा सुरक्षा (Tech Head Profile)
        </h1>
        <p className="text-gray-500 text-xs">
          Manage your technical lead profile, contact details, and account credentials
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xl shadow-inner">
              👨‍💻
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">{form.full_name || 'Tech Lead'}</h3>
              <p className="text-purple-700 font-bold text-xs">Nirmala Tech Innovations Pvt. Ltd.</p>
              <p className="text-gray-400 text-xs mt-0.5">Username: <strong>@{form.username}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Full Name (इन्जिनियर / प्राविधिक प्रमुखको नाम)
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-700 outline-none"
                  placeholder="ई. सन्तोष शर्मा"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Phone Number (सम्पर्क नम्बर)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-700 outline-none"
                  placeholder="9851XXXXXX"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Email Address (इमेल ठेगाना)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-700 outline-none"
                  placeholder="tech@nirmalatech.com.np"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <KeyRound size={20} className="text-purple-700" />
            <h3 className="font-extrabold text-gray-900 text-base">
              सुरक्षा तथा पासवर्ड परिवर्तन (Change Password)
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Leave blank if you do not want to change your password
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Current Password (हालको पासवर्ड)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-700 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                New Password (नयाँ पासवर्ड)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-700 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-700 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg transition active:scale-95 text-sm"
          >
            <Save size={18} />
            <span>{saving ? 'सुरक्षित गर्दै...' : 'विवरण सुरक्षित गर्नुहोस् (Save Profile)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
