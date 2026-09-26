const express = require('express');
const router = express.Router();
const { pool, memoryStore, isPostgresConnected } = require('../config/db');
const { authenticateUser, requireRoles } = require('../middleware/auth');
const { findAlternativeSlots } = require('../services/conflictEngine');
const { broadcastEvent } = require('../services/socketService');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/v1/bookings
 * Fetch all bookings, optionally filtered by resource, user, or status
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { resource_id, status, date } = req.query;

    let bookings = [];
    if (isPostgresConnected()) {
      let query = `
        SELECT 
          b.booking_id, b.title, b.purpose, b.start_time, b.end_time, b.status, b.created_at,
          r.resource_id, r.name as resource_name, r.room_number,
          bu.name as building_name,
          u.full_name as requester_name, u.email as requester_email
        FROM bookings b
        JOIN resources r ON r.resource_id = b.resource_id
        JOIN buildings bu ON bu.building_id = r.building_id
        JOIN users u ON u.user_id = b.requested_by
        WHERE 1=1
      `;
      const params = [];
      if (resource_id) {
        params.push(resource_id);
        query += ` AND b.resource_id = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND b.status = $${params.length}`;
      }
      query += ` ORDER BY b.start_time DESC LIMIT 100`;
      const result = await pool.query(query, params);
      bookings = result.rows;
    } else {
      bookings = memoryStore.bookings.map(b => {
        const resource = memoryStore.resources.find(r => r.resource_id === b.resource_id);
        const building = resource ? memoryStore.buildings.find(bu => bu.building_id === resource.building_id) : null;
        return {
          ...b,
          resource_name: resource?.name || 'Campus Space',
          room_number: resource?.room_number || '',
          building_name: building?.name || 'Main Campus',
          buffer_time_minutes: resource?.buffer_time_minutes || 15
        };
      });

      if (resource_id) {
        bookings = bookings.filter(b => b.resource_id === resource_id);
      }
      if (status) {
        bookings = bookings.filter(b => b.status.toLowerCase() === status.toLowerCase());
      }
      if (date) {
        bookings = bookings.filter(b => new Date(b.start_time).toDateString() === new Date(date).toDateString());
      }

      bookings.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving bookings.' });
  }
});

/**
 * POST /api/v1/bookings
 * Atomic transaction handling conflict checks, cleaning buffer evaluation, and booking insertion.
 * Direct implementation of Blueprint Specification.
 */
router.post('/', authenticateUser, async (req, res) => {
  const { resource_id, title, purpose, startTime, endTime, attendeeCount } = req.body;
  const userId = req.user?.id || '11111111-1111-1111-1111-111111111111';

  // Time sequence validation
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return res.status(400).json({
      success: false,
      message: 'Invalid temporal range: Start time must precede end time.'
    });
  }

  const client = await pool.connect();

  try {
    // Begin SQL Transaction
    await client.query('BEGIN');

    // 1. Fetch Resource Details & Buffer Requirement
    const resourceRes = await client.query(
      'SELECT buffer_time_minutes, status, name FROM resources WHERE resource_id = $1 FOR SHARE',
      [resource_id]
    );

    if (resourceRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Specified resource not found.' });
    }

    if (resourceRes.rows[0].status === 'maintenance' || resourceRes.rows[0].status === 'MAINTENANCE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Resource is currently undergoing scheduled maintenance.'
      });
    }

    const bufferMinutes = resourceRes.rows[0].buffer_time_minutes || 15;
    const resourceName = resourceRes.rows[0].name || 'Campus Resource';

    // Adjust validation window to account for setup/cleaning buffer times
    const bufferedStart = new Date(start.getTime() - bufferMinutes * 60000).toISOString();
    const bufferedEnd = new Date(end.getTime() + bufferMinutes * 60000).toISOString();

    // 2. Row Lock & Overlap Check Query
    const conflictQuery = `
      SELECT booking_id, title, start_time, end_time, status 
      FROM bookings
      WHERE resource_id = $1
        AND status IN ('PENDING', 'APPROVED', 'CHECKED_IN', 'pending', 'approved', 'checked_in')
        AND start_time < $3
        AND end_time > $2
      FOR UPDATE;
    `;

    const conflictResult = await client.query(conflictQuery, [resource_id, bufferedStart, bufferedEnd]);

    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');

      const conflictingBooking = conflictResult.rows[0];
      const suggestions = findAlternativeSlots(resource_id, startTime, endTime, bufferMinutes);

      return res.status(409).json({
        success: false,
        error: 'RESOURCE_CONFLICT',
        message: `Scheduling Conflict: Slot clashes with '${conflictingBooking.title}' (or its ${bufferMinutes}-minute cleaning/prep buffer).`,
        conflictingBooking,
        bufferMinutes,
        suggestions
      });
    }

    // 3. Insert Booking Record
    const insertQuery = `
      INSERT INTO bookings (resource_id, requested_by, title, purpose, start_time, end_time, attendees_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved')
      RETURNING booking_id, resource_id, title, start_time, end_time, status, created_at;
    `;

    const newBooking = await client.query(insertQuery, [
      resource_id,
      userId,
      title,
      purpose || 'General Academic Booking',
      start.toISOString(),
      end.toISOString(),
      attendeeCount || 1
    ]);

    // Commit Transaction
    await client.query('COMMIT');

    const createdRecord = {
      ...newBooking.rows[0],
      resource_name: resourceName,
      requester_name: req.user?.name || 'Campus User',
      requester_email: req.user?.email || 'user@college.edu'
    };

    // Broadcast Real-Time Update to all connected clients via WebSocket
    broadcastEvent('booking_created', {
      message: `New reservation confirmed for ${resourceName}`,
      booking: createdRecord
    });

    return res.status(201).json({
      success: true,
      message: 'Booking successfully confirmed and synchronized.',
      booking: createdRecord
    });

  } catch (error) {
    await client.query('ROLLBACK');

    // PostgreSQL Exclusion Constraint Code: 23P01
    if (error.code === '23P01') {
      const suggestions = findAlternativeSlots(resource_id, startTime, endTime, 15);
      return res.status(409).json({
        success: false,
        error: 'RESOURCE_CONFLICT',
        message: 'The resource is already booked during this time interval (Exclusion Violation: 23P01).',
        suggestions
      });
    }

    console.error('Database transaction failed:', error);
    return res.status(500).json({ success: false, message: 'Internal transaction error processing booking.' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/v1/bookings/:id/checkin
 * Real-time QR Code or Manual Check-in
 */
router.post('/:id/checkin', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { checkinMethod = 'qr_code' } = req.body;

  try {
    const booking = memoryStore.bookings.find(b => b.booking_id === id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = 'checked_in';
    const checkinRecord = {
      checkin_id: uuidv4(),
      booking_id: id,
      user_id: req.user?.id || booking.requested_by,
      checkin_method: checkinMethod,
      checked_in_at: new Date().toISOString()
    };
    memoryStore.checkins.push(checkinRecord);

    broadcastEvent('booking_checked_in', {
      message: `Check-in verified for booking: ${booking.title}`,
      bookingId: id,
      status: 'checked_in'
    });

    res.json({
      success: true,
      message: 'Check-in confirmed successfully.',
      booking,
      checkin: checkinRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Check-in processing error.' });
  }
});

/**
 * POST /api/v1/bookings/:id/cancel
 * Cancel an active booking and release the slot
 */
router.post('/:id/cancel', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { reason = 'Cancelled by user' } = req.body;

  try {
    const booking = memoryStore.bookings.find(b => b.booking_id === id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = 'cancelled';
    booking.cancellation_reason = reason;
    booking.updated_at = new Date().toISOString();

    broadcastEvent('booking_cancelled', {
      message: `Reservation cancelled for resource slot.`,
      bookingId: id,
      resourceId: booking.resource_id,
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Slot released.',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cancellation error.' });
  }
});

module.exports = router;
