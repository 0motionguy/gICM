/**
 * Search gICM marketplace components
 */
import { getQdrantClient } from "../utils/qdrant.js";
import { getEmbedding } from "../utils/embeddings.js";
export async function searchComponents(query, kind, platform, limit = 5) {
    const qdrant = getQdrantClient();
    // Generate query embedding
    const queryVector = await getEmbedding(query);
    // Build filter
    const filter = {};
    if (kind) {
        filter.kind = kind;
    }
    if (platform) {
        filter.platforms = platform;
    }
    // Search in Qdrant
    const searchResult = await qdrant.search("gicm_components", {
        vector: queryVector,
        limit,
        filter: Object.keys(filter).length > 0 ? { must: buildFilterConditions(filter) } : undefined,
    });
    // Format results
    const results = searchResult.map((r) => ({
        id: r.payload?.id,
        name: r.payload?.name,
        kind: r.payload?.kind,
        description: r.payload?.description,
        category: r.payload?.category,
        tags: r.payload?.tags || [],
        install: r.payload?.install,
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
        if (Array.isArray(value)) {
            conditions.push({
                key,
                match: { any: value },
            });
        }
        else {
            conditions.push({
                key,
                match: { value },
            });
        }
    }
    return conditions;
}
//# sourceMappingURL=search-components.js.map