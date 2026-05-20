---
story: admin-key-list
feature: admin-key-panel
author: Cass
date: 2026-05-20
---

# Story: Admin Views All Keys with Stats

## User Story

As an admin,
I want to see all API keys across all users on a dedicated panel with summary stats,
so that I can monitor key usage and identify keys that need attention at a glance.

---

## Acceptance Criteria

**AC1 — All users' keys visible**
Given I am authenticated as an admin,
When I navigate to `/admin/keys`,
Then I see all API keys from all users (not just my own).

**AC2 — Owner column present**
Given I am on `/admin/keys`,
When the key table is rendered,
Then each row shows the owner's name and avatar in an "Owner" column.

**AC3 — Required columns displayed**
Given I am on `/admin/keys`,
When I view the table,
Then the columns are: Owner, Name, Key Prefix, Created, Last Used, Status.

**AC4 — Stats bar displayed**
Given I am on `/admin/keys` and keys exist,
When the page loads,
Then a stats bar shows: total keys, active keys, revoked keys, and unique owner count.

**AC5 — Keys sorted newest first**
Given multiple keys exist with different `createdAt` timestamps,
When the admin views the list,
Then keys are ordered with the most recently created first.

**AC6 — Status badges correct**
Given a key has `revokedAt = null`,
When displayed in the table,
Then the Status column shows an "Active" badge (green).
Given a key has `revokedAt` set,
Then the Status column shows a "Revoked" badge (grey).

**AC7 — Empty state message**
Given no API keys exist in the system,
When the admin navigates to `/admin/keys`,
Then a clear message is shown indicating no keys have been created yet.

---

## Out of Scope

- Filtering or searching by owner, status, or date.
- Pagination.
- Exporting key data.
