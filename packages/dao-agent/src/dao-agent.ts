import { z } from "zod";
import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
  type LLMClient,
  createLLMClient,
} from "@gicm/agent-core";
import type { DAOAgentConfig, DAO, Proposal, Vote, GovernancePlatform, ProposalSummary } from "./types.js";
import { DAOAgentConfigSchema } from "./types.js";
import { SnapshotProvider } from "./platforms/snapshot.js";
import { TallyProvider } from "./platforms/tally.js";
import { RealmsProvider } from "./platforms/realms.js";
import { ProposalAnalyzer } from "./analyzers/proposal.js";
import { VotingPowerAnalyzer, type VotingPowerDistribution } from "./analyzers/voting-power.js";

export interface DAOAgentAnalysis {
  dao?: DAO;
  proposals?: Proposal[];
  summary?: ProposalSummary;
  votingDistribution?: VotingPowerDistribution;
  aiSummary?: string;
}

export class DAOAgent extends BaseAgent {
  private platforms: Map<string, GovernancePlatform> = new Map();
  private proposalAnalyzer: ProposalAnalyzer;
  private votingPowerAnalyzer: VotingPowerAnalyzer;
  private daoConfig: DAOAgentConfig;
  private llmClient?: LLMClient;

  constructor(config: DAOAgentConfig & AgentConfig) {
    const validatedConfig = DAOAgentConfigSchema.parse(config);
    super("dao-agent", config);

    this.daoConfig = validatedConfig;

    // Initialize LLM client if API key provided
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096,
      });
    }

    this.proposalAnalyzer = new ProposalAnalyzer(this.llmClient);
    this.votingPowerAnalyzer = new VotingPowerAnalyzer();

    this.initializePlatforms(validatedConfig);
    this.initializeTools();
  }

  private initializePlatforms(config: DAOAgentConfig): void {
    // Snapshot (no API key required)
    this.platforms.set("snapshot", new SnapshotProvider(config.snapshotHub));

    // Tally (requires API key)
    if (config.tallyApiKey) {
      this.platforms.set("tally", new TallyProvider({ apiKey: config.tallyApiKey }));
    }

    // Realms (Solana)
    this.platforms.set("realms", new RealmsProvider(config.realmsRpcUrl));
  }

  private initializeTools(): void {
    this.registerTool({
      name: "get_dao",
      description: "Get DAO info from governance platform",
      parameters: z.object({
        id: z.string().describe("DAO ID or slug"),
        platform: z.string().default("snapshot").describe("Platform: snapshot, tally, realms"),
      }),
      execute: async (params) => {
        const { id, platform } = params as { id: string; platform: string };
        return this.getDAO(id, platform);
      },
    });

    this.registerTool({
      name: "get_proposals",
      description: "Get proposals for a DAO",
      parameters: z.object({
        daoId: z.string().describe("DAO ID or slug"),
        platform: z.string().default("snapshot").describe("Platform name"),
        state: z.string().optional().describe("Filter by state: active, closed, pending"),
      }),
      execute: async (params) => {
        const { daoId, platform, state } = params as {
          daoId: string;
          platform: string;
          state?: string;
        };
        return this.getProposals(daoId, platform, state);
      },
    });

    this.registerTool({
      name: "summarize_proposal",
      description: "Get AI summary of a proposal",
      parameters: z.object({
        proposalId: z.string().describe("Proposal ID"),
        platform: z.string().default("snapshot").describe("Platform name"),
      }),
      execute: async (params) => {
        const { proposalId, platform } = params as { proposalId: string; platform: string };
        return this.summarizeProposal(proposalId, platform);
      },
    });

    this.registerTool({
      name: "get_votes",
      description: "Get votes for a proposal",
      parameters: z.object({
        proposalId: z.string().describe("Proposal ID"),
        platform: z.string().default("snapshot").describe("Platform name"),
        limit: z.number().default(100).describe("Max votes to return"),
      }),
      execute: async (params) => {
        const { proposalId, platform, limit } = params as {
          proposalId: string;
          platform: string;
          limit: number;
        };
        return this.getVotes(proposalId, platform, limit);
      },
    });

    this.registerTool({
      name: "analyze_voting_power",
      description: "Analyze voting power distribution",
      parameters: z.object({
        daoId: z.string().describe("DAO ID"),
        platform: z.string().default("snapshot").describe("Platform name"),
      }),
      execute: async (params) => {
        const { daoId, platform } = params as { daoId: string; platform: string };
        return this.analyzeVotingPower(daoId, platform);
      },
    });
  }

  getSystemPrompt(): string {
    return `You are a DAO governance expert. You can:
- Analyze DAOs and their proposals
- Summarize complex governance proposals in plain language
- Track voting power distribution and whale voters
- Provide voting recommendations based on principles
- Monitor treasury and governance alerts

Available platforms: ${Array.from(this.platforms.keys()).join(", ")}

When analyzing proposals, consider:
1. Impact on protocol/community
2. Treasury implications
3. Security considerations
4. Alignment with DAO's mission
5. Historical voting patterns`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const query = context.userQuery ?? "";

    if (!this.llmClient) {
      return this.createResult(
        false,
        null,
        "LLM client not configured. Provide apiKey in config.",
        0,
        "No LLM available for AI analysis"
      );
    }

    try {
      const response = await this.llmClient.chat([
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: query },
      ]);

      return this.createResult(
        true,
        { aiSummary: response.content },
        undefined,
        0.8,
        "AI analysis completed"
      );
    } catch (error) {
      return this.createResult(
        false,
        null,
        error instanceof Error ? error.message : "Unknown error",
        0,
        "Failed to complete AI analysis"
      );
    }
  }

  async getDAO(id: string, platformName = "snapshot"): Promise<DAO | null> {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return platform.getDAO(id);
  }

  async getProposals(
    daoId: string,
    platformName = "snapshot",
    state?: string
  ): Promise<Proposal[]> {
    const platform = this.platforms.get(platformName);
    if (!platform) return [];
    return platform.getProposals(daoId, state);
  }

  async getProposal(
    proposalId: string,
    platformName = "snapshot"
  ): Promise<Proposal | null> {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return platform.getProposal(proposalId);
  }

  async summarizeProposal(
    proposalId: string,
    platformName = "snapshot"
  ): Promise<ProposalSummary | null> {
    const proposal = await this.getProposal(proposalId, platformName);
    if (!proposal) return null;
    return this.proposalAnalyzer.summarizeProposal(proposal);
  }

  async getVotes(
    proposalId: string,
    platformName = "snapshot",
    limit = 100
  ): Promise<Vote[]> {
    const platform = this.platforms.get(platformName);
    if (!platform) return [];
    return platform.getVotes(proposalId, limit);
  }

  async analyzeVotingPower(
    _daoId: string,
    platformName = "snapshot"
  ): Promise<VotingPowerDistribution | null> {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;

    // Would need to aggregate voting power data
    // For now, return placeholder
    return {
      totalPower: 0,
      topHolders: [],
      concentrationScore: 0,
      giniCoefficient: 0,
    };
  }

  async getActiveProposals(
    daoId: string,
    platformName = "snapshot"
  ): Promise<Proposal[]> {
    return this.getProposals(daoId, platformName, "active");
  }

  async getWhaleVoters(
    proposalId: string,
    platformName = "snapshot"
  ): Promise<Array<{ address: string; totalPower: number; voteCount: number }>> {
    const votes = await this.getVotes(proposalId, platformName, 1000);
    return this.votingPowerAnalyzer.findWhaleVoters(votes);
  }
}
