## Handoff Summary
**For:** Codey
**Feature:** insights-panel

### Test Coverage
- 20 test cases across 3 pure functions in `lib/insights.js`
- T-IP-01 to T-IP-09: `computeInsights` — totals, success rate, avg duration, total cost, null handling
- T-IP-10 to T-IP-14: `computeStageAverages` — per-stage means, partial JSONB, empty runs, stage order
- T-IP-15 to T-IP-20: `getMostCommonFailureStage` — frequency ranking, tie-break, null exclusion, empty input

### Files Created
- `test/artifacts/feature_insights-panel/test-spec.md`
- `test/feature_insights-panel.test.js` (20 cases, all passing)

### Key Contracts (for Codey)
- `computeInsights(runs)` → `{ totalRuns, successRate, avgDurationMs, totalCost }`
- `computeStageAverages(runs)` → `[{ key, avgDurationMs }]` — all 6 STAGE_ORDER keys always present
- `getMostCommonFailureStage(runs)` → `string | null`
- `STAGE_ORDER` exported constant: `['alex','cass','nigel-spec','nigel-tests','codey-plan','codey-implement']`

### Open Questions
- None. Implementation path is clear: `lib/insights.js` (ESM, no DB) + `lib/insights.ts` (TypeScript mirror) + UI panel in `app/dashboard/page.tsx`.
