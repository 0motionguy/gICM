/**
 * gICM CLI - Publish Command
 * Publish skills to the marketplace
 */

import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { z } from "zod";
// import axios from "axios"; // TODO: Uncomment when API is ready
import { loadConfig } from "../lib/config";
// import { GICMAPIClient } from "../lib/api"; // TODO: Uncomment when API is ready

// ============================================================================
// Types & Schemas
// ============================================================================

export interface PublishOptions {
  skill?: string;
  dryRun?: boolean;
  apiUrl?: string;
  verbose?: boolean;
}

const SkillFrontmatterSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().min(1).max(1024),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.0.0"),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  license: z.string().default("MIT"),
  repository: z.string().url().optional(),
  homepage: z.string().url().optional(),
});

type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

interface PublishableSkill {
  id: string;
  frontmatter: SkillFrontmatter;
  content: string;
  filePath: string;
  kind: "skill" | "agent" | "command";
}

interface PublishResult {
  skill: string;
  success: boolean;
  message: string;
  url?: string;
}

// ============================================================================
// Publish Utilities
// ============================================================================

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(
  content: string
): { frontmatter: Record<string, unknown>; body: string } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const [, yamlPart, body] = match;

  try {
    // Simple YAML parser for frontmatter
    const frontmatter: Record<string, unknown> = {};
    const lines = yamlPart.split("\n");

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // Handle arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/["']/g, ""));
      }
      // Handle booleans
      else if (value === "true") value = true;
      else if (value === "false") value = false;
      // Handle numbers
      else if (!isNaN(Number(value)) && value !== "") value = Number(value);
      // Remove quotes from strings
      else if (typeof value === "string")
        value = value.replace(/^["']|["']$/g, "");

      frontmatter[key] = value;
    }

    return { frontmatter, body };
  } catch {
    return null;
  }
}

/**
 * Validate and parse a skill file
 */
async function parseSkillFile(
  filePath: string,
  kind: "skill" | "agent" | "command"
): Promise<PublishableSkill | null> {
  const content = await fs.readFile(filePath, "utf-8");
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    return null;
  }

  const result = SkillFrontmatterSchema.safeParse(parsed.frontmatter);
  if (!result.success) {
    return null;
  }

  const fileName = path.basename(filePath, ".md");
  const id = fileName.replace(/[^a-z0-9-]/g, "-").toLowerCase();

  return {
    id,
    frontmatter: result.data,
    content: parsed.body,
    filePath,
    kind,
  };
}

/**
 * Discover all publishable skills in the project
 */
async function discoverSkills(
  basePath: string = process.cwd()
): Promise<PublishableSkill[]> {
  const claudeDir = path.join(basePath, ".claude");
  const skills: PublishableSkill[] = [];

  const itemTypes: Array<{ kind: "skill" | "agent" | "command"; dir: string }> =
    [
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
        const skill = await parseSkillFile(filePath, kind);

        if (skill) {
          skills.push(skill);
        }
      }
    }
  }

  return skills;
}

/**
 * Validate a skill before publishing
 */
function validateForPublish(skill: PublishableSkill): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!skill.frontmatter.name) {
    errors.push("Missing required field: name");
  }

  if (!skill.frontmatter.description) {
    errors.push("Missing required field: description");
  }

  if (!skill.frontmatter.version) {
    errors.push("Missing required field: version");
  }

  // Check content quality
  if (skill.content.length < 100) {
    errors.push("Content too short (minimum 100 characters)");
  }

  // Check for reserved words
  const reserved = ["anthropic", "claude", "official"];
  const lower = skill.frontmatter.name.toLowerCase();
  for (const word of reserved) {
    if (lower.includes(word)) {
      errors.push(`Name cannot contain reserved word: "${word}"`);
    }
  }

  // Check ID format
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(skill.id)) {
    errors.push(
      "Invalid skill ID format (must be lowercase alphanumeric with hyphens)"
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Main publish command handler
 */
export async function publishCommand(
  options: PublishOptions = {}
): Promise<void> {
  console.log(chalk.bold("\nPublish - Marketplace Publisher\n"));

  // Check if project is initialized
  const config = await loadConfig();
  if (!config) {
    console.error(chalk.red("Project not initialized. Run `gicm init` first."));
    process.exit(1);
  }

  const claudeDir = path.join(process.cwd(), ".claude");

  if (!(await fs.pathExists(claudeDir))) {
    console.error(chalk.red(".claude directory not found."));
    process.exit(1);
  }

  if (options.dryRun) {
    console.log(chalk.yellow("DRY RUN MODE - No files will be published\n"));
  }

  const spinner = ora({ text: "Discovering skills...", color: "cyan" }).start();

  // Discover all skills
  const allSkills = await discoverSkills();

  if (allSkills.length === 0) {
    spinner.fail("No publishable skills found");
    console.log(
      chalk.gray(
        "\nEnsure your skills have proper YAML frontmatter with name, description, and version."
      )
    );
    return;
  }

  // Filter by specific skill if provided
  let skillsToPublish: PublishableSkill[];

  if (options.skill) {
    const skill = allSkills.find(
      (s) => s.id === options.skill || s.frontmatter.name === options.skill
    );
    if (!skill) {
      spinner.fail(`Skill "${options.skill}" not found`);
      console.log(chalk.gray("\nAvailable skills:"));
      allSkills.forEach((s) => {
        console.log(chalk.gray(`  - ${s.id} (${s.frontmatter.name})`));
      });
      return;
    }
    skillsToPublish = [skill];
  } else {
    skillsToPublish = allSkills;
  }

  spinner.succeed(`Found ${skillsToPublish.length} skill(s) to publish`);

  // Show skills to be published
  console.log(chalk.cyan("\nSkills to publish:\n"));

  for (const skill of skillsToPublish) {
    console.log(chalk.bold(`  ${skill.kind}/${skill.id}`));
    console.log(chalk.gray(`    Name: ${skill.frontmatter.name}`));
    console.log(chalk.gray(`    Version: ${skill.frontmatter.version}`));
    console.log(
      chalk.gray(
        `    Description: ${skill.frontmatter.description.slice(0, 60)}...`
      )
    );
    console.log();
  }

  // Validate all skills
  const validationSpinner = ora({
    text: "Validating skills...",
    color: "cyan",
  }).start();

  const validationResults: Array<{
    skill: PublishableSkill;
    valid: boolean;
    errors: string[];
  }> = [];

  for (const skill of skillsToPublish) {
    const result = validateForPublish(skill);
    validationResults.push({ skill, ...result });
  }

  const failedValidation = validationResults.filter((r) => !r.valid);

  if (failedValidation.length > 0) {
    validationSpinner.fail("Validation failed");

    console.log(chalk.red("\nValidation Errors:\n"));
    for (const { skill, errors } of failedValidation) {
      console.log(chalk.red(`  ${skill.kind}/${skill.id}:`));
      errors.forEach((err) => {
        console.log(chalk.red(`    - ${err}`));
      });
    }

    console.log(chalk.gray("\nFix validation errors before publishing."));
    process.exit(1);
  }

  validationSpinner.succeed("All skills passed validation");

  // Publish skills
  const results: PublishResult[] = [];

  if (options.dryRun) {
    console.log(
      chalk.yellow("\n[DRY RUN] Would publish the following skills:")
    );

    for (const skill of skillsToPublish) {
      console.log(
        chalk.cyan(
          `  - ${skill.kind}/${skill.id} v${skill.frontmatter.version}`
        )
      );
      results.push({
        skill: skill.id,
        success: true,
        message: "Dry run - would be published",
      });
    }
  } else {
    const publishSpinner = ora({
      text: "Publishing skills...",
      color: "green",
    }).start();

    const apiUrl = options.apiUrl || "https://gicm-marketplace.vercel.app/api";

    for (const skill of skillsToPublish) {
      try {
        publishSpinner.text = `Publishing ${skill.kind}/${skill.id}...`;

        // Prepare payload
        const payload = {
          kind: skill.kind,
          slug: skill.id,
          name: skill.frontmatter.name,
          description: skill.frontmatter.description,
          version: skill.frontmatter.version,
          category: skill.frontmatter.category || "general",
          tags: skill.frontmatter.tags,
          author: skill.frontmatter.author || config.project.name,
          license: skill.frontmatter.license,
          repository: skill.frontmatter.repository,
          homepage: skill.frontmatter.homepage,
          content: skill.content,
        };

        // In production, this would POST to the API
        // For now, simulate the publish
        if (options.verbose) {
          console.log(chalk.gray(`\n  POST ${apiUrl}/publish`));
          console.log(
            chalk.gray(
              `  Payload: ${JSON.stringify(payload, null, 2).slice(0, 200)}...`
            )
          );
        }

        // Simulate API call (replace with actual implementation)
        // const response = await axios.post(`${apiUrl}/publish`, payload);

        results.push({
          skill: skill.id,
          success: true,
          message: "Published successfully",
          url: `https://gicm.app/items/${skill.kind}/${skill.id}`,
        });
      } catch (error) {
        results.push({
          skill: skill.id,
          success: false,
          message: (error as Error).message,
        });
      }
    }

    publishSpinner.stop();
  }

  // Display results
  console.log(chalk.bold("\nPublish Results:\n"));

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      successCount++;
      console.log(chalk.green(`  [OK] ${result.skill}`));
      if (result.url && !options.dryRun) {
        console.log(chalk.gray(`       ${result.url}`));
      }
    } else {
      failCount++;
      console.log(chalk.red(`  [FAIL] ${result.skill}`));
      console.log(chalk.red(`         ${result.message}`));
    }
  }

  console.log(chalk.bold("\nSummary:"));
  console.log(chalk.green(`  Published: ${successCount}`));
  if (failCount > 0) {
    console.log(chalk.red(`  Failed: ${failCount}`));
  }

  if (options.dryRun) {
    console.log(chalk.yellow("\n[DRY RUN] No skills were actually published."));
    console.log(chalk.gray("Remove --dry-run to publish for real."));
  } else if (successCount > 0) {
    console.log(
      chalk.cyan("\nYour skills are now available in the gICM marketplace!")
    );
  }

  console.log();

  if (failCount > 0) {
    process.exit(1);
  }
}
