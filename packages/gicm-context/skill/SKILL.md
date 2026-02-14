---
name: gicm-context
description: >
  Precision context injection for AI agents. Indexes skills, scores relevance
  per message, injects top-N within token budget. Saves 70-90% on skill tokens.
user-invocable: true
metadata:
  openclaw:
    emoji: "🎯"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/context"
        label: "Install gICM Context"
---

# @gicm/context

Precision context injection — only load what's relevant.

## How It Works

1. Index all available skills (SKILL.md files)
2. On each message, score skill relevance
3. Inject top-N skills within token budget
4. Skip irrelevant skills (save 70-90% tokens)

## Scoring

| Match Type  | Boost | Example                           |
| ----------- | ----- | --------------------------------- |
| Name        | 10x   | "react" matches react-builder     |
| Tag         | 5x    | "frontend" matches [frontend] tag |
| Description | 3x    | "component" in description        |
| Content     | 1x    | Keyword in body (capped 3x)       |

## Commands

- `context inject <message>` — Get relevant context for a message
- `context index` — Re-index all skills
- `context stats` — Show indexing statistics
- `context list` — List all indexed skills

## Usage

```typescript
import { ContextEngine } from "@gicm/context";

const engine = new ContextEngine({ maxTokens: 8000, maxSkills: 5 });

// Index skills
engine.indexSkills([
  { content: skillMd1, path: "skills/react.md" },
  { content: skillMd2, path: "skills/solana.md" },
]);

// Inject relevant context
const result = engine.inject("Build a React dashboard component");
console.log(result.skills.map((s) => s.skill.name)); // ["react-component-builder"]
console.log(result.prompt); // Formatted context ready for LLM
```
