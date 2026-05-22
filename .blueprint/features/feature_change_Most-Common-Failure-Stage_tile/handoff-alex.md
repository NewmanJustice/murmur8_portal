## Handoff Summary
**For:** Cass
**Feature:** change_Most-Common-Failure-Stage_tile

### Key Decisions
- Pure CSS/Tailwind restyling only — no logic, data, or structural changes
- Tile adopts the same classes as `StatCard`: `rounded-brand border border-starling-cyan/30 bg-white`, `text-starling-slate` label, `text-starling-ink` value
- Subtitle text ("This stage fails more often...") is removed to match the minimal label+value pattern of other cards
- Conditional rendering (`mostCommonFailureStage !== null`) is preserved unchanged
- Tile stays in its current grid position (inside the `lg:grid-cols-3` lower section)

### Files Created
- .blueprint/features/feature_change_Most-Common-Failure-Stage_tile/FEATURE_SPEC.md

### Open Questions
- None

### Critical Context
The implementation target is a single file: `app/dashboard/InsightsPanel.tsx`, lines 155-167. The tile currently uses `border-red-200 bg-red-50` with red text variants. It should be restyled to match the existing `StatCard` component pattern defined at lines 40-49 of the same file. Acceptance criteria should reference the `StatCard` class pattern as the canonical "correct" styling.
