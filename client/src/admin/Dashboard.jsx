import React, { useState, useEffect } from 'react';
import { Users, FileText, Monitor, TrendingUp, RefreshCw, Play, ExternalLink, Activity, UserPlus } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import api from '../utils/api.js';

const PALETTE = ['#003893', '#DC143C', '#D4AF37', '#059669', '#7c3aed', '#db2777', '#ea580c', '#0284c7'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const userRole = user.role || 'ward_admin';
  const wardNumber = user.ward_number || 32;

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(fetchDashboard, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const wardQuery = userRole === 'ward_admin' && wardNumber ? `?ward=${wardNumber}` : '';
      const [sRes, pRes, wRes, rRes] = await Promise.all([
        api.get(`/analytics/today${wardQuery}`),
        api.get(`/analytics/peak-hours${wardQuery}`),
        api.get(`/analytics/weekly${wardQuery}`),
        api.get(`/analytics/recent-tokens${wardQuery}`),
      ]);
      setStats(sRes.data);
      setPeakHours(pRes.data);
      setWeekly(wRes.data);
      setRecent(rRes.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-gray-500 font-bold animate-pulse">ड्यासबोर्ड लोड हुँदैछ...</div>;
  }

  const topService = stats?.byService?.[0];

  const handleLaunchKiosk = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Security: Log out of admin session so tablet operates in clean locked kiosk mode
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.setItem('active_ward_number', String(wardNumber));

    window.location.href = `/ward/${wardNumber}`;
  };

  return (
    <div className="space-y-6">
      {/* Ward Secretary Welcome & Direct Launch Card */}
      {userRole === 'ward_admin' ? (
        <div className="bg-gradient-to-r from-[#002b70] via-[#003893] to-[#001f52] rounded-3xl p-6 shadow-xl border border-white/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-gray-900 text-xs font-black px-2.5 py-0.5 rounded-md">
                वडा नं. {wardNumber}
              </span>
              <span className="text-white/80 text-xs font-semibold">
                {user.municipality_name || 'काठमाडौं महानगरपालिका'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              स्वागतम्, {user.full_name || 'वडा सचिव'}
            </h2>
            <p className="text-white/70 text-xs mt-0.5">
              नागरिक सहायता कक्ष तथा टोकन व्यवस्थापन प्रणाली
            </p>
          </div>

          <button
            onClick={handleLaunchKiosk}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition shrink-0 text-sm"
          >
            <Play size={18} />
            <span>वडा कियोस्क सुरु गर्नुहोस् (Launch Fullscreen Kiosk)</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 rounded-3xl p-6 shadow-xl border border-white/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="bg-purple-300 text-purple-950 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
              Central Tech Control
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              ई. {user.full_name || 'Tech Lead'} (Nirmala Tech)
            </h2>
            <p className="text-white/70 text-xs mt-0.5">
              Ward Approvals & System Hardware Diagnostics Center
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin/requests"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition"
            >
              <UserPlus size={14} /> Onboarding Requests
            </a>
            <a
              href="/admin/diagnostics"
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-gray-900 text-xs font-black px-4 py-2.5 rounded-xl transition shadow"
            >
              <Activity size={14} /> System Diagnostics
            </a>
          </div>
        </div>
      )}

      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-semibold">
          दैनिक प्रत्यक्ष लगत | मिति: <strong>{stats?.date}</strong>
        </p>

        <button
          onClick={fetchDashboard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#003893] hover:bg-gray-50 shadow-xs transition"
        >
          <RefreshCw size={13} /> Refresh Data
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Today's Footfall"
          labelNp="आज सेवा लिएका नागरिक"
          value={stats?.totalTokens || 0}
          color="bg-[#003893]"
        />
        <StatCard
          icon={TrendingUp}
          label="Most Requested"
          labelNp="सबैभन्दा धेरै माग"
          value={topService?.name_np || 'N/A'}
          sub={topService ? `${topService.count} जना` : ''}
          color="bg-[#DC143C]"
        />
        <StatCard
          icon={FileText}
          label="Active Services"
          labelNp="सञ्चालित सेवाहरू"
          value={stats?.activeServices || 0}
          color="bg-emerald-600"
        />
        <StatCard
          icon={Monitor}
          label="Active Counters"
          labelNp="खुला काउन्टरहरू"
          value={stats?.activeDesks || 0}
          color="bg-purple-600"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Popularity Pie */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 text-base mb-1">
            सेवागत वितरण (Service Breakdown)
          </h3>
          <p className="text-xs text-gray-400 mb-4">आज कुन सेवाको लागि कति नागरिक आए</p>

          {stats?.byService?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.byService.map((s) => ({ name: s.name_np || s.name_en, value: s.count }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, value }) => `${name.slice(0, 10)}.. (${value})`}
                >
                  {stats.byService.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20 text-gray-400 text-sm">आज हालसम्म कुनै टोकन लिइएको छैन।</div>
          )}
        </div>

        {/* Peak Rush Hours Bar Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 text-base mb-1">
            कार्यालय चाप समय (Peak Rush Hours)
          </h3>
          <p className="text-xs text-gray-400 mb-4">घण्टा अनुसार नागरिकको उपस्थिति</p>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" fontSize={11} stroke="#888" />
              <YAxis allowDecimals={false} fontSize={11} stroke="#888" />
              <Tooltip />
              <Bar dataKey="count" fill="#003893" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Trend Line Chart */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 text-base mb-1">
          साप्ताहिक नागरिक आगमन (7-Day Footfall Trend)
        </h3>
        <p className="text-xs text-gray-400 mb-4">पछिल्लो ७ दिनको दैनिक टोकन सङ्ख्या</p>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={11} stroke="#888" />
            <YAxis allowDecimals={false} fontSize={11} stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#DC143C" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Live Queue Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 overflow-hidden">
        <h3 className="font-bold text-gray-800 text-base mb-3">
          हालैका टोकनहरू (Live Queue Log)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase">
              <tr>
                <th className="py-3 px-4">टोकन नं.</th>
                <th className="py-3 px-4">सेवा</th>
                <th className="py-3 px-4">काउन्टर</th>
                <th className="py-3 px-4">स्थिति</th>
                <th className="py-3 px-4">समय</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-extrabold text-[#003893] text-sm">#{t.token_number}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{t.service_name_np || t.service_name_en}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{t.desk_name || 'काउन्टर १'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-medium">
                    {new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">कुनै रेकर्ड छैन</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, labelNp, value, sub, color }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0 shadow-md`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">{labelNp}</p>
        <h4 className="text-xl md:text-2xl font-black text-gray-800 truncate mt-0.5">{value}</h4>
        {sub && <p className="text-xs text-amber-600 font-bold truncate mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
