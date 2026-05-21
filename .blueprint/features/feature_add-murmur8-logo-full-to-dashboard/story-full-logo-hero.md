---
storyId: story-full-logo-hero
featureId: add-murmur8-logo-full-to-dashboard
title: Authenticated user sees full murmur8 logo above the Insights Panel
status: draft
author: Cass
date: 2026-05-21
---

# Story — Full Logo Hero on Dashboard

## User Story

**As** an authenticated user visiting the dashboard,
**I want** to see the full murmur8 logo prominently displayed above the Insights Panel,
**So that** I have a clear brand moment before I engage with my metrics.

---

## Acceptance Criteria

### AC-1 — Full logo image is rendered using Next.js Image component

**Given** the source file `app/dashboard/page.tsx`,
**Then** it must contain a `<Image` element (imported from `next/image`) whose `src` prop is exactly `"/murmur8-logo-full.svg"`.

> Assertion: `grep '<Image' app/dashboard/page.tsx` matches a line containing `src="/murmur8-logo-full.svg"`.

---

### AC-2 — Logo is placed in source order above InsightsPanel

**Given** the source file `app/dashboard/page.tsx`,
**Then** the `src="/murmur8-logo-full.svg"` text must appear at an earlier line number than the first occurrence of `<InsightsPanel`.

> Assertion: `line_number(src="/murmur8-logo-full.svg") < line_number(<InsightsPanel)`.

---

### AC-3 — Logo is inside the content div, not the header

**Given** the source file `app/dashboard/page.tsx`,
**Then** the `src="/murmur8-logo-full.svg"` Image element must appear after the closing `</header>` tag and inside the `<div className="mx-auto max-w-6xl px-6 py-10">` content wrapper.

> Assertion: `line_number(</header>) < line_number(src="/murmur8-logo-full.svg") < line_number(<InsightsPanel)`.

---

### AC-4 — Logo is horizontally centred

**Given** the source file `app/dashboard/page.tsx`,
**Then** the logo Image element (or its direct wrapper element) must carry a centering class — either `mx-auto` or a Flexbox/Grid centering class such as `flex justify-center`.

> Assertion: within 5 lines of `src="/murmur8-logo-full.svg"`, the text `mx-auto` or `justify-center` appears.

---

### AC-5 — Logo uses priority loading

**Given** the source file `app/dashboard/page.tsx`,
**Then** the `<Image>` with `src="/murmur8-logo-full.svg"` must include the `priority` attribute (boolean or `priority={true}`).

> Assertion: the same `<Image` block containing `src="/murmur8-logo-full.svg"` also contains `priority`.

---

### AC-6 — Compact nav logo is retained unchanged

**Given** the source file `app/dashboard/page.tsx`,
**Then** it must still contain an `<Image` element with `src="/murmur8-logo-compact.svg"` inside the `<header>` block.

> Assertion: `grep 'src="/murmur8-logo-compact.svg"'` returns a match, and that line appears before `</header>`.

---

## Out-of-Scope Reminders

- No changes to `InsightsPanel` or its props.
- No other pages (`/dashboard/runs`, `/keys`, `/admin/keys`) are touched.
- No text, taglines, or additional content alongside the logo.

---

## Notes for Nigel

- All AC are file-content assertions against `app/dashboard/page.tsx` — no browser rendering required.
- AC-3 gives the exact div `className` string to anchor the location check.
- Sizing (width 180–220 px) is suggested in the spec but intentionally omitted from AC because exact pixel values are implementation detail; centering and placement are the observable contracts.
