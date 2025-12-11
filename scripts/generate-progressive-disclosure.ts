#!/usr/bin/env ts-node
/**
 * Progressive Disclosure Token Analysis Script
 *
 * Analyzes token usage across marketplace skills and generates:
 * - Token budget reports per skill level
 * - Optimization recommendations
 * - Progressive disclosure strategies
 * - Token efficiency metrics
 *
 * Helps reduce Claude API costs by optimizing skill loading.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { RegistryItem } from "../src/types/registry";
import type { AgentSkillV2 } from "../src/types/skill-v2";

// ============================================================================
// Configuration
// ============================================================================

const REGISTRY_PATH = join(process.cwd(), "public/marketplace/registry.json");
const CACHE_DIR = join(process.cwd(), ".cache");
const TOKEN_REPORT_PATH = join(CACHE_DIR, "token-analysis.json");

// Token estimation constants (approximate)
const AVG_CHARS_PER_TOKEN = 4;
const LEVEL1_MAX_TOKENS = 200;
const LEVEL2_MAX_TOKENS = 5000;

// ============================================================================
// Types
// ============================================================================

interface TokenBreakdown {
  metadata: number;
  instructions: number;
  resources: number;
  total: number;
}

interface SkillTokenAnalysis {
  skillId: string;
  skillName: string;
  currentTokens: TokenBreakdown;
  recommendedTokens: TokenBreakdown;
  savings: number; // Percentage
  status: "optimal" | "good" | "needs-optimization" | "critical";
  recommendations: string[];
}

interface TokenReport {
  timestamp: string;
  totalSkills: number;
  averageTokensPerSkill: number;
  totalTokensBudget: number;
  potentialSavings: number; // Percentage
  skills: SkillTokenAnalysis[];
  globalRecommendations: string[];
}

// ============================================================================
// Token Estimation
// ============================================================================

/**
 * Estimate tokens from text length
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

/**
 * Estimate tokens for skill metadata (Level 1)
 */
function estimateLevel1Tokens(item: RegistryItem): number {
  let text = "";

  // Core metadata
  text += item.name || "";
  text += item.description || "";
  text += item.category || "";
  text += (item.tags || []).join(" ");

  // Additional discoverable info
  if (item.version) text += item.version;
  if (item.skillId) text += item.skillId;

  return estimateTokens(text);
}

/**
 * Estimate tokens for skill instructions (Level 2)
 */
function estimateLevel2Tokens(item: RegistryItem): number {
  let text = "";

  // Instructions content
  text += item.longDescription || "";
  text += item.install || "";
  text += item.setup || "";

  return estimateTokens(text);
}

/**
 * Estimate tokens for skill resources (Level 3)
 */
function estimateLevel3Tokens(item: RegistryItem): number {
  let tokens = 0;

  // Resources are loaded on demand, estimate from available data
  if (item.resources) {
    tokens += (item.resources.scripts?.length || 0) * 500; // Avg script size
    tokens += (item.resources.templates?.length || 0) * 200;
    tokens += (item.resources.references?.length || 0) * 100;
  }

  return tokens;
}

// ============================================================================
// Analysis
// ============================================================================

function analyzeSkillTokens(item: RegistryItem): SkillTokenAnalysis {
  // Current token usage
  const currentTokens: TokenBreakdown = {
    metadata:
      item.progressiveDisclosure?.level1Tokens || estimateLevel1Tokens(item),
    instructions:
      item.progressiveDisclosure?.level2Tokens || estimateLevel2Tokens(item),
    resources:
      item.progressiveDisclosure?.level3Estimate || estimateLevel3Tokens(item),
    total: 0,
  };
  currentTokens.total =
    currentTokens.metadata +
    currentTokens.instructions +
    currentTokens.resources;

  // Recommended optimization
  const recommendedTokens: TokenBreakdown = {
    metadata: Math.min(currentTokens.metadata, LEVEL1_MAX_TOKENS),
    instructions: Math.min(currentTokens.instructions, LEVEL2_MAX_TOKENS),
    resources: currentTokens.resources, // No limit for Level 3
    total: 0,
  };
  recommendedTokens.total =
    recommendedTokens.metadata +
    recommendedTokens.instructions +
    recommendedTokens.resources;

  // Calculate savings
  const savings =
    currentTokens.total > 0
      ? ((currentTokens.total - recommendedTokens.total) /
          currentTokens.total) *
        100
      : 0;

  // Determine status
  let status: SkillTokenAnalysis["status"];
  if (
    currentTokens.metadata <= LEVEL1_MAX_TOKENS &&
    currentTokens.instructions <= LEVEL2_MAX_TOKENS
  ) {
    status = "optimal";
  } else if (currentTokens.instructions <= LEVEL2_MAX_TOKENS * 1.2) {
    status = "good";
  } else if (currentTokens.instructions <= LEVEL2_MAX_TOKENS * 1.5) {
    status = "needs-optimization";
  } else {
    status = "critical";
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (currentTokens.metadata > LEVEL1_MAX_TOKENS) {
    const excess = currentTokens.metadata - LEVEL1_MAX_TOKENS;
    recommendations.push(
      `Reduce Level 1 metadata by ${excess} tokens. Move verbose descriptions to Level 2.`
    );
  }

  if (currentTokens.instructions > LEVEL2_MAX_TOKENS) {
    const excess = currentTokens.instructions - LEVEL2_MAX_TOKENS;
    recommendations.push(
      `Reduce Level 2 instructions by ${excess} tokens. Extract examples to Level 3 resources.`
    );
  }

  if (!item.progressiveDisclosure) {
    recommendations.push(
      "Add progressiveDisclosure configuration for optimal token management."
    );
  }

  if (currentTokens.instructions > 3000 && currentTokens.resources === 0) {
    recommendations.push(
      "Consider moving reference documentation to Level 3 resources."
    );
  }

  // Optimization strategies
  if (item.longDescription && item.longDescription.length > 2000) {
    recommendations.push(
      "Long description is verbose. Summarize core instructions, link to full docs."
    );
  }

  if (!item.skillId) {
    recommendations.push(
      "Add skillId for Skills v2 compatibility and better token tracking."
    );
  }

  return {
    skillId: item.skillId || item.id,
    skillName: item.name,
    currentTokens,
    recommendedTokens,
    savings: Math.round(savings),
    status,
    recommendations,
  };
}

function generateGlobalRecommendations(
  analyses: SkillTokenAnalysis[]
): string[] {
  const recommendations: string[] = [];

  const criticalCount = analyses.filter((a) => a.status === "critical").length;
  const needsOptCount = analyses.filter(
    (a) => a.status === "needs-optimization"
  ).length;
  const withoutPD = analyses.filter(
    (a) => !a.recommendations.includes("Add progressiveDisclosure")
  ).length;

  if (criticalCount > 0) {
    recommendations.push(
      `${criticalCount} skills critically exceed token limits. Prioritize optimization.`
    );
  }

  if (needsOptCount > 5) {
    recommendations.push(
      `${needsOptCount} skills need optimization. Consider batch refactoring.`
    );
  }

  if (withoutPD < analyses.length * 0.5) {
    recommendations.push(
      "Less than 50% of skills use progressive disclosure. Enable across all skills."
    );
  }

  const avgTotal =
    analyses.reduce((sum, a) => sum + a.currentTokens.total, 0) /
    analyses.length;
  if (avgTotal > 6000) {
    recommendations.push(
      `Average tokens per skill: ${Math.round(avgTotal)}. Target <5000 for cost efficiency.`
    );
  }

  const potentialSavings =
    analyses.reduce((sum, a) => sum + a.savings, 0) / analyses.length;
  if (potentialSavings > 20) {
    recommendations.push(
      `Potential ${Math.round(potentialSavings)}% token savings across marketplace. Implement optimizations.`
    );
  }

  return recommendations;
}

// ============================================================================
// Report Generation
// ============================================================================

async function generateTokenReport(): Promise<TokenReport> {
  console.log("📊 Analyzing token usage across marketplace...\n");

  const registry = loadRegistry();
  const skills = registry.filter((item) => item.kind === "skill");

  console.log(`Analyzing ${skills.length} skills...\n`);

  const analyses: SkillTokenAnalysis[] = [];

  for (const skill of skills) {
    const analysis = analyzeSkillTokens(skill);
    analyses.push(analysis);

    // Print immediate feedback
    const statusIcon = {
      optimal: "✅",
      good: "👍",
      "needs-optimization": "⚠️",
      critical: "❌",
    }[analysis.status];

    console.log(`${statusIcon} ${analysis.skillName}`);
    console.log(`   Current: ${analysis.currentTokens.total} tokens`);
    console.log(`   Optimal: ${analysis.recommendedTokens.total} tokens`);
    if (analysis.savings > 0) {
      console.log(`   Savings: ${analysis.savings}%`);
    }

    if (analysis.recommendations.length > 0) {
      console.log(`   Top recommendation: ${analysis.recommendations[0]}`);
    }

    console.log("");
  }

  const totalTokensBudget = analyses.reduce(
    (sum, a) => sum + a.currentTokens.total,
    0
  );
  const averageTokensPerSkill = totalTokensBudget / analyses.length;
  const potentialSavings =
    analyses.reduce((sum, a) => sum + a.savings, 0) / analyses.length;

  const globalRecommendations = generateGlobalRecommendations(analyses);

  const report: TokenReport = {
    timestamp: new Date().toISOString(),
    totalSkills: skills.length,
    averageTokensPerSkill: Math.round(averageTokensPerSkill),
    totalTokensBudget,
    potentialSavings: Math.round(potentialSavings),
    skills: analyses,
    globalRecommendations,
  };

  return report;
}

function loadRegistry(): RegistryItem[] {
  if (!existsSync(REGISTRY_PATH)) {
    console.error(`Registry not found at: ${REGISTRY_PATH}`);
    return [];
  }

  const content = readFileSync(REGISTRY_PATH, "utf-8");
  return JSON.parse(content);
}

// ============================================================================
// Reporting
// ============================================================================

function printSummary(report: TokenReport): void {
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log("📊 TOKEN ANALYSIS SUMMARY");
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`Timestamp:              ${report.timestamp}`);
  console.log(`Total Skills:           ${report.totalSkills}`);
  console.log(`Average Tokens/Skill:   ${report.averageTokensPerSkill}`);
  console.log(
    `Total Token Budget:     ${report.totalTokensBudget.toLocaleString()}`
  );
  console.log(`Potential Savings:      ${report.potentialSavings}%`);
  console.log("");

  // Status breakdown
  const optimal = report.skills.filter((s) => s.status === "optimal").length;
  const good = report.skills.filter((s) => s.status === "good").length;
  const needsOpt = report.skills.filter(
    (s) => s.status === "needs-optimization"
  ).length;
  const critical = report.skills.filter((s) => s.status === "critical").length;

  console.log("STATUS BREAKDOWN:");
  console.log(
    `  ✅ Optimal:              ${optimal} (${((optimal / report.totalSkills) * 100).toFixed(1)}%)`
  );
  console.log(
    `  👍 Good:                 ${good} (${((good / report.totalSkills) * 100).toFixed(1)}%)`
  );
  console.log(
    `  ⚠️  Needs Optimization:  ${needsOpt} (${((needsOpt / report.totalSkills) * 100).toFixed(1)}%)`
  );
  console.log(
    `  ❌ Critical:             ${critical} (${((critical / report.totalSkills) * 100).toFixed(1)}%)`
  );
  console.log("");

  if (report.globalRecommendations.length > 0) {
    console.log("📌 GLOBAL RECOMMENDATIONS:");
    report.globalRecommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log("");
  }

  if (critical > 0) {
    console.log("🚨 CRITICAL OPTIMIZATION REQUIRED:");
    report.skills
      .filter((s) => s.status === "critical")
      .slice(0, 5)
      .forEach((s) => {
        console.log(`  ${s.skillName}`);
        console.log(`    Current: ${s.currentTokens.total} tokens`);
        console.log(`    Target:  ${s.recommendedTokens.total} tokens`);
        console.log(`    Action:  ${s.recommendations[0]}`);
      });
    console.log("");
  }

  // Cost savings estimate
  const savedTokens = report.skills.reduce(
    (sum, s) => sum + (s.currentTokens.total - s.recommendedTokens.total),
    0
  );
  const costPerMToken = 3; // $3 per 1M tokens (Claude Sonnet)
  const monthlySavings = (savedTokens / 1_000_000) * costPerMToken * 30; // 30 days

  if (savedTokens > 0) {
    console.log("💰 ESTIMATED COST SAVINGS:");
    console.log(`  Tokens saved per load:  ${savedTokens.toLocaleString()}`);
    console.log(`  Monthly savings (est):  $${monthlySavings.toFixed(2)}`);
  }

  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
}

function saveReport(report: TokenReport): void {
  writeFileSync(TOKEN_REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full token analysis saved to: ${TOKEN_REPORT_PATH}`);
}

function generateOptimizationGuide(report: TokenReport): void {
  const guidePath = join(CACHE_DIR, "token-optimization-guide.md");

  let guide = `# Token Optimization Guide
Generated: ${report.timestamp}

## Overview
- **Total Skills**: ${report.totalSkills}
- **Average Tokens**: ${report.averageTokensPerSkill} per skill
- **Potential Savings**: ${report.potentialSavings}%

## Progressive Disclosure Best Practices

### Level 1: Metadata (Target: <200 tokens)
- Skill name and ID
- Brief description (<1024 chars)
- Category and tags
- Trigger patterns

### Level 2: Instructions (Target: <5000 tokens)
- Core instructions
- 2-3 examples
- Output format
- Common constraints

### Level 3: Resources (No limit - loaded on demand)
- Full reference documentation
- Extended examples
- Templates and schemas
- External API specifications

## Skills Requiring Optimization

`;

  // Add critical skills
  const critical = report.skills.filter((s) => s.status === "critical");
  if (critical.length > 0) {
    guide += `### Critical Priority (${critical.length} skills)\n\n`;
    critical.forEach((skill) => {
      guide += `#### ${skill.skillName}\n`;
      guide += `- Current: ${skill.currentTokens.total} tokens\n`;
      guide += `- Target: ${skill.recommendedTokens.total} tokens\n`;
      guide += `- Recommendations:\n`;
      skill.recommendations.forEach((rec) => {
        guide += `  - ${rec}\n`;
      });
      guide += "\n";
    });
  }

  writeFileSync(guidePath, guide);
  console.log(`📖 Optimization guide saved to: ${guidePath}`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    const report = await generateTokenReport();
    printSummary(report);
    saveReport(report);
    generateOptimizationGuide(report);

    // Exit with warning if critical optimizations needed
    const critical = report.skills.filter(
      (s) => s.status === "critical"
    ).length;
    if (critical > 0) {
      console.log(
        `\n⚠️  Warning: ${critical} skills require critical optimization`
      );
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Fatal error during token analysis:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateTokenReport, analyzeSkillTokens };
export type { TokenReport, SkillTokenAnalysis, TokenBreakdown };
