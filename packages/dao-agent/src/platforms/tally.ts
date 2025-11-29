import type { GovernancePlatform, DAO, Proposal, Vote, VotingPower } from "../types.js";

interface TallyOrganization {
  id: string;
  name: string;
  slug: string;
  chainIds: string[];
  governorIds: string[];
  proposalsCount?: number;
  website?: string;
  twitter?: string;
}

interface TallyProposal {
  id: string;
  title: string;
  description: string;
  proposer: { address: string };
  status: string;
  start: { timestamp: string };
  end: { timestamp: string };
  voteStats: Array<{
    support: string;
    weight: string;
    votes: string;
  }>;
  quorum: string;
}

interface TallyVote {
  voter: { address: string };
  support: string;
  weight: string;
  block: { timestamp: string };
  reason?: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class TallyProvider implements GovernancePlatform {
  name = "tally";
  platform = "tally" as const;
  private apiKey: string;
  private baseUrl = "https://api.tally.xyz/query";

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.apiKey,
        },
        body: JSON.stringify({ query, variables }),
      });
      const data = (await response.json()) as GraphQLResponse<T>;
      if (data.errors) {
        console.error("Tally GraphQL errors:", data.errors);
        return null;
      }
      return data.data ?? null;
    } catch (error) {
      console.error("Tally query failed:", error);
      return null;
    }
  }

  async getDAO(slug: string): Promise<DAO | null> {
    const query = `
      query Organization($slug: String!) {
        organization(slug: $slug) {
          id
          name
          slug
          chainIds
          governorIds
          proposalsCount
          website
          twitter
        }
      }
    `;

    const result = await this.query<{ organization: TallyOrganization }>(query, { slug });
    if (!result?.organization) return null;

    const org = result.organization;
    return {
      id: org.id,
      name: org.name,
      platform: "tally",
      network: org.chainIds[0] ?? "ethereum",
      website: org.website,
      twitter: org.twitter,
      proposalCount: org.proposalsCount,
    };
  }

  async getProposals(governorId: string, _state?: string): Promise<Proposal[]> {
    const query = `
      query Proposals($governorId: AccountID!, $first: Int!) {
        proposals(governorId: $governorId, pagination: { limit: $first }) {
          id
          title
          description
          proposer { address }
          status
          start { timestamp }
          end { timestamp }
          voteStats {
            support
            weight
            votes
          }
          quorum
        }
      }
    `;

    const result = await this.query<{ proposals: TallyProposal[] }>(query, {
      governorId,
      first: 100,
    });

    if (!result?.proposals) return [];

    return result.proposals.map((p) => this.mapProposal(p));
  }

  private mapProposal(p: TallyProposal): Proposal {
    const scores = p.voteStats.map((v) => parseFloat(v.weight));

    return {
      id: p.id,
      title: p.title,
      body: p.description,
      author: p.proposer.address,
      state: this.mapState(p.status),
      start: new Date(p.start.timestamp),
      end: new Date(p.end.timestamp),
      choices: ["Against", "For", "Abstain"],
      scores,
      quorum: parseFloat(p.quorum),
      totalVotes: scores.reduce((a, b) => a + b, 0),
      platform: "tally",
      link: `https://www.tally.xyz/proposal/${p.id}`,
    };
  }

  private mapState(status: string): Proposal["state"] {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "active":
        return "active";
      case "succeeded":
      case "queued":
        return "closed";
      case "executed":
        return "executed";
      case "defeated":
      case "expired":
      case "canceled":
        return "defeated";
      default:
        return "closed";
    }
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    const query = `
      query Proposal($id: ID!) {
        proposal(id: $id) {
          id
          title
          description
          proposer { address }
          status
          start { timestamp }
          end { timestamp }
          voteStats {
            support
            weight
            votes
          }
          quorum
        }
      }
    `;

    const result = await this.query<{ proposal: TallyProposal }>(query, { id: proposalId });
    if (!result?.proposal) return null;

    return this.mapProposal(result.proposal);
  }

  async getVotes(proposalId: string, limit = 100): Promise<Vote[]> {
    const query = `
      query Votes($proposalId: ID!, $first: Int!) {
        votes(proposalId: $proposalId, pagination: { limit: $first }) {
          voter { address }
          support
          weight
          block { timestamp }
          reason
        }
      }
    `;

    const result = await this.query<{ votes: TallyVote[] }>(query, {
      proposalId,
      first: limit,
    });

    if (!result?.votes) return [];

    return result.votes.map((v) => ({
      voter: v.voter.address,
      choice: this.mapSupport(v.support),
      votingPower: parseFloat(v.weight),
      timestamp: new Date(v.block.timestamp),
      reason: v.reason,
    }));
  }

  private mapSupport(support: string): number {
    switch (support.toLowerCase()) {
      case "against":
        return 0;
      case "for":
        return 1;
      case "abstain":
        return 2;
      default:
        return -1;
    }
  }

  async getVotingPower(governorId: string, address: string): Promise<VotingPower | null> {
    const query = `
      query VotingPower($governorId: AccountID!, $address: Address!) {
        delegate(governorId: $governorId, address: $address) {
          votesCount
          delegatorsCount
        }
      }
    `;

    const result = await this.query<{
      delegate: { votesCount: string; delegatorsCount: number };
    }>(query, { governorId, address });

    if (!result?.delegate) return null;

    return {
      address,
      power: parseFloat(result.delegate.votesCount),
      percentage: 0,
    };
  }
}
