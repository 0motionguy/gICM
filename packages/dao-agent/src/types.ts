import { z } from "zod";

export const DAOAgentConfigSchema = z.object({
  snapshotHub: z.string().default("https://hub.snapshot.org/graphql"),
  tallyApiKey: z.string().optional(),
  realmsRpcUrl: z.string().default("https://api.mainnet-beta.solana.com"),
});

export type DAOAgentConfig = z.infer<typeof DAOAgentConfigSchema>;

export interface DAO {
  id: string;
  name: string;
  platform: "snapshot" | "tally" | "realms";
  network: string;
  avatar?: string;
  website?: string;
  github?: string;
  twitter?: string;
  treasury?: TreasuryInfo;
  memberCount?: number;
  proposalCount?: number;
}

export interface TreasuryInfo {
  address: string;
  totalValueUsd: number;
  tokens: Array<{
    symbol: string;
    balance: number;
    valueUsd: number;
  }>;
}

export interface Proposal {
  id: string;
  title: string;
  body: string;
  author: string;
  state: "pending" | "active" | "closed" | "executed" | "defeated";
  start: Date;
  end: Date;
  choices: string[];
  scores: number[];
  quorum: number;
  totalVotes: number;
  platform: "snapshot" | "tally" | "realms";
  link?: string;
}

export interface Vote {
  voter: string;
  choice: number | number[];
  votingPower: number;
  timestamp: Date;
  reason?: string;
}

export interface VotingPower {
  address: string;
  power: number;
  percentage: number;
  delegatedFrom?: string[];
  tokens?: Array<{ symbol: string; balance: number }>;
}

export interface ProposalSummary {
  title: string;
  tldr: string;
  keyPoints: string[];
  impact: "high" | "medium" | "low";
  recommendation?: "for" | "against" | "abstain";
  risks: string[];
}

export interface GovernancePlatform {
  name: string;
  platform: "snapshot" | "tally" | "realms";

  getDAO(id: string): Promise<DAO | null>;
  getProposals(daoId: string, state?: string): Promise<Proposal[]>;
  getProposal(proposalId: string): Promise<Proposal | null>;
  getVotes(proposalId: string, limit?: number): Promise<Vote[]>;
  getVotingPower(daoId: string, address: string): Promise<VotingPower | null>;
}
