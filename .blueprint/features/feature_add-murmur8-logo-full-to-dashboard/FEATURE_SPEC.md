---
featureId: add-murmur8-logo-full-to-dashboard
title: Add Full Logo Hero to Dashboard
status: draft
date: 2026-05-21
author: Alex
---

# Feature Specification — Add Full Logo Hero to Dashboard

## 1. Feature Intent

The dashboard (`/dashboard`) currently shows the compact logo in the nav header only. The full logo SVG (`/murmur8-logo-full.svg`) exists in `/public/` and is used on the login page, but does not appear anywhere on the authenticated dashboard experience.

Adding the full logo as a hero above the Insights Panel gives the dashboard a polished, on-brand landing moment — the first thing an authenticated user sees is a clear brand identity before the metrics content begins. The compact logo in the nav is retained.

---

## 2. Scope

### In Scope

- Add a centred `<Image src="/murmur8-logo-full.svg" alt="murmur8" ... />` hero element at the top of the dashboard content area (`<div className="mx-auto max-w-6xl px-6 py-10">`), above the `<InsightsPanel>` component.
- The logo should be horizontally centred, with appropriate sizing (suggested: width 180–220px, proportional height).
- No other pages are changed — this is dashboard (`/dashboard`) only.

### Out of Scope

- Changing the compact logo in the nav header.
- Adding the full logo to `/dashboard/runs`, `/keys`, or `/admin/keys`.
- Any changes to the InsightsPanel or its data.
- Adding text, taglines, or other content alongside the logo.

---

## 3. Actors Involved

**User / Admin (authenticated)**
- Sees the full logo hero when visiting `/dashboard`.

---

## 4. Behaviour Overview

When an authenticated user visits `/dashboard`, the content area renders:
1. Full logo hero (centred, above InsightsPanel)
2. InsightsPanel (unchanged)

---

## 5. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| **RL-1** | Full logo is placed inside the content `<div>` above `<InsightsPanel>`, not inside the `<header>`. |
| **RL-2** | The logo must use Next.js `<Image>` component, not a bare `<img>`. |
| **RL-3** | The compact logo in the `<header>` nav is retained unchanged. |
| **RL-4** | The logo must be horizontally centred (e.g. `flex justify-center` wrapper or `mx-auto`). |

---

## 6. Dependencies

- `public/murmur8-logo-full.svg` — already present.
- `next/image` — already imported in `app/dashboard/page.tsx`.

---

## 7. Non-Functional Considerations

- **Performance**: SVG loaded via Next.js `<Image>` with `priority` since it is above the fold.
- **Visual consistency**: Sizing should feel proportional to the Insights Panel cards beneath it.

---

## 8. Change Log

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-21 | Initial spec | Add full logo hero to dashboard content area | Steve Newman |
