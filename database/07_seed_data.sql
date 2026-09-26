-- 07_seed_data.sql
-- Seed Data for Smart Campus Booking System

-- 1. Insert Users (Password: 'password123' bcrypt hash: $2a$10$wTkygJdE7/f2wJ7eZ58H9u9k5tYk3k6lO7A9MhP/QG1cQWqIovWfS)
INSERT INTO users (user_id, full_name, email, password_hash, role, department)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Aarav Sharma',
    'student@college.edu',
    '$2a$10$wTkygJdE7/f2wJ7eZ58H9u9k5tYk3k6lO7A9MhP/QG1cQWqIovWfS',
    'student',
    'Computer Science'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Dr. Priya Menon',
    'faculty@college.edu',
    '$2a$10$wTkygJdE7/f2wJ7eZ58H9u9k5tYk3k6lO7A9MhP/QG1cQWqIovWfS',
    'faculty',
    'Computer Science'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Rahul Verma',
    'manager@college.edu',
    '$2a$10$wTkygJdE7/f2wJ7eZ58H9u9k5tYk3k6lO7A9MhP/QG1cQWqIovWfS',
    'facility_manager',
    'Administration'
),
(
    '44444444-4444-4444-4444-444444444444',
    'System Admin',
    'admin@college.edu',
    '$2a$10$wTkygJdE7/f2wJ7eZ58H9u9k5tYk3k6lO7A9MhP/QG1cQWqIovWfS',
    'admin',
    'Administration'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Buildings
INSERT INTO buildings (building_id, name, code, address, latitude, longitude)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Main Academic Block',
    'MAB',
    'North Campus, Block A',
    28.613939,
    77.209021
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Science Block',
    'SCI',
    'East Campus, Block B',
    28.614500,
    77.210500
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Innovation Center',
    'INC',
    'South Campus, Tech Park',
    28.612800,
    77.208200
)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Resource Types
INSERT INTO resource_types (resource_type_id, name, description)
VALUES
('b0000000-0000-0000-0000-000000000001', 'Classroom', 'Standard teaching classroom with digital podium'),
('b0000000-0000-0000-0000-000000000002', 'Laboratory', 'Specialized laboratory with practical workstations'),
('b0000000-0000-0000-0000-000000000003', 'Seminar Hall', 'Tiered auditorium hall for seminars and research symposia'),
('b0000000-0000-0000-0000-000000000004', 'Auditorium', 'Large capacity convention hall with state-of-the-art AV'),
('b0000000-0000-0000-0000-000000000005', 'Computer Lab', 'High performance computing systems with gigabit LAN')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert Features
INSERT INTO features (feature_id, name, description)
VALUES
('c0000000-0000-0000-0000-000000000001', 'Projector', 'Ultra HD 4K Laser ceiling projector'),
('c0000000-0000-0000-0000-000000000002', 'Wi-Fi', 'High speed Wi-Fi 6 campus coverage'),
('c0000000-0000-0000-0000-000000000003', 'Air Conditioning', 'Centralized temperature control'),
('c0000000-0000-0000-0000-000000000004', 'Whiteboard', 'Large magnetic porcelain whiteboard'),
('c0000000-0000-0000-0000-000000000005', 'Computer Systems', 'High-spec workstation PCs with dual monitors'),
('c0000000-0000-0000-0000-000000000006', 'Sound System', 'Surround sound with wireless lapel microphones'),
('c0000000-0000-0000-0000-000000000007', 'Wheelchair Access', 'ADA compliant ramp and accessible seating')
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Resources
INSERT INTO resources (
    resource_id, building_id, resource_type_id, name, room_number, floor_number, capacity, status, buffer_time_minutes, description, image_url
)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001', -- MAB
    'b0000000-0000-0000-0000-000000000001', -- Classroom
    'Room A101 (Smart Classroom)',
    'A101',
    1,
    60,
    'active',
    15,
    'Smart classroom with laser projector and motorized projection screen.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002', -- SCI
    'b0000000-0000-0000-0000-000000000005', -- Computer Lab
    'Computer Laboratory 1',
    'C101',
    1,
    50,
    'active',
    15,
    'Computer laboratory with 50 high-end desktop workstations.',
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003', -- INC
    'b0000000-0000-0000-0000-000000000003', -- Seminar Hall
    'Seminar Hall A',
    'SH-A',
    2,
    150,
    'active',
    30,
    'Large executive seminar hall with dual podiums and acoustic sound system.',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002', -- SCI
    'b0000000-0000-0000-0000-000000000002', -- Laboratory
    'Physics Laboratory',
    'P201',
    2,
    40,
    'active',
    15,
    'Laboratory for physics and optics practical research sessions.',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000003', -- INC
    'b0000000-0000-0000-0000-000000000004', -- Auditorium
    'Innovation Grand Auditorium',
    'AUD-01',
    1,
    250,
    'active',
    30,
    'Premier campus amphitheater for hackathons, keynotes, and ceremonies.',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
)
ON CONFLICT (building_id, room_number) DO NOTHING;

-- 6. Assign Features to Resources
INSERT INTO resource_features (resource_id, feature_id)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'), -- A101: Projector
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'), -- A101: Wi-Fi
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003'), -- A101: AC
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004'), -- A101: Whiteboard

('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005'), -- C101: Computer Systems
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'), -- C101: Wi-Fi
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003'), -- C101: AC

('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'), -- SH-A: Projector
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006'), -- SH-A: Sound System
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007'), -- SH-A: Wheelchair
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003')  -- SH-A: AC
ON CONFLICT DO NOTHING;

-- 7. Add Operating Hours (Monday to Saturday, 08:00 - 20:00)
INSERT INTO resource_operating_hours (resource_id, day_of_week, open_time, close_time)
SELECT r.resource_id, days.day_of_week, '08:00', '20:00'
FROM resources r
CROSS JOIN (VALUES (1), (2), (3), (4), (5), (6)) AS days(day_of_week)
ON CONFLICT DO NOTHING;

-- 8. Sample Booking for Room A101 (Database Workshop)
INSERT INTO bookings (
    booking_id, resource_id, requested_by, title, purpose, department, attendees_count, start_time, end_time, status
)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001', -- Room A101
    '22222222-2222-2222-2222-222222222222', -- Dr. Priya Menon
    'Database Workshop: SQL & Transactions',
    'Hands-on lab for second-year computer science students',
    'Computer Science',
    45,
    CURRENT_DATE + TIME '10:00:00',
    CURRENT_DATE + TIME '12:00:00',
    'approved'
)
ON CONFLICT DO NOTHING;
