## Handoff Summary
**For:** Cass
**Feature:** add-repo-fields

### Key Decisions
- Both `repoOwner` and `repoName` are nullable `String?` columns — no default, no backfill
- Fields are independently optional (either, both, or neither may be sent)
- Validation rejects non-string values but accepts omission or null
- No UI changes — this is schema + ingestion only
- No GitHub API verification of repo existence

### Files Created
- .blueprint/features/feature_add-repo-fields/FEATURE_SPEC.md

### Open Questions
- None

### Critical Context
This is a technical/infrastructure feature — no user-facing stories. Cass should produce stories focused on: (1) Prisma schema migration, (2) validation logic extension in `lib/telemetry.ts`, and (3) data-mapping in `buildRunData`. All stories are testable via the `POST /api/telemetry` endpoint with varying payloads.
