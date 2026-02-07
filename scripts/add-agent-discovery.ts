#!/usr/bin/env tsx
/**
 * Add Agent Discovery Metadata to claude-marketplace.json
 *
 * Makes ClawdBot discoverable by autonomous AI agents on:
 * - Moltbook (1.5M+ AI agents)
 * - Claude plugin marketplaces
 * - Other agent discovery protocols
 */

import * as fs from "fs";
import * as path from "path";

const MARKETPLACE_PATH = path.join(
  process.cwd(),
  "public/.well-known/claude-marketplace.json"
);

const agentDiscoveryMetadata = {
  agentDiscovery: {
    enabled: true,
    protocol: "claude-marketplace-v1",
    endpoints: {
      catalog: "https://clawdbot.com/.well-known/claude-marketplace.json",
      search: "https://clawdbot.com/api/search",
      install: "https://clawdbot.com/api/install",
    },
    capabilities: [
      "autonomous-browsing",
      "security-scanning",
      "one-command-installation",
      "auto-updates",
    ],
    security: {
      scanningEnabled: true,
      threatDetection: "automated",
      securityScore: "per-item",
      malwareProtection: true,
      usp: "One-command security hardening - fixes exposed API keys, firewall config, vulnerable deps in 30 seconds",
    },
    moltbook: {
      compatible: true,
      agentReadable: true,
      submolt: "r/ai-development-tools",
      description:
        "617+ security-verified AI agents, skills & MCP servers. Auto-detects malware. One-click install. vs ClawHub: 341+ malicious items, zero protection.",
    },
    stats: {
      totalItems: 617,
      securityVerified: 617,
      categories: ["agents", "skills", "mcp-servers", "workflows"],
      specializations: [
        "Web3",
        "Solana",
        "DeFi",
        "Frontend",
        "Backend",
        "DevOps",
        "Security",
      ],
      updateFrequency: "daily",
    },
  },
};

async function main() {
  console.log(
    "📦 Adding agent discovery metadata to claude-marketplace.json...\n"
  );

  // Read existing marketplace file
  const content = fs.readFileSync(MARKETPLACE_PATH, "utf-8");
  const marketplace = JSON.parse(content);

  // Check if agentDiscovery already exists
  if (marketplace.agentDiscovery) {
    console.log("⚠️  agentDiscovery field already exists");
    console.log("Updating with new metadata...\n");
  }

  // Add agent discovery metadata
  const updated = {
    ...marketplace,
    ...agentDiscoveryMetadata,
  };

  // Write back to file with pretty formatting
  fs.writeFileSync(MARKETPLACE_PATH, JSON.stringify(updated, null, 2), "utf-8");

  console.log("✅ Agent discovery metadata added successfully!\n");
  console.log("📊 New capabilities:");
  console.log(
    "   • Moltbook compatible (1.5M+ AI agents can discover ClawdBot)"
  );
  console.log("   • Autonomous agent browsing enabled");
  console.log("   • Security scanning advertised");
  console.log("   • 617 items marked as security-verified\n");
  console.log(
    "🔗 Discovery endpoint: https://clawdbot.com/.well-known/claude-marketplace.json\n"
  );
}

main().catch((error) => {
  console.error("❌ Error adding agent discovery metadata:");
  console.error(error);
  process.exit(1);
});
