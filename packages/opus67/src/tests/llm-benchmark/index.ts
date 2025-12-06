/**
 * OPUS 67 LLM Benchmark Suite
 * Enterprise-grade benchmarking for LLM performance
 */

// Types
export * from './types.js';

// Core modules
export { generateCode, calculateCost } from './model-adapter.js';
export { executeCode, checkDockerSync, checkPythonSync } from './executor.js';

// Benchmarks
export { runMemoryTierBenchmarks } from './memory-tiers.bench.js';
export { runPromptCacheBenchmarks } from './prompt-cache.bench.js';
export { runHumanEvalBenchmark, evaluateProblem, evaluateModel } from './humaneval.bench.js';
export { runHallucinationBenchmark, analyzeCode, analyzeResults } from './hallucination.bench.js';
export { runFullComparison, compareModels, generateComparisonMarkdown } from './model-comparison.bench.js';

// Main runner
export { runBenchmarkSuite, type RunnerOptions } from './runner.js';
