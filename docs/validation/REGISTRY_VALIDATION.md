# Registry Dependency Validation

Comprehensive validation system to ensure all dependencies in the gICM registry are valid and properly structured.

## Overview

The validation system checks for:

1. **Missing Dependencies** - All dependency IDs reference existing registry items
2. **Circular Dependencies** - No circular dependency chains exist
3. **Self-References** - Items don't reference themselves
4. **ID Format** - Dependencies use correct ID format (kebab-case, not slugs)
5. **Orphaned Items** - Items with no dependencies and nothing depends on them

## Usage

### CLI Scripts

#### Full Validation Report

```bash
npx tsx scripts/validate-registry.ts
```

#### Strict Mode (Exit with Error on Issues)

```bash
npx tsx scripts/validate-registry.ts --strict
```

#### JSON Output

```bash
npx tsx scripts/validate-registry.ts --json
```

#### Validate Specific Item

```bash
npx tsx scripts/validate-registry.ts --item <item-id>
```

#### Quick Validation (No TypeScript)

```bash
node scripts/quick-validate.mjs
```

### Programmatic Usage

```typescript
import {
  validateRegistry,
  validateItem,
  generateValidationReport,
  validateRegistryStrict,
  getOrphanedItems,
  getItemsWithMissingDependencies,
  getItemsWithCircularDependencies,
} from "@/lib/registry-validator";

// Full validation
const report = validateRegistry();
console.log(`Found ${report.summary.errorCount} errors`);

// Generate human-readable report
const textReport = generateValidationReport(report);
console.log(textReport);

// Validate specific item
const issues = validateItem("icm-anchor-architect");

// Get items with specific issues
const orphaned = getOrphanedItems();
const withMissing = getItemsWithMissingDependencies();
const withCircular = getItemsWithCircularDependencies();

// Strict validation (throws on error)
try {
  validateRegistryStrict();
  console.log("✅ Validation passed");
} catch (error) {
  console.error("❌ Validation failed");
}
```

### Testing

Run validation tests:

```bash
npm test -- registry-validator.test.ts
```

## Validation Report Structure

### ValidationReport

```typescript
interface ValidationReport {
  timestamp: string;
  summary: {
    totalItems: number;
    itemsChecked: number;
    itemsWithDependencies: number;
    itemsValid: number;
    itemsWithIssues: number;
    errorCount: number;
    warningCount: number;
  };
  issues: ValidationIssue[];
  dependencyReport: DependencyReport;
  fixSuggestions: FixSuggestion[];
}
```

### ValidationIssue

```typescript
interface ValidationIssue {
  itemId: string;
  itemName: string;
  itemKind: string;
  severity: "error" | "warning" | "info";
  type:
    | "missing_dependency"
    | "circular_dependency"
    | "self_reference"
    | "slug_instead_of_id"
    | "orphaned_item"
    | "invalid_id_format";
  message: string;
  suggestion?: string;
}
```

### FixSuggestion

```typescript
interface FixSuggestion {
  itemId: string;
  itemName: string;
  action: "remove_dependency" | "update_dependency" | "add_dependency";
  currentValue?: string;
  suggestedValue?: string;
  reason: string;
}
```

## Issue Types

### Error-Level Issues

#### Missing Dependency

A dependency ID doesn't exist in the registry.

**Example:**

```typescript
{
  type: 'missing_dependency',
  message: 'Dependency "non-existent-agent" does not exist in registry',
  suggestion: 'Remove invalid dependency or add missing item to registry'
}
```

**Fix:** Remove the dependency or add the missing item.

#### Circular Dependency

A circular dependency chain exists.

**Example:**

```typescript
{
  type: 'circular_dependency',
  message: 'Circular dependency detected: agent-a -> agent-b -> agent-c -> agent-a',
  suggestion: 'Break the circular dependency chain'
}
```

**Fix:** Remove one dependency link to break the cycle.

#### Self-Reference

An item references itself in its dependencies.

**Example:**

```typescript
{
  type: 'self_reference',
  message: 'Item "agent-a" references itself in dependencies',
  suggestion: 'Remove "agent-a" from dependencies array'
}
```

**Fix:** Remove the self-reference.

#### Slug Instead of ID

A dependency uses a slug instead of an ID.

**Example:**

```typescript
{
  type: 'slug_instead_of_id',
  message: 'Dependency "anchor-architect" appears to be a slug instead of an ID',
  suggestion: 'Use ID "icm-anchor-architect" instead of slug "anchor-architect"'
}
```

**Fix:** Replace the slug with the correct ID.

### Warning-Level Issues

#### Invalid ID Format

A dependency ID doesn't follow kebab-case format.

**Example:**

```typescript
{
  type: 'invalid_id_format',
  message: 'Dependency "Agent_Name" has invalid ID format (should be kebab-case)',
  suggestion: 'Ensure dependency IDs follow kebab-case format'
}
```

**Fix:** Use kebab-case IDs (lowercase, hyphens only).

### Info-Level Issues

#### Orphaned Item

An item has no dependencies and nothing depends on it.

**Example:**

```typescript
{
  type: 'orphaned_item',
  message: 'Item has no dependencies and nothing depends on it',
  suggestion: 'Consider adding relevant dependencies or removing if unused'
}
```

**Note:** This is informational only - orphaned items may be intentional.

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/validate.yml`:

```yaml
name: Validate Registry

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npx tsx scripts/validate-registry.ts --strict
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npx tsx scripts/validate-registry.ts --strict || {
  echo "❌ Registry validation failed. Fix issues before committing."
  exit 1
}
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "validate": "tsx scripts/validate-registry.ts",
    "validate:strict": "tsx scripts/validate-registry.ts --strict",
    "validate:quick": "node scripts/quick-validate.mjs"
  }
}
```

## Best Practices

### 1. Use IDs, Not Slugs

**Bad:**

```typescript
dependencies: ["anchor-architect", "frontend-fusion"];
```

**Good:**

```typescript
dependencies: ["icm-anchor-architect", "frontend-fusion-engine"];
```

### 2. Avoid Self-References

**Bad:**

```typescript
{
  id: "my-agent",
  dependencies: ["my-agent", "other-agent"]
}
```

**Good:**

```typescript
{
  id: "my-agent",
  dependencies: ["other-agent"]
}
```

### 3. Break Circular Dependencies

If A depends on B, and B depends on C, then C should NOT depend on A.

**Bad:**

```
agent-a -> agent-b -> agent-c -> agent-a
```

**Good:**

```
agent-a -> agent-b -> agent-c
```

### 4. Verify Dependencies Exist

Always check that dependency IDs exist in the registry before adding them.

```typescript
import { getItemById } from "@/lib/registry";

const depId = "some-dependency";
if (getItemById(depId)) {
  // Safe to add
} else {
  // Don't add - will cause validation error
}
```

### 5. Run Validation Before Committing

```bash
npm run validate:strict
```

## Troubleshooting

### "Dependency does not exist in registry"

**Cause:** The dependency ID is invalid or the item hasn't been added to the registry yet.

**Fix:**

1. Check if the ID is correct (case-sensitive, exact match)
2. Verify the item exists in `REGISTRY` array
3. If using a slug, convert to the correct ID

### "Circular dependency detected"

**Cause:** A chain of dependencies creates a loop.

**Fix:**

1. Identify the cycle from the error message
2. Remove one dependency link to break the cycle
3. Consider restructuring dependencies to avoid the cycle

### "Appears to be a slug instead of an ID"

**Cause:** Using a slug (e.g., "anchor-architect") instead of the full ID (e.g., "icm-anchor-architect").

**Fix:**

1. Look up the correct ID in the registry
2. Replace the slug with the ID
3. Re-run validation

## Performance

- Validation typically completes in **< 1 second** for the full registry
- No external dependencies required
- Can be run in CI/CD without performance impact

## API Reference

### validateRegistry()

Validates all registry items and returns a comprehensive report.

**Returns:** `ValidationReport`

### validateItem(itemId: string)

Validates a specific item's dependencies.

**Parameters:**

- `itemId` - The item ID to validate

**Returns:** `ValidationIssue[]`

### generateValidationReport(report: ValidationReport)

Generates a human-readable text report.

**Parameters:**

- `report` - The validation report

**Returns:** `string` - Formatted text report

### validateRegistryStrict()

Validates registry and throws if errors found. Use in CI/CD.

**Throws:** Error with validation report if issues found

### getOrphanedItems()

Returns all orphaned items (no deps, nothing depends on them).

**Returns:** `RegistryItem[]`

### getItemsWithMissingDependencies()

Returns all items with missing dependencies.

**Returns:** `{ item: RegistryItem; missingDeps: string[] }[]`

### getItemsWithCircularDependencies()

Returns all items involved in circular dependencies.

**Returns:** `{ item: RegistryItem; circularPath: string[] }[]`

## Examples

### Example Output

```
================================================================================
REGISTRY DEPENDENCY VALIDATION REPORT
================================================================================

Generated: 2025-12-12T10:30:00.000Z

SUMMARY
--------------------------------------------------------------------------------
Total Items:              450
Items with Dependencies:  312
Items Valid:              445
Items with Issues:        5
Errors:                   3
Warnings:                 2

DEPENDENCY STATISTICS
--------------------------------------------------------------------------------
Coverage:                 69%
Missing Dependencies:     2
Circular Dependencies:    1
Orphaned Items:           15

COVERAGE BY KIND
--------------------------------------------------------------------------------
agent                56/56 (100%)
skill                142/142 (100%)
command              45/67 (67%)
mcp                  69/83 (83%)

ERRORS (3)

[MISSING_DEPENDENCY] Test Command (command/test-deploy)
  Dependency "non-existent-agent" does not exist in registry
  Suggestion: Remove invalid dependency or add missing item to registry

[CIRCULAR_DEPENDENCY] Agent A (agent-a)
  Circular dependency detected: agent-a -> agent-b -> agent-c -> agent-a
  Suggestion: Break the circular dependency chain

[SELF_REFERENCE] Agent B (agent-b)
  Item "Agent B" references itself in dependencies
  Suggestion: Remove "agent-b" from dependencies array
```

## Changelog

### v1.0.0 (2025-12-12)

- Initial release
- Full registry validation
- Missing dependency detection
- Circular dependency detection
- Self-reference detection
- Slug vs ID detection
- Orphaned item identification
- CLI scripts and testing
