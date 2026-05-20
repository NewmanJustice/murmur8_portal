## Handoff Summary
**For:** Cass
**Feature:** run-detail-view

### Key Decisions
- Page is a read-only Server Component at `app/dashboard/runs/[id]/page.tsx`; no mutations of any kind
- Ownership enforced server-side: both "not found" and "wrong user" return 404 (no enumeration leakage)
- Six known stages rendered in pipeline order with agent accent colours; unknown JSONB keys ignored gracefully
- Refinement runs show a "View parent run" link only when `type === "refinement"` AND `parentRunId !== null`
- Any per-stage field (tokens, cost, feedback) may be null/absent; UI must degrade gracefully with "—" fallbacks

### Files Created
- `.blueprint/features/feature_run-detail-view/FEATURE_SPEC.md`

### Open Questions
- AQ1: Should a skipped stage (e.g. Cass for technical runs) be shown as a dimmed card or omitted? Recommend omit — confirm before writing that story
- AQ2: Should `codey-implement.stepsCompleted` be shown? Not in §6.6 — include if Cass adds a story, skip otherwise
- AQ3: Should `feedback.recommendation` ("proceed" etc.) appear on stage cards? Not in §6.6 — treat as stretch

### Critical Context
Entry point is a row-click on the run-history-dashboard (that feature must be complete first). The `stages` JSONB field follows the schema in `.business_context/murmur8-framework-understanding.md` §3 — stage keys are `alex`, `cass`, `nigel-spec`, `nigel-tests`, `codey-plan`, `codey-implement`. System Spec §7 R1 is the governing access-control rule. Resolve AQ1 before writing stage-rendering stories.
