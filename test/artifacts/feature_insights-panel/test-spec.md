# Test Spec — insights-panel

## Scope
Pure unit tests targeting `lib/insights.js` helper functions.
No DB, no HTTP, no Next.js. All tests runnable with `node --test`.

## Functions Under Test
| Function | Source |
|----------|--------|
| `computeInsights(runs)` | lib/insights.js |
| `computeStageAverages(runs)` | lib/insights.js |
| `getMostCommonFailureStage(runs)` | lib/insights.js |

## Test Cases

| Test ID | Story AC | Function | Scenario | Expected |
|---------|----------|----------|----------|----------|
| T-IP-01 | AS-AC2 | `computeInsights` | Empty runs array | `{ totalRuns: 0, successRate: null, avgDurationMs: null, totalCost: 0 }` |
| T-IP-02 | AS-AC2 | `computeInsights` | 3 runs, all success | `totalRuns: 3`, `successRate: 100.0` |
| T-IP-03 | AS-AC3 | `computeInsights` | 4 runs: 2 success, 1 failed, 1 paused | `successRate: 50.0` |
| T-IP-04 | AS-AC3 | `computeInsights` | Success rate rounds to 1dp (1/3) | `successRate: 33.3` |
| T-IP-05 | AS-AC4 | `computeInsights` | No runs → success rate null | `successRate: null` |
| T-IP-06 | AS-AC5 | `computeInsights` | 2 runs with durationMs 60000 and 120000 | `avgDurationMs: 90000` |
| T-IP-07 | AS-AC6 | `computeInsights` | All runs have null `totalDurationMs` | `avgDurationMs: null` |
| T-IP-08 | AS-AC7 | `computeInsights` | 2 runs: cost 0.01 and 0.02 | `totalCost: 0.03` |
| T-IP-09 | AS-AC7 | `computeInsights` | Run with null `totalCost` treated as 0 | `totalCost` equals sum of non-null values |
| T-IP-10 | SB-AC2 | `computeStageAverages` | 2 runs each with alex durationMs 10000 and 20000 | alex avg = 15000 |
| T-IP-11 | SB-AC3 | `computeStageAverages` | Stage absent from some runs | Average uses only runs containing that stage |
| T-IP-12 | SB-AC4 | `computeStageAverages` | Stage absent from all runs | Entry for that stage has `avgDurationMs: null` |
| T-IP-13 | SB-AC5 | `computeStageAverages` | Empty runs array | All known stages have `avgDurationMs: null` |
| T-IP-14 | SB-AC1 | `computeStageAverages` | Always returns all 6 known stage keys in STAGE_ORDER | Result array length = 6, keys in order |
| T-IP-15 | FP-AC1 | `getMostCommonFailureStage` | 3 failed runs: 2 with "codey-implement", 1 with "alex" | Returns `"codey-implement"` |
| T-IP-16 | FP-AC2 | `getMostCommonFailureStage` | Tie: 1 "alex", 1 "cass" | Returns `"alex"` (alphabetical tie-break) |
| T-IP-17 | FP-AC3 | `getMostCommonFailureStage` | No failed runs | Returns `null` |
| T-IP-18 | FP-AC4 | `getMostCommonFailureStage` | Failed run with null `failedStage` | Null excluded; only non-null values counted |
| T-IP-19 | FP-AC3 | `getMostCommonFailureStage` | Empty runs array | Returns `null` |
| T-IP-20 | SB-AC3 | `computeStageAverages` | Stage durationMs = 0 (valid) | Included in average as 0 |
