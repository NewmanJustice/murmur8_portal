# Test Specification: most_pipeline_runs_on

## Understanding

A new InsightsPanel stat card "Most Active Repo" shows the `repoName` with the highest pipeline run count. The feature adds:
- `repoName` field to `InsightsRun` interface
- `topRepoByRunCount: string | null` field to `AggregateInsights`
- Grouping logic in `computeInsights()` that counts runs per non-null `repoName`, returns the max with alphabetical tie-break
- A StatCard in `InsightsPanel.tsx` with label "Most Active Repo" and em-dash fallback
- `repoName` added to `getInsightsData()` select in `lib/runs.ts`

All tests are file-content string assertions (no build, no DB, no runtime).

## AC to Test ID Mapping

| Test ID   | Description                                                        |
|-----------|--------------------------------------------------------------------|
| T-MPR-01  | `InsightsRun` interface contains `repoName` field                  |
| T-MPR-02  | `AggregateInsights` contains `topRepoByRunCount` field             |
| T-MPR-03  | `computeInsights` groups by `repoName` (references both terms)     |
| T-MPR-04  | Null `repoName` excluded (null guard present in grouping logic)    |
| T-MPR-05  | Alphabetical tie-breaking (`localeCompare` or `.sort` present)     |
| T-MPR-06  | Returns `null` when no repo data (zero-runs return has field null) |
| T-MPR-07  | `InsightsPanel` references `topRepoByRunCount`                     |
| T-MPR-08  | `InsightsPanel` contains "Most Active Repo" label                  |
| T-MPR-09  | `InsightsPanel` has em-dash fallback for null value                |
| T-MPR-10  | `lib/runs.ts` selects `repoName` in `getInsightsData`             |

## Key Assumptions

- ASSUMPTION: `repoName` is the exact field name on `InsightsRun` (matches Prisma Run model).
- ASSUMPTION: `topRepoByRunCount` is the exact field name on `AggregateInsights`.
- ASSUMPTION: Tie-breaking uses `.sort()` or `localeCompare` (consistent with `getMostCommonFailureStage`).
- ASSUMPTION: The em-dash character used is the Unicode em-dash (U+2014).
- ASSUMPTION: Files under test are `lib/insights.ts`, `app/dashboard/InsightsPanel.tsx`, `lib/runs.ts`.
