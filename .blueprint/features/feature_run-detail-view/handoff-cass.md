## Handoff Summary
**For:** Nigel
**Feature:** run-detail-view

### Key Decisions
- Five stories cover the full feature: run header, stage breakdown, access control, graceful degradation, refinement link
- Access control uses 404 for both "not found" and "wrong user" — no enumeration leakage
- All per-stage fields (tokens, cost, feedback rating) may be null; UI renders "—" fallbacks
- Refinement link only appears when `type === "refinement"` AND `parentRunId !== null`
- Skipped stages (e.g. Cass on technical runs) are omitted from the breakdown, not dimmed

### Files Created
- `.blueprint/features/feature_run-detail-view/story-run-header.md`
- `.blueprint/features/feature_run-detail-view/story-stage-breakdown.md`
- `.blueprint/features/feature_run-detail-view/story-access-control.md`
- `.blueprint/features/feature_run-detail-view/story-graceful-degradation.md`
- `.blueprint/features/feature_run-detail-view/story-refinement-link.md`

### Open Questions
- None

### Critical Context
Tests should target pure utility/logic functions (formatters, data-mappers) and Next.js page-level behaviour using the project's node:test runner. The page lives at `app/dashboard/runs/[id]/page.tsx`. Access control is enforced server-side. Stage data comes from a JSONB `stages` column; unknown keys must be ignored.
