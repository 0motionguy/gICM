/**
 * Configuration utilities
 */

export function getQdrantUrl(): string {
  return process.env.QDRANT_URL || "http://localhost:6333";
}

export function getIndexerUrl(): string {
  return process.env.INDEXER_API || "http://localhost:8000";
}

export function getGeminiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export function getGICMApiUrl(): string {
  return process.env.GICM_API_URL || "https://gicm.dev";
}
