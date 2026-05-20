## Handoff Summary
**For:** Nigel
**Feature:** api-key-management

### Stories Written
- `story-create-key.md` — User creates a named key; raw value shown once in copy modal (5 ACs)
- `story-list-keys.md` — User views their keys: name, masked prefix, created, last used, status (5 ACs)
- `story-revoke-key.md` — User revokes own key; permanent; rejected telemetry after revoke (5 ACs)
- `story-admin-view.md` — Admin views ALL users' keys with owner info (5 ACs)
- `story-admin-revoke.md` — Admin revokes any active key; non-admin blocked (5 ACs)

### Key Decisions Carried Forward
- **Key format**: `mm8_` prefix + 64 hex chars (total 68 chars)
- **Masked display**: first 12 chars of raw key + `...` — stored as `keyPrefix` in DB
- **SHA-256 hashing** of raw key — only hash stored in DB
- **One-time reveal**: modal requires explicit "I've copied it" dismissal
- **Revocation is permanent** — no re-activation path in any story

### Testing Priorities for Nigel
- Pure logic functions in `lib/api-keys.ts` are the primary test target (no DB or server needed)
- Key generation: format, prefix, uniqueness entropy
- Hashing: deterministic SHA-256 output
- Masking: correct 12-char prefix + `...`
- Name validation: empty and >64-char edge cases
- Revocation state: active vs revoked logic

### Critical Context
- `github-auth` is a prerequisite; tests should mock session rather than rely on real auth
- AC4 of `story-revoke-key.md` (telemetry rejection) is tested by `telemetry-ingestion` feature, not here — out of test scope for this feature's test file
- Admin revoke action must check `session.user.isAdmin` server-side (AC4 of `story-admin-revoke.md`)
