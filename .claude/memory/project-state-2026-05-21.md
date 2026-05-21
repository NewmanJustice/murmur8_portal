---
name: project-state-2026-05-21
description: Summary of features completed as of 2026-05-21 and what the dashboard looks like
metadata: 
  node_type: memory
  type: project
  originSessionId: 3bfd0fb3-e15c-4271-9cf7-8bdae66d8f89
---

As of 2026-05-21, the following features are implemented and committed to `main`:

- **site_styling** — Tailwind theme, favicon, full/compact logos
- **run-history-dashboard** — original run history page
- **move_run_history_to_own_page** — run history moved to `/dashboard/runs`; dashboard shows InsightsPanel only + nav
- **add-murmur8-logo-full-to-dashboard** — full logo hero above InsightsPanel on dashboard
- **insights-panel** — original InsightsPanel with totalRuns, successRate, avgDuration, totalCost, stageAverages, mostCommonFailureStage
- **add_insights** — added avgCostPerRun, refinementRate, featureRuns, refinementRuns, stageSuccessRates
- **add_more_insights** — added last7Days, last30Days (velocity), topSlugByRunCount, topSlugByCost, avgFeedbackRating

**Why:** Orientation for the next session — don't re-implement what's already there.

**How to apply:** Before starting new insight work, check `lib/insights.ts` `AggregateInsights` interface for what already exists.
