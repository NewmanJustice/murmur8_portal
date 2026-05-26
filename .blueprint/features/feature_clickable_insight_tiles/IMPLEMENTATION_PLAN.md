## Summary

Make the 11 insight stat tiles clickable (linking to `/dashboard/insights/[metric]`) and create the trend page with time-series charts. The approach: add a shared data-layer module (`lib/insights-trend.ts`) exporting bucket/aggregation functions, wrap existing stat cards in `<Link>` elements, create the dynamic route page with auth/validation/toggle, and add a `TrendChart` component using Recharts.

## Steps

1. [package.json] MODIFY — Add `recharts` dependency | Tests: T26, T30
2. [lib/insights-trend.ts] CREATE — Export METRIC_KEYS, isValidMetricKey, getMetricTitle, getBucketBoundaries, computeTrendData, computeCompoundTrendData, computeCategoricalTrendData | Tests: T12-T25, T33-T44
3. [app/dashboard/InsightsPanel.tsx] MODIFY — Wrap 11 stat tiles in `<Link href="/dashboard/insights/[metric]">` with cursor-pointer, hover affordance, aria-label; exclude stage table and Run Velocity tile | Tests: T01-T05
4. [app/dashboard/insights/[metric]/page.tsx] CREATE — Server component with getSession redirect, isValidMetricKey/notFound, getMetricTitle header, back link to /dashboard, logo header, searchParams-driven window toggle | Tests: T06-T11, T18
5. [app/dashboard/insights/[metric]/TrendChart.tsx] CREATE — Client component using Recharts ResponsiveContainer, LineChart/BarChart, solid primary Line, dashed prior-year Line (conditional), connectNulls=false, aria-label, multi-series support for compound/categorical | Tests: T26-T32, T33-T36, T39

## Risks

- Recharts is a client-only library; the trend page must use a client component boundary (`"use client"`) for TrendChart while keeping the page shell as a server component.
- T05 relies on positional text matching (`src.slice(src.indexOf('Run Velocity')...)`); the Run Velocity tile markup must not contain `/dashboard/insights/` anywhere in a 500-char window.
