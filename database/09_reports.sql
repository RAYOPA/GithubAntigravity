-- 09_reports.sql
-- Analytics & Reporting Queries for Campus Resource Management

-- 1. VIEW: Resource Utilization Report
CREATE OR REPLACE VIEW view_utilization_report AS
SELECT
    r.resource_id,
    r.name AS resource_name,
    rt.name AS resource_type,
    b.name AS building_name,
    COUNT(bk.booking_id) AS total_bookings,
    COALESCE(
        ROUND(
            SUM(
                EXTRACT(
                    EPOCH FROM (bk.end_time - bk.start_time)
                ) / 3600
            )::numeric,
            2
        ),
        0
    ) AS total_booked_hours
FROM resources r
JOIN resource_types rt ON rt.resource_type_id = r.resource_type_id
JOIN buildings b ON b.building_id = r.building_id
LEFT JOIN bookings bk ON bk.resource_id = r.resource_id
   AND bk.status IN ('approved', 'completed', 'checked_in')
GROUP BY
    r.resource_id,
    r.name,
    rt.name,
    b.name
ORDER BY total_booked_hours DESC;

-- 2. VIEW: Most-Used Resources
CREATE OR REPLACE VIEW view_most_used_resources AS
SELECT
    r.resource_id,
    r.name AS resource_name,
    b.name AS building_name,
    COUNT(bkg.booking_id) AS total_bookings
FROM resources r
JOIN buildings b ON b.building_id = r.building_id
LEFT JOIN bookings bkg ON bkg.resource_id = r.resource_id
   AND bkg.status IN ('approved', 'completed', 'checked_in')
GROUP BY r.resource_id, r.name, b.name
ORDER BY total_bookings DESC
LIMIT 10;

-- 3. VIEW: No-Show Report
CREATE OR REPLACE VIEW view_no_show_report AS
SELECT
    b.booking_id,
    u.full_name AS user_name,
    u.email AS user_email,
    r.name AS resource_name,
    b.title,
    b.start_time,
    b.end_time,
    b.created_at
FROM bookings b
JOIN users u ON u.user_id = b.requested_by
JOIN resources r ON r.resource_id = b.resource_id
WHERE b.status = 'no_show'
ORDER BY b.start_time DESC;
