# Story: Compound and Categorical Metric Handling

## User Story

**As a** user viewing a compound or categorical metric trend page  
**I want** to see an appropriate multi-series or bar chart visualisation  
**So that** I can understand how sub-categories or stages have changed over time

## Acceptance Criteria

### AC1: Runs by Type renders as multi-series line chart

**Given** the trend page for metric `runs-by-type`  
**When** data is loaded  
**Then** the chart renders TWO line series: one for "feature" run count and one for "refinement" run count AND each line is distinctly coloured AND a legend labels both series

### AC2: Stage Success Rates renders as multi-series line chart

**Given** the trend page for metric `stage-success-rates`  
**When** data is loaded  
**Then** the chart renders one line series per pipeline stage (e.g. Alex, Cass, Nigel, Codey) showing success percentage per bucket AND a legend identifies each stage

### AC3: Most Common Failure Stage renders as stacked/grouped bar chart

**Given** the trend page for metric `most-common-failure-stage`  
**When** data is loaded  
**Then** a Recharts `BarChart` renders with time buckets on the x-axis AND each bucket shows bars (stacked or grouped) for each failure stage with their count AND a legend identifies each stage by colour

### AC4: Most Active Repo renders as stacked/grouped bar chart

**Given** the trend page for metric `most-active-repo`  
**When** data is loaded  
**Then** a Recharts `BarChart` renders with time buckets on the x-axis AND each bucket shows bars (stacked or grouped) for each repo with their run count AND a legend identifies each repo by colour

### AC5: Compound data layer returns multi-series shape

**Given** a call to the trend data function for `runs-by-type`  
**When** invoked  
**Then** it returns `{ currentPeriod: Array<{ bucket: string, series: Record<string, number> }>, priorYear: Array<...> }` where series keys are the category names (e.g. "feature", "refinement")

### AC6: Categorical data layer returns category counts per bucket

**Given** a call to the trend data function for `most-common-failure-stage`  
**When** invoked  
**Then** it returns `{ currentPeriod: Array<{ bucket: string, categories: Record<string, number> }>, priorYear: Array<...> }` where category keys are the stage/repo names and values are occurrence counts

### AC7: Prior-year overlay applies to compound/categorical metrics

**Given** prior-year data exists for a compound metric  
**When** the chart renders  
**Then** prior-year data is represented (e.g. as lighter/dashed versions of the same series or a separate grouped section) so users can compare year-over-year

## Out of Scope

- Filtering to show/hide individual series (e.g. toggle a specific stage off)
- Drill-down from a bar segment into individual runs
- Limiting the number of categories displayed (show all that exist)
- Custom colour assignment for categories
