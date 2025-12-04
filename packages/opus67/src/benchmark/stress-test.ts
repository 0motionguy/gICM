/**
 * OPUS 67 Stress Test
 * Multi-level parallel agent stress testing
 */

import { EventEmitter } from 'eventemitter3';
import { AgentSpawner, createSpawner, type AgentTask, type AgentResult } from './agent-spawner.js';
import { metricsCollector, type MetricsSnapshot } from './metrics-collector.js';
import { latencyProfiler } from './latency-profiler.js';
import { tokenTracker } from './token-tracker.js';

// Types
export interface StressLevel {
  name: string;
  agentCount: number;
  expectedSuccessRate: number;
  timeout: number;
}

export interface StressTestResult {
  level: StressLevel;
  results: AgentResult[];
  metrics: MetricsSnapshot;
  successRate: number;
  avgDuration: number;
  peakConcurrency: number;
  passed: boolean;
}

export interface StressTestSuite {
  name: string;
  levels: StressLevel[];
  results: StressTestResult[];
  summary: {
    passed: number;
    failed: number;
    maxStableAgents: number;
    totalDuration: number;
  };
}

interface StressTestEvents {
  'level:start': (level: StressLevel) => void;
  'level:complete': (result: StressTestResult) => void;
  'suite:complete': (suite: StressTestSuite) => void;
  'progress': (completed: number, total: number, level: string) => void;
}

// Default stress levels
export const DEFAULT_LEVELS: StressLevel[] = [
  { name: 'light', agentCount: 5, expectedSuccessRate: 1.0, timeout: 30000 },
  { name: 'medium', agentCount: 10, expectedSuccessRate: 1.0, timeout: 45000 },
  { name: 'heavy', agentCount: 20, expectedSuccessRate: 0.95, timeout: 60000 },
  { name: 'extreme', agentCount: 30, expectedSuccessRate: 0.90, timeout: 90000 },
];

// Test task generators
export const TEST_PROMPTS = {
  simple: [
    'What is 2 + 2?',
    'List 3 colors',
    'Say hello',
    'Count to 5',
    'Name a fruit',
  ],
  medium: [
    'Explain what a function is in programming',
    'Write a simple hello world in JavaScript',
    'What are the primary colors?',
    'Describe the water cycle briefly',
    'List 5 programming languages',
  ],
  complex: [
    'Write a TypeScript function that implements binary search',
    'Explain the difference between REST and GraphQL APIs',
    'Design a simple database schema for a blog',
    'Write unit tests for a calculator function',
    'Implement a debounce function in JavaScript',
  ],
};

/**
 * StressTest - Multi-level stress testing
 */
export class StressTest extends EventEmitter<StressTestEvents> {
  private spawner: AgentSpawner;
  private taskCounter = 0;

  constructor(spawner?: AgentSpawner) {
    super();
    this.spawner = spawner ?? createSpawner(50); // High limit for stress tests
  }

  /**
   * Generate test tasks
   */
  private generateTasks(count: number, complexity: 'simple' | 'medium' | 'complex' = 'simple'): AgentTask[] {
    const prompts = TEST_PROMPTS[complexity];
    const tasks: AgentTask[] = [];

    for (let i = 0; i < count; i++) {
      this.taskCounter++;
      tasks.push({
        id: `stress_${this.taskCounter}`,
        type: 'stress-test',
        prompt: prompts[i % prompts.length],
        priority: Math.random(), // Random priority for realistic load
        timeout: 30000,
        metadata: { complexity, index: i }
      });
    }

    return tasks;
  }

  /**
   * Create a mock executor for testing
   */
  private createMockExecutor(options?: {
    minLatency?: number;
    maxLatency?: number;
    failureRate?: number;
  }): (task: AgentTask) => Promise<string> {
    const { minLatency = 50, maxLatency = 200, failureRate = 0.02 } = options ?? {};

    return async (task: AgentTask): Promise<string> => {
      // Simulate processing time
      const latency = minLatency + Math.random() * (maxLatency - minLatency);
      await new Promise(resolve => setTimeout(resolve, latency));

      // Simulate occasional failures
      if (Math.random() < failureRate) {
        throw new Error('Simulated agent failure');
      }

      // Simulate token usage
      const inputTokens = Math.floor(50 + Math.random() * 100);
      const outputTokens = Math.floor(100 + Math.random() * 200);

      tokenTracker.record(
        task.id,
        task.type,
        'gemini-2.0-flash', // Use free model for stress tests
        { input: inputTokens, output: outputTokens }
      );

      return `Completed: ${task.prompt.slice(0, 30)}...`;
    };
  }

  /**
   * Run a single stress level
   */
  async runLevel(
    level: StressLevel,
    executor?: (task: AgentTask) => Promise<string>
  ): Promise<StressTestResult> {
    this.emit('level:start', level);

    // Reset metrics for this level
    metricsCollector.reset();
    this.spawner.clearResults();

    const tasks = this.generateTasks(level.agentCount);
    const exec = executor ?? this.createMockExecutor();

    const spanId = latencyProfiler.startSpan(`stress:${level.name}`);

    // Run the batch
    const results = await this.spawner.spawnBatch(tasks, exec, {
      maxConcurrent: level.agentCount, // Allow full parallelism
      timeout: level.timeout,
      onProgress: (completed, total) => {
        this.emit('progress', completed, total, level.name);
      }
    });

    latencyProfiler.endSpan(spanId);

    // Calculate metrics
    const successCount = results.filter(r => r.success).length;
    const successRate = successCount / results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    const metrics = metricsCollector.createSnapshot(`stress-${level.name}`, {
      level: level.name,
      agentCount: level.agentCount
    });

    const result: StressTestResult = {
      level,
      results,
      metrics,
      successRate,
      avgDuration,
      peakConcurrency: metrics.metrics.throughput.peakConcurrency,
      passed: successRate >= level.expectedSuccessRate
    };

    this.emit('level:complete', result);
    return result;
  }

  /**
   * Run full stress test suite
   */
  async runSuite(
    levels: StressLevel[] = DEFAULT_LEVELS,
    executor?: (task: AgentTask) => Promise<string>
  ): Promise<StressTestSuite> {
    const suiteStart = Date.now();
    const results: StressTestResult[] = [];
    let maxStableAgents = 0;

    for (const level of levels) {
      const result = await this.runLevel(level, executor);
      results.push(result);

      if (result.passed) {
        maxStableAgents = Math.max(maxStableAgents, level.agentCount);
      }

      // Optional: stop on first failure for quick tests
      // if (!result.passed) break;
    }

    const suite: StressTestSuite = {
      name: `stress-test-${Date.now()}`,
      levels,
      results,
      summary: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        maxStableAgents,
        totalDuration: Date.now() - suiteStart
      }
    };

    this.emit('suite:complete', suite);
    return suite;
  }

  /**
   * Quick stress test (5 and 10 agents only)
   */
  async runQuick(executor?: (task: AgentTask) => Promise<string>): Promise<StressTestSuite> {
    const quickLevels = DEFAULT_LEVELS.slice(0, 2);
    return this.runSuite(quickLevels, executor);
  }

  /**
   * Run with custom agent counts
   */
  async runCustom(
    agentCounts: number[],
    executor?: (task: AgentTask) => Promise<string>
  ): Promise<StressTestSuite> {
    const levels: StressLevel[] = agentCounts.map((count, i) => ({
      name: `level-${count}`,
      agentCount: count,
      expectedSuccessRate: count <= 10 ? 1.0 : count <= 20 ? 0.95 : 0.90,
      timeout: 30000 + count * 1000
    }));

    return this.runSuite(levels, executor);
  }

  /**
   * Format suite results
   */
  formatResults(suite: StressTestSuite): string {
    let output = `
╔══════════════════════════════════════════════════════════════════╗
║                    OPUS 67 STRESS TEST RESULTS                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  SUMMARY                                                          ║
║  ─────────────────────────────────────────────────────────────    ║
║  Passed: ${String(suite.summary.passed).padEnd(3)} / ${suite.results.length}   Max Stable: ${String(suite.summary.maxStableAgents).padEnd(3)} agents          ║
║  Total Duration: ${(suite.summary.totalDuration / 1000).toFixed(1)}s                                      ║
║                                                                   ║
║  LEVEL RESULTS                                                    ║
║  ─────────────────────────────────────────────────────────────    ║
║  LEVEL      AGENTS   SUCCESS   AVG MS    PEAK      STATUS         ║
║  ─────────────────────────────────────────────────────────────    ║`;

    for (const result of suite.results) {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const successPct = (result.successRate * 100).toFixed(0) + '%';

      output += `
║  ${result.level.name.padEnd(10)} ${String(result.level.agentCount).padEnd(8)} ${successPct.padEnd(9)} ${result.avgDuration.toFixed(0).padEnd(9)} ${String(result.peakConcurrency).padEnd(9)} ${status.padEnd(8)} ║`;
    }

    output += `
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  RECOMMENDATIONS                                                  ║
║  ─────────────────────────────────────────────────────────────    ║`;

    if (suite.summary.maxStableAgents >= 30) {
      output += `
║  ✓ Excellent! System handles 30+ concurrent agents               ║
║  ✓ Ready for production swarm workloads                          ║`;
    } else if (suite.summary.maxStableAgents >= 20) {
      output += `
║  ✓ Good! System handles 20+ concurrent agents                    ║
║  ⚠ Consider rate limit handling for 30+ agents                   ║`;
    } else if (suite.summary.maxStableAgents >= 10) {
      output += `
║  ⚠ Moderate: System handles 10-20 concurrent agents              ║
║  ⚠ Check API rate limits and timeout settings                    ║`;
    } else {
      output += `
║  ✗ Limited: System struggles with parallel agents                ║
║  ✗ Review network, API limits, and resource constraints          ║`;
    }

    output += `
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝`;

    return output;
  }
}

// Export factory
export function createStressTest(spawner?: AgentSpawner): StressTest {
  return new StressTest(spawner);
}

// Export default singleton
export const stressTest = new StressTest();

// CLI runner
export async function runStressTestCLI(levels?: number[]): Promise<void> {
  console.log('\n🔥 Starting OPUS 67 Stress Test...\n');

  const test = createStressTest();

  test.on('level:start', (level) => {
    console.log(`\n📊 Testing ${level.name}: ${level.agentCount} agents...`);
  });

  test.on('progress', (completed, total, level) => {
    const pct = Math.round((completed / total) * 100);
    process.stdout.write(`\r   Progress: ${completed}/${total} (${pct}%)`);
  });

  test.on('level:complete', (result) => {
    const status = result.passed ? '✓' : '✗';
    console.log(`\n   ${status} ${result.level.name}: ${(result.successRate * 100).toFixed(0)}% success, ${result.avgDuration.toFixed(0)}ms avg`);
  });

  const suite = levels
    ? await test.runCustom(levels)
    : await test.runSuite();

  console.log(test.formatResults(suite));
}
