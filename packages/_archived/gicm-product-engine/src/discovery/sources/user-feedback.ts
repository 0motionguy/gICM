/**
 * User Feedback Discovery
 *
 * Collect feature requests from users.
 */

import type { Opportunity, UserFeedback } from "../../core/types.js";
import { Logger } from "../../utils/logger.js";

export class UserFeedbackDiscovery {
  private logger: Logger;
  private feedbackQueue: UserFeedback[] = [];

  constructor() {
    this.logger = new Logger("UserFeedback");
  }

  /**
   * Discover opportunities from user feedback
   */
  async discover(): Promise<Opportunity[]> {
    this.logger.info("Scanning user feedback...");

    const opportunities: Opportunity[] = [];

    // Process queued feedback
    for (const feedback of this.feedbackQueue) {
      if (feedback.processed) continue;

      const opportunity = this.feedbackToOpportunity(feedback);
      opportunities.push(opportunity);
      feedback.processed = true;
      feedback.opportunityId = opportunity.id;
    }

    this.logger.info(`Found ${opportunities.length} opportunities from feedback`);
    return opportunities;
  }

  /**
   * Add feedback to queue
   */
  addFeedback(feedback: Omit<UserFeedback, "id" | "processed" | "createdAt">): UserFeedback {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processed: false,
      createdAt: Date.now(),
    };

    this.feedbackQueue.push(newFeedback);
    this.logger.info(`Added feedback: ${feedback.title}`);
    return newFeedback;
  }

  /**
   * Convert feedback to opportunity
   */
  private feedbackToOpportunity(feedback: UserFeedback): Opportunity {
    const typeMap: Record<UserFeedback["type"], Opportunity["type"]> = {
      feature_request: "new_feature",
      bug_report: "bug_fix",
      improvement: "improvement",
      question: "improvement",
    };

    return {
      id: `opp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: "user_feedback",
      type: typeMap[feedback.type],
      title: feedback.title,
      description: feedback.description,
      scores: {
        userDemand: Math.min(100, 50 + feedback.upvotes * 5),
        competitiveValue: 60,
        technicalFit: 70,
        effort: 60,
        impact: Math.min(100, 50 + feedback.comments * 3),
        overall: 0,
      },
      analysis: {
        whatItDoes: feedback.description,
        whyItMatters: `Requested by user${feedback.upvotes > 0 ? ` with ${feedback.upvotes} upvotes` : ""}`,
        howToBuild: "Analyze requirements and implement",
        risks: [],
        dependencies: [],
        estimatedEffort: "1 week",
      },
      status: "discovered",
      priority: feedback.upvotes > 10 ? "high" : feedback.upvotes > 5 ? "medium" : "low",
      discoveredAt: Date.now(),
    };
  }

  /**
   * Get pending feedback
   */
  getPendingFeedback(): UserFeedback[] {
    return this.feedbackQueue.filter((f) => !f.processed);
  }
}
