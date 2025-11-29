// src/types.ts
import { z } from "zod";
var WalletActionSchema = z.enum([
  "transfer",
  "swap",
  "balance",
  "deploy_token",
  "mint_nft",
  "stake",
  "unstake"
]);
var TransferParamsSchema = z.object({
  action: z.literal("transfer"),
  to: z.string(),
  amount: z.string(),
  token: z.string().optional()
});
var SwapParamsSchema = z.object({
  action: z.literal("swap"),
  inputToken: z.string(),
  outputToken: z.string(),
  amount: z.string(),
  slippage: z.number().default(0.5)
});
var BalanceParamsSchema = z.object({
  action: z.literal("balance"),
  address: z.string().optional(),
  token: z.string().optional()
});
var DeployTokenParamsSchema = z.object({
  action: z.literal("deploy_token"),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().default(18),
  initialSupply: z.string().optional()
});
var WalletCommandSchema = z.discriminatedUnion("action", [
  TransferParamsSchema,
  SwapParamsSchema,
  BalanceParamsSchema,
  DeployTokenParamsSchema
]);

// src/parser.ts
var ACTION_PATTERNS = {
  transfer: [
    /send\s+(\d+\.?\d*)\s*(\w+)?\s*to\s+([a-zA-Z0-9.]+)/i,
    /transfer\s+(\d+\.?\d*)\s*(\w+)?\s*to\s+([a-zA-Z0-9.]+)/i
  ],
  swap: [
    /swap\s+(\d+\.?\d*)\s*(\w+)\s*(?:for|to)\s*(\w+)/i,
    /exchange\s+(\d+\.?\d*)\s*(\w+)\s*(?:for|to)\s*(\w+)/i,
    /convert\s+(\d+\.?\d*)\s*(\w+)\s*(?:to|into)\s*(\w+)/i
  ],
  balance: [
    /(?:check|get|show|what(?:'?s)?)\s*(?:my\s+)?balance/i,
    /(?:how much|what)\s+(?:\w+\s+)?(?:do i have|is in)/i
  ],
  deploy_token: [
    /(?:create|deploy|launch)\s+(?:a\s+)?(?:new\s+)?token\s+(?:called\s+)?(\w+)\s+(?:with\s+symbol\s+)?(\w+)?/i
  ],
  mint_nft: [
    /mint\s+(?:an?\s+)?nft/i,
    /create\s+(?:an?\s+)?nft/i
  ],
  stake: [
    /stake\s+(\d+\.?\d*)\s*(\w+)?/i
  ],
  unstake: [
    /unstake\s+(\d+\.?\d*)\s*(\w+)?/i
  ]
};
function parseNaturalLanguage(input) {
  const normalized = input.trim().toLowerCase();
  for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        return buildCommand(action, match);
      }
    }
  }
  return null;
}
function buildCommand(action, match) {
  switch (action) {
    case "transfer":
      return {
        action: "transfer",
        amount: match[1],
        token: match[2] || void 0,
        to: match[3]
      };
    case "swap":
      return {
        action: "swap",
        amount: match[1],
        inputToken: match[2].toUpperCase(),
        outputToken: match[3].toUpperCase(),
        slippage: 0.5
      };
    case "balance":
      return {
        action: "balance"
      };
    case "deploy_token":
      return {
        action: "deploy_token",
        name: match[1] || "MyToken",
        symbol: match[2] || match[1]?.slice(0, 4).toUpperCase() || "TKN",
        decimals: 18
      };
    default:
      return null;
  }
}
function formatAmount(amount, decimals) {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
function parseAmount(raw, decimals) {
  const str = raw.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const fraction = str.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

// src/wallet-agent.ts
import {
  BaseAgent
} from "@gicm/agent-core";

// src/evm-wallet.ts
var EvmWalletProvider = class {
  config;
  address = null;
  constructor(config) {
    this.config = config;
  }
  async initialize() {
    if (this.config.cdpApiKeyName && this.config.cdpApiKeyPrivate) {
      console.log("[EvmWallet] Coinbase AgentKit mode - use CDP SDK for wallet ops");
    }
    this.address = "0x...";
    return this.address;
  }
  async executeCommand(command, context) {
    switch (command.action) {
      case "balance":
        return this.getBalance(command.address);
      case "transfer":
        return this.transfer(command.to, command.amount, command.token);
      case "swap":
        return this.swap(
          command.inputToken,
          command.outputToken,
          command.amount,
          command.slippage
        );
      case "deploy_token":
        return this.deployToken(
          command.name,
          command.symbol,
          command.decimals,
          command.initialSupply
        );
      default:
        return {
          agent: "wallet-agent",
          success: false,
          error: `Unsupported action: ${command.action}`,
          timestamp: Date.now()
        };
    }
  }
  async getBalance(address) {
    const targetAddress = address || this.address;
    if (!targetAddress) {
      return {
        agent: "wallet-agent",
        success: false,
        error: "No wallet address available",
        timestamp: Date.now()
      };
    }
    const rpcUrl = this.getRpcUrl();
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [targetAddress, "latest"],
        id: 1
      })
    });
    const data = await response.json();
    const balance = parseAmount(BigInt(data.result), 18);
    return {
      agent: "wallet-agent",
      success: true,
      data: {
        address: targetAddress,
        balance,
        symbol: "ETH",
        network: this.config.network
      },
      timestamp: Date.now()
    };
  }
  async transfer(to, amount, token) {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Transfer requires Coinbase AgentKit CDP wallet. Set cdpApiKeyName and cdpApiKeyPrivate.",
      reasoning: "For security, direct transfers require wallet SDK integration",
      data: { to, amount, token },
      timestamp: Date.now()
    };
  }
  async swap(inputToken, outputToken, amount, slippage) {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Swap requires DEX integration via Coinbase AgentKit",
      data: { inputToken, outputToken, amount, slippage },
      timestamp: Date.now()
    };
  }
  async deployToken(name, symbol, decimals, initialSupply) {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Token deployment requires Coinbase AgentKit",
      data: { name, symbol, decimals, initialSupply },
      timestamp: Date.now()
    };
  }
  getRpcUrl() {
    const rpcUrls = {
      mainnet: "https://eth.llamarpc.com",
      base: "https://mainnet.base.org",
      arbitrum: "https://arb1.arbitrum.io/rpc",
      optimism: "https://mainnet.optimism.io",
      polygon: "https://polygon-rpc.com"
    };
    return rpcUrls[this.config.network] || rpcUrls.mainnet;
  }
};

// src/solana-wallet.ts
var SolanaWalletProvider = class {
  config;
  address = null;
  rpcUrl;
  constructor(config) {
    this.config = config;
    this.rpcUrl = this.getRpcUrl();
  }
  async initialize() {
    if (this.config.privateKey) {
      console.log("[SolanaWallet] Using provided private key");
    }
    this.address = "So1ana...";
    return this.address;
  }
  async executeCommand(command, context) {
    switch (command.action) {
      case "balance":
        return this.getBalance(command.address);
      case "transfer":
        return this.transfer(command.to, command.amount, command.token);
      case "swap":
        return this.swap(
          command.inputToken,
          command.outputToken,
          command.amount,
          command.slippage
        );
      case "deploy_token":
        return this.deployToken(
          command.name,
          command.symbol,
          command.decimals,
          command.initialSupply
        );
      default:
        return {
          agent: "wallet-agent",
          success: false,
          error: `Unsupported action: ${command.action}`,
          timestamp: Date.now()
        };
    }
  }
  async getBalance(address) {
    const targetAddress = address || this.address;
    if (!targetAddress) {
      return {
        agent: "wallet-agent",
        success: false,
        error: "No wallet address available",
        timestamp: Date.now()
      };
    }
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getBalance",
        params: [targetAddress],
        id: 1
      })
    });
    const data = await response.json();
    const lamports = data.result?.value ?? 0;
    const balance = parseAmount(BigInt(lamports), 9);
    return {
      agent: "wallet-agent",
      success: true,
      data: {
        address: targetAddress,
        balance,
        symbol: "SOL",
        network: this.config.network
      },
      timestamp: Date.now()
    };
  }
  async transfer(to, amount, token) {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Transfer requires Solana Agent Kit. Configure privateKey.",
      reasoning: "For security, direct transfers require wallet SDK integration",
      data: { to, amount, token },
      timestamp: Date.now()
    };
  }
  async swap(inputToken, outputToken, amount, slippage) {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Jupiter swap requires Solana Agent Kit integration",
      data: {
        inputToken,
        outputToken,
        amount,
        slippage,
        dex: "Jupiter"
      },
      timestamp: Date.now()
    };
  }
  async deployToken(name, symbol, decimals, initialSupply) {
    return {
      agent: "wallet-agent",
      success: false,
      error: "SPL Token deployment requires Solana Agent Kit",
      data: { name, symbol, decimals, initialSupply },
      timestamp: Date.now()
    };
  }
  getRpcUrl() {
    const rpcUrls = {
      "mainnet-beta": "https://api.mainnet-beta.solana.com",
      devnet: "https://api.devnet.solana.com",
      testnet: "https://api.testnet.solana.com"
    };
    return rpcUrls[this.config.network] || rpcUrls["mainnet-beta"];
  }
};

// src/wallet-agent.ts
var WalletAgent = class extends BaseAgent {
  walletConfig;
  evmProvider = null;
  solanaProvider = null;
  constructor(config, walletConfig) {
    super("wallet-agent", config);
    this.walletConfig = walletConfig;
    if (walletConfig.chain === "evm") {
      this.evmProvider = new EvmWalletProvider(walletConfig);
    } else {
      this.solanaProvider = new SolanaWalletProvider(walletConfig);
    }
  }
  getSystemPrompt() {
    return `You are a Web3 Wallet Agent that helps users execute blockchain transactions safely.

CAPABILITIES:
- Check wallet balances (native tokens and ERC20/SPL tokens)
- Transfer tokens to addresses
- Swap tokens via DEX (Uniswap, Jupiter)
- Deploy new tokens
- Mint NFTs

SUPPORTED CHAINS:
- EVM: Ethereum, Base, Arbitrum, Optimism, Polygon
- Solana: mainnet-beta, devnet

SAFETY RULES:
1. Always confirm transaction details before execution
2. Warn about high slippage (>2%)
3. Verify recipient addresses
4. Show gas estimates before transactions
5. Never reveal private keys

RESPONSE FORMAT:
Respond with structured JSON containing:
- action: The action to perform
- params: Action-specific parameters
- confirmation: Human-readable summary for user confirmation`;
  }
  async analyze(context) {
    const query = context.userQuery;
    if (!query) {
      return this.createResult(false, null, "No query provided");
    }
    const command = parseNaturalLanguage(query);
    if (!command) {
      return this.createResult(
        false,
        null,
        `Could not parse command. Supported actions: transfer, swap, balance, deploy_token`,
        void 0,
        `Input: "${query}" did not match any known patterns`
      );
    }
    return this.executeWalletCommand(command, context);
  }
  async executeWalletCommand(command, context) {
    const provider = this.walletConfig.chain === "evm" ? this.evmProvider : this.solanaProvider;
    if (!provider) {
      return this.createResult(
        false,
        null,
        `No provider configured for chain: ${this.walletConfig.chain}`
      );
    }
    return provider.executeCommand(command, context);
  }
  async getBalance(address) {
    return this.executeWalletCommand(
      { action: "balance", address },
      { chain: this.walletConfig.chain, network: this.walletConfig.network }
    );
  }
  async transfer(to, amount, token) {
    return this.executeWalletCommand(
      { action: "transfer", to, amount, token },
      { chain: this.walletConfig.chain, network: this.walletConfig.network }
    );
  }
  async swap(inputToken, outputToken, amount, slippage = 0.5) {
    return this.executeWalletCommand(
      { action: "swap", inputToken, outputToken, amount, slippage },
      { chain: this.walletConfig.chain, network: this.walletConfig.network }
    );
  }
};
export {
  BalanceParamsSchema,
  DeployTokenParamsSchema,
  EvmWalletProvider,
  SolanaWalletProvider,
  SwapParamsSchema,
  TransferParamsSchema,
  WalletActionSchema,
  WalletAgent,
  WalletCommandSchema,
  formatAmount,
  parseAmount,
  parseNaturalLanguage
};
//# sourceMappingURL=index.js.map