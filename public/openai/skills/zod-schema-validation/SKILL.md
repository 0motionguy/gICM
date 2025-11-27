# Zod Schema Validation

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


Master runtime validation and type-safe schema composition with Zod for bulletproof data validation in TypeScript applications.

## Quick Reference

```typescript
import { z } from 'zod'

// Basic schemas
const stringSchema = z.string()
const numberSchema = z.number()
const booleanSchema = z.boolean()
const dateSchema = z.date()

// Object schema
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date().default(() => new Date())
})

// Infer TypeScript type
type User = z.infer<typeof UserSchema>

// Validate data
const result = UserSchema.safeParse(data)
if (result.success) {
  console.log(result.data) // Typed as User
} else {
  console.error(result.error.format())
}

// Or throw on error
const user = UserSchema.parse(data) // Throws ZodError if invalid

// Array & nested schemas
const PostSchema = z.object({
  title: z.string(),
  author: UserSchema,
  tags: z.array(z.string()).min(1).max(10),
  metadata: z.record(z.string(), z.any())
})

// Union types
const ResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.any() }),
  z.object({ status: z.literal('error'), error: z.string() })
])

// Transform data
const StringToNumber = z.string().transform(val => parseInt(val, 10))
const result = StringToNumber.parse('42') // Returns number 42
```

## Core Concepts

### Schema Types

Zod provides primitives for all TypeScript types:

```typescript
// Primitives
z.string()        // string
z.number()        // number
z.bigint()        // bigint
z.boolean()       // boolean
z.date()          // Date
z.symbol()        // symbol
z.undefined()     // undefined
z.null()          // null
z.void()          // void
z.any()           // any
z.unknown()       // unknown
z.never()         // never

// Empty types
z.nan()           // NaN
z.literal('hi')   // 'hi' (literal type)

// Complex types
z.array(z.string())                     // string[]
z.object({ name: z.string() })          // { name: string }
z.tuple([z.string(), z.number()])       // [string, number]
z.record(z.string(), z.number())        // Record<string, number>
z.map(z.string(), z.number())           // Map<string, number>
z.set(z.string())                       // Set<string>
z.promise(z.string())                   // Promise<string>
z.function()                            // Function

// Special types
z.instanceof(MyClass)                   // instanceof check
z.enum(['A', 'B'])                      // 'A' | 'B'
z.nativeEnum(MyEnum)                    // TypeScript enum
z.union([z.string(), z.number()])       // string | number
z.intersection(TypeA, TypeB)            // TypeA & TypeB
z.discriminatedUnion('type', [...])     // Discriminated union
```

### Validation Methods

```typescript
// parse - Throws ZodError on failure
try {
  const user = UserSchema.parse(data)
  console.log(user)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors)
  }
}

// safeParse - Returns result object
const result = UserSchema.safeParse(data)
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error.errors)
}

// parseAsync / safeParseAsync - For async refinements
const result = await UserSchema.safeParseAsync(data)

// partial validation
const PartialUser = UserSchema.partial()
// All fields become optional

// pick / omit
const UserWithoutEmail = UserSchema.omit({ email: true })
const OnlyNameAndEmail = UserSchema.pick({ name: true, email: true })
```

### Error Handling

```typescript
// ZodError structure
const result = UserSchema.safeParse(data)

if (!result.success) {
  // Raw errors array
  console.log(result.error.errors)
  // [
  //   { path: ['email'], message: 'Invalid email', code: 'invalid_string' },
  //   { path: ['age'], message: 'Expected number, received string', code: 'invalid_type' }
  // ]

  // Formatted errors (nested object)
  console.log(result.error.format())
  // {
  //   email: { _errors: ['Invalid email'] },
  //   age: { _errors: ['Expected number, received string'] },
  //   _errors: []
  // }

  // Flat errors (key-value)
  console.log(result.error.flatten())
  // {
  //   formErrors: [],
  //   fieldErrors: {
  //     email: ['Invalid email'],
  //     age: ['Expected number, received string']
  //   }
  // }

  // Custom error messages
  const CustomSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    age: z.number({ required_error: 'Age is required' }).positive({ message: 'Age must be positive' })
  })
}
```

## Common Patterns

### Pattern 1: API Request/Response Validation

```typescript
// schemas/api.ts
import { z } from 'zod'

// Common schemas
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export const IdParamSchema = z.object({
  id: z.string().uuid()
})

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain uppercase, lowercase, and number'
    }),
  name: z.string().min(1).max(100).trim(),
  dateOfBirth: z.string().datetime().optional()
}).strict() // Reject unknown keys

export const UpdateUserSchema = CreateUserSchema.partial()

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// API response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: z.string().optional(),
    timestamp: z.string().datetime()
  })

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean()
  })

// Usage in API route
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Validate request body
    const result = CreateUserSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      })
    }

    try {
      const user = await createUser(result.data)

      // Validate response
      const validated = UserResponseSchema.parse(user)

      res.status(201).json({
        success: true,
        data: validated,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
  }
}

// Usage in React hook
import { useMutation } from '@tanstack/react-query'

function useCreateUser() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateUserSchema>) => {
      // Validate before sending
      const validated = CreateUserSchema.parse(data)

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated)
      })

      const json = await response.json()

      // Validate response
      const apiResponse = ApiResponseSchema(UserResponseSchema).parse(json)

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Unknown error')
      }

      return apiResponse.data
    }
  })
}
```

### Pattern 2: Form Validation with React Hook Form

```typescript
// hooks/useUserForm.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const UserFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  age: z.number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .positive('Age must be positive')
    .optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
})

export type UserFormData = z.infer<typeof UserFormSchema>

export function useUserForm(defaultValues?: Partial<UserFormData>) {
  return useForm<UserFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues,
    mode: 'onBlur'
  })
}

// components/UserForm.tsx
import { useUserForm } from '@/hooks/useUserForm'

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useUserForm()

  const onSubmit = (data: UserFormData) => {
    console.log('Valid data:', data)
    // Data is guaranteed to be valid!
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input type="number" {...register('age', { valueAsNumber: true })} />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label>Website</label>
        <input {...register('website')} />
        {errors.website && <span>{errors.website.message}</span>}
      </div>

      <div>
        <label>Bio</label>
        <textarea {...register('bio')} />
        {errors.bio && <span>{errors.bio.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('acceptTerms')} />
          Accept Terms
        </label>
        {errors.acceptTerms && <span>{errors.acceptTerms.message}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
```

### Pattern 3: Environment Variables Validation

```typescript
// lib/env.ts
import { z } from 'zod'

// Define schema for environment variables
const EnvSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']),

  // URLs
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'Secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url(),

  // OAuth
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Third-party services
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  SENDGRID_API_KEY: z.string().min(1),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().optional(),

  // Feature flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_CACHE: z.string().transform(val => val === 'true').default('true'),

  // Numeric values
  PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).default('3000'),
  RATE_LIMIT_MAX: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).default('100')
})

// Validate on app start
function validateEnv() {
  const result = EnvSchema.safeParse(process.env)

  if (!result.success) {
    console.error('Invalid environment variables:')
    console.error(JSON.stringify(result.error.format(), null, 2))
    throw new Error('Invalid environment variables')
  }

  return result.data
}

// Export validated env
export const env = validateEnv()

// Type-safe access throughout app
// import { env } from '@/lib/env'
// env.DATABASE_URL // Guaranteed to be valid!
```

## Advanced Techniques

### Custom Refinements & Transforms

```typescript
// Refinements add custom validation logic
const PasswordSchema = z.string()
  .min(8)
  .max(100)
  .refine(password => {
    return /[A-Z]/.test(password)
  }, { message: 'Must contain uppercase letter' })
  .refine(password => {
    return /[a-z]/.test(password)
  }, { message: 'Must contain lowercase letter' })
  .refine(password => {
    return /\d/.test(password)
  }, { message: 'Must contain number' })

// Superrefine for complex validation with multiple errors
const SignUpSchema = z.object({
  password: z.string(),
  confirmPassword: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
      path: ['confirmPassword']
    })
  }

  if (data.password.includes(data.email?.split('@')[0] || '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password cannot contain your email',
      path: ['password']
    })
  }
})

// Transforms modify the data
const DateStringSchema = z.string().datetime().transform(str => new Date(str))

const TrimmedStringSchema = z.string().transform(str => str.trim())

const SlugSchema = z.string()
  .min(1)
  .transform(str => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))

// Chaining transforms
const NormalizedEmailSchema = z.string()
  .email()
  .transform(email => email.toLowerCase())
  .transform(email => email.trim())

// Async refinements
const UniqueEmailSchema = z.string()
  .email()
  .refine(async email => {
    const existing = await db.user.findUnique({ where: { email } })
    return !existing
  }, { message: 'Email already exists' })

// Use with safeParseAsync
const result = await UniqueEmailSchema.safeParseAsync('test@example.com')
```

### Schema Composition

```typescript
// Base schemas
const TimestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date()
})

const SoftDeleteSchema = z.object({
  deletedAt: z.date().nullable()
})

const IdSchema = z.object({
  id: z.string().uuid()
})

// Compose schemas
const BaseEntitySchema = IdSchema.merge(TimestampsSchema)

const SoftDeletableEntitySchema = BaseEntitySchema.merge(SoftDeleteSchema)

// Extend with more fields
const UserSchema = SoftDeletableEntitySchema.extend({
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user'])
})

// Pick/Omit for variations
const PublicUserSchema = UserSchema.pick({
  id: true,
  name: true,
  createdAt: true
})

const UserWithoutTimestamps = UserSchema.omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

// Recursive schemas
const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    parent: CategorySchema.nullable(),
    children: z.array(CategorySchema)
  })
)

type Category = {
  id: string
  name: string
  parent: Category | null
  children: Category[]
}
```

### Discriminated Unions for Polymorphism

```typescript
// API responses with different shapes
const SuccessResponseSchema = z.object({
  status: z.literal('success'),
  data: z.any(),
  timestamp: z.string()
})

const ErrorResponseSchema = z.object({
  status: z.literal('error'),
  error: z.string(),
  code: z.string(),
  timestamp: z.string()
})

const ApiResponseSchema = z.discriminatedUnion('status', [
  SuccessResponseSchema,
  ErrorResponseSchema
])

// Type-safe response handling
function handleResponse(response: z.infer<typeof ApiResponseSchema>) {
  if (response.status === 'success') {
    console.log(response.data) // TypeScript knows data exists
  } else {
    console.error(response.error) // TypeScript knows error exists
  }
}

// Payment methods
const CreditCardSchema = z.object({
  type: z.literal('credit_card'),
  cardNumber: z.string().length(16),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/),
  cvv: z.string().length(3)
})

const PayPalSchema = z.object({
  type: z.literal('paypal'),
  email: z.string().email()
})

const BankTransferSchema = z.object({
  type: z.literal('bank_transfer'),
  accountNumber: z.string(),
  routingNumber: z.string()
})

const PaymentMethodSchema = z.discriminatedUnion('type', [
  CreditCardSchema,
  PayPalSchema,
  BankTransferSchema
])

// Type-safe payment processing
function processPayment(method: z.infer<typeof PaymentMethodSchema>) {
  switch (method.type) {
    case 'credit_card':
      return processCreditCard(method.cardNumber, method.cvv)
    case 'paypal':
      return processPayPal(method.email)
    case 'bank_transfer':
      return processBankTransfer(method.accountNumber)
  }
}
```

### Conditional Schemas

```typescript
// Different validation based on field value
const ConditionalSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal('individual'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.date()
  }),
  z.object({
    userType: z.literal('business'),
    companyName: z.string().min(1),
    taxId: z.string().min(1),
    incorporationDate: z.date()
  })
])

// Dynamic schema based on context
function createUserSchema(isAdmin: boolean) {
  const baseSchema = z.object({
    name: z.string().min(1),
    email: z.string().email()
  })

  if (isAdmin) {
    return baseSchema.extend({
      role: z.enum(['admin', 'user', 'moderator']),
      permissions: z.array(z.string())
    })
  }

  return baseSchema.extend({
    role: z.literal('user')
  })
}

// Schema with optional fields based on another field
const ShippingSchema = z.object({
  needsShipping: z.boolean(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.needsShipping) {
    if (!data.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Address is required when shipping is needed',
        path: ['address']
      })
    }
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'City is required when shipping is needed',
        path: ['city']
      })
    }
    if (!data.zipCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Zip code is required when shipping is needed',
        path: ['zipCode']
      })
    }
  }
})
```

## Production Examples

### Example 1: Database Model with Validation

```typescript
// schemas/user.schema.ts
import { z } from 'zod'

// Input schemas (for creating/updating)
export const CreateUserInputSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  metadata: z.record(z.string(), z.any()).optional()
}).strict()

export const UpdateUserInputSchema = CreateUserInputSchema.partial().omit({ password: true })

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Output schema (from database)
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'guest']),
  emailVerified: z.boolean(),
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable()
})

// Public user schema (safe to expose)
export const PublicUserSchema = UserSchema.pick({
  id: true,
  name: true,
  role: true,
  createdAt: true
})

// Infer types
export type User = z.infer<typeof UserSchema>
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>
export type PublicUser = z.infer<typeof PublicUserSchema>

// lib/db/users.ts
import { prisma } from './client'
import { CreateUserInputSchema, UpdateUserInputSchema, UserSchema } from '@/schemas/user.schema'
import { hash } from 'bcryptjs'

export async function createUser(input: unknown) {
  // Validate input
  const validated = CreateUserInputSchema.parse(input)

  // Hash password
  const hashedPassword = await hash(validated.password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      ...validated,
      password: hashedPassword
    }
  })

  // Validate output
  return UserSchema.parse(user)
}

export async function updateUser(userId: string, input: unknown) {
  const validated = UpdateUserInputSchema.parse(input)

  const user = await prisma.user.update({
    where: { id: userId },
    data: validated
  })

  return UserSchema.parse(user)
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return null

  // Validate data from database
  return UserSchema.parse(user)
}
```

### Example 2: Webhook Validation

```typescript
// schemas/webhooks.ts
import { z } from 'zod'

// Stripe webhook events
const StripeCustomerSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable()
})

const StripeSubscriptionSchema = z.object({
  id: z.string(),
  customer: z.string(),
  status: z.enum(['active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid']),
  current_period_end: z.number(),
  cancel_at_period_end: z.boolean()
})

const StripeWebhookEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('customer.subscription.created'),
    data: z.object({
      object: StripeSubscriptionSchema
    })
  }),
  z.object({
    type: z.literal('customer.subscription.updated'),
    data: z.object({
      object: StripeSubscriptionSchema
    })
  }),
  z.object({
    type: z.literal('customer.subscription.deleted'),
    data: z.object({
      object: StripeSubscriptionSchema
    })
  }),
  z.object({
    type: z.literal('invoice.payment_succeeded'),
    data: z.object({
      object: z.object({
        id: z.string(),
        customer: z.string(),
        subscription: z.string().nullable(),
        amount_paid: z.number(),
        currency: z.string()
      })
    })
  })
])

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>

// pages/api/webhooks/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { buffer } from 'micro'
import { StripeWebhookEventSchema } from '@/schemas/webhooks'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Validate event structure
  const result = StripeWebhookEventSchema.safeParse(event)

  if (!result.success) {
    console.error('Invalid webhook event:', result.error.format())
    return res.status(400).json({ error: 'Invalid event structure' })
  }

  const validatedEvent = result.data

  // Type-safe event handling
  switch (validatedEvent.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(validatedEvent.data.object)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(validatedEvent.data.object)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(validatedEvent.data.object)
      break

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(validatedEvent.data.object)
      break
  }

  res.json({ received: true })
}
```

### Example 3: File Upload Validation

```typescript
// schemas/upload.schema.ts
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword']

export const ImageUploadSchema = z.object({
  file: z.custom<File>()
    .refine(file => file !== undefined, 'File is required')
    .refine(file => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
  alt: z.string().min(1).max(200).optional(),
  tags: z.array(z.string()).max(10).optional()
})

export const DocumentUploadSchema = z.object({
  file: z.custom<File>()
    .refine(file => file !== undefined, 'File is required')
    .refine(file => file.size <= MAX_FILE_SIZE * 2, 'File size must be less than 10MB')
    .refine(
      file => ACCEPTED_DOCUMENT_TYPES.includes(file.type),
      'Only PDF and Word documents are supported'
    ),
  title: z.string().min(1).max(200),
  category: z.enum(['contract', 'invoice', 'report', 'other'])
})

// Form handling
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function ImageUploadForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ImageUploadSchema)
  })

  const onSubmit = async (data: z.infer<typeof ImageUploadSchema>) => {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.alt) formData.append('alt', data.alt)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))

    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="file" {...register('file')} accept={ACCEPTED_IMAGE_TYPES.join(',')} />
      {errors.file && <span>{errors.file.message as string}</span>}

      <input {...register('alt')} placeholder="Alt text" />
      {errors.alt && <span>{errors.alt.message}</span>}

      <button type="submit">Upload</button>
    </form>
  )
}

// Server-side validation
import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ maxFileSize: MAX_FILE_SIZE })

  const [fields, files] = await form.parse(req)

  const file = files.file?.[0]

  if (!file) {
    return res.status(400).json({ error: 'No file provided' })
  }

  // Validate with Zod
  const result = ImageUploadSchema.safeParse({
    file: {
      size: file.size,
      type: file.mimetype,
      name: file.originalFilename
    } as File,
    alt: fields.alt?.[0],
    tags: fields.tags ? JSON.parse(fields.tags[0]) : undefined
  })

  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors
    })
  }

  // Process upload...
  res.json({ success: true })
}
```

## Best Practices

### 1. Organize Schemas by Domain

```typescript
// schemas/
//   auth/
//     login.schema.ts
//     signup.schema.ts
//     reset-password.schema.ts
//   users/
//     user.schema.ts
//     profile.schema.ts
//   posts/
//     post.schema.ts
//     comment.schema.ts
//   common/
//     pagination.schema.ts
//     id.schema.ts
```

### 2. Separate Input/Output Schemas

```typescript
// Input: What API accepts
export const CreatePostInputSchema = z.object({
  title: z.string().min(1),
  content: z.string()
})

// Output: What API returns (includes generated fields)
export const PostSchema = CreatePostInputSchema.extend({
  id: z.string().uuid(),
  slug: z.string(),
  authorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})
```

### 3. Use Branded Types for Domain Values

```typescript
// Create branded types for extra type safety
const EmailSchema = z.string().email().brand<'Email'>()
const UserIdSchema = z.string().uuid().brand<'UserId'>()
const PositiveNumberSchema = z.number().positive().brand<'PositiveNumber'>()

type Email = z.infer<typeof EmailSchema>
type UserId = z.infer<typeof UserIdSchema>

// Can't accidentally mix up different string types
function sendEmail(to: Email, userId: UserId) {
  // ...
}

const email = EmailSchema.parse('user@example.com')
const id = UserIdSchema.parse('123e4567-e89b-12d3-a456-426614174000')

sendEmail(email, id) // OK
sendEmail(id, email) // Type error!
```

### 4. Centralize Error Messages

```typescript
// lib/validation-messages.ts
export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters`,
  password: 'Password must contain uppercase, lowercase, and number',
  terms: 'You must accept the terms and conditions'
}

// Use in schemas
const UserSchema = z.object({
  email: z.string().email(ValidationMessages.email),
  name: z.string().min(1, ValidationMessages.required('Name')),
  password: z.string().min(8, ValidationMessages.minLength('Password', 8))
})
```

## Common Pitfalls

1. **Not Using safeParse in User-Facing Code**
   - Use `parse()` only when you're certain data is valid
   - Always use `safeParse()` for user input

2. **Forgetting to Transform Parsed Data**
   - `z.string().transform(val => parseInt(val))` won't infer as number
   - Use `.pipe()`: `z.string().transform(val => parseInt(val)).pipe(z.number())`

3. **Circular Dependencies in Schemas**
   - Use `z.lazy()` for recursive types
   - Don't reference schema before it's defined

4. **Not Validating API Responses**
   - Validate both requests AND responses
   - Protects against API changes

5. **Overusing `.any()` and `.unknown()`**
   - Be as specific as possible
   - Unknown data should be validated, not ignored

6. **Not Handling Async Refinements**
   - Use `safeParseAsync()` when schema has async refinements
   - Regular `safeParse()` will throw

7. **Large Schema Performance**
   - Consider lazy evaluation for complex nested schemas
   - Cache parsed results when appropriate

## Resources

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [tRPC + Zod](https://trpc.io/docs/server/validators)
- [Zod to TypeScript](https://github.com/sachinraja/zod-to-ts)
- [Zod to JSON Schema](https://github.com/StefanTerdell/zod-to-json-schema)
