---
name: feedback-implement-directly
description: "When tests are written and plan is clear, implement directly rather than spawning Codey sub-agents"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3bfd0fb3-e15c-4271-9cf7-8bdae66d8f89
---

For straightforward implementation steps (extending an interface, adding compute logic, adding JSX cards), implement directly using Edit/Write rather than spawning a Codey sub-agent. Sub-agents add latency and can hit token limits mid-task (happened with Nigel writing tests today — hit the 4096 output token limit and produced nothing).

**Why:** Token limit errors on sub-agents leave no output; direct implementation is faster and more reliable for focused, well-understood changes.

**How to apply:** Use sub-agents for Alex (spec), Cass (stories), Nigel (test spec + handoff) where the output is exploratory. For Codey's implementation steps when the plan is clear and files are known, implement directly.
