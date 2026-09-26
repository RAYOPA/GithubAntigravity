const { memoryStore } = require('../config/db');

/**
 * Calculates whether two time ranges overlap.
 * Considers boundary: [start, end)
 */
function isOverlapping(start1, end1, start2, end2) {
  return new Date(start1).getTime() < new Date(end2).getTime() &&
         new Date(end1).getTime() > new Date(start2).getTime();
}

/**
 * Computes alternative available time slots for a conflicting booking request.
 */
function findAlternativeSlots(resourceId, requestedStart, requestedEnd, bufferMinutes = 15) {
  const reqStart = new Date(requestedStart);
  const reqEnd = new Date(requestedEnd);
  const durationMs = reqEnd.getTime() - reqStart.getTime();

  // Find all active bookings for this resource on that day
  const dayStart = new Date(reqStart);
  dayStart.setHours(8, 0, 0, 0); // Campus opens at 08:00
  const dayEnd = new Date(reqStart);
  dayEnd.setHours(20, 0, 0, 0); // Campus closes at 20:00

  const activeBookings = memoryStore.bookings.filter(b => {
    if (b.resource_id !== resourceId) return false;
    if (!['pending', 'approved', 'checked_in', 'PENDING', 'APPROVED', 'CHECKED_IN'].includes(b.status)) return false;
    const bStart = new Date(b.start_time);
    return bStart.toDateString() === reqStart.toDateString();
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const alternatives = [];
  let candidateStart = new Date(dayStart);

  // Scan across the day in 30-minute intervals
  while (candidateStart.getTime() + durationMs <= dayEnd.getTime() && alternatives.length < 3) {
    const candidateEnd = new Date(candidateStart.getTime() + durationMs);
    const candidateBufferedStart = new Date(candidateStart.getTime() - bufferMinutes * 60000);
    const candidateBufferedEnd = new Date(candidateEnd.getTime() + bufferMinutes * 60000);

    const hasConflict = activeBookings.some(b => {
      return isOverlapping(
        candidateBufferedStart.toISOString(),
        candidateBufferedEnd.toISOString(),
        b.start_time,
        b.end_time
      );
    });

    // Make sure it doesn't overlap with the originally requested slot either
    const isOriginalSlot = Math.abs(candidateStart.getTime() - reqStart.getTime()) < 60000;

    if (!hasConflict && !isOriginalSlot && candidateStart.getTime() >= Date.now() - 3600000) {
      alternatives.push({
        startTime: candidateStart.toISOString(),
        endTime: candidateEnd.toISOString(),
        label: `${candidateStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${candidateEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
      // Skip ahead by duration
      candidateStart = new Date(candidateEnd.getTime() + bufferMinutes * 60000);
    } else {
      candidateStart = new Date(candidateStart.getTime() + 30 * 60000);
    }
  }

  // Suggest alternative rooms if available
  const alternateRooms = memoryStore.resources
    .filter(r => r.resource_id !== resourceId && r.status === 'active')
    .slice(0, 2)
    .map(r => ({
      resourceId: r.resource_id,
      name: r.name,
      capacity: r.capacity
    }));

  return {
    alternativeSlots: alternatives,
    alternativeResources: alternateRooms
  };
}

module.exports = {
  isOverlapping,
  findAlternativeSlots
};
