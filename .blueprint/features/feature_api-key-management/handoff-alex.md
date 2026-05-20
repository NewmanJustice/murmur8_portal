## Handoff Summary
**For:** Cass
**Feature:** api-key-management

### Key Decisions
- **SHA-256 hashing** chosen for API key storage (not bcrypt) — raw keys carry 256-bit entropy so slow hashing adds cost with no security gain; closes System Spec OQ3
- **`keyPrefix` field** added to `ApiKey` at creation (first 8 chars of raw key) to enable masked display without touching the hash; requires a Prisma migration
- **One-time reveal** is non-negotiable — the raw key is returned from the create Server Action only; the UI must make the copy-it-now requirement unmissable
- **Revocation is permanent** — no undo path in the data model or UI; confirmation dialog must convey this
- **Admin routes** (`/admin/keys`) are separate from user routes (`/dashboard/keys`) and gate on `session.user.isAdmin`

### Files Created
- `.blueprint/features/feature_api-key-management/FEATURE_SPEC.md`

### Open Questions
- None — all open questions (including System Spec OQ3) are resolved in the spec

### Critical Context
This feature is a prerequisite blocker for `telemetry-ingestion` (the ingestion endpoint validates keys by hashing the inbound bearer token and comparing to `ApiKey.key`). The `github-auth` feature must be complete before this can be built. Story slicing suggestion: user self-service (create/list/revoke) as slice 1; admin view/revoke as slice 2.
