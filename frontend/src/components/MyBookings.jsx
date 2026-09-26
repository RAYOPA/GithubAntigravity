import React, { useState } from 'react';
import axios from 'axios';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Building2, 
  AlertCircle,
  ShieldCheck,
  User
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export const MyBookings = ({ bookings = [], onReloadData, currentRole }) => {
  const [selectedBookingForQr, setSelectedBookingForQr] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleCheckin = async (bookingId) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/bookings/${bookingId}/checkin`, {
        checkinMethod: 'qr_code'
      });
      setMessage({ type: 'success', text: 'Checked in successfully! Room marked as Occupied.' });
      setSelectedBookingForQr(null);
      if (onReloadData) onReloadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to process check-in.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking and release the slot?')) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by user from dashboard'
      });
      setMessage({ type: 'info', text: 'Booking cancelled. Time slot released for campus community.' });
      if (onReloadData) onReloadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel booking.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'checked_in':
        return <span className="status-badge available"><span className="status-dot"></span>Checked In</span>;
      case 'approved':
        return <span className="status-badge pending_checkin"><span className="status-dot"></span>Confirmed</span>;
      case 'no_show':
        return <span className="status-badge occupied"><span className="status-dot"></span>No Show (Released)</span>;
      case 'cancelled':
        return <span className="status-badge occupied"><span className="status-dot"></span>Cancelled</span>;
      default:
        return <span className="status-badge available">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-white/10 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" />
            Campus Reservations & QR Attendance Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Check-in to avoid automatic 15-minute no-show releases, or cancel to free up resources.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong>{bookings.length}</strong> Total Records
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : message.type === 'info'
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-3.5">
        {bookings.map((b) => {
          const isCheckinAvailable = b.status.toLowerCase() === 'approved';
          const isCheckedIn = b.status.toLowerCase() === 'checked_in';
          const isCancelled = ['cancelled', 'no_show'].includes(b.status.toLowerCase());

          return (
            <div
              key={b.booking_id}
              className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{b.title}</h3>
                  {getStatusBadge(b.status)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{b.resource_name} ({b.room_number || 'Room'})</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.requester_name || 'Academic User'}</span>
                  </div>
                </div>

                {b.purpose && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {b.purpose}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isCheckinAvailable && (
                  <>
                    <button
                      onClick={() => setSelectedBookingForQr(b)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR Check-In</span>
                    </button>

                    <button
                      onClick={() => handleCancel(b.booking_id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {isCheckedIn && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Attendance</span>
                  </div>
                )}

                {isCancelled && (
                  <span className="text-xs text-slate-500 italic">
                    Slot Released to Campus
                  </span>
                )}
              </div>

            </div>
          );
        })}

        {bookings.length === 0 && (
          <div className="p-12 text-center glass-panel">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No bookings on record yet. Reserve a venue from the catalog!</p>
          </div>
        )}
      </div>

      {/* QR Check-in Modal */}
      {selectedBookingForQr && (
        <div className="modal-backdrop">
          <div className="modal-content relative w-full max-w-sm bg-slate-900 border border-indigo-500/40 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white">QR Sensor Attendance</span>
              <button 
                onClick={() => setSelectedBookingForQr(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{selectedBookingForQr.title}</h4>
              <p className="text-xs text-slate-400">{selectedBookingForQr.resource_name}</p>
            </div>

            {/* Stylized QR Code Graphic */}
            <div className="p-4 bg-white rounded-xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  JSON.stringify({
                    bookingId: selectedBookingForQr.booking_id,
                    venue: selectedBookingForQr.resource_name,
                    timestamp: Date.now()
                  })
                )}`}
                alt="QR Code"
                className="w-40 h-40"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Scan with mobile or tap button below to simulate physical door-scanner ping.
            </p>

            <button
              onClick={() => handleCheckin(selectedBookingForQr.booking_id)}
              disabled={actionLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Physical Sensor Scan</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
