import React from 'react';

export const Navbar = ({ activeTab, setActiveTab, currentRole, setCurrentRole, isConnected, totalBookings = 0 }) => {
  const navTabs = [
    { id: 'catalog', label: 'Catalog & Booking' },
    { id: 'timeline', label: 'Timeline Schedule' },
    { id: 'floormap', label: 'Live Floor Map' },
    { id: 'demolab', label: 'Live Demo Lab', badge: 'Judge Demo' },
    { id: 'bookings', label: 'Bookings & QR Check-in' },
    { id: 'analytics', label: 'Analytics & Reports' }
  ];

  const roles = [
    { id: 'student', label: 'Aarav Sharma (Student)' },
    { id: 'faculty', label: 'Dr. Priya Menon (Faculty)' },
    { id: 'manager', label: 'Rahul Verma (Facility Manager)' },
    { id: 'admin', label: 'System Admin (Superuser)' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e17]/90 backdrop-blur-2xl border-b border-indigo-500/20">
      <div className="h-20 w-full px-6 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3.5 min-w-max">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="material-symbols-outlined text-white text-[22px]">shield</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white uppercase">Smart Campus</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-tertiary border border-tertiary-container/30">
                GiST v2.1 Exclusion Lock Engine
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/40">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-tertiary' : 'bg-amber-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-tertiary' : 'bg-amber-400'}`}></span>
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant font-medium">
                  {isConnected ? 'Real-Time Engine Active' : 'Connecting Engine...'}
                </span>
                <span className="font-mono text-[10px] text-tertiary-fixed-dim border-l border-outline-variant/50 pl-1.5">
                  12ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1.5 bg-[#0a0e17]/80 p-1 rounded-xl border border-outline-variant/30">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-md shadow-indigo-500/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-tertiary/15 text-tertiary border border-tertiary/40 shadow-[0_0_8px_rgba(76,215,246,0.25)]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Telemetry Pill & Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-surface-container-low/90 rounded-lg border border-outline-variant/30 font-mono text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant">Active Nodes:</span>
              <span className="text-tertiary font-bold">5/5</span>
            </div>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant">Blocked Overlaps:</span>
              <span className="text-rose-400 font-bold">14</span>
            </div>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant">GiST:</span>
              <span className="text-secondary font-bold">Synced</span>
            </div>
          </div>

          {/* Role selector dropdown */}
          <div className="relative flex items-center">
            <select
              aria-label="User Persona Role Switcher"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="appearance-none bg-surface-container-high text-on-surface font-mono text-xs pl-3 pr-8 py-2 rounded-lg border border-outline-variant/40 focus:border-tertiary focus:outline-none cursor-pointer transition-colors"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id} className="bg-[#1c1f29] text-white">
                  {r.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant text-[18px]">
              expand_more
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>

      </div>
    </header>
  );
};
