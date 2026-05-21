# Story: Run Velocity Metric

**Story ID:** add_more_insights-01
**Feature:** add_more_insights

---

## User Story

As a Portal Operator,
I want to see how many pipeline runs occurred in the last 7 days and last 30 days on the dashboard,
so that I can gauge whether my team's pipeline throughput is trending up or down without querying raw data.

---

## Acceptance Criteria

**Given** I am viewing the InsightsPanel on the dashboard

**AC1 — Interface fields exist**
Given `lib/insights.ts` is read,
When the `AggregateInsights` interface definition is inspected,
Then it contains fields named `runVelocity` (or equivalent) with sub-fields `last7Days` and `last30Days` of type `number`.

**AC2 — Computation logic uses relative time window**
Given `lib/insights.ts` is read,
When the `computeInsights()` function body is inspected,
Then it contains logic that computes a count of runs where `startedAt` (or `completedAt`) falls within the last 7 days relative to the current server time,
And it contains logic for a 30-day window using the same field.

**AC3 — Null datetime values are excluded**
Given `lib/insights.ts` is read,
When the velocity computation block is inspected,
Then runs with a null or undefined datetime field are excluded from both the 7-day and 30-day counts (i.e. a null-guard or filter is present before the date comparison).

**AC4 — Degrades to zero when no recent runs**
Given `lib/insights.ts` is read,
When the velocity computation result is inspected,
Then `last7Days` and `last30Days` default to `0` when no runs fall in those windows (no `undefined` or `null` returned for these numeric fields).

**AC5 — InsightsPanel renders a velocity card**
Given `app/dashboard/InsightsPanel.tsx` is read,
When the JSX is inspected,
Then there is a card or section containing the label text "Last 7 days" and "Last 30 days" (or equivalent display strings).

**AC6 — `getInsightsData()` / `InsightsRun` includes a datetime field**
Given `lib/insights.ts` (or the file that defines `InsightsRun`) is read,
When the `InsightsRun` type definition is inspected,
Then it includes a `startedAt` or `completedAt` field (datetime type, nullable allowed).

---

## Out of Scope

- Time-series charts, sparklines, or trend arrows
- Filtering the velocity metric by slug, run type, or custom date range
- Per-day breakdown within the 7-day or 30-day window
- Any database schema changes
