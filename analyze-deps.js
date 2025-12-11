const agents = [
  {
    id: "icm-anchor-architect",
    tags: ["solana", "rust", "anchor", "blockchain", "defi", "launch platform"],
    deps: ["rust-systems-architect", "solana-guardian-auditor"],
  },
  {
    id: "frontend-fusion-engine",
    tags: [
      "next.js",
      "react",
      "typescript",
      "web3",
      "frontend",
      "wallet integration",
    ],
    deps: ["typescript-precision-engineer"],
  },
  {
    id: "rust-systems-architect",
    tags: [
      "rust",
      "systems programming",
      "performance",
      "async",
      "memory safety",
    ],
    deps: [],
  },
  {
    id: "typescript-precision-engineer",
    tags: ["typescript", "type safety", "zod", "api design"],
    deps: ["advanced-typescript-patterns"],
  },
  {
    id: "database-schema-oracle",
    tags: ["postgresql", "supabase", "database", "rls", "schema design"],
    deps: ["sql-optimization", "mcp-postgresql", "mcp-supabase"],
  },
  {
    id: "api-contract-designer",
    tags: ["api", "trpc", "openapi", "rest", "type safety"],
    deps: ["typescript-precision-engineer"],
  },
  {
    id: "web3-integration-maestro",
    tags: ["web3", "wallet", "blockchain", "solana", "ethereum", "rpc"],
    deps: ["frontend-fusion-engine"],
  },
  {
    id: "fullstack-orchestrator",
    tags: ["fullstack", "coordination", "integration", "mvp"],
    deps: [
      "frontend-fusion-engine",
      "icm-anchor-architect",
      "database-schema-oracle",
    ],
  },
  {
    id: "react-native-expert",
    tags: ["mobile", "react native", "expo", "web3", "performance"],
    deps: [
      "frontend-fusion-engine",
      "web3-integration-maestro",
      "performance-profiler",
    ],
  },
  {
    id: "ml-engineer",
    tags: ["machine learning", "ai", "pytorch", "mlops", "deep learning"],
    deps: [
      "typescript-precision-engineer",
      "api-contract-designer",
      "performance-profiler",
    ],
  },
  {
    id: "kubernetes-architect",
    tags: [
      "kubernetes",
      "devops",
      "cloud native",
      "containers",
      "orchestration",
    ],
    deps: [
      "ci-cd-pipeline-engineer",
      "database-schema-oracle",
      "performance-profiler",
    ],
  },
  {
    id: "ios-expert",
    tags: ["ios", "swift", "swiftui", "mobile", "web3"],
    deps: [
      "typescript-precision-engineer",
      "web3-integration-maestro",
      "performance-profiler",
    ],
  },
  {
    id: "data-scientist",
    tags: ["data science", "analytics", "statistics", "visualization", "ml"],
    deps: ["ml-engineer", "database-schema-oracle", "performance-profiler"],
  },
  {
    id: "solana-guardian-auditor",
    tags: ["security", "audit", "solana", "rust", "vulnerability detection"],
    deps: ["solana-program-security", "smart-contract-security"],
  },
  {
    id: "smart-contract-forensics",
    tags: ["smart contracts", "audit", "formal verification", "security"],
    deps: ["solana-guardian-auditor"],
  },
  {
    id: "penetration-testing-specialist",
    tags: ["penetration testing", "security", "owasp", "ethical hacking"],
    deps: ["vulnerability-management", "authentication-patterns"],
  },
  {
    id: "compliance-guardian",
    tags: ["compliance", "legal", "gdpr", "ccpa", "regulations"],
    deps: [],
  },
  {
    id: "context-sculptor",
    tags: ["optimization", "context", "refactoring", "token efficiency"],
    deps: ["refactoring-patterns"],
  },
  {
    id: "performance-profiler",
    tags: ["performance", "optimization", "web vitals", "gas optimization"],
    deps: ["performance-profiling", "monitoring-observability-advanced"],
  },
  {
    id: "ci-cd-pipeline-engineer",
    tags: ["ci/cd", "devops", "github actions", "vercel", "deployment"],
    deps: ["mcp/mcp-github", "feature-flag-management"],
  },
  {
    id: "git-flow-coordinator",
    tags: ["git", "version control", "git flow", "automation"],
    deps: ["mcp-git"],
  },
  {
    id: "debugging-detective",
    tags: ["debugging", "problem solving", "root cause analysis"],
    deps: ["debugging-techniques", "distributed-tracing"],
  },
  {
    id: "technical-writer-pro",
    tags: ["documentation", "technical writing", "adr", "user guides"],
    deps: ["documentation-automation"],
  },
  {
    id: "readme-architect",
    tags: ["readme", "documentation", "github", "marketing"],
    deps: ["technical-writer-pro"],
  },
  {
    id: "changelog-generator",
    tags: ["changelog", "versioning", "automation", "documentation"],
    deps: ["git-flow-coordinator"],
  },
  {
    id: "content-strategist",
    tags: ["marketing", "content", "copywriting", "social media"],
    deps: [],
  },
  {
    id: "diagram-illustrator",
    tags: ["diagrams", "visualization", "architecture", "mermaid"],
    deps: ["technical-writer-pro"],
  },
  {
    id: "test-automation-engineer",
    tags: ["testing", "automation", "jest", "playwright", "e2e"],
    deps: [],
  },
  {
    id: "qa-stress-tester",
    tags: ["load testing", "stress testing", "performance", "qa"],
    deps: [],
  },
  {
    id: "accessibility-advocate",
    tags: ["accessibility", "wcag", "a11y", "inclusive design"],
    deps: [],
  },
  {
    id: "project-coordinator",
    tags: ["coordination", "workflow", "orchestration", "project management"],
    deps: [],
  },
  {
    id: "code-reviewer",
    tags: ["code review", "quality", "best practices", "automation"],
    deps: [],
  },
  {
    id: "hardhat-deployment-specialist",
    tags: ["ethereum", "hardhat", "deployment", "evm"],
    deps: [],
  },
  {
    id: "foundry-testing-expert",
    tags: ["foundry", "testing", "solidity", "fuzzing"],
    deps: [],
  },
  {
    id: "ethersjs-integration-architect",
    tags: ["ethers.js", "web3", "frontend", "typescript"],
    deps: ["frontend-fusion-engine"],
  },
  {
    id: "evm-security-auditor",
    tags: ["security", "solidity", "audit", "evm"],
    deps: [],
  },
  {
    id: "uniswap-v3-integration-specialist",
    tags: ["defi", "uniswap", "ethereum", "liquidity"],
    deps: ["ethersjs-integration-architect"],
  },
  {
    id: "aave-protocol-integrator",
    tags: ["defi", "aave", "lending", "flash loans"],
    deps: ["ethersjs-integration-architect"],
  },
  {
    id: "chainlink-oracle-specialist",
    tags: ["chainlink", "oracles", "vrf", "automation"],
    deps: [],
  },
  {
    id: "openzeppelin-patterns-expert",
    tags: ["openzeppelin", "solidity", "smart contracts", "security"],
    deps: [],
  },
  {
    id: "graph-protocol-indexer",
    tags: ["the graph", "indexing", "graphql", "blockchain"],
    deps: [],
  },
  {
    id: "erc-standards-implementer",
    tags: ["erc", "token standards", "solidity", "nft"],
    deps: ["openzeppelin-patterns-expert"],
  },
  {
    id: "layer2-optimism-specialist",
    tags: ["layer 2", "optimism", "base", "scaling"],
    deps: ["hardhat-deployment-specialist"],
  },
  {
    id: "layer2-arbitrum-specialist",
    tags: ["layer 2", "arbitrum", "stylus", "scaling"],
    deps: ["hardhat-deployment-specialist"],
  },
  {
    id: "gnosis-safe-integrator",
    tags: ["safe", "multisig", "security", "treasury"],
    deps: ["ethersjs-integration-architect"],
  },
  {
    id: "upgradeable-contracts-architect",
    tags: ["upgradeable", "proxy", "solidity", "openzeppelin"],
    deps: ["openzeppelin-patterns-expert"],
  },
  {
    id: "gas-optimization-specialist",
    tags: ["gas optimization", "evm", "solidity", "assembly"],
    deps: [],
  },
  {
    id: "devops-platform-engineer",
    tags: ["devops", "ci/cd", "kubernetes", "docker", "aws", "terraform"],
    deps: [],
  },
  {
    id: "api-design-architect",
    tags: ["api", "rest", "graphql", "trpc", "openapi", "architecture"],
    deps: ["typescript-precision-engineer"],
  },
  {
    id: "mobile-app-developer",
    tags: ["mobile", "react native", "expo", "ios", "android", "performance"],
    deps: ["frontend-fusion-engine", "web3-integration-maestro"],
  },
  {
    id: "data-engineering-specialist",
    tags: [
      "data engineering",
      "etl",
      "data warehouse",
      "airflow",
      "dbt",
      "analytics",
    ],
    deps: ["database-schema-oracle"],
  },
  {
    id: "security-engineer",
    tags: [
      "security",
      "penetration testing",
      "owasp",
      "cryptography",
      "vulnerability assessment",
    ],
    deps: [],
  },
  {
    id: "game-developer",
    tags: ["game development", "unity", "unreal engine", "web3 gaming", "nft"],
    deps: [],
  },
  {
    id: "backend-api-specialist",
    tags: ["backend", "api", "node.js", "python", "go", "database"],
    deps: ["database-schema-oracle", "api-contract-designer"],
  },
  {
    id: "ui-ux-designer",
    tags: [
      "ui/ux",
      "design systems",
      "accessibility",
      "figma",
      "responsive design",
    ],
    deps: ["frontend-fusion-engine"],
  },
  {
    id: "blockchain-indexer-specialist",
    tags: ["the graph", "indexing", "blockchain data", "analytics", "graphql"],
    deps: ["graph-protocol-indexer"],
  },
  {
    id: "cloud-architect",
    tags: [
      "cloud",
      "aws",
      "gcp",
      "azure",
      "infrastructure",
      "cost optimization",
    ],
    deps: [],
  },
  {
    id: "site-reliability-engineer",
    tags: [
      "sre",
      "kubernetes",
      "monitoring",
      "incident response",
      "disaster recovery",
      "observability",
    ],
    deps: ["devops-platform-engineer"],
  },
  {
    id: "platform-engineer",
    tags: [
      "platform engineering",
      "sdk development",
      "developer experience",
      "api design",
      "cli tools",
    ],
    deps: ["api-design-architect", "typescript-precision-engineer"],
  },
  {
    id: "solutions-architect",
    tags: [
      "solutions architecture",
      "enterprise",
      "system design",
      "risk management",
      "tokenomics",
    ],
    deps: ["smart-contract-forensics", "database-schema-oracle"],
  },
  {
    id: "technical-writer",
    tags: [
      "documentation",
      "technical writing",
      "api docs",
      "user guides",
      "specification writing",
    ],
    deps: ["api-design-architect"],
  },
  {
    id: "qa-automation-lead",
    tags: [
      "qa automation",
      "test strategy",
      "smart contract testing",
      "fuzzing",
      "quality assurance",
    ],
    deps: ["test-automation-engineer", "solana-guardian-auditor"],
  },
  {
    id: "performance-engineer",
    tags: [
      "performance",
      "optimization",
      "profiling",
      "benchmarking",
      "blockchain",
    ],
    deps: ["rust-systems-architect", "database-schema-oracle"],
  },
  {
    id: "blockchain-auditor",
    tags: [
      "security audit",
      "smart contracts",
      "vulnerability analysis",
      "fuzzing",
      "formal verification",
    ],
    deps: ["solana-guardian-auditor", "smart-contract-forensics"],
  },
  {
    id: "iot-developer",
    tags: [
      "iot",
      "embedded systems",
      "firmware",
      "blockchain",
      "hardware",
      "sensors",
    ],
    deps: ["rust-systems-architect"],
  },
  {
    id: "ar-vr-developer",
    tags: ["ar/vr", "3d graphics", "metaverse", "nft", "web3", "gaming"],
    deps: ["frontend-fusion-engine"],
  },
  {
    id: "machine-learning-engineer",
    tags: [
      "machine learning",
      "ai",
      "price prediction",
      "fraud detection",
      "data science",
    ],
    deps: ["data-scientist"],
  },
  {
    id: "data-engineer",
    tags: [
      "data engineering",
      "etl",
      "data warehouse",
      "real-time indexing",
      "analytics",
    ],
    deps: ["database-schema-oracle", "blockchain-indexer-specialist"],
  },
  {
    id: "infrastructure-architect",
    tags: [
      "infrastructure",
      "cloud architecture",
      "kubernetes",
      "terraform",
      "high availability",
    ],
    deps: ["devops-platform-engineer", "site-reliability-engineer"],
  },
  {
    id: "game-developer-web3",
    tags: [
      "game development",
      "p2e",
      "nft gaming",
      "tokenomics",
      "player psychology",
    ],
    deps: ["frontend-fusion-engine", "machine-learning-engineer"],
  },
  {
    id: "ui-ux-designer-web3",
    tags: [
      "ux/ui design",
      "user research",
      "interaction design",
      "web3",
      "accessibility",
    ],
    deps: [],
  },
  {
    id: "security-engineer-blockchain",
    tags: [
      "security",
      "threat modeling",
      "penetration testing",
      "devsecops",
      "risk management",
    ],
    deps: ["solana-guardian-auditor"],
  },
  {
    id: "quality-assurance-specialist",
    tags: [
      "qa",
      "testing",
      "quality assurance",
      "test management",
      "defect management",
    ],
    deps: ["qa-automation-lead"],
  },
  {
    id: "api-documentation-specialist",
    tags: ["documentation", "api", "openapi"],
    deps: [],
  },
  {
    id: "build-system-engineer",
    tags: ["build tools", "webpack", "vite"],
    deps: [],
  },
  {
    id: "bundler-optimizer",
    tags: ["optimization", "bundling", "performance"],
    deps: [],
  },
  {
    id: "ci-cd-architect",
    tags: ["ci/cd", "github actions", "deployment"],
    deps: ["ci-cd-pipeline-engineer", "mcp/mcp-github"],
  },
  {
    id: "code-example-generator",
    tags: ["documentation", "examples", "best practices"],
    deps: [],
  },
  {
    id: "defi-integration-architect",
    tags: ["defi", "blockchain", "integration"],
    deps: [
      "defi-integration",
      "aave-flashloan-patterns",
      "uniswap-v3-integration",
    ],
  },
  {
    id: "deployment-strategist",
    tags: ["deployment", "vercel", "docker"],
    deps: ["skill/docker-best-practices", "kubernetes-patterns"],
  },
  {
    id: "devtools-optimizer",
    tags: ["devtools", "debugging", "performance"],
    deps: ["debugging-techniques", "performance-profiling"],
  },
  {
    id: "e2e-testing-specialist",
    tags: ["testing", "e2e", "qa"],
    deps: ["mcp-playwright"],
  },
  {
    id: "integration-test-architect",
    tags: ["testing", "integration", "api"],
    deps: ["api-architecture-patterns"],
  },
  {
    id: "log-aggregation-expert",
    tags: ["logging", "monitoring", "debugging"],
    deps: ["monitoring-observability-advanced", "distributed-tracing"],
  },
  {
    id: "monitoring-specialist",
    tags: ["monitoring", "sentry", "observability"],
    deps: [
      "monitoring-observability-advanced",
      "observability-cost-optimization",
    ],
  },
  {
    id: "package-manager-expert",
    tags: ["npm", "package management", "monorepo"],
    deps: [],
  },
  {
    id: "smart-contract-auditor",
    tags: ["security", "solidity", "auditing"],
    deps: ["smart-contract-security", "evm-solidity-mastery"],
  },
  {
    id: "tutorial-creator",
    tags: ["documentation", "tutorials", "education"],
    deps: [],
  },
  {
    id: "unit-test-generator",
    tags: ["testing", "unit tests", "mocking"],
    deps: ["code-review-best-practices"],
  },
  {
    id: "web3-security-specialist",
    tags: ["security", "web3", "blockchain"],
    deps: ["smart-contract-security", "web3-wallet-integration"],
  },
  {
    id: "icm-analyst",
    tags: [
      "icm",
      "crypto",
      "trading",
      "research",
      "risk assessment",
      "solana",
      "due diligence",
    ],
    deps: [],
  },
  {
    id: "whale-tracker",
    tags: [
      "icm",
      "crypto",
      "trading",
      "whale tracking",
      "copy trading",
      "solana",
      "on-chain",
      "analytics",
    ],
    deps: [],
  },
  {
    id: "rug-detector",
    tags: [
      "icm",
      "crypto",
      "security",
      "rug detection",
      "safety",
      "protection",
      "solana",
      "defi",
    ],
    deps: ["icm-analyst"],
  },
  {
    id: "sentiment-analyzer",
    tags: [
      "icm",
      "crypto",
      "social",
      "sentiment",
      "community",
      "analytics",
      "twitter",
      "telegram",
      "discord",
    ],
    deps: [],
  },
  {
    id: "portfolio-manager",
    tags: [
      "icm",
      "portfolio",
      "trading",
      "risk management",
      "pnl",
      "performance",
    ],
    deps: [],
  },
  {
    id: "entry-optimizer",
    tags: [
      "icm",
      "entry",
      "timing",
      "technical analysis",
      "trading",
      "signals",
    ],
    deps: ["whale-tracker", "icm-analyst"],
  },
  {
    id: "exit-coordinator",
    tags: [
      "icm",
      "exit",
      "profit-taking",
      "stop loss",
      "trading",
      "risk management",
    ],
    deps: ["portfolio-manager", "whale-tracker", "rug-detector"],
  },
  {
    id: "risk-manager",
    tags: ["icm", "risk management", "position sizing", "portfolio", "trading"],
    deps: ["portfolio-manager"],
  },
  {
    id: "sniper-bot",
    tags: [
      "icm",
      "sniper",
      "launch detection",
      "fast entry",
      "trading",
      "automation",
    ],
    deps: ["rug-detector"],
  },
  {
    id: "liquidity-analyzer",
    tags: [
      "icm",
      "liquidity",
      "order book",
      "slippage",
      "market depth",
      "trading",
    ],
    deps: [],
  },
  {
    id: "smart-money-copier",
    tags: [
      "icm",
      "copy trading",
      "whale tracking",
      "smart money",
      "automation",
      "trading",
    ],
    deps: ["whale-tracker", "portfolio-manager"],
  },
  {
    id: "chart-pattern-detector",
    tags: [
      "icm",
      "technical analysis",
      "chart patterns",
      "trading",
      "price action",
      "indicators",
    ],
    deps: [],
  },
  {
    id: "news-monitor",
    tags: ["icm", "news", "announcements", "monitoring", "alerts", "events"],
    deps: [],
  },
  {
    id: "multi-chain-scanner",
    tags: [
      "icm",
      "multi-chain",
      "scanner",
      "cross-chain",
      "opportunities",
      "trading",
    ],
    deps: [],
  },
  {
    id: "arbitrage-finder",
    tags: ["icm", "arbitrage", "dex", "cross-chain", "trading", "profit"],
    deps: [],
  },
  {
    id: "airdrop-hunter",
    tags: ["airdrop", "farming", "free money", "opportunities", "crypto"],
    deps: [],
  },
  {
    id: "influencer-tracker",
    tags: ["icm", "influencer", "calls", "tracking", "social", "trading"],
    deps: [],
  },
];

const rules = {
  solana: ["solana-anchor-mastery"],
  anchor: ["solana-anchor-mastery"],
  frontend: ["nextjs-app-router-patterns"],
  react: ["nextjs-app-router-patterns"],
  "next.js": ["nextjs-app-router-patterns"],
  "react native": ["nextjs-app-router-patterns"],
  evm: ["evm-solidity-mastery"],
  solidity: ["evm-solidity-mastery"],
  ethereum: ["evm-solidity-mastery"],
  database: ["sql-optimization"],
  sql: ["sql-optimization"],
  postgres: ["sql-optimization"],
  postgresql: ["sql-optimization"],
  testing: ["foundry-fuzzing-techniques"],
  test: ["foundry-fuzzing-techniques"],
  security: ["smart-contract-security"],
  audit: ["smart-contract-security"],
  typescript: ["typescript-precision-engineer"],
  rust: ["rust-systems-architect"],
};

const updates = [];

agents.forEach((agent) => {
  const newDeps = new Set(agent.deps);
  let changed = false;

  agent.tags.forEach((tag) => {
    const matchingDeps = rules[tag.toLowerCase()];
    if (matchingDeps) {
      matchingDeps.forEach((dep) => {
        if (!newDeps.has(dep) && dep !== agent.id) {
          newDeps.add(dep);
          changed = true;
        }
      });
    }
  });

  if (changed) {
    updates.push({
      id: agent.id,
      oldDeps: agent.deps,
      newDeps: Array.from(newDeps),
      tags: agent.tags,
    });
  }
});

console.log(JSON.stringify(updates, null, 2));
