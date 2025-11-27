import type { RegistryItem } from "@/types/registry";

export const OPENAI_TOOLS: RegistryItem[] = [
    // ========================================================================
    // VIBE CODING FEATURED AGENTS (OpenAI Optimized)
    // ========================================================================
    {
        id: "openai-reasoning-pro",
        kind: "agent",
        name: "OpenAI Reasoning Pro",
        slug: "openai-reasoning-pro",
        description: "Deep reasoning with o1 model for complex multi-step problems. Perfect for architecture decisions and algorithm design.",
        longDescription: "Leverages OpenAI's o1 reasoning model for problems requiring deep thinking. Excels at breaking down complex problems, designing system architectures, solving algorithmic challenges, and providing step-by-step explanations. Uses chain-of-thought reasoning for accuracy on difficult tasks.",
        category: "Vibe Coding",
        tags: ["OpenAI", "Reasoning", "o1", "Architecture", "Featured"],
        files: [".openai/agents/openai-reasoning-pro.md"],
        layer: ".openai",
        install: "npx @gicm/cli add agent/openai-reasoning-pro --platform=openai",
        platforms: ["openai"],
        modelRecommendation: "opus-4.5",
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor", "terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-reasoning-pro --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-code-auditor",
        kind: "agent",
        name: "OpenAI Code Auditor",
        slug: "openai-code-auditor",
        description: "Security-focused code review using GPT-4o. Identifies vulnerabilities, suggests fixes, and ensures best practices.",
        longDescription: "Comprehensive code auditing agent powered by GPT-4o's function calling. Scans for OWASP Top 10 vulnerabilities, performance issues, code smells, and security anti-patterns. Provides actionable fix suggestions with inline code examples. Supports JavaScript, TypeScript, Python, Go, and Rust.",
        category: "Vibe Coding",
        tags: ["OpenAI", "Security", "Code Review", "Audit", "Featured"],
        files: [".openai/agents/openai-code-auditor.md"],
        layer: ".openai",
        install: "npx @gicm/cli add agent/openai-code-auditor --platform=openai",
        platforms: ["openai"],
        modelRecommendation: "opus-4.5",
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-code-auditor --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-image-gen",
        kind: "agent",
        name: "OpenAI Image Generator",
        slug: "openai-image-gen",
        description: "Generate app assets, icons, and UI mockups with DALL-E 3. From text to stunning visuals in seconds.",
        longDescription: "Combines GPT-4o's prompt engineering with DALL-E 3 image generation for development assets. Create app icons, hero images, placeholder graphics, social media images, and UI concept mockups. Includes prompt optimization for consistent, high-quality results.",
        category: "Vibe Coding",
        tags: ["OpenAI", "DALL-E", "Image Generation", "Assets", "Featured"],
        files: [".openai/agents/openai-image-gen.md"],
        layer: ".openai",
        install: "npx @gicm/cli add agent/openai-image-gen --platform=openai",
        platforms: ["openai"],
        modelRecommendation: "opus-4.5",
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor", "terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-image-gen --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-assistant-builder",
        kind: "agent",
        name: "OpenAI Assistant Builder",
        slug: "openai-assistant-builder",
        description: "Build custom AI assistants with OpenAI's Assistants API. Function calling, file search, and code interpreter ready.",
        longDescription: "Scaffolds production-ready OpenAI Assistants with built-in tools. Generates boilerplate for function calling schemas, file search configuration, and code interpreter setup. Creates type-safe TypeScript SDKs for your assistants. Perfect for building AI-powered features into your apps.",
        category: "Vibe Coding",
        tags: ["OpenAI", "Assistants API", "Function Calling", "SDK", "Featured"],
        files: [".openai/agents/openai-assistant-builder.md"],
        layer: ".openai",
        install: "npx @gicm/cli add agent/openai-assistant-builder --platform=openai",
        platforms: ["openai"],
        modelRecommendation: "opus-4.5",
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor", "terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-assistant-builder --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },

    // ========================================================================
    // CODING AGENTS
    // ========================================================================
    {
        id: "openai-fullstack-dev",
        kind: "agent",
        name: "OpenAI Full-Stack Dev",
        slug: "openai-fullstack-dev",
        description: "End-to-end application development with GPT-4o. Frontend, backend, and database in one agent.",
        category: "Coding Agents",
        tags: ["OpenAI", "Full-Stack", "React", "Node.js"],
        install: "npx @gicm/cli add agent/openai-fullstack-dev --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-fullstack-dev --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-api-designer",
        kind: "agent",
        name: "OpenAI API Designer",
        slug: "openai-api-designer",
        description: "Design RESTful and GraphQL APIs with OpenAPI spec generation and documentation.",
        category: "Coding Agents",
        tags: ["OpenAI", "API", "REST", "GraphQL", "OpenAPI"],
        install: "npx @gicm/cli add agent/openai-api-designer --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-api-designer --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-test-engineer",
        kind: "agent",
        name: "OpenAI Test Engineer",
        slug: "openai-test-engineer",
        description: "Generate comprehensive test suites with Jest, Vitest, Playwright, and Cypress.",
        category: "Coding Agents",
        tags: ["OpenAI", "Testing", "Jest", "Playwright"],
        install: "npx @gicm/cli add agent/openai-test-engineer --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-test-engineer --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-refactor-wizard",
        kind: "agent",
        name: "OpenAI Refactor Wizard",
        slug: "openai-refactor-wizard",
        description: "Intelligent code refactoring with SOLID principles, DRY patterns, and performance optimization.",
        category: "Coding Agents",
        tags: ["OpenAI", "Refactoring", "Clean Code", "Performance"],
        install: "npx @gicm/cli add agent/openai-refactor-wizard --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-refactor-wizard --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-debug-detective",
        kind: "agent",
        name: "OpenAI Debug Detective",
        slug: "openai-debug-detective",
        description: "Analyze stack traces, identify root causes, and suggest fixes for complex bugs.",
        category: "Coding Agents",
        tags: ["OpenAI", "Debugging", "Error Analysis"],
        install: "npx @gicm/cli add agent/openai-debug-detective --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor", "terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-debug-detective --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },

    // ========================================================================
    // DEVOPS & INFRASTRUCTURE
    // ========================================================================
    {
        id: "openai-devops-architect",
        kind: "agent",
        name: "OpenAI DevOps Architect",
        slug: "openai-devops-architect",
        description: "Design CI/CD pipelines, Docker configurations, and Kubernetes deployments.",
        category: "DevOps & Cloud",
        tags: ["OpenAI", "DevOps", "CI/CD", "Docker", "K8s"],
        install: "npx @gicm/cli add agent/openai-devops-architect --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-devops-architect --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-cloud-cost-optimizer",
        kind: "agent",
        name: "OpenAI Cloud Cost Optimizer",
        slug: "openai-cloud-cost-optimizer",
        description: "Analyze cloud spending and suggest cost-saving optimizations for AWS, GCP, and Azure.",
        category: "DevOps & Cloud",
        tags: ["OpenAI", "Cloud", "Cost Optimization", "FinOps"],
        install: "npx @gicm/cli add agent/openai-cloud-cost-optimizer --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-cloud-cost-optimizer --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },

    // ========================================================================
    // WEB3 & BLOCKCHAIN
    // ========================================================================
    {
        id: "openai-smart-contract-auditor",
        kind: "agent",
        name: "OpenAI Smart Contract Auditor",
        slug: "openai-smart-contract-auditor",
        description: "Audit Solidity and Rust smart contracts for security vulnerabilities and gas optimization.",
        category: "Web3",
        tags: ["OpenAI", "Web3", "Solidity", "Security", "Audit"],
        install: "npx @gicm/cli add agent/openai-smart-contract-auditor --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-smart-contract-auditor --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-defi-builder",
        kind: "agent",
        name: "OpenAI DeFi Builder",
        slug: "openai-defi-builder",
        description: "Build DeFi protocols with AMM, lending, and staking contract templates.",
        category: "Web3",
        tags: ["OpenAI", "DeFi", "Smart Contracts", "AMM"],
        install: "npx @gicm/cli add agent/openai-defi-builder --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-defi-builder --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },

    // ========================================================================
    // CREATIVE & CONTENT
    // ========================================================================
    {
        id: "openai-voice-assistant",
        kind: "agent",
        name: "OpenAI Voice Assistant",
        slug: "openai-voice-assistant",
        description: "Build voice-enabled apps with OpenAI Realtime API and WebRTC integration.",
        category: "Creative",
        tags: ["OpenAI", "Voice", "Realtime API", "WebRTC"],
        install: "npx @gicm/cli add agent/openai-voice-assistant --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["vscode", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-voice-assistant --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-content-writer",
        kind: "agent",
        name: "OpenAI Content Writer",
        slug: "openai-content-writer",
        description: "Generate technical documentation, blog posts, and marketing copy with SEO optimization.",
        category: "Creative",
        tags: ["OpenAI", "Content", "Writing", "SEO"],
        install: "npx @gicm/cli add agent/openai-content-writer --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["terminal"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-content-writer --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },

    // ========================================================================
    // DATA & ANALYTICS
    // ========================================================================
    {
        id: "openai-data-analyst",
        kind: "agent",
        name: "OpenAI Data Analyst",
        slug: "openai-data-analyst",
        description: "Analyze datasets, generate insights, and create visualizations with Code Interpreter.",
        category: "Data Science",
        tags: ["OpenAI", "Data", "Analytics", "Visualization"],
        install: "npx @gicm/cli add agent/openai-data-analyst --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["terminal", "cursor"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-data-analyst --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
    {
        id: "openai-sql-master",
        kind: "agent",
        name: "OpenAI SQL Master",
        slug: "openai-sql-master",
        description: "Convert natural language to optimized SQL queries with schema understanding.",
        category: "Data Science",
        tags: ["OpenAI", "SQL", "Database", "Query Optimization"],
        install: "npx @gicm/cli add agent/openai-sql-master --platform=openai",
        platforms: ["openai"],
        compatibility: {
            models: ["gpt-4o", "gpt-4o-mini"],
            software: ["terminal", "vscode"],
        },
        implementations: {
            openai: { install: "npx @gicm/cli add agent/openai-sql-master --platform=openai" },
        
    },
    audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        
    }
    },
];
