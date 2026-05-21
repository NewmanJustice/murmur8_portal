# Story: Refinement Rate

**As a** portal operator,
**I want** to see the percentage of feature slugs that required at least one refinement run,
**so that** I can gauge how often my pipeline produces output that needs iteration.

---

## Acceptance Criteria

**Given** the `AggregateInsights` type in `lib/insights.ts`,
**When** I inspect its definition,
**Then** it must contain a field `refinementRate: number` (a percentage value, e.g. `23` for 23%).

---

**Given** `computeInsights` is called with runs spanning multiple slugs, some of which have at least one run with `type === "refinement"`,
**When** computing `refinementRate`,
**Then** it equals `(count of distinct slugs that have any run with type="refinement") / (count of all distinct slugs) * 100`, rounded to one decimal place.

---

**Given** `computeInsights` is called with runs where no run has `type === "refinement"`,
**When** computing `refinementRate`,
**Then** the returned value is `0`.

---

**Given** `computeInsights` is called with an empty runs array,
**When** no runs exist,
**Then** the returned `refinementRate` is `0`.

---

**Given** the `InsightsPanel` component in `app/dashboard/InsightsPanel.tsx`,
**When** I inspect its JSX,
**Then** it must render a `StatCard` (or equivalent element) with a label matching `"Refinement Rate"` (or similar wording) and a value derived from `insights.refinementRate`, formatted as a percentage string (e.g. `"23%"`).

---

**Given** `insights.refinementRate` is `0`,
**When** the `InsightsPanel` renders,
**Then** the card must display `"0%"` (not blank, not null, not "—").

---

## Out of Scope

- Per-slug refinement history
- Filtering or sorting by refinement frequency
- Any changes to how runs are recorded or typed
- Altering any existing InsightsPanel card
