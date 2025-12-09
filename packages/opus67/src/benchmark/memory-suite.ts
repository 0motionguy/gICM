/**
 * OPUS 67 Memory Suite Benchmark
 * Tests unified memory system performance
 *
 * Metrics measured:
 * - Query latency (semantic, keyword, multi-hop)
 * - Context recall accuracy
 * - Cross-source relevance
 * - HMLR reasoning depth
 * - Token efficiency
 */

import {
  UnifiedMemory,
  createUnifiedMemory,
  type UnifiedResult,
  type MemorySource,
  type QueryType,
  type MemoryStats,
} from "../memory/unified/index.js";

// =============================================================================
// TYPES
// =============================================================================

export interface MemoryBenchmarkResult {
  testName: string;
  queryType: QueryType;
  latencyMs: number;
  resultCount: number;
  avgScore: number;
  sourceBreakdown: Record<MemorySource, number>;
  tokenEstimate: number;
  passed: boolean;
  notes?: string;
}

export interface MemoryBenchmarkSuite {
  name: string;
  timestamp: Date;
  results: MemoryBenchmarkResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    avgLatencyMs: number;
    avgResultCount: number;
    avgScore: number;
  };
  memoryStats: MemoryStats | null;
}

export interface MemoryTestCase {
  id: string;
  name: string;
  query: string;
  type?: QueryType;
  expectedMinResults: number;
  expectedMinScore: number;
  expectedSources?: MemorySource[];
  maxLatencyMs: number;
  description: string;
}

// =============================================================================
// TEST CASES
// =============================================================================

export const MEMORY_TEST_CASES: MemoryTestCase[] = [
  // === SEMANTIC QUERIES ===
  {
    id: "mem-001",
    name: "Semantic: Project Context",
    query: "What is OPUS 67 and what are its main features?",
    type: "semantic",
    expectedMinResults: 3,
    expectedMinScore: 0.4,
    maxLatencyMs: 500,
    description: "Tests semantic search for project overview",
  },
  {
    id: "mem-002",
    name: "Semantic: Technical Concept",
    query: "How does the skill loading system work?",
    type: "semantic",
    expectedMinResults: 2,
    expectedMinScore: 0.3,
    maxLatencyMs: 500,
    description: "Tests semantic search for technical implementation",
  },
  {
    id: "mem-003",
    name: "Semantic: Recent Work",
    query: "What was implemented recently in the memory system?",
    type: "semantic",
    expectedMinResults: 1,
    expectedMinScore: 0.3,
    expectedSources: ["graphiti", "markdown", "learning"],
    maxLatencyMs: 600,
    description: "Tests cross-source semantic search",
  },

  // === KEYWORD QUERIES ===
  {
    id: "mem-004",
    name: "Keyword: Exact Match",
    query: "skill:react-typescript-master",
    type: "keyword",
    expectedMinResults: 1,
    expectedMinScore: 0.5,
    maxLatencyMs: 200,
    description: "Tests exact keyword match",
  },
  {
    id: "mem-005",
    name: "Keyword: MCP Reference",
    query: "mcp:opus67",
    type: "keyword",
    expectedMinResults: 1,
    expectedMinScore: 0.4,
    maxLatencyMs: 200,
    description: "Tests MCP keyword lookup",
  },

  // === MULTI-HOP QUERIES ===
  {
    id: "mem-006",
    name: "Multi-Hop: Causal Chain",
    query: "Why was the unified memory system created?",
    type: "multi-hop",
    expectedMinResults: 2,
    expectedMinScore: 0.3,
    expectedSources: ["hmlr", "graphiti"],
    maxLatencyMs: 1000,
    description: "Tests causal reasoning across facts",
  },
  {
    id: "mem-007",
    name: "Multi-Hop: Evolution",
    query: "How did the context system evolve?",
    type: "multi-hop",
    expectedMinResults: 2,
    expectedMinScore: 0.3,
    maxLatencyMs: 1000,
    description: "Tests temporal evolution queries",
  },
  {
    id: "mem-008",
    name: "Multi-Hop: Dependencies",
    query: "What led to the decision to use TypeScript for HMLR?",
    type: "multi-hop",
    expectedMinResults: 1,
    expectedMinScore: 0.2,
    maxLatencyMs: 1200,
    description: "Tests decision chain reasoning",
  },

  // === TEMPORAL QUERIES ===
  {
    id: "mem-009",
    name: "Temporal: Recent",
    query: "What happened in the last session?",
    type: "temporal",
    expectedMinResults: 1,
    expectedMinScore: 0.3,
    expectedSources: ["markdown", "graphiti"],
    maxLatencyMs: 400,
    description: "Tests recent temporal queries",
  },

  // === GRAPH QUERIES ===
  {
    id: "mem-010",
    name: "Graph: Related Concepts",
    query: "What is related to the memory adapter pattern?",
    type: "graph",
    expectedMinResults: 2,
    expectedMinScore: 0.3,
    maxLatencyMs: 600,
    description: "Tests graph relationship traversal",
  },

  // === STRESS TESTS ===
  {
    id: "mem-011",
    name: "Stress: Complex Query",
    query:
      "Explain how the unified memory system connects GraphitiMemory, LearningStore, and MarkdownLoader to provide cross-source context with multi-hop reasoning capabilities",
    type: "semantic",
    expectedMinResults: 3,
    expectedMinScore: 0.3,
    maxLatencyMs: 800,
    description: "Tests complex multi-concept query",
  },
  {
    id: "mem-012",
    name: "Stress: Empty Query",
    query: "",
    type: "semantic",
    expectedMinResults: 0,
    expectedMinScore: 0,
    maxLatencyMs: 100,
    description: "Tests handling of empty queries",
  },
];

// =============================================================================
// BENCHMARK RUNNER
// =============================================================================

export class MemoryBenchmarkRunner {
  private memory: UnifiedMemory | null = null;

  /**
   * Initialize memory for benchmarking
   */
  async initialize(): Promise<void> {
    console.log("[MemoryBenchmark] Initializing unified memory...");
    this.memory = await createUnifiedMemory({
      enableHMLR: true,
      enableNeo4j: true,
      cacheEnabled: false, // Disable cache for accurate benchmarks
    });
    console.log("[MemoryBenchmark] Memory initialized");
  }

  /**
   * Run a single test case
   */
  async runTest(testCase: MemoryTestCase): Promise<MemoryBenchmarkResult> {
    if (!this.memory) {
      throw new Error("Memory not initialized. Call initialize() first.");
    }

    const startTime = Date.now();

    try {
      const results = await this.memory.query({
        query: testCase.query,
        type: testCase.type,
        limit: 20,
        minScore: 0.1,
      });

      const latencyMs = Date.now() - startTime;

      // Calculate source breakdown
      const sourceBreakdown: Record<MemorySource, number> = {
        graphiti: 0,
        learning: 0,
        sqlite: 0,
        context: 0,
        markdown: 0,
        session: 0,
        "claude-mem": 0,
        hmlr: 0,
      };
      for (const result of results) {
        sourceBreakdown[result.source]++;
      }

      // Calculate average score
      const avgScore =
        results.length > 0
          ? results.reduce((sum, r) => sum + r.score, 0) / results.length
          : 0;

      // Estimate tokens
      const tokenEstimate = Math.ceil(
        results.reduce((sum, r) => sum + r.content.length, 0) / 4,
      );

      // Check if passed
      let passed = true;
      const notes: string[] = [];

      if (results.length < testCase.expectedMinResults) {
        passed = false;
        notes.push(
          `Results: ${results.length} < expected ${testCase.expectedMinResults}`,
        );
      }

      if (avgScore < testCase.expectedMinScore && results.length > 0) {
        passed = false;
        notes.push(
          `Avg score: ${avgScore.toFixed(2)} < expected ${testCase.expectedMinScore}`,
        );
      }

      if (latencyMs > testCase.maxLatencyMs) {
        passed = false;
        notes.push(`Latency: ${latencyMs}ms > max ${testCase.maxLatencyMs}ms`);
      }

      if (testCase.expectedSources) {
        for (const source of testCase.expectedSources) {
          if (sourceBreakdown[source] === 0) {
            passed = false;
            notes.push(`Missing expected source: ${source}`);
          }
        }
      }

      return {
        testName: testCase.name,
        queryType: testCase.type ?? "semantic",
        latencyMs,
        resultCount: results.length,
        avgScore,
        sourceBreakdown,
        tokenEstimate,
        passed,
        notes: notes.length > 0 ? notes.join("; ") : undefined,
      };
    } catch (error) {
      return {
        testName: testCase.name,
        queryType: testCase.type ?? "semantic",
        latencyMs: Date.now() - startTime,
        resultCount: 0,
        avgScore: 0,
        sourceBreakdown: {
          graphiti: 0,
          learning: 0,
          sqlite: 0,
          context: 0,
          markdown: 0,
          session: 0,
          "claude-mem": 0,
          hmlr: 0,
        },
        tokenEstimate: 0,
        passed: false,
        notes: `Error: ${error}`,
      };
    }
  }

  /**
   * Run all test cases
   */
  async runAll(
    testCases: MemoryTestCase[] = MEMORY_TEST_CASES,
  ): Promise<MemoryBenchmarkSuite> {
    if (!this.memory) {
      await this.initialize();
    }

    console.log(`[MemoryBenchmark] Running ${testCases.length} tests...`);

    const results: MemoryBenchmarkResult[] = [];

    for (const testCase of testCases) {
      console.log(`  Testing: ${testCase.name}...`);
      const result = await this.runTest(testCase);
      results.push(result);
      console.log(
        `    ${result.passed ? "PASS" : "FAIL"} - ${result.latencyMs}ms, ${result.resultCount} results, score=${result.avgScore.toFixed(2)}`,
      );
    }

    // Calculate summary
    const passed = results.filter((r) => r.passed).length;
    const avgLatencyMs =
      results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;
    const avgResultCount =
      results.reduce((sum, r) => sum + r.resultCount, 0) / results.length;
    const avgScore =
      results
        .filter((r) => r.resultCount > 0)
        .reduce((sum, r) => sum + r.avgScore, 0) /
      results.filter((r) => r.resultCount > 0).length;

    // Get memory stats
    const memoryStats = this.memory ? await this.memory.getStats() : null;

    return {
      name: "OPUS 67 Memory Benchmark Suite",
      timestamp: new Date(),
      results,
      summary: {
        totalTests: results.length,
        passed,
        failed: results.length - passed,
        avgLatencyMs: Math.round(avgLatencyMs),
        avgResultCount: Math.round(avgResultCount * 10) / 10,
        avgScore: Math.round(avgScore * 100) / 100,
      },
      memoryStats,
    };
  }

  /**
   * Format results as markdown
   */
  formatResults(suite: MemoryBenchmarkSuite): string {
    let output = `# ${suite.name}\n\n`;
    output += `**Date:** ${suite.timestamp.toISOString()}\n\n`;

    // Summary
    output += `## Summary\n\n`;
    output += `| Metric | Value |\n`;
    output += `|--------|-------|\n`;
    output += `| Total Tests | ${suite.summary.totalTests} |\n`;
    output += `| Passed | ${suite.summary.passed} (${Math.round((suite.summary.passed / suite.summary.totalTests) * 100)}%) |\n`;
    output += `| Failed | ${suite.summary.failed} |\n`;
    output += `| Avg Latency | ${suite.summary.avgLatencyMs}ms |\n`;
    output += `| Avg Results | ${suite.summary.avgResultCount} |\n`;
    output += `| Avg Score | ${suite.summary.avgScore} |\n\n`;

    // Memory stats
    if (suite.memoryStats) {
      output += `## Memory Stats\n\n`;
      output += `| Source | Available | Count |\n`;
      output += `|--------|-----------|-------|\n`;
      for (const [source, stats] of Object.entries(suite.memoryStats.sources)) {
        if (stats.available) {
          output += `| ${source} | YES | ${stats.count} |\n`;
        }
      }
      output += `| **Total** | - | **${suite.memoryStats.totalMemories}** |\n\n`;
      output += `**HMLR:** ${suite.memoryStats.backends.hmlr ? "ENABLED" : "disabled"}\n\n`;
    }

    // Detailed results
    output += `## Detailed Results\n\n`;
    output += `| Test | Type | Latency | Results | Score | Status |\n`;
    output += `|------|------|---------|---------|-------|--------|\n`;
    for (const result of suite.results) {
      output += `| ${result.testName} | ${result.queryType} | ${result.latencyMs}ms | ${result.resultCount} | ${result.avgScore.toFixed(2)} | ${result.passed ? "PASS" : "FAIL"} |\n`;
    }

    // Failed tests details
    const failed = suite.results.filter((r) => !r.passed);
    if (failed.length > 0) {
      output += `\n## Failed Tests\n\n`;
      for (const result of failed) {
        output += `### ${result.testName}\n`;
        output += `- **Type:** ${result.queryType}\n`;
        output += `- **Notes:** ${result.notes}\n\n`;
      }
    }

    return output;
  }

  /**
   * Shutdown memory
   */
  async shutdown(): Promise<void> {
    if (this.memory) {
      await this.memory.shutdown();
      this.memory = null;
    }
  }
}

// =============================================================================
// CLI ENTRY
// =============================================================================

export async function runMemoryBenchmark(): Promise<MemoryBenchmarkSuite> {
  const runner = new MemoryBenchmarkRunner();

  try {
    await runner.initialize();
    const suite = await runner.runAll();

    console.log("\n" + "=".repeat(60));
    console.log("MEMORY BENCHMARK RESULTS");
    console.log("=".repeat(60));
    console.log(`Total: ${suite.summary.totalTests} tests`);
    console.log(
      `Passed: ${suite.summary.passed} (${Math.round((suite.summary.passed / suite.summary.totalTests) * 100)}%)`,
    );
    console.log(`Avg Latency: ${suite.summary.avgLatencyMs}ms`);
    console.log(`Avg Score: ${suite.summary.avgScore}`);

    if (suite.summary.failed > 0) {
      console.log(`\nFailed tests:`);
      for (const result of suite.results.filter((r) => !r.passed)) {
        console.log(`  - ${result.testName}: ${result.notes}`);
      }
    }

    return suite;
  } finally {
    await runner.shutdown();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMemoryBenchmark()
    .then((suite) => {
      const runner = new MemoryBenchmarkRunner();
      console.log("\n" + runner.formatResults(suite));
    })
    .catch((error) => {
      console.error("Benchmark failed:", error);
      process.exit(1);
    });
}
