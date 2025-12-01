/**
 * dev.* namespace tools for THE DOOR
 *
 * These tools provide the core development capabilities
 * for the gICM MCP server integration.
 */
import { getContextBundle } from "./context-bundle.js";
import { getStatus } from "./status.js";
import { runAgent, listAgents } from "./run-agent.js";
import { suggestCapabilities, suggestCapabilitiesTool } from "./suggest-capabilities.js";
import { workflowCreate, workflowRun, workflowStatus, workflowList, workflowTools, } from "./workflow.js";
import { watchStatus, watchChanges, watchReindex, watchClear, watchTools, } from "./watch.js";
import { memoryRemember, memoryRecall, memorySearch, memoryForget, memoryStats, memoryTools, } from "./memory.js";
import { teamCreate, teamList, teamShow, teamAddMember, teamShare, teamShared, teamSync, teamDelete, teamTools, } from "./team.js";
import { gitStatus, gitAnalyze, gitCommit, gitPush, gitPR, gitTools, } from "./git.js";
export { getContextBundle, getStatus, runAgent, listAgents, suggestCapabilities, workflowCreate, workflowRun, workflowStatus, workflowList, watchStatus, watchChanges, watchReindex, watchClear, memoryRemember, memoryRecall, memorySearch, memoryForget, memoryStats, teamCreate, teamList, teamShow, teamAddMember, teamShare, teamShared, teamSync, teamDelete, gitStatus, gitAnalyze, gitCommit, gitPush, gitPR, };
// Tool definitions for dev.* namespace
export const devTools = {
    "dev.get_context_bundle": {
        description: "Get relevant code context for a task. Combines semantic search with expanded file context to provide comprehensive code snippets for implementing a feature or fixing a bug.",
        parameters: {
            task: {
                type: "string",
                description: "Description of what you want to accomplish",
            },
            repository: {
                type: "string",
                description: "Filter to specific repository name",
                optional: true,
            },
            max_chunks: {
                type: "number",
                description: "Maximum code chunks to return (default: 10)",
                optional: true,
            },
            expand_context: {
                type: "boolean",
                description: "Expand context around matches (default: true)",
                optional: true,
            },
        },
    },
    "dev.status": {
        description: "Get current project status including initialization state, indexing stats, MCP configuration, and autonomy level.",
        parameters: {
            project_path: {
                type: "string",
                description: "Path to project (defaults to current directory)",
                optional: true,
            },
        },
    },
    "dev.run_agent": {
        description: "Execute a specialized gICM agent. The agent runs through the autonomy system which may auto-execute, queue for approval, or reject based on risk level.",
        parameters: {
            agent_id: {
                type: "string",
                description: "Agent ID (e.g., 'wallet-agent', 'audit-agent', 'builder-agent')",
            },
            input: {
                type: "object",
                description: "Input parameters for the agent",
            },
            timeout: {
                type: "number",
                description: "Execution timeout in milliseconds (default: 30000)",
                optional: true,
            },
            dry_run: {
                type: "boolean",
                description: "Preview what the agent would do without executing",
                optional: true,
            },
        },
    },
    "dev.list_agents": {
        description: "List all available gICM agents with their descriptions and categories.",
        parameters: {},
    },
    // Capability router
    ...suggestCapabilitiesTool,
    // Workflow tools
    ...workflowTools,
    // Watch tools
    ...watchTools,
    // Memory tools
    ...memoryTools,
    // Team tools
    ...teamTools,
    // Git tools
    ...gitTools,
};
//# sourceMappingURL=index.js.map