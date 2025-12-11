/**
 * gICM CLI - Audit Command
 * Run quality audit on marketplace items
 */

import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

// ============================================================================
// Types & Schemas
// ============================================================================

export interface AuditOptions {
  output?: string;
  threshold?: number;
  verbose?: boolean;
  json?: boolean;
}

interface AuditIssue {
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
  file: string;
  line?: number;
  suggestion?: string;
}

interface FileAudit {
  file: string;
  kind: string;
  score: number;
  issues: AuditIssue[];
  metrics: {
    tokenCount: number;
    hasDescription: boolean;
    hasExamples: boolean;
    hasTriggerPatterns: boolean;
    hasYamlFrontmatter: boolean;
    hasVersion: boolean;
  };
}

interface AuditReport {
  timestamp: string;
  projectPath: string;
  summary: {
    totalFiles: number;
    averageScore: number;
    passedFiles: number;
    failedFiles: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfos: number;
  };
  files: FileAudit[];
  recommendations: string[];
}

// ============================================================================
// Audit Rules
// ============================================================================

const AUDIT_RULES = {
  // Critical rules (cause errors)
  "no-yaml-frontmatter": {
    severity: "error" as const,
    check: (content: string) => !content.startsWith("---"),
    message: "Missing YAML frontmatter",
    suggestion:
      "Add YAML frontmatter at the beginning with name, description, version",
  },
  "missing-name": {
    severity: "error" as const,
    check: (content: string) => !content.match(/^name:\s*.+/m),
    message: "Missing required field: name",
    suggestion: "Add name: field in YAML frontmatter",
  },
  "missing-description": {
    severity: "error" as const,
    check: (content: string) => !content.match(/^description:\s*.+/m),
    message: "Missing required field: description",
    suggestion: "Add description: field in YAML frontmatter",
  },

  // Warning rules
  "missing-version": {
    severity: "warning" as const,
    check: (content: string) => !content.match(/^version:\s*\d+\.\d+\.\d+/m),
    message: "Missing or invalid version (should be semver)",
    suggestion: "Add version: 1.0.0 in YAML frontmatter",
  },
  "missing-category": {
    severity: "warning" as const,
    check: (content: string) => !content.match(/^category:\s*.+/m),
    message: "Missing category field",
    suggestion: "Add category: field for better discoverability",
  },
  "missing-tags": {
    severity: "warning" as const,
    check: (content: string) => !content.match(/^tags:\s*\[/m),
    message: "Missing tags field",
    suggestion: "Add tags: [tag1, tag2] for search optimization",
  },
  "no-examples": {
    severity: "warning" as const,
    check: (content: string) =>
      !content.match(/##?\s*example/i) && !content.match(/```/),
    message: "No examples found",
    suggestion: "Add code examples or usage examples",
  },
  "too-short": {
    severity: "warning" as const,
    check: (content: string) => content.length < 500,
    message: "Content is very short (<500 characters)",
    suggestion: "Consider adding more detail, examples, or context",
  },

  // Info rules
  "no-trigger-patterns": {
    severity: "info" as const,
    check: (content: string) =>
      !content.match(/trigger|pattern|when|activate/i),
    message: "No trigger patterns documented",
    suggestion: "Document when this skill/agent should be activated",
  },
  "no-constraints": {
    severity: "info" as const,
    check: (content: string) =>
      !content.match(/constraint|limit|restriction|boundary/i),
    message: "No constraints documented",
    suggestion: "Consider documenting constraints or limitations",
  },
  "very-long": {
    severity: "info" as const,
    check: (content: string) => content.length > 20000,
    message: "Content is very long (>20k characters)",
    suggestion:
      "Consider splitting into multiple skills or using progressive disclosure",
  },
};

// ============================================================================
// Audit Functions
// ============================================================================

/**
 * Estimate token count from content
 */
function estimateTokens(content: string): number {
  // Rough estimate: ~4 chars per token for English text
  return Math.ceil(content.length / 4);
}

/**
 * Calculate quality score based on issues
 */
function calculateScore(issues: AuditIssue[]): number {
  let score = 100;

  for (const issue of issues) {
    switch (issue.severity) {
      case "error":
        score -= 25;
        break;
      case "warning":
        score -= 10;
        break;
      case "info":
        score -= 2;
        break;
    }
  }

  return Math.max(0, score);
}

/**
 * Audit a single file
 */
async function auditFile(filePath: string, kind: string): Promise<FileAudit> {
  const content = await fs.readFile(filePath, "utf-8");
  const issues: AuditIssue[] = [];

  // Run all audit rules
  for (const [ruleName, rule] of Object.entries(AUDIT_RULES)) {
    if (rule.check(content)) {
      issues.push({
        severity: rule.severity,
        rule: ruleName,
        message: rule.message,
        file: filePath,
        suggestion: rule.suggestion,
      });
    }
  }

  // Calculate metrics
  const metrics = {
    tokenCount: estimateTokens(content),
    hasDescription: !!content.match(/^description:\s*.+/m),
    hasExamples: !!content.match(/```/) || !!content.match(/##?\s*example/i),
    hasTriggerPatterns: !!content.match(/trigger|pattern|when|activate/i),
    hasYamlFrontmatter: content.startsWith("---"),
    hasVersion: !!content.match(/^version:\s*\d+\.\d+\.\d+/m),
  };

  return {
    file: filePath,
    kind,
    score: calculateScore(issues),
    issues,
    metrics,
  };
}

/**
 * Generate recommendations based on audit results
 */
function generateRecommendations(files: FileAudit[]): string[] {
  const recommendations: string[] = [];

  // Check overall patterns
  const avgScore = files.reduce((sum, f) => sum + f.score, 0) / files.length;
  const errorCount = files.reduce(
    (sum, f) => sum + f.issues.filter((i) => i.severity === "error").length,
    0
  );
  const noExampleCount = files.filter((f) => !f.metrics.hasExamples).length;
  const noVersionCount = files.filter((f) => !f.metrics.hasVersion).length;

  if (avgScore < 60) {
    recommendations.push(
      "Overall quality is low. Focus on fixing errors first, then warnings."
    );
  }

  if (errorCount > 0) {
    recommendations.push(
      `Fix ${errorCount} critical error(s) - these will cause compatibility issues.`
    );
  }

  if (noExampleCount > files.length / 2) {
    recommendations.push(
      "Most files lack examples. Add usage examples to improve discoverability."
    );
  }

  if (noVersionCount > files.length / 2) {
    recommendations.push(
      "Most files lack version numbers. Add semver versions for better tracking."
    );
  }

  const highTokenFiles = files.filter((f) => f.metrics.tokenCount > 5000);
  if (highTokenFiles.length > 0) {
    recommendations.push(
      `${highTokenFiles.length} file(s) have high token counts. Consider using progressive disclosure.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Great job! Your skills pass quality checks.");
  }

  return recommendations;
}

/**
 * Main audit command handler
 */
export async function auditCommand(options: AuditOptions = {}): Promise<void> {
  const threshold = options.threshold ?? 70;

  if (!options.json) {
    console.log(chalk.bold("\nAudit - Quality Audit\n"));
  }

  const claudeDir = path.join(process.cwd(), ".claude");

  if (!(await fs.pathExists(claudeDir))) {
    if (options.json) {
      console.log(JSON.stringify({ error: ".claude directory not found" }));
    } else {
      console.error(
        chalk.red(".claude directory not found. Run `gicm init` first.")
      );
    }
    process.exit(1);
  }

  const spinner = options.json
    ? null
    : ora({ text: "Auditing files...", color: "cyan" }).start();

  const fileAudits: FileAudit[] = [];

  // Audit each item type
  const itemTypes: Array<{ kind: string; dir: string }> = [
    { kind: "skill", dir: "skills" },
    { kind: "agent", dir: "agents" },
    { kind: "command", dir: "commands" },
  ];

  for (const { kind, dir } of itemTypes) {
    const dirPath = path.join(claudeDir, dir);

    if (await fs.pathExists(dirPath)) {
      const files = await fs.readdir(dirPath);
      const mdFiles = files.filter((f) => f.endsWith(".md"));

      for (const file of mdFiles) {
        const filePath = path.join(dirPath, file);
        const audit = await auditFile(filePath, kind);
        fileAudits.push(audit);

        if (spinner && options.verbose) {
          spinner.text = `Audited ${kind}/${file}`;
        }
      }
    }
  }

  spinner?.stop();

  if (fileAudits.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ error: "No files found to audit" }));
    } else {
      console.log(chalk.yellow("No files found to audit."));
    }
    return;
  }

  // Generate report
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    projectPath: process.cwd(),
    summary: {
      totalFiles: fileAudits.length,
      averageScore: Math.round(
        fileAudits.reduce((sum, f) => sum + f.score, 0) / fileAudits.length
      ),
      passedFiles: fileAudits.filter((f) => f.score >= threshold).length,
      failedFiles: fileAudits.filter((f) => f.score < threshold).length,
      totalErrors: fileAudits.reduce(
        (sum, f) => sum + f.issues.filter((i) => i.severity === "error").length,
        0
      ),
      totalWarnings: fileAudits.reduce(
        (sum, f) =>
          sum + f.issues.filter((i) => i.severity === "warning").length,
        0
      ),
      totalInfos: fileAudits.reduce(
        (sum, f) => sum + f.issues.filter((i) => i.severity === "info").length,
        0
      ),
    },
    files: fileAudits,
    recommendations: generateRecommendations(fileAudits),
  };

  // Output JSON format
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.summary.failedFiles > 0 ? 1 : 0);
  }

  // Save report if output specified
  if (options.output) {
    await fs.writeJson(options.output, report, { spaces: 2 });
    console.log(chalk.green(`Report saved to: ${options.output}\n`));
  }

  // Display results
  console.log(chalk.bold("Audit Summary:\n"));

  // Score gauge
  const avgScore = report.summary.averageScore;
  const scoreColor =
    avgScore >= 80 ? chalk.green : avgScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Overall Score: ${scoreColor(avgScore + "/100")}`);
  console.log(`  Files Audited: ${report.summary.totalFiles}`);
  console.log(
    `  Passed (>=${threshold}): ${chalk.green(report.summary.passedFiles)}`
  );
  console.log(
    `  Failed (<${threshold}): ${chalk.red(report.summary.failedFiles)}`
  );
  console.log();

  // Issue counts
  console.log(chalk.bold("Issues Found:"));
  console.log(`  ${chalk.red("Errors:")} ${report.summary.totalErrors}`);
  console.log(`  ${chalk.yellow("Warnings:")} ${report.summary.totalWarnings}`);
  console.log(`  ${chalk.blue("Info:")} ${report.summary.totalInfos}`);
  console.log();

  // File-by-file results
  if (options.verbose) {
    console.log(chalk.bold("File Details:\n"));

    for (const file of fileAudits) {
      const relPath = path.relative(claudeDir, file.file);
      const scoreColor =
        file.score >= 80
          ? chalk.green
          : file.score >= 60
            ? chalk.yellow
            : chalk.red;
      const statusIcon =
        file.score >= threshold ? chalk.green("PASS") : chalk.red("FAIL");

      console.log(
        `${statusIcon} ${chalk.bold(relPath)} - Score: ${scoreColor(file.score)}`
      );
      console.log(chalk.gray(`     Tokens: ~${file.metrics.tokenCount}`));

      if (file.issues.length > 0) {
        for (const issue of file.issues) {
          const severityIcon =
            issue.severity === "error"
              ? chalk.red("!")
              : issue.severity === "warning"
                ? chalk.yellow("!")
                : chalk.blue("i");
          console.log(`     ${severityIcon} ${issue.message}`);
          if (issue.suggestion && options.verbose) {
            console.log(chalk.gray(`       -> ${issue.suggestion}`));
          }
        }
      }
      console.log();
    }
  }

  // Recommendations
  console.log(chalk.bold("Recommendations:"));
  report.recommendations.forEach((rec) => {
    console.log(chalk.cyan(`  - ${rec}`));
  });
  console.log();

  // Exit code based on threshold
  if (report.summary.failedFiles > 0) {
    console.log(
      chalk.red(
        `\n${report.summary.failedFiles} file(s) failed the quality threshold (${threshold}).`
      )
    );
    process.exit(1);
  } else {
    console.log(chalk.green("\nAll files passed the quality audit!"));
  }
}
