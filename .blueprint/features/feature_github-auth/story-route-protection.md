# Story: Unauthenticated Route Protection

**As a** Visitor (unauthenticated user),
**I want** the portal to redirect me to the login page when I try to access protected routes,
**so that** no user data or dashboard content is ever exposed to unauthenticated requests.

---

## Acceptance Criteria

**AC-PROTECT-1 — Unauthenticated request to protected route is redirected**
- Given I have no active session
- When I navigate to `/dashboard` (or any route other than `/` and `/api/auth/*`)
- Then I am redirected to `/`

**AC-PROTECT-2 — Authenticated request to protected route passes through**
- Given I have an active valid session
- When I navigate to `/dashboard`
- Then the page is served without redirection

**AC-PROTECT-3 — The login page is always publicly accessible**
- Given I have no active session
- When I navigate to `/`
- Then I see the login page (no redirect loop)

**AC-PROTECT-4 — NextAuth internal routes are not intercepted by middleware**
- Given any request (authenticated or not)
- When the request path starts with `/api/auth/`
- Then middleware passes the request through unchanged

**AC-PROTECT-5 — Static assets are not intercepted by middleware**
- Given any request for a static file (e.g., `/_next/static/`, `/favicon.ico`)
- When middleware runs
- Then the request is passed through unchanged (no redirect, no session check overhead)

---

## Out of Scope

- Per-route role-based access control (e.g., admin-only routes) — this feature only distinguishes authenticated vs unauthenticated
- Custom "access denied" pages — unauthenticated users see the login page at `/`
- Public/shareable routes beyond `/` and `/api/auth/*`

---

## Technical Note for Nigel/Codey

Route protection is implemented via `middleware.ts` at the project root using:
```
export { auth as middleware } from "./auth"
export const config = { matcher: [...] }
```
The `matcher` must exclude `/api/auth/(.*)` and Next.js static file paths (`/_next/static`, `/_next/image`, `/favicon.ico`). No custom middleware logic is needed for this feature.
