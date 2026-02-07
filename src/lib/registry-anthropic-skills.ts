import type { RegistryItem } from "@/types/registry";

// ============================================================================
// ANTHROPIC OFFICIAL SKILLS (16 Total)
// Official skills from Anthropic's Claude Skills repository
// ============================================================================

export const ANTHROPIC_SKILLS: RegistryItem[] = [
  // === DOCUMENT SKILLS (5) ===
  {
    id: "anthropic-docx",
    kind: "skill",
    name: "Word Document Creator",
    slug: "anthropic-docx",
    description:
      "Create and edit Microsoft Word documents (.docx). Headers, tables, formatting, styles. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for Word document creation and editing. Supports document structure with headers, paragraphs, tables, lists, and styling. Generates professional-quality .docx files with proper formatting, page breaks, and template support.",
    category: "Document Skills",
    tags: ["Word", "Documents", "DOCX", "Office", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-docx/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-docx",
    tokenSavings: 85,
    installs: 2341,
    remixes: 456,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-pdf",
    kind: "skill",
    name: "PDF Manipulation Toolkit",
    slug: "anthropic-pdf",
    description:
      "PDF creation, extraction, and manipulation. Text extraction, form filling, annotations. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for comprehensive PDF operations. Create PDFs from scratch, extract text and images, fill forms, add annotations, merge/split documents, and handle password-protected files. Supports both read and write operations.",
    category: "Document Skills",
    tags: ["PDF", "Documents", "Extraction", "Forms", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-pdf/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-pdf",
    tokenSavings: 87,
    installs: 3124,
    remixes: 678,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-pptx",
    kind: "skill",
    name: "PowerPoint Presentations",
    slug: "anthropic-pptx",
    description:
      "Create professional PowerPoint presentations. Slides, layouts, charts, animations. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for PowerPoint presentation creation. Design slides with text, images, charts, tables, and shapes. Supports multiple layouts, themes, transitions, animations, and speaker notes. Exports to .pptx format.",
    category: "Document Skills",
    tags: [
      "PowerPoint",
      "Presentations",
      "PPTX",
      "Slides",
      "Anthropic Official",
    ],
    dependencies: [],
    files: [".claude/skills/anthropic-pptx/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-pptx",
    tokenSavings: 86,
    installs: 1987,
    remixes: 412,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-xlsx",
    kind: "skill",
    name: "Excel Spreadsheets",
    slug: "anthropic-xlsx",
    description:
      "Create and manipulate Excel spreadsheets. Formulas, charts, pivot tables, formatting. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for Excel spreadsheet operations. Create workbooks with multiple sheets, formulas, conditional formatting, charts, pivot tables, and data validation. Supports cell styling, merged cells, and named ranges.",
    category: "Document Skills",
    tags: ["Excel", "Spreadsheets", "XLSX", "Data", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-xlsx/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-xlsx",
    tokenSavings: 84,
    installs: 2756,
    remixes: 534,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-doc-coauthoring",
    kind: "skill",
    name: "Collaborative Document Authoring",
    slug: "anthropic-doc-coauthoring",
    description:
      "Interactive document co-authoring with revision tracking, comments, and suggestions. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for collaborative document creation. Enables interactive authoring sessions with tracked changes, inline comments, suggestion mode, version history, and multi-author coordination. Supports Word, PDF, and Markdown formats.",
    category: "Document Skills",
    tags: [
      "Collaboration",
      "Documents",
      "Authoring",
      "Revision",
      "Anthropic Official",
    ],
    dependencies: ["anthropic-docx"],
    files: [".claude/skills/anthropic-doc-coauthoring/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-doc-coauthoring",
    tokenSavings: 82,
    installs: 1654,
    remixes: 289,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },

  // === CREATIVE SKILLS (5) ===
  {
    id: "anthropic-algorithmic-art",
    kind: "skill",
    name: "Algorithmic Art Generator",
    slug: "anthropic-algorithmic-art",
    description:
      "Generate art with p5.js. Fractals, patterns, animations, creative coding. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for generative art creation using p5.js. Create fractals, Perlin noise patterns, particle systems, geometric designs, and interactive visualizations. Supports canvas rendering, SVG export, and animation loops.",
    category: "Creative Skills",
    tags: [
      "Art",
      "p5.js",
      "Generative",
      "Creative Coding",
      "Anthropic Official",
    ],
    dependencies: [],
    files: [".claude/skills/anthropic-algorithmic-art/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-algorithmic-art",
    tokenSavings: 88,
    installs: 1432,
    remixes: 567,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 94,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-canvas-design",
    kind: "skill",
    name: "Canvas-Based Graphics",
    slug: "anthropic-canvas-design",
    description:
      "HTML Canvas graphics and animations. Drawing, image manipulation, interactive elements. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for HTML Canvas graphics creation. Design 2D graphics, image filters, sprite animations, game elements, and data visualizations. Supports pixel manipulation, compositing, and high-performance rendering.",
    category: "Creative Skills",
    tags: ["Canvas", "Graphics", "Animation", "Design", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-canvas-design/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-canvas-design",
    tokenSavings: 85,
    installs: 1198,
    remixes: 345,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 93,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-frontend-design",
    kind: "skill",
    name: "UI Component Design",
    slug: "anthropic-frontend-design",
    description:
      "Design modern UI components. React, Tailwind, responsive layouts, accessibility. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for frontend UI component design. Create responsive, accessible React components with Tailwind CSS. Supports design tokens, component variants, dark mode, animations, and design system integration.",
    category: "Creative Skills",
    tags: ["UI", "Components", "React", "Tailwind", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-frontend-design/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-frontend-design",
    tokenSavings: 86,
    installs: 2876,
    remixes: 712,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-theme-factory",
    kind: "skill",
    name: "Design Theme Manager",
    slug: "anthropic-theme-factory",
    description:
      "Create and manage design themes. Color palettes, typography, spacing systems. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for design theme creation and management. Generate complete design systems with color palettes, typography scales, spacing tokens, shadow systems, and CSS custom properties. Supports light/dark modes and brand customization.",
    category: "Creative Skills",
    tags: [
      "Themes",
      "Design System",
      "Colors",
      "Typography",
      "Anthropic Official",
    ],
    dependencies: ["anthropic-frontend-design"],
    files: [".claude/skills/anthropic-theme-factory/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-theme-factory",
    tokenSavings: 83,
    installs: 1567,
    remixes: 423,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 93,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-slack-gif-creator",
    kind: "skill",
    name: "Slack GIF Creator",
    slug: "anthropic-slack-gif-creator",
    description:
      "Create animated GIFs for Slack and messaging. Custom emojis, reactions, animations. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for animated GIF creation optimized for Slack and messaging platforms. Create custom emojis, reaction GIFs, looping animations, and meme templates. Supports frame-by-frame editing, text overlays, and size optimization.",
    category: "Creative Skills",
    tags: ["GIF", "Animation", "Slack", "Emoji", "Anthropic Official"],
    dependencies: ["anthropic-canvas-design"],
    files: [".claude/skills/anthropic-slack-gif-creator/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-slack-gif-creator",
    tokenSavings: 81,
    installs: 987,
    remixes: 234,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 92,
      status: "VERIFIED",
    },
  },

  // === DEVELOPMENT SKILLS (3) ===
  {
    id: "anthropic-mcp-builder",
    kind: "skill",
    name: "MCP Server Generator",
    slug: "anthropic-mcp-builder",
    description:
      "Build Model Context Protocol servers. Tools, resources, prompts, transport layers. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for building MCP (Model Context Protocol) servers. Generate server scaffolding, define tools and resources, implement prompt templates, and configure transport layers (stdio, HTTP, WebSocket). Follows official MCP specification.",
    category: "Development Skills",
    tags: ["MCP", "Server", "Protocol", "Tools", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-mcp-builder/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-mcp-builder",
    tokenSavings: 89,
    installs: 3456,
    remixes: 892,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 96,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-web-artifacts-builder",
    kind: "skill",
    name: "Web Artifacts Builder",
    slug: "anthropic-web-artifacts-builder",
    description:
      "Build interactive web artifacts. HTML, CSS, JS components rendered in Claude. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for creating web artifacts that render directly in Claude's interface. Build interactive HTML/CSS/JS components, data visualizations, mini-apps, and demonstrations. Supports sandboxed execution with security boundaries.",
    category: "Development Skills",
    tags: [
      "Artifacts",
      "Web",
      "Interactive",
      "Components",
      "Anthropic Official",
    ],
    dependencies: [],
    files: [".claude/skills/anthropic-web-artifacts-builder/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-web-artifacts-builder",
    tokenSavings: 84,
    installs: 2234,
    remixes: 567,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 95,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-webapp-testing",
    kind: "skill",
    name: "Playwright UI Testing",
    slug: "anthropic-webapp-testing",
    description:
      "Automated UI testing with Playwright. E2E tests, visual regression, accessibility audits. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for web application testing using Playwright. Generate E2E test suites, perform visual regression testing, run accessibility audits, and create performance benchmarks. Supports multiple browsers and mobile viewports.",
    category: "Development Skills",
    tags: ["Testing", "Playwright", "E2E", "Automation", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-webapp-testing/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-webapp-testing",
    tokenSavings: 86,
    installs: 1876,
    remixes: 412,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 94,
      status: "VERIFIED",
    },
  },

  // === ENTERPRISE SKILLS (2) ===
  {
    id: "anthropic-brand-guidelines",
    kind: "skill",
    name: "Brand Guidelines Manager",
    slug: "anthropic-brand-guidelines",
    description:
      "Create and enforce brand standards. Logos, colors, voice, usage rules. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for brand guideline creation and enforcement. Define brand identity elements including logos, color palettes, typography, voice and tone, imagery standards, and usage rules. Generate comprehensive brand books and style guides.",
    category: "Enterprise Skills",
    tags: [
      "Brand",
      "Guidelines",
      "Identity",
      "Standards",
      "Anthropic Official",
    ],
    dependencies: ["anthropic-theme-factory"],
    files: [".claude/skills/anthropic-brand-guidelines/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-brand-guidelines",
    tokenSavings: 82,
    installs: 1234,
    remixes: 289,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 93,
      status: "VERIFIED",
    },
  },
  {
    id: "anthropic-internal-comms",
    kind: "skill",
    name: "Internal Communications",
    slug: "anthropic-internal-comms",
    description:
      "Draft internal communications. Announcements, newsletters, memos, all-hands. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for internal communications drafting. Create company announcements, team newsletters, executive memos, all-hands presentations, change management communications, and employee engagement content. Supports tone calibration and multi-audience targeting.",
    category: "Enterprise Skills",
    tags: [
      "Communications",
      "Internal",
      "Corporate",
      "Writing",
      "Anthropic Official",
    ],
    dependencies: ["anthropic-doc-coauthoring"],
    files: [".claude/skills/anthropic-internal-comms/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-internal-comms",
    tokenSavings: 80,
    installs: 1098,
    remixes: 234,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 92,
      status: "VERIFIED",
    },
  },

  // === META SKILLS (1) ===
  {
    id: "anthropic-skill-creator",
    kind: "skill",
    name: "Interactive Skill Builder",
    slug: "anthropic-skill-creator",
    description:
      "Create custom Claude skills interactively. Templates, testing, deployment. Official Anthropic skill.",
    longDescription:
      "Official Anthropic skill for creating custom Claude skills. Interactive wizard for skill definition, template selection, prompt engineering, testing workflows, and deployment to personal or shared skill libraries. Includes skill validation and best practices guidance.",
    category: "Meta Skills",
    tags: ["Skills", "Builder", "Meta", "Development", "Anthropic Official"],
    dependencies: [],
    files: [".claude/skills/anthropic-skill-creator/SKILL.md"],
    install: "npx @clawdbot/cli add skill/anthropic-skill-creator",
    tokenSavings: 90,
    installs: 4567,
    remixes: 1234,
    platforms: ["claude"],
    compatibility: {
      models: ["opus-4.5", "sonnet-4.5", "sonnet", "opus", "haiku"],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-12-12",
      qualityScore: 97,
      status: "VERIFIED",
    },
  },
];
