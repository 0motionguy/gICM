# Format On Save

Auto-format files after edits. Ensures consistent formatting across the codebase.

## Overview

Automatically formats files using appropriate formatters (Prettier, Black, Rustfmt) after Claude makes edits. Maintains consistent code style without manual intervention.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** true
**Recommended:** true for all projects

## Usage

```bash
# Enable format-on-save (default)
npx @gicm/cli settings add development/format-on-save --value true

# Disable format-on-save
npx @gicm/cli settings add development/format-on-save --value false
```

## Supported Formatters

**JavaScript/TypeScript:**
- Prettier (default)
- ESLint --fix (if configured)

**Rust:**
- Rustfmt

**Python:**
- Black
- autopep8

**Other:**
- Go: gofmt
- C/C++: clang-format
- JSON: json-beautify
- SQL: sql-formatter

## How It Works

**Edit flow:**
```
Claude edits file
  ↓
🎨 Auto-formatting...
  ↓
  ✓ Formatted with Prettier
  ✓ Tabs → Spaces
  ✓ Line length wrapped at 100
  ✓ Quotes normalized
  ↓
✓ File saved with consistent formatting
```

## Formatting Rules

**Respects project configuration:**
- `.prettierrc`
- `.editorconfig`
- `rustfmt.toml`
- `pyproject.toml`

**Default rules if not configured:**
- 2 spaces for indentation
- Single quotes for strings (JS/TS)
- Trailing commas
- 100 character line length

## Performance Impact

**Formatting time:**
- Small files (<100 lines): 50-100ms
- Medium files (100-500 lines): 100-300ms
- Large files (>500 lines): 300-800ms

**Negligible impact on perceived performance.**

## Formatting Conflicts

**Handles conflicts gracefully:**
```
⚠️  Formatting conflict detected

Prettier wants: const foo = { bar: 1 }
ESLint wants:   const foo = {bar: 1}

Prettier takes precedence (format-on-save: true)
Result: const foo = { bar: 1 }
```

## Disable for Specific Files

**`.prettierignore` example:**
```
# Don't format these files
dist/
build/
*.min.js
*.generated.ts
```

## Integration with Linting

**Works together:**
```json
{
  "format-on-save": true,
  "linting-enabled": true
}
```

**Execution order:**
1. Format with Prettier
2. Lint with ESLint
3. Auto-fix linting issues
4. Final formatting pass

## Related Settings

- `linting-enabled` - Enable linting
- `pre-commit-hooks` - Format before commits
- `typescript-strict-mode` - Type checking

## Examples

### Standard Configuration
```json
{
  "format-on-save": true,
  "linting-enabled": true,
  "formatters": {
    "typescript": "prettier",
    "rust": "rustfmt",
    "python": "black"
  }
}
```

### Custom Formatting Rules
```json
{
  "format-on-save": true,
  "prettier": {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 4,
    "printWidth": 120
  }
}
```

### Disable Formatting
```json
{
  "format-on-save": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
