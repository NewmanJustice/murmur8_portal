# Story: Graceful Degradation — Partial or Absent Stage Data

**As an** authenticated user,
**I want** the run detail page to handle incomplete or malformed run data without errors,
**so that** I can still view whatever information is available even for partial or interrupted runs.

---

## Acceptance Criteria

**AC1 — Null `stages` field renders header without crashing**
Given a run where the `stages` JSONB field is `null` or entirely absent,
When I navigate to its detail page,
Then the run header section renders normally and a graceful notice (e.g. "No stage data available") is shown in the stage breakdown area — no unhandled error or crash page is shown.

**AC2 — Malformed `stages` JSON does not throw**
Given a run where the `stages` field contains malformed or unexpected JSON structure (not an object),
When the page renders,
Then the stage breakdown area shows the graceful notice from AC1 — the page does not throw or show a 500 error.

**AC3 — Per-stage null fields display as "—"**
Given a stage card is rendered for a stage that is present in the JSONB but has `null` values for `tokens`, `cost`, or `feedback`,
When I view that card,
Then each null field is shown as "—" (em dash) — not `null`, `undefined`, `0`, or blank.

**AC4 — Stage with no `feedback.issues` shows empty state, not crash**
Given a stage where `feedback` is present but `feedback.issues` is an empty array or absent,
When I view that stage card,
Then no issues list is shown — neither an error nor a placeholder "null" value appears.

**AC5 — Duration shown as human-readable; null duration shows "—"**
Given a stage card where `durationMs` is a number (e.g. `12340`),
When I view that card,
Then duration is rendered in human-readable form (e.g. "12s" or "12,340 ms"); if `durationMs` is null the field shows "—".

---

## Out of Scope
- Automatic retry or re-ingestion of partial run data
- Alerting or logging user-visible errors to an external service
- Recovering or back-filling missing stage data
