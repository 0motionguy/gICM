/**
 * Dependency Resolver for gICM Registry
 *
 * Resolves dependency trees, finds dependents, and validates dependency integrity
 * for all registry items (agents, skills, commands, MCPs, workflows).
 */

import type { RegistryItem } from "@/types/registry";
import { REGISTRY, getItemById } from "./registry";

// ============================================================================
// Types
// ============================================================================

export interface DependencyReport {
  totalItems: number;
  itemsWithDependencies: number;
  itemsWithoutDependencies: number;
  coveragePercentage: number;
  missingDependencies: MissingDependency[];
  circularDependencies: CircularDependency[];
  orphanedItems: string[]; // Items that nothing depends on
  mostDependedOn: DependencyCount[];
  mostDependencies: DependencyCount[];
  byKind: {
    [kind: string]: {
      total: number;
      withDeps: number;
      coverage: number;
    };
  };
}

export interface MissingDependency {
  itemId: string;
  itemName: string;
  missingDepId: string;
}

export interface CircularDependency {
  path: string[];
}

export interface DependencyCount {
  itemId: string;
  itemName: string;
  count: number;
}

export interface ResolvedDependencyTree {
  item: RegistryItem;
  dependencies: ResolvedDependencyTree[];
  depth: number;
}

// ============================================================================
// Core Resolution Functions
// ============================================================================

/**
 * Resolves the complete dependency tree for an item
 * Returns all dependencies recursively, ordered by depth (deepest first)
 */
export function resolveDependencyTree(
  itemId: string,
  visited: Set<string> = new Set()
): RegistryItem[] {
  const item = getItemById(itemId);
  if (!item) {
    console.warn(`Item not found: ${itemId}`);
    return [];
  }

  // Prevent circular dependencies
  if (visited.has(itemId)) {
    return [];
  }
  visited.add(itemId);

  const dependencies: RegistryItem[] = [];

  // Get direct dependencies
  const directDeps = item.dependencies || [];

  // Recursively resolve each dependency
  for (const depId of directDeps) {
    const depItem = getItemById(depId);
    if (depItem) {
      // First resolve the dependency's dependencies (depth-first)
      const transitiveDeps = resolveDependencyTree(depId, new Set(visited));
      dependencies.push(...transitiveDeps);

      // Then add the dependency itself (if not already added)
      if (!dependencies.some((d) => d.id === depId)) {
        dependencies.push(depItem);
      }
    }
  }

  return dependencies;
}

/**
 * Resolves dependency tree with full structure (for visualization)
 */
export function resolveDependencyTreeStructured(
  itemId: string,
  depth: number = 0,
  visited: Set<string> = new Set()
): ResolvedDependencyTree | null {
  const item = getItemById(itemId);
  if (!item) return null;

  // Prevent circular dependencies
  if (visited.has(itemId)) {
    return { item, dependencies: [], depth };
  }
  visited.add(itemId);

  const directDeps = item.dependencies || [];
  const resolvedDeps: ResolvedDependencyTree[] = [];

  for (const depId of directDeps) {
    const resolved = resolveDependencyTreeStructured(
      depId,
      depth + 1,
      new Set(visited)
    );
    if (resolved) {
      resolvedDeps.push(resolved);
    }
  }

  return {
    item,
    dependencies: resolvedDeps,
    depth,
  };
}

/**
 * Gets all items that depend on a given item (reverse lookup)
 */
export function getDependents(itemId: string): RegistryItem[] {
  return REGISTRY.filter((item) => {
    const deps = item.dependencies || [];
    return deps.includes(itemId);
  });
}

/**
 * Gets all items that transitively depend on a given item
 */
export function getTransitiveDependents(
  itemId: string,
  visited: Set<string> = new Set()
): RegistryItem[] {
  if (visited.has(itemId)) return [];
  visited.add(itemId);

  const directDependents = getDependents(itemId);
  const allDependents: RegistryItem[] = [...directDependents];

  for (const dependent of directDependents) {
    const transitive = getTransitiveDependents(dependent.id, new Set(visited));
    for (const item of transitive) {
      if (!allDependents.some((d) => d.id === item.id)) {
        allDependents.push(item);
      }
    }
  }

  return allDependents;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates all dependencies in the registry
 */
export function validateDependencies(): DependencyReport {
  const missingDependencies: MissingDependency[] = [];
  const circularDependencies: CircularDependency[] = [];
  const dependencyCountMap = new Map<string, number>();
  const hasTransitiveDeps = new Set<string>();

  let itemsWithDependencies = 0;
  const byKind: DependencyReport["byKind"] = {};

  // Initialize kind tracking
  for (const item of REGISTRY) {
    if (!byKind[item.kind]) {
      byKind[item.kind] = { total: 0, withDeps: 0, coverage: 0 };
    }
    byKind[item.kind].total++;
  }

  // Validate each item
  for (const item of REGISTRY) {
    const deps = item.dependencies || [];

    if (deps.length > 0) {
      itemsWithDependencies++;
      byKind[item.kind].withDeps++;
    }

    // Check for missing dependencies
    for (const depId of deps) {
      const depItem = getItemById(depId);
      if (!depItem) {
        missingDependencies.push({
          itemId: item.id,
          itemName: item.name,
          missingDepId: depId,
        });
      } else {
        // Track dependency count
        dependencyCountMap.set(depId, (dependencyCountMap.get(depId) || 0) + 1);
        hasTransitiveDeps.add(depId);
      }
    }

    // Check for circular dependencies
    const circular = detectCircularDependency(item.id);
    if (circular) {
      // Avoid duplicates
      const pathStr = circular.join(" -> ");
      if (!circularDependencies.some((c) => c.path.join(" -> ") === pathStr)) {
        circularDependencies.push({ path: circular });
      }
    }
  }

  // Calculate coverage percentages
  for (const kind of Object.keys(byKind)) {
    byKind[kind].coverage =
      byKind[kind].total > 0
        ? Math.round((byKind[kind].withDeps / byKind[kind].total) * 100)
        : 0;
  }

  // Find orphaned items (nothing depends on them and they have no dependencies)
  const orphanedItems = REGISTRY.filter((item) => {
    const hasDependents = getDependents(item.id).length > 0;
    const hasDependencies = (item.dependencies || []).length > 0;
    return !hasDependents && !hasDependencies;
  }).map((item) => item.id);

  // Get most depended on items
  const mostDependedOn: DependencyCount[] = Array.from(dependencyCountMap)
    .map(([itemId, count]) => {
      const item = getItemById(itemId);
      return {
        itemId,
        itemName: item?.name || itemId,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Get items with most dependencies
  const mostDependencies: DependencyCount[] = REGISTRY.filter(
    (item) => (item.dependencies || []).length > 0
  )
    .map((item) => ({
      itemId: item.id,
      itemName: item.name,
      count: (item.dependencies || []).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    totalItems: REGISTRY.length,
    itemsWithDependencies,
    itemsWithoutDependencies: REGISTRY.length - itemsWithDependencies,
    coveragePercentage: Math.round(
      (itemsWithDependencies / REGISTRY.length) * 100
    ),
    missingDependencies,
    circularDependencies,
    orphanedItems,
    mostDependedOn,
    mostDependencies,
    byKind,
  };
}

/**
 * Detects circular dependencies starting from an item
 */
function detectCircularDependency(
  itemId: string,
  path: string[] = [],
  visited: Set<string> = new Set()
): string[] | null {
  if (path.includes(itemId)) {
    // Found a cycle - return the path from the cycle start
    const cycleStart = path.indexOf(itemId);
    return [...path.slice(cycleStart), itemId];
  }

  if (visited.has(itemId)) {
    return null;
  }
  visited.add(itemId);

  const item = getItemById(itemId);
  if (!item) return null;

  const deps = item.dependencies || [];
  for (const depId of deps) {
    const cycle = detectCircularDependency(depId, [...path, itemId], visited);
    if (cycle) return cycle;
  }

  return null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets the installation order for an item (dependencies first)
 */
export function getInstallationOrder(itemId: string): RegistryItem[] {
  const deps = resolveDependencyTree(itemId);
  const item = getItemById(itemId);
  if (item) {
    deps.push(item);
  }
  return deps;
}

/**
 * Checks if an item can be safely removed (nothing depends on it)
 */
export function canSafelyRemove(itemId: string): {
  canRemove: boolean;
  dependents: RegistryItem[];
} {
  const dependents = getDependents(itemId);
  return {
    canRemove: dependents.length === 0,
    dependents,
  };
}

/**
 * Gets suggested dependencies based on item metadata
 */
export function suggestDependencies(itemId: string): string[] {
  const item = getItemById(itemId);
  if (!item) return [];

  const suggestions: string[] = [];
  const tags = item.tags || [];
  const category = item.category || "";
  const description = (item.description || "").toLowerCase();

  // Suggest based on keywords in description and tags
  for (const registryItem of REGISTRY) {
    if (registryItem.id === itemId) continue;
    if (item.dependencies?.includes(registryItem.id)) continue;

    // Check for keyword matches
    const itemTags = registryItem.tags || [];
    const tagOverlap = tags.filter((t) =>
      itemTags.some((rt) => rt.toLowerCase() === t.toLowerCase())
    ).length;

    // Check for name/description references
    const refersTo =
      description.includes(registryItem.slug.toLowerCase()) ||
      description.includes(registryItem.name.toLowerCase());

    if (tagOverlap >= 2 || refersTo) {
      suggestions.push(registryItem.id);
    }
  }

  return suggestions.slice(0, 10);
}

/**
 * Formats dependency tree for display
 */
export function formatDependencyTree(itemId: string): string {
  const tree = resolveDependencyTreeStructured(itemId);
  if (!tree) return `Item not found: ${itemId}`;

  function formatNode(
    node: ResolvedDependencyTree,
    indent: string = ""
  ): string {
    const prefix = indent ? `${indent}|- ` : "";
    let output = `${prefix}${node.item.name} (${node.item.kind})\n`;

    for (let i = 0; i < node.dependencies.length; i++) {
      const isLast = i === node.dependencies.length - 1;
      const childIndent = indent + (isLast ? "   " : "|  ");
      output += formatNode(node.dependencies[i], childIndent);
    }

    return output;
  }

  return formatNode(tree);
}

// ============================================================================
// Dependency Mapping for Common Relationships
// ============================================================================

/**
 * Auto-maps dependencies based on common patterns
 * This is used to suggest dependencies for items that don't have them
 */
export const DEPENDENCY_PATTERNS: Record<string, string[]> = {
  // Agents that commonly use specific skills
  "icm-anchor-architect": ["solana-anchor-mastery", "solana-program-security"],
  "defi-integration-architect": ["defi-integration", "bonding-curve-mastery"],
  "frontend-fusion-engine": [
    "nextjs-app-router-mastery",
    "tailwind-shadcn-design",
    "web3-wallet-integration",
  ],
  "evm-security-auditor": ["evm-solidity-mastery", "smart-contract-security"],
  "solana-guardian-auditor": [
    "solana-program-security",
    "solana-anchor-mastery",
  ],
  "fullstack-orchestrator": [
    "api-architecture-patterns",
    "database-optimization",
    "caching-strategies",
  ],
  "database-schema-oracle": ["sql-optimization", "database-optimization"],
  "api-design-architect": [
    "api-architecture-patterns",
    "api-versioning-strategies",
  ],
  "graph-protocol-indexer": ["graph-subgraph-development"],
  "gas-optimization-specialist": ["evm-gas-optimization"],

  // Commands that commonly need specific agents
  "command/code-review": ["code-reviewer"],
  "command/deploy-hardhat": ["hardhat-deployment-specialist"],
  "command/deploy-foundry": ["hardhat-deployment-specialist"],
  "command/test-coverage": ["foundry-testing-expert"],
  "command/gas-report": ["gas-optimization-specialist"],
  "command/audit-security": ["evm-security-auditor"],
  "command/create-subgraph": ["graph-protocol-indexer"],
  "command/upgrade-proxy": ["upgradeable-contracts-architect"],
  "command/create-safe": ["gnosis-safe-integrator"],
  "command/snapshot-state": ["foundry-testing-expert"],

  // Skills that depend on other skills
  "defi-integration": ["evm-solidity-mastery"],
  "bonding-curve-mastery": ["solana-anchor-mastery"],
  "smart-contract-security": ["evm-solidity-mastery"],
  "solana-program-security": ["solana-anchor-mastery"],
  "web3-wallet-integration": ["nextjs-app-router-mastery"],
  "account-abstraction-erc4337": [
    "evm-solidity-mastery",
    "eip712-typed-signatures",
  ],
  "aave-flashloan-patterns": ["evm-solidity-mastery", "defi-integration"],
  "uniswap-v3-integration": ["evm-solidity-mastery", "defi-integration"],

  // MCPs that commonly work together
  "mcp-supabase": ["mcp-postgresql"],
  "mcp-elasticsearch": ["mcp-redis"],
  "mcp-thegraph": ["mcp-alchemy", "mcp-infura"],
  "mcp-solana-agent-kit": ["mcp-quicknode"],
};

/**
 * Gets recommended dependencies for an item based on patterns
 */
export function getRecommendedDependencies(itemId: string): string[] {
  return DEPENDENCY_PATTERNS[itemId] || [];
}

export default {
  resolveDependencyTree,
  resolveDependencyTreeStructured,
  getDependents,
  getTransitiveDependents,
  validateDependencies,
  getInstallationOrder,
  canSafelyRemove,
  suggestDependencies,
  formatDependencyTree,
  getRecommendedDependencies,
  DEPENDENCY_PATTERNS,
};
