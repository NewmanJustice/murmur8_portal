# Test Specification: add_more_insights

## Understanding

Three new metrics are added to `lib/insights.ts` and rendered in `app/dashboard/InsightsPanel.tsx`:
1. **Run Velocity** — counts runs in last-7-days and last-30-days windows using a datetime field; both default to `0` on no data.
2. **Top Slug by Run Count / Cost** — groups runs by `slug`, counts and sums `totalCost`; alphabetical tie-breaking; both return `null` (displayed as "—") when no eligible runs.
3. **Average Feedback Rating** — iterates all runs and all `stages[key].feedback.rating` values; filters to [1,5]; rounds to one decimal; returns `null` (displayed as "—") when no valid ratings.

All tests are pure file-content string assertions on `lib/insights.ts` and `app/dashboard/InsightsPanel.tsx`.
ASSUMPTION: `lib/insights.ts` is the single source of truth for all new computation logic.
ASSUMPTION: `app/dashboard/InsightsPanel.tsx` is the single file rendering the new metric cards.
ASSUMPTION: The JS mirror file `lib/insights.js` is kept in sync by Codey and is the file the test runner actually imports.

## AC → Test ID Mapping

| Story | AC  | Test ID | Description                                                      |
|-------|-----|---------|------------------------------------------------------------------|
| S01   | AC1 | T01     | `AggregateInsights` interface contains `last7Days` and `last30Days` fields |
| S01   | AC2 | T02     | `computeInsights` contains a 7-day relative time window computation |
| S01   | AC2 | T03     | `computeInsights` contains a 30-day relative time window computation |
| S01   | AC3 | T04     | Velocity block has a null-guard before date comparison            |
| S01   | AC4 | T05     | Velocity fields default to `0` (no `undefined`/`null` return)    |
| S01   | AC5 | T06     | InsightsPanel JSX contains "Last 7 days" (or equivalent) label   |
| S01   | AC5 | T07     | InsightsPanel JSX contains "Last 30 days" (or equivalent) label  |
| S01   | AC6 | T08     | `InsightsRun` interface contains `startedAt` or `completedAt` field |
| S02   | AC1 | T09     | `AggregateInsights` contains `topSlugByRunCount` field            |
| S02   | AC1 | T10     | `AggregateInsights` contains `topSlugByCost` field                |
| S02   | AC2 | T11     | `computeInsights` groups runs by `slug` for run-count metric      |
| S02   | AC3 | T12     | Run-count tie-breaking uses alphabetical comparison (`localeCompare` or `<`) |
| S02   | AC4 | T13     | Cost metric sums `totalCost` per slug                             |
| S02   | AC4 | T14     | Cost tie-breaking uses alphabetical comparison                    |
| S02   | AC5 | T15     | Null/undefined `slug` values are excluded before grouping         |
| S02   | AC6 | T16     | Both top-slug fields return `null` when no runs                   |
| S02   | AC6 | T17     | InsightsPanel renders "—" fallback for null top-slug values       |
| S02   | AC7 | T18     | InsightsPanel renders a card with top-slug-by-run-count display   |
| S02   | AC7 | T19     | InsightsPanel renders a card with top-slug-by-cost display (with `$`) |
| S03   | AC1 | T20     | `AggregateInsights` contains `avgFeedbackRating` field of type `number \| null` |
| S03   | AC2 | T21     | `computeInsights` iterates `stages` JSONB and reads `feedback.rating` path |
| S03   | AC3 | T22     | Rating collection guards `>= 1` (lower bound)                     |
| S03   | AC3 | T23     | Rating collection guards `<= 5` (upper bound)                     |
| S03   | AC4 | T24     | Final average uses `toFixed(1)` or equivalent one-decimal rounding |
| S03   | AC5 | T25     | Returns `null` when no valid ratings found                        |
| S03   | AC6 | T26     | InsightsPanel renders `"/ 5"` string adjacent to rating value     |
| S03   | AC6 | T27     | InsightsPanel renders "—" fallback for null rating                |
| S03   | AC7 | T28     | Rating loop covers all runs and all stage entries (not a subset)  |

## Key Assumptions

- ASSUMPTION: Datetime field added to `InsightsRun` will be named `startedAt` or `completedAt` (nullable).
- ASSUMPTION: `runVelocity` (or equivalent) is a nested object on `AggregateInsights` with `last7Days` and `last30Days` as numeric sub-fields.
- ASSUMPTION: `topSlugByRunCount` and `topSlugByCost` are the exact field names used on `AggregateInsights`.
- ASSUMPTION: `avgFeedbackRating` is the exact field name on `AggregateInsights`.
- ASSUMPTION: The `stages` JSONB field is iterated as an array (or object values) and each entry exposes `feedback.rating` as a direct nested path.
