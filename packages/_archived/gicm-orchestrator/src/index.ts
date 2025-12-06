// Main orchestrator
export { GICMOrchestrator } from "./orchestrator.js";

// Types
export * from "./types.js";

// Re-export agents for convenience
export { HunterAgent, type HuntDiscovery } from "@gicm/hunter-agent";
export { DecisionAgent, type ScoredDiscovery } from "@gicm/decision-agent";
export { BuilderAgent, type BuildRequest, type BuildResult } from "@gicm/builder-agent";
export { RefactorAgent, type AnalysisResult } from "@gicm/refactor-agent";
export { DeployerAgent, type DeployRequest, type DeployResult } from "@gicm/deployer-agent";
export { ActivityLogger } from "@gicm/activity-logger";
