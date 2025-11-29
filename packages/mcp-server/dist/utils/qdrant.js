/**
 * Qdrant client wrapper
 */
import { QdrantClient } from "@qdrant/js-client-rest";
import { getQdrantUrl } from "./config.js";
let client = null;
export function getQdrantClient() {
    if (!client) {
        client = new QdrantClient({
            url: getQdrantUrl(),
        });
    }
    return client;
}
//# sourceMappingURL=qdrant.js.map