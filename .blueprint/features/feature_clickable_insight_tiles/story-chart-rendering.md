# Story: Chart Rendering (Line Chart with Prior-Year Overlay)

## User Story

**As a** user viewing a numeric metric trend page  
**I want** to see a line chart showing the metric's value over time with a prior-year comparison line  
**So that** I can visually identify trends, regressions, and year-over-year changes

## Acceptance Criteria

### AC1: Line chart renders for numeric metrics

**Given** the trend page for a numeric metric (total-runs, success-rate, avg-duration, total-cost, avg-cost-per-run, refinement-rate, avg-feedback-rating)  
**When** data is loaded  
**Then** a Recharts `LineChart` (or `ResponsiveContainer` + `LineChart`) renders with the x-axis showing time buckets and the y-axis showing metric values

### AC2: Primary series is visually distinct

**Given** the chart has rendered  
**When** the user views it  
**Then** the current-period line uses a solid stroke with the primary theme colour AND data points are marked with dots at each bucket

### AC3: Prior-year overlay line renders when data exists

**Given** prior-year data is available (non-empty array)  
**When** the chart renders  
**Then** a second line series is displayed with a dashed or muted style AND a legend entry labels it as "Prior Year"

### AC4: Prior-year overlay absent when no data

**Given** prior-year data is an empty array  
**When** the chart renders  
**Then** no prior-year line is shown AND no legend entry for "Prior Year" appears

### AC5: Chart is responsive

**Given** the chart is rendered  
**When** the browser viewport is resized  
**Then** the chart resizes to fit its container width without horizontal overflow or clipping

### AC6: Accessibility label present

**Given** the chart container element  
**When** inspected  
**Then** it has an `aria-label` describing the metric (e.g. "Line chart showing Total Runs over time")

### AC7: Null bucket values render as gaps

**Given** a data point with `value: null` in the series  
**When** the chart renders  
**Then** the line breaks at that point (gap), rather than connecting to zero or interpolating

## Out of Scope

- Compound/categorical chart types (stacked bar) -- covered in story-compound-categorical-metrics
- Tooltip customisation beyond Recharts defaults
- Chart animations or transitions
- Data table fallback (desirable for a11y but not in this story's scope)
- Exporting chart as image
