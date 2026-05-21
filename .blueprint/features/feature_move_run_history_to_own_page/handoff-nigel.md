## Handoff Summary
**For:** Codey
**Feature:** move_run_history_to_own_page

### Test Artifact
`test/artifacts/feature_move_run_history_to_own_page/test-spec.md` — 19 tests, T-RH-01 through T-RH-19.

### Files to Create / Modify

| File | Action | Key requirements |
|------|--------|-----------------|
| `app/dashboard/page.tsx` | Modify | Add `href="/dashboard/runs"` nav link ("Run History"), remove `RunsTable`, filter form, pagination, `getUserRuns` call; keep `InsightsPanel` and full nav header |
| `app/dashboard/runs/page.tsx` | Create | Auth guard → redirect("/"); `RunsTable`, filter form (status/slug/dateFrom/dateTo), pagination hrefs rooted at `/dashboard/runs`; compact logo + "← Dashboard" back link header (no full nav); `export const metadata = { title: 'Run History — murmur8 portal' }` |

### Critical Correctness Points
- T-RH-11/12: Clear-filters link and ALL pagination hrefs must use `/dashboard/runs` as base — NOT `/dashboard`.
- T-RH-16: The runs page header must be the compact pattern (logo + back link only) — no `<nav>` with API Keys / Admin Keys links.
- T-RH-03/04/06: Dashboard must have zero references to `RunsTable`, filter form inputs, and `getUserRuns`.

### Pattern Reference
`app/(dashboard)/keys/page.tsx` — use its header markup verbatim for the compact logo + "← Dashboard" pattern in the new runs page.

### No Component Changes
No changes needed to `RunsTable`, `InsightsPanel`, or any `lib/` functions.
