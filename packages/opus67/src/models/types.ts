/**
 * OPUS 67 Model Client Types
 * Type definitions for model client configuration and results
 */

import type { RouteResult } from './router.js';

/** Model client configuration */
export interface ModelClientConfig {
  anthropicApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
}

/** Required configuration with defaults filled in */
export type RequiredModelClientConfig = Required<ModelClientConfig>;

/** Response from model call */
export interface ModelCallResult {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latencyMs: number;
}

/** Health check result */
export interface HealthCheckResult {
  provider: string;
  status: 'ok' | 'error';
  message?: string;
}

/** Provider call options */
export interface ProviderCallOptions {
  prompt: string;
  systemPrompt?: string;
  route?: RouteResult;
  config: RequiredModelClientConfig;
}
