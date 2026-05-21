## Handoff Summary
**For:** Nigel
**Feature:** move_run_history_to_own_page

### Key Decisions
- Five stories cover: nav link addition, dedicated runs page (with filters/pagination), back-link header, auth redirect, and dashboard-only-insights.
- AC-03/AC-04 in Story 02 explicitly assert "clear filters" and pagination hrefs target `/dashboard/runs` — these are the subtlest correctness details.
- Story 03 AC-04 asserts the runs page header omits the full nav bar (compact header pattern only, matching `/keys`).
- Story 04 AC-04 asserts user data isolation (only own runs shown) as part of the auth story.
- Story 05 AC-03 asserts no `getUserRuns` call on the dashboard — testable via absence of run data, not just absence of UI.

### Files Created
- `story-01-navigate-to-run-history.md` — "Run History" nav link in dashboard header
- `story-02-run-history-dedicated-page.md` — full filter/table/pagination on `/dashboard/runs`
- `story-03-back-to-dashboard.md` — "← Dashboard" link in runs page compact header
- `story-04-unauthenticated-redirect.md` — redirect to login for unauthenticated access
- `story-05-dashboard-shows-insights-only.md` — dashboard retains only InsightsPanel

### Open Questions
- None

### Critical Context
No components or lib functions change — only page files are created/modified. The key test surface is: (1) presence/absence of UI elements on each page, (2) correct hrefs for clear-filters and pagination links, (3) auth redirect on the new route. The `/dashboard/runs/[id]` detail page is explicitly untouched.
