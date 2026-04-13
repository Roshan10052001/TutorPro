# SLU PeerTutor

A smart peer-to-peer academic tutoring platform designed for students at Saint Louis University. The system connects students with verified peer tutors, enabling structured booking, scheduling, and feedback.

---

## 📌 Overview

SLU PeerTutor is a web-based platform that allows students to:

- Search for tutors by course
- View verified tutor profiles
- Book tutoring sessions
- Leave reviews after sessions

The platform replaces informal tutoring methods (e.g., group chats, word-of-mouth) with a centralized, reliable system.

---

## 🚀 Features

### Authentication & Security

- User signup and login (JWT-based authentication)
- Password hashing using bcrypt
- Role-Based Access Control (Student, Tutor, Admin)
- Protected routes

### Core Functionality

- Tutor application and verification system
- Course-based tutor search
- Availability scheduling (upcoming)
- Booking system (upcoming)
- Review and rating system (upcoming)

---

## 🛠️ Tech Stack

### Frontend

- React / Next.js
- CSS / Responsive Design

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)

### Tools & Libraries

- JWT (Authentication)
- bcrypt (Password hashing)
- Express Middleware
- dotenv (Environment variables)

---

## 📂 Project Structure

backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── server.js

frontend/
├── components/
├── pages/
└── styles/

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/slu-peertutors.git
cd slu-peertutors
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

Run backend:

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

### 4. API Documentation (Swagger)

Once the backend is running, open your browser and navigate to:

```
http://localhost:5050/api-docs
```

This serves an interactive Swagger UI where you can:
- Browse all API endpoints grouped by Auth, Tutors, and Bookings
- View request/response schemas with examples
- Click the **Authorize** button and enter your JWT token to test protected endpoints directly from the browser

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔐 API Endpoints

> For full interactive documentation, see Swagger UI at `/api-docs`

**Auth**
- `POST /api/v1/auth/signup` — Register a new user
- `POST /api/v1/auth/login` — Login user
- `POST /api/v1/auth/logout` — Logout user (protected)
- `GET /api/v1/auth/me` — Get current user (protected)

**Tutors**
- `GET /api/v1/tutors` — Get all tutors with filtering & pagination (protected)
- `GET /api/v1/tutors/:id` — Get a single tutor (protected)

**Bookings**
- `POST /api/v1/bookings` — Create a booking (students only)
- `GET /api/v1/bookings` — Get bookings for logged-in user (protected)
- `GET /api/v1/bookings/:id` — Get a single booking (protected)
- `PATCH /api/v1/bookings/:id/status` — Update booking status (tutor/admin)
- `PATCH /api/v1/bookings/:id/cancel` — Cancel a booking (student/admin)

⸻

## 👥 Team Members

    •	Pelumi Oluwategbe
    •	Prince Karikari
    •	Bijay Kumar Chaudhary
    •	Guddu Yadav
