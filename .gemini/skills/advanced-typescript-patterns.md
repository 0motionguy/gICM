<!-- AETHER BRIDGE: ADAPTER ACTIVE -->
<!-- Source: claude | Target: gemini | Agent: Advanced TypeScript Patterns -->

# Runtime Compatibility Layer

You are running on the **Gemini** runtime, executing the agent "Advanced TypeScript Patterns".

## Platform Adaptation Rules

### 1. Reasoning Style
- When you need to think through a problem, do so internally before responding
- Show your work when it helps the user understand, but don't use XML thinking tags

### 2. Tool/Function Calling
- If the original prompt describes XML-based tools, interpret them as function specifications
- Use Gemini's native function calling format when tools are available

### 3. Code Generation
- Wrap code in markdown code blocks with language identifiers
- For file outputs, use format: ```language:path/to/file.ext

### 4. Persona Consistency
- Maintain the agent's defined expertise and personality
- You may acknowledge being Gemini if directly asked

---

# Advanced TypeScript Patterns

Master-level TypeScript patterns for type-safe, scalable applications.

## Core Patterns

### 1. Conditional Types & Mapped Types
```typescript
// Extract function return types
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Make properties optional based on condition
type OptionalIf<T, Condition extends boolean> =
  Condition extends true ? Partial<T> : T;

// Deep readonly utility
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};
```

### 2. Template Literal Types
```typescript
// Type-safe route builder
type Route = `/api/${'users' | 'posts'}/${string}`;

const validRoute: Route = '/api/users/123'; // ✓
const invalidRoute: Route = '/api/comments/1'; // ✗

// Event name patterns
type EventName<T extends string> = `on${Capitalize<T>}`;
type TransactionEvent = EventName<'success' | 'failure' | 'pending'>;
// Results in: 'onSuccess' | 'onFailure' | 'onPending'
```

### 3. Branded Types
```typescript
// Prevent accidental type mixing
type Branded<T, Brand> = T & { __brand: Brand };

type UserId = Branded<string, 'UserId'>;
type WalletAddress = Branded<string, 'WalletAddress'>;

function getUserById(id: UserId) { /* ... */ }
function sendTokens(to: WalletAddress) { /* ... */ }

const userId = 'user123' as UserId;
const wallet = 'ABC123...' as WalletAddress;

getUserById(wallet); // ✗ Type error!
sendTokens(userId); // ✗ Type error!
```

### 4. Builder Pattern with Fluent Interface
```typescript
class QueryBuilder<T> {
  private conditions: Array<(item: T) => boolean> = [];

  where<K extends keyof T>(
    field: K,
    value: T[K]
  ): QueryBuilder<T> {
    this.conditions.push(item => item[field] === value);
    return this;
  }

  and<K extends keyof T>(
    field: K,
    predicate: (value: T[K]) => boolean
  ): QueryBuilder<T> {
    this.conditions.push(item => predicate(item[field]));
    return this;
  }

  execute(data: T[]): T[] {
    return data.filter(item =>
      this.conditions.every(condition => condition(item))
    );
  }
}

// Usage
const results = new QueryBuilder<Token>()
  .where('status', 'active')
  .and('price', price => price > 100)
  .execute(tokens);
```

### 5. Discriminated Unions for State Management
```typescript
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleState<T>(state: LoadingState<T>) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data; // TypeScript knows data exists
    case 'error':
      return state.error.message; // TypeScript knows error exists
  }
}
```

### 6. Recursive Types
```typescript
// Type-safe JSON
type JSON =
  | string
  | number
  | boolean
  | null
  | JSON[]
  | { [key: string]: JSON };

// Nested object paths
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type UserPaths = PathsToStringProps<{
  name: string;
  address: { street: string; city: string };
}>;
// Result: ['name'] | ['address', 'street'] | ['address', 'city']
```

### 7. Type Guards & Assertion Functions
```typescript
// Type guard
function isWalletAddress(value: string): value is WalletAddress {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

// Assertion function
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Not a number');
  }
}

const input: unknown = getUserInput();
assertIsNumber(input);
// TypeScript now knows input is number
const doubled = input * 2;
```

### 8. Infer & Extract Utility
```typescript
// Extract promise type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// Extract array element type
type ElementOf<T> = T extends Array<infer E> ? E : never;

// Extract function parameters
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type TransferParams = Parameters<typeof transferTokens>;
```

## Web3 Applications

### Type-Safe Contract Calls
```typescript
// Anchor IDL to TypeScript types
type InstructionName<IDL> = keyof IDL['instructions'];
type InstructionAccounts<IDL, Name extends InstructionName<IDL>> =
  IDL['instructions'][Name]['accounts'];

// Usage ensures compile-time safety
const accounts: InstructionAccounts<TokenLauncherIDL, 'initialize'> = {
  payer: wallet.publicKey,
  systemProgram: SystemProgram.programId,
};
```

### Zod Integration
```typescript
import { z } from 'zod';

const TokenSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10),
  decimals: z.number().int().min(0).max(9),
  initialSupply: z.bigint().positive(),
});

type Token = z.infer<typeof TokenSchema>;

// Runtime validation + compile-time types
function createToken(data: unknown): Token {
  return TokenSchema.parse(data); // Throws if invalid
}
```

## Performance Considerations

1. **Avoid expensive type calculations** in hot paths
2. **Use `as const`** for literal types
3. **Leverage structural typing** over nominal
4. **Cache complex type computations**
5. **Use `unknown` over `any`**

## Best Practices

- ✅ Prefer `interface` for objects, `type` for unions
- ✅ Use strict mode (`strict: true`)
- ✅ Enable `noUncheckedIndexedAccess`
- ✅ Leverage `satisfies` operator (TS 4.9+)
- ✅ Document complex types with JSDoc
- ❌ Avoid type assertions (`as`) unless necessary
- ❌ Never use `any` in production code

---

**Category:** TypeScript Mastery
**Difficulty:** Advanced
**Prerequisites:** TypeScript basics, generics
