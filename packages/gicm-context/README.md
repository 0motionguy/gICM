# @gicm/context

> Precision context injection for AI agents — index skills, score relevance per-message, inject within token budget

## The Problem

AI agents waste 70-90% of context tokens by loading ALL skills/documents into EVERY prompt, even when irrelevant.

Example: Your agent has 50 skills (200k tokens). User asks "Build a React component". Agent loads all 50 skills, wasting tokens on Solana, Docker, database, etc.

## The Solution

`@gicm/context` is a precision context injection engine:

1. **Index once** — Parse all available skills (SKILL.md files)
2. **Score per-message** — Calculate relevance score for each skill based on query
3. **Inject top-N** — Load only the most relevant skills, within a token budget
4. **Save 70-90%** — Skip irrelevant skills entirely

## Installation

```bash
pnpm add @gicm/context
```

## Quick Start

```typescript
import { ContextEngine } from "@gicm/context";

// Create engine with token budget
const engine = new ContextEngine({
  maxTokens: 8000, // Token budget per message
  maxSkills: 5, // Max skills to inject
});

// Index skills
engine.indexSkills([
  { content: reactSkillMd, path: "skills/react.md" },
  { content: solanaSkillMd, path: "skills/solana.md" },
  { content: dockerSkillMd, path: "skills/docker.md" },
]);

// Inject relevant context
const result = engine.inject("Build a React dashboard component");

console.log(result.skills.map((s) => s.skill.name));
// ["react-component-builder"] — Only React, skipped Solana/Docker

console.log(result.totalTokens);
// 2,341 — Saved 80% compared to loading all skills

console.log(result.prompt);
// Formatted context ready for LLM injection
```

## Scoring Algorithm

Skills are scored by keyword matching with boosted weights:

| Match Type      | Boost | Example                                        |
| --------------- | ----- | ---------------------------------------------- |
| **Name**        | 10x   | "react" matches `react-component-builder`      |
| **Tag**         | 5x    | "frontend" matches `[frontend, ui, react]` tag |
| **Description** | 3x    | "component" in description                     |
| **Content**     | 1x    | Keyword in body (capped at 3x per word)        |

Query: `"Build a React component with TypeScript"`

- "react" → nameMatch (10) + tagMatch (5) + contentMatch (3) = 18
- "typescript" → tagMatch (5) + descriptionMatch (3) = 8
- "component" → descriptionMatch (3) + contentMatch (2) = 5

Total score: **31**

## API Reference

### `ContextEngine`

Main class for context injection.

```typescript
const engine = new ContextEngine({
  maxTokens: 8000, // Token budget per injection
  maxSkills: 5, // Max skills to inject
  boostFactors: {
    // Scoring weights
    nameMatch: 10,
    tagMatch: 5,
    descriptionMatch: 3,
    contentMatch: 1,
  },
  excludePatterns: [], // Glob patterns to skip
});
```

#### Methods

**`indexSkills(sources: Array<{ content: string; path: string }>): number`**

Index skills from SKILL.md content. Returns count of successfully indexed skills.

```typescript
const count = engine.indexSkills([{ content: skillMd, path: "react.md" }]);
```

**`inject(message: string): InjectionResult`**

Inject relevant context for a message.

```typescript
const result = engine.inject("Build a dashboard");
// {
//   skills: [{ skill, score, matchReasons }],
//   totalTokens: 2341,
//   budgetUsed: 0.29,
//   prompt: "## Loaded Context\n\n### react-component-builder..."
// }
```

**`getStats(): ContextStats`**

Get indexing statistics.

```typescript
const stats = engine.getStats();
// {
//   totalSkills: 50,
//   totalTokens: 198431,
//   lastIndexed: Date,
//   avgTokensPerSkill: 3968,
//   topSkills: [{ id: "react-...", hitCount: 47 }]
// }
```

**`getSkill(id: string): SkillEntry | undefined`**

Get a specific skill by ID.

**`removeSkill(id: string): boolean`**

Remove a skill from the index.

**`clear(): void`**

Clear all indexed skills.

**`getSkillIds(): string[]`**

Get all indexed skill IDs.

#### Events

```typescript
engine.on("context:indexed", (count: number) => {
  console.log(`Indexed ${count} skills`);
});

engine.on("context:injected", (skills: string[], tokens: number) => {
  console.log(`Injected ${skills.length} skills (${tokens} tokens)`);
});

engine.on("context:budget-exceeded", (requested: number, budget: number) => {
  console.log(`Skipped skill: ${requested} tokens exceeds budget ${budget}`);
});
```

## SKILL.md Format

Skills must be valid SKILL.md files with YAML frontmatter:

```markdown
---
name: react-component-builder
version: 1.0.0
description: Build React components with TypeScript and Tailwind
author: ICM Motion
tags: [react, typescript, tailwind, frontend]
---

# React Component Builder

Build production-ready React components.

## Patterns

- Use functional components with hooks
- TypeScript strict mode
- Tailwind for styling
```

## Integration with OpenClaw

```typescript
import { ContextEngine } from "@gicm/context";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

// Index all skills from ~/.openclaw/skills/
const skillsDir = join(process.env.HOME!, ".openclaw/skills");
const files = await readdir(skillsDir, { recursive: true });

const sources = await Promise.all(
  files
    .filter((f) => f.endsWith("SKILL.md"))
    .map(async (file) => ({
      content: await readFile(join(skillsDir, file), "utf-8"),
      path: file,
    }))
);

const engine = new ContextEngine();
engine.indexSkills(sources);

// Before each agent message
const userMessage = "Deploy a Solana token on mainnet";
const { prompt } = engine.inject(userMessage);

// Prepend to system prompt
const systemPrompt = `${prompt}\n\n${baseSystemPrompt}`;
```

## Complementary to QMD

- **QMD** — Markdown document indexer (general docs, README, guides)
- **@gicm/context** — Skill-specific indexer (OpenClaw SKILL.md files)

Use both:

- QMD for general documentation
- @gicm/context for skills/workflows

## Performance

- **Indexing**: O(n) where n = total skill content length
- **Injection**: O(m \* k) where m = skills, k = query words
- **Memory**: ~4KB per skill (metadata only, content is indexed)

Typical performance:

- 50 skills, 200k tokens → Index in <50ms
- Inject relevant context → <10ms

## TypeScript

Fully typed with strict mode:

```typescript
import type {
  ContextConfig,
  SkillEntry,
  ScoredSkill,
  InjectionResult,
  ContextStats,
} from "@gicm/context";
```

## Testing

```bash
pnpm test
```

30 comprehensive tests covering:

- Config validation
- SKILL.md parsing
- Relevance scoring
- Context injection
- Token budgets
- Edge cases

## License

MIT © ICM Motion
