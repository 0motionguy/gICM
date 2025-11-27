# Debugging Techniques

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master systematic debugging strategies, tools, and techniques for identifying and fixing bugs efficiently.

## Quick Reference

```typescript
// Debugger statements
debugger  // Pauses execution in dev tools

// Console debugging
console.log('Value:', value)
console.table(arrayOfObjects)
console.trace() // Stack trace
console.time('operation') // Start timer
console.timeEnd('operation') // End timer

// Conditional breakpoints in dev tools
// Add condition: userId === '123'

// Chrome DevTools shortcuts
// F8 - Resume/pause
// F10 - Step over
// F11 - Step into
// Shift+F11 - Step out
```

## Core Debugging Strategies

### 1. Reproduce Consistently
- Identify exact steps to reproduce
- Document environment and conditions
- Create minimal reproduction case

### 2. Binary Search Debugging
- Comment out half the code
- Identify which half has the bug
- Repeat until isolated

### 3. Rubber Duck Debugging
- Explain code line-by-line to someone (or a rubber duck)
- Often reveals the issue during explanation

### 4. Git Bisect
```bash
git bisect start
git bisect bad HEAD  # Current commit is bad
git bisect good abc123  # Known good commit
# Git will checkout commits for testing
git bisect good  # If current commit works
git bisect bad   # If current commit fails
```

## Advanced Debugging Tools

### Node.js Debugging
```bash
# Start with inspector
node --inspect server.js

# Debug specific file
node --inspect-brk app.js  # Break before code runs

# Connect Chrome DevTools to chrome://inspect
```

### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Program",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## Common Bug Patterns

### Race Conditions
```typescript
// Bug: Race condition
let total = 0
async function increment() {
  const current = total
  await delay(100)
  total = current + 1  // Lost updates!
}

// Fix: Atomic operations
let total = 0
const lock = new Mutex()
async function increment() {
  await lock.acquire()
  try {
    total++
  } finally {
    lock.release()
  }
}
```

### Memory Leaks
```typescript
// Bug: Event listener leak
class Component {
  constructor() {
    window.addEventListener('resize', this.handleResize)
  }
  // Missing cleanup!
}

// Fix: Cleanup in destructor
class Component {
  constructor() {
    window.addEventListener('resize', this.handleResize)
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize)
  }
}
```

## Best Practices

1. **Read Error Messages Carefully**
   - Read the full stack trace
   - Identify the root cause, not symptoms
   - Search for error messages online

2. **Add Logging Strategically**
   - Log inputs and outputs
   - Use structured logging
   - Include context (user ID, request ID)

3. **Use Source Maps**
   - Enable in production for better stack traces
   - Map minified code back to source

4. **Test in Isolation**
   - Write unit tests to isolate behavior
   - Use mocks to control dependencies
   - Test edge cases

5. **Take Breaks**
   - Step away for 5-10 minutes
   - Fresh perspective often reveals solution
