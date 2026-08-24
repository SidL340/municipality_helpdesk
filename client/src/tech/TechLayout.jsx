import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  UserPlus, Users, Activity, Settings, FileText, LogOut,
  Menu, X, Cpu, ExternalLink, User
} from 'lucide-react';

const TECH_NAV = [
  { path: '/tech/requests', labelNp: 'वडा दर्ता अनुरोध', icon: UserPlus },
  { path: '/tech/users', labelNp: 'वडा खाताहरू', icon: Users },
  { path: '/tech/diagnostics', labelNp: 'प्राविधिक नियन्त्रण', icon: Activity },
  { path: '/tech/services', labelNp: 'मास्टर सेवा सूची', icon: Settings },
  { path: '/tech/documents', labelNp: 'मास्टर कागजात सूची', icon: FileText },
  { path: '/tech/profile', labelNp: 'प्राविधिक प्रोफाइल', icon: User },
];

export default function TechLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/tech/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Tech Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[#1e1b4b] text-white flex flex-col justify-between transition-all duration-200 shrink-0 shadow-2xl z-20`}>
        <div>
          {/* Header */}
          <div className="p-5 border-b border-purple-800/40 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-lg shadow-md">
                  <Cpu size={18} />
                </div>
                <div>
                  <h2 className="font-black text-sm leading-tight text-white">Tech Head Portal</h2>
                  <p className="text-purple-300 text-[10px] uppercase font-bold tracking-wider">Nirmala Tech</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition mx-auto"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1.5">
            {TECH_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-purple-200 hover:bg-white/10 hover:text-white'
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
        <div className="p-4 border-t border-purple-800/40 space-y-3">
          <NavLink
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-purple-300 hover:text-white transition px-2"
          >
            <ExternalLink size={14} /> {!collapsed && <span>Open Citizen Kiosk</span>}
          </NavLink>

          <div className="flex items-center justify-between pt-2 border-t border-purple-800/30">
            {!collapsed && (
              <div className="text-xs">
                <p className="font-bold text-white truncate">{user.full_name || 'Tech Lead'}</p>
                <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-md mt-0.5 bg-purple-600 text-white uppercase">
                  Central Tech Head
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
            <div className="pt-2 border-t border-purple-800/30 text-center">
              <p className="text-[9px] text-amber-300 font-bold">
                Nirmala Tech Innovations Pvt. Ltd.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-600 text-white flex items-center gap-1.5 shadow-xs">
              <Cpu size={14} />
              Central Tech Head Control Room
            </span>
            <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
              Nirmala Tech Innovations Pvt. Ltd.
            </span>
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            Logged in as: <strong className="text-purple-950">@{user.username || 'tech_admin'}</strong>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
