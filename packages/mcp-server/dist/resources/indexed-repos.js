/**
 * MCP Resources - List indexed repositories
 */
import { getQdrantClient } from "../utils/qdrant.js";
export async function getResources() {
    const resources = [];
    try {
        const qdrant = getQdrantClient();
        // Get gICM components collection info
        const gicmInfo = await qdrant.getCollection("gicm_components");
        resources.push({
            uri: "gicm://components",
            name: "gICM Marketplace",
            description: `${gicmInfo.points_count || 0} indexed components (agents, skills, MCPs, workflows)`,
            mimeType: "application/json",
        });
        // Get code chunks collection info
        const codeInfo = await qdrant.getCollection("code_chunks");
        if (codeInfo.points_count && codeInfo.points_count > 0) {
            resources.push({
                uri: "gicm://code",
                name: "Indexed Code",
                description: `${codeInfo.points_count} code chunks from indexed repositories`,
                mimeType: "text/plain",
            });
        }
    }
    catch (error) {
        // Return empty resources if Qdrant is not available
        console.error("Error getting resources:", error);
    }
    return resources;
}
//# sourceMappingURL=indexed-repos.js.map