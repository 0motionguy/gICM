// src/arweave/irys-uploader.ts
import Irys from "@irys/sdk";
import { Keypair } from "@solana/web3.js";
import { createHash } from "crypto";
var ArweaveUploader = class {
  irys = null;
  config;
  keypair;
  initialized = false;
  constructor(config) {
    this.config = config;
    this.keypair = this.parsePrivateKey(config.solanaPrivateKey);
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
  async initialize() {
    if (this.initialized) return;
    this.irys = new Irys({
      url: this.config.gatewayUrl ?? "https://node1.irys.xyz",
      token: "solana",
      key: this.keypair.secretKey,
      config: {
        providerUrl: this.config.solanaRpcUrl
      }
    });
    await this.irys.ready();
    this.initialized = true;
  }
  async uploadActivity(activity, options) {
    await this.initialize();
    const record = this.buildArweaveRecord(activity, options);
    const data = JSON.stringify(record, null, 2);
    const dataBuffer = Buffer.from(data);
    const price = await this.irys.getPrice(dataBuffer.length);
    const receipt = await this.irys.upload(dataBuffer, {
      tags: [
        { name: "Content-Type", value: "application/json" },
        { name: "App-Name", value: "gICM-Orchestrator" },
        { name: "App-Version", value: "1.0.0" },
        { name: "Activity-Type", value: activity.type },
        { name: "Activity-ID", value: activity.id },
        { name: "Content-Hash", value: record.onChain.contentHash },
        {
          name: "Created-At",
          value: activity.createdAt.toISOString()
        }
      ]
    });
    return {
      txId: receipt.id,
      url: `https://arweave.net/${receipt.id}`,
      size: dataBuffer.length,
      cost: Number(price) / 1e12
      // Convert to SOL
    };
  }
  async uploadBatch(activities) {
    await this.initialize();
    const batch = {
      "@context": "https://gicm.dev/schemas/activity-batch/v1",
      "@type": "OrchestratorActivityBatch",
      version: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      count: activities.length,
      activities: activities.map(
        ({ activity, discovery, decision }) => this.buildArweaveRecord(activity, { discovery, decision })
      )
    };
    const data = JSON.stringify(batch, null, 2);
    const dataBuffer = Buffer.from(data);
    const price = await this.irys.getPrice(dataBuffer.length);
    const receipt = await this.irys.upload(dataBuffer, {
      tags: [
        { name: "Content-Type", value: "application/json" },
        { name: "App-Name", value: "gICM-Orchestrator" },
        { name: "Batch-Type", value: "activities" },
        { name: "Batch-Count", value: String(activities.length) },
        { name: "Created-At", value: (/* @__PURE__ */ new Date()).toISOString() }
      ]
    });
    return {
      txId: receipt.id,
      url: `https://arweave.net/${receipt.id}`,
      size: dataBuffer.length,
      cost: Number(price) / 1e12
    };
  }
  async getPrice(sizeBytes) {
    await this.initialize();
    const price = await this.irys.getPrice(sizeBytes);
    return Number(price) / 1e12;
  }
  async getBalance() {
    await this.initialize();
    const balance = await this.irys.getLoadedBalance();
    return Number(balance) / 1e12;
  }
  async fund(amount) {
    await this.initialize();
    const fundTx = await this.irys.fund(amount * 1e12);
    return fundTx.id;
  }
  buildArweaveRecord(activity, options) {
    const contentHash = this.computeHash(activity);
    const signature = this.computeHash({
      activity: activity.id,
      timestamp: Date.now(),
      key: this.keypair.publicKey.toBase58()
    });
    return {
      "@context": "https://gicm.dev/schemas/activity/v1",
      "@type": "OrchestratorActivity",
      id: activity.id,
      version: 1,
      orchestrator: {
        id: "gicm-orchestrator",
        version: "1.0.0",
        owner: this.keypair.publicKey.toBase58()
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
        confidence: activity.confidence
      },
      relationships: {
        parentId: activity.parentId,
        workflowId: activity.workflowId,
        agentId: activity.agentId,
        discoveryId: options?.discovery?.id,
        decisionId: options?.decision?.id
      },
      onChain: {
        solanaTx: options?.solanaTxHash ?? activity.solanaTxHash,
        solanaSlot: options?.solanaSlot,
        contentHash
      },
      discovery: options?.discovery,
      decision: options?.decision,
      signature: {
        algorithm: "ed25519",
        publicKey: this.keypair.publicKey.toBase58(),
        value: signature
      }
    };
  }
  computeHash(data) {
    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }
};
async function verifyArweaveRecord(txId, expectedHash, gatewayUrl = "https://arweave.net") {
  try {
    const response = await fetch(`${gatewayUrl}/${txId}`);
    if (!response.ok) {
      return { verified: false };
    }
    const record = await response.json();
    const verified = record.onChain.contentHash === expectedHash;
    return { verified, record };
  } catch {
    return { verified: false };
  }
}

export {
  ArweaveUploader,
  verifyArweaveRecord
};
//# sourceMappingURL=chunk-6OBPNQQO.js.map