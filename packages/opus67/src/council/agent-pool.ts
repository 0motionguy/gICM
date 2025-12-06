/**
 * OPUS 67 Agent Pool
 * Manages the pool of 107 specialized agents
 */

import { EventEmitter } from 'eventemitter3';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import {
  AgentDefinition,
  AgentInstance,
  AgentRole,
  AgentStatus,
  TaskDefinition,
  CouncilSystemConfig,
  DEFAULT_COUNCIL_CONFIG,
} from './types.js';

// =============================================================================
// TYPES
// =============================================================================

interface AgentPoolEvents {
  'agent:registered': (agent: AgentDefinition) => void;
  'agent:activated': (agent: AgentInstance) => void;
  'agent:deactivated': (agent: AgentInstance) => void;
  'agent:busy': (agent: AgentInstance, taskId: string) => void;
  'agent:available': (agent: AgentInstance) => void;
  'pool:ready': (count: number) => void;
  'error': (error: Error) => void;
}

interface AgentMatch {
  agent: AgentInstance;
  score: number;
  reasons: string[];
}

// =============================================================================
// AGENT POOL
// =============================================================================

export class AgentPool extends EventEmitter<AgentPoolEvents> {
  private config: CouncilSystemConfig['agentPool'];
  private definitions: Map<string, AgentDefinition> = new Map();
  private instances: Map<string, AgentInstance> = new Map();
  private agentsPath: string;
  private cooldowns: Map<string, number> = new Map();

  constructor(agentsPath: string, config?: Partial<CouncilSystemConfig['agentPool']>) {
    super();
    this.agentsPath = agentsPath;
    this.config = { ...DEFAULT_COUNCIL_CONFIG.agentPool, ...config };
  }

  /**
   * Initialize the agent pool from agent definition files
   */
  async initialize(): Promise<number> {
    if (!existsSync(this.agentsPath)) {
      console.warn(`[AgentPool] Agents path not found: ${this.agentsPath}`);
      return 0;
    }

    const files = readdirSync(this.agentsPath).filter(f => f.endsWith('.md'));
    let loaded = 0;

    for (const file of files) {
      try {
        const definition = await this.parseAgentFile(join(this.agentsPath, file));
        if (definition) {
          this.registerAgent(definition);
          loaded++;
        }
      } catch (error) {
        console.error(`[AgentPool] Failed to parse ${file}:`, error);
      }
    }

    this.emit('pool:ready', loaded);
    console.log(`[AgentPool] Initialized with ${loaded} agents`);

    return loaded;
  }

  /**
   * Parse an agent markdown file into a definition
   */
  private async parseAgentFile(filePath: string): Promise<AgentDefinition | null> {
    const content = readFileSync(filePath, 'utf-8');
    const id = basename(filePath, '.md');

    // Parse frontmatter-style metadata or extract from content
    const nameMatch = content.match(/^#\s+(.+)/m);
    const descMatch = content.match(/(?:Description|About):\s*(.+)/i)
      || content.match(/^(?!#).+$/m);

    // Extract capabilities from content
    const capabilities: string[] = [];
    const capMatch = content.match(/(?:Capabilities|Features|Skills):\n((?:[-*]\s*.+\n?)+)/i);
    if (capMatch) {
      const lines = capMatch[1].split('\n');
      for (const line of lines) {
        const cap = line.replace(/^[-*]\s*/, '').trim();
        if (cap) capabilities.push(cap);
      }
    }

    // Extract triggers/keywords
    const keywords: string[] = [];
    const keywordMatch = content.match(/(?:Keywords|Triggers|Tags):\s*(.+)/i);
    if (keywordMatch) {
      keywords.push(...keywordMatch[1].split(/[,;]/).map(k => k.trim()));
    }

    // Infer role from name/content
    const role = this.inferRole(id, content);

    return {
      id,
      name: nameMatch?.[1] || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: descMatch?.[1]?.trim() || `Specialized agent: ${id}`,
      role,
      capabilities: capabilities.length > 0 ? capabilities : ['general'],
      triggers: {
        keywords: keywords.length > 0 ? keywords : [id],
        filePatterns: [],
        taskTypes: [],
      },
      constraints: {
        maxConcurrent: 1,
        cooldownMs: this.config.defaultCooldownMs,
        tokenBudget: 50000,
        requiresApproval: false,
      },
      performance: {
        successRate: 0.8,  // Default
        avgDurationMs: 5000,
        usageCount: 0,
      },
    };
  }

  /**
   * Infer agent role from ID and content
   */
  private inferRole(id: string, content: string): AgentRole {
    const lower = id.toLowerCase() + ' ' + content.toLowerCase();

    if (lower.includes('review') || lower.includes('audit')) return 'reviewer';
    if (lower.includes('architect') || lower.includes('design')) return 'architect';
    if (lower.includes('coordinator') || lower.includes('orchestrat')) return 'coordinator';
    if (lower.includes('execut') || lower.includes('implement')) return 'executor';
    if (lower.includes('specialist') || lower.includes('expert')) return 'specialist';

    return 'generalist';
  }

  /**
   * Register an agent definition
   */
  registerAgent(definition: AgentDefinition): void {
    this.definitions.set(definition.id, definition);

    // Create instance
    const instance: AgentInstance = {
      definition,
      status: 'available',
      sessionStats: {
        tasksCompleted: 0,
        tasksFailed: 0,
        tokensUsed: 0,
      },
    };

    this.instances.set(definition.id, instance);
    this.emit('agent:registered', definition);
  }

  /**
   * Get an agent by ID
   */
  getAgent(id: string): AgentInstance | undefined {
    return this.instances.get(id);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): AgentInstance[] {
    return this.getAllAgents().filter(a => a.status === 'available');
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: AgentRole): AgentInstance[] {
    return this.getAllAgents().filter(a => a.definition.role === role);
  }

  /**
   * Find best matching agents for a task
   */
  findAgentsForTask(task: TaskDefinition, limit: number = 5): AgentMatch[] {
    const matches: AgentMatch[] = [];
    const taskLower = task.description.toLowerCase();
    const taskType = task.type.toLowerCase();

    for (const agent of this.getAvailableAgents()) {
      let score = 0;
      const reasons: string[] = [];

      // Check keyword triggers
      for (const keyword of agent.definition.triggers.keywords || []) {
        if (taskLower.includes(keyword.toLowerCase())) {
          score += 0.3;
          reasons.push(`Keyword match: ${keyword}`);
        }
      }

      // Check task type triggers
      for (const type of agent.definition.triggers.taskTypes || []) {
        if (taskType.includes(type.toLowerCase())) {
          score += 0.4;
          reasons.push(`Task type match: ${type}`);
        }
      }

      // Check capabilities
      for (const capability of agent.definition.capabilities) {
        if (taskLower.includes(capability.toLowerCase())) {
          score += 0.2;
          reasons.push(`Capability: ${capability}`);
        }
      }

      // Check file patterns if task has files
      if (task.context.files) {
        for (const pattern of agent.definition.triggers.filePatterns || []) {
          if (task.context.files.some(f => f.includes(pattern))) {
            score += 0.3;
            reasons.push(`File pattern: ${pattern}`);
          }
        }
      }

      // Boost for performance history
      const perf = agent.definition.performance;
      score *= (0.5 + perf.successRate * 0.5);

      if (score > 0) {
        matches.push({ agent, score, reasons });
      }
    }

    // Sort by score and apply load balancing
    return this.applyLoadBalancing(matches).slice(0, limit);
  }

  /**
   * Apply load balancing strategy to matches
   */
  private applyLoadBalancing(matches: AgentMatch[]): AgentMatch[] {
    switch (this.config.loadBalancing) {
      case 'round-robin':
        // Prefer agents with fewer recent tasks
        return matches.sort((a, b) => {
          const aUsage = a.agent.sessionStats.tasksCompleted;
          const bUsage = b.agent.sessionStats.tasksCompleted;
          if (aUsage !== bUsage) return aUsage - bUsage;
          return b.score - a.score;
        });

      case 'least-loaded':
        // Prefer agents not in cooldown
        return matches.sort((a, b) => {
          const aCooldown = this.cooldowns.get(a.agent.definition.id) || 0;
          const bCooldown = this.cooldowns.get(b.agent.definition.id) || 0;
          if (aCooldown !== bCooldown) return aCooldown - bCooldown;
          return b.score - a.score;
        });

      case 'best-match':
      default:
        // Pure score-based
        return matches.sort((a, b) => b.score - a.score);
    }
  }

  /**
   * Acquire an agent for a task
   */
  acquireAgent(agentId: string, taskId: string): boolean {
    const agent = this.instances.get(agentId);
    if (!agent || agent.status !== 'available') {
      return false;
    }

    // Check cooldown
    const cooldownEnd = this.cooldowns.get(agentId) || 0;
    if (Date.now() < cooldownEnd) {
      return false;
    }

    // Check max concurrent
    const busyCount = this.getAllAgents().filter(a => a.status === 'busy').length;
    if (busyCount >= this.config.maxConcurrentAgents) {
      return false;
    }

    agent.status = 'busy';
    agent.currentTask = taskId;
    this.emit('agent:busy', agent, taskId);

    return true;
  }

  /**
   * Release an agent after task completion
   */
  releaseAgent(agentId: string, success: boolean): void {
    const agent = this.instances.get(agentId);
    if (!agent) return;

    // Update stats
    if (success) {
      agent.sessionStats.tasksCompleted++;
    } else {
      agent.sessionStats.tasksFailed++;
    }

    // Update performance
    const perf = agent.definition.performance;
    perf.usageCount++;
    perf.successRate = (perf.successRate * (perf.usageCount - 1) + (success ? 1 : 0)) / perf.usageCount;

    // Set cooldown
    const cooldownMs = agent.definition.constraints.cooldownMs || this.config.defaultCooldownMs;
    this.cooldowns.set(agentId, Date.now() + cooldownMs);

    agent.status = 'cooldown';
    agent.currentTask = undefined;
    agent.lastUsed = new Date().toISOString();

    // Schedule availability after cooldown
    setTimeout(() => {
      if (agent.status === 'cooldown') {
        agent.status = 'available';
        this.emit('agent:available', agent);
      }
    }, cooldownMs);
  }

  /**
   * Disable an agent
   */
  disableAgent(agentId: string): void {
    const agent = this.instances.get(agentId);
    if (agent) {
      agent.status = 'disabled';
      this.emit('agent:deactivated', agent);
    }
  }

  /**
   * Enable a disabled agent
   */
  enableAgent(agentId: string): void {
    const agent = this.instances.get(agentId);
    if (agent && agent.status === 'disabled') {
      agent.status = 'available';
      this.emit('agent:activated', agent);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number;
    available: number;
    busy: number;
    cooldown: number;
    disabled: number;
    byRole: Record<AgentRole, number>;
    topPerformers: Array<{ id: string; successRate: number; usageCount: number }>;
  } {
    const agents = this.getAllAgents();
    const byRole: Record<AgentRole, number> = {
      specialist: 0,
      generalist: 0,
      reviewer: 0,
      architect: 0,
      executor: 0,
      coordinator: 0,
    };

    for (const agent of agents) {
      byRole[agent.definition.role]++;
    }

    const topPerformers = agents
      .filter(a => a.definition.performance.usageCount > 0)
      .sort((a, b) => b.definition.performance.successRate - a.definition.performance.successRate)
      .slice(0, 10)
      .map(a => ({
        id: a.definition.id,
        successRate: a.definition.performance.successRate,
        usageCount: a.definition.performance.usageCount,
      }));

    return {
      total: agents.length,
      available: agents.filter(a => a.status === 'available').length,
      busy: agents.filter(a => a.status === 'busy').length,
      cooldown: agents.filter(a => a.status === 'cooldown').length,
      disabled: agents.filter(a => a.status === 'disabled').length,
      byRole,
      topPerformers,
    };
  }

  /**
   * Search agents by query
   */
  searchAgents(query: string): AgentInstance[] {
    const lower = query.toLowerCase();

    return this.getAllAgents().filter(agent => {
      const def = agent.definition;
      return (
        def.id.toLowerCase().includes(lower) ||
        def.name.toLowerCase().includes(lower) ||
        def.description.toLowerCase().includes(lower) ||
        def.capabilities.some(c => c.toLowerCase().includes(lower)) ||
        def.triggers.keywords?.some(k => k.toLowerCase().includes(lower))
      );
    });
  }

  /**
   * Format agent for display
   */
  formatAgent(agent: AgentInstance): string {
    const def = agent.definition;
    const statusIcon = {
      available: '🟢',
      busy: '🔴',
      cooldown: '🟡',
      disabled: '⚫',
    }[agent.status];

    return `${statusIcon} ${def.name} (${def.role})
   ID: ${def.id}
   Capabilities: ${def.capabilities.slice(0, 3).join(', ')}${def.capabilities.length > 3 ? '...' : ''}
   Success Rate: ${(def.performance.successRate * 100).toFixed(0)}%
   Usage: ${def.performance.usageCount} tasks`;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createAgentPool(
  agentsPath: string,
  config?: Partial<CouncilSystemConfig['agentPool']>
): AgentPool {
  return new AgentPool(agentsPath, config);
}
