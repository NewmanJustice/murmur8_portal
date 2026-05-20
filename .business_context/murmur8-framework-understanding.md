# murmur8 Framework — Understanding Document

> Written by Alex as pre-context for the murmur8 Portal site.
> Source: `/workspaces/murmur8/agent-workflow/`

---

## 1. What murmur8 Is

murmur8 is a **multi-agent workflow framework** that automates feature development end-to-end — from fuzzy intent through to tested, committed code. It coordinates four AI agents in a structured pipeline:

| Agent | Role | Accent Color |
|-------|------|-------------|
| **Alex** | System Specification & Chief-of-Staff | `#38BDF8` (sky blue) |
| **Cass** | Story Writer / BA | `#A78BFA` (violet) |
| **Nigel** | Tester | `#F59E0B` (amber) |
| **Codey** | Developer | `#2DD4BF` (teal) |

The pipeline flows:
```
Alex (feature spec) → Cass (user stories) → Nigel (tests) → Codey (plan → implement) → Auto-commit
```

Cass is skipped automatically for technical features (refactoring, optimisation, infrastructure).

murmur8 is installed into a project via `npx murmur8 init` and used through the `/implement-feature` skill in Claude Code or GitHub Copilot CLI.

---

## 2. Pipeline Execution

Each pipeline run produces **structured telemetry** — timing, status, costs, and agent feedback per stage. Runs can be:

- **Single feature**: sequential agent hand-offs
- **Murmuration (parallel)**: multiple features in isolated git worktrees, run simultaneously

### Pipeline States
- `success` — all stages complete, code committed
- `failed` — stopped at a stage, `failedStage` recorded
- `paused` — user paused for review, `pausedAfter` recorded

### Refinement Runs
`/refine-feature` reruns the pipeline for an existing feature (diff-aware). These have `type: "refinement"` and `parentRunId` linking them to the original run.

---

## 3. Telemetry Data Schema

Pipeline history is stored locally in `.claude/pipeline-history.json`. At the end of each run, a JSON entry is recorded:

```json
{
  "slug": "user-auth",
  "status": "success",
  "startedAt": "2025-05-20T10:00:00Z",
  "completedAt": "2025-05-20T10:14:32Z",
  "totalDurationMs": 872000,
  "commitHash": "3bb99f8",
  "totalCost": 0.042,
  "type": "feature",
  "parentRunId": null,
  "featureId": "user-auth",
  "failedStage": null,
  "pausedAfter": null,
  "stages": {
    "alex": {
      "startedAt": "...",
      "completedAt": "...",
      "durationMs": 120000,
      "status": "success",
      "feedback": {
        "rating": 4,
        "issues": [],
        "recommendation": "proceed"
      },
      "tokens": { "input": 12000, "output": 800 },
      "cost": 0.008
    },
    "cass": { ... },
    "nigel-spec": { ... },
    "nigel-tests": { ... },
    "codey-plan": { ... },
    "codey-implement": {
      "...",
      "stepsCompleted": 4
    }
  }
}
```

### Key Fields
| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | Feature identifier, kebab-case |
| `status` | enum | `success`, `failed`, `paused` |
| `totalDurationMs` | number | Full pipeline wall time |
| `totalCost` | number | USD estimated cost |
| `commitHash` | string or null | Git commit if auto-committed |
| `type` | enum | `feature` or `refinement` |
| `parentRunId` | string or null | Set on refinement runs |
| `failedStage` | string or null | Which stage failed |
| `pausedAfter` | string or null | Which stage paused at |
| `stages[name].feedback.rating` | 1–5 | Agent quality self-assessment |
| `stages[name].feedback.issues` | string[] | Issue codes (e.g. `ambiguous-scope`) |
| `stages[name].tokens` | object | `input` and `output` token counts |

---

## 4. Cost Tracking

Default pricing (configurable):
- Input: **$3.00 / million tokens**
- Output: **$15.00 / million tokens**

`totalCost` = sum of per-stage `cost` values. Stages without token data are excluded.

---

## 5. Insights & Analytics (What the Pipeline Surfaces)

murmur8's `insights` module analyses history for:

| Insight Type | Description |
|-------------|-------------|
| **Bottleneck** | Which stage takes the largest % of pipeline time |
| **Failure patterns** | Most common failure stage, failure rate % |
| **Anomalies** | Runs where a stage took >2 stddev above average |
| **Trends** | Success rate and duration improving or degrading over time |
| **Feedback calibration** | How well agent self-ratings predict outcomes |
| **Issue correlations** | Which feedback issue codes correlate to failures |

---

## 6. API Key Context (Portal-Specific)

The portal will **receive telemetry** from pipeline runs. To post to the portal, a project must supply an API key. The portal needs to:
- Generate API keys for users (scoped per user/project)
- Validate incoming telemetry payloads against valid keys
- Associate runs with the owner key/user
- Allow users to manage (view, revoke, regenerate) their own keys
- Allow admins to view all keys and revoke any

---

## 7. Brand & Design Context

See `branding_notes.md` and `Tailwind-based_website_theme_suggestion.md` for full detail. Summary:

**Brand promise:** *Agents that move together.*
**Personality:** Clean, technical, trustworthy, slightly poetic, developer-first.

### Color System
| Token | Hex | Use |
|-------|-----|-----|
| `starling-ink` | `#0B1020` | Primary dark, body text on dark |
| `starling-night` | `#111827` | Dark surface |
| `starling-dusk` | `#1E293B` | Secondary surface |
| `starling-sky` | `#38BDF8` | Primary brand / Alex |
| `starling-cyan` | `#BAE6FD` | Soft brand accent |
| `starling-silver` | `#94A3B8` | Muted text |
| `starling-cloud` | `#F8FAFC` | Light background |
| `starling-mist` | `#EAF6FF` | Light surface |

**Agent accent colors:** Alex `#38BDF8`, Cass `#A78BFA`, Nigel `#F59E0B`, Codey `#2DD4BF`.

**Typography:** Inter (body), JetBrains Mono (code).

**Visual metaphor:** A murmuration of starlings — multiple small agents coordinating to create a larger, coherent output. Abstract flock marks used sparingly in backgrounds and hero sections.

---

## 8. Target Audiences for the Portal

1. **Solo developers** — want to view their own pipeline run history and costs
2. **Enterprise teams** — care about audit trails, governance, team-wide run metrics
3. **Admins** — need key management and the ability to revoke access

---

## 9. Open Questions for System Spec Discussion

- **Multi-tenancy model**: Are users isolated by account, or is there a workspace/org concept?
- **Telemetry push vs pull**: Pipeline pushes POST to portal API — confirmed direction?
- **Key scoping**: Should API keys be per-user, per-project, or both?
- **Data retention**: How long are run records stored? Any purge policy?
- **Auth for the web UI**: Email/password? OAuth (GitHub)? Magic link?
- **Real-time updates**: Should the dashboard update live as pipeline runs complete?
- **Public vs private**: Are run histories ever shareable/public?
