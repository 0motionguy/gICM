// src/types.ts
import { z } from "zod";
var VulnerabilitySeverity = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "informational"
]);
var VulnerabilityCategory = z.enum([
  "reentrancy",
  "overflow",
  "access_control",
  "oracle_manipulation",
  "front_running",
  "dos",
  "logic_error",
  "gas_optimization",
  "centralization",
  "unchecked_return",
  "timestamp_dependency",
  "arbitrary_send",
  "missing_validation"
]);
var VulnerabilitySchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: VulnerabilitySeverity,
  category: VulnerabilityCategory,
  description: z.string(),
  location: z.object({
    file: z.string().optional(),
    line: z.number().optional(),
    function: z.string().optional()
  }),
  recommendation: z.string(),
  references: z.array(z.string()).optional()
});
var AuditResultSchema = z.object({
  contractName: z.string(),
  language: z.enum(["solidity", "rust", "move"]),
  vulnerabilities: z.array(VulnerabilitySchema),
  gasOptimizations: z.array(
    z.object({
      description: z.string(),
      estimatedSavings: z.string().optional(),
      location: z.string().optional()
    })
  ),
  summary: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    informational: z.number()
  }),
  overallRisk: z.enum(["critical", "high", "medium", "low", "safe"]),
  timestamp: z.number()
});

// src/patterns.ts
var SOLIDITY_PATTERNS = [
  {
    name: "Reentrancy via external call before state update",
    category: "reentrancy",
    severity: "critical",
    pattern: /\.call\{.*value.*\}\s*\([^)]*\)[^;]*;[\s\S]*?=\s*[^;]+;/,
    description: "External call made before state variables are updated, enabling reentrancy attacks",
    recommendation: "Follow checks-effects-interactions pattern. Update state before external calls or use ReentrancyGuard."
  },
  {
    name: "Unchecked call return value",
    category: "unchecked_return",
    severity: "high",
    pattern: /\.call\{[^}]*\}\([^)]*\)\s*;(?!\s*require)/,
    description: "Return value of low-level call is not checked",
    recommendation: "Check the return value: (bool success, ) = addr.call{...}(...); require(success);"
  },
  {
    name: "tx.origin authentication",
    category: "access_control",
    severity: "critical",
    pattern: /require\s*\(\s*tx\.origin\s*==|tx\.origin\s*==\s*owner/,
    description: "Using tx.origin for authentication is vulnerable to phishing attacks",
    recommendation: "Use msg.sender instead of tx.origin for authentication"
  },
  {
    name: "Unprotected selfdestruct",
    category: "access_control",
    severity: "critical",
    pattern: /selfdestruct\s*\([^)]+\)/,
    description: "selfdestruct can permanently destroy the contract",
    recommendation: "Add access control or consider if selfdestruct is really needed"
  },
  {
    name: "Weak randomness using block variables",
    category: "oracle_manipulation",
    severity: "high",
    pattern: /block\.(timestamp|number|difficulty|prevrandao)|blockhash\s*\(/,
    description: "Block variables can be manipulated by miners for predictable randomness",
    recommendation: "Use Chainlink VRF or commit-reveal scheme for randomness"
  },
  {
    name: "Integer overflow/underflow",
    category: "overflow",
    severity: "high",
    pattern: /pragma solidity\s*[\^~>=<]*\s*0\.[0-7]\./,
    description: "Solidity <0.8.0 is vulnerable to integer overflow/underflow",
    recommendation: "Upgrade to Solidity >=0.8.0 or use SafeMath library"
  },
  {
    name: "Uninitialized storage pointer",
    category: "logic_error",
    severity: "high",
    pattern: /(\w+)\s+storage\s+\w+\s*;(?!\s*=)/,
    description: "Uninitialized storage pointer may point to unexpected data",
    recommendation: "Always initialize storage pointers or use memory"
  },
  {
    name: "Delegatecall to untrusted contract",
    category: "arbitrary_send",
    severity: "critical",
    pattern: /\.delegatecall\s*\(/,
    description: "delegatecall executes code in caller's context",
    recommendation: "Only delegatecall to trusted, immutable implementation contracts"
  },
  {
    name: "Missing zero address check",
    category: "missing_validation",
    severity: "medium",
    pattern: /function\s+\w+\s*\([^)]*address\s+\w+[^)]*\)\s*(?:external|public)[^{]*\{(?![^}]*require\s*\([^)]*!=\s*address\s*\(\s*0\s*\))/,
    description: "Function accepts address parameter without zero-check",
    recommendation: "Add require(addr != address(0)) for address parameters"
  },
  {
    name: "Public function that should be external",
    category: "gas_optimization",
    severity: "informational",
    pattern: /function\s+\w+\s*\([^)]*\)\s*public\s+(?!view|pure)/,
    description: "Public functions cost more gas than external for large inputs",
    recommendation: "Use external instead of public for functions not called internally"
  },
  {
    name: "Multiple storage reads",
    category: "gas_optimization",
    severity: "informational",
    pattern: /(\w+)\[[\w\[\]]+\][\s\S]*\1\[[\w\[\]]+\][\s\S]*\1\[[\w\[\]]+\]/,
    description: "Multiple reads of same storage variable",
    recommendation: "Cache storage variable in memory for multiple reads"
  }
];
var RUST_ANCHOR_PATTERNS = [
  {
    name: "Missing signer check",
    category: "access_control",
    severity: "critical",
    pattern: /pub\s+\w+:\s*Account<'info,\s*\w+>(?!.*#\[account\(.*signer.*\)\])/,
    description: "Account lacks signer constraint",
    recommendation: "Add #[account(signer)] or Signer type"
  },
  {
    name: "Missing owner check",
    category: "access_control",
    severity: "high",
    pattern: /ctx\.accounts\.\w+\.key\(\)(?![\s\S]*owner)/,
    description: "Account ownership not verified",
    recommendation: "Add owner constraint in account validation"
  },
  {
    name: "Unchecked arithmetic",
    category: "overflow",
    severity: "medium",
    pattern: /\+\s*\d+|\-\s*\d+|\*\s*\d+/,
    description: "Arithmetic operation without checked_* methods",
    recommendation: "Use checked_add, checked_sub, checked_mul for arithmetic"
  },
  {
    name: "Missing PDA bump verification",
    category: "access_control",
    severity: "high",
    pattern: /seeds\s*=\s*\[[^\]]+\](?![\s\S]*bump)/,
    description: "PDA seeds without bump seed verification",
    recommendation: "Include bump seed in PDA derivation"
  }
];
function detectVulnerabilities(code, language) {
  const patterns = language === "solidity" ? SOLIDITY_PATTERNS : RUST_ANCHOR_PATTERNS;
  const results = [];
  for (const pattern of patterns) {
    const matches = [...code.matchAll(new RegExp(pattern.pattern, "g"))];
    if (matches.length > 0) {
      results.push({ pattern, matches });
    }
  }
  return results;
}

// src/audit-agent.ts
import {
  BaseAgent,
  createLLMClient
} from "@gicm/agent-core";
var AuditAgent = class extends BaseAgent {
  auditConfig;
  llmClient = null;
  constructor(config, auditConfig = {}) {
    super("audit-agent", config);
    this.auditConfig = {
      checkReentrancy: true,
      checkOverflow: true,
      checkAccessControl: true,
      checkGasOptimization: true,
      ...auditConfig
    };
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider || "openai",
        apiKey: config.apiKey,
        model: config.llmModel,
        temperature: 0.3,
        maxTokens: 4096
      });
    }
  }
  getSystemPrompt() {
    return `You are an expert smart contract security auditor with deep knowledge of:
- Solidity vulnerabilities (reentrancy, overflow, access control, etc.)
- Rust/Anchor program security on Solana
- Gas optimization techniques
- Common attack vectors (flash loans, oracle manipulation, front-running)

When analyzing code:
1. Identify ALL security vulnerabilities, ranked by severity
2. Explain each vulnerability clearly with line references
3. Provide specific, actionable recommendations
4. Suggest gas optimizations where applicable

Be thorough but avoid false positives. Focus on real exploitable issues.

Response format: JSON with vulnerabilities array, each containing:
- title, severity, category, description, location, recommendation`;
  }
  async analyze(context) {
    const code = context.metadata?.code;
    if (!code) {
      return this.createResult(false, null, "No code provided for audit");
    }
    const language = this.detectLanguage(code);
    const patternResults = detectVulnerabilities(code, language);
    const vulnerabilities = patternResults.map(
      ({ pattern, matches }, idx) => ({
        id: `VULN-${idx + 1}`,
        title: pattern.name,
        severity: pattern.severity,
        category: pattern.category,
        description: pattern.description,
        location: {
          line: this.getLineNumber(code, matches[0].index || 0)
        },
        recommendation: pattern.recommendation
      })
    );
    if (this.llmClient) {
      const llmVulns = await this.performLLMAnalysis(code, language);
      vulnerabilities.push(...llmVulns);
    }
    const auditResult = this.buildAuditResult(
      context.metadata?.contractName || "Unknown",
      language,
      vulnerabilities
    );
    return this.createResult(
      true,
      auditResult,
      void 0,
      this.calculateConfidence(auditResult),
      `Found ${vulnerabilities.length} potential issues`
    );
  }
  detectLanguage(code) {
    if (code.includes("pragma solidity") || code.includes("contract ")) {
      return "solidity";
    }
    if (code.includes("#[program]") || code.includes("use anchor_lang") || code.includes("fn ")) {
      return "rust";
    }
    return "solidity";
  }
  getLineNumber(code, index) {
    return code.slice(0, index).split("\n").length;
  }
  async performLLMAnalysis(code, language) {
    if (!this.llmClient) return [];
    try {
      const prompt = `Analyze this ${language} smart contract for security vulnerabilities:

\`\`\`${language}
${code.slice(0, 8e3)}
\`\`\`

Return ONLY a JSON array of vulnerabilities found. Each object must have:
- id: string
- title: string
- severity: "critical" | "high" | "medium" | "low" | "informational"
- category: string
- description: string
- location: { line?: number, function?: string }
- recommendation: string

If no vulnerabilities found, return empty array [].`;
      const response = await this.llmClient.complete(prompt);
      const parsed = this.parseJSON(response);
      return parsed || [];
    } catch (error) {
      this.log("LLM analysis failed", error);
      return [];
    }
  }
  buildAuditResult(contractName, language, vulnerabilities) {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0
    };
    for (const vuln of vulnerabilities) {
      summary[vuln.severity]++;
    }
    const gasOptimizations = vulnerabilities.filter((v) => v.category === "gas_optimization").map((v) => ({
      description: v.description,
      location: v.location.function || `Line ${v.location.line}`
    }));
    let overallRisk = "safe";
    if (summary.critical > 0) overallRisk = "critical";
    else if (summary.high > 0) overallRisk = "high";
    else if (summary.medium > 0) overallRisk = "medium";
    else if (summary.low > 0) overallRisk = "low";
    return {
      contractName,
      language,
      vulnerabilities: vulnerabilities.filter(
        (v) => v.category !== "gas_optimization"
      ),
      gasOptimizations,
      summary,
      overallRisk,
      timestamp: Date.now()
    };
  }
  calculateConfidence(result) {
    const patternBased = result.vulnerabilities.filter(
      (v) => SOLIDITY_PATTERNS.some((p) => p.name === v.title)
    ).length;
    const total = result.vulnerabilities.length;
    if (total === 0) return 0.7;
    return 0.6 + patternBased / total * 0.3;
  }
  async auditCode(code, contractName = "Contract") {
    const result = await this.analyze({
      chain: "evm",
      network: "mainnet",
      metadata: { code, contractName }
    });
    return result.data;
  }
};
export {
  AuditAgent,
  AuditResultSchema,
  RUST_ANCHOR_PATTERNS,
  SOLIDITY_PATTERNS,
  VulnerabilityCategory,
  VulnerabilitySchema,
  VulnerabilitySeverity,
  detectVulnerabilities
};
//# sourceMappingURL=index.js.map