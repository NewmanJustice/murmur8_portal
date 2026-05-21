## Handoff Summary
**For:** Nigel
**Feature:** add_insights

### Key Decisions
- One story per metric; four stories total — each scoped to a single new field and its display
- All ACs are file-content assertions against `lib/insights.ts` (type shape + computation logic) and `app/dashboard/InsightsPanel.tsx` (JSX rendering) — no DOM or browser required
- `avgCostPerRun` uses `totalCost` (existing field on `InsightsRun`); null treated as 0 in both numerator and denominator
- `refinementRate` is defined as distinct slugs ratio, not raw run count — this is explicit in the AC
- `stageSuccessRates` uses `Record<string, number>` keyed by existing stage strings; missing stages are omitted or null, never fabricated

### Files Created
- `.blueprint/features/feature_add_insights/story-cost-per-run.md`
- `.blueprint/features/feature_add_insights/story-refinement-rate.md`
- `.blueprint/features/feature_add_insights/story-runs-by-type.md`
- `.blueprint/features/feature_add_insights/story-success-rate-by-stage.md`

### Open Questions
- None

### Critical Context
`lib/insights.ts` exports `AggregateInsights` (type) and `computeInsights()` (pure function). Tests should assert type fields exist via source inspection and assert computation results by calling the function with fixture data. `InsightsPanel.tsx` is a Server Component — tests verify its JSX source contains the expected label strings and references the new fields from `insights`. Existing `InsightsRun` interface has `totalCost` (not `costUsd`) and `stages` (JSONB object); `type`, `slug`, and `stage` fields are not yet on `InsightsRun` and will need to be added as part of implementation.
