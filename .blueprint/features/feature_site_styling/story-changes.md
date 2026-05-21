# Story Change Summary — site_styling refinement (2026-05-20)

## Context

The styling fix (PostCSS config, font CSS variables) is complete. A follow-up refinement
wires the SVG brand assets in `/public/` to the application — favicon, full logo on the
login page, compact logo in nav headers, and a proper nav bar on admin/keys.

These are infrastructure changes (no new design decisions). The affected story and the
rationale for each is listed below.

---

## Stories affected

### story-brand-styling-renders.md — NEEDS UPDATED ACCEPTANCE CRITERIA

The existing acceptance criteria cover general Tailwind rendering (colors, typography,
spacing). They must be extended to include:

1. **Favicon** — browser tab for any page displays the murmur8 SVG icon (not a generic
   browser default). Corresponds to RS5 (`icons: { icon: '/favicon.svg' }` in layout
   Metadata).

2. **Login page logo** — the login page (`app/page.tsx`) renders the full murmur8 logo
   SVG (`/murmur8-logo-full.svg`) via Next.js `<Image>`, replacing the plain text pill.
   Corresponds to RS6.

3. **Dashboard nav logo** — the dashboard page (`app/dashboard/page.tsx`) renders the
   compact murmur8 logo SVG (`/murmur8-logo-compact.svg`) in its nav header. Corresponds
   to RS7.

4. **Run-detail nav logo** — the run detail page (`app/dashboard/runs/[id]/page.tsx`)
   renders the compact murmur8 logo SVG in its nav header. Corresponds to RS8.

5. **Admin/keys nav bar** — the admin/keys page (`app/admin/keys/page.tsx`) has a
   `<header>` nav bar above the page content, styled with the dark page theme, containing
   the compact murmur8 logo SVG. Corresponds to RS9.

**Implementation constraint for all logo placements:** must use Next.js `<Image>`
component, not a bare `<img>` tag.

---

## Stories NOT affected

### story-postcss-config.md — unaffected

Covers the PostCSS config file addition only. The logo/favicon wiring changes do not
touch the PostCSS pipeline or build tooling.

### story-font-css-variables.md — unaffected

Covers the Tailwind font-family CSS variable wiring only. No overlap with logo/favicon
placement.

---

## Summary table

| Story file | Status |
|------------|--------|
| story-brand-styling-renders.md | Update acceptance criteria (items 1–5 above) |
| story-postcss-config.md | No change needed |
| story-font-css-variables.md | No change needed |

---

# Story Changes — site_styling refinement 2026-05-21

## Summary

Keys pages must use the light theme matching the dashboard, not the dark `bg-starling-night` theme.

## Stories affected

### story-brand-styling-renders.md (site_styling-3)

**Reason:** New acceptance criterion added — the API Keys page (`/keys`) and Admin Keys page (`/admin/keys`) must render with the light Starling Cloud theme (matching the dashboard), not the dark night theme.

**Change:** Added AC: "Given the fixes are applied, When I visit `/keys` or `/admin/keys`, Then the page uses the light theme — `bg-starling-cloud` background, white card surfaces, light nav header."

## Stories NOT affected

- `story-postcss-config.md` — no change
- `story-font-css-variables.md` — no change
