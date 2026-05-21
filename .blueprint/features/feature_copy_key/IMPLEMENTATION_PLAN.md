## Summary

Add a `CopyButton` sub-component to both `KeysClient.tsx` and `AdminKeysClient.tsx` that writes the row's `keyPrefix` to the clipboard via `navigator.clipboard?.writeText`, swaps to a checkmark icon for ~2 s, handles errors gracefully, and is rendered outside any `revokedAt` gate so revoked rows retain the button.

## Steps

1. [app/(dashboard)/keys/KeysClient.tsx] ADD — define `CopyButton` component above `RevokeButton`: accepts `keyPrefix: string`, has `copied` state, calls `navigator.clipboard?.writeText(keyPrefix).then(() => setCopied(true)).catch(() => {})`, renders a `<button aria-label="Copy key prefix">` containing copy/check icon with `h-4 w-4` sizing, reverts state after 2 s | Tests: T-CK-01, T-CK-02, T-CK-03, T-CK-05, T-CK-11, T-CK-12, T-CK-13, T-CK-14, T-CK-15
2. [app/(dashboard)/keys/KeysClient.tsx] EDIT — add `<CopyButton keyPrefix={key.keyPrefix} />` to each row's action cell, placed before (or alongside) the existing `{!key.revokedAt && <RevokeButton .../>}` block so it is always rendered | Tests: T-CK-04
3. [app/admin/keys/AdminKeysClient.tsx] ADD — define `CopyButton` component (same shape as step 1) above `AdminRevokeButton`: `navigator.clipboard?.writeText(keyPrefix)`, `setCopied(true)`, `.catch(() => {})`, `aria-label="Copy key prefix"`, `h-4 w-4` icon | Tests: T-CK-06, T-CK-07, T-CK-08, T-CK-10, T-CK-11, T-CK-12, T-CK-13, T-CK-14, T-CK-15
4. [app/admin/keys/AdminKeysClient.tsx] EDIT — add `<CopyButton keyPrefix={key.keyPrefix} />` to each row's action cell outside the `{!key.revokedAt && <AdminRevokeButton .../>}` conditional | Tests: T-CK-09

## Risks

- T-CK-03 inspects source text from the index of the first `CopyButton` occurrence and looks for `setCopied(true)` / `setSuccess(true)` / `setChecked(true)` after that point — the state setter name must be one of those exact strings.
- T-CK-04/T-CK-09 use a regex that checks for `{!key.revokedAt && ... <CopyButton` within ~200 characters; place `<CopyButton>` outside that block entirely, not just after it on the same line.
- T-CK-05/T-CK-10 regex-match `navigator.clipboard.writeText(...)` and assert the captured argument does not include `rawKey` — use `keyPrefix` directly as the argument with no concatenation involving `rawKey`.
