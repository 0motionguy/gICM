import type { RegistryItem } from "@/types/registry";

/**
 * Workflow definitions for orchestrated multi-agent tasks
 * These are executable workflows that coordinate multiple agents/commands/skills
 */

export const WORKFLOWS: RegistryItem[] = [
  // === CONVERTED FROM WORKFLOW_TEMPLATES.md ===

  {
    id: "solana-defi-protocol-launch",
    kind: "workflow",
    name: "Solana DeFi Protocol Launch",
    slug: "solana-defi-protocol-launch",
    description:
      "Complete workflow for building production DeFi protocols on Solana (AMM, lending, yield aggregator). 2-4 weeks vs 8-12 weeks traditional.",
    longDescription:
      "End-to-end workflow for launching DeFi protocols on Solana. Coordinates protocol design, smart contract development, security auditing, frontend integration, and deployment. Includes AMM mechanics, liquidity pools, token economics, and comprehensive testing.",
    category: "Orchestration & Automation",
    tags: ["Solana", "DeFi", "Smart Contracts", "AMM", "Production", "Workflow"],
    install: "npx @gicm/cli add workflow/solana-defi-protocol-launch",
    orchestrationPattern: "sequential",
    triggerPhrase: "/launch-defi-protocol",
    estimatedTime: "2-4 weeks",
    timeSavings: 70, // 70% time savings vs manual
    requiredAgents: [
      "icm-anchor-architect",
      "defi-integration-architect",
      "solana-guardian-auditor",
      "foundry-testing-expert",
      "gas-optimization-specialist",
      "smart-contract-auditor",
      "frontend-fusion-engine",
    ],
    requiredCommands: ["anchor-init", "deploy-foundry", "security-audit"],
    requiredSkills: ["solana-anchor-mastery", "defi-integration"],
    steps: [
      {
        name: "Design protocol architecture",
        description: "Design program architecture, state schemas, instruction handlers",
        agent: "icm-anchor-architect",
        skill: "solana-anchor-mastery",
      },
      {
        name: "Design token economics",
        description: "Design AMM mechanics, fees, LP tokens, and incentive structures",
        agent: "defi-integration-architect",
      },
      {
        name: "Security review of design",
        description: "Review design for economic exploits and attack vectors",
        agent: "smart-contract-auditor",
      },
      {
        name: "Initialize Anchor project",
        command: "anchor-init",
      },
      {
        name: "Implement core program logic",
        description: "Write swap instructions, state management, PDA derivations",
        agent: "icm-anchor-architect",
      },
      {
        name: "Write comprehensive tests",
        description: "Create fuzz tests, edge case tests, MEV attack simulations",
        agent: "foundry-testing-expert",
      },
      {
        name: "Optimize compute units",
        description: "Reduce compute units for swap instruction, target <50k CU",
        agent: "gas-optimization-specialist",
      },
      {
        name: "Run security audit",
        description: "Audit for PDA bugs, signer checks, reentrancy, overflow",
        agent: "solana-guardian-auditor",
        command: "security-audit",
      },
      {
        name: "Build frontend interface",
        description: "Create swap UI with wallet integration and real-time pricing",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Deploy to devnet",
        command: "deploy-foundry",
        condition: "tests_passed === true && audit_clean === true",
      },
      {
        name: "Deploy to mainnet",
        command: "deploy-foundry",
        condition: "devnet_success === true",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  {
    id: "nft-marketplace-deploy",
    kind: "workflow",
    name: "NFT Marketplace Launch",
    slug: "nft-marketplace-deploy",
    description:
      "Launch a full-featured NFT marketplace on Solana. Includes Candy Machine, cNFTs, marketplace logic, frontend, and indexing. 4-6 weeks total.",
    longDescription:
      "Complete NFT marketplace workflow: Candy Machine V3 setup, compressed NFT minting, marketplace program with listings/offers, Next.js frontend with wallet integration, indexing with The Graph, and Helius webhooks for real-time updates.",
    category: "Orchestration & Automation",
    tags: ["Solana", "NFT", "Marketplace", "Metaplex", "cNFT", "Workflow"],
    install: "npx @gicm/cli add workflow/nft-marketplace-deploy",
    orchestrationPattern: "sequential",
    triggerPhrase: "/launch-nft-marketplace",
    estimatedTime: "4-6 weeks",
    timeSavings: 65,
    requiredAgents: [
      "icm-anchor-architect",
      "erc-standards-implementer",
      "foundry-testing-expert",
      "gas-optimization-specialist",
      "solana-guardian-auditor",
      "frontend-fusion-engine",
      "graph-protocol-indexer",
      "blockchain-indexer-specialist",
      "database-schema-oracle",
    ],
    requiredCommands: ["anchor-init", "deploy-foundry", "create-subgraph"],
    requiredSkills: ["nft-metadata-standards", "solana-anchor-mastery"],
    steps: [
      {
        name: "Setup Candy Machine V3",
        description: "Integrate Candy Machine with allowlist, merkle proofs, Dutch auction",
        agent: "icm-anchor-architect",
      },
      {
        name: "Implement cNFT minting",
        description: "Setup compressed NFT minting using Bubblegum and state compression",
        agent: "icm-anchor-architect",
        skill: "nft-metadata-standards",
      },
      {
        name: "Create marketplace program",
        description: "Build listing, buying, offer, and royalty distribution logic",
        agent: "icm-anchor-architect",
      },
      {
        name: "Optimize marketplace instructions",
        description: "Reduce listing instruction to under 30k compute units",
        agent: "gas-optimization-specialist",
      },
      {
        name: "Security audit marketplace",
        description: "Audit for front-running, price manipulation, and royalty bypass",
        agent: "solana-guardian-auditor",
        command: "security-audit",
      },
      {
        name: "Build NFT marketplace UI",
        description: "Create Next.js UI with virtualized grid, wallet integration, auctions",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Optimize frontend performance",
        description: "Achieve LCP < 2.5s, lazy load images, code split by route",
        agent: "performance-profiler",
      },
      {
        name: "Create subgraph for indexing",
        description: "Index listings, sales, offers, transfers, and metadata",
        agent: "graph-protocol-indexer",
        command: "create-subgraph",
      },
      {
        name: "Setup analytics database",
        description: "Design Postgres schema for NFT analytics with partitioning",
        agent: "database-schema-oracle",
      },
      {
        name: "Deploy to mainnet",
        command: "deploy-foundry",
        condition: "audit_clean === true && tests_passed === true",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  {
    id: "web3-saas-api-launch",
    kind: "workflow",
    name: "Web3 SaaS API Launch",
    slug: "web3-saas-api-launch",
    description:
      "Launch a Web3-powered SaaS API platform. Wallet auth, crypto payments, subscription tiers, analytics dashboard. 3-5 weeks total.",
    longDescription:
      "Full-stack Web3 SaaS workflow: REST/GraphQL API design, wallet-based authentication, USDC/SOL payment integration, subscription tier management, rate limiting, usage analytics dashboard, and deployment infrastructure.",
    category: "Orchestration & Automation",
    tags: ["SaaS", "API", "Web3", "Authentication", "Payments", "Workflow"],
    install: "npx @gicm/cli add workflow/web3-saas-api-launch",
    orchestrationPattern: "sequential",
    triggerPhrase: "/launch-web3-saas",
    estimatedTime: "3-5 weeks",
    timeSavings: 60,
    requiredAgents: [
      "api-design-architect",
      "backend-api-specialist",
      "database-schema-oracle",
      "security-engineer",
      "frontend-fusion-engine",
      "fullstack-orchestrator",
      "devops-platform-engineer",
    ],
    requiredCommands: ["api-gen", "schema-gen", "deploy-kubernetes"],
    requiredSkills: ["api-architecture-patterns", "auth-implementation"],
    steps: [
      {
        name: "Design REST API",
        description: "Design API endpoints with rate limiting, authentication, and versioning",
        agent: "api-design-architect",
        command: "api-gen",
      },
      {
        name: "Design database schema",
        description: "Create Postgres schema for users, subscriptions, API keys, usage logs",
        agent: "database-schema-oracle",
        command: "schema-gen",
      },
      {
        name: "Implement API backend",
        description: "Build Node.js API with Express, TypeScript, Zod validation",
        agent: "backend-api-specialist",
      },
      {
        name: "Implement wallet authentication",
        description: "Add wallet signature auth with nonce, expiry, and session management",
        agent: "security-engineer",
        skill: "auth-implementation",
      },
      {
        name: "Add crypto payment integration",
        description: "Integrate Stripe for fiat and USDC/SOL for crypto payments",
        agent: "backend-api-specialist",
      },
      {
        name: "Implement subscription tiers",
        description: "Create free/pro/enterprise tiers with feature gating and usage limits",
        agent: "fullstack-orchestrator",
      },
      {
        name: "Build analytics dashboard",
        description: "Create Next.js dashboard for usage metrics, billing, API key management",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Setup monitoring and logging",
        description: "Configure Datadog, Sentry for error tracking and performance monitoring",
        agent: "monitoring-specialist",
        command: "monitoring-setup",
      },
      {
        name: "Deploy to production",
        description: "Deploy API and dashboard to AWS with auto-scaling and CDN",
        agent: "devops-platform-engineer",
        command: "deploy-kubernetes",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  // === NEW HIGH-VALUE WORKFLOWS ===

  {
    id: "solana-token-launch",
    kind: "workflow",
    name: "Solana Token Launch",
    slug: "solana-token-launch",
    description:
      "Launch a token on Solana with bonding curve, liquidity pool, and instant trading. 2-3 days vs 2-3 weeks manual.",
    longDescription:
      "Rapid token launch workflow: SPL token creation, bonding curve implementation (ICM Motion style), automatic LP provisioning, frontend launchpad, security audit, and mainnet deployment. Includes fee routing and anti-rug mechanisms.",
    category: "Orchestration & Automation",
    tags: ["Solana", "Token", "Launch", "Bonding Curve", "DeFi", "Workflow"],
    install: "npx @gicm/cli add workflow/solana-token-launch",
    orchestrationPattern: "sequential",
    triggerPhrase: "/launch-token",
    estimatedTime: "2-3 days",
    timeSavings: 80,
    requiredAgents: [
      "icm-anchor-architect",
      "solana-guardian-auditor",
      "frontend-fusion-engine",
    ],
    requiredCommands: ["anchor-init", "deploy-foundry"],
    requiredSkills: ["solana-anchor-mastery"],
    steps: [
      {
        name: "Design bonding curve",
        description: "Design constant product/linear/exponential curve with overflow protection",
        agent: "icm-anchor-architect",
      },
      {
        name: "Create SPL token",
        description: "Initialize SPL token with metadata, freeze authority, and mint",
        agent: "icm-anchor-architect",
      },
      {
        name: "Implement bonding curve program",
        description: "Write buy/sell instructions with slippage protection and fee routing",
        agent: "icm-anchor-architect",
      },
      {
        name: "Security audit",
        description: "Audit for overflow, reentrancy, and economic exploits",
        agent: "solana-guardian-auditor",
        command: "security-audit",
      },
      {
        name: "Build launchpad UI",
        description: "Create trading interface with real-time pricing and charts",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Deploy to mainnet",
        command: "deploy-foundry",
        condition: "audit_clean === true",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  {
    id: "security-audit-pipeline",
    kind: "workflow",
    name: "Security Audit Pipeline",
    slug: "security-audit-pipeline",
    description:
      "Comprehensive security audit workflow. SAST, dependency scan, secrets scan, manual review, and report generation. 1-2 hours vs 1-2 days manual.",
    longDescription:
      "Automated security pipeline: Static analysis (Slither, Mythril), dependency vulnerability scanning, secrets detection, SQL injection testing, XSS scanning, manual expert review, and comprehensive security report with CVSS scores.",
    category: "Orchestration & Automation",
    tags: ["Security", "Audit", "Testing", "SAST", "Vulnerability", "Workflow"],
    install: "npx @gicm/cli add workflow/security-audit-pipeline",
    orchestrationPattern: "hybrid", // Parallel scans, then sequential review
    triggerPhrase: "/security-full-audit",
    estimatedTime: "1-2 hours",
    timeSavings: 85,
    requiredAgents: ["smart-contract-auditor", "security-engineer", "evm-security-auditor"],
    requiredCommands: [
      "security-audit",
      "secrets-scan",
      "sql-injection-scan",
      "xss-scan",
      "idor-scan",
    ],
    steps: [
      {
        name: "Run static analysis",
        command: "security-audit",
        parallel: true,
      },
      {
        name: "Scan for secrets",
        command: "secrets-scan",
        parallel: true,
      },
      {
        name: "SQL injection scan",
        command: "sql-injection-scan",
        parallel: true,
      },
      {
        name: "XSS vulnerability scan",
        command: "xss-scan",
        parallel: true,
      },
      {
        name: "IDOR vulnerability scan",
        command: "idor-scan",
        parallel: true,
      },
      {
        name: "Manual security review",
        description: "Expert review of findings with risk assessment",
        agent: "smart-contract-auditor",
      },
      {
        name: "Generate security report",
        description: "Create comprehensive report with CVSS scores and remediation steps",
        agent: "security-engineer",
        command: "doc-generate",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  {
    id: "deploy-with-tests",
    kind: "workflow",
    name: "Deploy with Tests",
    slug: "deploy-with-tests",
    description:
      "Safe deployment workflow with automated testing, security checks, and rollback. Prevents bad deployments. 30 mins vs 2-3 hours manual.",
    longDescription:
      "Production-safe deployment pipeline: Test suite execution with coverage check, security scanning, deploy to testnet, verification, smoke tests, conditional mainnet promotion, and automatic rollback on failure.",
    category: "Orchestration & Automation",
    tags: ["Deployment", "Testing", "CI/CD", "Safety", "Workflow"],
    install: "npx @gicm/cli add workflow/deploy-with-tests",
    orchestrationPattern: "conditional",
    triggerPhrase: "/deploy-safe",
    estimatedTime: "30 minutes",
    timeSavings: 75,
    requiredAgents: ["test-automation-engineer", "devops-platform-engineer"],
    requiredCommands: [
      "test-coverage",
      "security-audit",
      "deploy-foundry",
      "verify-contract",
    ],
    steps: [
      {
        name: "Run test suite",
        command: "test-coverage",
        condition: "coverage >= 80%",
      },
      {
        name: "Security scan",
        command: "security-audit",
        condition: "no critical issues",
      },
      {
        name: "Deploy to testnet",
        command: "deploy-foundry",
      },
      {
        name: "Verify deployment",
        command: "verify-contract",
      },
      {
        name: "Run smoke tests",
        description: "Execute critical path tests on testnet deployment",
        agent: "test-automation-engineer",
        condition: "testnet_deploy_success === true",
      },
      {
        name: "Promote to mainnet",
        command: "deploy-foundry",
        condition: "testnet_success === true && smoke_tests_passed === true",
        onError: "fail",
      },
      {
        name: "Rollback on failure",
        description: "Automatically rollback if mainnet deployment fails",
        command: "deploy-rollback",
        condition: "mainnet_deploy_failed === true",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  {
    id: "full-stack-feature-builder",
    kind: "workflow",
    name: "Full-Stack Feature Builder",
    slug: "full-stack-feature-builder",
    description:
      "Build complete features from database to UI. Schema, API, frontend, tests, deployment. 4-6 hours vs 2-3 days manual.",
    longDescription:
      "End-to-end feature development workflow: Database schema design, API endpoint generation, frontend component creation, integration tests, E2E tests, and deployment. Coordinates backend, frontend, and DevOps specialists.",
    category: "Orchestration & Automation",
    tags: ["Full-Stack", "Feature", "Development", "API", "Frontend", "Workflow"],
    install: "npx @gicm/cli add workflow/full-stack-feature-builder",
    orchestrationPattern: "sequential",
    triggerPhrase: "/full-stack-feature",
    estimatedTime: "4-6 hours",
    timeSavings: 70,
    requiredAgents: [
      "database-schema-oracle",
      "api-design-architect",
      "backend-api-specialist",
      "frontend-fusion-engine",
      "test-automation-engineer",
    ],
    requiredCommands: ["schema-gen", "api-gen", "component-gen", "test-gen"],
    steps: [
      {
        name: "Design database schema",
        description: "Create tables, indexes, and relationships for feature",
        agent: "database-schema-oracle",
        command: "schema-gen",
      },
      {
        name: "Generate API endpoints",
        description: "Create RESTful endpoints with validation and error handling",
        agent: "api-design-architect",
        command: "api-gen",
      },
      {
        name: "Implement backend logic",
        description: "Write business logic, data access layer, and middleware",
        agent: "backend-api-specialist",
      },
      {
        name: "Build frontend components",
        description: "Create React components with state management and styling",
        agent: "frontend-fusion-engine",
        command: "component-gen",
      },
      {
        name: "Write unit tests",
        description: "Generate unit tests for backend and frontend",
        agent: "test-automation-engineer",
        command: "test-gen",
      },
      {
        name: "Write E2E tests",
        description: "Create Playwright tests for user flows",
        agent: "e2e-testing-specialist",
      },
      {
        name: "Deploy feature",
        command: "deploy-prepare-release",
        condition: "tests_passed === true",
      },
    ],
    installs: 0,
    remixes: 0,
  },

  {
    id: "tdd-workflow",
    kind: "workflow",
    name: "TDD Development Workflow",
    slug: "tdd-workflow",
    description:
      "Test-Driven Development loop automation. Red → Green → Refactor cycle with AI assistance. Improves code quality by 3x.",
    longDescription:
      "Automated TDD workflow: Write failing tests, implement feature to pass tests, refactor code, verify tests still pass. Repeats until feature complete. Ensures high test coverage and maintainable code.",
    category: "Orchestration & Automation",
    tags: ["TDD", "Testing", "Quality", "Development", "Workflow"],
    install: "npx @gicm/cli add workflow/tdd-workflow",
    orchestrationPattern: "hybrid", // Sequential loop with conditional exit
    triggerPhrase: "/tdd-develop",
    estimatedTime: "Varies by feature",
    timeSavings: 50,
    requiredAgents: [
      "test-automation-engineer",
      "fullstack-orchestrator",
      "typescript-precision-engineer",
    ],
    requiredCommands: ["test-gen", "test-coverage"],
    steps: [
      {
        name: "Write failing test (Red)",
        description: "Create test case that captures feature requirement",
        agent: "test-automation-engineer",
        command: "test-gen",
      },
      {
        name: "Run tests (should fail)",
        command: "test-coverage",
        condition: "test_should_fail === true",
      },
      {
        name: "Implement feature (Green)",
        description: "Write minimal code to make test pass",
        agent: "fullstack-orchestrator",
      },
      {
        name: "Run tests (should pass)",
        command: "test-coverage",
        condition: "implementation_complete === true",
      },
      {
        name: "Refactor code",
        description: "Improve code quality while maintaining passing tests",
        agent: "typescript-precision-engineer",
      },
      {
        name: "Verify tests still pass",
        command: "test-coverage",
      },
      {
        name: "Repeat if feature incomplete",
        description: "Loop back to Red phase if more functionality needed",
        condition: "feature_complete === false",
        onError: "continue",
      },
    ],
    installs: 0,
    remixes: 0,
  },
];
