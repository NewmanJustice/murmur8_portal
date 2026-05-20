---
story: admin-revoke
feature: admin-key-panel
author: Cass
date: 2026-05-20
---

# Story: Admin Revokes Any Active Key

## User Story

As an admin,
I want to revoke any active API key regardless of who owns it,
so that I can withdraw access immediately when a key is compromised or an account is suspended.

---

## Acceptance Criteria

**AC1 — Revoke button visible on active keys only**
Given I am on `/admin/keys`,
When an active key is shown in the table,
Then a "Revoke" button is displayed for that row.
When a revoked key is shown,
Then no Revoke button is displayed.

**AC2 — Confirmation names key and owner**
Given I click "Revoke" on an active key,
When the confirmation UI appears,
Then it shows the key name and the owner's name.
And it includes the warning: "This action is permanent and cannot be undone."

**AC3 — Key revoked on confirm**
Given the confirmation is showing,
When I click "Confirm revoke",
Then `revokedAt` is set on that key and the row updates to show "Revoked" status.

**AC4 — Already-revoked key returns error**
Given a key has already been revoked,
When `revokeAnyKey(keyId)` is called for that key,
Then the action returns `{ error: 'This key has already been revoked.' }`.

**AC5 — Cancel closes confirmation without revoking**
Given the confirmation is showing,
When I click "Cancel",
Then the confirmation closes and the key remains active.

---

## Out of Scope

- Notifying the key owner on revocation (v1 constraint).
- Bulk revocation.
- Re-activating a revoked key.
