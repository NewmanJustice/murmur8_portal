# Story: All Existing Pages Render with murmur8 Brand Styling

**ID:** site_styling-3
**Slug:** brand-styling-renders

## User Story

As an authenticated user,
I want all existing portal pages to display the murmur8 brand styling (Starling colour palette, Inter/JetBrains Mono typography, correct spacing and layout),
so that the portal is visually coherent and on-brand rather than appearing as unstyled HTML.

## Acceptance Criteria

**Given** the PostCSS config and font variable fixes are applied,
**When** I visit the sign-in page,
**Then** the page background uses the `starling-ink` dark colour (not a plain white/default browser background) and text appears in the Inter typeface.

**Given** the fixes are applied and I am authenticated,
**When** I visit the Run History dashboard,
**Then** Tailwind utility classes on list items, badges, and filter controls are visually applied (e.g. background colours, rounded corners, and correct spacing are visible; elements do not appear as unstyled inline text).

**Given** the fixes are applied and I navigate to any run detail page,
**When** the page renders,
**Then** stage breakdown cards and header elements display with the brand colour tokens (e.g. `text-starling-sky`, `bg-starling-ink`) rather than default browser colours.

**Given** the fixes are applied,
**When** I inspect any page in browser DevTools,
**Then** the computed stylesheet contains generated Tailwind utility rules (e.g. `.bg-starling-ink`, `.font-sans`) and those rules are applied to matching elements.

**Given** the fixes are applied,
**When** I toggle between light and dark theme (if the theme toggle is present),
**Then** both modes render with appropriate brand colours rather than unstyled defaults.

**Given** no page markup has been changed as part of this fix,
**When** all pages load,
**Then** the DOM structure and existing class names are identical to those before the fix — only the visual appearance changes.

**Given** the fixes are applied,
**When** I visit the API Keys page (`/keys`) or the Admin Keys page (`/admin/keys`),
**Then** the page uses the light theme — `bg-starling-cloud` background, white card surfaces, and a light nav header (`bg-white/80 backdrop-blur` with `border-starling-cyan/30` border) — matching the dashboard, not a dark theme.

## Out of Scope

- Introducing new pages or UI components.
- Altering the Tailwind theme colour palette or spacing scale.
- Fixing visual bugs in specific components beyond those directly caused by the absent PostCSS config.
- Accessibility or responsive-design testing beyond confirming styles apply.
