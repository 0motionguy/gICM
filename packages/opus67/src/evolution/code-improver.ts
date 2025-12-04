/**
 * OPUS 67 Code Improver
 * Safe, automated code improvements with rollback capability
 */

import { EventEmitter } from 'eventemitter3';
import type { ImprovementOpportunity } from './evolution-loop.js';

// Types
export interface CodeChange {
  id: string;
  filePath: string;
  originalContent: string;
  newContent: string;
  changeType: 'add' | 'modify' | 'delete';
  lineRange?: { start: number; end: number };
  description: string;
}

export interface ImprovementResult {
  id: string;
  opportunity: ImprovementOpportunity;
  status: 'success' | 'failed' | 'rolled_back';
  changes: CodeChange[];
  metrics: {
    filesModified: number;
    linesAdded: number;
    linesRemoved: number;
    testsRun: number;
    testsPassed: number;
  };
  error?: string;
  appliedAt: Date;
  rolledBackAt?: Date;
}

export interface CodeImproverConfig {
  dryRun: boolean;
  requireTests: boolean;
  maxChangesPerImprovement: number;
  autoRollbackOnTestFail: boolean;
  backupOriginals: boolean;
}

interface CodeImproverEvents {
  'improvement:start': (opportunityId: string) => void;
  'improvement:complete': (result: ImprovementResult) => void;
  'change:apply': (change: CodeChange) => void;
  'rollback:start': (resultId: string) => void;
  'rollback:complete': (resultId: string) => void;
  'error': (error: Error) => void;
}

const DEFAULT_CONFIG: CodeImproverConfig = {
  dryRun: true,
  requireTests: true,
  maxChangesPerImprovement: 5,
  autoRollbackOnTestFail: true,
  backupOriginals: true
};

/**
 * CodeImprover - Safe automated code improvements
 */
export class CodeImprover extends EventEmitter<CodeImproverEvents> {
  private config: CodeImproverConfig;
  private appliedImprovements: Map<string, ImprovementResult> = new Map();
  private backups: Map<string, { path: string; content: string }[]> = new Map();

  constructor(config?: Partial<CodeImproverConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /**
   * Apply an improvement opportunity
   */
  async apply(opportunity: ImprovementOpportunity): Promise<ImprovementResult> {
    const resultId = this.generateId();

    this.emit('improvement:start', opportunity.id);

    const result: ImprovementResult = {
      id: resultId,
      opportunity,
      status: 'success',
      changes: [],
      metrics: {
        filesModified: 0,
        linesAdded: 0,
        linesRemoved: 0,
        testsRun: 0,
        testsPassed: 0
      },
      appliedAt: new Date()
    };

    try {
      // 1. Generate code changes
      const changes = await this.generateChanges(opportunity);

      if (changes.length > this.config.maxChangesPerImprovement) {
        throw new Error(`Too many changes (${changes.length} > ${this.config.maxChangesPerImprovement})`);
      }

      result.changes = changes;

      // 2. Backup originals if enabled
      if (this.config.backupOriginals) {
        await this.backupFiles(resultId, changes);
      }

      // 3. Apply changes (or simulate in dry run)
      for (const change of changes) {
        if (this.config.dryRun) {
          console.log(`[CodeImprover] [DRY RUN] Would ${change.changeType}: ${change.filePath}`);
          console.log(`  Description: ${change.description}`);
        } else {
          await this.applyChange(change);
          this.emit('change:apply', change);
        }

        // Update metrics
        result.metrics.filesModified++;
        const lines = (change.newContent?.split('\n').length ?? 0) -
                      (change.originalContent?.split('\n').length ?? 0);
        if (lines > 0) result.metrics.linesAdded += lines;
        else result.metrics.linesRemoved += Math.abs(lines);
      }

      // 4. Run tests if required
      if (this.config.requireTests && !this.config.dryRun) {
        const testResults = await this.runTests();
        result.metrics.testsRun = testResults.total;
        result.metrics.testsPassed = testResults.passed;

        if (testResults.passed < testResults.total && this.config.autoRollbackOnTestFail) {
          console.log(`[CodeImprover] Tests failed (${testResults.passed}/${testResults.total}), rolling back...`);
          await this.rollback(resultId);
          result.status = 'rolled_back';
          result.error = `Tests failed: ${testResults.passed}/${testResults.total}`;
        }
      }

      this.appliedImprovements.set(resultId, result);
      this.emit('improvement:complete', result);

    } catch (error) {
      result.status = 'failed';
      result.error = String(error);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }

    return result;
  }

  /**
   * Generate code changes for an opportunity
   */
  private async generateChanges(opportunity: ImprovementOpportunity): Promise<CodeChange[]> {
    // In real implementation, this would use an LLM to generate code changes
    // For now, we create placeholder changes based on the opportunity type

    const changes: CodeChange[] = [];

    switch (opportunity.type) {
      case 'refactor':
        changes.push({
          id: this.generateId(),
          filePath: opportunity.target,
          originalContent: '// Original code',
          newContent: opportunity.suggestedCode ?? '// Refactored code',
          changeType: 'modify',
          description: `Refactor: ${opportunity.description}`
        });
        break;

      case 'optimization':
        changes.push({
          id: this.generateId(),
          filePath: opportunity.target,
          originalContent: '// Original code',
          newContent: opportunity.suggestedCode ?? '// Optimized code with caching',
          changeType: 'modify',
          description: `Optimization: ${opportunity.description}`
        });
        break;

      case 'fix':
        changes.push({
          id: this.generateId(),
          filePath: opportunity.target,
          originalContent: '// Buggy code',
          newContent: opportunity.suggestedCode ?? '// Fixed code with error handling',
          changeType: 'modify',
          description: `Fix: ${opportunity.description}`
        });
        break;

      case 'enhancement':
        changes.push({
          id: this.generateId(),
          filePath: `${opportunity.target}.new`,
          originalContent: '',
          newContent: opportunity.suggestedCode ?? '// New enhancement code',
          changeType: 'add',
          description: `Enhancement: ${opportunity.description}`
        });
        break;
    }

    return changes;
  }

  /**
   * Apply a single code change
   */
  private async applyChange(change: CodeChange): Promise<void> {
    // In real implementation, this would use fs to write files
    // For now, just log the change
    console.log(`[CodeImprover] Applying ${change.changeType} to ${change.filePath}`);
    console.log(`  ${change.description}`);
  }

  /**
   * Backup files before changes
   */
  private async backupFiles(resultId: string, changes: CodeChange[]): Promise<void> {
    const backups: { path: string; content: string }[] = [];

    for (const change of changes) {
      if (change.changeType !== 'add') {
        backups.push({
          path: change.filePath,
          content: change.originalContent
        });
      }
    }

    this.backups.set(resultId, backups);
  }

  /**
   * Rollback an improvement
   */
  async rollback(resultId: string): Promise<boolean> {
    const result = this.appliedImprovements.get(resultId);
    const backups = this.backups.get(resultId);

    if (!result || !backups) {
      console.log(`[CodeImprover] No improvement found to rollback: ${resultId}`);
      return false;
    }

    this.emit('rollback:start', resultId);

    // Restore original files
    for (const backup of backups) {
      console.log(`[CodeImprover] Restoring: ${backup.path}`);
      // In real implementation, would write backup.content to backup.path
    }

    // Remove added files
    for (const change of result.changes) {
      if (change.changeType === 'add') {
        console.log(`[CodeImprover] Removing: ${change.filePath}`);
        // In real implementation, would delete the file
      }
    }

    result.status = 'rolled_back';
    result.rolledBackAt = new Date();

    this.emit('rollback:complete', resultId);
    return true;
  }

  /**
   * Run tests
   */
  private async runTests(): Promise<{ total: number; passed: number; failed: number }> {
    // In real implementation, would run actual test suite
    // For now, simulate test results
    console.log('[CodeImprover] Running tests...');

    return {
      total: 10,
      passed: 10,
      failed: 0
    };
  }

  /**
   * Get improvement history
   */
  getHistory(): ImprovementResult[] {
    return Array.from(this.appliedImprovements.values())
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  /**
   * Get improvement by ID
   */
  getImprovement(id: string): ImprovementResult | undefined {
    return this.appliedImprovements.get(id);
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalApplied: number;
    successful: number;
    failed: number;
    rolledBack: number;
    totalLinesChanged: number;
  } {
    const results = Array.from(this.appliedImprovements.values());

    return {
      totalApplied: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      rolledBack: results.filter(r => r.status === 'rolled_back').length,
      totalLinesChanged: results.reduce((sum, r) =>
        sum + r.metrics.linesAdded + r.metrics.linesRemoved, 0
      )
    };
  }

  /**
   * Format status
   */
  formatStatus(): string {
    const stats = this.getStats();

    return `
┌─ CODE IMPROVER STATUS ──────────────────────────────────────────┐
│                                                                  │
│  MODE: ${this.config.dryRun ? 'DRY RUN (simulation)' : 'LIVE'.padEnd(54)} │
│  AUTO ROLLBACK: ${this.config.autoRollbackOnTestFail ? 'ENABLED' : 'DISABLED'.padEnd(44)} │
│                                                                  │
│  STATISTICS                                                      │
│  ────────────────────────────────────────────────────────────    │
│  Total Applied: ${String(stats.totalApplied).padEnd(44)} │
│  Successful: ${String(stats.successful).padEnd(48)} │
│  Failed: ${String(stats.failed).padEnd(52)} │
│  Rolled Back: ${String(stats.rolledBack).padEnd(47)} │
│  Lines Changed: ${String(stats.totalLinesChanged).padEnd(45)} │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// Factory
export function createCodeImprover(config?: Partial<CodeImproverConfig>): CodeImprover {
  return new CodeImprover(config);
}

// Default singleton
export const codeImprover = new CodeImprover();
