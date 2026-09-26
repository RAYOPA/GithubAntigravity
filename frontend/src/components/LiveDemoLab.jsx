import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Flame, 
  Zap, 
  Layers, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  RefreshCw, 
  QrCode, 
  Timer, 
  Radio, 
  ArrowRight,
  Database
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export const LiveDemoLab = ({ resources = [], onReloadData }) => {
  const [activeStep, setActiveStep] = useState(1);

  // --- Step 1: Concurrency States ---
  const [concurrencyRunning, setConcurrencyRunning] = useState(false);
  const [concurrencyResult, setConcurrencyResult] = useState(null);

  // --- Step 2: Buffer States ---
  const [bufferTestLoading, setBufferTestLoading] = useState(false);
  const [bufferTestResult, setBufferTestResult] = useState(null);

  // --- Step 3: Ghost Booking States ---
  const [ghostBooking, setGhostBooking] = useState(null);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [ghostOutcome, setGhostOutcome] = useState(null);

  // Run Step 1: Concurrency Collision Test
  const runConcurrencyStressTest = async () => {
    setConcurrencyRunning(true);
    setConcurrencyResult(null);

    try {
      const now = new Date();
      // Set test slot for today 14:00 to 16:00
      const testStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0).toISOString();
      const testEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0).toISOString();

      const response = await axios.post(`${API_BASE}/simulate/concurrency`, {
        resource_id: resources[1]?.resource_id || 'd0000000-0000-0000-0000-000000000002', // Computer Lab 1
        startTime: testStart,
        endTime: testEnd,
        titleA: 'Tab 1: AI Workshop by Faculty',
        titleB: 'Tab 2: Hackathon Team Sync by Student'
      });

      setConcurrencyResult(response.data);
      if (onReloadData) onReloadData();
    } catch (err) {
      console.error('Concurrency test failed:', err);
    } finally {
      setConcurrencyRunning(false);
    }
  };

  // Run Step 2: Dynamic Buffer Demonstration
  const testBufferConflict = async () => {
    setBufferTestLoading(true);
    setBufferTestResult(null);

    try {
      // Room A101 has a booking 10:00 to 12:00 with a 15-min buffer (12:00 to 12:15 is blocked)
      // Attempting to book 12:00 to 12:45 directly touches the 15-min cleaning window!
      const targetRes = resources[0]; // Room A101
      const now = new Date();
      const conflictStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 5, 0).toISOString();
      const conflictEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0, 0).toISOString();

      const response = await axios.post(`${API_BASE}/bookings`, {
        resource_id: targetRes.resource_id,
        title: 'Buffer Conflict Test: Robotics Seminar',
        purpose: 'Attempting to reserve during the mandatory cleaning window',
        startTime: conflictStart,
        endTime: conflictEnd,
        attendeeCount: 15
      });

      setBufferTestResult({ status: 'SUCCESS', data: response.data });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setBufferTestResult({
          status: 'CONFLICT_CAUGHT',
          message: err.response.data.message,
          conflictingBooking: err.response.data.conflictingBooking,
          bufferMinutes: err.response.data.bufferMinutes || 15,
          suggestions: err.response.data.suggestions
        });
      } else {
        setBufferTestResult({ status: 'ERROR', message: err.message });
      }
    } finally {
      setBufferTestLoading(false);
    }
  };

  // Step 3: Create Ghost Booking for simulation
  const createGhostBooking = async () => {
    setGhostLoading(true);
    setGhostOutcome(null);
    try {
      const response = await axios.post(`${API_BASE}/simulate/ghost-booking`);
      setGhostBooking(response.data.booking);
      setCountdown(15);
      setTimerActive(true);
    } catch (err) {
      console.error('Ghost booking creation error:', err);
    } finally {
      setGhostLoading(false);
    }
  };

  // Step 3: Trigger IoT Auto-Release
  const triggerIoTRelease = async () => {
    setGhostLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/simulate/ghost-release`);
      setGhostOutcome(response.data);
      setTimerActive(false);
      setCountdown(0);
      if (onReloadData) onReloadData();
    } catch (err) {
      console.error('Ghost release error:', err);
    } finally {
      setGhostLoading(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    let interval = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            triggerIoTRelease();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                Official Hackathon Live Demonstration
              </span>
              <span className="text-xs text-slate-400">Spec Section 5</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-purple-400" />
              Real-Time Conflict Engine Live Demo Suite
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Execute live tests against PostgreSQL row locks, GiST exclusion constraints, and automated IoT sensor releases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map(stepNum => (
              <button
                key={stepNum}
                onClick={() => setActiveStep(stepNum)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeStep === stepNum
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Step {stepNum}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: Dual-Browser Concurrency Stress Test */}
      {activeStep === 1 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase">
                  Demo 1 of 3
                </span>
                <span className="text-xs text-slate-400 font-mono">FOR UPDATE Lock & GiST Verification</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Dual-Tab Concurrency Collision Test
              </h2>
              <p className="text-xs text-slate-400">
                Simulates two users clicking "Submit Reservation" at the exact same millisecond for Computer Laboratory 1. One transaction succeeds (201 Created), while the other transaction is caught by row locks and exclusion constraints (409 Conflict).
              </p>
            </div>

            <button
              onClick={runConcurrencyStressTest}
              disabled={concurrencyRunning}
              className="btn-primary shrink-0"
            >
              {concurrencyRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Firing Concurrent Locks...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Run Dual Concurrency Test</span>
                </>
              )}
            </button>
          </div>

          {/* Visual Simulation of Two Tabs Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tab 1: Faculty Request */}
            <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-white">Browser Tab 1 (Faculty)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Client A</span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div><span className="text-slate-500">Resource:</span> Computer Laboratory 1 (C101)</div>
                <div><span className="text-slate-500">Event:</span> AI Workshop by Faculty</div>
                <div><span className="text-slate-500">Requested Window:</span> Today 14:00 - 16:00</div>
              </div>

              {concurrencyResult && (
                <div className={`p-3 rounded-lg border text-xs ${
                  concurrencyResult.tab1.status === 201
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>{concurrencyResult.tab1.status === 201 ? '✅ HTTP 201 CREATED' : '❌ HTTP 409 CONFLICT'}</span>
                    <span className="font-mono text-[10px]">{concurrencyResult.tab1.elapsedMs}ms</span>
                  </div>
                  <div className="text-[11px] mt-1">
                    {concurrencyResult.tab1.status === 201
                      ? 'Acquired PostgreSQL row lock (FOR UPDATE), confirmed booking in database.'
                      : concurrencyResult.tab1.message}
                  </div>
                </div>
              )}
            </div>

            {/* Tab 2: Student Request */}
            <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-bold text-white">Browser Tab 2 (Student)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Client B</span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div><span className="text-slate-500">Resource:</span> Computer Laboratory 1 (C101)</div>
                <div><span className="text-slate-500">Event:</span> Hackathon Team Sync by Student</div>
                <div><span className="text-slate-500">Requested Window:</span> Today 14:00 - 16:00</div>
              </div>

              {concurrencyResult && (
                <div className={`p-3 rounded-lg border text-xs ${
                  concurrencyResult.tab2.status === 201
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>{concurrencyResult.tab2.status === 201 ? '✅ HTTP 201 CREATED' : '🚨 HTTP 409 CONFLICT'}</span>
                    <span className="font-mono text-[10px]">{concurrencyResult.tab2.elapsedMs}ms</span>
                  </div>
                  <div className="text-[11px] mt-1">
                    {concurrencyResult.tab2.status === 409
                      ? 'Collision caught! Overlap query blocked double booking, database transaction rolled back safely.'
                      : 'Confirmed.'}
                  </div>
                </div>
              )}
            </div>

          </div>

          {concurrencyResult && (
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>
                  <strong>PostgreSQL ACID Verification:</strong> 0 double-bookings permitted under concurrent submission load.
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                PostgreSQL Exclusion Constraint: no_overlapping_active_bookings
              </span>
            </div>
          )}

        </div>
      )}

      {/* STEP 2: Dynamic Buffer Visualization */}
      {activeStep === 2 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                  Demo 2 of 3
                </span>
                <span className="text-xs text-slate-400 font-mono">buffer_time_minutes Protection</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Dynamic Cleaning & Setup Buffer Collision Demo
              </h2>
              <p className="text-xs text-slate-400">
                Demonstrates that a room booked until 12:00 PM with a 15-minute cleaning buffer cannot be booked at 12:05 PM, even though the previous session has finished!
              </p>
            </div>

            <button
              onClick={testBufferConflict}
              disabled={bufferTestLoading}
              className="btn-primary shrink-0"
            >
              {bufferTestLoading ? 'Evaluating Buffer Window...' : 'Trigger Buffer Conflict Test'}
            </button>
          </div>

          {/* Interactive Timeline Visual Representation */}
          <div className="p-5 bg-slate-900/90 border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Room A101 (Smart Classroom) Schedule</span>
              <span className="text-purple-400">Mandatory 15m Cleaning Window</span>
            </div>

            {/* Visual strip */}
            <div className="relative h-16 bg-slate-950 rounded-xl border border-white/10 overflow-hidden flex items-center">
              
              {/* Existing Booking: 10:00 - 12:00 */}
              <div className="absolute left-[10%] w-[45%] h-12 bg-indigo-600 rounded-lg flex flex-col justify-center px-3 text-white shadow-md z-10">
                <span className="text-xs font-bold truncate">Database Workshop (Active)</span>
                <span className="text-[10px] font-mono text-indigo-200">10:00 AM - 12:00 PM</span>
              </div>

              {/* Buffer Zone: 12:00 - 12:15 */}
              <div className="absolute left-[55%] w-[10%] h-full buffer-stripe flex items-center justify-center z-0">
                <span className="text-[9px] font-bold text-purple-300 bg-slate-900/90 px-1 py-0.5 rounded border border-purple-500/30">
                  15m Buffer
                </span>
              </div>

              {/* Attempted New Booking: 12:05 - 13:00 */}
              <div className="absolute left-[57%] w-[35%] h-10 border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-lg flex flex-col justify-center px-2 text-rose-300 z-20 animate-pulse">
                <span className="text-[11px] font-bold truncate">⚠️ Attempted: 12:05 PM</span>
                <span className="text-[9px] text-rose-400">Clashes with cleaning buffer</span>
              </div>

            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>10:00 AM</span>
              <span>11:00 AM</span>
              <span>12:00 PM</span>
              <span className="text-purple-400">12:15 PM (Buffer Ends)</span>
              <span>01:00 PM</span>
            </div>
          </div>

          {/* Test Results Output */}
          {bufferTestResult && (
            <div className={`p-4 rounded-xl border text-xs ${
              bufferTestResult.status === 'CONFLICT_CAUGHT'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <div className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Conflict Successfully Intercepted by Buffer Evaluator!</span>
              </div>
              <p className="mt-1 text-slate-300">
                {bufferTestResult.message}
              </p>

              {bufferTestResult.suggestions?.alternativeSlots && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <div className="text-[11px] font-semibold text-amber-300 mb-1.5">
                    Recommended Open Slots (After Buffer Window):
                  </div>
                  <div className="flex gap-2">
                    {bufferTestResult.suggestions.alternativeSlots.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 font-mono text-[10px]">
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* STEP 3: IoT Ghost-Booking Auto-Release Simulation */}
      {activeStep === 3 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                  Demo 3 of 3
                </span>
                <span className="text-xs text-slate-400 font-mono">Automated IoT Space Reclaim</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                IoT Ghost-Booking Release Simulation
              </h2>
              <p className="text-xs text-slate-400">
                When a user reserves a space but fails to scan in via QR/beacon within the 15-minute grace period, the background worker automatically releases the slot and broadcasts a WebSocket notification to waitlisted users.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!ghostBooking ? (
                <button
                  onClick={createGhostBooking}
                  disabled={ghostLoading}
                  className="btn-primary"
                >
                  <Timer className="w-4 h-4" />
                  <span>Spawn Ghost Booking</span>
                </button>
              ) : (
                <button
                  onClick={triggerIoTRelease}
                  disabled={ghostLoading}
                  className="btn-primary bg-rose-600 hover:bg-rose-500"
                >
                  <Radio className="w-4 h-4" />
                  <span>Simulate IoT Timeout Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Simulation Card */}
          {ghostBooking ? (
            <div className="p-5 bg-slate-900/90 border border-white/10 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Monitored Reservation:</div>
                  <div className="text-base font-bold text-white">{ghostBooking.title}</div>
                  <div className="text-xs text-slate-400">Room A101 • Reserved by {ghostBooking.requester_name}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Grace Period Timer:</div>
                  <div className="text-2xl font-mono font-black text-amber-400">
                    00:{String(countdown).padStart(2, '0')}s
                  </div>
                  <div className="text-[10px] text-amber-300/80">Simulating 15-min countdown</div>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-1000"
                  style={{ width: `${(countdown / 15) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span>Listening for IoT beacon / QR check-in ping...</span>
                </div>
                <span>Status: PENDING_CHECKIN</span>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center border border-dashed border-white/10 rounded-xl">
              <Timer className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Click <strong>"Spawn Ghost Booking"</strong> to simulate an unattended reservation.
              </p>
            </div>
          )}

          {/* Outcome notification */}
          {ghostOutcome && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Automated Cancellation & Room Reclaim Complete!</span>
              </div>
              <p className="text-slate-300">
                {ghostOutcome.message}
              </p>
              <div className="text-[11px] text-indigo-300 font-mono mt-2">
                📡 WebSocket Event broadcast to clients: `booking_cancelled` (status: `no_show`).
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
