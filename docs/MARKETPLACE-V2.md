# ClawdBot Marketplace V2 - Agent Skills Protocol

> Comprehensive documentation for the Agent Skills v2 integration, progressive disclosure architecture, and API reference.

## Overview

ClawdBot Marketplace v2 introduces the **Agent Skills Protocol** - a standardized way to create, distribute, and consume AI skills across Claude, Gemini, and OpenAI platforms. The v2 schema enables progressive disclosure, token optimization, and cross-platform compatibility.

```
+------------------------------------------------------------------+
|                    ClawdBot MARKETPLACE v2                            |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------------+  +-------------------+  +----------------+ |
|  | Anthropic Skills  |  |   Superpowers     |  |     Commands   | |
|  |   (16 total)      |  |   (8 total)       |  |   (93 total)   | |
|  +-------------------+  +-------------------+  +----------------+ |
|                                                                   |
|  +-------------------+  +-------------------+  +----------------+ |
|  |     Agents        |  |      MCPs         |  |   Workflows    | |
|  |   (108 total)     |  |   (82 total)      |  |   (15 total)   | |
|  +-------------------+  +-------------------+  +----------------+ |
|                                                                   |
|  +-------------------+                                            |
|  |    Settings       |                                            |
|  |   (7 total)       |                                            |
|  +-------------------+                                            |
|                                                                   |
+------------------------------------------------------------------+
|                     Progressive Disclosure                        |
|  Level 1: Metadata (~100 tokens) - Always loaded                 |
|  Level 2: Instructions (<5k tokens) - Loaded on match            |
|  Level 3: Resources (unlimited) - Loaded on demand               |
+------------------------------------------------------------------+
```

---

## Agent Skills v2 Schema

### Schema Version

All v2 skills must declare `schemaVersion: "2.0"` at the root level.

### Complete Schema Structure

```typescript
interface AgentSkillV2 {
  // Schema version (required)
  schemaVersion: "2.0";

  // Content levels
  level1: SkillLevel1; // Metadata - always loaded
  level2: SkillLevel2; // Instructions - loaded on match
  level3?: SkillLevel3; // Resources - loaded on demand

  // Progressive disclosure configuration
  progressiveDisclosure: {
    level1Tokens: number; // max 200
    level2Tokens: number; // max 5000
    level3Estimate: number; // unlimited
  };

  // Platform compatibility
  compatibility?: {
    minClaudeVersion?: string;
    requiredCapabilities?: (
      | "code_execution"
      | "web_search"
      | "file_access"
      | "mcp"
    )[];
    platforms: ("claude" | "api" | "claude-code")[];
  };

  // Deployment status
  status: "draft" | "testing" | "published" | "deprecated";
  publishedAt?: string; // ISO 8601 datetime
  deprecatedAt?: string; // ISO 8601 datetime
  deprecationReason?: string;
}
```

### Level 1: Metadata (Always Loaded)

Level 1 contains discovery metadata - minimal information needed to match the skill to user queries. Target: ~100 tokens.

```typescript
interface SkillLevel1 {
  level: 1;
  metadata: {
    // Core identification
    skillId: string; // max 64 chars, lowercase with hyphens
    name: string; // max 64 chars
    description: string; // max 1024 chars

    // Version and author
    version: string; // semver format (e.g., "1.0.0")
    author: string; // max 128 chars

    // Categorization
    category: string; // max 64 chars
    tags: string[]; // max 10 tags, 32 chars each

    // Discovery (optional)
    keywords?: string[]; // max 20 keywords
    homepage?: string; // URL
    repository?: string; // URL
    license?: string; // default: "MIT"
  };

  // Patterns that activate this skill
  triggerPatterns: string[]; // 1-20 patterns

  // Token count for this level
  estimatedTokens: number; // max 200
}
```

### Level 2: Instructions (Loaded on Match)

Level 2 contains the actual skill instructions - loaded when the skill is matched to a user query. Target: <5,000 tokens.

```typescript
interface SkillLevel2 {
  level: 2;

  // Main instructions
  systemPrompt: string; // max 20,000 chars

  // Example interactions (optional)
  examples?: {
    input: string;
    output: string;
    explanation?: string;
  }[];

  // Operating constraints (optional)
  constraints?: string[];

  // Expected output format (optional)
  outputFormat?: string;

  // Token count for this level
  estimatedTokens: number; // max 5000
}
```

### Level 3: Resources (Loaded on Demand)

Level 3 contains external resources - loaded only when explicitly needed. No token limit.

```typescript
interface SkillLevel3 {
  level: 3;

  // External resources
  resources: {
    scripts: string[]; // Executable scripts
    templates: string[]; // Template files
    references: string[]; // Reference documentation
    examples?: string[]; // Example files
    schemas?: string[]; // JSON/Zod schemas
  };

  // Code execution capabilities (optional)
  codeExecution?: {
    sandbox: boolean; // default: true
    networkAccess: boolean; // default: false
    preinstalledPackages: string[];
    maxExecutionTime?: number; // 1000-300000 ms
    memoryLimit?: number; // 64-4096 MB
  };

  // External API integrations (optional)
  externalApis?: {
    name: string;
    baseUrl: string;
    authType: "none" | "api_key" | "bearer" | "oauth";
    rateLimit?: number;
  }[];

  // Token estimate (can be large)
  estimatedTokens?: number;
}
```

---

## Progressive Disclosure Architecture

Progressive disclosure is the core optimization that reduces token consumption by 74-89%.

### How It Works

```
User Query: "Build a Solana bonding curve"
              |
              v
+---------------------------+
| LEVEL 1: Skill Detection  |  <-- Always in memory
| - Match query to patterns |      ~100 tokens per skill
| - Score relevance         |      141 skills = 14,100 tokens
+---------------------------+
              |
              v (if matched)
+---------------------------+
| LEVEL 2: Load Instructions|  <-- On-demand
| - Full system prompt      |      ~2,000-5,000 tokens
| - Examples & constraints  |      Only for matched skills
+---------------------------+
              |
              v (if needed)
+---------------------------+
| LEVEL 3: Load Resources   |  <-- On-demand
| - Scripts & templates     |      Unlimited
| - External API configs    |      Only when explicitly requested
+---------------------------+
```

### Token Savings by Approach

| Approach            | System Prompt | Per Request | Monthly (10k requests) |
| ------------------- | ------------- | ----------- | ---------------------- |
| Naive (all skills)  | 150,000       | 150,000     | 1.5B tokens            |
| Level 1 only        | 14,100        | 14,100      | 141M tokens            |
| Level 1 + 3 matched | 14,100        | 24,100      | 241M tokens            |
| **Savings**         | **91%**       | **84%**     | **84%**                |

### Trigger Patterns

Skills are matched using trigger patterns - semantic phrases that indicate when a skill should be activated.

```typescript
// Example: solana-anchor-expert
triggerPatterns: [
  "build solana program",
  "anchor framework",
  "create bonding curve",
  "pda derivation",
  "cross-program invocation",
  "solana token launch",
  "liquidity pool solana",
];
```

The detection algorithm:

1. Tokenizes user query
2. Computes semantic similarity against all Level 1 patterns
3. Returns top 3 matches with score > 0.7
4. Loads Level 2 for matched skills

---

## Registry Item Schema

All marketplace items (agents, skills, commands, MCPs, workflows) use the unified `RegistryItem` schema.

### Base Schema

```typescript
interface RegistryItem {
  // Identity
  id: string;
  kind:
    | "agent"
    | "skill"
    | "command"
    | "mcp"
    | "setting"
    | "workflow"
    | "component";
  name: string;
  slug: string;
  description: string;
  longDescription?: string;

  // Categorization
  category: string;
  tags: string[];

  // Dependencies
  dependencies?: string[]; // Other item IDs
  files?: string[]; // File paths

  // Installation
  install: string; // CLI command
  setup?: string; // Setup instructions
  envKeys?: string[]; // Required env variables

  // Metadata
  repoPath?: string;
  docsUrl?: string;
  version?: string;
  changelog?: string;
  screenshot?: string;

  // Metrics
  installs?: number;
  remixes?: number;
  tokenSavings?: number; // Percentage (for skills)

  // Agent-specific
  layer?: ".agent" | ".claude" | ".gemini" | ".openai" | "docs";
  modelRecommendation?: "sonnet" | "opus" | "opus-4.5" | "haiku";

  // Agent Skills v2 fields
  skillId?: string;
  progressiveDisclosure?: ProgressiveDisclosure;
  codeExecution?: CodeExecution;
  resources?: SkillResources;

  // Multi-platform fields (UAP)
  platforms?: ("claude" | "gemini" | "openai")[];
  compatibility?: {
    models: string[];
    software: ("vscode" | "cursor" | "terminal" | "windsurf")[];
  };
  implementations?: {
    claude?: { install: string; configFile?: string };
    gemini?: { install: string; configFile?: string };
    openai?: { install: string; configFile?: string };
  };

  // Quality audit
  audit?: {
    lastAudited: string;
    qualityScore: number; // 0-100
    status: "VERIFIED" | "NEEDS_FIX" | "FLAGGED" | "DEPRECATED";
    issues?: string[];
  };
}
```

### Workflow Schema Extension

Workflows extend RegistryItem with orchestration capabilities:

```typescript
interface Workflow extends RegistryItem {
  kind: "workflow";
  steps: WorkflowStep[];
  orchestrationPattern: "sequential" | "parallel" | "conditional" | "hybrid";
  triggerPhrase: string; // e.g., "/deploy-defi"
  estimatedTime: string; // e.g., "2-4 hours"
  timeSavings?: number; // Percentage
  requiredAgents: string[];
  requiredCommands: string[];
  requiredSkills: string[];
}

interface WorkflowStep {
  name: string;
  description?: string;
  agent?: string; // Agent ID to invoke
  command?: string; // Command slug to run
  skill?: string; // Skill ID to activate
  condition?: string; // Conditional logic
  parallel?: boolean; // Run in parallel
  onError?: "fail" | "continue" | "retry";
  retryCount?: number;
}
```

---

## API Endpoints

### GET /api/registry

Returns the complete registry of all items.

**Response:**

```json
{
  "agents": [...],
  "skills": [...],
  "commands": [...],
  "mcps": [...],
  "settings": [...],
  "workflows": [...]
}
```

### GET /api/search

Search items by query with optional filters.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `kind` | string | No | Filter by item kind |
| `tag` | string | No | Filter by tag |

**Example:**

```
GET /api/search?q=solana&kind=agent&tag=DeFi
```

**Response:**

```json
[
  {
    "id": "icm-anchor-architect",
    "kind": "agent",
    "name": "ICM Anchor Architect",
    "score": 0.95,
    ...
  }
]
```

### GET /api/items/[slug]

Get a single item by slug.

**Example:**

```
GET /api/items/icm-anchor-architect
```

**Response:**

```json
{
  "id": "icm-anchor-architect",
  "kind": "agent",
  "name": "ICM Anchor Architect",
  "description": "...",
  "files": [".claude/agents/icm-anchor-architect.md", ...],
  ...
}
```

### GET /api/items/[slug]/files

Get the actual file content for an item.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | No | Target platform (claude, gemini, openai) |

**Example:**

```
GET /api/items/icm-anchor-architect/files?platform=claude
```

**Response:**

```json
{
  "files": [
    {
      "path": ".claude/agents/icm-anchor-architect.md",
      "content": "# ICM Anchor Architect\n\n..."
    }
  ]
}
```

### GET /api/items/stats

Get aggregate statistics for the marketplace.

**Response:**

```json
{
  "totalItems": 593,
  "totalInstalls": 45230,
  "totalRemixes": 12450,
  "byKind": {
    "agent": 108,
    "skill": 96,
    "command": 93,
    "mcp": 82,
    "workflow": 15,
    "setting": 7
  }
}
```

### GET /api/items/stats/[itemId]

Get statistics for a specific item.

**Response:**

```json
{
  "itemId": "icm-anchor-architect",
  "installs": 1547,
  "remixes": 623,
  "weeklyInstalls": 234,
  "weeklyRemixes": 89
}
```

### GET /api/bundles/generate

Generate an optimized bundle for a use case.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `useCase` | string | Yes | Target use case |
| `platform` | string | No | Target platform |

**Example:**

```
GET /api/bundles/generate?useCase=solana-defi&platform=claude
```

---

## Validation Rules

### Skill ID Validation

```typescript
// Valid
"solana-anchor-expert";
"nextjs-14-app-router";
"typescript-strict-mode";

// Invalid
"claude-expert"; // Contains reserved word
"my-skill-"; // Ends with hyphen
"-my-skill"; // Starts with hyphen
"MY_SKILL"; // Uppercase
"my skill"; // Contains space
```

### Reserved Words

The following words cannot appear in skill IDs or names:

- `anthropic`
- `claude`
- `official`

### Token Limits

| Level   | Max Tokens | Purpose                |
| ------- | ---------- | ---------------------- |
| Level 1 | 200        | Metadata for discovery |
| Level 2 | 5,000      | Instructions           |
| Level 3 | Unlimited  | External resources     |

---

## Example: Creating a v2 Skill

```typescript
const mySkill: AgentSkillV2 = {
  schemaVersion: "2.0",

  level1: {
    level: 1,
    metadata: {
      skillId: "solana-token-launch",
      name: "Solana Token Launch Expert",
      description:
        "Comprehensive expertise for launching tokens on Solana with bonding curves, liquidity pools, and fee routing.",
      version: "1.0.0",
      author: "ClawdBot",
      category: "Blockchain",
      tags: ["Solana", "DeFi", "Token Launch", "Anchor"],
      license: "MIT",
    },
    triggerPatterns: [
      "launch solana token",
      "create bonding curve",
      "token launch platform",
      "pump.fun clone",
      "liquidity pool setup",
    ],
    estimatedTokens: 95,
  },

  level2: {
    level: 2,
    systemPrompt: `You are a Solana token launch expert...`,
    examples: [
      {
        input: "Create a constant product bonding curve",
        output: "Here's an Anchor implementation...",
        explanation: "Uses x*y=k formula with slippage protection",
      },
    ],
    constraints: [
      "Always use checked arithmetic",
      "Validate all PDA derivations",
      "Include comprehensive error handling",
    ],
    estimatedTokens: 2800,
  },

  level3: {
    level: 3,
    resources: {
      scripts: ["scripts/deploy-program.sh"],
      templates: ["templates/bonding-curve.rs", "templates/liquidity-pool.rs"],
      references: ["docs/solana-runtime.md", "docs/anchor-framework.md"],
    },
    codeExecution: {
      sandbox: true,
      networkAccess: false,
      preinstalledPackages: ["@coral-xyz/anchor", "@solana/web3.js"],
    },
    estimatedTokens: 15000,
  },

  progressiveDisclosure: {
    level1Tokens: 95,
    level2Tokens: 2800,
    level3Estimate: 15000,
  },

  compatibility: {
    requiredCapabilities: ["code_execution", "file_access"],
    platforms: ["claude", "claude-code"],
  },

  status: "published",
  publishedAt: "2024-12-01T00:00:00Z",
};
```

---

## Migration from v1

### Key Changes

| v1                  | v2                          | Notes                     |
| ------------------- | --------------------------- | ------------------------- |
| Flat structure      | 3-level progressive         | Reduces token consumption |
| No trigger patterns | `triggerPatterns` array     | Enables semantic matching |
| No token tracking   | `estimatedTokens` per level | Enables optimization      |
| Single platform     | Multi-platform              | UAP compatibility         |
| No validation       | Strict Zod schemas          | Type safety               |

### Migration Steps

1. **Add schema version**

   ```typescript
   schemaVersion: "2.0";
   ```

2. **Split content into levels**
   - Level 1: Extract metadata and trigger patterns
   - Level 2: Move instructions to systemPrompt
   - Level 3: Externalize resources

3. **Add token estimates**
   - Count tokens for each level
   - Optimize Level 2 to stay under 5k

4. **Define trigger patterns**
   - 5-20 patterns per skill
   - Mix of specific and general phrases

5. **Add progressive disclosure config**
   ```typescript
   progressiveDisclosure: {
     level1Tokens: 100,
     level2Tokens: 2500,
     level3Estimate: 10000
   }
   ```

---

## See Also

- [Contributing Skills](./CONTRIBUTING-SKILLS.md) - How to create new skills
- [MCP Integration](./MCP-INTEGRATION.md) - MCP server documentation
- [Multi-Platform Architecture](./MULTI_PLATFORM.md) - Cross-platform support
- [Agent Architecture](./AGENT-ARCHITECTURE.md) - Full system architecture
