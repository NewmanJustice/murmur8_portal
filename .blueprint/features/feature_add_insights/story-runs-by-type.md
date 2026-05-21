# Story: Runs by Type

**As a** portal operator,
**I want** to see how many pipeline runs are of type "feature" versus "refinement",
**so that** I can understand the composition of pipeline activity at a glance.

---

## Acceptance Criteria

**Given** the `AggregateInsights` type in `lib/insights.ts`,
**When** I inspect its definition,
**Then** it must contain two fields: `featureRuns: number` and `refinementRuns: number`.

---

**Given** `computeInsights` is called with runs that have `type` values of `"feature"` and `"refinement"`,
**When** computing run type counts,
**Then** `featureRuns` equals the count of runs where `type === "feature"` and `refinementRuns` equals the count of runs where `type === "refinement"`.

---

**Given** `computeInsights` is called with runs that include `type` values other than `"feature"` or `"refinement"` (e.g. null, unknown strings),
**When** computing type counts,
**Then** those runs are excluded from both `featureRuns` and `refinementRuns` (counted in neither bucket).

---

**Given** `computeInsights` is called with an empty runs array,
**When** no runs exist,
**Then** both `featureRuns` and `refinementRuns` are `0`.

---

**Given** the `InsightsPanel` component in `app/dashboard/InsightsPanel.tsx`,
**When** I inspect its JSX,
**Then** it must render a single card or section that displays both counts, with text matching the pattern `"Feature: {n}"` and `"Refinement: {n}"` (or equivalent clear labelling of both values within the same element).

---

**Given** both `insights.featureRuns` and `insights.refinementRuns` are `0`,
**When** the `InsightsPanel` renders,
**Then** the card must display `"Feature: 0"` and `"Refinement: 0"` (not blank, not null).

---

## Out of Scope

- Distinguishing unknown or future run type values
- Filtering the run list by type
- Time-series breakdown by type
- Altering any existing InsightsPanel card
