# Story: View Stage Breakdown

**As an** authenticated user,
**I want** to see a card for each pipeline stage that ran, showing per-stage metrics and feedback,
**so that** I can audit what each agent did, how long it took, and what quality it self-reported.

---

## Acceptance Criteria

**AC1 — Known stages rendered in pipeline order**
Given the `stages` JSONB field contains data for one or more known stage keys,
When I view the run detail page,
Then stage cards appear in this fixed order: `alex` → `cass` → `nigel-spec` → `nigel-tests` → `codey-plan` → `codey-implement` — only stages present in the JSONB are shown.

**AC2 — Skipped stages are omitted**
Given a technical run where the `cass` stage key is absent from the JSONB,
When I view the stage breakdown,
Then no card for "Cass" appears — the absent stage is silently omitted, not shown as a dimmed or greyed-out card.

**AC3 — Each card shows the correct per-stage fields**
Given a stage card is rendered,
When I inspect it,
Then it displays: stage name, human-readable duration, status badge, feedback rating (1–5), feedback issues (list of strings), input token count, output token count, and estimated cost.

**AC4 — Agent accent colour is applied per stage card**
Given stage cards are rendered,
When I view the breakdown,
Then: Alex cards use sky `#38BDF8`, Cass cards use violet `#A78BFA`, Nigel cards (both `nigel-spec` and `nigel-tests`) use amber `#F59E0B`, Codey cards (both `codey-plan` and `codey-implement`) use teal `#2DD4BF`.

**AC5 — Null/absent per-stage fields degrade gracefully**
Given a stage where `tokens`, `cost`, or `feedback` fields are `null` or absent,
When I view that stage card,
Then each missing field displays "—" rather than crashing or rendering `null`.

**AC6 — `stepsCompleted` shown on codey-implement when present**
Given the `codey-implement` stage has a `stepsCompleted` value in the JSONB,
When I view the codey-implement card,
Then `stepsCompleted` is displayed; if the field is absent it is silently omitted.

**AC7 — Unknown JSONB keys are ignored**
Given the `stages` JSONB contains an unrecognised key (e.g. a future stage),
When the page renders,
Then no card is rendered for the unknown key and no error is thrown.

---

## Out of Scope
- `feedback.recommendation` field on stage cards (stretch; not in scope for v1)
- Stage-level drill-down beyond fields defined in the telemetry schema
- Mutations or status changes from the stage card
- Real-time stage progress or polling
