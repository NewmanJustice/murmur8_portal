## Handoff Summary
**For:** Codey
**Feature:** site_styling
**From:** Nigel

### Test Spec Written
- File: `test/artifacts/feature_site_styling/test-spec.md`
- 12 test cases planned (T-SS-01 through T-SS-12)
- Target test file: `test/feature_site_styling.test.js`
- Runner: `node --test test/feature_site_styling.test.js`

### AC Coverage
- site_styling-1 (PostCSS config): 6 tests — file existence, ESM export, no CJS, plugin list
- site_styling-2 (font CSS variables): 6 tests — `var(--font-inter)`, `var(--font-jetbrains-mono)`, theme keys preserved
- site_styling-3 (brand renders): 0 tests — all ACs require browser; fully out of scope for node:test

Coverage: 12/12 node-testable ACs covered. 8 browser ACs explicitly deferred.

### Key Assumptions
1. ASSUMPTION: `postcss.config.mjs` will be created at the project root.
2. ASSUMPTION: Font variables use `var(--font-inter)` / `var(--font-jetbrains-mono)` literal strings in `tailwind.config.ts`.
3. ASSUMPTION: All existing color/spacing theme keys in `tailwind.config.ts` are preserved after the font fix.
4. ASSUMPTION: Tests run directly against source files on disk — no build step needed.
5. ASSUMPTION: `package.json` already has `"type": "module"`; not tested.

### What Codey Must Implement
1. Create `postcss.config.mjs` at project root — ESM default export with `tailwindcss` and `autoprefixer` in `plugins`.
2. Update `tailwind.config.ts` `fontFamily.sans` first entry to `var(--font-inter)`.
3. Update `tailwind.config.ts` `fontFamily.mono` first entry to `var(--font-jetbrains-mono)`.
4. Preserve all other theme keys (colors, borderRadius, boxShadow, backgroundImage).
5. Write `test/feature_site_styling.test.js` matching the 12 test cases in the spec.
