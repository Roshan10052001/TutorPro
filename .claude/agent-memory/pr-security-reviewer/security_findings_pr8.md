---
name: Security Findings PR8
description: Critical and high security issues identified in pr8 review
type: project
---

Critical issues found in PR8 (ef2c855, d367cfc):

1. **Missing admin-only enforcement on tutor application admin endpoints** — `GET /tutor-application/all` and `PUT /tutor-application/:id` have no `authorize("admin")` middleware. Any authenticated user (student, tutor) can fetch all applications and approve/reject them, causing role elevation.

2. **updateProfile allows email change without re-verification** — `PUT /api/v1/user/profile` allows arbitrary email changes. Combined with the booking/application lookup logic that uses email strings, this can cause privilege confusion.

3. **JWT stored in localStorage** — XSS-accessible. No httpOnly cookie fallback used by frontend hooks.

4. **Frontend role-based routing is UI-only** — AuthGuard only checks `user != null`, not role. An authenticated student can navigate to /admin/dashboard in browser.

5. **console.log of user data** — `fetchAuthenticatedUserRequest` logs full user object to console. `Profile.jsx` also logs `user`. Leaks PII in production.

6. **BookSession.jsx broken** — `const { mutate: bookSession } = () => {};` destructures from a plain arrow function, not a hook. `bookSession` is undefined; calling it throws at runtime. Booking flow is non-functional.

7. **updateProfile allows role field to be set if passed** — `user.save()` is called after field-by-field assignment; role is not explicitly blocked. However Mongoose schema does not include role in the explicit field list so this depends on schema strictness setting.

8. **`user.remove()` deprecated** — deleteProfile uses Mongoose deprecated `.remove()`. Should use `.deleteOne()`.

9. **getDecodedJWT() misleading name** — Returns raw token string, not a decoded payload. No JWT decoding occurs. Misleading for future maintainers.

10. **Duplicate route in StudentRouter** — `profile` path appears twice in privateRoutes array.

11. **Home.jsx links to old route paths** — `/admin-dashboard`, `/tutor-apply`, `/tutor-dashboard` instead of new `/admin/dashboard` etc. Broken navigation for logged-in users.

12. **TutorDashboard/Sessions use `const sessions = []`** — Booking data is hardcoded empty. Sessions page and dashboard show no real data despite API existing.
