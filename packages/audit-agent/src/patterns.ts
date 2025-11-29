import type { VulnerabilityCategory, VulnerabilitySeverity } from "./types.js";

export interface VulnerabilityPattern {
  name: string;
  category: VulnerabilityCategory;
  severity: VulnerabilitySeverity;
  pattern: RegExp;
  description: string;
  recommendation: string;
}

export const SOLIDITY_PATTERNS: VulnerabilityPattern[] = [
  {
    name: "Reentrancy via external call before state update",
    category: "reentrancy",
    severity: "critical",
    pattern: /\.call\{.*value.*\}\s*\([^)]*\)[^;]*;[\s\S]*?=\s*[^;]+;/,
    description:
      "External call made before state variables are updated, enabling reentrancy attacks",
    recommendation:
      "Follow checks-effects-interactions pattern. Update state before external calls or use ReentrancyGuard.",
  },
  {
    name: "Unchecked call return value",
    category: "unchecked_return",
    severity: "high",
    pattern: /\.call\{[^}]*\}\([^)]*\)\s*;(?!\s*require)/,
    description: "Return value of low-level call is not checked",
    recommendation:
      "Check the return value: (bool success, ) = addr.call{...}(...); require(success);",
  },
  {
    name: "tx.origin authentication",
    category: "access_control",
    severity: "critical",
    pattern: /require\s*\(\s*tx\.origin\s*==|tx\.origin\s*==\s*owner/,
    description:
      "Using tx.origin for authentication is vulnerable to phishing attacks",
    recommendation: "Use msg.sender instead of tx.origin for authentication",
  },
  {
    name: "Unprotected selfdestruct",
    category: "access_control",
    severity: "critical",
    pattern: /selfdestruct\s*\([^)]+\)/,
    description: "selfdestruct can permanently destroy the contract",
    recommendation:
      "Add access control or consider if selfdestruct is really needed",
  },
  {
    name: "Weak randomness using block variables",
    category: "oracle_manipulation",
    severity: "high",
    pattern:
      /block\.(timestamp|number|difficulty|prevrandao)|blockhash\s*\(/,
    description:
      "Block variables can be manipulated by miners for predictable randomness",
    recommendation: "Use Chainlink VRF or commit-reveal scheme for randomness",
  },
  {
    name: "Integer overflow/underflow",
    category: "overflow",
    severity: "high",
    pattern: /pragma solidity\s*[\^~>=<]*\s*0\.[0-7]\./,
    description:
      "Solidity <0.8.0 is vulnerable to integer overflow/underflow",
    recommendation: "Upgrade to Solidity >=0.8.0 or use SafeMath library",
  },
  {
    name: "Uninitialized storage pointer",
    category: "logic_error",
    severity: "high",
    pattern: /(\w+)\s+storage\s+\w+\s*;(?!\s*=)/,
    description: "Uninitialized storage pointer may point to unexpected data",
    recommendation: "Always initialize storage pointers or use memory",
  },
  {
    name: "Delegatecall to untrusted contract",
    category: "arbitrary_send",
    severity: "critical",
    pattern: /\.delegatecall\s*\(/,
    description: "delegatecall executes code in caller's context",
    recommendation:
      "Only delegatecall to trusted, immutable implementation contracts",
  },
  {
    name: "Missing zero address check",
    category: "missing_validation",
    severity: "medium",
    pattern:
      /function\s+\w+\s*\([^)]*address\s+\w+[^)]*\)\s*(?:external|public)[^{]*\{(?![^}]*require\s*\([^)]*!=\s*address\s*\(\s*0\s*\))/,
    description: "Function accepts address parameter without zero-check",
    recommendation:
      "Add require(addr != address(0)) for address parameters",
  },
  {
    name: "Public function that should be external",
    category: "gas_optimization",
    severity: "informational",
    pattern: /function\s+\w+\s*\([^)]*\)\s*public\s+(?!view|pure)/,
    description: "Public functions cost more gas than external for large inputs",
    recommendation:
      "Use external instead of public for functions not called internally",
  },
  {
    name: "Multiple storage reads",
    category: "gas_optimization",
    severity: "informational",
    pattern: /(\w+)\[[\w\[\]]+\][\s\S]*\1\[[\w\[\]]+\][\s\S]*\1\[[\w\[\]]+\]/,
    description: "Multiple reads of same storage variable",
    recommendation: "Cache storage variable in memory for multiple reads",
  },
];

export const RUST_ANCHOR_PATTERNS: VulnerabilityPattern[] = [
  {
    name: "Missing signer check",
    category: "access_control",
    severity: "critical",
    pattern: /pub\s+\w+:\s*Account<'info,\s*\w+>(?!.*#\[account\(.*signer.*\)\])/,
    description: "Account lacks signer constraint",
    recommendation: "Add #[account(signer)] or Signer type",
  },
  {
    name: "Missing owner check",
    category: "access_control",
    severity: "high",
    pattern: /ctx\.accounts\.\w+\.key\(\)(?![\s\S]*owner)/,
    description: "Account ownership not verified",
    recommendation: "Add owner constraint in account validation",
  },
  {
    name: "Unchecked arithmetic",
    category: "overflow",
    severity: "medium",
    pattern: /\+\s*\d+|\-\s*\d+|\*\s*\d+/,
    description: "Arithmetic operation without checked_* methods",
    recommendation:
      "Use checked_add, checked_sub, checked_mul for arithmetic",
  },
  {
    name: "Missing PDA bump verification",
    category: "access_control",
    severity: "high",
    pattern: /seeds\s*=\s*\[[^\]]+\](?![\s\S]*bump)/,
    description: "PDA seeds without bump seed verification",
    recommendation: "Include bump seed in PDA derivation",
  },
];

export function detectVulnerabilities(
  code: string,
  language: "solidity" | "rust"
): Array<{
  pattern: VulnerabilityPattern;
  matches: RegExpMatchArray[];
}> {
  const patterns =
    language === "solidity" ? SOLIDITY_PATTERNS : RUST_ANCHOR_PATTERNS;
  const results: Array<{
    pattern: VulnerabilityPattern;
    matches: RegExpMatchArray[];
  }> = [];

  for (const pattern of patterns) {
    const matches = [...code.matchAll(new RegExp(pattern.pattern, "g"))];
    if (matches.length > 0) {
      results.push({ pattern, matches });
    }
  }

  return results;
}
