/**
 * OPUS 67 Modes Module
 * Barrel export for mode selector components
 */

// Types
export type {
  ModeName,
  Mode,
  ModeRegistry,
  DetectionResult,
  ModeContext,
  TriggerMatchResult,
} from "./types.js";

// Registry
export { loadModeRegistry, getMode, getAllModes } from "./registry.js";

// Complexity
export { calculateComplexityScore } from "./complexity.js";

// Detection
export { detectMode, checkModeTriggers } from "./detection.js";

// Selector
export {
  ModeSelector,
  modeSelector,
  type ModeChangeEvent,
  type ModeSelectorEvents,
} from "./selector.js";

// Display
export {
  formatModeDisplay,
  formatModeCompact,
  formatModeList,
} from "./display.js";

// Agent Mapping (v6.1)
export {
  MODE_AGENT_MAP,
  getModeConfig,
  getAutoSpawnModes,
  getModesByPriority,
  getAllMappedAgents,
  isAsyncMode,
  type Mode as AgentMode,
  type AgentSelector,
  type AgentTriggerConfig,
} from "./agent-mapping.js";
