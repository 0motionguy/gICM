/**
 * OPUS 67 LLM Benchmark Suite - Type Definitions
 */

export interface LLMModel {
  name: string;
  endpoint: string;
  apiKey: string | undefined;
  cost: { input: number; output: number };
}

export interface BenchmarkResult {
  model: string;
  problem_id: string;
  passed: boolean;
  error?: string;
  error_type?: 'syntax' | 'runtime' | 'assertion' | 'timeout' | 'api';
  tokens_used: number;
  latency_ms: number;
  generated_code: string;
}

export interface HumanEvalProblem {
  id: string;
  prompt: string;
  canonical_solution: string;
  test: string;
  entry_point: string;
}

export interface HumanEvalDataset {
  version: string;
  source: string;
  count: number;
  problems: HumanEvalProblem[];
}

export interface ModelMetrics {
  model: string;
  pass_at_1: number;
  total_problems: number;
  passed: number;
  syntax_errors: number;
  runtime_errors: number;
  timeout_errors: number;
  assertion_errors: number;
  avg_tokens: number;
  avg_latency_ms: number;
  total_cost: number;
}

export interface MemoryTierResult {
  tier: number;
  name: string;
  technology: string;
  query_latency_ms: number;
  write_latency_ms: number;
  accuracy: number;
  throughput: number;
}

export interface PromptCacheResult {
  metric: string;
  value: number;
  unit: string;
  target?: number;
  passed?: boolean;
}

export interface HallucinationResult {
  model: string;
  total_solutions: number;
  hallucinations_detected: number;
  hallucination_rate: number;
  categories: {
    invalid_imports: number;
    nonexistent_functions: number;
    wrong_api_usage: number;
    invalid_syntax: number;
  };
  severity: 'low' | 'medium' | 'high';
}

export interface LLMBenchmarkReport {
  version: string;
  timestamp: string;
  environment: {
    platform: string;
    nodeVersion: string;
    dockerAvailable: boolean;
  };
  models: ModelMetrics[];
  memoryTiers: MemoryTierResult[];
  promptCache: PromptCacheResult[];
  hallucination: HallucinationResult[];
  summary: {
    best_model: string;
    best_pass_at_1: number;
    best_latency: number;
    cache_hit_rate: number;
    hallucination_rate_avg: number;
  };
}

export interface ExecutionResult {
  passed: boolean;
  error?: string;
  error_type?: string;
  output?: string;
  test_output?: string;
}

export type ModelName = 'gemini' | 'deepseek';

export const MODELS: Record<ModelName, LLMModel> = {
  gemini: {
    name: 'Gemini 2.0 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    apiKey: process.env.GOOGLE_API_KEY,
    cost: { input: 0, output: 0 } // FREE tier
  },
  deepseek: {
    name: 'DeepSeek Chat',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY,
    cost: { input: 0.14, output: 0.28 } // $ per million tokens
  }
};
