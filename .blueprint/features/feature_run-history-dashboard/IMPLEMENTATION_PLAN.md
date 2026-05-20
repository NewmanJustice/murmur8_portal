# Implementation Plan — run-history-dashboard

## Overview
Implement a paginated, filterable run history dashboard at `/dashboard`. Replaces the placeholder page from `github-auth`. Pure helpers in `lib/dashboard.ts` power the tests; `lib/runs.ts` handles the DB query; `app/dashboard/page.tsx` wires it all together as a Server Component.

---

## Steps

1. [lib/dashboard.ts] CREATE — Pure helper functions: formatDuration(ms), formatCost(n), getPaginationParams(searchParams), getFilterParams(searchParams), statusBadgeClass(status), typeBadgeClass(type) | Tests: T-RHD-01 to T-RHD-20

2. [lib/dashboard.js] CREATE — Compiled JS output of lib/dashboard.ts for node --test runner (ESM-compatible export of the same pure functions without TypeScript types, so node:test can import without ts-node) | Tests: T-RHD-01 to T-RHD-20

3. [lib/runs.ts] CREATE — DB access layer: getUserRuns(userId, filters, pagination) → { runs, total, totalPages }; constructs Prisma where clause with userId always applied; orders by completedAt DESC | Tests: none (DB layer)

4. [app/dashboard/page.tsx] MODIFY — Replace placeholder section with real run list; Server Component; reads searchParams prop; calls getUserRuns; renders filter form, runs table with badges, pagination controls, and empty states | Tests: none (rendering)

5. [app/dashboard/RunsTable.tsx] CREATE — Minimal Client Component for the runs table rows; renders each Run row as a clickable link to /runs/[id]; uses statusBadgeClass and typeBadgeClass for badge styling | Tests: none (rendering)

---

## File Dependency Order
lib/dashboard.ts → lib/dashboard.js (compiled) → lib/runs.ts → app/dashboard/RunsTable.tsx → app/dashboard/page.tsx

## Key Constraints
- lib/dashboard.js must be plain ESM (no TypeScript) so `node --test` can import it directly
- lib/dashboard.ts is the TypeScript source; lib/dashboard.js is the runtime-compatible copy
- All filter + pagination logic must match the test assertions exactly
- getUserRuns always includes `userId` in the Prisma where clause (R1)
- Filter form uses `method="get"` — no JS required
- Pagination resets to page=1 when a new filter is submitted (hidden input in form)
