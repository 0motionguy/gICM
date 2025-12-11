/**
 * Add YAML Frontmatter to All Skills
 *
 * Makes gICM skills compatible with OpenSkills/Anthropic SKILL.md format.
 * Adds YAML frontmatter while preserving existing content.
 *
 * Usage: npx ts-node scripts/add-yaml-frontmatter.ts
 */

import * as fs from "fs";
import * as path from "path";

const SKILLS_DIR = path.join(__dirname, "../.claude/skills");

interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  gicm?: {
    progressiveDisclosure: boolean;
    tokenBudgets?: number[];
  };
}

/**
 * Extract skill name from directory name (kebab-case to title case)
 */
function extractSkillName(dirName: string): string {
  return dirName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extract description from first paragraph after heading
 */
function extractDescription(content: string): string {
  // Look for blockquote description (progressive disclosure indicator)
  const blockquoteMatch = content.match(/>\s*(.+?)(?:\n|$)/);
  if (blockquoteMatch) {
    return blockquoteMatch[1].trim();
  }

  // Look for first paragraph after heading
  const paragraphMatch = content.match(/^#[^\n]+\n+([^#\n>][^\n]+)/m);
  if (paragraphMatch) {
    return paragraphMatch[1].trim();
  }

  // Fallback to directory name based description
  return "Skill for specialized development tasks";
}

/**
 * Extract token budgets from progressive disclosure comment
 */
function extractTokenBudgets(content: string): number[] | undefined {
  // Look for "34 tokens" or similar patterns
  const match = content.match(
    /(\d+)\s*tokens.*?expands?\s*to\s*(\d+)\s*tokens/i
  );
  if (match) {
    return [parseInt(match[1]), parseInt(match[2])];
  }
  return undefined;
}

/**
 * Check if content already has YAML frontmatter
 */
function hasFrontmatter(content: string): boolean {
  return content.trimStart().startsWith("---");
}

/**
 * Generate YAML frontmatter
 */
function generateFrontmatter(metadata: SkillMetadata): string {
  let yaml = `---
name: ${metadata.name}
description: "${metadata.description.replace(/"/g, '\\"')}"
version: ${metadata.version}
author: ${metadata.author}
license: ${metadata.license}`;

  if (metadata.gicm) {
    yaml += `
gicm:
  progressiveDisclosure: ${metadata.gicm.progressiveDisclosure}`;
    if (metadata.gicm.tokenBudgets) {
      yaml += `
  tokenBudgets: [${metadata.gicm.tokenBudgets.join(", ")}]`;
    }
  }

  yaml += `
---

`;
  return yaml;
}

/**
 * Process a single SKILL.md file
 */
function processSkillFile(
  filePath: string,
  dirName: string
): { updated: boolean; error?: string } {
  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Skip if already has frontmatter
    if (hasFrontmatter(content)) {
      return { updated: false, error: "Already has frontmatter" };
    }

    // Extract metadata
    const name = dirName; // Use directory name as skill ID (kebab-case)
    const displayName = extractSkillName(dirName);
    const description = extractDescription(content);
    const tokenBudgets = extractTokenBudgets(content);
    const hasProgressiveDisclosure =
      content.includes("Progressive disclosure") ||
      content.includes("Quick Reference") ||
      tokenBudgets !== undefined;

    const metadata: SkillMetadata = {
      name,
      description:
        description.length > 200
          ? description.substring(0, 197) + "..."
          : description,
      version: "1.0.0",
      author: "gICM Community",
      license: "Apache-2.0",
    };

    if (hasProgressiveDisclosure) {
      metadata.gicm = {
        progressiveDisclosure: true,
        tokenBudgets,
      };
    }

    // Generate and prepend frontmatter
    const frontmatter = generateFrontmatter(metadata);
    const newContent = frontmatter + content;

    // Write back
    fs.writeFileSync(filePath, newContent, "utf-8");

    return { updated: true };
  } catch (error) {
    return {
      updated: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Process all skills in the directory
 */
function processAllSkills(): void {
  console.log("=".repeat(60));
  console.log("Adding YAML Frontmatter to gICM Skills");
  console.log("=".repeat(60));
  console.log();

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const stats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(SKILLS_DIR, entry.name);
    const skillFile = path.join(skillDir, "SKILL.md");

    // Check for SKILL.md in directory
    if (fs.existsSync(skillFile)) {
      stats.total++;
      const result = processSkillFile(skillFile, entry.name);

      if (result.updated) {
        stats.updated++;
        console.log(`✅ ${entry.name}`);
      } else if (result.error?.includes("frontmatter")) {
        stats.skipped++;
        console.log(`⏭️  ${entry.name} (already has frontmatter)`);
      } else {
        stats.errors++;
        console.log(`❌ ${entry.name}: ${result.error}`);
      }
    } else {
      // Check for .md file directly (some skills are single files)
      const directFile = skillDir + ".md";
      if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
        // This is a direct .md file, not a directory
        continue;
      }
    }
  }

  // Also process standalone .md files in skills directory
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const filePath = path.join(SKILLS_DIR, entry.name);
      const skillName = entry.name.replace(".md", "");
      stats.total++;

      const result = processSkillFile(filePath, skillName);

      if (result.updated) {
        stats.updated++;
        console.log(`✅ ${skillName} (standalone)`);
      } else if (result.error?.includes("frontmatter")) {
        stats.skipped++;
        console.log(`⏭️  ${skillName} (already has frontmatter)`);
      } else {
        stats.errors++;
        console.log(`❌ ${skillName}: ${result.error}`);
      }
    }
  }

  console.log();
  console.log("=".repeat(60));
  console.log("Summary:");
  console.log(`  Total skills:   ${stats.total}`);
  console.log(`  Updated:        ${stats.updated}`);
  console.log(`  Skipped:        ${stats.skipped}`);
  console.log(`  Errors:         ${stats.errors}`);
  console.log("=".repeat(60));
}

// Run if called directly
if (require.main === module) {
  processAllSkills();
}

export { processAllSkills, processSkillFile, generateFrontmatter };
