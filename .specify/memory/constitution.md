<!--
Sync Impact Report
==================
Version change: (initial) → 1.0.0
Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance
Templates updated: ✅ constitution.md (initial fill)
Follow-up TODOs: none
-->

# Event Manager Constitution

## Core Principles

### I. User-Centric Registration Flow
The Android app MUST provide a clear, friction-free flow for users to discover
events, register attendance, and receive confirmation. Registration MUST complete
in at most 3 taps from the event detail screen. Every screen MUST serve a single
purpose within this flow; no dead-end or redundant navigation allowed.

The React admin panel MUST allow event organizers to create, publish, and manage
events and attendee lists with minimal steps. All destructive actions (delete,
cancel event) MUST require an explicit confirmation dialog.

### II. Offline-Aware Mobile Architecture
The Android app MUST remain functional under degraded-network conditions.
Event browsing and previously registered event data MUST be accessible offline
via local cache (Room database). Network operations MUST be performed
asynchronously (Coroutines/Flow); the UI MUST never block on I/O.
Synchronization MUST resume automatically when connectivity is restored.

### III. Test-First (NON-NEGOTIABLE)
TDD is mandatory across all three sub-projects:

- **Android**: Unit tests MUST be written before feature implementation.
  Minimum coverage: 80% for ViewModels, UseCases, and Repository classes.
  UI tests (Espresso/Compose) MUST cover all critical user paths
  (registration, login, event browsing).
- **Node.js Backend**: Every API endpoint MUST have integration tests (Jest +
  Supertest) covering success and error cases before the route is merged.
- **React Admin**: Component tests (React Testing Library) MUST cover all
  form submissions and data-table interactions.

The Red-Green-Refactor cycle MUST be strictly enforced. No feature PR may be
merged with failing or skipped tests.

### IV. Security & Privacy by Design
User personal data (name, email, phone) MUST be encrypted in transit (HTTPS/
TLS 1.2+) and at rest in the database (field-level encryption for PII).
Android authentication tokens MUST be stored in Android Keystore; never in
SharedPreferences or plain files.

The Node.js API MUST:
- Authenticate all protected routes via short-lived JWT (access token ≤15 min)
  with refresh-token rotation.
- Validate and sanitize all input at the API boundary (express-validator or
  equivalent) to prevent injection attacks (OWASP Top 10).
- Redact sensitive fields from logs; never expose stack traces to API consumers.

The React admin panel MUST enforce role-based access control (Admin / Organizer)
and MUST NOT render routes or actions the current user is not authorized for.

### V. Simplicity & Maintainability
YAGNI: features are built only when required by a confirmed user story.
Each sub-project MUST follow a single documented architecture pattern:

- **Android**: MVVM + Clean Architecture (Presentation / Domain / Data layers).
  Dependencies MUST be injected via Hilt; no static singletons for stateful
  services.
- **Node.js**: Layered architecture (Router → Controller → Service →
  Repository). Business logic MUST reside in Services; Controllers handle only
  request/response mapping.
- **React Admin**: Component-based with a global state managed by a single
  solution (Redux Toolkit or React Query); no ad-hoc prop-drilling beyond 2
  levels.

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile | Android (Kotlin, Jetpack Compose) | Min SDK 26 (Android 8.0) |
| Mobile state | ViewModel + Room + Retrofit | MVVM + Clean Architecture |
| Backend | Node.js (Express, TypeScript) | REST API, versioned under `/api/v1` |
| Database | PostgreSQL | Managed via an ORM (Prisma or TypeORM) |
| Auth | JWT (access + refresh tokens) | Issued by the Node.js service |
| Web admin | React (TypeScript, Vite) | React Query + React Router v6 |
| CI | GitHub Actions | Lint + test + build on every PR |

All inter-service communication MUST use JSON over HTTPS. The API MUST follow
REST conventions; breaking changes MUST increment the URL version segment.

## Development Workflow

- Monorepo layout: `android/`, `backend/`, `admin-web/` at the project root.
- Feature branches MUST follow the naming convention
  `feature/<issue-id>-<short-description>` and branch off `main`.
- Every PR MUST include: passing CI (lint + unit/integration tests), a filled
  spec, and at least one reviewer sign-off before merge.
- Database schema changes MUST be accompanied by a versioned migration file and
  MUST NOT break existing data.
- Android release builds MUST be signed and submitted via the Google Play
  internal track before promotion to production.
- All UI changes (Android + React) MUST be validated on at least one
  small-screen (≤5 in) and one large-screen (≥6 in) profile.

## Governance

This constitution supersedes all other development practices and guidelines for
the Event Manager project. Amendments MUST be:

1. Proposed via a PR modifying this file with a clear rationale.
2. Reviewed and approved by at least one senior team member.
3. Accompanied by a migration plan if existing code or architecture is affected.

All PRs and code reviews MUST verify compliance with the principles above.
Complexity deviations MUST be justified in the PR description. Principle
violations found during review MUST be resolved before merge.

**Version**: 1.0.0 | **Ratified**: 2026-04-22 | **Last Amended**: 2026-04-22
