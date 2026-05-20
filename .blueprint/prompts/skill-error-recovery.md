# Error Handling & Recovery

Load this file when a pipeline stage fails or on resume from queue.

---

## Error Handling with Smart Retry

**Modules:** `src/retry.js`, `src/feedback.js`, `src/insights.js`

After each agent spawn, if the Task tool returns an error or output validation fails:

### 1. Analyze Failure Context

- Check feedback chain for clues (e.g., Cass flagged "unclear-scope")
- Check history for patterns: `node bin/cli.js insights --failures --json`
- If stage has >20% failure rate, suggest alternative strategy

### 2. Get Retry Strategy Recommendation

**Available strategies:**
| Strategy | Effect |
|----------|--------|
| `retry` | Simple retry with same prompt |
| `simplify-prompt` | Reduce scope: "Focus only on core happy path" |
| `add-context` | Include more output from previous stages |
| `reduce-stories` | Ask for fewer, more focused stories |
| `simplify-tests` | Ask for fewer, essential tests only |
| `incremental` | Implement one test at a time |

### 3. Ask User with Recommendation

```
## Stage Failed: {stage}

Feedback context: {relevant feedback issues}
History: This stage fails {rate}% of the time
Recommended strategy: {strategy}

Options:
1. Retry with "{strategy}" strategy (recommended)
2. Retry with simple retry
3. Skip this stage (warning: missing artifacts)
4. Abort pipeline
```

### 4. Apply Strategy and Retry

Modify the agent prompt with additional context based on chosen strategy.

### 5. Record Failure in History

```javascript
historyEntry.stages[stage] = {
  status: "failed",
  failedAt: "...",
  attempts: N,
  lastStrategy: "{strategy}",
  feedbackContext: ["{issues}"]
};
```

---

## Queue Structure

Location: `.claude/implement-queue.json`

```json
{
  "lastUpdated": "ISO timestamp",
  "current": { "slug": "...", "stage": "...", "startedAt": "..." },
  "alexQueue": [],
  "cassQueue": [],
  "nigelQueue": [],
  "codeyQueue": [],
  "completed": [{ "slug": "...", "testCount": N, "commitHash": "..." }],
  "failed": [{ "slug": "...", "stage": "...", "reason": "...", "attemptCount": N }]
}
```

---

## Recovery

Run `/implement-feature` again — reads queue and resumes from `current.stage`.
