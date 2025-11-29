import type { NFTProvider, NFT, NFTCollection, NFTListing, WhaleHolder, NFTMetadata } from "../types.js";

interface HeliusNFTResponse {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
      description?: string;
    };
    files?: Array<{ uri?: string }>;
    json_uri?: string;
  };
  ownership?: {
    owner?: string;
  };
  grouping?: Array<{ group_key?: string; group_value?: string }>;
}

interface HeliusCollectionResponse {
  items?: HeliusNFTResponse[];
  total?: number;
}

export class MetaplexProvider implements NFTProvider {
  name = "metaplex";
  chain = "solana" as const;
  private rpcUrl: string;
  private heliusApiKey?: string;

  constructor(config: { rpcUrl?: string; heliusApiKey?: string } = {}) {
    this.rpcUrl = config.rpcUrl ?? "https://api.mainnet-beta.solana.com";
    this.heliusApiKey = config.heliusApiKey;
  }

  async getCollection(address: string): Promise<NFTCollection | null> {
    if (!this.heliusApiKey) {
      return this.getCollectionBasic(address);
    }

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/token-metadata?api-key=${this.heliusApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mintAccounts: [address] }),
        }
      );
      const data = (await response.json()) as HeliusNFTResponse[];
      if (!data?.[0]) return null;

      const nft = data[0];
      return {
        address,
        name: nft.content?.metadata?.name ?? "Unknown",
        symbol: nft.content?.metadata?.symbol ?? "",
        chain: "solana",
        network: "mainnet-beta",
        totalSupply: 0,
      };
    } catch {
      return null;
    }
  }

  private async getCollectionBasic(address: string): Promise<NFTCollection | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [address, { encoding: "jsonParsed" }],
        }),
      });
      const data = (await response.json()) as { result?: { value?: unknown } };
      if (!data.result?.value) return null;

      return {
        address,
        name: address.slice(0, 8),
        symbol: address.slice(0, 4).toUpperCase(),
        chain: "solana",
        network: "mainnet-beta",
        totalSupply: 0,
      };
    } catch {
      return null;
    }
  }

  async getNFT(mintAddress: string, _tokenId: string): Promise<NFT | null> {
    if (!this.heliusApiKey) {
      return this.getNFTBasic(mintAddress);
    }

    try {
      const response = await fetch(
        `https://api.helius.xyz/v0/token-metadata?api-key=${this.heliusApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mintAccounts: [mintAddress] }),
        }
      );
      const data = (await response.json()) as HeliusNFTResponse[];
      if (!data?.[0]) return null;

      const nft = data[0];
      const metadata: NFTMetadata = {
        name: nft.content?.metadata?.name ?? "Unknown",
        symbol: nft.content?.metadata?.symbol ?? "",
        description: nft.content?.metadata?.description ?? "",
        image: nft.content?.files?.[0]?.uri ?? "",
      };

      return {
        tokenId: mintAddress,
        contractAddress: mintAddress,
        chain: "solana",
        network: "mainnet-beta",
        metadata,
        owner: nft.ownership?.owner ?? "",
        mintAddress,
      };
    } catch {
      return null;
    }
  }

  private async getNFTBasic(mintAddress: string): Promise<NFT | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [mintAddress, { encoding: "jsonParsed" }],
        }),
      });
      const data = (await response.json()) as { result?: { value?: unknown } };
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
          image: "",
        },
        owner: "",
        mintAddress,
      };
    } catch {
      return null;
    }
  }

  async getCollectionNFTs(address: string, limit = 20): Promise<NFT[]> {
    if (!this.heliusApiKey) return [];

    try {
      const response = await fetch(
        `https://api.helius.xyz/v1/nfts?api-key=${this.heliusApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: { groupKey: "collection", groupValue: address },
            options: { limit },
          }),
        }
      );
      const data = (await response.json()) as HeliusCollectionResponse;

      return (data.items ?? []).map((item) => ({
        tokenId: item.id,
        contractAddress: address,
        chain: "solana" as const,
        network: "mainnet-beta",
        metadata: {
          name: item.content?.metadata?.name ?? "Unknown",
          symbol: item.content?.metadata?.symbol ?? "",
          description: item.content?.metadata?.description ?? "",
          image: item.content?.files?.[0]?.uri ?? "",
        },
        owner: item.ownership?.owner ?? "",
        mintAddress: item.id,
      }));
    } catch {
      return [];
    }
  }

  async getFloorPrice(_address: string): Promise<number | null> {
    // Would integrate with Magic Eden API for floor price
    return null;
  }

  async getListings(_address: string, _limit = 20): Promise<NFTListing[]> {
    // Would integrate with Magic Eden API for listings
    return [];
  }

  async getHolders(_address: string, _limit = 20): Promise<WhaleHolder[]> {
    // Would need DAS API or indexer for holder data
    return [];
  }
}
