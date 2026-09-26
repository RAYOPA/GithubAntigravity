import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Navbar } from './components/Navbar';
import { ResourceCatalog } from './components/ResourceCatalog';
import { TimelineGrid } from './components/TimelineGrid';
import { LiveFloorPlan } from './components/LiveFloorPlan';
import { LiveDemoLab } from './components/LiveDemoLab';
import { MyBookings } from './components/MyBookings';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BookingModal } from './components/BookingModal';
import { Sparkles, X } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

export function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [currentRole, setCurrentRole] = useState('faculty');
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResource, setModalResource] = useState(null);
  const [modalSlot, setModalSlot] = useState({ startTime: null, endTime: null });
  const [forceConflict, setForceConflict] = useState(false);

  // WebSocket State
  const [isConnected, setIsConnected] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [resResponse, bkgResponse] = await Promise.all([
        axios.get(`${API_BASE}/resources`),
        axios.get(`${API_BASE}/bookings`)
      ]);
      setResources(resResponse.data.resources || []);
      setBookings(bkgResponse.data.bookings || []);
    } catch (err) {
      console.error('Error fetching campus data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Socket.io real-time listener
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Smart Campus WebSocket Server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from Smart Campus WebSocket Server');
      setIsConnected(false);
    });

    // Real-time Event Handlers
    socket.on('booking_created', (data) => {
      showToast({
        title: 'New Reservation Confirmed',
        message: data.message || `Booked: ${data.booking?.title}`,
        type: 'success'
      });
      fetchData();
    });

    socket.on('booking_checked_in', (data) => {
      showToast({
        title: 'QR Sensor Attendance Logged',
        message: data.message,
        type: 'info'
      });
      fetchData();
    });

    socket.on('booking_cancelled', (data) => {
      showToast({
        title: 'Space Released',
        message: data.message,
        type: 'warning'
      });
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const showToast = (toast) => {
    setToastNotification(toast);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Open booking modal for a resource
  const handleOpenBooking = (resource, startTime = null, endTime = null, isConflictDemo = false) => {
    setModalResource(resource);
    setModalSlot({ startTime, endTime });
    setForceConflict(isConflictDemo);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-on-surface antialiased">
      
      {/* Fixed Cyber-Campus Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isConnected={isConnected}
        totalBookings={bookings.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-24 pb-8 max-w-[1920px] mx-auto px-6">
        
        {activeTab === 'catalog' && (
          <ResourceCatalog
            resources={resources}
            onSelectResource={(res) => handleOpenBooking(res, null, null, false)}
            onTriggerConflictDemo={() => {
              const target = resources[0] || {
                resource_id: 'd0000000-0000-0000-0000-000000000001',
                name: 'Room A101 (Smart Classroom)',
                room_number: 'A101',
                building_code: 'MAB',
                capacity: 60,
                buffer_time_minutes: 15
              };
              handleOpenBooking(target, null, null, true);
            }}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineGrid
            resources={resources}
            bookings={bookings}
            onSelectSlot={(res, start, end) => handleOpenBooking(res, start, end, false)}
          />
        )}

        {activeTab === 'floormap' && (
          <LiveFloorPlan
            resources={resources}
            onSelectResource={(res) => handleOpenBooking(res, null, null, false)}
          />
        )}

        {activeTab === 'demolab' && (
          <LiveDemoLab
            resources={resources}
            onReloadData={fetchData}
          />
        )}

        {activeTab === 'bookings' && (
          <MyBookings
            bookings={bookings}
            onReloadData={fetchData}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

      </main>

      {/* Stitch Architectural Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-indigo-500/10 py-5">
        <div className="w-full px-6 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span>Campus GiST Spatio-Temporal Constraint Kernel</span>
            <span className="text-outline-variant">//</span>
            <span className="text-tertiary">PostgreSQL EXCLUDE USING gist (resource_id WITH =, booking_period WITH &&)</span>
          </div>
          <div>© 2026 Smart Campus Orchestration Network. Autonomous System Node.</div>
        </div>
      </footer>

      {/* Real-time WebSocket Toast Popup */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-surface-container/95 border border-indigo-500/40 p-4 rounded-xl shadow-2xl backdrop-blur-xl max-w-sm flex items-start gap-3 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-white flex items-center justify-between">
                <span>{toastNotification.title}</span>
                <span className="text-[10px] text-tertiary font-mono">LIVE PUSH</span>
              </div>
              <p className="text-on-surface-variant mt-0.5">{toastNotification.message}</p>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal with GiST Conflict Interceptor */}
      <BookingModal
        isOpen={modalOpen}
        resource={modalResource}
        initialStartTime={modalSlot.startTime}
        initialEndTime={modalSlot.endTime}
        forceConflictState={forceConflict}
        onClose={() => setModalOpen(false)}
        onBookingSuccess={() => fetchData()}
        currentRole={currentRole}
      />

    </div>
  );
}

export default App;
