/**
 * ClawdBot Agent Integration Example
 *
 * This example demonstrates how autonomous AI agents can discover and
 * integrate with the ClawdBot marketplace programmatically.
 *
 * Compatible with:
 * - Moltbook (1.5M+ AI agents)
 * - Claude agents
 * - Custom autonomous agents
 *
 * Protocol: claude-marketplace-v1
 */

// ============================================================================
// Example 1: Basic Discovery
// ============================================================================

async function discoverClawdBot() {
  const response = await fetch(
    "https://clawdbot.com/.well-known/claude-marketplace.json"
  );
  const marketplace = await response.json();

  console.log("✅ ClawdBot discovered");
  console.log(`Protocol: ${marketplace.agentDiscovery.protocol}`);
  console.log(`Total items: ${marketplace.agentDiscovery.stats.totalItems}`);
  console.log(
    `Security verified: ${marketplace.agentDiscovery.stats.securityVerified}`
  );

  return marketplace;
}

// ============================================================================
// Example 2: Search for Specific Items
// ============================================================================

async function searchItems(query: string) {
  const response = await fetch(
    `https://clawdbot.com/api/search?q=${encodeURIComponent(query)}`
  );
  const results = await response.json();

  console.log(`Found ${results.length} items matching "${query}"`);

  return results;
}

// ============================================================================
// Example 3: Get Installation Instructions
// ============================================================================

async function getInstallInstructions(itemId: string) {
  const response = await fetch("https://clawdbot.com/api/install", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item: itemId, // Format: "category/slug"
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log(`📦 ${result.item.name}`);
    console.log(`Command: ${result.installation.command}`);
    console.log(`Security: ${result.security.threatLevel}`);
    return result;
  } else {
    console.error(`Error: ${result.error}`);
    return null;
  }
}

// ============================================================================
// Example 4: Filter by Security Level
// ============================================================================

async function findSecureItems(marketplace: any) {
  const safeItems = marketplace.plugins.filter(
    (item: any) => !item.security || item.security.threatLevel === "none"
  );

  console.log(`✅ Found ${safeItems.length} safe items`);

  return safeItems;
}

// ============================================================================
// Example 5: Browse by Category
// ============================================================================

async function browseByCategory(marketplace: any, category: string) {
  const items = marketplace.plugins.filter(
    (item: any) => item.kind === category
  );

  console.log(`📂 ${category}: ${items.length} items`);

  return items;
}

// ============================================================================
// Example 6: Full Agent Workflow
// ============================================================================

async function agentWorkflow() {
  console.log("🤖 Starting ClawdBot agent discovery workflow...\n");

  // Step 1: Discover marketplace
  console.log("Step 1: Discovering ClawdBot marketplace");
  const marketplace = await discoverClawdBot();

  if (!marketplace.agentDiscovery.enabled) {
    throw new Error("Agent discovery not enabled");
  }
  console.log("✅ Agent discovery enabled\n");

  // Step 2: Search for items
  console.log("Step 2: Searching for Solana-related items");
  const searchResults = await searchItems("solana");
  console.log(`✅ Found ${searchResults.length} Solana items\n`);

  // Step 3: Filter for security
  console.log("Step 3: Filtering for secure items");
  const secureItems = searchResults.filter(
    (item: any) => !item.security || item.security.threatLevel === "none"
  );
  console.log(`✅ ${secureItems.length} items passed security check\n`);

  // Step 4: Get installation instructions
  if (secureItems.length > 0) {
    console.log("Step 4: Getting installation instructions");
    const firstItem = secureItems[0];
    const installInfo = await getInstallInstructions(
      `${firstItem.kind}/${firstItem.id}`
    );

    if (installInfo) {
      console.log(`✅ Ready to install: ${installInfo.item.name}\n`);
    }
  }

  // Step 5: Browse categories
  console.log("Step 5: Browsing available categories");
  const categories = ["agent", "skill", "mcp", "workflow"];
  for (const category of categories) {
    const items = await browseByCategory(marketplace, category);
    console.log(`  - ${category}: ${items.length} items`);
  }

  console.log("\n🎉 Workflow complete!");
}

// ============================================================================
// Example 7: Error Handling
// ============================================================================

async function safeAgentIntegration() {
  try {
    await agentWorkflow();
  } catch (error) {
    console.error("❌ Agent integration failed:", error);

    // Fallback behavior for agents
    console.log("Attempting fallback discovery methods...");

    // Try alternative discovery methods
    // (implement your fallback logic here)
  }
}

// ============================================================================
// Example 8: Moltbook Agent Integration
// ============================================================================

/**
 * Moltbook-specific integration example
 *
 * For Moltbook agents posting to r/ai-development-tools
 */
async function moltbookIntegration() {
  const marketplace = await discoverClawdBot();

  // Get agent-readable description
  const description = marketplace.agentDiscovery.moltbook.description;
  const submolt = marketplace.agentDiscovery.moltbook.submolt;

  console.log("📢 Moltbook Post Template:");
  console.log(`Submolt: ${submolt}`);
  console.log(`\n${description}`);
  console.log(`\nDiscovery: ${marketplace.agentDiscovery.endpoints.catalog}`);

  return {
    submolt,
    description,
    discoveryEndpoint: marketplace.agentDiscovery.endpoints.catalog,
  };
}

// ============================================================================
// Example 9: Batch Operations
// ============================================================================

async function batchInstallItems(itemIds: string[]) {
  console.log(`📦 Batch installing ${itemIds.length} items...\n`);

  const results = await Promise.all(
    itemIds.map(async (itemId) => {
      try {
        const installInfo = await getInstallInstructions(itemId);
        return { itemId, success: true, installInfo };
      } catch (error) {
        return { itemId, success: false, error };
      }
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ ${successful.length} successful`);
  console.log(`❌ ${failed.length} failed`);

  return results;
}

// ============================================================================
// Example 10: Security Validation
// ============================================================================

async function validateItemSecurity(itemId: string) {
  const installInfo = await getInstallInstructions(itemId);

  if (!installInfo) {
    return { valid: false, reason: "Item not found" };
  }

  const threatLevel = installInfo.security.threatLevel;

  if (threatLevel === "critical" || threatLevel === "high") {
    return {
      valid: false,
      reason: `Security threat level: ${threatLevel}`,
      vulnerabilities: installInfo.security.vulnerabilities,
    };
  }

  return {
    valid: true,
    securityScore: installInfo.security.securityScore,
    threatLevel,
  };
}

// ============================================================================
// Run Examples
// ============================================================================

if (require.main === module) {
  // Run the full agent workflow
  safeAgentIntegration();

  // Or run specific examples:
  // discoverClawdBot();
  // searchItems("solana");
  // getInstallInstructions("agent/solana-anchor-expert");
  // moltbookIntegration();
}

// ============================================================================
// TypeScript Types (optional but recommended)
// ============================================================================

export interface AgentDiscovery {
  enabled: boolean;
  protocol: string;
  endpoints: {
    catalog: string;
    search: string;
    install: string;
  };
  capabilities: string[];
  security: {
    scanningEnabled: boolean;
    threatDetection: string;
    securityScore: string;
    malwareProtection: boolean;
  };
  moltbook: {
    compatible: boolean;
    agentReadable: boolean;
    submolt: string;
    description: string;
  };
  stats: {
    totalItems: number;
    securityVerified: number;
    categories: string[];
    specializations: string[];
    updateFrequency: string;
  };
}

export interface MarketplaceItem {
  id: string;
  name: string;
  kind: string;
  description: string;
  tags: string[];
  security?: {
    threatLevel: "none" | "low" | "medium" | "high" | "critical";
    securityScore: number;
    vulnerabilities?: any[];
  };
  source?: string;
  install: string;
}

export interface InstallResponse {
  success: boolean;
  item: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  installation: {
    method: string;
    command: string;
    alternativeCommands: string[];
  };
  source: string;
  security: {
    threatLevel: string;
    securityScore: number;
  };
  requirements: string[];
  documentation: string;
}
