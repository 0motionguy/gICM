/**
 * OPUS 67 v4.0 - Knowledge Store
 *
 * Hybrid storage layer: JSON for development, SQLite for production.
 * Provides unified interface for skill metadata, synergies, and MCP endpoints.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SkillMetadataLoader, DeepSkillMetadata, getSkillMetadataLoader } from './skill-metadata.js';
import { CapabilityMatrix, getCapabilityMatrix } from './capability-matrix.js';
import { SynergyGraph, getSynergyGraph } from './synergy-graph.js';
import { MCPValidator, getMCPValidator } from './mcp-validator.js';

// =============================================================================
// TYPES
// =============================================================================

export type StorageMode = 'json' | 'sqlite' | 'hybrid';

export interface StorageConfig {
  mode: StorageMode;
  dataDir: string;
  sqlitePath?: string;
  cacheEnabled: boolean;
  cacheTTL: number;  // milliseconds
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface KnowledgeStats {
  skills: {
    total: number;
    withCapabilities: number;
    withAntiHallucination: number;
    byCategory: Record<string, number>;
  };
  synergies: {
    totalEdges: number;
    amplifying: number;
    conflicting: number;
  };
  mcps: {
    totalServers: number;
    totalEndpoints: number;
  };
  storage: {
    mode: StorageMode;
    cacheHits: number;
    cacheMisses: number;
  };
}

export interface QueryResult<T> {
  data: T | null;
  fromCache: boolean;
  latencyMs: number;
}

// =============================================================================
// KNOWLEDGE STORE
// =============================================================================

export class KnowledgeStore {
  private config: StorageConfig;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private initialized: boolean = false;

  // Sub-systems
  private skillLoader: SkillMetadataLoader;
  private capabilityMatrix: CapabilityMatrix;
  private synergyGraph: SynergyGraph;
  private mcpValidator: MCPValidator;

  // Stats
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      mode: config?.mode || this.detectMode(),
      dataDir: config?.dataDir || this.getDefaultDataDir(),
      sqlitePath: config?.sqlitePath,
      cacheEnabled: config?.cacheEnabled ?? true,
      cacheTTL: config?.cacheTTL || 5 * 60 * 1000  // 5 minutes default
    };

    this.skillLoader = getSkillMetadataLoader();
    this.capabilityMatrix = getCapabilityMatrix();
    this.synergyGraph = getSynergyGraph();
    this.mcpValidator = getMCPValidator();
  }

  /**
   * Initialize all knowledge systems
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const start = Date.now();

    // Load all skill metadata
    await this.skillLoader.loadAll();

    // Initialize capability matrix
    await this.capabilityMatrix.initialize();

    // Initialize synergy graph
    await this.synergyGraph.initialize();

    // Initialize MCP validator
    await this.mcpValidator.initialize();

    this.initialized = true;

    const elapsed = Date.now() - start;
    console.log(`[KnowledgeStore] Initialized in ${elapsed}ms (mode: ${this.config.mode})`);
  }

  // ===========================================================================
  // SKILL QUERIES
  // ===========================================================================

  /**
   * Get skill metadata with caching
   */
  async getSkill(skillId: string): Promise<QueryResult<DeepSkillMetadata>> {
    const cacheKey = `skill:${skillId}`;
    const start = Date.now();

    // Check cache
    const cached = this.getFromCache<DeepSkillMetadata>(cacheKey);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: Date.now() - start
      };
    }

    // Load from storage
    const data = await this.skillLoader.get(skillId);

    // Cache result
    if (data) {
      this.setCache(cacheKey, data);
    }

    return {
      data,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }

  /**
   * Check if skill can perform action
   */
  async canSkillDo(skillId: string, action: string): Promise<QueryResult<{
    can: boolean;
    confidence: number;
    reasoning: string;
    warnings?: string[];
  }>> {
    const start = Date.now();
    const result = await this.capabilityMatrix.canDo(skillId, action);

    return {
      data: result,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }

  /**
   * Find best skills for a task
   */
  async findSkillsForTask(task: string, maxResults: number = 5): Promise<QueryResult<Array<{
    skillId: string;
    score: number;
    matchedCapabilities: string[];
  }>>> {
    const cacheKey = `skills-for-task:${task.slice(0, 50)}`;
    const start = Date.now();

    // Check cache
    const cached = this.getFromCache<Array<{
      skillId: string;
      score: number;
      matchedCapabilities: string[];
    }>>(cacheKey);

    if (cached) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: Date.now() - start
      };
    }

    const matches = await this.capabilityMatrix.findBestSkills(task, maxResults);
    const data = matches.map(m => ({
      skillId: m.skillId,
      score: m.score,
      matchedCapabilities: m.matchedCapabilities
    }));

    this.setCache(cacheKey, data);

    return {
      data,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }

  // ===========================================================================
  // SYNERGY QUERIES
  // ===========================================================================

  /**
   * Get synergy score for skill combination
   */
  async getSynergyScore(skillIds: string[]): Promise<QueryResult<{
    score: number;
    amplifications: number;
    conflicts: number;
    reasoning: string[];
  }>> {
    const cacheKey = `synergy:${skillIds.sort().join(',')}`;
    const start = Date.now();

    const cached = this.getFromCache<{
      score: number;
      amplifications: number;
      conflicts: number;
      reasoning: string[];
    }>(cacheKey);

    if (cached) {
      return {
        data: cached,
        fromCache: true,
        latencyMs: Date.now() - start
      };
    }

    const result = await this.synergyGraph.getCombinationScore(skillIds);
    const data = {
      score: result.score,
      amplifications: result.amplifications,
      conflicts: result.conflicts,
      reasoning: result.reasoning
    };

    this.setCache(cacheKey, data);

    return {
      data,
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }

  /**
   * Get skills that work well with given skill
   */
  async getAmplifyingSkills(skillId: string): Promise<string[]> {
    return this.synergyGraph.getAmplifyingSkills(skillId);
  }

  /**
   * Get skills that conflict with given skill
   */
  async getConflictingSkills(skillId: string): Promise<string[]> {
    return this.synergyGraph.getConflictingSkills(skillId);
  }

  // ===========================================================================
  // MCP QUERIES
  // ===========================================================================

  /**
   * Validate MCP tool call
   */
  async validateMCPCall(
    serverId: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<QueryResult<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    const start = Date.now();
    const result = await this.mcpValidator.validate(serverId, toolName, params);

    return {
      data: {
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings
      },
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }

  /**
   * Search for MCP tools by capability
   */
  async searchMCPTools(capability: string): Promise<QueryResult<Array<{
    serverId: string;
    toolName: string;
    description: string;
  }>>> {
    const start = Date.now();
    const results = await this.mcpValidator.searchTools(capability);

    return {
      data: results.map(r => ({
        serverId: r.serverId,
        toolName: r.tool.name,
        description: r.tool.description
      })),
      fromCache: false,
      latencyMs: Date.now() - start
    };
  }

  /**
   * Get available tools for MCP server
   */
  async getMCPServerTools(serverId: string): Promise<string[]> {
    return this.mcpValidator.getServerTools(serverId);
  }

  // ===========================================================================
  // PRE-FLIGHT CHECK
  // ===========================================================================

  /**
   * Comprehensive pre-flight check before code generation
   */
  async preFlightCheck(task: string, skillIds: string[]): Promise<{
    pass: boolean;
    confidence: number;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
    latencyMs: number;
  }> {
    const start = Date.now();

    await this.initialize();

    const result = await this.capabilityMatrix.preFlightCheck(task, skillIds);
    const synergyResult = await this.getSynergyScore(skillIds);

    // Add synergy warnings if score is low
    if (synergyResult.data && synergyResult.data.score < 0.5) {
      result.warnings.push(`Low synergy score (${synergyResult.data.score.toFixed(2)})`);
      result.warnings.push(...synergyResult.data.reasoning);
    }

    return {
      ...result,
      latencyMs: Date.now() - start
    };
  }

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Get from cache with TTL check
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.config.cacheEnabled) return null;

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheMisses++;
      return null;
    }

    this.cacheHits++;
    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.cacheEnabled) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL
    });
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get comprehensive knowledge store statistics
   */
  async getStats(): Promise<KnowledgeStats> {
    await this.initialize();

    const skillStats = this.skillLoader.getStats();
    const synergyStats = await this.synergyGraph.getStats();
    const mcpStats = await this.mcpValidator.getStats();
    const capStats = await this.capabilityMatrix.getStats();

    return {
      skills: {
        total: skillStats.totalSkills,
        withCapabilities: skillStats.withCapabilities,
        withAntiHallucination: skillStats.withAntiHallucination,
        byCategory: capStats.coverageByCategory
      },
      synergies: {
        totalEdges: synergyStats.totalEdges,
        amplifying: synergyStats.amplifyingEdges,
        conflicting: synergyStats.conflictingEdges
      },
      mcps: {
        totalServers: mcpStats.totalServers,
        totalEndpoints: mcpStats.totalEndpoints
      },
      storage: {
        mode: this.config.mode,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses
      }
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /**
   * Detect storage mode from environment
   */
  private detectMode(): StorageMode {
    const env = process.env.OPUS67_STORAGE_MODE;
    if (env === 'sqlite' || env === 'json' || env === 'hybrid') {
      return env;
    }

    // Default: json for dev, sqlite for prod
    return process.env.NODE_ENV === 'production' ? 'sqlite' : 'json';
  }

  /**
   * Get default data directory
   */
  private getDefaultDataDir(): string {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
      '../../data'
    );
  }

  /**
   * Get storage configuration
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: KnowledgeStore | null = null;

export function getKnowledgeStore(): KnowledgeStore {
  if (!instance) {
    instance = new KnowledgeStore();
  }
  return instance;
}

export function resetKnowledgeStore(): void {
  instance = null;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick skill lookup
 */
export async function lookupSkill(skillId: string): Promise<DeepSkillMetadata | null> {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.getSkill(skillId);
  return result.data;
}

/**
 * Quick capability check
 */
export async function canDo(skillId: string, action: string): Promise<boolean> {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.canSkillDo(skillId, action);
  return result.data?.can ?? false;
}

/**
 * Quick synergy check
 */
export async function getSynergy(skillIds: string[]): Promise<number> {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.getSynergyScore(skillIds);
  return result.data?.score ?? 0;
}

/**
 * Quick MCP validation
 */
export async function validateMCP(
  serverId: string,
  toolName: string,
  params: Record<string, unknown>
): Promise<boolean> {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.validateMCPCall(serverId, toolName, params);
  return result.data?.valid ?? false;
}
