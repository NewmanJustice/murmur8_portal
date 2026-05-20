## Handoff Summary
**For:** Cass
**Feature:** insights-panel

### Key Decisions
- Insights panel renders as a section above the run list on `/dashboard` (not a separate route)
- All four stat cards are always "all time, all statuses" — filters on the run list do NOT affect insights
- Success rate is `null` (→ "—") when user has zero runs; total cost is `$0.000` for zero runs
- Stage breakdown derives averages from the `stages` JSONB field in-app (no SQL JSON functions)
- "Most common failure stage" is conditionally shown only when at least one `status='failed'` run exists

### Files Created
- `.blueprint/features/feature_insights-panel/FEATURE_SPEC.md`

### Open Questions
- None blocking Cass. Placement and filter-independence are resolved in the spec (OQ-IP1, OQ-IP2).

### Critical Context
Every story must assert R1: user sees only their own aggregate data. `userId` is always from the server session. The `stages` JSONB is parsed in the app layer — stories should include an AC that handles missing/partial stage data gracefully. Stat card "—" vs "0" distinction is important: success rate shows "—" with no runs, but total cost shows "$0.000".
