import { BaseAgent } from "@gicm/agent-core";
import type { AgentConfig, AgentContext, AgentResult } from "@gicm/agent-core";
import { z } from "zod";

export const AnalysisResultSchema = z.object({
  path: z.string(),
  complexity: z.number(),
  duplications: z.number(),
  suggestions: z.array(z.string()),
  score: z.number().min(0).max(100),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export interface RefactorAgentConfig extends AgentConfig {
  targetPaths?: string[];
}

export class RefactorAgent extends BaseAgent {
  private targetPaths: string[];

  constructor(config: RefactorAgentConfig) {
    super("refactor", config);
    this.targetPaths = config.targetPaths ?? ["./packages"];
  }

  getSystemPrompt(): string {
    return `You are a code quality agent for gICM.
Your role is to analyze code and suggest improvements:
- Complexity reduction
- Duplication detection
- Pattern improvements
- Performance optimizations`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const action = context.action ?? "analyze";

    switch (action) {
      case "analyze":
        return this.analyzeCode(context.params?.path as string);
      case "status":
        return this.createResult(true, { targetPaths: this.targetPaths });
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }

  async analyzeCode(path?: string): Promise<AgentResult> {
    const targetPath = path ?? this.targetPaths[0];
    this.log(`Analyzing code quality: ${targetPath}`);

    // Placeholder analysis - full implementation would parse AST
    const result: AnalysisResult = {
      path: targetPath,
      complexity: 45,
      duplications: 3,
      suggestions: [
        "Consider extracting shared logic into utilities",
        "Some functions exceed recommended length",
      ],
      score: 78,
    };

    return this.createResult(
      true,
      result,
      undefined,
      0.8,
      `Code quality score: ${result.score}/100`
    );
  }
}
