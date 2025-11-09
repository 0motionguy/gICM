# Test Before Deploy

Run all tests before deployments. Prevents deploying broken code to production.

## Overview

Automatically runs full test suite before any deployment operations. Deployment is blocked if any tests fail. Essential for maintaining production stability.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** true
**Recommended:** true for production

## Usage

```bash
# Enable test-before-deploy (default)
npx @gicm/cli settings add development/test-before-deploy --value true

# Disable test-before-deploy
npx @gicm/cli settings add development/test-before-deploy --value false
```

## How It Works

**Deployment flow:**
```
npm run deploy
  ↓
🧪 Running pre-deployment tests...
  ↓
  ✓ Unit tests (234 passed)
  ✓ Integration tests (45 passed)
  ✓ E2E tests (12 passed)
  ↓
✓ All tests passed
  ↓
🚀 Deploying to production...
```

## Test Failure Behavior

**When tests fail:**
```
❌ Pre-deployment tests failed

Unit tests:
  ✓ 230 passed
  ✗ 4 failed
    - src/lib/utils.test.ts:42 - Expected 10, got 11
    - src/app/api/route.test.ts:15 - Timeout exceeded

Deployment blocked.
Fix failing tests and try again.
```

## Test Levels

**Configure which tests to run:**
```json
{
  "test-before-deploy": true,
  "test-levels": {
    "unit": true,
    "integration": true,
    "e2e": true,
    "performance": false
  }
}
```

## Performance Considerations

**Test execution time:**
- Unit tests: 10-30 seconds
- Integration tests: 30-90 seconds
- E2E tests: 2-5 minutes
- Total: 3-7 minutes

**Optimization:**
- Run tests in parallel
- Skip slow tests in staging
- Cache test results
- Only run affected tests

## Affected Components

- `test-automation-engineer` - Test orchestration
- `ci-cd-architect` - CI/CD pipeline integration
- `deployment-strategist` - Deployment coordination

## Skip Tests (Emergency)

**Emergency deployment:**
```bash
# Skip tests for single deployment (NOT RECOMMENDED)
npm run deploy -- --skip-tests

# Or override setting
npx @gicm/cli settings override test-before-deploy --value false
npm run deploy
npx @gicm/cli settings add development/test-before-deploy --value true
```

## CI/CD Integration

**GitHub Actions example:**
```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Run tests
      run: npm test

    - name: Deploy
      if: success()
      run: npm run deploy
```

## Test Coverage Requirements

**Configure minimum coverage:**
```json
{
  "test-before-deploy": true,
  "min-coverage": {
    "lines": 80,
    "functions": 80,
    "branches": 75
  },
  "block-on-coverage-drop": true
}
```

## Related Settings

- `pre-commit-hooks` - Run tests before commits
- `linting-enabled` - Lint before deploy
- `ci-cd-architect` - Orchestrate CI/CD

## Examples

### Maximum Safety (Production)
```json
{
  "test-before-deploy": true,
  "test-levels": {
    "unit": true,
    "integration": true,
    "e2e": true
  },
  "min-coverage": {
    "lines": 80,
    "functions": 80
  },
  "allow-skip": false
}
```

### Fast Staging Deploys
```json
{
  "test-before-deploy": true,
  "test-levels": {
    "unit": true,
    "integration": true,
    "e2e": false
  },
  "allow-skip": true
}
```

### Development
```json
{
  "test-before-deploy": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
