/**
 * OPUS 67 - Memory Embeddings
 * Simple embedding functions for local semantic search
 */

/**
 * Generate a simple embedding vector from text
 * Uses character-based hashing for fast local embeddings
 */
export function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const dims = 64;
  const embedding = new Array(dims).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const idx = (word.charCodeAt(j) * (j + 1)) % dims;
      embedding[idx] += 1 / words.length;
    }
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * Generate embedding for text (async wrapper for future API support)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Use local embedding for fallback or when no external API is configured
  return simpleEmbed(text);
}
