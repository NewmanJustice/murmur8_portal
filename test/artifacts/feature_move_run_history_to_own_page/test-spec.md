# Test Specification — move_run_history_to_own_page

Tests are pure file-content assertions (`node --test`, `fs.readFileSync`, string presence/absence).  
No JSDOM, no browser.

## Source files under test

| Alias | Path |
|-------|------|
| `DASH` | `app/dashboard/page.tsx` |
| `RUNS` | `app/dashboard/runs/page.tsx` |

---

## Test Cases

| ID | Story | Source | Assert | Pass condition |
|----|-------|--------|--------|----------------|
| T-RH-01 | S01-AC-01 | `DASH` | "Run History" nav link present | contains `href="/dashboard/runs"` and text `Run History` |
| T-RH-02 | S01-AC-03 | `DASH` | "Run History" link uses same CSS classes as "API Keys" link | both `<a>` elements share identical `className` value |
| T-RH-03 | S01-AC-05 | `DASH` | No RunsTable import or usage | does NOT contain `RunsTable` |
| T-RH-04 | S05-AC-02 | `DASH` | No filter form | does NOT contain `<form` with filter inputs (`name="status"`, `name="slug"`) |
| T-RH-05 | S05-AC-02 | `DASH` | No pagination controls | does NOT contain `← Previous` or `Next →` pagination anchors |
| T-RH-06 | S05-AC-03 | `DASH` | No getUserRuns call | does NOT contain `getUserRuns` |
| T-RH-07 | S05-AC-01 | `DASH` | InsightsPanel still rendered | contains `<InsightsPanel` |
| T-RH-08 | S02-AC-01 | `RUNS` | RunsTable rendered | contains `<RunsTable` |
| T-RH-09 | S02-AC-01 | `RUNS` | Filter form present (status, slug, dateFrom, dateTo) | contains `name="status"`, `name="slug"`, `name="dateFrom"`, `name="dateTo"` |
| T-RH-10 | S02-AC-01 | `RUNS` | Pagination controls present | contains `← Previous` and `Next →` (or pagination href pattern) |
| T-RH-11 | S02-AC-03 | `RUNS` | Clear-filters href targets /dashboard/runs | contains `href="/dashboard/runs"` for the Clear link (not `/dashboard"`) |
| T-RH-12 | S02-AC-04 | `RUNS` | Pagination hrefs use /dashboard/runs base | pagination href template contains `/dashboard/runs?` |
| T-RH-13 | S02-AC-05 | `RUNS` | metadata title is correct | contains `'Run History — murmur8 portal'` |
| T-RH-14 | S03-AC-01 | `RUNS` | "← Dashboard" back link present | contains `← Dashboard` |
| T-RH-15 | S03-AC-02 | `RUNS` | Back link href is /dashboard | contains `href="/dashboard"` adjacent to `← Dashboard` |
| T-RH-16 | S03-AC-04 | `RUNS` | No full nav bar (no API Keys nav link) | does NOT contain `href="/keys"` inside a `<nav` element |
| T-RH-17 | S03-AC-03 | `RUNS` | Compact logo present | contains `murmur8-logo-compact.svg` |
| T-RH-18 | S04-AC-01 | `RUNS` | Auth guard redirects unauthenticated users | contains `redirect("/")` or `redirect('/')` after session check |
| T-RH-19 | S04-AC-01 | `RUNS` | getUserRuns called with userId | contains `getUserRuns(userId` or `getUserRuns(userId,` |
