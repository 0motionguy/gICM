/**
 * Opportunity Evaluator
 *
 * Scores and evaluates opportunities.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Opportunity } from "../core/types.js";
import { Logger } from "../utils/logger.js";

export class OpportunityEvaluator {
  private anthropic: Anthropic;
  private logger: Logger;

  constructor() {
    this.anthropic = new Anthropic();
    this.logger = new Logger("Evaluator");
  }

  /**
   * Evaluate an opportunity
   */
  async evaluate(opportunity: Opportunity): Promise<Opportunity> {
    try {
      const prompt = `Evaluate this product opportunity for gICM (an AI-powered development platform).

Opportunity:
- Title: ${opportunity.title}
- Description: ${opportunity.description}
- Source: ${opportunity.source}
- Type: ${opportunity.type}

gICM is:
- AI-powered development platform
- Has AI agents for trading, research, content creation
- React component library
- Solana/Web3 focus
- Context engine for codebase understanding

Score each dimension 0-100:
1. userDemand: How many users would want this?
2. competitiveValue: Does this differentiate us from competitors?
3. technicalFit: How well does it fit our TypeScript/React/Solana stack?
4. effort: How easy to build? (100 = very easy, 0 = very hard)
5. impact: How much does it improve gICM?

Also provide analysis:
- whatItDoes: Brief description of the feature
- whyItMatters: Business value
- howToBuild: Technical approach
- risks: Potential problems
- estimatedEffort: "1 day", "1 week", "2 weeks", "1 month"

Determine priority: critical, high, medium, or low

Return as JSON:
{
  "scores": {
    "userDemand": 70,
    "competitiveValue": 80,
    "technicalFit": 90,
    "effort": 60,
    "impact": 75
  },
  "analysis": {
    "whatItDoes": "...",
    "whyItMatters": "...",
    "howToBuild": "...",
    "risks": ["...", "..."],
    "estimatedEffort": "1 week"
  },
  "priority": "high"
}`;

      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0];
      if (text.type !== "text") {
        return this.applyDefaultScores(opportunity);
      }

      const match = text.text.match(/\{[\s\S]*\}/);
      if (!match) {
        return this.applyDefaultScores(opportunity);
      }

      const evaluation = JSON.parse(match[0]) as {
        scores: Opportunity["scores"];
        analysis: {
          whatItDoes: string;
          whyItMatters: string;
          howToBuild: string;
          risks: string[];
          estimatedEffort: string;
        };
        priority: Opportunity["priority"];
      };

      // Calculate overall score
      const overall =
        evaluation.scores.userDemand * 0.25 +
        evaluation.scores.competitiveValue * 0.2 +
        evaluation.scores.technicalFit * 0.15 +
        evaluation.scores.effort * 0.15 +
        evaluation.scores.impact * 0.25;

      opportunity.scores = {
        ...evaluation.scores,
        overall: Math.round(overall),
      };
      opportunity.analysis = {
        ...evaluation.analysis,
        dependencies: opportunity.analysis?.dependencies || [],
      };
      opportunity.priority = evaluation.priority;
      opportunity.status = "evaluated";
      opportunity.evaluatedAt = Date.now();

      this.logger.info(
        `Evaluated: ${opportunity.title} (score: ${opportunity.scores.overall})`
      );
      return opportunity;
    } catch (error) {
      this.logger.error(`Evaluation failed: ${error}`);
      return this.applyDefaultScores(opportunity);
    }
  }

  /**
   * Apply default scores when evaluation fails
   */
  private applyDefaultScores(opportunity: Opportunity): Opportunity {
    opportunity.scores = {
      userDemand: 50,
      competitiveValue: 50,
      technicalFit: 70,
      effort: 50,
      impact: 50,
      overall: 54,
    };
    opportunity.status = "evaluated";
    opportunity.evaluatedAt = Date.now();
    opportunity.priority = "medium";
    return opportunity;
  }
}
