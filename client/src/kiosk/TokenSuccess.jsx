import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Printer, Clock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext.jsx';

export default function TokenSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, getPhrase } = useLanguage();
  const [countdown, setCountdown] = useState(15);

  const token = location.state;

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-green-800 to-teal-950 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
        {/* Animated Check */}
        <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-6 shadow-2xl">
          <CheckCircle2 size={64} className="text-white drop-shadow" />
        </div>

        {/* Title */}
        <p className="text-white/80 text-xl font-bold tracking-wide mb-3">
          {getPhrase('yourToken')}
        </p>

        {/* Huge Token Number Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-amber-300 w-full mb-6 pulse-glow">
          <span className="text-green-800 font-extrabold text-7xl md:text-8xl tracking-tight block">
            {token.tokenNumber}
          </span>
        </div>

        {/* Destination Details */}
        <div className="bg-black/25 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full space-y-2 mb-6">
          <p className="text-white/90 text-sm">
            <span className="text-white/60">सेवा:</span> <strong>{token.serviceNameNp || token.serviceName}</strong>
          </p>
          <p className="text-amber-300 text-xl md:text-2xl font-black">
            {token.deskName}
          </p>
          {token.deskLocation && (
            <p className="text-white/70 text-xs">
              📍 {token.deskLocation}
            </p>
          )}
        </div>

        {/* Laser Print Notice */}
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-semibold text-white/90 mb-4 animate-pulse">
          <Printer size={16} /> टोकन स्लिप प्रिन्ट भइरहेको छ...
        </div>

        <p className="text-lg font-bold text-white mb-2">
          {getPhrase('pleaseWait')}
        </p>

        {/* Countdown */}
        <div className="flex items-center gap-1 text-white/60 text-xs mt-2">
          <Clock size={13} /> {countdown} सेकेन्डमा स्वतः बन्द हुनेछ
        </div>

        {/* Manual Home Button */}
        <button
          onClick={() => navigate('/')}
          className="touch-btn mt-6 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg flex items-center gap-2"
        >
          <ArrowLeft size={16} /> {getPhrase('backHome')}
        </button>
      </div>
    </div>
  );
}
