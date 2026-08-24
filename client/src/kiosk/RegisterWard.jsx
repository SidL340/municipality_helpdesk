import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Send, CheckCircle2, Shield } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function RegisterWard() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    municipality_name: '',
    ward_number: '',
    applicant_name: '',
    applicant_phone: '',
    applicant_email: '',
    applicant_role: 'वडा सचिव (Ward Secretary)',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/ward-registrations', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003893] via-[#002868] to-[#001433] flex flex-col justify-between text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="touch-btn flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          <ArrowLeft size={16} /> मुख्य पृष्ठ (Back to Kiosk)
        </button>

        <span className="text-xs text-white/70 font-semibold">
          स्थानीय तह डिजिटल सहायता कक्ष
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center max-w-2xl mx-auto w-full my-6">
        <div className="bg-white text-gray-800 rounded-3xl p-8 shadow-2xl border border-white/20 w-full animate-in zoom-in-95 duration-200">
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#003893] flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Building2 size={32} />
                </div>
                <h1 className="text-2xl font-extrabold text-[#003893]">
                  नयाँ वडा कार्यालय दर्ता अनुरोध
                </h1>
                <p className="text-gray-500 text-xs mt-1">
                  Request digital kiosk onboarding for your Municipality Ward Office
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Municipality / Rural Municipality (पालिकाको नाम) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.municipality_name}
                      onChange={(e) => setForm({ ...form, municipality_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                      placeholder="काठमाडौं महानगरपालिका"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Ward Number (वडा नम्बर) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={form.ward_number}
                      onChange={(e) => setForm({ ...form, ward_number: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                      placeholder="32"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Applicant Name (निवेदक/सचिवको नाम) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.applicant_name}
                      onChange={(e) => setForm({ ...form, applicant_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                      placeholder="सीता देवी अधिकारी"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Official Role (पद)
                    </label>
                    <input
                      type="text"
                      value={form.applicant_role}
                      onChange={(e) => setForm({ ...form, applicant_role: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
                      placeholder="वडा सचिव"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Mobile Number (सम्पर्क नम्बर) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.applicant_phone}
                      onChange={(e) => setForm({ ...form, applicant_phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#003893] outline-none"
                      placeholder="9851XXXXXX"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Official Email (ईमेल)
                    </label>
                    <input
                      type="email"
                      value={form.applicant_email}
                      onChange={(e) => setForm({ ...form, applicant_email: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
                      placeholder="ward32@kathmandumetro.gov.np"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Additional Information / Notes (थप विवरण)
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm outline-none"
                    placeholder="कार्यालय ठेगाना वा थप जानकारी..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#003893] hover:bg-[#00225c] disabled:bg-gray-400 text-white font-extrabold rounded-2xl shadow-xl transition text-base flex items-center justify-center gap-2 mt-4"
                >
                  <Send size={18} />
                  {submitting ? 'अनुरोध पेश हुँदैछ...' : 'दर्ता अनुरोध पेश गर्नुहोस् (Submit Request)'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                दर्ता अनुरोध सफलतापूर्वक प्राप्त भयो!
              </h2>
              <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                तपाईंको वडा कार्यालयको विवरण प्राविधिक नियन्त्रण टोलीमा पठाइएको छ। प्रमाणीकरण सम्पन्न भएपछि तपाईंको सम्पर्क नम्बरमा लगइन विवरण उपलब्ध हुनेछ।
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-[#003893] text-white rounded-xl font-bold text-sm shadow"
                >
                  मुख्य पृष्ठमा फर्कनुहोस्
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-white/50">
        डिजिटल स्थानीय तह प्रणाली © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
