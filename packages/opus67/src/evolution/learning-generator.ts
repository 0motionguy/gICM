/**
 * OPUS 67 Learning Generator
 * Converts usage patterns into actionable learnings
 */

import { EventEmitter } from 'eventemitter3';
import {
  Learning,
  LearningType,
  UsageEvent,
  OutcomeSignal,
  Evidence,
  TriggerCondition,
  EntityType,
  LearningGeneratorConfig,
  EntityStats,
  DEFAULT_EVOLUTION_CONFIG,
  generateId,
} from './types.js';
import { UsageTracker } from './usage-tracker.js';
import { SignalCollector } from './signal-collector.js';
import { LearningStore } from './learning-store.js';

// =============================================================================
// TYPES
// =============================================================================

interface GeneratorEvents {
  'learning:generated': (learning: Learning) => void;
  'pattern:detected': (pattern: string) => void;
  'cycle:complete': (learningsGenerated: number) => void;
  'error': (error: Error) => void;
}

interface EntityPerformance {
  entityId: string;
  entityType: EntityType;
  entityName: string;
  totalUsage: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgWeight: number;
  coOccurrences: Map<string, number>;
  contexts: string[];
}

// =============================================================================
// LEARNING GENERATOR
// =============================================================================

export class LearningGenerator extends EventEmitter<GeneratorEvents> {
  private config: LearningGeneratorConfig;
  private usageTracker: UsageTracker;
  private signalCollector: SignalCollector;
  private learningStore: LearningStore;
  private generateInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    usageTracker: UsageTracker,
    signalCollector: SignalCollector,
    learningStore: LearningStore,
    config?: Partial<LearningGeneratorConfig>
  ) {
    super();
    this.config = { ...DEFAULT_EVOLUTION_CONFIG.learningGenerator, ...config };
    this.usageTracker = usageTracker;
    this.signalCollector = signalCollector;
    this.learningStore = learningStore;
  }

  /**
   * Start periodic learning generation
   */
  start(): void {
    if (this.generateInterval) return;

    this.generateInterval = setInterval(() => {
      this.generateLearnings().catch(e => this.emit('error', e));
    }, this.config.generateIntervalMs);

    // Run initial generation
    this.generateLearnings().catch(e => this.emit('error', e));
  }

  /**
   * Stop periodic generation
   */
  stop(): void {
    if (this.generateInterval) {
      clearInterval(this.generateInterval);
      this.generateInterval = null;
    }
  }

  /**
   * Generate learnings from recent usage data
   */
  async generateLearnings(): Promise<Learning[]> {
    if (!this.config.enabled) return [];

    const learnings: Learning[] = [];

    try {
      // Get recent data
      const events = this.usageTracker.getRecentEvents(14); // Last 2 weeks
      const signals = this.signalCollector.getRecentSignals(100);

      if (events.length < this.config.minEvidenceCount) {
        return [];
      }

      // Analyze entity performance
      const performance = this.analyzeEntityPerformance(events, signals);

      // Generate skill effectiveness learnings
      learnings.push(...this.generateSkillEffectivenessLearnings(performance));

      // Generate co-occurrence learnings
      learnings.push(...this.generateCoOccurrenceLearnings(performance));

      // Generate context-based learnings
      learnings.push(...this.generateContextLearnings(events, signals));

      // Generate anti-pattern learnings
      learnings.push(...this.generateAntiPatternLearnings(performance));

      this.emit('cycle:complete', learnings.length);

    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }

    return learnings;
  }

  /**
   * Analyze entity performance from events and signals
   */
  private analyzeEntityPerformance(
    events: UsageEvent[],
    signals: OutcomeSignal[]
  ): Map<string, EntityPerformance> {
    const performance = new Map<string, EntityPerformance>();

    // Group events by entity
    for (const event of events) {
      const key = `${event.type}:${event.entityId}`;

      if (!performance.has(key)) {
        performance.set(key, {
          entityId: event.entityId,
          entityType: event.type,
          entityName: event.entityName,
          totalUsage: 0,
          successCount: 0,
          failureCount: 0,
          successRate: 0,
          avgWeight: 0,
          coOccurrences: new Map(),
          contexts: [],
        });
      }

      const perf = performance.get(key)!;
      perf.totalUsage++;

      if (event.taskContext) {
        perf.contexts.push(event.taskContext);
      }
    }

    // Map signals to entities
    const eventMap = new Map(events.map(e => [e.id, e]));

    for (const signal of signals) {
      for (const usageId of signal.relatedUsageIds) {
        const event = eventMap.get(usageId);
        if (!event) continue;

        const key = `${event.type}:${event.entityId}`;
        const perf = performance.get(key);
        if (!perf) continue;

        if (signal.type === 'success') {
          perf.successCount += signal.weight;
        } else if (signal.type === 'failure') {
          perf.failureCount += signal.weight;
        }
      }
    }

    // Calculate success rates
    for (const perf of performance.values()) {
      const total = perf.successCount + perf.failureCount;
      perf.successRate = total > 0 ? perf.successCount / total : 0.5;
      perf.avgWeight = total / perf.totalUsage;
    }

    // Calculate co-occurrences
    const coOccurrence = this.usageTracker.getCoOccurrence(14);
    for (const [entityKey, coMap] of coOccurrence) {
      const perf = performance.get(entityKey);
      if (perf) {
        perf.coOccurrences = coMap;
      }
    }

    return performance;
  }

  /**
   * Generate learnings about skill effectiveness
   */
  private generateSkillEffectivenessLearnings(
    performance: Map<string, EntityPerformance>
  ): Learning[] {
    const learnings: Learning[] = [];

    for (const [key, perf] of performance) {
      // Need minimum evidence
      if (perf.totalUsage < this.config.minEvidenceCount) continue;

      // High performer
      if (perf.successRate >= 0.8 && perf.avgWeight >= 0.5) {
        const confidence = Math.min(0.9, 0.5 + (perf.totalUsage / 20) * 0.4);

        if (confidence >= this.config.minConfidence) {
          const keywords = this.extractKeywords(perf.contexts);

          const learning = this.learningStore.create({
            type: 'skill_affinity',
            insight: `${perf.entityName} has ${Math.round(perf.successRate * 100)}% success rate (${perf.totalUsage} uses)`,
            confidence,
            evidence: [{
              usageEventId: key,
              sessionId: '',
              outcome: 'positive',
              weight: perf.avgWeight,
              timestamp: new Date().toISOString(),
            }],
            triggerConditions: keywords.map(kw => ({
              type: 'keyword' as const,
              value: kw,
              weight: 0.3,
            })),
            entities: [{
              type: perf.entityType,
              id: perf.entityId,
              effect: 'boost',
              weight: perf.successRate,
            }],
            expectedBenefit: perf.successRate,
          });

          learnings.push(learning);
          this.emit('learning:generated', learning);
        }
      }
    }

    return learnings;
  }

  /**
   * Generate learnings about entities that work well together
   */
  private generateCoOccurrenceLearnings(
    performance: Map<string, EntityPerformance>
  ): Learning[] {
    const learnings: Learning[] = [];
    const processed = new Set<string>();

    for (const [key, perf] of performance) {
      if (perf.coOccurrences.size === 0) continue;

      // Find strong co-occurrences
      for (const [otherKey, count] of perf.coOccurrences) {
        const pairKey = [key, otherKey].sort().join('|');
        if (processed.has(pairKey)) continue;
        if (count < this.config.minEvidenceCount) continue;

        const otherPerf = performance.get(otherKey);
        if (!otherPerf) continue;

        // Check if both have good success rates
        const combinedSuccess = (perf.successRate + otherPerf.successRate) / 2;
        if (combinedSuccess < 0.6) continue;

        const confidence = Math.min(0.8, 0.4 + (count / 10) * 0.4);

        if (confidence >= this.config.minConfidence) {
          const learning = this.learningStore.create({
            type: 'skill_correlation',
            insight: `${perf.entityName} and ${otherPerf.entityName} work well together (${count} co-occurrences, ${Math.round(combinedSuccess * 100)}% combined success)`,
            confidence,
            evidence: [{
              usageEventId: pairKey,
              sessionId: '',
              outcome: 'positive',
              weight: combinedSuccess,
              timestamp: new Date().toISOString(),
            }],
            triggerConditions: [{
              type: 'entity',
              value: perf.entityId,
              weight: 0.5,
            }],
            entities: [
              { type: perf.entityType, id: perf.entityId, effect: 'require', weight: 0.5 },
              { type: otherPerf.entityType, id: otherPerf.entityId, effect: 'boost', weight: 0.5 },
            ],
            expectedBenefit: combinedSuccess,
          });

          learnings.push(learning);
          processed.add(pairKey);
          this.emit('learning:generated', learning);
        }
      }
    }

    return learnings;
  }

  /**
   * Generate context-based learnings
   */
  private generateContextLearnings(
    events: UsageEvent[],
    signals: OutcomeSignal[]
  ): Learning[] {
    const learnings: Learning[] = [];

    // Group events by context keywords
    const keywordSuccess = new Map<string, { success: number; failure: number; entities: Set<string> }>();

    const eventMap = new Map(events.map(e => [e.id, e]));

    for (const signal of signals) {
      for (const usageId of signal.relatedUsageIds) {
        const event = eventMap.get(usageId);
        if (!event || !event.taskContext) continue;

        const keywords = this.extractKeywords([event.taskContext]);

        for (const keyword of keywords) {
          if (!keywordSuccess.has(keyword)) {
            keywordSuccess.set(keyword, { success: 0, failure: 0, entities: new Set() });
          }

          const kw = keywordSuccess.get(keyword)!;
          if (signal.type === 'success') {
            kw.success += signal.weight;
          } else if (signal.type === 'failure') {
            kw.failure += signal.weight;
          }
          kw.entities.add(`${event.type}:${event.entityId}`);
        }
      }
    }

    // Create learnings for strong keyword-entity associations
    for (const [keyword, stats] of keywordSuccess) {
      const total = stats.success + stats.failure;
      if (total < this.config.minEvidenceCount) continue;

      const successRate = stats.success / total;
      if (successRate < 0.7) continue;

      const confidence = Math.min(0.7, 0.4 + (total / 15) * 0.3);

      if (confidence >= this.config.minConfidence) {
        const entities = Array.from(stats.entities).slice(0, 3).map(key => {
          const [type, id] = key.split(':');
          return {
            type: type as EntityType,
            id,
            effect: 'boost' as const,
            weight: successRate,
          };
        });

        const learning = this.learningStore.create({
          type: 'pattern',
          insight: `Tasks involving "${keyword}" have ${Math.round(successRate * 100)}% success with certain entities`,
          confidence,
          evidence: [{
            usageEventId: keyword,
            sessionId: '',
            outcome: 'positive',
            weight: successRate,
            timestamp: new Date().toISOString(),
          }],
          triggerConditions: [{
            type: 'keyword',
            value: keyword,
            weight: 0.6,
          }],
          entities,
          expectedBenefit: successRate,
        });

        learnings.push(learning);
        this.emit('learning:generated', learning);
      }
    }

    return learnings;
  }

  /**
   * Generate anti-pattern learnings (what to avoid)
   */
  private generateAntiPatternLearnings(
    performance: Map<string, EntityPerformance>
  ): Learning[] {
    const learnings: Learning[] = [];

    for (const [key, perf] of performance) {
      // Need minimum evidence
      if (perf.totalUsage < this.config.minEvidenceCount) continue;

      // Low performer
      if (perf.successRate < 0.3 && perf.avgWeight >= 0.3) {
        const confidence = Math.min(0.8, 0.4 + (perf.totalUsage / 15) * 0.4);

        if (confidence >= this.config.minConfidence) {
          const keywords = this.extractKeywords(perf.contexts);

          const learning = this.learningStore.create({
            type: 'anti_pattern',
            insight: `${perf.entityName} has low success rate (${Math.round(perf.successRate * 100)}%) - consider alternatives`,
            confidence,
            evidence: [{
              usageEventId: key,
              sessionId: '',
              outcome: 'negative',
              weight: 1 - perf.successRate,
              timestamp: new Date().toISOString(),
            }],
            triggerConditions: keywords.map(kw => ({
              type: 'keyword' as const,
              value: kw,
              weight: 0.2,
            })),
            entities: [{
              type: perf.entityType,
              id: perf.entityId,
              effect: 'reduce',
              weight: 1 - perf.successRate,
            }],
            expectedBenefit: 0.3,
          });

          learnings.push(learning);
          this.emit('learning:generated', learning);
        }
      }
    }

    return learnings;
  }

  /**
   * Extract meaningful keywords from contexts
   */
  private extractKeywords(contexts: string[]): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'it', 'its', 'i', 'you', 'we', 'they', 'he', 'she',
    ]);

    const wordFreq = new Map<string, number>();

    for (const context of contexts) {
      const words = context.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));

      for (const word of words) {
        wordFreq.set(word, (wordFreq.get(word) ?? 0) + 1);
      }
    }

    // Return top keywords that appear in at least 2 contexts
    return Array.from(wordFreq.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createLearningGenerator(
  usageTracker: UsageTracker,
  signalCollector: SignalCollector,
  learningStore: LearningStore,
  config?: Partial<LearningGeneratorConfig>
): LearningGenerator {
  return new LearningGenerator(usageTracker, signalCollector, learningStore, config);
}
