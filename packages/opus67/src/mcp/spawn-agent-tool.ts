/**
 * OPUS 67 MCP Spawn Agent Tool
 * Exposes subagent spawning as MCP tool for Claude Code integration
 */

import { asyncAgentRunner, type AgentConfig } from "../agents/async-runner.js";
import {
  subagentOrchestrator,
  type AgentPlan,
} from "../agents/subagent-orchestrator.js";
import { agentJobQueue, type JobPriority } from "../agents/job-queue.js";
import { MODE_AGENT_MAP, type Mode } from "../modes/agent-mapping.js";
import { opus67SDK, type FinalResult } from "../sdk/v2-adapter.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SpawnAgentsInput {
  agents?: string[];
  task: string;
  parallel?: boolean;
  async?: boolean;
  mode?: Mode;
  model?: "sonnet" | "opus" | "haiku";
  autoDetect?: boolean;
  maxAgents?: number;
  timeout?: number;
}

export interface SpawnAgentsOutput {
  success: boolean;
  jobIds: string[];
  plan?: AgentPlan;
  results?: FinalResult[];
  message: string;
  duration?: number;
}

export interface AgentStatusInput {
  jobId: string;
}

export interface AgentStatusOutput {
  jobId: string;
  status: string;
  progress: number;
  output?: string;
  error?: string;
}

// =============================================================================
// MCP TOOL DEFINITIONS
// =============================================================================

export const SPAWN_AGENTS_TOOL = {
  name: "opus67_spawn_agents",
  description: `Spawn OPUS 67 subagents for parallel task execution.
Automatically detects relevant agents based on task or manually specify agent IDs.
Supports async (non-blocking) and sync execution modes.

Available agents include: backend-api-specialist, database-schema-oracle,
security-engineer, frontend-fusion-engine, test-automation-engineer,
smart-contract-auditor, typescript-precision-engineer, and 100+ more.`,
  inputSchema: {
    type: "object",
    properties: {
      agents: {
        type: "array",
        items: { type: "string" },
        description:
          "Agent IDs to spawn. If not provided, agents are auto-detected based on task.",
      },
      task: {
        type: "string",
        description: "Task description for the agents to work on.",
      },
      parallel: {
        type: "boolean",
        default: true,
        description: "Run agents in parallel (true) or sequential (false).",
      },
      async: {
        type: "boolean",
        default: true,
        description:
          "Non-blocking execution (true) returns immediately with job IDs.",
      },
      mode: {
        type: "string",
        enum: [
          "auto",
          "ultra",
          "swarm",
          "build",
          "audit",
          "data",
          "test",
          "deploy",
        ],
        description: "Operating mode context for agent selection.",
      },
      model: {
        type: "string",
        enum: ["sonnet", "opus", "haiku"],
        default: "sonnet",
        description: "Model to use for agents.",
      },
      autoDetect: {
        type: "boolean",
        default: true,
        description: "Auto-detect relevant agents based on task content.",
      },
      maxAgents: {
        type: "number",
        default: 5,
        description: "Maximum number of agents to spawn.",
      },
      timeout: {
        type: "number",
        default: 60000,
        description: "Timeout in milliseconds per agent.",
      },
    },
    required: ["task"],
  },
};

export const AGENT_STATUS_TOOL = {
  name: "opus67_agent_status",
  description: "Check the status of a running agent job.",
  inputSchema: {
    type: "object",
    properties: {
      jobId: {
        type: "string",
        description: "Job ID returned from opus67_spawn_agents.",
      },
    },
    required: ["jobId"],
  },
};

export const LIST_AGENTS_TOOL = {
  name: "opus67_list_agents",
  description: "List available OPUS 67 agents and their capabilities.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: [
          "all",
          "backend",
          "frontend",
          "security",
          "blockchain",
          "devops",
          "testing",
        ],
        default: "all",
        description: "Filter agents by category.",
      },
      mode: {
        type: "string",
        description: "List agents recommended for a specific mode.",
      },
    },
  },
};

// =============================================================================
// TOOL HANDLERS
// =============================================================================

/**
 * Handle opus67_spawn_agents tool call
 */
export async function handleSpawnAgents(
  input: SpawnAgentsInput
): Promise<SpawnAgentsOutput> {
  const startTime = Date.now();
  const {
    agents: specifiedAgents,
    task,
    parallel = true,
    async: asyncMode = true,
    mode = "auto",
    model = "sonnet",
    autoDetect = true,
    maxAgents = 5,
    timeout = 60000,
  } = input;

  try {
    let agentsToSpawn: string[] = specifiedAgents || [];

    // Auto-detect agents if not specified
    if (agentsToSpawn.length === 0 && autoDetect) {
      const plan = await subagentOrchestrator.analyzeTask(task, mode);
      agentsToSpawn = plan.suggestedAgents
        .slice(0, maxAgents)
        .map((a) => a.agentId);

      // Add mode-required agents
      const modeConfig = MODE_AGENT_MAP[mode];
      if (modeConfig?.requiredAgents) {
        for (const required of modeConfig.requiredAgents) {
          if (!agentsToSpawn.includes(required)) {
            agentsToSpawn.push(required);
          }
        }
      }
    }

    if (agentsToSpawn.length === 0) {
      return {
        success: false,
        jobIds: [],
        message:
          "No agents matched the task. Please specify agents manually or modify the task description.",
      };
    }

    // Limit agents
    agentsToSpawn = agentsToSpawn.slice(0, maxAgents);

    const jobIds: string[] = [];
    let results: FinalResult[] | undefined;

    if (asyncMode) {
      // Non-blocking: spawn and return immediately
      for (const agentId of agentsToSpawn) {
        const jobId = asyncAgentRunner.spawnBackground({
          agentId,
          task,
          model,
          timeout,
        });
        jobIds.push(jobId);
      }

      return {
        success: true,
        jobIds,
        message: `Spawned ${jobIds.length} agents in background: ${agentsToSpawn.join(", ")}. Use opus67_agent_status to check progress.`,
        plan: await subagentOrchestrator.analyzeTask(task, mode),
      };
    } else {
      // Blocking: wait for results
      const agentTasks = agentsToSpawn.map((agentId) => ({
        agentId,
        task,
      }));

      results = await opus67SDK.spawnMultiple(agentTasks, { parallel });

      return {
        success: results.every((r) => r.success),
        jobIds: results.map((r) => r.sessionId),
        results,
        message: `Completed ${results.length} agents: ${results.filter((r) => r.success).length} succeeded, ${results.filter((r) => !r.success).length} failed.`,
        duration: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      success: false,
      jobIds: [],
      message: `Error spawning agents: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Handle opus67_agent_status tool call
 */
export async function handleAgentStatus(
  input: AgentStatusInput
): Promise<AgentStatusOutput> {
  const { jobId } = input;

  const job = asyncAgentRunner.getJob(jobId);
  if (!job) {
    return {
      jobId,
      status: "not_found",
      progress: 0,
      error: `Job ${jobId} not found`,
    };
  }

  return {
    jobId,
    status: job.status,
    progress: job.progress,
    output: job.output.join("\n"),
    error: job.error,
  };
}

/**
 * Handle opus67_list_agents tool call
 */
export function handleListAgents(input: { category?: string; mode?: string }): {
  agents: Array<{ id: string; category: string; description: string }>;
  count: number;
} {
  const { category = "all", mode } = input;

  // Agent registry with categories
  const agentRegistry: Array<{
    id: string;
    category: string;
    description: string;
  }> = [
    // Backend
    {
      id: "backend-api-specialist",
      category: "backend",
      description: "REST/GraphQL API development",
    },
    {
      id: "database-schema-oracle",
      category: "backend",
      description: "Database design and optimization",
    },
    {
      id: "nodejs-api-architect",
      category: "backend",
      description: "Node.js backend patterns",
    },

    // Frontend
    {
      id: "frontend-fusion-engine",
      category: "frontend",
      description: "React/Next.js development",
    },
    {
      id: "typescript-precision-engineer",
      category: "frontend",
      description: "TypeScript type safety",
    },
    {
      id: "accessibility-advocate",
      category: "frontend",
      description: "WCAG compliance",
    },

    // Security
    {
      id: "security-engineer",
      category: "security",
      description: "Application security",
    },
    {
      id: "penetration-testing-specialist",
      category: "security",
      description: "Security testing",
    },
    {
      id: "smart-contract-auditor",
      category: "security",
      description: "Solidity auditing",
    },

    // Blockchain
    {
      id: "solana-guardian-auditor",
      category: "blockchain",
      description: "Solana program security",
    },
    {
      id: "evm-security-auditor",
      category: "blockchain",
      description: "EVM contract security",
    },
    {
      id: "defi-integration-architect",
      category: "blockchain",
      description: "DeFi protocols",
    },

    // DevOps
    {
      id: "deployment-strategist",
      category: "devops",
      description: "CI/CD and deployment",
    },
    { id: "cloud-architect", category: "devops", description: "AWS/GCP/Azure" },
    {
      id: "ci-cd-architect",
      category: "devops",
      description: "GitHub Actions pipelines",
    },

    // Testing
    {
      id: "unit-test-generator",
      category: "testing",
      description: "Unit test creation",
    },
    {
      id: "e2e-testing-specialist",
      category: "testing",
      description: "End-to-end testing",
    },
    {
      id: "qa-stress-tester",
      category: "testing",
      description: "Load and stress testing",
    },

    // More agents...
    {
      id: "code-reviewer",
      category: "backend",
      description: "Code review and quality",
    },
    {
      id: "debugging-detective",
      category: "backend",
      description: "Bug investigation",
    },
    {
      id: "performance-profiler",
      category: "devops",
      description: "Performance optimization",
    },
  ];

  let filtered = agentRegistry;

  // Filter by category
  if (category !== "all") {
    filtered = filtered.filter((a) => a.category === category);
  }

  // Filter by mode
  if (mode) {
    const modeConfig = MODE_AGENT_MAP[mode as Mode];
    if (modeConfig) {
      const modeAgents = [
        ...(modeConfig.requiredAgents || []),
        ...(modeConfig.optionalAgents || []),
      ];
      if (modeAgents.length > 0) {
        filtered = filtered.filter((a) => modeAgents.includes(a.id));
      }
    }
  }

  return {
    agents: filtered,
    count: filtered.length,
  };
}

// =============================================================================
// MCP SERVER INTEGRATION
// =============================================================================

/**
 * Register spawn tools with MCP server
 */
export function registerSpawnTools(server: {
  setRequestHandler: (
    schema: string,
    handler: (request: unknown) => Promise<unknown>
  ) => void;
}): void {
  // Tools list handler
  server.setRequestHandler("tools/list", async () => ({
    tools: [SPAWN_AGENTS_TOOL, AGENT_STATUS_TOOL, LIST_AGENTS_TOOL],
  }));

  // Tools call handler
  server.setRequestHandler(
    "tools/call",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (request: any) => {
      const { name, arguments: args } = request.params as {
        name: string;
        arguments: Record<string, unknown>;
      };

      switch (name) {
        case "opus67_spawn_agents":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await handleSpawnAgents(args as unknown as SpawnAgentsInput),
                  null,
                  2
                ),
              },
            ],
          } as const;

        case "opus67_agent_status":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await handleAgentStatus(args as unknown as AgentStatusInput),
                  null,
                  2
                ),
              },
            ],
          } as const;

        case "opus67_list_agents":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  handleListAgents(
                    args as { category?: string; mode?: string }
                  ),
                  null,
                  2
                ),
              },
            ],
          } as const;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    }
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export const spawnTools = {
  SPAWN_AGENTS_TOOL,
  AGENT_STATUS_TOOL,
  LIST_AGENTS_TOOL,
  handleSpawnAgents,
  handleAgentStatus,
  handleListAgents,
  registerSpawnTools,
};
