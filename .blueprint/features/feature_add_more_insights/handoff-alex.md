## Handoff Summary
**For:** Cass
**Feature:** add_more_insights

### Key Decisions
- Scope is exactly four new metrics: run velocity (7d/30d), top slug by run count, top slug by total cost, average agent feedback rating
- All metrics are pure computed aggregates over existing Run table data — no schema changes, no new DB queries
- `getInsightsData()` may need one additive field (`startedAt`/`completedAt`) to support velocity; this is a non-breaking change
- Tie-breaking for top-slug metrics is alphabetical (first slug wins) to keep computation deterministic and testable
- Average feedback rating collects only numeric values in [1, 5] from `stages[*].feedback.rating`; invalid/missing values silently skipped

### Files Created
- `.blueprint/features/feature_add_more_insights/FEATURE_SPEC.md`

### Open Questions
- None

### Critical Context
The previous `add_insights` feature (spec at `.blueprint/features/feature_add_insights/FEATURE_SPEC.md`) established the patterns: pure functions in `lib/insights.ts`, additive fields on `AggregateInsights`, new cards in `InsightsPanel.tsx`. This feature follows the same pattern exactly. Cass should write stories against the four metrics in §2, using the rules in §6 as acceptance-criteria anchors. Velocity stories must specify time-relative acceptance criteria (not fixed dates). Top-slug tie-breaking and rating range [1,5] filter should appear explicitly in acceptance criteria.
