import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, ChevronRight, Clock, Tag, Home, Search, Bot } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext.jsx';
import DocumentModal from './DocumentModal.jsx';
import AiAssistantModal from '../components/AiAssistantModal.jsx';
import api from '../utils/api.js';

export default function ServiceList() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t, getPhrase } = useLanguage();

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [categoryId]);

  const fetchServices = async () => {
    try {
      const res = await api.get(`/services/categories/${categoryId}`);
      setCategory(res.data.category);
      setServices(res.data.services);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name_np?.toLowerCase().includes(q) ||
      s.name_en?.toLowerCase().includes(q) ||
      s.name_mai?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002b70] via-[#001f52] to-[#001129] flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">सेवाहरू लोड हुँदैछ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002b70] via-[#001f52] to-[#001129] flex flex-col justify-between text-white select-none relative">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/15 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back and Forward Navigation */}
            <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-2xl border border-white/15">
              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95"
                title="पछाडि (Back)"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => window.history.forward()}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95"
                title="अगाडि (Forward)"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-white drop-shadow">
                {t(category, 'name')}
              </h1>
              <p className="text-amber-300 text-xs font-bold mt-0.5">
                {services.length} वटा सेवाहरू उपलब्ध छन् (Available Services)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiModal(true)}
              className="touch-btn bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-gray-950 font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg border border-amber-300 active:scale-95 transition text-xs"
            >
              <Bot size={16} />
              <span className="hidden sm:inline">एआई सहायक (Ask AI)</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="touch-btn bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 shadow transition active:scale-95"
            >
              <Home size={18} />
              <span>{getPhrase('backHome')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full overflow-y-auto space-y-5">
        {/* Quick Search inside Category */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 px-4 flex items-center gap-3 border border-white/20 shadow-inner max-w-xl mx-auto">
          <Search size={18} className="text-white/70 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="सेवाको नाम खोज्नुहोस् (Search services in this category)..."
            className="bg-transparent text-white placeholder-white/60 text-sm outline-none w-full font-medium"
          />
        </div>

        {/* Services Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedService(s)}
              className="touch-btn bg-white hover:bg-gray-50 active:scale-95 rounded-3xl p-6 flex flex-col justify-between text-left shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 border border-white/40 group min-h-[190px] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-[#003893] group-hover:bg-amber-500 transition-colors"></div>

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003893] group-hover:bg-[#003893] group-hover:text-white flex items-center justify-center transition-colors shadow-sm shrink-0">
                    <FileText size={24} />
                  </div>
                  {s.desk_name && (
                    <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-black px-3 py-1 rounded-full truncate shadow-xs">
                      📍 {s.desk_name}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-[#002b70] leading-snug group-hover:text-blue-900 transition line-clamp-2">
                  {t(s, 'name')}
                </h3>
                {s.description_np && (
                  <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 font-medium">
                    {t(s, 'description')}
                  </p>
                )}
              </div>

              {/* Bottom Badge Bar */}
              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {s.fee_np && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                      <Tag size={11} /> {t(s, 'fee')}
                    </span>
                  )}
                  {s.processing_time_np && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                      <Clock size={11} /> {t(s, 'processing_time')}
                    </span>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#002b70] group-hover:text-white flex items-center justify-center text-gray-400 transition-all shrink-0">
                  <ChevronRight size={16} />
                </div>
              </div>
            </button>
          ))}

          {filteredServices.length === 0 && (
            <div className="col-span-3 text-center py-20 bg-white/10 rounded-3xl border border-white/15 text-white/70 text-base font-bold">
              कुनै सेवा फेला परेन (No matching services found)
            </div>
          )}
        </div>
      </main>

      {/* Document Modal */}
      {selectedService && (
        <DocumentModal
          serviceId={selectedService.id}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />
    </div>
  );
}
