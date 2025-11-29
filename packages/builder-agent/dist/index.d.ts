import { AgentConfig, BaseAgent, AgentContext, AgentResult } from '@gicm/agent-core';
import { z } from 'zod';

declare const BuildRequestSchema: z.ZodObject<{
    discoveryId: z.ZodString;
    type: z.ZodEnum<["agent", "skill", "mcp", "integration"]>;
    name: z.ZodString;
    description: z.ZodString;
    sourceUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    discoveryId: string;
    type: "agent" | "skill" | "mcp" | "integration";
    name: string;
    description: string;
    sourceUrl: string;
}, {
    discoveryId: string;
    type: "agent" | "skill" | "mcp" | "integration";
    name: string;
    description: string;
    sourceUrl: string;
}>;
type BuildRequest = z.infer<typeof BuildRequestSchema>;
declare const BuildResultSchema: z.ZodObject<{
    buildId: z.ZodString;
    request: z.ZodObject<{
        discoveryId: z.ZodString;
        type: z.ZodEnum<["agent", "skill", "mcp", "integration"]>;
        name: z.ZodString;
        description: z.ZodString;
        sourceUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        discoveryId: string;
        type: "agent" | "skill" | "mcp" | "integration";
        name: string;
        description: string;
        sourceUrl: string;
    }, {
        discoveryId: string;
        type: "agent" | "skill" | "mcp" | "integration";
        name: string;
        description: string;
        sourceUrl: string;
    }>;
    status: z.ZodEnum<["pending", "building", "testing", "completed", "failed"]>;
    outputPath: z.ZodOptional<z.ZodString>;
    artifacts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "building" | "testing" | "completed" | "failed";
    buildId: string;
    request: {
        discoveryId: string;
        type: "agent" | "skill" | "mcp" | "integration";
        name: string;
        description: string;
        sourceUrl: string;
    };
    artifacts: string[];
    outputPath?: string | undefined;
    error?: string | undefined;
}, {
    status: "pending" | "building" | "testing" | "completed" | "failed";
    buildId: string;
    request: {
        discoveryId: string;
        type: "agent" | "skill" | "mcp" | "integration";
        name: string;
        description: string;
        sourceUrl: string;
    };
    outputPath?: string | undefined;
    artifacts?: string[] | undefined;
    error?: string | undefined;
}>;
type BuildResult = z.infer<typeof BuildResultSchema>;
interface BuilderAgentConfig extends AgentConfig {
    outputDir?: string;
}
declare class BuilderAgent extends BaseAgent {
    private outputDir;
    constructor(config: BuilderAgentConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    build(request: BuildRequest): Promise<BuildResult>;
    private handleBuild;
}

export { type BuildRequest, BuildRequestSchema, type BuildResult, BuildResultSchema, BuilderAgent, type BuilderAgentConfig };
