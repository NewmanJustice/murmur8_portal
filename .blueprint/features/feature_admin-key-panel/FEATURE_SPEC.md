---
version: 0.1.0
date: 2026-05-20
status: draft
feature: admin-key-panel
---

# Feature Specification — Admin Key Panel

## 1. Feature Intent

The Admin Key Panel gives users with the `isAdmin` flag a dedicated governance
surface to view **all** API keys across the entire platform and revoke any active
key. Without this feature, admins must use the database directly to audit or
withdraw access, creating an operational and security gap.

This feature satisfies System Spec §6.3 (Admin API Key Management) and enforces
rules R1, R4, and R5.

System Spec reference: `.blueprint/system_specification/SYSTEM_SPEC.md` §6.3, §7.

---

## 2. Scope

### In Scope

- **Admin key list** — route `/admin/keys` shows all API keys across all users,
  joined with owner `name` and `avatarUrl`, sorted newest first.
- **Stats bar** — summary counts: total keys, active keys, revoked keys, unique
  owners — rendered above the table for at-a-glance oversight.
- **Admin revoke** — admin can revoke any active key via a per-row confirmation
  flow that names the key and its owner. Sets `revokedAt = now()`. Permanent.
- **Access control** — unauthenticated users redirected to `/`; non-admin
  authenticated users redirected to `/dashboard/keys`.
- **Server Action guard** — the `revokeAnyKey` server action independently
  verifies `isAdmin` so it cannot be exploited directly.
- **Empty state** — when no keys exist, render a clear empty message.

### Out of Scope

- Creating keys on behalf of other users (System Spec §6.3).
- Filtering or searching by owner, status, or date range (deferred to v2).
- Bulk revocation (deferred to v2).
- Email/webhook notification on admin revocation (System Spec §3 out-of-scope).
- Key re-activation (Rule R4 — permanent).
- Changing `isAdmin` status via the UI (Rule R5).
- Exporting key data.

---

## 3. Actors Involved

### Admin

| Can | Cannot |
|-----|--------|
| View all users' keys with owner details | Create keys for other users |
| See stats: total, active, revoked, unique owners | Change `isAdmin` status via UI |
| Revoke any active key | Re-activate a revoked key |
| Access `/admin/keys` | — |

### User (authenticated, non-admin)

| Can | Cannot |
|-----|--------|
| — | Access `/admin/keys` (redirected to `/dashboard/keys`) |
| — | Call `revokeAnyKey` server action (returns `Forbidden` error) |

### Visitor (unauthenticated)

| Can | Cannot |
|-----|--------|
| — | Access `/admin/keys` (redirected to `/`) |

---

## 4. Behaviour Overview

### 4.1 Page load (happy path)

1. Admin navigates to `/admin/keys`.
2. Server checks session: unauthenticated → redirect `/`; non-admin → redirect `/dashboard/keys`.
3. All `ApiKey` records fetched via `adminListApiKeys()`, joined with `user.name` and `user.avatarUrl`, newest first.
4. Stats bar computed server-side: total, active, revoked, unique owner count.
5. Table rendered with columns: Owner, Name, Key Prefix, Created, Last Used, Status, Actions.
6. Active keys show a "Revoke" button; revoked keys show no action.
7. If no keys exist, an empty-state message is displayed.

### 4.2 Admin revoke flow

1. Admin clicks "Revoke" on an active key row.
2. Inline confirmation replaces the button: names the key and owner, warns "This action is permanent and cannot be undone."
3. Admin clicks "Confirm revoke" → `revokeAnyKey(keyId)` server action called.
4. Server action re-verifies `isAdmin`; if not admin, returns `{ error: 'Forbidden' }`.
5. `adminRevokeApiKey(keyId)` called: verifies key exists and is active, sets `revokedAt = now()`.
6. On success: page reloads; row now shows "Revoked" badge, no Revoke button.
7. If key already revoked: server returns `{ error: 'This key has already been revoked.' }`; UI shows error.

### 4.3 Error cases

| Scenario | Outcome |
|----------|---------|
| Non-admin user accesses `/admin/keys` | Redirect to `/dashboard/keys` |
| Unauthenticated user accesses `/admin/keys` | Redirect to `/` |
| Non-admin calls `revokeAnyKey` directly | Action returns `{ error: 'Forbidden: admin access required.' }` |
| Revoking an already-revoked key | Action returns `{ error: 'This key has already been revoked.' }` |
| Key ID not found | Action returns `{ error: 'Failed to revoke key. Please try again.' }` |

---

## 5. State & Lifecycle Interactions

This feature is **state-transitioning** (active → revoked) and **state-reading**
(listing all keys).

The `adminRevokeApiKey` function is the secondary writer of `revokedAt` (in
addition to the user-scoped `revokeApiKey`). Both write the same field; there is
no conflict.

### Effect on other features

- **telemetry-ingestion**: reads `revokedAt` to validate inbound keys. Admin
  revocation immediately rejects subsequent telemetry from the revoked key.
- **api-key-management**: user-scope key management is unaffected; admin panel is
  an additive surface only.
- **run-history-dashboard**: revoked keys remain in DB; historical runs retain
  their `apiKeyId` association.

---

## 6. Rules & Decision Logic

| Rule ref | Rule | Logic |
|----------|------|-------|
| R1 | Admin sees all keys | `adminListApiKeys()` has no `userId` filter |
| R4 | Revocation permanent | `revokedAt` write-once; no clear endpoint |
| R5 | Admin flag immutable via UI | `isAdmin` not exposed in any form or action here |
| — | Access gate: page | `auth()` → redirect if no session or `!isAdmin` |
| — | Access gate: action | `revokeAnyKey` re-checks `isAdmin` independently |
| — | Sorted newest first | `orderBy: { createdAt: 'desc' }` |
| — | Stats computed server-side | Derived from fetched key array; no separate DB query |

---

## 7. Dependencies

| Dependency | Detail |
|------------|--------|
| `api-key-management` feature | `adminListApiKeys()` and `adminRevokeApiKey()` functions in `lib/api-keys-db.ts` |
| `github-auth` feature | `auth()` session with `session.user.isAdmin` |
| Prisma `ApiKey` + `User` models | Already defined in `prisma/schema.prisma` |
| Next.js App Router | Page at `/admin/keys`; Server Action `revokeAnyKey` |

---

## 8. Non-Functional Considerations

- **Security**: Server action independently verifies `isAdmin`; page-level redirect
  is not the only guard. Even if middleware fails, the action returns `Forbidden`.
- **Auditability**: `revokedAt` timestamp records when admin withdrew access; no
  separate audit log in v1 (logged to `console.error` on failure only).
- **Performance**: Key list is unfiltered; for large deployments this may be slow.
  Acceptable for v1 (deferred: pagination, server-side filtering).
- **CSRF**: Server Actions use Next.js App Router's built-in CSRF protection.

---

## 9. Assumptions & Open Questions

| # | Item | Resolution |
|---|------|------------|
| A1 | `adminListApiKeys` and `adminRevokeApiKey` already exist | **Confirmed**: present in `lib/api-keys-db.ts` |
| A2 | Admin status set via `ADMIN_GITHUB_ID` env var, not UI | **Confirmed**: System Spec §6.3, §OQ5 resolved |
| A3 | No pagination needed in v1 | **Assumed**: key counts small enough for full-page render |
| A4 | No filtering or search in v1 | **Decided**: deferred to v2 per backlog priority (P2, S) |

---

## 10. Impact on System Specification

This feature **reinforces** the System Spec without contradiction. It is the
direct implementation of the System Spec §6.3 admin capability already described
in the backlog (P2, S, `admin-key-panel`).

No system-spec changes required.

---

## 11. Handover to BA (Cass)

### Story themes

1. **Admin key list** — admin sees all users' keys with owner column and stats bar
2. **Admin revoke** — admin revokes any active key via confirmation flow
3. **Access control** — non-admin and unauthenticated users cannot access the panel or the server action
4. **Empty state** — no keys exist, appropriate message shown

### Expected story boundaries

- Stories 1–2 are the core functional slice.
- Story 3 is the security/access-control slice (must be tested explicitly).
- Story 4 is a UI quality story.

### Areas needing careful story framing

- Access control story must cover both the page redirect AND the server action guard independently.
- Admin revoke confirmation must reference owner name and key name explicitly.
- The stats bar is part of story 1 (not a separate story).

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial draft | Feature spec creation | Alex |
