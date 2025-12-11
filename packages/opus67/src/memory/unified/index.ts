/**
 * OPUS 67 v6.3.0 Unified Memory
 * Barrel exports for the unified memory system
 *
 * 6 Memory Sources:
 * 1. GraphitiMemory - Neo4j/local temporal graph
 * 2. LearningStore - Evolution patterns
 * 3. MarkdownLoader - .claude/memory files
 * 4. HMLRAdapter - Multi-hop reasoning
 * 5. SessionStore - Session facts from logs
 * 6. HierarchicalAdapter - 4-layer tiered memory (NEW)
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
export {
  HierarchicalAdapter,
  createHierarchicalAdapter,
  getHierarchicalAdapter,
  resetHierarchicalAdapter,
  type HierarchicalAdapterConfig,
} from "./adapters/hierarchical-adapter.js";

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
