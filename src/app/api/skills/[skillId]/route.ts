import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { REGISTRY, getItemById } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";

// ============================================================================
// Skill Detail API - GET /api/skills/[skillId]
// Returns full skill details including content
// ============================================================================

// Skill ID validation schema
const SkillIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Invalid skill ID format");

// Response type with full skill content
interface SkillDetailResponse {
  skill: RegistryItem;
  content: string;
  relatedSkills: {
    id: string;
    name: string;
    slug: string;
    description: string;
  }[];
}

/**
 * Generates skill content/instructions based on the skill data.
 * In a production system, this would fetch from a content store.
 */
function generateSkillContent(skill: RegistryItem): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${skill.name}`);
  sections.push("");
  sections.push(skill.description);
  sections.push("");

  // Long description if available
  if (skill.longDescription) {
    sections.push("## Overview");
    sections.push(skill.longDescription);
    sections.push("");
  }

  // Installation
  sections.push("## Installation");
  sections.push("```bash");
  sections.push(skill.install);
  sections.push("```");
  sections.push("");

  // Setup instructions if available
  if (skill.setup) {
    sections.push("## Setup");
    sections.push(skill.setup);
    sections.push("");
  }

  // Environment variables if any
  if (skill.envKeys && skill.envKeys.length > 0) {
    sections.push("## Environment Variables");
    sections.push("");
    for (const key of skill.envKeys) {
      sections.push(`- \`${key}\``);
    }
    sections.push("");
  }

  // Progressive disclosure info
  if (skill.progressiveDisclosure) {
    sections.push("## Token Budget");
    sections.push("");
    sections.push(
      `- Level 1 (Metadata): ~${skill.progressiveDisclosure.level1Tokens} tokens`
    );
    sections.push(
      `- Level 2 (Instructions): ~${skill.progressiveDisclosure.level2Tokens} tokens`
    );
    sections.push(
      `- Level 3 (Resources): ~${skill.progressiveDisclosure.level3Estimate} tokens`
    );
    sections.push("");
  }

  // Code execution capabilities
  if (skill.codeExecution) {
    sections.push("## Code Execution");
    sections.push("");
    sections.push(
      `- Sandbox Mode: ${skill.codeExecution.sandbox ? "Yes" : "No"}`
    );
    sections.push(
      `- Network Access: ${skill.codeExecution.networkAccess ? "Yes" : "No"}`
    );
    if (
      skill.codeExecution.preinstalledPackages &&
      skill.codeExecution.preinstalledPackages.length > 0
    ) {
      sections.push(
        `- Preinstalled Packages: ${skill.codeExecution.preinstalledPackages.join(", ")}`
      );
    }
    sections.push("");
  }

  // Resources
  if (skill.resources) {
    sections.push("## Resources");
    sections.push("");
    if (skill.resources.scripts && skill.resources.scripts.length > 0) {
      sections.push("### Scripts");
      for (const script of skill.resources.scripts) {
        sections.push(`- \`${script}\``);
      }
      sections.push("");
    }
    if (skill.resources.templates && skill.resources.templates.length > 0) {
      sections.push("### Templates");
      for (const template of skill.resources.templates) {
        sections.push(`- \`${template}\``);
      }
      sections.push("");
    }
    if (skill.resources.references && skill.resources.references.length > 0) {
      sections.push("### References");
      for (const ref of skill.resources.references) {
        sections.push(`- ${ref}`);
      }
      sections.push("");
    }
  }

  // Platform compatibility
  if (skill.platforms && skill.platforms.length > 0) {
    sections.push("## Platform Compatibility");
    sections.push("");
    sections.push(`Supported platforms: ${skill.platforms.join(", ")}`);
    sections.push("");
  }

  // Model compatibility
  if (skill.compatibility?.models && skill.compatibility.models.length > 0) {
    sections.push("## Model Compatibility");
    sections.push("");
    sections.push(
      `Recommended models: ${skill.compatibility.models.join(", ")}`
    );
    sections.push("");
  }

  // Tags
  if (skill.tags.length > 0) {
    sections.push("## Tags");
    sections.push("");
    sections.push(skill.tags.map((t) => `\`${t}\``).join(" "));
    sections.push("");
  }

  return sections.join("\n");
}

/**
 * Finds related skills based on category and tags.
 */
function findRelatedSkills(
  skill: RegistryItem,
  allSkills: RegistryItem[],
  limit = 5
): { id: string; name: string; slug: string; description: string }[] {
  const related = allSkills
    .filter((s) => s.id !== skill.id && s.kind === "skill")
    .map((s) => {
      let score = 0;

      // Same category
      if (s.category === skill.category) {
        score += 3;
      }

      // Shared tags
      const sharedTags = s.tags.filter((t) => skill.tags.includes(t));
      score += sharedTags.length;

      // Same platform
      if (skill.platforms && s.platforms) {
        const sharedPlatforms = s.platforms.filter((p) =>
          skill.platforms!.includes(p)
        );
        score += sharedPlatforms.length * 0.5;
      }

      return { skill: s, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      id: item.skill.id,
      name: item.skill.name,
      slug: item.skill.slug,
      description: item.skill.description,
    }));

  return related;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params;

    // Validate skill ID
    const parseResult = SkillIdSchema.safeParse(skillId);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid skill ID format",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Find skill by ID or skillId field
    let skill = getItemById(parseResult.data);

    // If not found by ID, try finding by skillId field
    if (!skill) {
      skill = REGISTRY.find(
        (item) => item.kind === "skill" && item.skillId === parseResult.data
      );
    }

    // If still not found, try slug
    if (!skill) {
      skill = REGISTRY.find(
        (item) => item.kind === "skill" && item.slug === parseResult.data
      );
    }

    if (!skill || skill.kind !== "skill") {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Generate content
    const content = generateSkillContent(skill);

    // Find related skills
    const relatedSkills = findRelatedSkills(skill, REGISTRY);

    const response: SkillDetailResponse = {
      skill,
      content,
      relatedSkills,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/skills/[skillId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
