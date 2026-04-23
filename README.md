# Event Manager

Ứng dụng quản lý sự kiện gồm 3 sub-project:

| Sub-project | Stack | Mô tả |
|-------------|-------|-------|
| `backend/` | Node.js 20 + TypeScript + Express + Prisma + PostgreSQL | REST API |
| `admin-web/` | React 18 + Vite + TypeScript + TanStack Query | Trang quản trị |
| `android/` | Kotlin + Jetpack Compose + Hilt + Retrofit + Room | App Android |

---

## Tính năng

- **Organizer**: Tạo/chỉnh sửa sự kiện, cấu hình loại vé (tên, giá, số lượng), publish/cancel sự kiện
- **Attendee**: Đăng ký tham dự, nhận vé điện tử QR, xem vé offline
- **Check-in**: Quét QR hoặc check-in thủ công tại cửa, xem danh sách attendees
- **Nhắc lịch**: Thông báo trước giờ bắt đầu sự kiện (T-24h, T-1h)

---

## Yêu cầu

| Tool | Version |
|------|---------|
| Node.js | 20 LTS |
| npm | 10+ |
| PostgreSQL | 16 |
| Android Studio | Hedgehog (2023.1.1)+ |
| JDK | 17 |

---

## Cài đặt và chạy

### 1. Clone

```bash
git clone <repo-url> event_manager
cd event_manager
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/event_manager_dev"
JWT_SECRET="change-me-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
QR_HMAC_SECRET="change-me-in-production"
PORT=3000
NODE_ENV=development
```

Chạy migration và seed:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Khởi động:

```bash
npm run dev
# API: http://localhost:3000/api/v1
```

**Tài khoản mặc định sau seed:**

| Role | Email | Password |
|------|-------|----------|
| Organizer | `organizer@example.com` | `Organizer@123` |
| Check-in Operator | `checkin@example.com` | `Operator@123` |

### 3. Admin Web

```bash
cd admin-web
npm install
cp .env.example .env.local
# Đặt VITE_API_BASE_URL=http://localhost:3000/api/v1
npm run dev
# Mở http://localhost:5173
```

### 4. Android

Mở thư mục `android/` trong Android Studio, sync Gradle, rồi chạy trên emulator hoặc thiết bị thật.

Đặt `BASE_URL` trong `data/remote/NetworkModule.kt` trỏ tới IP máy chủ backend (cùng mạng WiFi):

```kotlin
private const val BASE_URL = "http://192.168.x.x:3000/api/v1/"
```

---

## API Endpoints

### Auth
| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| POST | `/api/v1/auth/register` | — | Đăng ký tài khoản attendee |
| POST | `/api/v1/auth/login` | — | Đăng nhập |
| POST | `/api/v1/auth/refresh` | — | Refresh access token |
| POST | `/api/v1/auth/logout` | Bearer | Đăng xuất |

### Events (Public)
| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/v1/events` | — | Danh sách sự kiện đã published |
| GET | `/api/v1/events/:id` | — | Chi tiết sự kiện |

### Registrations (Attendee)
| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| POST | `/api/v1/registrations` | Bearer (attendee) | Đăng ký tham dự |
| GET | `/api/v1/registrations/me` | Bearer (attendee) | Danh sách vé của tôi |

### Admin
| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/v1/admin/events` | Bearer (organizer) | Danh sách sự kiện của organizer |
| POST | `/api/v1/admin/events` | Bearer (organizer) | Tạo sự kiện |
| PUT | `/api/v1/admin/events/:id` | Bearer (organizer) | Cập nhật sự kiện |
| PATCH | `/api/v1/admin/events/:id/status` | Bearer (organizer) | Đổi trạng thái sự kiện |
| GET | `/api/v1/admin/events/:id/attendees` | Bearer (organizer) | Danh sách attendees |
| POST | `/api/v1/admin/checkin/scan` | Bearer (organizer/checkin_operator) | Quét QR check-in |
| PATCH | `/api/v1/admin/checkin/registrations/:id/checkin` | Bearer (organizer/checkin_operator) | Check-in thủ công |

---

## Cấu trúc thư mục

```
event_manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── utils/
├── admin-web/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── router/
│       └── services/
├── android/
│   └── app/src/main/java/com/eventmanager/
│       ├── data/
│       ├── di/
│       ├── domain/
│       └── presentation/
└── specs/
    └── 001-event-registration/
```

---

## Chạy tests

```bash
# Backend
cd backend
npm test
npm run test:coverage
```

---

## CI/CD

GitHub Actions được cấu hình tại `.github/workflows/ci.yml`:
- **backend**: lint + test với PostgreSQL service container
- **admin-web**: build check
- **android**: Gradle build check


### Web Admin
<img width="2880" height="1300" alt="image" src="https://github.com/user-attachments/assets/66a20f36-670c-4c1f-8e4c-94f641b19e45" />

### Mobile App
<img width="1080" height="2400" alt="Screenshot_1776916942" src="https://github.com/user-attachments/assets/f852d44d-77af-4588-932f-17ef56de832e" />
<img width="1080" height="2400" alt="Screenshot_1776916949" src="https://github.com/user-attachments/assets/5b3455df-2f2c-4e3f-a2af-1a564be5c854" />
<img width="1080" height="2400" alt="Screenshot_1776916957" src="https://github.com/user-attachments/assets/11bb504a-4223-4f7b-8a46-1f68b7e1bf64" />
