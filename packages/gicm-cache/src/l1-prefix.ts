import type { L1PrefixBlock } from "./types.js";

/**
 * L1 Prefix Cache Manager
 *
 * Manages static prompt blocks with Anthropic's cache_control ephemeral markers.
 * Provides 90% input token savings with 5-minute TTL.
 */
export class L1PrefixCache {
  private blocks = new Map<string, L1PrefixBlock>();
  private blockOrder = ["system", "skill", "tool", "context"] as const;

  constructor(private maxTokens: number = 100_000) {}

  /**
   * Adds a content block to the prefix cache.
   */
  addBlock(content: string, type: L1PrefixBlock["type"]): string {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tokens = this.estimateTokens(content);

    const block: L1PrefixBlock = {
      id,
      content,
      tokens,
      type,
      cacheControl: { type: "ephemeral" },
    };

    this.blocks.set(id, block);
    this.evictIfNeeded();

    return id;
  }

  /**
   * Gets all blocks ordered by type (system → skill → tool → context).
   */
  getBlocks(): L1PrefixBlock[] {
    const allBlocks = Array.from(this.blocks.values());

    return allBlocks.sort((a, b) => {
      const aIndex = this.blockOrder.indexOf(a.type);
      const bIndex = this.blockOrder.indexOf(b.type);
      return aIndex - bIndex;
    });
  }

  /**
   * Builds messages array compatible with Anthropic API format.
   */
  buildCacheControlMessages(): Array<{
    type: string;
    text: string;
    cache_control?: { type: string };
  }> {
    const blocks = this.getBlocks();

    return blocks.map((block) => ({
      type: "text",
      text: block.content,
      cache_control: block.cacheControl,
    }));
  }

  /**
   * Returns total tokens across all blocks.
   */
  getTotalTokens(): number {
    return Array.from(this.blocks.values()).reduce(
      (sum, block) => sum + block.tokens,
      0
    );
  }

  /**
   * Removes a specific block by ID.
   */
  removeBlock(id: string): boolean {
    return this.blocks.delete(id);
  }

  /**
   * Clears all blocks.
   */
  clear(): void {
    this.blocks.clear();
  }

  /**
   * Gets number of blocks.
   */
  getEntryCount(): number {
    return this.blocks.size;
  }

  /**
   * Evicts oldest blocks if total tokens exceed maxTokens.
   */
  private evictIfNeeded(): void {
    while (this.getTotalTokens() > this.maxTokens && this.blocks.size > 0) {
      const oldest = Array.from(this.blocks.values())[0];
      this.blocks.delete(oldest.id);
    }
  }

  /**
   * Estimates tokens using character-based heuristic (1 token ≈ 4 characters).
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
