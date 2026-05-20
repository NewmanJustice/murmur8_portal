## Summary

This feature fixes two gaps in the styling pipeline: a missing `postcss.config.mjs` (causing Tailwind CSS to silently not compile in ESM mode) and bare string font names in `tailwind.config.ts` that should be Next.js CSS variable references. Both files already exist or need to be created at the project root; no new dependencies are required since `tailwindcss`, `autoprefixer`, and `postcss` are already installed.

## Steps

1. [postcss.config.mjs] CREATE — ESM default export with `tailwindcss` and `autoprefixer` in `plugins` key | Tests: T-SS-01, T-SS-02, T-SS-03, T-SS-04, T-SS-05, T-SS-06
2. [tailwind.config.ts] EDIT — Replace `"Inter"` with `var(--font-inter)` as first entry of `fontFamily.sans`, preserving all other entries | Tests: T-SS-07, T-SS-11
3. [tailwind.config.ts] EDIT — Replace `"JetBrains Mono"` with `var(--font-jetbrains-mono)` as first entry of `fontFamily.mono`, preserving all other entries | Tests: T-SS-08, T-SS-12
4. [tailwind.config.ts] VERIFY (read-only check) — Confirm `starling-ink`, `starling-sky`, `agent`, `borderRadius`, `boxShadow` keys are intact after edits | Tests: T-SS-09, T-SS-10

## Risks

- T-SS-11 / T-SS-12 use a bare `content.includes('"Inter"')` check — the variable CSS value `var(--font-inter)` must NOT contain the literal string `"Inter"` anywhere in the file; ensure no comment or fallback re-introduces it.
- `globals.css` already has `@tailwind` directives and CSS variable declarations; no changes needed there, but the font CSS variables (`--font-inter`, `--font-jetbrains-mono`) are NOT yet declared in `globals.css` or `app/layout.tsx` — that is a runtime concern (browser ACs, deferred) and is out of scope for the node:test suite.
