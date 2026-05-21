## Summary
Extends `lib/insights.ts` with four new metrics (`avgCostPerRun`, `refinementRate`, `featureRuns`/`refinementRuns`, `stageSuccessRates`) and three new fields on `InsightsRun` (`type`, `slug`, `stage`). Updates `InsightsPanel.tsx` to render the new metrics using existing `StatCard` and `formatCost` patterns.

## Steps
1. [lib/insights.ts] EDIT — Add `type: string | null`, `slug: string | null`, `stage: string | null` to `InsightsRun` interface | Tests: T-AI-03, T-AI-04, T-AI-05
2. [lib/insights.ts] EDIT — Add `avgCostPerRun: number`, `refinementRate: number`, `featureRuns: number`, `refinementRuns: number`, `stageSuccessRates: Record<string, number>` to `AggregateInsights` interface | Tests: T-AI-01, T-AI-09, T-AI-16, T-AI-17, T-AI-24, T-AI-25
3. [lib/insights.ts] EDIT — Extend `computeInsights` early-return (empty case) to include new fields with zero/empty defaults | Tests: T-AI-02, T-AI-10, T-AI-18, T-AI-19, T-AI-26
4. [lib/insights.ts] EDIT — Add `avgCostPerRun` computation (total cost / run count, null/undefined treated as 0) to main `computeInsights` return | Tests: T-AI-02
5. [lib/insights.ts] EDIT — Add `refinementRate` computation (distinct slugs with ≥1 refinement run / distinct total slugs × 100, `toFixed(1)`) to `computeInsights` return | Tests: T-AI-10, T-AI-11, T-AI-12
6. [lib/insights.ts] EDIT — Add `featureRuns` and `refinementRuns` counts (filter by `type === "feature"` / `type === "refinement"`) to `computeInsights` return | Tests: T-AI-18, T-AI-19
7. [lib/insights.ts] EDIT — Add `stageSuccessRates` computation (group by `run.stage`, skip null/undefined stage, per-stage success % via `toFixed(1)`) to `computeInsights` return | Tests: T-AI-26, T-AI-27
8. [app/dashboard/InsightsPanel.tsx] EDIT — Destructure new fields from `insights`, add `StatCard` for "Avg Cost / Run" using `formatCost(avgCostPerRun)` and "Refinement Rate" using `${refinementRate}%` | Tests: T-AI-06, T-AI-07, T-AI-08, T-AI-13, T-AI-14, T-AI-15
9. [app/dashboard/InsightsPanel.tsx] EDIT — Add runs-by-type display with "Feature:" / "Refinement:" labels referencing `featureRuns` and `refinementRuns` | Tests: T-AI-20, T-AI-21, T-AI-22, T-AI-23
10. [app/dashboard/InsightsPanel.tsx] EDIT — Add `stageSuccessRates` section using `Object.entries(stageSuccessRates).map(...)` to render per-stage `%` values; guard empty object gracefully | Tests: T-AI-28, T-AI-29
