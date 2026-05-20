## Handoff Summary
**For:** Nigel
**Feature:** insights-panel

### Stories Written
1. `story-aggregate-stats.md` — 8 ACs covering total runs, success rate, avg duration, total cost (including zero/null states)
2. `story-stage-breakdown.md` — 6 ACs covering per-stage average duration, partial JSONB, empty states, accent colours
3. `story-failure-patterns.md` — 4 ACs covering most-common failure stage, tie-breaking, conditional visibility, null exclusion
4. `story-access-control.md` — 3 ACs covering auth redirect, user scoping, session-only userId

### Files Created
- `.blueprint/features/feature_insights-panel/story-aggregate-stats.md`
- `.blueprint/features/feature_insights-panel/story-stage-breakdown.md`
- `.blueprint/features/feature_insights-panel/story-failure-patterns.md`
- `.blueprint/features/feature_insights-panel/story-access-control.md`

### Open Questions
- None blocking Nigel. Stage accent colours (AC6 in stage-breakdown) are a UI concern — test via class strings as done in run-detail tests.

### Critical Context
The implementation will add pure helper functions to a new `lib/insights.js` file. Nigel's tests should target these pure functions: `computeInsights(runs)`, `computeStageAverages(runs)`, `getMostCommonFailureStage(runs)`. The `stages` JSONB parsing logic (extracting `durationMs` per stage) is the most edge-case-rich area — test partial/missing/malformed JSONB carefully.
