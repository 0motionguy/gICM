import type { GovernancePlatform, DAO, Proposal, Vote, VotingPower } from "../types.js";

interface RealmsRPCResponse<T> {
  jsonrpc: string;
  result?: T;
  id: number;
}

interface RealmAccount {
  pubkey: string;
  account: {
    data: {
      parsed?: {
        info?: {
          name?: string;
          communityMint?: string;
          councilMint?: string;
          authority?: string;
        };
      };
    };
  };
}

interface ProposalAccount {
  pubkey: string;
  account: {
    data: {
      parsed?: {
        info?: {
          name?: string;
          descriptionLink?: string;
          state?: number;
          draftAt?: number;
          signingOffAt?: number;
          votingAt?: number;
          votingCompletedAt?: number;
          executingAt?: number;
          closedAt?: number;
          options?: Array<{
            label: string;
            voteWeight: string;
          }>;
        };
      };
    };
  };
}

export class RealmsProvider implements GovernancePlatform {
  name = "realms";
  platform = "realms" as const;
  private rpcUrl: string;

  constructor(rpcUrl = "https://api.mainnet-beta.solana.com") {
    this.rpcUrl = rpcUrl;
  }

  private async rpc<T>(method: string, params: unknown[]): Promise<T | null> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
      });
      const data = (await response.json()) as RealmsRPCResponse<T>;
      return data.result ?? null;
    } catch (error) {
      console.error("Realms RPC failed:", error);
      return null;
    }
  }

  async getDAO(realmPubkey: string): Promise<DAO | null> {
    try {
      // Get realm account info
      const result = await this.rpc<RealmAccount["account"]>("getAccountInfo", [
        realmPubkey,
        { encoding: "jsonParsed" },
      ]);

      if (!result) return null;

      const info = result.data?.parsed?.info;

      return {
        id: realmPubkey,
        name: info?.name ?? realmPubkey.slice(0, 8),
        platform: "realms",
        network: "solana",
      };
    } catch {
      return null;
    }
  }

  async getProposals(realmPubkey: string, _state?: string): Promise<Proposal[]> {
    // Realms uses getProgramAccounts with specific filters
    // This is a simplified implementation - full version would need
    // the governance program ID and proper account parsing

    try {
      // In practice, you'd query the Realms API or index the blockchain
      // For now, return empty array as direct RPC querying is complex
      return [];
    } catch {
      return [];
    }
  }

  async getProposal(proposalPubkey: string): Promise<Proposal | null> {
    try {
      const result = await this.rpc<ProposalAccount["account"]>("getAccountInfo", [
        proposalPubkey,
        { encoding: "jsonParsed" },
      ]);

      if (!result) return null;

      const info = result.data?.parsed?.info;
      if (!info) return null;

      const options = info.options ?? [];
      const choices = options.map((o) => o.label);
      const scores = options.map((o) => parseFloat(o.voteWeight));

      return {
        id: proposalPubkey,
        title: info.name ?? "Untitled",
        body: info.descriptionLink ?? "",
        author: "",
        state: this.mapState(info.state ?? 0),
        start: new Date((info.votingAt ?? 0) * 1000),
        end: new Date((info.votingCompletedAt ?? Date.now() / 1000) * 1000),
        choices,
        scores,
        quorum: 0,
        totalVotes: scores.reduce((a, b) => a + b, 0),
        platform: "realms",
        link: `https://realms.today/dao/${proposalPubkey}`,
      };
    } catch {
      return null;
    }
  }

  private mapState(state: number): Proposal["state"] {
    // Realms proposal states:
    // 0 = Draft, 1 = SigningOff, 2 = Voting, 3 = Succeeded,
    // 4 = Executing, 5 = Completed, 6 = Cancelled, 7 = Defeated
    switch (state) {
      case 0:
      case 1:
        return "pending";
      case 2:
        return "active";
      case 3:
      case 4:
      case 5:
        return "executed";
      case 6:
      case 7:
        return "defeated";
      default:
        return "closed";
    }
  }

  async getVotes(_proposalPubkey: string, _limit = 100): Promise<Vote[]> {
    // Realms votes are stored in VoteRecord accounts
    // Would need to query getProgramAccounts with filters
    return [];
  }

  async getVotingPower(realmPubkey: string, address: string): Promise<VotingPower | null> {
    // Would need to check token holdings and delegation
    // Simplified implementation
    try {
      const dao = await this.getDAO(realmPubkey);
      if (!dao) return null;

      return {
        address,
        power: 0,
        percentage: 0,
      };
    } catch {
      return null;
    }
  }
}
