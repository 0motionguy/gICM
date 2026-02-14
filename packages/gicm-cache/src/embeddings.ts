/**
 * Simple character-based embedding generator (64 dimensions).
 * Same approach as @gicm/memory for consistency.
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

  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? embedding.map((v) => v / magnitude) : embedding;
}

/**
 * Calculates cosine similarity between two embedding vectors.
 * Returns value between 0 (no similarity) and 1 (identical).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }

  return dot;
}
