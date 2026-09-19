# 🚆 RailGo — Enterprise Train Ticket Booking Platform

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Security-Spring_Security_%2B_JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/OpenAPI-Swagger_3-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui.html)

A full-stack, enterprise-ready **Train Ticket Booking Platform** built with **Spring Boot 3 (Java 21), React (Vite + Tailwind CSS + Framer Motion), MySQL / H2, Spring Security + JWT**, and OpenPDF for official electronic boarding passes.

---

## 🌟 Key Highlights & Portfolio Capabilities

1. **Anti-Double Booking & Concurrency Engine**:
   - Database transactions (`@Transactional`) with **pessimistic write locking** (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) on `SeatInventory`.
   - Temporary seat locking (5 minutes expiry) with automated scheduled background releases (`@Scheduled(fixedRate = 60000)`).
   - Database-level unique constraint guards on `(train_schedule_id, seat_id)`.

2. **Route Progression & Stop Sequence Matching**:
   - Trains contain ordered intermediate `TrainStop` stops (e.g. Mumbai CSMT → Kalyan → Lonavala → Pune).
   - Dynamic stop routing matches any origin and destination pair where `stopNumber(origin) < stopNumber(destination)`, accurately calculating departure timings, arrival timings, duration, and intermediate halt counts.

3. **Dynamic Distance-Based Fare Engine**:
   - Distance (km) between origin stop and destination stop multiplied by Indian Railways class multipliers (`1A`, `2A`, `3A`, `SL`, `CC`, `2S`).
   - Auto-calculation of fixed reservation fee and 5% GST on AC coaches.
   - Verified automated cancellation refund calculation deducting standard class fees.

4. **Authentic Interactive Coach Seat Maps**:
   - Visual coach layouts for Indian Railways sleeper bays (Lower, Middle, Upper, Side Lower, Side Upper) and Chair Car (3x2 Window/Aisle).
   - Real-time berth status: Available, Selected, and Occupied.

5. **Official Electronic Ticket Slip (PDF)**:
   - Server-side streaming PDF generation using OpenPDF with authentic PNR header, passenger berth list, barcode, tax audit, and instructions.

6. **Role-Based Access Control (RBAC)**:
   - Stateless JWT tokens with roles: `ROLE_USER` and `ROLE_ADMIN`.
   - Method security: `@PreAuthorize("hasRole('ADMIN')")`.

7. **Executive Admin Console & Analytics**:
   - Real-time KPI cards (Total Users, Active Trains, Confirmed Bookings, Gross Revenue).
   - Visual 7-day bookings and revenue trend chart.
   - Train occupancy fleet monitoring (e.g. 92% Deccan Express, 87% Pragati Express).
   - Class revenue breakdown, train schedule manager, and passenger audit.

---

## 🏗️ Architecture & Database Schema

```
User (id, name, email, mobile, password, role)
 └── Booking (id, pnr, schedule, fromStation, toStation, date, baseFare, reservationFee, gst, totalAmount, status)
       ├── Passenger (id, name, age, gender, coach, seatNumber, berthType)
       ├── SeatInventory (id, schedule, seat, status: AVAILABLE/LOCKED/BOOKED, lockedUntil)
       └── Payment (id, transactionId, amount, method, status)

Station (id, code, name, city, state)
Train (id, trainNumber, trainName, type, source, destination, departure, arrival, distance)
 ├── TrainStop (id, train, station, stopNumber, arrivalTime, departureTime, distanceKm, haltMinutes)
 └── Coach (id, train, coachNumber, coachType, totalSeats)
       └── Seat (id, coach, seatNumber, seatType)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Java 21+
- Apache Maven 3.9+
- Node.js 18+ and npm 9+
- MySQL 8.0 (Optional: Application defaults to in-memory H2 with pre-seeded data for instant out-of-the-box evaluation)

### 1. Backend Setup (Spring Boot)
```bash
cd backend

# Run with in-memory H2 profile (zero DB setup required):
mvn spring-boot:run

# Or run with MySQL profile:
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```
* Backend starts at `http://localhost:8080`.
* Swagger OpenAPI Docs: `http://localhost:8080/swagger-ui.html`.
* H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:railgodb`).

### 2. Frontend Setup (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
* Frontend starts at `http://localhost:5173`.

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Demo Passenger** | `user@railgo.com` | `user123` | Search, Seat Selection, Bookings, PNR, PDF Tickets, Profile |
| **Demo Admin** | `admin@railgo.com` | `admin123` | Executive Dashboard, Revenue Analytics, Fleet, Stations, Users |

*(Quick 1-click buttons are also provided on the `/login` page for fast sign-in)*

---

## 📡 REST API Summary

### Authentication
- `POST /api/auth/register` — Register passenger account
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/refresh` — Refresh expired token
- `GET /api/auth/me` — Current user info

### Trains & Schedules
- `GET /api/trains/search?from=CSMT&to=PUNE&date=2026-09-25&class=3A` — Multi-stop train search
- `GET /api/trains/{id}` — Full itinerary, stops schedule, and coach manifests
- `GET /api/trains/schedule/{scheduleId}/seats` — Real-time coach seat map & availability

### Bookings & Concurrency
- `POST /api/bookings/lock-seats` — Temporarily lock berths for 5 minutes
- `POST /api/bookings` — Create and confirm booking with payment
- `GET /api/bookings/pnr/{pnr}` — Look up booking by PNR
- `GET /api/bookings/my-bookings` — List authenticated user's trip history
- `POST /api/bookings/{pnr}/cancel` — Cancel booking with instant refund calculation
- `GET /api/bookings/{pnr}/ticket-pdf` — Download official E-ticket reservation slip

### Admin Operations
- `GET /api/admin/dashboard` — Platform KPIs, trend metrics, occupancy rates
- `GET /api/admin/bookings` — Audit all platform reservations
- `GET /api/admin/trains` — Fleet inventory & status toggles
- `GET /api/admin/users` — Passenger directory

---

## 🧪 Testing Suite
Run unit and integration tests:
```bash
cd backend
mvn test
```
- Tests distance-based base fare computation.
- Tests 5% GST computation on AC classes vs non-AC classes.
- Tests cancellation refund algorithms across different classes.
