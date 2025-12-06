/**
 * OPUS 67 LLM Benchmark Suite - Vitest Test Runner
 * Run with: pnpm test src/tests/llm-benchmark/llm-benchmark.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { runMemoryTierBenchmarks } from './memory-tiers.bench.js';
import { runPromptCacheBenchmarks } from './prompt-cache.bench.js';
import { runHallucinationBenchmark, analyzeCode } from './hallucination.bench.js';
import { checkPythonSync, checkDockerSync } from './executor.js';
import type {
  MemoryTierResult,
  PromptCacheResult,
  HallucinationResult
} from './types.js';

describe('OPUS 67 LLM Benchmark Suite', () => {
  describe('Environment Checks', () => {
    it('should detect Python availability', () => {
      const pythonAvailable = checkPythonSync();
      console.log(`Python available: ${pythonAvailable}`);
      // Don't fail if Python not available, just log it
      expect(typeof pythonAvailable).toBe('boolean');
    });

    it('should detect Docker availability', () => {
      const dockerAvailable = checkDockerSync();
      console.log(`Docker available: ${dockerAvailable}`);
      expect(typeof dockerAvailable).toBe('boolean');
    });
  });

  describe('5-Tier Memory Benchmarks', () => {
    let results: MemoryTierResult[];

    beforeAll(async () => {
      results = await runMemoryTierBenchmarks();
    });

    it('should benchmark all 5 tiers', () => {
      expect(results).toHaveLength(5);
    });

    it('should have all required tier properties', () => {
      for (const result of results) {
        expect(result.tier).toBeDefined();
        expect(result.name).toBeDefined();
        expect(result.technology).toBeDefined();
        expect(result.query_latency_ms).toBeDefined();
        expect(result.write_latency_ms).toBeDefined();
        expect(result.accuracy).toBeDefined();
        expect(result.throughput).toBeDefined();
      }
    });

    it('should have query latencies < 100ms', () => {
      for (const result of results) {
        expect(result.query_latency_ms).toBeLessThan(100);
      }
    });

    it('should have accuracy >= 90%', () => {
      for (const result of results) {
        expect(result.accuracy).toBeGreaterThanOrEqual(0.9);
      }
    });

    it('Tier 1 (Vector/Qdrant) should be optimized for similarity search', () => {
      const vectorTier = results.find(r => r.tier === 1);
      expect(vectorTier?.technology).toBe('Qdrant');
      expect(vectorTier?.query_latency_ms).toBeLessThan(20);
    });

    it('Tier 5 (Structured/PostgreSQL) should have 100% accuracy', () => {
      const structuredTier = results.find(r => r.tier === 5);
      expect(structuredTier?.technology).toBe('PostgreSQL');
      expect(structuredTier?.accuracy).toBe(1.0);
    });
  });

  describe('Prompt Cache Benchmarks', () => {
    let results: PromptCacheResult[];

    beforeAll(async () => {
      results = await runPromptCacheBenchmarks();
    });

    it('should return cache metrics', () => {
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have cold start < 100ms', () => {
      const coldStart = results.find(r => r.metric === 'Cold Start Latency');
      expect(coldStart?.value).toBeLessThan(100);
    });

    it('should have warm start < 50ms', () => {
      const warmStart = results.find(r => r.metric === 'Warm Start Latency');
      expect(warmStart?.value).toBeLessThan(50);
    });

    it('should achieve >= 85% cache hit rate', () => {
      const hitRate = results.find(r => r.metric === 'Cache Hit Rate');
      expect(hitRate?.value).toBeGreaterThanOrEqual(85);
    });

    it('should have 5-minute TTL', () => {
      const ttl = results.find(r => r.metric === 'TTL Duration');
      expect(ttl?.value).toBe(5);
    });

    it('should achieve >= 80% cost savings', () => {
      const savings = results.find(r => r.metric === 'Cost Savings');
      expect(savings?.value).toBeGreaterThanOrEqual(80);
    });

    it('should achieve >= 90% token reduction', () => {
      const reduction = results.find(r => r.metric === 'Token Reduction');
      expect(reduction?.value).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Hallucination Detection', () => {
    it('should detect invalid imports', () => {
      const analysis = analyzeCode(`from utils import helper
import mymodule`);

      expect(analysis.hallucinations.length).toBeGreaterThan(0);
      expect(analysis.hallucinations.some(h => h.type === 'invalid_import')).toBe(true);
    });

    it('should allow valid stdlib imports', () => {
      const analysis = analyzeCode(`import os
import json
from collections import defaultdict`);

      const invalidImports = analysis.hallucinations.filter(h => h.type === 'invalid_import');
      expect(invalidImports.length).toBe(0);
    });

    it('should detect common Python API errors', () => {
      const analysis = analyzeCode(`my_list.add(5)`);
      expect(analysis.hallucinations.some(h =>
        h.description.includes('append')
      )).toBe(true);
    });

    it('should calculate severity correctly', () => {
      const analysis = analyzeCode(`from helpers import common
x.auto_magic()`);

      expect(analysis.total_score).toBeGreaterThan(0);
      expect(analysis.total_score).toBeLessThanOrEqual(100);
    });

    it('should analyze model results', async () => {
      const results = await runHallucinationBenchmark();

      expect(results.length).toBe(2); // gemini and deepseek
      for (const result of results) {
        expect(result.model).toBeDefined();
        expect(result.hallucination_rate).toBeDefined();
        expect(result.severity).toMatch(/^(low|medium|high)$/);
      }
    });
  });

  describe('Benchmark Report Generation', () => {
    it('should generate consistent metrics', async () => {
      const memoryResults = await runMemoryTierBenchmarks();
      const cacheResults = await runPromptCacheBenchmarks();
      const hallucinationResults = await runHallucinationBenchmark();

      // All benchmarks should complete successfully
      expect(memoryResults.length).toBe(5);
      expect(cacheResults.length).toBeGreaterThan(0);
      expect(hallucinationResults.length).toBe(2);
    });
  });
});

describe('Marketing Metrics Summary', () => {
  it('should meet performance targets', async () => {
    const memoryResults = await runMemoryTierBenchmarks();
    const cacheResults = await runPromptCacheBenchmarks();

    // Memory tier metrics
    const avgQueryLatency = memoryResults.reduce((sum, r) => sum + r.query_latency_ms, 0) / memoryResults.length;
    expect(avgQueryLatency).toBeLessThan(50); // < 50ms average

    // Cache metrics
    const hitRate = cacheResults.find(r => r.metric === 'Cache Hit Rate')?.value || 0;
    expect(hitRate).toBeGreaterThanOrEqual(85);

    const costSavings = cacheResults.find(r => r.metric === 'Cost Savings')?.value || 0;
    expect(costSavings).toBeGreaterThanOrEqual(80);

    console.log('\n📊 Marketing Metrics:');
    console.log(`  • Avg Memory Query: ${avgQueryLatency.toFixed(1)}ms`);
    console.log(`  • Cache Hit Rate: ${hitRate}%`);
    console.log(`  • Cost Savings: ${costSavings}%`);
  });
});
