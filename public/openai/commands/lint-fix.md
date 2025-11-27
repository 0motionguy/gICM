# Command: /lint-fix

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Automated linting and code style fixes with conflict resolution

## Description

The `/lint-fix` command runs ESLint, Prettier, and other linters with automatic fixes. Resolves style conflicts, organizes imports, formats code, and ensures consistent code quality across the project.

## Usage

```bash
/lint-fix [target] [--strict] [--format]
```

## Arguments

- `target` (optional) - File or directory to lint and fix
- `--strict` - Enable strict mode (fail on warnings)
- `--format` - Run Prettier formatting after ESLint fixes

## Examples

### Example 1: Fix all files
```bash
/lint-fix --format
```
Lints and formats entire codebase.

### Example 2: Fix specific directory
```bash
/lint-fix src/components/ --strict
```
Lints components with strict mode enabled.

### Example 3: Pre-commit fixes
```bash
/lint-fix --staged
```
Fixes only staged files for pre-commit hook.

## Fixes Applied

- **Code style**: Indentation, quotes, semicolons
- **Import organization**: Sort and group imports
- **Unused code**: Remove unused variables and imports
- **Type errors**: Fix simple TypeScript errors
- **Best practices**: Apply recommended patterns

## Related Commands

- `/code-review` - Review code after fixes
- `/refactor` - Advanced code improvements
- `/config-gen` - Generate linter configs
