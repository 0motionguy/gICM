import { Commitment } from '@solana/web3.js';
import { c as Activity, y as SolanaMemo, f as ActivityType } from '../types-Bpw3NPzK.js';
import 'zod';

interface SolanaLoggerConfig {
    rpcUrl: string;
    privateKey: string;
    commitment?: Commitment;
}
interface SolanaLogResult {
    signature: string;
    slot: number;
    fee: number;
    memo: SolanaMemo;
}
declare class SolanaMemoLogger {
    private connection;
    private payer;
    private commitment;
    constructor(config: SolanaLoggerConfig);
    private parsePrivateKey;
    private base58Decode;
    logActivity(activity: Activity, arweaveTxId?: string): Promise<SolanaLogResult>;
    logActivityBatch(activities: Activity[]): Promise<{
        signature: string;
        slot: number;
        merkleRoot: string;
    }>;
    verifyActivity(signature: string, expectedHash: string): Promise<{
        verified: boolean;
        memo?: SolanaMemo;
    }>;
    getBalance(): Promise<number>;
    getPublicKey(): string;
    private computeHash;
    private computeMerkleRoot;
}
declare function createMemoPayload(activityId: string, activityType: ActivityType, contentHash: string, arweaveTxId?: string): string;

export { type SolanaLogResult, type SolanaLoggerConfig, SolanaMemoLogger, createMemoPayload };
