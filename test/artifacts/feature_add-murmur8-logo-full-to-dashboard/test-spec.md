---
featureId: add-murmur8-logo-full-to-dashboard
storyId: story-full-logo-hero
title: Test Spec — Dashboard Full Logo Hero
author: Nigel
date: 2026-05-21
status: ready
---

# Test Spec — Dashboard Full Logo Hero

## Scope

All tests are pure file-content assertions against `app/dashboard/page.tsx`. No browser, no DOM, no build step required.

## Target File

`app/dashboard/page.tsx`

## Test Suite

Single `describe` block: **"dashboard full logo hero"**

| Test ID | AC  | What it checks | Assertion type |
|---------|-----|----------------|----------------|
| T-FL-01 | AC-1 | `<Image src="/murmur8-logo-full.svg"` exists in file | string contains |
| T-FL-02 | AC-2 | Full-logo line number < InsightsPanel line number | line order |
| T-FL-03 | AC-3 | `</header>` line < full-logo line < `<InsightsPanel` line | line order (two bounds) |
| T-FL-04 | AC-4 | `mx-auto` or `justify-center` appears within 5 lines of the full-logo Image | windowed search |
| T-FL-05 | AC-5 | `priority` attribute present on the full-logo `<Image` block | string contains |
| T-FL-06 | AC-6 | Compact logo (`/murmur8-logo-compact.svg`) present before `</header>` | line order |

## Pre-Implementation State

Before Codey implements the feature, `app/dashboard/page.tsx` contains no `<Image src="/murmur8-logo-full.svg"` line. Therefore all six tests MUST FAIL before implementation.

## Post-Implementation Expectations

After Codey adds the full-logo hero block between `</header>` and `<InsightsPanel`:
- T-FL-01 passes (src string present)
- T-FL-02 passes (logo before InsightsPanel)
- T-FL-03 passes (logo after header, before InsightsPanel)
- T-FL-04 passes (centering class within 5 lines)
- T-FL-05 passes (priority attribute present)
- T-FL-06 passes (compact logo still inside header, unchanged)

## Test Runner

```
node --test test/feature_add-murmur8-logo-full-to-dashboard.test.js
```

## Notes

- T-FL-04 uses a 5-line window: lines `[logoLine - 2 .. logoLine + 2]` (inclusive, clamped to file bounds). This accommodates both an inline wrapper div on the same or adjacent line.
- T-FL-05 reads a 10-line window around the `src="/murmur8-logo-full.svg"` occurrence to capture multi-line JSX Image tags.
- T-FL-06 asserts compact-logo line < `</header>` line; it does NOT check that the full logo is absent from the header.
