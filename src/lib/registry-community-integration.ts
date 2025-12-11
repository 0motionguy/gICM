/**
 * Community Plugins Integration
 *
 * This file provides integration helpers for the community plugins
 * from claude-code-plugins-plus collection.
 *
 * MANUAL INTEGRATION REQUIRED:
 * To integrate community plugins into the main registry, add the following to registry.ts:
 *
 * 1. Add import at the top:
 *    import { COMMUNITY_PLUGINS } from "@/lib/registry-plugins-community";
 *
 * 2. Add to REGISTRY export array:
 *    export const REGISTRY: RegistryItem[] = [
 *      ...AGENTS,
 *      ...SKILLS,
 *      ...COMMANDS,
 *      ...MCPS,
 *      ...(SETTINGS as RegistryItem[]),
 *      ...WORKFLOWS,
 *      ...GEMINI_TOOLS,
 *      ...OPENAI_TOOLS,
 *      ...DESIGN_ASSETS,
 *      ...CONTENT_AGENTS,
 *      ...COMMUNITY_PLUGINS,  // <-- Add this line
 *    ];
 */

import {
  COMMUNITY_PLUGINS,
  COMMUNITY_PLUGIN_CATEGORIES,
} from "@/lib/registry-plugins-community";
import type { RegistryItem } from "@/types/registry";

/**
 * Get all community plugins
 */
export function getCommunityPlugins(): RegistryItem[] {
  return COMMUNITY_PLUGINS;
}

/**
 * Get community plugins by category
 */
export function getCommunityPluginsByCategory(
  category: string
): RegistryItem[] {
  return COMMUNITY_PLUGINS.filter((plugin) => plugin.category === category);
}

/**
 * Get community plugin statistics
 */
export function getCommunityPluginStats() {
  return {
    total: COMMUNITY_PLUGINS.length,
    byCategory: COMMUNITY_PLUGIN_CATEGORIES,
    byKind: {
      skills: COMMUNITY_PLUGINS.filter((p) => p.kind === "skill").length,
      agents: COMMUNITY_PLUGINS.filter((p) => p.kind === "agent").length,
    },
  };
}

/**
 * Search community plugins
 */
export function searchCommunityPlugins(query: string): RegistryItem[] {
  const lowerQuery = query.toLowerCase();
  return COMMUNITY_PLUGINS.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(lowerQuery) ||
      plugin.description.toLowerCase().includes(lowerQuery) ||
      plugin.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// Re-export for convenience
export { COMMUNITY_PLUGINS, COMMUNITY_PLUGIN_CATEGORIES };
