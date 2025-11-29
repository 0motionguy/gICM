import type { Vote, VotingPower } from "../types.js";

export interface VotingPowerDistribution {
  totalPower: number;
  topHolders: Array<{
    address: string;
    power: number;
    percentage: number;
  }>;
  concentrationScore: number; // 0-1, higher = more concentrated
  giniCoefficient: number;
}

export interface VoterAnalysis {
  address: string;
  totalVotes: number;
  participationRate: number;
  avgVotingPower: number;
  votingHistory: Array<{
    proposalId: string;
    choice: number | number[];
    power: number;
    timestamp: Date;
  }>;
}

export class VotingPowerAnalyzer {
  analyzeDistribution(
    holders: VotingPower[],
    totalSupply?: number
  ): VotingPowerDistribution {
    if (holders.length === 0) {
      return {
        totalPower: 0,
        topHolders: [],
        concentrationScore: 0,
        giniCoefficient: 0,
      };
    }

    const sorted = [...holders].sort((a, b) => b.power - a.power);
    const totalPower = totalSupply ?? sorted.reduce((sum, h) => sum + h.power, 0);

    const topHolders = sorted.slice(0, 20).map((h) => ({
      address: h.address,
      power: h.power,
      percentage: totalPower > 0 ? (h.power / totalPower) * 100 : 0,
    }));

    // Calculate concentration score (top 10 holders' share)
    const top10Power = sorted.slice(0, 10).reduce((sum, h) => sum + h.power, 0);
    const concentrationScore = totalPower > 0 ? top10Power / totalPower : 0;

    // Calculate Gini coefficient
    const giniCoefficient = this.calculateGini(sorted.map((h) => h.power));

    return {
      totalPower,
      topHolders,
      concentrationScore,
      giniCoefficient,
    };
  }

  private calculateGini(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    if (sum === 0) return 0;

    let cumulativeSum = 0;
    let giniSum = 0;

    for (let i = 0; i < n; i++) {
      cumulativeSum += sorted[i]!;
      giniSum += cumulativeSum;
    }

    const gini = (2 * giniSum) / (n * sum) - (n + 1) / n;
    return Math.max(0, Math.min(1, gini));
  }

  analyzeVoter(
    address: string,
    votes: Vote[],
    totalProposals: number
  ): VoterAnalysis {
    const voterVotes = votes.filter(
      (v) => v.voter.toLowerCase() === address.toLowerCase()
    );

    if (voterVotes.length === 0) {
      return {
        address,
        totalVotes: 0,
        participationRate: 0,
        avgVotingPower: 0,
        votingHistory: [],
      };
    }

    const avgPower =
      voterVotes.reduce((sum, v) => sum + v.votingPower, 0) / voterVotes.length;

    return {
      address,
      totalVotes: voterVotes.length,
      participationRate: totalProposals > 0 ? voterVotes.length / totalProposals : 0,
      avgVotingPower: avgPower,
      votingHistory: voterVotes.map((v) => ({
        proposalId: "", // Would need proposal context
        choice: v.choice,
        power: v.votingPower,
        timestamp: v.timestamp,
      })),
    };
  }

  findWhaleVoters(
    votes: Vote[],
    threshold = 0.01 // 1% of total votes
  ): Array<{ address: string; totalPower: number; voteCount: number }> {
    const voterTotals = new Map<string, { power: number; count: number }>();

    for (const vote of votes) {
      const existing = voterTotals.get(vote.voter) ?? { power: 0, count: 0 };
      voterTotals.set(vote.voter, {
        power: existing.power + vote.votingPower,
        count: existing.count + 1,
      });
    }

    const totalPower = votes.reduce((sum, v) => sum + v.votingPower, 0);
    const whaleThreshold = totalPower * threshold;

    return Array.from(voterTotals.entries())
      .filter(([, data]) => data.power >= whaleThreshold)
      .map(([address, data]) => ({
        address,
        totalPower: data.power,
        voteCount: data.count,
      }))
      .sort((a, b) => b.totalPower - a.totalPower);
  }

  calculateQuorumHealth(
    currentVotes: number,
    quorum: number,
    timeRemaining: number, // milliseconds
    historicalAvgVelocity?: number // votes per hour
  ): {
    currentProgress: number;
    projectedFinal: number;
    willReachQuorum: boolean;
    confidence: number;
  } {
    const currentProgress = quorum > 0 ? currentVotes / quorum : 0;

    if (timeRemaining <= 0) {
      return {
        currentProgress,
        projectedFinal: currentVotes,
        willReachQuorum: currentVotes >= quorum,
        confidence: 1,
      };
    }

    // Simple linear projection if we have historical data
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
    const velocity = historicalAvgVelocity ?? 0;
    const projectedAdditional = velocity * hoursRemaining;
    const projectedFinal = currentVotes + projectedAdditional;

    return {
      currentProgress,
      projectedFinal,
      willReachQuorum: projectedFinal >= quorum,
      confidence: velocity > 0 ? 0.7 : 0.3, // Lower confidence without velocity data
    };
  }
}
