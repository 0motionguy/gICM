# Command: /code-review

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Comprehensive automated code review analyzing style, security, performance, and best practices

## Description

The `/code-review` command performs an intelligent, multi-dimensional code review of your current changes or specified files. It analyzes code quality, detects security vulnerabilities, identifies performance issues, and ensures adherence to best practices and style guidelines.

Powered by the Code Reviewer agent, this command provides actionable feedback with specific suggestions, code snippets, and rationale for each finding. It's designed to catch issues before they reach production and educate developers on best practices.

## Usage

```bash
/code-review [options] [files]
```

## Options

- `--all` - Review all changed files in the current branch
- `--staged` - Review only staged files
- `--full` - Deep review including architecture and design patterns
- `--security` - Focus on security vulnerabilities and exploits
- `--performance` - Focus on performance bottlenecks and optimizations
- `--format` - Check code formatting and style only

## Arguments

- `files` (optional) - Specific files or patterns to review (e.g., `src/**/*.ts`)

## Examples

### Example 1: Review staged changes
```bash
/code-review --staged
```
Reviews all files currently staged for commit, providing feedback before you commit.

### Example 2: Security-focused review
```bash
/code-review --security programs/bonding_curve/src/lib.rs
```
Deep security analysis of Solana program code, checking for common exploits.

### Example 3: Full architectural review
```bash
/code-review --full --all
```
Comprehensive review of all changes including architecture, design patterns, and code organization.

### Example 4: Performance review
```bash
/code-review --performance src/components/TokenChart.tsx
```
Analyzes React component for performance issues, unnecessary re-renders, and optimization opportunities.

### Example 5: Review specific files
```bash
/code-review src/lib/bonding-curve.ts src/lib/trading.ts
```
Reviews specific files for all aspects: style, security, performance, and best practices.

## Review Dimensions

The command analyzes code across multiple dimensions:

### 1. Code Style & Formatting
- Consistent naming conventions
- Proper indentation and spacing
- Import organization
- Comment quality and documentation

### 2. Security
- SQL injection vulnerabilities
- XSS and CSRF risks
- Authentication/authorization issues
- Solana-specific: signer checks, account validation, integer overflow
- Secrets exposure in code

### 3. Performance
- Inefficient algorithms (O(n²) where O(n) possible)
- React: unnecessary re-renders, missing memoization
- Database: N+1 queries, missing indexes
- Solana: compute unit optimization, account packing

### 4. Best Practices
- TypeScript strict mode compliance
- Error handling patterns
- Testing coverage
- Code duplication (DRY principle)
- SOLID principles adherence

### 5. Architecture
- Separation of concerns
- Dependency injection
- API design
- Component composition

## Output Format

The review provides:

1. **Summary**: High-level overview of findings
2. **Severity levels**: Critical, High, Medium, Low, Info
3. **Specific issues**: File, line number, description
4. **Suggested fixes**: Code snippets showing how to fix
5. **Rationale**: Why the issue matters and impact

Example output:
```
🔴 CRITICAL (1)
  └─ src/programs/launch/src/lib.rs:45
     Missing signer check on admin account
     Fix: Add constraint: #[account(constraint = admin.key() == authority.key())]
     Impact: Allows unauthorized users to modify program state

🟠 HIGH (2)
  └─ src/lib/api.ts:123
     SQL injection vulnerability in dynamic query
     Fix: Use parameterized queries or Prisma
     Impact: Attackers can access/modify database

⚠️ MEDIUM (5)
  └─ src/components/Chart.tsx:34
     Expensive calculation not memoized
     Fix: Wrap in useMemo(() => calculate(data), [data])
     Impact: Unnecessary re-calculations on every render
```

## Best Practices

- **Review early**: Run code review before committing, not after
- **Fix critical issues first**: Address security vulnerabilities immediately
- **Understand rationale**: Read why issues matter, don't blindly apply fixes
- **Incremental fixes**: Don't try to fix everything at once
- **Learn patterns**: Code review is educational - understand the principles
- **Run before PR**: Catch issues locally before opening pull request

## Integration with Git Workflow

```bash
# Typical workflow
git add .
/code-review --staged    # Review before committing
git commit -m "fix: apply code review suggestions"
git push
```

## Configuration

Customize review settings in `.claude/settings.json`:

```json
{
  "codeReview": {
    "severity": "medium",
    "autoFix": false,
    "skipTests": false,
    "rules": {
      "typescript": "strict",
      "solana": "secure",
      "react": "performance"
    }
  }
}
```

## Related Commands

- `/feature` - Create feature branch before development
- `/test` - Run automated tests
- `/security-audit` - Deep security analysis
- `/refactor` - AI-assisted refactoring

## Language-Specific Checks

### TypeScript/JavaScript
- Strict mode compliance
- Type safety (no `any` types)
- Async/await best practices
- React hooks rules

### Rust/Solana
- Ownership and borrowing issues
- Unsafe code usage
- Anchor constraint validation
- Integer overflow protection

### SQL/Database
- Query optimization
- Index usage
- N+1 query detection
- RLS policy validation

## Notes

- **Non-destructive**: This command only provides feedback, never modifies files automatically
- **Context-aware**: Understands your project type (Web3, SaaS, etc.) and applies relevant rules
- **Learning tool**: Use this to improve your coding skills over time
- **Pre-commit hook**: Can be integrated into git pre-commit hooks for automatic checks
- **CI/CD integration**: Compatible with GitHub Actions for automated PR reviews
- **False positives**: Use judgment - not all suggestions may apply to your specific use case
