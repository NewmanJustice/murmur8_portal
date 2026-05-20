## Handoff Summary
**For:** Nigel
**Feature:** run-history-dashboard

### Stories Written
- `story-run-list.md` — Paginated run list (20/page, completedAt desc, row columns, row navigation)
- `story-run-filters.md` — Status/slug/date-range filters via URL params, no-JS GET form
- `story-empty-state.md` — Distinct zero-runs vs no-match states; filter form stays visible
- `story-access-control.md` — Server-side session enforcement; userId never from URL; admin sees own runs only

### Key Patterns for Nigel
- All stories include an "only my runs" AC — R1 is non-negotiable and must be tested
- Filter state lives entirely in URL search params; no client-side state
- Two distinct empty states: (a) user has zero runs, (b) runs exist but none match filters
- Duration: human-readable (e.g. "14m 32s"); Cost: `$X.XXX` (3 decimal places)
- Status badge colours: success=green, failed=red, paused=amber
- Type badge colours: feature=sky-blue (agent-alex), refinement=violet (agent-cass)

### Testable Logic to Extract as Pure Functions
- `getPaginationParams(searchParams)` → `{ page, limit, offset }`
- `getFilterParams(searchParams)` → `{ status?, slug?, dateFrom?, dateTo? }`
- `formatDuration(ms)` → human-readable string
- `formatCost(n)` → `"$X.XXX"` string
- `statusBadgeClass(status)` → Tailwind class string
- `typeBadgeClass(type)` → Tailwind class string

### Constraints for Codey
- No client JS required for filtering (GET form only)
- `userId` always from server-side `auth()` session
- Prisma query must include compound `userId + completedAt` ordering
- Empty states should reflect murmur8 brand voice: developer-first, slightly poetic
