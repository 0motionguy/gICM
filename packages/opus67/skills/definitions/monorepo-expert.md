# Monorepo Expert
> **ID:** `monorepo-expert` | **Tier:** 2 | **Token Cost:** 6000

## What This Skill Does

The Monorepo Expert skill provides comprehensive knowledge and patterns for building, maintaining, and scaling modern monorepo architectures using industry-leading tools like Turborepo and pnpm. This skill covers everything from initial setup to advanced optimization, CI/CD integration, and team workflows.

You'll gain expertise in:
- Setting up Turborepo with optimal caching strategies
- Configuring pnpm workspaces for efficient dependency management
- Structuring packages for maximum code reuse and maintainability
- Orchestrating complex build pipelines with parallel execution
- Managing versions and releases with Changesets
- Implementing CI/CD workflows with remote caching

This skill is essential for projects with multiple packages, shared libraries, or full-stack applications that need to scale development velocity while maintaining code quality.

## When to Use

Invoke this skill when you need to:

- **Initial Setup**: Bootstrap a new monorepo with Turborepo + pnpm
- **Migration**: Convert existing multi-repo projects to a monorepo
- **Optimization**: Improve build times and caching strategies
- **Architecture**: Design package boundaries and dependencies
- **Versioning**: Set up automated version management and changelogs
- **CI/CD**: Configure GitHub Actions with remote caching
- **Debugging**: Troubleshoot build failures, circular dependencies, or cache misses
- **Scaling**: Add new packages or apps to an existing monorepo
- **Team Workflows**: Establish best practices for monorepo development

**Don't use this skill for**:
- Single-package projects (overkill)
- Simple npm workspaces without build orchestration needs
- Projects that don't benefit from shared code

## Core Capabilities

### 1. Turborepo Setup

Turborepo is a high-performance build system for JavaScript/TypeScript monorepos. It provides intelligent caching, parallel execution, and remote caching capabilities.

#### turbo.json Configuration

The `turbo.json` file is the heart of Turborepo configuration. It defines task pipelines, dependencies, and caching behavior.

**Root turbo.json (Complete Example)**:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    ".env",
    "tsconfig.json",
    "turbo.json"
  ],
  "globalEnv": [
    "NODE_ENV",
    "CI"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**",
        "build/**"
      ],
      "env": ["NODE_ENV"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "env": ["NODE_ENV"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "clean": {
      "cache": false
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"],
      "cache": false
    }
  },
  "remoteCache": {
    "signature": true
  }
}
```

**Key Concepts**:

- **`dependsOn`**: Defines task dependencies
  - `^build` means "run build in dependencies first"
  - `["^build", "lint"]` means "run build in deps, then lint locally"
- **`outputs`**: Files/directories to cache (must be deterministic)
- **`cache`**: Whether to cache this task's results
- **`persistent`**: For long-running tasks (dev servers, watch modes)
- **`env`**: Environment variables that affect task output
- **`globalDependencies`**: Files that invalidate all caches when changed
- **`globalEnv`**: Environment variables that affect all tasks

#### Pipeline Optimization Patterns

**1. Parallel Execution**:

```json
{
  "pipeline": {
    "lint": {
      "dependsOn": [],
      "outputs": []
    },
    "type-check": {
      "dependsOn": [],
      "outputs": []
    }
  }
}
```

Tasks with no dependencies run in parallel across all packages.

**2. Topological Order**:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

The `^` prefix ensures dependencies build before dependents.

**3. Internal Dependencies**:

```json
{
  "pipeline": {
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

Without `^`, it only depends on the same task in the same package.

**4. Multiple Dependencies**:

```json
{
  "pipeline": {
    "deploy": {
      "dependsOn": ["^build", "test", "lint"]
    }
  }
}
```

Deploy runs after: dependencies are built, and local test + lint pass.

#### Cache Configuration

**Outputs to Cache**:

```json
{
  "build": {
    "outputs": [
      "dist/**",
      ".next/**",
      "!.next/cache/**",
      "storybook-static/**",
      "coverage/**"
    ]
  }
}
```

**Important**: Only cache deterministic outputs. Exclude:
- Logs with timestamps
- Files with absolute paths
- Node modules
- Cache directories from other tools

**Environment Variables**:

```json
{
  "build": {
    "env": [
      "NODE_ENV",
      "NEXT_PUBLIC_API_URL",
      "DATABASE_URL"
    ]
  }
}
```

List all env vars that affect output. Turborepo hashes these for cache keys.

**Global Dependencies**:

```json
{
  "globalDependencies": [
    ".env",
    ".env.local",
    "tsconfig.json",
    "prettier.config.js"
  ]
}
```

Changes to these files invalidate all caches.

#### Remote Caching

Remote caching shares build artifacts across machines and CI runs.

**Vercel (Free)**:

```bash
# Link to Vercel
npx turbo login
npx turbo link

# In turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

**Self-Hosted**:

```bash
npm install -g turborepo-remote-cache
export TURBO_API="http://cache-server:3000"
export TURBO_TOKEN="your-token"
```

### 2. pnpm Workspaces

pnpm provides fast, disk-efficient package management with first-class workspace support.

#### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
  - '!**/test/**'
```

#### Workspace Protocol

**Root package.json**:

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test"
  }
}
```

**Workspace Dependencies**:

```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*"
  }
}
```

**Workspace Protocol Versions**:
- `workspace:*` - Any version
- `workspace:^` - Respects semver caret
- `workspace:~` - Respects semver tilde

During publishing, pnpm replaces `workspace:*` with actual versions.

#### pnpm Commands

```bash
# Install all dependencies
pnpm install

# Run script in all packages
pnpm -r run build

# Run in specific package
pnpm --filter @myorg/web dev

# Package and dependencies
pnpm --filter @myorg/web... build

# Changed packages (git)
pnpm --filter "[HEAD^1]" test

# Add dependency
pnpm add lodash --filter @myorg/utils
```

### 3. Package Structure

#### Directory Layout

```
my-monorepo/
├── apps/
│   ├── web/              # Next.js app
│   ├── api/              # Node.js API
│   └── admin/            # Admin dashboard
├── packages/
│   ├── ui/               # React components
│   ├── utils/            # Shared utilities
│   ├── tsconfig/         # TypeScript configs
│   └── eslint-config/    # ESLint config
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

#### UI Package

```json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

**tsup.config.ts**:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
```

### 4. Build Orchestration

#### Task Dependencies

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build", "type-check"],
      "outputs": ["coverage/**"]
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"],
      "cache": false
    }
  }
}
```

#### Filtering

```bash
# Single package
turbo run build --filter=@myorg/web

# Package and dependencies
turbo run build --filter=@myorg/web...

# Changed packages
turbo run test --filter="[HEAD^1]"

# Exclude packages
turbo run build --filter="!@myorg/docs"
```

#### Performance

```bash
# Profile builds
turbo run build --profile=profile.json

# Dry run
turbo run build --dry-run

# Limit concurrency
turbo run build --concurrency=2

# Force rebuild
turbo run build --force
```

### 5. Versioning with Changesets

#### Setup

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

**Configuration** (`.changeset/config.json`):

```json
{
  "changelog": ["@changesets/changelog-github", { "repo": "myorg/monorepo" }],
  "commit": false,
  "access": "public",
  "baseBranch": "main"
}
```

#### Workflow

**1. Create Changeset**:

```bash
pnpm changeset
```

**2. Version Packages**:

```bash
pnpm changeset version
```

**3. Publish**:

```bash
pnpm turbo run build
pnpm changeset publish
git push --follow-tags
```

#### Advanced Patterns

**Fixed Packages** (version together):

```json
{
  "fixed": [
    ["@myorg/ui", "@myorg/icons"]
  ]
}
```

**Snapshot Releases**:

```bash
pnpm changeset version --snapshot beta
pnpm changeset publish --tag beta
```

### 6. CI/CD Integration

#### GitHub Actions

```yaml
name: CI

on:
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo run build --filter="[HEAD^1]"

      - name: Test
        run: pnpm turbo run test --filter="[HEAD^1]"
```

#### Release Workflow

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: pnpm/action-setup@v2

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo run build

      - name: Release
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Real-World Examples

### Example 1: Full-stack Monorepo

**Structure**:

```
my-app/
├── apps/
│   ├── web/              # Next.js
│   └── api/              # Express
├── packages/
│   ├── ui/               # Components
│   ├── utils/            # Utilities
│   └── database/         # Prisma
└── turbo.json
```

**turbo.json**:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "db:generate"],
      "outputs": ["dist/**", ".next/**"]
    },
    "db:generate": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Workflow**:

```bash
pnpm install
pnpm db:generate
pnpm dev
pnpm build
pnpm test
```

### Example 2: Component Library

**Structure**:

```
design-system/
├── apps/
│   └── docs/             # Storybook
├── packages/
│   ├── react/            # Components
│   ├── icons/            # SVG icons
│   └── tokens/           # Design tokens
└── turbo.json
```

**Publishing Flow**:

```bash
# Build
pnpm build

# Start Storybook
pnpm --filter docs dev

# Create changeset
pnpm changeset

# Version and publish
pnpm changeset version
pnpm turbo run build
pnpm changeset publish
```

## Related Skills

- **typescript-advanced-types**: Complex type utilities
- **react-patterns**: Component libraries
- **nodejs-backend-patterns**: API packages
- **github-actions-ci**: Advanced workflows

## Further Reading

**Official Documentation**:
- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Changesets](https://github.com/changesets/changesets)

**Tools**:
- [tsup](https://tsup.egoist.dev/) - Bundle libraries
- [turborepo-remote-cache](https://github.com/ducktors/turborepo-remote-cache) - Self-hosted cache

**Examples**:
- [Vercel Turborepo Examples](https://github.com/vercel/turbo/tree/main/examples)
- [shadcn/ui](https://github.com/shadcn/ui) - Component library
- [Cal.com](https://github.com/calcom/cal.com) - Full-stack monorepo

**Best Practices**:
- Keep packages small and focused
- Use workspace protocol for internal dependencies
- Define clear package boundaries
- Leverage remote caching in CI
- Automate versioning with Changesets
- Monitor build times and optimize
- Use consistent tooling across packages
- Test packages in isolation and integration
