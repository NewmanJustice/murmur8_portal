# Story: Access Control — Own Runs Only

**As an** authenticated user,
**I want** the run detail page to enforce that I can only view my own runs,
**so that** my pipeline data stays private and other users' run details are never exposed to me.

---

## Acceptance Criteria

**AC1 — Unauthenticated visitors are redirected to login**
Given a visitor with no active session navigates to `/dashboard/runs/[id]`,
When the server evaluates the request,
Then they are redirected to the login page (`/`) before any run data is fetched or rendered.

**AC2 — Owner sees their run**
Given I am signed in and navigate to `/dashboard/runs/[id]` for a run that belongs to my account,
When the page loads,
Then the run detail page renders successfully.

**AC3 — Non-owner receives 404, not 403**
Given I am signed in and navigate to `/dashboard/runs/[id]` for a run that belongs to a different user,
When the server evaluates the ownership check (`run.userId !== session.userId`),
Then a 404 response is returned — not a 403 or an error page — so the existence of the run is not revealed.

**AC4 — Non-existent run ID returns 404**
Given I navigate to `/dashboard/runs/[id]` where no run with that ID exists in the database,
When the server queries Prisma,
Then a 404 response is returned — indistinguishable from the unauthorised-access 404 (AC3).

**AC5 — Admin sees only their own runs on this page**
Given a user with `isAdmin = true` navigates to `/dashboard/runs/[id]`,
When the ownership check runs,
Then the admin sees only runs they own — admin status confers no cross-user visibility on this route.

**AC6 — userId is sourced from server-side session only**
Given the page renders as a Server Component,
When the ownership check is performed,
Then the `userId` used in the Prisma query and comparison always comes from `session.user.id` via `auth()` — never from URL parameters, query strings, or any client-supplied value.

---

## Out of Scope
- Cross-user admin visibility (reserved for a separate admin panel feature)
- Shareable or public run links
- API-level access control (covered by telemetry-ingestion feature)
