# 🏫 Smart Campus Resource Management & Conflict Detection System

An enterprise-grade, real-time campus resource reservation engine engineered for hackathon presentations. Powered by **PostgreSQL GiST Exclusion Constraints (`btree_gist`)**, **atomic transactional row locks (`FOR UPDATE`)**, **dynamic setup/cleaning buffers**, and **real-time WebSocket state synchronization**.

---

## 🏗️ Architecture & Blueprint

```
                  ┌─────────────────────────────────┐
                  │   User Request (Web / Mobile)   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │    JWT & RBAC Middleware        │
                  │   (Student, Faculty, Admin)     │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
            ┌──────────────────────────────────────────────┐
            │   Conflict Engine & Buffer Time Evaluator    │
            └──────┬────────────────────────────────┬──────┘
                   │                                │
      [ Conflict Detected ]                 [ Slot Available ]
                   │                                │
                   ▼                                ▼
    ┌─────────────────────────────┐   ┌─────────────────────────────┐
    │  Return 409 Conflict Error  │   │  Acquire Transaction Lock   │
    │  + Offer Alternative Slots  │   │  (SELECT ... FOR UPDATE)    │
    └─────────────────────────────┘   └──────────────┬──────────────┘
                                                     │
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │  Execute Database Insert    │
                                      │  (PostgreSQL GiST Exclude)  │
                                      └──────────────┬──────────────┘
                                                     │
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │ Broadcast Real-Time Update  │
                                      │ (WebSocket Event to Clients)│
                                      └─────────────────────────────┘
```

---

## 📁 Repository Structure

```text
Fast Hackethon/
├── database/                          # Production PostgreSQL Scripts (Section 40 spec)
│   ├── 01_extensions.sql              # pgcrypto & btree_gist
│   ├── 02_types.sql                   # Custom enums (user_role, booking_status, etc.)
│   ├── 03_tables.sql                  # 14 normalized schema tables
│   ├── 04_constraints.sql             # Critical GiST time-range exclusion constraints
│   ├── 05_indexes.sql                 # Spatial & temporal indexes
│   ├── 06_triggers.sql                # Auto-updating timestamps & audit trails
│   ├── 07_seed_data.sql               # Seed campus data (buildings, rooms, bookings)
│   ├── 08_views.sql                   # booking_details_view
│   ├── 09_reports.sql                 # Utilization, most-used, & no-show views
│   └── setup_db.sql                   # Master runner script
│
├── backend/                           # Node.js Express REST API & Engine
│   ├── config/
│   │   └── db.js                      # Dual-mode engine (PostgreSQL + In-Memory GiST fallback)
│   ├── middleware/
│   │   └── auth.js                    # JWT & RBAC (Student, Faculty, Manager, Admin)
│   ├── services/
│   │   ├── conflictEngine.js          # Temporal buffer evaluator & alternative slot picker
│   │   └── socketService.js           # Real-time WebSocket event broadcaster
│   ├── routes/
│   │   ├── bookings.js                # Atomic POST /api/v1/bookings with 409 handling
│   │   ├── resources.js               # Resource catalog & live timeline endpoints
│   │   ├── analytics.js               # SQL reports API (utilization & no-shows)
│   │   └── simulation.js              # Concurrency stress tests & IoT release endpoints
│   ├── server.js                      # Server entry point
│   └── package.json
│
├── frontend/                          # High-End Dark Mode React / Vite Single-Page App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Tabs, role switcher, live WebSocket status
│   │   │   ├── ResourceCatalog.jsx    # Live badges, filters, search & venue cards
│   │   │   ├── TimelineGrid.jsx       # 08:00-20:00 schedule with cleaning buffer stripes
│   │   │   ├── BookingModal.jsx       # SmartBookingForm with 409 conflict suggestions
│   │   │   ├── LiveFloorPlan.jsx      # Architectural SVG floor plan (Green/Red/Yellow)
│   │   │   ├── LiveDemoLab.jsx        # Concurrency, Buffer & IoT simulation suites
│   │   │   ├── MyBookings.jsx         # Reservation management & QR check-in
│   │   │   └── AnalyticsDashboard.jsx # SQL utilization & no-show visual analytics
│   │   ├── App.jsx                    # Root state & WebSocket integration
│   │   ├── index.css                  # Cyber-campus dark glassmorphism design system
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── package.json                       # Root script orchestrator
```

---

## ⚡ Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start the Backend API (Port 5000)
```bash
npm run dev:backend
```
*Note: The backend automatically connects to PostgreSQL if available, or seamlessly boots into the autonomous transactional memory engine with identical GiST exclusion and buffer logic!*

### 3. Start the Frontend Client (Port 5173)
```bash
npm run dev:frontend
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🛡️ Critical Conflict Prevention Mechanics

### 1. PostgreSQL GiST Exclusion Constraint
PostgreSQL eliminates double-bookings at the storage layer via exclusion constraints over time ranges (`tstzrange`):
```sql
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_active_bookings
EXCLUDE USING GIST (
    resource_id WITH =,
    booking_period WITH &&
)
WHERE (
    status IN ('pending', 'approved', 'checked_in')
);
```
When an overlap is attempted, PostgreSQL returns SQL state code **`23P01`**, which the backend intercepts and maps to **`409 Conflict`**.

### 2. Dynamic Cleaning & Prep Buffers
Every resource specifies a `buffer_time_minutes` (e.g. 15 or 30 minutes). When validating a slot:
```javascript
const bufferedStart = new Date(start.getTime() - bufferMinutes * 60000).toISOString();
const bufferedEnd = new Date(end.getTime() + bufferMinutes * 60000).toISOString();
```
Any booking overlapping with an existing reservation or its maintenance buffer triggers a conflict error and returns alternative non-conflicting time slots.

---

## 🎯 Hackathon Live Demo Walkthrough (Section 5)

Under the **"Live Demo Lab"** tab in the dashboard, present these 3 live scenarios to the judges:

1. **Dual-Tab Concurrency Collision Test:**
   - Click *"Run Dual Concurrency Test"* to fire two simultaneous transactions targeting the exact same venue and time window.
   - Shows **Tab 1 confirms with HTTP 201 Created** after acquiring the row lock.
   - Shows **Tab 2 catches an HTTP 409 Conflict error within milliseconds**, demonstrating strict zero-collision integrity.

2. **Dynamic Cleaning Buffer Visualization:**
   - Room A101 has an active booking until 12:00 PM with a 15-minute buffer.
   - Click *"Trigger Buffer Conflict Test"* to attempt a 12:05 PM booking.
   - The buffer evaluator intercepts the request, blocks the collision, and recommends the next valid post-buffer slot (12:15 PM).

3. **IoT Ghost-Booking Auto-Release:**
   - Click *"Spawn Ghost Booking"* to generate an unattended reservation past the start window.
   - Observe the 15-minute countdown grace period.
   - When no check-in ping is received, the system sets status to `no_show`, releases the room, and broadcasts a live WebSocket notification to free up the space!

---

## 📊 Database Scripts Execution Order (Section 40)

To run the SQL scripts directly in PostgreSQL:
```bash
psql -U postgres -d smart_campus -f database/01_extensions.sql
psql -U postgres -d smart_campus -f database/02_types.sql
psql -U postgres -d smart_campus -f database/03_tables.sql
psql -U postgres -d smart_campus -f database/04_constraints.sql
psql -U postgres -d smart_campus -f database/05_indexes.sql
psql -U postgres -d smart_campus -f database/06_triggers.sql
psql -U postgres -d smart_campus -f database/07_seed_data.sql
psql -U postgres -d smart_campus -f database/08_views.sql
psql -U postgres -d smart_campus -f database/09_reports.sql
```
Or execute the master runner:
```bash
psql -U postgres -d smart_campus -f database/setup_db.sql
```
