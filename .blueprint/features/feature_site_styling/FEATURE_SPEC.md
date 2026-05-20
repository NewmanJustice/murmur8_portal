# Feature Specification — site_styling

---
version: 0.1.0
date: 2026-05-20
status: draft
feature-slug: site_styling
type: infrastructure / bug-fix
---

## 1. Feature Intent

**Why this feature exists.**

- The portal renders with no visual styling: Tailwind CSS utility classes are present in JSX throughout the app but produce no output in the browser.
- Root cause: `postcss.config.js` is absent from the project root. Tailwind CSS v3 processes its directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) through PostCSS during the Next.js build pipeline. Without a PostCSS configuration file, Next.js does not invoke the Tailwind PostCSS plugin, and the CSS directives in `app/globals.css` are never expanded — resulting in a zero-byte effective stylesheet.
- This blocks user-facing quality for every feature already built: authentication pages, run history dashboard, and run detail view all render unstyled.
- This supports the system purpose by restoring the murmur8 brand design (Starling palette, Inter/JetBrains Mono typography, dark/light theme) so the portal is usable and on-brand.

> This aligns directly with the System Spec §4 (Styling: Tailwind CSS, murmur8 brand theme) and the `project-scaffold` backlog entry.

---

## 2. Scope

### In Scope

- Add a `postcss.config.js` (or `postcss.config.mjs`) at the project root, declaring `tailwindcss` and `autoprefixer` as PostCSS plugins — the minimal configuration required for Tailwind v3 with Next.js.
- Verify that `app/globals.css` is imported in `app/layout.tsx` (already present; confirm no regression).
- Verify that `tailwind.config.ts` content paths cover `./app/**/*.{ts,tsx,js,jsx,mdx}` (already correct; confirm no regression).
- Confirm that the Google Font CSS variables (`--font-inter`, `--font-jetbrains-mono`) set in `layout.tsx` are wired to the Tailwind `fontFamily` config so `font-sans` and `font-mono` classes resolve correctly. Currently `tailwind.config.ts` declares `Inter` by name rather than the CSS variable; this should be corrected to `var(--font-inter)` / `var(--font-jetbrains-mono)`.

### Out of Scope

- Adding new Tailwind utilities or brand components beyond the fix.
- Changing the Tailwind color palette or theme values (already correct in `tailwind.config.ts`).
- CSS-in-JS, CSS Modules, or any alternative styling approach.
- Adding new pages or modifying existing page markup.
- Any deployment environment configuration (Vercel, CI).

---

## 3. Actors Involved

**Developer (indirect)**
- The fix is infrastructure-only; no user-visible actor interaction is introduced.
- The developer who adds `postcss.config.js` and corrects the font wiring is the sole actor.

**All authenticated users (beneficiary)**
- Once fixed, every page a User or Admin visits will render with intended styling.

---

## 4. Behaviour Overview

**What the feature does, conceptually.**

- Happy path: After the fix, the Next.js build pipeline processes `globals.css` via PostCSS → Tailwind, generating utility CSS. Every page that uses Tailwind classes (`bg-starling-ink`, `text-starling-sky`, `font-sans`, etc.) renders with correct visual styling.
- No new user-observable flows are introduced. The change is entirely in build tooling.
- Secondary fix: `font-sans` and `font-mono` classes will correctly resolve to the Google Fonts loaded in `layout.tsx` rather than falling back to system defaults.

---

## 5. State & Lifecycle Interactions

This feature is **state-constraining** on the build pipeline, not on domain data.

- No database state is created, modified, or read.
- No session or auth state is affected.
- Build output state: changes from "no Tailwind CSS generated" to "full Tailwind CSS generated".

---

## 6. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| **RS1** | `postcss.config.js` must declare `tailwindcss` and `autoprefixer` as plugins. These are already installed as devDependencies (`tailwindcss ^3.4.0`, `autoprefixer ^10.4.0`). |
| **RS2** | The PostCSS config file must be CommonJS (`module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`) or ESM (`export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`). Given `package.json` sets `"type": "module"`, an ESM-compatible format or `.cjs` extension should be used to avoid module-type conflicts. |
| **RS3** | Font family values in `tailwind.config.ts` must reference CSS variable tokens (`var(--font-inter)`, `var(--font-jetbrains-mono)`) to match the variables set by `next/font/google` in `layout.tsx`. |
| **RS4** | `globals.css` must remain the first import in `app/layout.tsx` (already the case). |

**Decision note on RS2:** Next.js with `"type": "module"` in `package.json` requires PostCSS config to be either named `postcss.config.cjs` or to use `postcss.config.mjs`. The safest and most conventional approach for Next.js 15 is `postcss.config.mjs` with an ESM default export.

---

## 7. Dependencies

- **`tailwindcss ^3.4.0`** — already installed in `devDependencies`.
- **`autoprefixer ^10.4.0`** — already installed in `devDependencies`.
- **`postcss ^8.4.0`** — already installed in `devDependencies`.
- **`next ^15.3.9`** — build pipeline that invokes PostCSS.
- **`app/globals.css`** — already contains correct `@tailwind` directives; no changes needed.
- **`tailwind.config.ts`** — already has correct content paths and brand theme; minor font-family fix needed.
- **`app/layout.tsx`** — already imports `globals.css` and sets font CSS variables; no structural changes needed.

---

## 8. Non-Functional Considerations

- **Build performance**: PostCSS/Tailwind processing adds negligible build time; this is standard for all Next.js + Tailwind projects.
- **Zero risk of breaking existing markup**: the fix enables CSS that was already written but inert. All existing class names were authored against the `tailwind.config.ts` theme already present.
- **No security implications**.
- **Audit**: The change is a two-file diff (new `postcss.config.mjs`, minor edit to `tailwind.config.ts`). Easily reviewable.

---

## 9. Assumptions & Open Questions

| # | Item | Status |
|---|------|--------|
| A1 | `tailwindcss`, `autoprefixer`, and `postcss` are already installed — confirmed in `package.json` `devDependencies`. | Confirmed |
| A2 | `globals.css` is imported in `layout.tsx` — confirmed at line 3. | Confirmed |
| A3 | Content paths in `tailwind.config.ts` cover all JSX/TSX files in `app/` and `components/` — confirmed. | Confirmed |
| A4 | No other PostCSS config exists (e.g., inside `next.config.js`) — `next.config.*` is absent from the project root; PostCSS plugin wiring is not present elsewhere. | Confirmed |
| OQ1 | Should `postcss.config.mjs` (ESM) or `postcss.config.cjs` (CommonJS) be used? Given `"type": "module"` in `package.json`, `postcss.config.mjs` is preferred. Next.js 15 supports this. | Recommend `.mjs` |

---

## 10. Impact on System Specification

- **Reinforces**: System Spec §4 names Tailwind CSS as the styling layer. This fix delivers what was always specified but never functional.
- **No contradictions** introduced.
- **No system spec change required**.

---

## 11. Handover to BA (Cass)

This is a pure infrastructure/bug-fix feature. Story boundaries are narrow:

- **Story 1**: As a developer, I can run the dev server and see Tailwind utility classes applied — PostCSS config is present and correct.
- **Story 2**: As a developer, `font-sans` and `font-mono` Tailwind classes resolve to the correct Google Fonts (Inter and JetBrains Mono) loaded in layout.
- **Story 3** (acceptance): As any authenticated user, all existing pages render with the murmur8 brand styling (correct colors, typography, spacing).

Stories require no UI changes — only build-tooling verification. Test approach: visual diff or snapshot of a known page before and after the fix.

---

## 12. Change Log (Feature-Level)

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-20 | Initial spec created | Tailwind CSS rendering broken due to missing PostCSS config | Alex |
