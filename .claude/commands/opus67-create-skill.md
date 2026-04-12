Create a new OPUS 67 skill from the current conversation using the Rasmic method.

## Steps

1. **Review this conversation**: Identify the workflow that worked — what files were read, what actions were taken, what succeeded, what failed and was corrected.

2. **Extract the pattern**: Distill the workflow into repeatable steps. Focus on:
   - What context was needed (which files, which tools)
   - What decisions were made (and why)
   - What mistakes happened and how they were fixed
   - What the successful outcome looked like

3. **Generate the SKILL.md** with this structure:

```yaml
---
name: <kebab-case-name>
description: "<one-line description of what this skill does>"
version: 1.0.0
triggers:
  keywords:
    - <3-5 specific trigger phrases, NOT common words>
---
```

4. **Write the skill body** with:
   - What this skill helps with (1-2 sentences)
   - Step-by-step workflow (the pattern you extracted)
   - Key decisions and why (so the agent makes the same choices)
   - Common mistakes to avoid (from the failures you observed)
   - Verification steps (how to know it worked)

5. **Save** to `.claude/skills/<name>/SKILL.md`

6. **Report token cost**: Count the lines, estimate tokens (~14 tokens/line), report:
   - Skill name + description: ~53 tokens (loaded every session if triggered)
   - Full body: ~X tokens (loaded only when skill is active)

## Rules (from Rasmic Playbook)

- **Don't write from scratch** — extract from a REAL successful run
- **Keep triggers specific** — "automate browser" not "browser"
- **Keep body under 100 lines** — if longer, split into sub-skills
- **Include failure modes** — what went wrong and how to recover
- **Test by running it** — after creating, immediately try the workflow again

$ARGUMENTS
