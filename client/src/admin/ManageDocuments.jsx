import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, FileText } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function ManageDocuments() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name_np: '',
    name_en: '',
    name_mai: '',
    name_bho: '',
    name_new: '',
    note_np: '',
    note_en: '',
    sort_order: 0,
    is_required: true,
  });

  useEffect(() => {
    api.get('/admin/services').then((res) => {
      setServices(res.data);
      if (res.data.length > 0) {
        setSelectedService(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedService) fetchDocuments();
  }, [selectedService]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/admin/services/${selectedService}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Fetch docs error:', err);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name_np: '',
      name_en: '',
      name_mai: '',
      name_bho: '',
      name_new: '',
      note_np: '',
      note_en: '',
      sort_order: documents.length + 1,
      is_required: true,
    });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name_np: d.name_np || '',
      name_en: d.name_en || '',
      name_mai: d.name_mai || '',
      name_bho: d.name_bho || '',
      name_new: d.name_new || '',
      note_np: d.note_np || '',
      note_en: d.note_en || '',
      sort_order: d.sort_order || 0,
      is_required: Boolean(d.is_required),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/documents/${editing.id}`, form);
        toast.success('Document requirement updated');
      } else {
        await api.post(`/admin/services/${selectedService}/documents`, form);
        toast.success('Document requirement added');
      }
      setShowModal(false);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to save document');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this document requirement?')) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            आवश्यक कागजात व्यवस्थापन (Document Requirements)
          </h1>
          <p className="text-gray-500 text-xs">Configure exact document checklists per service shown to citizens</p>
        </div>
      </div>

      {/* Service Selector Filter */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-2/3">
          <label className="text-xs font-bold text-gray-700 block mb-1.5">
            सेवा छान्नुहोस् (Select Service to Manage Documents):
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#003893] outline-none"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_np} — ({s.name_en}) [{s.category_name_en}]
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <button
            onClick={openAdd}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#003893] hover:bg-[#00225c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
          >
            <Plus size={18} /> Add Document Requirement
          </button>
        )}
      </div>

      {/* Document Items List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {documents.map((d, index) => (
          <div key={d.id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#003893] font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">{d.name_np}</h4>
                <p className="text-gray-500 text-xs mt-0.5">{d.name_en}</p>
                {d.note_np && (
                  <p className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1.5 font-semibold">
                    💡 {d.note_np}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.is_required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {d.is_required ? 'अनिवार्य (Mandatory)' : 'ऐच्छिक (Optional)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(d)}
                className="p-2 rounded-xl bg-blue-50 text-[#003893] hover:bg-blue-100 transition"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            यस सेवाको लागि हालसम्म कुनै कागजात थपिएको छैन।
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h2 className="text-lg font-extrabold text-gray-900">
                {editing ? 'कागजात सम्पादन (Edit Document)' : 'कागजात थप्नुहोस् (Add Document)'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Document Name (नेपाली) *</label>
                <input
                  type="text"
                  required
                  value={form.name_np}
                  onChange={(e) => setForm({ ...form, name_np: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                  placeholder="नागरिकता प्रमाणपत्र (सक्कल + प्रतिलिपि)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Document Name (English) *</label>
                <input
                  type="text"
                  required
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                  placeholder="Citizenship Certificate (Original + Copy)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">थप निर्देशन / Note (नेपाली)</label>
                <input
                  type="text"
                  value={form.note_np}
                  onChange={(e) => setForm({ ...form, note_np: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="सक्कल अनिवार्य, २ प्रति पासपोर्ट फोटो सहित"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">क्रम (Sort Order)</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={form.is_required}
                      onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                      className="rounded text-[#003893]"
                    />
                    अनिवार्य (Mandatory)
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
