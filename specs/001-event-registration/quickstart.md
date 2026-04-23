# Quickstart: Event Registration App

**Branch**: `001-event-registration`  
**Date**: 2026-04-22

This guide gets all three sub-projects running locally from scratch.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 10+ | bundled with Node |
| PostgreSQL | 16 | https://postgresql.org or Docker |
| Android Studio | Hedgehog (2023.1.1)+ | https://developer.android.com/studio |
| JDK | 17 | bundled with Android Studio |
| Git | any | https://git-scm.com |

---

## 1 — Clone & Repository Layout

```bash
git clone <repo-url> event_manager
cd event_manager
```

```
event_manager/
├── android/        # Android mobile app
├── backend/        # Node.js REST API
└── admin-web/      # React admin panel
```

---

## 2 — Backend (Node.js + PostgreSQL)

### 2.1 Create the database

```bash
# Using psql (or replace with your preferred client)
psql -U postgres -c "CREATE DATABASE event_manager_dev;"
psql -U postgres -c "CREATE DATABASE event_manager_test;"
```

### 2.2 Install dependencies

```bash
cd backend
npm install
```

### 2.3 Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/event_manager_dev"
JWT_SECRET="change-me-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
QR_HMAC_SECRET="change-me-in-production"
PORT=3000
NODE_ENV=development
```

### 2.4 Run migrations & seed

```bash
npx prisma migrate dev --name init
npx prisma db seed          # creates a default admin organizer account
```

Default seed organizer credentials:
- Email: `admin@eventmanager.local`
- Password: `Admin1234!`

### 2.5 Start development server

```bash
npm run dev
# API available at http://localhost:3000/api/v1
```

### 2.6 Run tests

```bash
npm test                    # unit + integration (uses event_manager_test DB)
npm run test:coverage       # with coverage report
```

---

## 3 — Admin Web Panel (React)

### 3.1 Install dependencies

```bash
cd admin-web
npm install
```

### 3.2 Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3.3 Start development server

```bash
npm run dev
# Admin panel available at http://localhost:5173
```

Log in with the seeded organizer credentials above.

### 3.4 Run tests

```bash
npm test                    # Vitest + React Testing Library
npm run test:coverage
```

---

## 4 — Android App

### 4.1 Open in Android Studio

1. Open Android Studio → **Open an existing project** → select `event_manager/android/`.
2. Wait for Gradle sync to complete.

### 4.2 Configure the API base URL

Edit `android/app/src/main/java/com/eventmanager/data/remote/NetworkConfig.kt`:

```kotlin
object NetworkConfig {
    // For emulator: 10.0.2.2 points to host machine localhost
    const val BASE_URL = "http://10.0.2.2:3000/api/v1/"
}
```

For a physical device on the same network, replace with your machine's local IP.

### 4.3 Run on emulator

1. Open **Device Manager** in Android Studio → create an AVD (API 34 recommended).
2. Click **Run** (▶) to build and install on the emulator.

### 4.4 Run tests

```bash
# From android/ directory or use Android Studio's test runner
./gradlew test              # unit tests (JVM)
./gradlew connectedAndroidTest   # instrumented UI tests (requires running emulator/device)
```

---

## 5 — Full Local Stack (All Three Services)

Run each in a separate terminal:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Admin Web
cd admin-web && npm run dev

# Terminal 3 — (Optional) Prisma Studio for DB inspection
cd backend && npx prisma studio
```

Then launch the Android emulator from Android Studio.

---

## 6 — Key Developer Flows

### Create an event (admin panel)
1. Open http://localhost:5173 → log in as organizer
2. **Events** → **New Event** → fill title, dates, location
3. Add ticket types (name, price, capacity)
4. **Save as Draft** → **Publish**

### Register as an attendee (Android app)
1. Sign up → confirm email (v1: no email verification, instant account)
2. Pull-to-refresh on Events screen → tap an event → select ticket type → Confirm
3. QR ticket appears in **My Tickets**

### Check in an attendee (admin panel)
1. Log in as a check-in operator → **Check-in** → select event
2. Tap **Scan QR** → allow camera → scan attendee's QR code
3. Green "Valid" or red "Already Used / Invalid" result shown

---

## 7 — Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Prisma connection string |
| `JWT_SECRET` | ✅ | Signing secret for access tokens |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | e.g., `15m` |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | e.g., `7d` |
| `QR_HMAC_SECRET` | ✅ | Signing secret for QR tokens |
| `PORT` | optional | Default: `3000` |
| `NODE_ENV` | optional | `development` \| `test` \| `production` |

### Admin Web (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL |
