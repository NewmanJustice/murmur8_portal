## Handoff Summary
**For:** Codey
**Feature:** run-detail-view

### Key Decisions
- All 28 tests are pure unit tests against helpers in `lib/run-detail.ts` (to be created); no DB/Next.js rendering
- Six helper functions to implement: `formatNullable`, `parseStages`, `stageAccentClass`, `showRefinementLink`, plus re-exported `formatDuration`/`formatCost` from `lib/dashboard.ts`
- `parseStages(raw)` is the key function: accepts `unknown`, guards against null/non-object, filters to 6 known stage keys in fixed pipeline order
- Access control (auth redirect, ownership 404) is enforced in the page component via `auth()` + `notFound()` — not testable at unit level
- `formatNullable(null|undefined)` must return the em dash string `"—"` (U+2014), not a hyphen

### Files to Create
- `test/artifacts/feature_run-detail-view/test-spec.md` (written)
- `lib/run-detail.ts` — pure helper functions (implement first)
- `lib/run-detail.js` — compiled JS output (or configure tsconfig to emit)
- `app/dashboard/runs/[id]/page.tsx` — Server Component page
- `test/feature_run-detail-view.test.js` (next step)

### Test Structure
- `describe('formatNullable')` — 3 tests (T-RDV-01 to T-RDV-03)
- `describe('statusBadgeClass — run-detail')` — 1 test (T-RDV-04, reuses existing function)
- `describe('parseStages')` — 8 tests (T-RDV-07 to T-RDV-09, T-RDV-17 to T-RDV-20)
- `describe('stageAccentClass')` — 6 tests (T-RDV-10 to T-RDV-15)
- `describe('showRefinementLink')` — 4 tests (T-RDV-25 to T-RDV-28)
- `describe('formatDuration + formatNullable — degradation')` — 2 tests (T-RDV-23, T-RDV-24)
- Total: 28 test cases

### Open Questions
- None

### Critical Context
The page at `app/dashboard/runs/[id]/page.tsx` is a Server Component. Prisma query must filter by both `id` AND `userId` (from `auth()`) in a single `findFirst`; if null → call `notFound()`. Stage pipeline order is fixed: `alex → cass → nigel-spec → nigel-tests → codey-plan → codey-implement`. The `statusBadgeClass` function from `lib/dashboard.ts` is reused as-is for both the run header and stage cards.
