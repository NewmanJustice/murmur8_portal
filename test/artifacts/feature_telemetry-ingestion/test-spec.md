---
feature: telemetry-ingestion
author: Nigel
date: 2026-05-20
---

# Test Specification — Telemetry Ingestion

## AC → Test ID Mapping

| AC | Rule | Test ID | Description |
|----|------|---------|-------------|
| SHA-256 hashing | R-TI-1 | T-TI-01 | hashKey produces correct SHA-256 hex digest |
| SHA-256 hashing | R-TI-1 | T-TI-02 | hashKey is deterministic — same input yields same output |
| Payload validation | R-TI-2 | T-TI-03 | validatePayload accepts a fully valid payload |
| Payload validation | R-TI-2 | T-TI-04 | validatePayload rejects payload missing required fields |
| Payload validation | R-TI-2 | T-TI-05 | validatePayload rejects invalid status enum |
| Payload validation | R-TI-2 | T-TI-06 | validatePayload rejects invalid type enum |
| Payload validation | R-TI-2 | T-TI-07 | validatePayload rejects non-integer totalDurationMs |
| Payload validation | R-TI-2 | T-TI-08 | validatePayload rejects non-object stages |
| Payload validation | R-TI-2 | T-TI-09 | validatePayload accepts type omitted (defaults to feature) |
| Run construction | R-TI-3 | T-TI-10 | createRunRecord sets userId and apiKeyId from resolved key |
| Run construction | R-TI-3 | T-TI-11 | createRunRecord maps all payload fields correctly |
| Run construction | R-TI-3 | T-TI-12 | createRunRecord result contains success=true and data with id |
| Route response shape | §4 | T-TI-13 | 201 response body shape: { id: string } |
| Route response shape | §4 | T-TI-14 | 401 response for missing Authorization header |
| Route response shape | §4 | T-TI-15 | 422 response body shape: { errors: [...] } |

## Test File

`test/feature_telemetry-ingestion.test.js`

## Scope Notes

- All tests are pure unit tests — no DB, no HTTP server
- hashKey and validatePayload are pure functions in lib/telemetry.ts
- createRunRecord is tested without Prisma (its DB call is mocked via dependency injection)
- Route handler tests use the extracted pure handler logic
