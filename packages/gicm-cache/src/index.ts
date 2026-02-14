export { CacheManager } from "./cache-manager.js";
export { L1PrefixCache } from "./l1-prefix.js";
export { L2ResponseCache } from "./l2-response.js";
export { L3ToolCache } from "./l3-tool.js";
export { simpleEmbed, cosineSimilarity } from "./embeddings.js";
export type {
  CacheConfig,
  CacheEntry,
  CacheLayer,
  L1PrefixBlock,
  L2ResponseEntry,
  L3ToolEntry,
  CacheStats,
  CacheEvents,
} from "./types.js";
export { CacheConfigSchema } from "./types.js";
