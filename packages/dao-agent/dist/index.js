// src/dao-agent.ts
import { z as z2 } from "zod";
import {
  BaseAgent,
  createLLMClient
} from "@gicm/agent-core";

// src/types.ts
import { z } from "zod";
var DAOAgentConfigSchema = z.object({
  snapshotHub: z.string().default("https://hub.snapshot.org/graphql"),
  tallyApiKey: z.string().optional(),
  realmsRpcUrl: z.string().default("https://api.mainnet-beta.solana.com")
});

// src/platforms/snapshot.ts
var SnapshotProvider = class {
  name = "snapshot";
  platform = "snapshot";
  hubUrl;
  constructor(hubUrl = "https://hub.snapshot.org/graphql") {
    this.hubUrl = hubUrl;
  }
  async query(query, variables) {
    try {
      const response = await fetch(this.hubUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
      });
      const data = await response.json();
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
  async getDAO(spaceId) {
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
    const result = await this.query(query, { id: spaceId });
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
      proposalCount: space.proposalsCount
    };
  }
  async getProposals(spaceId, state) {
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
    const result = await this.query(query, {
      space: spaceId,
      state: state ?? null,
      first: 100
    });
    if (!result?.proposals) return [];
    return result.proposals.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      author: p.author,
      state: this.mapState(p.state),
      start: new Date(p.start * 1e3),
      end: new Date(p.end * 1e3),
      choices: p.choices,
      scores: p.scores,
      quorum: p.quorum,
      totalVotes: p.scores_total,
      platform: "snapshot",
      link: p.link ?? `https://snapshot.org/#/${spaceId}/proposal/${p.id}`
    }));
  }
  mapState(state) {
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
  async getProposal(proposalId) {
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
    const result = await this.query(query, { id: proposalId });
    if (!result?.proposal) return null;
    const p = result.proposal;
    return {
      id: p.id,
      title: p.title,
      body: p.body,
      author: p.author,
      state: this.mapState(p.state),
      start: new Date(p.start * 1e3),
      end: new Date(p.end * 1e3),
      choices: p.choices,
      scores: p.scores,
      quorum: p.quorum,
      totalVotes: p.scores_total,
      platform: "snapshot",
      link: p.link ?? `https://snapshot.org/#/${p.space?.id}/proposal/${p.id}`
    };
  }
  async getVotes(proposalId, limit = 100) {
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
    const result = await this.query(query, {
      proposal: proposalId,
      first: limit
    });
    if (!result?.votes) return [];
    return result.votes.map((v) => ({
      voter: v.voter,
      choice: v.choice,
      votingPower: v.vp,
      timestamp: new Date(v.created * 1e3),
      reason: v.reason
    }));
  }
  async getVotingPower(spaceId, address) {
    const query = `
      query VP($space: String!, $voter: String!) {
        vp(space: $space, voter: $voter) {
          vp
          vp_by_strategy
        }
      }
    `;
    const result = await this.query(query, {
      space: spaceId,
      voter: address
    });
    if (!result?.vp) return null;
    return {
      address,
      power: result.vp.vp,
      percentage: 0
      // Would need total supply to calculate
    };
  }
};

// src/platforms/tally.ts
var TallyProvider = class {
  name = "tally";
  platform = "tally";
  apiKey;
  baseUrl = "https://api.tally.xyz/query";
  constructor(config) {
    this.apiKey = config.apiKey;
  }
  async query(query, variables) {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.apiKey
        },
        body: JSON.stringify({ query, variables })
      });
      const data = await response.json();
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
  async getDAO(slug) {
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
    const result = await this.query(query, { slug });
    if (!result?.organization) return null;
    const org = result.organization;
    return {
      id: org.id,
      name: org.name,
      platform: "tally",
      network: org.chainIds[0] ?? "ethereum",
      website: org.website,
      twitter: org.twitter,
      proposalCount: org.proposalsCount
    };
  }
  async getProposals(governorId, _state) {
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
    const result = await this.query(query, {
      governorId,
      first: 100
    });
    if (!result?.proposals) return [];
    return result.proposals.map((p) => this.mapProposal(p));
  }
  mapProposal(p) {
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
      link: `https://www.tally.xyz/proposal/${p.id}`
    };
  }
  mapState(status) {
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
  async getProposal(proposalId) {
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
    const result = await this.query(query, { id: proposalId });
    if (!result?.proposal) return null;
    return this.mapProposal(result.proposal);
  }
  async getVotes(proposalId, limit = 100) {
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
    const result = await this.query(query, {
      proposalId,
      first: limit
    });
    if (!result?.votes) return [];
    return result.votes.map((v) => ({
      voter: v.voter.address,
      choice: this.mapSupport(v.support),
      votingPower: parseFloat(v.weight),
      timestamp: new Date(v.block.timestamp),
      reason: v.reason
    }));
  }
  mapSupport(support) {
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
  async getVotingPower(governorId, address) {
    const query = `
      query VotingPower($governorId: AccountID!, $address: Address!) {
        delegate(governorId: $governorId, address: $address) {
          votesCount
          delegatorsCount
        }
      }
    `;
    const result = await this.query(query, { governorId, address });
    if (!result?.delegate) return null;
    return {
      address,
      power: parseFloat(result.delegate.votesCount),
      percentage: 0
    };
  }
};

// src/platforms/realms.ts
var RealmsProvider = class {
  name = "realms";
  platform = "realms";
  rpcUrl;
  constructor(rpcUrl = "https://api.mainnet-beta.solana.com") {
    this.rpcUrl = rpcUrl;
  }
  async rpc(method, params) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params
        })
      });
      const data = await response.json();
      return data.result ?? null;
    } catch (error) {
      console.error("Realms RPC failed:", error);
      return null;
    }
  }
  async getDAO(realmPubkey) {
    try {
      const result = await this.rpc("getAccountInfo", [
        realmPubkey,
        { encoding: "jsonParsed" }
      ]);
      if (!result) return null;
      const info = result.data?.parsed?.info;
      return {
        id: realmPubkey,
        name: info?.name ?? realmPubkey.slice(0, 8),
        platform: "realms",
        network: "solana"
      };
    } catch {
      return null;
    }
  }
  async getProposals(realmPubkey, _state) {
    try {
      return [];
    } catch {
      return [];
    }
  }
  async getProposal(proposalPubkey) {
    try {
      const result = await this.rpc("getAccountInfo", [
        proposalPubkey,
        { encoding: "jsonParsed" }
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
        start: new Date((info.votingAt ?? 0) * 1e3),
        end: new Date((info.votingCompletedAt ?? Date.now() / 1e3) * 1e3),
        choices,
        scores,
        quorum: 0,
        totalVotes: scores.reduce((a, b) => a + b, 0),
        platform: "realms",
        link: `https://realms.today/dao/${proposalPubkey}`
      };
    } catch {
      return null;
    }
  }
  mapState(state) {
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
  async getVotes(_proposalPubkey, _limit = 100) {
    return [];
  }
  async getVotingPower(realmPubkey, address) {
    try {
      const dao = await this.getDAO(realmPubkey);
      if (!dao) return null;
      return {
        address,
        power: 0,
        percentage: 0
      };
    } catch {
      return null;
    }
  }
};

// src/analyzers/proposal.ts
var ProposalAnalyzer = class {
  llmClient;
  constructor(llmClient) {
    this.llmClient = llmClient;
  }
  async summarizeProposal(proposal) {
    if (!this.llmClient) {
      return this.basicSummary(proposal);
    }
    try {
      const response = await this.llmClient.chat([
        {
          role: "system",
          content: `You are a DAO governance expert. Analyze proposals and provide clear, concise summaries.
Return JSON with this exact structure:
{
  "title": "short title",
  "tldr": "one sentence summary",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "impact": "high" | "medium" | "low",
  "recommendation": "for" | "against" | "abstain",
  "risks": ["risk 1", "risk 2"]
}`
        },
        {
          role: "user",
          content: `Analyze this proposal:

Title: ${proposal.title}

Body:
${proposal.body.slice(0, 4e3)}

Choices: ${proposal.choices.join(", ")}
Current Scores: ${proposal.scores.map((s, i) => `${proposal.choices[i]}: ${s}`).join(", ")}
State: ${proposal.state}
Quorum: ${proposal.quorum}`
        }
      ]);
      try {
        const parsed = JSON.parse(response.content);
        return {
          title: parsed.title ?? proposal.title,
          tldr: parsed.tldr ?? "",
          keyPoints: parsed.keyPoints ?? [],
          impact: parsed.impact ?? "medium",
          recommendation: parsed.recommendation,
          risks: parsed.risks ?? []
        };
      } catch {
        return this.basicSummary(proposal);
      }
    } catch {
      return this.basicSummary(proposal);
    }
  }
  basicSummary(proposal) {
    const bodyPreview = proposal.body.slice(0, 200).trim();
    const leadingChoice = this.getLeadingChoice(proposal);
    return {
      title: proposal.title,
      tldr: bodyPreview + (proposal.body.length > 200 ? "..." : ""),
      keyPoints: [
        `Author: ${proposal.author.slice(0, 10)}...`,
        `State: ${proposal.state}`,
        `Leading: ${leadingChoice}`
      ],
      impact: this.estimateImpact(proposal),
      risks: []
    };
  }
  getLeadingChoice(proposal) {
    if (proposal.scores.length === 0) return "No votes";
    const maxScore = Math.max(...proposal.scores);
    const leadingIndex = proposal.scores.indexOf(maxScore);
    return proposal.choices[leadingIndex] ?? "Unknown";
  }
  estimateImpact(proposal) {
    const bodyLower = proposal.body.toLowerCase();
    if (bodyLower.includes("treasury") || bodyLower.includes("upgrade") || bodyLower.includes("migration") || bodyLower.includes("emergency")) {
      return "high";
    }
    if (bodyLower.includes("parameter") || bodyLower.includes("fee") || bodyLower.includes("grant")) {
      return "medium";
    }
    return "low";
  }
  analyzeVotingPatterns(proposals) {
    if (proposals.length === 0) {
      return {
        avgParticipation: 0,
        avgDuration: 0,
        passRate: 0,
        topChoices: []
      };
    }
    const choiceCounts = /* @__PURE__ */ new Map();
    let totalParticipation = 0;
    let totalDuration = 0;
    let passedCount = 0;
    for (const proposal of proposals) {
      totalParticipation += proposal.totalVotes;
      totalDuration += proposal.end.getTime() - proposal.start.getTime();
      if (proposal.state === "executed") {
        passedCount++;
      }
      if (proposal.scores.length > 0) {
        const maxScore = Math.max(...proposal.scores);
        const winningIndex = proposal.scores.indexOf(maxScore);
        const winningChoice = proposal.choices[winningIndex];
        if (winningChoice) {
          choiceCounts.set(winningChoice, (choiceCounts.get(winningChoice) ?? 0) + 1);
        }
      }
    }
    const topChoices = Array.from(choiceCounts.entries()).map(([choice, count]) => ({ choice, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    return {
      avgParticipation: totalParticipation / proposals.length,
      avgDuration: totalDuration / proposals.length / (1e3 * 60 * 60 * 24),
      // Days
      passRate: passedCount / proposals.length,
      topChoices
    };
  }
};

// src/analyzers/voting-power.ts
var VotingPowerAnalyzer = class {
  analyzeDistribution(holders, totalSupply) {
    if (holders.length === 0) {
      return {
        totalPower: 0,
        topHolders: [],
        concentrationScore: 0,
        giniCoefficient: 0
      };
    }
    const sorted = [...holders].sort((a, b) => b.power - a.power);
    const totalPower = totalSupply ?? sorted.reduce((sum, h) => sum + h.power, 0);
    const topHolders = sorted.slice(0, 20).map((h) => ({
      address: h.address,
      power: h.power,
      percentage: totalPower > 0 ? h.power / totalPower * 100 : 0
    }));
    const top10Power = sorted.slice(0, 10).reduce((sum, h) => sum + h.power, 0);
    const concentrationScore = totalPower > 0 ? top10Power / totalPower : 0;
    const giniCoefficient = this.calculateGini(sorted.map((h) => h.power));
    return {
      totalPower,
      topHolders,
      concentrationScore,
      giniCoefficient
    };
  }
  calculateGini(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;
    let cumulativeSum = 0;
    let giniSum = 0;
    for (let i = 0; i < n; i++) {
      cumulativeSum += sorted[i];
      giniSum += cumulativeSum;
    }
    const gini = 2 * giniSum / (n * sum) - (n + 1) / n;
    return Math.max(0, Math.min(1, gini));
  }
  analyzeVoter(address, votes, totalProposals) {
    const voterVotes = votes.filter(
      (v) => v.voter.toLowerCase() === address.toLowerCase()
    );
    if (voterVotes.length === 0) {
      return {
        address,
        totalVotes: 0,
        participationRate: 0,
        avgVotingPower: 0,
        votingHistory: []
      };
    }
    const avgPower = voterVotes.reduce((sum, v) => sum + v.votingPower, 0) / voterVotes.length;
    return {
      address,
      totalVotes: voterVotes.length,
      participationRate: totalProposals > 0 ? voterVotes.length / totalProposals : 0,
      avgVotingPower: avgPower,
      votingHistory: voterVotes.map((v) => ({
        proposalId: "",
        // Would need proposal context
        choice: v.choice,
        power: v.votingPower,
        timestamp: v.timestamp
      }))
    };
  }
  findWhaleVoters(votes, threshold = 0.01) {
    const voterTotals = /* @__PURE__ */ new Map();
    for (const vote of votes) {
      const existing = voterTotals.get(vote.voter) ?? { power: 0, count: 0 };
      voterTotals.set(vote.voter, {
        power: existing.power + vote.votingPower,
        count: existing.count + 1
      });
    }
    const totalPower = votes.reduce((sum, v) => sum + v.votingPower, 0);
    const whaleThreshold = totalPower * threshold;
    return Array.from(voterTotals.entries()).filter(([, data]) => data.power >= whaleThreshold).map(([address, data]) => ({
      address,
      totalPower: data.power,
      voteCount: data.count
    })).sort((a, b) => b.totalPower - a.totalPower);
  }
  calculateQuorumHealth(currentVotes, quorum, timeRemaining, historicalAvgVelocity) {
    const currentProgress = quorum > 0 ? currentVotes / quorum : 0;
    if (timeRemaining <= 0) {
      return {
        currentProgress,
        projectedFinal: currentVotes,
        willReachQuorum: currentVotes >= quorum,
        confidence: 1
      };
    }
    const hoursRemaining = timeRemaining / (1e3 * 60 * 60);
    const velocity = historicalAvgVelocity ?? 0;
    const projectedAdditional = velocity * hoursRemaining;
    const projectedFinal = currentVotes + projectedAdditional;
    return {
      currentProgress,
      projectedFinal,
      willReachQuorum: projectedFinal >= quorum,
      confidence: velocity > 0 ? 0.7 : 0.3
      // Lower confidence without velocity data
    };
  }
};

// src/dao-agent.ts
var DAOAgent = class extends BaseAgent {
  platforms = /* @__PURE__ */ new Map();
  proposalAnalyzer;
  votingPowerAnalyzer;
  daoConfig;
  llmClient;
  constructor(config) {
    const validatedConfig = DAOAgentConfigSchema.parse(config);
    super("dao-agent", config);
    this.daoConfig = validatedConfig;
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096
      });
    }
    this.proposalAnalyzer = new ProposalAnalyzer(this.llmClient);
    this.votingPowerAnalyzer = new VotingPowerAnalyzer();
    this.initializePlatforms(validatedConfig);
    this.initializeTools();
  }
  initializePlatforms(config) {
    this.platforms.set("snapshot", new SnapshotProvider(config.snapshotHub));
    if (config.tallyApiKey) {
      this.platforms.set("tally", new TallyProvider({ apiKey: config.tallyApiKey }));
    }
    this.platforms.set("realms", new RealmsProvider(config.realmsRpcUrl));
  }
  initializeTools() {
    this.registerTool({
      name: "get_dao",
      description: "Get DAO info from governance platform",
      parameters: z2.object({
        id: z2.string().describe("DAO ID or slug"),
        platform: z2.string().default("snapshot").describe("Platform: snapshot, tally, realms")
      }),
      execute: async (params) => {
        const { id, platform } = params;
        return this.getDAO(id, platform);
      }
    });
    this.registerTool({
      name: "get_proposals",
      description: "Get proposals for a DAO",
      parameters: z2.object({
        daoId: z2.string().describe("DAO ID or slug"),
        platform: z2.string().default("snapshot").describe("Platform name"),
        state: z2.string().optional().describe("Filter by state: active, closed, pending")
      }),
      execute: async (params) => {
        const { daoId, platform, state } = params;
        return this.getProposals(daoId, platform, state);
      }
    });
    this.registerTool({
      name: "summarize_proposal",
      description: "Get AI summary of a proposal",
      parameters: z2.object({
        proposalId: z2.string().describe("Proposal ID"),
        platform: z2.string().default("snapshot").describe("Platform name")
      }),
      execute: async (params) => {
        const { proposalId, platform } = params;
        return this.summarizeProposal(proposalId, platform);
      }
    });
    this.registerTool({
      name: "get_votes",
      description: "Get votes for a proposal",
      parameters: z2.object({
        proposalId: z2.string().describe("Proposal ID"),
        platform: z2.string().default("snapshot").describe("Platform name"),
        limit: z2.number().default(100).describe("Max votes to return")
      }),
      execute: async (params) => {
        const { proposalId, platform, limit } = params;
        return this.getVotes(proposalId, platform, limit);
      }
    });
    this.registerTool({
      name: "analyze_voting_power",
      description: "Analyze voting power distribution",
      parameters: z2.object({
        daoId: z2.string().describe("DAO ID"),
        platform: z2.string().default("snapshot").describe("Platform name")
      }),
      execute: async (params) => {
        const { daoId, platform } = params;
        return this.analyzeVotingPower(daoId, platform);
      }
    });
  }
  getSystemPrompt() {
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
  async analyze(context) {
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
        { role: "user", content: query }
      ]);
      return this.createResult(
        true,
        { aiSummary: response.content },
        void 0,
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
  async getDAO(id, platformName = "snapshot") {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return platform.getDAO(id);
  }
  async getProposals(daoId, platformName = "snapshot", state) {
    const platform = this.platforms.get(platformName);
    if (!platform) return [];
    return platform.getProposals(daoId, state);
  }
  async getProposal(proposalId, platformName = "snapshot") {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return platform.getProposal(proposalId);
  }
  async summarizeProposal(proposalId, platformName = "snapshot") {
    const proposal = await this.getProposal(proposalId, platformName);
    if (!proposal) return null;
    return this.proposalAnalyzer.summarizeProposal(proposal);
  }
  async getVotes(proposalId, platformName = "snapshot", limit = 100) {
    const platform = this.platforms.get(platformName);
    if (!platform) return [];
    return platform.getVotes(proposalId, limit);
  }
  async analyzeVotingPower(_daoId, platformName = "snapshot") {
    const platform = this.platforms.get(platformName);
    if (!platform) return null;
    return {
      totalPower: 0,
      topHolders: [],
      concentrationScore: 0,
      giniCoefficient: 0
    };
  }
  async getActiveProposals(daoId, platformName = "snapshot") {
    return this.getProposals(daoId, platformName, "active");
  }
  async getWhaleVoters(proposalId, platformName = "snapshot") {
    const votes = await this.getVotes(proposalId, platformName, 1e3);
    return this.votingPowerAnalyzer.findWhaleVoters(votes);
  }
};
export {
  DAOAgent,
  DAOAgentConfigSchema,
  ProposalAnalyzer,
  RealmsProvider,
  SnapshotProvider,
  TallyProvider,
  VotingPowerAnalyzer
};
//# sourceMappingURL=index.js.map