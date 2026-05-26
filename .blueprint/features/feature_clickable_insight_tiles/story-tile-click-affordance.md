# Story: Tile Click Affordance

## User Story

**As a** dashboard user  
**I want** insight tiles to be visually and functionally clickable  
**So that** I can navigate to a detailed trend page for any metric I'm interested in

## Acceptance Criteria

### AC1: Tiles render as navigable links

**Given** the InsightsPanel is rendered on the dashboard  
**When** any of the 11 designated insight tiles is rendered  
**Then** the tile is wrapped in (or rendered as) an `<a>` element (Next.js `<Link>`) pointing to `/dashboard/insights/[metric]` where `[metric]` is the tile's metric key

### AC2: Hover visual feedback

**Given** the user hovers over a clickable insight tile  
**When** the cursor enters the tile boundary  
**Then** the cursor changes to `pointer` AND the tile displays a subtle hover effect (e.g. elevation change, border highlight, or background tint shift)

### AC3: Keyboard accessibility

**Given** a user navigates the dashboard using keyboard  
**When** they tab through the page  
**Then** each clickable tile is focusable in document order AND pressing Enter on a focused tile navigates to that tile's trend page

### AC4: Screen reader announcement

**Given** a screen reader is active  
**When** focus lands on a clickable tile  
**Then** the accessible name includes the metric label and communicates that it is a link (e.g. "Total Runs - view trend")

### AC5: Excluded tiles are not clickable

**Given** the stage breakdown table and Run Velocity tile  
**When** the InsightsPanel renders  
**Then** these elements do NOT have link wrapping, hover affordance, or pointer cursor

## Metric keys for the 11 clickable tiles

`total-runs`, `success-rate`, `avg-duration`, `total-cost`, `avg-cost-per-run`, `refinement-rate`, `runs-by-type`, `stage-success-rates`, `avg-feedback-rating`, `most-common-failure-stage`, `most-active-repo`

## Out of Scope

- Trend page content or layout (covered in story-trend-page-shell)
- Data fetching or aggregation logic
- Mobile-specific touch interactions beyond standard tap-as-click
- Animation or transition effects during navigation
