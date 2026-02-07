import type { RegistryItem } from "@/types/registry";

export const GEMINI_TOOLS: RegistryItem[] = [
  // ========================================================================
  // VIBE CODING FEATURED AGENTS (Gemini 2.0 Optimized)
  // ========================================================================
  {
    id: "gemini-vibe-coder",
    kind: "agent",
    name: "Gemini Vibe Coder",
    slug: "gemini-vibe-coder",
    description:
      "Transform natural language into full-stack applications. Describe your app in plain English and watch it come to life.",
    longDescription:
      "The flagship Gemini 2.0 agent for vibe coding. Uses Gemini's 1M token context to understand entire project structures, then generates complete applications from natural language descriptions. Supports React, Next.js, Vue, and more. Perfect for rapid prototyping and turning ideas into working code.",
    category: "Vibe Coding",
    tags: ["Gemini", "Vibe Coding", "Full-Stack", "AI-First", "Featured"],
    files: [".gemini/agents/gemini-vibe-coder.md"],
    layer: ".gemini",
    install: "npx @clawdbot/cli add agent/gemini-vibe-coder --platform=gemini",
    platforms: ["gemini"],
    modelRecommendation: "opus-4.5",
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor", "terminal"],
    },
    implementations: {
      gemini: {
        install:
          "npx @clawdbot/cli add agent/gemini-vibe-coder --platform=gemini",
      },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-visual-builder",
    kind: "agent",
    name: "Gemini Visual Builder",
    slug: "gemini-visual-builder",
    description:
      "Upload screenshots or wireframes, get pixel-perfect React/Tailwind components. Multimodal magic.",
    longDescription:
      "Leverages Gemini 2.0's native multimodal capabilities to convert visual designs into production code. Upload a Figma screenshot, hand-drawn wireframe, or even a photo of a whiteboard sketch, and receive clean React + Tailwind CSS components. Supports responsive design and accessibility by default.",
    category: "Vibe Coding",
    tags: ["Gemini", "Multimodal", "UI/UX", "Design-to-Code", "Featured"],
    files: [".gemini/agents/gemini-visual-builder.md"],
    layer: ".gemini",
    install:
      "npx @clawdbot/cli add agent/gemini-visual-builder --platform=gemini",
    platforms: ["gemini"],
    modelRecommendation: "opus-4.5",
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor"],
    },
    implementations: {
      gemini: {
        install:
          "npx @clawdbot/cli add agent/gemini-visual-builder --platform=gemini",
      },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-code-executor",
    kind: "agent",
    name: "Gemini Code Executor",
    slug: "gemini-code-executor",
    description:
      "Run Python code in a sandboxed environment. Execute, test, and iterate in real-time without local setup.",
    longDescription:
      "Uses Gemini 2.0's native code execution capability to run Python code in a secure sandbox. Perfect for data analysis, algorithm testing, and rapid prototyping. No local Python setup required - the code runs directly in Google's infrastructure. Supports libraries like pandas, numpy, matplotlib, and more.",
    category: "Vibe Coding",
    tags: ["Gemini", "Code Execution", "Python", "Sandbox", "Featured"],
    files: [".gemini/agents/gemini-code-executor.md"],
    layer: ".gemini",
    install:
      "npx @clawdbot/cli add agent/gemini-code-executor --platform=gemini",
    platforms: ["gemini"],
    modelRecommendation: "opus-4.5",
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor", "terminal"],
    },
    implementations: {
      gemini: {
        install:
          "npx @clawdbot/cli add agent/gemini-code-executor --platform=gemini",
      },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-research-agent",
    kind: "agent",
    name: "Gemini Research Agent",
    slug: "gemini-research-agent",
    description:
      "AI-powered research with Google Search grounding. Get accurate, up-to-date information for your projects.",
    longDescription:
      "Combines Gemini 2.0's reasoning capabilities with Google Search grounding for accurate, real-time research. Perfect for technical documentation research, API discovery, library comparisons, and staying current with best practices. Cites sources and provides verifiable information.",
    category: "Vibe Coding",
    tags: ["Gemini", "Research", "Search", "Documentation", "Featured"],
    files: [".gemini/agents/gemini-research-agent.md"],
    layer: ".gemini",
    install:
      "npx @clawdbot/cli add agent/gemini-research-agent --platform=gemini",
    platforms: ["gemini"],
    modelRecommendation: "opus-4.5",
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor", "terminal"],
    },
    implementations: {
      gemini: {
        install:
          "npx @clawdbot/cli add agent/gemini-research-agent --platform=gemini",
      },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // PROJECT SPECIFIC AGENTS (gICM Optimization)
  // ========================================================================
  {
    id: "gemini-registry-architect",
    kind: "agent",
    name: "Gemini Registry Architect",
    slug: "gemini-registry-architect",
    description:
      "Specialist for gICM's registry system. Adds agents/skills to src/lib/registry.ts efficiently.",
    longDescription:
      "Context-aware agent that understands the `RegistryItem` schema and the structure of `src/lib/registry.ts`. It can generate valid registry entries without hallucinating fields, ensuring strict adherence to Zod schemas.",
    category: "Project Specific",
    tags: ["Gemini", "gICM", "Registry", "System"],
    files: [".gemini/agents/gemini-registry-architect.md"],
    layer: ".gemini",
    install: "npx @clawdbot/cli add agent/gemini-registry-architect",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor"],
    },
    implementations: {
      gemini: {
        install: "npx @clawdbot/cli add agent/gemini-registry-architect",
      },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-shadcn-designer",
    kind: "agent",
    name: "Gemini Shadcn Designer",
    slug: "gemini-shadcn-designer",
    description:
      "UI specialist for gICM. Generates Tailwind components using the project's acid-lime design system.",
    longDescription:
      "Expert in `shadcn/ui` and the project's `tailwind.config.ts`. Generates components that use the custom `icm` color palette (primary: #D1FD0A, bg: #0A0A0A) and correctly imports from `@/components/ui`. Prevents style clashes and ensures visual consistency.",
    category: "Project Specific",
    tags: ["Gemini", "UI", "Tailwind", "Shadcn", "Design System"],
    files: [".gemini/agents/gemini-shadcn-designer.md"],
    layer: ".gemini",
    install: "npx @clawdbot/cli add agent/gemini-shadcn-designer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor"],
    },
    implementations: {
      gemini: { install: "npx @clawdbot/cli add agent/gemini-shadcn-designer" },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-next-router-expert",
    kind: "agent",
    name: "Gemini Next Router Expert",
    slug: "gemini-next-router-expert",
    description:
      "Next.js 15 App Router specialist. optimized for Server Components and Async Layouts.",
    longDescription:
      "Deep knowledge of `src/app` directory structure. Can create `page.tsx`, `layout.tsx`, and `loading.tsx` files that follow Next.js 15 best practices (async components, server actions, metadata API). avoids 'use client' overuse.",
    category: "Project Specific",
    tags: ["Gemini", "Next.js", "App Router", "Server Components"],
    files: [".gemini/agents/gemini-next-router-expert.md"],
    layer: ".gemini",
    install: "npx @clawdbot/cli add agent/gemini-next-router-expert",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode", "cursor"],
    },
    implementations: {
      gemini: {
        install: "npx @clawdbot/cli add agent/gemini-next-router-expert",
      },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // ADVANCED CODING AGENTS
  // ========================================================================
  {
    id: "gemini-architect",
    kind: "agent",
    name: "Gemini Architect",
    slug: "gemini-architect",
    description:
      "Analyzes codebase structure and suggests modular improvements.",
    category: "Coding Agents",
    tags: ["Gemini", "Architecture", "Refactoring"],
    install: "npx @clawdbot/cli add agent/gemini-architect",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal", "vscode"],
    },
    implementations: {
      gemini: { install: "npx @clawdbot/cli add agent/gemini-architect" },
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-refactor-pro",
    kind: "agent",
    name: "Gemini Refactor Pro",
    slug: "gemini-refactor-pro",
    description:
      "Intelligent refactoring agent that adheres to SOLID principles.",
    category: "Coding Agents",
    tags: ["Gemini", "Refactoring", "SOLID"],
    install: "npx @clawdbot/cli add agent/gemini-refactor-pro",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["cursor"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-test-gen",
    kind: "agent",
    name: "Gemini Test Gen",
    slug: "gemini-test-gen",
    description: "Auto-generates Jest/Vitest suites with 100% coverage goals.",
    category: "Coding Agents",
    tags: ["Gemini", "Testing", "Jest"],
    install: "npx @clawdbot/cli add agent/gemini-test-gen",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-doc-writer",
    kind: "agent",
    name: "Gemini Doc Writer",
    slug: "gemini-doc-writer",
    description:
      "Writes TSDoc/JSDoc and updates README.md based on code changes.",
    category: "Coding Agents",
    tags: ["Gemini", "Documentation"],
    install: "npx @clawdbot/cli add agent/gemini-doc-writer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-debugger",
    kind: "agent",
    name: "Gemini Debugger",
    slug: "gemini-debugger",
    description: "Analyzes stack traces and suggests 3 potential fixes.",
    category: "Coding Agents",
    tags: ["Gemini", "Debugging"],
    install: "npx @clawdbot/cli add agent/gemini-debugger",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-security-audit",
    kind: "agent",
    name: "Gemini Security Audit",
    slug: "gemini-security-audit",
    description: "Scans for OWASP Top 10 vulnerabilities in code.",
    category: "Coding Agents",
    tags: ["Gemini", "Security", "OWASP"],
    install: "npx @clawdbot/cli add agent/gemini-security-audit",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-api-mocker",
    kind: "agent",
    name: "Gemini API Mocker",
    slug: "gemini-api-mocker",
    description: "Generates mock API endpoints based on TypeScript interfaces.",
    category: "Coding Agents",
    tags: ["Gemini", "API", "Mocking"],
    install: "npx @clawdbot/cli add agent/gemini-api-mocker",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-ui-builder",
    kind: "agent",
    name: "Gemini UI Builder",
    slug: "gemini-ui-builder",
    description: "Converts text descriptions to React/Tailwind components.",
    category: "Coding Agents",
    tags: ["Gemini", "UI", "React", "Tailwind"],
    install: "npx @clawdbot/cli add agent/gemini-ui-builder",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["cursor"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-sql-optimizer",
    kind: "agent",
    name: "Gemini SQL Optimizer",
    slug: "gemini-sql-optimizer",
    description: "Analyzes SQL queries and suggests index improvements.",
    category: "Coding Agents",
    tags: ["Gemini", "SQL", "Database"],
    install: "npx @clawdbot/cli add agent/gemini-sql-optimizer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-regex-wizard",
    kind: "agent",
    name: "Gemini Regex Wizard",
    slug: "gemini-regex-wizard",
    description: "Generates and explains complex Regex patterns.",
    category: "Coding Agents",
    tags: ["Gemini", "Regex"],
    install: "npx @clawdbot/cli add agent/gemini-regex-wizard",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // DEVOPS & CLOUD
  // ========================================================================
  {
    id: "gemini-dockerizer",
    kind: "agent",
    name: "Gemini Dockerizer",
    slug: "gemini-dockerizer",
    description: "Generates optimized Dockerfiles for any stack.",
    category: "DevOps & Cloud",
    tags: ["Gemini", "Docker", "DevOps"],
    install: "npx @clawdbot/cli add agent/gemini-dockerizer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-k8s-manifest",
    kind: "agent",
    name: "Gemini K8s Manifest",
    slug: "gemini-k8s-manifest",
    description: "Writes Kubernetes YAMLs from plain English.",
    category: "DevOps & Cloud",
    tags: ["Gemini", "Kubernetes", "K8s"],
    install: "npx @clawdbot/cli add agent/gemini-k8s-manifest",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-ci-pipeline",
    kind: "agent",
    name: "Gemini CI Pipeline",
    slug: "gemini-ci-pipeline",
    description: "Generates GitHub Actions / GitLab CI workflows.",
    category: "DevOps & Cloud",
    tags: ["Gemini", "CI/CD", "GitHub Actions"],
    install: "npx @clawdbot/cli add agent/gemini-ci-pipeline",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-aws-terraform",
    kind: "agent",
    name: "Gemini AWS Terraform",
    slug: "gemini-aws-terraform",
    description: "Writes Terraform code for AWS infrastructure.",
    category: "DevOps & Cloud",
    tags: ["Gemini", "AWS", "Terraform", "IaC"],
    install: "npx @clawdbot/cli add agent/gemini-aws-terraform",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-gcp-deploy",
    kind: "agent",
    name: "Gemini GCP Deploy",
    slug: "gemini-gcp-deploy",
    description: "Auto-deploys to Google Cloud Run.",
    category: "DevOps & Cloud",
    tags: ["Gemini", "GCP", "Cloud Run"],
    install: "npx @clawdbot/cli add agent/gemini-gcp-deploy",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // DATA SCIENCE
  // ========================================================================
  {
    id: "gemini-pandas-helper",
    kind: "agent",
    name: "Gemini Pandas Helper",
    slug: "gemini-pandas-helper",
    description: "Generates Pandas data manipulation code.",
    category: "Data Science",
    tags: ["Gemini", "Python", "Pandas", "Data"],
    install: "npx @clawdbot/cli add agent/gemini-pandas-helper",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["cursor"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-viz-creator",
    kind: "agent",
    name: "Gemini Viz Creator",
    slug: "gemini-viz-creator",
    description: "Creates Plotly/Matplotlib charts from CSVs.",
    category: "Data Science",
    tags: ["Gemini", "Visualization", "Python"],
    install: "npx @clawdbot/cli add agent/gemini-viz-creator",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["cursor"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-etl-pipeline",
    kind: "agent",
    name: "Gemini ETL Pipeline",
    slug: "gemini-etl-pipeline",
    description: "Writes Python ETL scripts.",
    category: "Data Science",
    tags: ["Gemini", "ETL", "Data Engineering"],
    install: "npx @clawdbot/cli add agent/gemini-etl-pipeline",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-sql-generator",
    kind: "agent",
    name: "Gemini SQL Generator",
    slug: "gemini-sql-generator",
    description: "Converts natural language to complex SQL.",
    category: "Data Science",
    tags: ["Gemini", "SQL"],
    install: "npx @clawdbot/cli add agent/gemini-sql-generator",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-data-cleaner",
    kind: "agent",
    name: "Gemini Data Cleaner",
    slug: "gemini-data-cleaner",
    description: "Automates data cleaning workflows.",
    category: "Data Science",
    tags: ["Gemini", "Data Cleaning", "Python"],
    install: "npx @clawdbot/cli add agent/gemini-data-cleaner",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["cursor"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // CONTENT & CREATIVE
  // ========================================================================
  {
    id: "gemini-blog-writer",
    kind: "agent",
    name: "Gemini Blog Writer",
    slug: "gemini-blog-writer",
    description: "SEO-optimized blog post generator.",
    category: "Content & Creative",
    tags: ["Gemini", "Writing", "SEO", "Blog"],
    install: "npx @clawdbot/cli add agent/gemini-blog-writer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-social-scheduler",
    kind: "agent",
    name: "Gemini Social Scheduler",
    slug: "gemini-social-scheduler",
    description: "Generates social media calendars.",
    category: "Content & Creative",
    tags: ["Gemini", "Social Media", "Marketing"],
    install: "npx @clawdbot/cli add agent/gemini-social-scheduler",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-email-marketer",
    kind: "agent",
    name: "Gemini Email Marketer",
    slug: "gemini-email-marketer",
    description: "Writes drip campaign sequences.",
    category: "Content & Creative",
    tags: ["Gemini", "Email", "Marketing"],
    install: "npx @clawdbot/cli add agent/gemini-email-marketer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-video-script",
    kind: "agent",
    name: "Gemini Video Script",
    slug: "gemini-video-script",
    description: "Writes YouTube video scripts.",
    category: "Content & Creative",
    tags: ["Gemini", "YouTube", "Video", "Script"],
    install: "npx @clawdbot/cli add agent/gemini-video-script",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-image-prompt",
    kind: "agent",
    name: "Gemini Image Prompt",
    slug: "gemini-image-prompt",
    description: "Optimizes Midjourney/DALL-E prompts.",
    category: "Content & Creative",
    tags: ["Gemini", "Art", "Prompts"],
    install: "npx @clawdbot/cli add agent/gemini-image-prompt",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // ENTERPRISE & SECURITY
  // ========================================================================
  {
    id: "gemini-gdpr-audit",
    kind: "agent",
    name: "Gemini GDPR Audit",
    slug: "gemini-gdpr-audit",
    description: "Checks data handling for GDPR compliance.",
    category: "Enterprise",
    tags: ["Gemini", "GDPR", "Compliance"],
    install: "npx @clawdbot/cli add agent/gemini-gdpr-audit",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-contract-review",
    kind: "agent",
    name: "Gemini Contract Review",
    slug: "gemini-contract-review",
    description: "Summarizes legal contracts.",
    category: "Enterprise",
    tags: ["Gemini", "Legal", "Contracts"],
    install: "npx @clawdbot/cli add agent/gemini-contract-review",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-policy-writer",
    kind: "agent",
    name: "Gemini Policy Writer",
    slug: "gemini-policy-writer",
    description: "Drafts company policies (HR, IT).",
    category: "Enterprise",
    tags: ["Gemini", "HR", "Policy"],
    install: "npx @clawdbot/cli add agent/gemini-policy-writer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-meeting-minutes",
    kind: "agent",
    name: "Gemini Meeting Minutes",
    slug: "gemini-meeting-minutes",
    description: "Summarizes meeting transcripts.",
    category: "Enterprise",
    tags: ["Gemini", "Meetings", "Productivity"],
    install: "npx @clawdbot/cli add agent/gemini-meeting-minutes",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-recruiter-bot",
    kind: "agent",
    name: "Gemini Recruiter Bot",
    slug: "gemini-recruiter-bot",
    description: "Screens resumes against job descriptions.",
    category: "Enterprise",
    tags: ["Gemini", "HR", "Recruiting"],
    install: "npx @clawdbot/cli add agent/gemini-recruiter-bot",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // EDUCATION & LEARNING
  // ========================================================================
  {
    id: "gemini-tutor-math",
    kind: "agent",
    name: "Gemini Math Tutor",
    slug: "gemini-tutor-math",
    description: "Step-by-step calculus and algebra solver.",
    category: "Education",
    tags: ["Gemini", "Math", "Education"],
    install: "npx @clawdbot/cli add agent/gemini-tutor-math",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-language-coach",
    kind: "agent",
    name: "Gemini Language Coach",
    slug: "gemini-language-coach",
    description: "Conversational partner for learning Spanish/French/Japanese.",
    category: "Education",
    tags: ["Gemini", "Language", "Learning"],
    install: "npx @clawdbot/cli add agent/gemini-language-coach",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-history-buff",
    kind: "agent",
    name: "Gemini History Buff",
    slug: "gemini-history-buff",
    description: "Interactive history lessons and fact checking.",
    category: "Education",
    tags: ["Gemini", "History", "Education"],
    install: "npx @clawdbot/cli add agent/gemini-history-buff",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-code-mentor",
    kind: "agent",
    name: "Gemini Code Mentor",
    slug: "gemini-code-mentor",
    description: "Explains algorithms and data structures simply.",
    category: "Education",
    tags: ["Gemini", "Coding", "Education"],
    install: "npx @clawdbot/cli add agent/gemini-code-mentor",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-science-lab",
    kind: "agent",
    name: "Gemini Science Lab",
    slug: "gemini-science-lab",
    description: "Simulates physics and chemistry experiments.",
    category: "Education",
    tags: ["Gemini", "Science", "Physics"],
    install: "npx @clawdbot/cli add agent/gemini-science-lab",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // PERSONAL PRODUCTIVITY
  // ========================================================================
  {
    id: "gemini-travel-planner",
    kind: "agent",
    name: "Gemini Travel Planner",
    slug: "gemini-travel-planner",
    description: "Creates detailed travel itineraries with budget tracking.",
    category: "Productivity",
    tags: ["Gemini", "Travel", "Planning"],
    install: "npx @clawdbot/cli add agent/gemini-travel-planner",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-meal-prep",
    kind: "agent",
    name: "Gemini Meal Prep",
    slug: "gemini-meal-prep",
    description: "Generates weekly meal plans and shopping lists.",
    category: "Productivity",
    tags: ["Gemini", "Food", "Health"],
    install: "npx @clawdbot/cli add agent/gemini-meal-prep",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-finance-tracker",
    kind: "agent",
    name: "Gemini Finance Tracker",
    slug: "gemini-finance-tracker",
    description: "Categorizes expenses and suggests budget cuts.",
    category: "Productivity",
    tags: ["Gemini", "Finance", "Money"],
    install: "npx @clawdbot/cli add agent/gemini-finance-tracker",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-fitness-coach",
    kind: "agent",
    name: "Gemini Fitness Coach",
    slug: "gemini-fitness-coach",
    description: "Creates personalized workout routines.",
    category: "Productivity",
    tags: ["Gemini", "Fitness", "Health"],
    install: "npx @clawdbot/cli add agent/gemini-fitness-coach",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-book-summarizer",
    kind: "agent",
    name: "Gemini Book Summarizer",
    slug: "gemini-book-summarizer",
    description: "Summarizes non-fiction books into key takeaways.",
    category: "Productivity",
    tags: ["Gemini", "Reading", "Summary"],
    install: "npx @clawdbot/cli add agent/gemini-book-summarizer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // GAMING & ENTERTAINMENT
  // ========================================================================
  {
    id: "gemini-dnd-dm",
    kind: "agent",
    name: "Gemini DnD DM",
    slug: "gemini-dnd-dm",
    description: "Acts as a Dungeon Master for D&D campaigns.",
    category: "Gaming",
    tags: ["Gemini", "Gaming", "DnD"],
    install: "npx @clawdbot/cli add agent/gemini-dnd-dm",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-game-guide",
    kind: "agent",
    name: "Gemini Game Guide",
    slug: "gemini-game-guide",
    description: "Provides walkthroughs and tips for popular games.",
    category: "Gaming",
    tags: ["Gemini", "Gaming", "Walkthrough"],
    install: "npx @clawdbot/cli add agent/gemini-game-guide",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-trivia-host",
    kind: "agent",
    name: "Gemini Trivia Host",
    slug: "gemini-trivia-host",
    description: "Hosts trivia games on any topic.",
    category: "Gaming",
    tags: ["Gemini", "Trivia", "Fun"],
    install: "npx @clawdbot/cli add agent/gemini-trivia-host",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-story-teller",
    kind: "agent",
    name: "Gemini Story Teller",
    slug: "gemini-story-teller",
    description: "Generates interactive fiction stories.",
    category: "Gaming",
    tags: ["Gemini", "Story", "Fiction"],
    install: "npx @clawdbot/cli add agent/gemini-story-teller",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-character-creator",
    kind: "agent",
    name: "Gemini Character Creator",
    slug: "gemini-character-creator",
    description: "Generates backstories and stats for RPG characters.",
    category: "Gaming",
    tags: ["Gemini", "RPG", "Character"],
    install: "npx @clawdbot/cli add agent/gemini-character-creator",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // WEB3 & BLOCKCHAIN
  // ========================================================================
  {
    id: "gemini-solidity-auditor",
    kind: "agent",
    name: "Gemini Solidity Auditor",
    slug: "gemini-solidity-auditor",
    description: "Audits smart contracts for gas optimization.",
    category: "Web3",
    tags: ["Gemini", "Web3", "Solidity"],
    install: "npx @clawdbot/cli add agent/gemini-solidity-auditor",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-nft-generator",
    kind: "agent",
    name: "Gemini NFT Generator",
    slug: "gemini-nft-generator",
    description: "Generates metadata and art prompts for NFT collections.",
    category: "Web3",
    tags: ["Gemini", "NFT", "Web3"],
    install: "npx @clawdbot/cli add agent/gemini-nft-generator",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-defi-analyst",
    kind: "agent",
    name: "Gemini DeFi Analyst",
    slug: "gemini-defi-analyst",
    description: "Analyzes DeFi yields and risks.",
    category: "Web3",
    tags: ["Gemini", "DeFi", "Finance"],
    install: "npx @clawdbot/cli add agent/gemini-defi-analyst",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-dao-governance",
    kind: "agent",
    name: "Gemini DAO Governance",
    slug: "gemini-dao-governance",
    description: "Summarizes DAO proposals and voting history.",
    category: "Web3",
    tags: ["Gemini", "DAO", "Governance"],
    install: "npx @clawdbot/cli add agent/gemini-dao-governance",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-rust-anchor",
    kind: "agent",
    name: "Gemini Rust Anchor",
    slug: "gemini-rust-anchor",
    description: "Helps write Solana programs in Rust/Anchor.",
    category: "Web3",
    tags: ["Gemini", "Solana", "Rust"],
    install: "npx @clawdbot/cli add agent/gemini-rust-anchor",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["cursor"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },

  // ========================================================================
  // IOT & HARDWARE
  // ========================================================================
  {
    id: "gemini-arduino-coder",
    kind: "agent",
    name: "Gemini Arduino Coder",
    slug: "gemini-arduino-coder",
    description: "Writes C++ code for Arduino projects.",
    category: "IoT",
    tags: ["Gemini", "Arduino", "IoT"],
    install: "npx @clawdbot/cli add agent/gemini-arduino-coder",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-pi-setup",
    kind: "agent",
    name: "Gemini Pi Setup",
    slug: "gemini-pi-setup",
    description: "Automates Raspberry Pi configuration.",
    category: "IoT",
    tags: ["Gemini", "Raspberry Pi", "Linux"],
    install: "npx @clawdbot/cli add agent/gemini-pi-setup",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-home-assistant",
    kind: "agent",
    name: "Gemini Home Assistant",
    slug: "gemini-home-assistant",
    description: "Generates YAML for Home Assistant automations.",
    category: "IoT",
    tags: ["Gemini", "Home Automation", "YAML"],
    install: "npx @clawdbot/cli add agent/gemini-home-assistant",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-esp32-wifi",
    kind: "agent",
    name: "Gemini ESP32 WiFi",
    slug: "gemini-esp32-wifi",
    description: "Boilerplate for ESP32 WiFi/Bluetooth connections.",
    category: "IoT",
    tags: ["Gemini", "ESP32", "IoT"],
    install: "npx @clawdbot/cli add agent/gemini-esp32-wifi",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["vscode"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 85,
      status: "VERIFIED",
    },
  },
  {
    id: "gemini-circuit-designer",
    kind: "agent",
    name: "Gemini Circuit Designer",
    slug: "gemini-circuit-designer",
    description: "Suggests components for circuit diagrams.",
    category: "IoT",
    tags: ["Gemini", "Electronics", "Circuits"],
    install: "npx @clawdbot/cli add agent/gemini-circuit-designer",
    platforms: ["gemini"],
    compatibility: {
      models: ["gemini-2.0-flash", "gemini-3.0-pro"],
      software: ["terminal"],
    },
  },
];
