# Refactoring Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


Master code refactoring techniques for improving code quality, maintainability, and performance without changing behavior.

## Quick Reference

### Extract Function
```typescript
// Before
function printOwing(invoice) {
  console.log('***********************')
  console.log('**** Customer Owes ****')
  console.log('***********************')

  let outstanding = 0
  for (const o of invoice.orders) {
    outstanding += o.amount
  }

  console.log(`name: ${invoice.customer}`)
  console.log(`amount: ${outstanding}`)
}

// After
function printOwing(invoice) {
  printBanner()
  const outstanding = calculateOutstanding(invoice)
  printDetails(invoice.customer, outstanding)
}

function printBanner() {
  console.log('***********************')
  console.log('**** Customer Owes ****')
  console.log('***********************')
}

function calculateOutstanding(invoice) {
  return invoice.orders.reduce((sum, o) => sum + o.amount, 0)
}

function printDetails(customer, outstanding) {
  console.log(`name: ${customer}`)
  console.log(`amount: ${outstanding}`)
}
```

### Replace Conditional with Polymorphism
```typescript
// Before
class Bird {
  fly() {
    if (this.type === 'european') {
      return 'Flying'
    } else if (this.type === 'african') {
      return 'Flying slowly'
    } else if (this.type === 'norwegian') {
      return 'Cannot fly'
    }
  }
}

// After
abstract class Bird {
  abstract fly(): string
}

class EuropeanBird extends Bird {
  fly() { return 'Flying' }
}

class AfricanBird extends Bird {
  fly() { return 'Flying slowly' }
}

class NorwegianBird extends Bird {
  fly() { return 'Cannot fly' }
}
```

## Common Refactoring Patterns

### 1. Extract Method
- Break long methods into smaller, focused functions
- Each function does one thing well

### 2. Inline Method
- Remove unnecessary indirection
- Merge trivial methods back into caller

### 3. Move Method
- Move method to the class where it belongs
- Reduce feature envy (method using data from another class)

### 4. Replace Magic Numbers
```typescript
// Before
if (status === 1) {
  // ...
}

// After
const STATUS_ACTIVE = 1
if (status === STATUS_ACTIVE) {
  // ...
}
```

### 5. Introduce Parameter Object
```typescript
// Before
function createUser(name, email, age, city, country) {
  // ...
}

// After
interface UserData {
  name: string
  email: string
  age: number
  city: string
  country: string
}

function createUser(data: UserData) {
  // ...
}
```

## Code Smells to Refactor

### Long Method
- Break into smaller methods
- Each method should be 10-20 lines max

### Large Class
- Extract related methods into new classes
- Single Responsibility Principle

### Duplicate Code
- Extract common code into shared function
- Use inheritance or composition

### Data Clumps
- Group related data into objects
- Create value objects

## Best Practices

1. **Refactor in Small Steps**
   - Make one change at a time
   - Run tests after each change
   - Commit working code frequently

2. **Test First**
   - Ensure comprehensive test coverage
   - Tests verify behavior doesn't change
   - Add tests before refactoring if needed

3. **Use Automated Tools**
   - IDE refactoring tools (rename, extract, etc.)
   - Linters and code formatters
   - Static analysis tools

4. **Boy Scout Rule**
   - Leave code better than you found it
   - Small improvements add up
   - Refactor opportunistically
