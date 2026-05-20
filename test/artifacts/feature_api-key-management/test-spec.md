---
feature: api-key-management
tester: Nigel
date: 2026-05-20
---

# Test Specification — api-key-management

## Understanding

All tests target pure utility functions in `lib/api-keys.ts`. No database, no Next.js
server, and no HTTP requests are required. The functions under test are: `generateKey()`,
`hashKey(raw)`, `maskKey(raw)`, `validateKeyName(name)`, and revocation state helpers.
Tests run with: `node --test test/feature_api-key-management.test.js`

## AC → Test ID Mapping

| AC / Rule          | Description                                              | Test IDs  | Type  |
|--------------------|----------------------------------------------------------|-----------|-------|
| R2, create-key AC4 | generateKey() returns string starting with `mm8_`        | T-01      | unit  |
| R2, create-key AC4 | generateKey() suffix is 64 lowercase hex chars           | T-02      | unit  |
| R2, create-key AC4 | generateKey() produces unique values each call           | T-03      | unit  |
| R2                 | hashKey(raw) returns 64-char lowercase hex SHA-256       | T-04      | unit  |
| R2                 | hashKey(raw) is deterministic for same input             | T-05      | unit  |
| R2                 | hashKey(raw) differs for different inputs                | T-06      | unit  |
| list-keys AC2      | maskKey(raw) returns first 12 chars + `...`              | T-07      | unit  |
| list-keys AC2      | maskKey(raw) works for any key length ≥ 12               | T-08      | unit  |
| create-key AC1     | validateKeyName('') returns error (name required)        | T-09      | unit  |
| create-key AC2     | validateKeyName(65-char string) returns error            | T-10      | unit  |
| create-key AC1,AC2 | validateKeyName(valid name) returns null (no error)      | T-11      | unit  |
| create-key AC2     | validateKeyName(64-char string) returns null (boundary)  | T-12      | unit  |
| revoke-key AC5     | isRevoked returns true when revokedAt is set             | T-13      | unit  |
| list-keys AC3,AC4  | isRevoked returns false when revokedAt is null           | T-14      | unit  |

## Key Assumptions

- ASSUMPTION: `lib/api-keys.ts` exports CommonJS-compatible functions via ESM or the test
  imports using dynamic import / NODE_PATH pointing at the worktree.
- ASSUMPTION: Tests run on Node.js 20+ where `node:crypto` and `node:test` are available.
- ASSUMPTION: No Prisma client is imported in the pure-logic functions under test; DB
  operations (`createApiKey`, `listApiKeys`, `revokeApiKey`) are out of scope for this test file.
- ASSUMPTION: `maskKey` operates on the raw key string (not the hash); first 12 chars shown.
