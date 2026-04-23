# Tasks: Event Registration App

**Input**: Design documents from `specs/001-event-registration/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/rest-api.md ✅ · quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: US1–US5 map to user stories in spec.md
- Tests are **not** included (not explicitly requested in spec)

---

## Phase 1: Setup

**Purpose**: Monorepo skeleton + tooling for all three sub-projects

- [X] T001 Create monorepo top-level directories: `android/`, `backend/`, `admin-web/`
- [X] T002 [P] Initialize Node.js backend project: `npm init`, install Express 4, TypeScript 5, Prisma 5, jest, supertest, express-validator, jsonwebtoken, bcrypt in `backend/`
- [X] T003 [P] Initialize React admin panel: `npm create vite@latest admin-web -- --template react-ts`, install React Query v5, React Router v6, React Hook Form, html5-qrcode, axios in `admin-web/`
- [X] T004 [P] Initialize Android project via Android Studio wizard: Kotlin, Jetpack Compose, minSdk 26; add Hilt, Retrofit 2, Room, ZXing Android Embedded, WorkManager, Coil to `android/app/build.gradle.kts`
- [X] T005 [P] Configure ESLint + Prettier for backend in `backend/.eslintrc.json` and `backend/prettier.config.js`
- [X] T006 [P] Configure ESLint + Prettier for admin-web in `admin-web/.eslintrc.json` and `admin-web/prettier.config.js`
- [X] T007 [P] Create `.env.example` files for backend (`backend/.env.example`) and admin-web (`admin-web/.env.example`) per quickstart.md variable reference
- [X] T008 [P] Create GitHub Actions CI workflow in `.github/workflows/ci.yml`: jobs for backend (lint + test), admin-web (lint + test), android (unit test)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared across all user stories. MUST complete before any Phase 3+ work begins.

### Backend Foundation

- [X] T009 Define Prisma schema with all 6 entities (User, Organizer, Event, TicketType, Registration, CheckInLog) including indexes and CHECK constraints in `backend/prisma/schema.prisma`
- [X] T010 Run initial Prisma migration to create all tables in `backend/prisma/migrations/`
- [X] T011 [P] Implement JWT utility (sign access token ≤15m, sign/verify refresh token 7d) in `backend/src/utils/jwt.util.ts`
- [X] T012 [P] Implement QR token signing utility (HMAC-SHA256 compact format: `base64url(eventId:registrationId).signature`) in `backend/src/utils/qr-token.util.ts`
- [X] T013 [P] Implement global error handler middleware (no stack traces in responses, structured JSON) in `backend/src/middleware/error.middleware.ts`
- [X] T014 [P] Implement request validation middleware (express-validator wrapper) in `backend/src/middleware/validate.middleware.ts`
- [X] T015 [P] Implement structured logger (winston or pino, redact PII fields: email, passwordHash, qrToken) in `backend/src/utils/logger.ts`
- [X] T016 Implement auth middleware (verifyAccessToken) and RBAC middleware (requireRole) in `backend/src/middleware/auth.middleware.ts`
- [X] T017 Implement UserRepository (create user, find by email) in `backend/src/repositories/user.repository.ts`
- [X] T018 Implement OrganizerRepository (find by email) in `backend/src/repositories/organizer.repository.ts`
- [X] T019 Implement AuthService (register, login for user/organizer, refresh token, logout) in `backend/src/services/auth.service.ts`
- [X] T020 Implement auth routes + controller (POST /auth/register, /auth/login, /auth/refresh, /auth/logout) in `backend/src/routes/auth.routes.ts` and `backend/src/controllers/auth.controller.ts`
- [X] T021 Wire Express app (routes, middleware, error handler) in `backend/src/app.ts` and `backend/src/server.ts`
- [X] T022 Create Prisma seed script (default organizer + checkin_operator accounts) in `backend/prisma/seed.ts`

### Android Foundation

- [X] T023 [P] Configure Hilt DI modules (NetworkModule, DatabaseModule, RepositoryModule) in `android/app/src/main/java/com/eventmanager/di/`
- [X] T024 [P] Set up Room database class and DAOs (EventDao, TicketTypeDao, RegistrationDao) in `android/app/src/main/java/com/eventmanager/data/local/`
- [X] T025 [P] Configure Retrofit HTTP client with OkHttp JWT auth interceptor (attaches Bearer token, triggers refresh on 401) in `android/app/src/main/java/com/eventmanager/data/remote/NetworkModule.kt`
- [X] T026 [P] Implement Android Keystore token storage (store/retrieve/clear access + refresh tokens) in `android/app/src/main/java/com/eventmanager/data/security/KeystoreTokenStore.kt`
- [X] T027 Implement UserRepository (login, register, refresh token, clear session) in `android/app/src/main/java/com/eventmanager/data/repository/UserRepository.kt`
- [X] T028 Implement AuthViewModel + Login screen + Sign-up screen (Compose) in `android/app/src/main/java/com/eventmanager/presentation/auth/`
- [X] T029 Set up NavHost with auth gate (redirect to Login if no token) in `android/app/src/main/java/com/eventmanager/presentation/MainActivity.kt`

### Admin-web Foundation

- [X] T030 [P] Configure Axios API client with JWT interceptor (attach token, auto-refresh on 401) in `admin-web/src/services/api.client.ts`
- [X] T031 [P] Configure React Query client (staleTime, retry) in `admin-web/src/main.tsx`
- [X] T032 [P] Implement useAuth hook + AuthContext (login, logout, current user, role) in `admin-web/src/hooks/useAuth.ts`
- [X] T033 Configure React Router v6 route tree with ProtectedRoute wrapper (RBAC: organizer vs checkin_operator) in `admin-web/src/router/AppRouter.tsx`
- [X] T034 Implement Login page in `admin-web/src/pages/LoginPage.tsx`

**Checkpoint**: Foundation ready — all three sub-projects can boot, authenticate, and communicate. User story work begins now.

---

## Phase 3: User Story 2 — Organizer Creates Event & Configures Tickets (Priority: P1)

**Goal**: Organizer can create, configure, and publish an event with ticket types via the admin panel. Published events are returned by the public API.

**Independent Test**: Log in as organizer → create event with 2 ticket types (Free cap 50, VIP cap 10) → publish → call `GET /api/v1/events` and confirm the event appears with both ticket types and correct `availableCapacity`.

### Backend — US2

- [X] T035 [P] [US2] Implement EventRepository (create, findById, update, list by organizer, list published upcoming) in `backend/src/repositories/event.repository.ts`
- [X] T036 [P] [US2] Implement TicketTypeRepository (createMany, updateByEventId, findByEventId) in `backend/src/repositories/ticket-type.repository.ts`
- [X] T037 [US2] Implement EventService (createEvent with ticketTypes, updateEvent, changeStatus with transition validation) in `backend/src/services/event.service.ts`
- [X] T038 [US2] Implement admin event routes + controller (POST /admin/events, PUT /admin/events/:id, PATCH /admin/events/:id/status, GET /admin/events) in `backend/src/routes/admin/events.routes.ts` and `backend/src/controllers/admin/events.controller.ts`
- [X] T039 [US2] Implement public event routes + controller (GET /api/v1/events, GET /api/v1/events/:id) in `backend/src/routes/events.routes.ts` and `backend/src/controllers/events.controller.ts`

### Admin-web — US2

- [X] T040 [P] [US2] Implement useAdminEvents React Query hooks (list, create, update, changeStatus) in `admin-web/src/hooks/useAdminEvents.ts`
- [X] T041 [P] [US2] Implement TicketTypeFields component (add/remove ticket types, name/price/capacity inputs, validation) in `admin-web/src/components/TicketTypeFields.tsx`
- [X] T042 [P] [US2] Implement EventForm component (title, description, location, start/end datetime, embedded TicketTypeFields) in `admin-web/src/components/EventForm.tsx`
- [X] T043 [US2] Implement EventsPage (table of organizer's events with status badge, create button) in `admin-web/src/pages/EventsPage.tsx`
- [X] T044 [US2] Implement CreateEditEventPage (wraps EventForm, handles create vs edit mode) in `admin-web/src/pages/CreateEditEventPage.tsx`
- [X] T045 [US2] Implement EventStatusControl component (Publish / Cancel buttons with confirmation dialog) in `admin-web/src/components/EventStatusControl.tsx`

**Checkpoint**: Organizer can create, publish, and edit events with ticket types. Public event list API returns data.

---

## Phase 4: User Story 1 — Attendee Registers & Receives QR Ticket (Priority: P1)

**Goal**: Attendee browses events, registers for a ticket type, and receives a QR e-ticket stored offline on device.

**Independent Test**: Register a new user → refresh event list → tap published event → register for General ticket → verify QR appears in My Tickets → enable airplane mode → reopen My Tickets and confirm QR is visible.

### Backend — US1

- [X] T046 [P] [US1] Implement RegistrationRepository (create with atomic capacity lock, findByUserId, findByQrToken) in `backend/src/repositories/registration.repository.ts`
- [X] T047 [US1] Implement RegistrationService (register: check capacity with row lock, generate HMAC QR token, decrement count atomically in Prisma transaction; listByUser) in `backend/src/services/registration.service.ts`
- [X] T048 [US1] Implement registration routes + controller (POST /registrations, GET /registrations/me) in `backend/src/routes/registrations.routes.ts` and `backend/src/controllers/registrations.controller.ts`

### Android — US1

- [X] T049 [P] [US1] Define Retrofit API service interfaces (EventApiService, RegistrationApiService) in `android/app/src/main/java/com/eventmanager/data/remote/`
- [X] T050 [P] [US1] Implement Room entities and DAOs for EventEntity, TicketTypeEntity, RegistrationEntity in `android/app/src/main/java/com/eventmanager/data/local/`
- [X] T051 [US1] Implement EventRepository (fetchAndCacheEvents pull-to-refresh strategy, getEventById from cache) in `android/app/src/main/java/com/eventmanager/data/repository/EventRepository.kt`
- [X] T052 [US1] Implement GetEventsUseCase and GetEventDetailUseCase in `android/app/src/main/java/com/eventmanager/domain/usecase/`
- [X] T053 [US1] Implement EventListViewModel (pull-to-refresh, lastUpdated timestamp, UiState) in `android/app/src/main/java/com/eventmanager/presentation/events/EventListViewModel.kt`
- [X] T054 [US1] Implement EventListScreen (pull-to-refresh SwipeRefresh, event cards, sold-out badge, lastUpdated label) in `android/app/src/main/java/com/eventmanager/presentation/events/EventListScreen.kt`
- [X] T055 [US1] Implement EventDetailScreen (event info, ticket type list with availability, Register button per type) in `android/app/src/main/java/com/eventmanager/presentation/events/EventDetailScreen.kt`
- [X] T056 [US1] Implement RegistrationRepository (register API call, fetch my tickets, cache registrations in Room) in `android/app/src/main/java/com/eventmanager/data/repository/RegistrationRepository.kt`
- [X] T057 [US1] Implement RegisterForEventUseCase in `android/app/src/main/java/com/eventmanager/domain/usecase/RegisterForEventUseCase.kt`
- [X] T058 [US1] Implement RegistrationViewModel + RegistrationConfirmScreen (ticket type summary, confirm button, loading/error state) in `android/app/src/main/java/com/eventmanager/presentation/registration/`
- [X] T059 [P] [US1] Implement QrCodeGenerator (ZXing: render qrToken string to ImageBitmap) in `android/app/src/main/java/com/eventmanager/presentation/ticket/QrCodeGenerator.kt`
- [X] T060 [US1] Implement MyTicketsScreen (list cached registrations, display QR from Room offline) in `android/app/src/main/java/com/eventmanager/presentation/ticket/MyTicketsScreen.kt`
- [X] T061 [US1] Implement TicketDetailScreen (full-screen QR code display, event info, status badge) in `android/app/src/main/java/com/eventmanager/presentation/ticket/TicketDetailScreen.kt`

**Checkpoint**: Core product is functional. Attendee can register and show QR ticket offline.

---

## Phase 5: User Story 3 — Check-in Scan & Validate Ticket (Priority: P2)

**Goal**: Check-in operator scans an attendee's QR code and gets an instant Valid / Already Used / Invalid response. Every attempt is logged.

**Independent Test**: Navigate to check-in page → scan a valid QR → confirm green "Valid" with attendee name → scan the same QR again → confirm red "Already Used".

### Backend — US3

- [X] T062 [P] [US3] Implement CheckInRepository (createLog, markRegistrationUsed) in `backend/src/repositories/checkin.repository.ts`
- [X] T063 [US3] Implement CheckInService (verify HMAC signature, check registration status, atomic mark-as-used, write CheckInLog) in `backend/src/services/checkin.service.ts`
- [X] T064 [US3] Implement check-in routes + controller (POST /admin/checkin/scan, PATCH /admin/registrations/:id/checkin) in `backend/src/routes/admin/checkin.routes.ts` and `backend/src/controllers/admin/checkin.controller.ts`

### Admin-web — US3

- [X] T065 [P] [US3] Implement useCheckIn React Query mutation hooks (scanToken, manualCheckIn) in `admin-web/src/hooks/useCheckIn.ts`
- [X] T066 [P] [US3] Implement QrScanner component (html5-qrcode camera scan + manual token textarea fallback) in `admin-web/src/components/QrScanner.tsx`
- [X] T067 [P] [US3] Implement CheckInResultCard component (green Valid / red Already Used / red Invalid with attendee info) in `admin-web/src/components/CheckInResultCard.tsx`
- [X] T068 [US3] Implement CheckInPage (event selector, QrScanner, CheckInResultCard, scan history list) in `admin-web/src/pages/CheckInPage.tsx`

**Checkpoint**: Venue door check-in is operational. All scans are audit-logged.

---

## Phase 6: User Story 4 — Event Reminder Notifications (Priority: P2)

**Goal**: Android app schedules local notifications at T-24h and T-1h after registration. Reminders fire in background. User can disable per event.

**Independent Test**: Register for a test event 90 minutes in the future → confirm 1-hour reminder fires at correct time via WorkManager test utilities → disable reminder → confirm no notification fires.

### Android — US4

- [X] T069 [P] [US4] Implement ReminderWorker (show NotificationCompat with event name and start time) in `android/app/src/main/java/com/eventmanager/data/notification/ReminderWorker.kt`
- [X] T070 [P] [US4] Implement ReminderScheduler (schedule T-24h and T-1h OneTimeWorkRequests using WorkManager, skip past triggers, cancel by tag) in `android/app/src/main/java/com/eventmanager/data/notification/ReminderScheduler.kt`
- [X] T071 [US4] Integrate ReminderScheduler.schedule() call into RegisterForEventUseCase after successful registration in `android/app/src/main/java/com/eventmanager/domain/usecase/RegisterForEventUseCase.kt`
- [X] T072 [US4] Add reminder toggle switch to TicketDetailScreen; persist `reminderEnabled` in Room RegistrationEntity; call ReminderScheduler.cancel() on disable in `android/app/src/main/java/com/eventmanager/presentation/ticket/TicketDetailScreen.kt`
- [X] T073 [US4] Request notification permission (Android 13+) in onboarding/first-launch flow in `android/app/src/main/java/com/eventmanager/presentation/MainActivity.kt`

**Checkpoint**: Registered attendees receive timely reminders without any server involvement.

---

## Phase 7: User Story 5 — Organizer Views Attendee List & Check-in Status (Priority: P3)

**Goal**: Organizer sees full attendee list per event with real-time check-in status; can manually mark an attendee as checked in.

**Independent Test**: Register 3 test users → check in 1 via scanner → open attendee list → confirm 1 "Checked In" and 2 "Not Yet" → manually mark 1 more as checked in → refresh and confirm 2 "Checked In".

### Backend — US5

- [X] T074 [P] [US5] Extend EventRepository with paginated attendee list query (join Registration + User + TicketType, include checkedInAt) in `backend/src/repositories/event.repository.ts`
- [X] T075 [US5] Implement admin attendee list route + controller (GET /admin/events/:id/attendees) in `backend/src/routes/admin/attendees.routes.ts` and `backend/src/controllers/admin/attendees.controller.ts`

### Admin-web — US5

- [X] T076 [P] [US5] Implement useAttendees React Query hook (paginated fetch, refetch on manual refresh) in `admin-web/src/hooks/useAttendees.ts`
- [X] T077 [P] [US5] Implement AttendeeTable component (columns: name, email, ticket type, check-in status badge, manual check-in action button) in `admin-web/src/components/AttendeeTable.tsx`
- [X] T078 [US5] Implement AttendeeListPage (event header, AttendeeTable with pagination, manual check-in wired to useCheckIn mutation) in `admin-web/src/pages/AttendeeListPage.tsx`
- [X] T079 [US5] Add attendee list link to EventsPage event rows in `admin-web/src/pages/EventsPage.tsx`

**Checkpoint**: All 5 user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: UX hardening, security verification, and final validation across all sub-projects

- [X] T080 [P] Add loading skeleton components to Android event list and ticket screens in `android/app/src/main/java/com/eventmanager/presentation/components/`
- [X] T081 [P] Add loading skeletons and empty-state components to admin-web pages in `admin-web/src/components/`
- [X] T082 [P] Display "last updated at [timestamp]" label on Android EventListScreen after each pull-to-refresh in `android/app/src/main/java/com/eventmanager/presentation/events/EventListScreen.kt`
- [X] T083 [P] Add confirmation dialogs for all destructive actions in admin-web (cancel event, manual check-in override) in `admin-web/src/components/ConfirmDialog.tsx`
- [X] T084 [P] Add error boundary + network-error UI to Android screens in `android/app/src/main/java/com/eventmanager/presentation/components/ErrorState.kt`
- [X] T085 [P] Add offline error message to check-in page when network unavailable in `admin-web/src/pages/CheckInPage.tsx`
- [X] T086 Security audit: verify Android Keystore usage for tokens, confirm no PII in backend logs, test JWT access-token expiry + refresh flow across all three sub-projects
- [X] T087 Validate full stack against `specs/001-event-registration/quickstart.md` flows end-to-end (create event → register → check in → reminder)
- [X] T088 [P] Add missing DB indexes if any are absent after migration review in `backend/prisma/migrations/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US2 — Events)**: Depends on Phase 2
- **Phase 4 (US1 — Registration)**: Depends on Phase 2; requires Phase 3 backend (events API) for Android app to have data
- **Phase 5 (US3 — Check-in)**: Depends on Phase 2; requires Phase 3+4 to have registrations and QR tokens
- **Phase 6 (US4 — Reminders)**: Depends on Phase 4 Android registration flow (T057)
- **Phase 7 (US5 — Attendee List)**: Depends on Phase 4 (registrations) and Phase 5 (check-in status)
- **Phase 8 (Polish)**: Depends on all desired user stories complete

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|-----------|-----------------|
| US2 — Create Event | Phase 2 complete | T034 |
| US1 — Register | Phase 2 complete; US2 backend (T039) for events API | T039 |
| US3 — Check-in | Phase 2 complete; US1 backend (T048) for registrations | T048 |
| US4 — Reminders | US1 Android registration (T057) | T057 |
| US5 — Attendee List | US1 + US3 backend | T064 |

### Parallel Opportunities per Phase

**Phase 1**: T002, T003, T004, T005, T006, T007, T008 — all parallel  
**Phase 2**: T009→T010 sequential; then T011–T015 parallel; T023–T026 parallel; T030–T032 parallel  
**Phase 3**: T035+T036 parallel (backend repos); T040+T041+T042 parallel (admin-web components)  
**Phase 4**: T049+T050 parallel (Android data layer); T059 (QR generator) parallel with T056–T058  
**Phase 5**: T065+T066+T067 parallel (admin-web components)  
**Phase 6**: T069+T070 parallel (Worker + Scheduler)  
**Phase 7**: T076+T077 parallel (admin-web components)  
**Phase 8**: T080–T082, T083–T085, T088 all parallel  

---

## Implementation Strategy

### Suggested MVP Scope (Phases 1–4)

Phases 1 → 2 → 3 → 4 deliver a shippable product:
- Organizer creates and publishes events ✅
- Attendee discovers events, registers, receives QR ticket (offline) ✅
- Auth for both user types ✅

### Incremental Delivery

1. **MVP (Phases 1–4)** — Core registration + QR ticket: ~61 tasks
2. **v1.0 (+ Phase 5–6)** — Check-in scanning + reminders: ~74 tasks
3. **v1.1 (+ Phase 7–8)** — Attendee list + polish: ~88 tasks

### Total Tasks: 88
- Phase 1: 8 tasks
- Phase 2: 26 tasks (T009–T034)
- Phase 3 (US2): 11 tasks (T035–T045)
- Phase 4 (US1): 16 tasks (T046–T061)
- Phase 5 (US3): 7 tasks (T062–T068)
- Phase 6 (US4): 5 tasks (T069–T073)
- Phase 7 (US5): 6 tasks (T074–T079)
- Phase 8 (Polish): 9 tasks (T080–T088)

### Tasks per Sub-project
| Sub-project | Task count |
|-------------|-----------|
| Backend (Node.js) | ~35 |
| Android | ~33 |
| Admin-web (React) | ~20 |
