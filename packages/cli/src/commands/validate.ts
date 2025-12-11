/**
 * gICM CLI - Validate Command
 * Validate Claude Code project setup and installed items against Agent Skills v2 schema
 */

import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { z } from "zod";

// ============================================================================
// Types & Schemas
// ============================================================================

export interface ValidateOptions {
  path?: string;
  fix?: boolean;
  report?: string;
  verbose?: boolean;
}

interface ValidationIssue {
  severity: "error" | "warning" | "info";
  category: string;
  message: string;
  file?: string;
  line?: number;
  fix?: () => Promise<void>;
}

interface ValidationReport {
  timestamp: string;
  projectPath: string;
  summary: {
    totalFiles: number;
    validFiles: number;
    invalidFiles: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfos: number;
  };
  issues: ValidationIssue[];
}

// ============================================================================
// Agent Skills v2 Schema (subset for validation)
// ============================================================================

const RESERVED_WORDS = ["anthropic", "claude", "official"] as const;

const SkillMetadataSchema = z.object({
  skillId: z
    .string()
    .min(1)
    .max(64)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "skillId must be lowercase alphanumeric with hyphens"
    )
    .optional(),
  name: z.string().min(1).max(64),
  description: z.string().min(1).max(1024),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must be semver format")
    .optional(),
  author: z.string().max(128).optional(),
  category: z.string().max(64).optional(),
  tags: z.array(z.string().max(32)).max(10).optional(),
  license: z.string().max(32).optional(),
});

// ============================================================================
// YAML Frontmatter Parser
// ============================================================================

function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
  hasFrontmatter: boolean;
} {
  if (!content.startsWith("---")) {
    return { frontmatter: {}, body: content, hasFrontmatter: false };
  }

  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content, hasFrontmatter: false };
  }

  const [, yamlPart, body] = match;
  const frontmatter: Record<string, unknown> = {};
  const lines = yamlPart.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Handle arrays
    if (
      typeof value === "string" &&
      value.startsWith("[") &&
      value.endsWith("]")
    ) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/["']/g, ""));
    }
    // Handle booleans
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    // Handle numbers
    else if (
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value !== ""
    ) {
      value = Number(value);
    }
    // Remove quotes from strings
    else if (typeof value === "string") {
      value = value.replace(/^["']|["']$/g, "");
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body, hasFrontmatter: true };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a skill file against Agent Skills v2 schema
 */
function validateSkillFile(
  content: string,
  filePath: string,
  kind: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fileName = path.basename(filePath);

  // Parse frontmatter
  const { frontmatter, body, hasFrontmatter } = parseFrontmatter(content);

  // Check for YAML frontmatter
  if (!hasFrontmatter) {
    issues.push({
      severity: "error",
      category: "Schema",
      message: "Missing YAML frontmatter (required by Agent Skills v2)",
      file: fileName,
    });
    return issues; // Can't continue without frontmatter
  }

  // Validate against schema
  const result = SkillMetadataSchema.safeParse(frontmatter);
  if (!result.success) {
    for (const error of result.error.errors) {
      issues.push({
        severity: "error",
        category: "Schema",
        message: `${error.path.join(".")}: ${error.message}`,
        file: fileName,
      });
    }
  }

  // Check for reserved words in name
  const name = frontmatter.name as string | undefined;
  if (name) {
    for (const word of RESERVED_WORDS) {
      if (name.toLowerCase().includes(word)) {
        issues.push({
          severity: "error",
          category: "Reserved",
          message: `Name cannot contain reserved word: "${word}"`,
          file: fileName,
        });
      }
    }
  }

  // Check description length
  const description = frontmatter.description as string | undefined;
  if (description && description.length > 1024) {
    issues.push({
      severity: "error",
      category: "Schema",
      message: `Description exceeds 1024 character limit (${description.length} chars)`,
      file: fileName,
    });
  }

  // Check for missing required fields (warnings for legacy files)
  const requiredFields: Record<string, string[]> = {
    agent: ["name", "description"],
    skill: ["name", "description"],
    command: ["name", "description"],
  };

  for (const field of requiredFields[kind] || []) {
    if (!frontmatter[field]) {
      issues.push({
        severity: "warning",
        category: "Missing",
        message: `Missing recommended field: ${field}`,
        file: fileName,
      });
    }
  }

  // Check for version (warning if missing)
  if (!frontmatter.version) {
    issues.push({
      severity: "warning",
      category: "Missing",
      message: "Missing version field (recommended for v2 schema)",
      file: fileName,
    });
  }

  // Check for tags (info if missing)
  if (
    !frontmatter.tags ||
    (Array.isArray(frontmatter.tags) && frontmatter.tags.length === 0)
  ) {
    issues.push({
      severity: "info",
      category: "Optimization",
      message: "No tags defined (recommended for discoverability)",
      file: fileName,
    });
  }

  // Check content quality
  if (body.length < 100) {
    issues.push({
      severity: "warning",
      category: "Quality",
      message: "Content body is very short (<100 characters)",
      file: fileName,
    });
  }

  // Check for examples
  if (!body.match(/```/) && !body.match(/##?\s*example/i)) {
    issues.push({
      severity: "info",
      category: "Quality",
      message: "No code examples found (recommended for skills)",
      file: fileName,
    });
  }

  return issues;
}

/**
 * Main validate command handler
 */
export async function validateCommand(
  options: ValidateOptions = {}
): Promise<void> {
  console.log(chalk.bold("\nValidate - Agent Skills v2 Schema Validation\n"));

  const issues: ValidationIssue[] = [];
  const basePath = options.path || process.cwd();
  const claudeDir = path.join(basePath, ".claude");

  let totalFiles = 0;
  let validFiles = 0;
  let invalidFiles = 0;

  // 1. Check .claude directory structure
  const structureCheck = ora("Validating directory structure...").start();
  try {
    const requiredDirs = [
      "agents",
      "skills",
      "commands",
      "workflows",
      "settings",
    ];

    const claudeDirExists = await fs.pathExists(claudeDir);
    if (!claudeDirExists) {
      structureCheck.fail();
      issues.push({
        severity: "error",
        category: "Structure",
        message: ".claude directory not found",
        fix: async () => {
          await fs.ensureDir(claudeDir);
          for (const dir of requiredDirs) {
            await fs.ensureDir(path.join(claudeDir, dir));
          }
        },
      });
    } else {
      for (const dir of requiredDirs) {
        const dirPath = path.join(claudeDir, dir);
        const dirExists = await fs.pathExists(dirPath);

        if (!dirExists) {
          issues.push({
            severity: "warning",
            category: "Structure",
            message: `Missing directory: .claude/${dir}`,
            fix: async () => {
              await fs.ensureDir(dirPath);
            },
          });
        }
      }
      structureCheck.succeed();
    }
  } catch (error) {
    structureCheck.fail();
    issues.push({
      severity: "error",
      category: "Structure",
      message: `Directory validation failed: ${(error as Error).message}`,
    });
  }

  // 2. Check for CLAUDE.md
  const claudeMdCheck = ora("Checking CLAUDE.md...").start();
  try {
    const claudeMdPath = path.join(claudeDir, "CLAUDE.md");
    const claudeMdExists = await fs.pathExists(claudeMdPath);

    if (!claudeMdExists) {
      claudeMdCheck.warn();
      issues.push({
        severity: "warning",
        category: "Configuration",
        message: "CLAUDE.md not found (recommended for project context)",
      });
    } else {
      claudeMdCheck.succeed();
    }
  } catch (error) {
    claudeMdCheck.fail();
    issues.push({
      severity: "error",
      category: "Configuration",
      message: `CLAUDE.md check failed: ${(error as Error).message}`,
    });
  }

  // 3. Validate files against Agent Skills v2 schema
  const schemaCheck = ora(
    "Validating against Agent Skills v2 schema..."
  ).start();
  try {
    const itemTypes: Array<{ kind: string; dir: string }> = [
      { kind: "agent", dir: "agents" },
      { kind: "skill", dir: "skills" },
      { kind: "command", dir: "commands" },
    ];

    for (const { kind, dir } of itemTypes) {
      const dirPath = path.join(claudeDir, dir);
      const dirExists = await fs.pathExists(dirPath);

      if (dirExists) {
        const files = await fs.readdir(dirPath);
        const mdFiles = files.filter((file) => file.endsWith(".md"));

        for (const file of mdFiles) {
          totalFiles++;
          const filePath = path.join(dirPath, file);
          const content = await fs.readFile(filePath, "utf-8");
          const fileIssues = validateSkillFile(content, filePath, kind);

          if (fileIssues.some((i) => i.severity === "error")) {
            invalidFiles++;
          } else {
            validFiles++;
          }

          issues.push(...fileIssues);

          if (options.verbose) {
            const issueCount = fileIssues.length;
            const status =
              issueCount === 0
                ? chalk.green("OK")
                : fileIssues.some((i) => i.severity === "error")
                  ? chalk.red("FAIL")
                  : chalk.yellow("WARN");
            console.log(`  ${status} ${kind}/${file} (${issueCount} issues)`);
          }
        }
      }
    }

    schemaCheck.succeed(`Validated ${totalFiles} file(s)`);
  } catch (error) {
    schemaCheck.fail();
    issues.push({
      severity: "error",
      category: "Schema",
      message: `Schema validation failed: ${(error as Error).message}`,
    });
  }

  // 4. Check for duplicate IDs
  const duplicateCheck = ora("Checking for duplicate IDs...").start();
  try {
    const ids = new Set<string>();
    const duplicates: string[] = [];

    const checkDirectory = async (dirName: string) => {
      const dirPath = path.join(claudeDir, dirName);
      const dirExists = await fs.pathExists(dirPath);

      if (dirExists) {
        const files = await fs.readdir(dirPath);
        const mdFiles = files.filter((file) => file.endsWith(".md"));

        for (const file of mdFiles) {
          const filePath = path.join(dirPath, file);
          const content = await fs.readFile(filePath, "utf-8");

          // Extract ID from frontmatter
          const nameMatch = content.match(/^name:\s*(.+)$/m);
          if (nameMatch) {
            const id = nameMatch[1].trim();
            if (ids.has(id)) {
              duplicates.push(`${dirName}/${file} (ID: ${id})`);
            } else {
              ids.add(id);
            }
          }
        }
      }
    };

    await checkDirectory("agents");
    await checkDirectory("skills");
    await checkDirectory("commands");

    if (duplicates.length > 0) {
      duplicateCheck.fail();
      duplicates.forEach((dup) => {
        issues.push({
          severity: "error",
          category: "Duplicates",
          message: `Duplicate ID found: ${dup}`,
        });
      });
    } else {
      duplicateCheck.succeed("No duplicate IDs found");
    }
  } catch (error) {
    duplicateCheck.fail();
    issues.push({
      severity: "error",
      category: "Duplicates",
      message: `Duplicate check failed: ${(error as Error).message}`,
    });
  }

  // 5. Check for package.json
  const packageCheck = ora("Checking package.json...").start();
  try {
    const packageJsonPath = path.join(basePath, "package.json");
    const packageJsonExists = await fs.pathExists(packageJsonPath);

    if (!packageJsonExists) {
      packageCheck.warn();
      issues.push({
        severity: "warning",
        category: "Configuration",
        message: "package.json not found in project root",
      });
    } else {
      packageCheck.succeed();
    }
  } catch (error) {
    packageCheck.fail();
    issues.push({
      severity: "error",
      category: "Configuration",
      message: `package.json check failed: ${(error as Error).message}`,
    });
  }

  // Generate report if requested
  if (options.report) {
    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      projectPath: basePath,
      summary: {
        totalFiles,
        validFiles,
        invalidFiles,
        totalErrors: issues.filter((i) => i.severity === "error").length,
        totalWarnings: issues.filter((i) => i.severity === "warning").length,
        totalInfos: issues.filter((i) => i.severity === "info").length,
      },
      issues,
    };

    await fs.writeJson(options.report, report, { spaces: 2 });
    console.log(chalk.green(`\nReport saved to: ${options.report}`));
  }

  // Display results
  console.log(chalk.bold("\nValidation Results:\n"));

  if (issues.length === 0) {
    console.log(chalk.green("All files are valid! No issues found.\n"));
    return;
  }

  // Group issues by severity
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  // Summary stats
  console.log(chalk.bold("Summary:"));
  console.log(`  Files validated: ${totalFiles}`);
  console.log(`  Valid: ${chalk.green(validFiles)}`);
  console.log(`  Invalid: ${chalk.red(invalidFiles)}`);
  console.log();

  if (errors.length > 0) {
    console.log(chalk.red.bold(`Errors (${errors.length}):\n`));
    errors.forEach((issue) => {
      const loc = issue.file ? chalk.gray(`[${issue.file}]`) : "";
      console.log(
        `  ${chalk.red("x")} ${chalk.bold(issue.category)}: ${issue.message} ${loc}`
      );
    });
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`\nWarnings (${warnings.length}):\n`));
    warnings.forEach((issue) => {
      const loc = issue.file ? chalk.gray(`[${issue.file}]`) : "";
      console.log(
        `  ${chalk.yellow("!")} ${chalk.bold(issue.category)}: ${issue.message} ${loc}`
      );
    });
  }

  if (infos.length > 0 && options.verbose) {
    console.log(chalk.blue.bold(`\nInfo (${infos.length}):\n`));
    infos.forEach((issue) => {
      const loc = issue.file ? chalk.gray(`[${issue.file}]`) : "";
      console.log(
        `  ${chalk.blue("i")} ${chalk.bold(issue.category)}: ${issue.message} ${loc}`
      );
    });
  }

  // Attempt to fix issues if --fix flag is provided
  if (options.fix) {
    console.log(chalk.bold("\nAttempting to fix issues...\n"));

    const fixableIssues = issues.filter((issue) => issue.fix);
    if (fixableIssues.length === 0) {
      console.log(chalk.yellow("No auto-fixable issues found.\n"));
    } else {
      for (const issue of fixableIssues) {
        const spinner = ora(`Fixing: ${issue.message}`).start();
        try {
          if (issue.fix) {
            await issue.fix();
            spinner.succeed(`Fixed: ${issue.message}`);
          }
        } catch (error) {
          spinner.fail(`Failed to fix: ${issue.message}`);
          console.log(chalk.red(`  Error: ${(error as Error).message}`));
        }
      }

      console.log(
        chalk.green("\nAuto-fix complete. Run validate again to check.\n")
      );
    }
  } else {
    console.log(
      chalk.dim("\nRun with --fix to automatically fix some issues.\n")
    );
  }

  // Exit with error code if critical issues found
  if (errors.length > 0) {
    process.exit(1);
  }
}
