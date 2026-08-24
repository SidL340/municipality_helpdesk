import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, Search, Tag, Clock, LayoutGrid, List, Filter } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [desks, setDesks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const [form, setForm] = useState({
    category_id: '',
    name_np: '',
    name_en: '',
    name_mai: '',
    name_bho: '',
    name_new: '',
    description_np: '',
    description_en: '',
    fee_np: '',
    fee_en: '',
    processing_time_np: '',
    processing_time_en: '',
    desk_id: '',
    is_active: true,
    allow_token: true,
    allow_form_print: false,
    sort_order: 0,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, cRes, dRes] = await Promise.all([
        api.get('/admin/services'),
        api.get('/admin/categories'),
        api.get('/admin/desks'),
      ]);
      setServices(sRes.data);
      setCategories(cRes.data);
      setDesks(dRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      category_id: categories[0]?.id || '',
      name_np: '',
      name_en: '',
      name_mai: '',
      name_bho: '',
      name_new: '',
      description_np: '',
      description_en: '',
      fee_np: '',
      fee_en: '',
      processing_time_np: '',
      processing_time_en: '',
      desk_id: '',
      is_active: true,
      allow_token: true,
      allow_form_print: false,
      sort_order: services.length + 1,
    });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      category_id: s.category_id,
      name_np: s.name_np || '',
      name_en: s.name_en || '',
      name_mai: s.name_mai || '',
      name_bho: s.name_bho || '',
      name_new: s.name_new || '',
      description_np: s.description_np || '',
      description_en: s.description_en || '',
      fee_np: s.fee_np || '',
      fee_en: s.fee_en || '',
      processing_time_np: s.processing_time_np || '',
      processing_time_en: s.processing_time_en || '',
      desk_id: s.desk_id || '',
      is_active: Boolean(s.is_active),
      allow_token: Boolean(s.allow_token),
      allow_form_print: Boolean(s.allow_form_print),
      sort_order: s.sort_order || 0,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/services/${editing.id}`, form);
        toast.success('Service updated successfully');
      } else {
        await api.post('/admin/services', form);
        toast.success('Service created successfully');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? Deleting this service will also remove its document requirements.')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success('Service deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const filtered = services.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || String(s.category_id) === String(selectedCategory);
    const matchesSearch =
      s.name_np?.toLowerCase().includes(search.toLowerCase()) ||
      s.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      s.category_name_en?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            सेवा व्यवस्थापन (Manage Ward Services)
          </h1>
          <p className="text-gray-500 text-xs">
            Total {services.length} services configured across {categories.length} categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-200 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid' ? 'bg-white text-[#003893] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-white text-[#003893] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table Spreadsheet View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-[#003893] hover:bg-[#00225c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
          >
            <Plus size={18} /> Add New Service
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === 'ALL'
              ? 'bg-[#003893] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          सबै ({services.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              String(selectedCategory) === String(c.id)
                ? 'bg-[#003893] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {c.name_np} ({c.service_count})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Nepali or English service name..."
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="bg-blue-50 text-[#003893] px-3 py-1 rounded-full font-extrabold text-[11px]">
                    {s.category_name_np || s.category_name_en}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {s.is_active ? 'सक्रिय' : 'अक्षम'}
                  </span>
                </div>

                <h3 className="font-extrabold text-gray-900 text-base leading-snug mt-2">
                  {s.name_np}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">{s.name_en}</p>
                {s.description_np && (
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2">{s.description_np}</p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md text-[11px]">
                    💰 {s.fee_np || 'निःशुल्क'}
                  </span>
                  {s.desk_name && (
                    <span className="text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
                      📍 {s.desk_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => openEdit(s)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#003893] hover:bg-blue-100 transition text-xs font-bold flex items-center gap-1"
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase">
                <tr>
                  <th className="py-3.5 px-4">सेवा नाम (Nepali)</th>
                  <th className="py-3.5 px-4">Service (English)</th>
                  <th className="py-3.5 px-4">श्रेणी (Category)</th>
                  <th className="py-3.5 px-4">काउन्टर (Counter)</th>
                  <th className="py-3.5 px-4">दस्तुर (Fee)</th>
                  <th className="py-3.5 px-4 text-center">टोकन</th>
                  <th className="py-3.5 px-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{s.name_np}</td>
                    <td className="py-3.5 px-4 text-gray-600">{s.name_en}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-50 text-[#003893] px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {s.category_name_en || s.category_name_np}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{s.desk_name || '-'}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">{s.fee_np || 'निःशुल्क'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {s.allow_token ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          सक्रिय
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">अक्षम</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg bg-blue-50 text-[#003893] hover:bg-blue-100 transition"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border border-gray-100">
          कुनै सेवा फेला परेन (No services found)
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">
                {editing ? 'सेवा सम्पादन (Edit Service)' : 'नयाँ सेवा थप्नुहोस् (Add Service)'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Service Name (नेपाली) *</label>
                  <input
                    type="text"
                    required
                    value={form.name_np}
                    onChange={(e) => setForm({ ...form, name_np: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                    placeholder="जन्मदर्ता प्रमाणपत्र"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Service Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                    placeholder="Birth Certificate"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Category (श्रेणी) *</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_np} ({c.name_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Assigned Counter (काउन्टर)</label>
                  <select
                    value={form.desk_id}
                    onChange={(e) => setForm({ ...form, desk_id: e.target.value || null })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                  >
                    <option value="">-- No Counter Assigned --</option>
                    {desks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">सरकारी दस्तुर / Fee (नेपाली)</label>
                  <input
                    type="text"
                    value={form.fee_np}
                    onChange={(e) => setForm({ ...form, fee_np: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="रु. ५० / निःशुल्क"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">लाग्ने समय / Processing Time</label>
                  <input
                    type="text"
                    value={form.processing_time_np}
                    onChange={(e) => setForm({ ...form, processing_time_np: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="सोही दिन / १-३ दिन"
                  />
                </div>

                {/* Multilingual local translations */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Name (मैथिली - Maithili)</label>
                  <input
                    type="text"
                    value={form.name_mai}
                    onChange={(e) => setForm({ ...form, name_mai: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="जन्मदर्ता"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Name (भोजपुरी - Bhojpuri)</label>
                  <input
                    type="text"
                    value={form.name_bho}
                    onChange={(e) => setForm({ ...form, name_bho: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="जनम प्रमाण पत्र"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Name (नेपाल भाषा - Newari)</label>
                  <input
                    type="text"
                    value={form.name_new}
                    onChange={(e) => setForm({ ...form, name_new: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="जन्मदर्ता पौ"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.allow_token}
                      onChange={(e) => setForm({ ...form, allow_token: e.target.checked })}
                      className="rounded text-[#003893]"
                    />
                    Allow Token Generation
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="rounded text-[#003893]"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold hover:bg-gray-50"
                >
                  रद्द (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-[#003893] hover:bg-[#00225c] text-white text-sm font-bold shadow-lg"
                >
                  सुरक्षित गर्नुहोस् (Save Service)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
