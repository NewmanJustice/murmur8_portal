# Test Specification — run-detail-view

**Feature:** run-detail-view
**Stories:** story-run-header, story-stage-breakdown, story-access-control, story-graceful-degradation, story-refinement-link
**Test file:** `test/feature_run-detail-view.test.js`
**Runner:** `node --test test/feature_run-detail-view.test.js`

---

## Scope

All tests are **pure unit tests** — no database, no HTTP server, no Next.js rendering.
Tests target pure helper functions extracted into `lib/run-detail.ts`:
- `formatDuration(ms)` — reuses dashboard helper (or re-exports it)
- `formatCost(n)` — reuses dashboard helper (or re-exports it)
- `stageAccentClass(stageKey)` — returns Tailwind CSS class for per-stage accent colour
- `parseStages(raw)` — filters/orders raw JSONB to known stage keys; ignores unknown keys
- `formatNullable(value)` — returns "—" for null/undefined, string otherwise
- `showRefinementLink(type, parentRunId)` — returns boolean: true only when both conditions met

---

## Understanding

The run detail page (`app/dashboard/runs/[id]/page.tsx`) is a Server Component that:
- Fetches a single run by ID via Prisma, enforcing `userId` ownership server-side
- Returns 404 (via `notFound()`) for both missing and unauthorised runs to prevent enumeration
- Renders a header with all top-level run fields and a back link to `/dashboard/runs`
- Renders per-stage cards in fixed pipeline order; absent stages are silently omitted
- Conditionally renders a "View parent run →" link when `type === "refinement"` and `parentRunId !== null`
- All nullable fields degrade to "—" rather than crashing or rendering raw nulls
- Access control, routing, and rendering are not directly testable with node:test; pure helper functions are

ASSUMPTION: `lib/run-detail.ts` will be created to house the pure helpers tested here; the page imports from it.
ASSUMPTION: `formatDuration` and `formatCost` are re-exported from `lib/run-detail.ts` (or imported from `lib/dashboard.ts` directly).
ASSUMPTION: `parseStages(null)` returns `[]`; `parseStages({})` returns `[]`; non-object input returns `[]`.
ASSUMPTION: Stage order is defined as the fixed array: `['alex','cass','nigel-spec','nigel-tests','codey-plan','codey-implement']`.
ASSUMPTION: `formatNullable` accepts `number | string | null | undefined` and formats numbers via `String()` before returning.

---

## AC to Test ID Mapping

| Test ID      | Story              | AC   | Description                                                          |
|--------------|--------------------|------|----------------------------------------------------------------------|
| T-RDV-01     | run-header         | AC1  | formatNullable: returns value as string when non-null                |
| T-RDV-02     | run-header         | AC1  | formatNullable: returns "—" for null                                 |
| T-RDV-03     | run-header         | AC1  | formatNullable: returns "—" for undefined                            |
| T-RDV-04     | run-header         | AC2  | statusBadgeClass: success → green, failed → red, paused → yellow    |
| T-RDV-05     | run-header         | AC4  | formatNullable: null commitHash, failedStage, pausedAfter → "—"      |
| T-RDV-06     | run-header         | AC3  | (structural — back link target is `/dashboard/runs`, tested via AC4) |
| T-RDV-07     | stage-breakdown    | AC1  | parseStages: known stages appear in fixed pipeline order             |
| T-RDV-08     | stage-breakdown    | AC1  | parseStages: only stages present in JSONB are returned               |
| T-RDV-09     | stage-breakdown    | AC2  | parseStages: absent cass key → cass omitted from result              |
| T-RDV-10     | stage-breakdown    | AC4  | stageAccentClass: alex → sky #38BDF8 class                           |
| T-RDV-11     | stage-breakdown    | AC4  | stageAccentClass: cass → violet #A78BFA class                        |
| T-RDV-12     | stage-breakdown    | AC4  | stageAccentClass: nigel-spec → amber #F59E0B class                   |
| T-RDV-13     | stage-breakdown    | AC4  | stageAccentClass: nigel-tests → amber #F59E0B class                  |
| T-RDV-14     | stage-breakdown    | AC4  | stageAccentClass: codey-plan → teal #2DD4BF class                    |
| T-RDV-15     | stage-breakdown    | AC4  | stageAccentClass: codey-implement → teal #2DD4BF class               |
| T-RDV-16     | stage-breakdown    | AC5  | formatNullable: null tokens, cost, feedback → "—"                    |
| T-RDV-17     | stage-breakdown    | AC7  | parseStages: unknown JSONB key is ignored                            |
| T-RDV-18     | stage-breakdown    | AC6  | parseStages: stepsCompleted present on codey-implement is passed through |
| T-RDV-19     | graceful-degrad.   | AC1  | parseStages: null stages input → empty array, no throw               |
| T-RDV-20     | graceful-degrad.   | AC2  | parseStages: non-object stages input → empty array, no throw         |
| T-RDV-21     | graceful-degrad.   | AC3  | formatNullable: null per-stage fields → "—" (em dash string)         |
| T-RDV-22     | graceful-degrad.   | AC4  | formatNullable: empty/absent feedback.issues → no crash              |
| T-RDV-23     | graceful-degrad.   | AC5  | formatDuration: numeric durationMs → human-readable string           |
| T-RDV-24     | graceful-degrad.   | AC5  | formatDuration / formatNullable: null durationMs → "—"               |
| T-RDV-25     | refinement-link    | AC1  | showRefinementLink: type=refinement + parentRunId set → true         |
| T-RDV-26     | refinement-link    | AC2  | showRefinementLink: type=feature → false                             |
| T-RDV-27     | refinement-link    | AC3  | showRefinementLink: type=refinement + parentRunId=null → false       |
| T-RDV-28     | refinement-link    | AC4  | showRefinementLink: link href = /dashboard/runs/[parentRunId]        |

---

## Key Assumptions

- ASSUMPTION: `lib/run-detail.ts` is the canonical module for pure helpers; the page itself is not unit-tested.
- ASSUMPTION: `parseStages` accepts `unknown` input; returns an ordered array of `{ key, data }` objects for known stages only.
- ASSUMPTION: `stageAccentClass` returns a string containing the colour name (e.g. `sky`, `violet`, `amber`, `teal`) testable via `includes`.
- ASSUMPTION: `formatNullable(null)` and `formatNullable(undefined)` both return the string `"—"` (U+2014 em dash).
- ASSUMPTION: Access control (auth redirect, 404 on wrong user) is enforced via Next.js `auth()` + `notFound()` in the page component; these are not covered by node:test unit tests.

---

## Out of Scope for This Test File

- Server Component rendering (requires Next.js test environment)
- Prisma query correctness (requires live DB connection)
- Authentication redirect behaviour (covered by auth middleware tests)
- HTTP route handler behaviour (covered by integration tests)
- Pagination / filtering (covered by feature_run-history-dashboard tests)
