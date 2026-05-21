## Handoff Summary
**For:** Nigel
**Feature:** copy_key

### Key Decisions
- Copy target is always `keyPrefix` only — the raw key is never present on the page, so no story guards against it at runtime; it is explicitly called out as "never" in each story's out-of-scope to prevent implementation drift.
- Three stories: one per actor (User, Admin) plus one cross-cutting story for graceful degradation and accessibility.
- Success feedback (icon swap ~2 s) is the only required UI signal — no toast. Tests should assert the icon state transition.
- Clipboard API failure must not crash the page; tests should simulate `navigator.clipboard` being absent or rejecting.
- Admin story references the same component pattern as the user `/keys` page for consistency — Nigel's tests should cover both surfaces.

### Files Created
- `.blueprint/features/feature_copy_key/story-user-copy-key-prefix.md`
- `.blueprint/features/feature_copy_key/story-admin-copy-key-prefix.md`
- `.blueprint/features/feature_copy_key/story-copy-key-degradation-and-a11y.md`

### Open Questions
- None

### Critical Context
The existing `RevealModal` already uses `navigator.clipboard.writeText` (lines 51–53 of that file) — Nigel can base clipboard-mock patterns on that precedent. The copy button lives inside `KeysClient.tsx` (user page) and the admin keys panel component; tests must cover both. The `keyPrefix` value comes directly from `ApiKeyRow` props already rendered in the table — no additional fetch is needed.
