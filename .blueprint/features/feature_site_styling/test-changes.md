# Test Changes — site_styling refinement

Appended tests T-SS-13 through T-SS-17 to `test/feature_site_styling.test.js` in a new
`describe('logo and favicon wiring', ...)` block at the bottom of the file.
Tests T-SS-01 through T-SS-12 are unchanged.

## New tests

### T-SS-13 — favicon.svg in app/layout.tsx metadata (RS5)
Reads `app/layout.tsx` and asserts the string `'favicon.svg'` is present.  
**Why:** RS5 requires the root layout to declare the project favicon via Next.js metadata.
Without this test there was no automated check that the favicon reference was actually wired
in rather than left as the Next.js default.

### T-SS-14 — murmur8-logo-full.svg on login page (RS6)
Reads `app/page.tsx` and asserts both `'murmur8-logo-full.svg'` and `'Image'` are present.  
**Why:** RS6 requires the login/landing page to render the full-width brand logo using the
Next.js `Image` component (for optimised delivery). Two assertions are needed: one for the
asset path and one confirming the component import so a plain `<img>` tag cannot satisfy the
test.

### T-SS-15 — murmur8-logo-compact.svg on dashboard page (RS7)
Reads `app/dashboard/page.tsx` and asserts `'murmur8-logo-compact.svg'` is present.  
**Why:** RS7 requires every authenticated page header to display the compact logo. The
dashboard root page is the primary authenticated view and must carry the compact logo.

### T-SS-16 — murmur8-logo-compact.svg on run-detail page (RS8)
Reads `app/dashboard/runs/[id]/page.tsx` and asserts `'murmur8-logo-compact.svg'` is present.  
**Why:** RS8 extends the same header requirement to the nested run-detail route. Without a
dedicated test this page could silently regress to a logo-less header.

### T-SS-17 — header element + murmur8-logo-compact.svg on admin keys page (RS9)
Reads `app/admin/keys/page.tsx` and asserts both `'<header'` and `'murmur8-logo-compact.svg'`
are present.  
**Why:** RS9 requires the admin panel to have a proper `<header>` structure (not just an
inline div) as well as the compact logo. Two assertions enforce both the structural and visual
requirements independently.

## Test style notes

All five tests follow the same pattern as T-SS-01 through T-SS-12:
- `import { describe, it } from 'node:test'`
- `import assert from 'node:assert/strict'`
- File paths via `path.join(projectRoot, '...')`
- Descriptive failure messages that echo the file content on failure
- Pure `fs.readFileSync` — no browser, no DOM, no build step
