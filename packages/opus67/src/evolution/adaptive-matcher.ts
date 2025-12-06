/**
 * OPUS 67 Adaptive Matcher
 * Enhances skill/mode/agent selection using learnings
 */

import { EventEmitter } from 'eventemitter3';
import {
  Learning,
  EntityType,
  AdaptiveMatcherConfig,
  DEFAULT_EVOLUTION_CONFIG,
} from './types.js';
import { LearningStore } from './learning-store.js';

// =============================================================================
// TYPES
// =============================================================================

interface MatcherEvents {
  'match:enhanced': (entityId: string, boost: number) => void;
  'learning:applied': (learning: Learning) => void;
  'error': (error: Error) => void;
}

interface EntityScore {
  entityId: string;
  entityType: EntityType;
  baseScore: number;
  learningBoost: number;
  appliedLearnings: string[];
  finalScore: number;
}

interface MatchContext {
  taskContext: string;
  filePaths?: string[];
  currentEntities?: Array<{ type: EntityType; id: string }>;
  mode?: string;
}

// =============================================================================
// ADAPTIVE MATCHER
// =============================================================================

export class AdaptiveMatcher extends EventEmitter<MatcherEvents> {
  private config: AdaptiveMatcherConfig;
  private learningStore: LearningStore;
  private applicationLog: Map<string, number> = new Map(); // Track learning applications

  constructor(learningStore: LearningStore, config?: Partial<AdaptiveMatcherConfig>) {
    super();
    this.config = { ...DEFAULT_EVOLUTION_CONFIG.adaptiveMatcher, ...config };
    this.learningStore = learningStore;
  }

  /**
   * Enhance entity scores based on learnings
   */
  enhanceScores(
    entities: Array<{ id: string; type: EntityType; name: string; baseScore: number }>,
    context: MatchContext
  ): EntityScore[] {
    if (!this.config.enabled) {
      return entities.map(e => ({
        entityId: e.id,
        entityType: e.type,
        baseScore: e.baseScore,
        learningBoost: 0,
        appliedLearnings: [],
        finalScore: e.baseScore,
      }));
    }

    // Find relevant learnings for this context
    const relevantLearnings = this.learningStore.findRelevant(context.taskContext, 20);

    // Calculate scores for each entity
    const scores: EntityScore[] = entities.map(entity => {
      let learningBoost = 0;
      const appliedLearnings: string[] = [];

      for (const learning of relevantLearnings) {
        if (learning.confidence < this.config.minConfidenceToApply) continue;

        // Check if this learning affects this entity
        for (const affectedEntity of learning.entities) {
          if (affectedEntity.type === entity.type && affectedEntity.id === entity.id) {
            const effect = this.calculateEffect(learning, affectedEntity, context);

            if (effect !== 0) {
              learningBoost += effect;
              appliedLearnings.push(learning.id);

              // Record application
              this.recordApplication(learning.id, true);
              this.emit('learning:applied', learning);
            }
          }
        }
      }

      // Apply boost limits
      learningBoost = Math.max(-0.5, Math.min(this.config.maxBoost - 1, learningBoost));
      const finalScore = entity.baseScore * (1 + learningBoost * this.config.learningBoostWeight);

      if (learningBoost !== 0) {
        this.emit('match:enhanced', entity.id, learningBoost);
      }

      return {
        entityId: entity.id,
        entityType: entity.type,
        baseScore: entity.baseScore,
        learningBoost,
        appliedLearnings,
        finalScore: Math.max(0, finalScore),
      };
    });

    // Check for required entities from learnings
    const requiredEntities = this.getRequiredEntities(relevantLearnings, context);
    for (const required of requiredEntities) {
      // Add required entity if not already present
      if (!scores.find(s => s.entityId === required.id && s.entityType === required.type)) {
        scores.push({
          entityId: required.id,
          entityType: required.type,
          baseScore: 0,
          learningBoost: required.weight,
          appliedLearnings: [required.learningId],
          finalScore: required.weight * this.config.learningBoostWeight,
        });
      }
    }

    // Sort by final score
    return scores.sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Calculate the effect of a learning on an entity
   */
  private calculateEffect(
    learning: Learning,
    affectedEntity: Learning['entities'][0],
    context: MatchContext
  ): number {
    // Check trigger conditions match
    let triggerMatch = 0;
    for (const condition of learning.triggerConditions) {
      if (this.checkCondition(condition, context)) {
        triggerMatch += condition.weight;
      }
    }

    if (triggerMatch === 0) return 0;

    // Calculate effect based on type
    let effect = 0;
    const weight = affectedEntity.weight * learning.confidence * triggerMatch;

    switch (affectedEntity.effect) {
      case 'boost':
        effect = weight;
        break;
      case 'reduce':
        effect = -weight;
        break;
      case 'require':
        effect = weight * 1.5; // Stronger boost for required
        break;
      case 'exclude':
        effect = -weight * 2; // Strong negative for excluded
        break;
    }

    return effect;
  }

  /**
   * Check if a trigger condition matches the context
   */
  private checkCondition(
    condition: Learning['triggerConditions'][0],
    context: MatchContext
  ): boolean {
    const lowerContext = context.taskContext.toLowerCase();

    switch (condition.type) {
      case 'keyword':
        return lowerContext.includes(condition.value.toLowerCase());

      case 'file_pattern':
        return context.filePaths?.some(p =>
          p.toLowerCase().includes(condition.value.toLowerCase())
        ) ?? false;

      case 'context':
        return lowerContext.includes(condition.value.toLowerCase());

      case 'entity':
        return context.currentEntities?.some(e =>
          e.id === condition.value || `${e.type}:${e.id}` === condition.value
        ) ?? false;

      default:
        return false;
    }
  }

  /**
   * Get entities that should be required based on learnings
   */
  private getRequiredEntities(
    learnings: Learning[],
    context: MatchContext
  ): Array<{ id: string; type: EntityType; weight: number; learningId: string }> {
    const required: Array<{ id: string; type: EntityType; weight: number; learningId: string }> = [];

    for (const learning of learnings) {
      if (learning.confidence < this.config.minConfidenceToApply) continue;

      // Check if conditions match
      let triggerMatch = false;
      for (const condition of learning.triggerConditions) {
        if (this.checkCondition(condition, context)) {
          triggerMatch = true;
          break;
        }
      }

      if (!triggerMatch) continue;

      // Find required entities
      for (const entity of learning.entities) {
        if (entity.effect === 'require') {
          required.push({
            id: entity.id,
            type: entity.type,
            weight: entity.weight * learning.confidence,
            learningId: learning.id,
          });
        }
      }
    }

    return required;
  }

  /**
   * Record a learning application
   */
  private recordApplication(learningId: string, success: boolean): void {
    const count = (this.applicationLog.get(learningId) ?? 0) + 1;
    this.applicationLog.set(learningId, count);

    // Update learning store
    this.learningStore.recordApplication(learningId, success);
  }

  /**
   * Get suggestions for additional entities based on current selection
   */
  getSuggestions(
    currentEntities: Array<{ type: EntityType; id: string }>,
    context: MatchContext
  ): Array<{ entityId: string; entityType: EntityType; reason: string; confidence: number }> {
    const suggestions: Array<{
      entityId: string;
      entityType: EntityType;
      reason: string;
      confidence: number;
    }> = [];

    // Look for correlation learnings
    for (const entity of currentEntities) {
      const entityLearnings = this.learningStore.getForEntity(entity.type, entity.id);

      for (const learning of entityLearnings) {
        if (learning.type !== 'skill_correlation') continue;
        if (learning.confidence < this.config.minConfidenceToApply) continue;

        // Find correlated entities
        for (const correlated of learning.entities) {
          if (correlated.id === entity.id) continue;
          if (currentEntities.some(e => e.id === correlated.id)) continue;

          suggestions.push({
            entityId: correlated.id,
            entityType: correlated.type,
            reason: `Often used with ${entity.id} (${Math.round(learning.confidence * 100)}% confidence)`,
            confidence: learning.confidence * correlated.weight,
          });
        }
      }
    }

    // Also check context-based learnings
    const contextLearnings = this.learningStore.findRelevant(context.taskContext, 10);

    for (const learning of contextLearnings) {
      if (learning.type !== 'pattern') continue;
      if (learning.confidence < this.config.minConfidenceToApply) continue;

      for (const entity of learning.entities) {
        if (currentEntities.some(e => e.id === entity.id)) continue;
        if (suggestions.some(s => s.entityId === entity.id)) continue;

        suggestions.push({
          entityId: entity.id,
          entityType: entity.type,
          reason: `Recommended for this context (${learning.insight})`,
          confidence: learning.confidence * entity.weight,
        });
      }
    }

    // Sort by confidence and dedupe
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Get warnings about potential issues
   */
  getWarnings(
    currentEntities: Array<{ type: EntityType; id: string }>,
    context: MatchContext
  ): Array<{ entityId: string; warning: string; confidence: number }> {
    const warnings: Array<{ entityId: string; warning: string; confidence: number }> = [];

    for (const entity of currentEntities) {
      const entityLearnings = this.learningStore.getForEntity(entity.type, entity.id);

      for (const learning of entityLearnings) {
        if (learning.type !== 'anti_pattern') continue;
        if (learning.confidence < this.config.minConfidenceToApply) continue;

        // Check if context matches
        let matches = false;
        for (const condition of learning.triggerConditions) {
          if (this.checkCondition(condition, context)) {
            matches = true;
            break;
          }
        }

        if (matches) {
          warnings.push({
            entityId: entity.id,
            warning: learning.insight,
            confidence: learning.confidence,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Explain why an entity was boosted/reduced
   */
  explainScore(entityScore: EntityScore): string {
    if (entityScore.appliedLearnings.length === 0) {
      return `Base score: ${entityScore.baseScore.toFixed(2)} (no learnings applied)`;
    }

    const learnings = entityScore.appliedLearnings
      .map(id => this.learningStore.get(id))
      .filter((l): l is Learning => l !== undefined);

    const explanations = learnings.map(l =>
      `${l.insight} (${Math.round(l.confidence * 100)}% confidence)`
    );

    const boostDir = entityScore.learningBoost >= 0 ? '+' : '';

    return [
      `Base score: ${entityScore.baseScore.toFixed(2)}`,
      `Learning boost: ${boostDir}${(entityScore.learningBoost * 100).toFixed(0)}%`,
      `Final score: ${entityScore.finalScore.toFixed(2)}`,
      '',
      'Applied learnings:',
      ...explanations.map(e => `  - ${e}`),
    ].join('\n');
  }

  /**
   * Get application stats
   */
  getStats(): {
    totalApplications: number;
    uniqueLearningsApplied: number;
    topApplied: Array<{ learningId: string; count: number }>;
  } {
    const entries = Array.from(this.applicationLog.entries());
    const totalApplications = entries.reduce((sum, [_, count]) => sum + count, 0);

    const topApplied = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([learningId, count]) => ({ learningId, count }));

    return {
      totalApplications,
      uniqueLearningsApplied: entries.length,
      topApplied,
    };
  }
}

// =============================================================================
// FACTORY & SINGLETON
// =============================================================================

export function createAdaptiveMatcher(
  learningStore: LearningStore,
  config?: Partial<AdaptiveMatcherConfig>
): AdaptiveMatcher {
  return new AdaptiveMatcher(learningStore, config);
}
