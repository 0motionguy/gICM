/**
 * OPUS 67 Model Pricing
 * Cost calculation functions for different providers
 */

/** Claude model pricing per million tokens */
const CLAUDE_PRICES: Record<string, { input: number; output: number }> = {
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 1, output: 5 },
  'claude-3-opus-20240229': { input: 15, output: 75 }
};

/** Gemini model pricing per million tokens */
const GEMINI_PRICES: Record<string, { input: number; output: number }> = {
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-1.5-pro': { input: 1.25, output: 5 }
};

/** DeepSeek pricing per million tokens */
const DEEPSEEK_PRICES = {
  input: 0.14,
  output: 0.28
};

/**
 * Calculate Claude API cost
 */
export function calculateClaudeCost(inputTokens: number, outputTokens: number, model: string): number {
  const price = CLAUDE_PRICES[model] || CLAUDE_PRICES['claude-3-5-sonnet-20241022'];
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}

/**
 * Calculate Gemini API cost
 */
export function calculateGeminiCost(inputTokens: number, outputTokens: number, model: string): number {
  const price = GEMINI_PRICES[model] || GEMINI_PRICES['gemini-1.5-flash'];
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}

/**
 * Calculate DeepSeek API cost
 */
export function calculateDeepSeekCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * DEEPSEEK_PRICES.input + outputTokens * DEEPSEEK_PRICES.output) / 1_000_000;
}

/**
 * Get Claude model ID based on tier
 */
export function getClaudeModelId(tier?: string): string {
  switch (tier) {
    case 'fast':
      return 'claude-3-5-haiku-20241022';
    case 'balanced':
      return 'claude-3-5-sonnet-20241022';
    case 'premium':
      return 'claude-3-opus-20240229';
    default:
      return 'claude-3-5-sonnet-20241022';
  }
}
