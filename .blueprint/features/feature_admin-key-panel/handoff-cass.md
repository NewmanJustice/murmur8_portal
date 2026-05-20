## Handoff Summary
**For:** Nigel
**Feature:** admin-key-panel

### Stories Written
- story-admin-key-list.md — Admin sees all keys with stats bar (AC1–AC7)
- story-admin-revoke.md — Admin revokes any active key with confirmation flow (AC1–AC5)
- story-access-control.md — Page and server action access gates (AC1–AC5)

### Key Decisions
- Three stories capture: (1) display/listing, (2) revocation flow, (3) security gates
- Access control story specifically tests both page-level redirect AND server action guard independently — this is the critical security invariant
- Stats bar logic (total/active/revoked/unique owners) is pure array computation — testable as a helper function
- Admin revoke already-revoked guard returns specific error string — testable as a pure logic function

### Files Created
- .blueprint/features/feature_admin-key-panel/story-admin-key-list.md
- .blueprint/features/feature_admin-key-panel/story-admin-revoke.md
- .blueprint/features/feature_admin-key-panel/story-access-control.md

### Open Questions
- None

### Critical Context
The implementation already exists in `app/admin/keys/`. Nigel should focus tests on:
(a) pure helper logic for stats computation and access checking
(b) the `isAdmin` guard logic in the server action (extractable as a pure function)
(c) the `adminRevokeApiKey` guard for already-revoked keys (pure logic in `lib/api-keys-db.ts`)
Tests must use `node:test` and focus on pure functions — no DB, no Next.js runtime needed.
