import {
  Connection,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  type Commitment,
  type Finality,
} from "@solana/web3.js";
import { createHash } from "crypto";
import type { Activity, ActivityType, SolanaMemo } from "../types.js";

// SPL Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export interface SolanaLoggerConfig {
  rpcUrl: string;
  privateKey: string;
  commitment?: Commitment;
}

export interface SolanaLogResult {
  signature: string;
  slot: number;
  fee: number;
  memo: SolanaMemo;
}

export class SolanaMemoLogger {
  private connection: Connection;
  private payer: Keypair;
  private commitment: Commitment;

  constructor(config: SolanaLoggerConfig) {
    this.connection = new Connection(config.rpcUrl, config.commitment ?? "confirmed");
    this.payer = this.parsePrivateKey(config.privateKey);
    this.commitment = config.commitment ?? "confirmed";
  }

  private parsePrivateKey(privateKey: string): Keypair {
    // Handle both base58 and JSON array formats
    try {
      // Try JSON array format first
      const parsed = JSON.parse(privateKey);
      if (Array.isArray(parsed)) {
        return Keypair.fromSecretKey(Uint8Array.from(parsed));
      }
    } catch {
      // Not JSON, try base58
    }

    // Try base58 format
    const bs58 = this.base58Decode(privateKey);
    return Keypair.fromSecretKey(bs58);
  }

  private base58Decode(str: string): Uint8Array {
    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const bytes: number[] = [];
    for (const char of str) {
      let carry = ALPHABET.indexOf(char);
      if (carry === -1) throw new Error("Invalid base58 character");
      for (let j = 0; j < bytes.length; j++) {
        carry += bytes[j] * 58;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }
      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }
    // Add leading zeros
    for (const char of str) {
      if (char !== "1") break;
      bytes.push(0);
    }
    return Uint8Array.from(bytes.reverse());
  }

  async logActivity(
    activity: Activity,
    arweaveTxId?: string
  ): Promise<SolanaLogResult> {
    const contentHash = this.computeHash(activity);

    const memo: SolanaMemo = {
      v: 1,
      t: "gicm:activity",
      id: activity.id,
      type: activity.type,
      ts: Math.floor(Date.now() / 1000),
      h: contentHash.slice(0, 16), // Truncate for space
      ...(arweaveTxId && { ar: arweaveTxId }),
    };

    const memoString = JSON.stringify(memo);

    // Create memo instruction manually (simpler than importing spl-memo)
    const instruction = {
      keys: [{ pubkey: this.payer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoString, "utf-8"),
    };

    const transaction = new Transaction().add(instruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer],
      { commitment: this.commitment }
    );

    // getTransaction only accepts Finality ("confirmed" | "finalized"), not full Commitment
    const finality: Finality = this.commitment === "processed" ? "confirmed" : this.commitment as Finality;
    const txInfo = await this.connection.getTransaction(signature, {
      commitment: finality,
    });

    return {
      signature,
      slot: txInfo?.slot ?? 0,
      fee: txInfo?.meta?.fee ?? 5000,
      memo,
    };
  }

  async logActivityBatch(
    activities: Activity[]
  ): Promise<{ signature: string; slot: number; merkleRoot: string }> {
    const hashes = activities.map((a) => this.computeHash(a));
    const merkleRoot = this.computeMerkleRoot(hashes);

    const batchMemo = {
      v: 1,
      t: "gicm:batch",
      ts: Math.floor(Date.now() / 1000),
      count: activities.length,
      root: merkleRoot.slice(0, 32),
      ids: activities.map((a) => a.id.slice(0, 8)),
    };

    const memoString = JSON.stringify(batchMemo);

    const instruction = {
      keys: [{ pubkey: this.payer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoString, "utf-8"),
    };

    const transaction = new Transaction().add(instruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer],
      { commitment: this.commitment }
    );

    // getTransaction only accepts Finality ("confirmed" | "finalized"), not full Commitment
    const finality: Finality = this.commitment === "processed" ? "confirmed" : this.commitment as Finality;
    const txInfo = await this.connection.getTransaction(signature, {
      commitment: finality,
    });

    return {
      signature,
      slot: txInfo?.slot ?? 0,
      merkleRoot,
    };
  }

  async verifyActivity(
    signature: string,
    expectedHash: string
  ): Promise<{ verified: boolean; memo?: SolanaMemo }> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: "finalized",
      });

      if (!tx) {
        return { verified: false };
      }

      // Parse memo from transaction logs
      const memoLog = tx.meta?.logMessages?.find((log) =>
        log.includes("gicm:activity")
      );

      if (!memoLog) {
        return { verified: false };
      }

      // Extract JSON from log
      const jsonMatch = memoLog.match(/\{.*\}/);
      if (!jsonMatch) {
        return { verified: false };
      }

      const memo = JSON.parse(jsonMatch[0]) as SolanaMemo;
      const verified = memo.h === expectedHash.slice(0, 16);

      return { verified, memo };
    } catch {
      return { verified: false };
    }
  }

  async getBalance(): Promise<number> {
    return this.connection.getBalance(this.payer.publicKey);
  }

  getPublicKey(): string {
    return this.payer.publicKey.toBase58();
  }

  private computeHash(data: unknown): string {
    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  private computeMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return "";
    if (hashes.length === 1) return hashes[0];

    const pairs: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      pairs.push(
        createHash("sha256")
          .update(left + right)
          .digest("hex")
      );
    }

    return this.computeMerkleRoot(pairs);
  }
}

// Utility function to create a memo for signing externally
export function createMemoPayload(
  activityId: string,
  activityType: ActivityType,
  contentHash: string,
  arweaveTxId?: string
): string {
  const memo: SolanaMemo = {
    v: 1,
    t: "gicm:activity",
    id: activityId,
    type: activityType,
    ts: Math.floor(Date.now() / 1000),
    h: contentHash.slice(0, 16),
    ...(arweaveTxId && { ar: arweaveTxId }),
  };

  return JSON.stringify(memo);
}
