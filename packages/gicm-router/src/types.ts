/**
 * @gicm/router - Type Definitions
 *
 * Model tiers: 0=free/regex, 1=cheap, 2=balanced, 3=premium
 */

export type Tier = 0 | 1 | 2 | 3;

/**
 * Configuration for a specific tier
 */
export interface TierConfig {
  /** Primary model ID (e.g., "anthropic/claude-3-haiku-20240307") */
  primary: string;
  /** Fallback chain */
  fallback: string[];
  /** Max context window */
  maxTokens: number;
  /** Cost per 1K input tokens */
  costPer1kInput: number;
  /** Cost per 1K output tokens */
  costPer1kOutput: number;
}

/**
 * Rule for classifying intent to a tier
 */
export interface TierRule {
  tier: Tier;
  patterns: RegExp[];
  keywords: string[];
}

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Tier configurations */
  tiers: Record<number, TierConfig>;
  /** Default tier when no match */
  defaultTier: Tier;
  /** Pin sessions to same model */
  sessionPinning: boolean;
  /** Ollama base URL */
  ollamaUrl: string;
  /** OpenRouter API key */
  openrouterKey?: string;
}

/**
 * Request to route a message
 */
export interface RouteRequest {
  /** User message */
  message: string;
  /** Context token count */
  contextTokens?: number;
  /** Force specific tier */
  forceTier?: Tier;
  /** Session ID for pinning */
  sessionId?: string;
  /** Agent ID */
  agentId?: string;
}

/**
 * Result of routing decision
 */
export interface RouteResult {
  /** Selected model */
  model: string;
  /** Selected tier */
  tier: Tier;
  /** Estimated cost per 1k tokens */
  estimatedCostPer1k: number;
  /** Reason for selection */
  reason: string;
  /** Whether result was from cache */
  fromCache: boolean;
}

/**
 * Health status of a model
 */
export interface ModelHealth {
  /** Is the model healthy */
  healthy: boolean;
  /** Last error timestamp */
  lastError?: Date;
  /** Consecutive error count */
  errorCount: number;
  /** Last latency in ms */
  lastLatency?: number;
}

/**
 * Routing statistics
 */
export interface RoutingStats {
  /** Total requests routed */
  totalRequests: number;
  /** Requests by tier */
  byTier: Record<number, number>;
  /** Requests by model */
  byModel: Record<string, number>;
  /** Average latency in ms */
  avgLatency: number;
  /** Cache hits */
  cacheHits: number;
}
