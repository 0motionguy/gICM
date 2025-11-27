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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
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
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  // === TIER 1: CORE DEVELOPMENT LIFECYCLE ===

  {
    id: "full-stack-solana-feature",
    kind: "workflow",
    name: "Full-Stack Solana Feature",
    slug: "full-stack-solana-feature",
    description:
      "4-phase orchestration for complete Solana features: Architecture → Parallel Build → Integration → Deploy. 6-8 hours → 45 minutes.",
    longDescription:
      "Professional Solana feature workflow with 4-phase orchestration: Phase 1 (Architecture) - Anchor program design, API design, frontend architecture. Phase 2 (Parallel Build) - Program, API, and UI built simultaneously. Phase 3 (Integration) - Integration testing + security audit + E2E validation. Phase 4 (Deployment) - Devnet → Testnet → Mainnet with monitoring.",
    category: "Orchestration & Automation",
    tags: ["Solana", "Full-Stack", "Architecture", "Multi-Agent", "Production", "Workflow"],
    install: "npx @gicm/cli add workflow/full-stack-solana-feature",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential → Sequential
    triggerPhrase: "/full-stack-solana",
    estimatedTime: "45 minutes",
    timeSavings: 87,
    requiredAgents: [
      "icm-anchor-architect",
      "backend-api-specialist",
      "web3-integration-maestro",
      "solana-guardian-auditor",
      "e2e-testing-specialist",
      "deployment-strategist",
      "monitoring-specialist",
      "performance-profiler",
    ],
    requiredCommands: ["anchor-init", "api-gen", "component-gen", "test-e2e-setup", "deploy-foundry", "monitoring-setup"],
    steps: [
      {
        name: "Phase 1: Design Anchor program architecture",
        description: "Design program accounts, instructions, PDAs, and state management",
        agent: "icm-anchor-architect",
        parallel: false,
      },
      {
        name: "Phase 1: Design REST API architecture",
        description: "Design API endpoints, validation schemas, rate limiting",
        agent: "backend-api-specialist",
        command: "api-gen",
        parallel: false,
      },
      {
        name: "Phase 1: Design frontend component hierarchy",
        description: "Design React component structure, wallet integration, state management",
        agent: "web3-integration-maestro",
        parallel: false,
      },
      {
        name: "Phase 2: Build Anchor program (parallel)",
        description: "Implement program instructions and state management",
        agent: "icm-anchor-architect",
        command: "anchor-init",
        parallel: true,
      },
      {
        name: "Phase 2: Build API backend (parallel)",
        description: "Implement REST API with TypeScript + Zod validation",
        agent: "backend-api-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Build frontend UI (parallel)",
        description: "Implement Next.js UI with wallet integration",
        agent: "web3-integration-maestro",
        command: "component-gen",
        parallel: true,
      },
      {
        name: "Phase 3: Integration testing",
        description: "Validate program-API-frontend integration",
        agent: "e2e-testing-specialist",
        command: "test-e2e-setup",
      },
      {
        name: "Phase 3: Security audit",
        description: "Audit program for PDA bugs, signer checks, reentrancy",
        agent: "solana-guardian-auditor",
        command: "security-audit",
      },
      {
        name: "Phase 3: E2E workflow validation",
        description: "Test complete user flows end-to-end",
        agent: "e2e-testing-specialist",
      },
      {
        name: "Phase 4: Deploy to devnet/testnet/mainnet",
        description: "Staged deployment with validation gates",
        agent: "deployment-strategist",
        command: "deploy-foundry",
        condition: "audit_clean === true && tests_passed === true",
      },
      {
        name: "Phase 4: Setup monitoring",
        description: "Configure program logs, API metrics, error tracking",
        agent: "monitoring-specialist",
        command: "monitoring-setup",
      },
      {
        name: "Phase 4: Performance optimization",
        description: "Optimize compute units, API latency, frontend loading",
        agent: "performance-profiler",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "security-complete-audit",
    kind: "workflow",
    name: "Complete Security Audit",
    slug: "security-complete-audit",
    description:
      "Comprehensive security audit: SAST + dependency scan + manual review + economic analysis. 12-16 hours → 2 hours.",
    longDescription:
      "Professional security audit workflow with parallel scanning and sequential review. Phase 1: Parallel execution of SAST (Slither/Mythril), dependency auditing, code review, economic security analysis, and access control validation. Phase 2: Consolidate findings, prioritize by severity (CVSS), create remediation plan, and verify fixes.",
    category: "Orchestration & Automation",
    tags: ["Security", "Audit", "SAST", "Vulnerability", "Testing", "Workflow"],
    install: "npx @gicm/cli add workflow/security-complete-audit",
    orchestrationPattern: "hybrid", // Parallel → Sequential
    triggerPhrase: "/security-complete-audit",
    estimatedTime: "2 hours",
    timeSavings: 87,
    requiredAgents: [
      "evm-security-auditor",
      "solana-guardian-auditor",
      "web3-security-specialist",
      "smart-contract-auditor",
      "security-engineer",
    ],
    requiredCommands: ["security-audit", "security-dependency-audit", "secrets-scan", "idor-scan", "sql-injection-scan", "xss-scan"],
    steps: [
      {
        name: "Phase 1: SAST scanning (parallel)",
        description: "Run Slither/Mythril (EVM) or Anchor security checks (Solana)",
        command: "security-audit",
        parallel: true,
      },
      {
        name: "Phase 1: Dependency audit (parallel)",
        description: "Check for vulnerable dependencies and outdated packages",
        command: "security-dependency-audit",
        parallel: true,
      },
      {
        name: "Phase 1: Manual code review (parallel)",
        description: "Expert review for logic bugs, business logic flaws",
        agent: "smart-contract-auditor",
        parallel: true,
      },
      {
        name: "Phase 1: Economic security analysis (parallel)",
        description: "Analyze MEV risks, oracle attacks, price manipulation vectors",
        agent: "web3-security-specialist",
        parallel: true,
      },
      {
        name: "Phase 1: Access control audit (parallel)",
        description: "Review roles, admin keys, multisig configurations",
        agent: "security-engineer",
        parallel: true,
      },
      {
        name: "Phase 2: Consolidate findings",
        description: "Merge all findings, remove duplicates, assess severity",
        agent: "smart-contract-auditor",
      },
      {
        name: "Phase 2: Prioritize by CVSS score",
        description: "Assign CVSS scores (Critical/High/Medium/Low) and calculate risk",
        agent: "security-engineer",
      },
      {
        name: "Phase 2: Create remediation plan",
        description: "Design fix strategy with timeline and testing requirements",
        agent: "security-engineer",
      },
      {
        name: "Phase 2: Verification testing",
        description: "Re-test after fixes to confirm vulnerabilities resolved",
        agent: "smart-contract-auditor",
        command: "security-audit",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "test-pyramid-build",
    kind: "workflow",
    name: "Test Pyramid Builder",
    slug: "test-pyramid-build",
    description:
      "Build complete test pyramid: Unit + Integration + E2E + Fuzz tests with coverage analysis. 8-10 hours → 1.5 hours.",
    longDescription:
      "Comprehensive testing workflow following test pyramid best practices. Phase 1: Parallel generation of unit tests, integration tests, E2E tests, and fuzz tests. Phase 2: Execute test suite, generate coverage report, identify gaps, and enhance tests until threshold met (80%+).",
    category: "Orchestration & Automation",
    tags: ["Testing", "QA", "Unit Tests", "E2E", "Coverage", "Workflow"],
    install: "npx @gicm/cli add workflow/test-pyramid-build",
    orchestrationPattern: "hybrid", // Parallel → Sequential
    triggerPhrase: "/build-test-pyramid",
    estimatedTime: "1.5 hours",
    timeSavings: 85,
    requiredAgents: [
      "unit-test-generator",
      "integration-test-architect",
      "e2e-testing-specialist",
      "foundry-testing-expert",
      "test-automation-engineer",
    ],
    requiredCommands: ["test-gen", "test-write-tests", "test-e2e-setup", "test-coverage-report", "test-coverage"],
    steps: [
      {
        name: "Phase 1: Generate unit tests (parallel)",
        description: "Create unit tests for all functions with mocking",
        agent: "unit-test-generator",
        command: "test-gen",
        parallel: true,
      },
      {
        name: "Phase 1: Design integration tests (parallel)",
        description: "Design contract/program interaction tests",
        agent: "integration-test-architect",
        parallel: true,
      },
      {
        name: "Phase 1: Design E2E tests (parallel)",
        description: "Design full user flow tests with Playwright",
        agent: "e2e-testing-specialist",
        command: "test-e2e-setup",
        parallel: true,
      },
      {
        name: "Phase 1: Create fuzz tests (parallel)",
        description: "Generate property-based fuzz tests for edge cases",
        agent: "foundry-testing-expert",
        parallel: true,
      },
      {
        name: "Phase 2: Execute test suite",
        description: "Run all tests and generate coverage report",
        command: "test-coverage-report",
      },
      {
        name: "Phase 2: Analyze coverage gaps",
        description: "Identify untested code paths and critical functions",
        agent: "test-automation-engineer",
        command: "test-coverage",
      },
      {
        name: "Phase 2: Enhance test coverage",
        description: "Fill coverage gaps until 80%+ threshold met",
        agent: "unit-test-generator",
        command: "test-write-tests",
        condition: "coverage < 80%",
      },
      {
        name: "Phase 2: Verify critical paths",
        description: "Ensure all critical business logic has 100% coverage",
        agent: "test-automation-engineer",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "staged-deployment-pipeline",
    kind: "workflow",
    name: "Staged Deployment Pipeline",
    slug: "staged-deployment-pipeline",
    description:
      "Production-safe staged deployment: Devnet → Testnet → Mainnet with validation gates and rollback. 4-6 hours → 1 hour.",
    longDescription:
      "Enterprise deployment workflow with sequential staging and validation gates. Phase 1: Prepare release (checklist, configs, backups). Phase 2: Deploy to devnet + smoke tests. Phase 3: Deploy to testnet + integration tests. Phase 4: Deploy to mainnet with gradual rollout + monitoring + alerts.",
    category: "Orchestration & Automation",
    tags: ["Deployment", "CI/CD", "Production", "DevOps", "Safety", "Workflow"],
    install: "npx @gicm/cli add workflow/staged-deployment-pipeline",
    orchestrationPattern: "sequential", // Sequential with gates
    triggerPhrase: "/staged-deploy",
    estimatedTime: "1 hour",
    timeSavings: 83,
    requiredAgents: [
      "deployment-strategist",
      "hardhat-deployment-specialist",
      "monitoring-specialist",
      "ci-cd-architect",
      "test-automation-engineer",
    ],
    requiredCommands: ["deploy-hardhat", "deploy-foundry", "verify-contract", "snapshot-state", "deploy-prepare-release", "monitoring-setup"],
    steps: [
      {
        name: "Phase 1: Create deployment checklist",
        description: "Generate pre-flight checklist for production deployment",
        agent: "ci-cd-architect",
        command: "deploy-prepare-release",
      },
      {
        name: "Phase 1: Prepare environment configs",
        description: "Configure network settings, RPC URLs, gas prices",
        agent: "deployment-strategist",
      },
      {
        name: "Phase 1: Snapshot current state",
        description: "Backup current contract state for rollback capability",
        command: "snapshot-state",
      },
      {
        name: "Phase 1: Final security scan",
        description: "Last security check before deployment",
        agent: "smart-contract-auditor",
        command: "security-audit",
      },
      {
        name: "Phase 2: Deploy to devnet",
        description: "Deploy contracts/programs to devnet",
        command: "deploy-foundry",
      },
      {
        name: "Phase 2: Smoke tests on devnet",
        description: "Basic functionality tests to verify deployment",
        agent: "test-automation-engineer",
      },
      {
        name: "Phase 2: Gate 1 - Pass/Fail decision",
        description: "Validate devnet deployment before proceeding",
        condition: "devnet_tests_passed === true",
      },
      {
        name: "Phase 3: Deploy to testnet",
        description: "Deploy to testnet with verified bytecode",
        command: "deploy-hardhat",
      },
      {
        name: "Phase 3: Verify contracts on explorer",
        description: "Submit source code for verification",
        command: "verify-contract",
      },
      {
        name: "Phase 3: Full integration tests on testnet",
        description: "Execute complete integration test suite",
        agent: "integration-test-architect",
      },
      {
        name: "Phase 3: Gate 2 - Pass/Fail decision",
        description: "Validate testnet deployment before mainnet",
        condition: "testnet_tests_passed === true",
      },
      {
        name: "Phase 4: Deploy to mainnet (small allocation)",
        description: "Initial mainnet deployment with limited exposure",
        command: "deploy-foundry",
      },
      {
        name: "Phase 4: Setup monitoring and alerts",
        description: "Configure real-time monitoring, alerts, dashboards",
        agent: "monitoring-specialist",
        command: "monitoring-setup",
      },
      {
        name: "Phase 4: Gradual rollout",
        description: "Scale allocation over 24-48 hours monitoring for issues",
        agent: "deployment-strategist",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  // === TIER 2: ECOSYSTEM EXPANSION ===

  {
    id: "evm-dapp-complete",
    kind: "workflow",
    name: "Complete EVM dApp Launch",
    slug: "evm-dapp-complete",
    description:
      "Full-stack EVM dApp: Hardhat contracts + Subgraph indexing + Web3 frontend. 8-10 hours → 1 hour.",
    longDescription:
      "Complete EVM dApp workflow: Phase 1 - Smart contract architecture + subgraph schema + frontend design. Phase 2 - Parallel contract development, subgraph creation, backend API, and frontend UI. Phase 3 - Integration testing + security audit (Slither/Mythril) + gas optimization. Phase 4 - Deploy contracts + verify on Etherscan + deploy subgraph + setup monitoring.",
    category: "Orchestration & Automation",
    tags: ["EVM", "Ethereum", "DApp", "Subgraph", "Full-Stack", "Workflow"],
    install: "npx @gicm/cli add workflow/evm-dapp-complete",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential → Sequential
    triggerPhrase: "/evm-dapp-launch",
    estimatedTime: "1 hour",
    timeSavings: 90,
    requiredAgents: [
      "smart-contract-auditor",
      "graph-protocol-indexer",
      "ethersjs-integration-architect",
      "evm-security-auditor",
      "gas-optimization-specialist",
      "hardhat-deployment-specialist",
    ],
    requiredCommands: ["deploy-hardhat", "verify-contract", "create-subgraph", "generate-abi", "security-audit", "gas-report"],
    steps: [
      {
        name: "Phase 1: Design contract architecture",
        description: "Design upgradeable/non-upgradeable contract structure",
        agent: "smart-contract-auditor",
      },
      {
        name: "Phase 1: Design subgraph schema",
        description: "Design GraphQL schema for on-chain data indexing",
        agent: "graph-protocol-indexer",
      },
      {
        name: "Phase 1: Design ethers.js integration",
        description: "Design Web3 provider setup, wallet integration, transaction handling",
        agent: "ethersjs-integration-architect",
      },
      {
        name: "Phase 2: Implement Solidity contracts (parallel)",
        description: "Write smart contracts with OpenZeppelin patterns",
        agent: "openzeppelin-patterns-expert",
        parallel: true,
      },
      {
        name: "Phase 2: Create subgraph (parallel)",
        description: "Implement event handlers and entity mappings",
        agent: "graph-protocol-indexer",
        command: "create-subgraph",
        parallel: true,
      },
      {
        name: "Phase 2: Build REST API (parallel)",
        description: "Create backend API for off-chain data and caching",
        agent: "backend-api-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Build Web3 frontend (parallel)",
        description: "Implement Next.js UI with ethers.js and Web3 Modal",
        agent: "frontend-fusion-engine",
        parallel: true,
      },
      {
        name: "Phase 3: Integration testing",
        description: "Validate contract-subgraph-API-frontend flow",
        agent: "integration-test-architect",
      },
      {
        name: "Phase 3: Security audit",
        description: "Run Slither + Mythril + manual audit for vulnerabilities",
        agent: "evm-security-auditor",
        command: "security-audit",
      },
      {
        name: "Phase 3: Gas optimization",
        description: "Optimize contract gas consumption, target <100k gas per tx",
        agent: "gas-optimization-specialist",
        command: "gas-report",
      },
      {
        name: "Phase 4: Deploy contracts",
        description: "Deploy to mainnet with Hardhat",
        command: "deploy-hardhat",
        condition: "audit_clean === true",
      },
      {
        name: "Phase 4: Verify on Etherscan",
        description: "Submit source code for verification",
        command: "verify-contract",
      },
      {
        name: "Phase 4: Deploy subgraph to Graph Studio",
        description: "Publish subgraph for indexing",
        agent: "graph-protocol-indexer",
      },
      {
        name: "Phase 4: Setup monitoring",
        description: "Configure contract event monitoring and alerts",
        agent: "monitoring-specialist",
        command: "monitoring-setup",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "defi-protocol-integration",
    kind: "workflow",
    name: "DeFi Protocol Integration",
    slug: "defi-protocol-integration",
    description:
      "Integrate Uniswap/Aave/Jupiter/Marinade: Research + integration contracts + fork testing + MEV analysis. 10-12 hours → 1.5 hours.",
    longDescription:
      "Professional DeFi integration workflow: Phase 1 - Research protocol (Uniswap V3/Aave/Jupiter) + design integration architecture + design monitoring. Phase 2 - Parallel contract implementation, backend monitoring, and frontend UI. Phase 3 - Fork testing with mainnet state + economic security audit (MEV/oracle attacks) + integration validation. Phase 4 - Staged rollout with monitoring.",
    category: "Orchestration & Automation",
    tags: ["DeFi", "Integration", "Uniswap", "Aave", "Jupiter", "Workflow"],
    install: "npx @gicm/cli add workflow/defi-protocol-integration",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential → Sequential
    triggerPhrase: "/defi-integrate",
    estimatedTime: "1.5 hours",
    timeSavings: 88,
    requiredAgents: [
      "defi-integration-architect",
      "uniswap-v3-integration-specialist",
      "aave-protocol-integrator",
      "chainlink-oracle-specialist",
      "web3-security-specialist",
    ],
    requiredCommands: ["fork-mainnet", "impersonate-account", "trace-tx", "estimate-gas", "deploy-foundry"],
    steps: [
      {
        name: "Phase 1: Research protocol",
        description: "Deep dive into protocol mechanics (Uniswap V3 tick math, Aave rate model)",
        agent: "defi-integration-architect",
      },
      {
        name: "Phase 1: Design integration contracts",
        description: "Design adapter contracts for protocol interaction",
        agent: "uniswap-v3-integration-specialist",
      },
      {
        name: "Phase 1: Design price feed and monitoring",
        description: "Configure Chainlink oracles, liquidation monitoring, alerts",
        agent: "chainlink-oracle-specialist",
      },
      {
        name: "Phase 2: Implement integration (parallel)",
        description: "Write adapter contracts with slippage protection",
        agent: "uniswap-v3-integration-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Build monitoring backend (parallel)",
        description: "Create monitoring service for positions, health factors, liquidations",
        agent: "backend-api-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Build management UI (parallel)",
        description: "Create dashboard for position management and analytics",
        agent: "frontend-fusion-engine",
        parallel: true,
      },
      {
        name: "Phase 3: Fork mainnet for testing",
        description: "Fork mainnet with real liquidity for realistic testing",
        command: "fork-mainnet",
      },
      {
        name: "Phase 3: Test with real protocol state",
        description: "Execute integration tests against mainnet fork",
        agent: "integration-test-architect",
        command: "impersonate-account",
      },
      {
        name: "Phase 3: Economic security audit",
        description: "Analyze MEV risks, oracle manipulation, flash loan attacks",
        agent: "web3-security-specialist",
        command: "trace-tx",
      },
      {
        name: "Phase 3: Validate end-to-end flows",
        description: "Test deposit, swap, withdraw, liquidation flows",
        agent: "e2e-testing-specialist",
      },
      {
        name: "Phase 4: Deploy with small position",
        description: "Initial mainnet deployment with limited capital exposure",
        command: "deploy-foundry",
        condition: "fork_tests_passed === true && audit_clean === true",
      },
      {
        name: "Phase 4: Setup alerts",
        description: "Configure alerts for protocol changes, price anomalies, position health",
        agent: "monitoring-specialist",
        command: "monitoring-setup",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "performance-optimization-suite",
    kind: "workflow",
    name: "Performance Optimization Suite",
    slug: "performance-optimization-suite",
    description:
      "Complete performance optimization: Gas + API latency + bundle size + database. 6-8 hours → 1.5 hours.",
    longDescription:
      "Comprehensive performance workflow: Phase 1 - Profile bottlenecks (compute units, API latency, bundle size, slow queries). Phase 2 - Parallel optimization (gas optimization, API caching, code splitting, database indexing). Phase 3 - Benchmark before/after and validate performance targets met.",
    category: "Orchestration & Automation",
    tags: ["Performance", "Optimization", "Gas", "API", "Frontend", "Workflow"],
    install: "npx @gicm/cli add workflow/performance-optimization-suite",
    orchestrationPattern: "hybrid", // Sequential profiling → Parallel optimization → Sequential validation
    triggerPhrase: "/optimize-performance",
    estimatedTime: "1.5 hours",
    timeSavings: 81,
    requiredAgents: [
      "gas-optimization-specialist",
      "performance-engineer",
      "bundler-optimizer",
      "devtools-optimizer",
      "database-schema-oracle",
    ],
    requiredCommands: ["gas-report", "perf-trace", "bundle-analyze", "benchmark", "performance-optimize-db", "performance-caching"],
    steps: [
      {
        name: "Phase 1: Profile gas consumption",
        description: "Identify expensive contract operations",
        agent: "gas-optimization-specialist",
        command: "gas-report",
      },
      {
        name: "Phase 1: Profile API latency",
        description: "Identify slow endpoints and database queries",
        agent: "performance-engineer",
        command: "perf-trace",
      },
      {
        name: "Phase 1: Profile bundle size",
        description: "Analyze JavaScript bundle size and identify large dependencies",
        agent: "bundler-optimizer",
        command: "bundle-analyze",
      },
      {
        name: "Phase 1: Profile database queries",
        description: "Identify slow queries without indexes",
        agent: "database-schema-oracle",
      },
      {
        name: "Phase 2: Optimize contract gas (parallel)",
        description: "Storage packing, loop optimization, unchecked math",
        agent: "gas-optimization-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Optimize API performance (parallel)",
        description: "Add Redis caching, optimize queries, enable compression",
        agent: "performance-engineer",
        command: "performance-caching",
        parallel: true,
      },
      {
        name: "Phase 2: Optimize frontend bundle (parallel)",
        description: "Code splitting, lazy loading, tree shaking",
        agent: "bundler-optimizer",
        parallel: true,
      },
      {
        name: "Phase 2: Optimize database (parallel)",
        description: "Add indexes, optimize queries, enable connection pooling",
        agent: "database-schema-oracle",
        command: "performance-optimize-db",
        parallel: true,
      },
      {
        name: "Phase 3: Run benchmarks",
        description: "Compare before/after metrics for all optimizations",
        command: "benchmark",
      },
      {
        name: "Phase 3: Validate targets met",
        description: "Ensure gas <100k, API <200ms, LCP <2.5s, query time <50ms",
        agent: "performance-engineer",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "incident-response-protocol",
    kind: "workflow",
    name: "Incident Response Protocol",
    slug: "incident-response-protocol",
    description:
      "Production incident response: Parallel diagnosis → sequential remediation → post-mortem. 8-12 hours → 2 hours.",
    longDescription:
      "Emergency incident response workflow: Phase 1 - Parallel diagnosis (log analysis, transaction tracing, state inspection, security check). Phase 2 - Sequential remediation (root cause analysis, remediation planning, emergency deployment, validation). Phase 3 - Post-incident (post-mortem, prevention controls).",
    category: "Orchestration & Automation",
    tags: ["Incident", "Emergency", "Production", "DevOps", "Security", "Workflow"],
    install: "npx @gicm/cli add workflow/incident-response-protocol",
    orchestrationPattern: "hybrid", // Parallel → Sequential → Sequential
    triggerPhrase: "/incident-response",
    estimatedTime: "2 hours",
    timeSavings: 83,
    requiredAgents: [
      "debugging-detective",
      "log-aggregation-expert",
      "smart-contract-forensics",
      "deployment-strategist",
      "security-engineer",
    ],
    requiredCommands: ["trace-tx", "decode-tx", "snapshot-state", "fork-mainnet", "impersonate-account", "deploy-rollback"],
    steps: [
      {
        name: "Phase 1: Parse logs for errors (parallel)",
        description: "Analyze application logs for error patterns and anomalies",
        agent: "log-aggregation-expert",
        parallel: true,
      },
      {
        name: "Phase 1: Trace failed transactions (parallel)",
        description: "Trace and decode failed on-chain transactions",
        command: "trace-tx",
        parallel: true,
      },
      {
        name: "Phase 1: Inspect contract state (parallel)",
        description: "Compare current state vs expected state for anomalies",
        agent: "smart-contract-forensics",
        command: "snapshot-state",
        parallel: true,
      },
      {
        name: "Phase 1: Check exploit indicators (parallel)",
        description: "Scan for security exploit patterns (reentrancy, overflow)",
        agent: "security-engineer",
        parallel: true,
      },
      {
        name: "Phase 2: Identify root cause",
        description: "Synthesize findings to identify root cause",
        agent: "debugging-detective",
      },
      {
        name: "Phase 2: Design remediation",
        description: "Plan fix strategy (hotfix, pause contract, rollback)",
        agent: "deployment-strategist",
      },
      {
        name: "Phase 2: Execute emergency deployment",
        description: "Deploy fix or pause contract to stop bleeding",
        command: "deploy-rollback",
      },
      {
        name: "Phase 2: Verify incident resolved",
        description: "Confirm issue is resolved and system is stable",
        agent: "debugging-detective",
      },
      {
        name: "Phase 3: Write post-mortem",
        description: "Document incident timeline, root cause, remediation, lessons learned",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 3: Design prevention controls",
        description: "Implement controls to prevent recurrence (tests, alerts, circuit breakers)",
        agent: "security-engineer",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  // === TIER 3: PRODUCTION OPERATIONS ===

  {
    id: "api-documentation-complete",
    kind: "workflow",
    name: "Complete API Documentation",
    slug: "api-documentation-complete",
    description:
      "Auto-generate API docs: OpenAPI extraction + reference docs + examples + tutorials + SDK samples. 6-8 hours → 1.5 hours.",
    longDescription:
      "Professional API documentation workflow: Phase 1 - Extract OpenAPI/GraphQL schemas + generate reference docs + create endpoint examples. Phase 2 - Parallel creation of getting started guide, SDK examples (JS/Python/Rust), and interactive API playground. Phase 3 - Polish prose, ensure accessibility (WCAG), publish docs.",
    category: "Orchestration & Automation",
    tags: ["Documentation", "API", "OpenAPI", "Tutorial", "Developer Experience", "Workflow"],
    install: "npx @gicm/cli add workflow/api-documentation-complete",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential
    triggerPhrase: "/document-api",
    estimatedTime: "1.5 hours",
    timeSavings: 81,
    requiredAgents: [
      "api-documentation-specialist",
      "tutorial-creator",
      "code-example-generator",
      "technical-writer-pro",
      "accessibility-advocate",
    ],
    requiredCommands: ["doc-generate", "generate-abi", "api-gen"],
    steps: [
      {
        name: "Phase 1: Extract API contracts",
        description: "Extract OpenAPI spec or GraphQL schema from codebase",
        agent: "api-documentation-specialist",
        command: "generate-abi",
      },
      {
        name: "Phase 1: Generate reference docs",
        description: "Auto-generate API reference from OpenAPI/GraphQL schema",
        agent: "api-documentation-specialist",
        command: "doc-generate",
      },
      {
        name: "Phase 1: Create endpoint examples",
        description: "Generate curl/fetch examples for each endpoint",
        agent: "code-example-generator",
      },
      {
        name: "Phase 2: Write getting started guide (parallel)",
        description: "Create quick start tutorial for first API call",
        agent: "tutorial-creator",
        parallel: true,
      },
      {
        name: "Phase 2: Create SDK examples (parallel)",
        description: "Write JavaScript, Python, and Rust SDK examples",
        agent: "code-example-generator",
        parallel: true,
      },
      {
        name: "Phase 2: Build API playground (parallel)",
        description: "Create interactive playground for testing endpoints",
        agent: "frontend-fusion-engine",
        parallel: true,
      },
      {
        name: "Phase 3: Polish documentation prose",
        description: "Edit for clarity, grammar, and consistent tone",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 3: Ensure accessibility",
        description: "Validate WCAG 2.1 AA compliance",
        agent: "accessibility-advocate",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "monitoring-observability-setup",
    kind: "workflow",
    name: "Monitoring & Observability Setup",
    slug: "monitoring-observability-setup",
    description:
      "Complete observability: Logs + metrics + alerts + dashboards for program/contract monitoring. 4-6 hours → 1 hour.",
    longDescription:
      "Production observability workflow: Phase 1 - Parallel setup of program/contract event monitoring, log aggregation (Supabase/Datadog), metrics collection (Prometheus/Grafana), and alert configuration. Phase 2 - Integrate into unified dashboard, validate alerts trigger correctly, and document runbooks for alert response.",
    category: "Orchestration & Automation",
    tags: ["Monitoring", "Observability", "Logs", "Metrics", "Alerts", "Workflow"],
    install: "npx @gicm/cli add workflow/monitoring-observability-setup",
    orchestrationPattern: "hybrid", // Parallel → Sequential
    triggerPhrase: "/setup-monitoring",
    estimatedTime: "1 hour",
    timeSavings: 83,
    requiredAgents: [
      "monitoring-specialist",
      "log-aggregation-expert",
      "devops-platform-engineer",
    ],
    requiredCommands: ["monitoring-setup", "analytics-setup"],
    steps: [
      {
        name: "Phase 1: Setup event monitoring (parallel)",
        description: "Configure monitoring for program/contract events",
        agent: "monitoring-specialist",
        command: "monitoring-setup",
        parallel: true,
      },
      {
        name: "Phase 1: Configure log aggregation (parallel)",
        description: "Setup log collection (Supabase/Datadog/CloudWatch)",
        agent: "log-aggregation-expert",
        parallel: true,
      },
      {
        name: "Phase 1: Setup metrics collection (parallel)",
        description: "Configure Prometheus/Grafana for metrics",
        agent: "devops-platform-engineer",
        parallel: true,
      },
      {
        name: "Phase 1: Create alerts (parallel)",
        description: "Configure alerts for critical events (failures, high gas, low balance)",
        agent: "monitoring-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Build unified dashboard",
        description: "Create dashboard showing logs, metrics, and events in one view",
        agent: "monitoring-specialist",
      },
      {
        name: "Phase 2: Validate alerts",
        description: "Test that alerts trigger correctly and route to on-call",
        agent: "devops-platform-engineer",
      },
      {
        name: "Phase 2: Document runbooks",
        description: "Create alert response procedures for on-call engineers",
        agent: "technical-writer-pro",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "qa-release-validation",
    kind: "workflow",
    name: "QA Release Validation",
    slug: "qa-release-validation",
    description:
      "Pre-release QA validation: Parallel testing + security + performance checks with go/no-go decision. 4-6 hours → 45 minutes.",
    longDescription:
      "Release validation workflow with parallel checks: Phase 1 - Parallel execution of manual QA tests, automated test suite, performance/load testing, security scanning, and gas profiling. Phase 2 - Gate decision based on all checks passing, risk assessment, and go/no-go decision for release.",
    category: "Orchestration & Automation",
    tags: ["QA", "Testing", "Release", "Validation", "Quality", "Workflow"],
    install: "npx @gicm/cli add workflow/qa-release-validation",
    orchestrationPattern: "hybrid", // Parallel → Sequential gate
    triggerPhrase: "/qa-validate-release",
    estimatedTime: "45 minutes",
    timeSavings: 81,
    requiredAgents: [
      "qa-automation-lead",
      "quality-assurance-specialist",
      "qa-stress-tester",
      "performance-engineer",
      "security-engineer",
    ],
    requiredCommands: ["test-coverage", "gas-report", "benchmark", "load-test", "lighthouse-check"],
    steps: [
      {
        name: "Phase 1: Execute manual QA plan (parallel)",
        description: "Human QA tests for critical user flows",
        agent: "quality-assurance-specialist",
        parallel: true,
      },
      {
        name: "Phase 1: Run automated test suite (parallel)",
        description: "Execute full test suite (unit + integration + E2E)",
        command: "test-coverage",
        parallel: true,
      },
      {
        name: "Phase 1: Performance testing (parallel)",
        description: "Run load tests and stress tests",
        agent: "qa-stress-tester",
        command: "load-test",
        parallel: true,
      },
      {
        name: "Phase 1: Security final scan (parallel)",
        description: "Final security scan before release",
        agent: "security-engineer",
        command: "security-audit",
        parallel: true,
      },
      {
        name: "Phase 1: Gas profiling (parallel)",
        description: "Validate gas optimization targets met",
        command: "gas-report",
        parallel: true,
      },
      {
        name: "Phase 2: Validate all gates passed",
        description: "Check that all validation checks passed thresholds",
        agent: "qa-automation-lead",
      },
      {
        name: "Phase 2: Assess deployment risk",
        description: "Evaluate overall risk profile for release",
        agent: "deployment-strategist",
      },
      {
        name: "Phase 2: Go/No-Go decision",
        description: "Final decision to approve or block release",
        agent: "qa-automation-lead",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "economic-security-analysis",
    kind: "workflow",
    name: "Economic Security Analysis",
    slug: "economic-security-analysis",
    description:
      "DeFi economic security: MEV + oracle manipulation + flash loan attacks + risk quantification. 6-8 hours → 1 hour.",
    longDescription:
      "DeFi-focused economic security workflow: Phase 1 - Parallel analysis of MEV risks (sandwich/front-running), oracle security (Chainlink validation), flash loan attack vectors, and governance/admin controls. Phase 2 - Synthesize findings, quantify potential loss scenarios, and design mitigations (slippage limits, circuit breakers).",
    category: "Orchestration & Automation",
    tags: ["DeFi", "Security", "MEV", "Oracle", "Economic", "Workflow"],
    install: "npx @gicm/cli add workflow/economic-security-analysis",
    orchestrationPattern: "hybrid", // Parallel → Sequential
    triggerPhrase: "/economic-security",
    estimatedTime: "1 hour",
    timeSavings: 87,
    requiredAgents: [
      "defi-integration-architect",
      "chainlink-oracle-specialist",
      "smart-contract-auditor",
      "web3-security-specialist",
    ],
    requiredCommands: ["fork-mainnet", "impersonate-account", "simulate-bundle", "trace-tx"],
    steps: [
      {
        name: "Phase 1: MEV analysis (parallel)",
        description: "Analyze sandwich attack vectors and front-running risks",
        agent: "web3-security-specialist",
        command: "simulate-bundle",
        parallel: true,
      },
      {
        name: "Phase 1: Oracle security (parallel)",
        description: "Validate Chainlink price feed security and update frequency",
        agent: "chainlink-oracle-specialist",
        parallel: true,
      },
      {
        name: "Phase 1: Flash loan analysis (parallel)",
        description: "Check for flash loan attack vectors (price manipulation, liquidity drain)",
        agent: "defi-integration-architect",
        command: "fork-mainnet",
        parallel: true,
      },
      {
        name: "Phase 1: Governance analysis (parallel)",
        description: "Review admin controls, timelock mechanisms, multisig config",
        agent: "smart-contract-auditor",
        parallel: true,
      },
      {
        name: "Phase 2: Synthesize findings",
        description: "Consolidate all economic attack vectors identified",
        agent: "web3-security-specialist",
      },
      {
        name: "Phase 2: Quantify risk",
        description: "Estimate potential loss scenarios (e.g., $100k flash loan attack)",
        agent: "defi-integration-architect",
      },
      {
        name: "Phase 2: Design mitigations",
        description: "Design protections (slippage limits, circuit breakers, timelock)",
        agent: "smart-contract-auditor",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  // === TIER 4: ADVANCED FEATURES ===

  {
    id: "penetration-test-web3",
    kind: "workflow",
    name: "Web3 Penetration Testing",
    slug: "penetration-test-web3",
    description:
      "Smart contract penetration testing: Reconnaissance → exploit development → validation. 16-20 hours → 3 hours.",
    longDescription:
      "Advanced penetration testing workflow: Phase 1 - Reconnaissance (map functions, dependencies, attack surface). Phase 2 - Exploit development (reentrancy, overflow, MEV, oracle manipulation). Phase 3 - Validation (demonstrate exploits on fork, calculate impact, generate detailed report).",
    category: "Orchestration & Automation",
    tags: ["Security", "Penetration Testing", "Red Team", "Exploit", "Workflow"],
    install: "npx @gicm/cli add workflow/penetration-test-web3",
    orchestrationPattern: "sequential", // Sequential attack chain
    triggerPhrase: "/pentest-web3",
    estimatedTime: "3 hours",
    timeSavings: 85,
    requiredAgents: [
      "penetration-testing-specialist",
      "evm-security-auditor",
      "solana-guardian-auditor",
      "web3-security-specialist",
    ],
    requiredCommands: ["fork-mainnet", "impersonate-account", "simulate-bundle", "trace-tx"],
    steps: [
      {
        name: "Phase 1: Map contract functions",
        description: "Analyze all functions, access controls, state variables",
        agent: "smart-contract-auditor",
      },
      {
        name: "Phase 1: Map dependencies",
        description: "Identify external calls, oracle dependencies, protocol integrations",
        agent: "defi-integration-architect",
      },
      {
        name: "Phase 2: Attempt reentrancy attacks",
        description: "Test for reentrancy vulnerabilities",
        agent: "penetration-testing-specialist",
        command: "fork-mainnet",
      },
      {
        name: "Phase 2: Attempt integer overflow",
        description: "Test for unchecked arithmetic vulnerabilities",
        agent: "evm-security-auditor",
      },
      {
        name: "Phase 2: Simulate MEV attacks",
        description: "Test sandwich attacks and front-running",
        agent: "web3-security-specialist",
        command: "simulate-bundle",
      },
      {
        name: "Phase 2: Test oracle manipulation",
        description: "Attempt price oracle manipulation attacks",
        agent: "chainlink-oracle-specialist",
        command: "impersonate-account",
      },
      {
        name: "Phase 3: Demonstrate exploits on fork",
        description: "Validate successful attacks on mainnet fork",
        agent: "penetration-testing-specialist",
        command: "trace-tx",
      },
      {
        name: "Phase 3: Calculate impact",
        description: "Quantify potential loss from each exploit",
        agent: "web3-security-specialist",
      },
      {
        name: "Phase 3: Generate vulnerability report",
        description: "Create detailed report with exploit steps and remediation",
        agent: "security-engineer",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "onboarding-quickstart-generator",
    kind: "workflow",
    name: "Onboarding & Quickstart Generator",
    slug: "onboarding-quickstart-generator",
    description:
      "Auto-generate project onboarding: Tutorial path + code examples + screenshots + accessibility. 8-10 hours → 2 hours.",
    longDescription:
      "Developer onboarding workflow: Phase 1 - Design learning path (beginner → advanced) + identify key examples. Phase 2 - Content creation (step-by-step tutorials, working code examples, screenshots/diagrams). Phase 3 - Validation (execute tutorials on fresh environment, ensure accessibility, optimize for learning).",
    category: "Orchestration & Automation",
    tags: ["Documentation", "Tutorial", "Onboarding", "Developer Experience", "Workflow"],
    install: "npx @gicm/cli add workflow/onboarding-quickstart-generator",
    orchestrationPattern: "sequential",
    triggerPhrase: "/create-quickstart",
    estimatedTime: "2 hours",
    timeSavings: 80,
    requiredAgents: [
      "tutorial-creator",
      "code-example-generator",
      "technical-writer-pro",
      "content-strategist",
      "accessibility-advocate",
    ],
    requiredCommands: ["doc-generate", "readme-architect"],
    steps: [
      {
        name: "Phase 1: Design learning path",
        description: "Create progressive tutorial path from beginner to advanced",
        agent: "tutorial-creator",
      },
      {
        name: "Phase 1: Identify key examples",
        description: "Select examples that demonstrate core concepts",
        agent: "code-example-generator",
      },
      {
        name: "Phase 2: Write step-by-step tutorials",
        description: "Create detailed tutorials with explanations",
        agent: "tutorial-creator",
      },
      {
        name: "Phase 2: Create working code examples",
        description: "Write runnable code examples for each tutorial step",
        agent: "code-example-generator",
      },
      {
        name: "Phase 2: Generate screenshots and diagrams",
        description: "Create visual aids for complex concepts",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 3: Test tutorials on fresh environment",
        description: "Execute all tutorials to ensure they work",
        agent: "tutorial-creator",
      },
      {
        name: "Phase 3: Ensure accessibility",
        description: "Validate WCAG compliance for all content",
        agent: "accessibility-advocate",
      },
      {
        name: "Phase 3: Optimize for learning outcomes",
        description: "Refine content based on learning science principles",
        agent: "content-strategist",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "changelog-release-notes",
    kind: "workflow",
    name: "Changelog & Release Notes Generator",
    slug: "changelog-release-notes",
    description:
      "Auto-generate release notes: Git analysis → changelog grouping → user-friendly descriptions. 2-3 hours → 20 minutes.",
    longDescription:
      "Automated release notes workflow: Phase 1 - Extract commits since last release + group by type (features/fixes/breaking) + link to issues/PRs. Phase 2 - Write user-friendly descriptions + highlight breaking changes + add migration steps + code examples. Phase 3 - Polish prose and publish GitHub release.",
    category: "Orchestration & Automation",
    tags: ["Documentation", "Release", "Changelog", "Git", "Workflow"],
    install: "npx @gicm/cli add workflow/changelog-release-notes",
    orchestrationPattern: "sequential",
    triggerPhrase: "/generate-release-notes",
    estimatedTime: "20 minutes",
    timeSavings: 88,
    requiredAgents: [
      "changelog-generator",
      "technical-writer-pro",
      "git-flow-coordinator",
    ],
    requiredCommands: ["changelog-gen", "release-notes", "pr-enhance"],
    steps: [
      {
        name: "Phase 1: Extract commits since last release",
        description: "Analyze git history and extract commit messages",
        agent: "git-flow-coordinator",
      },
      {
        name: "Phase 1: Group by type",
        description: "Categorize commits (features, fixes, breaking changes)",
        agent: "changelog-generator",
        command: "changelog-gen",
      },
      {
        name: "Phase 1: Link to issues and PRs",
        description: "Associate commits with GitHub issues and pull requests",
        agent: "git-flow-coordinator",
      },
      {
        name: "Phase 2: Write user-friendly descriptions",
        description: "Convert technical commits to user-focused release notes",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 2: Highlight breaking changes",
        description: "Document breaking changes with migration guides",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 2: Add code examples for new features",
        description: "Create examples showing how to use new features",
        agent: "code-example-generator",
      },
      {
        name: "Phase 3: Polish prose",
        description: "Edit for clarity, grammar, and consistent tone",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 3: Publish GitHub release",
        description: "Create GitHub release with changelog and tag",
        agent: "git-flow-coordinator",
        command: "release-notes",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  // === GENERAL-PURPOSE DEVELOPMENT WORKFLOWS ===

  {
    id: "microservices-architecture-setup",
    kind: "workflow",
    name: "Microservices Architecture Setup",
    slug: "microservices-architecture-setup",
    description:
      "Design and deploy microservices: Service boundaries → Parallel build → K8s deploy. 12-16 hours → 3 hours.",
    longDescription:
      "Production microservices workflow: Phase 1 - Define service boundaries, design API contracts, setup shared infrastructure. Phase 2 - Parallel service implementation (auth, API gateway, core services). Phase 3 - Deploy to Kubernetes, setup service mesh, configure monitoring.",
    category: "Orchestration & Automation",
    tags: ["Microservices", "Architecture", "Kubernetes", "Docker", "Backend", "Workflow"],
    install: "npx @gicm/cli add workflow/microservices-architecture-setup",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential
    triggerPhrase: "/setup-microservices",
    estimatedTime: "3 hours",
    timeSavings: 75,
    requiredAgents: [
      "backend-api-specialist",
      "api-design-architect",
      "database-schema-oracle",
      "devops-platform-engineer",
      "cloud-architect",
    ],
    requiredCommands: ["docker-init", "k8s-deploy", "api-gen"],
    steps: [
      {
        name: "Phase 1: Define service boundaries",
        description: "Identify microservices based on domain-driven design",
        agent: "backend-api-specialist",
      },
      {
        name: "Phase 1: Design API contracts",
        description: "Create OpenAPI specs for inter-service communication",
        agent: "api-design-architect",
        command: "api-gen",
      },
      {
        name: "Phase 1: Setup shared infrastructure",
        description: "Configure message queue, service registry, API gateway",
        agent: "devops-platform-engineer",
      },
      {
        name: "Phase 2: Build auth service (parallel)",
        description: "Implement authentication and authorization service",
        agent: "backend-api-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Build API gateway (parallel)",
        description: "Configure Kong/Nginx for API routing and rate limiting",
        agent: "api-design-architect",
        parallel: true,
      },
      {
        name: "Phase 2: Build core services (parallel)",
        description: "Implement domain-specific microservices",
        agent: "backend-api-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Setup databases (parallel)",
        description: "Provision databases for each service",
        agent: "database-schema-oracle",
        parallel: true,
      },
      {
        name: "Phase 3: Deploy to Kubernetes",
        description: "Create K8s manifests and deploy all services",
        agent: "devops-platform-engineer",
        command: "k8s-deploy",
      },
      {
        name: "Phase 3: Configure service mesh",
        description: "Setup Istio for service-to-service communication",
        agent: "cloud-architect",
      },
      {
        name: "Phase 3: Setup monitoring",
        description: "Configure distributed tracing and metrics",
        agent: "monitoring-specialist",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "graphql-api-complete",
    kind: "workflow",
    name: "Complete GraphQL API",
    slug: "graphql-api-complete",
    description:
      "Full GraphQL API: Schema design → resolvers → authentication → caching → documentation. 10-14 hours → 2.5 hours.",
    longDescription:
      "Production GraphQL API workflow: Phase 1 - Design schema with type safety + implement resolvers + add authentication. Phase 2 - Performance optimization (DataLoader, Redis caching, query complexity analysis). Phase 3 - Documentation (schema docs, playground, client examples).",
    category: "Orchestration & Automation",
    tags: ["GraphQL", "API", "Backend", "TypeScript", "Documentation", "Workflow"],
    install: "npx @gicm/cli add workflow/graphql-api-complete",
    orchestrationPattern: "sequential",
    triggerPhrase: "/build-graphql-api",
    estimatedTime: "2.5 hours",
    timeSavings: 78,
    requiredAgents: [
      "api-design-architect",
      "backend-api-specialist",
      "database-schema-oracle",
      "performance-engineer",
      "api-documentation-specialist",
    ],
    requiredCommands: ["api-gen", "doc-generate", "performance-caching"],
    steps: [
      {
        name: "Phase 1: Design GraphQL schema",
        description: "Create type-safe schema with proper relations",
        agent: "api-design-architect",
        command: "api-gen",
      },
      {
        name: "Phase 1: Generate TypeScript types",
        description: "Generate TypeScript types from schema",
        agent: "backend-api-specialist",
      },
      {
        name: "Phase 1: Implement resolvers",
        description: "Create resolvers with database queries",
        agent: "backend-api-specialist",
      },
      {
        name: "Phase 1: Add authentication",
        description: "Implement JWT authentication and authorization",
        agent: "backend-api-specialist",
      },
      {
        name: "Phase 2: Add DataLoader for N+1 prevention",
        description: "Implement DataLoader for efficient batching",
        agent: "performance-engineer",
      },
      {
        name: "Phase 2: Setup Redis caching",
        description: "Add response caching with Redis",
        agent: "performance-engineer",
        command: "performance-caching",
      },
      {
        name: "Phase 2: Add query complexity analysis",
        description: "Prevent expensive queries with complexity limits",
        agent: "api-design-architect",
      },
      {
        name: "Phase 3: Generate API documentation",
        description: "Create schema documentation with examples",
        agent: "api-documentation-specialist",
        command: "doc-generate",
      },
      {
        name: "Phase 3: Setup GraphQL Playground",
        description: "Configure interactive API explorer",
        agent: "api-documentation-specialist",
      },
      {
        name: "Phase 3: Create client examples",
        description: "Write Apollo Client and urql examples",
        agent: "code-example-generator",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "database-migration-safe",
    kind: "workflow",
    name: "Safe Database Migration",
    slug: "database-migration-safe",
    description:
      "Zero-downtime DB migration: Backup → migration → validation → rollback plan. 4-6 hours → 1.5 hours.",
    longDescription:
      "Production database migration workflow: Phase 1 - Create backup + analyze migration impact + generate migration scripts. Phase 2 - Parallel validation (test migration on staging, run data integrity checks, performance testing). Phase 3 - Execute migration with monitoring, validate success, prepare rollback.",
    category: "Orchestration & Automation",
    tags: ["Database", "Migration", "PostgreSQL", "DevOps", "Production", "Workflow"],
    install: "npx @gicm/cli add workflow/database-migration-safe",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential
    triggerPhrase: "/migrate-database",
    estimatedTime: "1.5 hours",
    timeSavings: 70,
    requiredAgents: [
      "database-schema-oracle",
      "devops-platform-engineer",
      "data-engineering-specialist",
    ],
    requiredCommands: ["db-backup", "db-migrate", "db-rollback"],
    steps: [
      {
        name: "Phase 1: Create full database backup",
        description: "Backup production database before migration",
        agent: "database-schema-oracle",
        command: "db-backup",
      },
      {
        name: "Phase 1: Analyze migration impact",
        description: "Estimate downtime and identify breaking changes",
        agent: "database-schema-oracle",
      },
      {
        name: "Phase 1: Generate migration scripts",
        description: "Create SQL migration with up/down scripts",
        agent: "database-schema-oracle",
      },
      {
        name: "Phase 2: Test on staging (parallel)",
        description: "Execute migration on staging environment",
        agent: "devops-platform-engineer",
        command: "db-migrate",
        parallel: true,
      },
      {
        name: "Phase 2: Data integrity checks (parallel)",
        description: "Validate data consistency after migration",
        agent: "data-engineering-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Performance testing (parallel)",
        description: "Verify queries still perform well post-migration",
        agent: "performance-engineer",
        parallel: true,
      },
      {
        name: "Phase 3: Execute production migration",
        description: "Run migration on production with monitoring",
        agent: "database-schema-oracle",
        command: "db-migrate",
      },
      {
        name: "Phase 3: Validate migration success",
        description: "Check all tables, indexes, constraints created correctly",
        agent: "database-schema-oracle",
      },
      {
        name: "Phase 3: Prepare rollback procedure",
        description: "Document rollback steps in case of issues",
        agent: "devops-platform-engineer",
        command: "db-rollback",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "mobile-app-mvp-launch",
    kind: "workflow",
    name: "Mobile App MVP Launch",
    slug: "mobile-app-mvp-launch",
    description:
      "React Native MVP: Setup → parallel feature build → app store submission. 2-3 weeks → 5 days.",
    longDescription:
      "Mobile MVP workflow: Phase 1 - React Native/Expo setup + navigation + authentication. Phase 2 - Parallel feature implementation (core screens, API integration, local storage). Phase 3 - App store preparation (screenshots, descriptions, submission to iOS/Android).",
    category: "Orchestration & Automation",
    tags: ["Mobile", "React Native", "iOS", "Android", "MVP", "Workflow"],
    install: "npx @gicm/cli add workflow/mobile-app-mvp-launch",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential
    triggerPhrase: "/launch-mobile-mvp",
    estimatedTime: "5 days",
    timeSavings: 65,
    requiredAgents: [
      "mobile-app-developer",
      "frontend-fusion-engine",
      "api-design-architect",
      "ux-designer",
    ],
    requiredCommands: ["expo-init", "mobile-build"],
    steps: [
      {
        name: "Phase 1: Initialize React Native project",
        description: "Setup Expo or bare React Native with TypeScript",
        agent: "mobile-app-developer",
        command: "expo-init",
      },
      {
        name: "Phase 1: Configure navigation",
        description: "Setup React Navigation with stack and tab navigators",
        agent: "mobile-app-developer",
      },
      {
        name: "Phase 1: Implement authentication flow",
        description: "Add login/signup with JWT and secure storage",
        agent: "mobile-app-developer",
      },
      {
        name: "Phase 2: Build core screens (parallel)",
        description: "Implement main app screens with UI components",
        agent: "mobile-app-developer",
        parallel: true,
      },
      {
        name: "Phase 2: API integration (parallel)",
        description: "Connect to backend API with React Query",
        agent: "api-design-architect",
        parallel: true,
      },
      {
        name: "Phase 2: Local data storage (parallel)",
        description: "Setup AsyncStorage or SQLite for offline support",
        agent: "mobile-app-developer",
        parallel: true,
      },
      {
        name: "Phase 2: Push notifications (parallel)",
        description: "Implement push notifications with Expo Notifications",
        agent: "mobile-app-developer",
        parallel: true,
      },
      {
        name: "Phase 3: Create app store assets",
        description: "Design screenshots, icons, and promotional images",
        agent: "ux-designer",
      },
      {
        name: "Phase 3: Write store descriptions",
        description: "Craft compelling App Store and Play Store descriptions",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 3: Build and submit to stores",
        description: "Create production builds and submit to iOS/Android",
        agent: "mobile-app-developer",
        command: "mobile-build",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "pwa-progressive-enhancement",
    kind: "workflow",
    name: "Progressive Web App Enhancement",
    slug: "pwa-progressive-enhancement",
    description:
      "Convert web app to PWA: Service worker → offline support → install prompt → performance. 6-8 hours → 2 hours.",
    longDescription:
      "PWA enhancement workflow: Phase 1 - Setup service worker with caching strategies + manifest file. Phase 2 - Offline support (offline fallback, background sync, IndexedDB). Phase 3 - PWA features (install prompt, app shortcuts, share target) + Lighthouse validation.",
    category: "Orchestration & Automation",
    tags: ["PWA", "Frontend", "Service Worker", "Offline", "Performance", "Workflow"],
    install: "npx @gicm/cli add workflow/pwa-progressive-enhancement",
    orchestrationPattern: "sequential",
    triggerPhrase: "/enhance-pwa",
    estimatedTime: "2 hours",
    timeSavings: 73,
    requiredAgents: [
      "frontend-fusion-engine",
      "performance-profiler",
      "pwa-specialist",
    ],
    requiredCommands: ["pwa-generate", "lighthouse-check"],
    steps: [
      {
        name: "Phase 1: Generate service worker",
        description: "Create service worker with Workbox caching strategies",
        agent: "pwa-specialist",
        command: "pwa-generate",
      },
      {
        name: "Phase 1: Create manifest.json",
        description: "Configure app manifest with icons and theme colors",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Phase 2: Implement offline fallback",
        description: "Create offline page and cache critical assets",
        agent: "pwa-specialist",
      },
      {
        name: "Phase 2: Add background sync",
        description: "Queue failed requests for retry when online",
        agent: "pwa-specialist",
      },
      {
        name: "Phase 2: Setup IndexedDB storage",
        description: "Implement local database for offline data",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Phase 3: Add install prompt",
        description: "Implement custom app install prompt",
        agent: "pwa-specialist",
      },
      {
        name: "Phase 3: Configure app shortcuts",
        description: "Add quick actions to home screen icon",
        agent: "frontend-fusion-engine",
      },
      {
        name: "Phase 3: Add Web Share Target",
        description: "Enable app to receive shared content",
        agent: "pwa-specialist",
      },
      {
        name: "Phase 3: Run Lighthouse PWA audit",
        description: "Validate PWA criteria and performance",
        agent: "performance-profiler",
        command: "lighthouse-check",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "ci-cd-pipeline-complete",
    kind: "workflow",
    name: "Complete CI/CD Pipeline",
    slug: "ci-cd-pipeline-complete",
    description:
      "Full CI/CD: GitHub Actions setup → test automation → staging → production deploy. 8-12 hours → 2 hours.",
    longDescription:
      "Production CI/CD workflow: Phase 1 - Setup GitHub Actions with test automation, linting, type checking. Phase 2 - Parallel environment setup (staging, production, preview environments). Phase 3 - Deployment automation (Docker builds, K8s deployment, smoke tests, rollback capability).",
    category: "Orchestration & Automation",
    tags: ["CI/CD", "GitHub Actions", "DevOps", "Deployment", "Automation", "Workflow"],
    install: "npx @gicm/cli add workflow/ci-cd-pipeline-complete",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential
    triggerPhrase: "/setup-cicd",
    estimatedTime: "2 hours",
    timeSavings: 80,
    requiredAgents: [
      "ci-cd-architect",
      "devops-platform-engineer",
      "test-automation-engineer",
      "deployment-strategist",
    ],
    requiredCommands: ["docker-init", "k8s-deploy", "test-coverage"],
    steps: [
      {
        name: "Phase 1: Create GitHub Actions workflow",
        description: "Setup CI workflow for test, lint, and build",
        agent: "ci-cd-architect",
      },
      {
        name: "Phase 1: Configure test automation",
        description: "Add unit, integration, and E2E test runs",
        agent: "test-automation-engineer",
        command: "test-coverage",
      },
      {
        name: "Phase 1: Add code quality checks",
        description: "Setup ESLint, TypeScript, and format checks",
        agent: "ci-cd-architect",
      },
      {
        name: "Phase 2: Setup staging environment (parallel)",
        description: "Configure staging deployment pipeline",
        agent: "devops-platform-engineer",
        parallel: true,
      },
      {
        name: "Phase 2: Setup production environment (parallel)",
        description: "Configure production deployment with approvals",
        agent: "deployment-strategist",
        parallel: true,
      },
      {
        name: "Phase 2: Setup preview environments (parallel)",
        description: "Deploy preview for each pull request",
        agent: "devops-platform-engineer",
        parallel: true,
      },
      {
        name: "Phase 3: Implement Docker build pipeline",
        description: "Build and push Docker images to registry",
        agent: "devops-platform-engineer",
        command: "docker-init",
      },
      {
        name: "Phase 3: Configure K8s deployment",
        description: "Setup automated Kubernetes deployments",
        agent: "devops-platform-engineer",
        command: "k8s-deploy",
      },
      {
        name: "Phase 3: Add smoke tests",
        description: "Run post-deployment health checks",
        agent: "test-automation-engineer",
      },
      {
        name: "Phase 3: Setup rollback capability",
        description: "Implement automated rollback on deployment failure",
        agent: "deployment-strategist",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "docker-containerization-workflow",
    kind: "workflow",
    name: "Docker Containerization Workflow",
    slug: "docker-containerization-workflow",
    description:
      "Containerize app: Multi-stage Dockerfile → docker-compose → optimization → registry push. 6-8 hours → 1.5 hours.",
    longDescription:
      "Docker containerization workflow: Phase 1 - Create optimized multi-stage Dockerfile + docker-compose for local dev. Phase 2 - Security hardening (non-root user, vulnerability scanning, secrets management). Phase 3 - Image optimization (layer caching, size reduction) + push to registry.",
    category: "Orchestration & Automation",
    tags: ["Docker", "Containers", "DevOps", "Optimization", "Security", "Workflow"],
    install: "npx @gicm/cli add workflow/docker-containerization-workflow",
    orchestrationPattern: "sequential",
    triggerPhrase: "/dockerize-app",
    estimatedTime: "1.5 hours",
    timeSavings: 77,
    requiredAgents: [
      "devops-platform-engineer",
      "security-engineer",
      "performance-engineer",
    ],
    requiredCommands: ["docker-init", "docker-scan", "docker-push"],
    steps: [
      {
        name: "Phase 1: Create multi-stage Dockerfile",
        description: "Build optimized Dockerfile with separate build and runtime stages",
        agent: "devops-platform-engineer",
        command: "docker-init",
      },
      {
        name: "Phase 1: Create docker-compose.yml",
        description: "Setup local development environment with all services",
        agent: "devops-platform-engineer",
      },
      {
        name: "Phase 1: Add .dockerignore",
        description: "Optimize build context by excluding unnecessary files",
        agent: "devops-platform-engineer",
      },
      {
        name: "Phase 2: Implement non-root user",
        description: "Run container as non-root for security",
        agent: "security-engineer",
      },
      {
        name: "Phase 2: Scan for vulnerabilities",
        description: "Run Trivy or Docker Scan for CVE detection",
        agent: "security-engineer",
        command: "docker-scan",
      },
      {
        name: "Phase 2: Secure secrets management",
        description: "Use Docker secrets or external secret managers",
        agent: "security-engineer",
      },
      {
        name: "Phase 3: Optimize layer caching",
        description: "Reorganize Dockerfile for efficient layer caching",
        agent: "performance-engineer",
      },
      {
        name: "Phase 3: Reduce image size",
        description: "Use Alpine base images and minimize installed packages",
        agent: "performance-engineer",
      },
      {
        name: "Phase 3: Push to container registry",
        description: "Tag and push images to Docker Hub or private registry",
        agent: "devops-platform-engineer",
        command: "docker-push",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "monorepo-workspace-setup",
    kind: "workflow",
    name: "Monorepo Workspace Setup",
    slug: "monorepo-workspace-setup",
    description:
      "Setup Turborepo monorepo: Package structure → shared configs → caching → CI optimization. 8-12 hours → 2.5 hours.",
    longDescription:
      "Monorepo setup workflow: Phase 1 - Initialize Turborepo with package structure + shared ESLint/TypeScript configs. Phase 2 - Configure build caching and parallel execution. Phase 3 - Optimize CI (remote caching, affected package detection) + documentation.",
    category: "Orchestration & Automation",
    tags: ["Monorepo", "Turborepo", "Build System", "DevOps", "TypeScript", "Workflow"],
    install: "npx @gicm/cli add workflow/monorepo-workspace-setup",
    orchestrationPattern: "sequential",
    triggerPhrase: "/setup-monorepo",
    estimatedTime: "2.5 hours",
    timeSavings: 69,
    requiredAgents: [
      "build-system-engineer",
      "package-manager-expert",
      "ci-cd-architect",
    ],
    requiredCommands: ["turbo-init", "monorepo-migrate"],
    steps: [
      {
        name: "Phase 1: Initialize Turborepo",
        description: "Create Turborepo structure with apps and packages",
        agent: "build-system-engineer",
        command: "turbo-init",
      },
      {
        name: "Phase 1: Setup package manager",
        description: "Configure pnpm workspaces or Yarn workspaces",
        agent: "package-manager-expert",
      },
      {
        name: "Phase 1: Create shared configs",
        description: "Setup shared ESLint, TypeScript, and Prettier configs",
        agent: "build-system-engineer",
      },
      {
        name: "Phase 2: Configure build pipeline",
        description: "Define Turborepo pipeline with proper dependencies",
        agent: "build-system-engineer",
      },
      {
        name: "Phase 2: Enable local caching",
        description: "Configure Turborepo local cache for faster builds",
        agent: "build-system-engineer",
      },
      {
        name: "Phase 2: Setup parallel execution",
        description: "Optimize task execution with parallel builds",
        agent: "build-system-engineer",
      },
      {
        name: "Phase 3: Configure remote caching",
        description: "Setup Vercel Remote Cache or custom cache server",
        agent: "ci-cd-architect",
      },
      {
        name: "Phase 3: Optimize CI pipeline",
        description: "Use affected package detection to only build changed packages",
        agent: "ci-cd-architect",
      },
      {
        name: "Phase 3: Document monorepo structure",
        description: "Create README with package relationships and scripts",
        agent: "technical-writer-pro",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "legacy-code-refactor-safe",
    kind: "workflow",
    name: "Safe Legacy Code Refactor",
    slug: "legacy-code-refactor-safe",
    description:
      "Refactor legacy code: Test coverage → parallel refactors → validation. 10-15 hours → 4 hours.",
    longDescription:
      "Safe refactoring workflow: Phase 1 - Add test coverage to legacy code + identify refactor targets. Phase 2 - Parallel refactoring (extract functions, simplify conditionals, remove duplication, improve naming). Phase 3 - Validation (test suite passes, performance unchanged, code review).",
    category: "Orchestration & Automation",
    tags: ["Refactoring", "Legacy Code", "Testing", "Code Quality", "Technical Debt", "Workflow"],
    install: "npx @gicm/cli add workflow/legacy-code-refactor-safe",
    orchestrationPattern: "hybrid", // Sequential → Parallel → Sequential
    triggerPhrase: "/refactor-legacy",
    estimatedTime: "4 hours",
    timeSavings: 68,
    requiredAgents: [
      "refactoring-specialist",
      "unit-test-generator",
      "code-quality-guardian",
    ],
    requiredCommands: ["test-coverage", "complexity-report"],
    steps: [
      {
        name: "Phase 1: Analyze legacy code",
        description: "Identify code smells, complexity hotspots, and refactor targets",
        agent: "refactoring-specialist",
        command: "complexity-report",
      },
      {
        name: "Phase 1: Add test coverage",
        description: "Write tests for legacy code to enable safe refactoring",
        agent: "unit-test-generator",
        command: "test-coverage",
      },
      {
        name: "Phase 1: Create refactor plan",
        description: "Prioritize refactoring targets by impact and risk",
        agent: "refactoring-specialist",
      },
      {
        name: "Phase 2: Extract functions (parallel)",
        description: "Break large functions into smaller, reusable pieces",
        agent: "refactoring-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Simplify conditionals (parallel)",
        description: "Replace complex if-else chains with cleaner patterns",
        agent: "refactoring-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Remove code duplication (parallel)",
        description: "Extract duplicated code into shared utilities",
        agent: "refactoring-specialist",
        parallel: true,
      },
      {
        name: "Phase 2: Improve naming (parallel)",
        description: "Rename variables and functions for clarity",
        agent: "code-quality-guardian",
        parallel: true,
      },
      {
        name: "Phase 3: Verify test suite passes",
        description: "Run full test suite to ensure refactors are safe",
        agent: "unit-test-generator",
        command: "test-coverage",
      },
      {
        name: "Phase 3: Validate performance unchanged",
        description: "Benchmark to ensure no performance regressions",
        agent: "performance-engineer",
      },
      {
        name: "Phase 3: Code review refactors",
        description: "Review all changes for correctness and maintainability",
        agent: "code-quality-guardian",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },

  {
    id: "code-quality-baseline-setup",
    kind: "workflow",
    name: "Code Quality Baseline Setup",
    slug: "code-quality-baseline-setup",
    description:
      "Establish code quality tools: ESLint + Prettier + TypeScript + tests + pre-commit hooks. 6-8 hours → 1 hour.",
    longDescription:
      "Code quality infrastructure workflow: Phase 1 - Parallel setup of ESLint with best practices, Prettier formatting, TypeScript strict mode, testing framework. Phase 2 - Configure pre-commit hooks (Husky), CI checks, and IDE integration. Phase 3 - Document coding standards and onboarding guide.",
    category: "Orchestration & Automation",
    tags: ["Code Quality", "ESLint", "TypeScript", "Testing", "DevOps", "Workflow"],
    install: "npx @gicm/cli add workflow/code-quality-baseline-setup",
    orchestrationPattern: "parallel", // Parallel setup
    triggerPhrase: "/setup-code-quality",
    estimatedTime: "1 hour",
    timeSavings: 83,
    requiredAgents: [
      "code-quality-guardian",
      "test-automation-engineer",
      "typescript-precision-engineer",
      "ci-cd-architect",
    ],
    requiredCommands: ["lint-init", "prettier-init", "test-init", "husky-init"],
    steps: [
      {
        name: "Phase 1: Setup ESLint (parallel)",
        description: "Configure ESLint with recommended rules and plugins",
        agent: "code-quality-guardian",
        command: "lint-init",
        parallel: true,
      },
      {
        name: "Phase 1: Setup Prettier (parallel)",
        description: "Configure Prettier with consistent formatting rules",
        agent: "code-quality-guardian",
        command: "prettier-init",
        parallel: true,
      },
      {
        name: "Phase 1: Enable TypeScript strict mode (parallel)",
        description: "Configure strict TypeScript for maximum type safety",
        agent: "typescript-precision-engineer",
        parallel: true,
      },
      {
        name: "Phase 1: Setup testing framework (parallel)",
        description: "Configure Jest/Vitest with test coverage reporting",
        agent: "test-automation-engineer",
        command: "test-init",
        parallel: true,
      },
      {
        name: "Phase 2: Configure pre-commit hooks",
        description: "Setup Husky and lint-staged for pre-commit checks",
        agent: "ci-cd-architect",
        command: "husky-init",
      },
      {
        name: "Phase 2: Add CI quality checks",
        description: "Configure GitHub Actions to run quality checks on PRs",
        agent: "ci-cd-architect",
      },
      {
        name: "Phase 2: Setup IDE integration",
        description: "Add VSCode settings for ESLint and Prettier auto-fix",
        agent: "code-quality-guardian",
      },
      {
        name: "Phase 3: Document coding standards",
        description: "Create style guide and best practices documentation",
        agent: "technical-writer-pro",
      },
      {
        name: "Phase 3: Create onboarding guide",
        description: "Write guide for new developers on quality tools",
        agent: "tutorial-creator",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },
  {
    id: "full-icm-research",
    kind: "workflow",
    name: "Full ICM Research",
    slug: "full-icm-research",
    description: "Complete ICM token launch research workflow. Orchestrates 4 agents for comprehensive analysis with final BUY/WAIT/AVOID recommendation.",
    longDescription: "Comprehensive research workflow that orchestrates ICM Analyst, Whale Tracker, Rug Detector, and Sentiment Analyzer in sequence. Provides combined scoring matrix with weighted analysis (30% fundamentals, 25% whale activity, 25% rug risk, 20% sentiment). Delivers actionable BUY/WAIT/AVOID recommendation with position sizing and risk parameters. Perfect for pre-entry due diligence on new token launches.",
    category: "ICM & Crypto",
    tags: ["ICM", "Research", "Trading", "Due Diligence", "Multi-Agent", "Orchestration"],
    install: "npx @gicm/cli add workflow/full-icm-research",
    orchestrationPattern: "sequential",
    triggerPhrase: "/icm-research",
    estimatedTime: "3-5 minutes",
    timeSavings: 95,
    requiredAgents: ["icm-analyst", "whale-tracker", "rug-detector", "sentiment-analyzer"],
    requiredCommands: [],
    requiredSkills: [],
    steps: [
      {
        name: "Phase 1: Fundamental Analysis",
        description: "Analyze tokenomics, liquidity, and contract security",
        agent: "icm-analyst",
      },
      {
        name: "Phase 2: Whale Activity Analysis",
        description: "Track smart money wallets and large holder patterns",
        agent: "whale-tracker",
      },
      {
        name: "Phase 3: Rug Risk Assessment",
        description: "Detect rug pull indicators and contract vulnerabilities",
        agent: "rug-detector",
      },
      {
        name: "Phase 4: Sentiment Analysis",
        description: "Analyze social signals and community health",
        agent: "sentiment-analyzer",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },
  {
    id: "launch-monitoring",
    kind: "workflow",
    name: "Launch Monitoring",
    slug: "launch-monitoring",
    description: "Continuous 24/7 monitoring after position entry. Parallel execution of rug detection, whale tracking, and sentiment analysis with real-time alerts.",
    longDescription: "Automated monitoring system that runs continuously after entering an ICM position. Executes Rug Detector (every 30s), Whale Tracker (every 60s), and Sentiment Analyzer (every 2min) in parallel. Sends real-time CRITICAL/WARNING/INFO alerts via Discord, Telegram, or Email. Includes automated exit triggers when risk thresholds are breached. Essential for protecting capital in volatile ICM launches.",
    category: "ICM & Crypto",
    tags: ["ICM", "Monitoring", "Alerts", "Risk Management", "Automation", "Real-Time"],
    install: "npx @gicm/cli add workflow/launch-monitoring",
    orchestrationPattern: "parallel",
    triggerPhrase: "/icm-monitor",
    estimatedTime: "Continuous (24/7)",
    timeSavings: 98,
    requiredAgents: ["rug-detector", "whale-tracker", "sentiment-analyzer"],
    requiredCommands: [],
    requiredSkills: [],
    steps: [
      {
        name: "Monitor rug signals (every 30s)",
        description: "Continuous rug pull detection with emergency exit triggers",
        agent: "rug-detector",
        parallel: true,
      },
      {
        name: "Track whale movements (every 60s)",
        description: "Monitor smart money wallets and large holder activity",
        agent: "whale-tracker",
        parallel: true,
      },
      {
        name: "Analyze sentiment shifts (every 2min)",
        description: "Track social signals and community health changes",
        agent: "sentiment-analyzer",
        parallel: true,
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },
  {
    id: "rug-protection",
    kind: "workflow",
    name: "Rug Protection",
    slug: "rug-protection",
    description: "Three-tier defense system: pre-entry validation, continuous monitoring, and emergency exit. Blocks entry if rug score >70, auto-exits when critical thresholds breached.",
    longDescription: "Comprehensive rug pull protection system with three defense layers. Tier 1: Pre-entry validation blocks risky launches (rug score >70). Tier 2: Continuous monitoring every 15-30 seconds tracks LP drains, dev sells, contract changes. Tier 3: Emergency exit system triggers in <5 seconds when critical thresholds breached (LP drain >50%, dev sells >5%, rug score >85). Includes post-rug forensics report generation. Essential for capital preservation in ICM trading.",
    category: "ICM & Crypto",
    tags: ["ICM", "Security", "Risk Management", "Rug Detection", "Protection", "Automation"],
    install: "npx @gicm/cli add workflow/rug-protection",
    orchestrationPattern: "sequential",
    triggerPhrase: "/icm-protect",
    estimatedTime: "Continuous validation",
    timeSavings: 99,
    requiredAgents: ["rug-detector", "icm-analyst"],
    requiredCommands: [],
    requiredSkills: [],
    steps: [
      {
        name: "Tier 1: Pre-entry validation",
        description: "Block entry if rug score >70 or critical red flags detected",
        agent: "rug-detector",
      },
      {
        name: "Tier 2: Continuous monitoring",
        description: "Monitor LP drains, dev sells, contract changes every 15-30s",
        agent: "rug-detector",
      },
      {
        name: "Tier 3: Emergency exit system",
        description: "Auto-exit in <5s when critical thresholds breached",
        agent: "rug-detector",
      },
      {
        name: "Post-rug forensics",
        description: "Generate detailed report after rug detection",
        agent: "icm-analyst",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },
  {
    id: "smart-entry-exit",
    kind: "workflow",
    name: "Smart Entry Exit",
    slug: "smart-entry-exit",
    description: "Complete trading lifecycle orchestration. 5 stages: Research → Timing → Entry → Monitoring → Exit with intelligent profit-taking and dynamic stop loss.",
    longDescription: "End-to-end trading workflow managing complete ICM position lifecycle. Stage 1: Comprehensive research (Full ICM Research workflow). Stage 2: Entry timing optimization (waits for consolidation, avoids FOMO). Stage 3: Precise entry execution with slippage protection. Stage 4: Continuous monitoring with Launch Monitoring workflow. Stage 5: Intelligent exit with partial profit-taking (25% at 2x, 25% at 3x, 25% at 5x, 25% moon bag), dynamic stop loss management, and emergency exits on whale/rug signals. Maximizes returns while protecting capital.",
    category: "ICM & Crypto",
    tags: ["ICM", "Trading", "Automation", "Entry", "Exit", "Lifecycle", "Orchestration"],
    install: "npx @gicm/cli add workflow/smart-entry-exit",
    orchestrationPattern: "sequential",
    triggerPhrase: "/icm-trade",
    estimatedTime: "Variable (full lifecycle)",
    timeSavings: 97,
    requiredAgents: ["icm-analyst", "whale-tracker", "rug-detector", "sentiment-analyzer"],
    requiredCommands: [],
    requiredSkills: [],
    steps: [
      {
        name: "Stage 1: Research",
        description: "Execute Full ICM Research workflow for comprehensive analysis",
        agent: "icm-analyst",
      },
      {
        name: "Stage 2: Entry Timing",
        description: "Optimize entry timing, wait for consolidation, avoid FOMO",
        agent: "whale-tracker",
      },
      {
        name: "Stage 3: Entry Execution",
        description: "Execute entry with slippage protection and position sizing",
        agent: "icm-analyst",
      },
      {
        name: "Stage 4: Continuous Monitoring",
        description: "Launch monitoring workflow with real-time alerts",
        agent: "rug-detector",
        parallel: true,
      },
      {
        name: "Stage 4: Whale tracking (parallel)",
        description: "Track smart money movements during hold period",
        agent: "whale-tracker",
        parallel: true,
      },
      {
        name: "Stage 4: Sentiment monitoring (parallel)",
        description: "Monitor social signals and community health",
        agent: "sentiment-analyzer",
        parallel: true,
      },
      {
        name: "Stage 5: Intelligent Exit",
        description: "Execute partial profit-taking, dynamic stop loss, emergency exits",
        agent: "icm-analyst",
      },
    ],
    installs: 0,
    remixes: 0,
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },
  },
];
