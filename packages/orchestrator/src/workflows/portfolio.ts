import type { Workflow } from "../types.js";

export const rebalancePortfolioWorkflow: Workflow = {
  id: "rebalance-portfolio",
  name: "Portfolio Rebalance",
  description: "Analyze and suggest portfolio rebalancing",
  steps: [
    {
      id: "get-current-holdings",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{wallet}}" },
    },
    {
      id: "get-token-prices",
      agentId: "defi",
      action: "get_multiple_prices",
      params: { tokens: "{{tokens}}" },
      dependsOn: ["get-current-holdings"],
    },
    {
      id: "calculate-allocations",
      agentId: "custom",
      action: "calculate_allocations",
      params: { targetAllocation: "{{targetAllocation}}" },
      dependsOn: ["get-current-holdings", "get-token-prices"],
    },
    {
      id: "find-best-routes",
      agentId: "bridge",
      action: "compare_bridges",
      params: {},
      dependsOn: ["calculate-allocations"],
      condition: (ctx) => {
        const allocations = ctx.results.get("calculate-allocations");
        return (allocations?.data as { needsCrossChain?: boolean })?.needsCrossChain ?? false;
      },
    },
  ],
  onError: "stop",
};

export const yieldFarmingWorkflow: Workflow = {
  id: "yield-farming-analysis",
  name: "Yield Farming Analysis",
  description: "Find and analyze yield farming opportunities",
  steps: [
    {
      id: "get-trending-tokens",
      agentId: "defi",
      action: "get_boosted_tokens",
      params: {},
    },
    {
      id: "analyze-each-token",
      agentId: "defi",
      action: "get_token_overview",
      params: { token: "{{token}}" },
      dependsOn: ["get-trending-tokens"],
    },
    {
      id: "check-contract-safety",
      agentId: "audit",
      action: "analyze_contract",
      params: { address: "{{contractAddress}}" },
      dependsOn: ["analyze-each-token"],
    },
    {
      id: "calculate-apy",
      agentId: "custom",
      action: "calculate_yield",
      params: {},
      dependsOn: ["analyze-each-token"],
    },
  ],
  onError: "continue",
};

export const riskAssessmentWorkflow: Workflow = {
  id: "risk-assessment",
  name: "Portfolio Risk Assessment",
  description: "Comprehensive risk analysis of portfolio",
  steps: [
    {
      id: "get-holdings",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{wallet}}" },
    },
    {
      id: "audit-contracts",
      agentId: "audit",
      action: "batch_analyze",
      params: { addresses: "{{tokenAddresses}}" },
      dependsOn: ["get-holdings"],
    },
    {
      id: "check-liquidity",
      agentId: "defi",
      action: "check_liquidity",
      params: { tokens: "{{tokens}}" },
      dependsOn: ["get-holdings"],
    },
    {
      id: "analyze-concentration",
      agentId: "custom",
      action: "concentration_analysis",
      params: {},
      dependsOn: ["get-holdings"],
    },
    {
      id: "generate-risk-report",
      agentId: "custom",
      action: "generate_risk_report",
      params: {},
      dependsOn: ["audit-contracts", "check-liquidity", "analyze-concentration"],
    },
  ],
  onError: "continue",
};

export const dailyPortfolioUpdateWorkflow: Workflow = {
  id: "daily-portfolio-update",
  name: "Daily Portfolio Update",
  description: "Daily summary of portfolio changes and market conditions",
  steps: [
    {
      id: "get-portfolio-value",
      agentId: "wallet",
      action: "get_portfolio_value",
      params: { address: "{{wallet}}" },
    },
    {
      id: "get-market-sentiment",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "crypto market" },
    },
    {
      id: "get-active-proposals",
      agentId: "dao",
      action: "get_proposals",
      params: { daoId: "{{daoIds}}", state: "active" },
    },
    {
      id: "check-whale-activity",
      agentId: "defi",
      action: "get_boosted_tokens",
      params: {},
    },
    {
      id: "generate-daily-summary",
      agentId: "custom",
      action: "generate_summary",
      params: {},
      dependsOn: [
        "get-portfolio-value",
        "get-market-sentiment",
        "get-active-proposals",
        "check-whale-activity",
      ],
    },
  ],
  onError: "continue",
};

export const portfolioWorkflows = {
  "rebalance-portfolio": rebalancePortfolioWorkflow,
  "yield-farming-analysis": yieldFarmingWorkflow,
  "risk-assessment": riskAssessmentWorkflow,
  "daily-portfolio-update": dailyPortfolioUpdateWorkflow,
};
