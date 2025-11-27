# Command: /test-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Automatic test generation with edge case detection and coverage analysis

## Description

The `/test-gen` command automatically generates comprehensive test suites for your code including unit tests, integration tests, and edge cases. It analyzes your code structure and creates tests that maximize code coverage.

## Usage

```bash
/test-gen [target] [--type=<type>] [--coverage=<threshold>]
```

## Arguments

- `target` (optional) - File or directory to generate tests for
- `--type` - Test type: `unit`, `integration`, `e2e`, `all` (default: `unit`)
- `--coverage` - Target coverage threshold percentage (default: 80)

## Examples

### Example 1: Generate unit tests
```bash
/test-gen src/utils.ts
```
Generates comprehensive unit tests for utils.ts.

### Example 2: Generate integration tests
```bash
/test-gen src/api/ --type=integration
```
Creates integration tests for API routes.

### Example 3: Full coverage generation
```bash
/test-gen --coverage=95
```
Generates tests to achieve 95% code coverage.

## Test Patterns

- **Unit tests**: Function-level tests with mocks and stubs
- **Integration tests**: Component interaction tests
- **E2E tests**: Full user flow testing
- **Edge cases**: Boundary conditions, error scenarios

## Related Commands

- `/test-coverage` - Check current test coverage
- `/tdd-cycle` - Test-driven development workflow
- `/code-review` - Review generated tests
