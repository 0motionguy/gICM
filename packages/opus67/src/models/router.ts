/**
 * OPUS 67 Multi-Model Router
 * Intelligent routing to Gemini (FREE), DeepSeek (CHEAP), Claude (QUALITY)
 */

import { EventEmitter } from 'eventemitter3';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tokenTracker, type ModelName, type TokenUsage } from '../benchmark/token-tracker.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types
export type ModelTier = 'free' | 'cheap' | 'quality';
export type TaskType =
  | 'scan' | 'analyze' | 'monitor' | 'index'      // FREE tier
  | 'generate' | 'build' | 'refactor' | 'code'    // CHEAP tier
  | 'review' | 'synthesize' | 'chairman' | 'audit' | 'reason'; // QUALITY tier

export interface RoutingRule {
  taskTypes: TaskType[];
  model: ModelName;
  tier: ModelTier;
  fallback?: ModelName;
}

export interface RoutingConfig {
  rules: RoutingRule[];
  defaultModel: ModelName;
  fallbackChain: ModelName[];
}

export interface RouteRequest {
  taskType: TaskType;
  prompt: string;
  preferredTier?: ModelTier;
  maxCost?: number;
  requiresReasoning?: boolean;
  agentId?: string;
  agentType?: string;
}

export interface RouteResult {
  model: ModelName;
  tier: ModelTier;
  estimatedCost: number;
  reason: string;
}

export interface ModelResponse {
  content: string;
  model: ModelName;
  usage: TokenUsage;
  cost: number;
  latency: number;
}

interface RouterEvents {
  'route:selected': (request: RouteRequest, result: RouteResult) => void;
  'route:fallback': (from: ModelName, to: ModelName, reason: string) => void;
  'response:received': (response: ModelResponse) => void;
}

// Default routing configuration
const DEFAULT_CONFIG: RoutingConfig = {
  rules: [
    // FREE tier - Gemini
    {
      taskTypes: ['scan', 'analyze', 'monitor', 'index'],
      model: 'gemini-2.0-flash',
      tier: 'free',
      fallback: 'deepseek-chat'
    },
    // CHEAP tier - DeepSeek
    {
      taskTypes: ['generate', 'build', 'refactor', 'code'],
      model: 'deepseek-chat',
      tier: 'cheap',
      fallback: 'claude-haiku-3.5'
    },
    // QUALITY tier - Claude
    {
      taskTypes: ['review', 'synthesize', 'chairman', 'audit', 'reason'],
      model: 'claude-sonnet-4',
      tier: 'quality',
      fallback: 'claude-opus-4'
    }
  ],
  defaultModel: 'deepseek-chat',
  fallbackChain: ['gemini-2.0-flash', 'deepseek-chat', 'claude-haiku-3.5', 'claude-sonnet-4']
};

/**
 * MultiModelRouter - Intelligent model selection
 */
export class MultiModelRouter extends EventEmitter<RouterEvents> {
  private config: RoutingConfig;
  private modelHealth: Map<ModelName, { healthy: boolean; lastError?: Date; errorCount: number }> = new Map();

  constructor(configPath?: string) {
    super();
    this.config = this.loadConfig(configPath);
    this.initHealthTracking();
  }

  /**
   * Load routing configuration
   */
  private loadConfig(configPath?: string): RoutingConfig {
    if (configPath && existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        const parsed = parse(content);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        console.warn('Failed to load routing config, using defaults');
      }
    }

    // Try default location
    const defaultPath = join(__dirname, '..', '..', 'config', 'models.yaml');
    if (existsSync(defaultPath)) {
      try {
        const content = readFileSync(defaultPath, 'utf-8');
        const parsed = parse(content);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        // Use defaults
      }
    }

    return DEFAULT_CONFIG;
  }

  /**
   * Initialize health tracking for all models
   */
  private initHealthTracking(): void {
    const models: ModelName[] = [
      'gemini-2.0-flash', 'gemini-2.0-flash-thinking', 'gemini-1.5-flash', 'gemini-1.5-pro',
      'deepseek-chat', 'deepseek-coder', 'deepseek-reasoner',
      'claude-sonnet-4', 'claude-opus-4', 'claude-haiku-3.5',
      'gpt-4o', 'gpt-4o-mini'
    ];

    for (const model of models) {
      this.modelHealth.set(model, { healthy: true, errorCount: 0 });
    }
  }

  /**
   * Route a request to the best model
   */
  route(request: RouteRequest): RouteResult {
    // Find matching rule
    const rule = this.config.rules.find(r => r.taskTypes.includes(request.taskType));

    if (!rule) {
      return {
        model: this.config.defaultModel,
        tier: 'cheap',
        estimatedCost: this.estimateCost(this.config.defaultModel, request.prompt),
        reason: 'no matching rule, using default'
      };
    }

    // Check model health
    const health = this.modelHealth.get(rule.model);
    let selectedModel = rule.model;
    let reason = `task type: ${request.taskType}`;

    if (health && !health.healthy) {
      // Use fallback
      if (rule.fallback) {
        selectedModel = rule.fallback;
        reason = `${rule.model} unhealthy, using fallback`;
        this.emit('route:fallback', rule.model, rule.fallback, 'model unhealthy');
      }
    }

    // Check cost constraint
    if (request.maxCost !== undefined) {
      const estimatedCost = this.estimateCost(selectedModel, request.prompt);
      if (estimatedCost > request.maxCost) {
        // Find cheaper model
        const cheaper = this.findCheaperModel(request.prompt, request.maxCost);
        if (cheaper) {
          selectedModel = cheaper;
          reason = `cost constrained to $${request.maxCost}`;
        }
      }
    }

    // Check tier preference
    if (request.preferredTier) {
      const tierModel = this.getModelForTier(request.preferredTier);
      if (tierModel) {
        selectedModel = tierModel;
        reason = `preferred tier: ${request.preferredTier}`;
      }
    }

    // Upgrade to reasoning model if needed
    if (request.requiresReasoning) {
      if (selectedModel === 'gemini-2.0-flash') {
        selectedModel = 'gemini-2.0-flash-thinking';
        reason = 'upgraded for reasoning';
      } else if (selectedModel === 'deepseek-chat') {
        selectedModel = 'deepseek-reasoner';
        reason = 'upgraded for reasoning';
      }
    }

    const result: RouteResult = {
      model: selectedModel,
      tier: this.getTier(selectedModel),
      estimatedCost: this.estimateCost(selectedModel, request.prompt),
      reason
    };

    this.emit('route:selected', request, result);
    return result;
  }

  /**
   * Estimate cost for a model and prompt
   */
  estimateCost(model: ModelName, prompt: string): number {
    // Rough token estimation (4 chars per token)
    const inputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = inputTokens * 1.5; // Assume 1.5x output

    return tokenTracker.calculateCost(model, {
      input: inputTokens,
      output: estimatedOutputTokens
    });
  }

  /**
   * Find a model that fits within cost constraint
   */
  private findCheaperModel(prompt: string, maxCost: number): ModelName | null {
    for (const model of this.config.fallbackChain) {
      const cost = this.estimateCost(model, prompt);
      if (cost <= maxCost) {
        return model;
      }
    }
    return null;
  }

  /**
   * Get model for a specific tier
   */
  private getModelForTier(tier: ModelTier): ModelName | null {
    const rule = this.config.rules.find(r => r.tier === tier);
    return rule?.model || null;
  }

  /**
   * Get tier for a model
   */
  getTier(model: ModelName): ModelTier {
    if (model.startsWith('gemini')) return 'free';
    if (model.startsWith('deepseek')) return 'cheap';
    return 'quality';
  }

  /**
   * Mark model as healthy/unhealthy
   */
  setModelHealth(model: ModelName, healthy: boolean): void {
    const current = this.modelHealth.get(model) || { healthy: true, errorCount: 0 };

    if (!healthy) {
      current.errorCount++;
      current.lastError = new Date();
      current.healthy = current.errorCount < 3; // Mark unhealthy after 3 errors
    } else {
      current.healthy = true;
      current.errorCount = 0;
    }

    this.modelHealth.set(model, current);
  }

  /**
   * Get model health status
   */
  getModelHealth(): Map<ModelName, { healthy: boolean; lastError?: Date; errorCount: number }> {
    return new Map(this.modelHealth);
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(): { byTier: Record<ModelTier, number>; byModel: Record<string, number> } {
    const summary = tokenTracker.getSummary();

    const byTier: Record<ModelTier, number> = { free: 0, cheap: 0, quality: 0 };
    const byModel: Record<string, number> = {};

    for (const [model, data] of summary.byModel) {
      byModel[model] = data.cost;
      const tier = this.getTier(model);
      byTier[tier] += data.cost;
    }

    return { byTier, byModel };
  }

  /**
   * Get optimal model recommendation
   */
  recommend(prompt: string, context?: {
    complexity?: 'low' | 'medium' | 'high';
    quality?: 'draft' | 'production' | 'critical';
    budget?: number;
  }): RouteResult {
    // Determine task type from prompt
    const promptLower = prompt.toLowerCase();
    let taskType: TaskType = 'generate';

    if (promptLower.includes('scan') || promptLower.includes('search') || promptLower.includes('find')) {
      taskType = 'scan';
    } else if (promptLower.includes('analyze') || promptLower.includes('check')) {
      taskType = 'analyze';
    } else if (promptLower.includes('review') || promptLower.includes('audit')) {
      taskType = 'review';
    } else if (promptLower.includes('build') || promptLower.includes('create') || promptLower.includes('implement')) {
      taskType = 'build';
    } else if (promptLower.includes('refactor') || promptLower.includes('improve')) {
      taskType = 'refactor';
    } else if (promptLower.includes('synthesize') || promptLower.includes('summarize')) {
      taskType = 'synthesize';
    }

    // Apply context adjustments
    let preferredTier: ModelTier | undefined;

    if (context?.quality === 'critical' || context?.complexity === 'high') {
      preferredTier = 'quality';
    } else if (context?.quality === 'draft' || context?.complexity === 'low') {
      preferredTier = 'free';
    }

    return this.route({
      taskType,
      prompt,
      preferredTier,
      maxCost: context?.budget,
      requiresReasoning: context?.complexity === 'high'
    });
  }

  /**
   * Format router status
   */
  formatStatus(): string {
    const stats = this.getRoutingStats();
    const health = this.getModelHealth();

    let output = `
┌─ MULTI-MODEL ROUTER STATUS ─────────────────────────────────────┐
│                                                                  │
│  COST BY TIER                                                    │
│  ────────────────────────────────────────────────────────────    │
│  FREE (Gemini):    $${stats.byTier.free.toFixed(4).padEnd(12)}                         │
│  CHEAP (DeepSeek): $${stats.byTier.cheap.toFixed(4).padEnd(12)}                         │
│  QUALITY (Claude): $${stats.byTier.quality.toFixed(4).padEnd(12)}                         │
│                                                                  │
│  MODEL HEALTH                                                    │
│  ────────────────────────────────────────────────────────────    │`;

    for (const [model, status] of health) {
      const icon = status.healthy ? '✓' : '✗';
      const errors = status.errorCount > 0 ? ` (${status.errorCount} errors)` : '';
      output += `
│  ${icon} ${model.padEnd(25)} ${status.healthy ? 'healthy' : 'unhealthy'}${errors.padEnd(15)} │`;
    }

    output += `
│                                                                  │
│  ROUTING RULES                                                   │
│  ────────────────────────────────────────────────────────────    │
│  scan/analyze/monitor → Gemini (FREE)                            │
│  generate/build/code  → DeepSeek ($0.14/M)                       │
│  review/synthesize    → Claude ($3/M)                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;

    return output;
  }
}

// Export singleton
export const router = new MultiModelRouter();

// Convenience function
export function routeToModel(taskType: TaskType, prompt: string): RouteResult {
  return router.route({ taskType, prompt });
}
