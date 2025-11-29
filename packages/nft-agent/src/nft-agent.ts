import { z } from "zod";
import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
  type LLMClient,
  createLLMClient,
} from "@gicm/agent-core";
import type { NFTAgentConfig, NFT, NFTCollection, NFTProvider, RarityScore } from "./types.js";
import { NFTAgentConfigSchema } from "./types.js";
import { MetaplexProvider } from "./providers/metaplex.js";
import { OpenSeaProvider } from "./providers/opensea.js";
import { MagicEdenProvider } from "./providers/magic-eden.js";
import { RarityAnalyzer } from "./analyzers/rarity.js";
import { PricingAnalyzer, type PriceEstimate, type MarketAnalysis } from "./analyzers/pricing.js";

export interface NFTAgentAnalysis {
  collection?: NFTCollection;
  nft?: NFT;
  rarity?: RarityScore;
  priceEstimate?: PriceEstimate;
  market?: MarketAnalysis;
  whaleHolders?: Array<{ address: string; balance: number; percentage: number }>;
  aiSummary?: string;
}

export class NFTAgent extends BaseAgent {
  private providers: Map<string, NFTProvider> = new Map();
  private rarityAnalyzer: RarityAnalyzer;
  private pricingAnalyzer: PricingAnalyzer;
  private nftConfig: NFTAgentConfig;
  private llmClient?: LLMClient;

  constructor(config: NFTAgentConfig & AgentConfig) {
    const validatedConfig = NFTAgentConfigSchema.parse(config);
    super("nft-agent", config);

    this.nftConfig = validatedConfig;
    this.rarityAnalyzer = new RarityAnalyzer();
    this.pricingAnalyzer = new PricingAnalyzer();

    // Initialize LLM client if API key provided
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096,
      });
    }

    this.initializeProviders(validatedConfig);
    this.initializeTools();
  }

  private initializeProviders(config: NFTAgentConfig): void {
    // Metaplex for Solana
    this.providers.set("metaplex", new MetaplexProvider());

    // Magic Eden for Solana
    this.providers.set("magic-eden", new MagicEdenProvider({
      apiKey: config.magicEdenApiKey,
    }));

    // OpenSea for EVM (requires API key)
    if (config.openSeaApiKey) {
      this.providers.set("opensea", new OpenSeaProvider({
        apiKey: config.openSeaApiKey,
      }));
    }
  }

  private initializeTools(): void {
    this.registerTool({
      name: "get_collection",
      description: "Get NFT collection info including floor price and stats",
      parameters: z.object({
        address: z.string().describe("Collection address or symbol"),
        provider: z.string().default("magic-eden").describe("Provider: metaplex, magic-eden, opensea"),
      }),
      execute: async (params) => {
        const { address, provider } = params as { address: string; provider: string };
        return this.getCollection(address, provider);
      },
    });

    this.registerTool({
      name: "get_nft",
      description: "Get specific NFT details",
      parameters: z.object({
        contractAddress: z.string().describe("Contract/collection address"),
        tokenId: z.string().describe("Token ID or mint address"),
        provider: z.string().default("magic-eden").describe("Provider: metaplex, magic-eden, opensea"),
      }),
      execute: async (params) => {
        const { contractAddress, tokenId, provider } = params as {
          contractAddress: string;
          tokenId: string;
          provider: string;
        };
        return this.getNFT(contractAddress, tokenId, provider);
      },
    });

    this.registerTool({
      name: "analyze_rarity",
      description: "Analyze rarity for an NFT within its collection",
      parameters: z.object({
        collectionAddress: z.string().describe("Collection address"),
        tokenId: z.string().describe("Token ID to analyze"),
        provider: z.string().default("magic-eden").describe("Provider name"),
      }),
      execute: async (params) => {
        const { collectionAddress, tokenId, provider } = params as {
          collectionAddress: string;
          tokenId: string;
          provider: string;
        };
        return this.analyzeRarity(collectionAddress, tokenId, provider);
      },
    });

    this.registerTool({
      name: "estimate_price",
      description: "Estimate fair price for an NFT",
      parameters: z.object({
        collectionAddress: z.string().describe("Collection address"),
        tokenId: z.string().describe("Token ID"),
        provider: z.string().default("magic-eden").describe("Provider name"),
      }),
      execute: async (params) => {
        const { collectionAddress, tokenId, provider } = params as {
          collectionAddress: string;
          tokenId: string;
          provider: string;
        };
        return this.estimatePrice(collectionAddress, tokenId, provider);
      },
    });

    this.registerTool({
      name: "get_whale_holders",
      description: "Get top holders (whales) for a collection",
      parameters: z.object({
        collectionAddress: z.string().describe("Collection address"),
        provider: z.string().default("magic-eden").describe("Provider name"),
        limit: z.number().default(20).describe("Number of holders to return"),
      }),
      execute: async (params) => {
        const { collectionAddress, provider, limit } = params as {
          collectionAddress: string;
          provider: string;
          limit: number;
        };
        return this.getWhaleHolders(collectionAddress, provider, limit);
      },
    });
  }

  getSystemPrompt(): string {
    return `You are an NFT analysis expert. You can:
- Analyze NFT collections and individual NFTs
- Calculate rarity scores and rankings
- Estimate fair prices based on market data
- Track whale holders and collection stats
- Provide investment insights for NFT traders

Available providers: ${Array.from(this.providers.keys()).join(", ")}

When analyzing NFTs, consider:
1. Rarity within the collection (trait scarcity)
2. Floor price and listing activity
3. Whale concentration and holder distribution
4. Market trends and volume
5. Collection verification status`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const query = context.userQuery ?? "";

    if (!this.llmClient) {
      return this.createResult(
        false,
        null,
        "LLM client not configured. Provide apiKey in config.",
        0,
        "No LLM available for AI analysis"
      );
    }

    try {
      const response = await this.llmClient.chat([
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: query },
      ]);

      return this.createResult(
        true,
        { aiSummary: response.content },
        undefined,
        0.8,
        "AI analysis completed"
      );
    } catch (error) {
      return this.createResult(
        false,
        null,
        error instanceof Error ? error.message : "Unknown error",
        0,
        "Failed to complete AI analysis"
      );
    }
  }

  async getCollection(
    address: string,
    providerName = "magic-eden"
  ): Promise<NFTCollection | null> {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    return provider.getCollection(address);
  }

  async getNFT(
    contractAddress: string,
    tokenId: string,
    providerName = "magic-eden"
  ): Promise<NFT | null> {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    return provider.getNFT(contractAddress, tokenId);
  }

  async analyzeRarity(
    collectionAddress: string,
    tokenId: string,
    providerName = "magic-eden"
  ): Promise<RarityScore | null> {
    const provider = this.providers.get(providerName);
    if (!provider) return null;

    // Get collection NFTs for rarity calculation
    const nfts = await provider.getCollectionNFTs(collectionAddress, 100);
    if (nfts.length === 0) return null;

    const rarityMap = this.rarityAnalyzer.calculateCollectionRarity(nfts);
    return rarityMap.get(tokenId) ?? null;
  }

  async estimatePrice(
    collectionAddress: string,
    tokenId: string,
    providerName = "magic-eden"
  ): Promise<PriceEstimate | null> {
    const provider = this.providers.get(providerName);
    if (!provider) return null;

    const [collection, nfts, listings] = await Promise.all([
      provider.getCollection(collectionAddress),
      provider.getCollectionNFTs(collectionAddress, 100),
      provider.getListings(collectionAddress, 50),
    ]);

    if (!collection) return null;

    const rarityMap = this.rarityAnalyzer.calculateCollectionRarity(nfts);
    const rarity = rarityMap.get(tokenId) ?? null;
    const market = this.pricingAnalyzer.analyzeMarket(collection, listings);

    return this.pricingAnalyzer.estimatePrice(rarity, market, collection);
  }

  async getWhaleHolders(
    collectionAddress: string,
    providerName = "magic-eden",
    limit = 20
  ): Promise<Array<{ address: string; balance: number; percentage: number }>> {
    const provider = this.providers.get(providerName);
    if (!provider) return [];
    return provider.getHolders(collectionAddress, limit);
  }

  async getMarketAnalysis(
    collectionAddress: string,
    providerName = "magic-eden"
  ): Promise<MarketAnalysis | null> {
    const provider = this.providers.get(providerName);
    if (!provider) return null;

    const [collection, listings] = await Promise.all([
      provider.getCollection(collectionAddress),
      provider.getListings(collectionAddress, 100),
    ]);

    if (!collection) return null;
    return this.pricingAnalyzer.analyzeMarket(collection, listings);
  }
}
