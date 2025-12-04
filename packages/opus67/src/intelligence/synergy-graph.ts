/**
 * OPUS 67 v4.0 - Synergy Graph
 *
 * Models relationships between skills for intelligent combination.
 * Tracks amplifying, conflicting, and redundant skill pairs.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';
import { getSkillMetadataLoader } from './skill-metadata.js';

// =============================================================================
// TYPES
// =============================================================================

export interface SynergyEdge {
  from: string;
  to: string;
  type: 'amplifying' | 'conflicting' | 'redundant';
  weight: number;  // Strength of relationship 0-1
  reason?: string;
  bidirectional: boolean;
}

export interface SkillNode {
  id: string;
  name: string;
  tier: number;
  category: string;
  connections: number;  // Total edges
}

export interface SynergyPath {
  skills: string[];
  totalWeight: number;
  hasConflicts: boolean;
  conflictDetails: string[];
}

export interface CombinationScore {
  skills: string[];
  score: number;         // 0-1 overall score
  amplifications: number;
  conflicts: number;
  redundancies: number;
  reasoning: string[];
}

// Synergy definitions from YAML
export interface SynergyDefinitions {
  version: string;
  categories: Record<string, {
    skills: string[];
    internal_synergies?: string[];
  }>;
  cross_category: Array<{
    from: string;
    to: string;
    type: 'amplifying' | 'conflicting' | 'redundant';
    weight?: number;
    reason?: string;
  }>;
}

// =============================================================================
// SYNERGY GRAPH
// =============================================================================

export class SynergyGraph {
  private nodes: Map<string, SkillNode> = new Map();
  private edges: SynergyEdge[] = [];
  private adjacencyList: Map<string, SynergyEdge[]> = new Map();
  private initialized: boolean = false;

  constructor() {}

  /**
   * Initialize the graph from skill metadata and synergies.yaml
   */
  async initialize(synergiesPath?: string): Promise<void> {
    if (this.initialized) return;

    // Load from skill metadata
    await this.loadFromSkillMetadata();

    // Load additional synergies from YAML if exists
    if (synergiesPath) {
      await this.loadFromYaml(synergiesPath);
    } else {
      // Try default path
      const defaultPath = path.join(
        path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
        '../../config/synergies.yaml'
      );
      if (fs.existsSync(defaultPath)) {
        await this.loadFromYaml(defaultPath);
      }
    }

    this.initialized = true;
  }

  /**
   * Load synergies from skill metadata files
   */
  private async loadFromSkillMetadata(): Promise<void> {
    const loader = getSkillMetadataLoader();
    await loader.loadAll();

    const skillIds = loader.getLoadedSkillIds();

    for (const skillId of skillIds) {
      const metadata = await loader.get(skillId);
      if (!metadata) continue;

      // Create node
      const category = this.extractCategory(skillId);
      this.nodes.set(skillId, {
        id: skillId,
        name: metadata.name || skillId,
        tier: metadata.tier || 3,
        category,
        connections: 0
      });

      // Add synergy edges from metadata
      if (metadata.synergies) {
        // Amplifying
        for (const amp of metadata.synergies.amplifying || []) {
          this.addEdge({
            from: skillId,
            to: amp,
            type: 'amplifying',
            weight: 0.8,
            bidirectional: true
          });
        }

        // Conflicting
        for (const conflict of metadata.synergies.conflicting || []) {
          this.addEdge({
            from: skillId,
            to: conflict,
            type: 'conflicting',
            weight: 0.9,
            bidirectional: true
          });
        }

        // Redundant
        for (const redundant of metadata.synergies.redundant || []) {
          this.addEdge({
            from: skillId,
            to: redundant,
            type: 'redundant',
            weight: 0.7,
            bidirectional: true
          });
        }
      }
    }

    this.updateConnectionCounts();
  }

  /**
   * Load additional synergies from YAML file
   */
  private async loadFromYaml(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const definitions = parseYaml(content) as SynergyDefinitions;

      // Add cross-category synergies
      for (const synergy of definitions.cross_category || []) {
        this.addEdge({
          from: synergy.from,
          to: synergy.to,
          type: synergy.type,
          weight: synergy.weight || 0.8,
          reason: synergy.reason,
          bidirectional: true
        });
      }

      this.updateConnectionCounts();
    } catch (error) {
      // File might not exist - that's okay
      console.error(`[SynergyGraph] Could not load synergies.yaml:`, error);
    }
  }

  /**
   * Add an edge to the graph
   */
  private addEdge(edge: SynergyEdge): void {
    // Check for duplicate
    const existingIndex = this.edges.findIndex(e =>
      (e.from === edge.from && e.to === edge.to) ||
      (edge.bidirectional && e.from === edge.to && e.to === edge.from)
    );

    if (existingIndex === -1) {
      this.edges.push(edge);

      // Add to adjacency list
      if (!this.adjacencyList.has(edge.from)) {
        this.adjacencyList.set(edge.from, []);
      }
      this.adjacencyList.get(edge.from)!.push(edge);

      if (edge.bidirectional) {
        if (!this.adjacencyList.has(edge.to)) {
          this.adjacencyList.set(edge.to, []);
        }
        this.adjacencyList.get(edge.to)!.push({
          ...edge,
          from: edge.to,
          to: edge.from
        });
      }
    }
  }

  /**
   * Update connection counts for all nodes
   */
  private updateConnectionCounts(): void {
    for (const [id, edges] of this.adjacencyList) {
      const node = this.nodes.get(id);
      if (node) {
        node.connections = edges.length;
      }
    }
  }

  /**
   * Extract category from skill ID
   */
  private extractCategory(skillId: string): string {
    const categoryMap: Record<string, string> = {
      'solana': 'blockchain',
      'anchor': 'blockchain',
      'bonding': 'blockchain',
      'jupiter': 'blockchain',
      'evm': 'blockchain',
      'smart': 'blockchain',
      'token': 'blockchain',
      'defi': 'blockchain',
      'wallet': 'blockchain',

      'nextjs': 'frontend',
      'react': 'frontend',
      'tailwind': 'frontend',
      'shadcn': 'frontend',
      'framer': 'frontend',
      'vibe': 'frontend',

      'nodejs': 'backend',
      'api': 'backend',
      'database': 'backend',
      'redis': 'backend',
      'graphql': 'backend',
      'websocket': 'backend',

      'docker': 'devops',
      'kubernetes': 'devops',
      'ci': 'devops',
      'aws': 'devops',

      'typescript': 'core',
      'javascript': 'core'
    };

    const firstWord = skillId.split('-')[0].toLowerCase();
    return categoryMap[firstWord] || 'other';
  }

  /**
   * Get synergy score for a combination of skills
   */
  async getCombinationScore(skillIds: string[]): Promise<CombinationScore> {
    await this.initialize();

    const reasoning: string[] = [];
    let amplifications = 0;
    let conflicts = 0;
    let redundancies = 0;

    // Check all pairs
    for (let i = 0; i < skillIds.length; i++) {
      for (let j = i + 1; j < skillIds.length; j++) {
        const skill1 = skillIds[i];
        const skill2 = skillIds[j];

        const edges = this.getEdgesBetween(skill1, skill2);

        for (const edge of edges) {
          switch (edge.type) {
            case 'amplifying':
              amplifications++;
              reasoning.push(`✓ ${skill1} + ${skill2}: amplifying (${edge.reason || 'good synergy'})`);
              break;
            case 'conflicting':
              conflicts++;
              reasoning.push(`✗ ${skill1} + ${skill2}: conflicting (${edge.reason || 'may cause issues'})`);
              break;
            case 'redundant':
              redundancies++;
              reasoning.push(`≈ ${skill1} + ${skill2}: redundant (${edge.reason || 'overlapping capabilities'})`);
              break;
          }
        }
      }
    }

    // Calculate score
    // Base score starts at 0.5
    // Each amplification adds 0.1 (up to +0.4)
    // Each conflict subtracts 0.2 (can go negative)
    // Each redundancy subtracts 0.05 (minor penalty)
    let score = 0.5;
    score += Math.min(amplifications * 0.1, 0.4);
    score -= conflicts * 0.2;
    score -= redundancies * 0.05;
    score = Math.max(0, Math.min(1, score));

    return {
      skills: skillIds,
      score,
      amplifications,
      conflicts,
      redundancies,
      reasoning
    };
  }

  /**
   * Get edges between two skills
   */
  private getEdgesBetween(skill1: string, skill2: string): SynergyEdge[] {
    const edges1 = this.adjacencyList.get(skill1) || [];
    return edges1.filter(e => e.to === skill2);
  }

  /**
   * Find optimal skill combination for a task
   */
  async findOptimalCombination(
    candidateSkills: string[],
    maxSkills: number = 5
  ): Promise<CombinationScore> {
    await this.initialize();

    if (candidateSkills.length <= maxSkills) {
      return this.getCombinationScore(candidateSkills);
    }

    // Greedy approach: start with best pairs, expand
    let bestCombination: string[] = [];
    let bestScore = 0;

    // Start with each skill
    for (const startSkill of candidateSkills) {
      const combination = [startSkill];

      // Add skills that amplify, avoid conflicts
      for (const candidate of candidateSkills) {
        if (combination.includes(candidate)) continue;
        if (combination.length >= maxSkills) break;

        const testCombination = [...combination, candidate];
        const score = await this.getCombinationScore(testCombination);

        if (score.conflicts === 0) {
          combination.push(candidate);
        }
      }

      const finalScore = await this.getCombinationScore(combination);
      if (finalScore.score > bestScore) {
        bestScore = finalScore.score;
        bestCombination = combination;
      }
    }

    return this.getCombinationScore(bestCombination);
  }

  /**
   * Get skills that amplify a given skill
   */
  async getAmplifyingSkills(skillId: string): Promise<string[]> {
    await this.initialize();

    const edges = this.adjacencyList.get(skillId) || [];
    return edges
      .filter(e => e.type === 'amplifying')
      .map(e => e.to);
  }

  /**
   * Get skills that conflict with a given skill
   */
  async getConflictingSkills(skillId: string): Promise<string[]> {
    await this.initialize();

    const edges = this.adjacencyList.get(skillId) || [];
    return edges
      .filter(e => e.type === 'conflicting')
      .map(e => e.to);
  }

  /**
   * Get all skills in a category
   */
  async getSkillsByCategory(category: string): Promise<SkillNode[]> {
    await this.initialize();

    const skills: SkillNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.category === category) {
        skills.push(node);
      }
    }

    return skills.sort((a, b) => a.tier - b.tier);
  }

  /**
   * Get graph statistics
   */
  async getStats(): Promise<{
    totalNodes: number;
    totalEdges: number;
    amplifyingEdges: number;
    conflictingEdges: number;
    redundantEdges: number;
    categoryCounts: Record<string, number>;
    avgConnectionsPerNode: number;
  }> {
    await this.initialize();

    const categoryCounts: Record<string, number> = {};
    let totalConnections = 0;

    for (const node of this.nodes.values()) {
      categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;
      totalConnections += node.connections;
    }

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      amplifyingEdges: this.edges.filter(e => e.type === 'amplifying').length,
      conflictingEdges: this.edges.filter(e => e.type === 'conflicting').length,
      redundantEdges: this.edges.filter(e => e.type === 'redundant').length,
      categoryCounts,
      avgConnectionsPerNode: this.nodes.size > 0 ? totalConnections / this.nodes.size : 0
    };
  }

  /**
   * Export graph as JSON for visualization
   */
  async exportForVisualization(): Promise<{
    nodes: Array<{ id: string; label: string; group: string; tier: number }>;
    edges: Array<{ from: string; to: string; type: string; weight: number }>;
  }> {
    await this.initialize();

    const nodes = Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      label: n.name,
      group: n.category,
      tier: n.tier
    }));

    const edges = this.edges.map(e => ({
      from: e.from,
      to: e.to,
      type: e.type,
      weight: e.weight
    }));

    return { nodes, edges };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: SynergyGraph | null = null;

export function getSynergyGraph(): SynergyGraph {
  if (!instance) {
    instance = new SynergyGraph();
  }
  return instance;
}

export function resetSynergyGraph(): void {
  instance = null;
}
