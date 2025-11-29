import type { NFT, RarityScore } from "../types.js";

interface TraitFrequency {
  traitType: string;
  value: string;
  count: number;
  frequency: number;
}

export class RarityAnalyzer {
  calculateCollectionRarity(nfts: NFT[]): Map<string, RarityScore> {
    if (nfts.length === 0) return new Map();

    // Calculate trait frequencies
    const traitFrequencies = this.calculateTraitFrequencies(nfts);

    // Calculate rarity scores for each NFT
    const rarityScores = new Map<string, RarityScore>();
    const scores: Array<{ tokenId: string; score: number }> = [];

    for (const nft of nfts) {
      const traitScores = this.calculateTraitScores(nft, traitFrequencies, nfts.length);
      const totalScore = traitScores.reduce((sum, t) => sum + t.score, 0);

      scores.push({ tokenId: nft.tokenId, score: totalScore });
      rarityScores.set(nft.tokenId, {
        tokenId: nft.tokenId,
        rank: 0, // Will be set after sorting
        score: totalScore,
        traitScores,
      });
    }

    // Sort by score (higher = rarer) and assign ranks
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((item, index) => {
      const rarityScore = rarityScores.get(item.tokenId);
      if (rarityScore) {
        rarityScore.rank = index + 1;
      }
    });

    return rarityScores;
  }

  private calculateTraitFrequencies(nfts: NFT[]): TraitFrequency[] {
    const traitCounts = new Map<string, number>();

    for (const nft of nfts) {
      const attributes = nft.metadata.attributes ?? [];
      for (const attr of attributes) {
        const key = `${attr.traitType}:${attr.value}`;
        traitCounts.set(key, (traitCounts.get(key) ?? 0) + 1);
      }
    }

    const frequencies: TraitFrequency[] = [];
    for (const [key, count] of traitCounts) {
      const [traitType, value] = key.split(":");
      frequencies.push({
        traitType: traitType ?? "",
        value: value ?? "",
        count,
        frequency: count / nfts.length,
      });
    }

    return frequencies;
  }

  private calculateTraitScores(
    nft: NFT,
    frequencies: TraitFrequency[],
    totalNFTs: number
  ): Array<{ traitType: string; value: string; rarity: number; score: number }> {
    const attributes = nft.metadata.attributes ?? [];
    const traitScores: Array<{
      traitType: string;
      value: string;
      rarity: number;
      score: number;
    }> = [];

    for (const attr of attributes) {
      const frequency = frequencies.find(
        (f) => f.traitType === attr.traitType && f.value === String(attr.value)
      );

      if (frequency) {
        // Rarity score: 1 / frequency (rarer traits = higher score)
        const rarity = frequency.frequency;
        const score = 1 / frequency.frequency;

        traitScores.push({
          traitType: attr.traitType,
          value: String(attr.value),
          rarity,
          score,
        });
      }
    }

    // Bonus for number of traits (statistical rarity)
    const avgTraits = totalNFTs > 0
      ? frequencies.length / totalNFTs
      : attributes.length;

    if (attributes.length !== avgTraits) {
      const traitCountRarity = Math.abs(attributes.length - avgTraits) / avgTraits;
      traitScores.push({
        traitType: "_trait_count",
        value: String(attributes.length),
        rarity: traitCountRarity,
        score: traitCountRarity * 10, // Weight for trait count bonus
      });
    }

    return traitScores;
  }

  calculateSingleNFTRarity(
    nft: NFT,
    collectionNFTs: NFT[]
  ): RarityScore | null {
    const allScores = this.calculateCollectionRarity(collectionNFTs);
    return allScores.get(nft.tokenId) ?? null;
  }

  getRarityTier(rank: number, totalSupply: number): string {
    const percentile = (rank / totalSupply) * 100;

    if (percentile <= 1) return "Legendary";
    if (percentile <= 5) return "Epic";
    if (percentile <= 15) return "Rare";
    if (percentile <= 35) return "Uncommon";
    return "Common";
  }
}
