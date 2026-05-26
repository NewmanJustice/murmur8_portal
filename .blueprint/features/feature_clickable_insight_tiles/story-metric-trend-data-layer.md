# Story: Metric Trend Data Layer

## User Story

**As a** developer building the trend page  
**I want** server-side functions that compute per-bucket metric aggregations for any time window  
**So that** the chart components receive correctly shaped time-series data

## Acceptance Criteria

### AC1: Aggregation function accepts metric key, window, and userId

**Given** a call to the trend data function  
**When** invoked with parameters `(metricKey, window, userId)`  
**Then** it returns an array of data points where each point contains `{ bucket: string (ISO date), value: number }` for numeric metrics

### AC2: Window determines bucket boundaries and lookback

**Given** window = "week"  
**When** the function computes buckets  
**Then** it produces up to 7 daily buckets covering the last 7 days from today

**Given** window = "month"  
**When** the function computes buckets  
**Then** it produces up to 4-5 weekly buckets covering the last 30 days from today

**Given** window = "year"  
**When** the function computes buckets  
**Then** it produces up to 12 monthly buckets covering the last 12 months from today

### AC3: Prior-year data returned alongside primary data

**Given** a valid metric and window  
**When** the function executes  
**Then** it returns both `currentPeriod` and `priorYear` arrays, where `priorYear` contains the same bucket structure shifted back by one calendar year

### AC4: Each metric key maps to correct aggregation

**Given** metric key `total-runs`  
**Then** value = count of runs in the bucket

**Given** metric key `success-rate`  
**Then** value = (success count / total count) * 100

**Given** metric key `avg-duration`  
**Then** value = mean of `totalDurationMs` (excluding nulls) in the bucket

**Given** metric key `total-cost`  
**Then** value = sum of `totalCost` in the bucket

**Given** metric key `avg-cost-per-run`  
**Then** value = sum of `totalCost` / count in the bucket

**Given** metric key `refinement-rate`  
**Then** value = percentage of distinct slugs with at least one refinement-type run in the bucket

**Given** metric key `avg-feedback-rating`  
**Then** value = mean of feedback.rating across all stages of runs in the bucket

### AC5: Only the authenticated user's runs are included

**Given** a userId parameter  
**When** the aggregation queries the database  
**Then** only runs belonging to that userId are included (no cross-user data leakage)

### AC6: Empty buckets return value of null or 0

**Given** a time bucket with no runs  
**When** the aggregation computes  
**Then** the bucket is still present in the result array with a `value` of `null` (to allow chart gap rendering)

### AC7: Prior-year with no data returns empty array

**Given** the user had no runs one year ago  
**When** prior-year data is computed  
**Then** `priorYear` is an empty array (not an error)

## Out of Scope

- Compound/categorical metrics (runs-by-type, stage-success-rates, most-common-failure-stage, most-active-repo) are covered in story-compound-categorical-metrics
- Chart rendering or UI concerns
- Caching or performance optimisation (acceptable as follow-up)
- Index creation (assumed A2 from spec)
