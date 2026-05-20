## Handoff Summary
**For:** Codey
**Feature:** api-key-management

### Artifacts Created
- `test/artifacts/feature_api-key-management/test-spec.md` — AC→Test ID mapping (14 tests)
- `test/feature_api-key-management.test.js` — executable tests (node:test + node:assert)

### Test Coverage
14 tests targeting pure functions in `lib/api-keys.ts`:
- T-01 to T-03: `generateKey()` — format, hex suffix, uniqueness
- T-04 to T-06: `hashKey(raw)` — SHA-256 output format, determinism, collision-free
- T-07 to T-08: `maskKey(raw)` — first 12 chars + `...`
- T-09 to T-12: `validateKeyName(name)` — empty, >64 chars, valid, boundary
- T-13 to T-14: `isRevoked(key)` — revokedAt set vs null

### How to Run
```
node --test test/feature_api-key-management.test.js
```

### Critical Implementation Contract
Tests import from `lib/api-keys.js` (compiled output). The module MUST export:
- `generateKey()` → string: `mm8_` + 64 lowercase hex chars
- `hashKey(raw: string)` → string: 64-char lowercase hex SHA-256
- `maskKey(raw: string)` → string: `raw.slice(0, 12) + '...'`
- `validateKeyName(name: string)` → `null` (valid) or error string
- `isRevoked(key: { revokedAt: Date | null })` → boolean

### Out-of-Scope for Tests
- DB operations (`createApiKey`, `listApiKeys`, `revokeApiKey`) — require Prisma, no DB in test
- Next.js page rendering and server actions — no server in test
- Telemetry rejection after revoke (AC4 of story-revoke-key) — belongs to telemetry-ingestion feature

### Notes for Codey
- Tests use ESM dynamic import: `lib/api-keys.js` must be importable as an ES module
- The package.json has `"type": "module"` — TypeScript output must use `.js` extensions in imports
- Run `tsc --noEmit` first to catch type errors before running tests
- If using tsx for compilation, ensure the test can find the compiled output at `lib/api-keys.js`
