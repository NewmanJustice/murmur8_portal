Refined: 2026-05-27 — new story

# Story: Telemetry Summary Tiles

**As an** authenticated user,
**I want** to see telemetry summary tiles at the top of the run detail page,
**so that** I can understand the run's key metrics at a glance.

---

## Acceptance Criteria

**AC1 — Four tiles are shown**
Given I navigate to `/dashboard/runs/[id]`,
When the page loads,
Then I see exactly four summary tiles: Total Cost, Total Duration, Total Tokens, and Stage Count.

**AC2 — Total Tokens is computed from stage JSONB at render time**
Given a run with stage data in the JSONB field,
When the page renders,
Then Total Tokens is calculated by summing `inputTokens + outputTokens` across all stages from the JSONB — it is not read from a stored database column.

**AC3 — Tiles use the same visual style as InsightsPanel metric tiles**
Given the run detail page is rendered,
When I compare the telemetry tiles with the InsightsPanel metric tiles on the dashboard,
Then both use the same component, visual style, and layout conventions.

**AC4 — Null or absent token fields degrade gracefully**
Given a run where one or more stages have null or absent `inputTokens` or `outputTokens` fields,
When the page renders,
Then those missing values are treated as 0 (or displayed as "—") and no crash or unhandled error occurs.

**AC5 — Stage Count reflects JSONB stage keys**
Given a run with N stage entries in the JSONB field,
When the page renders,
Then the Stage Count tile displays N — the number of stage keys present in the JSONB, not a separate stored column.

---

## Out of Scope
- Token breakdowns per stage (covered in story-stage-breakdown)
- Cost breakdowns per model or provider
- Historical trend comparisons on this page
