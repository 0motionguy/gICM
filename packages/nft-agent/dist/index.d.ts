import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';
import { z } from 'zod';

declare const NFTMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    symbol: z.ZodString;
    description: z.ZodString;
    image: z.ZodString;
    externalUrl: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        traitType: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        displayType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string | number;
        traitType: string;
        displayType?: string | undefined;
    }, {
        value: string | number;
        traitType: string;
        displayType?: string | undefined;
    }>, "many">>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    name: string;
    description: string;
    image: string;
    externalUrl?: string | undefined;
    attributes?: {
        value: string | number;
        traitType: string;
        displayType?: string | undefined;
    }[] | undefined;
    properties?: Record<string, unknown> | undefined;
}, {
    symbol: string;
    name: string;
    description: string;
    image: string;
    externalUrl?: string | undefined;
    attributes?: {
        value: string | number;
        traitType: string;
        displayType?: string | undefined;
    }[] | undefined;
    properties?: Record<string, unknown> | undefined;
}>;
type NFTMetadata = z.infer<typeof NFTMetadataSchema>;
interface NFT {
    tokenId: string;
    contractAddress: string;
    chain: "evm" | "solana";
    network: string;
    metadata: NFTMetadata;
    owner: string;
    mintAddress?: string;
}
interface NFTCollection {
    address: string;
    name: string;
    symbol: string;
    chain: "evm" | "solana";
    network: string;
    totalSupply: number;
    floorPrice?: number;
    floorPriceCurrency?: string;
    volume24h?: number;
    owners?: number;
    verified?: boolean;
}
interface RarityScore {
    tokenId: string;
    rank: number;
    score: number;
    traitScores: Array<{
        traitType: string;
        value: string;
        rarity: number;
        score: number;
    }>;
}
interface NFTListing {
    tokenId: string;
    price: number;
    currency: string;
    marketplace: string;
    seller: string;
    expiresAt?: Date;
}
interface WhaleHolder {
    address: string;
    balance: number;
    percentage: number;
    acquisitionDate?: Date;
}
declare const NFTAgentConfigSchema: z.ZodObject<{
    chain: z.ZodDefault<z.ZodEnum<["evm", "solana"]>>;
    network: z.ZodDefault<z.ZodString>;
    openSeaApiKey: z.ZodOptional<z.ZodString>;
    magicEdenApiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    chain: "evm" | "solana";
    network: string;
    openSeaApiKey?: string | undefined;
    magicEdenApiKey?: string | undefined;
}, {
    chain?: "evm" | "solana" | undefined;
    network?: string | undefined;
    openSeaApiKey?: string | undefined;
    magicEdenApiKey?: string | undefined;
}>;
type NFTAgentConfig = z.infer<typeof NFTAgentConfigSchema>;
interface NFTProvider {
    name: string;
    chain: "evm" | "solana";
    getCollection(address: string): Promise<NFTCollection | null>;
    getNFT(contractAddress: string, tokenId: string): Promise<NFT | null>;
    getCollectionNFTs(address: string, limit?: number): Promise<NFT[]>;
    getFloorPrice(address: string): Promise<number | null>;
    getListings(address: string, limit?: number): Promise<NFTListing[]>;
    getHolders(address: string, limit?: number): Promise<WhaleHolder[]>;
}

interface PriceEstimate {
    lowEstimate: number;
    midEstimate: number;
    highEstimate: number;
    confidence: number;
    factors: PriceFactor[];
}
interface PriceFactor {
    name: string;
    impact: number;
    description: string;
}
interface MarketAnalysis {
    floorPrice: number;
    avgListingPrice: number;
    medianListingPrice: number;
    priceRange: {
        min: number;
        max: number;
    };
    volumeTrend: "increasing" | "decreasing" | "stable";
    listingCount: number;
}
declare class PricingAnalyzer {
    analyzeMarket(collection: NFTCollection, listings: NFTListing[]): MarketAnalysis;
    private determineVolumeTrend;
    estimatePrice(rarity: RarityScore | null, market: MarketAnalysis, collection: NFTCollection): PriceEstimate;
    suggestListingPrice(estimate: PriceEstimate, strategy?: "aggressive" | "moderate" | "conservative"): number;
}

interface NFTAgentAnalysis {
    collection?: NFTCollection;
    nft?: NFT;
    rarity?: RarityScore;
    priceEstimate?: PriceEstimate;
    market?: MarketAnalysis;
    whaleHolders?: Array<{
        address: string;
        balance: number;
        percentage: number;
    }>;
    aiSummary?: string;
}
declare class NFTAgent extends BaseAgent {
    private providers;
    private rarityAnalyzer;
    private pricingAnalyzer;
    private nftConfig;
    private llmClient?;
    constructor(config: NFTAgentConfig & AgentConfig);
    private initializeProviders;
    private initializeTools;
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    getCollection(address: string, providerName?: string): Promise<NFTCollection | null>;
    getNFT(contractAddress: string, tokenId: string, providerName?: string): Promise<NFT | null>;
    analyzeRarity(collectionAddress: string, tokenId: string, providerName?: string): Promise<RarityScore | null>;
    estimatePrice(collectionAddress: string, tokenId: string, providerName?: string): Promise<PriceEstimate | null>;
    getWhaleHolders(collectionAddress: string, providerName?: string, limit?: number): Promise<Array<{
        address: string;
        balance: number;
        percentage: number;
    }>>;
    getMarketAnalysis(collectionAddress: string, providerName?: string): Promise<MarketAnalysis | null>;
}

declare class MetaplexProvider implements NFTProvider {
    name: string;
    chain: "solana";
    private rpcUrl;
    private heliusApiKey?;
    constructor(config?: {
        rpcUrl?: string;
        heliusApiKey?: string;
    });
    getCollection(address: string): Promise<NFTCollection | null>;
    private getCollectionBasic;
    getNFT(mintAddress: string, _tokenId: string): Promise<NFT | null>;
    private getNFTBasic;
    getCollectionNFTs(address: string, limit?: number): Promise<NFT[]>;
    getFloorPrice(_address: string): Promise<number | null>;
    getListings(_address: string, _limit?: number): Promise<NFTListing[]>;
    getHolders(_address: string, _limit?: number): Promise<WhaleHolder[]>;
}

declare class OpenSeaProvider implements NFTProvider {
    name: string;
    chain: "evm";
    private apiKey;
    private baseUrl;
    constructor(config: {
        apiKey: string;
    });
    private fetch;
    getCollection(slug: string): Promise<NFTCollection | null>;
    getNFT(contractAddress: string, tokenId: string): Promise<NFT | null>;
    getCollectionNFTs(slug: string, limit?: number): Promise<NFT[]>;
    getFloorPrice(slug: string): Promise<number | null>;
    getListings(slug: string, limit?: number): Promise<NFTListing[]>;
    getHolders(_address: string, _limit?: number): Promise<WhaleHolder[]>;
}

declare class MagicEdenProvider implements NFTProvider {
    name: string;
    chain: "solana";
    private apiKey?;
    private baseUrl;
    constructor(config?: {
        apiKey?: string;
    });
    private fetch;
    getCollection(symbol: string): Promise<NFTCollection | null>;
    getNFT(collectionSymbol: string, mintAddress: string): Promise<NFT | null>;
    getCollectionNFTs(symbol: string, limit?: number): Promise<NFT[]>;
    getFloorPrice(symbol: string): Promise<number | null>;
    getListings(symbol: string, limit?: number): Promise<NFTListing[]>;
    getHolders(symbol: string, limit?: number): Promise<WhaleHolder[]>;
}

declare class RarityAnalyzer {
    calculateCollectionRarity(nfts: NFT[]): Map<string, RarityScore>;
    private calculateTraitFrequencies;
    private calculateTraitScores;
    calculateSingleNFTRarity(nft: NFT, collectionNFTs: NFT[]): RarityScore | null;
    getRarityTier(rank: number, totalSupply: number): string;
}

export { MagicEdenProvider, type MarketAnalysis, MetaplexProvider, type NFT, NFTAgent, type NFTAgentAnalysis, type NFTAgentConfig, NFTAgentConfigSchema, type NFTCollection, type NFTListing, type NFTMetadata, NFTMetadataSchema, type NFTProvider, OpenSeaProvider, type PriceEstimate, type PriceFactor, PricingAnalyzer, RarityAnalyzer, type RarityScore, type WhaleHolder };
