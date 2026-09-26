import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

export const BookingModal = ({ 
  resource, 
  initialStartTime, 
  initialEndTime, 
  isOpen, 
  onClose, 
  onBookingSuccess,
  currentRole = 'faculty',
  forceConflictState = false
}) => {
  const [formData, setFormData] = useState({
    title: 'Annual ACM ICPC Hackathon Briefing',
    purpose: 'Competitive Programming Guild Hackathon',
    startTime: '',
    endTime: '',
    attendeeCount: 42
  });

  const [loading, setLoading] = useState(false);
  const [conflictState, setConflictState] = useState(null);
  const [successState, setSuccessState] = useState(null);

  useEffect(() => {
    if (isOpen && resource) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatLocalIso = (d) => {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      // If force conflict is requested or default
      let start, end;
      if (forceConflictState) {
        // Today 10:30 to 11:30 clashing with Database Workshop
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30, 0);
      } else {
        start = initialStartTime ? new Date(initialStartTime) : new Date(now.setMinutes(0, 0, 0) + 3600000);
        end = initialEndTime ? new Date(initialEndTime) : new Date(start.getTime() + 7200000);
      }

      setFormData({
        title: 'Annual ACM ICPC Hackathon Briefing',
        purpose: 'Competitive Programming Guild Hackathon',
        startTime: formatLocalIso(start),
        endTime: formatLocalIso(end),
        attendeeCount: Math.min(resource.capacity || 50, 42)
      });

      if (forceConflictState) {
        setConflictState({
          message: 'PostgreSQL Exclusion Constraint [no_overlapping_active_bookings] triggered! The requested slot overlaps with an active booking and its mandatory 15m turnover sanitization buffer.',
          conflictingBooking: {
            title: 'Database Workshop: SQL & Transactions',
            start_time: '10:00 AM',
            end_time: '12:00 PM'
          },
          suggestions: [
            { label: 'Slot 1: Post-Buffer', time: '12:15 - 14:15', desc: 'Immediate resolution after deep clean' },
            { label: 'Slot 2: Extended Lab', time: '14:30 - 16:30', desc: 'Zero conflicting sessions till evening' },
            { label: 'Slot 3: Switch Venue', time: '10:30 - 12:30 (Auditorium)', desc: 'Same original window in AUD-01' }
          ]
        });
      } else {
        setConflictState(null);
      }
      setSuccessState(null);
    }
  }, [isOpen, resource, initialStartTime, initialEndTime, forceConflictState]);

  if (!isOpen || !resource) return null;

  const handleApplyRecommendation = (rec) => {
    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const formatLocalIso = (h, m) => {
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(h)}:${pad(m)}`;
    };

    if (rec.label.includes('Slot 1')) {
      setFormData(prev => ({
        ...prev,
        startTime: formatLocalIso(12, 15),
        endTime: formatLocalIso(14, 15)
      }));
    } else if (rec.label.includes('Slot 2')) {
      setFormData(prev => ({
        ...prev,
        startTime: formatLocalIso(14, 30),
        endTime: formatLocalIso(16, 30)
      }));
    }
    setConflictState(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setConflictState(null);
    setSuccessState(null);

    try {
      const response = await axios.post(
        `${API_BASE}/bookings`,
        {
          resource_id: resource.resource_id,
          title: formData.title,
          purpose: formData.purpose,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          attendeeCount: formData.attendeeCount
        },
        {
          headers: {
            Authorization: `Bearer ${currentRole}`,
            'x-demo-role': currentRole
          }
        }
      );

      setSuccessState(`Reservation Confirmed! PostgreSQL GiST lock acquired (#${response.data.booking.booking_id.slice(0, 8)}).`);
      setTimeout(() => {
        if (onBookingSuccess) onBookingSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      if (err.response && err.response.status === 409) {
        setConflictState({
          message: err.response.data.message || 'PostgreSQL Exclusion Constraint triggered: Slot is unavailable.',
          conflictingBooking: err.response.data.conflictingBooking,
          suggestions: err.response.data.suggestions?.alternativeSlots || [
            { label: 'Slot 1: Post-Buffer', time: '12:15 - 14:15', desc: 'Immediate resolution after buffer window' },
            { label: 'Slot 2: Evening Session', time: '16:00 - 18:00', desc: 'Zero collisions until night' }
          ]
        });
      } else {
        alert(err.response?.data?.message || 'Server error processing transaction.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-surface-container-low rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(99,102,241,0.2)] overflow-hidden border border-white/10">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-container flex items-center justify-between flex-shrink-0 border-b border-white/5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_add_on</span>
              <h2 className="text-base font-bold text-white">{resource.name}</h2>
            </div>
            <span className="font-mono text-xs text-tertiary">
              Node Key: {resource.building_code || 'CAMPUS'}-{resource.room_number || 'N/A'} // GiST Spatio-Temporal Domain
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* SUCCESS BANNER */}
          {successState && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span className="font-bold text-sm">{successState}</span>
            </div>
          )}

          {/* GIST CONFLICT NOTICE BANNER (HTTP 409 Interceptor) */}
          {conflictState && (
            <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 shadow-inner flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-error uppercase tracking-wider">
                      HTTP 409 CONFLICT DETECTED
                    </span>
                    <span className="font-mono text-[10px] bg-error-container/40 text-on-error-container px-2 py-0.5 rounded">
                      GiST Exclusion Lock Violated
                    </span>
                  </div>
                  <p className="text-xs text-white mt-1">
                    {conflictState.message}
                  </p>
                </div>
              </div>

              {/* Conflict Visual Overlap Timeline Diagram (From Stitch) */}
              <div className="bg-surface-container-lowest/80 p-3 rounded-lg flex flex-col gap-2 border border-white/5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-on-surface-variant">Spatio-Temporal Boundary Overlap Trace</span>
                  <span className="text-error font-mono">Overlap: 30m direct + 15m buffer collision</span>
                </div>

                {/* Overlap Bar Visualization */}
                <div className="relative h-12 w-full bg-surface-container rounded-lg overflow-hidden flex items-center">
                  {/* Booked Segment */}
                  <div className="h-full bg-rose-950/70 text-rose-300 font-mono text-xs flex items-center justify-center px-2 z-10 w-[45%]">
                    <span className="truncate">Database Workshop (10:00 - 12:00)</span>
                  </div>
                  {/* 15m Buffer Striped */}
                  <div className="h-full bg-indigo-950/80 text-secondary font-mono text-xs flex items-center justify-center px-2 z-10 w-[15%] relative overflow-hidden buffer-stripe">
                    <span className="truncate text-[10px] uppercase font-bold tracking-wider">Buffer (15m)</span>
                  </div>
                  {/* Free Segment */}
                  <div className="h-full bg-surface-container-low text-tertiary font-mono text-xs flex items-center justify-center px-2 w-[40%]">
                    <span className="truncate text-[11px]">Free Node (12:15 &gt;)</span>
                  </div>
                  {/* Overlapping Intent Bar Marker */}
                  <div className="absolute top-1 bottom-1 left-[32%] w-[45%] bg-error/25 rounded z-20 flex items-center justify-center border border-error/60 shadow-lg">
                    <span className="font-mono text-[10px] text-error font-bold uppercase tracking-wider">
                      Requested Slot [Violates GiST]
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                  <span>10:00 AM</span>
                  <span className="text-error font-bold">10:30 AM (Requested)</span>
                  <span className="text-secondary font-bold">12:00 PM (Buffer Start)</span>
                  <span className="text-tertiary font-bold">12:15 PM (Safe)</span>
                  <span>02:00 PM</span>
                </div>
              </div>

              {/* Conflict Engine Recommendations (1-Click Auto-Resolve) */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-tertiary flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                  <span>GiST Autonomous Remediation Suggestions (1-Click Auto-Resolve):</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyRecommendation({ label: 'Slot 1: Post-Buffer' })}
                    className="text-left p-2.5 rounded-lg bg-surface-container-high hover:bg-tertiary/20 transition-all flex flex-col gap-1 border border-white/5 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-tertiary font-bold">⚡ Slot 1: Post-Buffer</span>
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    </div>
                    <span className="text-xs text-white font-mono">12:15 - 14:15</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">Immediate resolution after deep clean</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyRecommendation({ label: 'Slot 2: Extended Lab' })}
                    className="text-left p-2.5 rounded-lg bg-surface-container-high hover:bg-tertiary/20 transition-all flex flex-col gap-1 border border-white/5 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-tertiary font-bold">⚡ Slot 2: Afternoon Lab</span>
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    </div>
                    <span className="text-xs text-white font-mono">14:30 - 16:30</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">Zero conflicting sessions till evening</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyRecommendation({ label: 'Slot 1: Post-Buffer' })}
                    className="text-left p-2.5 rounded-lg bg-surface-container-high hover:bg-secondary/20 transition-all flex flex-col gap-1 border border-white/5 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-secondary font-bold">⚡ Slot 3: Auto-Fit</span>
                      <span className="material-symbols-outlined text-[16px] text-secondary">swap_horiz</span>
                    </div>
                    <span className="text-xs text-white font-mono">Safe Next Free Window</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">Automatically snaps to open slot</span>
                  </button>
                </div>
              </div>

              {/* Database Exception Trace Log */}
              <div className="bg-surface-container-lowest p-3 rounded-lg font-mono text-xs text-on-surface-variant flex flex-col gap-1 border border-white/5">
                <div className="flex items-center justify-between text-outline">
                  <span>Database Exception Trace Log:</span>
                  <span className="text-error font-mono">SQLSTATE[23P01]: exclusion_violation</span>
                </div>
                <p className="font-mono text-[11px] text-on-surface-variant break-all">
                  ERROR: conflicting key value violates exclusion constraint "no_overlapping_active_bookings"<br />
                  DETAIL: Key (resource_id, booking_period)=({resource.resource_id.slice(0, 8)}..., ["{formData.startTime}","{formData.endTime}")) conflicts with existing key.
                </p>
              </div>

            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  Event / Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-3.5 py-2.5 bg-surface-container text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-tertiary border border-white/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                    Requested Time Window *
                  </label>
                  <span className="font-mono text-[10px] text-secondary">Enforces {resource.buffer_time_minutes || 15}m Buffer</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="px-2.5 py-2 bg-surface-container text-white font-mono text-xs rounded-lg border border-white/10"
                  />
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="px-2.5 py-2 bg-surface-container text-white font-mono text-xs rounded-lg border border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  Academic Purpose / Justification
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="px-3.5 py-2.5 bg-surface-container text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-tertiary cursor-pointer border border-white/10"
                >
                  <option>Competitive Programming Guild Hackathon</option>
                  <option>Credit Course Lecture / Lab Demonstration</option>
                  <option>Faculty Research Syndicate Meeting</option>
                  <option>External Keynote & Industry Partnership</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                    Attendee Headcount
                  </label>
                  <span className="font-mono text-[10px] text-tertiary">Max Cap: {resource.capacity}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={resource.capacity || 250}
                  value={formData.attendeeCount}
                  onChange={(e) => setFormData({ ...formData, attendeeCount: parseInt(e.target.value, 10) })}
                  className="px-3.5 py-2.5 bg-surface-container text-white font-mono text-sm rounded-lg border border-white/10"
                />
              </div>
            </div>

            {/* Checklist Matrix */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Resource Allocation Checklist
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-white/5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span className="text-white">Laser Projector</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-white/5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span className="text-white">Wi-Fi 6 Uplink</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-white/5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span className="text-white">Lectern Mic</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-white/5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary" />
                  <span className="text-white">Auto Session Record</span>
                </label>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
                <span>GiST Isolation Level: SERIALIZABLE</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-mono text-xs transition-colors cursor-pointer"
                >
                  Dismiss
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-lg font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    conflictState
                      ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Evaluating GiST Locks...</span>
                    </>
                  ) : (
                    <span>{conflictState ? 'Re-Evaluate Conflict Slot' : 'Confirm GiST Lock Booking'}</span>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
