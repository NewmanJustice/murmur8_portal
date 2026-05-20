# Feature Specification — Insights Panel

---
version: 0.1.0
date: 2026-05-20
status: draft
feature: insights-panel
priority: P1
effort: S
---

## 1. Feature Intent

The Insights Panel gives authenticated users an at-a-glance analytical summary of their pipeline activity. Rather than requiring manual inspection of individual run rows, it aggregates metrics across all of a user's runs and surfaces patterns directly on the dashboard.

- **Problem**: Users with many runs cannot easily understand their overall success rate, average pipeline duration, cumulative cost, or which stages fail most often.
- **User need**: A quick health-check view that answers "How is my pipeline performing?" without scrolling through hundreds of rows.
- **System alignment**: Directly implements SYSTEM_SPEC §6.7 ("Dashboard — Insights Panel") and satisfies the §3 "Basic aggregate insights" in-scope item.

---

## 2. Scope

### In Scope
- Aggregate stat cards: total runs, success rate %, average duration, total cost
- Stage breakdown table: average duration per stage, derived from the `stages` JSONB field
- Most common failure stage, shown only when at least one failed run exists
- No-data state: graceful empty / zero message when user has no runs
- No live updates — snapshot computed at page-load; user refreshes for latest

### Out of Scope
- Per-project or per-slug breakdown (v1 is global across all user runs)
- Trend charts or time-series graphs
- Comparison to other users or global benchmarks
- Export of insights data
- Real-time / WebSocket updates
- Date-range filtering of the insight window (v1 is always "all time")

---

## 3. Actors Involved

**User (Authenticated)**
- Can view their own aggregate insights
- Cannot view any other user's insights

**Admin**
- Has the same access as User for their own insights — no cross-user insights view in this feature

**Visitor (Unauthenticated)**
- Cannot access the insights panel; redirected to login per R7

---

## 4. Behaviour Overview

The insights panel is rendered as a section on the dashboard page (or as a dedicated `/dashboard/insights` sub-route — see §9). It reads the current user's full run history and computes:

1. **Total runs** — count of all run records for the user
2. **Success rate** — `(successCount / totalRuns) * 100`, rounded to one decimal place; shown as "—" if no runs
3. **Average duration** — mean of `totalDurationMs` across runs that have a non-null value; formatted as human-readable (e.g. "4m 12s"); shown as "—" if no data
4. **Total cost** — sum of `totalCost` across all runs; formatted as "$X.XXX"
5. **Stage breakdown table** — for each known pipeline stage (alex, cass, nigel-spec, nigel-tests, codey-plan, codey-implement), compute the mean `durationMs` from the `stages` JSONB field across all runs that include that stage; display stage name and average duration
6. **Most common failure stage** — the `failedStage` value that appears most often across failed runs; if there are no failed runs, this row/section is hidden

Empty state: if `totalRuns === 0`, all stat cards show "—" or "0" as appropriate and a friendly "No runs yet" prompt is shown.

---

## 5. State & Lifecycle Interactions

- **State-reading only** — this feature makes no writes to any state.
- Depends on the Run table being populated by the `telemetry-ingestion` feature.
- The `stages` JSONB field is parsed in the application layer (not via SQL JSON functions) to derive stage-level averages.
- No new database tables, columns, or migrations are introduced.
- This feature is state-**consuming**.

---

## 6. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| **R1** | User sees only their own data — `userId` is always taken from the server session |
| **IP-R1** | Success rate is computed as `successCount / totalRuns`; if `totalRuns === 0`, result is `null` (displayed as "—") |
| **IP-R2** | Average duration excludes runs where `totalDurationMs IS NULL` |
| **IP-R3** | Stage averages exclude runs where a given stage key is absent from the JSONB `stages` field |
| **IP-R4** | "Most common failure stage" is shown only when at least one run has `status = 'failed'` |
| **IP-R5** | If multiple failure stages tie for most common, any one may be displayed (deterministic tie-break by alphabetical order preferred) |
| **IP-R6** | Total cost sums all runs; null `totalCost` values are treated as 0 |

---

## 7. Dependencies

- `telemetry-ingestion` — Run records must exist to compute insights
- `run-history-dashboard` — The insights panel is co-located with or adjacent to the dashboard; shares authentication flow, layout, and formatting helpers (`formatDuration`, `formatCost`)
- `lib/dashboard.ts` — Re-uses `formatDuration` and `formatCost` helper functions
- Prisma `Run` model — reads `status`, `totalDurationMs`, `totalCost`, `failedStage`, `stages` fields
- NextAuth session — provides `userId` for the R1 scoping query

---

## 8. Non-Functional Considerations

- **Performance**: Aggregate query may be heavy if user has many thousands of runs. For v1, use a single Prisma `findMany` with a select covering only the fields needed. Optimise with `aggregate` + `groupBy` if profiling reveals issues.
- **Security**: `userId` must never be sourced from URL params or request body — always from the verified server session (R1).
- **Error tolerance**: If `stages` JSONB is malformed or missing for a run, that run is silently excluded from stage-level averages (no crash).
- **Auditability**: No new audit requirements — insights are derived views, not mutations.

---

## 9. Assumptions & Open Questions

| # | Question | Assumption |
|---|----------|------------|
| OQ-IP1 | Placement: top of dashboard page or separate `/dashboard/insights` route? | **Assumed**: rendered as a panel/section above the run list on the existing dashboard page |
| OQ-IP2 | Should insights respect active dashboard filters (status, date range)? | **Assumed**: No — insights are always "all time, all statuses" in v1 |
| OQ-IP3 | What if a stage `durationMs` is 0 or negative? | **Assumed**: Include in average as-is; 0 is a valid (near-instant) duration |

---

## 10. Impact on System Specification

- **Reinforces**: §6.7 exactly as written — no stretch.
- **No contradictions**: The feature is read-only and scoped to the authenticated user.
- **No system spec changes required.**

---

## 11. Handover to BA (Cass)

Story themes:
1. **Aggregate stat cards** — total runs, success rate, avg duration, total cost
2. **Stage breakdown** — per-stage average durations shown in a table
3. **Failure pattern** — most common failure stage callout
4. **Empty / no-data state** — graceful handling when user has zero runs
5. **Access control** — panel only accessible to authenticated users; scoped to own runs

Expected story count: 3–4 stories (stat cards + stage breakdown can be one story; failure pattern a second; empty state a third; access control a fourth if AC is non-trivial).

Areas for careful framing:
- Stat cards must clearly specify "—" vs "0" for zero states
- Stage breakdown must handle partial JSONB (not all stages present in every run)
- Failure stage display must be conditional on existence of failed runs

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial spec created | Pipeline bootstrap | Alex |
