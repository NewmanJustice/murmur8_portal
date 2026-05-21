## Handoff Summary
**For:** Codey
**Feature:** add_insights

### Key Decisions
- 27 test cases across 4 stories; each story gets type-shape, computation-fixture, and JSX-source tests
- Tests are pure file-content assertions: source-text scan for types/labels, fixture calls via `lib/insights.js` mirror
- `InsightsRun` must gain top-level `type: string|null`, `slug: string|null`, `stage: string|null` — all three are currently absent
- `stageSuccessRates` is keyed off the new top-level `stage` field (not the JSONB `stages` object)
- `refinementRate` denominator is distinct slugs (not raw run count); null/undefined `totalCost` is 0 in both numerator and denominator of `avgCostPerRun`

### Files to Create
- `test/artifacts/feature_add_insights/test-spec.md` (written)
- `test/feature_add_insights.test.js` (next step — Codey writes this)

### Test Structure
- `describe("AggregateInsights type shape")` — 4 tests (CPR-T1, RR-T1, RBT-T1, SSR-T1): source-text assertions on `lib/insights.ts`
- `describe("computeInsights — avgCostPerRun")` — 4 tests (CPR-T2 to CPR-T4, edge: all-null cost)
- `describe("computeInsights — refinementRate")` — 3 tests (RR-T2 to RR-T4)
- `describe("computeInsights — featureRuns / refinementRuns")` — 3 tests (RBT-T2 to RBT-T4)
- `describe("computeInsights — stageSuccessRates")` — 5 tests (SSR-T2 to SSR-T5 + null-stage exclusion)
- `describe("InsightsPanel JSX source")` — 8 tests (CPR-T5 to CPR-T7, RR-T5 to RR-T7, RBT-T5 to RBT-T6, SSR-T6 to SSR-T7)

### Open Questions
- None

### Critical Context
`lib/insights.ts` currently exports `AggregateInsights` with only `totalRuns`, `successRate`, `avgDurationMs`, `totalCost` — all four new fields must be added. `computeInsights` must also be extended (currently returns only the four existing fields). `InsightsPanel.tsx` destructures `insights` at the top of the component — new fields should follow the same pattern. The `lib/insights.js` mirror must be kept in sync with `lib/insights.ts` for the test runner.
