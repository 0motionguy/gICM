#!/usr/bin/env ts-node
/**
 * Skills Schema Validation Script
 *
 * Validates all SKILL.md files against Agent Skills v2 schema:
 * - Name: max 64 chars, no reserved words
 * - Description: max 1024 chars
 * - Skill ID: valid format, no reserved words
 * - Version: semver format
 * - Token budgets: within limits
 *
 * Generates validation report with actionable fixes.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import {
  AgentSkillV2Schema,
  validateSkillId,
  validateSkillName,
} from "../src/types/skill-v2";
import type { AgentSkillV2 } from "../src/types/skill-v2";

// ============================================================================
// Configuration
// ============================================================================

const SKILL_DIRS = [
  ".cache/repos/anthropic-skills/skills",
  ".cache/repos/superpowers",
  ".cache/repos/community-skills",
  "public/marketplace/skills", // Local marketplace skills
];

const CACHE_DIR = join(process.cwd(), ".cache");
const VALIDATION_REPORT_PATH = join(CACHE_DIR, "validation-report.json");

// ============================================================================
// Types
// ============================================================================

interface ValidationIssue {
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
  suggestion?: string;
}

interface FileValidation {
  file: string;
  valid: boolean;
  issues: ValidationIssue[];
  skill?: AgentSkillV2;
}

interface ValidationReport {
  timestamp: string;
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  errors: number;
  warnings: number;
  files: FileValidation[];
}

// ============================================================================
// File Discovery
// ============================================================================

function findSkillFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        files.push(...findSkillFiles(fullPath));
      } else if (entry === "SKILL.md" || entry.endsWith(".skill.json")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or not accessible
    console.warn(`⚠️  Could not access directory: ${dir}`);
  }

  return files;
}

function getAllSkillFiles(): string[] {
  const allFiles: string[] = [];

  for (const dir of SKILL_DIRS) {
    const fullDir = join(process.cwd(), dir);
    allFiles.push(...findSkillFiles(fullDir));
  }

  return allFiles;
}

// ============================================================================
// Parsing
// ============================================================================

function parseSkillMarkdown(content: string): Partial<AgentSkillV2> | null {
  try {
    // Extract YAML frontmatter or JSON blocks
    const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
    const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/);

    if (yamlMatch) {
      // Parse YAML frontmatter (simplified - in production use yaml parser)
      return parseYamlFrontmatter(yamlMatch[1]);
    } else if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    return null;
  } catch (error) {
    return null;
  }
}

function parseYamlFrontmatter(yaml: string): Partial<AgentSkillV2> {
  // Simplified YAML parser for common fields
  // In production, use a proper YAML library like js-yaml
  const lines = yaml.split("\n");
  const data: any = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // Handle quoted strings
    if (value.startsWith('"') && value.endsWith('"')) {
      data[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      data[key] = value.slice(1, -1);
    } else {
      data[key] = value;
    }
  }

  return data;
}

function parseSkillFile(filePath: string): Partial<AgentSkillV2> | null {
  try {
    const content = readFileSync(filePath, "utf-8");

    if (filePath.endsWith(".json")) {
      return JSON.parse(content);
    } else if (filePath.endsWith(".md")) {
      return parseSkillMarkdown(content);
    }

    return null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// Validation
// ============================================================================

function validateSkillFile(filePath: string): FileValidation {
  const result: FileValidation = {
    file: relative(process.cwd(), filePath),
    valid: false,
    issues: [],
  };

  // Try to parse the file
  const skillData = parseSkillFile(filePath);

  if (!skillData) {
    result.issues.push({
      severity: "error",
      field: "file",
      message: "Could not parse skill file",
      suggestion: "Ensure file contains valid JSON or YAML frontmatter",
    });
    return result;
  }

  // Validate against schema
  const validation = AgentSkillV2Schema.safeParse(skillData);

  if (validation.success) {
    result.valid = true;
    result.skill = validation.data;
  } else {
    // Parse Zod errors into validation issues
    for (const error of validation.error.errors) {
      const field = error.path.join(".");
      result.issues.push({
        severity: "error",
        field,
        message: error.message,
        suggestion: getSuggestionForError(error),
      });
    }
  }

  // Additional custom validations
  if (skillData.level1?.metadata) {
    const metadata = skillData.level1.metadata;

    // Validate skill ID
    if (metadata.skillId) {
      const idValidation = validateSkillId(metadata.skillId);
      if (!idValidation.valid) {
        result.issues.push({
          severity: "error",
          field: "level1.metadata.skillId",
          message: idValidation.error,
        });
      }
    }

    // Validate name
    if (metadata.name) {
      const nameValidation = validateSkillName(metadata.name);
      if (!nameValidation.valid) {
        result.issues.push({
          severity: "error",
          field: "level1.metadata.name",
          message: nameValidation.error,
        });
      }
    }

    // Check name length
    if (metadata.name && metadata.name.length > 64) {
      result.issues.push({
        severity: "error",
        field: "level1.metadata.name",
        message: "Name exceeds 64 characters",
        suggestion: `Shorten name to 64 chars or less (current: ${metadata.name.length})`,
      });
    }

    // Check description length
    if (metadata.description && metadata.description.length > 1024) {
      result.issues.push({
        severity: "error",
        field: "level1.metadata.description",
        message: "Description exceeds 1024 characters",
        suggestion: `Shorten description to 1024 chars or less (current: ${metadata.description.length})`,
      });
    }
  }

  // Validate token budgets
  if (
    skillData.level1?.estimatedTokens &&
    skillData.level1.estimatedTokens > 200
  ) {
    result.issues.push({
      severity: "warning",
      field: "level1.estimatedTokens",
      message: "Level 1 tokens exceed recommended 200 token limit",
      suggestion: "Reduce metadata verbosity to stay under 200 tokens",
    });
  }

  if (
    skillData.level2?.estimatedTokens &&
    skillData.level2.estimatedTokens > 5000
  ) {
    result.issues.push({
      severity: "error",
      field: "level2.estimatedTokens",
      message: "Level 2 tokens exceed 5000 token limit",
      suggestion: "Split large instructions into Level 3 resources",
    });
  }

  return result;
}

function getSuggestionForError(error: any): string | undefined {
  const message = error.message.toLowerCase();

  if (message.includes("required")) {
    return `Add required field: ${error.path.join(".")}`;
  }
  if (message.includes("too_small")) {
    return "Value is below minimum length/size";
  }
  if (message.includes("too_big")) {
    return "Value exceeds maximum length/size";
  }
  if (message.includes("invalid_type")) {
    return `Expected type: ${error.expected}`;
  }

  return undefined;
}

// ============================================================================
// Validation Orchestration
// ============================================================================

async function validateAllSkills(): Promise<ValidationReport> {
  console.log("🔍 Starting skill schema validation...\n");

  const startTime = Date.now();
  const skillFiles = getAllSkillFiles();

  console.log(`Found ${skillFiles.length} skill files to validate\n`);

  const fileValidations: FileValidation[] = [];

  for (const file of skillFiles) {
    const validation = validateSkillFile(file);
    fileValidations.push(validation);

    // Print immediate feedback
    if (validation.valid) {
      console.log(`✅ ${validation.file}`);
    } else {
      console.log(`❌ ${validation.file} (${validation.issues.length} issues)`);
      for (const issue of validation.issues) {
        const icon = issue.severity === "error" ? "  ✗" : "  ⚠";
        console.log(`${icon} [${issue.field}] ${issue.message}`);
        if (issue.suggestion) {
          console.log(`    💡 ${issue.suggestion}`);
        }
      }
    }
  }

  const duration = Date.now() - startTime;
  const validFiles = fileValidations.filter((f) => f.valid).length;
  const invalidFiles = fileValidations.filter((f) => !f.valid).length;
  const errors = fileValidations.reduce(
    (sum, f) => sum + f.issues.filter((i) => i.severity === "error").length,
    0
  );
  const warnings = fileValidations.reduce(
    (sum, f) => sum + f.issues.filter((i) => i.severity === "warning").length,
    0
  );

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    totalFiles: skillFiles.length,
    validFiles,
    invalidFiles,
    errors,
    warnings,
    files: fileValidations,
  };

  return report;
}

// ============================================================================
// Reporting
// ============================================================================

function printSummary(report: ValidationReport): void {
  console.log(
    "\n═══════════════════════════════════════════════════════════════"
  );
  console.log("📊 VALIDATION SUMMARY");
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`Timestamp:        ${report.timestamp}`);
  console.log(`Total Files:      ${report.totalFiles}`);
  console.log(`Valid:            ${report.validFiles}`);
  console.log(`Invalid:          ${report.invalidFiles}`);
  console.log(`Errors:           ${report.errors}`);
  console.log(`Warnings:         ${report.warnings}`);
  console.log("");

  const successRate = ((report.validFiles / report.totalFiles) * 100).toFixed(
    1
  );
  console.log(`Success Rate:     ${successRate}%`);

  if (report.invalidFiles > 0) {
    console.log("\n❌ FILES REQUIRING FIXES:");
    report.files
      .filter((f) => !f.valid)
      .forEach((f) => {
        console.log(`  ${f.file}`);
        const errorCount = f.issues.filter(
          (i) => i.severity === "error"
        ).length;
        const warningCount = f.issues.filter(
          (i) => i.severity === "warning"
        ).length;
        console.log(`    - ${errorCount} errors, ${warningCount} warnings`);
      });
  } else {
    console.log("\n✅ All skill files pass validation!");
  }

  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
}

function saveReport(report: ValidationReport): void {
  writeFileSync(VALIDATION_REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(
    `\n📄 Full validation report saved to: ${VALIDATION_REPORT_PATH}`
  );
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    const report = await validateAllSkills();
    printSummary(report);
    saveReport(report);

    // Exit with error code if validation failures
    if (report.invalidFiles > 0 || report.errors > 0) {
      console.log(
        "\n❌ Validation failed - fix errors before deploying to marketplace"
      );
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Fatal error during validation:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateAllSkills, validateSkillFile };
export type { ValidationReport, FileValidation, ValidationIssue };
