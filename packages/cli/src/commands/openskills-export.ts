/**
 * OpenSkills Export Command
 *
 * Exports gICM skills in OpenSkills-compatible format for use with:
 * - Claude Code (native)
 * - Cursor (via openskills)
 * - Windsurf (via openskills)
 * - Aider (via openskills)
 *
 * Usage: npx @gicm/cli openskills:export [--output ./openskills]
 */

import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

interface SkillCatalogEntry {
  name: string;
  description: string;
  location: "project" | "global" | "plugin";
}

interface ParsedFrontmatter {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  license?: string;
  gicm?: {
    progressiveDisclosure?: boolean;
    tokenBudgets?: number[];
  };
}

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseFrontmatter(content: string): ParsedFrontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result: ParsedFrontmatter = {};

  // Simple YAML parsing (handles basic key: value pairs)
  const lines = yaml.split("\n");
  let currentKey = "";

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();

      if (value.startsWith('"') && value.endsWith('"')) {
        (result as any)[currentKey] = value.slice(1, -1);
      } else if (value && !value.startsWith("{") && !value.startsWith("[")) {
        (result as any)[currentKey] = value;
      }
    }
  }

  return result;
}

/**
 * Remove gICM-specific extensions from SKILL.md content
 */
function stripGicmExtensions(content: string): string {
  let cleaned = content;

  // Remove gicm-specific YAML fields
  cleaned = cleaned.replace(/gicm:\n(\s+.*\n)*/g, "");

  // Keep standard OpenSkills fields
  return cleaned;
}

/**
 * Generate OpenSkills-compatible XML catalog
 */
function generateSkillsCatalog(skills: SkillCatalogEntry[]): string {
  let xml = `<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions
- Base directory provided in output for resolving bundled resources

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
</usage>

<available_skills>
`;

  for (const skill of skills) {
    xml += `
<skill>
<name>${skill.name}</name>
<description>${escapeXml(skill.description)}</description>
<location>${skill.location}</location>
</skill>
`;
  }

  xml += `
</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>`;

  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Export skills to OpenSkills format
 */
async function exportToOpenSkills(
  inputDir: string,
  outputDir: string,
  options: { pure?: boolean; catalog?: boolean }
): Promise<{ exported: number; errors: number }> {
  const stats = { exported: 0, errors: 0 };
  const catalogEntries: SkillCatalogEntry[] = [];

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entries = fs.readdirSync(inputDir, { withFileTypes: true });

  for (const entry of entries) {
    try {
      if (entry.isDirectory()) {
        const skillDir = path.join(inputDir, entry.name);
        const skillFile = path.join(skillDir, "SKILL.md");

        if (!fs.existsSync(skillFile)) continue;

        let content = fs.readFileSync(skillFile, "utf-8");
        const frontmatter = parseFrontmatter(content);

        // Strip gICM extensions if pure mode
        if (options.pure) {
          content = stripGicmExtensions(content);
        }

        // Create output skill directory
        const outSkillDir = path.join(outputDir, entry.name);
        if (!fs.existsSync(outSkillDir)) {
          fs.mkdirSync(outSkillDir, { recursive: true });
        }

        // Write SKILL.md
        fs.writeFileSync(path.join(outSkillDir, "SKILL.md"), content, "utf-8");

        // Copy bundled resources if they exist
        const resourceDirs = ["references", "scripts", "assets"];
        for (const resDir of resourceDirs) {
          const srcResDir = path.join(skillDir, resDir);
          if (fs.existsSync(srcResDir)) {
            const destResDir = path.join(outSkillDir, resDir);
            copyDirectory(srcResDir, destResDir);
          }
        }

        // Add to catalog
        if (frontmatter) {
          catalogEntries.push({
            name: frontmatter.name || entry.name,
            description: frontmatter.description || "gICM skill",
            location: "project",
          });
        }

        stats.exported++;
        console.log(`✅ ${entry.name}`);
      } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
        // Handle standalone skill files
        const skillFile = path.join(inputDir, entry.name);
        let content = fs.readFileSync(skillFile, "utf-8");
        const frontmatter = parseFrontmatter(content);
        const skillName = entry.name.replace(".md", "");

        if (options.pure) {
          content = stripGicmExtensions(content);
        }

        // Create output skill directory
        const outSkillDir = path.join(outputDir, skillName);
        if (!fs.existsSync(outSkillDir)) {
          fs.mkdirSync(outSkillDir, { recursive: true });
        }

        fs.writeFileSync(path.join(outSkillDir, "SKILL.md"), content, "utf-8");

        if (frontmatter) {
          catalogEntries.push({
            name: frontmatter.name || skillName,
            description: frontmatter.description || "gICM skill",
            location: "project",
          });
        }

        stats.exported++;
        console.log(`✅ ${skillName}`);
      }
    } catch (error) {
      stats.errors++;
      console.log(
        `❌ ${entry.name}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  // Generate catalog if requested
  if (options.catalog && catalogEntries.length > 0) {
    const catalogContent = generateSkillsCatalog(catalogEntries);
    const catalogPath = path.join(outputDir, "AGENTS.md");
    fs.writeFileSync(catalogPath, catalogContent, "utf-8");
    console.log(
      `\n📋 Generated AGENTS.md catalog with ${catalogEntries.length} skills`
    );
  }

  // Generate install instructions
  const installInstructions = `# gICM Skills for OpenSkills

## Installation

\`\`\`bash
# Install OpenSkills CLI
npm install -g openskills

# Install gICM skills
openskills install gicm/marketplace

# Or install from local export
cp -r ./* ~/.claude/skills/

# Sync to AGENTS.md
openskills sync
\`\`\`

## Available Skills

${catalogEntries.map((s) => `- **${s.name}**: ${s.description}`).join("\n")}

## Usage

After installation, Claude Code and other AI coding assistants will automatically detect and use these skills based on your queries.

## License

Apache-2.0 - Free to use, modify, and distribute.
`;

  fs.writeFileSync(
    path.join(outputDir, "README.md"),
    installInstructions,
    "utf-8"
  );

  return stats;
}

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Create the CLI command
 */
export function createOpenSkillsExportCommand(): Command {
  const command = new Command("openskills:export")
    .description("Export gICM skills in OpenSkills-compatible format")
    .option("-o, --output <dir>", "Output directory", "./openskills-export")
    .option("-i, --input <dir>", "Input skills directory", "./.claude/skills")
    .option(
      "--pure",
      "Strip gICM-specific extensions for pure OpenSkills format"
    )
    .option("--catalog", "Generate AGENTS.md skills catalog", true)
    .action(async (options) => {
      console.log("=".repeat(60));
      console.log("Exporting gICM Skills to OpenSkills Format");
      console.log("=".repeat(60));
      console.log();
      console.log(`Input:  ${options.input}`);
      console.log(`Output: ${options.output}`);
      console.log(`Pure mode: ${options.pure ? "yes" : "no"}`);
      console.log();

      const inputDir = path.resolve(options.input);
      const outputDir = path.resolve(options.output);

      if (!fs.existsSync(inputDir)) {
        console.error(`❌ Input directory not found: ${inputDir}`);
        process.exit(1);
      }

      const stats = await exportToOpenSkills(inputDir, outputDir, {
        pure: options.pure,
        catalog: options.catalog,
      });

      console.log();
      console.log("=".repeat(60));
      console.log("Summary:");
      console.log(`  Exported: ${stats.exported}`);
      console.log(`  Errors:   ${stats.errors}`);
      console.log();
      console.log("Next steps:");
      console.log(`  1. cd ${options.output}`);
      console.log(`  2. openskills sync`);
      console.log("  3. Or: cp -r * ~/.claude/skills/");
      console.log("=".repeat(60));
    });

  return command;
}

// Export for testing
export { exportToOpenSkills, generateSkillsCatalog, parseFrontmatter };
