# Test Specification — run-history-dashboard

**Feature:** run-history-dashboard
**Stories:** story-run-list, story-run-filters, story-empty-state, story-access-control
**Test file:** `test/feature_run-history-dashboard.test.js`
**Runner:** `node --test test/feature_run-history-dashboard.test.js`

---

## Scope

All tests are **pure unit tests** — no database, no HTTP server, no Next.js rendering.
Tests target pure helper functions extracted into `lib/dashboard.ts`:
- `getPaginationParams(searchParams)` — parses page/limit/offset from URL search params
- `getFilterParams(searchParams)` — parses and validates status/slug/date filters
- `formatDuration(ms)` — converts milliseconds to human-readable string
- `formatCost(n)` — formats decimal cost as `$X.XXX`
- `statusBadgeClass(status)` — returns Tailwind CSS class string for status badge
- `typeBadgeClass(type)` — returns Tailwind CSS class string for type badge

---

## Test Cases

### T-RHD-01 — getPaginationParams: defaults to page 1
- Input: `{}` (empty search params)
- Expected: `{ page: 1, limit: 20, offset: 0 }`
- Story: story-run-list AC3

### T-RHD-02 — getPaginationParams: reads page from params
- Input: `{ page: '3' }`
- Expected: `{ page: 3, limit: 20, offset: 40 }`
- Story: story-run-list AC3

### T-RHD-03 — getPaginationParams: clamps negative/zero page to 1
- Input: `{ page: '0' }` and `{ page: '-5' }`
- Expected: `{ page: 1, limit: 20, offset: 0 }` for both
- Story: story-run-list AC3 (page must be ≥ 1)

### T-RHD-04 — getPaginationParams: ignores non-numeric page
- Input: `{ page: 'abc' }`
- Expected: `{ page: 1, limit: 20, offset: 0 }`
- Story: story-run-list AC3

### T-RHD-05 — getFilterParams: returns empty object for empty params
- Input: `{}`
- Expected: `{}` (no filter keys)
- Story: story-run-filters

### T-RHD-06 — getFilterParams: accepts valid status values
- Input: `{ status: 'success' }`, `{ status: 'failed' }`, `{ status: 'paused' }`
- Expected: each returns `{ status: 'success' }`, `{ status: 'failed' }`, `{ status: 'paused' }`
- Story: story-run-filters AC1

### T-RHD-07 — getFilterParams: ignores invalid status value
- Input: `{ status: 'pending' }` (not a valid enum)
- Expected: `{}` (status key absent)
- Story: story-run-filters AC1

### T-RHD-08 — getFilterParams: includes slug when non-empty
- Input: `{ slug: 'user-auth' }`
- Expected: `{ slug: 'user-auth' }`
- Story: story-run-filters AC2

### T-RHD-09 — getFilterParams: ignores empty slug
- Input: `{ slug: '' }` and `{ slug: '   ' }`
- Expected: `{}` for both (no slug key)
- Story: story-run-filters AC2

### T-RHD-10 — getFilterParams: parses dateFrom and dateTo
- Input: `{ dateFrom: '2026-01-01', dateTo: '2026-03-31' }`
- Expected: `{ dateFrom: '2026-01-01', dateTo: '2026-03-31' }`
- Story: story-run-filters AC3

### T-RHD-11 — getFilterParams: each date is optional and independent
- Input: `{ dateFrom: '2026-01-01' }` and `{ dateTo: '2026-03-31' }`
- Expected: `{ dateFrom: '2026-01-01' }` and `{ dateTo: '2026-03-31' }` respectively
- Story: story-run-filters AC3

### T-RHD-12 — formatDuration: renders seconds only (< 60 s)
- Input: `45000` ms
- Expected: `"45s"`
- Story: story-run-list AC4

### T-RHD-13 — formatDuration: renders minutes and seconds
- Input: `874000` ms (14 min 34 s)
- Expected: `"14m 34s"`
- Story: story-run-list AC4

### T-RHD-14 — formatDuration: renders hours and minutes
- Input: `7500000` ms (2 h 5 m)
- Expected: `"2h 5m"`
- Story: story-run-list AC4

### T-RHD-15 — formatDuration: handles zero
- Input: `0`
- Expected: `"0s"`
- Story: story-run-list AC4

### T-RHD-16 — formatCost: formats to 3 decimal places with dollar sign
- Input: `1.5`, `0`, `0.001`, `10.1234`
- Expected: `"$1.500"`, `"$0.000"`, `"$0.001"`, `"$10.123"`
- Story: story-run-list AC4

### T-RHD-17 — statusBadgeClass: returns correct class for each status
- Input: `'success'` → contains `'text-green-600'` and `'bg-green-50'`
- Input: `'failed'` → contains `'text-red-600'` and `'bg-red-50'`
- Input: `'paused'` → contains `'text-yellow-600'` and `'bg-yellow-50'`
- Story: story-run-list AC4

### T-RHD-18 — statusBadgeClass: returns fallback for unknown status
- Input: `'unknown'`
- Expected: returns a non-empty string (no crash)
- Story: story-run-list AC4

### T-RHD-19 — typeBadgeClass: returns correct class for feature type
- Input: `'feature'`
- Expected: contains `'text-sky-600'` or `'text-agent-alex'` or class referencing sky/blue colour
- Story: story-run-list AC4

### T-RHD-20 — typeBadgeClass: returns correct class for refinement type
- Input: `'refinement'`
- Expected: contains `'text-violet-600'` or `'text-agent-cass'` or class referencing violet/purple colour
- Story: story-run-list AC4

---

## Out of Scope for This Test File
- Database queries (getUserRuns) — requires live Prisma connection
- Next.js Server Component rendering — requires Next.js test environment
- Authentication redirect behaviour — covered by auth middleware tests
- HTTP route handler behaviour — covered by integration tests
