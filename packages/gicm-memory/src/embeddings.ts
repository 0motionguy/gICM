/**
 * Simple character-based embedding generation for semantic search.
 * Generates a 64-dimensional vector from text using character hashing.
 */
export function simpleEmbed(text: string, dims: number = 64): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(dims).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const idx = (word.charCodeAt(j) * (j + 1)) % dims;
      embedding[idx] += 1 / words.length;
    }
  }

  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? embedding.map((v) => v / magnitude) : embedding;
}

/**
 * Calculate cosine similarity between two embedding vectors.
 * Returns a value between -1 and 1, where 1 is identical and 0 is orthogonal.
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
 * Async wrapper for embedding generation (for future API-based embeddings).
 * Currently uses simpleEmbed but provides consistent async interface.
 */
export async function generateEmbedding(
  text: string,
  dims: number = 64
): Promise<number[]> {
  return simpleEmbed(text, dims);
}
