# Story: View Aggregate Stats

**As an** authenticated user,
**I want** to see at-a-glance aggregate stats for all my pipeline runs,
**so that** I can quickly assess the overall health and cost of my pipeline activity.

---

## Acceptance Criteria

**AC1 — Stats are scoped to my runs only**
Given I am signed in,
When the insights panel loads,
Then all displayed statistics are computed solely from my own runs (userId from session — R1).

**AC2 — Total runs count**
Given I have N runs (N ≥ 0),
When the insights panel is shown,
Then I see a "Total Runs" stat card displaying N.

**AC3 — Success rate**
Given I have at least one run,
When the panel loads,
Then the "Success Rate" card shows `(successCount / totalRuns * 100)` rounded to one decimal place followed by "%".

**AC4 — Success rate with no runs**
Given I have zero runs,
When the panel loads,
Then the "Success Rate" card shows "—" (not "0%" or a crash).

**AC5 — Average duration**
Given I have at least one run with a non-null `totalDurationMs`,
When the panel loads,
Then the "Avg Duration" card shows the mean duration as a human-readable string (e.g. "4m 12s"), using the same `formatDuration` logic as the run list.

**AC6 — Average duration with no data**
Given all my runs have null `totalDurationMs` or I have no runs,
When the panel loads,
Then the "Avg Duration" card shows "—".

**AC7 — Total cost**
Given I have runs (including runs with null `totalCost`),
When the panel loads,
Then the "Total Cost" card shows the sum of all non-null `totalCost` values, formatted as "$X.XXX"; null values are treated as 0.

**AC8 — Total cost with no runs**
Given I have zero runs,
When the panel loads,
Then the "Total Cost" card shows "$0.000".

---

## Out of Scope
- Filtering insights by date range or status
- Per-slug breakdown
- Comparing my stats to other users
