import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
  createLLMClient,
  type LLMClient,
} from "@gicm/agent-core";
import { detectVulnerabilities, SOLIDITY_PATTERNS } from "./patterns.js";
import type {
  AuditConfig,
  AuditResult,
  Vulnerability,
  VulnerabilitySeverity,
} from "./types.js";

export class AuditAgent extends BaseAgent {
  private auditConfig: AuditConfig;
  private llmClient: LLMClient | null = null;

  constructor(config: AgentConfig, auditConfig: AuditConfig = {}) {
    super("audit-agent", config);
    this.auditConfig = {
      checkReentrancy: true,
      checkOverflow: true,
      checkAccessControl: true,
      checkGasOptimization: true,
      ...auditConfig,
    };

    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider || "openai",
        apiKey: config.apiKey,
        model: config.llmModel,
        temperature: 0.3,
        maxTokens: 4096,
      });
    }
  }

  getSystemPrompt(): string {
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

  async analyze(context: AgentContext): Promise<AgentResult> {
    const code = context.metadata?.code as string;
    if (!code) {
      return this.createResult(false, null, "No code provided for audit");
    }

    const language = this.detectLanguage(code);
    const patternResults = detectVulnerabilities(code, language);

    const vulnerabilities: Vulnerability[] = patternResults.map(
      ({ pattern, matches }, idx) => ({
        id: `VULN-${idx + 1}`,
        title: pattern.name,
        severity: pattern.severity,
        category: pattern.category,
        description: pattern.description,
        location: {
          line: this.getLineNumber(code, matches[0].index || 0),
        },
        recommendation: pattern.recommendation,
      })
    );

    if (this.llmClient) {
      const llmVulns = await this.performLLMAnalysis(code, language);
      vulnerabilities.push(...llmVulns);
    }

    const auditResult = this.buildAuditResult(
      context.metadata?.contractName as string || "Unknown",
      language,
      vulnerabilities
    );

    return this.createResult(
      true,
      auditResult,
      undefined,
      this.calculateConfidence(auditResult),
      `Found ${vulnerabilities.length} potential issues`
    );
  }

  private detectLanguage(code: string): "solidity" | "rust" {
    if (code.includes("pragma solidity") || code.includes("contract ")) {
      return "solidity";
    }
    if (
      code.includes("#[program]") ||
      code.includes("use anchor_lang") ||
      code.includes("fn ")
    ) {
      return "rust";
    }
    return "solidity";
  }

  private getLineNumber(code: string, index: number): number {
    return code.slice(0, index).split("\n").length;
  }

  private async performLLMAnalysis(
    code: string,
    language: string
  ): Promise<Vulnerability[]> {
    if (!this.llmClient) return [];

    try {
      const prompt = `Analyze this ${language} smart contract for security vulnerabilities:

\`\`\`${language}
${code.slice(0, 8000)}
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
      const parsed = this.parseJSON<Vulnerability[]>(response);
      return parsed || [];
    } catch (error) {
      this.log("LLM analysis failed", error);
      return [];
    }
  }

  private buildAuditResult(
    contractName: string,
    language: "solidity" | "rust",
    vulnerabilities: Vulnerability[]
  ): AuditResult {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    for (const vuln of vulnerabilities) {
      summary[vuln.severity]++;
    }

    const gasOptimizations = vulnerabilities
      .filter((v) => v.category === "gas_optimization")
      .map((v) => ({
        description: v.description,
        location: v.location.function || `Line ${v.location.line}`,
      }));

    let overallRisk: AuditResult["overallRisk"] = "safe";
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
      timestamp: Date.now(),
    };
  }

  private calculateConfidence(result: AuditResult): number {
    const patternBased = result.vulnerabilities.filter((v) =>
      SOLIDITY_PATTERNS.some((p) => p.name === v.title)
    ).length;
    const total = result.vulnerabilities.length;

    if (total === 0) return 0.7;
    return 0.6 + (patternBased / total) * 0.3;
  }

  async auditCode(
    code: string,
    contractName = "Contract"
  ): Promise<AuditResult> {
    const result = await this.analyze({
      chain: "evm",
      network: "mainnet",
      metadata: { code, contractName },
    });

    return result.data as AuditResult;
  }
}
