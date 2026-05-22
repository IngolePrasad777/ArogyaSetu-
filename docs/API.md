# API Documentation

Base URL: `/api/v1`

All protected endpoints require `Authorization: Bearer <accessToken>`.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/request-otp`
- `POST /auth/verify-otp`
- `GET /auth/profile`

## Patient

- `GET /patient/profile`
- `PUT /patient/profile`
- `POST /patient/symptoms`
- `POST /patient/upload-report`
- `GET /patient/ehr`
- `GET /patient/notifications`

## Doctor

- `GET /doctor/appointments`
- `GET /doctor/patients/{id}`
- `POST /doctor/consultation`
- `POST /doctor/prescription`
- `PUT /doctor/ehr-update`

## Appointments

- `POST /appointments/book`
- `POST /appointments/emergency`
- `PUT /appointments/reschedule/{id}`
- `DELETE /appointments/cancel/{id}`
- `GET /appointments/history`

## Doctor Directory

- `GET /doctors?specialization={name}`
- `GET /doctors/{id}/slots?date={yyyy-mm-dd}`

## EHR

- `POST /ehr/generate`
- `GET /ehr/patient/{id}`
- `PUT /ehr/update`
- `GET /ehr/download?patientId={uuid}`

## AI

- `POST /ai/triage`
- `POST /ai/recommend-doctor`
- `POST /ai/emergency-check`

## Notifications

- `GET /notifications`
- `POST /notifications/send`
- `PUT /notifications/read?id={uuid}`
- WebSocket endpoint: `/ws/notifications`

## Prescriptions

- `GET /prescriptions/{id}`
- `GET /prescriptions/{id}/download`
- `GET /prescriptions/verify/{code}`

## Offline

- `POST /offline/sync`

## Admin

- `GET /admin/users`
- `GET /admin/analytics`
- `PUT /admin/verify-doctor`
- `GET /admin/audit-logs`
