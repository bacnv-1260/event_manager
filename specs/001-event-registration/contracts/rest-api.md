# REST API Contract: Event Manager Backend

**Version**: v1  
**Base URL**: `https://<host>/api/v1`  
**Auth**: Bearer JWT (access token) in `Authorization` header for protected routes  
**Content-Type**: `application/json` for all requests and responses  
**Date format**: ISO 8601 UTC (`2026-04-22T10:00:00Z`)

---

## Authentication

### POST /api/v1/auth/register
Register a new attendee account.

**Auth required**: No

**Request body**:
```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "secret123"
}
```

**Success 201**:
```json
{
  "user": {
    "id": "uuid",
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "createdAt": "2026-04-22T10:00:00Z"
  },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

**Error 400** — Validation failure:
```json
{ "error": "VALIDATION_ERROR", "details": [{ "field": "email", "message": "Invalid email" }] }
```

**Error 409** — Email already in use:
```json
{ "error": "EMAIL_CONFLICT", "message": "Email already registered" }
```

---

### POST /api/v1/auth/login
Log in as an attendee or organizer.

**Auth required**: No

**Request body**:
```json
{ "email": "a@example.com", "password": "secret123" }
```

**Success 200**:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": { "id": "uuid", "name": "Nguyen Van A", "role": "attendee" }
}
```
> `role` is `"attendee"` for users, `"organizer"` or `"checkin_operator"` for organizers.

**Error 401**:
```json
{ "error": "INVALID_CREDENTIALS" }
```

---

### POST /api/v1/auth/refresh
Exchange a refresh token for a new access token.

**Auth required**: No

**Request body**:
```json
{ "refreshToken": "<jwt>" }
```

**Success 200**:
```json
{ "accessToken": "<jwt>" }
```

**Error 401**:
```json
{ "error": "INVALID_REFRESH_TOKEN" }
```

---

### POST /api/v1/auth/logout
Invalidate the current refresh token.

**Auth required**: Yes (Bearer)

**Success 204**: No body.

---

## Events (Public — Mobile App)

### GET /api/v1/events
List published upcoming events. Pull-on-demand; no server push.

**Auth required**: No

**Query parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Pagination |
| `limit` | integer | 20 | Max 50 |

**Success 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Tech Conference 2026",
      "description": "Annual tech event",
      "location": "Ho Chi Minh City Convention Centre",
      "startDatetime": "2026-05-01T08:00:00Z",
      "endDatetime": "2026-05-01T17:00:00Z",
      "ticketTypes": [
        {
          "id": "uuid",
          "name": "General Admission",
          "price": 0,
          "maxCapacity": 200,
          "availableCapacity": 45,
          "isSoldOut": false
        },
        {
          "id": "uuid",
          "name": "VIP",
          "price": 500000,
          "maxCapacity": 20,
          "availableCapacity": 0,
          "isSoldOut": true
        }
      ]
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5 }
}
```

---

### GET /api/v1/events/:eventId
Get a single published event detail.

**Auth required**: No

**Success 200**: Same shape as a single item from `GET /api/v1/events`.

**Error 404**:
```json
{ "error": "EVENT_NOT_FOUND" }
```

---

## Registrations (Mobile App)

### POST /api/v1/registrations
Register the authenticated user for a ticket type.

**Auth required**: Yes (Bearer — attendee)

**Request body**:
```json
{ "ticketTypeId": "uuid" }
```

**Success 201**:
```json
{
  "registration": {
    "id": "uuid",
    "ticketTypeId": "uuid",
    "eventId": "uuid",
    "eventTitle": "Tech Conference 2026",
    "eventStartDatetime": "2026-05-01T08:00:00Z",
    "qrToken": "<hmac-token>",
    "status": "active",
    "registeredAt": "2026-04-22T10:05:00Z"
  }
}
```

**Error 409** — Already registered:
```json
{ "error": "ALREADY_REGISTERED" }
```

**Error 422** — Sold out:
```json
{ "error": "TICKET_SOLD_OUT", "message": "No tickets remaining for this ticket type" }
```

**Error 404** — Ticket type not found:
```json
{ "error": "TICKET_TYPE_NOT_FOUND" }
```

---

### GET /api/v1/registrations/me
List all registrations for the authenticated user (My Tickets).

**Auth required**: Yes (Bearer — attendee)

**Success 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "ticketTypeId": "uuid",
      "ticketTypeName": "General Admission",
      "eventId": "uuid",
      "eventTitle": "Tech Conference 2026",
      "eventStartDatetime": "2026-05-01T08:00:00Z",
      "eventLocation": "Ho Chi Minh City Convention Centre",
      "qrToken": "<hmac-token>",
      "status": "active",
      "registeredAt": "2026-04-22T10:05:00Z"
    }
  ]
}
```

---

## Events — Admin Panel

### POST /api/v1/admin/events
Create a new event.

**Auth required**: Yes (Bearer — organizer role only)

**Request body**:
```json
{
  "title": "Tech Conference 2026",
  "description": "Annual tech event",
  "location": "Ho Chi Minh City Convention Centre",
  "startDatetime": "2026-05-01T08:00:00Z",
  "endDatetime": "2026-05-01T17:00:00Z",
  "ticketTypes": [
    { "name": "General Admission", "price": 0, "maxCapacity": 200 },
    { "name": "VIP", "price": 500000, "maxCapacity": 20 }
  ]
}
```

**Success 201**:
```json
{
  "event": {
    "id": "uuid",
    "status": "draft",
    "title": "Tech Conference 2026",
    "ticketTypes": [{ "id": "uuid", "name": "General Admission", "price": 0, "maxCapacity": 200 }]
  }
}
```

**Error 400** — Validation:
```json
{ "error": "VALIDATION_ERROR", "details": [{ "field": "ticketTypes[0].maxCapacity", "message": "Must be ≥ 1" }] }
```

---

### PUT /api/v1/admin/events/:eventId
Update event details (before event start only).

**Auth required**: Yes (Bearer — organizer, owner of event)

**Request body**: Same shape as POST, all fields optional.

**Success 200**: Updated event object.

**Error 403**: Organizer does not own this event.

**Error 422**:
```json
{ "error": "EVENT_ALREADY_STARTED", "message": "Cannot edit an event that has already started" }
```

---

### PATCH /api/v1/admin/events/:eventId/status
Publish or cancel an event.

**Auth required**: Yes (Bearer — organizer, owner of event)

**Request body**:
```json
{ "status": "published" }
```
> Allowed values: `"published"`, `"cancelled"`

**Success 200**: Updated event object.

**Error 422**:
```json
{ "error": "INVALID_STATUS_TRANSITION", "message": "Cannot transition from cancelled to published" }
```

---

### GET /api/v1/admin/events
List all events created by the authenticated organizer.

**Auth required**: Yes (Bearer — organizer)

**Success 200**:
```json
{
  "data": [
    { "id": "uuid", "title": "...", "status": "published", "startDatetime": "...", "registrationCount": 120 }
  ]
}
```

---

### GET /api/v1/admin/events/:eventId/attendees
List attendees for an event with check-in status.

**Auth required**: Yes (Bearer — organizer or checkin_operator)

**Query parameters**: `page`, `limit` (same as public events list)

**Success 200**:
```json
{
  "data": [
    {
      "registrationId": "uuid",
      "userName": "Nguyen Van A",
      "userEmail": "a@example.com",
      "ticketTypeName": "General Admission",
      "status": "active",
      "checkedInAt": null
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 120 }
}
```

---

## Check-in

### POST /api/v1/admin/checkin/scan
Validate and consume a QR token.

**Auth required**: Yes (Bearer — organizer or checkin_operator)

**Request body**:
```json
{ "qrToken": "<hmac-token>", "eventId": "uuid" }
```

**Success 200 — Valid**:
```json
{
  "result": "valid",
  "attendee": {
    "name": "Nguyen Van A",
    "ticketTypeName": "General Admission",
    "registrationId": "uuid"
  }
}
```

**Success 200 — Already Used**:
```json
{
  "result": "already_used",
  "firstScannedAt": "2026-05-01T07:45:00Z"
}
```

**Success 200 — Invalid**:
```json
{
  "result": "invalid",
  "message": "Token not found or does not belong to this event"
}
```

> All three outcomes return HTTP 200. The `result` field determines the UI response.
> Every scan is logged regardless of outcome.

---

### PATCH /api/v1/admin/registrations/:registrationId/checkin
Manual check-in by organizer (fallback when scanner is unavailable).

**Auth required**: Yes (Bearer — organizer)

**Success 200**:
```json
{ "registrationId": "uuid", "status": "used", "checkedInAt": "2026-05-01T08:12:00Z" }
```

**Error 409**:
```json
{ "error": "ALREADY_CHECKED_IN" }
```

---

## Common Error Shape

All errors follow this envelope:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "details": []
}
```

| HTTP Status | When used |
|-------------|-----------|
| 400 | Malformed JSON or missing required fields |
| 401 | Missing or invalid/expired access token |
| 403 | Valid token but insufficient role/permission |
| 404 | Resource not found |
| 409 | Business-rule conflict (duplicate, already-used) |
| 422 | Semantically invalid request (sold-out, invalid state transition) |
| 500 | Unexpected server error (never exposes stack trace) |

---

## Pagination

All list endpoints return:
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 123 }
}
```
