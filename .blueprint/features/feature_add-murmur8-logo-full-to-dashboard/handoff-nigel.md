## Handoff Summary
**For:** Codey
**Feature:** add-murmur8-logo-full-to-dashboard

### What Was Produced

- Test spec: `test/artifacts/feature_add-murmur8-logo-full-to-dashboard/test-spec.md`
- Executable tests: `test/feature_add-murmur8-logo-full-to-dashboard.test.js`

### Pre-Implementation Run Result

```
tests 6  |  pass 1  |  fail 5
```

| Test ID | Status | Notes |
|---------|--------|-------|
| T-FL-01 | FAIL | `src="/murmur8-logo-full.svg"` not present in dashboard page |
| T-FL-02 | FAIL | Full-logo line not found (cascades from T-FL-01) |
| T-FL-03 | FAIL | Full-logo line not found (cascades from T-FL-01) |
| T-FL-04 | FAIL | Full-logo line not found (cascades from T-FL-01) |
| T-FL-05 | FAIL | Full-logo line not found (cascades from T-FL-01) |
| T-FL-06 | PASS | Compact logo already present inside `<header>` — regression guard passes |

T-FL-06 passing is correct and expected: it validates that the compact nav logo is untouched. All five full-logo tests will pass once Codey adds the hero block.

### What Codey Must Do

Single file change: `app/dashboard/page.tsx` only.

Add a full-logo hero block **between `</header>` and `<InsightsPanel`**, inside the existing content div (`<div className="mx-auto max-w-6xl px-6 py-10">`):

```tsx
<div className="flex justify-center mb-8">
  <Image
    src="/murmur8-logo-full.svg"
    alt="murmur8"
    width={200}
    height={50}
    priority
  />
</div>
```

The exact element structure is flexible as long as:
1. `src="/murmur8-logo-full.svg"` is present on an `<Image` element.
2. That line appears before `<InsightsPanel` in source order.
3. That line appears after `</header>` in source order.
4. `mx-auto` or `justify-center` appears within 5 lines of the `src=` line.
5. `priority` appears within 10 lines of the `src=` line.
6. The compact logo (`src="/murmur8-logo-compact.svg"`) remains before `</header>` — do NOT move or remove it.

### Run Tests

```
node --test test/feature_add-murmur8-logo-full-to-dashboard.test.js
```

All 6 tests must pass after implementation.
