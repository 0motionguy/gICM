import type { GovernancePlatform, DAO, Proposal, Vote, VotingPower } from "../types.js";

interface SnapshotSpace {
  id: string;
  name: string;
  avatar?: string;
  website?: string;
  github?: string;
  twitter?: string;
  network?: string;
  members?: string[];
  proposalsCount?: number;
}

interface SnapshotProposal {
  id: string;
  title: string;
  body: string;
  author: string;
  state: string;
  start: number;
  end: number;
  choices: string[];
  scores: number[];
  quorum: number;
  scores_total: number;
  link?: string;
}

interface SnapshotVote {
  voter: string;
  choice: number | number[];
  vp: number;
  created: number;
  reason?: string;
}

interface SnapshotVP {
  vp: number;
  vp_by_strategy: number[];
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class SnapshotProvider implements GovernancePlatform {
  name = "snapshot";
  platform = "snapshot" as const;
  private hubUrl: string;

  constructor(hubUrl = "https://hub.snapshot.org/graphql") {
    this.hubUrl = hubUrl;
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const response = await fetch(this.hubUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const data = (await response.json()) as GraphQLResponse<T>;
      if (data.errors) {
        console.error("Snapshot GraphQL errors:", data.errors);
        return null;
      }
      return data.data ?? null;
    } catch (error) {
      console.error("Snapshot query failed:", error);
      return null;
    }
  }

  async getDAO(spaceId: string): Promise<DAO | null> {
    const query = `
      query Space($id: String!) {
        space(id: $id) {
          id
          name
          avatar
          website
          github
          twitter
          network
          members
          proposalsCount
        }
      }
    `;

    const result = await this.query<{ space: SnapshotSpace }>(query, { id: spaceId });
    if (!result?.space) return null;

    const space = result.space;
    return {
      id: space.id,
      name: space.name,
      platform: "snapshot",
      network: space.network ?? "ethereum",
      avatar: space.avatar,
      website: space.website,
      github: space.github,
      twitter: space.twitter,
      memberCount: space.members?.length,
      proposalCount: space.proposalsCount,
    };
  }

  async getProposals(spaceId: string, state?: string): Promise<Proposal[]> {
    const query = `
      query Proposals($space: String!, $state: String, $first: Int!) {
        proposals(
          first: $first,
          where: { space: $space, state: $state },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          author
          state
          start
          end
          choices
          scores
          quorum
          scores_total
          link
        }
      }
    `;

    const result = await this.query<{ proposals: SnapshotProposal[] }>(query, {
      space: spaceId,
      state: state ?? null,
      first: 100,
    });

    if (!result?.proposals) return [];

    return result.proposals.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      author: p.author,
      state: this.mapState(p.state),
      start: new Date(p.start * 1000),
      end: new Date(p.end * 1000),
      choices: p.choices,
      scores: p.scores,
      quorum: p.quorum,
      totalVotes: p.scores_total,
      platform: "snapshot" as const,
      link: p.link ?? `https://snapshot.org/#/${spaceId}/proposal/${p.id}`,
    }));
  }

  private mapState(state: string): Proposal["state"] {
    switch (state.toLowerCase()) {
      case "pending":
        return "pending";
      case "active":
        return "active";
      case "closed":
        return "closed";
      default:
        return "closed";
    }
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    const query = `
      query Proposal($id: String!) {
        proposal(id: $id) {
          id
          title
          body
          author
          state
          start
          end
          choices
          scores
          quorum
          scores_total
          space { id }
          link
        }
      }
    `;

    const result = await this.query<{
      proposal: SnapshotProposal & { space?: { id: string } };
    }>(query, { id: proposalId });

    if (!result?.proposal) return null;

    const p = result.proposal;
    return {
      id: p.id,
      title: p.title,
      body: p.body,
      author: p.author,
      state: this.mapState(p.state),
      start: new Date(p.start * 1000),
      end: new Date(p.end * 1000),
      choices: p.choices,
      scores: p.scores,
      quorum: p.quorum,
      totalVotes: p.scores_total,
      platform: "snapshot",
      link: p.link ?? `https://snapshot.org/#/${p.space?.id}/proposal/${p.id}`,
    };
  }

  async getVotes(proposalId: string, limit = 100): Promise<Vote[]> {
    const query = `
      query Votes($proposal: String!, $first: Int!) {
        votes(
          first: $first,
          where: { proposal: $proposal },
          orderBy: "vp",
          orderDirection: desc
        ) {
          voter
          choice
          vp
          created
          reason
        }
      }
    `;

    const result = await this.query<{ votes: SnapshotVote[] }>(query, {
      proposal: proposalId,
      first: limit,
    });

    if (!result?.votes) return [];

    return result.votes.map((v) => ({
      voter: v.voter,
      choice: v.choice,
      votingPower: v.vp,
      timestamp: new Date(v.created * 1000),
      reason: v.reason,
    }));
  }

  async getVotingPower(spaceId: string, address: string): Promise<VotingPower | null> {
    const query = `
      query VP($space: String!, $voter: String!) {
        vp(space: $space, voter: $voter) {
          vp
          vp_by_strategy
        }
      }
    `;

    const result = await this.query<{ vp: SnapshotVP }>(query, {
      space: spaceId,
      voter: address,
    });

    if (!result?.vp) return null;

    return {
      address,
      power: result.vp.vp,
      percentage: 0, // Would need total supply to calculate
    };
  }
}
