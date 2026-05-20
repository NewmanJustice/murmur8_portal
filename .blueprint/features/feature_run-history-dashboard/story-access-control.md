# Story: Access Control — Own Runs Only

**As an** authenticated user,
**I want** the dashboard to enforce that I only ever see my own runs,
**so that** my pipeline history remains private and other users' data is never exposed to me.

---

## Acceptance Criteria

**AC1 — Unauthenticated users are redirected**
Given a visitor with no active session navigates to `/dashboard`,
When the server component renders,
Then they are redirected to the login page (`/`) before any run data is fetched or rendered.

**AC2 — userId is sourced from server-side session only**
Given the page is rendered server-side,
When `getUserRuns` is called,
Then the `userId` used in the Prisma `where` clause is always taken from `session.user.id` (via `auth()`) — never from URL params, headers, or any client-supplied value.

**AC3 — Runs for other users are never returned**
Given user A and user B each have runs,
When user A views `/dashboard`,
Then only user A's runs are shown — user B's runs do not appear regardless of filter values.

**AC4 — Admin users see only their own runs on this page**
Given a user with `isAdmin = true` navigates to `/dashboard`,
When the run list loads,
Then the admin sees only their own runs — not all users' runs (cross-user visibility is reserved for a separate admin panel feature).

**AC5 — Session expiry triggers redirect**
Given a user's session has expired,
When they navigate to or reload `/dashboard`,
Then they are redirected to the login page and no run data is returned.

---

## Out of Scope
- Admin cross-user run visibility (separate `admin-key-panel` / future feature)
- Sharing run history with other users
- API-level access control (covered by `telemetry-ingestion` feature)
