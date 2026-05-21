# Story: Success Rate by Stage

**As a** portal operator,
**I want** to see the pass rate for each pipeline stage (alex, cass, nigel-spec, nigel-tests, codey-plan, codey-implement),
**so that** I can identify which stage is most prone to failure and prioritise improvements.

---

## Acceptance Criteria

**Given** the `AggregateInsights` type in `lib/insights.ts`,
**When** I inspect its definition,
**Then** it must contain a field `stageSuccessRates: Record<string, number>` (or an equivalent named type), mapping stage key strings to pass-rate percentage numbers.

---

**Given** `computeInsights` is called with runs that have `stage` and `status` fields,
**When** computing success rates,
**Then** for each distinct stage key present in the runs, `stageSuccessRates[stageKey]` equals `count(runs where stage===stageKey and status==="success") / count(runs where stage===stageKey) * 100`, rounded to one decimal place.

---

**Given** `computeInsights` is called with runs where a particular stage key is absent from all runs,
**When** computing success rates,
**Then** that stage key is either omitted from `stageSuccessRates` or mapped to `null` — it must not be present with a fabricated non-null value.

---

**Given** `computeInsights` is called with runs where some have a `null` or `undefined` `stage` field,
**When** computing success rates,
**Then** those runs are excluded from all stage success rate calculations (not attributed to any stage).

---

**Given** `computeInsights` is called with an empty runs array,
**When** no runs exist,
**Then** `stageSuccessRates` is an empty object `{}`.

---

**Given** the `InsightsPanel` component in `app/dashboard/InsightsPanel.tsx`,
**When** I inspect its JSX,
**Then** it must render a per-stage success rate section (table, list, or card group) that displays each stage key alongside its pass rate as a percentage (e.g. `"alex: 85%"`), consistent in visual style with the existing stage averages section.

---

**Given** `insights.stageSuccessRates` is an empty object,
**When** the `InsightsPanel` renders,
**Then** the success rate section must not throw and must render without any stage rows (empty state, not an error).

---

## Out of Scope

- Per-slug or per-feature stage success rates
- Trend or historical pass-rate charts
- Filtering by stage
- Any changes to how `computeStageAverages` works
- Altering any existing InsightsPanel card or table column
