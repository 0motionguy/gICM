/**
 * Automated Testing
 *
 * Run and analyze tests for built agents/components.
 */

import * as fs from "fs/promises";
import * as path from "path";
import { spawn } from "child_process";
import type { TestResults, BuildTask } from "../core/types.js";
import { Logger } from "../utils/logger.js";

export interface TestConfig {
  timeout: number;
  coverage: boolean;
  watch: boolean;
}

const DEFAULT_CONFIG: TestConfig = {
  timeout: 60000,
  coverage: true,
  watch: false,
};

export class TestRunner {
  private logger: Logger;
  private config: TestConfig;

  constructor(config: Partial<TestConfig> = {}) {
    this.logger = new Logger("TestRunner");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run tests for a built task
   */
  async runTests(task: BuildTask): Promise<TestResults> {
    if (!task.outputPath) {
      return {
        passed: false,
        total: 0,
        failures: 0,
        coverage: 0,
        duration: 0,
        details: [],
      };
    }

    this.logger.info(`Running tests for: ${task.outputPath}`);
    const startTime = Date.now();

    try {
      // Check if tests exist
      const testsExist = await this.testsExist(task.outputPath);
      if (!testsExist) {
        this.logger.warn("No tests found");
        return {
          passed: false,
          total: 0,
          failures: 0,
          coverage: 0,
          duration: 0,
          details: [{ name: "setup", status: "skipped", message: "No tests found" }],
        };
      }

      // Install dependencies first
      await this.installDeps(task.outputPath);

      // Run vitest
      const result = await this.runVitest(task.outputPath);

      return {
        passed: result.failures === 0,
        total: result.total,
        failures: result.failures,
        coverage: result.coverage,
        duration: Date.now() - startTime,
        details: result.details,
      };
    } catch (error) {
      this.logger.error(`Test run failed: ${error}`);
      return {
        passed: false,
        total: 0,
        failures: 1,
        coverage: 0,
        duration: Date.now() - startTime,
        details: [{ name: "execution", status: "failed", message: String(error) }],
      };
    }
  }

  /**
   * Check if tests exist
   */
  private async testsExist(projectPath: string): Promise<boolean> {
    try {
      const srcDir = path.join(projectPath, "src");
      const files = await fs.readdir(srcDir);
      return files.some((f) => f.includes(".test.") || f.includes(".spec."));
    } catch {
      return false;
    }
  }

  /**
   * Install dependencies
   */
  private async installDeps(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn("npm", ["install"], {
        cwd: projectPath,
        shell: true,
        stdio: "pipe",
      });

      let stderr = "";
      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed: ${stderr}`));
        }
      });

      proc.on("error", reject);
    });
  }

  /**
   * Run vitest
   */
  private async runVitest(
    projectPath: string
  ): Promise<{
    total: number;
    failures: number;
    coverage: number;
    details: Array<{ name: string; status: "passed" | "failed" | "skipped"; message?: string }>;
  }> {
    return new Promise((resolve) => {
      const args = ["run", "--reporter=json"];
      if (this.config.coverage) {
        args.push("--coverage");
      }

      const proc = spawn("npx", ["vitest", ...args], {
        cwd: projectPath,
        shell: true,
        stdio: "pipe",
        timeout: this.config.timeout,
      });

      let stdout = "";
      let stderr = "";

      proc.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        try {
          // Parse JSON output
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            resolve({
              total: result.numTotalTests || 0,
              failures: result.numFailedTests || 0,
              coverage: 0, // Would need coverage report parsing
              details:
                result.testResults?.flatMap(
                  (tr: { assertionResults: Array<{ title: string; status: string; failureMessages?: string[] }> }) =>
                    tr.assertionResults.map((ar: { title: string; status: string; failureMessages?: string[] }) => ({
                      name: ar.title,
                      status: ar.status === "passed" ? "passed" : "failed",
                      message: ar.failureMessages?.join("\n"),
                    }))
                ) || [],
            });
          } else {
            // Fallback parsing
            resolve({
              total: 1,
              failures: code === 0 ? 0 : 1,
              coverage: 0,
              details: [
                {
                  name: "test suite",
                  status: code === 0 ? "passed" : "failed",
                  message: stderr || stdout,
                },
              ],
            });
          }
        } catch {
          resolve({
            total: 1,
            failures: code === 0 ? 0 : 1,
            coverage: 0,
            details: [
              {
                name: "test suite",
                status: code === 0 ? "passed" : "failed",
                message: stderr || stdout,
              },
            ],
          });
        }
      });

      proc.on("error", (err) => {
        resolve({
          total: 0,
          failures: 1,
          coverage: 0,
          details: [{ name: "execution", status: "failed", message: err.message }],
        });
      });
    });
  }

  /**
   * Generate test report
   */
  generateReport(results: TestResults): string {
    const lines = [
      "# Test Results",
      "",
      `**Status:** ${results.passed ? "✅ PASSED" : "❌ FAILED"}`,
      `**Total:** ${results.total} tests`,
      `**Failures:** ${results.failures}`,
      `**Coverage:** ${results.coverage}%`,
      `**Duration:** ${results.duration}ms`,
      "",
      "## Details",
      "",
    ];

    for (const detail of results.details) {
      const icon = detail.status === "passed" ? "✅" : detail.status === "failed" ? "❌" : "⏭️";
      lines.push(`- ${icon} ${detail.name}`);
      if (detail.message) {
        lines.push(`  - ${detail.message.slice(0, 100)}`);
      }
    }

    return lines.join("\n");
  }
}
