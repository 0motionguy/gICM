import { A as AgentConfig, a as AgentTool, b as AgentContext, c as AgentResult } from './index-qMQMZZWY.js';
export { d as AgentConfigSchema, e as AgentResultSchema, k as ChainProvider, C as ChainType, D as DexProvider, s as EVM_NETWORKS, r as EvmChainProvider, E as EvmNetwork, q as EvmProviderConfig, v as SOLANA_NETWORKS, u as SolanaChainProvider, S as SolanaNetwork, t as SolanaProviderConfig, o as SwapParams, n as SwapParamsSchema, p as SwapQuote, h as Token, g as TokenSchema, f as Transaction, m as TransactionRequest, l as TransactionRequestSchema, T as TransactionSchema, i as WalletBalance, W as WalletBalanceSchema, j as createChainProvider } from './index-qMQMZZWY.js';
export { EffortLevel, EffortLevelSchema, ExtendedThinking, ExtendedThinkingSchema, LLMClient, LLMConfig, LLMConfigSchema, LLMMessage, LLMProvider, LLMProviderSchema, LLMResponse, ProviderConfig, RotatingLLMClient, RotationStrategy, ThinkingBlock, UniversalLLMClient, createBalancedClient, createBrainClient, createLLMClient, createPowerClient, createRotatingClient, createTurboClient } from './llm/index.js';
export { AggregatedHealth, AlertConfig, CheckResult, CircuitBreaker, CircuitBreakerConfig, CircuitBreakerOpenError, CircuitState, Deadline, GuardResult, HealthAggregator, HealthAggregatorConfig, HealthCheck, HealthMonitor, HealthResult, HealthStatus, LiveModeConfig, LiveModeGuard, PendingApproval, Retry, RetryConfig, ServiceConfig, ServiceHealth, TimeoutConfig, TimeoutController, TimeoutError, TimeoutManager, TimeoutStats, TradeRequest, calculateDelay, createFunctionHealthCheck, createHealthCheck, createHttpHealthCheck, mergeHealthResults, raceWithTimeout, sequenceWithTimeout, sleep, withResilience, withRetry, withTimeout } from './resilience/index.js';
export { ApiKeyInfo, ApiKeyManager, AuthConfig, AuthMiddleware, AuthRequest, AuthResult, CSP_PRESETS, CompositeSecretBackend, CorsConfig, CorsHeaders, CspDirectives, EnvSecretBackend, FixedWindowLimiter, HttpRequest, HttpResponse, JwtManager, MemorySecretBackend, MultiTierRateLimiter, RateLimitConfig, RateLimitError, RateLimitResult, RateLimitStats, RateLimiter, SECURITY_PRESETS, SecretBackend, SecretMetadata, SecretValue, SecretsManager, SecretsManagerConfig, SecurityHeadersConfig, SecurityHeadersMiddleware, Session, SessionManager, SlidingWindowLimiter, TierConfig, TokenBucketLimiter, TokenPayload, addNonceToCsp, buildCspString, createApiRateLimiter, createAuthGuard, createLLMRateLimiter, createRateLimitHeaders, createSecretsManager, createStaticFileHeaders, generateApiKey, generateCorsHeaders, generateNonce, generateSecretKey, generateSecurityHeaders, hasScope, hashPassword, isOriginAllowed, isValidApiKey, mergeCspDirectives, parseAuthHeader, redactSecrets, verifyPassword } from './security/index.js';
import 'zod';

declare abstract class BaseAgent {
    protected name: string;
    protected config: AgentConfig;
    protected tools: AgentTool[];
    constructor(name: string, config: AgentConfig);
    abstract getSystemPrompt(): string;
    abstract analyze(context: AgentContext): Promise<AgentResult>;
    getName(): string;
    getConfig(): AgentConfig;
    getTools(): AgentTool[];
    protected registerTool(tool: AgentTool): void;
    protected createResult(success: boolean, data?: unknown, error?: string, confidence?: number, reasoning?: string): AgentResult;
    protected log(message: string, data?: unknown): void;
    protected parseJSON<T>(response: string): T | null;
}

/**
 * Structured Brainstorming Methods for AI Agents
 * Inspired by github.com/Azzedde/brainstormers
 *
 * These methods can be embedded into agent prompts to improve
 * systematic thinking and decision-making quality.
 */
type BrainstormMethod = "scamper" | "six-hats" | "reverse" | "role-storming" | "starbursting" | "mind-mapping" | "swot" | "five-whys" | "brainwriting";
interface BrainstormConfig {
    method: BrainstormMethod;
    topic: string;
    context?: string;
}
/**
 * SCAMPER Method
 * Systematic creative technique for improving/modifying ideas
 */
declare const SCAMPER_PROMPT = "\nAnalyze using the SCAMPER method:\n\n**S - Substitute**: What can be substituted? Different approach, tool, or resource?\n**C - Combine**: What can be combined? Merge with other ideas or solutions?\n**A - Adapt**: What can be adapted? Borrow from other domains or contexts?\n**M - Modify**: What can be modified? Change size, shape, frequency, or intensity?\n**P - Put to other uses**: What other uses exist? Repurpose for different markets?\n**E - Eliminate**: What can be eliminated? Remove unnecessary complexity?\n**R - Reverse/Rearrange**: What can be reversed? Change order or perspective?\n\nFor each SCAMPER element, provide:\n1. Specific suggestion\n2. Potential impact (High/Medium/Low)\n3. Implementation difficulty (Easy/Medium/Hard)\n";
/**
 * Six Thinking Hats Method
 * Multi-perspective analysis from 6 angles
 */
declare const SIX_HATS_PROMPT = "\nAnalyze using the Six Thinking Hats method:\n\n\uD83C\uDFA9 **White Hat (Facts)**: What are the objective facts and data?\n- Known information\n- Data gaps to fill\n- Verifiable metrics\n\n\uD83C\uDFA9 **Red Hat (Emotions)**: What are the gut feelings and intuitions?\n- Initial reactions\n- Emotional appeal\n- User sentiment\n\n\uD83C\uDFA9 **Black Hat (Risks)**: What are the dangers and problems?\n- Potential failures\n- Worst-case scenarios\n- Critical weaknesses\n\n\uD83C\uDFA9 **Yellow Hat (Benefits)**: What are the positives and opportunities?\n- Best-case scenarios\n- Competitive advantages\n- Growth potential\n\n\uD83C\uDFA9 **Green Hat (Creativity)**: What are new ideas and alternatives?\n- Novel approaches\n- Unconventional solutions\n- Innovation opportunities\n\n\uD83C\uDFA9 **Blue Hat (Process)**: What's the next step and action plan?\n- Decision summary\n- Priority actions\n- Success metrics\n\nFor each hat, provide 2-3 concrete points.\n";
/**
 * Reverse Brainstorming Method
 * Find problems to reveal solutions
 */
declare const REVERSE_BRAINSTORM_PROMPT = "\nAnalyze using Reverse Brainstorming:\n\n**Step 1 - Invert the Goal**: Instead of \"How to succeed?\", ask \"How to fail?\"\nList 5 ways this could completely fail:\n1.\n2.\n3.\n4.\n5.\n\n**Step 2 - Reverse Each Failure**: For each failure mode, identify the opposite action\n- Failure \u2192 Prevention Strategy\n- Weakness \u2192 Strength to build\n\n**Step 3 - Hidden Insights**: What problems reveal opportunities?\n- Market gaps exposed\n- Unmet needs discovered\n- Competitive weaknesses to exploit\n\n**Step 4 - Action Items**: Convert insights to specific actions\n";
/**
 * Role Storming Method
 * Think from different personas/perspectives
 */
declare const ROLE_STORMING_PROMPT = "\nAnalyze from multiple persona perspectives:\n\n\uD83D\uDC64 **The Conservative Investor**:\n- Focus: Capital preservation, proven track record, risk management\n- Question: \"Is this safe enough? What's the downside protection?\"\n- Concern: Volatility, unproven concepts, regulatory risk\n\n\uD83D\uDC64 **The Aggressive Degen**:\n- Focus: Maximum upside, early entry, momentum plays\n- Question: \"What's the 10x potential? Where's the asymmetric bet?\"\n- Concern: Missing the pump, being too late\n\n\uD83D\uDC64 **The Whale**:\n- Focus: Liquidity, market impact, accumulation strategy\n- Question: \"Can I size in without moving the market? Exit strategy?\"\n- Concern: Slippage, liquidity traps, front-running\n\n\uD83D\uDC64 **The Skeptic**:\n- Focus: Red flags, team quality, tokenomics\n- Question: \"What's the catch? Who benefits if this fails?\"\n- Concern: Rug pulls, insider dumping, unsustainable mechanics\n\n\uD83D\uDC64 **The Builder**:\n- Focus: Technical quality, product-market fit, team execution\n- Question: \"Is this technically sound? Can they ship?\"\n- Concern: Vaporware, technical debt, scaling issues\n\nFor each persona, provide:\n1. Their likely verdict (Bullish/Bearish/Neutral)\n2. Key concern or opportunity they'd identify\n3. Suggested action\n";
/**
 * Starbursting Method
 * 5W1H structured questioning
 */
declare const STARBURSTING_PROMPT = "\nDeep-dive using Starbursting (5W1H):\n\n\u2753 **WHO**\n- Who is the target user/customer?\n- Who are the competitors?\n- Who on the team is responsible?\n- Who benefits most? Who loses?\n\n\u2753 **WHAT**\n- What problem does this solve?\n- What is the core value proposition?\n- What resources are needed?\n- What could go wrong?\n\n\u2753 **WHEN**\n- When should we act?\n- When is the optimal timing?\n- When do we expect results?\n- When should we reassess?\n\n\u2753 **WHERE**\n- Where is the opportunity?\n- Where are similar solutions?\n- Where should we focus first?\n- Where are the blind spots?\n\n\u2753 **WHY**\n- Why does this matter now?\n- Why would users choose this?\n- Why hasn't this been done before?\n- Why might this fail?\n\n\u2753 **HOW**\n- How will this be implemented?\n- How will success be measured?\n- How will we iterate?\n- How much will it cost?\n\nFor each question category, identify the 2 most critical questions and answer them.\n";
/**
 * Mind Mapping Method
 * Hierarchical idea expansion
 */
declare const MIND_MAPPING_PROMPT = "\nExpand using Mind Mapping structure:\n\n\uD83C\uDF33 **CENTRAL IDEA**: [Topic]\n\n\u251C\u2500\u2500 \uD83C\uDF3F **Branch 1: Market Opportunity**\n\u2502   \u251C\u2500\u2500 Sub-idea 1.1\n\u2502   \u251C\u2500\u2500 Sub-idea 1.2\n\u2502   \u2514\u2500\u2500 Sub-idea 1.3\n\n\u251C\u2500\u2500 \uD83C\uDF3F **Branch 2: Technical Approach**\n\u2502   \u251C\u2500\u2500 Sub-idea 2.1\n\u2502   \u251C\u2500\u2500 Sub-idea 2.2\n\u2502   \u2514\u2500\u2500 Sub-idea 2.3\n\n\u251C\u2500\u2500 \uD83C\uDF3F **Branch 3: Competitive Landscape**\n\u2502   \u251C\u2500\u2500 Sub-idea 3.1\n\u2502   \u251C\u2500\u2500 Sub-idea 3.2\n\u2502   \u2514\u2500\u2500 Sub-idea 3.3\n\n\u251C\u2500\u2500 \uD83C\uDF3F **Branch 4: Risks & Mitigations**\n\u2502   \u251C\u2500\u2500 Sub-idea 4.1\n\u2502   \u251C\u2500\u2500 Sub-idea 4.2\n\u2502   \u2514\u2500\u2500 Sub-idea 4.3\n\n\u2514\u2500\u2500 \uD83C\uDF3F **Branch 5: Action Items**\n    \u251C\u2500\u2500 Immediate (Today)\n    \u251C\u2500\u2500 Short-term (This Week)\n    \u2514\u2500\u2500 Medium-term (This Month)\n\nFor each branch, expand with 3-5 concrete sub-ideas.\n";
/**
 * SWOT Analysis Method
 * Strategic planning tool for assessing strengths, weaknesses, opportunities, threats
 */
declare const SWOT_PROMPT = "\nAnalyze using SWOT Analysis:\n\n\uD83D\uDCCA **STRENGTHS (Internal Positives)**\nWhat advantages do we have? What do we do well?\n- Core competencies\n- Unique resources or capabilities\n- Competitive advantages\n- Strong areas\n\n| Strength | Impact | Leverage Strategy |\n|----------|--------|-------------------|\n| 1. | High/Med/Low | How to maximize |\n| 2. | High/Med/Low | How to maximize |\n| 3. | High/Med/Low | How to maximize |\n\n\uD83D\uDCCA **WEAKNESSES (Internal Negatives)**\nWhat could be improved? Where are we vulnerable?\n- Resource gaps\n- Skill deficiencies\n- Process inefficiencies\n- Competitive disadvantages\n\n| Weakness | Severity | Mitigation Plan |\n|----------|----------|-----------------|\n| 1. | Critical/Moderate/Minor | How to address |\n| 2. | Critical/Moderate/Minor | How to address |\n| 3. | Critical/Moderate/Minor | How to address |\n\n\uD83D\uDCCA **OPPORTUNITIES (External Positives)**\nWhat trends could we capitalize on? What market gaps exist?\n- Market trends\n- Emerging technologies\n- Regulatory changes\n- Competitor weaknesses\n\n| Opportunity | Potential | Action Required |\n|-------------|-----------|-----------------|\n| 1. | High/Med/Low | Specific steps |\n| 2. | High/Med/Low | Specific steps |\n| 3. | High/Med/Low | Specific steps |\n\n\uD83D\uDCCA **THREATS (External Negatives)**\nWhat obstacles do we face? What are competitors doing?\n- Market risks\n- Economic factors\n- Competitive pressures\n- Regulatory threats\n\n| Threat | Probability | Contingency Plan |\n|--------|-------------|------------------|\n| 1. | High/Med/Low | Defense strategy |\n| 2. | High/Med/Low | Defense strategy |\n| 3. | High/Med/Low | Defense strategy |\n\n**Strategic Recommendations:**\nBased on the SWOT analysis, identify:\n1. S-O Strategy: How to use strengths to capture opportunities\n2. W-O Strategy: How to overcome weaknesses by pursuing opportunities\n3. S-T Strategy: How to use strengths to avoid threats\n4. W-T Strategy: How to minimize weaknesses and avoid threats\n";
/**
 * Five Whys Method
 * Root cause analysis technique
 */
declare const FIVE_WHYS_PROMPT = "\nAnalyze using the Five Whys technique:\n\n\uD83D\uDD0D **Problem Statement**: [State the problem clearly]\n\n**Why #1**: Why is this happening?\n\u2192 Answer: [First level cause]\n\n**Why #2**: Why is [answer #1] happening?\n\u2192 Answer: [Second level cause]\n\n**Why #3**: Why is [answer #2] happening?\n\u2192 Answer: [Third level cause]\n\n**Why #4**: Why is [answer #3] happening?\n\u2192 Answer: [Fourth level cause]\n\n**Why #5**: Why is [answer #4] happening?\n\u2192 Answer: [Root cause identified]\n\n---\n\n**Root Cause Analysis Summary:**\n- Surface symptom: [Original problem]\n- Root cause: [Final answer]\n- Contributing factors: [List 2-3 factors]\n\n**Corrective Actions:**\n| Action | Owner | Timeline | Success Metric |\n|--------|-------|----------|----------------|\n| Fix root cause | | | |\n| Address contributing factor 1 | | | |\n| Address contributing factor 2 | | | |\n\n**Preventive Measures:**\nHow to prevent this from recurring:\n1. [Systemic change 1]\n2. [Process improvement 2]\n3. [Monitoring/alert setup]\n\nNote: If you reach the root cause before 5 whys, stop there.\nIf you need more than 5, continue until you find a actionable root cause.\n";
/**
 * Brainwriting Method (6-3-5)
 * Silent idea generation and building
 */
declare const BRAINWRITING_PROMPT = "\nGenerate ideas using Brainwriting (6-3-5 method adapted for AI):\n\n**Topic**: [Subject for ideation]\n\n---\n\n**Round 1 - Initial Ideas (Fresh thinking)**\nGenerate 3 completely independent ideas:\n\n\uD83D\uDCA1 Idea 1.1: [Novel approach]\n- Description:\n- Key benefit:\n- Implementation:\n\n\uD83D\uDCA1 Idea 1.2: [Different angle]\n- Description:\n- Key benefit:\n- Implementation:\n\n\uD83D\uDCA1 Idea 1.3: [Unconventional solution]\n- Description:\n- Key benefit:\n- Implementation:\n\n---\n\n**Round 2 - Build on Ideas (Expand and improve)**\nTake each idea and enhance it:\n\n\uD83D\uDCA1 Idea 2.1 (building on 1.1):\n- Enhancement:\n- New feature:\n- Combination potential:\n\n\uD83D\uDCA1 Idea 2.2 (building on 1.2):\n- Enhancement:\n- New feature:\n- Combination potential:\n\n\uD83D\uDCA1 Idea 2.3 (building on 1.3):\n- Enhancement:\n- New feature:\n- Combination potential:\n\n---\n\n**Round 3 - Cross-pollinate (Combine and synthesize)**\nCombine the best elements from previous rounds:\n\n\uD83C\uDF1F Synthesis 1: [Combination of ideas]\n- Source elements: From ideas X and Y\n- Unique value:\n- Feasibility: High/Medium/Low\n\n\uD83C\uDF1F Synthesis 2: [Different combination]\n- Source elements:\n- Unique value:\n- Feasibility: High/Medium/Low\n\n\uD83C\uDF1F Synthesis 3: [Best overall concept]\n- Source elements:\n- Unique value:\n- Feasibility: High/Medium/Low\n\n---\n\n**Final Ranking:**\nRank all ideas by potential impact \u00D7 feasibility:\n\n| Rank | Idea | Impact | Feasibility | Score |\n|------|------|--------|-------------|-------|\n| 1 | | High/Med/Low | High/Med/Low | |\n| 2 | | High/Med/Low | High/Med/Low | |\n| 3 | | High/Med/Low | High/Med/Low | |\n\n**Recommended Next Steps:**\n1. [Immediate action for top idea]\n2. [Validation approach]\n3. [Resource requirements]\n";
/**
 * Get the prompt template for a brainstorming method
 */
declare function getBrainstormPrompt(method: BrainstormMethod): string;
/**
 * Build a complete brainstorming prompt with context
 */
declare function buildBrainstormPrompt(config: BrainstormConfig): string;
/**
 * Method metadata for UI display
 */
declare const BRAINSTORM_METHODS: Record<BrainstormMethod, {
    name: string;
    description: string;
    icon: string;
    color: string;
    useCases: string[];
}>;

export { AgentConfig, AgentContext, AgentResult, AgentTool, BRAINSTORM_METHODS, BRAINWRITING_PROMPT, BaseAgent, type BrainstormConfig, type BrainstormMethod, FIVE_WHYS_PROMPT, MIND_MAPPING_PROMPT, REVERSE_BRAINSTORM_PROMPT, ROLE_STORMING_PROMPT, SCAMPER_PROMPT, SIX_HATS_PROMPT, STARBURSTING_PROMPT, SWOT_PROMPT, buildBrainstormPrompt, getBrainstormPrompt };
