# Story: Font Classes Resolve to Google Fonts via CSS Variables

**ID:** site_styling-2
**Slug:** font-css-variables

## User Story

As a developer,
I want `tailwind.config.ts` to reference `var(--font-inter)` and `var(--font-jetbrains-mono)` for the `fontFamily` values,
so that `font-sans` and `font-mono` Tailwind classes resolve to the Google Fonts loaded in `app/layout.tsx` rather than system defaults.

## Acceptance Criteria

**Given** `tailwind.config.ts` currently declares font families by string name (e.g. `"Inter"`),
**When** I update the `fontFamily` entries to use CSS variable references,
**Then** `theme.extend.fontFamily.sans` contains `var(--font-inter)` and `theme.extend.fontFamily.mono` contains `var(--font-jetbrains-mono)`.

**Given** `app/layout.tsx` loads Inter and JetBrains Mono via `next/font/google` and sets `--font-inter` and `--font-jetbrains-mono` CSS variables on `<html>`,
**When** a page element has the class `font-sans`,
**Then** the browser's computed style for that element shows a font family from the Inter family (not a system default such as Arial or Helvetica).

**Given** `app/layout.tsx` sets `--font-jetbrains-mono` on `<html>`,
**When** a page element has the class `font-mono`,
**Then** the browser's computed style shows a font family from the JetBrains Mono family (not a generic monospace fallback).

**Given** the existing markup and class names are unchanged,
**When** the font config is updated,
**Then** no other Tailwind theme values (colors, spacing, breakpoints) are altered.

## Out of Scope

- Adding new typefaces or modifying which fonts are loaded in `layout.tsx`.
- Changing fallback font stacks beyond inserting the CSS variable reference.
- Any changes to page markup or component class names.
