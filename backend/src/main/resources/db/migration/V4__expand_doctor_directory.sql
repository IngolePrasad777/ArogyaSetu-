INSERT INTO users (id, email, password_hash, role, enabled, consent_accepted, consent_accepted_at, created_at, updated_at)
VALUES
('55555555-1111-1111-1111-111111111111', 'ananya.rao@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-2222-2222-2222-222222222222', 'arvind.menon@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-3333-3333-3333-333333333333', 'farah.khan@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-4444-4444-4444-444444444444', 'nisha.iyer@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-5555-5555-5555-555555555555', 'rohan.desai@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-6666-6666-6666-666666666666', 'leela.nair@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-7777-7777-7777-777777777777', 'vikram.sethi@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('55555555-8888-8888-8888-888888888888', 'priya.narayanan@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now())
ON CONFLICT (email) DO NOTHING;

UPDATE doctors
SET availability = 'Mon-Fri: 09:00,10:00,11:00,14:00,15:00,16:00',
    updated_at = now()
WHERE email = 'doctor@arogyasetu.local';

UPDATE doctors
SET availability = 'Mon-Sat: 10:00,11:00,12:00,15:00,16:00',
    updated_at = now()
WHERE email = 'cardio.demo@arogyasetu.local';

INSERT INTO doctors (doctor_id, user_id, full_name, specialization, qualification, experience, email, availability, verified, created_at, updated_at)
VALUES
('55555555-aaaa-aaaa-aaaa-111111111111', '55555555-1111-1111-1111-111111111111', 'Dr. Ananya Rao', 'Pediatrics', 'MBBS, MD Pediatrics', 11, 'ananya.rao@arogyasetu.local', 'Mon-Fri: 09:30,10:30,11:30,14:30,15:30', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-222222222222', '55555555-2222-2222-2222-222222222222', 'Dr. Arvind Menon', 'Orthopedics', 'MBBS, MS Orthopedics', 14, 'arvind.menon@arogyasetu.local', 'Tue-Sat: 09:00,10:00,12:00,16:00,17:00', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-333333333333', '55555555-3333-3333-3333-333333333333', 'Dr. Farah Khan', 'Gynecology', 'MBBS, MS Obstetrics and Gynecology', 12, 'farah.khan@arogyasetu.local', 'Mon-Sat: 10:00,11:00,13:00,15:00,16:00', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-444444444444', '55555555-4444-4444-4444-444444444444', 'Dr. Nisha Iyer', 'Dermatologist', 'MBBS, MD Dermatology', 9, 'nisha.iyer@arogyasetu.local', 'Mon-Fri: 09:00,11:00,14:00,15:00,17:00', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-555555555555', '55555555-5555-5555-5555-555555555555', 'Dr. Rohan Desai', 'Pulmonologist', 'MBBS, MD Pulmonary Medicine', 13, 'rohan.desai@arogyasetu.local', 'Mon-Sat: 08:30,09:30,10:30,14:30,15:30', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-666666666666', '55555555-6666-6666-6666-666666666666', 'Dr. Leela Nair', 'Neurologist', 'MBBS, DM Neurology', 16, 'leela.nair@arogyasetu.local', 'Mon-Fri: 10:00,11:00,12:00,15:00,16:00', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-777777777777', '55555555-7777-7777-7777-777777777777', 'Dr. Vikram Sethi', 'Psychiatrist', 'MBBS, MD Psychiatry', 10, 'vikram.sethi@arogyasetu.local', 'Tue-Sat: 10:00,11:00,14:00,16:00,18:00', true, now(), now()),
('55555555-aaaa-aaaa-aaaa-888888888888', '55555555-8888-8888-8888-888888888888', 'Dr. Priya Narayanan', 'ENT Specialist', 'MBBS, MS ENT', 8, 'priya.narayanan@arogyasetu.local', 'Mon-Sat: 09:00,10:00,12:00,15:00,17:00', true, now(), now())
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    specialization = EXCLUDED.specialization,
    qualification = EXCLUDED.qualification,
    experience = EXCLUDED.experience,
    availability = EXCLUDED.availability,
    verified = true,
    updated_at = now();
