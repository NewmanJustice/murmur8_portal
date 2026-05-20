# Story: Insights Panel Access Control

**As a** system guardian,
**I want** the insights panel to be accessible only to authenticated users and scoped to their own data,
**so that** no user can view another user's aggregate pipeline statistics.

---

## Acceptance Criteria

**AC1 — Unauthenticated access redirected**
Given I am not signed in,
When I navigate to `/dashboard` (which contains the insights panel),
Then I am redirected to the login page and the insights panel is not rendered.

**AC2 — Data is user-scoped**
Given I am signed in as User A,
When the insights panel loads,
Then all computed metrics derive exclusively from runs where `userId = my session userId` — runs belonging to User B are never included.

**AC3 — userId always from session**
Given the page is rendered server-side,
When the insights query is executed,
Then `userId` is taken from the verified server session, never from URL parameters or any client-supplied value.

---

## Out of Scope
- Admin-level cross-user insights (out of scope for this feature per spec §2)
- Per-organisation insights
