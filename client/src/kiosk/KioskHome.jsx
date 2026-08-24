import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart, IdCard, Landmark, Shield, Briefcase, FileSignature,
  Phone, MapPin, ChevronRight, Clock, Calculator,
  HardHat, AlertTriangle, GraduationCap, User,
  Sparkles, RefreshCw, X, Check, ArrowLeft, ArrowRight, Bot
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext.jsx';
import api from '../utils/api.js';
import { stop } from '../utils/speech.js';
import AiAssistantModal from '../components/AiAssistantModal.jsx';

const ICON_MAP = {
  'heart': Heart,
  'id-card': IdCard,
  'landmark': Landmark,
  'shield': Shield,
  'briefcase': Briefcase,
  'file-signature': FileSignature,
  'calculator': Calculator,
  'hard-hat': HardHat,
  'alert-triangle': AlertTriangle,
  'graduation-cap': GraduationCap,
};

const CATEGORY_COLORS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-600 to-red-700',
  'from-purple-600 to-indigo-800',
  'from-sky-600 to-blue-700',
  'from-cyan-600 to-teal-800',
  'from-orange-600 to-amber-700',
  'from-red-600 to-rose-800',
  'from-violet-600 to-purple-800',
];

export default function KioskHome() {
  const { wardNumber } = useParams();
  const navigate = useNavigate();
  const { t, language, setLanguage, languages, getPhrase } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [wardInfo, setWardInfo] = useState(null);
  const [availableWards, setAvailableWards] = useState([]);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const activeWard = wardNumber || localStorage.getItem('active_ward_number') || '1';

  useEffect(() => {
    stop();
    if (wardNumber) {
      localStorage.setItem('active_ward_number', wardNumber);
    }
    fetchHomeData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [wardNumber]);

  const fetchHomeData = async () => {
    try {
      const [catRes, wardRes, wardsListRes] = await Promise.all([
        api.get('/services/categories'),
        api.get(`/services/ward-info?ward=${activeWard}`),
        api.get('/services/wards'),
      ]);
      setCategories(catRes.data);
      setWardInfo(wardRes.data);
      setAvailableWards(wardsListRes.data);
    } catch (err) {
      console.error('Error fetching kiosk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWard = (wNum) => {
    localStorage.setItem('active_ward_number', String(wNum));
    setShowWardModal(false);
    navigate(`/ward/${wNum}`);
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('ne-NP', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002868] via-[#001f4d] to-[#001026] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-xl font-bold animate-pulse">नागरिक सहायता कक्ष लोड हुँदैछ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002b70] via-[#001f52] to-[#001129] flex flex-col justify-between text-white select-none relative">
      {/* Top Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/15 px-6 py-4 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          {/* Left: Navigation Buttons & Ward Identity */}
          <div className="flex items-center gap-3 text-center lg:text-left">
            {/* Back & Forward Navigation Controls */}
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

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-gray-900 border border-amber-300 flex items-center justify-center text-2xl shadow-lg shrink-0">
              🏛️
            </div>

            <div>
              <p className="text-white/80 text-xs font-bold tracking-wider uppercase">
                {t(wardInfo, 'municipality') || 'स्थानीय तह'}
              </p>

              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow">
                {t(wardInfo, 'ward_name') || `वडा नं. ${activeWard} कार्यालय`}
              </h1>
              <p className="text-amber-300 text-xs font-extrabold flex items-center justify-center lg:justify-start gap-1 mt-0.5">
                <Sparkles size={13} />
                नागरिक सहायता तथा डिजिटल टोकन प्रणाली
              </p>
            </div>
          </div>

          {/* Right: Live Clock & Multilingual Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={() => setShowAiModal(true)}
              className="touch-btn bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-gray-950 font-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-amber-300 active:scale-95 transition text-xs"
            >
              <Bot size={18} />
              <span>वडा एआई सहायक (Ask AI)</span>
            </button>

            {/* Live Clock Badge */}
            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 flex items-center gap-2.5 text-xs">
              <Clock size={16} className="text-amber-300 animate-pulse" />
              <div>
                <p className="font-extrabold text-white text-sm leading-tight">{formatTime()}</p>
                <p className="text-[10px] text-white/70">{formatDate()}</p>
              </div>
            </div>

            {/* Language Selector Pills */}
            <div className="flex items-center gap-1.5 bg-black/35 p-1.5 rounded-2xl border border-white/15 shadow-inner">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`touch-btn px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200 shadow ${
                    language === lang.code
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg ring-2 ring-white/50 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Officials & Contact Strip */}
        {wardInfo && (
          <div className="mt-3 pt-3 border-t border-white/10 max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-white/90">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <User size={14} className="text-amber-400 shrink-0" />
              <span className="truncate"><strong>अध्यक्ष:</strong> {t(wardInfo, 'chairperson_name')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <User size={14} className="text-amber-400 shrink-0" />
              <span className="truncate"><strong>सचिव:</strong> {t(wardInfo, 'secretary_name')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Phone size={14} className="text-amber-400 shrink-0" />
              <span>{wardInfo.phone || '०१-४२३४५६७'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock size={14} className="text-amber-400 shrink-0" />
              <span>{t(wardInfo, 'office_hours') || '१०:०० - ५:००'}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Kiosk Grid */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md text-white">
            {getPhrase('welcome')}
          </h2>
          <p className="text-white/80 text-base md:text-lg mt-1 font-semibold">
            {getPhrase('subWelcome')}
          </p>
        </div>

        {/* 10 Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {categories.map((cat, idx) => {
            const IconComp = ICON_MAP[cat.icon] || FileSignature;
            const gradient = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/services/${cat.id}`)}
                className="touch-btn bg-white/95 hover:bg-white active:scale-95 rounded-3xl p-5 flex flex-col items-center justify-between text-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 border-2 border-white/30 group h-48 relative overflow-hidden"
              >
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${gradient}`}></div>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 shrink-0 mt-1`}>
                  <IconComp size={28} />
                </div>

                <h3 className="font-extrabold text-[#002b70] text-sm md:text-base leading-tight mt-2 flex-1 flex items-center justify-center">
                  {t(cat, 'name')}
                </h3>

                <span className="text-[11px] font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1 group-hover:bg-[#002b70] group-hover:text-white transition-colors">
                  {cat.service_count} सेवाहरू <ChevronRight size={12} />
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <button
        onClick={() => setShowAiModal(true)}
        className="fixed bottom-16 right-6 z-40 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-gray-950 font-black p-4 rounded-3xl shadow-2xl border-2 border-white flex items-center gap-3 active:scale-95 hover:scale-105 transition-all duration-200"
      >
        <div className="w-10 h-10 rounded-2xl bg-white text-gray-900 flex items-center justify-center shadow-inner">
          <Bot size={24} className="animate-bounce" />
        </div>
        <div className="text-left pr-1">
          <p className="text-xs font-black text-white drop-shadow">केही सोध्नुहोस्?</p>
          <p className="text-[10px] text-amber-100 font-bold">नागरिक एआई सहायक</p>
        </div>
      </button>

      {/* Ward Switcher Modal */}
      {showWardModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl text-gray-800 animate-in zoom-in-95 duration-150 border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#002b70]">
                  🏛️ वडा कार्यालय चयन गर्नुहोस् (Select Ward Office)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  काठमाडौं महानगरपालिका अन्तर्गतका वडाहरू:
                </p>
              </div>
              <button
                onClick={() => setShowWardModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableWards.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWard(w.ward_number)}
                  className={`p-4 rounded-2xl border text-left transition flex items-start justify-between shadow-xs ${
                    String(activeWard) === String(w.ward_number)
                      ? 'bg-blue-50 border-[#003893] ring-2 ring-[#003893]'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black bg-[#003893] text-white px-2.5 py-0.5 rounded-md">
                      वडा नं. {w.ward_number}
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-sm mt-1.5">{w.ward_name_np}</h3>
                    <p className="text-xs text-gray-500">{w.address_np || w.municipality_np}</p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      👤 सचिव: <strong>{w.secretary_name_np || 'सचिव'}</strong>
                    </p>
                  </div>

                  {String(activeWard) === String(w.ward_number) && (
                    <span className="w-7 h-7 rounded-full bg-[#003893] text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white">🏛️ नागरिक सहायता तथा टोकन प्रणाली</span>
          <span className="text-white/40">|</span>
          <span className="text-white/80">नेपाल सरकार, स्थानीय तह</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-white/75">
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-amber-400" /> {t(wardInfo, 'address') || 'नेपाल'}
          </span>
          <span className="text-white/40">|</span>
          <span className="text-amber-300 font-bold">
            प्रविधि: निर्मला टेक इनोभेसन प्रा. लि. (Nirmala Tech Innovations Pvt. Ltd.)
          </span>
        </div>
      </footer>
    </div>
  );
}
