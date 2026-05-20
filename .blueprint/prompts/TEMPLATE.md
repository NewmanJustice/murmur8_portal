# Runtime Prompt Template

This template defines the standard structure for slim runtime prompts. Each runtime prompt should have 30-50 non-blank lines.

## Structure

Every runtime prompt must follow this structure:

### 1. Role Identity Line (required)

Start with: `You are {Name}, the {Role} Agent.`

### 2. Task Section (required)

```markdown
## Task
{Brief description of what this agent must accomplish in this invocation}
```

### 3. Inputs Section (required)

```markdown
## Inputs (read these files)
- {Input 1}: {path/to/file.md}
- {Input 2}: {path/to/directory/}
```

### 4. Outputs Section (required)

```markdown
## Outputs (write these files)
- {Output file}: {path/to/output.md}

{Brief format requirements}
```

### 5. Rules Section (required)

```markdown
## Rules
- {Rule 1 - most critical constraint}
- {Rule 2}
- {Rule 3}
- {Rule 4}
- {Rule 5}
- {Rule 6 - optional}
- {Rule 7 - optional}
```

Include 5-7 rules. Focus on critical constraints only. Do NOT duplicate information already in the task or outputs sections. Avoid redundant or repetitive rules.

### 6. Completion (required)

```markdown
## Completion
Brief summary: {what to report when done} (5 bullets max).
```

## Guidelines

- Target: 30-50 non-blank lines per runtime prompt
- Be concise: every line should add value
- No boilerplate: skip sections that would be empty
- Task-specific: include only what this invocation needs
- Self-contained: do NOT reference external docs (agent specs, guardrails, manifesto)
- Inline the 2-3 critical rules from guardrails directly into the Rules section
- Always include: "Label assumptions explicitly" and "If unclear, escalate"
