/**
 * Central config for AI model versions
 * Update this file when new models are released
 *
 * Last updated: 2025-11-27
 */

export const MODEL_VERSIONS = {
  claude: {
    name: "Claude",
    provider: "Anthropic",
    models: "Opus 4.5 • Sonnet 4",
    featuredModel: "Claude Opus 4.5",
    latestModelId: "claude-opus-4-5-20251101",
  },
  gemini: {
    name: "Gemini",
    provider: "Google",
    models: "3.0 Pro • 2.5 Flash",
    featuredModel: "Gemini 3.0 Pro",
    latestModelId: "gemini-3.0-pro",
  },
  openai: {
    name: "OpenAI",
    provider: "OpenAI",
    models: "GPT-5.1 • o3",
    featuredModel: "GPT-5.1",
    latestModelId: "gpt-5.1",
  },
} as const;

export type PlatformKey = keyof typeof MODEL_VERSIONS;
