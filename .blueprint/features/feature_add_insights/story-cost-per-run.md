# Story: Cost Per Run (Average)

**As a** portal operator,
**I want** to see the average cost per pipeline run displayed on the InsightsPanel,
**so that** I can understand the cost efficiency of my pipeline at a glance.

---

## Acceptance Criteria

**Given** the `AggregateInsights` type in `lib/insights.ts`,
**When** I inspect its definition,
**Then** it must contain a field `avgCostPerRun: number`.

---

**Given** `computeInsights` is called with an array of runs where each run has a non-null `totalCost`,
**When** there are `n` runs with a combined total cost of `T`,
**Then** the returned `avgCostPerRun` equals `T / n` (a number, not null).

---

**Given** `computeInsights` is called with runs where some `totalCost` values are `null` or `undefined`,
**When** computing the average,
**Then** null/undefined `totalCost` values are treated as `0` (not excluded from the denominator).

---

**Given** `computeInsights` is called with an empty runs array,
**When** no runs exist,
**Then** the returned `avgCostPerRun` is `0`.

---

**Given** the `InsightsPanel` component in `app/dashboard/InsightsPanel.tsx`,
**When** I inspect its JSX,
**Then** it must render a `StatCard` (or equivalent element) with a label matching `"Avg Cost / Run"` (or similar wording containing "cost" and "run") and a value derived from `insights.avgCostPerRun`, formatted as a currency string (e.g. `"$0.042"`).

---

**Given** `insights.avgCostPerRun` is `0`,
**When** the `InsightsPanel` renders,
**Then** the card must display `"$0.00"` (not blank, not null, not "—").

---

## Out of Scope

- Per-slug or per-feature cost breakdown
- Cost trend charts over time
- CSV/JSON export of cost data
- Modifying any existing InsightsPanel stat card
