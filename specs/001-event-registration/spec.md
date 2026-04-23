# Feature Specification: Event Registration App

**Feature Branch**: `001-event-registration`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "Ứng dụng Tổ chức tạo Sự kiện các chức năng đơn giản, cấu hình số lượng/loại Vé. Người dùng đăng ký tham dự và nhận vé điện tử (QR). Ban tổ chức có trang check-in quét/xác thực vé tại cửa, kèm nhắc lịch trước giờ bắt đầu. Data cập nhật giữa app và BE không cần realtime — khi muốn xem data mới người dùng thực hiện refresh màn hình."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Attendee Registers for an Event (Priority: P1)

A registered user opens the Android app, browses the list of upcoming events,
selects one, chooses a ticket type (e.g., General or VIP), fills in their
attendee details, and confirms registration. The system issues a unique QR-code
ticket and stores it on the device for offline viewing.

**Why this priority**: Core value proposition — without registration and QR
issuance there is no product.

**Independent Test**: Can be fully tested by creating a test event with two ticket
types (General, VIP), registering as a user, and verifying that a QR-code ticket
appears in "My Tickets" and is viewable offline.

**Acceptance Scenarios**:

1. **Given** an event with available General tickets, **When** a user completes
   the registration form and confirms, **Then** the system records the registration,
   decrements the available ticket count by 1, and shows a QR-code ticket on screen.
2. **Given** an event where a ticket type has reached its maximum capacity,
   **When** a user attempts to register for that type, **Then** the system blocks
   registration and displays a "Sold Out" message for that ticket type.
3. **Given** a completed registration, **When** the user opens "My Tickets" while
   offline, **Then** the QR code is displayed from local cache without a network
   call.
4. **Given** a user who is not logged in, **When** they attempt to register,
   **Then** the system redirects them to the login/sign-up screen before proceeding.

---

### User Story 2 — Organizer Creates an Event with Ticket Types (Priority: P1)

An organizer logs in to the React admin panel, creates a new event (title,
description, date/time, location), and configures one or more ticket types, each
with a name, optional price, and a maximum-capacity number. The organizer
publishes the event so it becomes visible in the mobile app.

**Why this priority**: Without events and ticket configuration, attendees have
nothing to register for.

**Independent Test**: Can be fully tested by logging in as an organizer, creating
an event with two ticket types (Free – capacity 50, VIP – capacity 10), publishing
it, and verifying it appears in the mobile app's event list.

**Acceptance Scenarios**:

1. **Given** an organizer on the event-creation form, **When** they submit valid
   event details and at least one ticket type with a capacity > 0, **Then** the
   event is saved and listed as "Published" in the admin panel.
2. **Given** a form with a ticket type whose capacity is 0 or negative,
   **When** the organizer submits, **Then** the system displays a validation error
   and does not save.
3. **Given** a published event, **When** an attendee opens the mobile app and
   refreshes the event list, **Then** the new event appears.
4. **Given** an organizer, **When** they edit an existing event's details or ticket
   configuration, **Then** the changes are reflected on the next mobile app refresh.

---

### User Story 3 — Check-in Operator Scans & Validates a Ticket (Priority: P2)

At the venue entrance, a check-in operator opens the check-in page (mobile-
optimised React view) on a device, scans an attendee's QR code using the camera,
and instantly sees a pass or fail result. A ticket that has already been scanned
is explicitly rejected with an "Already Used" message.

**Why this priority**: Enables the physical event experience; required for any
real event but can be demonstrated with a mock ticket.

**Independent Test**: Can be fully tested by registering for a test event,
navigating to the check-in page, scanning the generated QR code, confirming
"Valid" response, scanning the same code again, and confirming "Already Used"
response.

**Acceptance Scenarios**:

1. **Given** a valid, unused QR ticket, **When** the operator scans it,
   **Then** the system marks it as used and displays a green "Valid – Check In
   Successful" confirmation with the attendee's name.
2. **Given** a QR ticket that was already scanned, **When** the operator scans it
   again, **Then** the system displays a red "Already Used" message and does not
   allow entry.
3. **Given** a QR code that does not correspond to any ticket in the system
   (forged or wrong event), **When** the operator scans it, **Then** the system
   displays a red "Invalid Ticket" message.
4. **Given** a check-in page, **When** the operator manually types a ticket token
   instead of scanning, **Then** the same validation logic applies.

---

### User Story 4 — Attendee Receives Event Reminder Notification (Priority: P2)

After registering for an event, the user's Android app automatically schedules
two local push notifications: one 24 hours before the event starts and one 1 hour
before. Notifications are shown even if the app is not open. The user can disable
reminders for a specific event from within the app.

**Why this priority**: Improves attendance and user experience, but the core
flow (register + check-in) works without it.

**Independent Test**: Can be fully tested by registering for a test event set
2 hours in the future, confirming that the 1-hour reminder fires at the correct
time, and verifying that disabling the reminder prevents the notification.

**Acceptance Scenarios**:

1. **Given** a confirmed registration for an event starting in more than 24 hours,
   **When** the registration is saved, **Then** the app schedules notifications
   for T-24h and T-1h.
2. **Given** a scheduled reminder, **When** the trigger time arrives and the app
   is in the background, **Then** the notification appears in the system tray with
   the event name and start time.
3. **Given** a user who has disabled reminders for a specific event,
   **When** the reminder time arrives, **Then** no notification is shown for that
   event.
4. **Given** a registration for an event starting in less than 1 hour,
   **When** registration is saved, **Then** only the remaining applicable reminder
   is scheduled (T-24h is skipped if already past).

---

### User Story 5 — Organizer Views Attendee List & Check-in Status (Priority: P3)

An organizer opens the admin panel, navigates to an event, and views the full list
of registered attendees with their ticket type and check-in status (checked in /
not yet). The organizer can manually mark an attendee as checked in if the scanner
is unavailable.

**Why this priority**: Useful operational tool, but not blocking for launch; the
check-in scanner covers the primary use case.

**Independent Test**: Can be fully tested by registering multiple test attendees,
checking in some via the scanner, and verifying the attendee list reflects the
correct status mix.

**Acceptance Scenarios**:

1. **Given** an event with registrations, **When** the organizer opens the attendee
   list, **Then** each row shows: attendee name, ticket type, and check-in status.
2. **Given** an attendee who has not been scanned, **When** the organizer manually
   marks them as checked in, **Then** the status updates and the check-in log
   records the manual action with the operator's identity.
3. **Given** an attendee list, **When** the organizer refreshes the page,
   **Then** the latest check-in statuses are fetched from the server.

---

### Edge Cases

- What happens when a user registers but the event is cancelled before the event
  date? (System MUST notify the user and mark their ticket as void.)
- What happens if two users simultaneously register for the last available ticket?
  (Server-side atomic capacity decrement; only one succeeds; the other receives a
  "Sold Out" error.)
- What happens if the device clock is wrong when a reminder is scheduled?
  (Reminders use absolute UTC timestamps from the server-provided event datetime.)
- What happens when the check-in device has no internet connection?
  (The check-in page requires a network call per scan; an offline error message
  MUST be shown and the scan rejected until connectivity is restored.)
- What happens when a user loses their device and reinstalls the app?
  (QR tickets MUST be re-downloadable from the server after re-login.)

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Accounts
- **FR-001**: Users (attendees) MUST be able to register an account with email and
  password.
- **FR-002**: Users MUST be able to log in and receive a session that persists
  across app restarts.
- **FR-003**: Organizers MUST authenticate via the admin panel using separate
  credentials; organizer accounts are created by the system administrator.

#### Event Management (Admin Panel)
- **FR-004**: Organizers MUST be able to create an event with: title, description,
  start date/time, end date/time, and location.
- **FR-005**: Organizers MUST be able to configure one or more ticket types per
  event, each with a name, price (≥ 0), and integer maximum capacity (≥ 1).
- **FR-006**: Organizers MUST be able to publish or unpublish an event; only
  published events are visible in the mobile app.
- **FR-007**: Organizers MUST be able to edit event details and ticket configuration
  before the event starts.

#### Event Discovery & Registration (Mobile App)
- **FR-008**: The app MUST display a list of published upcoming events, refreshable
  by pull-to-refresh; no automatic background sync.
- **FR-009**: Each event entry MUST show: title, date/time, location, and available
  ticket types with remaining capacity.
- **FR-010**: Users MUST be able to select a ticket type and complete registration
  in a single confirmation step.
- **FR-011**: The system MUST atomically enforce ticket capacity; it MUST NOT allow
  the registered count to exceed the configured maximum for any ticket type.

#### Digital Ticket (QR Code)
- **FR-012**: Upon successful registration, the system MUST generate a unique,
  server-signed QR ticket token and deliver it to the mobile app.
- **FR-013**: The QR ticket MUST be stored locally on the device and displayable
  offline.
- **FR-014**: If the user reinstalls the app, previously issued QR tickets MUST be
  re-downloadable from the server after re-login.

#### Check-in (Admin Panel)
- **FR-015**: The admin panel MUST provide a mobile-optimised check-in page
  accessible to check-in operators.
- **FR-016**: The check-in page MUST support QR-code scanning via device camera
  and manual token entry.
- **FR-017**: Each scan MUST return one of three results: Valid (unused ticket for
  this event), Already Used, or Invalid (not found / wrong event / forged).
- **FR-018**: A valid scan MUST atomically mark the ticket as used; subsequent
  scans of the same token MUST return "Already Used".
- **FR-019**: Every scan attempt MUST be logged with timestamp, operator identity,
  ticket token, and result.

#### Reminders (Mobile App)
- **FR-020**: Upon registration, the app MUST schedule local notifications at T-24h
  and T-1h before the event start (skipping any trigger already in the past).
- **FR-021**: Users MUST be able to disable reminders per event from app settings.
- **FR-022**: Reminders MUST fire when the app is in the background or closed.
  No server-side push is required.

### Key Entities

- **User**: An attendee account. Attributes: id, name, email (unique), hashed
  password, created_at.
- **Organizer**: An admin-panel user. Attributes: id, name, email, hashed
  password, role (Organizer / CheckInOperator).
- **Event**: A published gathering. Attributes: id, title, description,
  location, start_datetime, end_datetime, status (draft / published / cancelled),
  organizer_id.
- **TicketType**: A category of ticket within an event. Attributes: id, event_id,
  name, price, max_capacity, registered_count.
- **Registration**: A user's claim on a ticket type. Attributes: id, user_id,
  ticket_type_id, qr_token (signed, unique), status (active / used / void),
  registered_at.
- **CheckInLog**: Audit record of each scan. Attributes: id, registration_id (or
  raw token if invalid), operator_id, scanned_at, result (valid / already_used /
  invalid).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new attendee can discover an event and complete registration in
  under 2 minutes from opening the app.
- **SC-002**: A check-in operator can process one attendee (scan → result) in under
  5 seconds under normal conditions.
- **SC-003**: The system prevents overbooking 100% of the time: registered count
  MUST never exceed configured capacity for any ticket type.
- **SC-004**: QR tickets are available for offline display within 1 second of
  opening "My Tickets" when previously downloaded.
- **SC-005**: Reminder notifications are delivered within 5 minutes of the
  scheduled trigger time on 95% of devices.
- **SC-006**: An organizer can create and publish a complete event (with two ticket
  types) in under 5 minutes using the admin panel.
- **SC-007**: All check-in scan attempts (valid, used, invalid) are logged and
  retrievable for post-event audit with no gaps.

---

## Assumptions

- Users have an Android device running Android 8.0 (API 26) or higher.
- Organisers use the React admin panel on a desktop or tablet browser; the check-in
  view is used on a phone or tablet with a camera.
- Internet connectivity is required for registration and check-in; offline use is
  limited to viewing already-downloaded ticket QR codes.
- Data between the mobile app and backend is synchronised on-demand (pull-to-
  refresh only); no WebSocket or push-sync mechanism is implemented.
- Email notification of QR tickets (post-registration) is out of scope for v1;
  only in-app delivery is required.
- Payment processing for paid ticket types is out of scope for v1; price is
  displayed informatively only.
- The system administrator creates organizer and check-in operator accounts
  manually; self-service sign-up is for attendees only.
- Event cancellation notifications to attendees are handled by marking tickets as
  void; in-app push notifications for cancellations are out of scope for v1.
