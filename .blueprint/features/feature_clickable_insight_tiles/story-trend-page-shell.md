# Story: Trend Page Shell

## User Story

**As a** user who clicked an insight tile  
**I want** to land on a well-structured dedicated page for that metric  
**So that** I have clear context about what I'm viewing and can navigate back easily

## Acceptance Criteria

### AC1: Dynamic route exists and resolves

**Given** a valid metric key (one of the 11 defined keys)  
**When** the browser navigates to `/dashboard/insights/[metric]`  
**Then** a server-rendered page loads without error, displaying the metric's trend page

### AC2: Invalid metric returns 404

**Given** a metric key that is NOT in the allowlist of 11 keys  
**When** the browser navigates to `/dashboard/insights/[invalid-metric]`  
**Then** a 404 page is returned

### AC3: Page header displays metric name

**Given** the trend page for a valid metric  
**When** the page renders  
**Then** the page displays a human-readable title for the metric (e.g. "Total Runs", "Success Rate", "Avg Duration")

### AC4: Back link to dashboard

**Given** the trend page is displayed  
**When** the user looks at the page header area  
**Then** a visible back link/button labeled "Back to Dashboard" (or similar) is present AND clicking it navigates to `/dashboard`

### AC5: Page chrome matches existing pattern

**Given** the trend page is displayed  
**When** compared with existing pages (e.g. `/dashboard/runs/[id]`)  
**Then** the page uses the same layout shell (header with logo, starling theme, consistent spacing)

### AC6: Authentication required

**Given** an unauthenticated user  
**When** they attempt to access `/dashboard/insights/[metric]`  
**Then** they are redirected to the login page

## Out of Scope

- Chart rendering or data visualisation (covered in story-chart-rendering)
- Time-window toggle functionality (covered in story-time-window-toggle)
- Data fetching and aggregation logic
- Mobile-specific layout adjustments beyond responsive defaults
