/**
 * OPUS 67 Signal Collector
 * Detects success/failure outcomes from various sources
 */

import { EventEmitter } from 'eventemitter3';
import {
  OutcomeSignal,
  SignalType,
  SignalSource,
  POSITIVE_SIGNALS,
  NEGATIVE_SIGNALS,
  generateId,
} from './types.js';
import { UsageTracker } from './usage-tracker.js';

// =============================================================================
// TYPES
// =============================================================================

interface CollectorEvents {
  'signal:detected': (signal: OutcomeSignal) => void;
  'batch:processed': (count: number) => void;
  'error': (error: Error) => void;
}

interface SignalPattern {
  pattern: RegExp | string;
  type: SignalType;
  weight: number;
  source: SignalSource;
}

// =============================================================================
// SIGNAL COLLECTOR
// =============================================================================

export class SignalCollector extends EventEmitter<CollectorEvents> {
  private usageTracker: UsageTracker;
  private patterns: SignalPattern[] = [];
  private recentSignals: OutcomeSignal[] = [];
  private maxRecentSignals = 100;

  constructor(usageTracker: UsageTracker) {
    super();
    this.usageTracker = usageTracker;
    this.registerDefaultPatterns();
  }

  /**
   * Register default signal patterns
   */
  private registerDefaultPatterns(): void {
    // Build/Compile signals
    this.registerPattern(/build succeeded/i, 'success', 0.9, 'hook');
    this.registerPattern(/build failed/i, 'failure', 0.9, 'hook');
    this.registerPattern(/compilation successful/i, 'success', 0.8, 'hook');
    this.registerPattern(/compilation error/i, 'failure', 0.8, 'hook');

    // Test signals
    this.registerPattern(/tests? passed/i, 'success', 0.9, 'hook');
    this.registerPattern(/tests? failed/i, 'failure', 0.9, 'hook');
    this.registerPattern(/\d+ passed, 0 failed/i, 'success', 0.95, 'hook');
    this.registerPattern(/0 passed, \d+ failed/i, 'failure', 0.95, 'hook');

    // Deployment signals
    this.registerPattern(/deploy(ment)? successful/i, 'success', 0.95, 'hook');
    this.registerPattern(/deploy(ment)? failed/i, 'failure', 0.95, 'hook');
    this.registerPattern(/published to npm/i, 'success', 0.9, 'hook');

    // Git signals
    this.registerPattern(/commit (created|successful)/i, 'success', 0.7, 'hook');
    this.registerPattern(/push successful/i, 'success', 0.8, 'hook');
    this.registerPattern(/merge (completed|successful)/i, 'success', 0.8, 'hook');

    // Error signals
    this.registerPattern(/error:/i, 'failure', 0.7, 'system');
    this.registerPattern(/exception:/i, 'failure', 0.8, 'system');
    this.registerPattern(/fatal:/i, 'failure', 0.9, 'system');
    this.registerPattern(/timeout/i, 'failure', 0.6, 'system');
    this.registerPattern(/permission denied/i, 'failure', 0.7, 'system');

    // Lint signals
    this.registerPattern(/linting passed/i, 'success', 0.6, 'hook');
    this.registerPattern(/lint(ing)? (error|failed)/i, 'failure', 0.6, 'hook');
    this.registerPattern(/no (lint )?errors/i, 'success', 0.5, 'hook');

    // Task completion signals
    this.registerPattern(/task completed/i, 'success', 0.7, 'system');
    this.registerPattern(/operation completed/i, 'success', 0.6, 'system');
    this.registerPattern(/successfully/i, 'success', 0.5, 'inferred');
  }

  /**
   * Register a custom signal pattern
   */
  registerPattern(
    pattern: RegExp | string,
    type: SignalType,
    weight: number,
    source: SignalSource
  ): void {
    this.patterns.push({ pattern, type, weight, source });
  }

  /**
   * Analyze text for signals
   */
  analyzeText(text: string, source: SignalSource = 'system'): OutcomeSignal[] {
    const signals: OutcomeSignal[] = [];
    const currentSession = this.usageTracker.getCurrentSession();
    const relatedUsageIds = currentSession?.usageEventIds ?? [];

    for (const { pattern, type, weight, source: patternSource } of this.patterns) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');

      if (regex.test(text)) {
        const signal: OutcomeSignal = {
          id: generateId('signal'),
          timestamp: new Date().toISOString(),
          type,
          source: source === 'system' ? patternSource : source,
          signal: this.extractSignalContext(text, regex),
          weight,
          relatedUsageIds,
          metadata: { pattern: pattern.toString() },
        };

        signals.push(signal);
        this.addToRecent(signal);
        this.emit('signal:detected', signal);
      }
    }

    return signals;
  }

  /**
   * Extract context around the matched pattern
   */
  private extractSignalContext(text: string, pattern: RegExp): string {
    const match = text.match(pattern);
    if (!match || match.index === undefined) {
      return text.slice(0, 100);
    }

    const start = Math.max(0, match.index - 20);
    const end = Math.min(text.length, match.index + match[0].length + 20);
    let context = text.slice(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  }

  /**
   * Record a manual signal from user feedback
   */
  recordUserSignal(
    type: SignalType,
    description: string,
    weight: number = 0.9
  ): OutcomeSignal {
    const currentSession = this.usageTracker.getCurrentSession();
    const relatedUsageIds = currentSession?.usageEventIds ?? [];

    const signal: OutcomeSignal = {
      id: generateId('signal'),
      timestamp: new Date().toISOString(),
      type,
      source: 'user',
      signal: description,
      weight,
      relatedUsageIds,
      metadata: { manual: true },
    };

    this.addToRecent(signal);
    this.emit('signal:detected', signal);

    // Update session outcome
    if (currentSession) {
      currentSession.outcomeSignals.push(signal);
    }

    return signal;
  }

  /**
   * Record a hook signal (from post-bash, etc.)
   */
  recordHookSignal(
    hookName: string,
    output: string,
    exitCode: number
  ): OutcomeSignal[] {
    const signals: OutcomeSignal[] = [];
    const currentSession = this.usageTracker.getCurrentSession();
    const relatedUsageIds = currentSession?.usageEventIds ?? [];

    // Determine base signal type from exit code
    const baseType: SignalType = exitCode === 0 ? 'success' : 'failure';
    const baseWeight = exitCode === 0 ? 0.8 : 0.85;

    // Create base signal from exit code
    const baseSignal: OutcomeSignal = {
      id: generateId('signal'),
      timestamp: new Date().toISOString(),
      type: baseType,
      source: 'hook',
      signal: `${hookName} exited with code ${exitCode}`,
      weight: baseWeight,
      relatedUsageIds,
      metadata: { hookName, exitCode },
    };

    signals.push(baseSignal);
    this.addToRecent(baseSignal);

    // Also analyze output for additional signals
    const outputSignals = this.analyzeText(output, 'hook');
    signals.push(...outputSignals);

    // Update session
    if (currentSession) {
      currentSession.outcomeSignals.push(...signals);
    }

    this.emit('batch:processed', signals.length);

    return signals;
  }

  /**
   * Record a system signal (from internal events)
   */
  recordSystemSignal(
    eventType: string,
    success: boolean,
    details?: string
  ): OutcomeSignal {
    const currentSession = this.usageTracker.getCurrentSession();
    const relatedUsageIds = currentSession?.usageEventIds ?? [];

    const signal: OutcomeSignal = {
      id: generateId('signal'),
      timestamp: new Date().toISOString(),
      type: success ? 'success' : 'failure',
      source: 'system',
      signal: details ?? `${eventType}: ${success ? 'completed' : 'failed'}`,
      weight: 0.7,
      relatedUsageIds,
      metadata: { eventType, success },
    };

    this.addToRecent(signal);
    this.emit('signal:detected', signal);

    if (currentSession) {
      currentSession.outcomeSignals.push(signal);
    }

    return signal;
  }

  /**
   * Infer outcome from user response patterns
   */
  inferFromUserResponse(response: string): OutcomeSignal | null {
    const currentSession = this.usageTracker.getCurrentSession();
    const relatedUsageIds = currentSession?.usageEventIds ?? [];

    // Positive patterns
    const positivePatterns = [
      /thank(s| you)/i,
      /perfect/i,
      /great/i,
      /works?( well)?/i,
      /exactly what/i,
      /that's (it|right)/i,
      /approved/i,
    ];

    // Negative patterns
    const negativePatterns = [
      /that's (wrong|not right)/i,
      /doesn't work/i,
      /not what i/i,
      /try again/i,
      /fix (this|that|it)/i,
      /error/i,
      /fail/i,
    ];

    for (const pattern of positivePatterns) {
      if (pattern.test(response)) {
        const signal: OutcomeSignal = {
          id: generateId('signal'),
          timestamp: new Date().toISOString(),
          type: 'success',
          source: 'inferred',
          signal: `Positive user response: "${response.slice(0, 50)}"`,
          weight: 0.6,
          relatedUsageIds,
          metadata: { inferredFrom: 'user_response', pattern: pattern.toString() },
        };

        this.addToRecent(signal);
        this.emit('signal:detected', signal);
        return signal;
      }
    }

    for (const pattern of negativePatterns) {
      if (pattern.test(response)) {
        const signal: OutcomeSignal = {
          id: generateId('signal'),
          timestamp: new Date().toISOString(),
          type: 'failure',
          source: 'inferred',
          signal: `Negative user response: "${response.slice(0, 50)}"`,
          weight: 0.6,
          relatedUsageIds,
          metadata: { inferredFrom: 'user_response', pattern: pattern.toString() },
        };

        this.addToRecent(signal);
        this.emit('signal:detected', signal);
        return signal;
      }
    }

    return null;
  }

  /**
   * Add signal to recent list
   */
  private addToRecent(signal: OutcomeSignal): void {
    this.recentSignals.unshift(signal);
    if (this.recentSignals.length > this.maxRecentSignals) {
      this.recentSignals.pop();
    }
  }

  /**
   * Get recent signals
   */
  getRecentSignals(limit: number = 20): OutcomeSignal[] {
    return this.recentSignals.slice(0, limit);
  }

  /**
   * Get signals for a session
   */
  getSessionSignals(sessionId: string): OutcomeSignal[] {
    return this.recentSignals.filter(s =>
      s.relatedUsageIds.some(id => id.includes(sessionId)) ||
      s.metadata.sessionId === sessionId
    );
  }

  /**
   * Calculate session outcome from signals
   */
  calculateSessionOutcome(signals: OutcomeSignal[]): {
    outcome: 'success' | 'partial' | 'failure' | 'unknown';
    confidence: number;
  } {
    if (signals.length === 0) {
      return { outcome: 'unknown', confidence: 0 };
    }

    let successWeight = 0;
    let failureWeight = 0;

    for (const signal of signals) {
      if (signal.type === 'success') {
        successWeight += signal.weight;
      } else if (signal.type === 'failure') {
        failureWeight += signal.weight;
      }
    }

    const totalWeight = successWeight + failureWeight;
    if (totalWeight === 0) {
      return { outcome: 'unknown', confidence: 0 };
    }

    const successRatio = successWeight / totalWeight;
    const confidence = Math.min(totalWeight / signals.length, 1);

    if (successRatio >= 0.8) {
      return { outcome: 'success', confidence };
    } else if (successRatio >= 0.4) {
      return { outcome: 'partial', confidence };
    } else {
      return { outcome: 'failure', confidence };
    }
  }

  /**
   * Get signal stats
   */
  getStats(): {
    totalSignals: number;
    byType: Record<SignalType, number>;
    bySource: Record<SignalSource, number>;
    avgWeight: number;
  } {
    const byType: Record<SignalType, number> = {
      success: 0,
      failure: 0,
      neutral: 0,
    };

    const bySource: Record<SignalSource, number> = {
      hook: 0,
      user: 0,
      system: 0,
      inferred: 0,
    };

    let totalWeight = 0;

    for (const signal of this.recentSignals) {
      byType[signal.type]++;
      bySource[signal.source]++;
      totalWeight += signal.weight;
    }

    return {
      totalSignals: this.recentSignals.length,
      byType,
      bySource,
      avgWeight: this.recentSignals.length > 0
        ? totalWeight / this.recentSignals.length
        : 0,
    };
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createSignalCollector(usageTracker: UsageTracker): SignalCollector {
  return new SignalCollector(usageTracker);
}
