import { z } from "zod";

export const NFTMetadataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string(),
  image: z.string(),
  externalUrl: z.string().optional(),
  attributes: z.array(z.object({
    traitType: z.string(),
    value: z.union([z.string(), z.number()]),
    displayType: z.string().optional(),
  })).optional(),
  properties: z.record(z.unknown()).optional(),
});

export type NFTMetadata = z.infer<typeof NFTMetadataSchema>;

export interface NFT {
  tokenId: string;
  contractAddress: string;
  chain: "evm" | "solana";
  network: string;
  metadata: NFTMetadata;
  owner: string;
  mintAddress?: string;
}

export interface NFTCollection {
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

export interface RarityScore {
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

export interface NFTListing {
  tokenId: string;
  price: number;
  currency: string;
  marketplace: string;
  seller: string;
  expiresAt?: Date;
}

export interface WhaleHolder {
  address: string;
  balance: number;
  percentage: number;
  acquisitionDate?: Date;
}

export const NFTAgentConfigSchema = z.object({
  chain: z.enum(["evm", "solana"]).default("solana"),
  network: z.string().default("mainnet-beta"),
  openSeaApiKey: z.string().optional(),
  magicEdenApiKey: z.string().optional(),
});

export type NFTAgentConfig = z.infer<typeof NFTAgentConfigSchema>;

export interface NFTProvider {
  name: string;
  chain: "evm" | "solana";

  getCollection(address: string): Promise<NFTCollection | null>;
  getNFT(contractAddress: string, tokenId: string): Promise<NFT | null>;
  getCollectionNFTs(address: string, limit?: number): Promise<NFT[]>;
  getFloorPrice(address: string): Promise<number | null>;
  getListings(address: string, limit?: number): Promise<NFTListing[]>;
  getHolders(address: string, limit?: number): Promise<WhaleHolder[]>;
}
