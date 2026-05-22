# Handoff: Nigel (Tester) -> Codey (Developer)

## Feature: change_Most-Common-Failure-Stage_tile

## Summary

Tests are written and expected to FAIL against current code. They validate:
1. All red warning classes (`border-red-200`, `bg-red-50`, `text-red-500`, `text-red-700`, `text-red-400`) are removed from `InsightsPanel.tsx`.
2. The subtitle "This stage fails more often..." is removed.
3. Standard stat card styling (`rounded-brand`, `border-starling-cyan/30`, `bg-white`, `text-starling-slate`, `text-starling-ink`) is applied to the failure tile.
4. Conditional rendering and label text are preserved.

## Artifacts

- Test spec: `test/artifacts/feature_change_Most-Common-Failure-Stage_tile/test-spec.md`
- Executable tests: `test/feature_change_Most-Common-Failure-Stage_tile.test.js`

## Run Tests

```bash
node --test test/feature_change_Most-Common-Failure-Stage_tile.test.js
```

## Implementation Guidance

- File to modify: `app/dashboard/InsightsPanel.tsx` (lines 155-167)
- Replace the red-styled `<div>` with standard stat card classes
- Remove the subtitle `<p>` element entirely
- Keep the `{mostCommonFailureStage !== null && (...)}` guard
- Keep the label "Most Common Failure Stage" and the `{mostCommonFailureStage}` value rendering
