import { NextResponse } from "next/server";
import { REGISTRY } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";
import { z } from "zod";

const DeployRequestSchema = z.object({
  itemSlug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  platform: z.enum(["bolt", "lovable"]),
  projectName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9-_ ]+$/, "Invalid project name"),
  userId: z.string().max(100).optional(),
});

/**
 * Deploy ClawdBot item to Bolt.new or Lovable.dev
 * POST /api/deploy
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parseResult = DeployRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { itemSlug, platform, projectName } = parseResult.data;

    // Get item from registry
    const item = REGISTRY.find((i) => i.slug === itemSlug);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if item is deployable
    if (!isDeployable(item)) {
      return NextResponse.json(
        {
          success: false,
          error: `${item.name} cannot be deployed. Only agents and skills with code files can be deployed.`,
        },
        { status: 400 }
      );
    }

    // Deploy to platform
    let deploymentResult;

    if (platform === "bolt") {
      deploymentResult = await deployToBolt(item, projectName);
    } else if (platform === "lovable") {
      deploymentResult = await deployToLovable(item, projectName);
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported platform: ${platform}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        name: projectName,
        platform,
        url: deploymentResult.url,
        editorUrl: deploymentResult.editorUrl,
        previewUrl: deploymentResult.previewUrl,
      },
      message: `Successfully deployed to ${platform}!`,
    });
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Deployment failed",
      },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isDeployable(item: RegistryItem): boolean {
  // Only agents, skills, and workflows with files can be deployed
  if (!["agent", "skill", "workflow"].includes(item.kind)) {
    return false;
  }

  // Must have files
  if (!item.files || item.files.length === 0) {
    return false;
  }

  return true;
}

async function deployToBolt(
  item: RegistryItem,
  projectName: string
): Promise<{
  url: string;
  editorUrl: string;
  previewUrl: string;
}> {
  // Generate Bolt.new project structure
  const files = await generateProjectFiles(item);

  // Create Bolt.new embed URL
  const embedUrl = generateBoltEmbedUrl({
    title: projectName,
    description: item.description,
    files,
  });

  return {
    url: embedUrl,
    editorUrl: `${embedUrl}?view=editor`,
    previewUrl: `${embedUrl}?view=preview`,
  };
}

async function deployToLovable(
  item: RegistryItem,
  projectName: string
): Promise<{
  url: string;
  editorUrl: string;
  previewUrl: string;
}> {
  // For now, Lovable doesn't have a public API
  // Return a placeholder URL with project setup instructions
  const setupUrl = `https://lovable.dev/new?name=${encodeURIComponent(projectName)}`;

  return {
    url: setupUrl,
    editorUrl: setupUrl,
    previewUrl: setupUrl,
  };
}

async function generateProjectFiles(
  item: RegistryItem
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  // Add item's prompt files as the main implementation
  if (item.files) {
    for (const file of item.files) {
      const content = await readPromptFile(file);
      if (content) {
        files[`prompts/${file.split("/").pop()}`] = content;
      }
    }
  }

  // Add package.json
  files["package.json"] = JSON.stringify(
    {
      name: item.slug,
      version: "1.0.0",
      description: item.description,
      type: "module",
      scripts: {
        dev: 'echo "ClawdBot item deployed to Bolt.new"',
      },
      dependencies:
        item.dependencies?.reduce(
          (acc, dep) => {
            acc[dep] = "latest";
            return acc;
          },
          {} as Record<string, string>
        ) || {},
    },
    null,
    2
  );

  // Add README
  files["README.md"] = generateReadme(item);

  // Add main implementation file
  files["index.ts"] = generateIndexFile(item);

  return files;
}

async function readPromptFile(path: string): Promise<string | null> {
  try {
    const fs = await import("fs/promises");
    const fullPath = `${process.cwd()}/${path}`;
    return await fs.readFile(fullPath, "utf-8");
  } catch (error) {
    console.error(`Failed to read file ${path}:`, error);
    return null;
  }
}

function generateReadme(item: RegistryItem): string {
  return `# ${item.name}

${item.description}

${item.longDescription || ""}

## Installation

\`\`\`bash
npx @clawdbot/cli add ${item.kind}/${item.slug}
\`\`\`

## Category

${item.category}

## Tags

${item.tags.join(", ")}

## Dependencies

${item.dependencies?.map((d) => `- ${d}`).join("\n") || "None"}

---

Deployed from [ClawdBot Marketplace](https://clawdbot.com)
`;
}

function generateIndexFile(item: RegistryItem): string {
  return `/**
 * ${item.name}
 * ${item.description}
 *
 * Deployed from ClawdBot Marketplace
 * Item: ${item.slug}
 * Category: ${item.category}
 */

console.log('${item.name} loaded successfully!');
console.log('Description: ${item.description}');
console.log('Tags: ${item.tags.join(", ")}');

export default {
  name: '${item.name}',
  slug: '${item.slug}',
  category: '${item.category}',
  description: '${item.description}',
};
`;
}

function generateBoltEmbedUrl(config: {
  title: string;
  description: string;
  files: Record<string, string>;
}): string {
  // Encode project payload
  const projectPayload = {
    files: config.files,
    title: config.title,
    description: config.description,
  };

  const encoded = Buffer.from(JSON.stringify(projectPayload)).toString(
    "base64url"
  );

  return `https://bolt.new/~/${encoded}`;
}
