-- 08_views.sql
-- Database Views for API and Dashboard Consumption

CREATE OR REPLACE VIEW booking_details_view AS
SELECT
    b.booking_id,
    b.title,
    b.purpose,
    b.department,
    b.attendees_count,
    b.start_time,
    b.end_time,
    b.status,
    b.created_at,

    r.resource_id,
    r.name AS resource_name,
    r.room_number,
    r.floor_number,
    r.capacity,
    r.buffer_time_minutes,

    bu.building_id,
    bu.name AS building_name,
    bu.code AS building_code,

    rt.name AS resource_type,

    u.user_id AS requester_id,
    u.full_name AS requester_name,
    u.email AS requester_email,
    u.role AS requester_role,

    bc.checked_in_at,
    bc.checkin_method

FROM bookings b
JOIN resources r ON r.resource_id = b.resource_id
JOIN buildings bu ON bu.building_id = r.building_id
JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
JOIN users u ON u.user_id = b.requested_by
LEFT JOIN booking_checkins bc ON bc.booking_id = b.booking_id;
