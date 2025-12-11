/**
 * OPUS 67 v6.3.0 - Query Augmentation
 *
 * Enhances queries for better skill detection:
 * 1. Intent classification (coding, debugging, learning, etc.)
 * 2. Term expansion (synonyms, related terms)
 * 3. Entity extraction (technologies, patterns, concepts)
 *
 * Expected improvement: +30% skill matching accuracy
 */

// =============================================================================
// TYPES
// =============================================================================

export type QueryIntent =
  | "coding" // Write/generate code
  | "debugging" // Fix bugs/errors
  | "learning" // Understand concepts
  | "optimization" // Improve performance
  | "security" // Security analysis
  | "testing" // Write/run tests
  | "deployment" // Deploy/configure
  | "refactoring" // Restructure code
  | "documentation" // Write docs
  | "unknown"; // Can't determine

export interface AugmentedQuery {
  original: string;
  expanded: string;
  intent: QueryIntent;
  entities: ExtractedEntity[];
  keywords: string[];
  confidence: number;
}

export interface ExtractedEntity {
  type:
    | "technology"
    | "framework"
    | "pattern"
    | "concept"
    | "language"
    | "tool";
  value: string;
  confidence: number;
}

// =============================================================================
// INTENT CLASSIFICATION
// =============================================================================

const INTENT_PATTERNS: Record<QueryIntent, RegExp[]> = {
  coding: [
    /\b(create|build|implement|write|add|make|generate|develop)\b/i,
    /\b(function|class|component|endpoint|api|feature)\b/i,
    /\bhow (do i|to|can i)\b.*\b(create|build|implement|write)\b/i,
  ],
  debugging: [
    /\b(fix|debug|error|bug|issue|problem|broken|failing|crash)\b/i,
    /\b(not working|doesn'?t work|won'?t|can'?t)\b/i,
    /\bwhy (is|does|am i getting)\b/i,
  ],
  learning: [
    /\b(explain|understand|what is|how does|learn|concept|theory)\b/i,
    /\b(difference between|compared to|vs|versus)\b/i,
    /\bwhat('?s| is) (the|a)\b/i,
  ],
  optimization: [
    /\b(optimize|improve|performance|faster|efficient|slow|speed up)\b/i,
    /\b(reduce|minimize|maximize|memory|cpu|latency)\b/i,
    /\b(gas|compute units?|caching|bundle size)\b/i,
  ],
  security: [
    /\b(security|secure|vulnerability|audit|attack|exploit|safe)\b/i,
    /\b(authentication|authorization|encrypt|hash|sign)\b/i,
    /\b(reentrancy|overflow|injection|xss|csrf)\b/i,
  ],
  testing: [
    /\b(test|testing|spec|coverage|mock|stub|fixture)\b/i,
    /\b(unit test|integration test|e2e|end-to-end)\b/i,
    /\b(jest|vitest|playwright|cypress|mocha)\b/i,
  ],
  deployment: [
    /\b(deploy|deployment|production|staging|release|publish)\b/i,
    /\b(docker|kubernetes|vercel|aws|gcp|azure|ci\/cd)\b/i,
    /\b(config|configuration|environment|env)\b/i,
  ],
  refactoring: [
    /\b(refactor|restructure|reorganize|clean up|improve code)\b/i,
    /\b(extract|inline|rename|move|split)\b/i,
    /\b(code smell|duplication|complexity)\b/i,
  ],
  documentation: [
    /\b(document|documentation|readme|jsdoc|tsdoc|api docs)\b/i,
    /\b(comment|comments|annotate)\b/i,
    /\b(write|generate|create)\b.*\b(docs|documentation)\b/i,
  ],
  unknown: [],
};

/**
 * Classify the intent of a query
 */
export function classifyIntent(query: string): {
  intent: QueryIntent;
  confidence: number;
} {
  const normalizedQuery = query.toLowerCase();
  const scores: Record<QueryIntent, number> = {
    coding: 0,
    debugging: 0,
    learning: 0,
    optimization: 0,
    security: 0,
    testing: 0,
    deployment: 0,
    refactoring: 0,
    documentation: 0,
    unknown: 0,
  };

  // Score each intent based on pattern matches
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [
    QueryIntent,
    RegExp[],
  ][]) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedQuery)) {
        scores[intent]++;
      }
    }
  }

  // Find highest scoring intent
  let maxIntent: QueryIntent = "unknown";
  let maxScore = 0;
  let totalScore = 0;

  for (const [intent, score] of Object.entries(scores) as [
    QueryIntent,
    number,
  ][]) {
    totalScore += score;
    if (score > maxScore) {
      maxScore = score;
      maxIntent = intent;
    }
  }

  // Calculate confidence
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;

  return { intent: maxIntent, confidence };
}

// =============================================================================
// TERM EXPANSION
// =============================================================================

const SYNONYMS: Record<string, string[]> = {
  // Blockchain
  solana: ["sol", "spl", "anchor", "metaplex"],
  ethereum: ["eth", "evm", "solidity", "hardhat", "foundry"],
  blockchain: ["chain", "web3", "crypto", "defi"],
  "smart contract": ["program", "contract", "on-chain"],
  wallet: ["wallet adapter", "phantom", "metamask", "web3 wallet"],
  nft: ["token", "collectible", "erc721", "metaplex"],

  // Frontend
  react: ["jsx", "tsx", "hooks", "component"],
  nextjs: ["next", "app router", "pages router", "ssr"],
  typescript: ["ts", "type", "interface", "generic"],
  tailwind: ["css", "styling", "utility classes"],
  animation: ["motion", "framer", "transition", "animate"],

  // Backend
  api: ["endpoint", "route", "rest", "graphql"],
  database: ["db", "sql", "postgres", "mongodb", "supabase"],
  cache: ["redis", "caching", "memoize", "store"],
  auth: ["authentication", "authorization", "jwt", "oauth"],

  // DevOps
  docker: ["container", "containerize", "dockerfile"],
  kubernetes: ["k8s", "pod", "deployment", "service"],
  ci: ["continuous integration", "github actions", "pipeline"],
  deploy: ["deployment", "ship", "release", "publish"],

  // Testing
  test: ["testing", "spec", "unit test", "coverage"],
  mock: ["stub", "fake", "spy", "fixture"],

  // Common actions
  create: ["build", "implement", "make", "generate", "add"],
  fix: ["debug", "resolve", "solve", "repair"],
  improve: ["optimize", "enhance", "refactor", "upgrade"],
};

/**
 * Expand query terms with synonyms
 */
export function expandTerms(query: string, intent: QueryIntent): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set<string>(words);

  // Add synonyms
  for (const word of words) {
    // Direct synonym lookup
    if (SYNONYMS[word]) {
      for (const syn of SYNONYMS[word]) {
        expanded.add(syn);
      }
    }

    // Check multi-word phrases
    for (const [phrase, syns] of Object.entries(SYNONYMS)) {
      if (query.toLowerCase().includes(phrase)) {
        for (const syn of syns) {
          expanded.add(syn);
        }
      }
    }
  }

  // Add intent-specific terms
  const intentTerms = INTENT_EXPANSION[intent] || [];
  for (const term of intentTerms) {
    expanded.add(term);
  }

  return Array.from(expanded);
}

const INTENT_EXPANSION: Record<QueryIntent, string[]> = {
  coding: ["implementation", "code", "develop"],
  debugging: ["troubleshoot", "issue", "error handling"],
  learning: ["understand", "concept", "explanation"],
  optimization: ["performance", "efficient", "fast"],
  security: ["secure", "vulnerability", "audit"],
  testing: ["test", "spec", "coverage"],
  deployment: ["deploy", "production", "release"],
  refactoring: ["clean", "improve", "restructure"],
  documentation: ["docs", "readme", "api reference"],
  unknown: [],
};

// =============================================================================
// ENTITY EXTRACTION
// =============================================================================

const ENTITY_PATTERNS: {
  type: ExtractedEntity["type"];
  patterns: RegExp[];
}[] = [
  {
    type: "technology",
    patterns: [
      /\b(solana|ethereum|polygon|arbitrum|optimism|base)\b/gi,
      /\b(react|vue|angular|svelte|nextjs|nuxt|remix)\b/gi,
      /\b(node|deno|bun|python|rust|go)\b/gi,
      /\b(postgresql|mongodb|redis|supabase|prisma)\b/gi,
    ],
  },
  {
    type: "framework",
    patterns: [
      /\b(anchor|hardhat|foundry|truffle)\b/gi,
      /\b(express|fastify|hono|trpc)\b/gi,
      /\b(jest|vitest|playwright|cypress)\b/gi,
      /\b(tailwind|shadcn|radix|chakra)\b/gi,
    ],
  },
  {
    type: "pattern",
    patterns: [
      /\b(singleton|factory|observer|strategy|proxy)\b/gi,
      /\b(pda|cpi|bonding curve|amm|liquidity pool)\b/gi,
      /\b(reentrancy|flash loan|front-?running)\b/gi,
      /\b(pagination|infinite scroll|optimistic update)\b/gi,
    ],
  },
  {
    type: "concept",
    patterns: [
      /\b(authentication|authorization|encryption)\b/gi,
      /\b(caching|memoization|lazy loading)\b/gi,
      /\b(state management|context|redux)\b/gi,
      /\b(websocket|realtime|subscription)\b/gi,
    ],
  },
  {
    type: "language",
    patterns: [
      /\b(typescript|javascript|rust|python|solidity)\b/gi,
      /\b(sql|graphql|json|yaml|toml)\b/gi,
    ],
  },
  {
    type: "tool",
    patterns: [
      /\b(docker|kubernetes|vercel|aws|gcp|azure)\b/gi,
      /\b(github|gitlab|bitbucket)\b/gi,
      /\b(vscode|cursor|vim|neovim)\b/gi,
    ],
  },
];

/**
 * Extract entities from query
 */
export function extractEntities(query: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const { type, patterns } of ENTITY_PATTERNS) {
    for (const pattern of patterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        const value = match[0].toLowerCase();
        if (!seen.has(value)) {
          seen.add(value);
          entities.push({
            type,
            value,
            confidence: 0.9, // High confidence for regex matches
          });
        }
      }
    }
  }

  return entities;
}

// =============================================================================
// MAIN AUGMENTATION FUNCTION
// =============================================================================

/**
 * Augment a query for better skill matching
 */
export function augmentQuery(query: string): AugmentedQuery {
  // Classify intent
  const { intent, confidence: intentConfidence } = classifyIntent(query);

  // Extract entities
  const entities = extractEntities(query);

  // Expand terms
  const keywords = expandTerms(query, intent);

  // Build expanded query string
  const entityTerms = entities.map((e) => e.value);
  const allTerms = new Set([...keywords, ...entityTerms]);
  const expanded = Array.from(allTerms).join(" ");

  // Calculate overall confidence
  const entityConfidence = entities.length > 0 ? 0.8 : 0.4;
  const confidence = (intentConfidence + entityConfidence) / 2;

  return {
    original: query,
    expanded,
    intent,
    entities,
    keywords,
    confidence,
  };
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export {
  classifyIntent as classify,
  expandTerms as expand,
  extractEntities as extract,
};
