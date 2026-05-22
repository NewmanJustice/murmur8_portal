# Feature Specification — Add More Insight Metrics to InsightsPanel

**featureId:** add_more_insights
**status:** draft
**date:** 2026-05-21

---

## 1. Feature Intent

The InsightsPanel (post `add_insights`) surfaces eight metrics: total runs, success rate, average duration, total cost, average cost/run, refinement rate, runs by type, and stage success rates. Developers using murmur8 regularly still lack visibility into pipeline throughput over time, per-slug effort concentration, and average agent quality calibration — gaps that make it hard to answer operational questions like "are we shipping faster than last month?", "which feature is eating the most pipeline runs?", and "are our agents getting better or worse at self-assessing quality?"

- **Problem:** No velocity or trend signal — the current panel shows all-time aggregates with no temporal dimension. No feedback quality signal — stage feedback ratings are collected per run but never surfaced in the panel.
- **User need:** A developer wants to answer "how many runs per day/week?" and "what is the average agent feedback rating across stages?" from the dashboard without querying raw data.
- **System alignment:** The System Spec (`/workspaces/murmur8/murmur8_portal/.blueprint/system_specification/SYSTEM_SPEC.md` §6.7) describes the Insights Panel as a surface for aggregate stats. This feature extends that surface within the existing read-only, server-side computation pattern. No schema changes required.

---

## 2. Scope

### In Scope

Two new computed metrics, all derivable from existing `Run` table fields and the `stages` JSONB column:

1. **Run velocity** — count of runs in the last 7 days and last 30 days (two sub-values in one card)
2. **Average agent feedback rating** — mean of all `stages[*].feedback.rating` values across all runs and all stages (1–5 scale); displayed as a decimal to one place (e.g. "3.8 / 5")

Changes required:
- Extend `AggregateInsights` interface in `lib/insights.ts` with two new fields
- Extend `computeInsights()` in `lib/insights.ts` to compute both new values
- Add corresponding display cards to `app/dashboard/InsightsPanel.tsx`
- Pass `startedAt` or `completedAt` timestamp into `InsightsRun` type so velocity can be computed

### Out of Scope

- Time-series charts or graphs
- Filtering the panel by date range, slug, or run type
- Per-slug detail drill-down views
- Percentile or histogram metrics
- Any database schema changes or new Prisma model fields
- Modifying the run history list, run detail view, or any other panel
- Removing or repositioning any existing InsightsPanel card

---

## 3. Actors Involved

**Portal Operator (authenticated user)**
- Views the InsightsPanel on the dashboard and reads all four new metric cards
- Cannot interact with the metrics (no filtering, no drill-down from the panel itself)

**System (background)**
- Computes all metrics server-side in `computeInsights()` on each dashboard page load
- No real-time or streaming updates; operator refreshes to see new data

---

## 4. Behaviour Overview

When the dashboard loads, `getInsightsData()` fetches all Run records (including `startedAt`/`completedAt`). `computeInsights()` processes them and now also returns the four new fields. `InsightsPanel` renders the additional cards alongside existing ones.

**Run velocity:**
- Counts runs where `startedAt` (or `completedAt`) falls within the last 7 calendar days and within the last 30 calendar days, relative to the current server time at render
- Displayed as a single card with two sub-lines: "Last 7 days: N" and "Last 30 days: N"
- Degrades to "0" / "0" when no recent runs exist

**Average agent feedback rating:**
- Iterates over all runs, digs into `stages` JSONB, collects every `stages[*].feedback.rating` value that is a number in [1, 5]
- Computes arithmetic mean across all collected ratings
- Displayed as a decimal to one place followed by "/ 5" (e.g. "3.8 / 5")
- Degrades to "—" when no rating data exists

---

## 5. State & Lifecycle Interactions

This feature is **state-reading only** — it does not create, transition, or constrain any pipeline, Run, or ApiKey state.

- `computeInsights()` remains a pure function; adding new parameters does not alter its side-effect profile
- The only change to the data-fetch path is ensuring `startedAt` (or `completedAt`) is included in the fields returned by `getInsightsData()` — a non-breaking additive select

---

## 6. Rules & Decision Logic

**Rule 1 — Run velocity**
- Inputs: array of Run records with a datetime field (`startedAt` or `completedAt`); current server timestamp
- Output: `{ last7Days: number, last30Days: number }`
- Edge: null datetime values for a run → that run is excluded from velocity counts
- Deterministic

**Rule 2 — Average agent feedback rating**
- Inputs: array of Run records with `stages` JSONB field
- Output: `number | null` — arithmetic mean of all `stages[*].feedback.rating` values, rounded to one decimal place
- Only numeric values in the range [1, 5] (inclusive) are collected; non-numeric or out-of-range values are skipped
- If no valid ratings collected, returns `null`
- Deterministic

---

## 7. Dependencies

| Dependency | Role |
|---|---|
| `lib/insights.ts` | Owns `computeInsights()`, `InsightsRun`, `AggregateInsights`; new fields and logic added here |
| `app/dashboard/InsightsPanel.tsx` | Renders new cards; receives extended `AggregateInsights` prop |
| `lib/runs.ts → getInsightsData()` | Must include `startedAt` (or `completedAt`) in the returned Run fields; likely a one-line additive change |
| Prisma `Run` model | `startedAt`, `slug`, `totalCost`, `stages` (JSONB) — all already present in schema |

---

## 8. Non-Functional Considerations

- **Performance:** All four new metrics are O(n) passes over the already-fetched Run array. No new database queries. The only additional work is iterating `stages` JSONB for ratings, which is already done for `stageSuccessRates`. Acceptable at current data volumes.
- **Error tolerance:** Malformed or missing JSONB stages fields are silently skipped (consistent with existing `computeStageAverages` and `getMostCommonFailureStage` patterns). Null field values degrade gracefully as defined in each rule above.
- **Security:** Read-only; no new data exposure. All metrics are aggregates — individual run content is not surfaced through these cards.
- **Audit/logging:** No new audit requirements.

---

## 9. Assumptions & Open Questions

**Assumptions:**
- `getInsightsData()` currently selects `startedAt` or `completedAt`; if not, a one-field addition is sufficient — no schema migration needed
- The `stages` JSONB structure consistently uses `feedback.rating` as a numeric field (per the murmur8 telemetry schema in `.business_context/murmur8-framework-understanding.md` §3)
- All-time aggregation (no pagination) of Run records remains acceptable for current data volumes — consistent with the existing `add_insights` approach
- Velocity uses server-side clock at render time; no timezone conversion is required for the counts (UTC throughout)

**Open Questions:**
- None blocking; implementation details (card layout order, exact date field used for velocity) are delegated to Codey

---

## 10. Impact on System Specification

This feature reinforces existing system assumptions:
- The Insights Panel is an established read-only aggregate surface; extending it with more computed metrics is directly in-scope per System Spec §3 and §6.7
- No existing invariants (R1–R8) are affected
- No contradiction with the System Spec; no system spec change proposed

The System Spec §6.7 mentions "basic aggregate insights" as in scope. This feature extends the definition of "basic" incrementally — consistent with the spec's intent, not a stretch of it.

---

## 11. Handover to BA (Cass)

**Story themes:**
- Viewing pipeline throughput over time (run velocity)
- Assessing agent quality calibration (average feedback rating)

**Expected story boundaries:**
- One story per new metric card is appropriate
- Velocity story should specify both 7-day and 30-day windows explicitly in acceptance criteria
- Average rating story should specify the [1,5] valid range filter and the "—" fallback

**Areas needing careful story framing:**
- Velocity is time-relative — acceptance criteria should specify "relative to current server time at render", not a fixed date
- Rating aggregation should clarify it spans all stages and all runs (not per-stage)

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|---|---|---|---|
| 2026-05-21 | Initial draft | Feature approved by user | Alex |
