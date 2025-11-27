# Command: /refactor

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Intelligent code refactoring with pattern detection and architectural improvements

## Description

The `/refactor` command analyzes your codebase for refactoring opportunities including code duplication, complex functions, anti-patterns, and architectural improvements. It suggests and implements refactoring strategies while maintaining functionality through automated testing.

## Usage

```bash
/refactor [target] [--scope=<scope>] [--strategy=<strategy>]
```

## Arguments

- `target` (optional) - File, directory, or pattern to refactor
- `--scope` - Refactoring scope: `function`, `class`, `module`, `architecture` (default: `module`)
- `--strategy` - Strategy: `extract`, `inline`, `rename`, `move`, `simplify` (default: `auto`)

## Examples

### Example 1: Auto-detect refactoring opportunities
```bash
/refactor src/
```
Analyzes entire src/ directory and suggests refactoring improvements.

### Example 2: Extract function refactoring
```bash
/refactor src/utils.ts --strategy=extract
```
Identifies long functions and extracts reusable logic into separate functions.

### Example 3: Architecture-level refactoring
```bash
/refactor --scope=architecture
```
Analyzes overall architecture and suggests structural improvements.

## Best Practices

- **Test first**: Ensure comprehensive test coverage before refactoring
- **Incremental changes**: Refactor in small, testable increments
- **Version control**: Commit working code before major refactoring
- **Code review**: Have refactored code reviewed by team members

## Related Commands

- `/code-review` - Review code quality before/after refactoring
- `/test-coverage` - Verify test coverage for safe refactoring
- `/performance-audit` - Identify performance-related refactoring opportunities
