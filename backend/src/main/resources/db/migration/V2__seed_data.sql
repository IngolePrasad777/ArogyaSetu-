INSERT INTO users (id, email, password_hash, role, enabled, consent_accepted, consent_accepted_at, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'admin@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'ADMIN', true, true, now(), now(), now()),
('22222222-2222-2222-2222-222222222222', 'patient@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'PATIENT', true, true, now(), now(), now()),
('33333333-3333-3333-3333-333333333333', 'doctor@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now()),
('44444444-4444-4444-4444-444444444444', 'cardio.demo@arogyasetu.local', '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2', 'DOCTOR', true, true, now(), now(), now());

INSERT INTO patients (patient_id, user_id, first_name, last_name, email, phone, gender, dob, blood_group, address, emergency_contact, created_at, updated_at)
VALUES ('22222222-aaaa-aaaa-aaaa-222222222222', '22222222-2222-2222-2222-222222222222', 'Ravi', 'Kumar', 'patient@arogyasetu.local', '+919999999001', 'MALE', '1990-04-12', 'O+', 'Village Health Block 4', '+919999999002', now(), now());

INSERT INTO doctors (doctor_id, user_id, full_name, specialization, qualification, experience, email, availability, verified, created_at, updated_at)
VALUES
('33333333-aaaa-aaaa-aaaa-333333333333', '33333333-3333-3333-3333-333333333333', 'Dr. Meera Sharma', 'General Medicine', 'MBBS, MD', 9, 'doctor@arogyasetu.local', 'Mon-Fri 09:00-17:00', true, now(), now()),
('44444444-aaaa-aaaa-aaaa-444444444444', '44444444-4444-4444-4444-444444444444', 'Dr. Cardio Demo', 'Cardiologist', 'MBBS, DM Cardiology', 12, 'cardio.demo@arogyasetu.local', 'Mon-Sat 10:00-14:00', true, now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO ehr (ehr_id, patient_id, medical_history, allergies, current_medications, reports_url, consultation_history, prescription_history, created_at, updated_at)
VALUES ('55555555-aaaa-aaaa-aaaa-555555555555', '22222222-aaaa-aaaa-aaaa-222222222222', 'No chronic illness recorded.', 'None recorded.', 'None recorded.', '', 'Initial EHR generated from registration.', '', now(), now());
