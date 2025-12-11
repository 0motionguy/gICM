/**
 * OPUS 67 Mode-Agent Mapping
 * Defines which agents are auto-triggered for each operating mode
 */

// =============================================================================
// TYPES
// =============================================================================

export type Mode =
  | "auto"
  | "ultra"
  | "think"
  | "build"
  | "vibe"
  | "light"
  | "creative"
  | "data"
  | "audit"
  | "swarm"
  | "secure"
  | "test"
  | "docs"
  | "refactor"
  | "deploy"
  | "debug"
  | "review"
  | "plan"
  | "research"
  | "optimize"
  | "migrate"
  | "integrate"
  | "monitor"
  | "scale"
  | "learn"
  | "teach"
  | "explore"
  | "prototype"
  | "release"
  | "hotfix";

export type AgentSelector =
  | "best-match"
  | "round-robin"
  | "all-required"
  | "random";

export interface AgentTriggerConfig {
  autoSpawn: boolean;
  maxParallel: number;
  agentSelector?: AgentSelector;
  requiredAgents?: string[];
  optionalAgents?: string[];
  asyncExecution?: boolean;
  priority?: number;
  description: string;
}

// =============================================================================
// MODE-AGENT MAPPINGS
// =============================================================================

export const MODE_AGENT_MAP: Record<Mode, AgentTriggerConfig> = {
  // === CORE MODES ===
  auto: {
    autoSpawn: true,
    maxParallel: 3,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 50,
    description: "Intelligent agent selection based on task analysis",
  },

  ultra: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["fullstack-orchestrator", "code-reviewer"],
    agentSelector: "all-required",
    asyncExecution: false, // Sequential for deep thinking
    priority: 100,
    description: "Maximum reasoning with architect and reviewer agents",
  },

  think: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["debugging-detective"],
    optionalAgents: ["performance-profiler"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 75,
    description: "Deep analysis with debugging specialist",
  },

  build: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["unit-test-generator"],
    optionalAgents: ["typescript-precision-engineer", "code-reviewer"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 60,
    description: "Production code with test writer",
  },

  vibe: {
    autoSpawn: false,
    maxParallel: 1,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 25,
    description: "Rapid iteration - minimal agent overhead",
  },

  light: {
    autoSpawn: false,
    maxParallel: 0,
    description: "Simple questions - no agents needed",
  },

  // === SPECIALIZED MODES ===
  creative: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["content-strategist", "accessibility-advocate"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 50,
    description: "Visual design with content expertise",
  },

  data: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["data-engineering-specialist"],
    optionalAgents: ["database-schema-oracle"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 60,
    description: "Analytics with data specialist",
  },

  audit: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["security-engineer", "code-reviewer"],
    optionalAgents: [
      "smart-contract-auditor",
      "penetration-testing-specialist",
    ],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 90,
    description: "Security review with auditor agents",
  },

  swarm: {
    autoSpawn: true,
    maxParallel: 5,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 100,
    description: "Multi-agent parallel execution for complex tasks",
  },

  secure: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["security-engineer", "penetration-testing-specialist"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 95,
    description: "Security-focused with pentest agents",
  },

  test: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["unit-test-generator", "e2e-testing-specialist"],
    optionalAgents: ["qa-stress-tester"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 70,
    description: "Testing specialists for comprehensive coverage",
  },

  docs: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["technical-writer-pro"],
    optionalAgents: ["api-documentation-specialist", "readme-architect"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 40,
    description: "Documentation with writing experts",
  },

  refactor: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["code-reviewer"],
    optionalAgents: ["typescript-precision-engineer", "bundler-optimizer"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 60,
    description: "Code quality with review agents",
  },

  deploy: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["deployment-strategist"],
    optionalAgents: ["ci-cd-architect", "cloud-architect"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 85,
    description: "Deployment with DevOps agents",
  },

  debug: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["debugging-detective"],
    optionalAgents: ["log-aggregation-expert", "monitoring-specialist"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 80,
    description: "Debugging with diagnostic specialists",
  },

  review: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["code-reviewer"],
    optionalAgents: ["security-engineer"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 65,
    description: "Code review with quality agents",
  },

  plan: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["fullstack-orchestrator", "project-coordinator"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 55,
    description: "Planning with coordination agents",
  },

  research: {
    autoSpawn: true,
    maxParallel: 3,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 45,
    description: "Research with domain experts",
  },

  optimize: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["performance-profiler"],
    optionalAgents: ["bundler-optimizer", "gas-optimization-specialist"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 70,
    description: "Performance optimization specialists",
  },

  migrate: {
    autoSpawn: true,
    maxParallel: 3,
    optionalAgents: ["database-schema-oracle", "typescript-precision-engineer"],
    agentSelector: "best-match",
    asyncExecution: false,
    priority: 80,
    description: "Migration with schema and type experts",
  },

  integrate: {
    autoSpawn: true,
    maxParallel: 3,
    optionalAgents: ["api-design-architect", "backend-api-specialist"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 65,
    description: "Integration with API specialists",
  },

  monitor: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["monitoring-specialist"],
    optionalAgents: ["log-aggregation-expert"],
    agentSelector: "all-required",
    asyncExecution: true,
    priority: 60,
    description: "Observability with monitoring agents",
  },

  scale: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["cloud-architect", "performance-profiler"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 75,
    description: "Scaling with infrastructure experts",
  },

  learn: {
    autoSpawn: false,
    maxParallel: 1,
    optionalAgents: ["tutorial-creator"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 30,
    description: "Learning mode with tutorial support",
  },

  teach: {
    autoSpawn: true,
    maxParallel: 1,
    requiredAgents: ["tutorial-creator"],
    optionalAgents: ["code-example-generator"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 35,
    description: "Teaching with example generators",
  },

  explore: {
    autoSpawn: true,
    maxParallel: 2,
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 40,
    description: "Exploration with discovery agents",
  },

  prototype: {
    autoSpawn: true,
    maxParallel: 2,
    optionalAgents: ["frontend-fusion-engine", "backend-api-specialist"],
    agentSelector: "best-match",
    asyncExecution: true,
    priority: 50,
    description: "Rapid prototyping with full-stack agents",
  },

  release: {
    autoSpawn: true,
    maxParallel: 3,
    requiredAgents: ["changelog-generator", "deployment-strategist"],
    optionalAgents: ["ci-cd-architect"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 90,
    description: "Release management with versioning agents",
  },

  hotfix: {
    autoSpawn: true,
    maxParallel: 2,
    requiredAgents: ["debugging-detective"],
    optionalAgents: ["deployment-strategist"],
    agentSelector: "all-required",
    asyncExecution: false,
    priority: 100,
    description: "Emergency fixes with rapid deployment",
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get config for a mode
 */
export function getModeConfig(mode: Mode): AgentTriggerConfig {
  return MODE_AGENT_MAP[mode];
}

/**
 * Get all modes that auto-spawn agents
 */
export function getAutoSpawnModes(): Mode[] {
  return (Object.keys(MODE_AGENT_MAP) as Mode[]).filter(
    (mode) => MODE_AGENT_MAP[mode].autoSpawn,
  );
}

/**
 * Get modes by priority threshold
 */
export function getModesByPriority(minPriority: number): Mode[] {
  return (Object.keys(MODE_AGENT_MAP) as Mode[]).filter(
    (mode) => (MODE_AGENT_MAP[mode].priority || 0) >= minPriority,
  );
}

/**
 * Get all unique agents referenced in mappings
 */
export function getAllMappedAgents(): string[] {
  const agents = new Set<string>();

  for (const config of Object.values(MODE_AGENT_MAP)) {
    for (const agent of config.requiredAgents || []) {
      agents.add(agent);
    }
    for (const agent of config.optionalAgents || []) {
      agents.add(agent);
    }
  }

  return Array.from(agents).sort();
}

/**
 * Check if a mode supports async execution
 */
export function isAsyncMode(mode: Mode): boolean {
  return MODE_AGENT_MAP[mode]?.asyncExecution ?? false;
}
