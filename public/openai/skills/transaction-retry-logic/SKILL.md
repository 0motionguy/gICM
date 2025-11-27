# Transaction Retry Logic

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 32 tokens, expands to 3500 tokens

## Quick Reference (Load: 32 tokens)

Robust transaction submission with exponential backoff, blockhash refresh, and RPC fallbacks.

**Quick retry pattern:**
```typescript
async function sendWithRetry(tx: Transaction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const sig = await connection.sendTransaction(tx, [signer]);
      await connection.confirmTransaction(sig);
      return sig;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

## Core Concepts (Expand: +450 tokens)

### Failure Modes
- **Network congestion** - RPC overloaded
- **Blockhash expiration** - 150 block (~60s) lifetime
- **Insufficient compute** - Transaction too complex
- **Account conflicts** - Concurrent modifications
- **RPC rate limits** - Too many requests

### Retry Strategies
- **Exponential backoff** - Wait 1s, 2s, 4s, 8s
- **Jitter** - Add randomness to prevent thundering herd
- **Circuit breaker** - Stop retrying after threshold
- **Fallback RPCs** - Switch to backup endpoint

### Confirmation Methods
- **Polling** - Repeatedly check status
- **WebSocket** - Subscribe to signature updates
- **Timeout** - Give up after N seconds

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Complete Retry System

```typescript
import { Connection, Transaction, SendOptions } from '@solana/web3.js';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  timeout: number;
  fallbackRPCs: string[];
}

class TransactionSender {
  private connections: Connection[];
  private currentRPCIndex = 0;

  constructor(private config: RetryConfig) {
    this.connections = [
      new Connection(process.env.PRIMARY_RPC!),
      ...config.fallbackRPCs.map(url => new Connection(url))
    ];
  }

  async send(transaction: Transaction, signers: Signer[]): Promise<string> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const connection = this.getCurrentConnection();

        // Get fresh blockhash
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash('finalized');

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = signers[0].publicKey;

        // Sign
        transaction.sign(...signers);

        // Send with timeout
        const signature = await Promise.race([
          connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: false,
            maxRetries: 0, // We handle retries
          }),
          this.timeout()
        ]) as string;

        // Confirm with timeout
        await Promise.race([
          connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
          }),
          this.timeout()
        ]);

        console.log(`Transaction confirmed: ${signature}`);
        return signature;

      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt + 1} failed:`, error);

        // Switch RPC on failure
        if (error.message.includes('429') || error.message.includes('timeout')) {
          this.switchRPC();
        }

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Exponential backoff with jitter
        if (attempt < this.config.maxRetries - 1) {
          const delay = this.calculateDelay(attempt);
          await sleep(delay);
        }
      }
    }

    throw new Error(`Transaction failed after ${this.config.maxRetries} retries: ${lastError!.message}`);
  }

  private getCurrentConnection(): Connection {
    return this.connections[this.currentRPCIndex];
  }

  private switchRPC() {
    this.currentRPCIndex = (this.currentRPCIndex + 1) % this.connections.length;
    console.log(`Switched to RPC ${this.currentRPCIndex}`);
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.config.initialDelay * Math.pow(2, attempt),
      this.config.maxDelay
    );

    // Add jitter (±25%)
    const jitter = exponentialDelay * (0.75 + Math.random() * 0.5);
    return Math.floor(jitter);
  }

  private async timeout(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
    );
  }

  private isNonRetryableError(error: any): boolean {
    const nonRetryable = [
      'Blockhash not found',
      'Insufficient funds',
      'Invalid signature',
      'Account not found',
    ];

    return nonRetryable.some(msg =>
      error.message?.includes(msg)
    );
  }
}

// Usage
const sender = new TransactionSender({
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 16000,
  timeout: 60000,
  fallbackRPCs: [
    process.env.BACKUP_RPC_1!,
    process.env.BACKUP_RPC_2!,
  ],
});

const signature = await sender.send(transaction, [wallet]);
```

### Pattern 2: Preflight Simulation

```typescript
async function simulateTransaction(
  connection: Connection,
  transaction: Transaction
): Promise<boolean> {
  try {
    const simulation = await connection.simulateTransaction(transaction);

    if (simulation.value.err) {
      console.error('Simulation failed:', simulation.value.err);
      console.log('Logs:', simulation.value.logs);
      return false;
    }

    console.log(`Compute units: ${simulation.value.unitsConsumed}`);
    return true;
  } catch (error) {
    console.error('Simulation error:', error);
    return false;
  }
}

// Use before sending
if (await simulateTransaction(connection, tx)) {
  await sendWithRetry(tx);
} else {
  throw new Error('Transaction will fail');
}
```

### Pattern 3: Priority Fees for Faster Inclusion

```typescript
import { ComputeBudgetProgram } from '@solana/web3.js';

async function addPriorityFee(
  transaction: Transaction,
  priorityLevel: 'low' | 'medium' | 'high' = 'medium'
): Promise<void> {
  const priorityFees = {
    low: 1000,
    medium: 5000,
    high: 50000,
  };

  const microLamports = priorityFees[priorityLevel];

  // Add compute unit price instruction
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports,
    })
  );

  // Optionally set compute unit limit
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    })
  );
}
```

## Advanced Techniques (Expand: +900 tokens)

### Technique 1: Transaction Status Monitoring

```typescript
class TransactionMonitor {
  async waitForConfirmation(
    connection: Connection,
    signature: string,
    commitment: Commitment = 'confirmed',
    timeout = 60000
  ): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const status = await connection.getSignatureStatus(signature);

      if (status.value?.confirmationStatus === commitment) {
        if (status.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        return;
      }

      await sleep(1000);
    }

    throw new Error('Confirmation timeout');
  }
}
```

### Technique 2: Blockhash Management

```typescript
class BlockhashManager {
  private cachedBlockhash: {
    blockhash: string;
    lastValidBlockHeight: number;
    fetchedAt: number;
  } | null = null;

  async getBlockhash(connection: Connection): Promise<{
    blockhash: string;
    lastValidBlockHeight: number;
  }> {
    const now = Date.now();

    // Refresh if older than 30 seconds
    if (!this.cachedBlockhash || now - this.cachedBlockhash.fetchedAt > 30000) {
      const result = await connection.getLatestBlockhash('finalized');
      this.cachedBlockhash = {
        ...result,
        fetchedAt: now,
      };
    }

    return this.cachedBlockhash;
  }
}
```

### Technique 3: Batch Transaction Handling

```typescript
async function sendTransactionBatch(
  transactions: Transaction[],
  maxConcurrent = 3
): Promise<string[]> {
  const signatures: string[] = [];
  const batches = chunk(transactions, maxConcurrent);

  for (const batch of batches) {
    const promises = batch.map(tx => sendWithRetry(tx));
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        signatures.push(result.value);
      } else {
        console.error('Batch transaction failed:', result.reason);
      }
    }
  }

  return signatures;
}
```

## Production Examples (Expand: +800 tokens)

### Example 1: Token Purchase with Retries

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { toast } from 'sonner';

export function useBuyTokens() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const buyTokens = async (amount: number) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const toastId = toast.loading('Preparing transaction...');

    try {
      // Build transaction
      const tx = await buildBuyTransaction(wallet.publicKey, amount);

      toast.loading('Simulating transaction...', { id: toastId });

      // Simulate first
      const simulation = await connection.simulateTransaction(tx);
      if (simulation.value.err) {
        throw new Error('Simulation failed: ' + JSON.stringify(simulation.value.err));
      }

      toast.loading('Requesting signature...', { id: toastId });

      // Get fresh blockhash and sign
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(tx);

      toast.loading('Sending transaction...', { id: toastId });

      // Send with retries
      const signature = await sendWithRetry(connection, signed, {
        maxRetries: 5,
        onRetry: (attempt) => {
          toast.loading(`Retry attempt ${attempt}...`, { id: toastId });
        },
      });

      toast.loading('Confirming transaction...', { id: toastId });

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      toast.success('Purchase successful!', {
        id: toastId,
        action: {
          label: 'View',
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank'),
        },
      });

      return signature;

    } catch (error) {
      console.error('Buy failed:', error);
      toast.error('Purchase failed', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  return { buyTokens };
}
```

## Best Practices

**Retry Strategy**
- Use exponential backoff
- Add jitter to prevent thundering herd
- Set maximum retry limit (3-5)
- Implement circuit breaker pattern

**RPC Management**
- Have 2-3 fallback RPCs
- Monitor RPC health
- Rotate on rate limits
- Use dedicated RPCs for production

**Error Handling**
- Distinguish retryable vs non-retryable errors
- Log all failures with context
- Provide user feedback
- Track retry metrics

**Performance**
- Cache blockhashes (refresh every 30s)
- Simulate before sending
- Use priority fees during congestion
- Batch when possible

## Common Pitfalls

**Issue 1: Not Refreshing Blockhash**
```typescript
// ❌ Wrong - stale blockhash
tx.recentBlockhash = oldBlockhash;

// ✅ Correct - fresh blockhash each attempt
const { blockhash } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;
```

**Issue 2: Retrying Non-Retryable Errors**
```typescript
// ❌ Wrong - retry everything
catch (e) { retry(); }

// ✅ Correct - check error type
catch (e) {
  if (e.message.includes('Insufficient funds')) throw e;
  retry();
}
```

**Issue 3: No Timeout**
```typescript
// ❌ Wrong - wait forever
await connection.confirmTransaction(sig);

// ✅ Correct - timeout
await Promise.race([
  connection.confirmTransaction(sig),
  timeout(60000)
]);
```

## Resources

**Official Documentation**
- [Solana Transaction Guide](https://docs.solana.com/developing/programming-model/transactions)
- [RPC Methods](https://docs.solana.com/api/http)

**Related Skills**
- `web3-wallet-integration` - Transaction signing
- `helius-rpc-optimization` - Enhanced RPC features

**External Resources**
- [Helius RPC](https://helius.dev) - Reliable RPC provider
- [QuickNode](https://quicknode.com) - Global RPC network
