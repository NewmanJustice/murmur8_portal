# Test Spec: change_Most-Common-Failure-Stage_tile

## Understanding

The "Most Common Failure Stage" tile in `app/dashboard/InsightsPanel.tsx` currently uses red warning styles (`border-red-200`, `bg-red-50`, `text-red-500`, `text-red-700`, `text-red-400`) and includes a descriptive subtitle. The change removes all red styling and the subtitle, replacing them with the standard stat card pattern (`rounded-brand`, `border-starling-cyan/30`, `bg-white`, `text-starling-slate` label, `text-starling-ink` value). Conditional rendering (`mostCommonFailureStage !== null`) must be preserved. The label text "Most Common Failure Stage" remains unchanged.

## Test ID Mapping

| ID | Assertion |
|----|-----------|
| T-MCFS-01 | File does NOT contain `border-red-200` |
| T-MCFS-02 | File does NOT contain `bg-red-50` |
| T-MCFS-03 | File does NOT contain `text-red-500` |
| T-MCFS-04 | File does NOT contain `text-red-700` |
| T-MCFS-05 | File does NOT contain `text-red-400` |
| T-MCFS-06 | File does NOT contain subtitle text "This stage fails more often" |
| T-MCFS-07 | File DOES contain `mostCommonFailureStage` conditional rendering |
| T-MCFS-08 | File DOES contain `rounded-brand` near the failure tile context |
| T-MCFS-09 | File DOES contain `border-starling-cyan/30` and `bg-white` for the tile |
| T-MCFS-10 | File DOES contain `text-starling-slate` for the label |
| T-MCFS-11 | File DOES contain `text-starling-ink` for the value |
| T-MCFS-12 | File DOES contain label text "Most Common Failure Stage" |

## Key Assumptions

- This is a pure CSS/Tailwind class change; no logic or data-flow changes.
- The `StatCard` component is NOT reused for this tile (it remains a custom `<div>`).
- The conditional guard `mostCommonFailureStage !== null` stays intact.
- No other tiles in InsightsPanel use red styles, so absence checks are file-wide.
