/**
 * Multi-Language Text-to-Speech (TTS) Engine for Nepal Ward Kiosk
 * Handles Nepali (ne-NP), Hindi/Maithili/Bhojpuri fallback (hi-IN), and English (en-US)
 */

let currentAudio = null;

/**
 * Clean text for natural speech:
 * - Removes numbers/enumeration (1., 2., १., २.)
 * - Replaces '+' with 'र' (and)
 * - Replaces '/' with 'वा' (or)
 * - Strips awkward symbols and punctuation
 */
export function cleanSpeechText(text) {
  if (!text) return '';
  return text
    // Replace '+' with natural connective word
    .replace(/\+/g, ' र ')
    // Replace '/' with 'वा' (or)
    .replace(/\//g, ' वा ')
    // Remove enumeration like '1. ', '2. ', '१. ', '२. ', '1) ', '१) '
    .replace(/(?:^|\s)[\d०-९]+[\.\)\-:\s]\s*/g, ' ')
    // Remove isolated numbers/digits
    .replace(/[\d०-९]+/g, '')
    // Remove bracket characters without deleting inner words
    .replace(/[\(\)\[\]\{\}]/g, ' ')
    // Remove stray special chars
    .replace(/[*#~_=|\\]/g, ' ')
    // Normalize spacing and commas
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text, lang = 'np') {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.warn('Web Speech API not supported on this browser');
      resolve();
      return;
    }

    stop();

    // Clean up text before speech synthesis
    const cleanedText = cleanSpeechText(text);
    if (!cleanedText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 0.82; // Calm, clear pace for elder citizens
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    let targetLang = 'ne-NP';
    if (lang === 'en') targetLang = 'en-US';
    if (lang === 'mai' || lang === 'bho') targetLang = 'hi-IN'; // Devanagari phonetic model

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));

    if (!selectedVoice && (targetLang === 'ne-NP' || targetLang === 'hi-IN')) {
      selectedVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('ne'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = targetLang;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        console.warn('Speech error:', e);
      }
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function playAudioUrl(url) {
  return new Promise((resolve) => {
    stop();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}

export function stop() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function isSpeaking() {
  return Boolean(window.speechSynthesis?.speaking || currentAudio);
}
