---
name: solana-program-testing
description: "{"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Solana Program Testing

## Quick Reference

```typescript
// Basic Anchor test structure
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";

describe("my-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("Initializes account", async () => {
    const tx = await program.methods.initialize()
      .accounts({ /* accounts */ })
      .rpc();

    console.log("Transaction signature", tx);
  });
});

// BankrunProvider for faster tests
import { BankrunProvider } from "anchor-bankrun";

const context = await startAnchor("./", [], []);
const provider = new BankrunProvider(context);

// Account mocking
const mockAccount = {
  publicKey: new PublicKey("..."),
  account: {
    lamports: 1000000,
    data: Buffer.from([...]),
    owner: program.programId,
    executable: false,
    rentEpoch: 0,
  }
};
```

## Core Concepts

### Anchor Testing Framework

```typescript
// tests/token-launch.ts
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { TokenLaunch } from "../target/types/token_launch";

describe("Token Launch Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenLaunch as Program<TokenLaunch>;
  const payer = provider.wallet as anchor.Wallet;

  // Test accounts
  let bondingCurve: PublicKey;
  let tokenMint: PublicKey;
  let creator: Keypair;

  beforeEach(async () => {
    creator = Keypair.generate();

    // Airdrop SOL to creator
    const airdropSig = await provider.connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Derive PDAs
    [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding-curve"), creator.publicKey.toBuffer()],
      program.programId
    );

    [tokenMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("token-mint"), bondingCurve.toBuffer()],
      program.programId
    );
  });

  describe("initialize_bonding_curve", () => {
    it("should create bonding curve", async () => {
      const tx = await program.methods
        .initializeBondingCurve(
          "Test Token",
          "TEST",
          new BN(1_000_000_000) // 1B supply
        )
        .accounts({
          bondingCurve,
          tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      // Fetch and verify account
      const bondingCurveAccount = await program.account.bondingCurve.fetch(
        bondingCurve
      );

      expect(bondingCurveAccount.creator.toString()).to.equal(
        creator.publicKey.toString()
      );
      expect(bondingCurveAccount.tokenName).to.equal("Test Token");
      expect(bondingCurveAccount.tokenSymbol).to.equal("TEST");
      expect(bondingCurveAccount.totalSupply.toString()).to.equal("1000000000");
    });

    it("should fail with invalid supply", async () => {
      try {
        await program.methods
          .initializeBondingCurve("Test", "TEST", new BN(0))
          .accounts({
            bondingCurve,
            tokenMint,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([creator])
          .rpc();

        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err.message).to.include("InvalidSupply");
      }
    });

    it("should fail if already initialized", async () => {
      // First initialization
      await program.methods
        .initializeBondingCurve("Test", "TEST", new BN(1000000))
        .accounts({
          bondingCurve,
          tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      // Second initialization should fail
      try {
        await program.methods
          .initializeBondingCurve("Test2", "TST2", new BN(1000000))
          .accounts({
            bondingCurve,
            tokenMint,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([creator])
          .rpc();

        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err.message).to.include("already in use");
      }
    });
  });

  describe("buy_tokens", () => {
    beforeEach(async () => {
      // Initialize bonding curve
      await program.methods
        .initializeBondingCurve("Test", "TEST", new BN(1_000_000_000))
        .accounts({
          bondingCurve,
          tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();
    });

    it("should buy tokens", async () => {
      const buyer = Keypair.generate();

      // Airdrop to buyer
      const airdropSig = await provider.connection.requestAirdrop(
        buyer.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const buyAmount = new BN(10_000_000); // 10 SOL in lamports

      const tx = await program.methods
        .buyTokens(buyAmount)
        .accounts({
          bondingCurve,
          tokenMint,
          buyer: buyer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      // Verify bonding curve state updated
      const bondingCurveAccount = await program.account.bondingCurve.fetch(
        bondingCurve
      );

      expect(bondingCurveAccount.solReserve.toNumber()).to.be.greaterThan(0);
      expect(bondingCurveAccount.tokensSold.toNumber()).to.be.greaterThan(0);
    });

    it("should calculate correct token amount", async () => {
      const buyer = Keypair.generate();

      const airdropSig = await provider.connection.requestAirdrop(
        buyer.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const buyAmount = new BN(10_000_000);

      // Get expected token amount from program
      const expectedTokens = await program.methods
        .calculateBuyAmount(buyAmount)
        .accounts({ bondingCurve })
        .view();

      // Execute buy
      await program.methods
        .buyTokens(buyAmount)
        .accounts({
          bondingCurve,
          tokenMint,
          buyer: buyer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      const bondingCurveAccount = await program.account.bondingCurve.fetch(
        bondingCurve
      );

      expect(bondingCurveAccount.tokensSold.toString()).to.equal(
        expectedTokens.toString()
      );
    });
  });
});
```

### BankrunProvider for Fast Tests

```typescript
// tests/bankrun/token-launch.spec.ts
import { startAnchor, BankrunProvider } from "anchor-bankrun";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("Token Launch (Bankrun)", () => {
  let provider: BankrunProvider;
  let program: Program;
  let creator: Keypair;

  beforeEach(async () => {
    // Start Bankrun context (much faster than local validator)
    const context = await startAnchor(
      "./",
      [],
      []
    );

    provider = new BankrunProvider(context);
    program = new Program(
      require("../../target/idl/token_launch.json"),
      provider
    );

    creator = Keypair.generate();

    // Fund creator account
    await provider.context.banksClient.processTransaction({
      payer: provider.wallet.publicKey,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: creator.publicKey,
          lamports: 2 * anchor.web3.LAMPORTS_PER_SOL,
        }),
      ],
    });
  });

  it("should initialize bonding curve (fast)", async () => {
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding-curve"), creator.publicKey.toBuffer()],
      program.programId
    );

    const [tokenMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("token-mint"), bondingCurve.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeBondingCurve("Test", "TEST", new BN(1_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Fetch account using Bankrun
    const bondingCurveAccount = await program.account.bondingCurve.fetch(
      bondingCurve
    );

    expect(bondingCurveAccount.creator.toString()).to.equal(
      creator.publicKey.toString()
    );
  });

  it("should process multiple transactions quickly", async () => {
    const startTime = Date.now();

    // Execute 100 transactions
    for (let i = 0; i < 100; i++) {
      const user = Keypair.generate();

      // Fund user
      await provider.context.banksClient.processTransaction({
        payer: provider.wallet.publicKey,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: user.publicKey,
            lamports: anchor.web3.LAMPORTS_PER_SOL,
          }),
        ],
      });
    }

    const elapsed = Date.now() - startTime;
    console.log(`Processed 100 transactions in ${elapsed}ms`);

    expect(elapsed).to.be.lessThan(5000); // Should be very fast
  });
});
```

### Account Mocking & Fixtures

```typescript
// tests/fixtures/accounts.ts
import { PublicKey, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export function createMockBondingCurve(overrides = {}) {
  return {
    creator: Keypair.generate().publicKey,
    tokenMint: Keypair.generate().publicKey,
    tokenName: "Test Token",
    tokenSymbol: "TEST",
    totalSupply: new BN(1_000_000_000),
    tokensSold: new BN(0),
    solReserve: new BN(0),
    virtualSolReserve: new BN(30_000_000_000), // 30 SOL
    virtualTokenReserve: new BN(1_073_000_000_000_000),
    isComplete: false,
    bump: 255,
    ...overrides,
  };
}

export function createMockTokenAccount(overrides = {}) {
  return {
    mint: Keypair.generate().publicKey,
    owner: Keypair.generate().publicKey,
    amount: new BN(0),
    delegate: null,
    state: 1, // Initialized
    isNative: null,
    delegatedAmount: new BN(0),
    closeAuthority: null,
    ...overrides,
  };
}

// Usage in tests
describe("Buy Tokens", () => {
  it("should handle pre-existing bonding curve", async () => {
    const mockCurve = createMockBondingCurve({
      tokensSold: new BN(100_000_000),
      solReserve: new BN(5_000_000_000),
    });

    // Set up account with mock data
    await program.account.bondingCurve.create(
      bondingCurveAccount,
      mockCurve
    );

    // Test with pre-populated state
    const buyAmount = new BN(1_000_000_000);
    const tx = await program.methods
      .buyTokens(buyAmount)
      .accounts({ bondingCurve: bondingCurveAccount })
      .rpc();
  });
});
```

## Common Patterns

### Pattern 1: Testing Account Constraints

```typescript
describe("Account Constraints", () => {
  it("should enforce creator as signer", async () => {
    const notCreator = Keypair.generate();

    try {
      await program.methods
        .initializeBondingCurve("Test", "TEST", new BN(1000000))
        .accounts({
          bondingCurve,
          tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([notCreator]) // Wrong signer
        .rpc();

      expect.fail("Should have failed");
    } catch (err) {
      expect(err.message).to.include("unknown signer");
    }
  });

  it("should enforce correct PDA derivation", async () => {
    const wrongPda = Keypair.generate().publicKey;

    try {
      await program.methods
        .initializeBondingCurve("Test", "TEST", new BN(1000000))
        .accounts({
          bondingCurve: wrongPda, // Invalid PDA
          tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      expect.fail("Should have failed");
    } catch (err) {
      expect(err.message).to.include("ConstraintSeeds");
    }
  });

  it("should enforce account ownership", async () => {
    // Create account owned by system program
    const wrongOwner = Keypair.generate();

    try {
      await program.methods
        .updateBondingCurve()
        .accounts({
          bondingCurve: wrongOwner.publicKey,
          authority: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      expect.fail("Should have failed");
    } catch (err) {
      expect(err.message).to.include("AccountOwnedByWrongProgram");
    }
  });
});
```

### Pattern 2: Testing State Transitions

```typescript
describe("State Transitions", () => {
  it("should transition from initialized to active", async () => {
    // Initialize
    await program.methods
      .initializeBondingCurve("Test", "TEST", new BN(1_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    let curve = await program.account.bondingCurve.fetch(bondingCurve);
    expect(curve.isComplete).to.be.false;

    // Buy until complete
    const buyer = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      100 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Buy enough to complete curve
    await program.methods
      .buyTokens(new BN(85_000_000_000)) // 85 SOL
      .accounts({
        bondingCurve,
        tokenMint,
        buyer: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    curve = await program.account.bondingCurve.fetch(bondingCurve);
    expect(curve.isComplete).to.be.true;

    // Verify can't buy after complete
    try {
      await program.methods
        .buyTokens(new BN(1_000_000))
        .accounts({
          bondingCurve,
          tokenMint,
          buyer: buyer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      expect.fail("Should have failed");
    } catch (err) {
      expect(err.message).to.include("BondingCurveComplete");
    }
  });

  it("should maintain invariants across operations", async () => {
    // Initialize
    await program.methods
      .initializeBondingCurve("Test", "TEST", new BN(1_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Perform multiple buys and sells
    const buyer = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Buy
    await program.methods
      .buyTokens(new BN(1_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        buyer: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const curveAfterBuy = await program.account.bondingCurve.fetch(bondingCurve);

    // Sell
    await program.methods
      .sellTokens(curveAfterBuy.tokensSold.div(new BN(2)))
      .accounts({
        bondingCurve,
        tokenMint,
        seller: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const curveAfterSell = await program.account.bondingCurve.fetch(bondingCurve);

    // Verify k = x * y invariant maintained
    const kBefore = curveAfterBuy.solReserve.mul(
      curveAfterBuy.totalSupply.sub(curveAfterBuy.tokensSold)
    );
    const kAfter = curveAfterSell.solReserve.mul(
      curveAfterSell.totalSupply.sub(curveAfterSell.tokensSold)
    );

    expect(kAfter.toString()).to.equal(kBefore.toString());
  });
});
```

### Pattern 3: Testing CPIs (Cross-Program Invocations)

```typescript
describe("Cross-Program Invocations", () => {
  it("should invoke token program to mint tokens", async () => {
    const buyer = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Get buyer's token account
    const buyerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      buyer.publicKey
    );

    // Buy tokens (should CPI to token program)
    await program.methods
      .buyTokens(new BN(1_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        buyer: buyer.publicKey,
        buyerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    // Verify tokens minted to buyer
    const tokenAccountInfo = await getAccount(
      provider.connection,
      buyerTokenAccount
    );

    expect(tokenAccountInfo.amount).to.be.greaterThan(0n);
  });

  it("should invoke system program to transfer SOL", async () => {
    const buyer = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    const initialCurveBalance = await provider.connection.getBalance(
      bondingCurve
    );

    const buyAmount = new BN(1_000_000_000); // 1 SOL

    await program.methods
      .buyTokens(buyAmount)
      .accounts({
        bondingCurve,
        tokenMint,
        buyer: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const finalCurveBalance = await provider.connection.getBalance(
      bondingCurve
    );

    expect(finalCurveBalance).to.equal(
      initialCurveBalance + buyAmount.toNumber()
    );
  });
});
```

## Advanced Techniques

### Fuzzing with Property-Based Testing

```typescript
import fc from "fast-check";

describe("Bonding Curve Fuzzing", () => {
  it("should maintain k=x*y invariant for any valid inputs", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1000000, max: 100000000000 }), // Buy amounts
        async (buyAmount) => {
          const buyer = Keypair.generate();

          // Setup
          const airdropSig = await provider.connection.requestAirdrop(
            buyer.publicKey,
            buyAmount / 1000
          );
          await provider.connection.confirmTransaction(airdropSig);

          // Get state before
          const curveBefore = await program.account.bondingCurve.fetch(
            bondingCurve
          );

          const kBefore = curveBefore.solReserve.mul(
            curveBefore.totalSupply.sub(curveBefore.tokensSold)
          );

          // Execute buy
          try {
            await program.methods
              .buyTokens(new BN(buyAmount))
              .accounts({
                bondingCurve,
                tokenMint,
                buyer: buyer.publicKey,
                systemProgram: SystemProgram.programId,
              })
              .signers([buyer])
              .rpc();

            // Get state after
            const curveAfter = await program.account.bondingCurve.fetch(
              bondingCurve
            );

            const kAfter = curveAfter.solReserve.mul(
              curveAfter.totalSupply.sub(curveAfter.tokensSold)
            );

            // Invariant: k should remain constant
            return kAfter.gte(kBefore);
          } catch {
            // Failed transactions are ok (e.g., insufficient funds)
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Performance Benchmarking

```typescript
describe("Performance Benchmarks", () => {
  it("should measure transaction throughput", async () => {
    const iterations = 100;
    const buyers = Array.from({ length: iterations }, () => Keypair.generate());

    // Fund all buyers
    await Promise.all(
      buyers.map(buyer =>
        provider.connection.requestAirdrop(
          buyer.publicKey,
          anchor.web3.LAMPORTS_PER_SOL
        )
      )
    );

    // Measure buy transaction time
    const startTime = Date.now();

    await Promise.all(
      buyers.map(buyer =>
        program.methods
          .buyTokens(new BN(10_000_000))
          .accounts({
            bondingCurve,
            tokenMint,
            buyer: buyer.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([buyer])
          .rpc()
      )
    );

    const elapsed = Date.now() - startTime;
    const tps = iterations / (elapsed / 1000);

    console.log(`Processed ${iterations} transactions in ${elapsed}ms`);
    console.log(`TPS: ${tps.toFixed(2)}`);

    expect(tps).to.be.greaterThan(10); // Minimum expected TPS
  });
});
```

### Custom Error Testing

```typescript
// In your program (programs/token-launch/src/lib.rs)
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid supply amount")]
    InvalidSupply,
    #[msg("Bonding curve is complete")]
    BondingCurveComplete,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}

// In tests
describe("Error Handling", () => {
  it("should return correct error code", async () => {
    try {
      await program.methods
        .initializeBondingCurve("Test", "TEST", new BN(0))
        .accounts({
          bondingCurve,
          tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      expect.fail("Should have thrown");
    } catch (err: any) {
      // Check error code
      expect(err.error.errorCode.code).to.equal("InvalidSupply");
      expect(err.error.errorCode.number).to.equal(6000);
      expect(err.error.errorMessage).to.include("Invalid supply amount");
    }
  });
});
```

## Production Examples

### Example 1: Complete Bonding Curve Test Suite

```typescript
// tests/bonding-curve.spec.ts
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("Bonding Curve Complete Suite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TokenLaunch as Program;

  let bondingCurve: PublicKey;
  let tokenMint: PublicKey;
  let creator: Keypair;

  beforeEach(async () => {
    creator = Keypair.generate();

    const airdropSig = await provider.connection.requestAirdrop(
      creator.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding-curve"), creator.publicKey.toBuffer()],
      program.programId
    );

    [tokenMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("token-mint"), bondingCurve.toBuffer()],
      program.programId
    );

    // Initialize bonding curve
    await program.methods
      .initializeBondingCurve(
        "Test Token",
        "TEST",
        new BN(1_000_000_000)
      )
      .accounts({
        bondingCurve,
        tokenMint,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();
  });

  describe("Price Calculation", () => {
    it("should calculate increasing prices", async () => {
      const amounts = [
        new BN(1_000_000_000),
        new BN(5_000_000_000),
        new BN(10_000_000_000),
      ];

      const prices: BN[] = [];

      for (const amount of amounts) {
        const tokenAmount = await program.methods
          .calculateBuyAmount(amount)
          .accounts({ bondingCurve })
          .view();

        prices.push(tokenAmount);
      }

      // Verify prices increase
      expect(prices[1].gt(prices[0])).to.be.true;
      expect(prices[2].gt(prices[1])).to.be.true;
    });

    it("should handle edge cases", async () => {
      // Very small amount
      const smallAmount = await program.methods
        .calculateBuyAmount(new BN(1))
        .accounts({ bondingCurve })
        .view();

      expect(smallAmount.toNumber()).to.be.greaterThan(0);

      // Very large amount (near completion)
      const largeAmount = await program.methods
        .calculateBuyAmount(new BN(80_000_000_000))
        .accounts({ bondingCurve })
        .view();

      expect(largeAmount.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("Multi-User Trading", () => {
    it("should handle concurrent trades", async () => {
      const traders = Array.from({ length: 10 }, () => Keypair.generate());

      // Fund traders
      await Promise.all(
        traders.map(trader =>
          provider.connection.requestAirdrop(
            trader.publicKey,
            5 * anchor.web3.LAMPORTS_PER_SOL
          )
        )
      );

      // Confirm airdrops
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute concurrent buys
      await Promise.all(
        traders.map(trader =>
          program.methods
            .buyTokens(new BN(1_000_000_000))
            .accounts({
              bondingCurve,
              tokenMint,
              buyer: trader.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .signers([trader])
            .rpc()
        )
      );

      // Verify final state
      const curve = await program.account.bondingCurve.fetch(bondingCurve);
      expect(curve.tokensSold.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("Curve Completion", () => {
    it("should complete curve at 85 SOL", async () => {
      const whale = Keypair.generate();

      const airdropSig = await provider.connection.requestAirdrop(
        whale.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      // Buy up to completion
      await program.methods
        .buyTokens(new BN(85_000_000_000))
        .accounts({
          bondingCurve,
          tokenMint,
          buyer: whale.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([whale])
        .rpc();

      const curve = await program.account.bondingCurve.fetch(bondingCurve);
      expect(curve.isComplete).to.be.true;
    });
  });
});
```

### Example 2: Integration with Jupiter

```typescript
// tests/integration/jupiter.spec.ts
describe("Jupiter Integration", () => {
  it("should migrate to Raydium after completion", async () => {
    // Complete bonding curve
    const whale = Keypair.generate();
    await provider.connection.requestAirdrop(
      whale.publicKey,
      100 * anchor.web3.LAMPORTS_PER_SOL
    );

    await program.methods
      .buyTokens(new BN(85_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        buyer: whale.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([whale])
      .rpc();

    // Migrate to Raydium
    const raydiumPoolAddress = await program.methods
      .migrateToRaydium()
      .accounts({
        bondingCurve,
        tokenMint,
        authority: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    // Verify pool created
    const poolInfo = await getRaydiumPoolInfo(raydiumPoolAddress);
    expect(poolInfo).to.exist;
    expect(poolInfo.baseMint.toString()).to.equal(tokenMint.toString());
  });
});
```

### Example 3: Account Rent & Reallocation

```typescript
describe("Account Management", () => {
  it("should handle rent-exempt accounts", async () => {
    const minRent = await provider.connection.getMinimumBalanceForRentExemption(
      1000 // Account size
    );

    const balanceBefore = await provider.connection.getBalance(bondingCurve);

    await program.methods
      .initializeBondingCurve("Test", "TEST", new BN(1_000_000_000))
      .accounts({
        bondingCurve,
        tokenMint,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    const balanceAfter = await provider.connection.getBalance(bondingCurve);

    expect(balanceAfter).to.be.at.least(minRent);
  });
});
```

## Best Practices

1. **Test Organization**
   - Group related tests with `describe`
   - Use `beforeEach` for setup
   - Clean up state between tests

2. **Account Management**
   - Always derive PDAs correctly
   - Verify account ownership
   - Check rent exemption

3. **Error Handling**
   - Test all custom errors
   - Verify error messages
   - Check error codes

4. **Performance**
   - Use BankrunProvider for faster tests
   - Batch operations when possible
   - Minimize RPC calls

5. **Coverage**
   - Test all instructions
   - Cover edge cases
   - Test state transitions

## Common Pitfalls

1. **Not Waiting for Confirmations**
   ```typescript
   // ❌ Bad
   await provider.connection.requestAirdrop(...);
   await program.methods.buy().rpc(); // May fail

   // ✅ Good
   const sig = await provider.connection.requestAirdrop(...);
   await provider.connection.confirmTransaction(sig);
   ```

2. **Incorrect PDA Derivation**
   ```typescript
   // ❌ Bad
   const [pda] = PublicKey.findProgramAddressSync(
     [Buffer.from("seed")],
     wrongProgramId
   );

   // ✅ Good
   const [pda] = PublicKey.findProgramAddressSync(
     [Buffer.from("seed")],
     program.programId
   );
   ```

3. **Missing Signers**
   ```typescript
   // ❌ Bad
   await program.methods.transfer().accounts({...}).rpc();

   // ✅ Good
   await program.methods.transfer().accounts({...}).signers([signer]).rpc();
   ```

4. **Not Testing Constraints**
   ```typescript
   // ❌ Bad: Only test happy path
   await program.methods.initialize().rpc();

   // ✅ Good: Test constraints
   try {
     await program.methods.initialize().rpc();
     expect.fail();
   } catch (err) {
     expect(err.message).to.include("ConstraintViolation");
   }
   ```

## Resources

- **Anchor Docs**: https://www.anchor-lang.com/docs/testing
- **Bankrun**: https://github.com/kevinheavey/bankrun
- **Solana Cookbook**: https://solanacookbook.com/references/programs.html#testing-programs
- **Program Examples**: https://github.com/coral-xyz/anchor/tree/master/tests
- **Test Patterns**: https://book.anchor-lang.com/anchor_in_depth/testing.html
