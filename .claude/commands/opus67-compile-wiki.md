Compile recent knowledge from the agnt-wiki memory/ directory into durable wiki articles using the Compiled Truth pattern.

## Steps

1. **Read recent memory entries**: Use `opus67_wikiSearch` to find recent entries in `memory/` directory
2. **Read the wiki index**: Use `opus67_wikiRead` with path `_index.md` to understand current wiki structure
3. **Group by topic**: Identify which existing wiki pages each memory entry relates to (venues, agents, platform, business)
4. **For each topic with new information**:
   a. Read the existing wiki page with `opus67_wikiRead`
   b. If the page uses Compiled Truth format (has `---` separator):
      - Update the compiled truth section above `---` with the new synthesis
      - Append new evidence entries below `---` with date and source
   c. If the page doesn't use Compiled Truth format yet:
      - Convert it: move current content to compiled truth section, add `---`, start evidence trail
   d. Write back with `opus67_wikiWrite`
5. **Create [[wikilinks]]** between related pages where they don't exist yet
6. **Update _index.md** if any new pages were created
7. **Report**: List what was compiled, what was created, what was linked

## Compiled Truth Format

```markdown
## Compiled Truth
[Current synthesis — rewritten each time]

---

## Evidence Trail
### YYYY-MM-DD — Source
- What was learned
```

Use the `wiki-compiler` skill for the full pattern reference.

$ARGUMENTS
