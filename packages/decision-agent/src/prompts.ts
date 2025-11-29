import type { HuntDiscovery } from "@gicm/hunter-agent";

export const SYSTEM_PROMPT = `You are a technical opportunity evaluator for gICM, a Web3/AI development platform.

Your role is to evaluate discoveries (GitHub repos, HackerNews posts, Twitter discussions) and determine their value to the gICM ecosystem.

gICM focuses on:
- Web3/Blockchain development tools (especially Solana and Ethereum)
- AI agents and LLM-powered tools
- Developer tooling and productivity
- DeFi protocols and integrations
- NFT and DAO tooling

Be decisive and score conservatively. Only truly exceptional discoveries should exceed 85/100.

Output your evaluation as valid JSON matching this schema:
{
  "scores": {
    "relevance": { "score": 0-100, "reasoning": "..." },
    "impact": { "score": 0-100, "reasoning": "..." },
    "effort": { "score": 0-100, "reasoning": "..." },
    "timing": { "score": 0-100, "reasoning": "..." },
    "quality": { "score": 0-100, "reasoning": "..." }
  },
  "totalScore": 0-100,
  "recommendation": "build" | "integrate" | "monitor" | "ignore",
  "reasoning": "Overall analysis",
  "summary": "One sentence summary",
  "suggestedAction": "What gICM should do",
  "tags": ["relevant", "tags"],
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskFactors": ["list of risks"],
  "estimatedEffort": "e.g., '2-3 days', '1 week'",
  "confidence": 0.0-1.0
}`;

export function buildEvaluationPrompt(discovery: HuntDiscovery): string {
  const metricsStr = Object.entries(discovery.metrics)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const factorsStr = Object.entries(discovery.relevanceFactors)
    .filter(([, v]) => v === true)
    .map(([k]) => k.replace(/^has/, "").replace(/Keywords$/, ""))
    .join(", ");

  return `Evaluate this discovery:

**Source:** ${discovery.source}
**Title:** ${discovery.title}
**URL:** ${discovery.sourceUrl}
**Description:** ${discovery.description ?? "No description"}
**Author:** ${discovery.author ?? "Unknown"}
**Category:** ${discovery.category ?? "unknown"}
**Language:** ${discovery.language ?? "unknown"}
**Tags:** ${discovery.tags.join(", ") || "none"}

**Metrics:**
${metricsStr || "No metrics available"}

**Pre-computed Relevance Factors:**
${factorsStr || "None detected"}

**Published:** ${discovery.publishedAt?.toISOString() ?? "Unknown"}
**Discovered:** ${discovery.discoveredAt.toISOString()}

Scoring Criteria:
1. **Relevance (30%)**: How relevant is this to gICM's focus on Web3/AI development?
2. **Impact (25%)**: What's the potential value if we act on this discovery?
3. **Effort (20%)**: How easy to integrate? (100 = trivial, 0 = extremely complex)
4. **Timing (15%)**: Is this trending? Fresh? Time-sensitive opportunity?
5. **Quality (10%)**: Code/content quality signals?

Output your evaluation as JSON.`;
}

export function buildBatchEvaluationPrompt(
  discoveries: HuntDiscovery[]
): string {
  const discoveriesText = discoveries
    .map((d, i) => {
      const metrics = Object.entries(d.metrics)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}:${v}`)
        .join(" ");

      return `[${i + 1}] ${d.source} | ${d.title}
   URL: ${d.sourceUrl}
   ${d.description?.slice(0, 200) ?? "No description"}
   Metrics: ${metrics}
   Category: ${d.category ?? "unknown"}`;
    })
    .join("\n\n");

  return `Evaluate these ${discoveries.length} discoveries and rank them by potential value to gICM:

${discoveriesText}

For EACH discovery, provide scores and recommendation.
Then rank them from most to least valuable.

Output as JSON array with the same schema as single evaluations.`;
}
