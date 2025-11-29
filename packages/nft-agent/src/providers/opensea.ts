import type { NFTProvider, NFT, NFTCollection, NFTListing, WhaleHolder, NFTMetadata } from "../types.js";

interface OpenSeaCollection {
  collection?: string;
  name?: string;
  description?: string;
  image_url?: string;
  banner_image_url?: string;
  owner?: string;
  safelist_status?: string;
  category?: string;
  is_disabled?: boolean;
  is_nsfw?: boolean;
  trait_offers_enabled?: boolean;
  collection_offers_enabled?: boolean;
  opensea_url?: string;
  project_url?: string;
  wiki_url?: string;
  discord_url?: string;
  telegram_url?: string;
  twitter_username?: string;
  instagram_username?: string;
  contracts?: Array<{
    address?: string;
    chain?: string;
  }>;
  total_supply?: number;
}

interface OpenSeaNFT {
  identifier?: string;
  collection?: string;
  contract?: string;
  token_standard?: string;
  name?: string;
  description?: string;
  image_url?: string;
  metadata_url?: string;
  owners?: Array<{ address?: string; quantity?: number }>;
  traits?: Array<{
    trait_type?: string;
    value?: string;
    display_type?: string;
  }>;
}

interface OpenSeaListing {
  order_hash?: string;
  chain?: string;
  type?: string;
  price?: {
    current?: {
      currency?: string;
      decimals?: number;
      value?: string;
    };
  };
  protocol_data?: {
    parameters?: {
      offerer?: string;
      endTime?: string;
    };
  };
}

interface OpenSeaListingsResponse {
  listings?: OpenSeaListing[];
}

interface OpenSeaNFTsResponse {
  nfts?: OpenSeaNFT[];
}

export class OpenSeaProvider implements NFTProvider {
  name = "opensea";
  chain = "evm" as const;
  private apiKey: string;
  private baseUrl = "https://api.opensea.io/api/v2";

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "X-API-KEY": this.apiKey,
          Accept: "application/json",
        },
      });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  async getCollection(slug: string): Promise<NFTCollection | null> {
    const data = await this.fetch<OpenSeaCollection>(`/collections/${slug}`);
    if (!data) return null;

    return {
      address: data.contracts?.[0]?.address ?? slug,
      name: data.name ?? "Unknown",
      symbol: "",
      chain: "evm",
      network: data.contracts?.[0]?.chain ?? "ethereum",
      totalSupply: data.total_supply ?? 0,
      verified: data.safelist_status === "verified",
    };
  }

  async getNFT(contractAddress: string, tokenId: string): Promise<NFT | null> {
    const data = await this.fetch<OpenSeaNFT>(
      `/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`
    );
    if (!data) return null;

    const metadata: NFTMetadata = {
      name: data.name ?? `#${tokenId}`,
      symbol: "",
      description: data.description ?? "",
      image: data.image_url ?? "",
      attributes: data.traits?.map((t) => ({
        traitType: t.trait_type ?? "",
        value: t.value ?? "",
        displayType: t.display_type,
      })),
    };

    return {
      tokenId,
      contractAddress,
      chain: "evm",
      network: "ethereum",
      metadata,
      owner: data.owners?.[0]?.address ?? "",
    };
  }

  async getCollectionNFTs(slug: string, limit = 20): Promise<NFT[]> {
    const data = await this.fetch<OpenSeaNFTsResponse>(
      `/collection/${slug}/nfts?limit=${limit}`
    );
    if (!data?.nfts) return [];

    return data.nfts.map((nft) => ({
      tokenId: nft.identifier ?? "",
      contractAddress: nft.contract ?? "",
      chain: "evm" as const,
      network: "ethereum",
      metadata: {
        name: nft.name ?? `#${nft.identifier}`,
        symbol: "",
        description: nft.description ?? "",
        image: nft.image_url ?? "",
        attributes: nft.traits?.map((t) => ({
          traitType: t.trait_type ?? "",
          value: t.value ?? "",
          displayType: t.display_type,
        })),
      },
      owner: nft.owners?.[0]?.address ?? "",
    }));
  }

  async getFloorPrice(slug: string): Promise<number | null> {
    const data = await this.fetch<{ total?: { floor_price?: number } }>(
      `/collections/${slug}/stats`
    );
    return data?.total?.floor_price ?? null;
  }

  async getListings(slug: string, limit = 20): Promise<NFTListing[]> {
    const data = await this.fetch<OpenSeaListingsResponse>(
      `/listings/collection/${slug}/all?limit=${limit}`
    );
    if (!data?.listings) return [];

    return data.listings.map((listing) => ({
      tokenId: listing.order_hash ?? "",
      price: parseFloat(listing.price?.current?.value ?? "0") /
        Math.pow(10, listing.price?.current?.decimals ?? 18),
      currency: listing.price?.current?.currency ?? "ETH",
      marketplace: "opensea",
      seller: listing.protocol_data?.parameters?.offerer ?? "",
      expiresAt: listing.protocol_data?.parameters?.endTime
        ? new Date(parseInt(listing.protocol_data.parameters.endTime) * 1000)
        : undefined,
    }));
  }

  async getHolders(_address: string, _limit = 20): Promise<WhaleHolder[]> {
    // OpenSea API doesn't provide holder data directly
    // Would need to use on-chain data or other providers
    return [];
  }
}
