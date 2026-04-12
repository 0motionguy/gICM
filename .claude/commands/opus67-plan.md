Create a GSD-style task plan for the given task description.

For each task in the plan, you MUST include all three fields:

1. **read_first** — List the specific files to read before starting, with a reason for each
2. **acceptance_criteria** — List grep-verifiable or command-verifiable conditions that prove the task is done
3. **action** — Describe exactly what to do with concrete values (not "similar to X" — specify the exact function names, types, and behavior)

Also assign a **gate type** to each task:
- **pre-flight**: validates preconditions before starting
- **revision**: evaluates output quality, loops back with feedback (max 3 iterations)
- **escalation**: surfaces unresolvable issues to the developer
- **abort**: terminates to prevent damage

Format each task as:

```
## Task N: [descriptive name]

### read_first
- path/to/file.ts — [why]

### acceptance_criteria
- `grep "X" path/to/file` returns match
- command exits 0

### action
[Exact steps with concrete values]

### gate
Type: [pre-flight|revision|escalation|abort]
```

Use the `task-planning` skill for reference on the triple requirement pattern.

$ARGUMENTS
