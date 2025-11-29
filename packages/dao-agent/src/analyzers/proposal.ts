import type { Proposal, ProposalSummary } from "../types.js";
import type { LLMClient } from "@gicm/agent-core";

export class ProposalAnalyzer {
  private llmClient?: LLMClient;

  constructor(llmClient?: LLMClient) {
    this.llmClient = llmClient;
  }

  async summarizeProposal(proposal: Proposal): Promise<ProposalSummary> {
    if (!this.llmClient) {
      return this.basicSummary(proposal);
    }

    try {
      const response = await this.llmClient.chat([
        {
          role: "system",
          content: `You are a DAO governance expert. Analyze proposals and provide clear, concise summaries.
Return JSON with this exact structure:
{
  "title": "short title",
  "tldr": "one sentence summary",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "impact": "high" | "medium" | "low",
  "recommendation": "for" | "against" | "abstain",
  "risks": ["risk 1", "risk 2"]
}`,
        },
        {
          role: "user",
          content: `Analyze this proposal:

Title: ${proposal.title}

Body:
${proposal.body.slice(0, 4000)}

Choices: ${proposal.choices.join(", ")}
Current Scores: ${proposal.scores.map((s, i) => `${proposal.choices[i]}: ${s}`).join(", ")}
State: ${proposal.state}
Quorum: ${proposal.quorum}`,
        },
      ]);

      try {
        const parsed = JSON.parse(response.content) as ProposalSummary;
        return {
          title: parsed.title ?? proposal.title,
          tldr: parsed.tldr ?? "",
          keyPoints: parsed.keyPoints ?? [],
          impact: parsed.impact ?? "medium",
          recommendation: parsed.recommendation,
          risks: parsed.risks ?? [],
        };
      } catch {
        return this.basicSummary(proposal);
      }
    } catch {
      return this.basicSummary(proposal);
    }
  }

  private basicSummary(proposal: Proposal): ProposalSummary {
    const bodyPreview = proposal.body.slice(0, 200).trim();
    const leadingChoice = this.getLeadingChoice(proposal);

    return {
      title: proposal.title,
      tldr: bodyPreview + (proposal.body.length > 200 ? "..." : ""),
      keyPoints: [
        `Author: ${proposal.author.slice(0, 10)}...`,
        `State: ${proposal.state}`,
        `Leading: ${leadingChoice}`,
      ],
      impact: this.estimateImpact(proposal),
      risks: [],
    };
  }

  private getLeadingChoice(proposal: Proposal): string {
    if (proposal.scores.length === 0) return "No votes";

    const maxScore = Math.max(...proposal.scores);
    const leadingIndex = proposal.scores.indexOf(maxScore);
    return proposal.choices[leadingIndex] ?? "Unknown";
  }

  private estimateImpact(proposal: Proposal): "high" | "medium" | "low" {
    const bodyLower = proposal.body.toLowerCase();

    // High impact keywords
    if (
      bodyLower.includes("treasury") ||
      bodyLower.includes("upgrade") ||
      bodyLower.includes("migration") ||
      bodyLower.includes("emergency")
    ) {
      return "high";
    }

    // Medium impact keywords
    if (
      bodyLower.includes("parameter") ||
      bodyLower.includes("fee") ||
      bodyLower.includes("grant")
    ) {
      return "medium";
    }

    return "low";
  }

  analyzeVotingPatterns(proposals: Proposal[]): {
    avgParticipation: number;
    avgDuration: number;
    passRate: number;
    topChoices: Array<{ choice: string; count: number }>;
  } {
    if (proposals.length === 0) {
      return {
        avgParticipation: 0,
        avgDuration: 0,
        passRate: 0,
        topChoices: [],
      };
    }

    const choiceCounts = new Map<string, number>();
    let totalParticipation = 0;
    let totalDuration = 0;
    let passedCount = 0;

    for (const proposal of proposals) {
      totalParticipation += proposal.totalVotes;
      totalDuration += proposal.end.getTime() - proposal.start.getTime();

      if (proposal.state === "executed") {
        passedCount++;
      }

      // Count winning choices
      if (proposal.scores.length > 0) {
        const maxScore = Math.max(...proposal.scores);
        const winningIndex = proposal.scores.indexOf(maxScore);
        const winningChoice = proposal.choices[winningIndex];
        if (winningChoice) {
          choiceCounts.set(winningChoice, (choiceCounts.get(winningChoice) ?? 0) + 1);
        }
      }
    }

    const topChoices = Array.from(choiceCounts.entries())
      .map(([choice, count]) => ({ choice, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      avgParticipation: totalParticipation / proposals.length,
      avgDuration: totalDuration / proposals.length / (1000 * 60 * 60 * 24), // Days
      passRate: passedCount / proposals.length,
      topChoices,
    };
  }
}
