/**
 * OPUS 67 LLM Benchmark Suite - Main Runner
 * CLI tool to run all benchmarks and generate reports
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { LLMBenchmarkReport, ModelName } from './types.js';
import { runMemoryTierBenchmarks } from './memory-tiers.bench.js';
import { runPromptCacheBenchmarks } from './prompt-cache.bench.js';
import { runHumanEvalBenchmark } from './humaneval.bench.js';
import { runHallucinationBenchmark } from './hallucination.bench.js';
import { runFullComparison, generateComparisonMarkdown } from './model-comparison.bench.js';
import { checkDockerSync, checkPythonSync } from './executor.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, '../../../benchmark-results');

export interface RunnerOptions {
  models?: ModelName[];
  maxProblems?: number;
  skipCodeEval?: boolean;
  skipMemory?: boolean;
  skipCache?: boolean;
  skipHallucination?: boolean;
  outputDir?: string;
}

export async function runBenchmarkSuite(options: RunnerOptions = {}): Promise<LLMBenchmarkReport> {
  const {
    models = ['gemini', 'deepseek'],
    maxProblems = 5,
    skipCodeEval = false,
    skipMemory = false,
    skipCache = false,
    skipHallucination = false,
    outputDir = RESULTS_DIR
  } = options;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     OPUS 67 LLM Benchmark Suite v5.1.9                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();

  // Environment check
  console.log('Environment:');
  console.log(`  • Platform: ${process.platform}`);
  console.log(`  • Node: ${process.version}`);
  console.log(`  • Docker: ${checkDockerSync() ? '✓ Available' : '✗ Not found'}`);
  console.log(`  • Python: ${checkPythonSync() ? '✓ Available' : '✗ Not found'}`);
  console.log('');

  const report: LLMBenchmarkReport = {
    version: '5.1.9',
    timestamp: new Date().toISOString(),
    environment: {
      platform: process.platform,
      nodeVersion: process.version,
      dockerAvailable: checkDockerSync()
    },
    models: [],
    memoryTiers: [],
    promptCache: [],
    hallucination: [],
    summary: {
      best_model: '',
      best_pass_at_1: 0,
      best_latency: Infinity,
      cache_hit_rate: 0,
      hallucination_rate_avg: 0
    }
  };

  // 1. Memory Tier Benchmarks
  if (!skipMemory) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Running 5-Tier Memory Benchmarks...\n');
    try {
      report.memoryTiers = await runMemoryTierBenchmarks();
      console.log('  ✓ Memory benchmarks complete\n');
      for (const tier of report.memoryTiers) {
        console.log(`    Tier ${tier.tier} (${tier.name}): ${tier.query_latency_ms.toFixed(1)}ms query, ${(tier.accuracy * 100).toFixed(0)}% accuracy`);
      }
      console.log('');
    } catch (error) {
      console.error('  ✗ Memory benchmarks failed:', error);
    }
  }

  // 2. Prompt Cache Benchmarks
  if (!skipCache) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 Running Prompt Cache Benchmarks...\n');
    try {
      report.promptCache = await runPromptCacheBenchmarks();
      console.log('  ✓ Cache benchmarks complete\n');
      const hitRate = report.promptCache.find(r => r.metric === 'Cache Hit Rate');
      const savings = report.promptCache.find(r => r.metric === 'Cost Savings');
      if (hitRate) console.log(`    Cache Hit Rate: ${hitRate.value}%`);
      if (savings) console.log(`    Cost Savings: ${savings.value}%`);
      report.summary.cache_hit_rate = hitRate?.value || 0;
      console.log('');
    } catch (error) {
      console.error('  ✗ Cache benchmarks failed:', error);
    }
  }

  // 3. HumanEval Code Evaluation
  if (!skipCodeEval) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 Running HumanEval Code Evaluation...\n');
    console.log(`    Models: ${models.join(', ')}`);
    console.log(`    Problems: ${maxProblems}\n`);
    try {
      report.models = await runHumanEvalBenchmark(models, maxProblems);
      console.log('\n  ✓ Code evaluation complete\n');
      for (const model of report.models) {
        console.log(`    ${model.model}: ${model.pass_at_1.toFixed(1)}% pass@1 (${model.passed}/${model.total_problems})`);
        if (model.pass_at_1 > report.summary.best_pass_at_1) {
          report.summary.best_pass_at_1 = model.pass_at_1;
          report.summary.best_model = model.model;
        }
        if (model.avg_latency_ms < report.summary.best_latency) {
          report.summary.best_latency = model.avg_latency_ms;
        }
      }
      console.log('');
    } catch (error) {
      console.error('  ✗ Code evaluation failed:', error);
    }
  }

  // 4. Hallucination Detection
  if (!skipHallucination) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Running Hallucination Detection...\n');
    try {
      report.hallucination = await runHallucinationBenchmark();
      console.log('  ✓ Hallucination detection complete\n');
      for (const h of report.hallucination) {
        console.log(`    ${h.model}: ${h.hallucination_rate.toFixed(1)}% hallucination rate (${h.severity} severity)`);
      }
      const avgRate = report.hallucination.reduce((sum, h) => sum + h.hallucination_rate, 0) / report.hallucination.length;
      report.summary.hallucination_rate_avg = avgRate;
      console.log('');
    } catch (error) {
      console.error('  ✗ Hallucination detection failed:', error);
    }
  }

  // Generate reports
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 Generating Reports...\n');

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Save JSON report
  const jsonPath = join(outputDir, 'llm-benchmark.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`  ✓ JSON report: ${jsonPath}`);

  // Save Markdown report
  const markdownReport = generateMarkdownReport(report);
  const mdPath = join(outputDir, 'llm-benchmark.md');
  writeFileSync(mdPath, markdownReport);
  console.log(`  ✓ Markdown report: ${mdPath}`);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Benchmark Suite Complete!\n');
  console.log(`  • Duration: ${elapsed}s`);
  console.log(`  • Best Model: ${report.summary.best_model} (${report.summary.best_pass_at_1.toFixed(1)}% pass@1)`);
  console.log(`  • Cache Hit Rate: ${report.summary.cache_hit_rate.toFixed(0)}%`);
  console.log(`  • Avg Hallucination Rate: ${report.summary.hallucination_rate_avg.toFixed(1)}%`);
  console.log('');

  return report;
}

function generateMarkdownReport(report: LLMBenchmarkReport): string {
  let md = `# OPUS 67 LLM Benchmark Report v${report.version}

> Generated: ${report.timestamp}
> Platform: ${report.environment.platform} | Node: ${report.environment.nodeVersion}
> Docker: ${report.environment.dockerAvailable ? 'Available' : 'Not available'}

## Summary

| Metric | Value |
|--------|-------|
| **Best Model** | ${report.summary.best_model} |
| **Best pass@1** | ${report.summary.best_pass_at_1.toFixed(1)}% |
| **Best Latency** | ${report.summary.best_latency < Infinity ? Math.round(report.summary.best_latency) + 'ms' : 'N/A'} |
| **Cache Hit Rate** | ${report.summary.cache_hit_rate.toFixed(0)}% |
| **Avg Hallucination Rate** | ${report.summary.hallucination_rate_avg.toFixed(1)}% |

---

## Code Evaluation (HumanEval)

| Model | pass@1 | Solved | Syntax Err | Runtime Err | Avg Tokens | Avg Latency |
|-------|--------|--------|------------|-------------|------------|-------------|
`;

  for (const model of report.models) {
    md += `| ${model.model} | ${model.pass_at_1.toFixed(1)}% | ${model.passed}/${model.total_problems} | ${model.syntax_errors} | ${model.runtime_errors} | ${Math.round(model.avg_tokens)} | ${Math.round(model.avg_latency_ms)}ms |\n`;
  }

  md += `
---

## 5-Tier Memory Performance

| Tier | Technology | Query Latency | Write Latency | Accuracy | Throughput |
|------|------------|---------------|---------------|----------|------------|
`;

  for (const tier of report.memoryTiers) {
    md += `| Tier ${tier.tier}: ${tier.name} | ${tier.technology} | ${tier.query_latency_ms.toFixed(1)}ms | ${tier.write_latency_ms.toFixed(1)}ms | ${(tier.accuracy * 100).toFixed(0)}% | ${tier.throughput.toFixed(0)} q/s |\n`;
  }

  md += `
---

## Prompt Caching

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
`;

  for (const cache of report.promptCache) {
    const status = cache.passed === undefined ? '' : cache.passed ? '✓' : '✗';
    const target = cache.target !== undefined ? `${cache.target}${cache.unit}` : '-';
    md += `| ${cache.metric} | ${cache.value}${cache.unit} | ${target} | ${status} |\n`;
  }

  md += `
---

## Hallucination Detection

| Model | Hallucination Rate | Severity | Invalid Imports | Wrong APIs |
|-------|-------------------|----------|-----------------|------------|
`;

  for (const h of report.hallucination) {
    md += `| ${h.model} | ${h.hallucination_rate.toFixed(1)}% | ${h.severity} | ${h.categories.invalid_imports} | ${h.categories.wrong_api_usage} |\n`;
  }

  md += `
---

## Recommendations

### For Best Accuracy
Use **${report.summary.best_model}** with ${report.summary.best_pass_at_1.toFixed(1)}% pass@1

### For Best Cost Efficiency
Use **Gemini 2.0 Flash** (FREE tier) with prompt caching enabled

### For Lowest Hallucination Risk
${report.hallucination.length > 0 ?
  `Use **${report.hallucination.reduce((a, b) => a.hallucination_rate < b.hallucination_rate ? a : b).model}** with ${report.hallucination.reduce((a, b) => a.hallucination_rate < b.hallucination_rate ? a : b).hallucination_rate.toFixed(1)}% hallucination rate`
  : 'No hallucination data available'}

---

*Generated by OPUS 67 LLM Benchmark Suite v${report.version}*
`;

  return md;
}

// CLI entry point
if (process.argv[1]?.includes('runner')) {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {};

  if (args.includes('--gemini-only')) {
    options.models = ['gemini'];
  }
  if (args.includes('--deepseek-only')) {
    options.models = ['deepseek'];
  }
  if (args.includes('--quick')) {
    options.maxProblems = 3;
    options.skipMemory = false;
    options.skipCache = false;
  }
  if (args.includes('--full')) {
    options.maxProblems = 50;
  }

  runBenchmarkSuite(options)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}
