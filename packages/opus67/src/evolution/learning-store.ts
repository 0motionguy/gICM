/**
 * OPUS 67 Learning Store
 * Persists learnings from usage patterns
 */

import { EventEmitter } from 'eventemitter3';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import {
  Learning,
  LearningType,
  EntityType,
  Evidence,
  TriggerCondition,
  LearningStats,
  generateId,
} from './types.js';

// =============================================================================
// TYPES
// =============================================================================

interface StoreEvents {
  'learning:created': (learning: Learning) => void;
  'learning:updated': (learning: Learning) => void;
  'learning:deprecated': (learning: Learning) => void;
  'error': (error: Error) => void;
}

interface LearningStoreConfig {
  storageLocation: string;
  maxLearnings: number;
  autoDeprecateThreshold: number; // Applications before deprecating low-performers
  confidenceDecayRate: number;    // How much confidence decays per day unused
}

const DEFAULT_CONFIG: LearningStoreConfig = {
  storageLocation: '.opus67/evolution/learnings',
  maxLearnings: 500,
  autoDeprecateThreshold: 10,
  confidenceDecayRate: 0.01,
};

// =============================================================================
// LEARNING STORE
// =============================================================================

export class LearningStore extends EventEmitter<StoreEvents> {
  private config: LearningStoreConfig;
  private learnings: Map<string, Learning> = new Map();
  private indexByType: Map<LearningType, Set<string>> = new Map();
  private indexByEntity: Map<string, Set<string>> = new Map();
  private dirty = false;

  constructor(config?: Partial<LearningStoreConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureStorageDir();
    this.load();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir(): void {
    const dir = this.config.storageLocation;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Load learnings from storage
   */
  private load(): void {
    const mainFile = join(this.config.storageLocation, 'learnings.json');

    if (!existsSync(mainFile)) {
      return;
    }

    try {
      const content = readFileSync(mainFile, 'utf-8');
      const data = JSON.parse(content) as Learning[];

      for (const learning of data) {
        this.learnings.set(learning.id, learning);
        this.addToIndices(learning);
      }
    } catch (error) {
      console.error('[LearningStore] Failed to load:', error);
    }
  }

  /**
   * Save learnings to storage
   */
  save(): void {
    if (!this.dirty) return;

    const mainFile = join(this.config.storageLocation, 'learnings.json');
    const learnings = Array.from(this.learnings.values());

    try {
      writeFileSync(mainFile, JSON.stringify(learnings, null, 2), 'utf-8');
      this.dirty = false;
    } catch (error) {
      console.error('[LearningStore] Failed to save:', error);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Add learning to indices
   */
  private addToIndices(learning: Learning): void {
    // Index by type
    if (!this.indexByType.has(learning.type)) {
      this.indexByType.set(learning.type, new Set());
    }
    this.indexByType.get(learning.type)!.add(learning.id);

    // Index by entity
    for (const entity of learning.entities) {
      const key = `${entity.type}:${entity.id}`;
      if (!this.indexByEntity.has(key)) {
        this.indexByEntity.set(key, new Set());
      }
      this.indexByEntity.get(key)!.add(learning.id);
    }
  }

  /**
   * Remove learning from indices
   */
  private removeFromIndices(learning: Learning): void {
    this.indexByType.get(learning.type)?.delete(learning.id);

    for (const entity of learning.entities) {
      const key = `${entity.type}:${entity.id}`;
      this.indexByEntity.get(key)?.delete(learning.id);
    }
  }

  /**
   * Create a new learning
   */
  create(params: {
    type: LearningType;
    insight: string;
    confidence: number;
    evidence: Evidence[];
    triggerConditions: TriggerCondition[];
    entities: Learning['entities'];
    expectedBenefit: number;
  }): Learning {
    // Check for similar existing learning
    const similar = this.findSimilar(params.type, params.entities);
    if (similar) {
      // Merge evidence into existing learning
      return this.addEvidence(similar.id, params.evidence);
    }

    // Check max learnings
    if (this.learnings.size >= this.config.maxLearnings) {
      this.pruneOldLearnings();
    }

    const learning: Learning = {
      id: generateId('learning'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: params.type,
      insight: params.insight,
      confidence: Math.min(1, Math.max(0, params.confidence)),
      evidenceCount: params.evidence.length,
      evidence: params.evidence.slice(0, 20), // Keep last 20 evidence items
      triggerConditions: params.triggerConditions,
      entities: params.entities,
      expectedBenefit: params.expectedBenefit,
      applicationCount: 0,
      status: 'active',
    };

    this.learnings.set(learning.id, learning);
    this.addToIndices(learning);
    this.dirty = true;
    this.emit('learning:created', learning);

    return learning;
  }

  /**
   * Find similar existing learning
   */
  private findSimilar(type: LearningType, entities: Learning['entities']): Learning | null {
    const typeLearnings = this.indexByType.get(type);
    if (!typeLearnings) return null;

    for (const id of typeLearnings) {
      const learning = this.learnings.get(id);
      if (!learning || learning.status !== 'active') continue;

      // Check if entities match
      const entityIds = entities.map(e => `${e.type}:${e.id}`).sort();
      const learningEntityIds = learning.entities.map(e => `${e.type}:${e.id}`).sort();

      if (entityIds.join(',') === learningEntityIds.join(',')) {
        return learning;
      }
    }

    return null;
  }

  /**
   * Add evidence to existing learning
   */
  addEvidence(learningId: string, evidence: Evidence[]): Learning {
    const learning = this.learnings.get(learningId);
    if (!learning) {
      throw new Error(`Learning not found: ${learningId}`);
    }

    // Add new evidence
    learning.evidence.unshift(...evidence);
    learning.evidence = learning.evidence.slice(0, 20);
    learning.evidenceCount += evidence.length;

    // Update confidence based on evidence
    const positiveCount = evidence.filter(e => e.outcome === 'positive').length;
    const negativeCount = evidence.filter(e => e.outcome === 'negative').length;

    if (positiveCount > negativeCount) {
      learning.confidence = Math.min(1, learning.confidence + 0.05 * positiveCount);
    } else if (negativeCount > positiveCount) {
      learning.confidence = Math.max(0, learning.confidence - 0.1 * negativeCount);
    }

    learning.updatedAt = new Date().toISOString();
    this.dirty = true;
    this.emit('learning:updated', learning);

    return learning;
  }

  /**
   * Record that a learning was applied
   */
  recordApplication(learningId: string, success: boolean): Learning | null {
    const learning = this.learnings.get(learningId);
    if (!learning) return null;

    learning.applicationCount++;

    // Update actual benefit based on success
    if (learning.actualBenefit === undefined) {
      learning.actualBenefit = success ? 1 : 0;
    } else {
      // Running average
      learning.actualBenefit =
        (learning.actualBenefit * (learning.applicationCount - 1) + (success ? 1 : 0)) /
        learning.applicationCount;
    }

    // Auto-deprecate if consistently failing
    if (
      learning.applicationCount >= this.config.autoDeprecateThreshold &&
      (learning.actualBenefit ?? 0) < 0.3
    ) {
      learning.status = 'deprecated';
      this.emit('learning:deprecated', learning);
    }

    learning.updatedAt = new Date().toISOString();
    this.dirty = true;

    return learning;
  }

  /**
   * Get a learning by ID
   */
  get(id: string): Learning | undefined {
    return this.learnings.get(id);
  }

  /**
   * Get all active learnings
   */
  getActive(): Learning[] {
    return Array.from(this.learnings.values()).filter(l => l.status === 'active');
  }

  /**
   * Get learnings by type
   */
  getByType(type: LearningType): Learning[] {
    const ids = this.indexByType.get(type) ?? new Set();
    return Array.from(ids)
      .map(id => this.learnings.get(id))
      .filter((l): l is Learning => l !== undefined && l.status === 'active');
  }

  /**
   * Get learnings for an entity
   */
  getForEntity(entityType: EntityType, entityId: string): Learning[] {
    const key = `${entityType}:${entityId}`;
    const ids = this.indexByEntity.get(key) ?? new Set();
    return Array.from(ids)
      .map(id => this.learnings.get(id))
      .filter((l): l is Learning => l !== undefined && l.status === 'active');
  }

  /**
   * Find relevant learnings for a task context
   */
  findRelevant(context: string, limit: number = 10): Learning[] {
    const activeLearnings = this.getActive();
    const scores: Array<{ learning: Learning; score: number }> = [];

    const lowerContext = context.toLowerCase();

    for (const learning of activeLearnings) {
      let score = 0;

      // Check trigger conditions
      for (const condition of learning.triggerConditions) {
        if (condition.type === 'keyword') {
          if (lowerContext.includes(condition.value.toLowerCase())) {
            score += condition.weight;
          }
        } else if (condition.type === 'context') {
          if (lowerContext.includes(condition.value.toLowerCase())) {
            score += condition.weight;
          }
        }
      }

      // Weight by confidence
      score *= learning.confidence;

      if (score > 0) {
        scores.push({ learning, score });
      }
    }

    // Sort by score and return top N
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.learning);
  }

  /**
   * Deprecate a learning
   */
  deprecate(id: string, reason?: string): boolean {
    const learning = this.learnings.get(id);
    if (!learning) return false;

    learning.status = 'deprecated';
    learning.updatedAt = new Date().toISOString();
    if (reason) {
      learning.entities.push({
        type: 'skill',
        id: 'deprecation_reason',
        effect: 'exclude',
        weight: 0,
      });
    }

    this.dirty = true;
    this.emit('learning:deprecated', learning);

    return true;
  }

  /**
   * Prune old/low-performing learnings
   */
  private pruneOldLearnings(): void {
    const sorted = Array.from(this.learnings.values())
      .filter(l => l.status === 'active')
      .sort((a, b) => {
        // Prioritize by: confidence * actualBenefit * recency
        const scoreA = a.confidence * (a.actualBenefit ?? a.expectedBenefit) *
          (1 / (Date.now() - new Date(a.updatedAt).getTime()));
        const scoreB = b.confidence * (b.actualBenefit ?? b.expectedBenefit) *
          (1 / (Date.now() - new Date(b.updatedAt).getTime()));
        return scoreA - scoreB;
      });

    // Remove bottom 10%
    const toRemove = Math.ceil(sorted.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      const learning = sorted[i];
      learning.status = 'deprecated';
      this.emit('learning:deprecated', learning);
    }

    this.dirty = true;
  }

  /**
   * Apply confidence decay to unused learnings
   */
  applyDecay(): void {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const learning of this.learnings.values()) {
      if (learning.status !== 'active') continue;

      const daysSinceUpdate =
        (now - new Date(learning.updatedAt).getTime()) / dayMs;

      if (daysSinceUpdate > 7) {
        const decay = this.config.confidenceDecayRate * Math.floor(daysSinceUpdate / 7);
        learning.confidence = Math.max(0.1, learning.confidence - decay);
        this.dirty = true;
      }
    }
  }

  /**
   * Get stats
   */
  getStats(): LearningStats {
    const all = Array.from(this.learnings.values());
    const active = all.filter(l => l.status === 'active');

    const totalApplications = all.reduce((sum, l) => sum + l.applicationCount, 0);
    const avgConfidence =
      active.length > 0
        ? active.reduce((sum, l) => sum + l.confidence, 0) / active.length
        : 0;
    const avgBenefit =
      active.length > 0
        ? active.reduce((sum, l) => sum + (l.actualBenefit ?? l.expectedBenefit), 0) /
          active.length
        : 0;

    return {
      totalLearnings: all.length,
      activeLearnings: active.length,
      avgConfidence,
      totalApplications,
      avgBenefit,
    };
  }

  /**
   * Export learnings for backup
   */
  export(): Learning[] {
    return Array.from(this.learnings.values());
  }

  /**
   * Import learnings from backup
   */
  import(learnings: Learning[]): void {
    for (const learning of learnings) {
      if (!this.learnings.has(learning.id)) {
        this.learnings.set(learning.id, learning);
        this.addToIndices(learning);
      }
    }
    this.dirty = true;
    this.save();
  }
}

// =============================================================================
// FACTORY & SINGLETON
// =============================================================================

export function createLearningStore(config?: Partial<LearningStoreConfig>): LearningStore {
  return new LearningStore(config);
}

export const learningStore = new LearningStore();
