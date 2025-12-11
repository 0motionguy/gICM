# Validation Documentation

This directory contains documentation for the gICM validation systems.

## Available Documentation

### [Registry Validation](./REGISTRY_VALIDATION.md)

Comprehensive dependency validation for the gICM registry. Ensures all dependencies are valid, no circular dependencies exist, and IDs are properly formatted.

**Quick Start:**

```bash
# Run validation
npx tsx scripts/validate-registry.ts

# Strict mode (CI/CD)
npx tsx scripts/validate-registry.ts --strict

# Quick validation
node scripts/quick-validate.mjs
```

## Validation Systems

### 1. Registry Dependency Validation

Located in: `src/lib/registry-validator.ts`

**Purpose:** Validates all dependencies in the registry to ensure data integrity.

**Checks:**

- ✅ All dependency IDs reference existing registry items
- ✅ No circular dependencies
- ✅ No self-references
- ✅ Correct ID format (kebab-case, not slugs)
- ℹ️ Identifies orphaned items

**Usage:**

```typescript
import { validateRegistry } from "@/lib/registry-validator";

const report = validateRegistry();
console.log(`Total items: ${report.summary.totalItems}`);
console.log(`Errors: ${report.summary.errorCount}`);
```

### 2. Schema Validation

Located in: `src/types/registry.ts`

**Purpose:** Validates registry items conform to the RegistryItem schema using Zod.

**Usage:**

```typescript
import { RegistryItemSchema } from "@/types/registry";

const result = RegistryItemSchema.safeParse(item);
if (!result.success) {
  console.error("Invalid item:", result.error);
}
```

## Scripts

### Validation Scripts

| Script                 | Location   | Description                                     |
| ---------------------- | ---------- | ----------------------------------------------- |
| `validate-registry.ts` | `scripts/` | Full validation with multiple output formats    |
| `quick-validate.mjs`   | `scripts/` | Quick validation without TypeScript compilation |

### Test Files

| Test File                    | Location             | Description                    |
| ---------------------------- | -------------------- | ------------------------------ |
| `registry-validator.test.ts` | `src/lib/__tests__/` | Comprehensive validation tests |

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate Registry
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx tsx scripts/validate-registry.ts --strict
```

### Pre-commit Hook

```bash
#!/bin/sh
npx tsx scripts/validate-registry.ts --strict
```

## Common Issues & Solutions

### Missing Dependency

**Error:**

```
Dependency "some-agent" does not exist in registry
```

**Solution:**

1. Verify the dependency ID is correct (case-sensitive)
2. Check if the item exists in the registry
3. Remove the dependency if it's invalid

### Circular Dependency

**Error:**

```
Circular dependency detected: agent-a -> agent-b -> agent-c -> agent-a
```

**Solution:**

1. Identify which dependency creates the loop
2. Remove one link in the chain
3. Consider restructuring to avoid the cycle

### Slug Instead of ID

**Error:**

```
Dependency "anchor-architect" appears to be a slug instead of an ID
```

**Solution:**
Replace with the full ID: `"icm-anchor-architect"`

## Best Practices

1. **Always use IDs, not slugs** in dependencies
2. **Run validation before committing** changes to the registry
3. **Use strict mode in CI/CD** to catch errors early
4. **Check validation reports** for orphaned items to clean up unused registry items
5. **Verify dependencies exist** before adding them to avoid errors

## Related Documentation

- [Registry Structure](../registry/STRUCTURE.md) - Learn about registry item structure
- [Dependency Resolver](../dependency-resolver/README.md) - Understanding dependency resolution
- [Contributing Guide](../../CONTRIBUTING.md) - How to contribute to gICM

## Support

For issues or questions:

1. Check the [REGISTRY_VALIDATION.md](./REGISTRY_VALIDATION.md) documentation
2. Review the test files for examples
3. Open an issue on GitHub
