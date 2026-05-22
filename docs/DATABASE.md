# Database Schema

Flyway migrations in `backend/src/main/resources/db/migration` define:

- `users`
- `patients`
- `doctors`
- `appointments`
- `symptoms`
- `consultations`
- `prescriptions`
- `ehr`
- `notifications`
- `audit_logs`

Relationships:

- Patient to Appointment: one-to-many
- Doctor to Appointment: one-to-many
- Patient to Symptoms: one-to-many
- Appointment to Consultation: one-to-one
- Consultation to Prescription: one-to-one
- Patient to EHR: one-to-one
- User to Notification: one-to-many

Indexes cover lookup paths for user email, patient email/phone, doctor email/specialization, appointment patient/doctor/date, notifications by user, and audit log actor/action.

SRS-aligned fields include OTP hashes on users, current medications on EHR, and prescription verification codes for QR-style validation.
