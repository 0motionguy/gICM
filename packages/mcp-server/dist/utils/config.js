/**
 * Configuration utilities
 */
export function getQdrantUrl() {
    return process.env.QDRANT_URL || "http://localhost:6333";
}
export function getIndexerUrl() {
    return process.env.INDEXER_API || "http://localhost:8000";
}
export function getGeminiKey() {
    return process.env.GEMINI_API_KEY;
}
export function getGICMApiUrl() {
    return process.env.GICM_API_URL || "https://gicm.dev";
}
//# sourceMappingURL=config.js.map