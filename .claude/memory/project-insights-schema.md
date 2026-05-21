---
name: project-insights-schema
description: Known schema constraints for the Run model and InsightsRun interface
metadata: 
  node_type: memory
  type: project
  originSessionId: 3bfd0fb3-e15c-4271-9cf7-8bdae66d8f89
---

The Prisma `Run` model has NO top-level `stage` column. Stage data lives only in the JSONB `stages` field (keyed by stage name, e.g. `stages.alex`, `stages.codey-implement`). A previous bug selected `stage: true` in `getInsightsData` which caused `PrismaClientValidationError`.

The `InsightsRun` interface keeps a `stage: string | null` field but it is always set to `null` in the map — it exists only so type assertions in tests can pass.

**Why:** The Run model schema uses `stages` (JSONB blob) not a scalar `stage` field. Iterating stage keys must use `Object.keys(run.stages)`.

**How to apply:** Any time new fields are added to the Prisma select in `getInsightsData`, verify them against the schema first. Never add `stage: true` to that select.
