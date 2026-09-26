-- 04_constraints.sql
-- Critical Conflict Prevention & Exclusion Constraints

-- 1. Prevent Overlapping Active Bookings for the Same Resource
-- Uses GiST exclusion index on resource_id equality and time range overlap
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_active_bookings'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT no_overlapping_active_bookings
        EXCLUDE USING GIST (
            resource_id WITH =,
            booking_period WITH &&
        )
        WHERE (
            status IN ('pending', 'approved', 'checked_in')
        );
    END IF;
END $$;

-- 2. Prevent Overlapping Maintenance Blocks for the Same Resource
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_maintenance'
    ) THEN
        ALTER TABLE maintenance_blocks
        ADD CONSTRAINT no_overlapping_maintenance
        EXCLUDE USING GIST (
            resource_id WITH =,
            maintenance_period WITH &&
        );
    END IF;
END $$;
