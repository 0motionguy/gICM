import type { Workflow } from "../types.js";

export const projectDueDiligenceWorkflow: Workflow = {
  id: "project-due-diligence",
  name: "Project Due Diligence",
  description: "Comprehensive project research and security analysis",
  steps: [
    {
      id: "analyze-contract",
      agentId: "audit",
      action: "analyze_contract",
      params: { address: "{{contractAddress}}" },
    },
    {
      id: "check-social-sentiment",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "{{projectName}}" },
    },
    {
      id: "get-token-metrics",
      agentId: "defi",
      action: "get_token_overview",
      params: { token: "{{token}}" },
    },
    {
      id: "check-dao-activity",
      agentId: "dao",
      action: "get_proposals",
      params: { daoId: "{{daoId}}" },
      condition: (ctx) => !!ctx.memory.get("daoId"),
    },
    {
      id: "generate-report",
      agentId: "custom",
      action: "summarize_research",
      params: {},
      dependsOn: ["analyze-contract", "check-social-sentiment", "get-token-metrics"],
    },
  ],
  onError: "continue",
};

export const nftCollectionAnalysisWorkflow: Workflow = {
  id: "nft-collection-analysis",
  name: "NFT Collection Analysis",
  description: "Analyze NFT collection with rarity, pricing, and whale tracking",
  steps: [
    {
      id: "get-collection-info",
      agentId: "nft",
      action: "get_collection",
      params: { address: "{{collectionAddress}}" },
    },
    {
      id: "analyze-rarity",
      agentId: "nft",
      action: "analyze_rarity",
      params: {
        collectionAddress: "{{collectionAddress}}",
        tokenId: "{{tokenId}}",
      },
      dependsOn: ["get-collection-info"],
    },
    {
      id: "estimate-price",
      agentId: "nft",
      action: "estimate_price",
      params: {
        collectionAddress: "{{collectionAddress}}",
        tokenId: "{{tokenId}}",
      },
      dependsOn: ["analyze-rarity"],
    },
    {
      id: "track-whales",
      agentId: "nft",
      action: "get_whale_holders",
      params: { collectionAddress: "{{collectionAddress}}" },
      dependsOn: ["get-collection-info"],
    },
    {
      id: "check-social-buzz",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "{{collectionName}}" },
      dependsOn: ["get-collection-info"],
    },
  ],
  onError: "continue",
};

export const daoGovernanceWorkflow: Workflow = {
  id: "dao-governance-analysis",
  name: "DAO Governance Analysis",
  description: "Analyze DAO proposals and voting patterns",
  steps: [
    {
      id: "get-dao-info",
      agentId: "dao",
      action: "get_dao",
      params: { id: "{{daoId}}" },
    },
    {
      id: "get-active-proposals",
      agentId: "dao",
      action: "get_proposals",
      params: { daoId: "{{daoId}}", state: "active" },
      dependsOn: ["get-dao-info"],
    },
    {
      id: "summarize-proposals",
      agentId: "dao",
      action: "summarize_proposal",
      params: { proposalId: "{{proposalId}}" },
      dependsOn: ["get-active-proposals"],
    },
    {
      id: "analyze-voting-power",
      agentId: "dao",
      action: "analyze_voting_power",
      params: { daoId: "{{daoId}}" },
      dependsOn: ["get-dao-info"],
    },
  ],
  onError: "continue",
};

export const influencerTrackingWorkflow: Workflow = {
  id: "influencer-tracking",
  name: "Influencer Tracking",
  description: "Track and analyze crypto influencers",
  steps: [
    {
      id: "get-twitter-profile",
      agentId: "social",
      action: "get_user",
      params: { username: "{{twitterHandle}}", platform: "twitter" },
    },
    {
      id: "analyze-influencer",
      agentId: "social",
      action: "analyze_influencer",
      params: { username: "{{twitterHandle}}" },
      dependsOn: ["get-twitter-profile"],
    },
    {
      id: "get-recent-calls",
      agentId: "social",
      action: "search_posts",
      params: {
        query: "from:{{twitterHandle}} $",
        platform: "twitter",
      },
      dependsOn: ["get-twitter-profile"],
    },
    {
      id: "check-farcaster",
      agentId: "social",
      action: "get_user",
      params: { username: "{{farcasterHandle}}", platform: "farcaster" },
      condition: (ctx) => !!ctx.memory.get("farcasterHandle"),
    },
  ],
  onError: "continue",
};

export const researchWorkflows = {
  "project-due-diligence": projectDueDiligenceWorkflow,
  "nft-collection-analysis": nftCollectionAnalysisWorkflow,
  "dao-governance-analysis": daoGovernanceWorkflow,
  "influencer-tracking": influencerTrackingWorkflow,
};
