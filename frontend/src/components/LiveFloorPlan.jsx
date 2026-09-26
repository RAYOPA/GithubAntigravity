import React, { useState } from 'react';
import { MapPin, Info, Users, Layers, Sparkles, Building2, CalendarPlus } from 'lucide-react';

export const LiveFloorPlan = ({ resources = [], onSelectResource }) => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  // Helper to get room status color
  const getRoomColor = (liveStatus) => {
    switch (liveStatus) {
      case 'available':
        return { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981', text: '#34d399', badge: 'FREE' };
      case 'occupied':
        return { fill: 'rgba(244, 63, 94, 0.35)', stroke: '#f43f5e', text: '#fb7185', badge: 'OCCUPIED' };
      case 'pending_checkin':
        return { fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b', text: '#fbbf24', badge: 'PENDING CHECK-IN' };
      case 'maintenance':
        return { fill: 'rgba(168, 85, 247, 0.3)', stroke: '#a855f7', text: '#c084fc', badge: 'MAINTENANCE' };
      default:
        return { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981', text: '#34d399', badge: 'FREE' };
    }
  };

  // Find resource by code / id
  const getResourceByRoomNumber = (roomNumber) => {
    return resources.find(r => r.room_number === roomNumber);
  };

  // Resources on floor 1 & 2
  const roomA101 = getResourceByRoomNumber('A101') || resources[0];
  const roomC101 = getResourceByRoomNumber('C101') || resources[1];
  const roomAud01 = getResourceByRoomNumber('AUD-01') || resources[4];
  const roomSHA = getResourceByRoomNumber('SH-A') || resources[2];
  const roomP201 = getResourceByRoomNumber('P201') || resources[3];

  return (
    <div className="space-y-6">
      
      {/* Header & Floor Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-white/10 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            Dynamic Campus Architectural Floor Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual occupancy tracking: Green (Available), Red (Occupied), Yellow (Pending Check-in).
          </p>
        </div>

        {/* Floor selector buttons */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setSelectedFloor(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFloor === 1
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Floor 1 (Ground Hub)
          </button>
          <button
            onClick={() => setSelectedFloor(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFloor === 2
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Floor 2 (Executive Labs)
          </button>
        </div>
      </div>

      {/* Live Map Legend */}
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-emerald-300 font-medium">Free & Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
          <span className="text-rose-300 font-medium">Occupied (In Session)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse"></span>
          <span className="text-amber-300 font-medium">Pending Check-in (15m grace)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
          <span className="text-purple-300 font-medium">Scheduled Maintenance</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="glass-panel p-6 relative overflow-hidden">
        
        {/* Floor 1 SVG Map */}
        {selectedFloor === 1 ? (
          <div className="w-full max-w-4xl mx-auto">
            <svg
              viewBox="0 0 900 520"
              className="w-full h-auto drop-shadow-2xl select-none"
              style={{ maxHeight: '550px' }}
            >
              <defs>
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Background blueprint grid */}
              <rect width="900" height="520" fill="#090d16" rx="16" />
              <rect width="900" height="520" fill="url(#gridPattern)" rx="16" />

              {/* Building Boundary Wall */}
              <rect x="30" y="30" width="840" height="460" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />

              {/* Central Hallway / Atrium */}
              <rect x="300" y="30" width="160" height="460" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x="380" y="260" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                CENTRAL ATRIUM & CONCOURSE
              </text>

              {/* ROOM 1: Room A101 (Smart Classroom) */}
              {(() => {
                const c = getRoomColor(roomA101?.live_status);
                return (
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onMouseEnter={() => setHoveredRoom(roomA101)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => roomA101 && onSelectResource(roomA101)}
                  >
                    <rect
                      x="50"
                      y="50"
                      width="230"
                      height="190"
                      rx="8"
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth="2.5"
                    />
                    <text x="65" y="80" fill="#ffffff" fontSize="15" fontWeight="bold">
                      Room A101
                    </text>
                    <text x="65" y="100" fill="#94a3b8" fontSize="11">
                      Smart Classroom • 60 Seats
                    </text>
                    <rect x="65" y="120" width="90" height="20" rx="4" fill={c.stroke} fillOpacity="0.3" />
                    <text x="110" y="134" fill={c.text} fontSize="9" fontWeight="bold" textAnchor="middle">
                      {c.badge}
                    </text>
                    <text x="65" y="215" fill="#6366f1" fontSize="10" fontWeight="bold">
                      CLICK TO RESERVE →
                    </text>
                  </g>
                );
              })()}

              {/* ROOM 2: Computer Laboratory 1 */}
              {(() => {
                const c = getRoomColor(roomC101?.live_status);
                return (
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onMouseEnter={() => setHoveredRoom(roomC101)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => roomC101 && onSelectResource(roomC101)}
                  >
                    <rect
                      x="50"
                      y="260"
                      width="230"
                      height="210"
                      rx="8"
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth="2.5"
                    />
                    <text x="65" y="290" fill="#ffffff" fontSize="15" fontWeight="bold">
                      Computer Lab 1 (C101)
                    </text>
                    <text x="65" y="310" fill="#94a3b8" fontSize="11">
                      50 Workstations • Gigabit LAN
                    </text>
                    <rect x="65" y="330" width="90" height="20" rx="4" fill={c.stroke} fillOpacity="0.3" />
                    <text x="110" y="344" fill={c.text} fontSize="9" fontWeight="bold" textAnchor="middle">
                      {c.badge}
                    </text>
                    <text x="65" y="445" fill="#6366f1" fontSize="10" fontWeight="bold">
                      CLICK TO RESERVE →
                    </text>
                  </g>
                );
              })()}

              {/* ROOM 3: Innovation Grand Auditorium */}
              {(() => {
                const c = getRoomColor(roomAud01?.live_status);
                return (
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onMouseEnter={() => setHoveredRoom(roomAud01)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => roomAud01 && onSelectResource(roomAud01)}
                  >
                    <rect
                      x="480"
                      y="50"
                      width="370"
                      height="420"
                      rx="8"
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth="2.5"
                    />
                    <text x="505" y="90" fill="#ffffff" fontSize="17" fontWeight="bold">
                      Innovation Grand Auditorium (AUD-01)
                    </text>
                    <text x="505" y="115" fill="#94a3b8" fontSize="12">
                      Premier Amphitheater • 250 Capacity • 30m Cleaning Buffer
                    </text>

                    {/* Auditorium Seating Arc representation */}
                    <path
                      d="M 520 220 Q 665 290 810 220"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="6"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 540 270 Q 665 330 790 270"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="6"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 560 320 Q 665 370 770 320"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="6"
                      strokeDasharray="4 4"
                    />

                    <rect x="505" y="135" width="100" height="22" rx="4" fill={c.stroke} fillOpacity="0.3" />
                    <text x="555" y="150" fill={c.text} fontSize="10" fontWeight="bold" textAnchor="middle">
                      {c.badge}
                    </text>
                    <text x="505" y="445" fill="#6366f1" fontSize="11" fontWeight="bold">
                      CLICK TO RESERVE AMPHITHEATER →
                    </text>
                  </g>
                );
              })()}

            </svg>
          </div>
        ) : (
          /* Floor 2 SVG Map */
          <div className="w-full max-w-4xl mx-auto">
            <svg
              viewBox="0 0 900 520"
              className="w-full h-auto drop-shadow-2xl select-none"
              style={{ maxHeight: '550px' }}
            >
              <defs>
                <pattern id="gridPattern2" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>

              <rect width="900" height="520" fill="#090d16" rx="16" />
              <rect width="900" height="520" fill="url(#gridPattern2)" rx="16" />
              <rect x="30" y="30" width="840" height="460" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />

              {/* Corridor */}
              <rect x="30" y="220" width="840" height="80" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x="450" y="265" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                LEVEL 2 EXECUTIVE RESEARCH CORRIDOR
              </text>

              {/* ROOM 4: Seminar Hall A */}
              {(() => {
                const c = getRoomColor(roomSHA?.live_status);
                return (
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onMouseEnter={() => setHoveredRoom(roomSHA)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => roomSHA && onSelectResource(roomSHA)}
                  >
                    <rect
                      x="50"
                      y="50"
                      width="380"
                      height="150"
                      rx="8"
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth="2.5"
                    />
                    <text x="70" y="85" fill="#ffffff" fontSize="16" fontWeight="bold">
                      Seminar Hall A (SH-A)
                    </text>
                    <text x="70" y="105" fill="#94a3b8" fontSize="11">
                      Tiered Research Hall • 150 Seats • Quad Microphones
                    </text>
                    <rect x="70" y="120" width="90" height="20" rx="4" fill={c.stroke} fillOpacity="0.3" />
                    <text x="115" y="134" fill={c.text} fontSize="9" fontWeight="bold" textAnchor="middle">
                      {c.badge}
                    </text>
                    <text x="70" y="180" fill="#6366f1" fontSize="10" fontWeight="bold">
                      CLICK TO RESERVE →
                    </text>
                  </g>
                );
              })()}

              {/* ROOM 5: Physics Laboratory */}
              {(() => {
                const c = getRoomColor(roomP201?.live_status);
                return (
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onMouseEnter={() => setHoveredRoom(roomP201)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => roomP201 && onSelectResource(roomP201)}
                  >
                    <rect
                      x="470"
                      y="50"
                      width="380"
                      height="150"
                      rx="8"
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth="2.5"
                    />
                    <text x="490" y="85" fill="#ffffff" fontSize="16" fontWeight="bold">
                      Physics Laboratory (P201)
                    </text>
                    <text x="490" y="105" fill="#94a3b8" fontSize="11">
                      Optics & Laser Research Benches • 40 Capacity
                    </text>
                    <rect x="490" y="120" width="90" height="20" rx="4" fill={c.stroke} fillOpacity="0.3" />
                    <text x="535" y="134" fill={c.text} fontSize="9" fontWeight="bold" textAnchor="middle">
                      {c.badge}
                    </text>
                    <text x="490" y="180" fill="#6366f1" fontSize="10" fontWeight="bold">
                      CLICK TO RESERVE →
                    </text>
                  </g>
                );
              })()}

              {/* Lower Section: Faculty Offices */}
              <rect x="50" y="320" width="800" height="150" rx="8" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x="450" y="400" fill="#475569" fontSize="13" fontWeight="bold" textAnchor="middle">
                FACULTY RESEARCH SUITES & DEPARTMENT OFFICES (RESTRICTED ACCESS)
              </text>

            </svg>
          </div>
        )}

        {/* Hover Inspection Drawer */}
        {hoveredRoom && (
          <div className="absolute bottom-6 right-6 max-w-xs bg-slate-900/95 border border-indigo-500/40 p-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
              <span>{hoveredRoom.name}</span>
              <span className="text-[10px] text-indigo-400 font-mono">Floor {hoveredRoom.floor_number}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Capacity: {hoveredRoom.capacity} attendees • Buffer: {hoveredRoom.buffer_time_minutes}m
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CalendarPlus className="w-3 h-3" />
              <span>Click room rectangle to book slot</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
