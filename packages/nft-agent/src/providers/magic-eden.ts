import type { NFTProvider, NFT, NFTCollection, NFTListing, WhaleHolder, NFTMetadata } from "../types.js";

interface MagicEdenCollection {
  symbol?: string;
  name?: string;
  description?: string;
  image?: string;
  floorPrice?: number;
  volumeAll?: number;
  listedCount?: number;
}

interface MagicEdenNFT {
  mintAddress?: string;
  name?: string;
  image?: string;
  owner?: string;
  attributes?: Array<{
    trait_type?: string;
    value?: string;
  }>;
}

interface MagicEdenListing {
  pdaAddress?: string;
  tokenMint?: string;
  price?: number;
  seller?: string;
  expiry?: number;
}

interface MagicEdenHolder {
  owner?: string;
  tokenCount?: number;
}

export class MagicEdenProvider implements NFTProvider {
  name = "magic-eden";
  chain = "solana" as const;
  private apiKey?: string;
  private baseUrl = "https://api-mainnet.magiceden.dev/v2";

  constructor(config: { apiKey?: string } = {}) {
    this.apiKey = config.apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async getCollection(symbol: string): Promise<NFTCollection | null> {
    const data = await this.fetch<MagicEdenCollection>(`/collections/${symbol}`);
    if (!data) return null;

    return {
      address: symbol,
      name: data.name ?? symbol,
      symbol: data.symbol ?? "",
      chain: "solana",
      network: "mainnet-beta",
      totalSupply: data.listedCount ?? 0,
      floorPrice: data.floorPrice ? data.floorPrice / 1e9 : undefined,
      floorPriceCurrency: "SOL",
      volume24h: data.volumeAll,
    };
  }

  async getNFT(collectionSymbol: string, mintAddress: string): Promise<NFT | null> {
    const data = await this.fetch<MagicEdenNFT>(`/tokens/${mintAddress}`);
    if (!data) return null;

    const metadata: NFTMetadata = {
      name: data.name ?? mintAddress.slice(0, 8),
      symbol: "",
      description: "",
      image: data.image ?? "",
      attributes: data.attributes?.map((attr) => ({
        traitType: attr.trait_type ?? "",
        value: attr.value ?? "",
      })),
    };

    return {
      tokenId: mintAddress,
      contractAddress: collectionSymbol,
      chain: "solana",
      network: "mainnet-beta",
      metadata,
      owner: data.owner ?? "",
      mintAddress,
    };
  }

  async getCollectionNFTs(symbol: string, limit = 20): Promise<NFT[]> {
    const data = await this.fetch<MagicEdenNFT[]>(
      `/collections/${symbol}/listings?limit=${limit}`
    );
    if (!data) return [];

    return data.map((nft) => ({
      tokenId: nft.mintAddress ?? "",
      contractAddress: symbol,
      chain: "solana" as const,
      network: "mainnet-beta",
      metadata: {
        name: nft.name ?? "",
        symbol: "",
        description: "",
        image: nft.image ?? "",
        attributes: nft.attributes?.map((attr) => ({
          traitType: attr.trait_type ?? "",
          value: attr.value ?? "",
        })),
      },
      owner: nft.owner ?? "",
      mintAddress: nft.mintAddress,
    }));
  }

  async getFloorPrice(symbol: string): Promise<number | null> {
    const data = await this.fetch<{ floorPrice?: number }>(
      `/collections/${symbol}/stats`
    );
    if (!data?.floorPrice) return null;
    return data.floorPrice / 1e9; // Convert lamports to SOL
  }

  async getListings(symbol: string, limit = 20): Promise<NFTListing[]> {
    const data = await this.fetch<MagicEdenListing[]>(
      `/collections/${symbol}/listings?limit=${limit}`
    );
    if (!data) return [];

    return data.map((listing) => ({
      tokenId: listing.tokenMint ?? "",
      price: (listing.price ?? 0) / 1e9,
      currency: "SOL",
      marketplace: "magic-eden",
      seller: listing.seller ?? "",
      expiresAt: listing.expiry ? new Date(listing.expiry * 1000) : undefined,
    }));
  }

  async getHolders(symbol: string, limit = 20): Promise<WhaleHolder[]> {
    const data = await this.fetch<MagicEdenHolder[]>(
      `/collections/${symbol}/holder_stats?limit=${limit}`
    );
    if (!data) return [];

    const totalTokens = data.reduce((sum, h) => sum + (h.tokenCount ?? 0), 0);

    return data.map((holder) => ({
      address: holder.owner ?? "",
      balance: holder.tokenCount ?? 0,
      percentage: totalTokens > 0
        ? ((holder.tokenCount ?? 0) / totalTokens) * 100
        : 0,
    }));
  }
}
