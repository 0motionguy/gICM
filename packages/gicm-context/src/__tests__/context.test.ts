import { describe, it, expect, beforeEach } from "vitest";
import { ContextEngine } from "../context-engine.js";
import { scoreSkill, rankSkills } from "../scorer.js";
import { parseSkillMd } from "../parser.js";
import type { SkillEntry, ContextConfig } from "../types.js";
import { ContextConfigSchema } from "../types.js";

const SAMPLE_SKILL_MD = `---
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
`;

const SAMPLE_SKILL_MD_2 = `---
name: solana-token-swap
version: 1.0.0
description: Execute token swaps on Solana using Jupiter
author: ICM Motion
tags: [solana, defi, blockchain, trading]
---

# Solana Token Swap

Execute swaps on Solana blockchain.

## Usage
- Connect to Solana RPC
- Use Jupiter aggregator
- Handle transaction confirmation
`;

const SAMPLE_SKILL_MD_3 = `---
name: database-schema-designer
version: 1.0.0
description: Design PostgreSQL schemas with migrations
author: ICM Motion
tags: [database, postgresql, schema, backend]
---

# Database Schema Designer

Design production-ready database schemas.

## Best Practices
- Use proper indexes
- Foreign key constraints
- Migration versioning
`;

// --- Config Tests (3) ---

describe("ContextConfig", () => {
  it("should validate with defaults", () => {
    const config = ContextConfigSchema.parse({});
    expect(config.maxTokens).toBe(8000);
    expect(config.maxSkills).toBe(5);
    expect(config.boostFactors.nameMatch).toBe(10);
  });

  it("should allow custom config overrides", () => {
    const config = ContextConfigSchema.parse({
      maxTokens: 4000,
      maxSkills: 3,
      boostFactors: { nameMatch: 20 },
    });
    expect(config.maxTokens).toBe(4000);
    expect(config.maxSkills).toBe(3);
    expect(config.boostFactors.nameMatch).toBe(20);
  });

  it("should reject invalid config (maxTokens < 100)", () => {
    expect(() => ContextConfigSchema.parse({ maxTokens: 50 })).toThrow();
  });
});

// --- Parser Tests (5) ---

describe("parseSkillMd", () => {
  it("should parse valid SKILL.md with frontmatter", () => {
    const skill = parseSkillMd(SAMPLE_SKILL_MD, "skills/react.md");
    expect(skill).not.toBeNull();
    expect(skill?.name).toBe("react-component-builder");
    expect(skill?.version).toBe("1.0.0");
    expect(skill?.description).toBe(
      "Build React components with TypeScript and Tailwind"
    );
    expect(skill?.author).toBe("ICM Motion");
  });

  it("should parse tags array", () => {
    const skill = parseSkillMd(SAMPLE_SKILL_MD, "skills/react.md");
    expect(skill?.tags).toEqual([
      "react",
      "typescript",
      "tailwind",
      "frontend",
    ]);
  });

  it("should return null for content without frontmatter", () => {
    const content = "# Just a regular markdown file\n\nNo frontmatter here.";
    const skill = parseSkillMd(content, "test.md");
    expect(skill).toBeNull();
  });

  it("should handle missing optional fields", () => {
    const minimal = `---
name: minimal-skill
description: A minimal skill
tags: [test]
---

Content here.`;
    const skill = parseSkillMd(minimal, "minimal.md");
    expect(skill?.version).toBeUndefined();
    expect(skill?.author).toBeUndefined();
  });

  it("should estimate tokens correctly", () => {
    const skill = parseSkillMd(SAMPLE_SKILL_MD, "skills/react.md");
    expect(skill?.tokens).toBe(Math.ceil(SAMPLE_SKILL_MD.length / 4));
  });
});

// --- Scorer Tests (7) ---

describe("scoreSkill", () => {
  const defaultConfig: ContextConfig = ContextConfigSchema.parse({});
  let reactSkill: SkillEntry;

  beforeEach(() => {
    reactSkill = parseSkillMd(SAMPLE_SKILL_MD, "skills/react.md")!;
  });

  it("should give highest boost for name match", () => {
    const scored = scoreSkill(reactSkill, "react component", defaultConfig);
    expect(scored.score).toBeGreaterThanOrEqual(10); // nameMatch boost
    expect(scored.matchReasons).toContain("name:react");
  });

  it("should give medium boost for tag match", () => {
    const scored = scoreSkill(reactSkill, "typescript code", defaultConfig);
    expect(scored.matchReasons.some((r) => r.startsWith("tag:"))).toBe(true);
  });

  it("should give lower boost for description match", () => {
    const scored = scoreSkill(reactSkill, "build components", defaultConfig);
    expect(scored.matchReasons.some((r) => r.startsWith("desc:"))).toBe(true);
  });

  it("should cap content matches at 3 per word", () => {
    // "TypeScript" appears in tags, description, and content
    const scored = scoreSkill(reactSkill, "typescript", defaultConfig);
    const contentMatch = scored.matchReasons.find((r) =>
      r.startsWith("content:")
    );
    if (contentMatch) {
      const count = parseInt(contentMatch.match(/\((\d+)\)/)?.[1] || "0");
      expect(scored.score).toBeLessThanOrEqual(10 + 5 + 3 + 3 * 1); // name + tag + desc + capped content
    }
  });

  it("should return score 0 for no match", () => {
    const scored = scoreSkill(
      reactSkill,
      "blockchain solana defi",
      defaultConfig
    );
    expect(scored.score).toBe(0);
    expect(scored.matchReasons).toEqual([]);
  });

  it("should accumulate scores for multiple query words", () => {
    const scored = scoreSkill(
      reactSkill,
      "react typescript tailwind",
      defaultConfig
    );
    expect(scored.score).toBeGreaterThan(20); // Multiple matches
  });

  it("should rank skills in descending order", () => {
    const skills = [
      parseSkillMd(SAMPLE_SKILL_MD, "react.md")!,
      parseSkillMd(SAMPLE_SKILL_MD_2, "solana.md")!,
      parseSkillMd(SAMPLE_SKILL_MD_3, "db.md")!,
    ];

    const ranked = rankSkills(
      skills,
      "react frontend component",
      defaultConfig
    );
    expect(ranked[0].skill.name).toBe("react-component-builder");
    expect(ranked.length).toBeLessThanOrEqual(skills.length); // Only relevant skills
  });
});

// --- ContextEngine Tests (12) ---

describe("ContextEngine", () => {
  let engine: ContextEngine;

  beforeEach(() => {
    engine = new ContextEngine({ maxTokens: 8000, maxSkills: 5 });
  });

  it("should add and get skill", () => {
    const skill = parseSkillMd(SAMPLE_SKILL_MD, "react.md")!;
    engine.addSkill(skill);
    expect(engine.getSkill(skill.id)).toEqual(skill);
  });

  it("should parse skill from markdown", () => {
    const skill = engine.addSkillFromMarkdown(SAMPLE_SKILL_MD, "react.md");
    expect(skill).not.toBeNull();
    expect(skill?.name).toBe("react-component-builder");
  });

  it("should index skills and emit event", () => {
    let indexedCount = 0;
    engine.on("context:indexed", (count) => {
      indexedCount = count;
    });

    const count = engine.indexSkills([
      { content: SAMPLE_SKILL_MD, path: "react.md" },
      { content: SAMPLE_SKILL_MD_2, path: "solana.md" },
    ]);

    expect(count).toBe(2);
    expect(indexedCount).toBe(2);
  });

  it("should inject relevant skills", () => {
    engine.indexSkills([
      { content: SAMPLE_SKILL_MD, path: "react.md" },
      { content: SAMPLE_SKILL_MD_2, path: "solana.md" },
    ]);

    const result = engine.inject("Build a React dashboard component");
    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.skills[0].skill.name).toBe("react-component-builder");
  });

  it("should respect maxTokens budget", () => {
    const smallEngine = new ContextEngine({ maxTokens: 100, maxSkills: 10 });
    smallEngine.indexSkills([
      { content: SAMPLE_SKILL_MD, path: "react.md" },
      { content: SAMPLE_SKILL_MD_2, path: "solana.md" },
      { content: SAMPLE_SKILL_MD_3, path: "db.md" },
    ]);

    const result = smallEngine.inject("react solana database");
    expect(result.totalTokens).toBeLessThanOrEqual(100);
  });

  it("should respect maxSkills limit", () => {
    const limitedEngine = new ContextEngine({ maxTokens: 10000, maxSkills: 2 });
    limitedEngine.indexSkills([
      { content: SAMPLE_SKILL_MD, path: "react.md" },
      { content: SAMPLE_SKILL_MD_2, path: "solana.md" },
      { content: SAMPLE_SKILL_MD_3, path: "db.md" },
    ]);

    const result = limitedEngine.inject("react solana database");
    expect(result.skills.length).toBeLessThanOrEqual(2);
  });

  it("should skip irrelevant skills (score 0)", () => {
    engine.indexSkills([
      { content: SAMPLE_SKILL_MD, path: "react.md" },
      { content: SAMPLE_SKILL_MD_2, path: "solana.md" },
    ]);

    const result = engine.inject("kubernetes docker deployment");
    expect(result.skills.length).toBe(0);
  });

  it("should emit context:injected event", () => {
    let injectedSkills: string[] = [];
    engine.on("context:injected", (skills) => {
      injectedSkills = skills;
    });

    engine.indexSkills([{ content: SAMPLE_SKILL_MD, path: "react.md" }]);
    engine.inject("react component");

    expect(injectedSkills.length).toBeGreaterThan(0);
  });

  it("should track hit counts in stats", () => {
    engine.indexSkills([{ content: SAMPLE_SKILL_MD, path: "react.md" }]);

    engine.inject("react component");
    engine.inject("react hooks");

    const stats = engine.getStats();
    expect(stats.topSkills.length).toBeGreaterThan(0);
    expect(stats.topSkills[0].hitCount).toBe(2);
  });

  it("should format prompt with skill names and content", () => {
    engine.indexSkills([{ content: SAMPLE_SKILL_MD, path: "react.md" }]);

    const result = engine.inject("react component");
    expect(result.prompt).toContain("## Loaded Context");
    expect(result.prompt).toContain("react-component-builder");
    expect(result.prompt).toContain("Build production-ready React components");
  });

  it("should clear all skills", () => {
    engine.indexSkills([
      { content: SAMPLE_SKILL_MD, path: "react.md" },
      { content: SAMPLE_SKILL_MD_2, path: "solana.md" },
    ]);

    engine.clear();
    expect(engine.getSkillIds()).toEqual([]);
    expect(engine.getStats().totalSkills).toBe(0);
  });

  it("should remove specific skill", () => {
    engine.indexSkills([{ content: SAMPLE_SKILL_MD, path: "react.md" }]);

    const skillId = engine.getSkillIds()[0];
    const removed = engine.removeSkill(skillId);

    expect(removed).toBe(true);
    expect(engine.getSkill(skillId)).toBeUndefined();
  });
});

// --- Edge Cases (3) ---

describe("Edge Cases", () => {
  it("should handle empty skills list", () => {
    const engine = new ContextEngine();
    const result = engine.inject("react component");

    expect(result.skills).toEqual([]);
    expect(result.totalTokens).toBe(0);
    expect(result.prompt).toBe("");
  });

  it("should handle empty query", () => {
    const engine = new ContextEngine();
    engine.indexSkills([{ content: SAMPLE_SKILL_MD, path: "react.md" }]);

    const result = engine.inject("");
    expect(result.skills).toEqual([]);
  });

  it("should skip very large skill if budget exceeded", () => {
    const hugeSkill = `---
name: huge-skill
description: A very large skill
tags: [test]
---

${"#".repeat(40000)}`; // ~10k tokens

    const engine = new ContextEngine({ maxTokens: 5000, maxSkills: 10 });
    engine.indexSkills([
      { content: hugeSkill, path: "huge.md" },
      { content: SAMPLE_SKILL_MD, path: "react.md" },
    ]);

    const result = engine.inject("huge test react");
    // Should skip huge-skill due to budget, but include react if it fits
    expect(result.totalTokens).toBeLessThanOrEqual(5000);
  });
});
