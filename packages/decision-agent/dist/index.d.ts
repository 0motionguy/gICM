import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '@gicm/agent-core';
import { HuntDiscovery } from '@gicm/hunter-agent';
import { z } from 'zod';

declare const DecisionScoresSchema: z.ZodObject<{
    relevance: z.ZodNumber;
    impact: z.ZodNumber;
    effort: z.ZodNumber;
    timing: z.ZodNumber;
    quality: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    relevance: number;
    impact: number;
    effort: number;
    timing: number;
    quality: number;
}, {
    relevance: number;
    impact: number;
    effort: number;
    timing: number;
    quality: number;
}>;
type DecisionScores = z.infer<typeof DecisionScoresSchema>;
declare const RecommendationSchema: z.ZodEnum<["build", "integrate", "monitor", "ignore"]>;
type Recommendation = z.infer<typeof RecommendationSchema>;
declare const DecisionResultSchema: z.ZodObject<{
    scores: z.ZodObject<{
        relevance: z.ZodNumber;
        impact: z.ZodNumber;
        effort: z.ZodNumber;
        timing: z.ZodNumber;
        quality: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        relevance: number;
        impact: number;
        effort: number;
        timing: number;
        quality: number;
    }, {
        relevance: number;
        impact: number;
        effort: number;
        timing: number;
        quality: number;
    }>;
    totalScore: z.ZodNumber;
    recommendation: z.ZodEnum<["build", "integrate", "monitor", "ignore"]>;
    reasoning: z.ZodString;
    summary: z.ZodString;
    suggestedAction: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    riskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
    riskFactors: z.ZodArray<z.ZodString, "many">;
    estimatedEffort: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    scores: {
        relevance: number;
        impact: number;
        effort: number;
        timing: number;
        quality: number;
    };
    totalScore: number;
    recommendation: "build" | "integrate" | "monitor" | "ignore";
    reasoning: string;
    summary: string;
    suggestedAction: string;
    tags: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    riskFactors: string[];
    estimatedEffort: string;
    confidence: number;
}, {
    scores: {
        relevance: number;
        impact: number;
        effort: number;
        timing: number;
        quality: number;
    };
    totalScore: number;
    recommendation: "build" | "integrate" | "monitor" | "ignore";
    reasoning: string;
    summary: string;
    suggestedAction: string;
    tags: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    riskFactors: string[];
    estimatedEffort: string;
    confidence: number;
}>;
type DecisionResult = z.infer<typeof DecisionResultSchema>;
interface DecisionThresholds {
    autoApprove: number;
    humanReview: number;
}
declare const DEFAULT_THRESHOLDS: DecisionThresholds;
type DecisionStatus = "auto_approve" | "human_review" | "reject";
declare const LLMDecisionResponseSchema: z.ZodObject<{
    scores: z.ZodObject<{
        relevance: z.ZodObject<{
            score: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reasoning: string;
            score: number;
        }, {
            reasoning: string;
            score: number;
        }>;
        impact: z.ZodObject<{
            score: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reasoning: string;
            score: number;
        }, {
            reasoning: string;
            score: number;
        }>;
        effort: z.ZodObject<{
            score: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reasoning: string;
            score: number;
        }, {
            reasoning: string;
            score: number;
        }>;
        timing: z.ZodObject<{
            score: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reasoning: string;
            score: number;
        }, {
            reasoning: string;
            score: number;
        }>;
        quality: z.ZodObject<{
            score: z.ZodNumber;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reasoning: string;
            score: number;
        }, {
            reasoning: string;
            score: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        relevance: {
            reasoning: string;
            score: number;
        };
        impact: {
            reasoning: string;
            score: number;
        };
        effort: {
            reasoning: string;
            score: number;
        };
        timing: {
            reasoning: string;
            score: number;
        };
        quality: {
            reasoning: string;
            score: number;
        };
    }, {
        relevance: {
            reasoning: string;
            score: number;
        };
        impact: {
            reasoning: string;
            score: number;
        };
        effort: {
            reasoning: string;
            score: number;
        };
        timing: {
            reasoning: string;
            score: number;
        };
        quality: {
            reasoning: string;
            score: number;
        };
    }>;
    totalScore: z.ZodNumber;
    recommendation: z.ZodEnum<["build", "integrate", "monitor", "ignore"]>;
    reasoning: z.ZodString;
    summary: z.ZodString;
    suggestedAction: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    riskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
    riskFactors: z.ZodArray<z.ZodString, "many">;
    estimatedEffort: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    scores: {
        relevance: {
            reasoning: string;
            score: number;
        };
        impact: {
            reasoning: string;
            score: number;
        };
        effort: {
            reasoning: string;
            score: number;
        };
        timing: {
            reasoning: string;
            score: number;
        };
        quality: {
            reasoning: string;
            score: number;
        };
    };
    totalScore: number;
    recommendation: "build" | "integrate" | "monitor" | "ignore";
    reasoning: string;
    summary: string;
    suggestedAction: string;
    tags: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    riskFactors: string[];
    estimatedEffort: string;
    confidence: number;
}, {
    scores: {
        relevance: {
            reasoning: string;
            score: number;
        };
        impact: {
            reasoning: string;
            score: number;
        };
        effort: {
            reasoning: string;
            score: number;
        };
        timing: {
            reasoning: string;
            score: number;
        };
        quality: {
            reasoning: string;
            score: number;
        };
    };
    totalScore: number;
    recommendation: "build" | "integrate" | "monitor" | "ignore";
    reasoning: string;
    summary: string;
    suggestedAction: string;
    tags: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    riskFactors: string[];
    estimatedEffort: string;
    confidence: number;
}>;
type LLMDecisionResponse = z.infer<typeof LLMDecisionResponseSchema>;
declare const SCORING_WEIGHTS: {
    readonly relevance: 0.3;
    readonly impact: 0.25;
    readonly effort: 0.2;
    readonly timing: 0.15;
    readonly quality: 0.1;
};

interface DecisionAgentConfig extends AgentConfig {
    llmProvider: "openai" | "anthropic" | "gemini";
    apiKey: string;
    model?: string;
    thresholds?: DecisionThresholds;
    onDecision?: (discovery: HuntDiscovery, result: DecisionResult, status: DecisionStatus) => Promise<void>;
}
interface ScoredDiscovery {
    discovery: HuntDiscovery;
    result: DecisionResult;
    status: DecisionStatus;
}
declare class DecisionAgent extends BaseAgent {
    private scorer;
    private thresholds;
    private onDecision?;
    constructor(config: DecisionAgentConfig);
    getSystemPrompt(): string;
    analyze(context: AgentContext): Promise<AgentResult>;
    evaluate(discovery: HuntDiscovery): Promise<ScoredDiscovery>;
    evaluateMany(discoveries: HuntDiscovery[]): Promise<ScoredDiscovery[]>;
    private evaluateDiscovery;
    private evaluateBatch;
    getAutoApproved(results: ScoredDiscovery[]): ScoredDiscovery[];
    getForReview(results: ScoredDiscovery[]): ScoredDiscovery[];
    getRejected(results: ScoredDiscovery[]): ScoredDiscovery[];
    setThresholds(thresholds: Partial<DecisionThresholds>): void;
}

interface ScorerConfig {
    llmProvider: "openai" | "anthropic" | "gemini";
    apiKey: string;
    model?: string;
    thresholds?: DecisionThresholds;
}
declare class DecisionScorer {
    private config;
    private thresholds;
    constructor(config: ScorerConfig);
    evaluate(discovery: HuntDiscovery): Promise<DecisionResult>;
    evaluateBatch(discoveries: HuntDiscovery[]): Promise<Map<string, DecisionResult>>;
    determineStatus(score: number): DecisionStatus;
    private callLLM;
    private callOpenAI;
    private callAnthropic;
    private callGemini;
    private parseResponse;
    private validateAndNormalize;
    private heuristicScore;
}

declare const SYSTEM_PROMPT = "You are a technical opportunity evaluator for gICM, a Web3/AI development platform.\n\nYour role is to evaluate discoveries (GitHub repos, HackerNews posts, Twitter discussions) and determine their value to the gICM ecosystem.\n\ngICM focuses on:\n- Web3/Blockchain development tools (especially Solana and Ethereum)\n- AI agents and LLM-powered tools\n- Developer tooling and productivity\n- DeFi protocols and integrations\n- NFT and DAO tooling\n\nBe decisive and score conservatively. Only truly exceptional discoveries should exceed 85/100.\n\nOutput your evaluation as valid JSON matching this schema:\n{\n  \"scores\": {\n    \"relevance\": { \"score\": 0-100, \"reasoning\": \"...\" },\n    \"impact\": { \"score\": 0-100, \"reasoning\": \"...\" },\n    \"effort\": { \"score\": 0-100, \"reasoning\": \"...\" },\n    \"timing\": { \"score\": 0-100, \"reasoning\": \"...\" },\n    \"quality\": { \"score\": 0-100, \"reasoning\": \"...\" }\n  },\n  \"totalScore\": 0-100,\n  \"recommendation\": \"build\" | \"integrate\" | \"monitor\" | \"ignore\",\n  \"reasoning\": \"Overall analysis\",\n  \"summary\": \"One sentence summary\",\n  \"suggestedAction\": \"What gICM should do\",\n  \"tags\": [\"relevant\", \"tags\"],\n  \"riskLevel\": \"low\" | \"medium\" | \"high\" | \"critical\",\n  \"riskFactors\": [\"list of risks\"],\n  \"estimatedEffort\": \"e.g., '2-3 days', '1 week'\",\n  \"confidence\": 0.0-1.0\n}";
declare function buildEvaluationPrompt(discovery: HuntDiscovery): string;

export { DEFAULT_THRESHOLDS, DecisionAgent, type DecisionAgentConfig, type DecisionResult, DecisionResultSchema, DecisionScorer, type DecisionScores, DecisionScoresSchema, type DecisionStatus, type DecisionThresholds, type LLMDecisionResponse, LLMDecisionResponseSchema, type Recommendation, RecommendationSchema, SCORING_WEIGHTS, SYSTEM_PROMPT, type ScoredDiscovery, type ScorerConfig, buildEvaluationPrompt };
