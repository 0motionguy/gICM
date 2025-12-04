/**
 * OPUS 67 v4.0 - Capability Matrix
 *
 * Machine-readable can/cannot definitions with intelligent task matching.
 * Powers skill selection, validation, and anti-hallucination.
 */

import {
  SkillMetadataLoader,
  getSkillMetadataLoader,
  DeepSkillMetadata
} from './skill-metadata.js';

// =============================================================================
// TYPES
// =============================================================================

export interface CapabilityCheck {
  can: boolean;
  confidence: number;
  reasoning: string;
  requires_mcp?: string[];
  warnings?: string[];
}

export interface TaskValidation {
  isValid: boolean;
  confidence: number;
  missingCapabilities: string[];
  warnings: string[];
  suggestedSkills: string[];
  synergyScore: number;
}

export interface SkillMatch {
  skillId: string;
  score: number;      // 0-1 match score
  confidence: number; // 0-1 capability confidence
  matchedCapabilities: string[];
  missingCapabilities: string[];
  antiHallucinationWarnings: string[];
}

export interface TaskAnalysis {
  task: string;
  detectedActions: string[];
  complexity: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
  suggestedMode: string;
}

// Common action patterns mapped to capabilities
const ACTION_PATTERNS: Record<string, string[]> = {
  // Solana/Blockchain
  'deploy': ['Deploy smart contract', 'Deploy program'],
  'swap': ['Execute token swap', 'Jupiter integration', 'token swap'],
  'stake': ['Staking operations', 'Validator delegation'],
  'mint': ['Mint tokens', 'Create NFT'],
  'transfer': ['Transfer tokens', 'Send SOL'],
  'sign': ['Sign transaction', 'Sign message'],
  'wallet': ['Wallet integration', 'Connect wallet'],
  'transaction': ['Build transaction', 'Sign transaction'],
  'solana': ['Solana development', 'SPL tokens'],
  'anchor': ['Anchor framework', 'IDL generation'],

  // DeFi
  'defi': ['DeFi integration', 'Yield farming', 'Liquidity pools', 'token swap'],
  'trading': ['Trading strategies', 'Price analysis', 'token swap'],
  'liquidity': ['Liquidity provision', 'Pool management'],
  'yield': ['Yield optimization', 'APY calculation'],
  'amm': ['AMM integration', 'Liquidity pools'],
  'dex': ['DEX integration', 'Swap routing'],

  // NFT
  'nft': ['NFT operations', 'Metadata creation', 'Mint NFT'],
  'metadata': ['Metadata management', 'JSON standards'],
  'collection': ['NFT collections', 'Batch operations'],

  // Frontend
  'build ui': ['Write React components', 'Create UI'],
  'style': ['Write Tailwind classes', 'CSS styling'],
  'animate': ['Create animations', 'Framer Motion'],
  'form': ['Build forms', 'Form validation'],
  'table': ['Create data tables', 'Data display'],
  'react': ['React components', 'Hooks', 'State management'],
  'nextjs': ['Next.js pages', 'API routes', 'Server components'],
  'component': ['UI components', 'React components'],

  // Backend
  'api': ['Design REST APIs', 'API endpoints'],
  'database': ['Design database schemas', 'Database operations'],
  'auth': ['Set up authentication', 'JWT/OAuth'],
  'cache': ['Implement caching', 'Redis operations'],
  'websocket': ['WebSocket integration', 'Real-time'],
  'server': ['Backend server', 'API development'],
  'graphql': ['GraphQL schema', 'Resolvers'],

  // Infrastructure
  'docker': ['Docker containers', 'Containerization'],
  'kubernetes': ['Kubernetes deployment', 'K8s config'],
  'ci/cd': ['CI/CD pipeline', 'GitHub Actions'],
  'deployment': ['Deployment automation', 'Production deploy'],
  'aws': ['AWS services', 'Cloud infrastructure'],
  'terraform': ['Infrastructure as code', 'Terraform config'],

  // AI/ML
  'ai': ['AI integration', 'LLM prompts', 'Model inference'],
  'llm': ['LLM integration', 'Prompt engineering'],
  'embedding': ['Vector embeddings', 'Semantic search'],
  'rag': ['RAG pipeline', 'Context retrieval'],
  'agent': ['AI agent', 'Autonomous systems'],

  // Security
  'audit': ['Security audit', 'Code review'],
  'security': ['Security implementation', 'Vulnerability scan'],
  'penetration': ['Penetration testing', 'Security assessment'],

  // Data
  'analytics': ['Data analytics', 'Metrics tracking'],
  'visualization': ['Data visualization', 'Charts'],
  'pipeline': ['Data pipeline', 'ETL process'],

  // General
  'test': ['Write tests', 'Test coverage'],
  'debug': ['Debug issues', 'Fix errors'],
  'refactor': ['Refactor code', 'Clean up'],
  'document': ['Write documentation', 'API docs'],
  'type': ['Design type systems', 'TypeScript types'],
  'typescript': ['TypeScript development', 'Type definitions'],
  'optimize': ['Performance optimization', 'Code optimization']
};

// =============================================================================
// CAPABILITY MATRIX
// =============================================================================

export class CapabilityMatrix {
  private loader: SkillMetadataLoader;
  private initialized: boolean = false;

  constructor(loader?: SkillMetadataLoader) {
    this.loader = loader || getSkillMetadataLoader();
  }

  /**
   * Initialize the capability matrix (load all skill metadata)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.loader.loadAll();
    this.initialized = true;
  }

  /**
   * Check if a specific skill can perform an action
   */
  async canDo(skillId: string, action: string): Promise<CapabilityCheck> {
    const result = await this.loader.canDo(skillId, action);

    // Check for anti-hallucination warnings
    const warning = await this.loader.getAntiHallucinationWarning(skillId, action);

    return {
      ...result,
      warnings: warning ? [warning] : undefined
    };
  }

  /**
   * Validate if a set of skills can handle a task
   */
  async validateTask(task: string, skillIds: string[]): Promise<TaskValidation> {
    await this.initialize();

    const analysis = this.analyzeTask(task);
    const allWarnings: string[] = [];
    const missingCapabilities: string[] = [];
    const suggestedSkills: string[] = [];

    let totalConfidence = 0;
    let matchedCount = 0;

    // Check each required capability against loaded skills
    for (const requiredCap of analysis.requiredCapabilities) {
      let capabilityFound = false;

      for (const skillId of skillIds) {
        const check = await this.canDo(skillId, requiredCap);

        if (check.can) {
          capabilityFound = true;
          totalConfidence += check.confidence;
          matchedCount++;

          if (check.warnings) {
            allWarnings.push(...check.warnings);
          }
          break;
        }
      }

      if (!capabilityFound) {
        missingCapabilities.push(requiredCap);
        // Find skills that could provide this capability
        const suggestions = await this.findSkillsForCapability(requiredCap);
        suggestedSkills.push(...suggestions.slice(0, 2));
      }
    }

    // Get synergy score
    const synergies = await this.loader.getSynergies(skillIds);

    // Add conflict warnings
    for (const conflict of synergies.conflicting) {
      allWarnings.push(`Conflict: ${conflict.skills.join(' vs ')}`);
    }

    const avgConfidence = matchedCount > 0 ? totalConfidence / matchedCount : 0;

    return {
      isValid: missingCapabilities.length === 0,
      confidence: avgConfidence,
      missingCapabilities,
      warnings: allWarnings,
      suggestedSkills: [...new Set(suggestedSkills)],
      synergyScore: synergies.score
    };
  }

  /**
   * Find the best skills for a given task
   * Uses action patterns when available, falls back to direct word matching
   */
  async findBestSkills(task: string, maxResults: number = 5): Promise<SkillMatch[]> {
    await this.initialize();

    const analysis = this.analyzeTask(task);
    const matches: SkillMatch[] = [];
    const skillIds = this.loader.getLoadedSkillIds();
    const taskWords = task.toLowerCase().split(/\s+/).filter(w => w.length >= 3);

    for (const skillId of skillIds) {
      const metadata = await this.loader.get(skillId);
      if (!metadata) continue;

      const matchedCapabilities: string[] = [];
      const missingCapabilities: string[] = [];
      const warnings: string[] = [];
      let totalConfidence = 0;

      // Check each required capability from action patterns
      for (const cap of analysis.requiredCapabilities) {
        const check = await this.canDo(skillId, cap);

        if (check.can) {
          matchedCapabilities.push(cap);
          totalConfidence += check.confidence;
          if (check.warnings) {
            warnings.push(...check.warnings);
          }
        } else {
          missingCapabilities.push(cap);
        }
      }

      // Fallback: If no action patterns matched, try direct word matching against skill
      if (analysis.requiredCapabilities.length === 0 || matchedCapabilities.length === 0) {
        for (const word of taskWords) {
          const check = await this.canDo(skillId, word);
          if (check.can && !matchedCapabilities.includes(word)) {
            matchedCapabilities.push(word);
            totalConfidence += check.confidence;
            if (check.warnings) {
              warnings.push(...check.warnings);
            }
          }
        }
      }

      // Calculate match score
      const totalRequirements = Math.max(analysis.requiredCapabilities.length, taskWords.length, 1);
      const matchRatio = matchedCapabilities.length / totalRequirements;

      const avgConfidence = matchedCapabilities.length > 0
        ? totalConfidence / matchedCapabilities.length
        : 0;

      // Combined score (60% match ratio, 40% confidence)
      const score = (matchRatio * 0.6) + (avgConfidence * 0.4);

      if (score > 0.05) {  // Lower threshold for broader matching
        matches.push({
          skillId,
          score,
          confidence: avgConfidence,
          matchedCapabilities,
          missingCapabilities,
          antiHallucinationWarnings: warnings
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, maxResults);
  }

  /**
   * Get all warnings for a task + skills combination
   */
  async getAllWarnings(task: string, skillIds: string[]): Promise<string[]> {
    const warnings: string[] = [];

    for (const skillId of skillIds) {
      const warning = await this.loader.getAntiHallucinationWarning(skillId, task);
      if (warning) {
        warnings.push(`[${skillId}] ${warning}`);
      }
    }

    // Check for synergy conflicts
    const synergies = await this.loader.getSynergies(skillIds);
    for (const conflict of synergies.conflicting) {
      warnings.push(`Skill conflict: ${conflict.skills.join(' and ')} - ${conflict.reason}`);
    }

    return warnings;
  }

  /**
   * Pre-flight check before code generation
   */
  async preFlightCheck(task: string, skillIds: string[]): Promise<{
    pass: boolean;
    confidence: number;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const validation = await this.validateTask(task, skillIds);
    const allWarnings = await this.getAllWarnings(task, skillIds);

    const blockers: string[] = [];
    const recommendations: string[] = [];

    // Check for critical anti-hallucination patterns
    const criticalPatterns = [
      { pattern: /deploy.*mainnet/i, message: 'Cannot deploy to mainnet - use devnet first' },
      { pattern: /sign.*transaction/i, message: 'Cannot sign transactions - user wallet required' },
      { pattern: /access.*private.*key/i, message: 'Cannot access private keys' },
      { pattern: /execute.*real.*trade/i, message: 'Cannot execute real trades - simulation only' },
      { pattern: /send.*actual.*funds/i, message: 'Cannot send real funds' }
    ];

    for (const { pattern, message } of criticalPatterns) {
      if (pattern.test(task)) {
        blockers.push(message);
      }
    }

    // Add missing capability recommendations
    if (validation.suggestedSkills.length > 0) {
      recommendations.push(`Consider adding skills: ${validation.suggestedSkills.join(', ')}`);
    }

    // Low confidence recommendation
    if (validation.confidence < 0.7 && validation.confidence > 0) {
      recommendations.push('Low confidence - consider breaking task into smaller steps');
    }

    // Synergy recommendation
    if (validation.synergyScore < 0.8) {
      recommendations.push('Skill synergy could be improved - check for conflicts');
    }

    return {
      pass: blockers.length === 0 && validation.isValid,
      confidence: validation.confidence,
      blockers,
      warnings: [...allWarnings, ...validation.warnings],
      recommendations
    };
  }

  /**
   * Analyze a task to extract required capabilities
   */
  analyzeTask(task: string): TaskAnalysis {
    const taskLower = task.toLowerCase();
    const detectedActions: string[] = [];
    const requiredCapabilities: string[] = [];

    // Detect actions from patterns
    for (const [pattern, capabilities] of Object.entries(ACTION_PATTERNS)) {
      if (taskLower.includes(pattern)) {
        detectedActions.push(pattern);
        requiredCapabilities.push(...capabilities);
      }
    }

    // Additional keyword detection
    const keywords = taskLower.split(/\s+/);
    for (const keyword of keywords) {
      if (ACTION_PATTERNS[keyword]) {
        if (!detectedActions.includes(keyword)) {
          detectedActions.push(keyword);
          requiredCapabilities.push(...ACTION_PATTERNS[keyword]);
        }
      }
    }

    // Determine complexity
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (requiredCapabilities.length > 5 || task.length > 200) {
      complexity = 'high';
    } else if (requiredCapabilities.length > 2 || task.length > 100) {
      complexity = 'medium';
    }

    // Suggest mode based on task content
    let suggestedMode = 'BUILD';
    if (taskLower.includes('review') || taskLower.includes('audit')) {
      suggestedMode = 'REVIEW';
    } else if (taskLower.includes('design') || taskLower.includes('architect')) {
      suggestedMode = 'ARCHITECT';
    } else if (taskLower.includes('debug') || taskLower.includes('fix')) {
      suggestedMode = 'DEBUG';
    }

    return {
      task,
      detectedActions,
      complexity,
      requiredCapabilities: [...new Set(requiredCapabilities)],
      suggestedMode
    };
  }

  /**
   * Find skills that can provide a specific capability
   */
  private async findSkillsForCapability(capability: string): Promise<string[]> {
    const matching: Array<{ skillId: string; confidence: number }> = [];
    const skillIds = this.loader.getLoadedSkillIds();

    for (const skillId of skillIds) {
      const check = await this.canDo(skillId, capability);
      if (check.can) {
        matching.push({ skillId, confidence: check.confidence });
      }
    }

    // Sort by confidence
    matching.sort((a, b) => b.confidence - a.confidence);

    return matching.map(m => m.skillId);
  }

  /**
   * Get matrix statistics
   */
  async getStats(): Promise<{
    totalSkills: number;
    totalCapabilities: number;
    totalAntiHallucinationRules: number;
    coverageByCategory: Record<string, number>;
  }> {
    await this.initialize();

    const stats = this.loader.getStats();
    let totalCapabilities = 0;
    let totalAntiHallucinationRules = 0;
    const coverageByCategory: Record<string, number> = {};

    const skillIds = this.loader.getLoadedSkillIds();
    for (const skillId of skillIds) {
      const metadata = await this.loader.get(skillId);
      if (!metadata) continue;

      totalCapabilities += metadata.capabilities?.length || 0;
      totalAntiHallucinationRules += metadata.anti_hallucination?.length || 0;

      // Categorize by first part of skill ID
      const category = skillId.split('-')[0];
      coverageByCategory[category] = (coverageByCategory[category] || 0) + 1;
    }

    return {
      totalSkills: stats.totalSkills,
      totalCapabilities,
      totalAntiHallucinationRules,
      coverageByCategory
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: CapabilityMatrix | null = null;

export function getCapabilityMatrix(): CapabilityMatrix {
  if (!instance) {
    instance = new CapabilityMatrix();
  }
  return instance;
}

export function resetCapabilityMatrix(): void {
  instance = null;
}
