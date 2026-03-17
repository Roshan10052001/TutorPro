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

Create a .env file:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Run backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔐 API Endpoints (Sprint 1)

Auth
• POST /api/auth/signup — Register a new user
• POST /api/auth/login — Login user
• GET /api/auth/me — Get current user (protected)

⸻

## 👥 Team Members

    •	Pelumi Oluwategbe
    •	Prince Karikari
    •	Bijay Kumar Chaudhary
    •	Guddu Yadav
