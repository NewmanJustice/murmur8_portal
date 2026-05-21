---
featureId: copy_key
title: Copy Key Prefix to Clipboard
status: draft
date: 2026-05-21
author: Alex
---

# Feature Specification — Copy Key Prefix to Clipboard

## 1. Feature Intent

Users viewing the API Keys page (`/keys`) can see each key's prefix (e.g. `mm8_d5946a4f...`) in the table but currently have no affordance to copy that string without manually selecting the text. This friction is minor but real: users frequently paste the prefix into support threads, documentation, or CI configuration files to identify which key a run used.

- **Problem addressed:** No one-click copy mechanism for the key prefix displayed in the keys table.
- **User need:** A User (or Admin) wants to copy the key prefix string quickly from the table without manual text selection.
- **System alignment:** Improves usability of the API key management surface defined in System Spec §6.2 and §6.3. Does not alter any security invariant — the prefix is already visible in plain text on the page.

> This feature is additive UI polish. It aligns with and reinforces the system spec without stretching or contradicting it.

---

## 2. Scope

### In Scope
- A copy-to-clipboard icon button rendered inline with the key prefix cell in the keys table (user-facing `/keys` page).
- The same button pattern applied to the Admin key panel (`/admin/keys`) where the key prefix is also displayed.
- Transient visual feedback (e.g. icon swap or brief tooltip) confirming the copy succeeded.
- Graceful degradation if the Clipboard API is unavailable (button hidden or disabled).

### Out of Scope
- Copying the full raw key value — that is intentionally shown only once in the `RevealModal` at creation time (System Spec Rule R3). This feature must not expose the raw key.
- Changes to the `RevealModal` copy behaviour (already implemented).
- Any server-side changes — this is a pure client-side UI addition.
- Persistent clipboard history or audit logging of copy actions.

---

## 3. Actors Involved

**User**
- Can trigger the copy action on any of their own key prefix cells in the `/keys` table.
- Cannot copy a key prefix that belongs to another user (they cannot see other users' keys; R1 already enforces this).

**Admin**
- Can trigger the copy action on any key prefix cell in the admin panel (`/admin/keys`), which lists all users' keys.
- The copy target remains the prefix string only — not the raw key (consistent with R3).

**Visitor**
- Cannot access the keys page; no interaction with this feature.

---

## 4. Behaviour Overview

**Happy path:**
1. User views the API Keys table. Each row's "Key Prefix" cell displays the prefix string with a small copy icon button immediately to its right, making the spatial relationship between the affordance and its target obvious.
2. User clicks the copy icon.
3. The browser writes the prefix string to the system clipboard via the Clipboard API.
4. The button shows brief success feedback (e.g. icon changes to a checkmark for ~2 seconds), then reverts.

**Alternatives / branches:**
- If the Clipboard API is unavailable (non-secure context or browser permission denied), the button either does not render or renders in a visually disabled state with a tooltip explaining clipboard access is unavailable.
- Revoked keys still display their prefix in the table (the table shows them with a "Revoked" badge); the copy button should be present for both active and revoked key rows — the prefix is not secret.

**User-visible outcomes:**
- The prefix string is on the user's clipboard ready to paste.
- Clear, transient confirmation that the copy happened.

---

## 5. State & Lifecycle Interactions

This feature is **state-read-only**: it reads an already-displayed UI value and writes it to the clipboard. It:
- Does not create, transition, or modify any application state (no DB writes, no server calls).
- Does not alter the `ApiKey` record or any related entity.
- Interacts only with the browser's Clipboard API (transient, client-side state).

The copy button's own local state (idle / copied) is ephemeral and resets on timeout or component unmount.

---

## 6. Rules & Decision Logic

**Rule: Prefix-only copy (reinforces R3)**
- Input: user clicks copy button in a key row.
- Output: the `keyPrefix` string (already shown in the cell) is written to the clipboard.
- The raw key is never available on this page — it is not in the component's props, not fetched from the API, and not reconstructed. The copy can only ever write `keyPrefix`.
- Deterministic.

**Rule: Graceful clipboard failure**
- Input: `navigator.clipboard.writeText()` throws or `navigator.clipboard` is undefined.
- Output: no copy occurs; optionally surface a tooltip or console warning. The button should not crash the page.
- Deterministic error handling.

**Rule: No restriction by key status**
- The copy button is rendered for both active and revoked keys, since the prefix is not a secret.
- Deterministic; no conditional logic beyond component rendering.

---

## 7. Dependencies

- **`KeysClient.tsx`** (`app/(dashboard)/keys/KeysClient.tsx`) — the existing client component where the table row for each key is rendered. The copy button must be placed inside the Key Prefix `<td>` cell, inline after the prefix text, not in a separate action column. The action column (`<td>`) retains only the `RevokeButton`.
- **Admin keys panel** (`app/(dashboard)/admin/keys/` — location TBD by Codey; see existing admin-key-panel feature) — if the admin panel renders a similar prefix cell, the same pattern should be applied consistently.
- **Browser Clipboard API** (`navigator.clipboard.writeText`) — standard Web API, available in all modern browsers under HTTPS. The portal targets Vercel (HTTPS in production); local dev is typically `localhost` (also a secure context).
- **No new npm dependencies** — the copy mechanic and transient state are implementable with `useState` + `setTimeout`, consistent with the existing component pattern in `KeysClient.tsx`.

---

## 8. Non-Functional Considerations

- **Security:** The prefix is already rendered in plaintext on the page; placing it on the clipboard introduces no additional information disclosure. Raw key is never present in this context (R2, R3).
- **Accessibility:** The copy button must have an accessible label (e.g. `aria-label="Copy key prefix"`) and must be keyboard-reachable.
- **Visual consistency:** Button styling should follow the existing Tailwind brand theme (see `.business_context/branding_notes.md`). The copy icon should be small (e.g. 14–16 px) and not disrupt the table row layout.
- **Performance:** No server round-trips; negligible performance impact.
- **Error tolerance:** Clipboard failures must not propagate as uncaught exceptions or break the page.

---

## 9. Assumptions & Open Questions

**Assumptions:**
- The `keyPrefix` value already in `ApiKeyRow` props is the correct and complete string to copy (it is the truncated display string, not the full raw key — consistent with the stated intent).
- Both the user keys page and the admin keys panel render key prefix cells that warrant the copy button. If the admin panel renders prefixes differently, Codey should apply the pattern analogously.
- A simple icon-swap feedback (idle icon → checkmark → revert after ~2 s) is sufficient; a toast notification is not required for this small action.
- The Heroicons or equivalent icon set already used in the project (or an inline SVG) is acceptable for the copy icon. No new icon library is needed.

**Open questions:**
- None blocking this feature. Icon choice is an implementation detail for Codey.

---

## 10. Impact on System Specification

This feature **reinforces** existing system assumptions:

- It is consistent with System Spec §6.2 (user sees key prefix) and §6.3 (admin sees all prefixes) — it improves the usability of data already exposed.
- It explicitly respects R3 (raw key shown only once at creation) and R2 (raw key never stored or re-exposed).
- No system spec changes are required or proposed.

---

## 11. Handover to BA (Cass)

**Story themes:**
1. As a User, I want to copy a key prefix from the keys table with one click so I can quickly reference it elsewhere.
2. As an Admin, I want the same copy affordance on the admin keys panel so I can identify keys consistently.
3. Feedback / error state: copy success confirmation and clipboard-unavailable graceful degradation.

**Expected story boundaries:**
- Stories should be scoped per actor (User / Admin) and can include an acceptance criterion around the feedback state.
- The graceful-degradation path (Clipboard API unavailable) may be a separate AC on the primary story rather than its own story.

**Areas needing careful story framing:**
- Make explicit that the copy target is the prefix string only, never the raw key — this guards against any ambiguity during implementation.
- Confirm the admin panel story references the existing admin-key-panel feature's component for consistency.

---

## 12. Change Log (Feature-Level)

| Date       | Change         | Reason                  | Raised By |
|------------|----------------|-------------------------|-----------|
| 2026-05-21 | Initial draft  | Feature commissioned    | Alex      |
| 2026-05-21 | Clarified copy button placement — must be inline in Key Prefix cell, not action column | Usability refinement: copy icon should be adjacent to the value it copies | Alex |
