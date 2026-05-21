# Test Specification: add_insights

## Understanding

Four new computed fields are added to `AggregateInsights` in `lib/insights.ts` and rendered in `app/dashboard/InsightsPanel.tsx`:
- `avgCostPerRun` — average `totalCost` across all runs (null/undefined cost treated as 0, result is 0 for empty)
- `refinementRate` — % of distinct slugs with ≥1 run where `type==="refinement"`, rounded to 1 dp
- `featureRuns` / `refinementRuns` — counts of runs by `type` field; unknown types excluded from both
- `stageSuccessRates` — `Record<string, number>` keyed by stage, % success per stage; empty object for no runs

`InsightsRun` must gain `type`, `slug`, and `stage` fields (currently absent).
Tests are pure file-content assertions: type-shape checks via source text scan, computation checks via fixture calls against the compiled JS mirror (`lib/insights.js`), and JSX source-text checks for label strings.

ASSUMPTION: A `lib/insights.js` mirror (or equivalent transpile step) is available for `node --test` as implied by the existing comment in `lib/insights.ts`.
ASSUMPTION: The `node --test` runner is used (consistent with existing test patterns in the repo).
ASSUMPTION: `InsightsRun` will be extended with `type: string | null`, `slug: string | null`, `stage: string | null` during implementation.
ASSUMPTION: `stageSuccessRates` uses `stage` on the top-level run record (not the nested `stages` JSONB), since the AC references a `stage` field alongside `status`.
ASSUMPTION: Formatting for `avgCostPerRun` display uses the existing `formatCost` helper, producing `"$0.00"` for zero.

---

## AC → Test ID Mapping

| Story | AC | Test ID | Description |
|---|---|---|---|
| cost-per-run | Type has `avgCostPerRun: number` | CPR-T1 | Source of `lib/insights.ts` contains `avgCostPerRun: number` |
| cost-per-run | n runs total cost T → T/n | CPR-T2 | `computeInsights([{totalCost:0.1},{totalCost:0.3}])` → `avgCostPerRun === 0.2` |
| cost-per-run | null/undefined cost treated as 0 in denominator | CPR-T3 | `computeInsights([{totalCost:0.4},{totalCost:null}])` → `avgCostPerRun === 0.2` |
| cost-per-run | empty array → 0 | CPR-T4 | `computeInsights([])` → `avgCostPerRun === 0` |
| cost-per-run | Panel label contains "cost" and "run" | CPR-T5 | InsightsPanel.tsx source contains label matching `/cost.*run/i` |
| cost-per-run | Panel shows `insights.avgCostPerRun` | CPR-T6 | InsightsPanel.tsx source references `insights.avgCostPerRun` |
| cost-per-run | Zero renders "$0.00" | CPR-T7 | InsightsPanel.tsx source does not use bare `totalCost` for avg card; `formatCost` is applied to `avgCostPerRun` |
| refinement-rate | Type has `refinementRate: number` | RR-T1 | Source of `lib/insights.ts` contains `refinementRate: number` |
| refinement-rate | distinct-slug ratio × 100, 1 dp | RR-T2 | 3 slugs, 2 with refinement runs → `refinementRate === 66.7` |
| refinement-rate | no refinement runs → 0 | RR-T3 | all `type==="feature"` → `refinementRate === 0` |
| refinement-rate | empty array → 0 | RR-T4 | `computeInsights([])` → `refinementRate === 0` |
| refinement-rate | Panel label matches "Refinement Rate" | RR-T5 | InsightsPanel.tsx source contains `"Refinement Rate"` |
| refinement-rate | Panel references `insights.refinementRate` | RR-T6 | InsightsPanel.tsx source references `insights.refinementRate` |
| refinement-rate | Zero renders "0%" | RR-T7 | InsightsPanel.tsx source appends `%` or uses formatter for `refinementRate` |
| runs-by-type | Type has `featureRuns` and `refinementRuns` | RBT-T1 | Source of `lib/insights.ts` contains `featureRuns: number` and `refinementRuns: number` |
| runs-by-type | Counts split correctly | RBT-T2 | 3 feature + 2 refinement runs → `featureRuns===3, refinementRuns===2` |
| runs-by-type | Unknown types excluded from both | RBT-T3 | 1 feature + 1 unknown type → `featureRuns===1, refinementRuns===0` |
| runs-by-type | empty array → both 0 | RBT-T4 | `computeInsights([])` → both `0` |
| runs-by-type | Panel shows "Feature: {n}" and "Refinement: {n}" labels | RBT-T5 | InsightsPanel.tsx source contains text matching `Feature:` and `Refinement:` near `featureRuns`/`refinementRuns` |
| runs-by-type | Panel references both counts | RBT-T6 | InsightsPanel.tsx source references `insights.featureRuns` and `insights.refinementRuns` |
| success-by-stage | Type has `stageSuccessRates: Record<string, number>` | SSR-T1 | Source of `lib/insights.ts` contains `stageSuccessRates` |
| success-by-stage | Per-stage % = successes/total × 100, 1 dp | SSR-T2 | 3 runs for "alex" (2 success, 1 fail) → `stageSuccessRates.alex === 66.7` |
| success-by-stage | Absent stage omitted or null | SSR-T3 | Fixture with no "cass" runs → `stageSuccessRates.cass` is `undefined` or `null` |
| success-by-stage | Null/undefined stage excluded | SSR-T4 | Run with `stage: null` does not affect any stage count |
| success-by-stage | empty array → `{}` | SSR-T5 | `computeInsights([])` → `stageSuccessRates` deep-equals `{}` |
| success-by-stage | Panel renders per-stage percentages | SSR-T6 | InsightsPanel.tsx source contains `stageSuccessRates` and a `%` format expression |
| success-by-stage | Empty object → no stage rows, no throw | SSR-T7 | InsightsPanel.tsx source handles empty `stageSuccessRates` without unconditional access |

---

## Key Assumptions

- `ASSUMPTION: lib/insights.js` mirror exists for the `node --test` runner (noted in source comment).
- `ASSUMPTION: InsightsRun` gains top-level `type`, `slug`, `stage` fields (not nested inside `stages` JSONB).
- `ASSUMPTION: stageSuccessRates` keyed off the new top-level `stage` field, not the JSONB `stages` object.
- `ASSUMPTION: formatCost` is applied to `avgCostPerRun` in the panel, matching the existing `totalCost` card pattern.
- `ASSUMPTION:` Absent stage key is omitted from `stageSuccessRates` (not mapped to `null`); test asserts `undefined` or `null` (either is acceptable).
