import React, { useState, useEffect } from 'react';
import { Building2, Save, Phone, Mail, User, Clock, MapPin, Globe } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function ManageWardInfo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ward_name_np: '',
    ward_name_en: '',
    ward_name_mai: '',
    ward_name_new: '',
    municipality_np: '',
    municipality_en: '',
    municipality_mai: '',
    municipality_new: '',
    district_np: '',
    district_en: '',
    province_np: '',
    province_en: '',
    address_np: '',
    address_en: '',
    phone: '',
    phone2: '',
    email: '',
    website: '',
    chairperson_name_np: '',
    chairperson_name_en: '',
    chairperson_phone: '',
    secretary_name_np: '',
    secretary_name_en: '',
    secretary_phone: '',
    office_hours_np: '',
    office_hours_en: '',
  });

  useEffect(() => {
    fetchWardInfo();
  }, []);

  const fetchWardInfo = async () => {
    try {
      const res = await api.get('/admin/ward-info');
      if (res.data && Object.keys(res.data).length > 0) {
        setForm(res.data);
      }
    } catch (err) {
      console.error('Error fetching ward info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/ward-info', form);
      toast.success('वडा विवरण सुरक्षित भयो (Ward details saved successfully)');
    } catch (err) {
      toast.error('Failed to save ward details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading ward details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          वडा विवरण तथा पदाधिकारी प्रोफाइल (Ward Office Profile)
        </h1>
        <p className="text-gray-500 text-xs mt-1">
          Configure ward names in local languages, officials' contact numbers, and office hours
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Ward Basic Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-extrabold text-[#003893] flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building2 size={18} /> वडा तथा पालिका परिचय (Ward Identification)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Ward Name (नेपाली) *</label>
              <input
                type="text"
                name="ward_name_np"
                required
                value={form.ward_name_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                placeholder="वडा नं. ३२"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Ward Name (English) *</label>
              <input
                type="text"
                name="ward_name_en"
                required
                value={form.ward_name_en || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                placeholder="Ward No. 32"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Municipality (नेपाली)</label>
              <input
                type="text"
                name="municipality_np"
                value={form.municipality_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="काठमाडौं महानगरपालिका"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Municipality (English)</label>
              <input
                type="text"
                name="municipality_en"
                value={form.municipality_en || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="Kathmandu Metropolitan City"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">जिल्ला (District)</label>
              <input
                type="text"
                name="district_np"
                value={form.district_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="काठमाडौं"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ठेगाना (Address)</label>
              <input
                type="text"
                name="address_np"
                value={form.address_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="बागबजार, काठमाडौं"
              />
            </div>
          </div>
        </div>

        {/* Officials Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-extrabold text-[#003893] flex items-center gap-2 border-b border-gray-100 pb-3">
            <User size={18} /> वडा पदाधिकारीहरू (Ward Officials)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">अध्यक्षको नाम (नेपाली)</label>
              <input
                type="text"
                name="chairperson_name_np"
                value={form.chairperson_name_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="राम बहादुर श्रेष्ठ"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Chairperson Name (English)</label>
              <input
                type="text"
                name="chairperson_name_en"
                value={form.chairperson_name_en || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="Ram Bahadur Shrestha"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">अध्यक्ष सम्पर्क नम्बर (Phone)</label>
              <input
                type="text"
                name="chairperson_phone"
                value={form.chairperson_phone || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="9841XXXXXX"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">सचिवको नाम (नेपाली)</label>
              <input
                type="text"
                name="secretary_name_np"
                value={form.secretary_name_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="सीता देवी अधिकारी"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Secretary Name (English)</label>
              <input
                type="text"
                name="secretary_name_en"
                value={form.secretary_name_en || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="Sita Devi Adhikari"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">सचिव सम्पर्क नम्बर (Phone)</label>
              <input
                type="text"
                name="secretary_phone"
                value={form.secretary_phone || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="9851XXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Contact & Timings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-extrabold text-[#003893] flex items-center gap-2 border-b border-gray-100 pb-3">
            <Phone size={18} /> सम्पर्क तथा कार्यालय समय (Contact & Timings)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">कार्यालय फोन (Office Phone)</label>
              <input
                type="text"
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="01-4234567"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">कार्यालय ईमेल (Official Email)</label>
              <input
                type="email"
                name="email"
                value={form.email || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="ward32@kathmandumetro.gov.np"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">कार्यालय समय (नेपाली)</label>
              <input
                type="text"
                name="office_hours_np"
                value={form.office_hours_np || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="आइतबार - शुक्रबार: बिहान १०:०० - सन्ध्या ५:००"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">वेबसाइट (Website URL)</label>
              <input
                type="text"
                name="website"
                value={form.website || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                placeholder="https://kathmandumetro.gov.np"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-[#003893] hover:bg-[#00225c] text-white rounded-2xl font-extrabold shadow-lg transition"
          >
            <Save size={18} />
            {saving ? 'सुरक्षित गर्दैछ...' : 'विवरण सुरक्षित गर्नुहोस् (Save Ward Profile)'}
          </button>
        </div>
      </form>
    </div>
  );
}
