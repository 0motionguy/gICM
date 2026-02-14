import type { Mode } from "./types.js";

export interface ModeTrigger {
  mode: Mode;
  patterns: RegExp[];
  keywords: string[];
}

export const MODE_TRIGGERS: ModeTrigger[] = [
  {
    mode: "BUILD",
    patterns: [
      /\b(build|create|implement|code|develop|fix|debug|deploy|refactor|test)\b/i,
    ],
    keywords: [
      "function",
      "component",
      "API",
      "endpoint",
      "bug",
      "error",
      "compile",
      "lint",
      "package",
      "module",
      "class",
      "interface",
      "type",
      "install",
      "dependency",
    ],
  },
  {
    mode: "THINK",
    patterns: [
      /\b(architect|design system|plan|analyze|compare|evaluate|strategy)\b/i,
    ],
    keywords: [
      "tradeoff",
      "approach",
      "architecture",
      "pros cons",
      "decision",
      "pattern",
      "system design",
      "scalability",
      "framework",
      "methodology",
    ],
  },
  {
    mode: "VIBE",
    patterns: [
      /\b(hello|hi|hey|how are you|what's up|chat|casual|weather|what's the)\b/i,
    ],
    keywords: [
      "weather",
      "joke",
      "story",
      "fun",
      "cool",
      "nice",
      "thanks",
      "appreciate",
      "awesome",
      "great",
    ],
  },
  {
    mode: "TRADE",
    patterns: [
      /\b(trade|buy|sell|market|polymarket|portfolio|hedge|arbitrage|position)\b/i,
    ],
    keywords: [
      "USDC",
      "profit",
      "P&L",
      "risk",
      "whale",
      "DeFi",
      "swap",
      "yield",
      "liquidity",
      "token",
      "price",
      "volume",
      "kelly",
      "sharpe",
    ],
  },
  {
    mode: "CREATE",
    patterns: [
      /\b(write|compose|draft|blog|tweet|creative|poem|story|content)\b/i,
    ],
    keywords: [
      "article",
      "post",
      "copy",
      "headline",
      "title",
      "description",
      "narrative",
      "script",
      "markdown",
      "document",
    ],
  },
  {
    mode: "AUDIT",
    patterns: [
      /\b(audit|security|scan|vulnerability|CVE|exploit|penetration|smart contract)\b/i,
    ],
    keywords: [
      "reentrancy",
      "overflow",
      "injection",
      "malicious",
      "threat",
      "attack",
      "unsafe",
      "sanitize",
      "validation",
      "XSS",
      "CSRF",
    ],
  },
];
