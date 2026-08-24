import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speak, stop, isSpeaking, playAudioUrl } from '../utils/speech.js';
import { useLanguage } from './LanguageContext.jsx';

export default function VoiceButton({ text, audioUrl, className = '' }) {
  const [speaking, setSpeaking] = useState(false);
  const { language, getPhrase } = useLanguage();

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (speaking || isSpeaking()) {
      stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    try {
      if (audioUrl) {
        await playAudioUrl(audioUrl);
      } else {
        await speak(text, language);
      }
    } catch (err) {
      console.warn('Speech playback failed:', err);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`touch-btn flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-bold text-white shadow-lg transition-all ${
        speaking ? 'bg-[#DC143C] animate-pulse' : 'bg-[#003893] hover:bg-[#00225c]'
      } ${className}`}
      title={speaking ? getPhrase('stop') : getPhrase('listen')}
    >
      {speaking ? (
        <>
          <VolumeX size={20} />
          <div className="flex items-center gap-1 h-4">
            <span className="w-1 h-full bg-white rounded-full wave-bar"></span>
            <span className="w-1 h-full bg-white rounded-full wave-bar"></span>
            <span className="w-1 h-full bg-white rounded-full wave-bar"></span>
          </div>
          <span className="text-sm font-semibold">{getPhrase('stop')}</span>
        </>
      ) : (
        <>
          <Volume2 size={20} />
          <span className="text-sm font-semibold">{getPhrase('listen')}</span>
        </>
      )}
    </button>
  );
}
