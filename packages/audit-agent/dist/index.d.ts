import { z } from 'zod';
import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';

declare const VulnerabilitySeverity: z.ZodEnum<["critical", "high", "medium", "low", "informational"]>;
type VulnerabilitySeverity = z.infer<typeof VulnerabilitySeverity>;
declare const VulnerabilityCategory: z.ZodEnum<["reentrancy", "overflow", "access_control", "oracle_manipulation", "front_running", "dos", "logic_error", "gas_optimization", "centralization", "unchecked_return", "timestamp_dependency", "arbitrary_send", "missing_validation"]>;
type VulnerabilityCategory = z.infer<typeof VulnerabilityCategory>;
declare const VulnerabilitySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    severity: z.ZodEnum<["critical", "high", "medium", "low", "informational"]>;
    category: z.ZodEnum<["reentrancy", "overflow", "access_control", "oracle_manipulation", "front_running", "dos", "logic_error", "gas_optimization", "centralization", "unchecked_return", "timestamp_dependency", "arbitrary_send", "missing_validation"]>;
    description: z.ZodString;
    location: z.ZodObject<{
        file: z.ZodOptional<z.ZodString>;
        line: z.ZodOptional<z.ZodNumber>;
        function: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        function?: string | undefined;
        file?: string | undefined;
        line?: number | undefined;
    }, {
        function?: string | undefined;
        file?: string | undefined;
        line?: number | undefined;
    }>;
    recommendation: z.ZodString;
    references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    severity: "critical" | "high" | "medium" | "low" | "informational";
    category: "reentrancy" | "overflow" | "access_control" | "oracle_manipulation" | "front_running" | "dos" | "logic_error" | "gas_optimization" | "centralization" | "unchecked_return" | "timestamp_dependency" | "arbitrary_send" | "missing_validation";
    description: string;
    location: {
        function?: string | undefined;
        file?: string | undefined;
        line?: number | undefined;
    };
    recommendation: string;
    references?: string[] | undefined;
}, {
    id: string;
    title: string;
    severity: "critical" | "high" | "medium" | "low" | "informational";
    category: "reentrancy" | "overflow" | "access_control" | "oracle_manipulation" | "front_running" | "dos" | "logic_error" | "gas_optimization" | "centralization" | "unchecked_return" | "timestamp_dependency" | "arbitrary_send" | "missing_validation";
    description: string;
    location: {
        function?: string | undefined;
        file?: string | undefined;
        line?: number | undefined;
    };
    recommendation: string;
    references?: string[] | undefined;
}>;
type Vulnerability = z.infer<typeof VulnerabilitySchema>;
declare const AuditResultSchema: z.ZodObject<{
    contractName: z.ZodString;
    language: z.ZodEnum<["solidity", "rust", "move"]>;
    vulnerabilities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        severity: z.ZodEnum<["critical", "high", "medium", "low", "informational"]>;
        category: z.ZodEnum<["reentrancy", "overflow", "access_control", "oracle_manipulation", "front_running", "dos", "logic_error", "gas_optimization", "centralization", "unchecked_return", "timestamp_dependency", "arbitrary_send", "missing_validation"]>;
        description: z.ZodString;
        location: z.ZodObject<{
            file: z.ZodOptional<z.ZodString>;
            line: z.ZodOptional<z.ZodNumber>;
            function: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            function?: string | undefined;
            file?: string | undefined;
            line?: number | undefined;
        }, {
            function?: string | undefined;
            file?: string | undefined;
            line?: number | undefined;
        }>;
        recommendation: z.ZodString;
        references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        severity: "critical" | "high" | "medium" | "low" | "informational";
        category: "reentrancy" | "overflow" | "access_control" | "oracle_manipulation" | "front_running" | "dos" | "logic_error" | "gas_optimization" | "centralization" | "unchecked_return" | "timestamp_dependency" | "arbitrary_send" | "missing_validation";
        description: string;
        location: {
            function?: string | undefined;
            file?: string | undefined;
            line?: number | undefined;
        };
        recommendation: string;
        references?: string[] | undefined;
    }, {
        id: string;
        title: string;
        severity: "critical" | "high" | "medium" | "low" | "informational";
        category: "reentrancy" | "overflow" | "access_control" | "oracle_manipulation" | "front_running" | "dos" | "logic_error" | "gas_optimization" | "centralization" | "unchecked_return" | "timestamp_dependency" | "arbitrary_send" | "missing_validation";
        description: string;
        location: {
            function?: string | undefined;
            file?: string | undefined;
            line?: number | undefined;
        };
        recommendation: string;
        references?: string[] | undefined;
    }>, "many">;
    gasOptimizations: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        estimatedSavings: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        location?: string | undefined;
        estimatedSavings?: string | undefined;
    }, {
        description: string;
        location?: string | undefined;
        estimatedSavings?: string | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        critical: z.ZodNumber;
        high: z.ZodNumber;
        medium: z.ZodNumber;
        low: z.ZodNumber;
        informational: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        critical: number;
        high: number;
        medium: number;
        low: number;
        informational: number;
    }, {
        critical: number;
        high: number;
        medium: number;
        low: number;
        informational: number;
    }>;
    overallRisk: z.ZodEnum<["critical", "high", "medium", "low", "safe"]>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    contractName: string;
    language: "solidity" | "rust" | "move";
    vulnerabilities: {
        id: string;
        title: string;
        severity: "critical" | "high" | "medium" | "low" | "informational";
        category: "reentrancy" | "overflow" | "access_control" | "oracle_manipulation" | "front_running" | "dos" | "logic_error" | "gas_optimization" | "centralization" | "unchecked_return" | "timestamp_dependency" | "arbitrary_send" | "missing_validation";
        description: string;
        location: {
            function?: string | undefined;
            file?: string | undefined;
            line?: number | undefined;
        };
        recommendation: string;
        references?: string[] | undefined;
    }[];
    gasOptimizations: {
        description: string;
        location?: string | undefined;
        estimatedSavings?: string | undefined;
    }[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        informational: number;
    };
    overallRisk: "critical" | "high" | "medium" | "low" | "safe";
    timestamp: number;
}, {
    contractName: string;
    language: "solidity" | "rust" | "move";
    vulnerabilities: {
        id: string;
        title: string;
        severity: "critical" | "high" | "medium" | "low" | "informational";
        category: "reentrancy" | "overflow" | "access_control" | "oracle_manipulation" | "front_running" | "dos" | "logic_error" | "gas_optimization" | "centralization" | "unchecked_return" | "timestamp_dependency" | "arbitrary_send" | "missing_validation";
        description: string;
        location: {
            function?: string | undefined;
            file?: string | undefined;
            line?: number | undefined;
        };
        recommendation: string;
        references?: string[] | undefined;
    }[];
    gasOptimizations: {
        description: string;
        location?: string | undefined;
        estimatedSavings?: string | undefined;
    }[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        informational: number;
    };
    overallRisk: "critical" | "high" | "medium" | "low" | "safe";
    timestamp: number;
}>;
type AuditResult = z.infer<typeof AuditResultSchema>;
interface AuditConfig {
    checkReentrancy?: boolean;
    checkOverflow?: boolean;
    checkAccessControl?: boolean;
    checkGasOptimization?: boolean;
    runSlither?: boolean;
    runMythril?: boolean;
}

interface VulnerabilityPattern {
    name: string;
    category: VulnerabilityCategory;
    severity: VulnerabilitySeverity;
    pattern: RegExp;
    description: string;
    recommendation: string;
}
declare const SOLIDITY_PATTERNS: VulnerabilityPattern[];
declare const RUST_ANCHOR_PATTERNS: VulnerabilityPattern[];
declare function detectVulnerabilities(code: string, language: "solidity" | "rust"): Array<{
    pattern: VulnerabilityPattern;
    matches: RegExpMatchArray[];
}>;

declare class AuditAgent extends BaseAgent {
    private auditConfig;
    private llmClient;
    constructor(config: AgentConfig, auditConfig?: AuditConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    private detectLanguage;
    private getLineNumber;
    private performLLMAnalysis;
    private buildAuditResult;
    private calculateConfidence;
    auditCode(code: string, contractName?: string): Promise<AuditResult>;
}

export { AuditAgent, type AuditConfig, type AuditResult, AuditResultSchema, RUST_ANCHOR_PATTERNS, SOLIDITY_PATTERNS, type Vulnerability, VulnerabilityCategory, type VulnerabilityPattern, VulnerabilitySchema, VulnerabilitySeverity, detectVulnerabilities };
