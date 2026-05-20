---
story: revoke-key
feature: api-key-management
author: Cass
date: 2026-05-20
---

# Story: Revoke API Key

## User Story

As an authenticated user,
I want to revoke one of my active API keys,
so that the pipeline client using that key can no longer post telemetry on my behalf.

---

## Acceptance Criteria

**AC1 — Revoke button only on active keys**
Given I have an active key in my key list,
When I view `/dashboard/keys`,
Then a "Revoke" button is shown on that row; revoked keys do not show the button.

**AC2 — Confirmation required**
Given I click "Revoke" on an active key,
When the confirmation dialog appears,
Then it names the key and shows the warning: "This action is permanent and cannot be undone."

**AC3 — Key revoked on confirm**
Given the confirmation dialog is open,
When I click "Confirm revoke",
Then the key's `revokedAt` is set to now and the row status changes to "Revoked".

**AC4 — Revoked key rejects telemetry**
Given a key has been revoked,
When the telemetry ingestion endpoint receives a request with that key,
Then it returns `401 Unauthorized`.

**AC5 — No re-activation**
Given a key has been revoked,
When I view `/dashboard/keys`,
Then there is no option to re-activate or un-revoke the key.

---

## Out of Scope

- Bulk revocation.
- Email or webhook notification on revocation.
- Re-activation of a revoked key.
