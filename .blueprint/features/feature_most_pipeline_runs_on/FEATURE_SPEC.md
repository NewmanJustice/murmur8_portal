# Feature Specification — Most Active Repo Tile

**featureId:** most_pipeline_runs_on
**status:** draft
**date:** 2026-05-22

---

## 1. Feature Intent

The InsightsPanel surfaces aggregate statistics about pipeline activity, but currently offers no visibility into which repository receives the most pipeline usage. With the newly added `repoName` field on the `Run` model, the portal can now surface this information as a simple stat card.

- **Problem:** Users with multiple repositories cannot tell at a glance which repo has the most pipeline activity.
- **User need:** A developer wants to see which of their repos is getting the most murmur8 pipeline runs without manually counting.
- **System alignment:** The System Spec (SS6.7) describes the Insights Panel as a surface for aggregate stats. This feature adds one new aggregate metric using the recently added `repoName` field. No schema changes required (field already exists).

---

## 2. Scope

### In Scope

One new computed metric derived from the `Run.repoName` field:

1. **Most Active Repo** — the `repoName` with the highest count of runs. Displayed as a simple stat card with label "Most Active Repo" and value being the repo name string (short form, e.g. "murmur8_portal").

Changes required:
- Add `repoName` to the `InsightsRun` interface in `lib/insights.ts`
- Add `repoName` to the `select` in `getInsightsData()` in `lib/runs.ts`
- Add `topRepoByRunCount` field (type `string | null`) to `AggregateInsights` in `lib/insights.ts`
- Extend `computeInsights()` to compute the value by grouping runs by `repoName`, counting, picking the max
- Add a new `StatCard` to `InsightsPanel.tsx` in the upper stat cards grid

### Out of Scope

- Per-repo breakdown or listing of all repos with counts
- Charts or visualisations of repo activity
- Filtering the panel by repo
- Any database schema changes (the `repoName` field already exists on the Run model)
- Modifying or removing any existing InsightsPanel card

---

## 3. Actors Involved

**Portal Operator (authenticated user)**
- Views the "Most Active Repo" tile on the dashboard

**System (background)**
- Computes the metric server-side in `computeInsights()` on each dashboard page load

---

## 4. Behaviour Overview

When the dashboard loads, `getInsightsData()` fetches all Run records including the `repoName` field. `computeInsights()` groups runs by `repoName`, counts occurrences, and identifies the repo with the maximum count. The result is passed to `InsightsPanel` which renders it in a StatCard.

**Computation logic:**
- Filter out runs where `repoName` is null or undefined (they do not participate in grouping)
- Group remaining runs by `repoName`
- Count runs per group
- Select the group with the highest count
- On tie: pick the repo name that comes first alphabetically (consistent with `getMostCommonFailureStage` tie-breaking)
- Return the winning repo name string, or `null` if no runs have a populated `repoName`

**Display:**
- Label: "Most Active Repo"
- Value: the repo name (e.g. "murmur8_portal"), or em-dash character when null

---

## 5. State & Lifecycle Interactions

This feature is **state-reading only** — it does not create, transition, or constrain any pipeline, Run, or ApiKey state.

- `computeInsights()` remains a pure function; adding one new field does not alter its side-effect profile
- The only change to the data-fetch path is ensuring `repoName` is included in the fields returned by `getInsightsData()` — a non-breaking additive select

---

## 6. Rules & Decision Logic

**Rule 1 — Top repo by run count**
- Inputs: array of Run records with `repoName: string | null`
- Output: `string | null`
- Logic: group non-null `repoName` values, count per group, return the name with max count
- Tie-break: alphabetical (first alphabetically wins) — consistent with `getMostCommonFailureStage`
- Edge: all runs have null `repoName` -> returns `null`
- Edge: zero runs -> returns `null`
- Deterministic

---

## 7. Dependencies

| Dependency | Role |
|---|---|
| `lib/insights.ts` | Owns `computeInsights()`, `InsightsRun`, `AggregateInsights`; new field and logic added here |
| `app/dashboard/InsightsPanel.tsx` | Renders new StatCard; receives extended `AggregateInsights` prop |
| `lib/runs.ts -> getInsightsData()` | Must include `repoName` in the returned Run fields; one-line additive change |
| Prisma `Run` model | `repoName String?` — already present in schema |

---

## 8. Non-Functional Considerations

- **Performance:** One additional O(n) pass over the already-fetched Run array. No new database queries. Negligible overhead.
- **Error tolerance:** Null/undefined `repoName` values are excluded from grouping. If no valid values exist, the card displays "---" (em-dash). Consistent with existing degradation patterns.
- **Security:** Read-only; no new data exposure. The metric is an aggregate — individual run details are not surfaced.

---

## 9. Assumptions & Open Questions

**Assumptions:**
- The `repoName` field on the Run model is already present (added in `feature_add-repo-fields`)
- The field stores the short repo name (e.g. "murmur8_portal"), not the full owner/repo format
- All-time aggregation remains acceptable at current data volumes

**Open Questions:**
- None blocking

---

## 10. Impact on System Specification

This feature reinforces existing system assumptions:
- The Insights Panel is an established read-only aggregate surface; adding one more computed metric is directly in-scope per System Spec SS3 and SS6.7
- No existing invariants (R1-R8) are affected
- No system spec change proposed

---

## 11. Handover to Nigel (skip Cass — technical feature)

**Test themes:**
- `computeInsights()` returns correct `topRepoByRunCount` for various run sets
- Null/undefined `repoName` values are excluded
- Tie-breaking is alphabetical
- Empty run array returns null
- InsightsPanel renders the stat card with correct label and value
- InsightsPanel renders em-dash when value is null

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|---|---|---|---|
| 2026-05-22 | Initial draft | Feature approved by user | Alex |
