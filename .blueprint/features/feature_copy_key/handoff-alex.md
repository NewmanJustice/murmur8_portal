## Handoff Summary
**For:** Cass
**Feature:** copy_key

### Key Decisions
- Copy target is the **key prefix** string only (`keyPrefix` from `ApiKeyRow`) — never the raw key (R3 is inviolable)
- Pure client-side feature: no server changes, no new npm dependencies
- Button renders for both active and revoked key rows (prefix is not secret)
- Clipboard API failure must degrade gracefully — no page crash, button hidden or disabled
- Same copy-button pattern applies to both the user `/keys` page and the admin `/admin/keys` panel

### Files Created
- `.blueprint/features/feature_copy_key/FEATURE_SPEC.md`

### Open Questions
- None

### Critical Context
The existing `KeysClient.tsx` already renders `key.keyPrefix` in a monospace table cell (line 236).
The `RevealModal` already has a working `navigator.clipboard.writeText` pattern (line 51–53) that Codey
can replicate. Cass should keep stories explicit that the copy value is the truncated prefix — not the
full raw key — to prevent any implementation ambiguity.
