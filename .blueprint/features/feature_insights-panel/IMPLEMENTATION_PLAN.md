# Implementation Plan — insights-panel

## Steps

1. [lib/insights.js] CREATE — Pure ESM helper functions: `STAGE_ORDER`, `computeInsights(runs)`, `computeStageAverages(runs)`, `getMostCommonFailureStage(runs)` | Tests: T-IP-01 to T-IP-20

2. [lib/insights.ts] CREATE — TypeScript mirror of lib/insights.js with full types for use in Next.js pages | Tests: none (mirrors JS)

3. [lib/runs.ts] EDIT — Add `getInsightsData(userId)` function that fetches the fields needed for insights (status, totalDurationMs, totalCost, failedStage, stages) using Prisma | Tests: none (DB layer)

4. [app/dashboard/InsightsPanel.tsx] CREATE — Server component that receives pre-computed insights props and renders the stat cards + stage breakdown table + failure callout | Tests: none (UI component)

5. [app/dashboard/page.tsx] EDIT — Import `getInsightsData` and `computeInsights`/`computeStageAverages`/`getMostCommonFailureStage`, compute insights server-side, render `<InsightsPanel>` above the run list | Tests: none (page composition)
