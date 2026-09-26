import React, { useState } from 'react';

export const ResourceCatalog = ({ resources = [], onSelectResource, onTriggerConflictDemo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const buildings = [
    { id: 'all', label: 'All Buildings' },
    { id: 'MAB', label: 'Main Academic Block (MAB)' },
    { id: 'SCI', label: 'Science Block (SCI)' },
    { id: 'INC', label: 'Innovation & Research Center (INC)' }
  ];

  const types = [
    { id: 'all', label: 'All Types' },
    { id: 'auditorium', label: 'Auditorium' },
    { id: 'classroom', label: 'Smart Classroom' },
    { id: 'lab', label: 'Computer Lab' },
    { id: 'seminar', label: 'Seminar Hall' },
    { id: 'laboratory', label: 'Physics / Robotics Lab' }
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'available', label: 'Available Now', dot: 'bg-emerald-400' },
    { id: 'occupied', label: 'In Session', dot: 'bg-rose-500' },
    { id: 'pending_checkin', label: 'Grace Check-in', dot: 'bg-amber-400' }
  ];

  const filteredResources = resources.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      r.name.toLowerCase().includes(q) || 
      r.room_number?.toLowerCase().includes(q) || 
      r.description?.toLowerCase().includes(q) ||
      r.building_code?.toLowerCase().includes(q);

    const matchesBuilding = selectedBuilding === 'all' || r.building_code === selectedBuilding;
    const matchesType = selectedType === 'all' || r.category.toLowerCase().includes(selectedType);
    const matchesStatus = selectedStatus === 'all' || r.live_status === selectedStatus;

    return matchesSearch && matchesBuilding && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      
      {/* Telemetry and Operations Ticker Strip (From Stitch) */}
      <div className="w-full bg-surface-container-low px-6 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md border border-white/5 font-mono text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
            </span>
            <span className="text-on-surface uppercase tracking-wider font-bold">Campus Spatial Node Active</span>
          </div>

          <div className="h-4 w-px bg-outline-variant opacity-40 hidden sm:block"></div>

          <div className="flex items-center gap-2 text-on-surface-variant">
            <span>EXCLUDE Predicate:</span>
            <span className="bg-surface-container-highest px-2 py-0.5 rounded text-tertiary font-bold">
              gist(resource_id WITH =, booking_period WITH &&)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant">Constraint Health:</span>
            <span className="text-secondary font-bold">100.00% Zero-Overlap Enforced</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant">Matched Rooms:</span>
            <span className="text-tertiary font-bold">{filteredResources.length}</span>
            <span className="text-on-surface-variant">/ {resources.length}</span>
          </div>
        </div>
      </div>

      {/* Top Command Strip: Search & Filter Matrix */}
      <div className="flex flex-col gap-4 bg-surface-container/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white/5">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-tertiary transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room code (e.g. A101), capacity, projector, Wi-Fi, audio rigs..."
              className="w-full pl-10 pr-24 py-2.5 bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-tertiary transition-all placeholder:text-outline border border-white/5"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                ⌘K / Space
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 font-mono text-xs">
            <button
              onClick={() => { setSearchQuery(''); setSelectedBuilding('all'); setSelectedType('all'); setSelectedStatus('all'); }}
              className="px-3.5 py-2.5 bg-surface-container-high hover:bg-surface-variant text-on-surface rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset Matrix</span>
            </button>

            <button
              onClick={() => onTriggerConflictDemo && onTriggerConflictDemo()}
              className="px-3.5 py-2.5 bg-error-container/40 hover:bg-error-container/60 text-error rounded-xl transition-all flex items-center gap-1.5 border border-error/30 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
              <span>GiST 409 Interceptor Demo</span>
            </button>
          </div>
        </div>

        {/* Filter Matrix Rows */}
        <div className="flex flex-col gap-2.5 font-mono text-xs pt-1 border-t border-white/5">
          
          {/* Row 1: Building Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-outline uppercase text-[10px] tracking-wider w-24 flex-shrink-0">Building</span>
            {buildings.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBuilding(b.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedBuilding === b.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Row 2: Classification */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-outline uppercase text-[10px] tracking-wider w-24 flex-shrink-0">Classification</span>
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === t.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Row 3: Live State */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-outline uppercase text-[10px] tracking-wider w-24 flex-shrink-0">Live State</span>
            {statuses.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedStatus === s.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                {s.dot && <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Venue Cards Grid (Stitch Aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const isAvailable = resource.live_status === 'available';
          const isOccupied = resource.live_status === 'occupied';
          const isPending = resource.live_status === 'pending_checkin';
          const isMaintenance = resource.live_status === 'maintenance';

          return (
            <div
              key={resource.resource_id}
              className="group flex flex-col bg-surface-container/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-white/5 hover:border-indigo-500/40 hover:bg-surface-container-high/90 transition-all duration-300 relative"
            >
              {/* Photo Banner */}
              <div className="h-44 w-full relative overflow-hidden bg-surface-container-lowest">
                <img
                  src={resource.image_url}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent"></div>

                {/* Status Badge top-left */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {isAvailable && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 font-mono text-xs flex items-center gap-1.5 shadow-sm border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Available Now</span>
                    </span>
                  )}
                  {isOccupied && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 backdrop-blur-md text-rose-300 font-mono text-xs flex items-center gap-1.5 shadow-sm border border-rose-500/30">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>In Session</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 font-mono text-xs flex items-center gap-1.5 shadow-sm border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>Grace Check-in</span>
                    </span>
                  )}
                  {isMaintenance && (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 backdrop-blur-md text-purple-300 font-mono text-xs flex items-center gap-1.5 shadow-sm border border-purple-500/30">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>Maintenance</span>
                    </span>
                  )}
                </div>

                {/* GiST Lock status top-right */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 rounded font-mono text-xs text-tertiary border border-white/5">
                  <span className="material-symbols-outlined text-[14px]">
                    {isOccupied ? 'lock' : 'lock_open'}
                  </span>
                  <span>{isOccupied ? 'GiST: Range Engaged' : 'GiST: Free'}</span>
                </div>

                {/* Room code & capacity bottom */}
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between font-mono text-xs">
                  <span className="text-on-surface-variant bg-surface-container-lowest/70 px-2 py-0.5 rounded">
                    {resource.building_code}-FL{resource.floor_number}-{resource.room_number || '01'}
                  </span>
                  <span className="text-on-surface font-bold bg-surface-container-lowest/70 px-2 py-0.5 rounded">
                    {resource.capacity} Capacity
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base text-white font-bold group-hover:text-primary transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-1">
                    {resource.building_name}, Floor {resource.floor_number} • {resource.description}
                  </p>
                </div>

                {/* Buffer Monospace Strip */}
                <div className="bg-surface-container-low p-2 rounded-lg flex items-center justify-between font-mono text-xs border border-white/5">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[16px]">clean_hands</span>
                    <span>{resource.buffer_time_minutes || 15}m Sanitization Buffer</span>
                  </div>
                  <span className="text-on-surface-variant text-[11px]">Auto-Appended</span>
                </div>

                {/* Feature Badges */}
                {resource.features && (
                  <div className="flex flex-wrap gap-1.5">
                    {resource.features.map((feat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-mono">
                        {feat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-outline uppercase tracking-wider">Spatial Constraint</span>
                    <span className="font-mono text-xs text-on-surface">
                      {isAvailable ? 'Free now' : isOccupied ? 'Turnover protected' : 'Pending ping'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectResource(resource)}
                    disabled={isMaintenance}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 text-xs"
                  >
                    <span>{isMaintenance ? 'Unavailable' : 'Book Venue'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* PostgreSQL GiST Technical Explanation Banner (From Stitch) */}
      <div className="w-full bg-surface-container-low rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">database</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">PostgreSQL GiST Physical Exclusivity Guarantee</h4>
              <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-mono text-[10px] uppercase font-bold">
                Zero Race-Conditions
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 max-w-4xl">
              Our scheduling subsystem relies on PostgreSQL <span className="text-tertiary font-mono">btree_gist</span> constraints. Even during microsecond-level concurrent submissions from 5,000+ students, the transactional lock executes atomicity checks without application-layer race window vulnerabilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 font-mono text-xs">
          <span className="bg-surface-container-highest px-3 py-1.5 rounded-lg text-on-surface font-mono border border-white/5">
            Index: btree_gist(resource_id, tsrange)
          </span>
        </div>
      </div>

    </div>
  );
};
