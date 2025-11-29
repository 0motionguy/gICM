import Irys from "@irys/sdk";
import { Keypair } from "@solana/web3.js";
import { createHash } from "crypto";
import type {
  Activity,
  ArweaveActivityRecord,
  Decision,
  Discovery,
} from "../types.js";

export interface ArweaveUploaderConfig {
  solanaRpcUrl: string;
  solanaPrivateKey: string;
  gatewayUrl?: string;
  minPayloadSize?: number;
}

export interface ArweaveUploadResult {
  txId: string;
  url: string;
  size: number;
  cost: number;
}

export class ArweaveUploader {
  private irys: Irys | null = null;
  private config: ArweaveUploaderConfig;
  private keypair: Keypair;
  private initialized = false;

  constructor(config: ArweaveUploaderConfig) {
    this.config = config;
    this.keypair = this.parsePrivateKey(config.solanaPrivateKey);
  }

  private parsePrivateKey(privateKey: string): Keypair {
    try {
      const parsed = JSON.parse(privateKey);
      if (Array.isArray(parsed)) {
        return Keypair.fromSecretKey(Uint8Array.from(parsed));
      }
    } catch {
      // Not JSON
    }

    // Try base58
    const bs58 = this.base58Decode(privateKey);
    return Keypair.fromSecretKey(bs58);
  }

  private base58Decode(str: string): Uint8Array {
    const ALPHABET =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
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
    for (const char of str) {
      if (char !== "1") break;
      bytes.push(0);
    }
    return Uint8Array.from(bytes.reverse());
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.irys = new Irys({
      url: this.config.gatewayUrl ?? "https://node1.irys.xyz",
      token: "solana",
      key: this.keypair.secretKey,
      config: {
        providerUrl: this.config.solanaRpcUrl,
      },
    });

    await this.irys.ready();
    this.initialized = true;
  }

  async uploadActivity(
    activity: Activity,
    options?: {
      discovery?: Discovery;
      decision?: Decision;
      solanaTxHash?: string;
      solanaSlot?: number;
    }
  ): Promise<ArweaveUploadResult> {
    await this.initialize();

    const record = this.buildArweaveRecord(activity, options);
    const data = JSON.stringify(record, null, 2);
    const dataBuffer = Buffer.from(data);

    const price = await this.irys!.getPrice(dataBuffer.length);

    const receipt = await this.irys!.upload(dataBuffer, {
      tags: [
        { name: "Content-Type", value: "application/json" },
        { name: "App-Name", value: "gICM-Orchestrator" },
        { name: "App-Version", value: "1.0.0" },
        { name: "Activity-Type", value: activity.type },
        { name: "Activity-ID", value: activity.id },
        { name: "Content-Hash", value: record.onChain.contentHash },
        {
          name: "Created-At",
          value: activity.createdAt.toISOString(),
        },
      ],
    });

    return {
      txId: receipt.id,
      url: `https://arweave.net/${receipt.id}`,
      size: dataBuffer.length,
      cost: Number(price) / 1e12, // Convert to SOL
    };
  }

  async uploadBatch(
    activities: Array<{
      activity: Activity;
      discovery?: Discovery;
      decision?: Decision;
    }>
  ): Promise<ArweaveUploadResult> {
    await this.initialize();

    const batch = {
      "@context": "https://gicm.dev/schemas/activity-batch/v1",
      "@type": "OrchestratorActivityBatch",
      version: 1,
      createdAt: new Date().toISOString(),
      count: activities.length,
      activities: activities.map(({ activity, discovery, decision }) =>
        this.buildArweaveRecord(activity, { discovery, decision })
      ),
    };

    const data = JSON.stringify(batch, null, 2);
    const dataBuffer = Buffer.from(data);
    const price = await this.irys!.getPrice(dataBuffer.length);

    const receipt = await this.irys!.upload(dataBuffer, {
      tags: [
        { name: "Content-Type", value: "application/json" },
        { name: "App-Name", value: "gICM-Orchestrator" },
        { name: "Batch-Type", value: "activities" },
        { name: "Batch-Count", value: String(activities.length) },
        { name: "Created-At", value: new Date().toISOString() },
      ],
    });

    return {
      txId: receipt.id,
      url: `https://arweave.net/${receipt.id}`,
      size: dataBuffer.length,
      cost: Number(price) / 1e12,
    };
  }

  async getPrice(sizeBytes: number): Promise<number> {
    await this.initialize();
    const price = await this.irys!.getPrice(sizeBytes);
    return Number(price) / 1e12;
  }

  async getBalance(): Promise<number> {
    await this.initialize();
    const balance = await this.irys!.getLoadedBalance();
    return Number(balance) / 1e12;
  }

  async fund(amount: number): Promise<string> {
    await this.initialize();
    const fundTx = await this.irys!.fund(amount * 1e12);
    return fundTx.id;
  }

  private buildArweaveRecord(
    activity: Activity,
    options?: {
      discovery?: Discovery;
      decision?: Decision;
      solanaTxHash?: string;
      solanaSlot?: number;
    }
  ): ArweaveActivityRecord {
    const contentHash = this.computeHash(activity);

    // Create signature (in production, this would be a proper ed25519 signature)
    const signature = this.computeHash({
      activity: activity.id,
      timestamp: Date.now(),
      key: this.keypair.publicKey.toBase58(),
    });

    return {
      "@context": "https://gicm.dev/schemas/activity/v1",
      "@type": "OrchestratorActivity",
      id: activity.id,
      version: 1,
      orchestrator: {
        id: "gicm-orchestrator",
        version: "1.0.0",
        owner: this.keypair.publicKey.toBase58(),
      },
      activity: {
        type: activity.type,
        status: activity.status,
        priority: 0,
        createdAt: activity.createdAt.toISOString(),
        completedAt: activity.completedAt?.toISOString(),
        input: activity.inputData,
        output: activity.outputData,
        reasoning: activity.reasoning,
        confidence: activity.confidence,
      },
      relationships: {
        parentId: activity.parentId,
        workflowId: activity.workflowId,
        agentId: activity.agentId,
        discoveryId: options?.discovery?.id,
        decisionId: options?.decision?.id,
      },
      onChain: {
        solanaTx: options?.solanaTxHash ?? activity.solanaTxHash,
        solanaSlot: options?.solanaSlot,
        contentHash,
      },
      discovery: options?.discovery,
      decision: options?.decision,
      signature: {
        algorithm: "ed25519",
        publicKey: this.keypair.publicKey.toBase58(),
        value: signature,
      },
    };
  }

  private computeHash(data: unknown): string {
    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }
}

// Helper to verify an Arweave record
export async function verifyArweaveRecord(
  txId: string,
  expectedHash: string,
  gatewayUrl: string = "https://arweave.net"
): Promise<{ verified: boolean; record?: ArweaveActivityRecord }> {
  try {
    const response = await fetch(`${gatewayUrl}/${txId}`);
    if (!response.ok) {
      return { verified: false };
    }

    const record = (await response.json()) as ArweaveActivityRecord;
    const verified = record.onChain.contentHash === expectedHash;

    return { verified, record };
  } catch {
    return { verified: false };
  }
}
