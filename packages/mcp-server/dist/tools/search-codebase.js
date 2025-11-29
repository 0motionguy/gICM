/**
 * Search indexed code repositories
 */
import { getQdrantClient } from "../utils/qdrant.js";
import { getEmbedding } from "../utils/embeddings.js";
export async function searchCodebase(query, repository, language, limit = 10) {
    const qdrant = getQdrantClient();
    // Generate query embedding
    const queryVector = await getEmbedding(query);
    // Build filter
    const filter = {};
    if (repository) {
        filter.repo = repository;
    }
    if (language) {
        filter.language = language;
    }
    // Search in Qdrant
    const searchResult = await qdrant.search("code_chunks", {
        vector: queryVector,
        limit,
        filter: Object.keys(filter).length > 0 ? { must: buildFilterConditions(filter) } : undefined,
    });
    // Format results
    const results = searchResult.map((r) => ({
        repo: r.payload?.repo,
        file_path: r.payload?.file_path,
        language: r.payload?.language,
        start_line: r.payload?.start_line,
        end_line: r.payload?.end_line,
        content: r.payload?.content,
        score: r.score,
    }));
    return {
        results,
        query,
        total: results.length,
    };
}
function buildFilterConditions(filter) {
    const conditions = [];
    for (const [key, value] of Object.entries(filter)) {
        conditions.push({
            key,
            match: { value },
        });
    }
    return conditions;
}
//# sourceMappingURL=search-codebase.js.map