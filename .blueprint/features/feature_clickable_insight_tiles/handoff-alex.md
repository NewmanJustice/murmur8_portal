## Handoff Summary
**For:** Cass
**Feature:** clickable_insight_tiles

### Key Decisions
- 11 tiles become clickable links; the stage breakdown table and Run Velocity tile are excluded
- Each tile navigates to `/dashboard/insights/[metric]` (a full page, not a modal)
- Time-window toggle (Week/Month/Year) controls both the lookback window and data-point granularity (daily/weekly/monthly)
- Prior-year data overlays as a secondary line series for year-over-year comparison
- Categorical metrics (Most Common Failure Stage, Most Active Repo) need a non-line-chart visualisation (deferred to implementation, suggest bar/label approach)

### Files Created
- .blueprint/features/feature_clickable_insight_tiles/FEATURE_SPEC.md

### Open Questions
- Charting library choice (Recharts vs alternatives) deferred to implementation
- Visualisation type for categorical metrics deferred to implementation
- Whether time-window state lives in URL query param or client state (spec recommends URL)

### Critical Context
The InsightsPanel (`app/dashboard/InsightsPanel.tsx`) is currently a server component rendering static `<div>` stat cards. Tiles need to become `<a>` links or be wrapped in `<Link>`. The data layer (`lib/insights.ts`) contains the aggregation logic that will need per-time-bucket variants. The trend page follows the same route pattern as existing `/dashboard/runs/[id]` pages. Compound tiles (Runs by Type, Stage Success Rates) produce multi-series charts requiring distinct story treatment from simple numeric metrics.
