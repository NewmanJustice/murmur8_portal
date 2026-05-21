## Handoff Summary
**For:** Codey
**Feature:** add_more_insights

### Key Decisions
- All 28 tests are pure file-content string assertions on `lib/insights.ts` and `app/dashboard/InsightsPanel.tsx`
- Three metric groups tested: run velocity (T01–T08), top-slug (T09–T19), avg feedback rating (T20–T28)
- Alphabetical tie-breaking must be detectable as `localeCompare` or a `<` string comparison in source
- Null guards must be textually present before date comparisons (velocity) and before slug grouping (top-slug)
- `lib/insights.js` (the JS mirror) is what the Node test runner imports; Codey must keep it in sync

### Files to Create
- `test/artifacts/feature_add_more_insights/test-spec.md` (written)
- `test/feature_add_more_insights.test.js` (next step — pure `node:fs` + `node:assert` assertions)

### Test Structure
- `describe('run velocity')` — 8 tests (T01–T08): interface fields, 7d/30d windows, null-guard, zero default, JSX labels, InsightsRun datetime field
- `describe('top slug metrics')` — 11 tests (T09–T19): interface fields, grouping, tie-breaking, null exclusion, null fallback, JSX cards and "—"
- `describe('average feedback rating')` — 9 tests (T20–T28): interface field, stages iteration path, range guards, rounding, null fallback, JSX "/ 5" and "—", global scope

### Open Questions
- None

### Critical Context
`lib/insights.ts` currently has `InsightsRun` without a datetime field and `AggregateInsights` without velocity, top-slug, or rating fields — all must be added. InsightsPanel does not yet render any of the three new metric cards. Tests assert on exact string patterns: `last7Days`, `last30Days`, `topSlugByRunCount`, `topSlugByCost`, `avgFeedbackRating`, `feedback.rating`, `>= 1`, `<= 5`, `toFixed(1)`, `"/ 5"`, `"—"`.
