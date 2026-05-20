---
story: admin-view
feature: api-key-management
author: Cass
date: 2026-05-20
---

# Story: Admin Views All Keys

## User Story

As an admin,
I want to view all users' API keys with owner information,
so that I can monitor key usage and identify keys that need attention.

---

## Acceptance Criteria

**AC1 — Admin-only access**
Given I am authenticated as a non-admin user,
When I navigate to `/admin/keys`,
Then I am redirected to `/dashboard/keys` and see no admin key data.

**AC2 — All users' keys visible**
Given I am authenticated as an admin,
When I navigate to `/admin/keys`,
Then I see keys belonging to all users, not just my own.

**AC3 — Owner column present**
Given I am on `/admin/keys`,
When the key table is rendered,
Then each row includes an "Owner" column showing the key owner's name and avatar.

**AC4 — Same column set as user view**
Given I am on `/admin/keys`,
When I view the table,
Then the columns include: Owner, Name, Key Prefix, Created, Last Used, Status.

**AC5 — Unauthenticated access redirected**
Given I am not signed in,
When I navigate to `/admin/keys`,
Then I am redirected to the login page.

---

## Out of Scope

- Admins creating keys on behalf of other users.
- Filtering or searching by owner.
- Exporting key data.
