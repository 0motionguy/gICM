# Command: /monorepo-init

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Initialize monorepo with Turborepo, pnpm workspaces, and shared configs

## Description

The `/monorepo-init` command sets up a production-grade monorepo with Turborepo or Nx, pnpm/npm/yarn workspaces, shared TypeScript configs, shared dependencies, and optimized build pipelines.

## Usage

```bash
/monorepo-init [--tool=<tool>] [--manager=<manager>] [--apps=<list>]
```

## Arguments

- `--tool` - Monorepo tool: `turborepo`, `nx`, `lerna` (default: `turborepo`)
- `--manager` - Package manager: `pnpm`, `npm`, `yarn` (default: `pnpm`)
- `--apps` - Initial apps: comma-separated list (e.g., "web,api,mobile")

## Examples

### Example 1: Turborepo with pnpm
```bash
/monorepo-init --tool=turborepo --manager=pnpm --apps=web,api
```
Initializes Turborepo monorepo with web and API apps.

### Example 2: Nx monorepo
```bash
/monorepo-init --tool=nx --apps=frontend,backend,shared
```
Creates Nx workspace with three packages.

### Example 3: Basic workspace
```bash
/monorepo-init --manager=pnpm
```
Sets up basic pnpm workspace structure.

## Generated Structure

```
/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── config/
│   └── shared/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Related Commands

- `/config-gen` - Generate shared configs
- `/ci-gen` - Monorepo CI pipeline
- `/deploy-prepare-release` - Monorepo deployment
