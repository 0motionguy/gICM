/**
 * OPUS 67 Models Module
 * Multi-model routing and cost optimization
 */

// Types
export type {
  ModelClientConfig,
  ModelCallResult,
  RequiredModelClientConfig,
  HealthCheckResult,
  ProviderCallOptions
} from './types.js';

// Pricing
export {
  calculateClaudeCost,
  calculateGeminiCost,
  calculateDeepSeekCost,
  getClaudeModelId
} from './pricing.js';

// Providers
export { callClaude, callGemini, callDeepSeek } from './providers.js';

// Router
export {
  MultiModelRouter,
  router,
  routeToModel,
  type ModelTier,
  type TaskType,
  type RoutingRule,
  type RoutingConfig,
  type RouteRequest,
  type RouteResult,
  type ModelResponse
} from './router.js';

// Config
export {
  MODELS,
  getModelConfig,
  getModelsForTier,
  getModelsForProvider,
  hasApiKey,
  getAvailableModels,
  formatModelList,
  validateEnv,
  type ModelConfig,
  type EnvConfig
} from './config.js';

// Cost Tracker
export {
  CostTracker,
  costTracker,
  type CostEntry,
  type CostBudget,
  type CostAlert,
  type CostSummary
} from './cost-tracker.js';

// Model Client
export { ModelClient, modelClient, createModelClient } from './model-client.js';
