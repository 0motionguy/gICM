import type { WalletCommand, WalletAction } from "./types.js";

const ACTION_PATTERNS: Record<WalletAction, RegExp[]> = {
  transfer: [
    /send\s+(\d+\.?\d*)\s*(\w+)?\s*to\s+([a-zA-Z0-9.]+)/i,
    /transfer\s+(\d+\.?\d*)\s*(\w+)?\s*to\s+([a-zA-Z0-9.]+)/i,
  ],
  swap: [
    /swap\s+(\d+\.?\d*)\s*(\w+)\s*(?:for|to)\s*(\w+)/i,
    /exchange\s+(\d+\.?\d*)\s*(\w+)\s*(?:for|to)\s*(\w+)/i,
    /convert\s+(\d+\.?\d*)\s*(\w+)\s*(?:to|into)\s*(\w+)/i,
  ],
  balance: [
    /(?:check|get|show|what(?:'?s)?)\s*(?:my\s+)?balance/i,
    /(?:how much|what)\s+(?:\w+\s+)?(?:do i have|is in)/i,
  ],
  deploy_token: [
    /(?:create|deploy|launch)\s+(?:a\s+)?(?:new\s+)?token\s+(?:called\s+)?(\w+)\s+(?:with\s+symbol\s+)?(\w+)?/i,
  ],
  mint_nft: [
    /mint\s+(?:an?\s+)?nft/i,
    /create\s+(?:an?\s+)?nft/i,
  ],
  stake: [
    /stake\s+(\d+\.?\d*)\s*(\w+)?/i,
  ],
  unstake: [
    /unstake\s+(\d+\.?\d*)\s*(\w+)?/i,
  ],
};

export function parseNaturalLanguage(input: string): WalletCommand | null {
  const normalized = input.trim().toLowerCase();

  for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        return buildCommand(action as WalletAction, match);
      }
    }
  }

  return null;
}

function buildCommand(
  action: WalletAction,
  match: RegExpMatchArray
): WalletCommand | null {
  switch (action) {
    case "transfer":
      return {
        action: "transfer",
        amount: match[1],
        token: match[2] || undefined,
        to: match[3],
      };

    case "swap":
      return {
        action: "swap",
        amount: match[1],
        inputToken: match[2].toUpperCase(),
        outputToken: match[3].toUpperCase(),
        slippage: 0.5,
      };

    case "balance":
      return {
        action: "balance",
      };

    case "deploy_token":
      return {
        action: "deploy_token",
        name: match[1] || "MyToken",
        symbol: match[2] || match[1]?.slice(0, 4).toUpperCase() || "TKN",
        decimals: 18,
      };

    default:
      return null;
  }
}

export function formatAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function parseAmount(raw: bigint, decimals: number): string {
  const str = raw.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const fraction = str.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}
