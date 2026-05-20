## Handoff Summary
**For:** Nigel
**Feature:** site_styling

### Stories Written (3)

| File | Slug | What it covers |
|------|------|---------------|
| `story-postcss-config.md` | postcss-config | `postcss.config.mjs` exists, uses ESM export, dev server starts clean, non-empty CSS payload delivered to browser |
| `story-font-css-variables.md` | font-css-variables | `tailwind.config.ts` uses `var(--font-inter)` / `var(--font-jetbrains-mono)`; computed browser styles confirm Inter and JetBrains Mono resolve |
| `story-brand-styling-renders.md` | brand-styling-renders | Sign-in, Run History, and Run Detail pages visually apply brand colours and typography; DOM structure unchanged |

### Key Notes for Nigel

- **Two-file fix only**: create `postcss.config.mjs` at project root; update `fontFamily` values in `tailwind.config.ts`.
- No new UI, no DB, no auth changes — tests are purely build-output and visual/DOM verification.
- Recommended test approach: assert the compiled CSS output contains expected class rules (unit), plus a headed browser check (e2e/smoke) to confirm computed styles on a known element.
- All existing markup and class names are correct — tests should not require any page changes.
- `globals.css` import in `layout.tsx` and Tailwind content paths are already correct; regressions on these are low risk but worth a smoke check.
