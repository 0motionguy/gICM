---
name: typescript-advanced-types
description: "= { [P in keyof T]?: T[P] }"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# TypeScript Advanced Types

## Quick Reference

```typescript
// Utility types
type Partial<T> = { [P in keyof T]?: T[P] }
type Required<T> = { [P in keyof T]-?: T[P] }
type Readonly<T> = { readonly [P in keyof T]: T[P] }
type Pick<T, K extends keyof T> = { [P in K]: T[P] }
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type Record<K extends keyof any, T> = { [P in K]: T }

// Conditional types
type IsString<T> = T extends string ? true : false
type NonNullable<T> = T extends null | undefined ? never : T

// Template literal types
type Route = `/${string}`
type EmailAddress = `${string}@${string}.${string}`

// Mapped types
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }
```

### Common Type Patterns

```typescript
// Branded types
type UserId = string & { readonly __brand: 'UserId' }
type ProductId = string & { readonly __brand: 'ProductId' }

// Discriminated unions
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Function overloads
function process(value: string): string
function process(value: number): number
function process(value: string | number): string | number {
  return value
}
```

## Core Concepts

### 1. Conditional Types

Transform types based on conditions.

```typescript
// Basic conditional
type IsArray<T> = T extends any[] ? true : false

type A = IsArray<string[]> // true
type B = IsArray<string>   // false

// With infer
type ElementType<T> = T extends (infer U)[] ? U : T

type C = ElementType<string[]> // string
type D = ElementType<number>   // number

// Distributed conditional types
type ToArray<T> = T extends any ? T[] : never

type E = ToArray<string | number> // string[] | number[]

// Extract return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type F = ReturnType<() => string> // string
type G = ReturnType<(x: number) => number> // number

// Extract promise value
type Awaited<T> = T extends Promise<infer U> ? U : T

type H = Awaited<Promise<string>> // string
type I = Awaited<number> // number
```

### 2. Mapped Types

Transform each property in a type.

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P]
}

// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// Remove readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

// Remap keys
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface User {
  name: string
  age: number
}

type UserGetters = Getters<User>
// { getName: () => string; getAge: () => number }

// Filter properties
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Mixed {
  id: number
  name: string
  age: number
  active: boolean
}

type StringProps = PickByType<Mixed, string> // { name: string }
type NumberProps = PickByType<Mixed, number> // { id: number; age: number }
```

### 3. Template Literal Types

Create string literal types with dynamic parts.

```typescript
// Basic template literals
type Route = `/${string}`
type ApiRoute = `/api/${string}`

// Multiple interpolations
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Endpoint = 'users' | 'posts' | 'comments'
type ApiEndpoint = `${HttpMethod} /api/${Endpoint}`

// Uppercase/Lowercase
type UppercaseRoute = Uppercase<Route>
type LowercaseMethod = Lowercase<HttpMethod>

// With mapped types
type EventName = 'click' | 'focus' | 'blur'
type EventHandlers = {
  [K in EventName as `on${Capitalize<K>}`]: (event: Event) => void
}
// { onClick: (event: Event) => void; onFocus: ...; onBlur: ... }

// Extract parts
type ExtractPathParams<T extends string> =
  T extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : T extends `${infer Start}/:${infer Param}`
    ? Param
    : never

type Params = ExtractPathParams<'/users/:id/posts/:postId'>
// 'id' | 'postId'
```

### 4. Discriminated Unions

Type-safe unions with discriminant properties.

```typescript
// Basic discriminated union
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'square'; size: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'square':
      return shape.size ** 2
  }
}

// Result type pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data) // Type is T
  } else {
    console.error(result.error) // Type is Error
  }
}

// State machine
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading'; progress: number }
  | { status: 'success'; data: any }
  | { status: 'error'; error: Error }

function render(state: LoadingState) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return <Progress value={state.progress} />
    case 'success':
      return <Data data={state.data} />
    case 'error':
      return <Error error={state.error} />
  }
}
```

## Common Patterns

### Pattern 1: Branded Types for Type Safety

```typescript
// Brand type helper
type Brand<K, T> = K & { __brand: T }

// Define branded types
type UserId = Brand<string, 'UserId'>
type ProductId = Brand<string, 'ProductId'>
type EmailAddress = Brand<string, 'EmailAddress'>

// Constructor functions
function createUserId(id: string): UserId {
  return id as UserId
}

function createProductId(id: string): ProductId {
  return id as ProductId
}

function createEmail(email: string): EmailAddress {
  if (!email.includes('@')) {
    throw new Error('Invalid email')
  }
  return email as EmailAddress
}

// Usage - prevents mixing types
function getUser(id: UserId) { }
function getProduct(id: ProductId) { }

const userId = createUserId('user-123')
const productId = createProductId('prod-456')

getUser(userId) // OK
getUser(productId) // Error: Type 'ProductId' is not assignable to type 'UserId'

// Numeric brands
type PositiveNumber = Brand<number, 'Positive'>
type NegativeNumber = Brand<number, 'Negative'>

function assertPositive(n: number): asserts n is PositiveNumber {
  if (n <= 0) throw new Error('Not positive')
}

function processPositive(n: PositiveNumber) { }

const num = 42
assertPositive(num)
processPositive(num) // OK after assertion
```

### Pattern 2: Builder Pattern with Type Safety

```typescript
type BuilderState = {
  hasName: boolean
  hasEmail: boolean
  hasAge: boolean
}

type UserBuilder<State extends BuilderState = {
  hasName: false
  hasEmail: false
  hasAge: false
}> = {
  name: (name: string) => UserBuilder<State & { hasName: true }>
  email: (email: string) => UserBuilder<State & { hasEmail: true }>
  age: (age: number) => UserBuilder<State & { hasAge: true }>
  build: State extends { hasName: true; hasEmail: true }
    ? () => User
    : 'Name and email are required'
}

interface User {
  name: string
  email: string
  age?: number
}

function createUserBuilder(): UserBuilder {
  const data: Partial<User> = {}

  return {
    name: (name: string) => {
      data.name = name
      return createUserBuilder() as any
    },
    email: (email: string) => {
      data.email = email
      return createUserBuilder() as any
    },
    age: (age: number) => {
      data.age = age
      return createUserBuilder() as any
    },
    build: (() => data) as any,
  }
}

// Usage
const user1 = createUserBuilder()
  .name('John')
  .email('john@example.com')
  .build() // OK

const user2 = createUserBuilder()
  .name('Jane')
  .build() // Error: 'Name and email are required'

const user3 = createUserBuilder()
  .name('Bob')
  .email('bob@example.com')
  .age(30)
  .build() // OK
```

### Pattern 3: Type-Safe Event Emitter

```typescript
type EventMap = {
  click: { x: number; y: number }
  keypress: { key: string }
  submit: { data: FormData }
}

type EventKey = keyof EventMap

class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: {
    [K in keyof Events]?: Array<(data: Events[K]) => void>
  } = {}

  on<K extends keyof Events>(
    event: K,
    listener: (data: Events[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(listener)
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventListeners = this.listeners[event]
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data))
    }
  }

  off<K extends keyof Events>(
    event: K,
    listener: (data: Events[K]) => void
  ): void {
    const eventListeners = this.listeners[event]
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter(l => l !== listener) as any
    }
  }
}

// Usage
const emitter = new TypedEventEmitter<EventMap>()

emitter.on('click', data => {
  console.log(data.x, data.y) // Type-safe: data has x and y
})

emitter.on('keypress', data => {
  console.log(data.key) // Type-safe: data has key
})

emitter.emit('click', { x: 10, y: 20 }) // OK
emitter.emit('click', { x: 10 }) // Error: Property 'y' is missing
emitter.emit('keypress', { key: 'a' }) // OK
```

### Pattern 4: Deep Partial and Deep Readonly

```typescript
// Deep Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Deep Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Usage
interface Config {
  database: {
    host: string
    port: number
    credentials: {
      username: string
      password: string
    }
  }
  cache: {
    enabled: boolean
    ttl: number
  }
}

// Partial updates
type PartialConfig = DeepPartial<Config>

const update: PartialConfig = {
  database: {
    credentials: {
      password: 'new-password', // OK, everything is optional
    },
  },
}

// Immutable config
type ImmutableConfig = DeepReadonly<Config>

const config: ImmutableConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: { username: 'admin', password: 'secret' },
  },
  cache: { enabled: true, ttl: 3600 },
}

config.database.port = 3306 // Error: Cannot assign to 'port' because it is read-only
config.cache.ttl = 7200 // Error: Cannot assign to 'ttl' because it is read-only
```

## Advanced Techniques

### 1. Recursive Types

```typescript
// JSON type
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

// Path type
type PathImpl<T, Key extends keyof T> =
  Key extends string
    ? T[Key] extends Record<string, any>
      ? | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
      : never
    : never

type Path<T> = PathImpl<T, keyof T> | keyof T

type User = {
  name: string
  address: {
    street: string
    city: string
    country: {
      code: string
      name: string
    }
  }
}

type UserPath = Path<User>
// 'name' | 'address' | 'address.street' | 'address.city' | 'address.country' | 'address.country.code' | 'address.country.name'

// Get value by path
type PathValue<T, P extends Path<T>> =
  P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? Rest extends Path<T[Key]>
        ? PathValue<T[Key], Rest>
        : never
      : never
    : P extends keyof T
    ? T[P]
    : never

type CityType = PathValue<User, 'address.city'> // string
type CodeType = PathValue<User, 'address.country.code'> // string
```

### 2. Variadic Tuple Types

```typescript
// Concat tuples
type Concat<T extends any[], U extends any[]> = [...T, ...U]

type A = Concat<[1, 2], [3, 4]> // [1, 2, 3, 4]

// Push to tuple
type Push<T extends any[], V> = [...T, V]

type B = Push<[1, 2], 3> // [1, 2, 3]

// Function with rest parameters
function curry<T extends any[], R>(
  fn: (...args: T) => R
) {
  return function curried(...args: Partial<T>) {
    if (args.length >= fn.length) {
      return fn(...args as T)
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs)
  }
}

// Zip tuples
type Zip<T extends any[], U extends any[]> =
  T extends [infer TFirst, ...infer TRest]
    ? U extends [infer UFirst, ...infer URest]
      ? [[TFirst, UFirst], ...Zip<TRest, URest>]
      : []
    : []

type C = Zip<[1, 2, 3], ['a', 'b', 'c']>
// [[1, 'a'], [2, 'b'], [3, 'c']]
```

### 3. Type-Level Programming

```typescript
// Type-level numbers
type Inc<N extends number> = [never, 0, 1, 2, 3, 4, 5][N]

type Zero = 0
type One = Inc<Zero> // 1
type Two = Inc<One>  // 2

// Type-level addition (simplified)
type Add<A extends number, B extends number> =
  B extends 0 ? A : Add<Inc<A>, Dec<B>>

// Tuple of length N
type Tuple<N extends number, T = any> =
  N extends N
    ? number extends N
      ? T[]
      : _TupleOf<T, N, []>
    : never

type _TupleOf<T, N extends number, R extends unknown[]> =
  R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>

type FiveTuple = Tuple<5, string> // [string, string, string, string, string]

// Assert type
type Assert<T extends true> = T
type _Test1 = Assert<true> // OK
// type _Test2 = Assert<false> // Error

// Type equality
type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false

type Test1 = Equals<string, string> // true
type Test2 = Equals<string, number> // false
```

### 4. Parser Combinator Types

```typescript
// Parse number from string
type ParseInt<S extends string> =
  S extends `${infer N extends number}` ? N : never

type Num1 = ParseInt<'123'> // 123
type Num2 = ParseInt<'0'> // 0

// Parse tuple
type Split<S extends string, D extends string = ','> =
  S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D>]
    : [S]

type CSV = Split<'a,b,c'> // ['a', 'b', 'c']

// URL parser
type ParseURL<S extends string> =
  S extends `${infer Protocol}://${infer Rest}`
    ? Rest extends `${infer Host}/${infer Path}`
      ? { protocol: Protocol; host: Host; path: Path }
      : { protocol: Protocol; host: Rest; path: '' }
    : never

type URL = ParseURL<'https://example.com/path/to/resource'>
// { protocol: 'https'; host: 'example.com'; path: 'path/to/resource' }

// Query string parser
type ParseQueryString<S extends string> =
  S extends `${infer Key}=${infer Value}&${infer Rest}`
    ? { [K in Key]: Value } & ParseQueryString<Rest>
    : S extends `${infer Key}=${infer Value}`
    ? { [K in Key]: Value }
    : {}

type Query = ParseQueryString<'foo=bar&baz=qux'>
// { foo: 'bar'; baz: 'qux' }
```

## Production Examples

### Example 1: Type-Safe API Client

```typescript
// API schema definition
type APISchema = {
  'GET /users': {
    response: User[]
  }
  'GET /users/:id': {
    params: { id: string }
    response: User
  }
  'POST /users': {
    body: CreateUserDTO
    response: User
  }
  'PUT /users/:id': {
    params: { id: string }
    body: UpdateUserDTO
    response: User
  }
  'DELETE /users/:id': {
    params: { id: string }
    response: void
  }
}

// Extract method and path
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type ExtractMethod<T extends string> =
  T extends `${infer M extends Method} ${string}` ? M : never
type ExtractPath<T extends string> =
  T extends `${Method} ${infer P}` ? P : never

// Type-safe client
class APIClient<Schema extends Record<string, any>> {
  constructor(private baseURL: string) {}

  async request<Route extends keyof Schema>(
    route: Route,
    ...args: Schema[Route] extends { params: infer P; body: infer B }
      ? [params: P, body: B]
      : Schema[Route] extends { params: infer P }
      ? [params: P]
      : Schema[Route] extends { body: infer B }
      ? [body: B]
      : []
  ): Promise<Schema[Route] extends { response: infer R } ? R : never> {
    const method = ExtractMethod<Route & string>
    const path = ExtractPath<Route & string>

    // Implementation...
    return null as any
  }
}

// Usage
const api = new APIClient<APISchema>('https://api.example.com')

// All type-safe!
const users = await api.request('GET /users')
const user = await api.request('GET /users/:id', { id: '123' })
const newUser = await api.request('POST /users', { name: 'John', email: 'john@example.com' })
const updated = await api.request('PUT /users/:id', { id: '123' }, { name: 'Jane' })

// Errors
// await api.request('GET /users/:id') // Error: Expected 1 argument
// await api.request('POST /users', { id: '123' }) // Error: Wrong body type
```

### Example 2: Form Validation with Types

```typescript
// Validation rules
type ValidationRule<T> = (value: T) => string | undefined

type FormSchema = {
  email: string
  password: string
  age: number
  terms: boolean
}

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

// Extract errors
type FormErrors<T> = {
  [K in keyof T]?: string
}

// Form state
type FormState<T> = {
  values: T
  errors: FormErrors<T>
  touched: { [K in keyof T]?: boolean }
}

// Validation helpers
const required =
  <T>(message = 'Required'): ValidationRule<T> =>
  value =>
    value ? undefined : message

const minLength =
  (min: number, message?: string): ValidationRule<string> =>
  value =>
    value.length >= min ? undefined : message || `Minimum ${min} characters`

const email = (message = 'Invalid email'): ValidationRule<string> =>
  value =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message

const min =
  (minValue: number, message?: string): ValidationRule<number> =>
  value =>
    value >= minValue ? undefined : message || `Minimum value is ${minValue}`

// Form hook
function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
  })

  const validate = (field: keyof T): string | undefined => {
    const rules = validationSchema[field]
    if (!rules) return undefined

    for (const rule of rules) {
      const error = rule(state.values[field])
      if (error) return error
    }
    return undefined
  }

  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      errors: { ...prev.errors, [field]: validate(field) },
      touched: { ...prev.touched, [field]: true },
    }))
  }

  return { state, setFieldValue, validate }
}

// Usage
const validationSchema: ValidationSchema<FormSchema> = {
  email: [required(), email()],
  password: [required(), minLength(8)],
  age: [required(), min(18, 'Must be 18+')],
  terms: [required('You must accept the terms')],
}

function SignupForm() {
  const form = useForm<FormSchema>(
    {
      email: '',
      password: '',
      age: 0,
      terms: false,
    },
    validationSchema
  )

  return (
    <form>
      <input
        type="email"
        value={form.state.values.email}
        onChange={e => form.setFieldValue('email', e.target.value)}
      />
      {form.state.errors.email && <span>{form.state.errors.email}</span>}
    </form>
  )
}
```

### Example 3: State Machine with Types

```typescript
// State machine definition
type StateMachine<States extends string, Events extends string> = {
  [S in States]: {
    [E in Events]?: States
  }
}

// Order state machine
type OrderState = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
type OrderEvent = 'process' | 'ship' | 'deliver' | 'cancel'

const orderMachine: StateMachine<OrderState, OrderEvent> = {
  pending: {
    process: 'processing',
    cancel: 'cancelled',
  },
  processing: {
    ship: 'shipped',
    cancel: 'cancelled',
  },
  shipped: {
    deliver: 'delivered',
  },
  delivered: {},
  cancelled: {},
}

// Type-safe state machine
class TypedStateMachine<States extends string, Events extends string> {
  constructor(
    private machine: StateMachine<States, Events>,
    private currentState: States
  ) {}

  getState(): States {
    return this.currentState
  }

  can(event: Events): boolean {
    return event in this.machine[this.currentState]
  }

  transition(event: Events): States {
    const nextState = this.machine[this.currentState][event]

    if (!nextState) {
      throw new Error(`Cannot transition from ${this.currentState} via ${event}`)
    }

    this.currentState = nextState
    return nextState
  }

  getAllowedTransitions(): Events[] {
    return Object.keys(this.machine[this.currentState]) as Events[]
  }
}

// Usage
const order = new TypedStateMachine(orderMachine, 'pending')

console.log(order.can('process')) // true
order.transition('process') // 'processing'

console.log(order.can('deliver')) // false
// order.transition('deliver') // Throws error

order.transition('ship') // 'shipped'
order.transition('deliver') // 'delivered'
```

## Best Practices

### 1. Prefer Union Types Over Enums

```typescript
// BAD - Runtime code
enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

// GOOD - Zero runtime cost
type Status = 'active' | 'inactive'

// With const assertion
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

type Status = typeof STATUS[keyof typeof STATUS]
```

### 2. Use Unknown Over Any

```typescript
// BAD - No type safety
function parse(json: string): any {
  return JSON.parse(json)
}

// GOOD - Requires type checking
function parse(json: string): unknown {
  return JSON.parse(json)
}

const result = parse('{"name":"John"}')
// result.name // Error
if (typeof result === 'object' && result !== null && 'name' in result) {
  console.log(result.name) // OK
}
```

### 3. Leverage Type Guards

```typescript
// Type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// Assertion function
function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string')
  }
}

// Usage
const value: unknown = 'hello'

if (isString(value)) {
  console.log(value.toUpperCase()) // OK
}

assertString(value)
console.log(value.toUpperCase()) // OK after assertion
```

### 4. Use Const Assertions

```typescript
// Without const
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}
// Type: { apiUrl: string; timeout: number }

// With const
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const
// Type: { readonly apiUrl: 'https://api.example.com'; readonly timeout: 5000 }

// For arrays
const routes = ['/home', '/about', '/contact'] as const
type Route = typeof routes[number] // '/home' | '/about' | '/contact'
```

### 5. Avoid Type Assertions

```typescript
// BAD - Unsafe
const value = 'hello' as number

// GOOD - Type guard
function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

// ACCEPTABLE - When you know better than TS
const element = document.getElementById('app') as HTMLDivElement
```

## Common Pitfalls

### 1. Forgetting Distributive Conditional Types

```typescript
// Distributes over unions
type ToArray<T> = T extends any ? T[] : never
type A = ToArray<string | number> // string[] | number[]

// Doesn't distribute
type ToArray2<T> = [T] extends [any] ? T[] : never
type B = ToArray2<string | number> // (string | number)[]
```

### 2. Incorrect Partial Application

```typescript
// BAD - Loses type info
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

// GOOD - Preserves primitives
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T
```

### 3. Overusing Type Assertions

```typescript
// BAD
const data = JSON.parse(response) as User

// GOOD - Runtime validation
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

const data = UserSchema.parse(JSON.parse(response))
```

### 4. Not Using Strict Mode

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 5. Ignoring Variance

```typescript
// Arrays are covariant
type Animal = { name: string }
type Dog = Animal & { breed: string }

const dogs: Dog[] = []
const animals: Animal[] = dogs // OK

animals.push({ name: 'Cat' }) // Runtime error!

// Use readonly for safety
const dogs: readonly Dog[] = []
const animals: readonly Animal[] = dogs // OK
// animals.push({ name: 'Cat' }) // Error: push doesn't exist
```

## Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### Learning
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Effective TypeScript](https://effectivetypescript.com/)

### Tools
- [ts-toolbelt](https://github.com/millsp/ts-toolbelt) - Type utilities
- [type-fest](https://github.com/sindresorhus/type-fest) - Essential types
- [utility-types](https://github.com/piotrwitek/utility-types) - More utilities

### Community
- [TypeScript Discord](https://discord.com/invite/typescript)
- [r/typescript](https://www.reddit.com/r/typescript/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/typescript)
