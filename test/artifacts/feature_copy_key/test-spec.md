---
feature: copy_key
author: Nigel
date: 2026-05-21
---

# Test Specification — Copy Key Prefix

## Understanding

The feature adds a per-row copy icon button to two surfaces: `KeysClient.tsx` (user `/keys` page)
and `AdminKeysClient.tsx` (admin `/admin/keys` panel). Clicking it writes the row's `keyPrefix`
to the clipboard via `navigator.clipboard.writeText`. On success the icon swaps to a checkmark for
~2 s then reverts. The button must never expose the full raw key. Copy buttons must be present for
revoked rows too. If the Clipboard API is unavailable or rejects, the page must not throw.
The button must carry `aria-label="Copy key prefix"` and be keyboard-focusable.

Tests use `node --test` and read TSX source files from disk via `fs.readFileSync`. No DOM, no
React, no JSDOM required.

## AC → Test ID Mapping

| Story | AC | Test ID | Description |
|---|---|---|---|
| user-copy-key-prefix | AC1 (copy button in row) | T-CK-01 | `KeysClient.tsx` contains a copy button element per row |
| user-copy-key-prefix | AC2 (writes keyPrefix) | T-CK-02 | `KeysClient.tsx` calls `navigator.clipboard.writeText` with `keyPrefix` |
| user-copy-key-prefix | AC3 (icon swap on success) | T-CK-03 | `KeysClient.tsx` references a success/checkmark state after clipboard write |
| user-copy-key-prefix | AC4 (revoked row still has button) | T-CK-04 | `KeysClient.tsx` copy button not gated behind a revoked check |
| user-copy-key-prefix | AC5 (only keyPrefix, not raw key) | T-CK-05 | `KeysClient.tsx` copy path references `keyPrefix`, not `rawKey` |
| admin-copy-key-prefix | AC1 (copy button in admin row) | T-CK-06 | `AdminKeysClient.tsx` contains a copy button element per row |
| admin-copy-key-prefix | AC2 (writes keyPrefix) | T-CK-07 | `AdminKeysClient.tsx` calls `navigator.clipboard.writeText` with `keyPrefix` |
| admin-copy-key-prefix | AC3 (icon swap on success) | T-CK-08 | `AdminKeysClient.tsx` references a success/checkmark state after clipboard write |
| admin-copy-key-prefix | AC4 (revoked row still has button) | T-CK-09 | `AdminKeysClient.tsx` copy button not gated by `revokedAt` check |
| admin-copy-key-prefix | AC5 (only keyPrefix) | T-CK-10 | `AdminKeysClient.tsx` copy path references `keyPrefix`, not `rawKey` |
| degradation-and-a11y | AC1 (no crash when clipboard absent) | T-CK-11 | Copy handler guards against missing `navigator.clipboard` (optional chain or try/catch) |
| degradation-and-a11y | AC2 (no crash on rejection) | T-CK-12 | Copy handler uses `.catch` or `try/catch` around `writeText` |
| degradation-and-a11y | AC3 (aria-label) | T-CK-13 | Copy button has `aria-label` referencing "Copy key prefix" |
| degradation-and-a11y | AC4 (keyboard focusable) | T-CK-14 | Copy button is a `<button>` element (keyboard-accessible by default) |
| degradation-and-a11y | AC5 (compact icon size) | T-CK-15 | Copy button has small icon sizing class (e.g. `h-4 w-4` or `14`/`16`) |

## Key Assumptions

- Both TSX files will contain a `CopyButton` component (or inline copy logic) that can be detected via string search.
- `navigator.clipboard` guard detected by presence of optional chaining (`?.`) or `try/catch` around the `writeText` call in source.
- Icon-swap state detected by presence of a conditional rendering or state variable toggling between copy and check icons in the same component.
- Revoked-row copy button not gated: assertion checks that copy button JSX is NOT wrapped in the same `!key.revokedAt` condition used for the revoke button.
- Tests assert on both `KeysClient.tsx` and `AdminKeysClient.tsx` independently (same AC pattern, two surfaces).
