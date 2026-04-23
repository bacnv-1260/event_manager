# Research: Event Registration App

**Phase**: 0 — Outline & Research  
**Branch**: `001-event-registration`  
**Date**: 2026-04-22

All unknowns from the Technical Context have been resolved. No NEEDS
CLARIFICATION items remain.

---

## Decision 1: QR Token Signing Strategy

**Decision**: HMAC-SHA256 with a server-held secret key, encoded as a compact
string (`base64url(eventId:registrationId:hmac)`).

**Rationale**: Simpler and faster than full JWT for a single-purpose, opaque
token. The payload is minimal (just IDs); the HMAC guarantees server-origin and
prevents forgery. The server is always the verification authority, so no
public-key infrastructure is needed.

**Alternatives considered**:
- *JWT (HS256)*: More overhead (header + payload + signature), unnecessary for an
  opaque ticket token. Rejected on YAGNI grounds.
- *UUID only (no signature)*: Cannot detect forgery. Rejected — constitution
  principle IV requires tamper-evidence.
- *RS256 asymmetric JWT*: Allows offline verification but the check-in page
  always has internet, so the complexity is unjustified.

---

## Decision 2: Atomic Capacity Enforcement

**Decision**: PostgreSQL advisory or `SELECT … FOR UPDATE` on the `TicketType`
row inside a transaction when processing a registration.

**Rationale**: Prevents race conditions when two concurrent requests try to claim
the last ticket. The `registered_count` column is incremented atomically inside a
Prisma interactive transaction with a row-level lock, and a database CHECK
constraint (`registered_count <= max_capacity`) provides a final guard.

**Alternatives considered**:
- *Application-level optimistic locking (compare-and-swap)*: Requires retry logic
  and still risks overbooking under high concurrency. Rejected.
- *Redis atomic increment*: Adds operational complexity (another service to run).
  At v1 scale (≤5k registrations), PostgreSQL transactions are sufficient. May
  revisit at scale.

---

## Decision 3: Android Reminder Scheduling

**Decision**: `WorkManager` with `OneTimeWorkRequest` and exact timing using
`setInitialDelay` for the T-24h reminder; a second `OneTimeWorkRequest` for T-1h.
Both are scheduled as soon as the registration response is received.

**Rationale**: WorkManager is the recommended solution for guaranteed background
work on Android 8+. It respects Doze mode and survives app restarts. For events
within the next 24 hours, the T-24h work request is skipped (delay would be
negative).

**Alternatives considered**:
- *AlarmManager with `setExactAndAllowWhileIdle`*: More precise but requires
  `SCHEDULE_EXACT_ALARM` permission (restricted on Android 12+). WorkManager
  handles timing with sufficient accuracy for a ±5-minute tolerance. Rejected
  unless user testing reveals unacceptable latency.
- *FCM server-push*: Requires backend push infrastructure; spec explicitly states
  no server-side push needed. Rejected.

---

## Decision 4: QR Scanning in the Admin Check-in Page

**Decision**: `html5-qrcode` library (React wrapper) for in-browser QR scanning
via the device camera on the check-in page.

**Rationale**: Works cross-browser without native app install; the check-in page
is a React web page. `html5-qrcode` wraps the HTML5 `getUserMedia` camera API and
`ZXing` WebAssembly decoder. Supports both camera scan and file-upload fallback.
Manual token input is also supported as a textarea fallback (FR-016).

**Alternatives considered**:
- *Native Android check-in app*: Overkill — organizers already have the React
  admin panel open on a phone browser. Rejected for v1.
- *`react-qr-reader`*: Unmaintained. Rejected.
- *`zxing-js`*: Lower-level; `html5-qrcode` provides a better React integration
  surface. Rejected.

---

## Decision 5: ORM — Prisma vs TypeORM

**Decision**: **Prisma 5** for the Node.js backend.

**Rationale**: Prisma provides a type-safe query client auto-generated from the
schema, built-in migration tooling (`prisma migrate`), and excellent TypeScript
DX. The Prisma schema serves as the single source of truth for the database
structure, which simplifies onboarding.

**Alternatives considered**:
- *TypeORM*: Decorator-heavy, historically buggy with complex relations, slower
  type-inference. Rejected.
- *Knex (raw query builder)*: More verbose; requires manual type definitions.
  Rejected for v1; may be used for performance-critical queries later.

---

## Decision 6: Android QR Display Library

**Decision**: **ZXing Android Embedded** (via `journeyapps/zxing-android-embedded`)
to generate the QR bitmap from the token string, rendered in a `androidx.compose.ui.graphics.ImageBitmap`
within Compose.

**Rationale**: Mature, widely used, no runtime network call required. QR generation
happens entirely on-device from the stored token.

**Alternatives considered**:
- *ML Kit Barcode Scanning API*: Designed for scanning, not generation. Not
  applicable.
- *`qrcode-kotlin`*: Pure Kotlin, lightweight alternative. Valid option; ZXing
  chosen due to broader community support and existing team familiarity.

---

## Decision 7: State Management — React Admin Panel

**Decision**: **React Query v5** for all server state; no global Redux store.
Local UI state uses `useState`/`useReducer`. React Hook Form handles form state.

**Rationale**: All state in the admin panel is server-derived (event lists,
attendee lists, check-in results). React Query handles caching, loading/error
states, and manual refresh without a Redux boilerplate layer. The constitution
allows React Query as the single state solution.

**Alternatives considered**:
- *Redux Toolkit + RTK Query*: More boilerplate, better for complex client-side
  state. Overkill for a data-display / form-submission admin panel. Rejected.
- *SWR*: Similar to React Query but less feature-rich (no mutation support as
  ergonomic). Rejected.

---

## Summary Table

| Unknown | Decision | Key Rationale |
|---------|----------|---------------|
| QR token signing | HMAC-SHA256 compact string | Simple, tamper-evident, no PKI needed |
| Capacity enforcement | PostgreSQL row lock + DB constraint | Atomic, no extra infrastructure |
| Android reminders | WorkManager OneTimeWorkRequest | Recommended for background work on Android 8+ |
| QR scanning (web) | html5-qrcode | Cross-browser, camera API, ZXing WASM |
| ORM | Prisma 5 | Type-safe, migration tooling, TS DX |
| Android QR generation | ZXing Android Embedded | Mature, on-device, no network |
| React state | React Query v5 + React Hook Form | Server-state only, minimal boilerplate |
