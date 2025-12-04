/**
 * OPUS 67 v4.0 - Confidence Scorer
 *
 * Quantifies certainty for AI outputs based on skill coverage,
 * anti-hallucination triggers, and task complexity.
 */

import { getSkillMetadataLoader, type DeepSkillMetadata } from './skill-metadata.js';
import { getCapabilityMatrix } from './capability-matrix.js';
import { getSynergyGraph } from './synergy-graph.js';

// =============================================================================
// TYPES
// =============================================================================

export interface ConfidenceFactors {
  skillCoverage: number;      // 0-1: How well do skills cover the task
  capabilityMatch: number;    // 0-1: Do skills have required capabilities
  antiHallucination: number;  // 0-1: Inverse of triggered warnings
  synergyScore: number;       // 0-1: How well do skills work together
  taskClarity: number;        // 0-1: How clear is the task
  complexity: number;         // 0-1: Inverse of complexity
}

export interface ConfidenceResult {
  score: number;              // 0-1 overall confidence
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: ConfidenceFactors;
  warnings: string[];
  recommendations: string[];
  canProceed: boolean;
}

export interface TaskProfile {
  task: string;
  skills: string[];
  detectedCapabilities: string[];
  triggeredWarnings: string[];
  complexity: number;
}

// Confidence thresholds
const THRESHOLDS = {
  proceed: 0.6,      // Minimum to proceed
  warning: 0.4,      // Below this, show warnings
  block: 0.2,        // Below this, block execution
  gradeA: 0.9,
  gradeB: 0.75,
  gradeC: 0.6,
  gradeD: 0.4
};

// Factor weights
const WEIGHTS = {
  skillCoverage: 0.25,
  capabilityMatch: 0.30,
  antiHallucination: 0.20,
  synergyScore: 0.10,
  taskClarity: 0.10,
  complexity: 0.05
};

// =============================================================================
// CONFIDENCE SCORER
// =============================================================================

export class ConfidenceScorer {
  private skillLoader = getSkillMetadataLoader();
  private capabilityMatrix = getCapabilityMatrix();
  private synergyGraph = getSynergyGraph();

  /**
   * Score confidence for a task with given skills
   */
  async score(task: string, skillIds: string[]): Promise<ConfidenceResult> {
    // Build task profile
    const profile = await this.buildTaskProfile(task, skillIds);

    // Calculate individual factors
    const factors = await this.calculateFactors(profile);

    // Calculate weighted score
    const score = this.calculateWeightedScore(factors);

    // Determine grade
    const grade = this.scoreToGrade(score);

    // Generate warnings and recommendations
    const { warnings, recommendations } = this.generateFeedback(factors, profile);

    return {
      score,
      grade,
      factors,
      warnings,
      recommendations,
      canProceed: score >= THRESHOLDS.proceed && profile.triggeredWarnings.length === 0
    };
  }

  /**
   * Build profile for a task
   */
  private async buildTaskProfile(task: string, skillIds: string[]): Promise<TaskProfile> {
    await this.skillLoader.loadAll();

    const taskAnalysis = this.capabilityMatrix.analyzeTask(task);
    const triggeredWarnings: string[] = [];

    // Check anti-hallucination rules for each skill
    for (const skillId of skillIds) {
      const warning = await this.skillLoader.getAntiHallucinationWarning(skillId, task);
      if (warning) {
        triggeredWarnings.push(`[${skillId}] ${warning}`);
      }
    }

    return {
      task,
      skills: skillIds,
      detectedCapabilities: taskAnalysis.requiredCapabilities,
      triggeredWarnings,
      complexity: this.estimateComplexity(task, taskAnalysis.requiredCapabilities)
    };
  }

  /**
   * Calculate confidence factors
   */
  private async calculateFactors(profile: TaskProfile): Promise<ConfidenceFactors> {
    // Skill coverage: Do we have skills for this task?
    const skillCoverage = profile.skills.length > 0
      ? Math.min(1, profile.skills.length / Math.max(1, Math.ceil(profile.detectedCapabilities.length / 3)))
      : 0;

    // Capability match: How well do skills match required capabilities?
    let capabilityMatch = 0;
    if (profile.skills.length > 0 && profile.detectedCapabilities.length > 0) {
      let matchedCount = 0;
      let totalConfidence = 0;

      for (const cap of profile.detectedCapabilities) {
        for (const skillId of profile.skills) {
          const check = await this.capabilityMatrix.canDo(skillId, cap);
          if (check.can) {
            matchedCount++;
            totalConfidence += check.confidence;
            break;
          }
        }
      }

      const matchRatio = matchedCount / profile.detectedCapabilities.length;
      const avgConfidence = matchedCount > 0 ? totalConfidence / matchedCount : 0;
      capabilityMatch = (matchRatio * 0.7) + (avgConfidence * 0.3);
    } else if (profile.detectedCapabilities.length === 0) {
      // Generic task - give moderate score
      capabilityMatch = 0.7;
    }

    // Anti-hallucination: Inverse of triggered warnings
    const warningPenalty = Math.min(1, profile.triggeredWarnings.length * 0.25);
    const antiHallucination = 1 - warningPenalty;

    // Synergy score
    let synergyScore = 1;
    if (profile.skills.length > 1) {
      const synergies = await this.synergyGraph.getCombinationScore(profile.skills);
      synergyScore = synergies.score;
    }

    // Task clarity: Based on task length and specificity
    const taskClarity = this.estimateTaskClarity(profile.task);

    // Complexity: Inverse for confidence (more complex = less confident)
    const complexity = 1 - (profile.complexity * 0.5);

    return {
      skillCoverage,
      capabilityMatch,
      antiHallucination,
      synergyScore,
      taskClarity,
      complexity
    };
  }

  /**
   * Calculate weighted confidence score
   */
  private calculateWeightedScore(factors: ConfidenceFactors): number {
    return (
      factors.skillCoverage * WEIGHTS.skillCoverage +
      factors.capabilityMatch * WEIGHTS.capabilityMatch +
      factors.antiHallucination * WEIGHTS.antiHallucination +
      factors.synergyScore * WEIGHTS.synergyScore +
      factors.taskClarity * WEIGHTS.taskClarity +
      factors.complexity * WEIGHTS.complexity
    );
  }

  /**
   * Convert score to letter grade
   */
  private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= THRESHOLDS.gradeA) return 'A';
    if (score >= THRESHOLDS.gradeB) return 'B';
    if (score >= THRESHOLDS.gradeC) return 'C';
    if (score >= THRESHOLDS.gradeD) return 'D';
    return 'F';
  }

  /**
   * Generate warnings and recommendations
   */
  private generateFeedback(
    factors: ConfidenceFactors,
    profile: TaskProfile
  ): { warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Add triggered anti-hallucination warnings
    warnings.push(...profile.triggeredWarnings);

    // Low skill coverage
    if (factors.skillCoverage < 0.5) {
      warnings.push('Low skill coverage for this task');
      recommendations.push('Consider adding more relevant skills');
    }

    // Low capability match
    if (factors.capabilityMatch < 0.5) {
      warnings.push('Skills may not fully cover required capabilities');
      recommendations.push('Review task requirements against skill capabilities');
    }

    // Synergy issues
    if (factors.synergyScore < 0.5) {
      warnings.push('Potential conflicts between selected skills');
      recommendations.push('Check skill synergies and remove conflicting skills');
    }

    // Task clarity issues
    if (factors.taskClarity < 0.5) {
      recommendations.push('Consider breaking task into smaller, clearer steps');
    }

    // High complexity
    if (factors.complexity < 0.5) {
      recommendations.push('Complex task - consider using BUILD mode with thorough approach');
    }

    return { warnings, recommendations };
  }

  /**
   * Estimate task complexity (0-1, higher = more complex)
   */
  private estimateComplexity(task: string, capabilities: string[]): number {
    let complexity = 0;

    // Length-based complexity
    if (task.length > 500) complexity += 0.3;
    else if (task.length > 200) complexity += 0.15;

    // Capability count
    if (capabilities.length > 5) complexity += 0.3;
    else if (capabilities.length > 2) complexity += 0.15;

    // Keyword-based complexity
    const complexKeywords = [
      'architecture', 'design', 'refactor', 'optimize', 'security',
      'production', 'deploy', 'scale', 'migrate', 'integrate'
    ];
    const taskLower = task.toLowerCase();
    for (const keyword of complexKeywords) {
      if (taskLower.includes(keyword)) {
        complexity += 0.1;
      }
    }

    return Math.min(1, complexity);
  }

  /**
   * Estimate task clarity (0-1, higher = clearer)
   */
  private estimateTaskClarity(task: string): number {
    let clarity = 0.5;

    // Very short tasks are unclear
    if (task.length < 20) {
      clarity -= 0.2;
    }

    // Very long tasks might be unclear
    if (task.length > 500) {
      clarity -= 0.1;
    }

    // Contains specific technical terms = clearer
    const specificTerms = [
      'create', 'add', 'implement', 'fix', 'update', 'remove',
      'component', 'function', 'api', 'endpoint', 'page', 'feature'
    ];
    const taskLower = task.toLowerCase();
    for (const term of specificTerms) {
      if (taskLower.includes(term)) {
        clarity += 0.1;
      }
    }

    // Contains file paths or code = clearer
    if (task.includes('/') || task.includes('.ts') || task.includes('.tsx')) {
      clarity += 0.15;
    }

    return Math.max(0, Math.min(1, clarity));
  }

  /**
   * Quick confidence check (returns just score and canProceed)
   */
  async quickCheck(task: string, skillIds: string[]): Promise<{
    score: number;
    canProceed: boolean;
  }> {
    const result = await this.score(task, skillIds);
    return {
      score: result.score,
      canProceed: result.canProceed
    };
  }

  /**
   * Get confidence factors explanation
   */
  explainFactors(factors: ConfidenceFactors): string[] {
    const explanations: string[] = [];

    explanations.push(`Skill Coverage: ${(factors.skillCoverage * 100).toFixed(0)}% - How well skills cover the task`);
    explanations.push(`Capability Match: ${(factors.capabilityMatch * 100).toFixed(0)}% - Skills have required capabilities`);
    explanations.push(`Anti-Hallucination: ${(factors.antiHallucination * 100).toFixed(0)}% - No triggered warnings`);
    explanations.push(`Synergy Score: ${(factors.synergyScore * 100).toFixed(0)}% - Skills work well together`);
    explanations.push(`Task Clarity: ${(factors.taskClarity * 100).toFixed(0)}% - Task is well-defined`);
    explanations.push(`Complexity Factor: ${(factors.complexity * 100).toFixed(0)}% - Task manageable`);

    return explanations;
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: ConfidenceScorer | null = null;

export function getConfidenceScorer(): ConfidenceScorer {
  if (!instance) {
    instance = new ConfidenceScorer();
  }
  return instance;
}

export function resetConfidenceScorer(): void {
  instance = null;
}
