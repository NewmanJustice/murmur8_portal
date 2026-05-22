# Nigel Handoff — most_pipeline_runs_on

**Feature:** Most Active Repo tile on InsightsPanel
**Date:** 2026-05-22
**Status:** tests written

## Test Artifact Locations

- Test spec: `test/artifacts/feature_most_pipeline_runs_on/test-spec.md`
- Executable tests: `test/feature_most_pipeline_runs_on.test.js`

## Summary

10 file-content assertion tests (T-MPR-01 through T-MPR-10) covering:
- Interface field additions (`repoName` on InsightsRun, `topRepoByRunCount` on AggregateInsights)
- Computation logic (grouping, null exclusion, alphabetical tie-break, null fallback)
- UI rendering (label, value reference, em-dash fallback)
- Data-fetch layer (`repoName` in select)

## Run Command

```bash
node --test test/feature_most_pipeline_runs_on.test.js
```

## Pre-implementation State

All 10 tests FAIL (feature code not yet present).

## Handoff to Codey

Implement changes in this order:
1. Add `repoName` to `InsightsRun` interface in `lib/insights.ts`
2. Add `repoName` to `getInsightsData()` select in `lib/runs.ts`
3. Add `topRepoByRunCount: string | null` to `AggregateInsights` in `lib/insights.ts`
4. Add computation logic in `computeInsights()` (group, count, max, tie-break, null guard)
5. Add StatCard in `InsightsPanel.tsx` with label "Most Active Repo" and em-dash fallback
