# Story: Time-Window Toggle

## User Story

**As a** user viewing a metric trend page  
**I want** to switch between Week, Month, and Year time windows  
**So that** I can examine short-term fluctuations or long-term patterns at the appropriate granularity

## Acceptance Criteria

### AC1: Toggle control renders with three options

**Given** the trend page is displayed  
**When** the page renders  
**Then** a segmented toggle (or equivalent tab-style control) is visible with three options: "Week", "Month", "Year"

### AC2: Default selection is Month

**Given** the user navigates to a trend page without a `?window` query param  
**When** the page loads  
**Then** "Month" is selected by default AND the URL is updated to include `?window=month`

### AC3: Clicking a toggle option updates the URL

**Given** the user is on a trend page with `?window=month`  
**When** they click "Week"  
**Then** the URL updates to `?window=week` without a full page reload (client-side navigation) AND the toggle visually reflects "Week" as selected

### AC4: URL query param drives initial state

**Given** a user navigates directly to `/dashboard/insights/total-runs?window=year`  
**When** the page loads  
**Then** "Year" is selected in the toggle AND data is fetched for the Year window

### AC5: Browser back button respects window state

**Given** the user changes the window from Month to Week (URL updates to `?window=week`)  
**When** they press the browser back button  
**Then** the URL reverts to `?window=month` AND the toggle and data reflect the Month window

### AC6: Invalid window param falls back to default

**Given** the URL contains `?window=decade` (invalid value)  
**When** the page loads  
**Then** "Month" is selected as the default AND the URL is corrected to `?window=month`

### AC7: Toggle triggers data re-fetch

**Given** the user changes the time window  
**When** the new window is selected  
**Then** the page fetches aggregated data for the new window and granularity (Week=daily, Month=weekly, Year=monthly) and the chart re-renders with the new data

## Out of Scope

- The aggregation logic itself (covered in story-metric-trend-data-layer)
- Chart rendering details (covered in story-chart-rendering)
- Persisting window preference across sessions or metrics
- Custom date-range selection beyond the three presets
