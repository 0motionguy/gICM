/**
 * Risk Classifier
 *
 * Assesses risk level of actions.
 */

import type { Action, RiskAssessment, RiskFactor, RiskLevel } from "../core/types.js";

export class RiskClassifier {
  /**
   * Assess risk of an action
   */
  async assess(action: Action): Promise<RiskAssessment> {
    const factors = this.identifyRiskFactors(action);
    const score = this.calculateScore(factors);
    const level = this.determineLevel(score);

    return {
      level,
      score,
      factors,
      estimatedCost: this.estimateCost(action),
      maxPotentialLoss: this.estimateMaxLoss(action),
      reversible: this.isReversible(action),
      rollbackPlan: this.generateRollbackPlan(action),
    };
  }

  /**
   * Identify risk factors for an action
   */
  private identifyRiskFactors(action: Action): RiskFactor[] {
    const factors: RiskFactor[] = [];
    const params = action.params as Record<string, number | string | undefined>;

    // Financial risk
    const amount = (params.amount || params.cost || 0) as number;
    if (amount > 0) {
      factors.push({
        name: "financial_exposure",
        weight: 0.3,
        value: amount,
        threshold: 100,
        exceeded: amount > 100,
      });
    }

    // Irreversibility risk
    const irreversibleActions = ["deploy_production", "delete", "publish", "trade_execute"];
    if (irreversibleActions.some((a) => action.type.includes(a))) {
      factors.push({
        name: "irreversibility",
        weight: 0.25,
        value: 1,
        threshold: 0,
        exceeded: true,
      });
    }

    // Scope risk (how much is affected)
    const filesChanged = (params.filesChanged || 0) as number;
    const linesChanged = (params.linesChanged || 0) as number;
    factors.push({
      name: "change_scope",
      weight: 0.2,
      value: filesChanged * 10 + linesChanged / 10,
      threshold: 100,
      exceeded: filesChanged > 5 || linesChanged > 100,
    });

    // External impact risk
    const externalActions = ["tweet", "blog_publish", "email", "api_call"];
    if (externalActions.some((a) => action.type.includes(a))) {
      factors.push({
        name: "external_visibility",
        weight: 0.15,
        value: 1,
        threshold: 0,
        exceeded: true,
      });
    }

    // Time sensitivity
    const isQuietHours = this.isQuietHours();
    if (isQuietHours) {
      factors.push({
        name: "quiet_hours",
        weight: 0.1,
        value: 1,
        threshold: 0,
        exceeded: true,
      });
    }

    return factors;
  }

  /**
   * Calculate overall risk score
   */
  private calculateScore(factors: RiskFactor[]): number {
    let totalWeight = 0;
    let weightedScore = 0;

    for (const factor of factors) {
      totalWeight += factor.weight;
      const factorScore = factor.exceeded ? 100 : (factor.value / factor.threshold) * 50;
      weightedScore += factor.weight * factorScore;
    }

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  /**
   * Determine risk level from score
   */
  private determineLevel(score: number): RiskLevel {
    if (score < 25) return "safe";
    if (score < 50) return "moderate";
    if (score < 75) return "high";
    return "critical";
  }

  private estimateCost(action: Action): number {
    const params = action.params as Record<string, number | undefined>;
    return params.cost || params.amount || 0;
  }

  private estimateMaxLoss(action: Action): number {
    const params = action.params as Record<string, number | undefined>;
    // Could lose all if trade, nothing if content
    if (action.type.includes("trade")) {
      return params.amount || 0;
    }
    return 0;
  }

  private isReversible(action: Action): boolean {
    const irreversible = ["trade", "publish", "deploy_prod", "send", "delete"];
    return !irreversible.some((i) => action.type.includes(i));
  }

  private generateRollbackPlan(action: Action): string | undefined {
    if (action.type.includes("deploy")) {
      return "Revert to previous deployment version";
    }
    if (action.type.includes("commit")) {
      return "Git revert commit";
    }
    return undefined;
  }

  private isQuietHours(): boolean {
    const hour = new Date().getUTCHours();
    return hour < 6 || hour > 22;
  }
}
