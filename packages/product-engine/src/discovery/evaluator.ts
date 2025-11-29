/**
 * Opportunity Evaluator
 *
 * Scores and prioritizes opportunities.
 */

import type { Opportunity } from "../core/types.js";
import { generateJSON } from "../utils/llm.js";
import { Logger } from "../utils/logger.js";

export class OpportunityEvaluator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger("Evaluator");
  }

  /**
   * Evaluate an opportunity
   */
  async evaluate(opportunity: Opportunity): Promise<Opportunity> {
    this.logger.info(`Evaluating: ${opportunity.title}`);

    try {
      // Use LLM to analyze and score
      const analysis = await generateJSON<{
        scores: {
          userDemand: number;
          competitiveValue: number;
          technicalFit: number;
          effort: number;
          impact: number;
        };
        analysis: {
          whatItDoes: string;
          whyItMatters: string;
          howToBuild: string;
          risks: string[];
          dependencies: string[];
          estimatedEffort: string;
        };
        priority: "critical" | "high" | "medium" | "low";
      }>({
        prompt: `Evaluate this product opportunity for gICM (an AI-powered development platform):

Title: ${opportunity.title}
Description: ${opportunity.description}
Source: ${opportunity.source}
Type: ${opportunity.type}

gICM Context:
- AI agents for trading, research, content generation
- React component library with 100+ components
- Solana/Web3 focus
- Competes with Cursor, Replit, v0, Bolt

Score each 0-100:
- userDemand: How many users want this?
- competitiveValue: Does this differentiate us from competitors?
- technicalFit: How well does it fit our TypeScript/React/Solana stack?
- effort: How easy to build? (100 = very easy, 0 = very hard)
- impact: How much does it improve gICM?

Return JSON:
{
  "scores": { userDemand, competitiveValue, technicalFit, effort, impact },
  "analysis": {
    "whatItDoes": "<1 sentence>",
    "whyItMatters": "<1 sentence>",
    "howToBuild": "<1-2 sentences>",
    "risks": ["<risk1>", "<risk2>"],
    "dependencies": ["<dep1>"],
    "estimatedEffort": "<e.g., '1 week', '2-3 days'>"
  },
  "priority": "<critical|high|medium|low>"
}`,
      });

      // Calculate overall score
      const { userDemand, competitiveValue, technicalFit, effort, impact } = analysis.scores;
      const overall = Math.round(
        userDemand * 0.25 +
        competitiveValue * 0.2 +
        technicalFit * 0.15 +
        effort * 0.15 +
        impact * 0.25
      );

      opportunity.scores = {
        ...analysis.scores,
        overall,
      };

      opportunity.analysis = analysis.analysis;
      opportunity.priority = analysis.priority;
      opportunity.status = "evaluated";
      opportunity.evaluatedAt = Date.now();

      this.logger.info(`Evaluated: ${opportunity.title} - Score: ${overall}, Priority: ${analysis.priority}`);

      return opportunity;
    } catch (error) {
      this.logger.error(`Evaluation failed: ${error}`);

      // Default scores on failure
      opportunity.scores = {
        userDemand: 50,
        competitiveValue: 50,
        technicalFit: 50,
        effort: 50,
        impact: 50,
        overall: 50,
      };

      opportunity.analysis = {
        whatItDoes: opportunity.description,
        whyItMatters: "Needs manual evaluation",
        howToBuild: "Needs manual planning",
        risks: ["Automated evaluation failed"],
        dependencies: [],
        estimatedEffort: "Unknown",
      };

      opportunity.priority = "medium";
      opportunity.status = "evaluated";
      opportunity.evaluatedAt = Date.now();

      return opportunity;
    }
  }

  /**
   * Re-evaluate all opportunities
   */
  async reEvaluateAll(opportunities: Opportunity[]): Promise<Opportunity[]> {
    const results: Opportunity[] = [];

    for (const opp of opportunities) {
      const evaluated = await this.evaluate(opp);
      results.push(evaluated);
    }

    return results;
  }
}
