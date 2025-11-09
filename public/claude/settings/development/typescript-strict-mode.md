# TypeScript Strict Mode

Enforce TypeScript strict mode for all generated TypeScript code. Catches more bugs at compile time.

## Overview

Ensures all generated TypeScript code uses strict mode with full type checking enabled. Catches potential runtime errors at compile time and enforces best practices.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** true
**Recommended:** true for all projects

## Usage

```bash
# Enable strict mode (default)
npx @gicm/cli settings add development/typescript-strict-mode --value true

# Disable strict mode
npx @gicm/cli settings add development/typescript-strict-mode --value false
```

## Strict Mode Checks

**Enabled checks:**
- `strictNullChecks` - Null/undefined handling
- `strictFunctionTypes` - Function parameter checking
- `strictBindCallApply` - Method binding safety
- `strictPropertyInitialization` - Class property initialization
- `noImplicitThis` - Explicit this types
- `alwaysStrict` - "use strict" in all files
- `noImplicitAny` - No implicit any types
- `noUncheckedIndexedAccess` - Array/object access safety

## Code Generation

**With strict mode enabled:**
```typescript
// Claude generates type-safe code
interface User {
  id: string;
  name: string;
  email: string | null; // Explicit null handling
}

function getUser(id: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.id === id); // Explicitly returns undefined
}

const user = getUser("123");
if (user) { // Null check required
  console.log(user.name); // ✓ Safe access
}
```

**Without strict mode:**
```typescript
// May generate unsafe code
function getUser(id) {
  return users.find(u => u.id === id);
}

console.log(getUser("123").name); // ✗ Possible runtime error
```

## Benefits

1. **Catch Errors Early:** Find bugs at compile time
2. **Better IntelliSense:** More accurate auto-completion
3. **Refactoring Safety:** Catch breaking changes
4. **Type Inference:** More precise type inference
5. **Null Safety:** Prevent null/undefined errors

## Common Errors Caught

**Null/undefined:**
```typescript
❌ Object is possibly 'undefined'
💡 Add null check: if (user) { ... }
```

**Implicit any:**
```typescript
❌ Parameter 'data' implicitly has 'any' type
💡 Add type annotation: data: UserData
```

**Property initialization:**
```typescript
❌ Property 'name' has no initializer
💡 Add initializer or mark as optional: name?: string
```

## Affected Components

- `typescript-precision-engineer` - Primary TypeScript agent
- `frontend-fusion-engine` - Next.js/React components
- All agents generating TypeScript code

## Migration to Strict Mode

**Enable gradually:**
```json
{
  "typescript-strict-mode": true,
  "strict-mode-migration": {
    "enabled": true,
    "exclude-patterns": [
      "src/legacy/**",
      "src/vendor/**"
    ]
  }
}
```

## tsconfig.json Integration

**Respects project tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Overrides if setting is true.**

## Performance Impact

**Compile Time:**
- Initial build: +10-20% slower with strict mode
- Incremental builds: Negligible difference
- Type checking: More thorough, but cached

**Benefits outweigh performance cost.**

## Related Settings

- `linting-enabled` - ESLint type-aware rules
- `pre-commit-hooks` - Type check before commits
- `test-before-deploy` - Type check before deploy

## Examples

### Production Configuration
```json
{
  "typescript-strict-mode": true,
  "linting-enabled": true,
  "pre-commit-hooks": true
}
```

### Legacy Project Migration
```json
{
  "typescript-strict-mode": true,
  "strict-mode-migration": {
    "enabled": true,
    "exclude-patterns": ["src/legacy/**"]
  }
}
```

### Disable (Not Recommended)
```json
{
  "typescript-strict-mode": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
