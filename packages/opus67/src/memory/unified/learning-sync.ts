/**
 * OPUS 67 Learning Sync Bridge
 * Adapts LearningStore to UnifiedMemory and syncs with Graphiti
 *
 * The LearningStore holds pattern learnings from usage. This bridge:
 * 1. Exposes learnings as a memory source via MemoryAdapter
 * 2. Syncs learnings bidirectionally with Graphiti
 * 3. Emits events to the UnifiedBus
 */

import type {
  MemoryAdapter,
  MemorySource,
  UnifiedResult,
  UnifiedQuery,
  WritePayload,
} from "./types.js";
import type { Learning, LearningType } from "../../evolution/types.js";
import {
  LearningStore,
  learningStore,
} from "../../evolution/learning-store.js";
import { GraphitiMemory, memory as graphitiMemory } from "../graphiti.js";

// =============================================================================
// LEARNING ADAPTER
// =============================================================================

export class LearningSyncBridge implements MemoryAdapter {
  readonly source: MemorySource = "learning";

  private learningStore: LearningStore;
  private graphiti: GraphitiMemory | null;
  private initialized = false;
  private syncEnabled = true;

  constructor(
    store?: LearningStore,
    graphiti?: GraphitiMemory,
    options?: { syncEnabled?: boolean },
  ) {
    this.learningStore = store ?? learningStore;
    this.graphiti = graphiti ?? null;
    this.syncEnabled = options?.syncEnabled ?? true;
  }

  /**
   * Initialize the bridge
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Set up event listeners for bidirectional sync
      if (this.syncEnabled) {
        this.setupEventHandlers();
      }

      this.initialized = true;
      console.log(
        `[LearningSyncBridge] Initialized with ${this.learningStore.getActive().length} active learnings`,
      );
      return true;
    } catch (error) {
      console.error("[LearningSyncBridge] Failed to initialize:", error);
      return false;
    }
  }

  /**
   * Check if adapter is available
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Set up bidirectional sync handlers
   */
  private setupEventHandlers(): void {
    // When learning is created, sync to Graphiti
    this.learningStore.on("learning:created", async (learning) => {
      if (!this.graphiti) return;

      try {
        const node = await this.graphiti.addFact(
          `learning:${learning.type}:${learning.id}`,
          learning.insight,
          {
            learningId: learning.id,
            type: learning.type,
            confidence: learning.confidence,
            expectedBenefit: learning.expectedBenefit,
            entities: learning.entities,
            source: "learning-store",
          },
        );

        // Create relationships to entities
        for (const entity of learning.entities) {
          if (entity.type === "skill") {
            // Note: Would need skill node IDs - simplified here
            console.log(
              `[LearningSyncBridge] Would link to skill: ${entity.id}`,
            );
          }
        }

        console.log(
          `[LearningSyncBridge] Synced learning ${learning.id} to Graphiti as ${node.id}`,
        );
      } catch (error) {
        console.warn(
          `[LearningSyncBridge] Failed to sync learning to Graphiti:`,
          error,
        );
      }
    });

    // When learning is updated, update Graphiti node
    this.learningStore.on("learning:updated", async (learning) => {
      if (!this.graphiti) return;
      // Graphiti doesn't have direct update by external ID - would need to track mapping
      console.log(`[LearningSyncBridge] Learning updated: ${learning.id}`);
    });

    // When learning is deprecated, could mark in Graphiti
    this.learningStore.on("learning:deprecated", async (learning) => {
      console.log(`[LearningSyncBridge] Learning deprecated: ${learning.id}`);
    });
  }

  /**
   * Query learnings
   */
  async query(
    query: string,
    options?: Partial<UnifiedQuery>,
  ): Promise<UnifiedResult[]> {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;
    const lowerQuery = query.toLowerCase();

    // Use LearningStore's built-in findRelevant if query provided
    let learnings: Learning[];
    if (query && query.trim()) {
      learnings = this.learningStore.findRelevant(query, limit * 2);
    } else {
      learnings = this.learningStore.getActive();
    }

    // Convert to UnifiedResult with scoring
    const results: UnifiedResult[] = [];

    for (const learning of learnings) {
      let score = learning.confidence; // Start with confidence

      // Boost if query matches
      if (query) {
        if (learning.insight.toLowerCase().includes(lowerQuery)) {
          score += 0.3;
        }
        if (learning.type.toLowerCase().includes(lowerQuery)) {
          score += 0.2;
        }
        // Check trigger conditions
        for (const trigger of learning.triggerConditions) {
          if (trigger.value.toLowerCase().includes(lowerQuery)) {
            score += trigger.weight * 0.5;
          }
        }
      }

      // Boost by actual benefit if available
      if (learning.actualBenefit !== undefined) {
        score *= 0.5 + learning.actualBenefit * 0.5;
      }

      // Normalize
      score = Math.min(1, score);

      if (score >= minScore || query === "") {
        results.push({
          id: learning.id,
          source: "learning",
          content: learning.insight,
          score,
          metadata: {
            type: learning.type,
            key: `${learning.type}:${learning.id}`,
            timestamp: new Date(learning.updatedAt),
            confidence: learning.confidence,
            applicationCount: learning.applicationCount,
            actualBenefit: learning.actualBenefit,
            expectedBenefit: learning.expectedBenefit,
            entities: learning.entities,
            triggerConditions: learning.triggerConditions,
          },
        });
      }
    }

    // Sort by score and limit
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Write a new learning
   */
  async write(payload: WritePayload): Promise<string | null> {
    if (payload.type !== "learning") {
      console.warn(
        `[LearningSyncBridge] Cannot write type ${payload.type}, only 'learning' supported`,
      );
      return null;
    }

    try {
      const learning = this.learningStore.create({
        type: (payload.metadata?.learningType as LearningType) ?? "pattern",
        insight: payload.content,
        confidence: (payload.metadata?.confidence as number) ?? 0.7,
        evidence: [],
        triggerConditions: (payload.metadata?.triggers as any[]) ?? [
          {
            type: "keyword",
            value: payload.key ?? payload.content.slice(0, 30),
            weight: 1,
          },
        ],
        entities: (payload.metadata?.entities as any[]) ?? [],
        expectedBenefit: (payload.metadata?.expectedBenefit as number) ?? 0.5,
      });

      // Save to file
      this.learningStore.save();

      return learning.id;
    } catch (error) {
      console.error("[LearningSyncBridge] Failed to write learning:", error);
      return null;
    }
  }

  /**
   * Get stats
   */
  async getStats(): Promise<{ count: number; lastSync?: Date }> {
    const stats = this.learningStore.getStats();
    return {
      count: stats.activeLearnings,
    };
  }

  /**
   * Get learnings for a specific entity (skill, mode, etc.)
   */
  getForEntity(entityType: string, entityId: string): Learning[] {
    return this.learningStore.getForEntity(entityType as any, entityId);
  }

  /**
   * Get learnings by type
   */
  getByType(type: string): Learning[] {
    return this.learningStore.getByType(type as any);
  }

  /**
   * Record that a learning was applied
   */
  recordApplication(learningId: string, success: boolean): void {
    this.learningStore.recordApplication(learningId, success);
    this.learningStore.save();
  }

  /**
   * Connect to Graphiti for bidirectional sync
   */
  connectGraphiti(graphiti: GraphitiMemory): void {
    this.graphiti = graphiti;
    if (this.initialized && this.syncEnabled) {
      // Re-setup handlers with new graphiti instance
      this.setupEventHandlers();
    }
  }

  /**
   * Sync all existing learnings to Graphiti
   */
  async syncAllToGraphiti(): Promise<number> {
    if (!this.graphiti) {
      console.warn("[LearningSyncBridge] No Graphiti instance connected");
      return 0;
    }

    const learnings = this.learningStore.getActive();
    let synced = 0;

    for (const learning of learnings) {
      try {
        await this.graphiti.addFact(
          `learning:${learning.type}:${learning.id}`,
          learning.insight,
          {
            learningId: learning.id,
            type: learning.type,
            confidence: learning.confidence,
            expectedBenefit: learning.expectedBenefit,
            source: "learning-store-sync",
          },
        );
        synced++;
      } catch (error) {
        console.warn(
          `[LearningSyncBridge] Failed to sync learning ${learning.id}:`,
          error,
        );
      }
    }

    console.log(
      `[LearningSyncBridge] Synced ${synced}/${learnings.length} learnings to Graphiti`,
    );
    return synced;
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    // Remove event listeners
    this.learningStore.removeAllListeners();
    this.graphiti = null;
    this.initialized = false;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createLearningSyncBridge(
  store?: LearningStore,
  graphiti?: GraphitiMemory,
  options?: { syncEnabled?: boolean },
): LearningSyncBridge {
  return new LearningSyncBridge(store, graphiti, options);
}
