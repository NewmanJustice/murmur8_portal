---
feature: admin-key-panel
author: Nigel
date: 2026-05-20
---

# Test Specification — Admin Key Panel

## Test Approach

Tests focus on **pure helper functions** extracted/created in `lib/admin-key-panel.js`:
- `computeAdminStats(keys)` — derives stats object from key array
- `checkAdminAccess(session)` — returns `'ok'|'redirect-login'|'redirect-keys'`
- `getAdminRevokeError(session, key)` — returns error string or null

No DB, no Next.js runtime required.

## AC → Test ID Mapping

| Story | AC | Test ID | Description |
|-------|-----|---------|-------------|
| admin-key-list | AC4 | T-01 | `computeAdminStats` total count correct |
| admin-key-list | AC4 | T-02 | `computeAdminStats` active count correct |
| admin-key-list | AC4 | T-03 | `computeAdminStats` revoked count correct |
| admin-key-list | AC4 | T-04 | `computeAdminStats` unique owner count correct |
| admin-key-list | AC4 | T-05 | `computeAdminStats` empty array returns zeros |
| admin-key-list | AC6 | T-06 | `isRevoked` false when `revokedAt` is null |
| admin-key-list | AC6 | T-07 | `isRevoked` true when `revokedAt` is set |
| access-control | AC1 | T-08 | `checkAdminAccess` returns `redirect-login` when no session |
| access-control | AC2 | T-09 | `checkAdminAccess` returns `redirect-keys` when `isAdmin=false` |
| access-control | AC3 | T-10 | `checkAdminAccess` returns `ok` when `isAdmin=true` |
| access-control | AC4,5 | T-11 | `getAdminRevokeError` returns Forbidden for non-admin session |
| access-control | AC4,5 | T-12 | `getAdminRevokeError` returns null for admin session with active key |
| admin-revoke | AC4 | T-13 | `getAdminRevokeError` returns already-revoked error for revoked key |
| admin-revoke | AC1 | T-14 | Active key: `revokedAt` null → no revoke error |
