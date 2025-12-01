/**
 * dev.* namespace tools for THE DOOR
 *
 * These tools provide the core development capabilities
 * for the gICM MCP server integration.
 */
import { getContextBundle } from "./context-bundle.js";
import { getStatus } from "./status.js";
import { runAgent, listAgents } from "./run-agent.js";
import { suggestCapabilities } from "./suggest-capabilities.js";
import { workflowCreate, workflowRun, workflowStatus, workflowList } from "./workflow.js";
import { watchStatus, watchChanges, watchReindex, watchClear } from "./watch.js";
import { memoryRemember, memoryRecall, memorySearch, memoryForget, memoryStats } from "./memory.js";
import { teamCreate, teamList, teamShow, teamAddMember, teamShare, teamShared, teamSync, teamDelete } from "./team.js";
import { gitStatus, gitAnalyze, gitCommit, gitPush, gitPR } from "./git.js";
export { getContextBundle, getStatus, runAgent, listAgents, suggestCapabilities, workflowCreate, workflowRun, workflowStatus, workflowList, watchStatus, watchChanges, watchReindex, watchClear, memoryRemember, memoryRecall, memorySearch, memoryForget, memoryStats, teamCreate, teamList, teamShow, teamAddMember, teamShare, teamShared, teamSync, teamDelete, gitStatus, gitAnalyze, gitCommit, gitPush, gitPR, };
export declare const devTools: {
    "dev.git_status": {
        description: string;
        parameters: {
            verbose: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_analyze": {
        description: string;
        parameters: {
            staged: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_commit": {
        description: string;
        parameters: {
            message: {
                type: string;
                description: string;
                optional: boolean;
            };
            all: {
                type: string;
                description: string;
                optional: boolean;
            };
            amend: {
                type: string;
                description: string;
                optional: boolean;
            };
            dry_run: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_push": {
        description: string;
        parameters: {
            force: {
                type: string;
                description: string;
                optional: boolean;
            };
            set_upstream: {
                type: string;
                description: string;
                optional: boolean;
            };
            branch: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.git_pr": {
        description: string;
        parameters: {
            title: {
                type: string;
                description: string;
                optional: boolean;
            };
            body: {
                type: string;
                description: string;
                optional: boolean;
            };
            base: {
                type: string;
                description: string;
                optional: boolean;
            };
            draft: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.team_create": {
        description: string;
        parameters: {
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.team_list": {
        description: string;
        parameters: {};
    };
    "dev.team_show": {
        description: string;
        parameters: {
            name: {
                type: string;
                description: string;
            };
        };
    };
    "dev.team_add_member": {
        description: string;
        parameters: {
            team_name: {
                type: string;
                description: string;
            };
            member_name: {
                type: string;
                description: string;
            };
            email: {
                type: string;
                description: string;
                optional: boolean;
            };
            role: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
        };
    };
    "dev.team_share": {
        description: string;
        parameters: {
            type: {
                type: string;
                description: string;
                enum: string[];
            };
            resource_name: {
                type: string;
                description: string;
            };
            team_name: {
                type: string;
                description: string;
                optional: boolean;
            };
            permissions: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
        };
    };
    "dev.team_shared": {
        description: string;
        parameters: {
            team_name: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.team_sync": {
        description: string;
        parameters: {
            team_name: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.team_delete": {
        description: string;
        parameters: {
            name: {
                type: string;
                description: string;
            };
        };
    };
    "dev.memory_remember": {
        description: string;
        parameters: {
            key: {
                type: string;
                description: string;
            };
            value: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                description: string;
                enum: string[];
            };
            confidence: {
                type: string;
                description: string;
                optional: boolean;
            };
            tags: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                optional: boolean;
            };
            expires_in_seconds: {
                type: string;
                description: string;
                optional: boolean;
            };
            namespace: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.memory_recall": {
        description: string;
        parameters: {
            key: {
                type: string;
                description: string;
            };
            namespace: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.memory_search": {
        description: string;
        parameters: {
            type: {
                type: string;
                description: string;
                enum: string[];
                optional: boolean;
            };
            tags: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
                optional: boolean;
            };
            key_pattern: {
                type: string;
                description: string;
                optional: boolean;
            };
            namespace: {
                type: string;
                description: string;
                optional: boolean;
            };
            limit: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.memory_forget": {
        description: string;
        parameters: {
            key: {
                type: string;
                description: string;
            };
            namespace: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.memory_stats": {
        description: string;
        parameters: {};
    };
    "dev.watch_status": {
        description: string;
        parameters: {
            project_path: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.watch_changes": {
        description: string;
        parameters: {
            project_path: {
                type: string;
                description: string;
                optional: boolean;
            };
            limit: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.watch_reindex": {
        description: string;
        parameters: {
            files: {
                type: string;
                description: string;
                items: {
                    type: string;
                };
            };
            project_path: {
                type: string;
                description: string;
                optional: boolean;
            };
            context_engine_url: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.watch_clear": {
        description: string;
        parameters: {
            project_path: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.workflow_create": {
        description: string;
        parameters: {
            name: {
                type: string;
                description: string;
            };
            template: {
                type: string;
                description: string;
                optional: boolean;
            };
            description: {
                type: string;
                description: string;
                optional: boolean;
            };
            steps: {
                type: string;
                description: string;
                optional: boolean;
                items: {
                    type: string;
                    properties: {
                        agent: {
                            type: string;
                            description: string;
                        };
                        input: {
                            type: string;
                            description: string;
                        };
                        dependsOn: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                        condition: {
                            type: string;
                            description: string;
                        };
                    };
                };
            };
            variables: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.workflow_run": {
        description: string;
        parameters: {
            workflow: {
                type: string;
                description: string;
            };
            input: {
                type: string;
                description: string;
                optional: boolean;
            };
            dry_run: {
                type: string;
                description: string;
                default: boolean;
                optional: boolean;
            };
        };
    };
    "dev.workflow_status": {
        description: string;
        parameters: {
            execution_id: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.workflow_list": {
        description: string;
        parameters: {};
    };
    "dev.suggest_capabilities": {
        description: string;
        parameters: {
            task: {
                type: string;
                description: string;
            };
            auto_install: {
                type: string;
                description: string;
                default: boolean;
                optional: boolean;
            };
            max_suggestions: {
                type: string;
                description: string;
                default: number;
                optional: boolean;
            };
        };
    };
    "dev.get_context_bundle": {
        description: string;
        parameters: {
            task: {
                type: string;
                description: string;
            };
            repository: {
                type: string;
                description: string;
                optional: boolean;
            };
            max_chunks: {
                type: string;
                description: string;
                optional: boolean;
            };
            expand_context: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.status": {
        description: string;
        parameters: {
            project_path: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.run_agent": {
        description: string;
        parameters: {
            agent_id: {
                type: string;
                description: string;
            };
            input: {
                type: string;
                description: string;
            };
            timeout: {
                type: string;
                description: string;
                optional: boolean;
            };
            dry_run: {
                type: string;
                description: string;
                optional: boolean;
            };
        };
    };
    "dev.list_agents": {
        description: string;
        parameters: {};
    };
};
//# sourceMappingURL=index.d.ts.map