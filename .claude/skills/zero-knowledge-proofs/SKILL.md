---
name: zero-knowledge-proofs
description: "zkSNARKs, zkSTARKs, proving and verifying without revealing private data."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Zero-Knowledge Proofs

> zkSNARKs, zkSTARKs, proving and verifying without revealing private data.

## Core Concepts

### zkSNARKs (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge)
Concise proofs without interaction.

```typescript
// Circom circuit definition
template Multiplier(n) {
    signal private input a;
    signal private input b;
    signal output c;

    c <== a * b;
}

// Generate proof
const witness = await circuit.calculateWitness({
    a: "3",
    b: "5"
});

const proof = await snarkjs.groth16.prove(
    zkey,
    witness
);

// Verify proof
const isValid = await snarkjs.groth16.verify(
    vkey,
    publicSignals,
    proof
);
```

### zkSTARKs (Zero-Knowledge Scalable Transparent ARgument of Knowledge)
Transparent (no trusted setup), scalable.

```typescript
// Simpler but more verifiable
const proof = stark.prove(
    executionTrace,  // Computation trace
    constraints       // Constraint polynomial
);

// Verification is fast and transparent
const isValid = stark.verify(
    proof,
    publicInputs,
    constraints
);
```

### Privacy Applications
Voting, identity, payments.

```typescript
// Anonymous voting
circuit Ballot {
    signal private input vote;
    signal private input salt;
    signal output commitment;

    commitment <== poseidon(vote, salt);
}

// Private token transfer
circuit PrivateTransfer {
    signal private input sender_nullifier;
    signal private input receiver_commitment;
    signal public output root;

    // Merkle tree proof of inclusion
    // Output nullifier to prevent double-spend
}
```

## Best Practices

1. **Circuit Auditing**: Have circuits reviewed
2. **Trusted Setup**: Understand setup ceremony implications
3. **Gas Costs**: Verify on-chain verification costs
4. **Scalability**: STARKs vs SNARKs trade-offs
5. **Testing**: Comprehensive test coverage

## Related Skills

- Smart Contract Security Auditing
- Blockchain Consensus Mechanisms
- Cryptography Basics

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 789 | **Remixes**: 234
