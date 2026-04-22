---
name: TutorPro Project Architecture
description: Stack, auth/booking patterns, key security boundaries, and common anti-patterns seen in this repo
type: project
---

## Stack
- Backend: Node.js + Express + Mongoose (MongoDB)
- Frontend: React + Vite + TanStack Query v5 + Tailwind + shadcn/ui
- Auth: JWT (Bearer token in Authorization header OR cookie); middleware in backend/middleware/auth.js

## Auth Middleware Pattern
- `protect`: verifies JWT, attaches `req.user` (without password)
- `authorize(...roles)`: role-based gate — checks `req.user.role` against allowed roles
- Token stored in localStorage-backed storage object (`getStoredUser()`) and attached by axiosInstance interceptor

## Booking Model (backend/models/Booking.js)
- Statuses (enum): pending, confirmed, cancelled, completed
- Unique index on { tutor, date, startTime }
- PATCH /bookings/:id/status — tutor or admin only (route-level authorize)
- PATCH /bookings/:id/cancel — any authenticated user, but controller checks isStudent/isTutor/isAdmin

## Booking Authorization Pattern (bookingController.js)
- `getBookingAccess()` helper checks student/tutor/admin ownership — used in most controllers
- `updateBookingStatus`: checks `isAdmin || isTutor` against the specific booking (ownership check present)
- `cancelBooking`: checks ownership (student/tutor/admin) + guards completed/already-cancelled states
- IDOR-safe for status update and cancel — both verify the requester is a party to the booking

## Sessions.jsx Frontend Pattern
- Tutor's `effectiveRole` depends on `activeView` (tutor can switch to student view)
- `filteredSessions` double-filters on frontend even after backend already scopes results — redundant but harmless
- The Actions column uses `effectiveRole` from context (client-side only) — backend still enforces roles independently

## Known Anti-Patterns in Codebase
- `updateBookingStatus` controller allows setting status back to "pending" (no forward-only guard) — backend allows it, frontend does not expose it, but still a backend weakness
- No query cache invalidation scoped to specific booking ID — full list refetch on every mutation (acceptable but not optimal)
- `onError` callbacks on `useQuery` hooks use deprecated TanStack Query v5 pattern (should be `throwOnError` or error boundary)
- Missing newline at end of Sessions.jsx (introduced in PR 18) — minor git hygiene issue

## Reviewed PRs
- PR 18 (c3c19b3): "Add dynamic booking status actions UI" — fixes PUT->PATCH method mismatch for /status and POST->PATCH for /cancel; adds Actions dropdown for tutor/admin in Sessions table. See security_findings_pr18.md.
