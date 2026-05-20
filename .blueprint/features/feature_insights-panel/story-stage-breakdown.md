# Story: View Stage Breakdown

**As an** authenticated user,
**I want** to see the average duration for each pipeline stage,
**so that** I can identify bottlenecks in my pipeline execution.

---

## Acceptance Criteria

**AC1 — Stage breakdown table shows known stages**
Given I have runs with `stages` JSONB data,
When the insights panel loads,
Then a stage breakdown table lists the known stages in pipeline order: alex, cass, nigel-spec, nigel-tests, codey-plan, codey-implement.

**AC2 — Average duration per stage**
Given multiple runs include data for a given stage,
When the table is shown,
Then the average `durationMs` for that stage is computed and displayed as a human-readable string.

**AC3 — Stage absent from some runs**
Given some runs do not include a particular stage (e.g. cass is skipped for technical features),
When the average is computed,
Then only runs that contain that stage key contribute to its average (partial JSONB is handled gracefully — no crash or zero-division error).

**AC4 — Stage with no data**
Given a known stage key does not appear in any of my runs,
When the breakdown is shown,
Then that stage row displays "—" for its average duration.

**AC5 — Stage breakdown empty when no runs**
Given I have zero runs,
When the insights panel loads,
Then all stage rows show "—".

**AC6 — Stage accent colours**
Given the stage breakdown table is rendered,
When I view the stage labels,
Then each stage uses its agent accent colour: alex=sky, cass=violet, nigel-*=amber, codey-*=teal.

---

## Out of Scope
- Per-run stage breakdown (see run-detail-view feature)
- Stage feedback ratings or issue codes in this view
- Stages not in the known STAGE_ORDER list
