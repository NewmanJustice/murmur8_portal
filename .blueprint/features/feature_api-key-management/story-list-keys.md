---
story: list-keys
feature: api-key-management
author: Cass
date: 2026-05-20
---

# Story: List API Keys

## User Story

As an authenticated user,
I want to view all my API keys in a table,
so that I can see which keys exist, their status, and when they were last used.

---

## Acceptance Criteria

**AC1 — Table columns**
Given I have one or more API keys,
When I navigate to `/dashboard/keys`,
Then I see a table with columns: Name, Key Prefix, Created, Last Used, Status.

**AC2 — Masked prefix display**
Given a key was created with a known raw value,
When that key appears in the table,
Then the "Key Prefix" column shows the first 12 characters of the raw key followed by `...` (e.g. `mm8_a1b2c3d4...`). No clipboard icon or copy action is present — the prefix is read-only display text for identification only.

**AC3 — Active status badge**
Given a key has not been revoked (`revokedAt IS NULL`),
When it appears in the table,
Then its Status column shows an "Active" badge (green).

**AC4 — Revoked status badge**
Given a key has been revoked (`revokedAt IS NOT NULL`),
When it appears in the table,
Then its Status column shows a "Revoked" badge (grey) and the revoke action is absent.

**AC5 — User data isolation**
Given user A and user B each have keys,
When user A views `/dashboard/keys`,
Then only user A's keys are shown; user B's keys are never visible.

---

## Out of Scope

- Sorting or filtering by column.
- Pagination (v1, assumed low key count).
- Displaying the full key hash or raw key.
