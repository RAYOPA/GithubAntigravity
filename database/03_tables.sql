-- 03_tables.sql
-- Smart Campus Schema: Tables Definition

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'student',
    department VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. BUILDINGS TABLE
CREATE TABLE IF NOT EXISTS buildings (
    building_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RESOURCE TYPES TABLE
CREATE TABLE IF NOT EXISTS resource_types (
    resource_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS resources (
    resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL
        REFERENCES buildings(building_id)
        ON DELETE RESTRICT,
    resource_type_id UUID NOT NULL
        REFERENCES resource_types(resource_type_id)
        ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    room_number VARCHAR(50),
    floor_number INTEGER DEFAULT 1,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status resource_status NOT NULL DEFAULT 'active',
    buffer_time_minutes INTEGER DEFAULT 15, -- Setup/cleaning buffer window in minutes
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (building_id, room_number)
);

-- 5. FEATURES TABLE
CREATE TABLE IF NOT EXISTS features (
    feature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. RESOURCE FEATURES TABLE
CREATE TABLE IF NOT EXISTS resource_features (
    resource_id UUID NOT NULL
        REFERENCES resources(resource_id)
        ON DELETE CASCADE,
    feature_id UUID NOT NULL
        REFERENCES features(feature_id)
        ON DELETE CASCADE,
    PRIMARY KEY (resource_id, feature_id)
);

-- 7. OPERATING HOURS TABLE
CREATE TABLE IF NOT EXISTS resource_operating_hours (
    operating_hours_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL
        REFERENCES resources(resource_id)
        ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    CHECK (close_time > open_time),
    UNIQUE (resource_id, day_of_week)
);

-- 8. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL
        REFERENCES resources(resource_id)
        ON DELETE RESTRICT,
    requested_by UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    purpose TEXT,
    department VARCHAR(150),
    attendees_count INTEGER NOT NULL DEFAULT 1 CHECK (attendees_count > 0),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    booking_period TSTZRANGE GENERATED ALWAYS AS (
        tstzrange(start_time, end_time, '[)')
    ) STORED,
    status booking_status NOT NULL DEFAULT 'approved',
    approved_by UUID
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

-- 9. MAINTENANCE BLOCKS TABLE
CREATE TABLE IF NOT EXISTS maintenance_blocks (
    maintenance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL
        REFERENCES resources(resource_id)
        ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    maintenance_period TSTZRANGE GENERATED ALWAYS AS (
        tstzrange(start_time, end_time, '[)')
    ) STORED,
    created_by UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

-- 10. BOOKING STATUS HISTORY
CREATE TABLE IF NOT EXISTS booking_status_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE,
    old_status booking_status,
    new_status booking_status NOT NULL,
    changed_by UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE RESTRICT,
    remarks TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. CHECK-IN TABLE
CREATE TABLE IF NOT EXISTS booking_checkins (
    checkin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE,
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE RESTRICT,
    checkin_method VARCHAR(30) NOT NULL
        CHECK (checkin_method IN (
            'qr_code',
            'manual',
            'admin',
            'sensor'
        )),
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    UNIQUE (booking_id)
);

-- 12. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS waitlists (
    waitlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL
        REFERENCES resources(resource_id)
        ON DELETE CASCADE,
    requested_by UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    attendees_count INTEGER NOT NULL CHECK (attendees_count > 0),
    priority INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'waiting'
        CHECK (status IN (
            'waiting',
            'notified',
            'converted',
            'cancelled'
        )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    booking_id UUID
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID
        REFERENCES users(user_id)
        ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
