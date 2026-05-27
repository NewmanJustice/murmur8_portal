---
version: 0.1.0
date: 2026-05-20
status: draft
feature: api-key-management
---

# Feature Specification — API Key Management

## 1. Feature Intent

API keys are the trust mechanism that allows a murmur8 pipeline client to post
telemetry to the portal on behalf of a user. Without the ability to create and
revoke keys, no telemetry can be authenticated and the portal has no data to
display.

This feature delivers the full lifecycle UI for API keys:

- A user generates named keys and receives the raw value exactly once.
- A user lists, inspects, and revokes their own keys.
- An admin can view all users' keys and revoke any active key.

System Spec reference: `.blueprint/system_specification/SYSTEM_SPEC.md` §6.2, §6.3, §7 (R1–R6).

---

## 2. Scope

### In Scope

- **Create key** — User supplies a name; system generates a cryptographically
  random raw key, hashes it with SHA-256, persists only the hash, and returns
  the raw value once in the response.
- **One-time reveal** — The raw key is displayed in the UI immediately after
  creation inside a dismissible modal/banner. Once dismissed or navigated away,
  the key cannot be recovered from the portal.
- **List keys** — Authenticated user sees all their own keys in a table with:
  key name, masked prefix (first 8 chars + "…"), created date, last-used date,
  status badge (active / revoked).
- **Revoke key** — User clicks Revoke on any active key. Requires a
  confirmation step. Sets `revokedAt = now()`. Permanent; no undo.
- **Admin list** — Admin sees all keys across all users, including owner
  name/avatar, with the same column set.
- **Admin revoke** — Admin can revoke any active key (same confirmation flow).

### Out of Scope

- Admins creating keys on behalf of other users (System Spec §6.3).
- Key re-activation after revocation (Rule R4).
- Per-project or scoped API keys (System Spec §3 out-of-scope).
- Key expiry / auto-rotation.
- Bulk revocation.
- Email or webhook notification on revocation.

---

## 3. Actors Involved

### User (authenticated, non-admin)

| Can | Cannot |
|-----|--------|
| Create any number of named API keys | See other users' keys |
| View their own key list | Re-activate a revoked key |
| Revoke any of their own active keys | Create keys for another user |
| See the raw key value once at creation time | Retrieve the raw key value after dismissal |

### Admin

| Can | Cannot |
|-----|--------|
| Do everything a User can for their own keys | Create keys on behalf of other users |
| View all users' keys with owner details | Change `isAdmin` status via UI |
| Revoke any active key regardless of owner | |

### Pipeline Client (indirect actor)

After key creation, the raw key is used in `Authorization: Bearer <key>` headers.
This feature does not implement telemetry ingestion — see `feature_telemetry-ingestion`.
The revocation state maintained here is what causes the telemetry endpoint to return 401.

---

## 4. Behaviour Overview

### 4.1 Create Key (happy path)

1. User navigates to `/dashboard/keys`.
2. User clicks "New Key", enters a name (required, non-empty, max 64 chars), submits.
3. Server generates a 32-byte cryptographically random value, encodes as hex
   (64-char string). This is the raw key.
4. Raw key is hashed with SHA-256 (hex digest). The hash is stored as `ApiKey.key`.
5. An `ApiKey` record is created: `name`, `userId`, `key` (hash), `createdAt = now()`,
   `lastUsedAt = null`, `revokedAt = null`.
6. The raw key is returned to the client and displayed once in a copy-to-clipboard
   modal with a prominent warning: "Copy this key — you will not see it again."
   The copy button in the modal copies the full raw key value to the clipboard.
7. After the user dismisses the modal, the raw key is removed from client state.
   The key prefix column in the keys table shows a read-only masked value only —
   no clipboard icon or copy action is present after dismissal.

### 4.2 List Keys

1. Page loads `/dashboard/keys`.
2. All keys belonging to the authenticated user are fetched and rendered in a
   table, newest first by `createdAt`.
3. The `key` field (hash) is never sent to the client. The masked prefix is
   derived from `ApiKey.name` (or a stored `keyPrefix` — see §9).
4. Status: active (green badge) if `revokedAt IS NULL`; revoked (grey badge) otherwise.

### 4.3 Revoke Key

1. User clicks "Revoke" on an active key row.
2. A confirmation dialog names the key and warns the action is permanent.
3. On confirm, a Server Action or Route Handler sets `revokedAt = now()`.
4. Table updates: status changes to revoked, Revoke button is removed/disabled.

### 4.4 Admin Key List

1. Admin navigates to `/admin/keys`.
2. All keys across all users are fetched, joined with owning user
   (`name`, `avatarUrl`), sorted by `createdAt` descending.
3. Same column set as user view, plus an "Owner" column.
4. Admin can revoke any active key via the same confirmation flow.

### 4.5 Error cases

| Scenario | Outcome |
|----------|---------|
| Name is blank or >64 chars | Validation error before submission |
| Duplicate name for same user | Allowed (names are not unique-constrained per user) |
| Revoking an already-revoked key | Server returns 409; UI shows error toast |
| Non-admin accessing `/admin/keys` | Redirect to `/dashboard/keys` with 403 |
| Unauthenticated access to any key route | Redirect to login |

---

## 5. State & Lifecycle Interactions

This feature is **state-creating** (new `ApiKey` records) and
**state-transitioning** (active → revoked).

### ApiKey states

```
(created) --> active (revokedAt IS NULL)
                  |
                  v [revoke action]
              revoked (revokedAt IS NOT NULL)  [terminal]
```

- No transition back from revoked (R4).
- `lastUsedAt` is written by the telemetry ingestion feature, not here.

### Effect on other features

- `telemetry-ingestion`: reads `revokedAt` to validate inbound keys. This
  feature is the authoritative writer of that field.
- `run-history-dashboard`: runs are linked to `apiKeyId`; revoked keys remain
  in the DB so historical runs retain their association.

---

## 6. Rules & Decision Logic

| Rule ref | Rule | Logic |
|----------|------|-------|
| R2 | Raw key never stored | Raw key generated in memory; only SHA-256 hex digest persisted as `ApiKey.key` |
| R3 | Raw key shown once | Returned from create action in-memory; never re-retrievable from DB |
| R4 | Revocation permanent | `revokedAt` is write-once; no update endpoint to clear it |
| R1 | User data isolation | Server Actions / Route Handlers filter by `session.user.id`; admin routes check `isAdmin` flag |
| R5 | Admin flag immutable via UI | `isAdmin` not exposed in any form or action in this feature |
| — | Key name validation | Required, 1–64 characters, trimmed. No uniqueness constraint. |
| — | Hash algorithm | **SHA-256** (Node.js `crypto.createHash('sha256')`). Fast, deterministic, appropriate for high-entropy random keys (not passwords). See §9. |
| — | Raw key format | 32 bytes from `crypto.randomBytes(32)`, hex-encoded → 64-char lowercase hex string |
| — | Masked display | First 8 characters of the raw key + "…" stored as `keyPrefix` (see §9) |

---

## 7. Dependencies

| Dependency | Detail |
|------------|--------|
| `github-auth` feature | Session must exist; `session.user.id` and `session.user.isAdmin` must be available |
| Prisma `ApiKey` model | Already defined in `prisma/schema.prisma`. No migration needed for core fields. See §9 for `keyPrefix` addition. |
| Next.js App Router | Pages at `/dashboard/keys` and `/admin/keys`; Server Actions or Route Handlers for mutations |
| Node.js `crypto` module | `randomBytes` for key generation, `createHash('sha256')` for hashing — no extra packages |

---

## 8. Non-Functional Considerations

- **Security**: Raw key lives only in server memory during the request/response
  cycle and in the user's clipboard/browser after the one-time reveal. Never
  written to logs. The hash in the DB reveals nothing about the raw key due to
  the 256-bit entropy of the input.
- **Performance**: SHA-256 on a 64-char string is sub-millisecond. No caching
  needed. Key list queries are indexed on `userId`.
- **Auditability**: `revokedAt` provides a permanent record of when access was
  withdrawn. Admins revoking keys leave a timestamp; no separate audit log in v1.
- **CSRF**: Mutations handled via Server Actions (CSRF protection built into
  Next.js App Router) or Route Handlers protected by NextAuth session checks.
- **UI feedback**: The one-time reveal modal must be unmissable. Consider
  requiring the user to click "I've copied it" rather than a generic close.

---

## 9. Assumptions & Open Questions

| # | Item | Resolution |
|---|------|------------|
| A1 | SHA-256 chosen over bcrypt | **Decided**: SHA-256 is appropriate because the raw key has 256 bits of entropy (random, not a password). bcrypt would add latency with no security benefit for high-entropy tokens. |
| A2 | Masked prefix source | The `ApiKey` model does not currently store the raw key prefix separately. **Decision**: add a `keyPrefix String` field (first 8 chars of raw key) to the schema at migration time. This avoids any need to derive it from the hash. A schema migration is required. |
| A3 | Key list scope | Users see only their own keys unless `isAdmin = true`. |
| A4 | `github-auth` is a prerequisite | This feature requires session authentication to be working. It will not implement auth itself. |
| OQ3 | (from System Spec) bcrypt vs SHA-256 | **Resolved here**: SHA-256 (see A1 above). System Spec OQ3 can be closed. |

---

## 10. Impact on System Specification

This feature **reinforces** the System Spec without contradiction.

### Resolved deferred decision

System Spec OQ3 (hashing algorithm) is resolved by this feature spec: **SHA-256**.
The System Spec author should update §9 to mark OQ3 as resolved.

### Minor schema addition required

The System Spec `ApiKey` definition (§5) does not list a `keyPrefix` field.
This feature requires storing the first 8 characters of the raw key to enable
masked display without ever re-deriving from the hash. Proposed addition:

```
keyPrefix  String  -- first 8 chars of the raw key, stored at creation
```

This is additive and non-breaking. No contradiction; propose updating the
System Spec §5 `ApiKey` properties table to include `keyPrefix`.

---

## 11. Handover to BA (Cass)

### Story themes

1. **Key creation** — happy path from name input through one-time reveal
2. **Key listing** — viewing all own keys with status and metadata
3. **Key revocation** — confirm-and-revoke flow with permanent consequence
4. **Admin key view** — cross-user key list with owner attribution
5. **Admin revocation** — admin revoking another user's key
6. **Access control** — unauthenticated/unauthorised access to key routes
7. **Validation** — name field edge cases (blank, too long)

### Expected story boundaries

- Stories 1–3 form a natural first slice (user self-service).
- Stories 4–5 are a second slice (admin capability).
- Stories 6–7 are acceptance criteria on the above, not standalone stories.

### Areas needing careful story framing

- The one-time reveal is a UX-critical moment — the story must be explicit that
  the key cannot be recovered after dismissal, and that the UI must communicate
  this clearly.
- Revocation confirmation must convey permanence; the story should specify the
  warning copy or leave it to Codey with a constraint.
- Admin revocation of another user's key should clarify that the owner user is
  not notified (no email/webhook in v1).

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial draft | Feature spec creation | Alex |
