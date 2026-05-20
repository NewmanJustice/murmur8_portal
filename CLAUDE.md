# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Context

This project uses the **murmur8** agent-workflow framework (`/workspaces/murmur8/agent-workflow`). That repo is the canonical source for framework internals, skills, and architecture documentation.

## Agent-Workflow Pattern

murmur8 coordinates four AI agents to automate feature development from specification through implementation:

| Agent | Role |
|-------|------|
| **Alex** | System Specification & Chief-of-Staff — creates/maintains specs, guards design coherence |
| **Cass** | Story Writer/BA — translates specs into testable user stories |
| **Nigel** | Tester — converts stories into executable tests and test plans |
| **Codey** | Developer — implements code to satisfy tests (test-first) |

### Pipeline Flow

```
Alex (feature spec) → [Cass (user stories)] → Nigel (tests) → Codey (plan → implement) → Auto-commit
```

Cass is skipped automatically for technical features (refactoring, optimisation, infrastructure).

### Key Directories

| Path | Purpose |
|------|---------|
| `.blueprint/agents/` | Agent specs (AGENT_*.md) and GUARDRAILS.md |
| `.blueprint/features/` | Feature specs and generated artifacts per feature |
| `.blueprint/system_specification/` | System-level spec (SYSTEM_SPEC.md) |
| `.blueprint/prompts/` | Slim runtime prompts for token efficiency |
| `.blueprint/templates/` | Templates for specs, stories, tests |
| `.blueprint/ways_of_working/` | Development rituals |
| `.business_context/` | Business domain documents (glossary, rules, stakeholders) |
| `.claude/commands/` | Installed skill files |
| `.claude/implement-queue.json` | Pipeline queue state (gitignored) |

### Skills

- `/implement-feature "slug"` — run the full Alex → Cass → Nigel → Codey pipeline
- `/implement-feature "slug" --pause-after=alex|cass|nigel|codey-plan` — pause at a stage for review
- `/implement-feature "slug" --interactive` — force interactive spec creation
- `/implement-feature feat-a feat-b` — multiple slugs triggers murmuration (parallel) mode
- `/refine-feature [slug]` — reopen a completed feature for iterative refinement

### Output Constraints

All agents must write files incrementally (one at a time), keep summaries to 5–10 bullets, and reference artifacts by path rather than quoting content inline.

## Framework Reference

For full architecture details, CLI commands, and source structure see:
`/workspaces/murmur8/agent-workflow/CLAUDE.md`
