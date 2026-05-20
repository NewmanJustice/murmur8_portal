# Story: PostCSS Configuration Present and Correct

**ID:** site_styling-1
**Slug:** postcss-config

## User Story

As a developer,
I want a `postcss.config.mjs` file present at the project root with `tailwindcss` and `autoprefixer` declared as plugins,
so that the Next.js build pipeline processes Tailwind directives and generates CSS utility classes.

## Acceptance Criteria

**Given** the project root has no `postcss.config.mjs` (or `.cjs` / `.js`) file,
**When** I create `postcss.config.mjs` with an ESM default export declaring `tailwindcss` and `autoprefixer` plugins,
**Then** `postcss.config.mjs` exists at the project root.

**Given** `package.json` sets `"type": "module"`,
**When** Next.js loads the PostCSS configuration,
**Then** the file uses an ESM default export (`export default { plugins: { ... } }`) so there is no module-type conflict.

**Given** `postcss.config.mjs` is in place,
**When** I run `npm run dev` (or `npm run build`),
**Then** the dev server starts without PostCSS-related errors in the console.

**Given** `postcss.config.mjs` is in place,
**When** I open any page in the browser,
**Then** the browser DevTools network panel shows a non-empty CSS payload (i.e. utility classes such as `bg-starling-ink` are present in the downloaded stylesheet).

**Given** `globals.css` already contains `@tailwind base`, `@tailwind components`, and `@tailwind utilities`,
**When** Tailwind is processed via the new PostCSS config,
**Then** those directives are expanded to real CSS rules and no `@tailwind` directive literals appear in the compiled output.

## Out of Scope

- Adding new Tailwind utility classes or modifying `globals.css` content.
- Changing any PostCSS plugin beyond `tailwindcss` and `autoprefixer`.
- Modifying `next.config.*` or any deployment configuration.
