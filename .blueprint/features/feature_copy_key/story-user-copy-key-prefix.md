---
storyId: user-copy-key-prefix
feature: copy_key
author: Cass
date: 2026-05-21
---

# Story: User copies key prefix to clipboard

**As a** User viewing my API keys on the `/keys` page,
**I want** to click a copy button next to each key's prefix,
**so that** I can quickly paste the prefix into support tickets, CI config, or documentation without manually selecting text.

---

## Acceptance Criteria

**Given** I am logged in and viewing the `/keys` page with at least one API key listed,
**When** the page loads,
**Then** each row in the key table displays a small copy icon button inline with the key prefix cell.

---

**Given** I am viewing a key row,
**When** I click the copy icon button,
**Then** the browser writes the key's `keyPrefix` string (e.g. `mm8_d5946a4f...`) to the system clipboard.

---

**Given** I have clicked the copy icon button successfully,
**When** the clipboard write completes,
**Then** the copy icon changes to a checkmark (or equivalent success indicator) for approximately 2 seconds, then reverts to the copy icon.

---

**Given** a key has status "Revoked",
**When** I view the keys table,
**Then** the copy button is still present on that row and functions identically to active key rows.

---

**Given** I click the copy icon button,
**When** the clipboard write succeeds,
**Then** only the `keyPrefix` value is written — never the full raw key, which is not present in the page at all.

---

## Out of Scope

- Copying the full raw key value (intentionally never available on this page per rule R3).
- Toast notifications — icon-swap feedback is sufficient.
- Any server-side call or audit log for copy actions.
- Changes to the RevealModal copy behaviour.
