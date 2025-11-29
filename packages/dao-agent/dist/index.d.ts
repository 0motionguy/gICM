import { BaseAgent, AgentConfig, AgentContext, AgentResult, LLMClient } from '@gicm/agent-core';
import { z } from 'zod';

declare const DAOAgentConfigSchema: z.ZodObject<{
    snapshotHub: z.ZodDefault<z.ZodString>;
    tallyApiKey: z.ZodOptional<z.ZodString>;
    realmsRpcUrl: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    snapshotHub: string;
    realmsRpcUrl: string;
    tallyApiKey?: string | undefined;
}, {
    snapshotHub?: string | undefined;
    tallyApiKey?: string | undefined;
    realmsRpcUrl?: string | undefined;
}>;
type DAOAgentConfig = z.infer<typeof DAOAgentConfigSchema>;
interface DAO {
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
interface TreasuryInfo {
    address: string;
    totalValueUsd: number;
    tokens: Array<{
        symbol: string;
        balance: number;
        valueUsd: number;
    }>;
}
interface Proposal {
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
interface Vote {
    voter: string;
    choice: number | number[];
    votingPower: number;
    timestamp: Date;
    reason?: string;
}
interface VotingPower {
    address: string;
    power: number;
    percentage: number;
    delegatedFrom?: string[];
    tokens?: Array<{
        symbol: string;
        balance: number;
    }>;
}
interface ProposalSummary {
    title: string;
    tldr: string;
    keyPoints: string[];
    impact: "high" | "medium" | "low";
    recommendation?: "for" | "against" | "abstain";
    risks: string[];
}
interface GovernancePlatform {
    name: string;
    platform: "snapshot" | "tally" | "realms";
    getDAO(id: string): Promise<DAO | null>;
    getProposals(daoId: string, state?: string): Promise<Proposal[]>;
    getProposal(proposalId: string): Promise<Proposal | null>;
    getVotes(proposalId: string, limit?: number): Promise<Vote[]>;
    getVotingPower(daoId: string, address: string): Promise<VotingPower | null>;
}

interface VotingPowerDistribution {
    totalPower: number;
    topHolders: Array<{
        address: string;
        power: number;
        percentage: number;
    }>;
    concentrationScore: number;
    giniCoefficient: number;
}
interface VoterAnalysis {
    address: string;
    totalVotes: number;
    participationRate: number;
    avgVotingPower: number;
    votingHistory: Array<{
        proposalId: string;
        choice: number | number[];
        power: number;
        timestamp: Date;
    }>;
}
declare class VotingPowerAnalyzer {
    analyzeDistribution(holders: VotingPower[], totalSupply?: number): VotingPowerDistribution;
    private calculateGini;
    analyzeVoter(address: string, votes: Vote[], totalProposals: number): VoterAnalysis;
    findWhaleVoters(votes: Vote[], threshold?: number): Array<{
        address: string;
        totalPower: number;
        voteCount: number;
    }>;
    calculateQuorumHealth(currentVotes: number, quorum: number, timeRemaining: number, // milliseconds
    historicalAvgVelocity?: number): {
        currentProgress: number;
        projectedFinal: number;
        willReachQuorum: boolean;
        confidence: number;
    };
}

interface DAOAgentAnalysis {
    dao?: DAO;
    proposals?: Proposal[];
    summary?: ProposalSummary;
    votingDistribution?: VotingPowerDistribution;
    aiSummary?: string;
}
declare class DAOAgent extends BaseAgent {
    private platforms;
    private proposalAnalyzer;
    private votingPowerAnalyzer;
    private daoConfig;
    private llmClient?;
    constructor(config: DAOAgentConfig & AgentConfig);
    private initializePlatforms;
    private initializeTools;
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    getDAO(id: string, platformName?: string): Promise<DAO | null>;
    getProposals(daoId: string, platformName?: string, state?: string): Promise<Proposal[]>;
    getProposal(proposalId: string, platformName?: string): Promise<Proposal | null>;
    summarizeProposal(proposalId: string, platformName?: string): Promise<ProposalSummary | null>;
    getVotes(proposalId: string, platformName?: string, limit?: number): Promise<Vote[]>;
    analyzeVotingPower(_daoId: string, platformName?: string): Promise<VotingPowerDistribution | null>;
    getActiveProposals(daoId: string, platformName?: string): Promise<Proposal[]>;
    getWhaleVoters(proposalId: string, platformName?: string): Promise<Array<{
        address: string;
        totalPower: number;
        voteCount: number;
    }>>;
}

declare class SnapshotProvider implements GovernancePlatform {
    name: string;
    platform: "snapshot";
    private hubUrl;
    constructor(hubUrl?: string);
    private query;
    getDAO(spaceId: string): Promise<DAO | null>;
    getProposals(spaceId: string, state?: string): Promise<Proposal[]>;
    private mapState;
    getProposal(proposalId: string): Promise<Proposal | null>;
    getVotes(proposalId: string, limit?: number): Promise<Vote[]>;
    getVotingPower(spaceId: string, address: string): Promise<VotingPower | null>;
}

declare class TallyProvider implements GovernancePlatform {
    name: string;
    platform: "tally";
    private apiKey;
    private baseUrl;
    constructor(config: {
        apiKey: string;
    });
    private query;
    getDAO(slug: string): Promise<DAO | null>;
    getProposals(governorId: string, _state?: string): Promise<Proposal[]>;
    private mapProposal;
    private mapState;
    getProposal(proposalId: string): Promise<Proposal | null>;
    getVotes(proposalId: string, limit?: number): Promise<Vote[]>;
    private mapSupport;
    getVotingPower(governorId: string, address: string): Promise<VotingPower | null>;
}

declare class RealmsProvider implements GovernancePlatform {
    name: string;
    platform: "realms";
    private rpcUrl;
    constructor(rpcUrl?: string);
    private rpc;
    getDAO(realmPubkey: string): Promise<DAO | null>;
    getProposals(realmPubkey: string, _state?: string): Promise<Proposal[]>;
    getProposal(proposalPubkey: string): Promise<Proposal | null>;
    private mapState;
    getVotes(_proposalPubkey: string, _limit?: number): Promise<Vote[]>;
    getVotingPower(realmPubkey: string, address: string): Promise<VotingPower | null>;
}

declare class ProposalAnalyzer {
    private llmClient?;
    constructor(llmClient?: LLMClient);
    summarizeProposal(proposal: Proposal): Promise<ProposalSummary>;
    private basicSummary;
    private getLeadingChoice;
    private estimateImpact;
    analyzeVotingPatterns(proposals: Proposal[]): {
        avgParticipation: number;
        avgDuration: number;
        passRate: number;
        topChoices: Array<{
            choice: string;
            count: number;
        }>;
    };
}

export { type DAO, DAOAgent, type DAOAgentAnalysis, type DAOAgentConfig, DAOAgentConfigSchema, type GovernancePlatform, type Proposal, ProposalAnalyzer, type ProposalSummary, RealmsProvider, SnapshotProvider, TallyProvider, type TreasuryInfo, type Vote, type VoterAnalysis, type VotingPower, VotingPowerAnalyzer, type VotingPowerDistribution };
