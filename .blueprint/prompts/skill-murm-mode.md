# Murmuration Mode (Steps M0-M8)

Load this file when multiple slugs are detected in `/implement-feature` arguments.

---

## Step M0: Multi-Feature Detection

**Trigger:** More than one slug provided in arguments.

Parse all slugs from arguments:
```
/implement-feature feat-a feat-b feat-c --no-commit
→ slugs = ["feat-a", "feat-b", "feat-c"]
→ flags = { noCommit: true }
```

**Routing:**
- If `slugs.length > 1`: Enter murmuration mode (Steps M1-M8)
- If `slugs.length === 1`: Continue to Step 1 (single-feature mode)
- If `--sequential` flag: Run features one at a time without worktrees

---

## Step M1: Multi-Feature Pre-flight Validation

For EACH slug, verify:
1. Feature spec exists at `.blueprint/features/feature_{slug}/FEATURE_SPEC.md`
2. Spec has required sections (Intent, Scope, Actors)

**On any failure:**
- Show which features are not ready
- Ask: "Continue with ready features only?" or "Abort"

---

## Step M2: Conflict Detection

Scan implementation plans (if they exist) for file overlap:

```bash
grep -h "src/\|lib/\|bin/" .blueprint/features/feature_*/IMPLEMENTATION_PLAN.md
```

**On conflict:** Ask user to confirm or adjust feature list.

---

## Step M3: Create Worktrees

```bash
git status --porcelain
git worktree add .claude/worktrees/feat-{slug} -b feature/{slug}
```

---

## Step M4: Spawn Parallel Feature Pipelines

**CRITICAL:** Use multiple Task tool calls IN THE SAME MESSAGE to run concurrently.

### Task Prompt Template (for each slug):

```
You are running the implement-feature pipeline for "{slug}".

## Working Directory
All file operations must use this worktree: .claude/worktrees/feat-{slug}

## Task
Run the complete feature pipeline in the worktree:

1. Read Feature Spec: .claude/worktrees/feat-{slug}/.blueprint/features/feature_{slug}/FEATURE_SPEC.md
2. Classify Feature (technical → skip step 3)
3. Cass (if user-facing) — Write story-*.md + handoff-cass.md
4. Nigel — Write test-spec.md + test file + handoff-nigel.md
5. Codey Plan — Write IMPLEMENTATION_PLAN.md
6. Codey Implement — Write code, iterate until tests pass

## Rules
- Work ONLY within .claude/worktrees/feat-{slug}
- Do NOT commit changes (will be merged later)
- Run tests from within the worktree directory

## Completion
PIPELINE_RESULT: {"slug": "{slug}", "status": "success|failed", "tests": "X/Y passing", "files": [...], "error": "if failed, why"}
```

---

## Step M5: Collect Results

Wait for ALL sub-agents to complete. Parse each PIPELINE_RESULT.

---

## Step M5.5: Diff Preview & Commit Worktree Changes

For each successful pipeline (unless `--no-diff-preview`):
- Show diff, user approves/aborts per worktree
- Commit approved worktrees:

```bash
cd /absolute/path/to/.claude/worktrees/feat-{slug}
git add -A
git commit -m "feat({slug}): {summary}

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Return to main repo before merging.

---

## Step M6: Merge Successful Features

```bash
git checkout main
git merge feature/{slug} --no-ff -m "feat({slug}): Add {slug} feature

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**On merge conflict:** Record conflict, preserve worktree, continue with others.

After all merges, remove merged features from `{BACKLOG}` (if it exists).

---

## Step M7: Report Summary

Report: landed features, conflicts, failed pipelines, next steps.

---

## Step M8: Cleanup Worktrees

```bash
git worktree remove .claude/worktrees/feat-{slug} --force
git branch -d feature/{slug}
```

Preserve worktrees for failed pipelines and merge conflicts.
