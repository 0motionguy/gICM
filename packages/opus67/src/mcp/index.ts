/**
 * OPUS 67 - MCP Module
 * Barrel export for MCP hub, discovery, memory tools, and spawn agent tools
 */

export * from "./hub.js";
export * from "./discovery.js";
export * from "./memory-tools.js";

// v6.1 - Spawn Agent MCP Tools
export {
  SPAWN_AGENTS_TOOL,
  AGENT_STATUS_TOOL,
  LIST_AGENTS_TOOL,
  handleSpawnAgents,
  handleAgentStatus,
  handleListAgents,
  registerSpawnTools,
  spawnTools,
  type SpawnAgentsInput,
  type SpawnAgentsOutput,
  type AgentStatusInput,
  type AgentStatusOutput,
} from "./spawn-agent-tool.js";
