import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Search, X, Landmark, Cpu } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function ManageAdmins() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'ward_admin',
    municipality_name: '',
    ward_number: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setUsers([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      toast.success('Ward Admin account provisioned successfully!');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    try {
      await api.post(`/admin/users/${selectedUser.id}/reset-password`, { new_password: newPassword });
      toast.success(`Password for ${selectedUser.username} updated!`);
      setShowResetModal(false);
      setNewPassword('');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete admin account "${user.username}"?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.municipality_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            वडा कार्यालय लगइनहरू (Active Ward Accounts)
          </h1>
          <p className="text-gray-500 text-xs">
            Manage approved Ward Secretary logins, view credentials, and reset passwords
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              username: '',
              password: '',
              full_name: '',
              role: 'ward_admin',
              municipality_name: 'काठमाडौं महानगरपालिका',
              ward_number: '',
              email: '',
              phone: '',
            });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#002b70] hover:bg-[#001f52] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
        >
          <Plus size={18} /> Provision New Ward Login
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username, secretary name, or municipality..."
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`px-3 py-0.5 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 ${
                  u.role === 'super_tech'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {u.role === 'super_tech' ? <Cpu size={12} /> : <Landmark size={12} />}
                  {u.role === 'super_tech' ? 'Tech Head' : `Ward ${u.ward_number || ''}`}
                </span>

                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Active
                </span>
              </div>

              <h3 className="font-extrabold text-gray-900 text-base mt-2">{u.full_name || u.username}</h3>
              <p className="text-gray-500 text-xs font-semibold">@{u.username}</p>

              <div className="mt-3 bg-gray-50 rounded-xl p-2.5 text-xs text-gray-600 space-y-1">
                {u.municipality_name && (
                  <p>🏛️ <strong>पालिका:</strong> {u.municipality_name}</p>
                )}
                {u.ward_number && (
                  <p>📍 <strong>वडा नं:</strong> {u.ward_number}</p>
                )}
                {u.phone && (
                  <p>📞 <strong>सम्पर्क:</strong> {u.phone}</p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setShowResetModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-xs font-bold flex items-center gap-1"
              >
                <Key size={13} /> Reset Pass
              </button>

              {u.role !== 'super_tech' && (
                <button
                  onClick={() => handleDelete(u)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">
                नयाँ वडा लगइन खाता (Create Ward Login)
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Username (प्रयोगकर्ता नाम) *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#002b70] outline-none"
                  placeholder="ward32_admin"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Password (प्रारम्भिक पासवर्ड) *</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#002b70] outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Name (सचिव वा कर्मचारीको नाम)</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="सीता देवी अधिकारी"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Municipality (पालिका)</label>
                  <input
                    type="text"
                    value={form.municipality_name}
                    onChange={(e) => setForm({ ...form, municipality_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="काठमाडौं महानगरपालिका"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ward Number (वडा नं.)</label>
                  <input
                    type="number"
                    value={form.ward_number}
                    onChange={(e) => setForm({ ...form, ward_number: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="32"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Phone (सम्पर्क)</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="9851XXXXXX"
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#002b70] hover:bg-[#001f52] text-white text-sm font-bold shadow-md"
                >
                  Create Ward Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-gray-900 text-base mb-2">
              Reset Password for @{selectedUser.username}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#002b70] outline-none"
                  placeholder="New password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#002b70] text-white text-xs font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
