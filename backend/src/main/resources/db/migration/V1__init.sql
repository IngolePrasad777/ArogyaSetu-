CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    consent_accepted BOOLEAN NOT NULL DEFAULT false,
    consent_accepted_at TIMESTAMPTZ,
    refresh_token_hash VARCHAR(255),
    refresh_token_expires_at TIMESTAMPTZ,
    password_reset_token_hash VARCHAR(255),
    password_reset_expires_at TIMESTAMPTZ,
    otp_code_hash VARCHAR(255),
    otp_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX idx_users_email ON users (email);

CREATE TABLE patients (
    patient_id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(24),
    gender VARCHAR(24),
    dob DATE,
    blood_group VARCHAR(255),
    address TEXT,
    emergency_contact VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX idx_patients_email ON patients (email);
CREATE INDEX idx_patients_phone ON patients (phone);

CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(140) NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    qualification VARCHAR(255),
    experience INTEGER,
    email VARCHAR(160) NOT NULL UNIQUE,
    availability TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX idx_doctors_email ON doctors (email);
CREATE INDEX idx_doctors_specialization ON doctors (specialization);

CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consultation_mode VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

CREATE TABLE symptoms (
    symptom_id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
    duration VARCHAR(255),
    medical_history TEXT,
    triage_level VARCHAR(16),
    recommended_doctor VARCHAR(255),
    ai_disclaimer VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_symptoms_patient ON symptoms(patient_id);

CREATE TABLE consultations (
    consultation_id UUID PRIMARY KEY,
    appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    mode VARCHAR(16) NOT NULL,
    agora_channel VARCHAR(255),
    notes TEXT,
    diagnosis TEXT,
    store_and_forward_payload_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE prescriptions (
    prescription_id UUID PRIMARY KEY,
    consultation_id UUID NOT NULL UNIQUE REFERENCES consultations(consultation_id) ON DELETE CASCADE,
    medicines TEXT NOT NULL,
    dosage_instructions TEXT,
    follow_up_advice TEXT,
    verification_code VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE ehr (
    ehr_id UUID PRIMARY KEY,
    patient_id UUID NOT NULL UNIQUE REFERENCES patients(patient_id) ON DELETE CASCADE,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    reports_url TEXT,
    consultation_history TEXT,
    prescription_history TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY,
    actor_user_id UUID,
    actor_email VARCHAR(160),
    action VARCHAR(255),
    resource_type VARCHAR(255),
    resource_id UUID,
    ip_address VARCHAR(255),
    metadata TEXT,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_audit_user ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
