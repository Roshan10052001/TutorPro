---
name: TutorPro Project Architecture
description: Core stack, auth pattern, and sensitive module map for TutorPro
type: project
---

Full-stack tutoring platform: Node/Express backend + React (Vite) frontend.

**Why:** Academic project (CSCI 5300) connecting students to tutors with admin approval flow.
**How to apply:** Apply extra scrutiny to admin-action endpoints and role-elevation paths.

Key facts:
- Auth: JWT in Authorization header (Bearer), also reads from cookie. Token stored in localStorage on frontend under key "user".
- Role enum: student | tutor | admin. Role elevation happens in `updateTutorApplicationStatus` (sets user.role = "tutor" on approval) and `deleteTutor` (resets to "student").
- `protect` middleware: verifies JWT, fetches fresh user from DB, attaches as `req.user`.
- `authorize(...roles)` middleware: checks `req.user.role` against allowed list.
- Frontend auth guard (`AuthGuard.jsx`): checks AuthContext `user` (populated from localStorage). Does NOT enforce role — any authenticated user can reach admin/student/tutor routes if they know the URL.
- React Query used for server state. Auth state in React Context + localStorage.
- Backend routes: `/api/v1/auth`, `/api/v1/tutors`, `/api/v1/bookings`, `/api/v1/tutor-application`, `/api/v1/user/profile`
- TutorApplication model: stores name/email as free-text strings (not linked from User). These can differ from the authenticated user's actual name/email.
- `getDecodedJWT()` in frontend utils is misleadingly named — it just reads the raw token string, does NOT decode/verify JWT.
