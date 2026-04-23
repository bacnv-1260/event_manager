# Implementation Plan: Event Registration App

**Branch**: `001-event-registration` | **Date**: 2026-04-22 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/001-event-registration/spec.md`

## Summary

Build a three-tier event registration system: an Android mobile app (Kotlin /
Jetpack Compose) for attendees to discover events, register, and receive a QR
e-ticket; a Node.js / Express / TypeScript REST API as the single backend; and a
React / Vite admin panel for organizers to manage events, ticket types, and
perform QR check-in at the venue door. Data sync is pull-only (no realtime). QR
tokens are server-signed (HMAC-SHA256) and single-use. Reminders are scheduled
locally on the Android device via WorkManager.

## Technical Context

**Language/Version**:
- Android: Kotlin 1.9 / Jetpack Compose (targetSdk 35, minSdk 26)
- Backend: Node.js 20 LTS + TypeScript 5
- Web Admin: React 18 + TypeScript 5 (Vite 5)

**Primary Dependencies**:
- Android: Hilt, Retrofit 2, Room, Coil, ZXing Android Embedded, WorkManager
- Backend: Express 4, Prisma 5, jsonwebtoken, express-validator, Jest, Supertest
- Web Admin: React Query v5, React Router v6, React Hook Form, html5-qrcode (camera scan), Vitest + React Testing Library

**Storage**: PostgreSQL 16 (primary DB, managed via Prisma ORM with versioned migrations)

**Testing**:
- Android: JUnit 5 + MockK (unit), Espresso / Compose UI Test (UI); min 80% coverage on ViewModel/UseCase/Repository
- Backend: Jest + Supertest (integration), Jest (unit)
- Web Admin: Vitest + React Testing Library (component)

**Target Platform**: Android 8.0+ (API 26+); Linux server (Node.js); modern browser (Chrome/Safari/Firefox for admin panel)

**Project Type**: Mobile app + REST API backend + Web admin panel (monorepo)

**Performance Goals**:
- API response p95 < 300ms for all read endpoints
- Check-in scan-to-result round trip < 5 seconds (SC-002)
- QR ticket offline display < 1 second (SC-004)

**Constraints**:
- Pull-only data sync; no WebSocket/SSE/polling
- QR tokens must be single-use and server-verified (no client-only QR generation)
- Ticket capacity enforcement must be atomic (database-level)
- Android auth tokens must be stored in Android Keystore
- No payment processing in v1

**Scale/Scope**: ~10k users, ~100 events, ~5k registrations per event peak; 3 sub-projects (~15 screens Android, ~10 pages React, ~25 API endpoints)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centric Registration Flow | ✅ PASS | Registration ≤ 3 taps; admin panel single-form event creation |
| II. Offline-Aware Mobile Architecture | ✅ PASS | Room cache for events + tickets; pull-to-refresh only (no background sync) |
| III. Test-First (NON-NEGOTIABLE) | ✅ PASS | TDD enforced; coverage targets defined per sub-project |
| IV. Security & Privacy by Design | ✅ PASS | HTTPS, Keystore, HMAC-signed QR tokens, JWT rotation, RBAC |
| V. Simplicity & Maintainability | ✅ PASS | MVVM+Clean (Android), Layered (Node.js), React Query (React); YAGNI applied |

**Gate result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-event-registration/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output
├── contracts/       ← Phase 1 output
│   └── rest-api.md
└── tasks.md         ← Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
android/
├── app/
│   └── src/
│       ├── main/
│       │   ├── java/com/eventmanager/
│       │   │   ├── presentation/       # Compose screens + ViewModels
│       │   │   │   ├── events/         # Event list, detail
│       │   │   │   ├── registration/   # Register flow, My Tickets
│       │   │   │   └── auth/           # Login, Sign-up
│       │   │   ├── domain/             # UseCases, domain models
│       │   │   └── data/               # Repositories, Room DAOs, Retrofit services
│       │   └── res/
│       └── test/ & androidTest/
└── build.gradle.kts

backend/
├── src/
│   ├── routes/          # Express routers (auth, events, tickets, registrations, checkin)
│   ├── controllers/     # Request/response mapping only
│   ├── services/        # Business logic (registration, qr, checkin, reminder)
│   ├── repositories/    # Prisma DB access layer
│   ├── middleware/       # JWT auth, RBAC, validation, error handler
│   └── utils/           # QR token signing (HMAC-SHA256), logger
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── tests/
    ├── unit/
    └── integration/

admin-web/
├── src/
│   ├── pages/           # Events list, Event form, Attendees, CheckIn
│   ├── components/      # Shared UI (tables, modals, forms, QR scanner)
│   ├── hooks/           # React Query hooks per resource
│   ├── services/        # Axios API client
│   └── router/          # React Router v6 routes + RBAC guards
└── tests/
```

**Structure Decision**: Monorepo with three top-level sub-projects (`android/`,
`backend/`, `admin-web/`). No shared package between sub-projects in v1 to
keep the setup simple (YAGNI). Shared TypeScript types between backend and
admin-web may be extracted to `packages/shared-types/` in a future iteration.

## Complexity Tracking

> No constitution violations requiring justification.
