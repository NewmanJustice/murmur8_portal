# Test Changes — copy_key refinement 2026-05-21

## Summary

Added T-CK-16 to assert the CopyButton is placed within the key prefix cell, not in a separate action cell.

## Tests added

### T-CK-16 (new)
**Describe block:** `copy button placement`
**Assertion:** `CopyButton` appears within 150 characters of `key.keyPrefix` in both `KeysClient.tsx` and `AdminKeysClient.tsx` JSX, confirming it is rendered inside the key prefix cell.
**Fails before fix:** Yes (button is currently in action cell)
**Passes after fix:** Yes

## Tests NOT changed

T-CK-01 through T-CK-15 — unaffected. The revokedAt gate checks (T-CK-04, T-CK-09) remain valid since the button must still be unconditional regardless of placement.
