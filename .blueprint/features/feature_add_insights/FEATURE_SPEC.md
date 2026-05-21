# Feature Specification — Add New Insight Metrics to InsightsPanel

**featureId:** add_insights
**status:** draft
**date:** 2026-05-21

---

## 1. Feature Intent

The InsightsPanel currently surfaces aggregate pipeline health metrics (total runs, overall success rate, average duration, total cost, per-stage averages, most common failure stage). Operators need richer operational visibility to understand cost efficiency and pipeline quality trends.

- **Problem:** Existing metrics do not distinguish feature runs from refinement runs, do not expose per-stage pass/fail rates, and do not surface average cost per run or the proportion of features requiring iterative refinement.
- **User need:** Portal operators want to answer "how much does an average run cost?", "what fraction of features needed refinement?", "how are runs distributed by type?", and "which pipeline stage has the worst pass rate?" without leaving the dashboard.
- **System alignment:** Extends the read-only insights surface that already exists; no pipeline behaviour changes.

---

## 2. Scope

### In Scope

- Add four new computed metrics to `lib/insights.ts`:
  1. **Cost per run (avg)** — `totalCostUsd / totalRuns` (zero-safe)
  2. **Refinement rate** — count of distinct slugs that have at least one run with `type = "refinement"`, divided by count of all distinct slugs, expressed as a percentage
  3. **Runs by type** — count of runs split by `type` field: `feature` vs `refinement`
  4. **Success rate by stage** — for each stage (Alex, Cass, Nigel, Codey), the ratio of runs that reached that stage and succeeded vs all runs that reached or passed through that stage
- Extend the `AggregateInsights` TypeScript type to carry these four new fields
- Add corresponding display cards/rows to `app/dashboard/InsightsPanel.tsx`
- All computation operates on data already returned by `lib/runs.ts → getInsightsData()`

### Out of Scope

- Time-series or trend charts
- Per-slug or per-feature filtering
- CSV/JSON export of insights data
- Modifying any other dashboard panel or page
- Any database schema changes or new fields on the `Run` table
- Removing or altering any existing InsightsPanel cards

---

## 3. Actors Involved

**Portal Operator (authenticated user)**
- Can view the InsightsPanel on the dashboard and read all four new metric cards
- Cannot edit, export, or drill into individual runs from the InsightsPanel

**System (background)**
- Computes metrics server-side via `computeInsights()` on each page load; no real-time streaming

---

## 4. Behaviour Overview

- When the dashboard loads, `getInsightsData()` fetches all Run records. `computeInsights()` processes them and now also returns the four new fields.
- InsightsPanel renders new stat cards alongside the existing ones. Layout is additive — no existing card is removed or repositioned (exact layout order is an implementation detail for Codey).
- **Cost per run (avg):** displayed as a currency value (e.g. "$0.042"); shown as "$0.00" when there are no runs.
- **Refinement rate:** displayed as a percentage (e.g. "23%"); shown as "0%" when no refinement runs exist.
- **Runs by type:** displayed as two sub-counts within a single card (e.g. "Feature: 34 / Refinement: 12").
- **Success rate by stage:** displayed as a per-stage breakdown, consistent in style with the existing stage averages section; each stage shows a pass rate percentage.
- All four metrics degrade gracefully to zero/empty when the Run table has no data.

---

## 5. State & Lifecycle Interactions

This feature is **state-reading only** — it does not create, transition, or constrain any pipeline or Run state.

- No new states are entered or exited
- `computeInsights()` remains a pure function over Run records
- The dashboard load cycle is unchanged; this feature adds computed fields to an existing data-fetch path

---

## 6. Rules & Decision Logic

**Rule 1 — Cost per run average**
- Inputs: array of all Run records with `costUsd` field
- Output: `totalCostUsd / count(runs)`, rounded to a sensible display precision
- Edge case: if `runs.length === 0`, output is `0`
- Deterministic

**Rule 2 — Refinement rate**
- Inputs: array of all Run records with `slug` and `type` fields
- Output: `count(distinct slugs where any run has type="refinement") / count(distinct slugs)`, as a percentage
- Edge case: if no distinct slugs, output is `0%`
- Deterministic

**Rule 3 — Runs by type**
- Inputs: array of all Run records with `type` field
- Output: two counts — `featureRuns` (type="feature") and `refinementRuns` (type="refinement")
- Unknown type values are counted in neither bucket (ignored)
- Deterministic

**Rule 4 — Success rate by stage**
- Inputs: array of all Run records with `stage` and `status` fields
- Output: for each stage label (Alex, Cass, Nigel, Codey), `count(runs where stage=X and status="success") / count(runs where stage=X)` as a percentage
- Edge case: if no runs reached a given stage, that stage is omitted or shown as "N/A"
- Deterministic

---

## 7. Dependencies

| Dependency | Role |
|---|---|
| `lib/runs.ts → getInsightsData()` | Provides the Run array; no changes required to this function |
| `lib/insights.ts` | Owns `computeInsights()`, `AggregateInsights` type; new functions and type fields added here |
| `app/dashboard/InsightsPanel.tsx` | Renders metrics; new cards added here |
| Prisma `Run` model | Provides `costUsd`, `type`, `slug`, `stage`, `status` fields; no schema changes needed |

---

## 8. Non-Functional Considerations

- **Performance:** All computation is O(n) over Run records. No additional DB queries introduced. Acceptable for dashboard page loads at current data volumes.
- **Error tolerance:** If a Run record has a null `costUsd`, treat as `0` in averaging. If `type` is null/unknown, exclude from type split. If `stage` is null, exclude from stage success rate.
- **Security:** Read-only; no new data exposure beyond what the existing InsightsPanel already shows. Access control unchanged.
- **Audit/logging:** No new audit requirements.

---

## 9. Assumptions & Open Questions

**Assumptions:**
- The `Run` table `type` field uses the string values `"feature"` and `"refinement"` consistently
- The `Run` table `stage` field uses the string values `"alex"`, `"cass"`, `"nigel"`, `"codey"` (case to be confirmed by Codey against schema)
- `getInsightsData()` returns all runs without pagination; adequate for current data volumes
- No UI design sign-off required — additive card layout matches existing panel style

**Open Questions:**
- None blocking spec; implementation details (card layout order, exact display formatting) are delegated to Codey

---

## 10. Impact on System Specification

This feature reinforces existing system assumptions:
- The InsightsPanel is already established as a read-only operational dashboard surface
- Extending computed metrics from existing data is consistent with the system's approach to observability
- No contradiction with the System Spec; no system spec change proposed

---

## 11. Handover to BA (Cass)

**Story themes:**
- Viewing cost efficiency (cost per run avg)
- Viewing refinement behaviour (refinement rate, runs by type)
- Viewing per-stage pipeline quality (success rate by stage)

**Expected story boundaries:**
- One story per new metric is reasonable, or group cost-related metrics and type-split into one story each
- The success-rate-by-stage story should specify that all four stages are covered and that missing stages degrade gracefully

**Areas needing careful story framing:**
- Refinement rate definition (distinct slugs, not run count) should be explicit in acceptance criteria
- Graceful zero/empty states should appear in each story's acceptance criteria

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|---|---|---|---|
| 2026-05-21 | Initial draft | Feature approved by user | Alex |
