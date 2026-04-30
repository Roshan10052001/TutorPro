# TutorPro — SLU Peer Tutoring Platform

TutorPro is a full-stack peer-to-peer tutoring platform designed for students at Saint Louis University. The goal of the project is to make academic tutoring easier to find, safer to manage, and more structured than informal methods such as group chats, word-of-mouth, or manual scheduling.

The platform allows students to apply as tutors, get verified by an admin, search available tutors, book tutoring sessions, and leave reviews after completed sessions.

---

## Project Overview

Many university students need academic help, but finding a reliable peer tutor can be difficult. TutorPro solves this problem by creating a centralized platform where students, tutors, and admins can interact through one organized system.

With TutorPro:

- Students can search for tutors by course or subject area
- Tutors can apply and manage their tutoring profile
- Admins can review and approve tutor applications
- Students can book sessions with verified tutors
- Users can leave reviews and ratings after tutoring sessions

The project focuses on building a practical, secure, and scalable tutoring system that can realistically support a university environment.

---

## Core Features

### Authentication and Authorization

- User signup and login
- JWT-based authentication
- Password hashing using bcrypt
- Role-Based Access Control for Student, Tutor, and Admin users
- Protected backend routes
- Secure middleware structure

### Student Features

- Browse available tutors
- Search tutors by course or subject
- View tutor profiles
- Book tutoring sessions
- Leave reviews and ratings after sessions

### Tutor Features

- Apply to become a tutor
- Manage tutor profile information
- Set tutoring availability
- View booking requests
- Accept or manage tutoring sessions

### Admin Features

- Review tutor applications
- Approve or reject tutor requests
- Manage platform users and tutoring flow
- Support safer platform moderation

### Main Platform Flow

```text
Student Searches / Tutor Applies
        ↓
Admin Approves Tutor
        ↓
Student Books Session
        ↓
Tutor Handles Session
        ↓
Student Leaves Review
```

---

## Security and Reliability

TutorPro includes several security-focused backend practices:

- JWT authentication for secure session handling
- bcrypt for password hashing
- Role-based access middleware
- Protected routes for private actions
- Helmet.js for security headers
- Express rate limiting to reduce abuse
- Centralized error handling
- Environment variable configuration using dotenv

These features help make the system more reliable, safer, and easier to maintain.

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind-based styling / responsive CSS
- Component-based UI structure

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API architecture

### Authentication and Security

- JWT
- bcrypt
- Helmet.js
- express-rate-limit
- dotenv

### Testing

- Jest
- Supertest
- mongodb-memory-server
- Vitest

### DevOps and CI/CD

- GitHub Actions
- Docker
- DockerHub publishing workflow
- Automated test workflow
- CI/CD pipeline setup for project reliability

---

## Project Structure

```text
TutorPro/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── docker-publish.yml
│
├── docker-compose.yml
├── README.md
└── package.json
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Roshan10052001/TutorPro.git
cd TutorPro
```

---

## Backend Setup

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Create Backend Environment File

Create a `.env` file inside the `backend` folder.

```env
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Run Backend Server

```bash
npm run dev
```

For production:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5050
```

---

## Frontend Setup

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Run Frontend

```bash
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

---

## Running Tests

### Backend Tests

Backend tests use Jest, Supertest, and mongodb-memory-server.

```bash
cd backend
npm test
```

The backend tests run with an in-memory MongoDB database, so a real MongoDB connection is not required during testing.

### Frontend Tests

```bash
cd frontend
npm test
```

---

## API Documentation

The backend includes Swagger API documentation.

After starting the backend server, open:

```text
http://localhost:5050/api-docs
```

Swagger allows developers to:

- View available API routes
- Test endpoints directly from the browser
- Check request and response formats
- Use JWT authorization for protected routes

---

## Main API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register a new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current logged-in user |

### Tutor Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/tutors` | Get all tutors |
| GET | `/api/v1/tutors/:id` | Get tutor by ID |

### Booking Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/bookings` | Create a booking |
| GET | `/api/v1/bookings` | Get bookings for logged-in user |
| GET | `/api/v1/bookings/:id` | Get booking by ID |
| PATCH | `/api/v1/bookings/:id/status` | Update booking status |
| PATCH | `/api/v1/bookings/:id/cancel` | Cancel booking |

---

## Docker Support

TutorPro includes Docker support to make the application easier to run and deploy consistently across different environments.

### Build and Run with Docker

```bash
docker compose up --build
```

Docker support helps reduce local setup issues and makes the project easier to test, run, and prepare for deployment.

---

## CI/CD Pipeline

TutorPro includes GitHub Actions workflows for automation and project reliability.

The CI/CD setup includes:

- Running automated tests
- Checking backend reliability
- Supporting Docker image build and publish workflow
- Preparing the project for deployment
- Improving consistency across team development

A DockerHub publishing workflow was also added so the project can be built and pushed as a Docker image through GitHub Actions.

---

## Agile Development Workflow

The project followed a Scrum-style workflow using Jira and GitHub.

The team organized work through:

- Backlog planning
- Sprint-based development
- Feature branches
- Pull requests
- Code reviews
- Merge conflict resolution
- Iterative improvement based on project needs

This workflow helped the team divide responsibilities, track progress, and deliver features step by step.

---

## Bijay Kumar Chaudhary Roles and Responsibilities

My contributions focused on frontend development, project structure, workflow improvement, CI/CD, and Dockerization.

I worked on:

- Building and improving the frontend user interface
- Designing responsive pages and reusable UI sections
- Improving the homepage layout, hero section, call-to-action, feature sections, and visual hierarchy
- Enhancing card spacing, typography, and overall user experience
- Improving the platform workflow from the user side
- Supporting the Apply → Admin Approve → Book → Review flow
- Helping maintain a clean project structure
- Working with Git branches, pull requests, and merge conflict handling
- Updating Jira boards and sprint progress
- Adding CI/CD workflow support using GitHub Actions
- Dockerizing the project workflow
- Adding DockerHub publishing workflow
- Helping prepare the project for demo, presentation, and final delivery

My main focus was to make TutorPro look professional, work smoothly from the frontend, and become easier for the team to test, run, and maintain.

---

## Team Members and Contributions

| Team Member | Contribution Area |
|---|---|
| Bijay Kumar Chaudhary | Frontend design, UI/UX improvements, project workflow, project structure, CI/CD, Dockerization, GitHub Actions, DockerHub publishing workflow, Jira updates |
| Guddu Yadav | .............................ADD HERE YOUR WORK.............. |
| Pelumi Oluwategbe | .............................ADD HERE YOUR WORK............... |
| Prince Karikari | .............................ADD HERE YOUR WORK.............. |

---

## Current Strengths

- Solves a real university tutoring problem
- Supports a complete tutoring platform flow
- Uses secure authentication and role-based access
- Has a clean full-stack architecture
- Includes testing support
- Includes CI/CD and Docker workflow
- Provides API documentation through Swagger
- Designed with scalability and future improvements in mind

---

## Current Limitations

Some areas can still be improved in future versions:

- AI-based tutor recommendation or moderation can be refined further
- More real-user testing is needed
- Some UI actions can be polished more
- Notification support can be added
- Calendar integration can improve scheduling
- Admin analytics dashboard can be expanded
- Production deployment can be finalized

---

## Future Enhancements

Planned or possible future improvements include:

- AI-assisted tutor recommendation
- AI-based review moderation
- Email notifications
- Calendar-based scheduling
- Improved admin dashboard
- Tutor performance analytics
- Payment or credit-based tutoring support
- Full production deployment with environment configuration

---

## Conclusion

TutorPro is a practical full-stack web application built to improve how students find and manage peer tutoring at Saint Louis University. The project combines secure backend development, a user-friendly frontend, role-based access, booking functionality, testing, API documentation, Docker support, and CI/CD automation.

The final result is not just a class project, but a realistic platform that could be extended into a usable university tutoring system.
