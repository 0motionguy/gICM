---
name: task-planning
description: "GSD-style task planning with read_first + acceptance_criteria + action triple requirement."
version: 1.0.0
triggers:
  keywords:
    - plan task
    - plan tasks
    - create plan
    - task planning
    - acceptance criteria
---

# Task Planning — GSD Triple Requirement Pattern

Inspired by GSD (51K stars). Every planned task MUST have three fields. No exceptions.

## The Triple Requirement

### 1. `read_first` — Files to read before touching anything
```yaml
read_first:
  - src/lib/auth.ts          # Current auth implementation
  - packages/opus67/src/mcp-server/handlers.ts  # Existing handler pattern
  - .claude/skills/OPUS67/SKILL.md              # Current skill catalog
```
**Why**: Prevents "fix in wrong file" and "didn't know X already existed" failures.

### 2. `acceptance_criteria` — Grep-verifiable conditions
```yaml
acceptance_criteria:
  - grep -r "handleWikiCompile" packages/opus67/src/  # Handler exists
  - grep "opus67_wikiCompile" packages/opus67/src/mcp-server/tools.ts  # Tool defined
  - node -e "require('./dist/mcp-server/handlers.js')"  # Module loads
```
**Why**: If you can't grep for it, it's not done. Eliminates "it should work" claims.

### 3. `action` — Concrete values, not references
```yaml
# BAD:
action: "Add the wiki compile handler similar to the existing ones"

# GOOD:
action: |
  Add function handleWikiCompile(args: ToolArgs) to handlers.ts that:
  1. Reads args.topic (string) and args.sources (string[])
  2. Calls obsidianFetch(`/vault/${topic}`) for existing content
  3. Splits content at first `---` into compiledTruth + evidenceTrail
  4. Appends new evidence with timestamp and source attribution
  5. Returns { content: [{ type: "text", text: updatedPage }] }
```
**Why**: "Similar to existing ones" produces garbage. Concrete values produce correct code.

## Gates Taxonomy (from GSD)

Every checkpoint maps to exactly one gate type:

| Gate | When | Recovery |
|------|------|----------|
| **Pre-flight** | Before starting. Validates preconditions. | Block entry, fix precondition |
| **Revision** | After work. Evaluates output quality. | Loop back with feedback (max 3 iterations) |
| **Escalation** | Unresolvable issue. | Present options to user, wait |
| **Abort** | Dangerous situation. | Stop immediately, preserve state |

### Stall Detection
If issue count doesn't decrease between revision iterations:
- After 2 stalled iterations → escalate to user
- Never burn all iterations hoping it'll fix itself

## Task Template

```markdown
## Task: [descriptive name]

### read_first
- [file1.ts] — [why this file matters]
- [file2.ts] — [what pattern to follow]

### acceptance_criteria
- `grep "functionName" path/to/file.ts` returns match
- `node -e "..."` exits 0
- File X contains Y (specific string)

### action
[Exact description with concrete values, types, line numbers]

### gate
Type: [pre-flight | revision | escalation | abort]
Recovery: [what to do if gate fails]
```

## Anti-Patterns (from GSD)

1. **"Make it work like the other one"** — name the other one, specify the behavior
2. **"Fix the tests"** — which tests? what's the expected output?
3. **"Refactor for clarity"** — what's unclear? what's the target structure?
4. **"Add error handling"** — which errors? what recovery? what message?
5. **"Improve performance"** — what metric? what threshold? what baseline?
