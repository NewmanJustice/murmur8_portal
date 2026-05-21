# Story: Average Agent Feedback Rating

**Story ID:** add_more_insights-03
**Feature:** add_more_insights

---

## User Story

As a Portal Operator,
I want to see the average agent feedback rating across all pipeline runs and all stages on the dashboard,
so that I can assess whether my agents' self-assessed quality is improving or degrading over time without querying raw data.

---

## Acceptance Criteria

**AC1 — Interface field for average rating exists**
Given `lib/insights.ts` is read,
When the `AggregateInsights` interface definition is inspected,
Then it contains a field for the average feedback rating (e.g. `avgFeedbackRating`) of type `number | null`.

**AC2 — Computation iterates stages JSONB for rating values**
Given `lib/insights.ts` is read,
When the `computeInsights()` function body is inspected,
Then it contains logic that iterates over all runs and, for each run, accesses the `stages` field (JSONB array),
And for each stage it reads `feedback.rating` (or equivalent nested path).

**AC3 — Only values in [1, 5] inclusive are collected**
Given `lib/insights.ts` is read,
When the rating collection logic is inspected,
Then it contains a numeric range check that filters out values below `1` or above `5`,
And non-numeric values (strings, null, undefined) are also excluded before or by the range check.

**AC4 — Arithmetic mean is rounded to one decimal place**
Given `lib/insights.ts` is read,
When the final average calculation is inspected,
Then the result is rounded to one decimal place (e.g. uses `toFixed(1)`, `Math.round(x * 10) / 10`, or equivalent),
And the return type is `number` (not a string) for the `AggregateInsights` field.

**AC5 — Returns null when no valid ratings exist**
Given `lib/insights.ts` is read,
When the fallback path of the rating computation is inspected,
Then `null` is returned when the collected ratings array is empty (no valid values found across all runs and stages).

**AC6 — InsightsPanel displays the rating in "X.X / 5" format**
Given `app/dashboard/InsightsPanel.tsx` is read,
When the JSX for the feedback rating card is inspected,
Then it renders the rating value followed by "/ 5" (e.g. the string `"/ 5"` or `" / 5"` appears adjacent to the displayed value),
And a null rating is displayed as "—" (em-dash) or equivalent fallback text.

**AC7 — Rating spans all runs and all stages (global aggregate)**
Given `lib/insights.ts` is read,
When the computation scope is inspected,
Then the rating collection loop covers all runs in the input array (not a subset),
And within each run covers all entries in the `stages` array (not a single stage).

---

## Out of Scope

- Per-stage or per-run breakdown of feedback ratings
- Trend over time or time-windowed rating views
- Filtering ratings by run type, slug, or agent
- Non-numeric feedback fields (e.g. free-text comments)
- Any database schema changes
