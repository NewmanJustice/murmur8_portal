---
story: access-control
feature: admin-key-panel
author: Cass
date: 2026-05-20
---

# Story: Access Control for Admin Panel

## User Story

As the system,
I want to ensure only admins can access the admin key panel and server actions,
so that non-admin users and unauthenticated visitors cannot view or modify other users' keys.

---

## Acceptance Criteria

**AC1 — Unauthenticated redirect to login**
Given I am not signed in,
When I navigate to `/admin/keys`,
Then I am redirected to `/` (the login page).

**AC2 — Non-admin redirect to own keys**
Given I am authenticated as a user with `isAdmin = false`,
When I navigate to `/admin/keys`,
Then I am redirected to `/dashboard/keys`.

**AC3 — Admin can access the panel**
Given I am authenticated as a user with `isAdmin = true`,
When I navigate to `/admin/keys`,
Then the page loads and I can see the key table.

**AC4 — Non-admin server action guard**
Given I am authenticated as a non-admin user,
When `revokeAnyKey(keyId)` is called directly (e.g. via form POST or programmatic call),
Then the action returns `{ error: 'Forbidden: admin access required.' }` and no key is modified.

**AC5 — Server action guard is independent of page redirect**
Given the page-level redirect may be bypassed,
When `revokeAnyKey` is called by any non-admin session,
Then the action re-checks `isAdmin` and returns the Forbidden error regardless.

---

## Out of Scope

- Changing `isAdmin` via the UI.
- Multi-role or permission systems beyond the binary admin flag.
