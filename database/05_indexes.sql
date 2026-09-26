-- 05_indexes.sql
-- Performance Indexes for Fast Lookups and Analytics

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_resources_building
ON resources(building_id);

CREATE INDEX IF NOT EXISTS idx_resources_type
ON resources(resource_type_id);

CREATE INDEX IF NOT EXISTS idx_resources_status
ON resources(status);

CREATE INDEX IF NOT EXISTS idx_bookings_resource
ON bookings(resource_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user
ON bookings(requested_by);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_start_time
ON bookings(start_time);

CREATE INDEX IF NOT EXISTS idx_bookings_spatial_temporal
ON bookings USING gist (resource_id, booking_period);

CREATE INDEX IF NOT EXISTS idx_user_booking_history
ON bookings(requested_by, status);

CREATE INDEX IF NOT EXISTS idx_maintenance_resource
ON maintenance_blocks(resource_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs(entity_type, entity_id);
