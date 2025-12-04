/**
 * OPUS 67 Model Configuration
 * API clients and model-specific settings
 */

import { z } from 'zod';

// Environment variable schema
export const EnvSchema = z.object({
  // Gemini (FREE)
  GOOGLE_AI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // DeepSeek (CHEAP)
  DEEPSEEK_API_KEY: z.string().optional(),

  // Anthropic (QUALITY)
  ANTHROPIC_API_KEY: z.string().optional(),

  // OpenAI (fallback)
  OPENAI_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

// Model configuration schema
export const ModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(['gemini', 'deepseek', 'anthropic', 'openai']),
  tier: z.enum(['free', 'cheap', 'quality']),
  maxTokens: z.number(),
  contextWindow: z.number(),
  supportsStreaming: z.boolean().default(true),
  supportsTools: z.boolean().default(true),
  supportsVision: z.boolean().default(false),
  supportsThinking: z.boolean().default(false),
  apiEndpoint: z.string().optional(),
  costPer1M: z.object({
    input: z.number(),
    output: z.number(),
  }),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

// All available models
export const MODELS: Record<string, ModelConfig> = {
  // Gemini - FREE tier
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    tier: 'free',
    maxTokens: 8192,
    contextWindow: 1_000_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    costPer1M: { input: 0, output: 0 },
  },
  'gemini-2.0-flash-thinking': {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'gemini',
    tier: 'free',
    maxTokens: 8192,
    contextWindow: 1_000_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: true,
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    costPer1M: { input: 0, output: 0 },
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    tier: 'free',
    maxTokens: 8192,
    contextWindow: 1_000_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    costPer1M: { input: 0, output: 0 },
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    tier: 'free',
    maxTokens: 8192,
    contextWindow: 2_000_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    costPer1M: { input: 0, output: 0 },
  },

  // DeepSeek - CHEAP tier
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    tier: 'cheap',
    maxTokens: 8192,
    contextWindow: 64_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
    supportsThinking: false,
    apiEndpoint: 'https://api.deepseek.com/v1',
    costPer1M: { input: 0.14, output: 0.28 },
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    tier: 'cheap',
    maxTokens: 8192,
    contextWindow: 64_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
    supportsThinking: false,
    apiEndpoint: 'https://api.deepseek.com/v1',
    costPer1M: { input: 0.14, output: 0.28 },
  },
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    tier: 'cheap',
    maxTokens: 8192,
    contextWindow: 64_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
    supportsThinking: true,
    apiEndpoint: 'https://api.deepseek.com/v1',
    costPer1M: { input: 0.55, output: 2.19 },
  },

  // Anthropic - QUALITY tier
  'claude-sonnet-4': {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    tier: 'quality',
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: 'https://api.anthropic.com/v1',
    costPer1M: { input: 3, output: 15 },
  },
  'claude-opus-4': {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    tier: 'quality',
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: true,
    apiEndpoint: 'https://api.anthropic.com/v1',
    costPer1M: { input: 15, output: 75 },
  },
  'claude-haiku-3.5': {
    id: 'claude-haiku-3.5',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    tier: 'quality',
    maxTokens: 8192,
    contextWindow: 200_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: 'https://api.anthropic.com/v1',
    costPer1M: { input: 0.8, output: 4 },
  },

  // OpenAI - Fallback
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    tier: 'quality',
    maxTokens: 16384,
    contextWindow: 128_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: 'https://api.openai.com/v1',
    costPer1M: { input: 2.5, output: 10 },
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    tier: 'cheap',
    maxTokens: 16384,
    contextWindow: 128_000,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: 'https://api.openai.com/v1',
    costPer1M: { input: 0.15, output: 0.6 },
  },
};

/**
 * Get model configuration
 */
export function getModelConfig(modelId: string): ModelConfig | null {
  return MODELS[modelId] || null;
}

/**
 * Get all models for a tier
 */
export function getModelsForTier(tier: 'free' | 'cheap' | 'quality'): ModelConfig[] {
  return Object.values(MODELS).filter(m => m.tier === tier);
}

/**
 * Get all models for a provider
 */
export function getModelsForProvider(provider: 'gemini' | 'deepseek' | 'anthropic' | 'openai'): ModelConfig[] {
  return Object.values(MODELS).filter(m => m.provider === provider);
}

/**
 * Check if API key is available for a model
 */
export function hasApiKey(modelId: string): boolean {
  const model = MODELS[modelId];
  if (!model) return false;

  switch (model.provider) {
    case 'gemini':
      return !!(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    default:
      return false;
  }
}

/**
 * Get available models (with API keys)
 */
export function getAvailableModels(): ModelConfig[] {
  return Object.values(MODELS).filter(m => hasApiKey(m.id));
}

/**
 * Format model list for display
 */
export function formatModelList(): string {
  let output = `
┌─ AVAILABLE MODELS ──────────────────────────────────────────────┐
│                                                                  │
│  FREE TIER (Gemini)                                              │
│  ────────────────────────────────────────────────────────────    │`;

  for (const model of getModelsForTier('free')) {
    const available = hasApiKey(model.id) ? '✓' : '✗';
    output += `
│  ${available} ${model.name.padEnd(30)} ${String(model.contextWindow / 1000).padEnd(5)}k context │`;
  }

  output += `
│                                                                  │
│  CHEAP TIER (DeepSeek)                                           │
│  ────────────────────────────────────────────────────────────    │`;

  for (const model of getModelsForTier('cheap')) {
    const available = hasApiKey(model.id) ? '✓' : '✗';
    const cost = `$${model.costPer1M.input}/${model.costPer1M.output}`;
    output += `
│  ${available} ${model.name.padEnd(30)} ${cost.padEnd(12)} │`;
  }

  output += `
│                                                                  │
│  QUALITY TIER (Claude/GPT)                                       │
│  ────────────────────────────────────────────────────────────    │`;

  for (const model of getModelsForTier('quality')) {
    const available = hasApiKey(model.id) ? '✓' : '✗';
    const cost = `$${model.costPer1M.input}/${model.costPer1M.output}`;
    output += `
│  ${available} ${model.name.padEnd(30)} ${cost.padEnd(12)} │`;
  }

  output += `
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;

  return output;
}

/**
 * Validate environment configuration
 */
export function validateEnv(): { valid: boolean; missing: string[]; available: string[] } {
  const missing: string[] = [];
  const available: string[] = [];

  // Check each provider
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    available.push('Gemini (FREE)');
  } else {
    missing.push('GOOGLE_AI_API_KEY or GEMINI_API_KEY');
  }

  if (process.env.DEEPSEEK_API_KEY) {
    available.push('DeepSeek (CHEAP)');
  } else {
    missing.push('DEEPSEEK_API_KEY');
  }

  if (process.env.ANTHROPIC_API_KEY) {
    available.push('Anthropic (QUALITY)');
  } else {
    missing.push('ANTHROPIC_API_KEY');
  }

  if (process.env.OPENAI_API_KEY) {
    available.push('OpenAI (fallback)');
  }

  return {
    valid: available.length >= 1,
    missing,
    available
  };
}
