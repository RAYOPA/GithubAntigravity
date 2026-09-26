-- 02_types.sql
-- Custom Enums for Smart Campus Resource Booking System

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'student',
        'faculty',
        'coordinator',
        'facility_manager',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'completed',
        'no_show',
        'checked_in'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM (
        'active',
        'inactive',
        'maintenance'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'booking_created',
        'booking_approved',
        'booking_rejected',
        'booking_cancelled',
        'booking_reminder',
        'conflict_alert',
        'no_show_alert',
        'waitlist_available',
        'maintenance_alert'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
