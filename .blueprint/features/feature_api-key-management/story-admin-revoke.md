---
story: admin-revoke
feature: api-key-management
author: Cass
date: 2026-05-20
---

# Story: Admin Revokes Any Key

## User Story

As an admin,
I want to revoke any active API key regardless of who owns it,
so that I can withdraw access when a key is compromised or an account is suspended.

---

## Acceptance Criteria

**AC1 — Revoke button visible to admin on any active key**
Given I am authenticated as an admin on `/admin/keys`,
When an active key belonging to another user is in the table,
Then a "Revoke" button is shown for that row.

**AC2 — Confirmation required**
Given I click "Revoke" on any active key,
When the confirmation dialog appears,
Then it names the key, shows the owner's name, and states: "This action is permanent and cannot be undone."

**AC3 — Key revoked on confirm**
Given the confirmation dialog is open,
When I click "Confirm revoke",
Then `revokedAt` is set on that key and the row status updates to "Revoked".

**AC4 — Non-admin cannot call admin revoke action**
Given I am authenticated as a non-admin,
When the admin revoke server action is called (e.g. via direct form POST),
Then the action returns an error and no key is modified.

**AC5 — Owner not notified**
Given an admin revokes another user's key,
When the revocation completes,
Then no email or webhook notification is sent (v1 constraint).

---

## Out of Scope

- Admins creating or modifying keys beyond revocation.
- Notifying the key owner on revocation.
- Bulk admin revocation.
