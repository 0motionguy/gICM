# Blockchain Consensus Mechanisms

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> PoW, PoS, BFT algorithms, mining, staking, and validator economics.

## Core Concepts

### Proof of Work
Computational puzzle solving for block validation.

```typescript
class ProofOfWorkMiner {
  mine(block: Block, difficulty: number): Block {
    let nonce = 0;
    while (true) {
      const hash = this.hashBlock({ ...block, nonce });
      if (hash.startsWith('0'.repeat(difficulty))) {
        return { ...block, nonce, hash };
      }
      nonce++;
    }
  }

  private hashBlock(block: Block): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(block))
      .digest('hex');
  }
}
```

### Proof of Stake
Validator selection based on stake.

```typescript
class ProofOfStakeValidator {
  selectValidator(stakes: Map<string, number>): string {
    const totalStake = Array.from(stakes.values()).reduce((a, b) => a + b);
    let random = Math.random() * totalStake;

    for (const [validator, stake] of stakes) {
      random -= stake;
      if (random <= 0) return validator;
    }
    return Array.from(stakes.keys())[0];
  }

  slashValidator(validator: string, amount: number): void {
    // Penalize misbehaving validator
    stakes.set(validator, stakes.get(validator)! - amount);
  }
}
```

### Byzantine Fault Tolerance
Handle malicious nodes.

```typescript
class BFTConsensus {
  async consensus(
    nodes: Node[],
    proposal: Block
  ): Promise<Block | null> {
    const votes: Map<string, number> = new Map();

    for (const node of nodes) {
      const vote = await node.validate(proposal);
      votes.set(node.id, vote);
    }

    const approvals = Array.from(votes.values()).filter(v => v).length;
    // Need > 2/3 consensus
    if (approvals > nodes.length * 2 / 3) {
      return proposal;
    }
    return null;
  }
}
```

## Best Practices

1. **Security**: Understand attack vectors
2. **Incentives**: Align validator incentives
3. **Finality**: Know consensus finality properties
4. **Scalability**: Understand throughput limits
5. **Monitoring**: Track network health

## Related Skills

- Smart Contract Security Auditing
- Zero-Knowledge Proofs
- Distributed Tracing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1089 | **Remixes**: 356
