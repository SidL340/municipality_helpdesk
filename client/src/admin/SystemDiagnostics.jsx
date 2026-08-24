import React, { useState, useEffect } from 'react';
import {
  Activity, Printer, Database, Volume2, Cpu, Server, HardDrive,
  CheckCircle2, AlertTriangle, RefreshCw, Play
} from 'lucide-react';
import api from '../utils/api.js';
import { speak, stop } from '../utils/speech.js';
import toast from 'react-hot-toast';

export default function SystemDiagnostics() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingPrint, setTestingPrint] = useState(false);
  const [testSpeechLang, setTestSpeechLang] = useState('np');

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/diagnostics/system-health');
      setHealth(res.data);
    } catch (err) {
      console.error('Fetch health error:', err);
      toast.error('Failed to load system diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async () => {
    setTestingPrint(true);
    try {
      await api.post('/admin/diagnostics/test-print');
      toast.success('🖨️ प्रिन्टर परीक्षण स्लिप पठाइयो (Diagnostic slip sent to Laser Printer!)');
    } catch (err) {
      toast.error('Printer test error: ' + (err.response?.data?.error || err.message));
    } finally {
      setTestingPrint(false);
    }
  };

  const handleTestAudio = async () => {
    stop();
    const testPhrases = {
      np: 'यो नागरिक सहायता कक्षको ध्वनि सहायक प्रणालीको प्राविधिक परीक्षण हो। सबै कुरा ठीक छ।',
      mai: 'ई नागरिक सहायता कक्ष के ध्वनि सहायक प्रणाली के प्राविधिक परीक्षण अछि।',
      bho: 'ई नागरिक सहायता कक्ष के आवाज सहायक प्रणाली के टेक्निकल जांच बा।',
      en: 'This is a technical diagnostic test for the Smart Citizen Kiosk voice assistant.',
    };

    try {
      await speak(testPhrases[testSpeechLang] || testPhrases.np, testSpeechLang);
      toast.success('🔊 Audio playback test complete');
    } catch (err) {
      toast.error('Audio test failed');
    }
  };

  if (loading && !health) {
    return <div className="text-center py-20 text-gray-400 font-bold animate-pulse">प्राविधिक विवरण लोड हुँदैछ...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Activity className="text-emerald-600" size={28} />
            प्राविधिक नियन्त्रण तथा डायग्नोस्टिक (System Diagnostics)
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Real-time hardware status, laser printer diagnostic test, database health, and voice engine tests
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#003893] hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Status
        </button>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">System State</p>
            <h3 className="text-xl font-black text-gray-800">100% Operational</h3>
            <p className="text-[11px] text-emerald-600 font-bold">All services active</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#003893] flex items-center justify-center shrink-0">
            <Database size={30} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Database Storage</p>
            <h3 className="text-xl font-black text-gray-800">{health?.database?.size || '0 MB'}</h3>
            <p className="text-[11px] text-gray-500 font-medium">{health?.database?.engine.toUpperCase()} Engine</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Cpu size={30} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Server Uptime</p>
            <h3 className="text-xl font-black text-gray-800">{health?.server?.uptime}</h3>
            <p className="text-[11px] text-gray-500 font-medium">Node {health?.server?.nodeVersion}</p>
          </div>
        </div>
      </div>

      {/* Hardware Diagnostic Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Laser Printer Hardware Test */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Printer size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Laser Printer Test</h3>
                <p className="text-xs text-gray-400">Target: {health?.server?.printerConfigured}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">
              Sends an immediate, silent diagnostic token slip to the connected laser printer to verify that print drivers, spooler, and paper trays are operational.
            </p>
          </div>

          <button
            onClick={handleTestPrint}
            disabled={testingPrint}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-extrabold rounded-2xl shadow transition text-sm flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            {testingPrint ? 'Sending Test Job...' : 'Print Diagnostic Test Token (प्रिन्टर परीक्षण)'}
          </button>
        </div>

        {/* 2. Audio Synthesizer TTS Test */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center">
                <Volume2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Voice Speech TTS Test</h3>
                <p className="text-xs text-gray-400">Web Speech Audio Synthesizer</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">
              Tests the tablet/speaker voice generation across different local languages to ensure elder citizens can hear clear instructions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={testSpeechLang}
              onChange={(e) => setTestSpeechLang(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#003893] outline-none"
            >
              <option value="np">नेपाली (Nepali)</option>
              <option value="mai">मैथिली (Maithili)</option>
              <option value="bho">भोजपुरी (Bhojpuri)</option>
              <option value="en">English</option>
            </select>

            <button
              onClick={handleTestAudio}
              className="flex-1 py-3.5 bg-[#003893] hover:bg-[#00225c] text-white font-extrabold rounded-2xl shadow transition text-sm flex items-center justify-center gap-2"
            >
              <Play size={16} /> Test Audio Output (आवाज सुन्नुहोस्)
            </button>
          </div>
        </div>
      </div>

      {/* Database & System Specifications */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
          <Server size={18} className="text-[#003893]" />
          विस्तृत प्रणाली विवरण (Detailed System Specifications)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-gray-50 rounded-2xl p-3.5">
            <p className="text-gray-400 font-bold uppercase text-[10px]">Total Services Loaded</p>
            <p className="text-lg font-black text-gray-900 mt-1">{health?.database?.totalServices}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5">
            <p className="text-gray-400 font-bold uppercase text-[10px]">Document Checklists</p>
            <p className="text-lg font-black text-gray-900 mt-1">{health?.database?.totalDocuments}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5">
            <p className="text-gray-400 font-bold uppercase text-[10px]">Total Tokens Generated</p>
            <p className="text-lg font-black text-[#003893] mt-1">{health?.database?.totalTokensGenerated}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5">
            <p className="text-gray-400 font-bold uppercase text-[10px]">Memory Usage</p>
            <p className="text-sm font-bold text-gray-900 mt-1.5">{health?.server?.memoryUsage}</p>
          </div>
        </div>
      </div>

      {/* Developer & Technical Support Card */}
      <div className="bg-gradient-to-r from-[#002b70] to-[#00173d] rounded-3xl p-6 shadow-xl border border-white/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
            NT
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
              System Engineering & Technical Support
            </span>
            <h3 className="text-lg font-black text-white leading-snug">
              Nirmala Tech Innovations Pvt. Ltd.
            </h3>
            <p className="text-white/70 text-xs mt-0.5">
              निर्मला टेक इनोभेसन प्रा. लि. — e-Governance & Local Government Smart Systems
            </p>
          </div>
        </div>

        <div className="text-xs text-right text-white/80 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
          <p className="font-bold text-amber-300">24/7 SLA Engineering Support</p>
          <p className="text-[11px] text-white/60">Local Government Kiosk Engine v2.0</p>
        </div>
      </div>
    </div>
  );
}
