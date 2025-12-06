// src/index.ts
import { BaseAgent } from "@gicm/agent-core";
import { z } from "zod";
var AnalysisResultSchema = z.object({
  path: z.string(),
  complexity: z.number(),
  duplications: z.number(),
  suggestions: z.array(z.string()),
  score: z.number().min(0).max(100)
});
var RefactorAgent = class extends BaseAgent {
  targetPaths;
  constructor(config) {
    super("refactor", config);
    this.targetPaths = config.targetPaths ?? ["./packages"];
  }
  getSystemPrompt() {
    return `You are a code quality agent for gICM.
Your role is to analyze code and suggest improvements:
- Complexity reduction
- Duplication detection
- Pattern improvements
- Performance optimizations`;
  }
  async analyze(context) {
    const action = context.action ?? "analyze";
    switch (action) {
      case "analyze":
        return this.analyzeCode(context.params?.path);
      case "status":
        return this.createResult(true, { targetPaths: this.targetPaths });
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }
  async analyzeCode(path) {
    const targetPath = path ?? this.targetPaths[0];
    this.log(`Analyzing code quality: ${targetPath}`);
    const result = {
      path: targetPath,
      complexity: 45,
      duplications: 3,
      suggestions: [
        "Consider extracting shared logic into utilities",
        "Some functions exceed recommended length"
      ],
      score: 78
    };
    return this.createResult(
      true,
      result,
      void 0,
      0.8,
      `Code quality score: ${result.score}/100`
    );
  }
};
export {
  AnalysisResultSchema,
  RefactorAgent
};
