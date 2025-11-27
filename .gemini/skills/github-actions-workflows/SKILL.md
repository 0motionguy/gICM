# GitHub Actions Workflows

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


## Quick Reference

```yaml
# Basic workflow structure
name: CI Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

### Common Triggers
```yaml
on:
  push:
    branches: [main, develop]
    paths: ['src/**', 'package.json']
  pull_request:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
```

### Matrix Builds
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20, 22]
```

## Core Concepts

### 1. Workflow Anatomy

**Events** trigger workflows → **Jobs** run in parallel → **Steps** execute sequentially

```yaml
name: Complete CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  CACHE_VERSION: v1

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      coverage: ${{ steps.coverage.outputs.percentage }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - id: coverage
        run: echo "percentage=85" >> $GITHUB_OUTPUT
```

### 2. Caching Strategies

**Dependencies Cache**
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
      .next/cache
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

**Build Cache**
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ${{ github.workspace }}/.next/cache
      ${{ github.workspace }}/dist
    key: ${{ runner.os }}-build-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-build-
```

### 3. Secrets Management

```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    run: |
      echo "::add-mask::$API_KEY"
      npm run deploy
```

### 4. Job Dependencies

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

## Common Patterns

### Pattern 1: Monorepo CI with Change Detection

```yaml
name: Monorepo CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      backend: ${{ steps.filter.outputs.backend }}
      shared: ${{ steps.filter.outputs.shared }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            frontend:
              - 'apps/web/**'
              - 'packages/ui/**'
            backend:
              - 'apps/api/**'
              - 'packages/db/**'
            shared:
              - 'packages/**'
              - 'package.json'

  frontend:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:frontend
      - run: npm run build:frontend

  backend:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```

### Pattern 2: Matrix Build with outputs Publishing

```yaml
name: Cross-Platform Build

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: linux-x64
          - os: windows-latest
            target: win-x64
          - os: macos-latest
            target: darwin-x64
          - os: macos-latest
            target: darwin-arm64
            arch: arm64
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Build
        run: npm run build -- --target=${{ matrix.target }}

      - name: Test
        run: npm test

      - name: Package
        run: |
          mkdir -p dist
          tar -czf dist/app-${{ matrix.target }}.tar.gz -C build .

      - uses: actions/upload-outputs@v4
        with:
          name: build-${{ matrix.target }}
          path: dist/*.tar.gz
          retention-days: 7

  release:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/download-outputs@v4
        with:
          pattern: build-*
          merge-multiple: true
          path: dist

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*.tar.gz
          draft: false
          prerelease: false
```

### Pattern 3: Docker Build with Layer Caching

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}
```

### Pattern 4: Parallel Test Execution

```yaml
name: Parallel Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run tests
        run: npm test -- --shard=${{ matrix.shard }}/4

      - uses: actions/upload-outputs@v4
        if: always()
        with:
          name: coverage-${{ matrix.shard }}
          path: coverage/
          retention-days: 1

  merge-coverage:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-outputs@v4
        with:
          pattern: coverage-*
          path: coverage-parts

      - name: Merge coverage reports
        run: |
          npm ci
          npx nyc merge coverage-parts coverage/merged.json
          npx nyc report --reporter=lcov --reporter=text

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Advanced Techniques

### 1. Reusable Workflows

**Caller workflow:**
```yaml
name: Deploy App

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    uses: ./.github/workflows/deploy-reusable.yml
    with:
      environment: staging
      node-version: '20'
    secrets:
      api-key: ${{ secrets.STAGING_API_KEY }}

  deploy-production:
    needs: deploy-staging
    uses: ./.github/workflows/deploy-reusable.yml
    with:
      environment: production
      node-version: '20'
    secrets:
      api-key: ${{ secrets.PROD_API_KEY }}
```

**Reusable workflow (.github/workflows/deploy-reusable.yml):**
```yaml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      node-version:
        required: false
        type: string
        default: '20'
    secrets:
      api-key:
        required: true
    outputs:
      deployment-url:
        description: "The deployed URL"
        value: ${{ jobs.deploy.outputs.url }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    outputs:
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm run build
      - id: deploy
        run: |
          URL=$(npm run deploy -- --env=${{ inputs.environment }})
          echo "url=$URL" >> $GITHUB_OUTPUT
        env:
          API_KEY: ${{ secrets.api-key }}
```

### 2. Composite Actions

**.github/actions/setup-app/action.yml:**
```yaml
name: 'Setup Application'
description: 'Install dependencies and setup cache'

inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '20'
  cache-version:
    description: 'Cache version for busting'
    required: false
    default: 'v1'

outputs:
  cache-hit:
    description: 'Whether cache was hit'
    value: ${{ steps.cache.outputs.cache-hit }}

runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}

    - name: Cache dependencies
      id: cache
      uses: actions/cache@v4
      with:
        path: |
          ~/.npm
          node_modules
        key: ${{ runner.os }}-node-${{ inputs.cache-version }}-${{ hashFiles('**/package-lock.json') }}

    - if: steps.cache.outputs.cache-hit != 'true'
      run: npm ci
      shell: bash

    - run: echo "Setup complete"
      shell: bash
```

**Usage:**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-app
    with:
      node-version: '20'
      cache-version: 'v2'
```

### 3. Dynamic Matrix from JSON

```yaml
jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - id: set-matrix
        run: |
          PACKAGES=$(jq -c '[.workspaces[]]' package.json)
          echo "matrix=$PACKAGES" >> $GITHUB_OUTPUT

  test:
    needs: prepare
    strategy:
      matrix:
        package: ${{ fromJson(needs.prepare.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test -- --workspace=${{ matrix.package }}
```

### 4. Conditional Job Execution

```yaml
jobs:
  check-secrets:
    runs-on: ubuntu-latest
    outputs:
      has-aws: ${{ steps.check.outputs.has-aws }}
    steps:
      - id: check
        run: |
          if [[ -n "${{ secrets.AWS_ACCESS_KEY_ID }}" ]]; then
            echo "has-aws=true" >> $GITHUB_OUTPUT
          else
            echo "has-aws=false" >> $GITHUB_OUTPUT
          fi

  deploy-aws:
    needs: check-secrets
    if: needs.check-secrets.outputs.has-aws == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to AWS..."
```

## Production Examples

### Example 1: Full-Stack TypeScript Monorepo

```yaml
name: Monorepo CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      changed-packages: ${{ steps.packages.outputs.changed }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Detect changed packages
        id: packages
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            CHANGED=$(pnpm list --filter="...[origin/${{ github.base_ref }}]" --depth -1 --json | jq -c '[.[].name]')
          else
            CHANGED=$(pnpm list --depth -1 --json | jq -c '[.[].name]')
          fi
          echo "changed=$CHANGED" >> $GITHUB_OUTPUT

  lint:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run type-check

  test:
    needs: setup
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      - uses: codecov/codecov-action@v3

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/upload-outputs@v4
        with:
          name: build-outputs
          path: |
            apps/*/dist
            apps/*/.next
          retention-days: 1

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-outputs@v4
        with:
          name: build-outputs
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-outputs@v4
        with:
          name: build-outputs
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Example 2: Security Scanning Pipeline

```yaml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 1'  # Weekly Monday midnight

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm audit --audit-level=moderate

      - name: Check for updates
        run: npx npm-check-updates -u --target minor
        continue-on-error: true

  snyk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/autobuild@v2
      - uses: github/codeql-action/analyze@v2

  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"
```

### Example 3: Performance Benchmarking

```yaml
name: Performance Benchmark

on:
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run benchmarks on PR
        run: npm run bench -- --json > bench-pr.json

      - name: Checkout base branch
        run: |
          git fetch origin ${{ github.base_ref }}
          git checkout origin/${{ github.base_ref }}

      - run: npm ci

      - name: Run benchmarks on base
        run: npm run bench -- --json > bench-base.json

      - name: Compare results
        uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'benchmarkjs'
          output-file-path: bench-pr.json
          external-data-json-path: bench-base.json
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-on-alert: true
          alert-threshold: '150%'
```

## Best Practices

### 1. Optimize for Speed
- Use dependency caching aggressively
- Run jobs in parallel when possible
- Use `concurrency` to cancel outdated runs
- Leverage matrix builds for test parallelization

### 2. Security
- Never hardcode secrets
- Use `add-mask` for sensitive output
- Limit permissions with `permissions` key
- Use environment protection rules

### 3. Reliability
- Set appropriate timeouts
- Use `continue-on-error` judiciously
- Implement retry logic for flaky tests
- Pin action versions (e.g., `@v4` not `@main`)

### 4. Maintainability
- Extract reusable workflows
- Create composite actions for repeated steps
- Use meaningful job and step names
- Add comments for complex logic

### 5. Cost Optimization
- Use `paths` filter to avoid unnecessary runs
- Implement change detection for monorepos
- Cancel in-progress runs for same PR
- Clean up outputs regularly

## Common Pitfalls

### 1. Cache Invalidation
```yaml
# BAD - Cache never updates
key: ${{ runner.os }}-deps

# GOOD - Updates when dependencies change
key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
```

### 2. Matrix Job Failures
```yaml
# BAD - One failure stops all
strategy:
  matrix:
    node: [18, 20, 22]

# GOOD - Allow partial failures
strategy:
  fail-fast: false
  matrix:
    node: [18, 20, 22]
```

### 3. Secret Leaks
```yaml
# BAD - Secret in logs
run: echo "Token: ${{ secrets.TOKEN }}"

# GOOD - Masked secret
run: |
  echo "::add-mask::${{ secrets.TOKEN }}"
  echo "Token set"
```

### 4. Inefficient Checkouts
```yaml
# BAD - Full history for simple build
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

# GOOD - Shallow clone when possible
- uses: actions/checkout@v4
```

### 5. Hardcoded Values
```yaml
# BAD
run: npm install
if: github.ref == 'refs/heads/main'

# GOOD
run: npm ci
if: github.ref == format('refs/heads/{0}', github.event.repository.default_branch)
```

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

### Essential Actions
- actions/checkout@v4 - Repository checkout
- actions/setup-node@v4 - Node.js setup
- actions/cache@v4 - Dependency caching
- actions/upload-outputs@v4 - outputs storage
- docker/build-push-action@v5 - Docker builds

### Tools
- [act](https://github.com/nektos/act) - Run workflows locally
- [actionlint](https://github.com/rhysd/actionlint) - Workflow linting
- [GitHub CLI](https://cli.github.com/) - Workflow management

### Community
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- [GitHub Actions Forum](https://github.community/c/code-to-cloud/github-actions)
