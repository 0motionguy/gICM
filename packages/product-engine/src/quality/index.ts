/**
 * Quality Module
 *
 * Automated testing and code review.
 */

import type { BuildTask, TestResults, ReviewResults } from "../core/types.js";
import { TestRunner, type TestConfig } from "./testing.js";
import { CodeReviewer, type ReviewConfig } from "./review.js";
import { Logger } from "../utils/logger.js";

export interface QualityGateConfig {
  minTestScore: number;
  minReviewScore: number;
  requireTests: boolean;
  requireReview: boolean;
}

const DEFAULT_GATE_CONFIG: QualityGateConfig = {
  minTestScore: 80,
  minReviewScore: 70,
  requireTests: true,
  requireReview: true,
};

export class QualityGate {
  private logger: Logger;
  private testRunner: TestRunner;
  private reviewer: CodeReviewer;
  private config: QualityGateConfig;

  constructor(
    config: Partial<QualityGateConfig> = {},
    testConfig: Partial<TestConfig> = {},
    reviewConfig: Partial<ReviewConfig> = {}
  ) {
    this.logger = new Logger("QualityGate");
    this.config = { ...DEFAULT_GATE_CONFIG, ...config };
    this.testRunner = new TestRunner(testConfig);
    this.reviewer = new CodeReviewer(reviewConfig);
  }

  /**
   * Run full quality check
   */
  async check(task: BuildTask): Promise<{
    passed: boolean;
    testResults: TestResults | null;
    reviewResults: ReviewResults | null;
    report: string;
  }> {
    this.logger.info(`Running quality gate for: ${task.id}`);

    let testResults: TestResults | null = null;
    let reviewResults: ReviewResults | null = null;
    let testPassed = true;
    let reviewPassed = true;

    // Run tests
    if (this.config.requireTests) {
      testResults = await this.testRunner.runTests(task);
      const testScore = testResults.total > 0
        ? ((testResults.total - testResults.failures) / testResults.total) * 100
        : 0;
      testPassed = testScore >= this.config.minTestScore;
      this.logger.info(`Tests: ${testPassed ? "PASSED" : "FAILED"} (${testScore}%)`);
    }

    // Run review
    if (this.config.requireReview) {
      reviewResults = await this.reviewer.review(task);
      reviewPassed = reviewResults.score >= this.config.minReviewScore;
      this.logger.info(`Review: ${reviewPassed ? "PASSED" : "FAILED"} (${reviewResults.score})`);
    }

    const passed = testPassed && reviewPassed;

    // Generate report
    const report = this.generateReport({
      passed,
      testResults,
      reviewResults,
      testPassed,
      reviewPassed,
    });

    return { passed, testResults, reviewResults, report };
  }

  /**
   * Quick quality check (review only)
   */
  async quickCheck(task: BuildTask): Promise<{
    passed: boolean;
    reviewResults: ReviewResults;
  }> {
    const reviewResults = await this.reviewer.review(task);
    const passed = reviewResults.score >= this.config.minReviewScore;

    return { passed, reviewResults };
  }

  /**
   * Generate quality report
   */
  private generateReport(results: {
    passed: boolean;
    testResults: TestResults | null;
    reviewResults: ReviewResults | null;
    testPassed: boolean;
    reviewPassed: boolean;
  }): string {
    const lines = [
      "# Quality Gate Report",
      "",
      `## Overall: ${results.passed ? "✅ PASSED" : "❌ FAILED"}`,
      "",
    ];

    if (results.testResults) {
      lines.push(
        "### Tests",
        `- Status: ${results.testPassed ? "✅ PASSED" : "❌ FAILED"}`,
        `- Total: ${results.testResults.total}`,
        `- Failures: ${results.testResults.failures}`,
        `- Duration: ${results.testResults.duration}ms`,
        ""
      );
    }

    if (results.reviewResults) {
      lines.push(
        "### Code Review",
        `- Status: ${results.reviewPassed ? "✅ PASSED" : "❌ FAILED"}`,
        `- Score: ${results.reviewResults.score}/100`,
        `- Issues: ${results.reviewResults.issues.length}`,
        ""
      );

      if (results.reviewResults.issues.length > 0) {
        lines.push("#### Top Issues:");
        for (const issue of results.reviewResults.issues.slice(0, 5)) {
          const icon = issue.severity === "error" ? "❌" : issue.severity === "warning" ? "⚠️" : "ℹ️";
          lines.push(`- ${icon} ${issue.file}:${issue.line} - ${issue.message}`);
        }
        lines.push("");
      }
    }

    return lines.join("\n");
  }
}

export { TestRunner, type TestConfig } from "./testing.js";
export { CodeReviewer, type ReviewConfig } from "./review.js";
