// src/nft-agent.ts
import { z as z2 } from "zod";
import {
  BaseAgent,
  createLLMClient
} from "@gicm/agent-core";

// src/types.ts
import { z } from "zod";
var NFTMetadataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string(),
  image: z.string(),
  externalUrl: z.string().optional(),
  attributes: z.array(z.object({
    traitType: z.string(),
    value: z.union([z.string(), z.number()]),
    displayType: z.string().optional()
  })).optional(),
  properties: z.record(z.unknown()).optional()
});
var NFTAgentConfigSchema = z.object({
  chain: z.enum(["evm", "solana"]).default("solana"),
  network: z.string().default("mainnet-beta"),
  openSeaApiKey: z.string().optional(),
  magicEdenApiKey: z.string().optional()
});

// src/providers/metaplex.ts
var MetaplexProvider = class {
  name = "metaplex";
  chain = "solana";
  rpcUrl;
  heliusApiKey;
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl ?? "https://api.mainnet-beta.solana.com";
    this.heliusApiKey = config.heliusApiKey;
  }
  async getCollection(address) {
    if (!this.heliusApiKey) {
      return this.getCollectionBasic(address);
    }
    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/token-metadata?api-key=${this.heliusApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mintAccounts: [address] })
        }
      );
      const data = await response.json();
      if (!data?.[0]) return null;
      const nft = data[0];
      return {
        address,
        name: nft.content?.metadata?.name ?? "Unknown",
        symbol: nft.content?.metadata?.symbol ?? "",
        chain: "solana",
        network: "mainnet-beta",
        totalSupply: 0
      };
    } catch {
      return null;
    }
  }
  async getCollectionBasic(address) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [address, { encoding: "jsonParsed" }]
        })
      });
      const data = await response.json();
      if (!data.result?.value) return null;
      return {
        address,
        name: address.slice(0, 8),
        symbol: address.slice(0, 4).toUpperCase(),
        chain: "solana",
        network: "mainnet-beta",
        totalSupply: 0
      };
    } catch {
      return null;
    }
  }
  async getNFT(mintAddress, _tokenId) {
    if (!this.heliusApiKey) {
      return this.getNFTBasic(mintAddress);
    }
    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/token-metadata?api-key=${this.heliusApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mintAccounts: [mintAddress] })
        }
      );
      const data = await response.json();
      if (!data?.[0]) return null;
      const nft = data[0];
      const metadata = {
        name: nft.content?.metadata?.name ?? "Unknown",
        symbol: nft.content?.metadata?.symbol ?? "",
        description: nft.content?.metadata?.description ?? "",
        image: nft.content?.files?.[0]?.uri ?? ""
      };
      return {
        tokenId: mintAddress,
        contractAddress: mintAddress,
        chain: "solana",
        network: "mainnet-beta",
        metadata,
        owner: nft.ownership?.owner ?? "",
        mintAddress
      };
    } catch {
      return null;
    }
  }
  async getNFTBasic(mintAddress) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [mintAddress, { encoding: "jsonParsed" }]
        })
      });
      const data = await response.json();
      if (!data.result?.value) return null;
      return {
        tokenId: mintAddress,
        contractAddress: mintAddress,
        chain: "solana",
        network: "mainnet-beta",
        metadata: {
          name: mintAddress.slice(0, 8),
          symbol: "",
          description: "",
          image: ""
        },
        owner: "",
        mintAddress
      };
    } catch {
      return null;
    }
  }
  async getCollectionNFTs(address, limit = 20) {
    if (!this.heliusApiKey) return [];
    try {
      const response = await fetch(
        `https://api.helius.xyz/v1/nfts?api-key=${this.heliusApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: { groupKey: "collection", groupValue: address },
            options: { limit }
          })
        }
      );
      const data = await response.json();
      return (data.items ?? []).map((item) => ({
        tokenId: item.id,
        contractAddress: address,
        chain: "solana",
        network: "mainnet-beta",
        metadata: {
          name: item.content?.metadata?.name ?? "Unknown",
          symbol: item.content?.metadata?.symbol ?? "",
          description: item.content?.metadata?.description ?? "",
          image: item.content?.files?.[0]?.uri ?? ""
        },
        owner: item.ownership?.owner ?? "",
        mintAddress: item.id
      }));
    } catch {
      return [];
    }
  }
  async getFloorPrice(_address) {
    return null;
  }
  async getListings(_address, _limit = 20) {
    return [];
  }
  async getHolders(_address, _limit = 20) {
    return [];
  }
};

// src/providers/opensea.ts
var OpenSeaProvider = class {
  name = "opensea";
  chain = "evm";
  apiKey;
  baseUrl = "https://api.opensea.io/api/v2";
  constructor(config) {
    this.apiKey = config.apiKey;
  }
  async fetch(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "X-API-KEY": this.apiKey,
          Accept: "application/json"
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
  async getCollection(slug) {
    const data = await this.fetch(`/collections/${slug}`);
    if (!data) return null;
    return {
      address: data.contracts?.[0]?.address ?? slug,
      name: data.name ?? "Unknown",
      symbol: "",
      chain: "evm",
      network: data.contracts?.[0]?.chain ?? "ethereum",
      totalSupply: data.total_supply ?? 0,
      verified: data.safelist_status === "verified"
    };
  }
  async getNFT(contractAddress, tokenId) {
    const data = await this.fetch(
      `/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`
    );
    if (!data) return null;
    const metadata = {
      name: data.name ?? `#${tokenId}`,
      symbol: "",
      description: data.description ?? "",
      image: data.image_url ?? "",
      attributes: data.traits?.map((t) => ({
        traitType: t.trait_type ?? "",
        value: t.value ?? "",
        displayType: t.display_type
      }))
    };
    return {
      tokenId,
      contractAddress,
      chain: "evm",
      network: "ethereum",
      metadata,
      owner: data.owners?.[0]?.address ?? ""
    };
  }
  async getCollectionNFTs(slug, limit = 20) {
    const data = await this.fetch(
      `/collection/${slug}/nfts?limit=${limit}`
    );
    if (!data?.nfts) return [];
    return data.nfts.map((nft) => ({
      tokenId: nft.identifier ?? "",
      contractAddress: nft.contract ?? "",
      chain: "evm",
      network: "ethereum",
      metadata: {
        name: nft.name ?? `#${nft.identifier}`,
        symbol: "",
        description: nft.description ?? "",
        image: nft.image_url ?? "",
        attributes: nft.traits?.map((t) => ({
          traitType: t.trait_type ?? "",
          value: t.value ?? "",
          displayType: t.display_type
        }))
      },
      owner: nft.owners?.[0]?.address ?? ""
    }));
  }
  async getFloorPrice(slug) {
    const data = await this.fetch(
      `/collections/${slug}/stats`
    );
    return data?.total?.floor_price ?? null;
  }
  async getListings(slug, limit = 20) {
    const data = await this.fetch(
      `/listings/collection/${slug}/all?limit=${limit}`
    );
    if (!data?.listings) return [];
    return data.listings.map((listing) => ({
      tokenId: listing.order_hash ?? "",
      price: parseFloat(listing.price?.current?.value ?? "0") / Math.pow(10, listing.price?.current?.decimals ?? 18),
      currency: listing.price?.current?.currency ?? "ETH",
      marketplace: "opensea",
      seller: listing.protocol_data?.parameters?.offerer ?? "",
      expiresAt: listing.protocol_data?.parameters?.endTime ? new Date(parseInt(listing.protocol_data.parameters.endTime) * 1e3) : void 0
    }));
  }
  async getHolders(_address, _limit = 20) {
    return [];
  }
};

// src/providers/magic-eden.ts
var MagicEdenProvider = class {
  name = "magic-eden";
  chain = "solana";
  apiKey;
  baseUrl = "https://api-mainnet.magiceden.dev/v2";
  constructor(config = {}) {
    this.apiKey = config.apiKey;
  }
  async fetch(endpoint) {
    try {
      const headers = {
        Accept: "application/json"
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }
      const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
  async getCollection(symbol) {
    const data = await this.fetch(`/collections/${symbol}`);
    if (!data) return null;
    return {
      address: symbol,
      name: data.name ?? symbol,
      symbol: data.symbol ?? "",
      chain: "solana",
      network: "mainnet-beta",
      totalSupply: data.listedCount ?? 0,
      floorPrice: data.floorPrice ? data.floorPrice / 1e9 : void 0,
      floorPriceCurrency: "SOL",
      volume24h: data.volumeAll
    };
  }
  async getNFT(collectionSymbol, mintAddress) {
    const data = await this.fetch(`/tokens/${mintAddress}`);
    if (!data) return null;
    const metadata = {
      name: data.name ?? mintAddress.slice(0, 8),
      symbol: "",
      description: "",
      image: data.image ?? "",
      attributes: data.attributes?.map((attr) => ({
        traitType: attr.trait_type ?? "",
        value: attr.value ?? ""
      }))
    };
    return {
      tokenId: mintAddress,
      contractAddress: collectionSymbol,
      chain: "solana",
      network: "mainnet-beta",
      metadata,
      owner: data.owner ?? "",
      mintAddress
    };
  }
  async getCollectionNFTs(symbol, limit = 20) {
    const data = await this.fetch(
      `/collections/${symbol}/listings?limit=${limit}`
    );
    if (!data) return [];
    return data.map((nft) => ({
      tokenId: nft.mintAddress ?? "",
      contractAddress: symbol,
      chain: "solana",
      network: "mainnet-beta",
      metadata: {
        name: nft.name ?? "",
        symbol: "",
        description: "",
        image: nft.image ?? "",
        attributes: nft.attributes?.map((attr) => ({
          traitType: attr.trait_type ?? "",
          value: attr.value ?? ""
        }))
      },
      owner: nft.owner ?? "",
      mintAddress: nft.mintAddress
    }));
  }
  async getFloorPrice(symbol) {
    const data = await this.fetch(
      `/collections/${symbol}/stats`
    );
    if (!data?.floorPrice) return null;
    return data.floorPrice / 1e9;
  }
  async getListings(symbol, limit = 20) {
    const data = await this.fetch(
      `/collections/${symbol}/listings?limit=${limit}`
    );
    if (!data) return [];
    return data.map((listing) => ({
      tokenId: listing.tokenMint ?? "",
      price: (listing.price ?? 0) / 1e9,
      currency: "SOL",
      marketplace: "magic-eden",
      seller: listing.seller ?? "",
      expiresAt: listing.expiry ? new Date(listing.expiry * 1e3) : void 0
    }));
  }
  async getHolders(symbol, limit = 20) {
    const data = await this.fetch(
      `/collections/${symbol}/holder_stats?limit=${limit}`
    );
    if (!data) return [];
    const totalTokens = data.reduce((sum, h) => sum + (h.tokenCount ?? 0), 0);
    return data.map((holder) => ({
      address: holder.owner ?? "",
      balance: holder.tokenCount ?? 0,
      percentage: totalTokens > 0 ? (holder.tokenCount ?? 0) / totalTokens * 100 : 0
    }));
  }
};

// src/analyzers/rarity.ts
var RarityAnalyzer = class {
  calculateCollectionRarity(nfts) {
    if (nfts.length === 0) return /* @__PURE__ */ new Map();
    const traitFrequencies = this.calculateTraitFrequencies(nfts);
    const rarityScores = /* @__PURE__ */ new Map();
    const scores = [];
    for (const nft of nfts) {
      const traitScores = this.calculateTraitScores(nft, traitFrequencies, nfts.length);
      const totalScore = traitScores.reduce((sum, t) => sum + t.score, 0);
      scores.push({ tokenId: nft.tokenId, score: totalScore });
      rarityScores.set(nft.tokenId, {
        tokenId: nft.tokenId,
        rank: 0,
        // Will be set after sorting
        score: totalScore,
        traitScores
      });
    }
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((item, index) => {
      const rarityScore = rarityScores.get(item.tokenId);
      if (rarityScore) {
        rarityScore.rank = index + 1;
      }
    });
    return rarityScores;
  }
  calculateTraitFrequencies(nfts) {
    const traitCounts = /* @__PURE__ */ new Map();
    for (const nft of nfts) {
      const attributes = nft.metadata.attributes ?? [];
      for (const attr of attributes) {
        const key = `${attr.traitType}:${attr.value}`;
        traitCounts.set(key, (traitCounts.get(key) ?? 0) + 1);
      }
    }
    const frequencies = [];
    for (const [key, count] of traitCounts) {
      const [traitType, value] = key.split(":");
      frequencies.push({
        traitType: traitType ?? "",
        value: value ?? "",
        count,
        frequency: count / nfts.length
      });
    }
    return frequencies;
  }
  calculateTraitScores(nft, frequencies, totalNFTs) {
    const attributes = nft.metadata.attributes ?? [];
    const traitScores = [];
    for (const attr of attributes) {
      const frequency = frequencies.find(
        (f) => f.traitType === attr.traitType && f.value === String(attr.value)
      );
      if (frequency) {
        const rarity = frequency.frequency;
        const score = 1 / frequency.frequency;
        traitScores.push({
          traitType: attr.traitType,
          value: String(attr.value),
          rarity,
          score
        });
      }
    }
    const avgTraits = totalNFTs > 0 ? frequencies.length / totalNFTs : attributes.length;
    if (attributes.length !== avgTraits) {
      const traitCountRarity = Math.abs(attributes.length - avgTraits) / avgTraits;
      traitScores.push({
        traitType: "_trait_count",
        value: String(attributes.length),
        rarity: traitCountRarity,
        score: traitCountRarity * 10
        // Weight for trait count bonus
      });
    }
    return traitScores;
  }
  calculateSingleNFTRarity(nft, collectionNFTs) {
    const allScores = this.calculateCollectionRarity(collectionNFTs);
    return allScores.get(nft.tokenId) ?? null;
  }
  getRarityTier(rank, totalSupply) {
    const percentile = rank / totalSupply * 100;
    if (percentile <= 1) return "Legendary";
    if (percentile <= 5) return "Epic";
    if (percentile <= 15) return "Rare";
    if (percentile <= 35) return "Uncommon";
    return "Common";
  }
};

// src/analyzers/pricing.ts
var PricingAnalyzer = class {
  analyzeMarket(collection, listings) {
    const prices = listings.map((l) => l.price).sort((a, b) => a - b);
    if (prices.length === 0) {
      return {
        floorPrice: collection.floorPrice ?? 0,
        avgListingPrice: 0,
        medianListingPrice: 0,
        priceRange: { min: 0, max: 0 },
        volumeTrend: "stable",
        listingCount: 0
      };
    }
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;
    const median = prices.length % 2 === 0 ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2 : prices[Math.floor(prices.length / 2)];
    return {
      floorPrice: collection.floorPrice ?? prices[0] ?? 0,
      avgListingPrice: avg,
      medianListingPrice: median,
      priceRange: { min: prices[0] ?? 0, max: prices[prices.length - 1] ?? 0 },
      volumeTrend: this.determineVolumeTrend(collection),
      listingCount: listings.length
    };
  }
  determineVolumeTrend(collection) {
    return "stable";
  }
  estimatePrice(rarity, market, collection) {
    const factors = [];
    let basePrice = market.floorPrice || 0;
    let multiplier = 1;
    if (rarity && collection.totalSupply > 0) {
      const rarityPercentile = rarity.rank / collection.totalSupply * 100;
      let rarityMultiplier = 1;
      if (rarityPercentile <= 1) {
        rarityMultiplier = 5;
      } else if (rarityPercentile <= 5) {
        rarityMultiplier = 3;
      } else if (rarityPercentile <= 15) {
        rarityMultiplier = 1.8;
      } else if (rarityPercentile <= 35) {
        rarityMultiplier = 1.3;
      }
      factors.push({
        name: "Rarity",
        impact: rarityMultiplier,
        description: `Rank ${rarity.rank}/${collection.totalSupply} (top ${rarityPercentile.toFixed(1)}%)`
      });
      multiplier *= rarityMultiplier;
    }
    if (market.listingCount > 0) {
      const listingRatio = market.listingCount / Math.max(collection.totalSupply, 1);
      let liquidityMultiplier = 1;
      if (listingRatio < 0.05) {
        liquidityMultiplier = 1.2;
        factors.push({
          name: "Low Supply",
          impact: liquidityMultiplier,
          description: `Only ${(listingRatio * 100).toFixed(1)}% listed`
        });
      } else if (listingRatio > 0.3) {
        liquidityMultiplier = 0.9;
        factors.push({
          name: "High Supply",
          impact: liquidityMultiplier,
          description: `${(listingRatio * 100).toFixed(1)}% of collection listed`
        });
      }
      multiplier *= liquidityMultiplier;
    }
    if (market.volumeTrend === "increasing") {
      factors.push({
        name: "Rising Demand",
        impact: 1.1,
        description: "Volume trending upward"
      });
      multiplier *= 1.1;
    } else if (market.volumeTrend === "decreasing") {
      factors.push({
        name: "Falling Demand",
        impact: 0.9,
        description: "Volume trending downward"
      });
      multiplier *= 0.9;
    }
    const estimatedPrice = basePrice * multiplier;
    let confidence = 0.5;
    if (market.listingCount >= 10) confidence += 0.2;
    if (rarity) confidence += 0.2;
    if (market.floorPrice > 0) confidence += 0.1;
    return {
      lowEstimate: estimatedPrice * 0.8,
      midEstimate: estimatedPrice,
      highEstimate: estimatedPrice * 1.5,
      confidence: Math.min(confidence, 1),
      factors
    };
  }
  suggestListingPrice(estimate, strategy = "moderate") {
    switch (strategy) {
      case "aggressive":
        return estimate.highEstimate;
      case "conservative":
        return estimate.lowEstimate;
      case "moderate":
      default:
        return estimate.midEstimate;
    }
  }
};

// src/nft-agent.ts
var NFTAgent = class extends BaseAgent {
  providers = /* @__PURE__ */ new Map();
  rarityAnalyzer;
  pricingAnalyzer;
  nftConfig;
  llmClient;
  constructor(config) {
    const validatedConfig = NFTAgentConfigSchema.parse(config);
    super("nft-agent", config);
    this.nftConfig = validatedConfig;
    this.rarityAnalyzer = new RarityAnalyzer();
    this.pricingAnalyzer = new PricingAnalyzer();
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096
      });
    }
    this.initializeProviders(validatedConfig);
    this.initializeTools();
  }
  initializeProviders(config) {
    this.providers.set("metaplex", new MetaplexProvider());
    this.providers.set("magic-eden", new MagicEdenProvider({
      apiKey: config.magicEdenApiKey
    }));
    if (config.openSeaApiKey) {
      this.providers.set("opensea", new OpenSeaProvider({
        apiKey: config.openSeaApiKey
      }));
    }
  }
  initializeTools() {
    this.registerTool({
      name: "get_collection",
      description: "Get NFT collection info including floor price and stats",
      parameters: z2.object({
        address: z2.string().describe("Collection address or symbol"),
        provider: z2.string().default("magic-eden").describe("Provider: metaplex, magic-eden, opensea")
      }),
      execute: async (params) => {
        const { address, provider } = params;
        return this.getCollection(address, provider);
      }
    });
    this.registerTool({
      name: "get_nft",
      description: "Get specific NFT details",
      parameters: z2.object({
        contractAddress: z2.string().describe("Contract/collection address"),
        tokenId: z2.string().describe("Token ID or mint address"),
        provider: z2.string().default("magic-eden").describe("Provider: metaplex, magic-eden, opensea")
      }),
      execute: async (params) => {
        const { contractAddress, tokenId, provider } = params;
        return this.getNFT(contractAddress, tokenId, provider);
      }
    });
    this.registerTool({
      name: "analyze_rarity",
      description: "Analyze rarity for an NFT within its collection",
      parameters: z2.object({
        collectionAddress: z2.string().describe("Collection address"),
        tokenId: z2.string().describe("Token ID to analyze"),
        provider: z2.string().default("magic-eden").describe("Provider name")
      }),
      execute: async (params) => {
        const { collectionAddress, tokenId, provider } = params;
        return this.analyzeRarity(collectionAddress, tokenId, provider);
      }
    });
    this.registerTool({
      name: "estimate_price",
      description: "Estimate fair price for an NFT",
      parameters: z2.object({
        collectionAddress: z2.string().describe("Collection address"),
        tokenId: z2.string().describe("Token ID"),
        provider: z2.string().default("magic-eden").describe("Provider name")
      }),
      execute: async (params) => {
        const { collectionAddress, tokenId, provider } = params;
        return this.estimatePrice(collectionAddress, tokenId, provider);
      }
    });
    this.registerTool({
      name: "get_whale_holders",
      description: "Get top holders (whales) for a collection",
      parameters: z2.object({
        collectionAddress: z2.string().describe("Collection address"),
        provider: z2.string().default("magic-eden").describe("Provider name"),
        limit: z2.number().default(20).describe("Number of holders to return")
      }),
      execute: async (params) => {
        const { collectionAddress, provider, limit } = params;
        return this.getWhaleHolders(collectionAddress, provider, limit);
      }
    });
  }
  getSystemPrompt() {
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
  async analyze(context) {
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
        { role: "user", content: query }
      ]);
      return this.createResult(
        true,
        { aiSummary: response.content },
        void 0,
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
  async getCollection(address, providerName = "magic-eden") {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    return provider.getCollection(address);
  }
  async getNFT(contractAddress, tokenId, providerName = "magic-eden") {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    return provider.getNFT(contractAddress, tokenId);
  }
  async analyzeRarity(collectionAddress, tokenId, providerName = "magic-eden") {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    const nfts = await provider.getCollectionNFTs(collectionAddress, 100);
    if (nfts.length === 0) return null;
    const rarityMap = this.rarityAnalyzer.calculateCollectionRarity(nfts);
    return rarityMap.get(tokenId) ?? null;
  }
  async estimatePrice(collectionAddress, tokenId, providerName = "magic-eden") {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    const [collection, nfts, listings] = await Promise.all([
      provider.getCollection(collectionAddress),
      provider.getCollectionNFTs(collectionAddress, 100),
      provider.getListings(collectionAddress, 50)
    ]);
    if (!collection) return null;
    const rarityMap = this.rarityAnalyzer.calculateCollectionRarity(nfts);
    const rarity = rarityMap.get(tokenId) ?? null;
    const market = this.pricingAnalyzer.analyzeMarket(collection, listings);
    return this.pricingAnalyzer.estimatePrice(rarity, market, collection);
  }
  async getWhaleHolders(collectionAddress, providerName = "magic-eden", limit = 20) {
    const provider = this.providers.get(providerName);
    if (!provider) return [];
    return provider.getHolders(collectionAddress, limit);
  }
  async getMarketAnalysis(collectionAddress, providerName = "magic-eden") {
    const provider = this.providers.get(providerName);
    if (!provider) return null;
    const [collection, listings] = await Promise.all([
      provider.getCollection(collectionAddress),
      provider.getListings(collectionAddress, 100)
    ]);
    if (!collection) return null;
    return this.pricingAnalyzer.analyzeMarket(collection, listings);
  }
};
export {
  MagicEdenProvider,
  MetaplexProvider,
  NFTAgent,
  NFTAgentConfigSchema,
  NFTMetadataSchema,
  OpenSeaProvider,
  PricingAnalyzer,
  RarityAnalyzer
};
//# sourceMappingURL=index.js.map