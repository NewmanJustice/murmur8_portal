---
storyId: admin-copy-key-prefix
feature: copy_key
author: Cass
date: 2026-05-21
---

# Story: Admin copies any key prefix to clipboard

**As an** Admin viewing the API keys panel at `/admin/keys`,
**I want** to click a copy button next to any key's prefix,
**so that** I can quickly reference a specific key when investigating issues or supporting users, without manual text selection.

---

## Acceptance Criteria

**Given** I am logged in as an Admin and viewing the `/admin/keys` panel with at least one key listed,
**When** the page loads,
**Then** each row in the admin key table displays a copy icon button inline with the key prefix cell.

---

**Given** I am viewing any key row in the admin panel (regardless of which user owns it),
**When** I click the copy icon button,
**Then** the browser writes that row's `keyPrefix` string to the system clipboard.

---

**Given** I have clicked the copy icon button successfully,
**When** the clipboard write completes,
**Then** the copy icon changes to a success indicator for approximately 2 seconds, then reverts — consistent with the behaviour on the user `/keys` page.

---

**Given** a key row in the admin panel has status "Revoked",
**When** I view the panel,
**Then** the copy button is present on that row and functions identically to active key rows.

---

**Given** I click the copy icon button on any row,
**When** the clipboard write succeeds,
**Then** only the `keyPrefix` string is written — never the full raw key.

---

## Out of Scope

- Copying the full raw key value (not present on this page per rule R3).
- Admin-specific audit logging of copy actions.
- Any server-side changes.
- Changes to the user `/keys` page behaviour (covered by story-user-copy-key-prefix).
