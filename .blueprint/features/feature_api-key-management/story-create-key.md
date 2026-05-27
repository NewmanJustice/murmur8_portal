---
story: create-key
feature: api-key-management
author: Cass
date: 2026-05-20
---

# Story: Create API Key

## User Story

As an authenticated user,
I want to create a named API key,
so that I can authorise the murmur8 pipeline client to post telemetry on my behalf.

---

## Acceptance Criteria

**AC1 — Name required**
Given I am on `/dashboard/keys`,
When I submit the "New Key" form with an empty name,
Then I see a validation error "Name is required" and no key is created.

**AC2 — Name max length**
Given I am on `/dashboard/keys`,
When I submit the "New Key" form with a name longer than 64 characters,
Then I see a validation error "Name must be 64 characters or fewer" and no key is created.

**AC3 — Successful creation shows raw key once**
Given I submit a valid name (1–64 characters),
When the server creates the key,
Then a modal appears showing the full raw key with a copy-to-clipboard button and a warning: "Copy this key — you will not see it again." The copy button copies the full raw key value to the clipboard.

**AC4 — Raw key format**
Given the key has been successfully created,
When it is displayed in the modal,
Then it begins with the prefix `mm8_` followed by exactly 64 lowercase hex characters.

**AC5 — Key not recoverable after dismissal**
Given the creation modal is open,
When I dismiss the modal (click "I've copied it"),
Then the raw key is removed from the page and cannot be retrieved from the portal UI.

---

**AC6 — No copy action in the keys table**
Given I have dismissed the creation modal,
When I view my keys in the table,
Then no clipboard icon is shown next to the key prefix — the prefix is displayed as read-only text for identification only.

---

## Out of Scope

- Creating keys on behalf of other users.
- Key expiry or auto-rotation.
- Editing a key's name after creation.
