// Main agent
export { DecisionAgent } from "./decision-agent.js";
export type { DecisionAgentConfig, ScoredDiscovery } from "./decision-agent.js";

// Scorer
export { DecisionScorer } from "./scorer.js";
export type { ScorerConfig } from "./scorer.js";

// Types
export * from "./types.js";

// Prompts (for customization)
export { SYSTEM_PROMPT, buildEvaluationPrompt } from "./prompts.js";
