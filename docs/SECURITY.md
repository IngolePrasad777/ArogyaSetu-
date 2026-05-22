# Security Model

- BCrypt password hashing.
- JWT stateless access tokens.
- Random refresh tokens stored only as SHA-256 hashes.
- OTP login support through hashed, expiring OTP codes.
- Spring Security route-level RBAC.
- Service-level ownership checks for patient records and assigned doctor access.
- Consent acceptance fields on user registration.
- Audit log records for login, logout, registration, EHR, appointments, symptoms, reports, and consultations.
- S3 uploads use AWS SDK default credential chain.

Recommended production hardening:

- Store secrets in AWS Secrets Manager, Parameter Store, Render secrets, or platform environment variables.
- Enable HTTPS only.
- Add rate limiting for auth and AI endpoints.
- Add full consent versioning and data-retention workflows.
- Replace the MVP Agora token placeholder with Agora's official token service.
- Replace the MVP text prescription download with a signed PDF and QR image generator for production.
