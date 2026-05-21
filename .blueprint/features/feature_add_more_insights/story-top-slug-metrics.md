# Story: Top Slug by Run Count and Total Cost

**Story ID:** add_more_insights-02
**Feature:** add_more_insights

---

## User Story

As a Portal Operator,
I want to see which feature slug has the most pipeline runs and which has the highest total cost on the dashboard,
so that I can quickly identify where pipeline effort and spend are concentrated without querying raw data.

---

## Acceptance Criteria

**AC1 — Interface fields for top-slug metrics exist**
Given `lib/insights.ts` is read,
When the `AggregateInsights` interface definition is inspected,
Then it contains a field for "top slug by run count" (e.g. `topSlugByRunCount`) and a field for "top slug by total cost" (e.g. `topSlugByCost`),
And each field holds an object with at least a `slug: string` property (plus a count or cost property), or is `null`.

**AC2 — Top-slug-by-run-count computation groups by slug**
Given `lib/insights.ts` is read,
When the `computeInsights()` function body is inspected,
Then it contains logic that groups runs by their `slug` field and counts the number of runs per slug,
And it selects the slug with the highest count.

**AC3 — Alphabetical tie-breaking for run count**
Given `lib/insights.ts` is read,
When the tie-breaking logic for "top slug by run count" is inspected,
Then when two or more slugs share the same run count, the alphabetically first slug is selected (e.g. a sort or `localeCompare`/`<` comparison is present).

**AC4 — Top-slug-by-cost computation aggregates totalCost per slug**
Given `lib/insights.ts` is read,
When the `computeInsights()` function body is inspected,
Then it contains logic that sums `totalCost` per slug (treating null `totalCost` as `0`),
And it selects the slug with the highest summed cost,
And when two slugs tie on total cost, the alphabetically first slug is selected.

**AC5 — Null slugs are excluded from both computations**
Given `lib/insights.ts` is read,
When the grouping logic for both top-slug metrics is inspected,
Then runs with a null or undefined `slug` field are excluded before grouping.

**AC6 — Both metrics degrade to null / "—" when no runs**
Given `lib/insights.ts` is read,
When the return value for both top-slug fields is inspected,
Then both return `null` when the input run array is empty or contains no non-null slugs.
Given `app/dashboard/InsightsPanel.tsx` is read,
When the rendering logic for these cards is inspected,
Then a null value is displayed as "—" (em-dash) or equivalent fallback text.

**AC7 — InsightsPanel renders cards for both top-slug metrics**
Given `app/dashboard/InsightsPanel.tsx` is read,
When the JSX is inspected,
Then there is a card or section that displays the top-slug-by-run-count value (slug name + run count),
And there is a card or section that displays the top-slug-by-cost value (slug name + formatted cost with a "$" prefix or equivalent currency format).

---

## Out of Scope

- Per-slug drill-down detail views
- Sorting or filtering by slug from the panel
- Displaying more than one slug per metric (no ranked list)
- Any database schema changes
- Removing or repositioning existing InsightsPanel cards
