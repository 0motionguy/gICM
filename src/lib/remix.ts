/**
 * Remix System
 * Export, import, fork, and share stack configurations
 */

import type { RegistryItem } from "@/types/registry";

export interface StackConfig {
  id: string;
  name: string;
  description?: string;
  items: string[]; // Array of item IDs
  createdAt: string;
  updatedAt: string;
  author?: string;
  remixedFrom?: string; // ID of original stack if forked
  remixCount?: number;
  tags?: string[];
  version?: string;
  featured?: boolean;
}

export interface RemixMetadata {
  originalStackId?: string;
  originalAuthor?: string;
  remixedAt: string;
  changes?: string[];
}

/**
 * Encode stack config to base64 URL-safe string
 */
export function encodeStackToURL(config: StackConfig): string {
  try {
    const json = JSON.stringify(config);
    const base64 = btoa(json);
    // Make URL-safe by replacing characters
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch (error) {
    console.error("Failed to encode stack:", error);
    throw new Error("Failed to encode stack configuration");
  }
}

/**
 * Decode stack config from base64 URL string
 */
export function decodeStackFromURL(encoded: string): StackConfig {
  try {
    // Restore original base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    const json = atob(base64);
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode stack:", error);
    throw new Error("Invalid stack configuration URL");
  }
}

/**
 * Generate shareable URL for stack
 */
export function generateShareURL(
  config: StackConfig,
  baseURL?: string,
): string {
  const encoded = encodeStackToURL(config);
  const base =
    baseURL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://clawdbot.com");
  return `${base}/stack?import=${encoded}`;
}

/**
 * Fork a stack (create a copy with remix metadata)
 */
export function forkStack(
  originalStack: StackConfig,
  newName?: string,
  author?: string,
): StackConfig {
  const now = new Date().toISOString();

  return {
    id: generateStackId(),
    name: newName || `${originalStack.name} (Forked)`,
    description: originalStack.description,
    items: [...originalStack.items],
    createdAt: now,
    updatedAt: now,
    author,
    remixedFrom: originalStack.id,
    tags: originalStack.tags,
    version: "1.0.0",
  };
}

/**
 * Generate unique stack ID
 */
export function generateStackId(): string {
  return `stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save stack preset to localStorage
 */
export function saveStackPreset(config: StackConfig): void {
  try {
    const presets = getStackPresets();

    // Check if preset with same ID exists
    const existingIndex = presets.findIndex((p) => p.id === config.id);

    if (existingIndex >= 0) {
      // Update existing
      presets[existingIndex] = {
        ...config,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new
      presets.push(config);
    }

    localStorage.setItem("gicm_stack_presets", JSON.stringify(presets));
  } catch (error) {
    console.error("Failed to save stack preset:", error);
    throw new Error("Failed to save stack preset");
  }
}

/**
 * Get all saved stack presets
 */
export function getStackPresets(): StackConfig[] {
  try {
    const data = localStorage.getItem("gicm_stack_presets");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load stack presets:", error);
    return [];
  }
}

/**
 * Delete stack preset
 */
export function deleteStackPreset(stackId: string): void {
  try {
    const presets = getStackPresets();
    const filtered = presets.filter((p) => p.id !== stackId);
    localStorage.setItem("gicm_stack_presets", JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete stack preset:", error);
    throw new Error("Failed to delete stack preset");
  }
}

/**
 * Get preset by ID
 */
export function getStackPresetById(stackId: string): StackConfig | null {
  const presets = getStackPresets();
  return presets.find((p) => p.id === stackId) || null;
}

/**
 * Export stack to GitHub Gist
 */
export async function exportToGist(
  config: StackConfig,
  items: RegistryItem[],
  githubToken?: string,
): Promise<{ url: string; id: string }> {
  if (!githubToken) {
    throw new Error("GitHub token is required to create a Gist");
  }

  // Generate files for Gist
  const files: Record<string, { content: string }> = {
    "stack.json": {
      content: JSON.stringify(config, null, 2),
    },
    "README.md": {
      content: generateStackREADME(config, items),
    },
    "install.sh": {
      content: generateInstallScript(items),
    },
    ".env.example": {
      content: generateEnvExample(items),
    },
  };

  try {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `ClawdBot Stack: ${config.name}`,
        public: true,
        files,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${error}`);
    }

    const data = await response.json();

    return {
      url: data.html_url,
      id: data.id,
    };
  } catch (error) {
    console.error("Failed to create Gist:", error);
    throw new Error("Failed to export stack to GitHub Gist");
  }
}

/**
 * Generate README for stack
 */
function generateStackREADME(
  config: StackConfig,
  items: RegistryItem[],
): string {
  let readme = `# ${config.name}\n\n`;

  if (config.description) {
    readme += `${config.description}\n\n`;
  }

  if (config.remixedFrom) {
    readme += `> 🍴 **Forked from:** [Original Stack](https://clawdbot.com/stack/${config.remixedFrom})\n\n`;
  }

  readme += `## Stack Contents\n\n`;
  readme += `**Total Items:** ${items.length}\n\n`;

  // Group by kind
  const byKind: Record<string, RegistryItem[]> = {};
  items.forEach((item) => {
    if (!byKind[item.kind]) {
      byKind[item.kind] = [];
    }
    byKind[item.kind].push(item);
  });

  Object.entries(byKind).forEach(([kind, kindItems]) => {
    readme += `### ${kind.charAt(0).toUpperCase() + kind.slice(1)}s (${kindItems.length})\n\n`;
    kindItems.forEach((item) => {
      readme += `- **${item.name}** - ${item.description}\n`;
    });
    readme += "\n";
  });

  readme += `## Installation\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `# Run the install script\n`;
  readme += `chmod +x install.sh\n`;
  readme += `./install.sh\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Configuration\n\n`;
  readme += `Copy \`.env.example\` to \`.env.local\` and configure your environment variables.\n\n`;

  readme += `## Import to ClawdBot\n\n`;
  readme += `[Import this stack to ClawdBot](${generateShareURL(config)})\n\n`;

  readme += `---\n\n`;
  readme += `*Generated with [ClawdBot](https://clawdbot.com) - The AI Marketplace for Web3 Builders*\n`;

  return readme;
}

/**
 * Generate install script
 */
function generateInstallScript(items: RegistryItem[]): string {
  let script = `#!/bin/bash\n\n`;
  script += `# ClawdBot Stack Installation Script\n`;
  script += `# Generated: ${new Date().toISOString()}\n\n`;

  script += `echo "🚀 Installing ClawdBot stack..."\n\n`;

  // Group by kind
  const byKind: Record<string, RegistryItem[]> = {};
  items.forEach((item) => {
    if (!byKind[item.kind]) {
      byKind[item.kind] = [];
    }
    byKind[item.kind].push(item);
  });

  Object.entries(byKind).forEach(([kind, kindItems]) => {
    script += `# Installing ${kind}s\n`;
    script += `echo "📦 Installing ${kindItems.length} ${kind}(s)..."\n`;
    kindItems.forEach((item) => {
      if (item.install) {
        script += `${item.install}\n`;
      }
    });
    script += "\n";
  });

  script += `echo "✅ Installation complete!"\n`;
  script += `echo "📝 Don't forget to configure your .env.local file"\n`;

  return script;
}

/**
 * Generate .env.example
 */
function generateEnvExample(items: RegistryItem[]): string {
  let env = `# ClawdBot Stack Environment Variables\n`;
  env += `# Generated: ${new Date().toISOString()}\n\n`;

  const envKeys = new Set<string>();

  items.forEach((item) => {
    if (item.kind === "mcp" && (item as any).envKeys) {
      (item as any).envKeys.forEach((key: string) => envKeys.add(key));
    }
  });

  if (envKeys.size > 0) {
    env += `# MCP Environment Variables\n`;
    Array.from(envKeys)
      .sort()
      .forEach((key) => {
        env += `${key}=\n`;
      });
  } else {
    env += `# No environment variables required\n`;
  }

  return env;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    throw new Error("Failed to copy to clipboard");
  }
}

/**
 * Track remix in analytics
 */
export async function trackRemix(
  originalStackId: string,
  newStackId: string,
  author?: string,
): Promise<void> {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "stack_remix",
        originalStackId,
        newStackId,
        author,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Failed to track remix:", error);
    // Don't throw - analytics failure shouldn't block the remix
  }
}

/**
 * Track stack share
 */
export async function trackShare(
  stackId: string,
  method: "url" | "gist" | "social",
): Promise<void> {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "stack_share",
        stackId,
        method,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Failed to track share:", error);
  }
}
