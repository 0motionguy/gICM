/**
 * @gicm/router - Smart 4-tier LLM routing for OpenClaw
 *
 * Features:
 * - Intent-based tier classification (regex + keywords, <5ms)
 * - Model health tracking with 3-strike rule
 * - Session pinning for multi-turn conversations
 * - Automatic fallback chains
 * - 70-95% cost savings vs always-premium
 *
 * @example
 * ```typescript
 * import { router, route } from '@gicm/router';
 *
 * // Simple usage
 * const result = route({ message: 'Summarize this email' });
 * console.log(result.model); // "anthropic/claude-3-haiku-20240307"
 *
 * // Advanced usage
 * const result2 = router.route({
 *   message: 'Design a distributed system',
 *   sessionId: 'user-123',
 *   contextTokens: 5000
 * });
 * console.log(result2.tier); // 3 (premium)
 * ```
 */

// Export types
export type {
  Tier,
  TierConfig,
  TierRule,
  RouterConfig,
  RouteRequest,
  RouteResult,
  ModelHealth,
  RoutingStats,
} from "./types.js";

// Export tier configs and rules
export { DEFAULT_TIER_CONFIGS, DEFAULT_TIER_RULES } from "./tiers.js";

// Export intent classifier
export { classifyIntent } from "./intent.js";

// Export main router class
export { SmartRouter } from "./router.js";

// Import for internal use
import { SmartRouter } from "./router.js";
import type { RouteRequest } from "./types.js";

// Export singleton instance
export const router = new SmartRouter();

/**
 * Convenience function for simple routing
 *
 * @param request - Routing request
 * @returns Routing result
 */
export function route(request: RouteRequest) {
  return router.route(request);
}
