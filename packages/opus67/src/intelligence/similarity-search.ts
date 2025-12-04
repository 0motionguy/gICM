/**
 * OPUS 67 v4.0 - Similarity Search
 *
 * Fast semantic search using pre-computed embeddings.
 * Supports local computation and cached vectors.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getSkillMetadataLoader, type DeepSkillMetadata } from './skill-metadata.js';

// =============================================================================
// TYPES
// =============================================================================

export interface EmbeddingVector {
  skillId: string;
  vector: number[];
  text: string;  // Original text that was embedded
  timestamp: number;
}

export interface SimilarityResult {
  skillId: string;
  score: number;    // 0-1 cosine similarity
  metadata?: DeepSkillMetadata;
}

export interface EmbeddingCache {
  version: string;
  dimension: number;
  embeddings: EmbeddingVector[];
  createdAt: string;
}

// =============================================================================
// TF-IDF BASED SIMILARITY (No external dependencies)
// =============================================================================

/**
 * Simple TF-IDF vectorizer for local similarity search
 * No external API calls - works completely offline
 */
export class TFIDFVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private documents: Map<string, number[]> = new Map();
  private initialized: boolean = false;

  /**
   * Tokenize text into terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2)
      .filter(t => !this.isStopWord(t));
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'can', 'use', 'into', 'from',
      'that', 'this', 'will', 'your', 'are', 'was', 'were', 'been',
      'have', 'has', 'had', 'not', 'but', 'what', 'all', 'when'
    ]);
    return stopWords.has(word);
  }

  /**
   * Build vocabulary and IDF from documents
   */
  fit(documents: Map<string, string>): void {
    const docCount = documents.size;
    const termDocFreq: Map<string, number> = new Map();

    // Build vocabulary and count document frequency
    let vocabIndex = 0;
    for (const [_, text] of documents) {
      const terms = new Set(this.tokenize(text));
      for (const term of terms) {
        if (!this.vocabulary.has(term)) {
          this.vocabulary.set(term, vocabIndex++);
        }
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      }
    }

    // Calculate IDF
    for (const [term, docFreq] of termDocFreq) {
      this.idf.set(term, Math.log(docCount / (1 + docFreq)) + 1);
    }

    this.initialized = true;
  }

  /**
   * Transform text to TF-IDF vector
   */
  transform(text: string): number[] {
    const vector = new Array(this.vocabulary.size).fill(0);
    const terms = this.tokenize(text);
    const termFreq: Map<string, number> = new Map();

    // Count term frequency
    for (const term of terms) {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    }

    // Calculate TF-IDF
    for (const [term, tf] of termFreq) {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const idf = this.idf.get(term) || 1;
        vector[idx] = tf * idf;
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

  /**
   * Fit and transform documents
   */
  fitTransform(documents: Map<string, string>): Map<string, number[]> {
    this.fit(documents);

    const vectors = new Map<string, number[]>();
    for (const [id, text] of documents) {
      vectors.set(id, this.transform(text));
    }

    return vectors;
  }

  /**
   * Get vocabulary size
   */
  getVocabSize(): number {
    return this.vocabulary.size;
  }
}

// =============================================================================
// SIMILARITY SEARCH ENGINE
// =============================================================================

export class SimilaritySearch {
  private vectorizer: TFIDFVectorizer;
  private vectors: Map<string, number[]> = new Map();
  private skillTexts: Map<string, string> = new Map();
  private cachePath: string;
  private initialized: boolean = false;

  constructor(cachePath?: string) {
    this.vectorizer = new TFIDFVectorizer();
    this.cachePath = cachePath || this.getDefaultCachePath();
  }

  /**
   * Initialize from skill metadata
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Try to load from cache first
    if (await this.loadFromCache()) {
      this.initialized = true;
      return;
    }

    // Build from skill metadata
    const loader = getSkillMetadataLoader();
    await loader.loadAll();

    const skillIds = loader.getLoadedSkillIds();

    // Build document texts for each skill
    for (const skillId of skillIds) {
      const metadata = await loader.get(skillId);
      if (!metadata) continue;

      const text = this.buildSkillText(metadata);
      this.skillTexts.set(skillId, text);
    }

    // Fit vectorizer and transform
    this.vectors = this.vectorizer.fitTransform(this.skillTexts);

    // Save to cache
    await this.saveToCache();

    this.initialized = true;
  }

  /**
   * Build searchable text from skill metadata
   */
  private buildSkillText(metadata: DeepSkillMetadata): string {
    const parts: string[] = [
      metadata.id,
      metadata.name || '',
      metadata.semantic?.purpose || '',
      ...(metadata.semantic?.what_it_does || []),
      ...(metadata.capabilities?.map(c => c.action) || [])
    ];

    return parts.join(' ').toLowerCase();
  }

  /**
   * Search for similar skills
   */
  async search(query: string, topK: number = 5): Promise<SimilarityResult[]> {
    await this.initialize();

    const queryVector = this.vectorizer.transform(query.toLowerCase());
    const results: SimilarityResult[] = [];

    for (const [skillId, vector] of this.vectors) {
      const score = this.cosineSimilarity(queryVector, vector);
      results.push({ skillId, score });
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }

  /**
   * Search with metadata included
   */
  async searchWithMetadata(query: string, topK: number = 5): Promise<SimilarityResult[]> {
    const results = await this.search(query, topK);
    const loader = getSkillMetadataLoader();

    for (const result of results) {
      result.metadata = await loader.get(result.skillId) || undefined;
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * Load vectors from cache
   */
  private async loadFromCache(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.cachePath)) {
        return false;
      }

      const data = JSON.parse(fs.readFileSync(this.cachePath, 'utf-8')) as EmbeddingCache;

      // Check if cache is recent (less than 24 hours)
      const cacheAge = Date.now() - new Date(data.createdAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge > maxAge) {
        return false;
      }

      // Rebuild vectorizer from cached data
      const docs = new Map<string, string>();
      for (const emb of data.embeddings) {
        docs.set(emb.skillId, emb.text);
        this.skillTexts.set(emb.skillId, emb.text);
      }

      this.vectors = this.vectorizer.fitTransform(docs);

      console.log(`[SimilaritySearch] Loaded ${data.embeddings.length} embeddings from cache`);
      return true;
    } catch (error) {
      console.error('[SimilaritySearch] Failed to load cache:', error);
      return false;
    }
  }

  /**
   * Save vectors to cache
   */
  private async saveToCache(): Promise<void> {
    try {
      const dir = path.dirname(this.cachePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const embeddings: EmbeddingVector[] = [];
      for (const [skillId, text] of this.skillTexts) {
        const vector = this.vectors.get(skillId) || [];
        embeddings.push({
          skillId,
          vector,
          text,
          timestamp: Date.now()
        });
      }

      const cache: EmbeddingCache = {
        version: '1.0.0',
        dimension: this.vectorizer.getVocabSize(),
        embeddings,
        createdAt: new Date().toISOString()
      };

      fs.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
      console.log(`[SimilaritySearch] Saved ${embeddings.length} embeddings to cache`);
    } catch (error) {
      console.error('[SimilaritySearch] Failed to save cache:', error);
    }
  }

  /**
   * Clear cache and reinitialize
   */
  async refresh(): Promise<void> {
    try {
      if (fs.existsSync(this.cachePath)) {
        fs.unlinkSync(this.cachePath);
      }
    } catch {
      // Ignore errors
    }

    this.initialized = false;
    this.vectors.clear();
    this.skillTexts.clear();

    await this.initialize();
  }

  /**
   * Get statistics
   */
  getStats(): {
    skillCount: number;
    vocabSize: number;
    cacheExists: boolean;
  } {
    return {
      skillCount: this.vectors.size,
      vocabSize: this.vectorizer.getVocabSize(),
      cacheExists: fs.existsSync(this.cachePath)
    };
  }

  /**
   * Get default cache path
   */
  private getDefaultCachePath(): string {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
      '../../data/embeddings-cache.json'
    );
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: SimilaritySearch | null = null;

export function getSimilaritySearch(): SimilaritySearch {
  if (!instance) {
    instance = new SimilaritySearch();
  }
  return instance;
}

export function resetSimilaritySearch(): void {
  instance = null;
}
