## Handoff Summary
**For:** Cass
**Feature:** add_insights

### Key Decisions
- Four new metrics approved: cost per run (avg), refinement rate, runs by type, success rate by stage
- All metrics are computed from existing Run table fields — no schema changes
- Display is strictly additive; no existing InsightsPanel cards are removed or moved
- Refinement rate is defined as distinct slugs with any refinement run / all distinct slugs (not a raw run count)
- Graceful zero/empty state is required for every new metric when no data exists

### Files Created
- `.blueprint/features/feature_add_insights/FEATURE_SPEC.md`

### Open Questions
- None

### Critical Context
The InsightsPanel (`app/dashboard/InsightsPanel.tsx`) already renders aggregate stats from `computeInsights()` in `lib/insights.ts`. The four new metrics extend that function and the `AggregateInsights` type — Cass should write stories that specify both the computed values and their display on the dashboard. The `Run` table has `costUsd`, `type` (feature/refinement), `slug`, `stage`, and `status` fields that back all four new metrics.
