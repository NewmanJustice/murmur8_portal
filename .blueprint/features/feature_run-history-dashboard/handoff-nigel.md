## Handoff Summary
**For:** Codey
**Feature:** run-history-dashboard

### Test Artifacts
- `test/artifacts/feature_run-history-dashboard/test-spec.md` — Full test spec with 20 test cases (T-RHD-01 to T-RHD-20)
- `test/feature_run-history-dashboard.test.js` — Executable test file

### Runner
```
node --test test/feature_run-history-dashboard.test.js
```

### Tests Written (20 total)
| Group | IDs | Coverage |
|-------|-----|----------|
| getPaginationParams | T-RHD-01 to T-RHD-04 | defaults, page parsing, clamping, non-numeric |
| getFilterParams | T-RHD-05 to T-RHD-11 | empty, valid/invalid status, slug empty/whitespace, dateFrom/dateTo independent |
| formatDuration | T-RHD-12 to T-RHD-15 | seconds, min+sec, hour+min, zero |
| formatCost | T-RHD-16a to T-RHD-16d | 3dp formatting, zero, truncation |
| statusBadgeClass | T-RHD-17 to T-RHD-18 | green/red/yellow colours, fallback |
| typeBadgeClass | T-RHD-19 to T-RHD-20 | sky-blue for feature, violet for refinement |

### Pure Functions Required in lib/dashboard.ts
Codey must implement these — all tests import from `../lib/dashboard.js`:
- `getPaginationParams(searchParams: Record<string, string | undefined>): { page: number; limit: number; offset: number }`
- `getFilterParams(searchParams: Record<string, string | undefined>): { status?: string; slug?: string; dateFrom?: string; dateTo?: string }`
- `formatDuration(ms: number): string`
- `formatCost(n: number): string`
- `statusBadgeClass(status: string): string`
- `typeBadgeClass(type: string): string`

### Key Invariants to Enforce
- `getPaginationParams`: page ≥ 1, limit always 20, offset = (page - 1) * 20
- `getFilterParams`: only `success|failed|paused` are valid statuses; whitespace-only slug is ignored
- `formatDuration`: sub-hour shows "Xm Ys", ≥ 1 hour shows "Xh Ym" (drops seconds)
- `formatCost`: always 3 decimal places, dollar-sign prefix
- Status colours: success=green-600/green-50, failed=red-600/red-50, paused=yellow-600/yellow-50
- Type colours: feature=sky-blue, refinement=violet/purple

### Tests NOT Written (out of scope for pure unit tests)
- DB query correctness (getUserRuns) — no live Prisma
- Server Component rendering — no Next.js test env
- Authentication redirect — covered by auth middleware tests
