# Story: Empty and Edge States

## User Story

**As a** user viewing a metric trend page with limited or no data  
**I want** to see clear, non-error messaging about the data situation  
**So that** I understand why the chart is empty or sparse rather than thinking something is broken

## Acceptance Criteria

### AC1: No runs at all shows empty state message

**Given** the user has zero runs in the database  
**When** they navigate to any metric trend page  
**Then** instead of a chart, a friendly empty-state message is displayed (e.g. "No data yet. Run your first pipeline to see trends here.") AND no chart axes or blank chart area is shown

### AC2: Single data point renders without error

**Given** only one time bucket contains data (e.g. user started this week)  
**When** the chart renders  
**Then** a single dot is plotted at the correct position AND the chart does not crash or display misleadingly

### AC3: Gaps in data render as line breaks

**Given** some time buckets have data and some have `null` values  
**When** the chart renders  
**Then** the line connects only adjacent non-null points, with visible gaps for null buckets (no interpolation through missing data)

### AC4: No prior-year data shows current period only

**Given** the user has less than one year of history  
**When** the trend page renders  
**Then** only the current-period line/chart is shown AND the prior-year legend entry is absent AND no error or "no data" badge appears for the prior year specifically

### AC5: Categorical metric with no failures shows empty state

**Given** the user has runs but zero failures (no `failedStage` values)  
**When** they navigate to `/dashboard/insights/most-common-failure-stage`  
**Then** an appropriate empty-state message is displayed (e.g. "No failures recorded in this period.")

## Out of Scope

- Loading/skeleton states during data fetch (standard Next.js loading patterns apply)
- Error states from server/database failures (500-level errors)
- Retry mechanisms for failed data fetches
- Animations when transitioning between data and empty states
