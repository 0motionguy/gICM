/**
 * Superpower Transformer
 *
 * Transforms obra/superpowers workflow skills to ClawdBot RegistryItem format.
 * Each superpower is a high-level workflow skill that encapsulates
 * best practices for AI-assisted development patterns.
 *
 * @module superpower-transformer
 */

import { z } from "zod";
import type { RegistryItem, ProgressiveDisclosure } from "@/types/registry";

// ============================================================================
// Superpower Markdown Schema
// ============================================================================

/**
 * Schema for parsing superpower markdown frontmatter.
 */
const SuperpowerFrontmatterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500).optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.0.0"),
  author: z.string().default("obra"),
  tags: z.array(z.string()).default([]),
  estimatedTime: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

type SuperpowerFrontmatter = z.infer<typeof SuperpowerFrontmatterSchema>;

/**
 * Parsed superpower content structure.
 */
interface ParsedSuperpower {
  frontmatter: SuperpowerFrontmatter;
  content: string;
  sections: {
    overview?: string;
    whenToUse?: string;
    howItWorks?: string;
    steps?: string[];
    examples?: string[];
    tips?: string[];
  };
}

// ============================================================================
// Superpower Definitions
// ============================================================================

/**
 * Hardcoded superpower definitions based on obra/superpowers patterns.
 * These represent AI-assisted development workflow skills.
 */
const SUPERPOWER_DEFINITIONS: Record<
  string,
  Omit<ParsedSuperpower, "content">
> = {
  "test-driven-development": {
    frontmatter: {
      name: "Test-Driven Development",
      description:
        "Write tests first, then implement. AI assists with test generation, edge cases, and implementation guidance.",
      version: "1.0.0",
      author: "obra",
      tags: ["testing", "tdd", "quality", "workflow"],
      estimatedTime: "varies",
      difficulty: "intermediate",
    },
    sections: {
      overview:
        "TDD workflow where AI helps write failing tests first, then guides implementation to make them pass.",
      whenToUse:
        "When building new features, refactoring existing code, or fixing bugs with clear expected behavior.",
      howItWorks:
        "1. Describe the feature. 2. AI generates failing test. 3. Implement until test passes. 4. Refactor with AI assistance.",
      steps: [
        "Describe the feature or behavior you want to implement",
        "AI generates a failing test that defines the expected behavior",
        "Write the minimum code to make the test pass",
        "AI suggests refactoring opportunities",
        "Iterate until feature is complete with full test coverage",
      ],
      tips: [
        "Start with the simplest test case",
        "Let tests drive the design",
        "Use AI to generate edge case tests",
        "Refactor only when tests are green",
      ],
    },
  },

  "systematic-debugging": {
    frontmatter: {
      name: "Systematic Debugging",
      description:
        "Methodical bug investigation using AI to generate hypotheses, design experiments, and narrow down root causes.",
      version: "1.0.0",
      author: "obra",
      tags: ["debugging", "investigation", "problem-solving", "workflow"],
      estimatedTime: "15-60 minutes",
      difficulty: "intermediate",
    },
    sections: {
      overview:
        "Structured debugging approach where AI helps form hypotheses and design targeted experiments to isolate issues.",
      whenToUse:
        "When facing bugs that aren't immediately obvious, intermittent failures, or complex system interactions.",
      howItWorks:
        "1. Describe symptoms. 2. AI generates hypotheses. 3. Design minimal experiments. 4. Execute and analyze. 5. Narrow scope.",
      steps: [
        "Describe the bug symptoms and reproduction steps",
        "AI generates ranked list of possible causes",
        "Design targeted experiment to test top hypothesis",
        "Execute experiment and share results with AI",
        "Refine hypotheses based on results",
        "Repeat until root cause is identified",
        "AI helps implement and verify the fix",
      ],
      tips: [
        "Start with most likely hypothesis first",
        "Design experiments that can rule out multiple causes",
        "Keep detailed notes of what you've tried",
        "Use binary search to narrow down the problem space",
      ],
    },
  },

  brainstorming: {
    frontmatter: {
      name: "Brainstorming",
      description:
        "Divergent thinking sessions with AI to explore ideas, challenge assumptions, and discover novel solutions.",
      version: "1.0.0",
      author: "obra",
      tags: ["ideation", "creativity", "planning", "workflow"],
      estimatedTime: "10-30 minutes",
      difficulty: "beginner",
    },
    sections: {
      overview:
        "Creative ideation workflow where AI acts as a thinking partner, generating ideas and exploring possibilities.",
      whenToUse:
        "When starting new projects, stuck on a problem, exploring alternatives, or seeking creative solutions.",
      howItWorks:
        "1. State the problem. 2. Generate many ideas without judgment. 3. Build on promising directions. 4. Converge on best options.",
      steps: [
        "Clearly state the problem or opportunity",
        "Ask AI to generate diverse solution approaches",
        "Explore each approach with follow-up questions",
        "Combine and remix promising ideas",
        "Identify constraints and evaluate feasibility",
        "Select top candidates for further development",
      ],
      tips: [
        "Defer judgment during divergent phase",
        "Ask 'what if' questions to push boundaries",
        "Request ideas from different perspectives",
        "Quantity over quality initially",
      ],
    },
  },

  "writing-plans": {
    frontmatter: {
      name: "Writing Plans",
      description:
        "Create detailed implementation plans with AI assistance, breaking down complex tasks into actionable steps.",
      version: "1.0.0",
      author: "obra",
      tags: ["planning", "architecture", "documentation", "workflow"],
      estimatedTime: "15-45 minutes",
      difficulty: "intermediate",
    },
    sections: {
      overview:
        "Structured planning workflow where AI helps decompose goals into detailed, executable plans with clear milestones.",
      whenToUse:
        "Before starting complex features, system designs, migrations, or any multi-step technical work.",
      howItWorks:
        "1. Define goal. 2. Identify constraints. 3. Break into phases. 4. Detail each step. 5. Identify risks. 6. Create timeline.",
      steps: [
        "State the end goal and success criteria",
        "AI helps identify constraints and requirements",
        "Break the work into logical phases",
        "Detail specific tasks within each phase",
        "Identify dependencies between tasks",
        "Flag risks and create mitigation strategies",
        "Estimate time and create milestones",
      ],
      tips: [
        "Start with the end state in mind",
        "Include validation checkpoints",
        "Plan for rollback scenarios",
        "Keep plans living documents",
      ],
    },
  },

  "executing-plans": {
    frontmatter: {
      name: "Executing Plans",
      description:
        "Follow structured plans with AI tracking progress, handling blockers, and adapting to changes.",
      version: "1.0.0",
      author: "obra",
      tags: ["execution", "tracking", "adaptation", "workflow"],
      estimatedTime: "varies",
      difficulty: "intermediate",
    },
    sections: {
      overview:
        "Plan execution workflow where AI tracks progress, helps overcome blockers, and adapts plans as circumstances change.",
      whenToUse:
        "When executing pre-defined plans, especially for complex multi-step tasks requiring coordination.",
      howItWorks:
        "1. Load plan context. 2. Execute step by step. 3. Report progress. 4. Handle blockers. 5. Adapt as needed.",
      steps: [
        "Share the plan with AI for context",
        "Begin with first task, asking AI for implementation guidance",
        "Mark tasks complete and report any issues",
        "When blocked, AI helps troubleshoot or suggest alternatives",
        "Adapt plan if circumstances change",
        "AI helps maintain momentum and focus",
        "Review completed work against success criteria",
      ],
      tips: [
        "Start each session by reviewing plan status",
        "Don't be afraid to revise the plan",
        "Celebrate completed milestones",
        "Document learnings for future plans",
      ],
    },
  },

  "dispatching-parallel-agents": {
    frontmatter: {
      name: "Dispatching Parallel Agents",
      description:
        "Orchestrate multiple AI agents working in parallel on independent tasks for faster completion.",
      version: "1.0.0",
      author: "obra",
      tags: ["parallelism", "orchestration", "agents", "workflow", "advanced"],
      estimatedTime: "varies",
      difficulty: "advanced",
    },
    sections: {
      overview:
        "Advanced workflow for running multiple AI agents simultaneously on independent tasks, dramatically reducing total time.",
      whenToUse:
        "When tasks can be decomposed into independent subtasks, code migrations, bulk operations, or parallel investigations.",
      howItWorks:
        "1. Identify parallel tasks. 2. Define interfaces. 3. Spawn agents. 4. Monitor progress. 5. Merge results.",
      steps: [
        "Analyze task for parallelizable components",
        "Define clear interfaces between parallel tasks",
        "Spawn separate agent sessions for each task",
        "Provide each agent with focused context",
        "Monitor progress across all agents",
        "Handle conflicts and merge results",
        "Validate integrated output",
      ],
      tips: [
        "Keep tasks truly independent",
        "Define clear success criteria for each",
        "Have a merge strategy ready",
        "Start with 2-3 agents before scaling up",
      ],
    },
  },

  "subagent-driven-development": {
    frontmatter: {
      name: "Subagent-Driven Development",
      description:
        "Delegate specialized subtasks to focused subagents while maintaining overall coherence and direction.",
      version: "1.0.0",
      author: "obra",
      tags: ["delegation", "specialization", "agents", "workflow", "advanced"],
      estimatedTime: "varies",
      difficulty: "advanced",
    },
    sections: {
      overview:
        "Development pattern where a main agent coordinates specialized subagents for specific domains or tasks.",
      whenToUse:
        "For complex projects requiring multiple specializations, or when different parts need different AI configurations.",
      howItWorks:
        "1. Main agent plans. 2. Identify specializations. 3. Spawn subagents. 4. Delegate with context. 5. Integrate results.",
      steps: [
        "Main agent creates overall architecture",
        "Identify tasks requiring specialized knowledge",
        "Spawn subagent with appropriate system prompt",
        "Provide subagent with minimal necessary context",
        "Subagent completes task and returns result",
        "Main agent reviews and integrates",
        "Iterate until feature complete",
      ],
      tips: [
        "Keep subagent context focused and minimal",
        "Define clear input/output contracts",
        "Main agent maintains the big picture",
        "Use for genuinely different specializations",
      ],
    },
  },

  "using-git-worktrees": {
    frontmatter: {
      name: "Using Git Worktrees",
      description:
        "Leverage git worktrees for parallel development, enabling multiple agents to work on different branches simultaneously.",
      version: "1.0.0",
      author: "obra",
      tags: ["git", "parallelism", "branching", "workflow", "advanced"],
      estimatedTime: "setup: 5 min, ongoing: varies",
      difficulty: "advanced",
    },
    sections: {
      overview:
        "Git worktree workflow enabling multiple AI agents to work on separate branches in parallel without conflicts.",
      whenToUse:
        "When multiple features need parallel development, reviewing PRs while working, or comparing implementations.",
      howItWorks:
        "1. Create worktrees for branches. 2. Assign agents to worktrees. 3. Work in parallel. 4. Merge when ready.",
      steps: [
        "Create worktree: git worktree add ../feature-branch feature-branch",
        "Open separate terminal/editor for each worktree",
        "Assign different agents to different worktrees",
        "Each agent works independently in their worktree",
        "Periodically sync with main branch",
        "Merge completed features via PRs",
        "Clean up worktrees: git worktree remove ../feature-branch",
      ],
      tips: [
        "Keep worktrees in sibling directories",
        "Use consistent naming conventions",
        "Clean up worktrees when done",
        "Great for code review + active development",
      ],
    },
  },
};

// ============================================================================
// Trigger Pattern Extraction
// ============================================================================

/**
 * Trigger patterns for each superpower workflow.
 * These are natural language patterns that activate the workflow.
 */
const TRIGGER_PATTERNS: Record<string, string[]> = {
  "test-driven-development": [
    "write tests first",
    "tdd",
    "test driven",
    "failing test",
    "red green refactor",
    "test-first",
    "start with tests",
  ],
  "systematic-debugging": [
    "debug this",
    "find the bug",
    "investigate issue",
    "root cause",
    "why is this failing",
    "systematic debug",
    "hunt down bug",
  ],
  brainstorming: [
    "brainstorm",
    "generate ideas",
    "explore options",
    "what if",
    "creative solutions",
    "think outside",
    "ideation",
  ],
  "writing-plans": [
    "create a plan",
    "write plan",
    "implementation plan",
    "break down",
    "roadmap",
    "design document",
    "spec out",
  ],
  "executing-plans": [
    "execute plan",
    "follow the plan",
    "implement plan",
    "work through",
    "step by step",
    "track progress",
  ],
  "dispatching-parallel-agents": [
    "parallel agents",
    "spawn agents",
    "multiple agents",
    "parallel tasks",
    "concurrent work",
    "parallelize",
  ],
  "subagent-driven-development": [
    "subagent",
    "delegate to agent",
    "specialized agent",
    "spawn subagent",
    "agent delegation",
  ],
  "using-git-worktrees": [
    "git worktree",
    "worktrees",
    "parallel branches",
    "multiple branches",
    "worktree add",
  ],
};

// ============================================================================
// Progressive Disclosure Estimates
// ============================================================================

/**
 * Token estimates for progressive disclosure levels.
 */
const DISCLOSURE_ESTIMATES: Record<string, ProgressiveDisclosure> = {
  "test-driven-development": {
    level1Tokens: 80,
    level2Tokens: 2500,
    level3Estimate: 5000,
  },
  "systematic-debugging": {
    level1Tokens: 85,
    level2Tokens: 2800,
    level3Estimate: 4500,
  },
  brainstorming: {
    level1Tokens: 70,
    level2Tokens: 2000,
    level3Estimate: 3500,
  },
  "writing-plans": {
    level1Tokens: 75,
    level2Tokens: 2200,
    level3Estimate: 4000,
  },
  "executing-plans": {
    level1Tokens: 75,
    level2Tokens: 2100,
    level3Estimate: 3800,
  },
  "dispatching-parallel-agents": {
    level1Tokens: 90,
    level2Tokens: 3000,
    level3Estimate: 6000,
  },
  "subagent-driven-development": {
    level1Tokens: 85,
    level2Tokens: 2800,
    level3Estimate: 5500,
  },
  "using-git-worktrees": {
    level1Tokens: 80,
    level2Tokens: 2500,
    level3Estimate: 4000,
  },
};

// ============================================================================
// Transformer Functions
// ============================================================================

/**
 * Converts a superpower name to a valid slug.
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Converts a slug to title case for display.
 */
function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generates the full markdown content for a superpower.
 */
function generateSuperpowerContent(
  slug: string,
  parsed: Omit<ParsedSuperpower, "content">
): string {
  const { frontmatter, sections } = parsed;
  const lines: string[] = [];

  lines.push(`# ${frontmatter.name}`);
  lines.push("");
  lines.push(`> ${frontmatter.description}`);
  lines.push("");

  if (sections.overview) {
    lines.push("## Overview");
    lines.push("");
    lines.push(sections.overview);
    lines.push("");
  }

  if (sections.whenToUse) {
    lines.push("## When to Use");
    lines.push("");
    lines.push(sections.whenToUse);
    lines.push("");
  }

  if (sections.howItWorks) {
    lines.push("## How It Works");
    lines.push("");
    lines.push(sections.howItWorks);
    lines.push("");
  }

  if (sections.steps && sections.steps.length > 0) {
    lines.push("## Steps");
    lines.push("");
    sections.steps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
    lines.push("");
  }

  if (sections.tips && sections.tips.length > 0) {
    lines.push("## Tips");
    lines.push("");
    sections.tips.forEach((tip) => {
      lines.push(`- ${tip}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Transforms a superpower definition into a ClawdBot RegistryItem.
 *
 * @param slug - The superpower slug (e.g., "test-driven-development")
 * @returns RegistryItem configured for the superpower workflow
 */
export function transformSuperpower(slug: string): RegistryItem | null {
  const definition = SUPERPOWER_DEFINITIONS[slug];
  if (!definition) {
    return null;
  }

  const { frontmatter, sections } = definition;
  const id = `superpower-${slug}`;
  const triggerPatterns = TRIGGER_PATTERNS[slug] ?? [];
  const disclosure = DISCLOSURE_ESTIMATES[slug] ?? {
    level1Tokens: 80,
    level2Tokens: 2500,
    level3Estimate: 4500,
  };

  // Generate long description from sections
  const longDescription = [
    sections.overview,
    sections.whenToUse ? `Use when: ${sections.whenToUse}` : undefined,
    sections.howItWorks,
  ]
    .filter(Boolean)
    .join(" ");

  const registryItem: RegistryItem = {
    id,
    kind: "skill",
    name: frontmatter.name,
    slug,
    description:
      frontmatter.description ?? `${frontmatter.name} workflow skill`,
    longDescription: longDescription || undefined,
    category: "Workflow",
    tags: ["superpower", "workflow", "obra", ...(frontmatter.tags ?? [])],
    dependencies: [],
    files: [
      `.claude/skills/superpowers/${slug}.md`,
      `.gemini/skills/superpowers/${slug}.md`,
      `.openai/skills/superpowers/${slug}.md`,
    ],
    install: `npx @clawdbot/cli add skill/superpower-${slug}`,
    envKeys: [],
    installs: 0,
    remixes: 0,
    version: frontmatter.version,

    // Skill v2 fields
    skillId: id,
    progressiveDisclosure: disclosure,

    // UAP fields
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "opus",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    implementations: {
      claude: {
        install: `npx @clawdbot/cli add skill/superpower-${slug}`,
        configFile: `.claude/skills/superpowers/${slug}.md`,
      },
      gemini: {
        install: `npx @clawdbot/cli add skill/superpower-${slug}`,
        configFile: `.gemini/skills/superpowers/${slug}.md`,
      },
      openai: {
        install: `npx @clawdbot/cli add skill/superpower-${slug}`,
        configFile: `.openai/skills/superpowers/${slug}.md`,
      },
    },

    // Workflow-specific fields (for cross-reference)
    triggerPhrase: triggerPatterns[0] ?? slug,
    estimatedTime: frontmatter.estimatedTime,

    // Audit metadata
    audit: {
      lastAudited: new Date().toISOString().split("T")[0],
      qualityScore: 75,
      status: "VERIFIED",
    },
  };

  return registryItem;
}

/**
 * Transforms all known superpowers into RegistryItems.
 *
 * @returns Array of RegistryItem objects for all superpowers
 */
export function transformAllSuperpowers(): RegistryItem[] {
  const slugs = Object.keys(SUPERPOWER_DEFINITIONS);
  const items: RegistryItem[] = [];

  for (const slug of slugs) {
    const item = transformSuperpower(slug);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * Gets the full content for a superpower (for writing to files).
 *
 * @param slug - The superpower slug
 * @returns Markdown content string or null if not found
 */
export function getSuperpowerContent(slug: string): string | null {
  const definition = SUPERPOWER_DEFINITIONS[slug];
  if (!definition) {
    return null;
  }

  return generateSuperpowerContent(slug, definition);
}

/**
 * Gets trigger patterns for a superpower.
 *
 * @param slug - The superpower slug
 * @returns Array of trigger patterns or empty array
 */
export function getSuperpowerTriggers(slug: string): string[] {
  return TRIGGER_PATTERNS[slug] ?? [];
}

/**
 * Lists all available superpower slugs.
 *
 * @returns Array of superpower slug strings
 */
export function listSuperpowerSlugs(): string[] {
  return Object.keys(SUPERPOWER_DEFINITIONS);
}

/**
 * Checks if a given slug is a valid superpower.
 *
 * @param slug - The slug to check
 * @returns True if the slug is a valid superpower
 */
export function isValidSuperpower(slug: string): boolean {
  return slug in SUPERPOWER_DEFINITIONS;
}

// ============================================================================
// Zod Schemas for External Validation
// ============================================================================

/**
 * Schema for validating external superpower definitions (e.g., from markdown files).
 */
export const SuperpowerInputSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  tags: z.array(z.string().max(32)).max(10).default([]),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.0.0"),
  estimatedTime: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  content: z.string().min(10),
  triggerPatterns: z.array(z.string()).min(1).max(20),
});

export type SuperpowerInput = z.infer<typeof SuperpowerInputSchema>;

/**
 * Transforms a validated SuperpowerInput into a RegistryItem.
 *
 * @param input - Validated superpower input
 * @returns RegistryItem for the superpower
 */
export function transformSuperpowerInput(input: SuperpowerInput): RegistryItem {
  const id = `superpower-${input.slug}`;

  // Estimate tokens based on content length
  const contentTokens = Math.ceil(input.content.length / 4);
  const disclosure: ProgressiveDisclosure = {
    level1Tokens: Math.min(100, Math.ceil(contentTokens * 0.03)),
    level2Tokens: Math.min(5000, Math.ceil(contentTokens * 0.5)),
    level3Estimate: contentTokens,
  };

  return {
    id,
    kind: "skill",
    name: input.name,
    slug: input.slug,
    description: input.description,
    category: "Workflow",
    tags: ["superpower", "workflow", "obra", ...input.tags],
    dependencies: [],
    files: [
      `.claude/skills/superpowers/${input.slug}.md`,
      `.gemini/skills/superpowers/${input.slug}.md`,
      `.openai/skills/superpowers/${input.slug}.md`,
    ],
    install: `npx @clawdbot/cli add skill/superpower-${input.slug}`,
    envKeys: [],
    installs: 0,
    remixes: 0,
    version: input.version,
    skillId: id,
    progressiveDisclosure: disclosure,
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "opus",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    implementations: {
      claude: {
        install: `npx @clawdbot/cli add skill/superpower-${input.slug}`,
        configFile: `.claude/skills/superpowers/${input.slug}.md`,
      },
      gemini: {
        install: `npx @clawdbot/cli add skill/superpower-${input.slug}`,
        configFile: `.gemini/skills/superpowers/${input.slug}.md`,
      },
      openai: {
        install: `npx @clawdbot/cli add skill/superpower-${input.slug}`,
        configFile: `.openai/skills/superpowers/${input.slug}.md`,
      },
    },
    triggerPhrase: input.triggerPatterns[0],
    estimatedTime: input.estimatedTime,
    audit: {
      lastAudited: new Date().toISOString().split("T")[0],
      qualityScore: 70,
      status: "VERIFIED",
    },
  };
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Pre-transformed superpower registry items.
 * Ready to be merged into the main registry.
 */
export const SUPERPOWER_SKILLS: RegistryItem[] = transformAllSuperpowers();

/**
 * Superpower metadata for quick lookups.
 */
export const SUPERPOWER_METADATA = Object.entries(SUPERPOWER_DEFINITIONS).map(
  ([slug, def]) => ({
    slug,
    name: def.frontmatter.name,
    description: def.frontmatter.description ?? "",
    tags: def.frontmatter.tags ?? [],
    difficulty: def.frontmatter.difficulty,
    triggers: TRIGGER_PATTERNS[slug] ?? [],
  })
);

export default {
  transformSuperpower,
  transformAllSuperpowers,
  transformSuperpowerInput,
  getSuperpowerContent,
  getSuperpowerTriggers,
  listSuperpowerSlugs,
  isValidSuperpower,
  SUPERPOWER_SKILLS,
  SUPERPOWER_METADATA,
};
