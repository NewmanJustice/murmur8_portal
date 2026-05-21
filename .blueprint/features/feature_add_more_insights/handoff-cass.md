## Handoff Summary
**For:** Nigel
**Feature:** add_more_insights

### Key Decisions
- Four metrics split into three stories: velocity (7d/30d windows), top-slug (run count + cost grouped), average feedback rating
- All ACs are verifiable by reading source file text in `lib/insights.ts` and `app/dashboard/InsightsPanel.tsx`
- Velocity ACs require time-relative logic (no fixed dates) and null datetime guards
- Top-slug ACs require alphabetical tie-breaking logic to be present and both metrics to return null (displayed as "—") when no runs
- Rating ACs require [1,5] range filter, one-decimal rounding, null return when no valid data, and "/ 5" display string

### Files Created
- `.blueprint/features/feature_add_more_insights/story-run-velocity.md`
- `.blueprint/features/feature_add_more_insights/story-top-slug-metrics.md`
- `.blueprint/features/feature_add_more_insights/story-average-feedback-rating.md`

### Open Questions
- None

### Critical Context
Tests should be pure file-content assertions on `lib/insights.ts` and `app/dashboard/InsightsPanel.tsx`. Key patterns to assert: `last7Days`/`last30Days` fields on `AggregateInsights`; null-guard before date comparison in velocity; alphabetical tie-break (`localeCompare` or `<`) in both top-slug computations; `feedback.rating` path in stages iteration; `>= 1` and `<= 5` range guards on rating collection; `toFixed(1)` or equivalent rounding; `"/ 5"` string in InsightsPanel JSX; `"—"` fallback strings for null top-slug and null rating values.
