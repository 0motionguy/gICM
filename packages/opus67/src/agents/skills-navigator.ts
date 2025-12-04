/**
 * OPUS 67 v4.1 - Skills Navigator Agent
 *
 * Finds and activates relevant skills for tasks.
 * Uses semantic search to match tasks to skills.
 */

import { getSkillSearch, type SkillSearchResult } from '../intelligence/skill-search.js';
import { getLearningObserver } from './learning-observer.js';

// =============================================================================
// TYPES
// =============================================================================

export interface SkillCombination {
  id: string;
  name: string;
  skills: string[];
  description: string;
  useCase: string;
  confidence: number;
}

export interface ActivationResult {
  skillId: string;
  name: string;
  score: number;
  activated: boolean;
  reason: string;
}

export interface UsageRecord {
  skillId: string;
  taskType: string;
  timestamp: number;
  success?: boolean;
}

export interface SkillsNavigatorConfig {
  autoActivateThreshold: number;
  maxAutoSkills: number;
  trackUsage: boolean;
  suggestCombinations: boolean;
  vectorEnabled: boolean;
  topK: number;
  minScore: number;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: SkillsNavigatorConfig = {
  autoActivateThreshold: 0.7,
  maxAutoSkills: 3,
  trackUsage: true,
  suggestCombinations: true,
  vectorEnabled: true,
  topK: 5,
  minScore: 0.3
};

// =============================================================================
// PREDEFINED SKILL COMBINATIONS
// =============================================================================

const SKILL_COMBINATIONS: SkillCombination[] = [
  {
    id: 'solana-dapp',
    name: 'Solana DApp Stack',
    skills: ['solana-anchor-expert', 'nextjs-14-expert', 'wallet-integration'],
    description: 'Full Solana dApp development',
    useCase: 'Build decentralized applications on Solana',
    confidence: 0.9
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot Stack',
    skills: ['ai-native-stack', 'nextjs-14-expert', 'api-integration'],
    description: 'AI-powered chatbot with streaming',
    useCase: 'Build conversational AI applications',
    confidence: 0.9
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter Stack',
    skills: ['fullstack-blueprint-stack', 'supabase-expert', 'stripe-payments'],
    description: 'Full SaaS application with payments',
    useCase: 'Build subscription-based web apps',
    confidence: 0.85
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline Stack',
    skills: ['sql-database', 'api-integration', 'typescript-senior'],
    description: 'ETL and data processing',
    useCase: 'Build data ingestion and transformation pipelines',
    confidence: 0.8
  },
  {
    id: 'defi-trading',
    name: 'DeFi Trading Stack',
    skills: ['bonding-curve-master', 'defi-data-analyst', 'solana-anchor-expert'],
    description: 'DeFi trading and analytics',
    useCase: 'Build trading bots and analytics dashboards',
    confidence: 0.85
  },
  {
    id: 'nft-marketplace',
    name: 'NFT Marketplace Stack',
    skills: ['metaplex-core', 'nextjs-14-expert', 'wallet-integration'],
    description: 'NFT minting and marketplace',
    useCase: 'Build NFT collections and marketplaces',
    confidence: 0.85
  }
];

// =============================================================================
// SKILLS NAVIGATOR AGENT
// =============================================================================

export class SkillsNavigatorAgent {
  private config: SkillsNavigatorConfig;
  private usageHistory: UsageRecord[] = [];
  private activatedSkills: Set<string> = new Set();
  private skillUsageStats: Map<string, { uses: number; successes: number }> = new Map();

  constructor(config: Partial<SkillsNavigatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Find skills matching a task query
   */
  async findSkillsForTask(query: string, topK?: number): Promise<SkillSearchResult[]> {
    const search = getSkillSearch();
    const k = topK || this.config.topK;

    try {
      const results = await search.searchSkills(query, k);

      // Filter by minimum score
      return results.filter(r => r.score >= this.config.minScore);
    } catch (error) {
      console.error('[SkillsNavigator] Search failed:', error);
      return [];
    }
  }

  /**
   * Auto-activate skills for a task
   */
  async autoActivate(task: string): Promise<ActivationResult[]> {
    const results = await this.findSkillsForTask(task, this.config.maxAutoSkills * 2);
    const activations: ActivationResult[] = [];

    let activated = 0;
    for (const result of results) {
      const shouldActivate =
        result.score >= this.config.autoActivateThreshold &&
        activated < this.config.maxAutoSkills &&
        !this.activatedSkills.has(result.skillId);

      activations.push({
        skillId: result.skillId,
        name: result.name,
        score: result.score,
        activated: shouldActivate,
        reason: shouldActivate
          ? `Score ${(result.score * 100).toFixed(0)}% >= threshold`
          : result.score < this.config.autoActivateThreshold
            ? `Score ${(result.score * 100).toFixed(0)}% < threshold`
            : this.activatedSkills.has(result.skillId)
              ? 'Already activated'
              : `Max skills (${this.config.maxAutoSkills}) reached`
      });

      if (shouldActivate) {
        this.activatedSkills.add(result.skillId);
        activated++;

        // Track usage
        if (this.config.trackUsage) {
          this.recordUsage(result.skillId, this.classifyTask(task));
        }
      }
    }

    return activations;
  }

  /**
   * Suggest skill combinations for complex tasks
   */
  async suggestCombinations(skillIds: string[]): Promise<SkillCombination[]> {
    if (!this.config.suggestCombinations) {
      return [];
    }

    const suggestions: SkillCombination[] = [];
    const skillSet = new Set(skillIds);

    // Find combinations that match current skills
    for (const combo of SKILL_COMBINATIONS) {
      const matchCount = combo.skills.filter(s => skillSet.has(s)).length;
      const coverage = matchCount / combo.skills.length;

      if (coverage >= 0.3) {
        suggestions.push({
          ...combo,
          confidence: coverage * combo.confidence
        });
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions.slice(0, 3);
  }

  /**
   * Get recommended skills based on usage patterns
   */
  async getRecommendations(taskType?: string): Promise<SkillSearchResult[]> {
    // Get most successful skills
    const sortedSkills = Array.from(this.skillUsageStats.entries())
      .map(([skillId, stats]) => ({
        skillId,
        successRate: stats.successes / stats.uses,
        uses: stats.uses
      }))
      .filter(s => s.uses >= 3)  // Minimum uses for recommendation
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    // Convert to search results
    const search = getSkillSearch();
    const recommendations: SkillSearchResult[] = [];

    for (const skill of sortedSkills) {
      const result = await search.getSkillById(skill.skillId);
      if (result) {
        recommendations.push({
          ...result,
          score: skill.successRate
        });
      }
    }

    return recommendations;
  }

  /**
   * Classify a task into a category
   */
  private classifyTask(task: string): string {
    const lower = task.toLowerCase();

    if (lower.includes('solana') || lower.includes('anchor') || lower.includes('blockchain')) {
      return 'blockchain';
    }
    if (lower.includes('api') || lower.includes('backend') || lower.includes('server')) {
      return 'backend';
    }
    if (lower.includes('react') || lower.includes('next') || lower.includes('frontend') || lower.includes('ui')) {
      return 'frontend';
    }
    if (lower.includes('database') || lower.includes('sql') || lower.includes('data')) {
      return 'data';
    }
    if (lower.includes('ai') || lower.includes('llm') || lower.includes('chat') || lower.includes('agent')) {
      return 'ai';
    }
    if (lower.includes('test') || lower.includes('e2e') || lower.includes('unit')) {
      return 'testing';
    }
    if (lower.includes('deploy') || lower.includes('devops') || lower.includes('ci')) {
      return 'devops';
    }

    return 'general';
  }

  /**
   * Record skill usage
   */
  private recordUsage(skillId: string, taskType: string): void {
    this.usageHistory.push({
      skillId,
      taskType,
      timestamp: Date.now()
    });

    // Trim history to last 1000 records
    if (this.usageHistory.length > 1000) {
      this.usageHistory = this.usageHistory.slice(-1000);
    }
  }

  /**
   * Mark a skill usage as successful or failed
   */
  markUsageResult(skillId: string, success: boolean): void {
    const stats = this.skillUsageStats.get(skillId) || { uses: 0, successes: 0 };
    stats.uses++;
    if (success) {
      stats.successes++;
    }
    this.skillUsageStats.set(skillId, stats);

    // Also notify learning observer
    const observer = getLearningObserver();
    if (success) {
      observer.recordSuccess(skillId);
    }
  }

  /**
   * Get currently activated skills
   */
  getActivatedSkills(): string[] {
    return Array.from(this.activatedSkills);
  }

  /**
   * Deactivate a skill
   */
  deactivateSkill(skillId: string): boolean {
    return this.activatedSkills.delete(skillId);
  }

  /**
   * Clear all activated skills
   */
  clearActivatedSkills(): void {
    this.activatedSkills.clear();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalUsages: number;
    uniqueSkills: number;
    topSkills: Array<{ skillId: string; uses: number; successRate: number }>;
    taskTypeDistribution: Record<string, number>;
  } {
    // Count task types
    const taskTypes: Record<string, number> = {};
    for (const record of this.usageHistory) {
      taskTypes[record.taskType] = (taskTypes[record.taskType] || 0) + 1;
    }

    // Get top skills
    const topSkills = Array.from(this.skillUsageStats.entries())
      .map(([skillId, stats]) => ({
        skillId,
        uses: stats.uses,
        successRate: stats.uses > 0 ? stats.successes / stats.uses : 0
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 10);

    return {
      totalUsages: this.usageHistory.length,
      uniqueSkills: new Set(this.usageHistory.map(r => r.skillId)).size,
      topSkills,
      taskTypeDistribution: taskTypes
    };
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    activatedSkills: number;
    usageHistory: number;
    trackedSkills: number;
    config: SkillsNavigatorConfig;
  } {
    return {
      activatedSkills: this.activatedSkills.size,
      usageHistory: this.usageHistory.length,
      trackedSkills: this.skillUsageStats.size,
      config: this.config
    };
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: SkillsNavigatorAgent | null = null;

export function getSkillsNavigator(): SkillsNavigatorAgent {
  if (!instance) {
    instance = new SkillsNavigatorAgent();
  }
  return instance;
}

export function resetSkillsNavigator(): void {
  instance = null;
}
