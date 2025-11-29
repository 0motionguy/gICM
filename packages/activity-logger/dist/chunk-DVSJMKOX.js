// src/solana/memo-logger.ts
import {
  Connection,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey
} from "@solana/web3.js";
import { createHash } from "crypto";
var MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);
var SolanaMemoLogger = class {
  connection;
  payer;
  commitment;
  constructor(config) {
    this.connection = new Connection(config.rpcUrl, config.commitment ?? "confirmed");
    this.payer = this.parsePrivateKey(config.privateKey);
    this.commitment = config.commitment ?? "confirmed";
  }
  parsePrivateKey(privateKey) {
    try {
      const parsed = JSON.parse(privateKey);
      if (Array.isArray(parsed)) {
        return Keypair.fromSecretKey(Uint8Array.from(parsed));
      }
    } catch {
    }
    const bs58 = this.base58Decode(privateKey);
    return Keypair.fromSecretKey(bs58);
  }
  base58Decode(str) {
    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const bytes = [];
    for (const char of str) {
      let carry = ALPHABET.indexOf(char);
      if (carry === -1) throw new Error("Invalid base58 character");
      for (let j = 0; j < bytes.length; j++) {
        carry += bytes[j] * 58;
        bytes[j] = carry & 255;
        carry >>= 8;
      }
      while (carry > 0) {
        bytes.push(carry & 255);
        carry >>= 8;
      }
    }
    for (const char of str) {
      if (char !== "1") break;
      bytes.push(0);
    }
    return Uint8Array.from(bytes.reverse());
  }
  async logActivity(activity, arweaveTxId) {
    const contentHash = this.computeHash(activity);
    const memo = {
      v: 1,
      t: "gicm:activity",
      id: activity.id,
      type: activity.type,
      ts: Math.floor(Date.now() / 1e3),
      h: contentHash.slice(0, 16),
      // Truncate for space
      ...arweaveTxId && { ar: arweaveTxId }
    };
    const memoString = JSON.stringify(memo);
    const instruction = {
      keys: [{ pubkey: this.payer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoString, "utf-8")
    };
    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer],
      { commitment: this.commitment }
    );
    const finality = this.commitment === "processed" ? "confirmed" : this.commitment;
    const txInfo = await this.connection.getTransaction(signature, {
      commitment: finality
    });
    return {
      signature,
      slot: txInfo?.slot ?? 0,
      fee: txInfo?.meta?.fee ?? 5e3,
      memo
    };
  }
  async logActivityBatch(activities) {
    const hashes = activities.map((a) => this.computeHash(a));
    const merkleRoot = this.computeMerkleRoot(hashes);
    const batchMemo = {
      v: 1,
      t: "gicm:batch",
      ts: Math.floor(Date.now() / 1e3),
      count: activities.length,
      root: merkleRoot.slice(0, 32),
      ids: activities.map((a) => a.id.slice(0, 8))
    };
    const memoString = JSON.stringify(batchMemo);
    const instruction = {
      keys: [{ pubkey: this.payer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoString, "utf-8")
    };
    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer],
      { commitment: this.commitment }
    );
    const finality = this.commitment === "processed" ? "confirmed" : this.commitment;
    const txInfo = await this.connection.getTransaction(signature, {
      commitment: finality
    });
    return {
      signature,
      slot: txInfo?.slot ?? 0,
      merkleRoot
    };
  }
  async verifyActivity(signature, expectedHash) {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: "finalized"
      });
      if (!tx) {
        return { verified: false };
      }
      const memoLog = tx.meta?.logMessages?.find(
        (log) => log.includes("gicm:activity")
      );
      if (!memoLog) {
        return { verified: false };
      }
      const jsonMatch = memoLog.match(/\{.*\}/);
      if (!jsonMatch) {
        return { verified: false };
      }
      const memo = JSON.parse(jsonMatch[0]);
      const verified = memo.h === expectedHash.slice(0, 16);
      return { verified, memo };
    } catch {
      return { verified: false };
    }
  }
  async getBalance() {
    return this.connection.getBalance(this.payer.publicKey);
  }
  getPublicKey() {
    return this.payer.publicKey.toBase58();
  }
  computeHash(data) {
    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }
  computeMerkleRoot(hashes) {
    if (hashes.length === 0) return "";
    if (hashes.length === 1) return hashes[0];
    const pairs = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      pairs.push(
        createHash("sha256").update(left + right).digest("hex")
      );
    }
    return this.computeMerkleRoot(pairs);
  }
};
function createMemoPayload(activityId, activityType, contentHash, arweaveTxId) {
  const memo = {
    v: 1,
    t: "gicm:activity",
    id: activityId,
    type: activityType,
    ts: Math.floor(Date.now() / 1e3),
    h: contentHash.slice(0, 16),
    ...arweaveTxId && { ar: arweaveTxId }
  };
  return JSON.stringify(memo);
}

export {
  SolanaMemoLogger,
  createMemoPayload
};
//# sourceMappingURL=chunk-DVSJMKOX.js.map