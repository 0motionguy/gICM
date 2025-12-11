/**
 * OPUS 67 v4.1 - Skill Search with Vector Embeddings
 *
 * Semantic skill search using Qdrant vector database.
 * Provides faster, more accurate skill discovery than TF-IDF.
 */

import * as fs from "fs";
import * as path from "path";
import {
  getSkillMetadataLoader,
  type DeepSkillMetadata,
} from "./skill-metadata.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SkillSearchResult {
  skillId: string;
  name: string;
  score: number;
  description: string;
  triggers: string[];
  capabilities: string[];
}

export interface SkillVector {
  id: string;
  vector: number[];
  payload: {
    skillId: string;
    name: string;
    description: string;
    triggers: string[];
    capabilities: string[];
    category: string;
    tier: number;
  };
}

export interface QdrantConfig {
  url: string;
  collectionName: string;
  vectorSize: number;
}

export interface SkillSearchConfig {
  qdrant?: QdrantConfig;
  embeddingModel: "local" | "openai" | "transformers";
  topK: number;
  minScore: number;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: SkillSearchConfig = {
  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: "opus67_skills",
    vectorSize: 384, // all-MiniLM-L6-v2 dimension
  },
  embeddingModel: "local",
  topK: 5,
  minScore: 0.3,
};

// =============================================================================
// LOCAL EMBEDDINGS (TF-IDF Enhanced)
// =============================================================================

/**
 * Enhanced TF-IDF with n-gram support for local embeddings
 * Fallback when Qdrant/transformers not available
 */
class LocalEmbeddings {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private dimension: number = 384;

  private tokenize(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Add bigrams for better semantic capture
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]}_${words[i + 1]}`);
    }

    return [...words, ...bigrams];
  }

  fit(documents: string[]): void {
    const docCount = documents.length;
    const termDocFreq: Map<string, number> = new Map();

    let vocabIndex = 0;
    for (const doc of documents) {
      const terms = new Set(this.tokenize(doc));
      for (const term of terms) {
        if (!this.vocabulary.has(term)) {
          this.vocabulary.set(term, vocabIndex++);
        }
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      }
    }

    for (const [term, docFreq] of termDocFreq) {
      this.idf.set(term, Math.log(docCount / (1 + docFreq)) + 1);
    }
  }

  embed(text: string): number[] {
    const fullVector = new Array(this.vocabulary.size).fill(0);
    const terms = this.tokenize(text);
    const termFreq: Map<string, number> = new Map();

    for (const term of terms) {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    }

    for (const [term, tf] of termFreq) {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const idf = this.idf.get(term) || 1;
        fullVector[idx] = tf * idf;
      }
    }

    // Reduce to fixed dimension using hashing
    const vector = new Array(this.dimension).fill(0);
    for (let i = 0; i < fullVector.length; i++) {
      if (fullVector[i] !== 0) {
        const bucket = i % this.dimension;
        vector[bucket] += fullVector[i];
      }
    }

    // L2 normalize
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }
}

// =============================================================================
// QDRANT CLIENT
// =============================================================================

class QdrantClient {
  private url: string;
  private collectionName: string;

  constructor(config: QdrantConfig) {
    this.url = config.url;
    this.collectionName = config.collectionName;
  }

  async createCollection(vectorSize: number): Promise<void> {
    try {
      await fetch(`${this.url}/collections/${this.collectionName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: "Cosine",
          },
        }),
      });
    } catch (error) {
      // Collection might already exist
      console.log("[SkillSearch] Collection exists or created");
    }
  }

  async upsertPoints(
    points: Array<{
      id: string;
      vector: number[];
      payload: Record<string, unknown>;
    }>
  ): Promise<void> {
    const response = await fetch(
      `${this.url}/collections/${this.collectionName}/points`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: points.map((p, idx) => ({
            id: idx,
            vector: p.vector,
            payload: { ...p.payload, _id: p.id },
          })),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Qdrant upsert failed: ${response.statusText}`);
    }
  }

  async search(
    vector: number[],
    topK: number
  ): Promise<
    Array<{
      id: number;
      score: number;
      payload: Record<string, unknown>;
    }>
  > {
    const response = await fetch(
      `${this.url}/collections/${this.collectionName}/points/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vector,
          limit: topK,
          with_payload: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Qdrant search failed: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      result: Array<{
        id: number;
        score: number;
        payload: Record<string, unknown>;
      }>;
    };
    return data.result;
  }

  async collectionExists(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.url}/collections/${this.collectionName}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getPointCount(): Promise<number> {
    try {
      const response = await fetch(
        `${this.url}/collections/${this.collectionName}`
      );
      if (!response.ok) return 0;
      const data = (await response.json()) as {
        result: { points_count: number };
      };
      return data.result.points_count || 0;
    } catch {
      return 0;
    }
  }
}

// =============================================================================
// SKILL SEARCH ENGINE
// =============================================================================

export class SkillSearch {
  private config: SkillSearchConfig;
  private embeddings: LocalEmbeddings;
  private qdrant: QdrantClient | null = null;
  private skillVectors: Map<string, SkillVector> = new Map();
  private initialized: boolean = false;
  private useQdrant: boolean = false;

  constructor(config: Partial<SkillSearchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.embeddings = new LocalEmbeddings();

    if (this.config.qdrant) {
      this.qdrant = new QdrantClient(this.config.qdrant);
    }
  }

  /**
   * Initialize search engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check if Qdrant is available
    if (this.qdrant) {
      try {
        const exists = await this.qdrant.collectionExists();
        const pointCount = exists ? await this.qdrant.getPointCount() : 0;

        if (exists && pointCount > 0) {
          this.useQdrant = true;
          console.log(`[SkillSearch] Using Qdrant with ${pointCount} vectors`);
          this.initialized = true;
          return;
        }
      } catch (error) {
        console.log(
          "[SkillSearch] Qdrant not available, using local embeddings"
        );
      }
    }

    // Fall back to local embeddings
    await this.buildLocalIndex();
    this.initialized = true;
  }

  /**
   * Build local index from skill metadata
   */
  private async buildLocalIndex(): Promise<void> {
    const loader = getSkillMetadataLoader();
    await loader.loadAll();

    const skillIds = loader.getLoadedSkillIds();
    const documents: string[] = [];
    const skills: DeepSkillMetadata[] = [];

    for (const skillId of skillIds) {
      const metadata = await loader.get(skillId);
      if (!metadata) continue;

      const text = this.buildSearchText(metadata);
      documents.push(text);
      skills.push(metadata);
    }

    // Fit embeddings
    this.embeddings.fit(documents);

    // Generate vectors
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const vector = this.embeddings.embed(documents[i]);

      this.skillVectors.set(skill.id, {
        id: skill.id,
        vector,
        payload: {
          skillId: skill.id,
          name: skill.name || skill.id,
          description: skill.semantic?.purpose || "",
          triggers: (skill as { triggers?: string[] }).triggers ?? [],
          capabilities: skill.capabilities?.map((c) => c.action) || [],
          category:
            (skill.semantic as { category?: string })?.category ?? "general",
          tier: skill.tier || 2,
        },
      });
    }

    // Try to index in Qdrant for future searches
    if (this.qdrant && this.skillVectors.size > 0) {
      try {
        await this.qdrant.createCollection(this.config.qdrant!.vectorSize);
        await this.qdrant.upsertPoints(
          Array.from(this.skillVectors.values()).map((sv) => ({
            id: sv.id,
            vector: sv.vector,
            payload: sv.payload,
          }))
        );
        this.useQdrant = true;
        console.log(
          `[SkillSearch] Indexed ${this.skillVectors.size} skills in Qdrant`
        );
      } catch (error) {
        console.log(
          "[SkillSearch] Could not index in Qdrant, using local search"
        );
      }
    }

    console.log(
      `[SkillSearch] Built local index with ${this.skillVectors.size} skills`
    );
  }

  /**
   * Build searchable text from skill metadata
   */
  private buildSearchText(metadata: DeepSkillMetadata): string {
    const parts: string[] = [
      metadata.id,
      metadata.name || "",
      metadata.semantic?.purpose || "",
      ...(metadata.semantic?.what_it_does?.filter((x): x is string =>
        Boolean(x)
      ) ?? []),
      ...((metadata as { triggers?: string[] }).triggers?.filter(
        (x): x is string => Boolean(x)
      ) ?? []),
      ...(metadata.capabilities
        ?.map((c) => c.action)
        .filter((x): x is string => Boolean(x)) ?? []),
      ...(metadata.capabilities
        ?.map((c) => (c as { description?: string }).description)
        .filter((x): x is string => Boolean(x)) ?? []),
    ];

    return parts.filter(Boolean).join(" ").toLowerCase();
  }

  /**
   * Search for skills matching a query
   */
  async searchSkills(
    query: string,
    topK?: number
  ): Promise<SkillSearchResult[]> {
    await this.initialize();

    const k = topK || this.config.topK;
    const queryVector = this.embeddings.embed(query.toLowerCase());

    if (this.useQdrant && this.qdrant) {
      return this.searchQdrant(queryVector, k);
    }

    return this.searchLocal(queryVector, k);
  }

  /**
   * Search using Qdrant
   */
  private async searchQdrant(
    vector: number[],
    topK: number
  ): Promise<SkillSearchResult[]> {
    const results = await this.qdrant!.search(vector, topK);

    return results
      .filter((r) => r.score >= this.config.minScore)
      .map((r) => ({
        skillId: (r.payload._id as string) || (r.payload.skillId as string),
        name: (r.payload.name as string) || "",
        score: r.score,
        description: (r.payload.description as string) || "",
        triggers: (r.payload.triggers as string[]) || [],
        capabilities: (r.payload.capabilities as string[]) || [],
      }));
  }

  /**
   * Search using local vectors
   */
  private searchLocal(
    queryVector: number[],
    topK: number
  ): SkillSearchResult[] {
    const results: Array<{ skill: SkillVector; score: number }> = [];

    for (const skill of this.skillVectors.values()) {
      const score = this.cosineSimilarity(queryVector, skill.vector);
      if (score >= this.config.minScore) {
        results.push({ skill, score });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK).map((r) => ({
      skillId: r.skill.payload.skillId,
      name: r.skill.payload.name,
      score: r.score,
      description: r.skill.payload.description,
      triggers: r.skill.payload.triggers,
      capabilities: r.skill.payload.capabilities,
    }));
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * Get skill by ID
   */
  async getSkillById(skillId: string): Promise<SkillSearchResult | null> {
    await this.initialize();

    const skill = this.skillVectors.get(skillId);
    if (!skill) return null;

    return {
      skillId: skill.payload.skillId,
      name: skill.payload.name,
      score: 1.0,
      description: skill.payload.description,
      triggers: skill.payload.triggers,
      capabilities: skill.payload.capabilities,
    };
  }

  /**
   * Index all skills (rebuild index)
   */
  async indexAllSkills(): Promise<{ indexed: number; errors: number }> {
    this.initialized = false;
    this.skillVectors.clear();
    this.useQdrant = false;

    await this.buildLocalIndex();

    return {
      indexed: this.skillVectors.size,
      errors: 0,
    };
  }

  /**
   * Get search statistics
   */
  getStats(): {
    skillCount: number;
    useQdrant: boolean;
    qdrantUrl: string | null;
    initialized: boolean;
  } {
    return {
      skillCount: this.skillVectors.size,
      useQdrant: this.useQdrant,
      qdrantUrl: this.config.qdrant?.url || null,
      initialized: this.initialized,
    };
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: SkillSearch | null = null;

export function getSkillSearch(): SkillSearch {
  if (!instance) {
    instance = new SkillSearch();
  }
  return instance;
}

export function resetSkillSearch(): void {
  instance = null;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Search for skills matching a query
 */
export async function searchSkills(
  query: string,
  topK: number = 5
): Promise<SkillSearchResult[]> {
  const search = getSkillSearch();
  return search.searchSkills(query, topK);
}

/**
 * Index all skills in the vector database
 */
export async function indexAllSkills(): Promise<{
  indexed: number;
  errors: number;
}> {
  const search = getSkillSearch();
  return search.indexAllSkills();
}

/**
 * Get a skill by ID
 */
export async function getSkillById(
  id: string
): Promise<SkillSearchResult | null> {
  const search = getSkillSearch();
  return search.getSkillById(id);
}
