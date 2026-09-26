const express = require('express');
const router = express.Router();
const { memoryStore } = require('../config/db');
const { authenticateUser } = require('../middleware/auth');

/**
 * Helper to compute live status of a resource right now
 */
function getLiveStatus(resource) {
  if (resource.status === 'maintenance') return 'maintenance';

  const now = new Date();
  const currentActiveBooking = memoryStore.bookings.find(b => {
    if (b.resource_id !== resource.resource_id) return false;
    if (!['pending', 'approved', 'checked_in'].includes(b.status.toLowerCase())) return false;
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    return now >= start && now <= end;
  });

  if (currentActiveBooking) {
    return currentActiveBooking.status.toLowerCase() === 'checked_in' ? 'occupied' : 'pending_checkin';
  }

  return 'available';
}

/**
 * GET /api/v1/resources
 * Returns catalog with filters (building, category, capacity, status) and live badges
 */
router.get('/', (req, res) => {
  try {
    const { building_id, category, min_capacity, status } = req.query;

    let list = memoryStore.resources.map(r => {
      const building = memoryStore.buildings.find(b => b.building_id === r.building_id);
      const resType = memoryStore.resource_types.find(rt => rt.resource_type_id === r.resource_type_id);
      const liveStatus = getLiveStatus(r);

      return {
        ...r,
        building_name: building?.name || 'Academic Block',
        building_code: building?.code || 'MAB',
        category: resType?.name || 'General',
        live_status: liveStatus // 'available' | 'occupied' | 'pending_checkin' | 'maintenance'
      };
    });

    if (building_id) {
      list = list.filter(r => r.building_id === building_id);
    }
    if (category) {
      list = list.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (min_capacity) {
      list = list.filter(r => r.capacity >= parseInt(min_capacity, 10));
    }
    if (status) {
      list = list.filter(r => r.live_status === status);
    }

    res.json({
      success: true,
      count: list.length,
      resources: list
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving resources.' });
  }
});

/**
 * GET /api/v1/resources/:id/timeline
 * Returns time blocks and buffer zones for a specific resource for a given date
 */
router.get('/:id/timeline', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const resource = memoryStore.resources.find(r => r.resource_id === id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const targetDate = date ? new Date(date) : new Date();

    const bookingsForDay = memoryStore.bookings.filter(b => {
      if (b.resource_id !== id) return false;
      if (['cancelled', 'rejected'].includes(b.status.toLowerCase())) return false;
      const bDate = new Date(b.start_time);
      return bDate.toDateString() === targetDate.toDateString();
    }).map(b => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      const bufferMinutes = resource.buffer_time_minutes || 15;
      
      const bufferStart = new Date(bStart.getTime() - bufferMinutes * 60000);
      const bufferEnd = new Date(bEnd.getTime() + bufferMinutes * 60000);

      return {
        booking_id: b.booking_id,
        title: b.title,
        status: b.status,
        requester: b.requester_name || 'Academic User',
        startTime: b.start_time,
        endTime: b.end_time,
        bufferStartTime: bufferStart.toISOString(),
        bufferEndTime: bufferEnd.toISOString(),
        bufferMinutes
      };
    });

    res.json({
      success: true,
      resourceId: id,
      resourceName: resource.name,
      bufferTimeMinutes: resource.buffer_time_minutes || 15,
      date: targetDate.toISOString().split('T')[0],
      timeline: bookingsForDay
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve timeline.' });
  }
});

module.exports = router;
