# Feature Specification — Run History Dashboard

---
version: 0.1.0
date: 2026-05-20
status: draft
---

## 1. Feature Intent

The run history dashboard is the primary authenticated landing page for the murmur8 Portal. It gives each authenticated user a paginated, filterable view of their own pipeline run history — answering "what have I run, when, how did it go, and what did it cost?"

- **Problem:** After pipeline runs complete, users have no centralised view of what ran, what succeeded or failed, and how costs accumulate over time.
- **User need:** Developers and teams need a readable audit trail and a quick way to find specific past runs for inspection.
- **System alignment:** Directly implements §6.5 and supports R1 from `.blueprint/system_specification/SYSTEM_SPEC.md`.

---

## 2. Scope

### In Scope
- Authenticated page at `/dashboard` (or `/`) showing the user's own run list
- Paginated table of runs: 20 per page, sorted by `completedAt` descending
- Per-row display: slug, status badge, type badge, completedAt date, human-readable duration, formatted cost
- URL-driven filter state: status (select), slug (text search), date range (dateFrom / dateTo), page number
- Filter form that submits via GET (updates URL search params, no client-side JS state)
- Click-to-navigate: each row links to the run detail view (`/runs/[id]`)
- Server Component data fetching: `auth()` session + direct Prisma query
- Empty state: friendly message when no runs match filters
- No-results state distinct from zero-total-runs state

### Out of Scope
- Real-time or polling updates (deferred to v2 per §3, System Spec)
- Any mutation of run data (read-only page)
- Cross-user run visibility (enforced by R1)
- Insights aggregates (separate `insights-panel` feature)
- Run detail display (separate `run-detail-view` feature)
- Cursor-based pagination (page-number pagination used; see §9)
- Export / download of run data (out of scope v1)

---

## 3. Actors Involved

### User (authenticated)
- **Can:** View their own run list, apply filters, paginate, navigate to a run's detail
- **Cannot:** View any other user's runs; mutate any run data; access the page unauthenticated

### Visitor (unauthenticated)
- **Cannot:** Access this page; redirected to login per R7

### Admin
- Same as User for this page — sees only their own runs here. Cross-user visibility is limited to the admin key panel, not this dashboard.

---

## 4. Behaviour Overview

**Happy path — default view:**
1. Authenticated user navigates to `/dashboard`.
2. Server Component calls `auth()` to obtain `session.userId`.
3. Prisma query fetches runs where `userId = session.userId`, ordered by `completedAt DESC`, limited to 20, offset by `(page - 1) * 20`.
4. Page renders a table of up to 20 run rows plus pagination controls.

**Happy path — filtering:**
1. User selects a status from the status dropdown, enters a slug fragment in the text field, or sets a date range, then submits the filter form.
2. Browser issues a GET request with updated search params (`?status=failed&slug=user-auth&page=1`).
3. Server Component reads search params, constructs a Prisma `where` clause, and re-renders with filtered results.
4. Pagination resets to page 1 on filter change (enforced by the form's hidden page field defaulting to 1).

**Alternative — no matching runs:**
- Empty state message is shown within the table area. Filters remain visible so the user can clear them.

**Alternative — no runs at all (new user):**
- A distinct zero-state message is shown: e.g. "No runs yet — connect your pipeline and start building."

**Navigation:**
- Clicking any row navigates to `/runs/[id]` (the run detail page, a separate feature).

---

## 5. State & Lifecycle Interactions

This feature is **state-constraining and read-only**:
- It does not create, modify, or delete any domain objects.
- It reads `Run` records created by the `telemetry-ingestion` feature.
- Session state (userId) is read via NextAuth; no session modifications occur.
- URL search params represent ephemeral UI state (filters/pagination) — not persisted to the database.

---

## 6. Rules & Decision Logic

| Rule | Description | Inputs | Output | Type |
|------|-------------|--------|--------|------|
| **R1 (enforced)** | Only the authenticated user's runs are returned | `session.userId` applied to every DB query | Prisma `where: { userId }` clause always present | Deterministic |
| **R7 (enforced)** | Unauthenticated requests redirect to login | Absence of valid session from `auth()` | `redirect('/login')` or NextAuth middleware intercept | Deterministic |
| **Pagination** | 20 runs per page; page defaults to 1; page must be ≥ 1 | `?page=` param | Prisma `skip` / `take` | Deterministic |
| **Filter: status** | If `status` param is one of `success`, `failed`, `paused` it is applied; any other value is ignored | `?status=` | Prisma `where: { status }` | Deterministic |
| **Filter: slug** | If `slug` param is non-empty string, applied as case-insensitive `contains` | `?slug=` | Prisma `where: { slug: { contains: ..., mode: 'insensitive' } }` | Deterministic |
| **Filter: date range** | `dateFrom` and `dateTo` are ISO date strings; each is optional and independent | `?dateFrom=`, `?dateTo=` | Prisma `where: { completedAt: { gte: ..., lte: ... } }` | Deterministic |
| **Duration formatting** | `totalDurationMs` rendered as human-readable (e.g. "14m 32s", "2h 5m") | integer ms | formatted string | Deterministic |
| **Cost formatting** | `totalCost` rendered as `$X.XXX` (3 decimal places) | decimal | string | Deterministic |
| **Status badge colour** | `success` → green, `failed` → red, `paused` → amber (using murmur8 brand palette) | status enum | Tailwind colour class | Deterministic |
| **Type badge colour** | `feature` → starling-sky (Alex blue), `refinement` → violet (Cass purple) | type enum | Tailwind colour class | Deterministic |

---

## 7. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| `github-auth` feature | Internal — must be complete | Provides `auth()` session and User record |
| `telemetry-ingestion` feature | Internal — must be complete | Creates Run records in the database |
| `run-detail-view` feature | Internal — must exist as a route | Row click navigates to `/runs/[id]`; this page need not wait for full detail implementation, but the route must exist |
| Prisma `Run` model | Database schema | `userId`, `slug`, `status`, `type`, `completedAt`, `totalDurationMs`, `totalCost` fields required |
| NextAuth `auth()` helper | Auth library | Returns session with `userId` |
| Next.js 15 App Router | Framework | Server Components, `searchParams` prop |
| Tailwind CSS + murmur8 theme | Styling | Brand palette tokens and badge styles |

---

## 8. Non-Functional Considerations

- **Performance:** The Prisma query must be indexed on `(userId, completedAt DESC)`. With a compound index, 20-row pagination should be sub-50ms for typical user run counts. No N+1 queries — all data for the list is on the `Run` row itself (no stage data needed here).
- **Security:** `userId` is always sourced from the server-side session, never from URL params or request body. This is the enforcement point for R1.
- **Error handling:** If `auth()` returns null/no session, redirect immediately; do not render a partial page. DB errors should surface a generic error boundary, not raw Prisma messages.
- **Accessibility:** Table must use semantic `<table>` markup. Status/type badges must not rely on colour alone — include text labels. Keyboard navigation through rows should be possible.
- **No client JS required for filtering:** The filter form uses standard HTML form GET submission. Progressive enhancement only; the page must function without JavaScript.

---

## 9. Assumptions & Open Questions

### Assumptions
- The `Run` table has a compound index on `(userId, completedAt)`. If not, one must be added in a migration as part of this feature.
- The `run-detail-view` route (`/runs/[id]`) will exist (even as a stub) before this feature ships, so row links are not broken.
- `completedAt` is always populated for stored runs (telemetry-ingestion ensures this).
- Page-number pagination is acceptable for v1 (OQ4 from System Spec, resolved here as page-number).

### Open Questions
| # | Question | Proposed Resolution |
|---|----------|---------------------|
| OQ4 | Pagination strategy: cursor vs page-number? | **Resolved here:** page-number pagination. Simple to implement, sufficient for v1 run counts. Revisit if users accumulate thousands of runs. |
| OQ-D1 | Should the dashboard be at `/dashboard` or `/` (root after auth)? | Propose `/dashboard`; root `/` remains the landing/login page for unauthenticated visitors. |
| OQ-D2 | Date range filter UX: two `<input type="date">` fields or a single picker? | Propose two plain `<input type="date">` fields — no JS dependency, accessible, consistent with no-client-JS constraint. |

---

## 10. Impact on System Specification

This feature reinforces existing system assumptions:
- R1 (user data isolation) is fully exercised and must be implemented as the first line of the data access layer.
- §6.5 is implemented exactly as specified with no stretches.
- OQ4 (pagination strategy) is resolved as page-number; no system spec update needed, but this decision is recorded here.
- No contradictions with the current system spec.

---

## 11. Handover to BA (Cass)

**Story themes Cass should derive:**
1. **View run list** — authenticated user sees their paginated run history with correct columns and badges
2. **Filter by status** — user narrows list by success / failed / paused
3. **Filter by slug** — user searches by feature slug fragment
4. **Filter by date range** — user scopes results to a date window
5. **Paginate** — user navigates between pages; pagination controls reflect total count
6. **Empty states** — zero runs total vs zero matching filters are distinct experiences
7. **Navigate to detail** — clicking a row routes to the run detail view

**Expected story boundaries:**
- Each filter type may be its own story or grouped (Cass's discretion)
- Authentication redirect is a dependency, not a story for this feature
- Performance / indexing is an implementation concern for Codey, not a story

**Areas needing careful framing:**
- The "my runs only" invariant must be present in every story's acceptance criteria — it is not assumed, it is required
- Empty state copy is important for brand voice (developer-first, slightly poetic per business context)

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial spec created | Feature backlog item P1 | Alex |
