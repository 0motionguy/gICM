/**
 * OPUS 67 Pattern Detector
 * Identifies improvement opportunities from code and behavior patterns
 */

import type { DetectorContext, ImprovementOpportunity } from './evolution-loop.js';

// Pattern types
export type PatternType =
  | 'duplication'
  | 'performance'
  | 'error'
  | 'complexity'
  | 'dependency'
  | 'security'
  | 'style';

export interface DetectedPattern {
  type: PatternType;
  description: string;
  locations: string[];
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  suggestedFix?: string;
  metadata: Record<string, unknown>;
}

export interface PatternDetectorConfig {
  enabledPatterns: PatternType[];
  minConfidence: number;
  maxPatterns: number;
}

const DEFAULT_CONFIG: PatternDetectorConfig = {
  enabledPatterns: ['duplication', 'performance', 'error', 'complexity'],
  minConfidence: 0.5,
  maxPatterns: 10
};

/**
 * PatternDetector - Identifies improvement patterns
 */
export class PatternDetector {
  private config: PatternDetectorConfig;
  private patternHandlers: Map<PatternType, PatternHandler>;

  constructor(config?: Partial<PatternDetectorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.patternHandlers = new Map();

    // Register built-in handlers
    this.registerHandler('duplication', detectDuplication);
    this.registerHandler('performance', detectPerformance);
    this.registerHandler('error', detectErrors);
    this.registerHandler('complexity', detectComplexity);
    this.registerHandler('dependency', detectDependencies);
    this.registerHandler('security', detectSecurity);
  }

  /**
   * Register a pattern handler
   */
  registerHandler(type: PatternType, handler: PatternHandler): void {
    this.patternHandlers.set(type, handler);
  }

  /**
   * Detect patterns from context
   */
  async detect(context: DetectorContext): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    for (const patternType of this.config.enabledPatterns) {
      const handler = this.patternHandlers.get(patternType);
      if (!handler) continue;

      try {
        const detected = await handler(context);
        patterns.push(...detected.filter(p => p.confidence >= this.config.minConfidence));
      } catch (error) {
        console.warn(`[PatternDetector] Error in ${patternType} handler:`, error);
      }
    }

    // Sort by severity and confidence
    patterns.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.confidence - a.confidence;
    });

    return patterns.slice(0, this.config.maxPatterns);
  }

  /**
   * Convert patterns to improvement opportunities
   */
  patternsToOpportunities(patterns: DetectedPattern[]): ImprovementOpportunity[] {
    return patterns.map(pattern => ({
      id: `opp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: patternTypeToOpportunityType(pattern.type),
      target: pattern.locations[0] ?? 'unknown',
      description: pattern.description,
      confidence: pattern.confidence,
      estimatedImpact: severityToImpact(pattern.severity),
      riskLevel: pattern.severity === 'high' ? 'medium' : 'low',
      suggestedCode: pattern.suggestedFix,
      context: pattern.metadata,
      detectedAt: new Date()
    }));
  }

  /**
   * Create detector function for evolution loop
   */
  createDetector(): (context: DetectorContext) => Promise<ImprovementOpportunity[]> {
    return async (context: DetectorContext) => {
      const patterns = await this.detect(context);
      return this.patternsToOpportunities(patterns);
    };
  }
}

// Pattern handler type
type PatternHandler = (context: DetectorContext) => Promise<DetectedPattern[]>;

/**
 * Detect code duplication patterns
 */
async function detectDuplication(context: DetectorContext): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Analyze memory for duplicate patterns
  const memories = context.recentMemories;
  const valueFrequency = new Map<string, string[]>();

  for (const mem of memories) {
    // Simple similarity check (in real impl, would use embedding similarity)
    const normalized = mem.value.toLowerCase().trim();
    const existing = Array.from(valueFrequency.entries())
      .find(([key]) => similarity(key, normalized) > 0.8);

    if (existing) {
      existing[1].push(mem.key);
    } else {
      valueFrequency.set(normalized, [mem.key]);
    }
  }

  // Find duplicates
  for (const [value, keys] of valueFrequency) {
    if (keys.length >= 2) {
      patterns.push({
        type: 'duplication',
        description: `Similar content found in ${keys.length} locations: ${keys.join(', ')}`,
        locations: keys,
        severity: keys.length >= 4 ? 'high' : keys.length >= 3 ? 'medium' : 'low',
        confidence: 0.7,
        suggestedFix: 'Consider extracting common functionality into a shared utility',
        metadata: { duplicateCount: keys.length, sample: value.slice(0, 100) }
      });
    }
  }

  return patterns;
}

/**
 * Detect performance issues
 */
async function detectPerformance(context: DetectorContext): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Look for slow operation patterns in memory
  const slowOps = context.recentMemories.filter(m => {
    const value = m.value.toLowerCase();
    return value.includes('slow') ||
           value.includes('timeout') ||
           value.includes('latency') ||
           value.includes('performance');
  });

  if (slowOps.length >= 2) {
    patterns.push({
      type: 'performance',
      description: `${slowOps.length} performance-related issues detected recently`,
      locations: slowOps.map(m => m.key),
      severity: slowOps.length >= 5 ? 'high' : 'medium',
      confidence: 0.6,
      suggestedFix: 'Consider profiling these operations and implementing caching or optimization',
      metadata: { issueCount: slowOps.length }
    });
  }

  // Check for missing caching patterns
  const cacheRelated = context.pastImprovements.filter(i =>
    i.changeType === 'optimization' && i.after.toLowerCase().includes('cache')
  );

  if (cacheRelated.length === 0 && context.recentMemories.length > 20) {
    patterns.push({
      type: 'performance',
      description: 'No caching improvements detected - consider adding caching layer',
      locations: ['system-wide'],
      severity: 'low',
      confidence: 0.5,
      suggestedFix: 'Implement caching for frequently accessed data',
      metadata: { memoryCount: context.recentMemories.length }
    });
  }

  return patterns;
}

/**
 * Detect error patterns
 */
async function detectErrors(context: DetectorContext): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Group failures by component
  const failuresByComponent = new Map<string, number>();

  for (const mem of context.recentMemories) {
    if (mem.metadata?.episodeType === 'failure' ||
        mem.value.toLowerCase().includes('error') ||
        mem.value.toLowerCase().includes('failed')) {
      const component = String(mem.metadata?.component ?? mem.key.split(':')[0] ?? 'unknown');
      failuresByComponent.set(component, (failuresByComponent.get(component) ?? 0) + 1);
    }
  }

  for (const [component, count] of failuresByComponent) {
    if (count >= 2) {
      patterns.push({
        type: 'error',
        description: `Component "${component}" has ${count} errors - investigate root cause`,
        locations: [component],
        severity: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low',
        confidence: 0.8,
        suggestedFix: `Add error handling and logging to ${component}`,
        metadata: { errorCount: count }
      });
    }
  }

  return patterns;
}

/**
 * Detect complexity issues
 */
async function detectComplexity(context: DetectorContext): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Check for stalled goals (indicates complexity)
  const stalledGoals = context.activeGoals.filter(g =>
    g.status === 'in_progress' && g.progress < 30
  );

  for (const goal of stalledGoals) {
    patterns.push({
      type: 'complexity',
      description: `Goal "${goal.description}" is stalled at ${goal.progress}% - may be too complex`,
      locations: [`goal:${goal.description.slice(0, 30)}`],
      severity: goal.progress < 10 ? 'medium' : 'low',
      confidence: 0.6,
      suggestedFix: 'Break down into smaller, achievable milestones',
      metadata: { progress: goal.progress, status: goal.status }
    });
  }

  return patterns;
}

/**
 * Detect dependency issues
 */
async function detectDependencies(context: DetectorContext): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Look for dependency-related issues in memory
  const depIssues = context.recentMemories.filter(m => {
    const value = m.value.toLowerCase();
    return value.includes('dependency') ||
           value.includes('import') ||
           value.includes('circular') ||
           value.includes('version');
  });

  if (depIssues.length >= 2) {
    patterns.push({
      type: 'dependency',
      description: `${depIssues.length} dependency-related issues detected`,
      locations: depIssues.map(m => m.key),
      severity: 'medium',
      confidence: 0.5,
      suggestedFix: 'Review and update dependencies, check for circular imports',
      metadata: { issueCount: depIssues.length }
    });
  }

  return patterns;
}

/**
 * Detect security issues
 */
async function detectSecurity(context: DetectorContext): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Look for security-related patterns
  const securityPatterns = ['secret', 'password', 'key', 'token', 'credential', 'auth'];

  const securityMentions = context.recentMemories.filter(m => {
    const value = m.value.toLowerCase();
    return securityPatterns.some(p => value.includes(p));
  });

  if (securityMentions.length > 0) {
    patterns.push({
      type: 'security',
      description: `${securityMentions.length} security-related items detected - ensure proper handling`,
      locations: securityMentions.map(m => m.key),
      severity: 'high',
      confidence: 0.7,
      suggestedFix: 'Review security practices: use env vars, never commit secrets, implement proper auth',
      metadata: { mentionCount: securityMentions.length }
    });
  }

  return patterns;
}

// Utility functions
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 10 || b.length < 10) return 0;

  // Simple word overlap similarity
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

function patternTypeToOpportunityType(type: PatternType): 'refactor' | 'optimization' | 'fix' | 'enhancement' {
  switch (type) {
    case 'duplication': return 'refactor';
    case 'performance': return 'optimization';
    case 'error': return 'fix';
    case 'security': return 'fix';
    case 'complexity': return 'refactor';
    case 'dependency': return 'fix';
    case 'style': return 'refactor';
    default: return 'enhancement';
  }
}

function severityToImpact(severity: 'low' | 'medium' | 'high'): number {
  switch (severity) {
    case 'high': return 0.8;
    case 'medium': return 0.5;
    case 'low': return 0.3;
  }
}

// Factory
export function createPatternDetector(config?: Partial<PatternDetectorConfig>): PatternDetector {
  return new PatternDetector(config);
}

// Default singleton
export const patternDetector = new PatternDetector();
