/**
 * OPUS 67 Unified Memory
 * Barrel exports for the unified memory system
 */

// Types
export * from "./types.js";

// Core components
export {
  UnifiedBus,
  createUnifiedBus,
  getUnifiedBus,
  resetUnifiedBus,
} from "./unified-bus.js";
export { MarkdownLoader, createMarkdownLoader } from "./markdown-loader.js";
export {
  LearningSyncBridge,
  createLearningSyncBridge,
} from "./learning-sync.js";

// Main class
export {
  UnifiedMemory,
  createUnifiedMemory,
  getUnifiedMemory,
  initializeUnifiedMemory,
  resetUnifiedMemory,
} from "./unified-memory.js";

// Adapters
export { HMLRAdapter, createHMLRAdapter } from "./adapters/hmlr-adapter.js";
export {
  SessionStore,
  createSessionStore,
  getSessionStore,
  type SessionFact,
  type SessionState,
  type SessionStoreConfig,
} from "./adapters/session-store.js";

// Event Consumer
export {
  MemoryEventConsumer,
  createEventConsumer,
  getEventConsumer,
  type MemoryEvent,
  type EventConsumerConfig,
  type ConsumeResult,
} from "./event-consumer.js";

// Bootstrap
export { bootstrapMemory } from "./bootstrap.js";
