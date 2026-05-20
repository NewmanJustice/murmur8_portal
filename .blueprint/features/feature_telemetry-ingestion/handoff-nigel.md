## Handoff Summary
**For:** Codey
**Feature:** telemetry-ingestion

### Test Coverage
15 tests across 15 test IDs (T-TI-01 to T-TI-15).

### Files Created
- `test/artifacts/feature_telemetry-ingestion/test-spec.md` — AC→Test ID table
- `test/feature_telemetry-ingestion.test.js` — executable tests (node:test + node:assert)

### What Tests Cover
- T-TI-01–02: `hashKey(raw)` — SHA-256 correctness and determinism
- T-TI-03–09: `validatePayload(body)` — required fields, enum validation, type default
- T-TI-10–12: `buildRunData(key, payload)` — field mapping and portal-generated fields
- T-TI-13–15: Response shapes — 201 id, 401 auth extraction, 422 error envelope

### Interface Contract (what Codey must implement)

**`lib/telemetry.ts`** (compiled to `lib/telemetry.js` for node:test):
```ts
export function hashKey(raw: string): string
// SHA-256 hex digest of raw

export function validatePayload(body: unknown): 
  | { success: true; data: ValidatedPayload }
  | { success: false; errors: Array<{ field: string; message: string }> }
// type defaults to 'feature' if absent

export function buildRunData(key: { id: string; userId: string }, payload: ValidatedPayload): object
// Returns Prisma create data (no id, no receivedAt — DB-generated)
```

**`app/api/telemetry/route.ts`**:
- POST handler
- Extract Bearer token from `Authorization` header → null if missing/malformed
- Hash token with `hashKey`, query `ApiKey` where `key = hash AND revokedAt IS NULL`
- 401 if not found
- Validate body with `validatePayload` → 422 `{ errors }` if failure
- Build run data with `buildRunData`, insert via Prisma, update `ApiKey.lastUsedAt`
- Return `201 NextResponse.json({ id })` on success

### Test Runner
```
node --test test/feature_telemetry-ingestion.test.js
```

### Key Decisions
- `buildRunData` does NOT set `id` or `receivedAt` (DB-generated via cuid/default(now()))
- `type` field defaults to `'feature'` when absent from payload
- Error envelope: `{ errors: [{ field, message }] }` — normalised, not Zod-native
- `lastUsedAt` update is best-effort (can be in same transaction or separate update)
