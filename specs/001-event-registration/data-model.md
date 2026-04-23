# Data Model: Event Registration App

**Phase**: 1 — Design & Contracts  
**Branch**: `001-event-registration`  
**Date**: 2026-04-22  
**Source**: `specs/001-event-registration/spec.md` — Key Entities section

---

## Entity Relationship Overview

```
User ──< Registration >── TicketType ──< Event >── Organizer
                              │
                         CheckInLog
```

- One **User** → many **Registrations**
- One **TicketType** → many **Registrations**
- One **Event** → many **TicketTypes**
- One **Organizer** → many **Events**
- One **Registration** → many **CheckInLogs** (normally 1 valid + possible
  duplicate-scan attempts)

---

## Entities

### User
Represents an attendee account, created via the mobile app sign-up flow.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | Generated server-side |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Used as login credential |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash; never returned in API responses |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Validation rules**:
- `email` must be a valid RFC 5321 address
- `password` (input only) minimum 8 characters; stored as bcrypt hash (cost 12)

---

### Organizer
Represents a staff account for the admin panel. Created by a system administrator;
no self-service sign-up.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `name` | VARCHAR(255) | NOT NULL | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login credential |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | ENUM | NOT NULL | `organizer` \| `checkin_operator` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Validation rules**:
- `role` must be one of `organizer`, `checkin_operator`
- `checkin_operator` accounts can only access the check-in page; no event-management rights

---

### Event
Represents a scheduled gathering created by an organizer.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `organizer_id` | UUID | FK → Organizer, NOT NULL | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | Optional rich text |
| `location` | VARCHAR(500) | NOT NULL | |
| `start_datetime` | TIMESTAMPTZ | NOT NULL | Stored in UTC |
| `end_datetime` | TIMESTAMPTZ | NOT NULL | Must be > `start_datetime` |
| `status` | ENUM | NOT NULL, DEFAULT `draft` | `draft` \| `published` \| `cancelled` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

**Validation rules**:
- `end_datetime` > `start_datetime`
- `status` transitions: `draft → published`, `draft → cancelled`, `published → cancelled`
  (cannot revert to `draft`; cannot un-cancel)
- Only `published` events are returned by the public mobile API

**State transitions**:
```
draft ──→ published ──→ cancelled
  └───────────────────→ cancelled
```

---

### TicketType
Represents a category of ticket within an event (e.g., General, VIP).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `event_id` | UUID | FK → Event, NOT NULL | Cascade delete with event |
| `name` | VARCHAR(100) | NOT NULL | e.g., "General Admission", "VIP" |
| `price` | NUMERIC(10,2) | NOT NULL, DEFAULT 0 | ≥ 0; 0 means free |
| `max_capacity` | INTEGER | NOT NULL | ≥ 1 |
| `registered_count` | INTEGER | NOT NULL, DEFAULT 0 | Incremented atomically on registration |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Constraints**:
- DB CHECK: `registered_count >= 0`
- DB CHECK: `registered_count <= max_capacity`
- DB CHECK: `max_capacity >= 1`
- DB CHECK: `price >= 0`

**Computed field** (not stored):
- `available_capacity` = `max_capacity - registered_count`
- `is_sold_out` = `registered_count >= max_capacity`

---

### Registration
Represents a user's confirmed attendance for a specific ticket type.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → User, NOT NULL | |
| `ticket_type_id` | UUID | FK → TicketType, NOT NULL | |
| `qr_token` | VARCHAR(512) | NOT NULL, UNIQUE | HMAC-SHA256 signed token |
| `status` | ENUM | NOT NULL, DEFAULT `active` | `active` \| `used` \| `void` |
| `registered_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Constraints**:
- UNIQUE(`user_id`, `ticket_type_id`) — one registration per user per ticket type per event

**Validation rules**:
- `qr_token` format: `base64url(eventId:registrationId):hmac` — generated server-side only
- Status transitions: `active → used` (on valid check-in scan), `active → void`
  (on event cancellation)

**QR Token generation**:
```
payload = base64url_encode(eventId + ":" + registrationId)
signature = hmac_sha256(payload, SERVER_SECRET)
qr_token = payload + "." + base64url_encode(signature)
```

---

### CheckInLog
Audit record of every scan attempt at the venue door.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `registration_id` | UUID | FK → Registration, NULLABLE | NULL if token is invalid/forged |
| `raw_token` | VARCHAR(512) | NOT NULL | The exact token string scanned |
| `operator_id` | UUID | FK → Organizer, NOT NULL | The check-in operator who performed the scan |
| `scanned_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `result` | ENUM | NOT NULL | `valid` \| `already_used` \| `invalid` |
| `event_id` | UUID | FK → Event, NOT NULL | Denormalized for easier event-level audit queries |

---

## Database Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `users` | `email` | UNIQUE | Login lookup |
| `organizers` | `email` | UNIQUE | Login lookup |
| `events` | `status, start_datetime` | COMPOSITE | Published event list (mobile app) |
| `ticket_types` | `event_id` | INDEX | Join on event detail |
| `registrations` | `user_id` | INDEX | My Tickets screen |
| `registrations` | `qr_token` | UNIQUE INDEX | Check-in token lookup (O(log n)) |
| `registrations` | `(user_id, ticket_type_id)` | UNIQUE | Prevent duplicate registrations |
| `checkin_logs` | `event_id, scanned_at` | COMPOSITE | Event audit log queries |

---

## Prisma Schema (reference)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  passwordHash  String         @map("password_hash")
  createdAt     DateTime       @default(now()) @map("created_at")
  registrations Registration[]

  @@map("users")
}

enum OrganizerRole {
  organizer
  checkin_operator
}

model Organizer {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String        @map("password_hash")
  role         OrganizerRole
  createdAt    DateTime      @default(now()) @map("created_at")
  events       Event[]
  checkInLogs  CheckInLog[]

  @@map("organizers")
}

enum EventStatus {
  draft
  published
  cancelled
}

model Event {
  id            String      @id @default(uuid())
  organizerId   String      @map("organizer_id")
  title         String
  description   String?
  location      String
  startDatetime DateTime    @map("start_datetime")
  endDatetime   DateTime    @map("end_datetime")
  status        EventStatus @default(draft)
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")
  organizer     Organizer   @relation(fields: [organizerId], references: [id])
  ticketTypes   TicketType[]
  checkInLogs   CheckInLog[]

  @@index([status, startDatetime])
  @@map("events")
}

model TicketType {
  id              String         @id @default(uuid())
  eventId         String         @map("event_id")
  name            String
  price           Decimal        @default(0) @db.Decimal(10, 2)
  maxCapacity     Int            @map("max_capacity")
  registeredCount Int            @default(0) @map("registered_count")
  createdAt       DateTime       @default(now()) @map("created_at")
  event           Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  registrations   Registration[]

  @@index([eventId])
  @@map("ticket_types")
}

enum RegistrationStatus {
  active
  used
  void
}

model Registration {
  id             String             @id @default(uuid())
  userId         String             @map("user_id")
  ticketTypeId   String             @map("ticket_type_id")
  qrToken        String             @unique @map("qr_token")
  status         RegistrationStatus @default(active)
  registeredAt   DateTime           @default(now()) @map("registered_at")
  user           User               @relation(fields: [userId], references: [id])
  ticketType     TicketType         @relation(fields: [ticketTypeId], references: [id])
  checkInLogs    CheckInLog[]

  @@unique([userId, ticketTypeId])
  @@index([userId])
  @@map("registrations")
}

enum CheckInResult {
  valid
  already_used
  invalid
}

model CheckInLog {
  id             String        @id @default(uuid())
  registrationId String?       @map("registration_id")
  rawToken       String        @map("raw_token")
  operatorId     String        @map("operator_id")
  eventId        String        @map("event_id")
  scannedAt      DateTime      @default(now()) @map("scanned_at")
  result         CheckInResult
  registration   Registration? @relation(fields: [registrationId], references: [id])
  operator       Organizer     @relation(fields: [operatorId], references: [id])
  event          Event         @relation(fields: [eventId], references: [id])

  @@index([eventId, scannedAt])
  @@map("checkin_logs")
}
```

---

## Android Local Cache (Room)

The Android app caches two entity types in Room for offline access:

### EventEntity (Room)
Maps to a subset of the `Event` + `TicketType` server response.

```kotlin
@Entity(tableName = "events")
data class EventEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String?,
    val location: String,
    val startDatetime: Long,   // epoch millis UTC
    val endDatetime: Long,
    val status: String,
    val cachedAt: Long         // epoch millis, used to show "last updated" timestamp
)
```

### TicketTypeEntity (Room)
```kotlin
@Entity(tableName = "ticket_types", foreignKeys = [
    ForeignKey(entity = EventEntity::class, parentColumns = ["id"],
               childColumns = ["eventId"], onDelete = ForeignKey.CASCADE)
])
data class TicketTypeEntity(
    @PrimaryKey val id: String,
    val eventId: String,
    val name: String,
    val price: Double,
    val maxCapacity: Int,
    val registeredCount: Int
)
```

### RegistrationEntity (Room)
Stores issued QR tickets for offline display.

```kotlin
@Entity(tableName = "registrations")
data class RegistrationEntity(
    @PrimaryKey val id: String,
    val ticketTypeId: String,
    val eventId: String,
    val eventTitle: String,    // denormalized for display
    val eventStartDatetime: Long,
    val qrToken: String,
    val status: String,        // active | used | void
    val registeredAt: Long,
    val reminderEnabled: Boolean  // user preference, stored locally only
)
```
