# Test Spec: clickable_insight_tiles

## Understanding

This feature makes the 11 insight tiles on the dashboard clickable, routing each to a dedicated trend page at `/dashboard/insights/[metric]`. Each trend page displays a time-series chart (line for numeric metrics, bar for categorical) with a Week/Month/Year toggle driven by the URL query param `?window=`. A prior-year overlay is shown when data exists. The data layer provides bucket-based aggregations for 7 simple numeric metrics and 4 compound/categorical metrics. Empty and edge states show friendly messages instead of broken charts.

## AC to Test ID Mapping

| Story | AC | Test ID | Behaviour |
|-------|-----|---------|-----------|
| Affordance | AC1 | T01 | Each of 11 tiles renders as `<Link>` to correct `/dashboard/insights/[metric]` |
| Affordance | AC2 | T02 | Hover shows pointer cursor and visual feedback |
| Affordance | AC3 | T03 | Tiles focusable via Tab; Enter navigates |
| Affordance | AC4 | T04 | Accessible name includes metric label + "view trend" |
| Affordance | AC5 | T05 | Excluded tiles (stage table, run velocity) have no link/pointer |
| Shell | AC1 | T06 | Valid metric key resolves page without error |
| Shell | AC2 | T07 | Invalid metric key returns 404 |
| Shell | AC3 | T08 | Page header shows human-readable metric title |
| Shell | AC4 | T09 | Back link navigates to `/dashboard` |
| Shell | AC5 | T10 | Page uses shared layout shell |
| Shell | AC6 | T11 | Unauthenticated user redirected to login |
| Toggle | AC1 | T12 | Three-option toggle (Week/Month/Year) renders |
| Toggle | AC2 | T13 | Default selection is Month; URL set to `?window=month` |
| Toggle | AC3 | T14 | Clicking option updates URL without reload |
| Toggle | AC4 | T15 | URL `?window=year` drives initial toggle state |
| Toggle | AC5 | T16 | Browser back restores previous window state |
| Toggle | AC6 | T17 | Invalid window param falls back to month |
| Toggle | AC7 | T18 | Toggle change triggers data re-fetch |
| Data | AC1 | T19 | Returns `{ bucket, value }` array for numeric metrics |
| Data | AC2 | T20 | Week = 7 daily buckets; Month = 4-5 weekly; Year = 12 monthly |
| Data | AC3 | T21 | Returns both `currentPeriod` and `priorYear` arrays |
| Data | AC4 | T22 | Each of 7 metric keys uses correct aggregation |
| Data | AC5 | T23 | Only authenticated user's runs included (no leakage) |
| Data | AC6 | T24 | Empty bucket returns `value: null` |
| Data | AC7 | T25 | Prior-year with no data returns empty array |
| Chart | AC1 | T26 | Recharts LineChart renders for numeric metrics |
| Chart | AC2 | T27 | Primary line uses solid stroke + dots |
| Chart | AC3 | T28 | Prior-year line renders dashed when data exists |
| Chart | AC4 | T29 | No prior-year line when data empty |
| Chart | AC5 | T30 | Chart resizes responsively |
| Chart | AC6 | T31 | Chart has aria-label describing metric |
| Chart | AC7 | T32 | Null values render as gaps (line breaks) |
| Compound | AC1 | T33 | runs-by-type renders two-line chart (feature/refinement) |
| Compound | AC2 | T34 | stage-success-rates renders line per stage |
| Compound | AC3 | T35 | most-common-failure-stage renders BarChart |
| Compound | AC4 | T36 | most-active-repo renders BarChart |
| Compound | AC5 | T37 | Compound data returns `{ bucket, series: Record }` shape |
| Compound | AC6 | T38 | Categorical data returns `{ bucket, categories: Record }` shape |
| Compound | AC7 | T39 | Prior-year overlay on compound/categorical charts |
| Edge | AC1 | T40 | Zero runs shows empty-state message, no chart |
| Edge | AC2 | T41 | Single data point renders without crash |
| Edge | AC3 | T42 | Gaps in data render as line breaks |
| Edge | AC4 | T43 | No prior-year data shows current only, no error |
| Edge | AC5 | T44 | No failures shows categorical empty-state message |

## Key Assumptions

- ASSUMPTION: Tests use React Testing Library for component tests and direct function calls for data-layer unit tests
- ASSUMPTION: Navigation tests mock Next.js router (`useRouter`, `useSearchParams`)
- ASSUMPTION: Data-layer tests use an in-memory or mocked Prisma client with seeded Run records
- ASSUMPTION: Chart rendering tests assert on Recharts component presence via `role` or test-id attributes, not pixel output
- ASSUMPTION: The 11 metric keys are defined in a shared constant importable by tests
- ASSUMPTION: Auth tests mock the session/middleware layer rather than testing real auth flows
