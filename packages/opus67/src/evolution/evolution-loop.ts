/**
 * OPUS 67 Evolution Loop
 * 24/7 self-improvement cycle
 */

import { EventEmitter } from 'eventemitter3';
import { GraphitiMemory, createMemory, type Improvement } from '../memory/index.js';

// Types
export interface EvolutionConfig {
  intervalMs: number;
  maxImprovementsPerCycle: number;
  minConfidence: number;
  dryRun: boolean;
  enableAutoApply: boolean;
  pauseHours: number[]; // Hours to pause (e.g., [0, 1, 2, 3] for midnight-3am)
}

export interface ImprovementOpportunity {
  id: string;
  type: 'refactor' | 'optimization' | 'fix' | 'enhancement';
  target: string;
  description: string;
  confidence: number;
  estimatedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedCode?: string;
  context: Record<string, unknown>;
  detectedAt: Date;
}

export interface EvolutionCycle {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  opportunitiesDetected: number;
  improvementsApplied: number;
  improvementsSkipped: number;
  errors: string[];
  metrics: EvolutionMetrics;
}

export interface EvolutionMetrics {
  totalCycles: number;
  totalImprovements: number;
  averageImpactScore: number;
  successRate: number;
  lastCycleAt: Date | null;
  uptime: number;
}

interface EvolutionEvents {
  'cycle:start': (cycleId: string) => void;
  'cycle:complete': (cycle: EvolutionCycle) => void;
  'opportunity:detected': (opportunity: ImprovementOpportunity) => void;
  'improvement:applied': (improvement: Improvement) => void;
  'improvement:skipped': (opportunity: ImprovementOpportunity, reason: string) => void;
  'error': (error: Error) => void;
  'paused': () => void;
  'resumed': () => void;
}

const DEFAULT_CONFIG: EvolutionConfig = {
  intervalMs: 60000, // 1 minute
  maxImprovementsPerCycle: 3,
  minConfidence: 0.7,
  dryRun: true,
  enableAutoApply: false,
  pauseHours: [],
};

/**
 * EvolutionLoop - Continuous self-improvement engine
 */
export class EvolutionLoop extends EventEmitter<EvolutionEvents> {
  private config: EvolutionConfig;
  private memory: GraphitiMemory;
  private running = false;
  private paused = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime: Date | null = null;
  private cycles: EvolutionCycle[] = [];
  private pendingOpportunities: ImprovementOpportunity[] = [];
  private detectors: Array<(context: DetectorContext) => Promise<ImprovementOpportunity[]>> = [];

  constructor(config?: Partial<EvolutionConfig>, memoryInstance?: GraphitiMemory) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memory = memoryInstance ?? createMemory({ fallbackToLocal: true });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `evo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /**
   * Register an opportunity detector
   */
  registerDetector(detector: (context: DetectorContext) => Promise<ImprovementOpportunity[]>): void {
    this.detectors.push(detector);
  }

  /**
   * Start the evolution loop
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.startTime = new Date();

    console.log('[Evolution] Starting evolution loop...');
    console.log(`[Evolution] Interval: ${this.config.intervalMs}ms`);
    console.log(`[Evolution] Dry run: ${this.config.dryRun}`);

    // Run initial cycle
    this.runCycle().catch(e => this.emit('error', e));

    // Schedule periodic cycles
    this.intervalId = setInterval(() => {
      if (!this.paused) {
        this.runCycle().catch(e => this.emit('error', e));
      }
    }, this.config.intervalMs);
  }

  /**
   * Stop the evolution loop
   */
  stop(): void {
    if (!this.running) return;

    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('[Evolution] Stopped evolution loop');
  }

  /**
   * Pause evolution (e.g., during maintenance)
   */
  pause(): void {
    this.paused = true;
    this.emit('paused');
  }

  /**
   * Resume evolution
   */
  resume(): void {
    this.paused = false;
    this.emit('resumed');
  }

  /**
   * Check if we should pause for the current hour
   */
  private shouldPauseForHour(): boolean {
    const hour = new Date().getHours();
    return this.config.pauseHours.includes(hour);
  }

  /**
   * Run a single evolution cycle
   */
  async runCycle(): Promise<EvolutionCycle> {
    const cycle: EvolutionCycle = {
      id: this.generateId(),
      startedAt: new Date(),
      opportunitiesDetected: 0,
      improvementsApplied: 0,
      improvementsSkipped: 0,
      errors: [],
      metrics: await this.getMetrics()
    };

    this.emit('cycle:start', cycle.id);

    try {
      // Check pause hours
      if (this.shouldPauseForHour()) {
        console.log('[Evolution] Paused for scheduled quiet hours');
        cycle.completedAt = new Date();
        return cycle;
      }

      // 1. Build context from memory
      const context = await this.buildDetectorContext();

      // 2. Run all detectors
      const allOpportunities: ImprovementOpportunity[] = [];
      for (const detector of this.detectors) {
        try {
          const opportunities = await detector(context);
          allOpportunities.push(...opportunities);
        } catch (error) {
          cycle.errors.push(`Detector error: ${error}`);
        }
      }

      // 3. Add built-in pattern detection
      const builtinOpportunities = await this.detectBuiltinPatterns(context);
      allOpportunities.push(...builtinOpportunities);

      cycle.opportunitiesDetected = allOpportunities.length;

      // 4. Filter by confidence
      const qualified = allOpportunities
        .filter(o => o.confidence >= this.config.minConfidence)
        .sort((a, b) => b.estimatedImpact - a.estimatedImpact);

      // 5. Apply improvements (up to max)
      const toApply = qualified.slice(0, this.config.maxImprovementsPerCycle);

      for (const opportunity of toApply) {
        this.emit('opportunity:detected', opportunity);

        // Check risk level
        if (opportunity.riskLevel === 'high' && !this.config.enableAutoApply) {
          this.emit('improvement:skipped', opportunity, 'High risk - requires manual approval');
          cycle.improvementsSkipped++;
          this.pendingOpportunities.push(opportunity);
          continue;
        }

        // Apply or simulate
        if (this.config.dryRun) {
          console.log(`[Evolution] [DRY RUN] Would apply: ${opportunity.description}`);
          cycle.improvementsSkipped++;
        } else {
          try {
            const improvement = await this.applyImprovement(opportunity);
            this.emit('improvement:applied', improvement);
            cycle.improvementsApplied++;
          } catch (error) {
            cycle.errors.push(`Apply error: ${error}`);
            this.emit('improvement:skipped', opportunity, String(error));
            cycle.improvementsSkipped++;
          }
        }
      }

      // 6. Store cycle in memory
      await this.memory.addEpisode({
        name: `evolution:cycle:${cycle.id}`,
        content: `Evolution cycle completed: ${cycle.improvementsApplied} applied, ${cycle.opportunitiesDetected} detected`,
        type: 'success',
        context: {
          cycleId: cycle.id,
          applied: cycle.improvementsApplied,
          detected: cycle.opportunitiesDetected
        }
      });

    } catch (error) {
      cycle.errors.push(`Cycle error: ${error}`);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }

    cycle.completedAt = new Date();
    this.cycles.push(cycle);
    this.emit('cycle:complete', cycle);

    return cycle;
  }

  /**
   * Build context for detectors
   */
  private async buildDetectorContext(): Promise<DetectorContext> {
    const memories = await this.memory.search('', { limit: 50 });
    const improvements = await this.memory.getImprovements();
    const goals = await this.memory.getGoals();

    return {
      recentMemories: memories.map(m => m.node),
      pastImprovements: improvements,
      activeGoals: goals.filter(g => g.status !== 'completed'),
      pendingOpportunities: this.pendingOpportunities,
      metrics: await this.getMetrics()
    };
  }

  /**
   * Built-in pattern detection
   */
  private async detectBuiltinPatterns(context: DetectorContext): Promise<ImprovementOpportunity[]> {
    const opportunities: ImprovementOpportunity[] = [];

    // Pattern 1: Repeated failures in same area
    const failurePatterns = context.recentMemories
      .filter(m => m.metadata?.episodeType === 'failure')
      .reduce((acc, m) => {
        const component = String(m.metadata?.component ?? 'unknown');
        acc[component] = (acc[component] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    for (const [component, count] of Object.entries(failurePatterns)) {
      if (count >= 3) {
        opportunities.push({
          id: this.generateId(),
          type: 'fix',
          target: component,
          description: `Component "${component}" has ${count} recent failures - needs investigation`,
          confidence: 0.8,
          estimatedImpact: 0.7,
          riskLevel: 'medium',
          context: { failureCount: count },
          detectedAt: new Date()
        });
      }
    }

    // Pattern 2: Successful improvements to replicate
    const highImpactImprovements = context.pastImprovements
      .filter(i => i.impact >= 0.8)
      .slice(0, 3);

    for (const imp of highImpactImprovements) {
      // Suggest applying similar improvement to related components
      opportunities.push({
        id: this.generateId(),
        type: 'enhancement',
        target: `related:${imp.component}`,
        description: `Consider applying similar ${imp.changeType} to related components (${imp.component} had ${(imp.impact * 100).toFixed(0)}% impact)`,
        confidence: 0.6,
        estimatedImpact: imp.impact * 0.7, // Slightly lower expected impact
        riskLevel: 'low',
        context: { originalImprovement: imp },
        detectedAt: new Date()
      });
    }

    // Pattern 3: Stalled goals
    const stalledGoals = context.activeGoals
      .filter(g => g.status === 'in_progress' && g.progress < 50);

    for (const goal of stalledGoals) {
      opportunities.push({
        id: this.generateId(),
        type: 'enhancement',
        target: `goal:${goal.description.slice(0, 30)}`,
        description: `Goal "${goal.description}" is stalled at ${goal.progress}% - consider breaking down into smaller tasks`,
        confidence: 0.5,
        estimatedImpact: 0.4,
        riskLevel: 'low',
        context: { goal },
        detectedAt: new Date()
      });
    }

    return opportunities;
  }

  /**
   * Apply an improvement
   */
  private async applyImprovement(opportunity: ImprovementOpportunity): Promise<Improvement> {
    // In real implementation, this would:
    // 1. Generate code changes using LLM
    // 2. Create a feature branch
    // 3. Apply changes
    // 4. Run tests
    // 5. Measure impact
    // For now, we just record the improvement

    const improvement: Improvement = {
      component: opportunity.target,
      changeType: opportunity.type === 'fix' ? 'fix' :
                  opportunity.type === 'optimization' ? 'optimization' :
                  opportunity.type === 'refactor' ? 'refactor' : 'enhancement',
      before: `Opportunity: ${opportunity.description}`,
      after: opportunity.suggestedCode ?? 'Applied automatically',
      impact: opportunity.estimatedImpact,
      automated: true
    };

    await this.memory.storeImprovement(improvement);

    return improvement;
  }

  /**
   * Get pending opportunities for manual review
   */
  getPendingOpportunities(): ImprovementOpportunity[] {
    return [...this.pendingOpportunities];
  }

  /**
   * Approve a pending opportunity
   */
  async approveOpportunity(id: string): Promise<Improvement | null> {
    const index = this.pendingOpportunities.findIndex(o => o.id === id);
    if (index === -1) return null;

    const opportunity = this.pendingOpportunities[index];
    this.pendingOpportunities.splice(index, 1);

    return this.applyImprovement(opportunity);
  }

  /**
   * Reject a pending opportunity
   */
  rejectOpportunity(id: string, reason: string): boolean {
    const index = this.pendingOpportunities.findIndex(o => o.id === id);
    if (index === -1) return false;

    const opportunity = this.pendingOpportunities[index];
    this.pendingOpportunities.splice(index, 1);
    this.emit('improvement:skipped', opportunity, reason);

    return true;
  }

  /**
   * Get evolution metrics
   */
  async getMetrics(): Promise<EvolutionMetrics> {
    const totalImprovements = this.cycles.reduce((sum, c) => sum + c.improvementsApplied, 0);
    const successfulCycles = this.cycles.filter(c => c.errors.length === 0).length;
    const totalImpact = this.cycles.reduce((sum, c) => {
      // Calculate average impact from applied improvements
      return sum + c.improvementsApplied * 0.5; // Assume average 0.5 impact
    }, 0);

    return {
      totalCycles: this.cycles.length,
      totalImprovements,
      averageImpactScore: totalImprovements > 0 ? totalImpact / totalImprovements : 0,
      successRate: this.cycles.length > 0 ? successfulCycles / this.cycles.length : 1,
      lastCycleAt: this.cycles.length > 0 ? this.cycles[this.cycles.length - 1].completedAt ?? null : null,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0
    };
  }

  /**
   * Get status summary
   */
  async getStatus(): Promise<string> {
    const metrics = await this.getMetrics();
    const uptimeHours = (metrics.uptime / 3600000).toFixed(1);

    return `
┌─ EVOLUTION ENGINE STATUS ───────────────────────────────────────┐
│                                                                  │
│  STATUS: ${this.running ? (this.paused ? '⏸ PAUSED' : '🔄 RUNNING') : '⏹ STOPPED'.padEnd(52)} │
│  MODE: ${this.config.dryRun ? 'DRY RUN (simulation)' : 'LIVE'.padEnd(54)} │
│                                                                  │
│  METRICS                                                         │
│  ────────────────────────────────────────────────────────────    │
│  Cycles Completed: ${String(metrics.totalCycles).padEnd(42)} │
│  Total Improvements: ${String(metrics.totalImprovements).padEnd(40)} │
│  Success Rate: ${(metrics.successRate * 100).toFixed(1)}%${' '.repeat(45)} │
│  Avg Impact Score: ${metrics.averageImpactScore.toFixed(2)}${' '.repeat(42)} │
│  Uptime: ${uptimeHours}h${' '.repeat(51)} │
│                                                                  │
│  QUEUE                                                           │
│  Pending Opportunities: ${String(this.pendingOpportunities.length).padEnd(37)} │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

/**
 * Context passed to detectors
 */
export interface DetectorContext {
  recentMemories: Array<{ key: string; value: string; metadata: Record<string, unknown> }>;
  pastImprovements: Improvement[];
  activeGoals: Array<{ description: string; progress: number; status: string }>;
  pendingOpportunities: ImprovementOpportunity[];
  metrics: EvolutionMetrics;
}

// Factory
export function createEvolutionLoop(
  config?: Partial<EvolutionConfig>,
  memoryInstance?: GraphitiMemory
): EvolutionLoop {
  return new EvolutionLoop(config, memoryInstance);
}

// Default singleton
export const evolutionLoop = new EvolutionLoop();
