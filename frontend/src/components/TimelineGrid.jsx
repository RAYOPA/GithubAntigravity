import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Layers, 
  User, 
  PlusCircle,
  Sparkles
} from 'lucide-react';

export const TimelineGrid = ({ resources = [], bookings = [], onSelectSlot }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Campus operating hours: 08:00 to 20:00 (12 hours)
  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  // Compute horizontal percentage position for a given time on the current date
  const getPositionPercent = (timeStr) => {
    const d = new Date(timeStr);
    const hour = d.getHours() + d.getMinutes() / 60;
    const clampedHour = Math.max(START_HOUR, Math.min(END_HOUR, hour));
    return ((clampedHour - START_HOUR) / TOTAL_HOURS) * 100;
  };

  const handleLaneClick = (e, resource) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    
    const clickedHour = START_HOUR + percent * TOTAL_HOURS;
    const floorHour = Math.floor(clickedHour);
    const minute = clickedHour - floorHour >= 0.5 ? 30 : 0;

    const slotStart = new Date(currentDate);
    slotStart.setHours(floorHour, minute, 0, 0);

    const slotEnd = new Date(slotStart.getTime() + 90 * 60000); // 1.5 hr default duration

    onSelectSlot(resource, slotStart.toISOString(), slotEnd.toISOString());
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-white/10 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            Visual Resource Timeline & Buffer Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Continuous temporal timeline with GiST range constraints and dynamic cleaning buffer zones.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl">
          <button 
            onClick={handlePrevDay}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
          />

          <button 
            onClick={handleNextDay}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-3 text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-600"></span>
          <span>Approved Booking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600"></span>
          <span>Checked-in Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-3 rounded buffer-stripe"></span>
          <span className="text-purple-300 font-medium">Automatic Prep/Cleaning Buffer</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any empty slot to book</span>
        </div>
      </div>

      {/* Timeline Board */}
      <div className="glass-panel overflow-x-auto p-4">
        <div className="min-w-[840px]">
          
          {/* Hour markers row */}
          <div className="grid grid-cols-[180px_1fr] border-b border-white/10 pb-2 mb-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">
              Campus Space
            </div>
            <div className="relative h-6 flex justify-between text-[11px] font-mono text-slate-400">
              {hours.map((h) => (
                <div key={h} className="relative -translate-x-1/2">
                  <span>{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resource timeline rows */}
          <div className="space-y-4">
            {resources.map((resource) => {
              // Find bookings for this resource on the selected date
              const resourceBookings = bookings.filter(b => {
                if (b.resource_id !== resource.resource_id) return false;
                if (['cancelled', 'rejected'].includes(b.status.toLowerCase())) return false;
                const bDate = new Date(b.start_time).toISOString().split('T')[0];
                return bDate === currentDate;
              });

              const bufferMinutes = resource.buffer_time_minutes || 15;

              return (
                <div key={resource.resource_id} className="grid grid-cols-[180px_1fr] items-center gap-3">
                  
                  {/* Resource Info Column */}
                  <div className="pr-2">
                    <div className="text-xs font-bold text-white truncate" title={resource.name}>
                      {resource.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {resource.room_number || 'Room'} • {resource.capacity} seats • {bufferMinutes}m buffer
                    </div>
                  </div>

                  {/* Interactive Schedule Lane */}
                  <div
                    onClick={(e) => handleLaneClick(e, resource)}
                    className="relative h-14 bg-slate-900/90 border border-white/10 rounded-xl overflow-hidden cursor-crosshair group/lane hover:border-indigo-500/40 transition-colors"
                  >
                    {/* Hour grid vertical dividing lines */}
                    {hours.map((h, i) => (
                      <div
                        key={h}
                        style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                        className="absolute top-0 bottom-0 border-l border-white/5 pointer-events-none"
                      />
                    ))}

                    {/* Render Booked Slots & Buffer Zones */}
                    {resourceBookings.map((b) => {
                      const startPercent = getPositionPercent(b.start_time);
                      const endPercent = getPositionPercent(b.end_time);
                      const widthPercent = Math.max(2, endPercent - startPercent);

                      // Buffer percentages
                      const bufferStartPercent = getPositionPercent(
                        new Date(new Date(b.start_time).getTime() - bufferMinutes * 60000).toISOString()
                      );
                      const bufferEndPercent = getPositionPercent(
                        new Date(new Date(b.end_time).getTime() + bufferMinutes * 60000).toISOString()
                      );

                      const preBufferWidth = Math.max(0, startPercent - bufferStartPercent);
                      const postBufferWidth = Math.max(0, bufferEndPercent - endPercent);

                      const isCheckedIn = b.status.toLowerCase() === 'checked_in';

                      return (
                        <React.Fragment key={b.booking_id}>
                          
                          {/* Pre-Booking Buffer Zone */}
                          {preBufferWidth > 0 && (
                            <div
                              style={{
                                left: `${bufferStartPercent}%`,
                                width: `${preBufferWidth}%`
                              }}
                              className="absolute top-0 bottom-0 buffer-stripe z-0 opacity-70 pointer-events-none"
                              title={`${bufferMinutes}m Pre-booking cleaning buffer`}
                            />
                          )}

                          {/* Active Booking Block */}
                          <div
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`
                            }}
                            onClick={(e) => e.stopPropagation()} // don't trigger lane click
                            className={`absolute top-1 bottom-1 rounded-lg px-2 py-1 text-white shadow-md z-10 overflow-hidden flex flex-col justify-between border ${
                              isCheckedIn
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400/40 shadow-emerald-900/30'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-700 border-indigo-400/40 shadow-indigo-900/30'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold leading-tight truncate">
                              <span className="truncate">{b.title}</span>
                              {isCheckedIn && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-200">
                                  Checked In
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-white/80 font-mono">
                              <span>
                                {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="truncate max-w-[80px]">{b.requester_name}</span>
                            </div>
                          </div>

                          {/* Post-Booking Buffer Zone */}
                          {postBufferWidth > 0 && (
                            <div
                              style={{
                                left: `${endPercent}%`,
                                width: `${postBufferWidth}%`
                              }}
                              className="absolute top-0 bottom-0 buffer-stripe z-0 opacity-70 pointer-events-none"
                              title={`${bufferMinutes}m Post-booking teardown buffer`}
                            />
                          )}

                        </React.Fragment>
                      );
                    })}

                    {/* Hint overlay on lane hover */}
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/lane:opacity-100 transition-opacity pointer-events-none flex items-center justify-end pr-3">
                      <span className="text-[10px] font-semibold text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded border border-indigo-500/20">
                        + Click to reserve slot
                      </span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};
