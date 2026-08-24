import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Ticket, Printer, Tag, Clock } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext.jsx';
import VoiceButton from '../components/VoiceButton.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function DocumentModal({ serviceId, onClose }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { t, language, getPhrase } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${serviceId}`);
      setService(res.data);
    } catch (err) {
      console.error('Error fetching service:', err);
      toast.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleGetToken = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/tokens', { serviceId, language });
      navigate('/token-success', { state: res.data });
    } catch (err) {
      console.error('Token error:', err);
      toast.error('Failed to generate token');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintForm = async (formId) => {
    try {
      await api.post('/tokens/print-form', { formId });
      toast.success('फारम छापिँदैछ (Printing form...)');
    } catch (err) {
      toast.error('Print failed: ' + (err.response?.data?.error || 'Printer error'));
    }
  };

  const generateVoiceScript = () => {
    if (!service) return '';
    const name = t(service, 'name');
    const docs = service.documents || [];
    const docList = docs.map((d) => t(d, 'name')).join(', ');

    if (language === 'mai') {
      return `${name} के लेल आवश्यक कागजात: ${docList}। कृपया टोकन लऽ कऽ काउन्टर पर जाऊ।`;
    }
    if (language === 'bho') {
      return `${name} खातिर जरूरी कागजात: ${docList}। कृपया टोकन लेके काउन्टर पर जाईं।`;
    }
    if (language === 'new') {
      return `${name} या लागि माःगु भ्वंपिं: ${docList}।`;
    }
    if (language === 'en') {
      return `Documents required for ${name}: ${docList}. Please take a token and visit the assigned counter.`;
    }
    return `${name} को लागि आवश्यक कागजातहरू: ${docList}। कृपया टोकन लिएर सम्बन्धित काउन्टरमा जानुहोस्।`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">लोड हुँदैछ...</div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Banner */}
        <div className="bg-[#003893] text-white p-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-xl md:text-2xl font-extrabold leading-snug">
              {t(service, 'name')}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/90">
              {service.fee_np && (
                <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full font-bold">
                  <Tag size={12} /> {t(service, 'fee')}
                </span>
              )}
              {service.processing_time_np && (
                <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full font-bold">
                  <Clock size={12} /> {t(service, 'processing_time')}
                </span>
              )}
              {service.desk_name && (
                <span className="bg-amber-400 text-gray-900 px-3 py-1 rounded-full font-bold">
                  📍 {service.desk_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VoiceButton text={generateVoiceScript()} audioUrl={service.custom_audio_url} />
            <button
              onClick={onClose}
              className="touch-btn w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition shadow"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Body: Document Requirements in 2-Column Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#003893] text-base md:text-lg flex items-center gap-2">
              📋 {getPhrase('reqDocs')}
            </h3>
            <span className="text-xs text-gray-400 font-semibold">
              {service.documents?.length || 0} कागजातहरू
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {service.documents?.map((doc, idx) => (
              <div
                key={doc.id}
                className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex items-start gap-3 hover:bg-blue-50/50 transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#003893] text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm leading-snug">
                    {t(doc, 'name')}
                  </p>
                  {doc.note_np && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 rounded-md px-2 py-0.5 mt-1.5 inline-block font-semibold">
                      💡 {t(doc, 'note')}
                    </p>
                  )}
                </div>
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-1" />
              </div>
            ))}

            {(!service.documents || service.documents.length === 0) && (
              <div className="col-span-2 text-center py-10 text-gray-400">
                यस सेवाको लागि कागजात सूची छैन। कृपया सिधै टोकन लिनुहोस्।
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex flex-col sm:flex-row items-center gap-3">
          {service.allow_token && (
            <button
              onClick={handleGetToken}
              disabled={generating}
              className="touch-btn w-full flex-1 bg-green-600 hover:bg-green-700 active:scale-95 disabled:bg-green-300 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg md:text-xl transition"
            >
              <Ticket size={24} />
              {generating ? getPhrase('generating') : getPhrase('getToken')}
            </button>
          )}

          {service.forms?.length > 0 && (
            <button
              onClick={() => handlePrintForm(service.forms[0].id)}
              className="touch-btn w-full sm:w-auto bg-[#003893] hover:bg-[#00225c] active:scale-95 text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base transition"
            >
              <Printer size={20} />
              फारम छाप्नुहोस्
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
