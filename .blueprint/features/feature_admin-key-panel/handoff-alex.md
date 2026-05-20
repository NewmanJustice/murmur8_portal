## Handoff Summary
**For:** Cass
**Feature:** admin-key-panel

### Key Decisions
- Admin panel lives at `/admin/keys`; non-admins redirect to `/dashboard/keys`; unauthenticated to `/`
- Server Action `revokeAnyKey` independently re-checks `isAdmin` — page redirect is not the sole guard
- Stats bar (total / active / revoked / unique owners) computed server-side from the fetched key array
- No filtering, search, or pagination in v1 — entire key list rendered (P2/S priority, small scale)
- `adminListApiKeys()` and `adminRevokeApiKey()` already exist in `lib/api-keys-db.ts`

### Files Created
- .blueprint/features/feature_admin-key-panel/FEATURE_SPEC.md

### Open Questions
- None

### Critical Context
The admin panel is largely already implemented in `app/admin/keys/` (page, actions, client component) as part of the earlier `api-key-management` feature. Cass should frame stories around verifying and completing that implementation — particularly the access-control server action guard and the stats bar. Tests must validate pure helper logic extracted from the admin panel (access checks, stats computation, revocation guard logic).
