# gICM Multi-Platform Architecture

> Universal AI Workflow Marketplace - Works across Claude, Gemini, and OpenAI

## Overview

gICM is a **platform-agnostic** marketplace for AI agents, skills, and commands. All items work across:

| Platform | Status | Models Supported |
|----------|--------|------------------|
| **Claude** | Full Support | Opus 4.5, Sonnet 4.5, Sonnet |
| **Gemini** | Full Support | Gemini 2.0 Flash, Gemini 3.0 Pro |
| **OpenAI** | Full Support | GPT-4o, GPT-4o-mini, o1 |

## Directory Structure

```
gICM/
├── .claude/           # Claude-native files
│   ├── agents/        # 104 agents
│   ├── skills/        # 95 skills
│   ├── commands/      # 94 commands
│   ├── mcp/           # 124 MCPs (Claude-only)
│   └── settings/      # 7 settings
│
├── .gemini/           # Gemini-optimized files
│   ├── agents/        # 107 agents
│   ├── skills/        # 95 skills
│   └── commands/      # 94 commands
│
├── .openai/           # OpenAI-optimized files
│   ├── agents/        # 104 agents
│   ├── skills/        # 95 skills
│   └── commands/      # 94 commands
│
└── public/            # Served files (mirrors above)
    ├── claude/
    ├── gemini/
    └── openai/
```

## CLI Usage

### Install for Claude (default)
```bash
npx @gicm/cli add agent/icm-anchor-architect
```

### Install for Gemini
```bash
npx @gicm/cli add agent/icm-anchor-architect --platform=gemini
```

### Install for OpenAI
```bash
npx @gicm/cli add agent/icm-anchor-architect --platform=openai
```

## Platform-Specific Notes

### Claude
- **MCPs**: Only Claude supports Model Context Protocol (MCP) servers
- **Thinking Tags**: Native `<thinking>` block support
- **Artifacts**: Full artifact support for code outputs

### Gemini
- **Context Window**: Supports up to 1M tokens
- **Multimodal**: Native image/video understanding
- **Code Execution**: Built-in Python sandbox

### OpenAI
- **Reasoning Models**: o1 for complex multi-step problems
- **Function Calling**: Native JSON schema tools
- **Image Generation**: DALL-E 3 integration

## Universal Bridge

When installing Claude-native prompts on Gemini/OpenAI, the CLI automatically applies the **Universal Bridge** adapter:

```typescript
// packages/cli/src/lib/bridge.ts

class UniversalBridge {
  static bridgePrompt(content, context) {
    // 1. Remove Claude-specific sections (MCP tools, @context7)
    // 2. Transform thinking tags to comments
    // 3. Update model references
    // 4. Add platform-specific shim header
  }
}
```

### Transformations Applied

| Claude Feature | Gemini Adaptation | OpenAI Adaptation |
|----------------|-------------------|-------------------|
| `<thinking>` tags | Internal reasoning | Internal reasoning |
| Artifacts | Code blocks with paths | Code blocks with paths |
| MCP Tools section | Removed | Removed |
| @context7 refs | Removed | Removed |
| "Claude Opus" | "Gemini 2.0 Flash" | "GPT-4o" |

## Registry Schema

Each registry item includes platform metadata:

```typescript
interface RegistryItem {
  // ... other fields
  platforms: ["claude", "gemini", "openai"],
  compatibility: {
    models: ["opus-4.5", "sonnet-4.5", "gemini-2.0-flash", "gpt-4o"],
    software: ["vscode", "cursor", "terminal", "windsurf"]
  },
  implementations: {
    claude: { install: "npx @gicm/cli add agent/..." },
    gemini: { install: "npx @gicm/cli add agent/... --platform=gemini" },
    openai: { install: "npx @gicm/cli add agent/... --platform=openai" }
  }
}
```

## Build Scripts

### `scripts/build-platform-assets.ts`
Copies source files from `.claude/`, `.gemini/`, `.openai/` to `/public/` for API serving.

```bash
npx tsx scripts/build-platform-assets.ts
```

### `scripts/convert-agents-multi-platform.ts`
Converts Claude agents to Gemini/OpenAI formats.

### `scripts/convert-skills-multi-platform.ts`
Converts Claude skills to Gemini/OpenAI formats.

### `scripts/convert-commands-multi-platform.ts`
Converts Claude commands to Gemini/OpenAI formats.

## API Endpoints

```
GET /api/items/[slug]/files
```
Returns platform-specific files. Queries `/public/{platform}/` directories.

## Frontend

The main marketplace page (`src/app/page.tsx`) includes a platform filter:
- Toggle between All / Claude / Gemini / OpenAI
- Items filtered by `platforms` array
- Install commands update based on selected platform

## Setup Guides

- **Claude**: `/guides/claude-setup` - 5-step setup guide
- **Gemini**: `/guides/gemini-setup` - Google AI Studio setup
- **OpenAI**: `/guides/openai-setup` - API key and SDK setup

## Total Assets

| Type | Claude | Gemini | OpenAI | Total |
|------|--------|--------|--------|-------|
| Agents | 104 | 107 | 104 | 315 |
| Skills | 95 | 95 | 95 | 285 |
| Commands | 94 | 94 | 94 | 282 |
| MCPs | 124 | - | - | 124 |
| Settings | 7 | - | - | 7 |
| **Total** | **424** | **296** | **293** | **1,013** |

## Contributing

When adding new items:
1. Create the Claude version in `.claude/{type}/`
2. Run the appropriate conversion script
3. Run `npx tsx scripts/build-platform-assets.ts`
4. Update registry with `platforms` array
