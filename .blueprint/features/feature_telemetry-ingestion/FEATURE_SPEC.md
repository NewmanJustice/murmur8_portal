---
version: 0.1.0
date: 2026-05-20
status: draft
feature: telemetry-ingestion
classification: technical
cass-skip: true
---

# Feature Specification — Telemetry Ingestion

## 1. Feature Intent

The telemetry ingestion endpoint is the data entry point for the murmur8 Portal. It enables the murmur8 CLI to push structured pipeline run records into the portal, where they become visible in the dashboard and contribute to aggregate insights.

- **Problem**: Pipeline run data currently lives only in local `.claude/pipeline-history.json` on the developer's machine. There is no durable, centralised store.
- **System need**: The portal requires run records to exist before any dashboard, insights, or audit features can operate. This endpoint is the sole mechanism for creating Run records.
- **System alignment**: Directly addresses System Spec §1 purpose point 1 and §6.4. See `.blueprint/system_specification/SYSTEM_SPEC.md`.

---

## 2. Scope

### In Scope

- `POST /api/telemetry` route handler (Next.js App Router)
- Bearer token extraction and validation (hash inbound key, compare to DB)
- Payload schema validation (422 on failure, error details in response body)
- Run record creation in the database (Prisma `Run` model)
- `ApiKey.lastUsedAt` timestamp update on successful ingestion
- `201 Created` response with `{ id: "<run-uuid>" }` on success
- `401 Unauthorized` response for unknown or revoked keys
- Stateless, synchronous handling (no queues, no background workers)

### Out of Scope

- Deduplication of runs by `slug` + `startedAt` (not implemented in v1; duplicates are stored)
- Batch ingestion (multiple runs per request)
- Any UI components or dashboard integration (separate features)
- Key creation or revocation (covered by `api-key-management` feature)
- Real-time webhooks or push notifications on receipt
- Data purge or retention enforcement

---

## 3. Actors Involved

### Pipeline Client (murmur8 CLI)

- **Can do**: POST a single run payload to `/api/telemetry` with a valid Bearer API key.
- **Cannot do**: Modify existing run records; list or query runs; manage keys; authenticate via session cookie.

### System (portal backend)

- **Can do**: Validate the key, validate the payload, create a `Run` record, update `ApiKey.lastUsedAt`.
- **Cannot do**: Create a run without a valid, active key; create a run for a user other than the key's owner.

### User (indirect)

- Does not interact with this endpoint directly. Their `userId` is derived from the key's `userId` and attached to the stored Run.

### Admin (indirect)

- No special role in this feature. Admins do not bypass key validation.

---

## 4. Behaviour Overview

### Happy Path

1. Pipeline Client sends `POST /api/telemetry` with `Authorization: Bearer <raw-key>` header and a JSON body matching the telemetry schema (see §6).
2. The portal extracts the raw key, computes its SHA-256 hash, and queries the database for an `ApiKey` where `key = hash AND revokedAt IS NULL`.
3. Key found and active: proceed.
4. Payload is validated against the expected schema; all required fields are present and correctly typed.
5. A new `Run` record is inserted with a portal-generated UUID, `receivedAt = now()`, `userId` and `apiKeyId` from the resolved key.
6. `ApiKey.lastUsedAt` is updated to `now()`.
7. Response: `201 Created`, body `{ "id": "<run-uuid>" }`.

### Key Not Found or Revoked

- Inbound key hashes to a value not present in the DB, or the matching key has `revokedAt IS NOT NULL`.
- Response: `401 Unauthorized`. No partial writes occur.
- Rule R6 in System Spec applies: no run is stored.

### Payload Validation Failure

- Required fields missing, wrong types, or enum values out of range.
- Response: `422 Unprocessable Entity` with a JSON body describing the validation errors.
- No run is stored.

### Duplicate Run (Idempotency Note)

- If the same `slug` + `startedAt` arrives from the same key, it is stored again as a distinct record.
- No deduplication or warning in v1 (System Spec §6.4: "may warn but will still store" — warning deferred).

---

## 5. State & Lifecycle Interactions

This feature is **state-creating**: it produces new `Run` records that did not previously exist in the portal.

| Entity | Lifecycle Effect |
|--------|-----------------|
| `Run` | Created (new record per successful request) |
| `ApiKey` | Modified: `lastUsedAt` updated on success |
| `User` | Read-only: `userId` is resolved from the key; no user state changes |

The endpoint does not transition existing Runs through states, and does not affect User or key active/revoked status.

---

## 6. Rules & Decision Logic

### R-TI-1: Key Authentication

- **Input**: Raw API key string from `Authorization: Bearer` header.
- **Logic**: Compute `SHA-256(rawKey)`. Query `ApiKey` where `key = hash`. Check `revokedAt IS NULL`.
- **Output**: Resolved `ApiKey` (with `userId`, `id`) or `401`.
- **Deterministic**: Yes.
- **Note**: Hashing algorithm is SHA-256, consistent with the decision flagged in System Spec OQ3 for `api-key-management`. This feature assumes SHA-256 is the chosen algorithm; if `api-key-management` selects bcrypt, this spec must be revised.

### R-TI-2: Payload Schema Validation

- **Input**: Request body JSON.
- **Logic**: Validate against the required schema (see below). All top-level fields in the schema are required unless explicitly marked optional.
- **Output**: Validated payload object or `422` with structured error list.
- **Deterministic**: Yes.

### R-TI-3: Run Record Creation

- **Input**: Validated payload + resolved `ApiKey`.
- **Logic**: Insert `Run` with portal-generated UUID; set `receivedAt = now()`; set `userId` and `apiKeyId` from key.
- **Output**: Persisted `Run.id`.
- **Deterministic**: Yes.

### R-TI-4: Key Last-Used Update

- **Input**: Resolved `ApiKey.id`.
- **Logic**: `UPDATE ApiKey SET lastUsedAt = now() WHERE id = keyId`. Runs concurrently with or immediately after Run insert (same transaction or best-effort).
- **Output**: Updated `ApiKey` record.
- **Note**: Failure to update `lastUsedAt` must not cause the overall request to fail; treat as best-effort.

### R-TI-5: No Cross-User Storage

- **Input**: Resolved `ApiKey.userId`.
- **Logic**: The `Run.userId` is always set to the key's owner. There is no parameter in the payload to override `userId`.
- **Output**: Run is associated only with the key owner.
- **Deterministic**: Yes. Enforces System Spec Rule R1.

---

## 6.1 Expected Payload Schema

Based on the murmur8 telemetry schema documented in `.business_context/murmur8-framework-understanding.md` §3.

```json
{
  "slug":             "<string, required — feature identifier, kebab-case>",
  "status":           "<enum: 'success' | 'failed' | 'paused', required>",
  "type":             "<enum: 'feature' | 'refinement', required>",
  "startedAt":        "<ISO 8601 datetime string, required>",
  "completedAt":      "<ISO 8601 datetime string, required>",
  "totalDurationMs":  "<integer >= 0, required>",
  "totalCost":        "<number >= 0, required — USD>",
  "commitHash":       "<string | null, required — null if no commit>",
  "failedStage":      "<string | null, required — null if not failed>",
  "pausedAfter":      "<string | null, required — null if not paused>",
  "parentRunId":      "<string (UUID) | null, required — null for feature type>",
  "stages":           "<object, required — per-stage breakdown (JSONB passthrough)>"
}
```

**`stages` object shape** (each key is a stage name, e.g. `"alex"`, `"cass"`, `"nigel-spec"`, `"nigel-tests"`, `"codey-plan"`, `"codey-implement"`):

```json
{
  "<stage-name>": {
    "startedAt":    "<ISO 8601 datetime string>",
    "completedAt":  "<ISO 8601 datetime string>",
    "durationMs":   "<integer>",
    "status":       "<'success' | 'failed' | 'skipped'>",
    "feedback": {
      "rating":         "<integer 1–5>",
      "issues":         "<string[]>",
      "recommendation": "<string>"
    },
    "tokens": {
      "input":  "<integer>",
      "output": "<integer>"
    },
    "cost": "<number>"
  }
}
```

The `stages` object is stored as JSONB without deep portal-level validation of individual stage fields. Top-level `stages` key must be present and be an object; inner stage fields are not validated beyond presence of the parent key.

**Fields not in payload (portal-generated):**
- `id` — UUID generated by the portal
- `userId` — derived from the resolved API key
- `apiKeyId` — the resolved API key's ID
- `receivedAt` — timestamp set at ingestion time

---

## 7. Dependencies

| Dependency | Detail |
|-----------|--------|
| `api-key-management` feature | `ApiKey` records with hashed keys must exist before any telemetry can be ingested. This feature has no value until at least one active key exists. |
| `project-scaffold` feature | Prisma schema, Next.js App Router, and database connection must be in place. The `Run` model must exist in `schema.prisma`. |
| Prisma `Run` model | Must include all fields listed in System Spec §5 Run table. `stages` must be typed as `Json`. |
| SHA-256 hashing | Must be the agreed algorithm used in `api-key-management`. If bcrypt is chosen instead, the key lookup strategy in this feature must change (since bcrypt is non-deterministic; lookup would require fetching all active keys and comparing). |
| `Authorization` header parsing | Standard Bearer token extraction — no external library required. |

---

## 8. Non-Functional Considerations

- **Security**: Raw API key is never logged or echoed. SHA-256 hash is computed in-process and not persisted beyond the DB lookup. No session cookie or CSRF token is involved — this is a pure API endpoint consumed by non-browser clients (System Spec §8).
- **Auditability**: Every `Run` stores `receivedAt`, `apiKeyId`, and `userId`, making each record fully traceable. Satisfies System Spec §8 auditability requirement.
- **Error handling**: Validation errors must return structured JSON (`{ errors: [...] }`) not HTML. The CLI must be able to parse 422 responses programmatically.
- **Simplicity**: Synchronous Route Handler. No message queues, no background workers. Acceptable for v1 throughput (System Spec §8 simplicity principle).
- **Atomicity**: Run insert and `lastUsedAt` update should ideally be in a single Prisma transaction. If the transaction is unavailable, `lastUsedAt` update is best-effort and must not block the 201 response.
- **No rate limiting**: Not required in v1. Deferred.

---

## 9. Assumptions & Open Questions

| # | Type | Statement |
|---|------|-----------|
| A1 | Assumption | SHA-256 is the API key hashing algorithm (consistent with `api-key-management`). If bcrypt, key lookup logic must change. |
| A2 | Assumption | The Prisma `Run` model exists and matches System Spec §5. No schema migration is in scope for this feature. |
| A3 | Assumption | `completedAt >= startedAt` — the portal does not enforce this; the CLI is trusted to provide consistent timestamps. |
| A4 | Assumption | `parentRunId` is a string UUID sent in the payload for refinement runs. The portal stores it as-is without validating that the referenced Run actually exists in the DB. |
| OQ1 | Open | Should `lastUsedAt` update and Run insert be wrapped in a single Prisma transaction, or is best-effort acceptable? (Recommend: transaction; mark as decision for Codey.) |
| OQ2 | Open | Should the 422 response use Zod's native error format, or a normalised portal error envelope? (Recommend: normalised envelope for CLI parseability.) |

---

## 10. Impact on System Specification

This feature **reinforces** existing System Spec assumptions:

- The SHA-256 hashing approach referenced in §6.4 is directly exercised here. The tension is OQ3 in the System Spec (bcrypt vs SHA-256). This feature assumes SHA-256 is resolved in favour of SHA-256 for its lookup approach. If bcrypt is chosen by `api-key-management`, this spec needs an addendum describing the fallback lookup strategy.
- No contradictions identified. The endpoint is fully specified in §6.4 and §7 (Rules R2, R6).
- **Potential spec stretch**: The System Spec says duplicate `slug`+`startedAt` "may warn but will still store." The warning behaviour is unspecified at API response level. This spec defers the warning; no spec change proposed yet.

---

## 11. Handover to BA (Cass)

**Classification: Technical — Cass is skipped for this feature.**

Story themes (for reference if Cass is invoked in future refinement):
- Authentication gate: key hash lookup and revocation check
- Payload validation: schema enforcement and error response shape
- Data persistence: Run creation and key timestamp update
- Contract compliance: CLI can parse 201 and 422 responses reliably

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial draft | Feature creation | Alex |
