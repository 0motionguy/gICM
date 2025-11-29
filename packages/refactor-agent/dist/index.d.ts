import { AgentConfig, BaseAgent, AgentContext, AgentResult } from '@gicm/agent-core';
import { z } from 'zod';

declare const AnalysisResultSchema: z.ZodObject<{
    path: z.ZodString;
    complexity: z.ZodNumber;
    duplications: z.ZodNumber;
    suggestions: z.ZodArray<z.ZodString, "many">;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    path: string;
    complexity: number;
    duplications: number;
    suggestions: string[];
    score: number;
}, {
    path: string;
    complexity: number;
    duplications: number;
    suggestions: string[];
    score: number;
}>;
type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
interface RefactorAgentConfig extends AgentConfig {
    targetPaths?: string[];
}
declare class RefactorAgent extends BaseAgent {
    private targetPaths;
    constructor(config: RefactorAgentConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    analyzeCode(path?: string): Promise<AgentResult>;
}

export { type AnalysisResult, AnalysisResultSchema, RefactorAgent, type RefactorAgentConfig };
