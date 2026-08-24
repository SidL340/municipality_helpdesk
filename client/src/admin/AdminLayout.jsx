import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, FileText, Monitor, MapPin, LogOut,
  Menu, X, ExternalLink, Landmark, Play
} from 'lucide-react';

const WARD_NAV = [
  { path: '/admin/dashboard', labelNp: 'ड्यासबोर्ड', icon: LayoutDashboard },
  { path: '/admin/services', labelNp: 'सेवा व्यवस्थापन', icon: Settings },
  { path: '/admin/documents', labelNp: 'कागजात सूची', icon: FileText },
  { path: '/admin/desks', labelNp: 'काउन्टरहरू', icon: Monitor },
  { path: '/admin/ward-info', labelNp: 'वडा प्रोफाइल', icon: MapPin },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const wardNumber = user.ward_number || 32;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Ward Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[#002b70] text-white flex flex-col justify-between transition-all duration-200 shrink-0 shadow-2xl z-20`}>
        <div>
          {/* Header */}
          <div className="p-5 border-b border-white/15 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg">
                  🏛️
                </div>
                <div>
                  <h2 className="font-extrabold text-sm leading-tight">वडा प्रशासन पोर्टल</h2>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">
                    {`Ward No. ${wardNumber}`}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-white/15 transition mx-auto"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            {WARD_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#002b70] shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.labelNp}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/15 space-y-3">
          <button
            onClick={handleLaunchKiosk}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Play size={14} /> {!collapsed && <span>वडा कियोस्क सुरु गर्नुहोस्</span>}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {!collapsed && (
              <div className="text-xs">
                <p className="font-bold text-white truncate">{user.full_name || user.username}</p>
                <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-0.5 bg-emerald-600 text-white">
                  वडा नं. {wardNumber} सचिव
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-600/80 hover:bg-red-700 text-white transition text-xs flex items-center gap-1 shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {!collapsed && (
            <div className="pt-2 border-t border-white/10 text-center">
              <p className="text-[9px] text-amber-300 font-bold">
                Nirmala Tech Innovations Pvt. Ltd.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Sticky Identity Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-emerald-600 text-white">
              <Landmark size={14} />
              वडा नं. {wardNumber} कार्यालय
            </span>
            <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
              {user.municipality_name || 'काठमाडौं महानगरपालिका'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchKiosk}
              className="hidden sm:flex items-center gap-1.5 bg-[#002b70] hover:bg-[#001f52] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <ExternalLink size={13} />
              <span>सार्वजनिक कियोस्क खोल्नुहोस् (Open Kiosk)</span>
            </button>
            <div className="text-xs text-gray-500 font-semibold">
              User: <strong className="text-gray-900">@{user.username}</strong>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
