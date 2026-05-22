## Handoff Summary
**For:** Nigel (skipping Cass — technical feature)
**Feature:** most_pipeline_runs_on

### Key Decisions
- New field `topRepoByRunCount: string | null` added to `AggregateInsights`
- `repoName` added to `InsightsRun` interface and `getInsightsData()` select
- Runs with null/undefined `repoName` are excluded from grouping
- Tie-break: alphabetical (first alphabetically wins) — matches `getMostCommonFailureStage` pattern
- Display: StatCard with label "Most Active Repo", value is repo name or em-dash when null

### Files Created
- .blueprint/features/feature_most_pipeline_runs_on/FEATURE_SPEC.md

### Open Questions
- None

### Critical Context
The `repoName String?` field already exists on the Run model (added in `feature_add-repo-fields`). Implementation follows the exact same pattern as existing metrics in `computeInsights()` — group, count, pick max with alphabetical tie-break. The grouping logic mirrors `getMostCommonFailureStage` in structure. Tests should cover: normal case, all-null case, tie-breaking, empty array, and UI rendering with both populated and null values.
