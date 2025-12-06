import { c as Activity, D as Discovery, d as Decision, B as ArweaveActivityRecord } from '../types-Bpw3NPzK.js';
import 'zod';

interface ArweaveUploaderConfig {
    solanaRpcUrl: string;
    solanaPrivateKey: string;
    gatewayUrl?: string;
    minPayloadSize?: number;
}
interface ArweaveUploadResult {
    txId: string;
    url: string;
    size: number;
    cost: number;
}
declare class ArweaveUploader {
    private irys;
    private config;
    private keypair;
    private initialized;
    constructor(config: ArweaveUploaderConfig);
    private parsePrivateKey;
    private base58Decode;
    initialize(): Promise<void>;
    uploadActivity(activity: Activity, options?: {
        discovery?: Discovery;
        decision?: Decision;
        solanaTxHash?: string;
        solanaSlot?: number;
    }): Promise<ArweaveUploadResult>;
    uploadBatch(activities: Array<{
        activity: Activity;
        discovery?: Discovery;
        decision?: Decision;
    }>): Promise<ArweaveUploadResult>;
    getPrice(sizeBytes: number): Promise<number>;
    getBalance(): Promise<number>;
    fund(amount: number): Promise<string>;
    private buildArweaveRecord;
    private computeHash;
}
declare function verifyArweaveRecord(txId: string, expectedHash: string, gatewayUrl?: string): Promise<{
    verified: boolean;
    record?: ArweaveActivityRecord;
}>;

export { type ArweaveUploadResult, ArweaveUploader, type ArweaveUploaderConfig, verifyArweaveRecord };
