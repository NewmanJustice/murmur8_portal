# Feature Specification — Restyle "Most Common Failure Stage" Tile

## 1. Feature Intent
**Why this feature exists.**

- The "Most Common Failure Stage" tile currently uses a red warning callout style (red border, red background, red text) that visually separates it from the other stat cards in the InsightsPanel.
- This inconsistency makes the tile look like an error state rather than a standard informational metric.
- The user wants visual consistency across all insight tiles — each card should use the same border, background, and text treatment defined by the murmur8 brand theme.

> **System Spec alignment:** Section 6.7 ("Dashboard — Insights Panel") specifies "Most common failure stage (if any failures exist)" as a data point. It does not mandate any specific visual treatment (e.g., red/warning style). Restyling to match other stat cards remains within system boundaries.

---

## 2. Scope
### In Scope
- Change the CSS/Tailwind classes on the "Most Common Failure Stage" tile to match the standard stat card design used elsewhere in the InsightsPanel grid.
- Specifically replace: `border-red-200` with `border-starling-cyan/30`, `bg-red-50` with `bg-white`, `text-red-500` with `text-starling-slate`, `text-red-700` with `text-starling-ink`, and `text-red-400` with `text-starling-slate`.
- Remove the explanatory subtitle text ("This stage fails more often than any other in your pipeline.") to match the minimal label+value pattern of other stat cards.

### Out of Scope
- No changes to data fetching, computation logic, or the `mostCommonFailureStage` value itself.
- No changes to conditional rendering logic (tile still only appears when `mostCommonFailureStage !== null`).
- No changes to any other tiles or cards.
- No addition of new metrics, fields, or UI elements.
- Tile is moved from the lower `lg:grid-cols-3` section into the upper stat cards grid (`grid-cols-2 sm:grid-cols-4`), matching the size and layout of the other cards in that row.

---

## 3. Actors Involved

| Actor | Capability |
|-------|-----------|
| **User** | Views the restyled tile on their dashboard. No new interactions. |

No new actor permissions or restrictions introduced.

---

## 4. Behaviour Overview

- **Before:** When `mostCommonFailureStage` is not null, a red-bordered callout appears in the bottom-right of the insights section showing the stage name with warning-style text.
- **After:** The tile is rendered inside the upper stat cards grid alongside the other metric cards, using the same styling and inheriting the same responsive sizing (`grid-cols-2 sm:grid-cols-4`).
- **No change to:** when the tile appears or what data it shows.

---

## 5. State & Lifecycle Interactions

This feature is purely presentational. It does not:
- Create, modify, or transition any application state.
- Change any data flow, API calls, or server-side logic.
- Alter conditional rendering logic.

Classification: **state-reading only** (reads `mostCommonFailureStage` to conditionally render; no state mutation).

---

## 6. Rules & Decision Logic

No new rules are introduced. The existing conditional rendering rule is preserved unchanged:

| Rule | Description |
|------|-------------|
| Show tile only when failures exist | Tile renders only when `mostCommonFailureStage !== null` |

---

## 7. Dependencies

- **Tailwind CSS theme:** Relies on existing custom colors (`starling-cyan`, `starling-slate`, `starling-ink`) and the `rounded-brand` utility already defined in the project theme.
- **No new dependencies** introduced.

---

## 8. Non-Functional Considerations

- **Accessibility:** The new design maintains semantic HTML (`<div>` with `<p>` elements). No accessibility regression — text contrast ratios for `text-starling-slate` on `bg-white` and `text-starling-ink` on `bg-white` meet WCAG AA.
- **Performance:** No impact — this is a class-string change only.

---

## 9. Assumptions & Open Questions

### Assumptions
- The existing Tailwind theme includes `border-starling-cyan/30`, `bg-white`, `text-starling-slate`, `text-starling-ink`, and `rounded-brand` utilities (confirmed by inspecting the current `StatCard` component and other tiles in the same file).
- The removal of the subtitle text ("This stage fails more often...") is acceptable since no other stat card includes explanatory subtitles.

### Open Questions
- None. The change is well-defined and self-contained.

---

## 10. Impact on System Specification

- **Reinforces** existing system assumptions: the Insights Panel presents aggregate metrics in a consistent card layout.
- **No tension** with the System Spec — Section 6.7 does not prescribe visual styling for the failure stage metric.
- **No system spec change required.**

---

## 11. Handover to BA (Cass)

### Story Themes
1. **Visual consistency** — restyle the failure stage tile to use standard stat card classes.
2. **Content simplification** — remove the subtitle text to match the label+value pattern.

### Expected Story Boundaries
- Single story: "As a user, I see the Most Common Failure Stage tile styled consistently with all other stat cards in the Insights Panel."
- No separate stories needed for logic, data, or API changes (there are none).

### Areas Needing Careful Story Framing
- Acceptance criteria should specify the exact Tailwind classes expected (or reference the `StatCard` component pattern) to give Nigel unambiguous test targets.
- The story should explicitly state that conditional rendering remains unchanged.

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-22 | Initial spec created | User requested visual consistency for failure stage tile | Alex |
