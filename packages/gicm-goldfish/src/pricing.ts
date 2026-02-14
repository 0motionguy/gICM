/**
 * Model pricing table — per 1M tokens in USD
 * Updated: February 2026
 */

interface ModelPricing {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Anthropic Claude Opus 4.6
  "anthropic/claude-opus-4-6": {
    input: 15.0,
    output: 75.0,
    cacheRead: 1.5,
    cacheWrite: 18.75,
  },
  "claude-opus-4-6": {
    input: 15.0,
    output: 75.0,
    cacheRead: 1.5,
    cacheWrite: 18.75,
  },
  "anthropic/claude-opus-4-6-20250514": {
    input: 15.0,
    output: 75.0,
    cacheRead: 1.5,
    cacheWrite: 18.75,
  },

  // Anthropic Claude Sonnet 4.5
  "anthropic/claude-sonnet-4-5": {
    input: 3.0,
    output: 15.0,
    cacheRead: 0.3,
    cacheWrite: 3.75,
  },
  "claude-sonnet-4-5": {
    input: 3.0,
    output: 15.0,
    cacheRead: 0.3,
    cacheWrite: 3.75,
  },
  "anthropic/claude-sonnet-4-5-20250929": {
    input: 3.0,
    output: 15.0,
    cacheRead: 0.3,
    cacheWrite: 3.75,
  },

  // Anthropic Claude Haiku 4.5
  "anthropic/claude-haiku-4-5": {
    input: 0.8,
    output: 4.0,
    cacheRead: 0.08,
    cacheWrite: 1.0,
  },
  "claude-haiku-4-5": {
    input: 0.8,
    output: 4.0,
    cacheRead: 0.08,
    cacheWrite: 1.0,
  },
  "anthropic/claude-haiku-4-5-20250514": {
    input: 0.8,
    output: 4.0,
    cacheRead: 0.08,
    cacheWrite: 1.0,
  },

  // Anthropic Claude 3 Haiku (legacy)
  "anthropic/claude-3-haiku-20240307": {
    input: 0.25,
    output: 1.25,
    cacheRead: 0.03,
    cacheWrite: 0.3,
  },
  "claude-3-haiku-20240307": {
    input: 0.25,
    output: 1.25,
    cacheRead: 0.03,
    cacheWrite: 0.3,
  },

  // OpenAI GPT-4o
  "openai/gpt-4o": {
    input: 2.5,
    output: 10.0,
    cacheRead: 1.25,
    cacheWrite: 5.0,
  },
  "gpt-4o": {
    input: 2.5,
    output: 10.0,
    cacheRead: 1.25,
    cacheWrite: 5.0,
  },
  "openai/gpt-4o-2024-11-20": {
    input: 2.5,
    output: 10.0,
    cacheRead: 1.25,
    cacheWrite: 5.0,
  },

  // OpenAI GPT-4o-mini
  "openai/gpt-4o-mini": {
    input: 0.15,
    output: 0.6,
    cacheRead: 0.075,
    cacheWrite: 0.3,
  },
  "gpt-4o-mini": {
    input: 0.15,
    output: 0.6,
    cacheRead: 0.075,
    cacheWrite: 0.3,
  },
  "openai/gpt-4o-mini-2024-07-18": {
    input: 0.15,
    output: 0.6,
    cacheRead: 0.075,
    cacheWrite: 0.3,
  },

  // OpenAI GPT-5.3-codex (estimated — not released)
  "openai/gpt-5.3-codex": {
    input: 20.0,
    output: 80.0,
    cacheRead: 2.0,
    cacheWrite: 25.0,
  },
  "gpt-5.3-codex": {
    input: 20.0,
    output: 80.0,
    cacheRead: 2.0,
    cacheWrite: 25.0,
  },

  // Google Gemini 2.0 Flash (free tier)
  "google/gemini-2.0-flash": {
    input: 0.0,
    output: 0.0,
    cacheRead: 0.0,
    cacheWrite: 0.0,
  },
  "gemini-2.0-flash": {
    input: 0.0,
    output: 0.0,
    cacheRead: 0.0,
    cacheWrite: 0.0,
  },
  "google/gemini-2.0-flash-exp": {
    input: 0.0,
    output: 0.0,
    cacheRead: 0.0,
    cacheWrite: 0.0,
  },

  // Google Gemini 1.5 Pro
  "google/gemini-1.5-pro": {
    input: 1.25,
    output: 5.0,
    cacheRead: 0.3125,
    cacheWrite: 1.5625,
  },
  "gemini-1.5-pro": {
    input: 1.25,
    output: 5.0,
    cacheRead: 0.3125,
    cacheWrite: 1.5625,
  },
  "google/gemini-1.5-pro-002": {
    input: 1.25,
    output: 5.0,
    cacheRead: 0.3125,
    cacheWrite: 1.5625,
  },

  // DeepSeek Chat
  "deepseek/deepseek-chat": {
    input: 0.14,
    output: 0.28,
    cacheRead: 0.014,
    cacheWrite: 0.175,
  },
  "deepseek-chat": {
    input: 0.14,
    output: 0.28,
    cacheRead: 0.014,
    cacheWrite: 0.175,
  },

  // DeepSeek Reasoner
  "deepseek/deepseek-reasoner": {
    input: 0.55,
    output: 2.19,
    cacheRead: 0.055,
    cacheWrite: 0.6875,
  },
  "deepseek-reasoner": {
    input: 0.55,
    output: 2.19,
    cacheRead: 0.055,
    cacheWrite: 0.6875,
  },

  // xAI Grok-2
  "xai/grok-2": {
    input: 2.0,
    output: 10.0,
    cacheRead: 0.2,
    cacheWrite: 2.5,
  },
  "grok-2": {
    input: 2.0,
    output: 10.0,
    cacheRead: 0.2,
    cacheWrite: 2.5,
  },
  "xai/grok-2-1212": {
    input: 2.0,
    output: 10.0,
    cacheRead: 0.2,
    cacheWrite: 2.5,
  },

  // xAI Grok-3 (estimated)
  "xai/grok-3": {
    input: 5.0,
    output: 20.0,
    cacheRead: 0.5,
    cacheWrite: 6.25,
  },
  "grok-3": {
    input: 5.0,
    output: 20.0,
    cacheRead: 0.5,
    cacheWrite: 6.25,
  },

  // Moonshot Kimi (was free, now paid)
  "moonshot/kimi-k2.5": {
    input: 0.0,
    output: 0.0,
    cacheRead: 0.0,
    cacheWrite: 0.0,
  },
  "kimi-k2.5": {
    input: 0.0,
    output: 0.0,
    cacheRead: 0.0,
    cacheWrite: 0.0,
  },
};

/**
 * Calculate cost for a model based on token usage
 */
export function calculateCost(
  model: string,
  tokens: {
    input: number;
    output: number;
    cacheRead?: number;
    cacheWrite?: number;
  }
): number {
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    console.warn(
      `[goldfish] Unknown model pricing for: ${model}, using fallback`
    );
    // Fallback to average mid-tier pricing
    return (
      (tokens.input * 1.0) / 1_000_000 +
      (tokens.output * 5.0) / 1_000_000 +
      ((tokens.cacheRead || 0) * 0.1) / 1_000_000 +
      ((tokens.cacheWrite || 0) * 1.25) / 1_000_000
    );
  }

  const cost =
    (tokens.input * pricing.input) / 1_000_000 +
    (tokens.output * pricing.output) / 1_000_000 +
    ((tokens.cacheRead || 0) * pricing.cacheRead) / 1_000_000 +
    ((tokens.cacheWrite || 0) * pricing.cacheWrite) / 1_000_000;

  return cost;
}

/**
 * Get pricing info for a model
 */
export function getModelPricing(model: string): ModelPricing | null {
  return MODEL_PRICING[model] || null;
}

/**
 * List all supported models
 */
export function listSupportedModels(): string[] {
  return Object.keys(MODEL_PRICING);
}
