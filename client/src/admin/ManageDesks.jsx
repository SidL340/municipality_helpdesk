import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, Monitor } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function ManageDesks() {
  const [desks, setDesks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', name_np: '', name_en: '', location: '', is_active: true });

  useEffect(() => {
    fetchDesks();
  }, []);

  const fetchDesks = async () => {
    try {
      const res = await api.get('/admin/desks');
      setDesks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch desks error:', err);
      setDesks([]);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', name_np: '', name_en: '', location: '', is_active: true });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name || '',
      name_np: d.name_np || '',
      name_en: d.name_en || '',
      location: d.location || '',
      is_active: Boolean(d.is_active),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/desks/${editing.id}`, form);
        toast.success('Counter updated successfully');
      } else {
        await api.post('/admin/desks', form);
        toast.success('Counter created successfully');
      }
      setShowModal(false);
      fetchDesks();
    } catch (err) {
      toast.error('Failed to save counter');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this desk / counter?')) return;
    try {
      await api.delete(`/admin/desks/${id}`);
      toast.success('Counter deleted');
      fetchDesks();
    } catch (err) {
      toast.error('Failed to delete counter');
    }
  };

  const toggleActive = async (d) => {
    try {
      await api.put(`/admin/desks/${d.id}`, { ...d, is_active: !d.is_active });
      fetchDesks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            काउन्टर तथा शाखा व्यवस्थापन (Manage Desks & Counters)
          </h1>
          <p className="text-gray-500 text-xs">Configure physical counters and rooms for queue management</p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-[#003893] hover:bg-[#00225c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
        >
          <Plus size={18} /> Add New Counter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {desks.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center shrink-0">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{d.name}</h3>
                    <p className="text-gray-400 text-xs">{d.location || 'स्थान उल्लेख छैन'}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(d)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {d.is_active ? 'खुला (Active)' : 'बन्द (Inactive)'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
              <button
                onClick={() => openEdit(d)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#003893] text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1"
              >
                <Edit size={13} /> Edit
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">
                {editing ? 'काउन्टर सम्पादन (Edit Counter)' : 'नयाँ काउन्टर थप्नुहोस् (Add Counter)'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Counter Name (काउन्टर नाम) *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                  placeholder="काउन्टर १ - व्यक्तिगत घटना दर्ता"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">स्थान / Room Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                  placeholder="भुईंतला - कोठा १०१"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded text-[#003893]"
                  />
                  खुला छ (Active - Receives Queue Tokens)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl border border-gray-300 text-sm font-bold hover:bg-gray-50"
                >
                  रद्द (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#003893] hover:bg-[#00225c] text-white text-sm font-bold shadow-md"
                >
                  सुरक्षित गर्नुहोस् (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
