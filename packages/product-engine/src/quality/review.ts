/**
 * Code Review
 *
 * AI-powered code review for built agents/components.
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { ReviewResults, BuildTask } from "../core/types.js";
import { generateJSON } from "../utils/llm.js";
import { Logger } from "../utils/logger.js";

export interface ReviewConfig {
  checkSecurity: boolean;
  checkPerformance: boolean;
  checkStyle: boolean;
  checkBestPractices: boolean;
}

const DEFAULT_CONFIG: ReviewConfig = {
  checkSecurity: true,
  checkPerformance: true,
  checkStyle: true,
  checkBestPractices: true,
};

export class CodeReviewer {
  private logger: Logger;
  private config: ReviewConfig;

  constructor(config: Partial<ReviewConfig> = {}) {
    this.logger = new Logger("CodeReviewer");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Review a built task
   */
  async review(task: BuildTask): Promise<ReviewResults> {
    if (!task.outputPath) {
      return {
        approved: false,
        score: 0,
        issues: [{ severity: "error", file: "", line: 0, message: "No output path" }],
        suggestions: [],
      };
    }

    this.logger.info(`Reviewing code at: ${task.outputPath}`);

    try {
      // Read all source files
      const files = await this.getSourceFiles(task.outputPath);
      const allIssues: ReviewResults["issues"] = [];
      const allSuggestions: string[] = [];
      let totalScore = 0;

      for (const file of files) {
        const review = await this.reviewFile(file.path, file.content);
        allIssues.push(
          ...review.issues.map((i) => ({
            ...i,
            file: path.relative(task.outputPath!, file.path),
          }))
        );
        allSuggestions.push(...review.suggestions);
        totalScore += review.score;
      }

      const avgScore = files.length > 0 ? totalScore / files.length : 0;
      const hasBlockers = allIssues.some((i) => i.severity === "error");

      return {
        approved: !hasBlockers && avgScore >= 70,
        score: Math.round(avgScore),
        issues: allIssues,
        suggestions: [...new Set(allSuggestions)].slice(0, 10),
      };
    } catch (error) {
      this.logger.error(`Review failed: ${error}`);
      return {
        approved: false,
        score: 0,
        issues: [{ severity: "error", file: "", line: 0, message: String(error) }],
        suggestions: [],
      };
    }
  }

  /**
   * Get all source files
   */
  private async getSourceFiles(
    projectPath: string
  ): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];
    const srcDir = path.join(projectPath, "src");

    try {
      const entries = await fs.readdir(srcDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          const filePath = path.join(srcDir, entry.name);
          const content = await fs.readFile(filePath, "utf-8");
          files.push({ path: filePath, content });
        }
      }
    } catch {
      // src dir might not exist
    }

    return files;
  }

  /**
   * Review a single file
   */
  private async reviewFile(
    filePath: string,
    content: string
  ): Promise<{
    score: number;
    issues: Array<{ severity: "error" | "warning" | "info"; line: number; message: string }>;
    suggestions: string[];
  }> {
    const fileName = path.basename(filePath);
    this.logger.debug(`Reviewing file: ${fileName}`);

    // Skip test files for now
    if (fileName.includes(".test.") || fileName.includes(".spec.")) {
      return { score: 100, issues: [], suggestions: [] };
    }

    const checks = [];
    if (this.config.checkSecurity) checks.push("security vulnerabilities");
    if (this.config.checkPerformance) checks.push("performance issues");
    if (this.config.checkStyle) checks.push("code style");
    if (this.config.checkBestPractices) checks.push("best practices");

    const review = await generateJSON<{
      score: number;
      issues: Array<{
        severity: "error" | "warning" | "info";
        line: number;
        message: string;
      }>;
      suggestions: string[];
    }>({
      prompt: `Review this TypeScript file for a gICM AI agent:

File: ${fileName}

\`\`\`typescript
${content.slice(0, 8000)}
\`\`\`

Check for:
${checks.map((c) => `- ${c}`).join("\n")}

gICM context:
- AI agents for trading, research, content
- Uses Anthropic SDK
- TypeScript with strict mode
- Focus on Solana/Web3

Provide:
1. Overall score (0-100)
2. Issues found with severity, line number, message
3. Improvement suggestions

Return JSON:
{
  "score": 85,
  "issues": [
    { "severity": "warning", "line": 10, "message": "description" }
  ],
  "suggestions": ["suggestion1", "suggestion2"]
}`,
    });

    return review;
  }

  /**
   * Generate review report
   */
  generateReport(results: ReviewResults): string {
    const lines = [
      "# Code Review Report",
      "",
      `**Status:** ${results.approved ? "✅ APPROVED" : "❌ CHANGES REQUESTED"}`,
      `**Score:** ${results.score}/100`,
      "",
    ];

    if (results.issues.length > 0) {
      lines.push("## Issues", "");

      const errors = results.issues.filter((i) => i.severity === "error");
      const warnings = results.issues.filter((i) => i.severity === "warning");
      const infos = results.issues.filter((i) => i.severity === "info");

      if (errors.length > 0) {
        lines.push("### ❌ Errors", "");
        for (const issue of errors) {
          lines.push(`- **${issue.file}:${issue.line}** - ${issue.message}`);
        }
        lines.push("");
      }

      if (warnings.length > 0) {
        lines.push("### ⚠️ Warnings", "");
        for (const issue of warnings) {
          lines.push(`- **${issue.file}:${issue.line}** - ${issue.message}`);
        }
        lines.push("");
      }

      if (infos.length > 0) {
        lines.push("### ℹ️ Info", "");
        for (const issue of infos) {
          lines.push(`- **${issue.file}:${issue.line}** - ${issue.message}`);
        }
        lines.push("");
      }
    }

    if (results.suggestions.length > 0) {
      lines.push("## Suggestions", "");
      for (const suggestion of results.suggestions) {
        lines.push(`- ${suggestion}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Quick security check
   */
  async securityCheck(content: string): Promise<{
    safe: boolean;
    issues: string[];
  }> {
    const patterns = [
      { pattern: /eval\s*\(/, message: "Use of eval() detected" },
      { pattern: /new\s+Function\s*\(/, message: "Dynamic function creation" },
      { pattern: /process\.env\.\w+\s*\+/, message: "Env var concatenation" },
      { pattern: /child_process/, message: "Child process usage" },
      { pattern: /exec\s*\(|execSync\s*\(/, message: "Shell execution" },
      { pattern: /__dirname|__filename/, message: "File path exposure" },
      { pattern: /\.innerHTML\s*=/, message: "innerHTML assignment (XSS risk)" },
    ];

    const issues: string[] = [];

    for (const { pattern, message } of patterns) {
      if (pattern.test(content)) {
        issues.push(message);
      }
    }

    return {
      safe: issues.length === 0,
      issues,
    };
  }
}
