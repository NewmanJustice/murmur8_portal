## Handoff Summary
**For:** Nigel
**Feature:** clickable_insight_tiles

### Key Decisions
- Split into 7 stories following Alex's boundary guidance: affordance, shell, toggle, data layer, chart, compound/categorical, edge states
- Data layer story covers only the 7 simple numeric metrics; compound/categorical metrics have their own story with distinct data shapes
- Time-window toggle is URL-driven (`?window=week|month|year`) with Month as default and invalid values falling back to Month
- Categorical metrics (failure stage, active repo) use stacked/grouped bar charts via Recharts BarChart, not line charts
- Prior-year overlay is optional (absent when no data) and never causes an error state

### Files Created
- .blueprint/features/feature_clickable_insight_tiles/story-tile-click-affordance.md
- .blueprint/features/feature_clickable_insight_tiles/story-trend-page-shell.md
- .blueprint/features/feature_clickable_insight_tiles/story-time-window-toggle.md
- .blueprint/features/feature_clickable_insight_tiles/story-metric-trend-data-layer.md
- .blueprint/features/feature_clickable_insight_tiles/story-chart-rendering.md
- .blueprint/features/feature_clickable_insight_tiles/story-compound-categorical-metrics.md
- .blueprint/features/feature_clickable_insight_tiles/story-empty-edge-states.md

### Open Questions
- None

### Critical Context
Tests should validate: (1) the 11 metric keys are all routable and non-11 keys return 404, (2) aggregation functions produce correct bucket counts per window type, (3) chart components handle null values as gaps not zeros, (4) compound metrics return multi-series data shapes distinct from simple numeric metrics, (5) the URL query param `?window=` drives both toggle state and data fetch on initial load and navigation.
