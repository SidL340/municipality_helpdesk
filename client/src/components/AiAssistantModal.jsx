import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Mic, MicOff, Volume2, Ticket, Sparkles, CheckCircle2 } from 'lucide-react';
import { speak, stop } from '../utils/speech.js';
import api from '../utils/api.js';
import DocumentModal from '../kiosk/DocumentModal.jsx';
import toast from 'react-hot-toast';

export default function AiAssistantModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'नमस्ते! म वडा नागरिक एआई सहायक हुँ। तपाईंलाई कुन सेवा, सरकारी दस्तुर वा आवश्यक कागजातबारे जान्न मन छ? तल लेखेर वा बोलेर सोध्न सक्नुहुन्छ।',
      spokenText: 'नमस्ते! म वडा नागरिक एआई सहायक हुँ। तपाईंलाई कुन सेवा सम्बन्धी जानकारी चाहिन्छ?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'जन्मदर्ता बनाउन के कागजात चाहिन्छ?',
    'नागरिकता सिफारिसको नियम',
    'सम्पत्ति कर कहाँ तिर्ने?',
    'जेष्ठ नागरिक भत्ता ७० वर्ष',
    'घर नक्सा पास गर्न के के चाहिन्छ?',
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (userText) => {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/services/ai-assist', { query: textToSend });
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: res.data.answer,
          spokenText: res.data.spokenText,
          service: res.data.service,
        },
      ]);

      if (res.data.spokenText) {
        speak(res.data.spokenText, 'np');
      }
    } catch (err) {
      toast.error('AI assistant error');
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: 'माफ गर्नुहोस्, अहिले सेवा जानकारी प्राप्त गर्न सकिएन। कृपया सेवा सूचीबाट हेर्नुहोस्।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ne-NP';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast('🎙️ बोल्नुहोस् (Listening in Nepali)...', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('आवाज पहिचान हुन सकेन');
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-150 text-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002b70] to-[#00173d] text-white p-5 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center font-black shadow-inner shrink-0">
              <Bot size={28} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black leading-tight flex items-center gap-1.5">
                नागरिक एआई सहायक (Ward AI Guide)
                <Sparkles size={16} className="text-amber-300" />
              </h2>
              <p className="text-xs text-white/70">
                वडाका ६० सेवा तथा कागजातबारे सोध्नुहोस्
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stop();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-blue-50/70 border-b border-blue-100 p-2.5 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-gray-500 shrink-0">💡 सुझाब:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-white hover:bg-blue-100 text-[#002b70] font-bold px-3 py-1.5 rounded-full border border-blue-200 whitespace-nowrap shadow-2xs transition active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-sm text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#002b70] text-white rounded-br-none'
                    : 'bg-white border border-gray-200/80 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.sender === 'ai' && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {m.spokenText && (
                      <button
                        onClick={() => speak(m.spokenText, 'np')}
                        className="flex items-center gap-1 text-xs font-bold text-[#002b70] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition"
                      >
                        <Volume2 size={14} /> आवाज सुन्नुहोस्
                      </button>
                    )}

                    {m.service && (
                      <button
                        onClick={() => setSelectedServiceId(m.service.id)}
                        className="flex items-center gap-1 text-xs font-extrabold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-xl shadow-xs transition"
                      >
                        <Ticket size={14} /> टोकन लिनुहोस् (Get Token)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs font-bold text-gray-500 animate-pulse">
                <Bot size={16} className="text-[#002b70]" /> एआई जानकारी खोज्दैछ...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 px-4 bg-white border-t border-gray-200 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-md shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="नेपालीमा बोल्नुहोस्"
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="यहाँ लेख्नुहोस् (जस्तै: जन्मदर्ता कसरी बनाउने?)..."
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#002b70] outline-none"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-[#002b70] hover:bg-[#00173d] disabled:bg-gray-300 text-white flex items-center justify-center transition shadow-md shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Embedded Document Modal if clicked from AI */}
      {selectedServiceId && (
        <DocumentModal
          serviceId={selectedServiceId}
          onClose={() => setSelectedServiceId(null)}
        />
      )}
    </div>
  );
}
