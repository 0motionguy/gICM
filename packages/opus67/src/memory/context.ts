/**
 * OPUS 67 Context Enhancement
 * Use memory to enhance prompts with relevant context
 */

import { GraphitiMemory, memory, type MemoryNode, type SearchResult } from './graphiti.js';

// Types
export interface ContextWindow {
  relevantMemories: MemoryNode[];
  recentEpisodes: MemoryNode[];
  activeGoals: MemoryNode[];
  improvements: MemoryNode[];
  tokenEstimate: number;
}

export interface ContextEnhancement {
  originalPrompt: string;
  enhancedPrompt: string;
  context: ContextWindow;
  injectedTokens: number;
}

export interface ContextConfig {
  maxMemories: number;
  maxEpisodes: number;
  maxGoals: number;
  maxImprovements: number;
  maxTokens: number;
  includeTimestamps: boolean;
}

const DEFAULT_CONFIG: ContextConfig = {
  maxMemories: 5,
  maxEpisodes: 3,
  maxGoals: 2,
  maxImprovements: 3,
  maxTokens: 2000,
  includeTimestamps: true,
};

/**
 * ContextEnhancer - Inject relevant memory into prompts
 */
export class ContextEnhancer {
  private memory: GraphitiMemory;
  private config: ContextConfig;

  constructor(memoryInstance?: GraphitiMemory, config?: Partial<ContextConfig>) {
    this.memory = memoryInstance ?? memory;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Estimate token count (rough: 4 chars = 1 token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Build context window for a query
   */
  async buildContextWindow(query: string): Promise<ContextWindow> {
    // Search for relevant memories
    const searchResults = await this.memory.search(query, { limit: this.config.maxMemories });
    const relevantMemories = searchResults.map(r => r.node);

    // Get recent episodes
    const episodeResults = await this.memory.search('', { type: 'episode', limit: this.config.maxEpisodes });
    const recentEpisodes = episodeResults.map(r => r.node);

    // Get active goals
    const goalResults = await this.memory.search('', { type: 'goal', limit: this.config.maxGoals });
    const activeGoals = goalResults
      .map(r => r.node)
      .filter(n => {
        try {
          const goal = JSON.parse(n.value);
          return goal.status !== 'completed';
        } catch {
          return false;
        }
      });

    // Get recent improvements
    const improvementResults = await this.memory.search('', { type: 'improvement', limit: this.config.maxImprovements });
    const improvements = improvementResults.map(r => r.node);

    // Calculate token estimate
    const allNodes = [...relevantMemories, ...recentEpisodes, ...activeGoals, ...improvements];
    const totalText = allNodes.map(n => `${n.key}: ${n.value}`).join('\n');
    const tokenEstimate = this.estimateTokens(totalText);

    return {
      relevantMemories,
      recentEpisodes,
      activeGoals,
      improvements,
      tokenEstimate
    };
  }

  /**
   * Format context for prompt injection
   */
  formatContext(context: ContextWindow): string {
    let output = '<!-- OPUS 67 MEMORY CONTEXT -->\n';

    // Relevant memories
    if (context.relevantMemories.length > 0) {
      output += '\n<relevant_memories>\n';
      for (const mem of context.relevantMemories) {
        const timestamp = this.config.includeTimestamps
          ? ` [${mem.createdAt.toISOString().slice(0, 10)}]`
          : '';
        output += `• ${mem.key}${timestamp}: ${mem.value.slice(0, 200)}\n`;
      }
      output += '</relevant_memories>\n';
    }

    // Active goals
    if (context.activeGoals.length > 0) {
      output += '\n<active_goals>\n';
      for (const goal of context.activeGoals) {
        try {
          const g = JSON.parse(goal.value);
          output += `• ${g.description} (${g.progress}% complete, ${g.status})\n`;
        } catch {
          output += `• ${goal.key}\n`;
        }
      }
      output += '</active_goals>\n';
    }

    // Recent improvements
    if (context.improvements.length > 0) {
      output += '\n<recent_improvements>\n';
      for (const imp of context.improvements) {
        try {
          const i = JSON.parse(imp.value);
          output += `• ${i.component}: ${i.changeType} (impact: ${i.impact})\n`;
        } catch {
          output += `• ${imp.key}\n`;
        }
      }
      output += '</recent_improvements>\n';
    }

    // Recent episodes (brief)
    if (context.recentEpisodes.length > 0) {
      output += '\n<recent_episodes>\n';
      for (const ep of context.recentEpisodes) {
        output += `• ${ep.key}: ${ep.value.slice(0, 100)}...\n`;
      }
      output += '</recent_episodes>\n';
    }

    output += '\n<!-- /OPUS 67 MEMORY CONTEXT -->';

    return output;
  }

  /**
   * Enhance a prompt with memory context
   */
  async enhance(prompt: string): Promise<ContextEnhancement> {
    const context = await this.buildContextWindow(prompt);

    // Check if context exceeds token limit
    if (context.tokenEstimate > this.config.maxTokens) {
      // Trim context to fit
      const ratio = this.config.maxTokens / context.tokenEstimate;
      context.relevantMemories = context.relevantMemories.slice(0, Math.ceil(context.relevantMemories.length * ratio));
      context.recentEpisodes = context.recentEpisodes.slice(0, Math.ceil(context.recentEpisodes.length * ratio));
    }

    const contextString = this.formatContext(context);
    const injectedTokens = this.estimateTokens(contextString);

    const enhancedPrompt = `${contextString}\n\n${prompt}`;

    return {
      originalPrompt: prompt,
      enhancedPrompt,
      context,
      injectedTokens
    };
  }

  /**
   * Extract and store learnings from a conversation
   */
  async extractAndStore(conversation: string, metadata?: Record<string, unknown>): Promise<MemoryNode[]> {
    const stored: MemoryNode[] = [];

    // Simple extraction patterns
    const patterns = [
      { regex: /learned?:?\s*(.+?)(?:\.|$)/gi, type: 'fact' as const },
      { regex: /remember:?\s*(.+?)(?:\.|$)/gi, type: 'fact' as const },
      { regex: /note:?\s*(.+?)(?:\.|$)/gi, type: 'fact' as const },
      { regex: /goal:?\s*(.+?)(?:\.|$)/gi, type: 'goal' as const },
      { regex: /improved?:?\s*(.+?)(?:\.|$)/gi, type: 'improvement' as const },
    ];

    for (const { regex, type } of patterns) {
      let match;
      while ((match = regex.exec(conversation)) !== null) {
        const content = match[1].trim();
        if (content.length > 10) {
          let node: MemoryNode;

          if (type === 'goal') {
            node = await this.memory.trackGoal({
              description: content,
              progress: 0,
              status: 'pending'
            });
          } else if (type === 'improvement') {
            node = await this.memory.storeImprovement({
              component: 'extracted',
              changeType: 'enhancement',
              before: '',
              after: content,
              impact: 0.5,
              automated: true
            });
          } else {
            node = await this.memory.addFact(
              `extracted:${Date.now()}`,
              content,
              { source: 'conversation', ...metadata }
            );
          }

          stored.push(node);
        }
      }
    }

    return stored;
  }

  /**
   * Get context summary without full prompt injection
   */
  async getSummary(query: string): Promise<string> {
    const context = await this.buildContextWindow(query);

    return `
Memory Context Summary:
- ${context.relevantMemories.length} relevant memories
- ${context.recentEpisodes.length} recent episodes
- ${context.activeGoals.length} active goals
- ${context.improvements.length} improvements
- ~${context.tokenEstimate} tokens

Top relevant: ${context.relevantMemories[0]?.key ?? 'None'}`;
  }
}

// Export factory
export function createContextEnhancer(
  memoryInstance?: GraphitiMemory,
  config?: Partial<ContextConfig>
): ContextEnhancer {
  return new ContextEnhancer(memoryInstance, config);
}

// Export default singleton
export const contextEnhancer = new ContextEnhancer();

/**
 * Quick helper to enhance a prompt
 */
export async function enhancePrompt(prompt: string): Promise<string> {
  const result = await contextEnhancer.enhance(prompt);
  return result.enhancedPrompt;
}

/**
 * Quick helper to get context for a topic
 */
export async function getContextFor(topic: string): Promise<ContextWindow> {
  return contextEnhancer.buildContextWindow(topic);
}
