## Summary

Move run history (RunsTable, filter form, pagination, getUserRuns) out of the dashboard page and into a new dedicated `/dashboard/runs` page. The dashboard retains InsightsPanel and gains a "Run History" nav link. The new runs page uses the compact header pattern (logo + "← Dashboard" back link) from the keys page.

## Steps

1. [app/dashboard/runs/page.tsx] CREATE — new runs page: auth guard with redirect("/"), getUserRuns call, filter form (status/slug/dateFrom/dateTo), RunsTable, pagination with /dashboard/runs? hrefs, clear-filters href="/dashboard/runs", compact logo + "← Dashboard" href="/dashboard" header (no nav), metadata title 'Run History — murmur8 portal' | Tests: T-RH-08, T-RH-09, T-RH-10, T-RH-11, T-RH-12, T-RH-13, T-RH-14, T-RH-15, T-RH-16, T-RH-17, T-RH-18, T-RH-19
2. [app/dashboard/page.tsx] MODIFY — remove RunsTable import/usage, getUserRuns call, filter form (name="status"/name="slug"), pagination (← Previous/Next →); add "Run History" href="/dashboard/runs" nav link with same className as "API Keys" link; keep InsightsPanel | Tests: T-RH-01, T-RH-02, T-RH-03, T-RH-04, T-RH-05, T-RH-06, T-RH-07

## Risks

- T-RH-02 requires the "Run History" anchor's className to be an exact string match to the "API Keys" anchor — inline JSX conditional expressions (e.g. ternary in className) on one link but not the other would break this; both links must use a plain static className string.
- T-RH-11 checks for the absence of `href="/dashboard"` after stripping `/dashboard/runs` occurrences — the "clearing your filters" inline link in the empty-state message must also use `/dashboard/runs`, not `/dashboard`.
