# Smart Event Management System

A production-ready, feature-rich **Smart Event Management System** featuring a robust Spring Boot backend API and a modern, responsive React frontend.

## 📂 Project Structure

- **`/backend`**: The Spring Boot backend codebase. Mapped with JWT security, PostgreSQL database, QR code generation, and automated PDF ticket printing.
- **`/frontend`**: The React client SPA scaffolded with Vite, TypeScript, and Tailwind CSS v4.

---

## 🌟 Key System Features

The Smart Event Management System includes the following modules:

### 🔒 1. User Authentication & Authorization
* **Secure JWT Session Flow**: Utilizes Spring Security filters to generate, inject, and validate JSON Web Tokens for API authorization.
* **BCrypt Hashing**: Encrypts credentials with strong one-way hashing algorithms.
* **Role-Based Access Control (RBAC)**: Distinguishes permissions between `ADMIN` and `USER` access nodes.
* **Axios Interceptors**: Attaches headers automatically and handles unauthenticated 401 session expirations dynamically.
* **Self-Contained Profile Fetching**: Includes endpoints to query and sync active user parameters.

### 📅 2. Event & Category Modules
* **Advanced Multi-Criteria Search**: Dynamic searches matching query keywords against title strings, categories, locations, and organizers.
* **Flexible Filter Sliders**: Sorts events by categories, starting and ending dates, venue locations, and maximum pricing ranges.
* **Sorting Capabilities**: Re-orders events on the fly based on ticket price, dates, or booking popularity.
* **Admin Event CRUD**: Creates, updates, and removes event entities. Updates seat capacities dynamically and controls event statuses (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`).
* **Category Manager**: Inline editing system to organize, classify, and filter events.

### 🎟️ 3. Safe Seat Allocation & Booking Engine
* **Double-Booking Mitigation**: Uses synchronized transactional blocks to prevent concurrent over-booking.
* **Seat Accounting**: Automatically reduces available seat counters upon successful reservations, and restores capacity upon booking cancellations.
* **Booking Ledger**: Maintains database history separating upcoming events from previous attendances.
* **Booking Cancellation Policy**: Restricts users from cancelling reservations for events that have already transpired.

### 📥 4. Interactive Tickets & QR Codes
* **Unique Ticket Serial Codes**: Generates cryptographic UUID tracking hashes (`TKT-XXXXXX`).
* **Automated QR Code Generation**: ZXing compiles QR codes containing booking ID, user ID, and event ID directly into inline Base64 data URLs.
* **OpenPDF Printing**: Generates high-fidelity, printable PDF entry tickets containing QR graphics, attendee details, date, and venue layouts.

### ✉️ 5. Automated Notification Center & Email Alerts
* **In-App Notification Bell**: Real-time polling dropdown containing alert logs and inline read toggles.
* **HTML Email confirmation**: Automatically constructs and sends HTML summaries with attached ticket PDFs for successful registrations, booking confirmations, and cancellations.
* **Cron-Scheduled Reminders**: A scheduled service (`0 0 9 * * ?`) automatically queries events happening in the next 24 hours and sends reminders to ticket-holders.

### 📊 6. Analytics Dashboards & Financial Reports
* **Live Statistics Summary**: Track total registration metrics, event counts, active bookings, and gross revenues.
* **Dynamic Category Distribution Graphs**: Visual CSS progress graphs charting event distributions.
* **Monthly Booking and Revenue Metrics**: Displays transactional rate growth and financial metrics.
* **Lead Exporters**: Generates Excel spreadsheets (Apache POI) and PDF reports (OpenPDF) listing bookings databases.

### ❤️ 7. Feedback & Favorites
* **Event Bookmarks**: Save interesting events to user favorites.
* **Personalized Recommendations**: Evaluates user favorite category bookmarks to propose matching upcoming events.
* **Verified Attendee Reviews**: Restricts feedback submission so only users who booked tickets and attended a past event can leave reviews and star ratings.

---

## 🔄 Recent Refinements & Fixes

* **Unified Admin Management Console:** Redesigned the Admin Dashboard links into a stylized grid of large, glassmorphic Control Cards featuring custom background radial glows, hover translations, and detailed helper subtitles to facilitate quick access to Categories, Users, Promos, Speakers, Staff, and Reports.
* **Dynamic CORS Allowed Port Patterns:** Configured backend `SecurityConfig` to support localhost dynamic wildcard ports (`http://localhost:[*]` & `http://127.0.0.1:[*]`). This prevents API request blocks when the frontend Vite dev server shifts dynamically (e.g. running on port `5180`).
* **Long Form Scrollable Modals:** Fixed viewport cutoffs in large administrative overlays (`ManageSpeakers`, `ManageStaff`, `ManagePromos`, `ManageAnnouncements`) by shifting flex layout constraints to `items-start`, ensuring fields are fully scrollable.
* **Staff Console Navigation Crash Fix:** Properly imported the routing `Link` inside `StaffConsole.tsx` to fix a JavaScript runtime `ReferenceError` exception, allowing unauthorized visits to fall back gracefully to a stylized "Access Denied" page.
* **Lucide v1.x Brand Icon Compilation Support:** Addressed compilation crashes caused by Lucide-React v1.0.0's deprecation/removal of brand assets by declaring self-contained inline SVG structures for LinkedIn, Twitter, and Instagram icons.

---

## 🚀 Getting Started

### 1. Prerequisite: PostgreSQL Setup
Create a PostgreSQL database named `testuser` (or specify an existing database in `backend/src/main/resources/application.properties`):

```sql
CREATE DATABASE testuser;
```

---

### 2. Running the Backend API
Navigate to the `backend/` folder and boot the Spring Boot server using the Maven wrapper:

```bash
cd backend
./mvnw.cmd spring-boot:run
```
- **API URL**: `http://localhost:8080`
- **SMTP configuration**: Outbox email notifications are active using default SMTP app credentials.

---

### 3. Running the React Client
Navigate to the `frontend/` folder, install required packages, and run the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```
- **Frontend URL**: `http://localhost:5173`

---

## ⚡ Role-Based Authorization Guidelines

The application supports two user roles: `ADMIN` and `USER`.

- **First Registration / "admin" override**: To make it easy to start, **the very first user** registered in the database automatically receives the `ADMIN` role. Additionally, any registered user containing the word **`admin`** in their username (e.g. `admin_user`) is allocated `ADMIN` permissions.
- **Admin Capabilities**: Add/Edit/Delete events, manage event categories, view all global bookings, and export PDF/Excel administrative reports.
- **User Capabilities**: Search/filter events, book seats, cancel bookings, view booking logs, download ticket PDFs, save favorite events, and leave verified ratings/reviews.

---

## 🧪 Testing Key Scenarios

1. **User Sign Up**: Create an account on the client register page (`/register`).
2. **Category Creation**: Log in as `ADMIN` and navigate to **Categories** to add event categories (e.g., Technology, Business).
3. **Publish Events**: Create an event as `ADMIN` with title, date, pricing, venue, and seats.
4. **Booking Seat Deductions**: Log in as `USER` (`/login`), locate the published event, and select 2 tickets. Once confirmed, available seats automatically decrease.
5. **PDF & Email Ticket Printing**: Check your email box! You will receive an automated HTML confirmation with a PDF attachment containing booking details and a ZXing QR Code. Download the PDF from the user dashboard to review layout.
6. **Cancellation & Seat Restoration**: Click **Cancel** on your bookings list to restore event seats and receive a cancellation confirmation email.
7. **Verified Rating Reviews**: After an event's date has passed, users who booked tickets can submit 1-5 star ratings and reviews. Non-attendees are restricted.
8. **Admin Logs Export**: Log in as `ADMIN` and download Excel/PDF booking ledgers from the reports dashboard.
