import type { Workflow } from "../types.js";

export const researchTokenWorkflow: Workflow = {
  id: "research-token",
  name: "Token Research",
  description: "Comprehensive token research including price, sentiment, and security",
  steps: [
    {
      id: "get-price",
      agentId: "defi",
      action: "get_token_price",
      params: { token: "{{token}}" },
    },
    {
      id: "analyze-sentiment",
      agentId: "social",
      action: "analyze_sentiment",
      params: { query: "{{token}}" },
      dependsOn: ["get-price"],
    },
    {
      id: "check-contract",
      agentId: "audit",
      action: "analyze_contract",
      params: { address: "{{contractAddress}}" },
      dependsOn: ["get-price"],
    },
    {
      id: "get-whale-activity",
      agentId: "defi",
      action: "get_boosted_tokens",
      params: {},
      dependsOn: ["get-price"],
    },
  ],
  onError: "continue",
};

export const swapWorkflow: Workflow = {
  id: "swap-token",
  name: "Token Swap",
  description: "Execute a token swap with safety checks",
  steps: [
    {
      id: "check-balance",
      agentId: "wallet",
      action: "get_balance",
      params: { address: "{{wallet}}", token: "{{fromToken}}" },
    },
    {
      id: "get-quote",
      agentId: "defi",
      action: "get_token_price",
      params: { token: "{{toToken}}" },
      dependsOn: ["check-balance"],
    },
    {
      id: "check-contract-safety",
      agentId: "audit",
      action: "quick_scan",
      params: { address: "{{toToken}}" },
      dependsOn: ["get-quote"],
    },
    {
      id: "execute-swap",
      agentId: "wallet",
      action: "send_transaction",
      params: {
        type: "swap",
        from: "{{fromToken}}",
        to: "{{toToken}}",
        amount: "{{amount}}",
      },
      dependsOn: ["check-contract-safety"],
      condition: (ctx): boolean => {
        const safety = ctx.results.get("check-contract-safety");
        return Boolean(safety?.success && !((safety.data as { hasHighRisk?: boolean })?.hasHighRisk));
      },
    },
  ],
  onError: "stop",
};

export const bridgeWorkflow: Workflow = {
  id: "bridge-tokens",
  name: "Cross-Chain Bridge",
  description: "Bridge tokens between chains with best route selection",
  steps: [
    {
      id: "check-source-balance",
      agentId: "wallet",
      action: "get_balance",
      params: {
        address: "{{wallet}}",
        token: "{{sourceToken}}",
        chain: "{{sourceChain}}",
      },
    },
    {
      id: "find-best-route",
      agentId: "bridge",
      action: "find_best_route",
      params: {
        sourceChain: "{{sourceChain}}",
        destChain: "{{destChain}}",
        sourceToken: "{{sourceToken}}",
        destToken: "{{destToken}}",
        amount: "{{amount}}",
      },
      dependsOn: ["check-source-balance"],
    },
    {
      id: "estimate-fees",
      agentId: "bridge",
      action: "estimate_fees",
      params: {},
      dependsOn: ["find-best-route"],
    },
  ],
  onError: "stop",
};

export const portfolioAnalysisWorkflow: Workflow = {
  id: "analyze-portfolio",
  name: "Portfolio Analysis",
  description: "Analyze wallet portfolio across chains",
  steps: [
    {
      id: "get-evm-balance",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{wallet}}", chain: "evm" },
    },
    {
      id: "get-solana-balance",
      agentId: "wallet",
      action: "get_all_balances",
      params: { address: "{{solanaWallet}}", chain: "solana" },
    },
    {
      id: "get-nft-holdings",
      agentId: "nft",
      action: "get_user_nfts",
      params: { address: "{{wallet}}" },
    },
    {
      id: "calculate-total-value",
      agentId: "defi",
      action: "calculate_portfolio_value",
      params: {},
      dependsOn: ["get-evm-balance", "get-solana-balance", "get-nft-holdings"],
    },
  ],
  onError: "continue",
};

export const tradingWorkflows = {
  "research-token": researchTokenWorkflow,
  "swap-token": swapWorkflow,
  "bridge-tokens": bridgeWorkflow,
  "analyze-portfolio": portfolioAnalysisWorkflow,
};
