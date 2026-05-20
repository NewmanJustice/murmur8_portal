## Handoff Summary
**For:** Cass
**Feature:** site_styling

### Key Decisions
- **Root cause confirmed**: `postcss.config.js` / `postcss.config.mjs` is missing from the project root. Tailwind v3 requires PostCSS to process `@tailwind` directives; without it, zero CSS is generated.
- **Fix 1 (primary)**: Create `postcss.config.mjs` declaring `tailwindcss` and `autoprefixer` plugins. Both packages are already installed in `devDependencies`.
- **Fix 2 (secondary)**: `tailwind.config.ts` declares font families by name (`"Inter"`) rather than CSS variable (`var(--font-inter)`); this must be corrected so `font-sans` / `font-mono` classes resolve to the Google Fonts loaded in `layout.tsx`.
- `globals.css` import in `layout.tsx` and content paths in `tailwind.config.ts` are both correct — no changes needed there.
- ESM format (`.mjs`) is required because `package.json` sets `"type": "module"`.

### Files Created
- `.blueprint/features/feature_site_styling/FEATURE_SPEC.md`

### Open Questions
- None — root cause and fix are unambiguous.

### Critical Context
Two files need to change: (1) create `postcss.config.mjs` at project root; (2) update font family values in `tailwind.config.ts` to use CSS variables. All existing markup and class names are correct — only tooling is broken. Stories should verify that existing pages render with intended styling after the fix, not introduce new UI. No database or auth dependencies.
