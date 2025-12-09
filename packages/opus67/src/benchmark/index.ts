/**
 * OPUS 67 Benchmark Module
 * Performance tracking, token counting, cost analysis, and stress testing
 */

export {
  MetricsCollector,
  metricsCollector,
  type BenchmarkMetrics,
  type TokenMetrics,
  type CostMetrics,
  type LatencyMetrics,
  type ThroughputMetrics,
  type QualityMetrics,
  type MetricsSnapshot,
} from "./metrics-collector.js";

export {
  TokenTracker,
  tokenTracker,
  MODEL_COSTS,
  type ModelName,
  type TokenUsage,
  type AgentTokenRecord,
  type SessionTokenSummary,
} from "./token-tracker.js";

export {
  LatencyProfiler,
  latencyProfiler,
  timed,
  type TimingEntry,
  type TraceSpan,
  type LatencyStats,
} from "./latency-profiler.js";

export {
  AgentSpawner,
  agentSpawner,
  createSpawner,
  type AgentTask,
  type AgentResult,
  type SpawnOptions,
} from "./agent-spawner.js";

export {
  StressTest,
  stressTest,
  createStressTest,
  runStressTestCLI,
  DEFAULT_LEVELS,
  TEST_PROMPTS,
  type StressLevel,
  type StressTestResult,
  type StressTestSuite,
} from "./stress-test.js";

export {
  ComparisonRunner,
  comparisonRunner,
  createComparisonRunner,
  runComparisonCLI,
  COMPARISON_TASKS,
  type ComparisonTask,
  type RuntimeResult,
  type ComparisonResult,
  type ComparisonSuite,
} from "./comparison-runner.js";

// NEW: Memory Benchmark Suite
export {
  MemoryBenchmarkRunner,
  runMemoryBenchmark,
  MEMORY_TEST_CASES,
  type MemoryBenchmarkResult,
  type MemoryBenchmarkSuite,
  type MemoryTestCase,
} from "./memory-suite.js";
