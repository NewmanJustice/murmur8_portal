# Story: View Run Header

**As an** authenticated user,
**I want** to see a summary header for a pipeline run when I navigate to its detail page,
**so that** I can understand the run's overall outcome, timing, cost, and identity at a glance.

---

## Acceptance Criteria

**AC1 — All top-level fields are displayed**
Given I navigate to `/dashboard/runs/[id]` for a run I own,
When the page loads,
Then I see: `slug`, `status` badge, `type`, `startedAt`, `completedAt`, `totalDurationMs` (human-readable), `totalCost` (formatted), `commitHash`, `failedStage`, `pausedAfter`, and `receivedAt`.

**AC2 — Status badge colour matches dashboard convention**
Given a run with `status === "success"`,
When I view the header,
Then the status badge is green; a `failed` run badge is red; a `paused` run badge is yellow — consistent with the run-history-dashboard.

**AC3 — Back link is present**
Given I am on the run detail page,
When the page loads,
Then a back link labelled "← Back to runs" (or equivalent) navigates me to `/dashboard/runs`.

**AC4 — Nullable header fields degrade gracefully**
Given a run where `commitHash`, `failedStage`, or `pausedAfter` is `null`,
When I view the header,
Then those fields display "—" (or are omitted) rather than rendering `null` or throwing an error.

**AC5 — Page renders as a Server Component**
Given the page is accessed by an authenticated user,
When the route renders,
Then all data is fetched server-side via Prisma before any HTML is sent to the client — no client-side data fetching occurs.

---

## Out of Scope
- Mutations of any kind (no delete, retry, flag)
- Real-time or polling updates
- Sharing or exporting run data
- Stage-level fields (covered in story-stage-breakdown)
