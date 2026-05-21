---
storyId: copy-key-degradation-and-a11y
feature: copy_key
author: Cass
date: 2026-05-21
---

# Story: Copy button degrades gracefully and is accessible

**As a** User or Admin whose browser cannot access the Clipboard API,
**I want** the copy button to fail gracefully (hidden or disabled) without crashing the page,
**so that** I am not presented with a broken UI and the rest of the key management surface remains usable.

---

## Acceptance Criteria

**Given** the browser's `navigator.clipboard` is undefined or access is denied,
**When** the key table renders,
**Then** the copy button is either not rendered at all, or rendered in a visually disabled state — and the page does not throw an uncaught exception.

---

**Given** the copy button is rendered and I click it,
**When** `navigator.clipboard.writeText()` rejects (throws or returns a rejected promise),
**Then** no uncaught exception propagates and the page remains fully functional; the button may optionally surface a brief error tooltip or console warning.

---

**Given** the copy button is rendered,
**When** I inspect it,
**Then** it has an accessible label (e.g. `aria-label="Copy key prefix"`) so screen readers announce its purpose.

---

**Given** the copy button is rendered,
**When** I navigate to it using the keyboard (Tab key),
**Then** the button is focusable and activatable with Enter or Space.

---

**Given** the copy button is rendered,
**When** I view it within the table row,
**Then** it is visually compact (icon roughly 14–16 px) and does not disrupt the row layout or overflow the cell.

---

## Out of Scope

- Implementing a fallback `document.execCommand('copy')` for very old browsers (not a target environment).
- Persistent error state beyond the current render cycle.
- Any server-side reporting of clipboard failures.
