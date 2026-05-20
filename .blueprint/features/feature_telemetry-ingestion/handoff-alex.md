## Handoff Summary
**For:** Nigel (Cass skipped — technical feature)
**Feature:** telemetry-ingestion

### Key Decisions
- Endpoint is `POST /api/telemetry` — stateless, synchronous, no queues
- Key auth: SHA-256 hash inbound Bearer token, lookup active key in DB; 401 if not found or revoked
- Payload validated against murmur8 telemetry schema; 422 with structured errors on failure
- On success: insert `Run` record (portal-generated UUID), update `ApiKey.lastUsedAt`, return `201 { id }`
- `stages` field stored as JSONB passthrough — deep stage-field validation is out of scope

### Files Created
- `.blueprint/features/feature_telemetry-ingestion/FEATURE_SPEC.md`

### Open Questions
- OQ1: Should Run insert + `lastUsedAt` update be a single Prisma transaction or best-effort? (Recommend: transaction)
- OQ2: Should 422 errors use Zod native format or a normalised portal envelope? (Recommend: normalised)

### Critical Context
- Depends on `api-key-management` and `project-scaffold` being complete; `Run` model must exist in Prisma schema
- SHA-256 is assumed as the hashing algorithm; if `api-key-management` uses bcrypt, key lookup strategy must change
- Duplicate runs (same slug+startedAt) are stored without dedup — this is intentional v1 behaviour
- Full payload schema is in FEATURE_SPEC.md §6.1; `stages` inner fields are not portal-validated
