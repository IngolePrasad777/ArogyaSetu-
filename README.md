# ArogyaSetu+ AI Telehealth and EHR MVP

Production-style MVP for rural telehealth access with React, Spring Boot, PostgreSQL, S3 report storage, Agora consultation abstraction, Gemini-assisted triage, JWT security, RBAC, audit logging, and IndexedDB offline sync.

The implementation has been aligned to the added Group 14 SRS and Design Model PDFs in `docs/`, including OTP support, multilingual UI controls, doctor search and slots, emergency appointment booking, WebSocket notifications, Redis-ready configuration, prescription verification, and richer EHR structure.

## Repository

```text
backend/   Spring Boot 3, Java 21, Maven, JPA, Security, Flyway
frontend/  React + Vite, Tailwind, Router, Query, Zustand, IndexedDB
docs/      API and schema documentation
```

## Security Note

Do not commit real cloud credentials. This repo uses `.env.example` placeholders and Spring/Vite environment variables. Rotate any credentials that were pasted into chat before using this project in a real environment.

## Local Setup

1. Copy env files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start PostgreSQL and backend:
   ```bash
   docker compose up --build
   ```
3. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173`.

Seed logins use password `Password123!`:

- `admin@arogyasetu.local`
- `patient@arogyasetu.local`
- `doctor@arogyasetu.local`

## Environment Variables

Backend reads RDS, JWT, Gemini, AWS S3, Agora, SMTP, and CORS settings from environment variables. Frontend reads `VITE_API_BASE_URL` and `VITE_AGORA_APP_ID`.

## Deployment

- Frontend: Vercel project rooted at `frontend/`, build command `npm run build`, output `dist`.
- Backend: EC2, Render, or container platform using `backend/Dockerfile`.
- Database: AWS RDS PostgreSQL. Flyway migrations create tables, indexes, constraints, foreign keys, and seed data.
- Storage: AWS S3 via AWS SDK default credentials chain.

## Architecture

React UI calls REST endpoints under `/api/v1`. Spring controllers delegate to services, services enforce ownership/RBAC logic and call repositories, repositories persist to PostgreSQL. Integrations are isolated in `ai`, `notification`, `offline`, `audit`, and storage/service classes.

## Compliance Boundaries

This is an MVP foundation, not a certified clinical system. AI triage responses include the required disclaimer and must be validated by licensed clinicians before care decisions.
