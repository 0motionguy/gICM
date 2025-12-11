---
name: code-review-best-practices
description: "Master effective code review techniques for improving code quality, knowledge sharing, and team collaboration."
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Code Review Best Practices

Master effective code review techniques for improving code quality, knowledge sharing, and team collaboration.

## Quick Reference

```markdown
# Code Review Checklist

## Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Tests pass and coverage is adequate

## Code Quality
- [ ] Code is readable and maintainable
- [ ] No code duplication (DRY principle)
- [ ] Functions are small and focused (SRP)
- [ ] Variables and functions are well-named

## Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Appropriate use of caching
- [ ] No memory leaks

## Security
- [ ] Input validation is present
- [ ] No SQL injection vulnerabilities
- [ ] Authentication/authorization is correct
- [ ] Sensitive data is protected

## Architecture
- [ ] Follows project patterns and conventions
- [ ] Appropriate separation of concerns
- [ ] Dependencies are reasonable
- [ ] APIs are well-designed
```

## Core Concepts

### The Review Process

1. **Pre-Review Preparation**
   - Ensure CI/CD checks pass
   - Self-review code before requesting review
   - Write clear PR description with context
   - Keep PRs small and focused (< 400 lines)

2. **During Review**
   - Understand the context and requirements
   - Review for logic, not just syntax
   - Suggest improvements, don't demand perfection
   - Ask questions to understand intent
   - Use inline comments for specific feedback

3. **Post-Review**
   - Address all comments or respond with rationale
   - Re-request review after changes
   - Merge promptly after approval
   - Thank reviewers for their time

### Effective Feedback

**Good Feedback**:
```
Consider extracting this logic into a separate function for better testability:

function validateUser(user) {
  // validation logic
}

This would also make it easier to reuse in other contexts.
```

**Poor Feedback**:
```
This is wrong. Fix it.
```

### Common Review Patterns

#### Nitpicks vs Blockers

Use labels to indicate severity:
- `nit:` - Nice to have, non-blocking
- `question:` - Seeking clarification
- `blocker:` - Must be addressed before merge
- `suggestion:` - Optional improvement

#### Praise Good Code

```
This is a great use of the strategy pattern! Makes the code much more extensible.
```

## Advanced Techniques

### Automated Checks

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on: pull_request

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Lint
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test
        run: npm test

  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Coverage
        run: npm run test:coverage
      - name: Comment Coverage
        uses: codecov/codecov-action@v3
```

### Review Metrics

Track review quality:
- Time to first review
- Number of review cycles
- Comment resolution rate
- Merge time
- Bug escape rate (bugs found in production)

## Best Practices

### For Reviewers

1. **Be Kind and Constructive**
   - Assume positive intent
   - Frame feedback as suggestions
   - Explain the "why" behind your comments

2. **Focus on What Matters**
   - Prioritize correctness and maintainability
   - Don't nitpick formatting (use automated tools)
   - Consider the scope and impact

3. **Be Timely**
   - Review within 24 hours
   - Block time daily for reviews
   - Notify if you can't review promptly

4. **Learn Together**
   - Share knowledge through reviews
   - Link to documentation or examples
   - Ask questions to understand new patterns

### For Authors

1. **Make Reviewing Easy**
   - Keep PRs small and focused
   - Write clear descriptions and context
   - Add comments explaining complex logic
   - Include screenshots for UI changes

2. **Respond Professionally**
   - Address all comments
   - Don't take feedback personally
   - Ask for clarification if needed
   - Thank reviewers

3. **Self-Review First**
   - Review your own diff before requesting review
   - Fix obvious issues
   - Add missing tests or documentation
   - Ensure CI passes

## Common Issues to Check

### Logic Errors
```typescript
// Potential bug: off-by-one error
for (let i = 0; i <= arr.length; i++) {  // Should be i < arr.length
  console.log(arr[i])
}

// Edge case not handled
function divide(a: number, b: number) {
  return a / b  // What if b is 0?
}
```

### Security Vulnerabilities
```typescript
// SQL Injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`  // Use parameterized queries

// XSS vulnerability
element.innerHTML = userInput  // Use textContent or sanitize
```

### Performance Issues
```typescript
// N+1 query problem
for (const user of users) {
  const posts = await db.posts.findMany({ where: { userId: user.id } })
}
// Better: Load all posts in one query with JOIN

// Unnecessary re-renders
function Component({ data }) {
  const processedData = expensiveOperation(data)  // Runs on every render!
  // Better: use useMemo
}
```

## Tools and Resources

- **GitHub**: Pull requests, inline comments, review requests
- **GitLab**: Merge requests, approval rules, code owners
- **Gerrit**: Changeset-based reviews
- **Reviewable**: Advanced GitHub review UI
- **Danger**: Automated PR checks and comments

## When to Approve

Approve when:
- ✅ Code works correctly
- ✅ Tests are present and pass
- ✅ Code is maintainable
- ✅ No security issues
- ✅ Follows team conventions

Don't block on:
- ❌ Personal style preferences (if linter approves)
- ❌ Minor nitpicks
- ❌ Future refactoring opportunities (create separate issues)
