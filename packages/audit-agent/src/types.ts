import { z } from "zod";

export const VulnerabilitySeverity = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "informational",
]);
export type VulnerabilitySeverity = z.infer<typeof VulnerabilitySeverity>;

export const VulnerabilityCategory = z.enum([
  "reentrancy",
  "overflow",
  "access_control",
  "oracle_manipulation",
  "front_running",
  "dos",
  "logic_error",
  "gas_optimization",
  "centralization",
  "unchecked_return",
  "timestamp_dependency",
  "arbitrary_send",
  "missing_validation",
]);
export type VulnerabilityCategory = z.infer<typeof VulnerabilityCategory>;

export const VulnerabilitySchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: VulnerabilitySeverity,
  category: VulnerabilityCategory,
  description: z.string(),
  location: z.object({
    file: z.string().optional(),
    line: z.number().optional(),
    function: z.string().optional(),
  }),
  recommendation: z.string(),
  references: z.array(z.string()).optional(),
});
export type Vulnerability = z.infer<typeof VulnerabilitySchema>;

export const AuditResultSchema = z.object({
  contractName: z.string(),
  language: z.enum(["solidity", "rust", "move"]),
  vulnerabilities: z.array(VulnerabilitySchema),
  gasOptimizations: z.array(
    z.object({
      description: z.string(),
      estimatedSavings: z.string().optional(),
      location: z.string().optional(),
    })
  ),
  summary: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    informational: z.number(),
  }),
  overallRisk: z.enum(["critical", "high", "medium", "low", "safe"]),
  timestamp: z.number(),
});
export type AuditResult = z.infer<typeof AuditResultSchema>;

export interface AuditConfig {
  checkReentrancy?: boolean;
  checkOverflow?: boolean;
  checkAccessControl?: boolean;
  checkGasOptimization?: boolean;
  runSlither?: boolean;
  runMythril?: boolean;
}
