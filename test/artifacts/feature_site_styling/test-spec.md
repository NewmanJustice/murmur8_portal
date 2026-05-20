# Test Specification: site_styling

**Feature:** site_styling
**Runner:** `node --test test/feature_site_styling.test.js`
**Scope:** File existence + config content only (no browser/DOM — node:test only)

ASSUMPTION: Tests run against the working tree on disk; no build step is required.
ASSUMPTION: `postcss.config.mjs` will be created at `/workspaces/murmur8/murmur8_portal/postcss.config.mjs`.
ASSUMPTION: `tailwind.config.ts` fontFamily values will use CSS variable syntax wrapped in the array format Next.js font expects.
ASSUMPTION: Browser-level checks (computed styles, CSS payload, visual rendering) are out of scope for this test file.
ASSUMPTION: `package.json` `"type": "module"` is already set and is not tested here.

---

## Test Cases

| ID | Story AC | Description | Method | Pass Condition |
|----|----------|-------------|--------|----------------|
| T-SS-01 | site_styling-1 AC1 | `postcss.config.mjs` exists at project root | `fs.existsSync` | File found |
| T-SS-02 | site_styling-1 AC2 | File content uses ESM `export default` syntax | Read file, check string | Contains `export default` |
| T-SS-03 | site_styling-1 AC2 | File does not use `module.exports` (no CJS leak) | Read file, check string | Does NOT contain `module.exports` |
| T-SS-04 | site_styling-1 AC2 | `tailwindcss` declared in plugins object | Read file, check string | Contains `tailwindcss` |
| T-SS-05 | site_styling-1 AC2 | `autoprefixer` declared in plugins object | Read file, check string | Contains `autoprefixer` |
| T-SS-06 | site_styling-1 AC2 | Plugins are inside a `plugins` key | Read file, parse structure | Contains `plugins:` or `plugins` key |
| T-SS-07 | site_styling-2 AC1 | `tailwind.config.ts` `fontFamily.sans` contains `var(--font-inter)` | Read file, check string | Contains `var(--font-inter)` |
| T-SS-08 | site_styling-2 AC1 | `tailwind.config.ts` `fontFamily.mono` contains `var(--font-jetbrains-mono)` | Read file, check string | Contains `var(--font-jetbrains-mono)` |
| T-SS-09 | site_styling-2 AC4 | No Tailwind color tokens removed from `tailwind.config.ts` | Read file, check strings | Contains `starling-ink`, `starling-sky`, `agent` keys |
| T-SS-10 | site_styling-2 AC4 | No spacing/border config removed from `tailwind.config.ts` | Read file, check strings | Contains `borderRadius` and `boxShadow` keys |
| T-SS-11 | site_styling-2 AC1 | Bare string `"Inter"` no longer appears as the only/first font entry | Read file, check | Does NOT contain `"Inter"` as a standalone string value (i.e. the old literal name) |
| T-SS-12 | site_styling-2 AC1 | Bare string `"JetBrains Mono"` no longer appears as the only/first font entry | Read file, check | Does NOT contain `"JetBrains Mono"` as a standalone string value |

---

## Out-of-Scope (browser/DOM — deferred)

The following ACs from the stories require a browser and are NOT implemented in this test file:

- Dev server starts without PostCSS errors (site_styling-1 AC3)
- Non-empty CSS payload in network panel (site_styling-1 AC4)
- `@tailwind` directives expanded in compiled output (site_styling-1 AC5)
- Computed font family resolves to Inter/JetBrains Mono (site_styling-2 AC2, AC3)
- Visual brand rendering on sign-in, run history, run detail pages (site_styling-3, all ACs)
