# Feature Specification — Clickable Insight Tiles

## 1. Feature Intent
**Why this feature exists.**

- **Problem**: Insight tiles on the dashboard display point-in-time aggregate values with no way to explore how those metrics have evolved over time. Users cannot detect trends, regressions, or improvements without manually tracking values across sessions.
- **User need**: Users want to click an insight metric and see its historical trend on a dedicated page with time-window controls and year-over-year comparison.
- **System purpose alignment**: Extends the Insights Panel (System Spec section 6.7) from static aggregation into a lightweight analytics surface, helping users inspect and audit pipeline performance trends.

> Alignment note: The System Spec (section 6.7) describes the Insights Panel as "aggregate stats" with no live updates. This feature adds a **drill-down** navigation layer without altering the server-component, no-WebSocket contract. The new trend pages remain static server-rendered views with no live refresh, consistent with the existing design.

---

## 2. Scope
### In Scope
- Wrapping 11 specific insight tiles with navigation links (not the stage breakdown table or Run Velocity tile)
- A new route `/dashboard/insights/[metric]` serving a dedicated trend page per metric
- Time-window toggle (Week / Month / Year) controlling both the window and data-point granularity
- Line chart visualisation showing metric values over time
- Prior-year overlay lines for year-over-year comparison
- Consistent page chrome: header with logo, back-to-dashboard link, starling theme
- Server-side data aggregation per time bucket (day/week/month) for the selected window
- URL-driven state for the selected time window (query param or segment)

### Out of Scope
- Making the stage breakdown table clickable
- Making the Run Velocity tile clickable
- Real-time / auto-refresh of trend data
- Exporting trend data (CSV, image)
- Annotations or user-defined markers on the chart
- Dashboard-level date range filtering
- Drill-down from the trend line into individual runs
- Mobile-specific chart interactions (pinch-zoom, swipe)

---

## 3. Actors Involved

| Actor | Can do | Cannot do |
|-------|--------|-----------|
| **User** | Click any of the 11 designated tiles to navigate to its trend page; toggle between Week/Month/Year views; view prior-year comparisons | Access another user's trend data; export data; modify chart configuration |

No new actor roles are introduced. The feature operates within the existing User session boundary (System Spec rule R1, R7).

---

## 4. Behaviour Overview

### Happy path
1. User views the Dashboard Insights Panel.
2. User clicks one of the 11 designated insight tiles.
3. Browser navigates to `/dashboard/insights/[metric]`.
4. Trend page loads showing a line chart of that metric's values over time, defaulting to the "Month" window (weekly data points, last 30 days).
5. User toggles to "Week" (daily points, last 7 days) or "Year" (monthly points, last 12 months).
6. Chart re-renders with the new granularity and window.
7. Prior-year(s) data lines are overlaid on the same chart axes for comparison (e.g. when viewing Year, the previous year's monthly values appear as a second line).

### Alternatives / branches
- **Insufficient data**: If the user has no runs in a given time bucket, the chart shows a gap or zero-value point. If the user has no runs at all, a friendly empty-state message is shown.
- **No prior-year data**: The prior-year overlay line is simply absent; no error.
- **Compound tiles** (Runs by Type, Stage Success Rates): These render multiple series on the same chart (e.g. feature count + refinement count, or one line per stage).
- **Conditional tile** (Most Common Failure Stage): Only appears when failures exist; trend shows the dominant failure stage label per bucket (categorical), displayed as a textual timeline or bar representation rather than a numeric line.
- **Most Active Repo**: Similar categorical metric; trend shows which repo had the most runs per bucket.

### User-visible outcomes
- Tiles gain a visual click affordance (cursor pointer, subtle hover effect)
- Each trend page displays a clear title, the metric name, time-window toggle, and chart
- Back link returns the user to the dashboard

---

## 5. State & Lifecycle Interactions

This feature is **state-reading only**. It introduces no new persistent state.

- **States read**: Existing Run records (their `startedAt`, `completedAt`, `status`, `type`, `totalDurationMs`, `totalCost`, `failedStage`, `stages` JSONB, `repoName`, `slug`)
- **States created**: None
- **States modified**: None

The feature performs time-bucketed aggregation over immutable Run data. No writes, no transitions.

---

## 6. Rules & Decision Logic

### R-TREND-1: Time window determines granularity
| Window | Granularity | Data points |
|--------|-------------|-------------|
| Week | Daily | Up to 7 |
| Month | Weekly | Up to ~4-5 |
| Year | Monthly | Up to 12 |

- **Inputs**: User's selected window toggle value, current date
- **Output**: Start date, bucket boundaries, aggregation interval
- **Deterministic**: Yes

### R-TREND-2: Prior-year overlay calculation
- For each bucket in the primary window, compute the corresponding bucket one year prior.
- If data exists, plot as a secondary line series.
- If multiple prior years have data (unlikely in early usage), show the most recent prior year only.
- **Deterministic**: Yes

### R-TREND-3: Metric-specific aggregation
Each metric key maps to a specific aggregation function over runs in a bucket:

| Metric key | Aggregation |
|-----------|------------|
| `total-runs` | Count of runs |
| `success-rate` | (success count / total count) * 100 |
| `avg-duration` | Mean of `totalDurationMs` (excluding nulls) |
| `total-cost` | Sum of `totalCost` |
| `avg-cost-per-run` | Sum of `totalCost` / count |
| `refinement-rate` | % of distinct slugs with at least one refinement run |
| `runs-by-type` | Two series: count where type=feature, count where type=refinement |
| `stage-success-rates` | One series per stage: success% per bucket |
| `avg-feedback-rating` | Mean of feedback.rating across all stages |
| `most-common-failure-stage` | Most frequent `failedStage` value per bucket (categorical) |
| `most-active-repo` | Repo with highest run count per bucket (categorical) |

- **Deterministic**: Yes (same runs, same output)

### R-TREND-4: Access control
- Only the authenticated user's own runs are queried (inherits R1 from System Spec).
- Unauthenticated requests redirect to login (inherits R7).

---

## 7. Dependencies

### System components
- **Prisma / Run model**: Query runs with date-range filtering and grouping
- **`lib/insights.ts`**: May reuse or extend existing aggregation logic for per-bucket computation
- **NextAuth session**: Required for user identification and route protection
- **App Router**: New dynamic route segment `app/dashboard/insights/[metric]/page.tsx`

### External libraries (new)
- **Recharts**: React-native composable charting library (~45KB gzip). Supports multi-series line charts, stacked/grouped bar charts, responsive containers, and custom styling.

### Operational
- No new infrastructure. Data already exists in PostgreSQL; aggregation is read-only.

---

## 8. Non-Functional Considerations

### Performance
- Aggregation queries could be expensive for users with thousands of runs. The server-side computation should use indexed date-range queries (`startedAt` index recommended).
- Consider caching or limiting to a maximum lookback (e.g. 2 years) to bound query cost.
- Chart rendering is client-side; the page can be a hybrid server/client component (data fetched server-side, chart rendered client-side).

### Security
- No new API endpoints exposed externally. All data access goes through the existing session-protected server component pattern.
- Metric slug in the URL is validated server-side against an allowlist; invalid metric slugs return 404.

### Accessibility
- Tiles should have appropriate `role="link"` or be rendered as `<a>` elements for keyboard navigation and screen readers.
- Charts should have an `aria-label` describing the metric and include a visually-hidden data table fallback or summary.

### Error tolerance
- Missing data for a time bucket renders as a gap or zero, not an error.
- Invalid metric slug in URL returns a 404 page.

---

## 9. Assumptions & Open Questions

### Assumptions
- A1: The `startedAt` field on Run records is reliably populated and can serve as the time axis for trend bucketing.
- A2: The Run table has (or will receive) an index on `(userId, startedAt)` to support efficient date-range queries.
- A3: A client-side charting library is acceptable (introduces a JS bundle dependency). Server-rendered SVG charts are not required.
- A4: The default time window on page load is "Month" (showing weekly data points for the last 30 days).

### Open Questions
- OQ1: Which charting library to use? **RESOLVED: Recharts** — lightweight (~45KB gzip), React-native, composable, supports multi-series overlay natively.
- OQ2: For categorical metrics (Most Common Failure Stage, Most Active Repo), what chart type? **RESOLVED: Stacked/grouped bar chart** — shows all categories per bucket with their counts, not just the dominant one.
- OQ3: Should the time-window toggle state persist in the URL? **RESOLVED: Yes, URL query param** (`?window=week|month|year`) for shareability and back-button support.

---

## 10. Impact on System Specification

### Alignment
This feature **reinforces** the existing system design:
- It reads Run data without modifying it (R8: indefinite retention supports lookback).
- It respects user-scoped access (R1).
- It uses the App Router pattern already established for `/dashboard/runs` and `/dashboard/runs/[id]`.
- It remains a static server-rendered view with no WebSocket/live requirement.

### Stretch
- The System Spec section 6.7 describes the Insights Panel as showing "aggregate stats" and "most common failure stage." This feature extends "aggregate stats" into time-series analytics. This is an additive extension, not a contradiction.
- **Proposed System Spec addition** (section 6.7, append): "Users may click individual insight metrics to navigate to a dedicated trend page showing that metric's value over time with configurable time windows."

### Contradiction
- None identified.

---

## 11. Handover to BA (Cass)

### Story themes
1. **Tile click affordance**: Making tiles visually and functionally clickable (link wrapping, hover states, cursor, accessibility)
2. **Trend page shell**: Route, layout, header, back-link, page chrome consistent with existing pages
3. **Time-window toggle**: UI control + server-side data re-aggregation per window selection
4. **Metric trend data layer**: Server-side functions that compute per-bucket aggregations for each metric type
5. **Chart rendering**: Client component that receives time-series data and renders line chart(s) with prior-year overlay
6. **Compound/categorical metric handling**: Stories for multi-series tiles (Runs by Type, Stage Success Rates) and categorical tiles (Most Common Failure Stage, Most Active Repo)
7. **Empty/edge states**: No data, no prior-year data, single data point

### Expected story boundaries
- Separate the data-layer (aggregation functions) from the presentation layer (chart component)
- Separate simple numeric metrics from compound/categorical metrics
- The tile click affordance is a single focused story on the InsightsPanel component
- The trend page shell (route + layout) is its own story, independent of chart rendering

### Areas needing careful story framing
- The compound tiles (Runs by Type, Stage Success Rates) produce multi-series charts; stories should specify how many lines and their labelling
- Categorical metrics (Most Common Failure Stage, Most Active Repo) need a different visualisation approach than numeric metrics; do not assume a standard line chart will suffice
- Prior-year overlay logic needs clear acceptance criteria for edge cases (user has < 1 year of data, no runs in prior year)

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-05-26 | Initial spec created from interactive user input | New feature request | Alex |
