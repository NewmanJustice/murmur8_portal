## Handoff Summary
**For:** Nigel
**Feature:** add-murmur8-logo-full-to-dashboard

### What Was Produced
- One story: `story-full-logo-hero.md` — six acceptance criteria, all testable via file-content assertions against `app/dashboard/page.tsx`.

### Key Decisions
- No browser/runtime tests needed — all AC are source-file assertions (grep / line-number comparisons).
- Pixel sizing was deliberately excluded from AC; centering and placement are the observable contracts.
- AC-3 anchors location using the exact `className` string of the content div (`mx-auto max-w-6xl px-6 py-10`).

### AC Summary
| AC | What it checks |
|----|----------------|
| AC-1 | `<Image src="/murmur8-logo-full.svg"` present |
| AC-2 | Full-logo line appears before `<InsightsPanel` line |
| AC-3 | Full-logo line appears after `</header>` and before `<InsightsPanel` |
| AC-4 | `mx-auto` or `justify-center` within 5 lines of logo Image |
| AC-5 | `priority` attribute present on the full-logo Image |
| AC-6 | Compact logo (`/murmur8-logo-compact.svg`) still present inside `<header>` |

### Single File Changed
- `app/dashboard/page.tsx` only.

### Open Questions
- None.
