## Handoff Summary
**For:** Cass
**Feature:** run-history-dashboard

### Key Decisions
- Page-number pagination (20/page), URL search params drive all filter and page state — no client-side JS required
- Status, slug (contains, case-insensitive), and date-range filters are each independent and combinable
- `userId` is always sourced from the server-side session (R1 enforcement) — never from URL params
- Status badge: success=green, failed=red, paused=amber; type badge: feature=sky-blue, refinement=violet
- Dashboard lives at `/dashboard`; root `/` remains the unauthenticated landing/login page

### Files Created
- `.blueprint/features/feature_run-history-dashboard/FEATURE_SPEC.md`

### Open Questions
- None blocking Cass. OQ-D1 (route location) and OQ-D2 (date picker UX) are resolved in the spec.

### Critical Context
Every story's acceptance criteria must assert that the user sees **only their own runs** — this is R1 from the system spec and is non-negotiable. The page is read-only; no mutations occur here. The `run-detail-view` route must exist (even as a stub) for row-click navigation to function. Empty state copy should reflect murmur8 brand voice: developer-first, slightly poetic.
