const express = require('express');
const router = express.Router();
const { memoryStore, pool } = require('../config/db');
const { broadcastEvent } = require('../services/socketService');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/v1/simulate/concurrency
 * Live Demo Step 1: Concurrency Collision Test
 * Fires two simultaneous booking transactions into the conflict engine at the exact same millisecond.
 */
router.post('/concurrency', async (req, res) => {
  const { resource_id, startTime, endTime, titleA, titleB } = req.body;
  const targetResourceId = resource_id || 'd0000000-0000-0000-0000-000000000002'; // Computer Lab 1

  // Use a future slot for the demo if not specified
  const now = new Date();
  const testStart = startTime || new Date(now.getTime() + 2 * 3600000).toISOString();
  const testEnd = endTime || new Date(now.getTime() + 4 * 3600000).toISOString();

  const reqA = {
    resource_id: targetResourceId,
    title: titleA || 'Tab 1: AI Workshop by Faculty',
    startTime: testStart,
    endTime: testEnd,
    user: { id: '22222222-2222-2222-2222-222222222222', name: 'Dr. Priya Menon', email: 'faculty@college.edu' }
  };

  const reqB = {
    resource_id: targetResourceId,
    title: titleB || 'Tab 2: Hackathon Team Sync by Student',
    startTime: testStart,
    endTime: testEnd,
    user: { id: '11111111-1111-1111-1111-111111111111', name: 'Aarav Sharma', email: 'student@college.edu' }
  };

  // Helper function to execute atomic transaction through the engine
  async function executeBookingTransaction(reqData) {
    const client = await pool.connect();
    const startTimeMs = Date.now();
    try {
      await client.query('BEGIN');

      const resourceRes = await client.query(
        'SELECT buffer_time_minutes, status, name FROM resources WHERE resource_id = $1 FOR SHARE',
        [reqData.resource_id]
      );
      const bufferMinutes = resourceRes.rows[0]?.buffer_time_minutes || 15;
      const resourceName = resourceRes.rows[0]?.name || 'Lab Room';

      const bufferedStart = new Date(new Date(reqData.startTime).getTime() - bufferMinutes * 60000).toISOString();
      const bufferedEnd = new Date(new Date(reqData.endTime).getTime() + bufferMinutes * 60000).toISOString();

      // Row lock query
      const conflictResult = await client.query(
        `SELECT booking_id, title, start_time, end_time FROM bookings 
         WHERE resource_id = $1 AND status IN ('approved', 'pending', 'checked_in') 
           AND start_time < $3 AND end_time > $2 FOR UPDATE;`,
        [reqData.resource_id, bufferedStart, bufferedEnd]
      );

      if (conflictResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return {
          status: 409,
          result: 'CONFLICT',
          elapsedMs: Date.now() - startTimeMs,
          message: `409 Conflict: Clashes with '${conflictResult.rows[0].title}'`,
          conflictingBooking: conflictResult.rows[0]
        };
      }

      const insertRes = await client.query(
        `INSERT INTO bookings (resource_id, requested_by, title, purpose, start_time, end_time, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'approved') RETURNING *;`,
        [reqData.resource_id, reqData.user.id, reqData.title, 'Concurrent stress demo', reqData.startTime, reqData.endTime]
      );

      await client.query('COMMIT');

      const created = {
        ...insertRes.rows[0],
        resource_name: resourceName,
        requester_name: reqData.user.name
      };

      broadcastEvent('booking_created', {
        message: `Concurrency Test: Booking confirmed for ${resourceName}`,
        booking: created
      });

      return {
        status: 201,
        result: 'SUCCESS',
        elapsedMs: Date.now() - startTimeMs,
        booking: created
      };
    } catch (err) {
      await client.query('ROLLBACK');
      return {
        status: err.code === '23P01' ? 409 : 500,
        result: 'ERROR_EXCLUSION_VIOLATION',
        elapsedMs: Date.now() - startTimeMs,
        message: err.message
      };
    } finally {
      client.release();
    }
  }

  // Launch both requests simultaneously via Promise.all
  const [outcomeTab1, outcomeTab2] = await Promise.all([
    executeBookingTransaction(reqA),
    executeBookingTransaction(reqB)
  ]);

  res.json({
    success: true,
    testSummary: 'Executed simultaneous transactions on identical resource and time interval.',
    resourceId: targetResourceId,
    requestedWindow: { startTime: testStart, endTime: testEnd },
    tab1: outcomeTab1,
    tab2: outcomeTab2
  });
});

/**
 * POST /api/v1/simulate/ghost-booking
 * Creates a demo booking ready for ghost-release testing
 */
router.post('/ghost-booking', (req, res) => {
  const resource = memoryStore.resources[0]; // Room A101
  const now = new Date();
  
  // Set start time 16 minutes in the past
  const pastStart = new Date(now.getTime() - 16 * 60000);
  const pastEnd = new Date(now.getTime() + 45 * 60000);

  const ghostBooking = {
    booking_id: uuidv4(),
    resource_id: resource.resource_id,
    requested_by: '11111111-1111-1111-1111-111111111111',
    requester_name: 'Aarav Sharma (Student)',
    requester_email: 'student@college.edu',
    title: 'Ghost Booking: Unattended Study Session',
    purpose: 'Reserved space without physically checking in via QR sensor',
    department: 'Computer Science',
    attendees_count: 5,
    start_time: pastStart.toISOString(),
    end_time: pastEnd.toISOString(),
    status: 'approved',
    created_at: new Date(pastStart.getTime() - 3600000).toISOString()
  };

  memoryStore.bookings.unshift(ghostBooking);

  broadcastEvent('booking_created', {
    message: `Ghost reservation created for live demo: ${ghostBooking.title}`,
    booking: ghostBooking
  });

  res.json({
    success: true,
    message: 'Ghost booking created with start time >15m in the past and no check-in.',
    booking: ghostBooking
  });
});

/**
 * POST /api/v1/simulate/ghost-release
 * Live Demo Step 3: IoT Sensor / Cron Worker Simulation
 * Scans for approved bookings where start_time < now() - 15 minutes and no check-in exists.
 * Automatically marks them as 'no_show', releases room, and broadcasts via WebSockets.
 */
router.post('/ghost-release', (req, res) => {
  const now = new Date();
  const thresholdMs = 15 * 60000; // 15-minute grace period
  const cutoffTime = new Date(now.getTime() - thresholdMs);

  const releasedBookings = [];

  memoryStore.bookings.forEach(b => {
    if (b.status.toLowerCase() === 'approved') {
      const startTime = new Date(b.start_time);
      const hasCheckedIn = memoryStore.checkins.some(c => c.booking_id === b.booking_id);

      // Check if start time is past grace period without checkin
      if (startTime < cutoffTime && !hasCheckedIn) {
        b.status = 'no_show';
        b.cancellation_reason = 'Automated IoT release: No check-in detected within 15 minutes grace window.';
        b.updated_at = now.toISOString();

        releasedBookings.push({
          booking_id: b.booking_id,
          title: b.title,
          resource_id: b.resource_id,
          start_time: b.start_time
        });

        // Broadcast real-time slot release
        broadcastEvent('booking_cancelled', {
          message: `🚨 IoT Ghost-Booking Released: Slot for "${b.title}" freed due to no-show.`,
          bookingId: b.booking_id,
          resourceId: b.resource_id,
          status: 'no_show',
          reason: 'No check-in detected within 15 minutes'
        });
      }
    }
  });

  res.json({
    success: true,
    releasedCount: releasedBookings.length,
    releasedBookings,
    message: releasedBookings.length > 0
      ? `Successfully auto-cancelled ${releasedBookings.length} ghost booking(s) and released campus spaces.`
      : 'No overdue un-checked reservations detected at this timestamp.'
  });
});

module.exports = router;
