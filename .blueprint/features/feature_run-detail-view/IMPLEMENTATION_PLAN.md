## Summary
Implements the run detail page as a Next.js Server Component at `app/dashboard/runs/[id]/page.tsx`, fetching a single run via Prisma with enforced userId ownership and rendering a header plus per-stage breakdown cards. `lib/run-detail.js` already exists with all 7 helper functions correctly implemented — all 35 tests pass — so no helper work is needed.

## Steps
1. [lib/run-detail.ts] CREATE — TypeScript source for run-detail helpers (re-exports formatDuration/formatCost/statusBadgeClass from dashboard, plus stageAccentClass/parseStages/formatNullable/showRefinementLink); mirrors the already-correct lib/run-detail.js | Tests: T-RDV-01–T-RDV-28 (all pass via .js)
2. [lib/runs.ts] EDIT — add `getRunDetail(id, userId)` function using `prisma.run.findFirst({ where: { id, userId } })` selecting all detail fields; returns `null` when not found | Tests: (backs T-RDV access-control stories)
3. [app/dashboard/runs/[id]/page.tsx] CREATE — Server Component: call `auth()`, redirect if no session; call `getRunDetail(id, userId)`, call `notFound()` if null; render header with back link, status badge, all nullable fields via `formatNullable`, duration/cost; render per-stage cards from `parseStages(run.stages)` in fixed order with `stageAccentClass`; conditionally render refinement link via `showRefinementLink` | Tests: T-RDV-04, T-RDV-05, T-RDV-06, T-RDV-07–T-RDV-18, T-RDV-19–T-RDV-24, T-RDV-25–T-RDV-28

## Risks
- `app/dashboard/runs/[id]/page.tsx` sits under `app/dashboard/` (not `app/(dashboard)/`), which matches the existing `app/dashboard/page.tsx` layout convention — confirm no layout.tsx wrapping is needed for this route segment.
- `run.stages` is typed as `Json` (Prisma); `parseStages` accepts `unknown`, so no cast is needed, but TypeScript may require an explicit `as unknown` pass-through.
