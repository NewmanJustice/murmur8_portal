## Handoff Summary
**For:** Codey
**Feature:** copy_key

### Key Decisions
- Tests use `node --test` with `fs.readFileSync` to assert on TSX source text — no DOM/JSDOM.
- 15 tests across two source files: `KeysClient.tsx` (T-CK-01–05) and `AdminKeysClient.tsx` (T-CK-06–10), plus shared degradation/a11y checks (T-CK-11–15) that assert on both files.
- Clipboard guard detection: check for optional chaining (`navigator.clipboard?.writeText`) or `try/catch` wrapping `writeText` in each component.
- Icon-swap detection: check that the copy button area contains a conditional toggling between two states (copy icon vs. checkmark) driven by a state variable.
- Revoked-row check: assert the copy button is NOT inside the same `!key.revokedAt` block as the existing revoke button.

### Files to Create
- `test/artifacts/feature_copy_key/test-spec.md` (written)
- `test/feature_copy_key.test.js` (next step)

### Test Structure
- `describe('T-CK-01–05: KeysClient user copy button')` — 5 tests
- `describe('T-CK-06–10: AdminKeysClient admin copy button')` — 5 tests
- `describe('T-CK-11–15: Degradation and accessibility')` — 5 tests
- Total: 15 tests

### Open Questions
- None

### Critical Context
Copy button does not exist yet in either component — Codey must add it. The `keyPrefix` field
is already present on `ApiKeyRow` and `AdminKeyRow` interfaces. The `RevealModal` in
`KeysClient.tsx` already has a `navigator.clipboard.writeText` pattern to follow. The copy
button must be present for revoked rows (unlike the revoke button which is hidden for revoked
rows). Target source files: `app/(dashboard)/keys/KeysClient.tsx` and
`app/admin/keys/AdminKeysClient.tsx`.
