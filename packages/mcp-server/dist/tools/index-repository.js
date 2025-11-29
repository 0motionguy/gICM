/**
 * Index a Git repository
 */
import { getIndexerUrl } from "../utils/config.js";
export async function indexRepository(url, branch = "main") {
    const indexerUrl = getIndexerUrl();
    try {
        const response = await fetch(`${indexerUrl}/index/repository`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, branch }),
        });
        if (!response.ok) {
            throw new Error(`Indexer returned ${response.status}`);
        }
        const result = await response.json();
        return {
            status: "queued",
            repository: url,
            message: `Repository ${url} queued for indexing on branch ${branch}`,
        };
    }
    catch (error) {
        return {
            status: "error",
            repository: url,
            message: `Failed to queue repository: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
//# sourceMappingURL=index-repository.js.map