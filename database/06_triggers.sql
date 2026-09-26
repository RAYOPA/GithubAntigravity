-- 06_triggers.sql
-- Automatic Updated Timestamp and Booking History Triggers

-- 1. Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_buildings_updated_at ON buildings;
CREATE TRIGGER update_buildings_updated_at
BEFORE UPDATE ON buildings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. Trigger function for booking status history audit
CREATE OR REPLACE FUNCTION record_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO booking_status_history (
            booking_id,
            old_status,
            new_status,
            changed_by,
            remarks
        )
        VALUES (
            NEW.booking_id,
            OLD.status,
            NEW.status,
            COALESCE(NEW.approved_by, NEW.requested_by),
            'Booking status changed automatically'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply booking status history trigger
DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
CREATE TRIGGER booking_status_change_trigger
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION record_booking_status_change();
