/**
 * Generate .claude-plugin/marketplace.json from registry
 *
 * Converts gICM registry items to Claude Code marketplace format
 */

import { REGISTRY } from "../src/lib/registry";
import { writeFileSync } from "fs";
import { join } from "path";

interface MarketplacePlugin {
  name: string;
  source: string;
  description: string;
  category: string;
  tags: string[];
  components: {
    agents?: string[];
    skills?: string[];
    commands?: string[];
    workflows?: string[];
    mcp?: string[];
    settings?: string[];
  };
  dependencies?: string[];
  modelRecommendation?: string;
  envKeys?: string[];
}

interface Marketplace {
  name: string;
  owner: {
    name: string;
    email: string;
    url: string;
  };
  metadata: {
    description: string;
    version: string;
    pluginRoot: string;
    repository: string;
    homepage: string;
    license: string;
  };
  plugins: MarketplacePlugin[];
}

function generateMarketplace(): Marketplace {
  // Group items by category for better organization
  const plugins: MarketplacePlugin[] = [];

  // Convert each registry item to a plugin
  REGISTRY.forEach((item) => {
    const components: MarketplacePlugin["components"] = {};

    // Map item kind to component type
    if (item.kind === "agent") {
      components.agents = item.files;
    } else if (item.kind === "skill") {
      components.skills = item.files;
    } else if (item.kind === "command") {
      components.commands = item.files;
    } else if (item.kind === "workflow") {
      // Workflows are code-defined, generate virtual path if no files exist
      components.workflows = item.files && item.files.length > 0
        ? item.files
        : [`.claude/workflows/${item.slug}.json`];
    } else if (item.kind === "mcp") {
      components.mcp = item.files;
    } else if (item.kind === "setting") {
      components.settings = item.files;
    }

    const plugin: MarketplacePlugin = {
      name: item.slug,
      source: "github:Kermit457/gICM",
      description: item.description,
      category: item.category || "Utilities",
      tags: item.tags || [],
      components,
    };

    // Add optional fields
    if (item.dependencies && item.dependencies.length > 0) {
      plugin.dependencies = item.dependencies;
    }
    if (item.modelRecommendation) {
      plugin.modelRecommendation = item.modelRecommendation;
    }
    if (item.envKeys && item.envKeys.length > 0) {
      plugin.envKeys = item.envKeys;
    }

    plugins.push(plugin);
  });

  const marketplace: Marketplace = {
    name: "gicm",
    owner: {
      name: "gICM Team",
      email: "support@gicm-marketplace.vercel.app",
      url: "https://gicm-marketplace.vercel.app",
    },
    metadata: {
      description:
        "Complete Claude Code marketplace for Web3 builders. 90 agents, 96 skills, 93 commands, 33 workflows, 82 MCPs for Solana, DeFi, NFTs, and full-stack development. 88-92% token savings with progressive disclosure.",
      version: "1.0.0",
      pluginRoot: ".claude/",
      repository: "https://github.com/Kermit457/gICM",
      homepage: "https://gicm-marketplace.vercel.app",
      license: "MIT",
    },
    plugins,
  };

  return marketplace;
}

// Generate and write marketplace.json
const marketplace = generateMarketplace();
const outputPath = join(process.cwd(), ".claude-plugin", "marketplace.json");

writeFileSync(outputPath, JSON.stringify(marketplace, null, 2), "utf-8");

console.log(`✓ Generated marketplace.json with ${marketplace.plugins.length} plugins`);
console.log(`  - Agents: ${marketplace.plugins.filter(p => p.components.agents).length}`);
console.log(`  - Skills: ${marketplace.plugins.filter(p => p.components.skills).length}`);
console.log(`  - Commands: ${marketplace.plugins.filter(p => p.components.commands).length}`);
console.log(`  - Workflows: ${marketplace.plugins.filter(p => p.components.workflows).length}`);
console.log(`  - MCPs: ${marketplace.plugins.filter(p => p.components.mcp).length}`);
console.log(`  - Settings: ${marketplace.plugins.filter(p => p.components.settings).length}`);
console.log(`\nFile: ${outputPath}`);
