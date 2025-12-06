# Clerk Auth Expert

> **ID:** `clerk-auth-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

This skill provides deep expertise in implementing authentication and user management using Clerk in Next.js applications. It covers everything from basic setup to advanced patterns including organizations, role-based access control, webhook synchronization, and custom UI implementations.

Clerk is a complete user management platform that provides authentication, user profiles, and organization management out of the box. This skill teaches you how to leverage Clerk's full power while maintaining control over your data and user experience.

## When to Use

Use this skill when you need to:

- **Set up authentication** in a Next.js app (App Router or Pages Router)
- **Implement multi-tenancy** with organizations and teams
- **Protect routes and API endpoints** with middleware
- **Sync user data** to your database via webhooks
- **Customize authentication UI** while keeping Clerk's backend
- **Add role-based permissions** and access control
- **Implement social login** (Google, GitHub, etc.)
- **Handle user sessions** across client and server components
- **Build SaaS applications** with team/workspace features

## Core Capabilities

### 1. Authentication Setup

#### Basic Next.js App Router Setup

First, install Clerk and set up environment variables:

```bash
npm install @clerk/nextjs
```

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Optional: Customize URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### Root Layout with ClerkProvider

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
          colorText: '#0f172a',
          colorBackground: '#ffffff',
          colorInputBackground: '#f8fafc',
          colorInputText: '#0f172a',
        },
        elements: {
          formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
          card: 'shadow-lg',
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### Sign In Page

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-2xl',
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
      />
    </div>
  )
}
```

#### Sign Up Page

```typescript
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-2xl',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        redirectUrl="/onboarding"
      />
    </div>
  )
}
```

#### User Button Component

```typescript
// components/user-button.tsx
'use client'

import { UserButton } from '@clerk/nextjs'

export function UserNav() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: 'w-10 h-10',
          userButtonPopoverCard: 'shadow-xl',
        },
      }}
      userProfileMode="navigation"
      userProfileUrl="/profile"
    />
  )
}
```

### 2. Session Management

#### Using Auth Hooks in Client Components

```typescript
// components/dashboard-header.tsx
'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function DashboardHeader() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  // Loading state
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  // Not authenticated
  if (!userId) {
    router.push('/sign-in')
    return null
  }

  // Get custom JWT token
  const handleAPICall = async () => {
    const token = await getToken({ template: 'supabase' })
    // Use token for API calls
  }

  return (
    <header className="border-b">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.firstName || 'there'}!
          </h1>
          <p className="text-sm text-gray-600">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Session: {sessionId?.slice(0, 8)}...
          </span>
          <button onClick={handleAPICall}>Call API</button>
        </div>
      </div>
    </header>
  )
}
```

#### Server Component Auth

```typescript
// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      <p>User ID: {userId}</p>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
      <p>Created: {user?.createdAt.toLocaleDateString()}</p>

      {/* Metadata stored in Clerk */}
      <pre className="mt-4 rounded bg-gray-100 p-4">
        {JSON.stringify(user?.publicMetadata, null, 2)}
      </pre>
    </div>
  )
}
```

#### Session Claims and Metadata

```typescript
// lib/auth/session.ts
import { auth, clerkClient } from '@clerk/nextjs'

export async function getUserRole(): Promise<'admin' | 'user' | null> {
  const { userId } = auth()
  if (!userId) return null

  const user = await clerkClient.users.getUser(userId)
  return (user.publicMetadata.role as 'admin' | 'user') || 'user'
}

export async function setUserRole(userId: string, role: 'admin' | 'user') {
  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      role,
    },
  })
}

export async function getUserMetadata<T = Record<string, unknown>>(
  userId: string
): Promise<T> {
  const user = await clerkClient.users.getUser(userId)
  return user.publicMetadata as T
}

export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, unknown>
) {
  await clerkClient.users.updateUser(userId, {
    publicMetadata: metadata,
  })
}
```

### 3. Organization Management

#### Organization Switcher

```typescript
// components/org-switcher.tsx
'use client'

import { OrganizationSwitcher } from '@clerk/nextjs'

export function OrgSwitcher() {
  return (
    <OrganizationSwitcher
      hidePersonal={false}
      appearance={{
        elements: {
          rootBox: 'flex items-center',
          organizationSwitcherTrigger: 'rounded-lg border px-4 py-2',
        },
      }}
      createOrganizationMode="navigation"
      createOrganizationUrl="/orgs/new"
      organizationProfileMode="navigation"
      organizationProfileUrl="/orgs/profile"
      afterCreateOrganizationUrl="/orgs/:id"
      afterSelectOrganizationUrl="/orgs/:id"
      afterSelectPersonalUrl="/dashboard"
    />
  )
}
```

#### Using Organization Data

```typescript
// app/orgs/[orgId]/page.tsx
import { auth, clerkClient } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function OrganizationPage({
  params,
}: {
  params: { orgId: string }
}) {
  const { userId, orgId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Verify user has access to this org
  if (orgId !== params.orgId) {
    redirect('/orgs')
  }

  const organization = await clerkClient.organizations.getOrganization({
    organizationId: params.orgId,
  })

  const members = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: params.orgId,
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{organization.name}</h1>
      <p className="text-gray-600">{organization.slug}</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Members</h2>
        <ul className="mt-4 space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-4 rounded border p-4">
              <img
                src={member.publicUserData.imageUrl}
                alt={member.publicUserData.firstName || 'User'}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <p className="font-medium">
                  {member.publicUserData.firstName} {member.publicUserData.lastName}
                </p>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

#### Organization Roles and Permissions

```typescript
// lib/auth/permissions.ts
import { auth, clerkClient } from '@clerk/nextjs'

export type OrgRole = 'admin' | 'member'

export async function getOrgMembership(orgId: string) {
  const { userId } = auth()
  if (!userId) return null

  const memberships = await clerkClient.users.getOrganizationMembershipList({
    userId,
  })

  return memberships.find((m) => m.organization.id === orgId)
}

export async function hasOrgPermission(
  orgId: string,
  requiredRole: OrgRole = 'member'
): Promise<boolean> {
  const membership = await getOrgMembership(orgId)
  if (!membership) return false

  if (requiredRole === 'admin') {
    return membership.role === 'admin'
  }

  return true
}

export async function requireOrgAdmin(orgId: string) {
  const isAdmin = await hasOrgPermission(orgId, 'admin')
  if (!isAdmin) {
    throw new Error('Admin access required')
  }
}
```

#### Creating Organizations Programmatically

```typescript
// app/actions/organizations.ts
'use server'

import { auth, clerkClient } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { requireOrgAdmin } from '@/lib/auth/permissions'

export async function createOrganization(name: string, slug?: string) {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Not authenticated')
  }

  const organization = await clerkClient.organizations.createOrganization({
    name,
    slug,
    createdBy: userId,
    publicMetadata: {
      plan: 'free',
      createdAt: new Date().toISOString(),
    },
  })

  revalidatePath('/orgs')
  return organization
}

export async function updateOrganizationMetadata(
  orgId: string,
  metadata: Record<string, unknown>
) {
  await requireOrgAdmin(orgId)

  await clerkClient.organizations.updateOrganization(orgId, {
    publicMetadata: metadata,
  })

  revalidatePath(`/orgs/${orgId}`)
}

export async function inviteMember(orgId: string, email: string, role: OrgRole) {
  await requireOrgAdmin(orgId)

  const invitation = await clerkClient.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role,
  })

  return invitation
}
```

### 4. Middleware & Route Protection

#### Basic Middleware Setup

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/about',
    '/pricing',
    '/blog(.*)',
    '/api/webhooks(.*)',
  ],

  // Routes that are ignored by auth middleware
  ignoredRoutes: [
    '/api/public(.*)',
    '/_next(.*)',
    '/favicon.ico',
  ],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

#### Advanced Middleware with Custom Logic

```typescript
// middleware.ts
import { authMiddleware, clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: ['/', '/pricing'],

  async afterAuth(auth, req) {
    // Handle unauthenticated users
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Handle authenticated users on public routes
    if (auth.userId && req.nextUrl.pathname === '/') {
      const dashboard = new URL('/dashboard', req.url)
      return NextResponse.redirect(dashboard)
    }

    // Org-only routes
    if (req.nextUrl.pathname.startsWith('/orgs/')) {
      if (!auth.orgId && auth.userId) {
        return NextResponse.redirect(new URL('/select-org', req.url))
      }
    }

    // Admin-only routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const user = await clerkClient.users.getUser(auth.userId!)
      const isAdmin = user.publicMetadata.role === 'admin'

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

#### API Route Protection

```typescript
// app/api/protected/route.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Protected logic
  return NextResponse.json({
    message: 'Protected data',
    userId
  })
}
```

```typescript
// app/api/admin/route.ts
import { auth, clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await clerkClient.users.getUser(userId)
  const isAdmin = user.publicMetadata.role === 'admin'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Admin-only logic
  const body = await req.json()

  return NextResponse.json({ success: true, data: body })
}
```

#### Server Action Protection

```typescript
// app/actions/admin.ts
'use server'

import { auth, clerkClient } from '@clerk/nextjs'

async function requireAdmin() {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Not authenticated')
  }

  const user = await clerkClient.users.getUser(userId)

  if (user.publicMetadata.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return userId
}

export async function deleteUser(targetUserId: string) {
  await requireAdmin()

  await clerkClient.users.deleteUser(targetUserId)

  return { success: true }
}

export async function updateUserRole(targetUserId: string, role: string) {
  await requireAdmin()

  await clerkClient.users.updateUser(targetUserId, {
    publicMetadata: { role },
  })

  return { success: true }
}
```

### 5. Webhooks

#### Webhook Handler Setup

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  // Get headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  // Handle events
  const eventType = evt.type

  switch (eventType) {
    case 'user.created':
      await handleUserCreated(evt.data)
      break

    case 'user.updated':
      await handleUserUpdated(evt.data)
      break

    case 'user.deleted':
      await handleUserDeleted(evt.data)
      break

    case 'organization.created':
      await handleOrgCreated(evt.data)
      break

    case 'organization.updated':
      await handleOrgUpdated(evt.data)
      break

    case 'organization.deleted':
      await handleOrgDeleted(evt.data)
      break

    case 'organizationMembership.created':
      await handleMembershipCreated(evt.data)
      break

    case 'organizationMembership.deleted':
      await handleMembershipDeleted(evt.data)
      break

    default:
      console.log(`Unhandled event type: ${eventType}`)
  }

  return new Response('Webhook processed', { status: 200 })
}

// Event handlers
async function handleUserCreated(data: any) {
  await db.user.create({
    data: {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
  })

  console.log('User created:', data.id)
}

async function handleUserUpdated(data: any) {
  await db.user.update({
    where: { clerkId: data.id },
    data: {
      email: data.email_addresses[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      updatedAt: new Date(data.updated_at),
    },
  })

  console.log('User updated:', data.id)
}

async function handleUserDeleted(data: any) {
  await db.user.delete({
    where: { clerkId: data.id },
  })

  console.log('User deleted:', data.id)
}

async function handleOrgCreated(data: any) {
  await db.organization.create({
    data: {
      clerkId: data.id,
      name: data.name,
      slug: data.slug,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
  })

  console.log('Organization created:', data.id)
}

async function handleOrgUpdated(data: any) {
  await db.organization.update({
    where: { clerkId: data.id },
    data: {
      name: data.name,
      slug: data.slug,
      imageUrl: data.image_url,
      updatedAt: new Date(data.updated_at),
    },
  })

  console.log('Organization updated:', data.id)
}

async function handleOrgDeleted(data: any) {
  await db.organization.delete({
    where: { clerkId: data.id },
  })

  console.log('Organization deleted:', data.id)
}

async function handleMembershipCreated(data: any) {
  await db.organizationMember.create({
    data: {
      clerkId: data.id,
      organizationId: data.organization.id,
      userId: data.public_user_data.user_id,
      role: data.role,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
  })

  console.log('Membership created:', data.id)
}

async function handleMembershipDeleted(data: any) {
  await db.organizationMember.delete({
    where: { clerkId: data.id },
  })

  console.log('Membership deleted:', data.id)
}
```

#### Prisma Schema for Webhook Sync

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organizations OrganizationMember[]
  posts         Post[]
}

model Organization {
  id       String   @id @default(cuid())
  clerkId  String   @unique
  name     String
  slug     String   @unique
  imageUrl String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members OrganizationMember[]
  posts   Post[]
}

model OrganizationMember {
  id             String   @id @default(cuid())
  clerkId        String   @unique
  role           String

  userId         String
  user           User     @relation(fields: [userId], references: [clerkId], onDelete: Cascade)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [clerkId], onDelete: Cascade)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([userId, organizationId])
}

model Post {
  id             String   @id @default(cuid())
  title          String
  content        String

  authorId       String
  author         User     @relation(fields: [authorId], references: [clerkId], onDelete: Cascade)

  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [clerkId], onDelete: Cascade)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### Testing Webhooks Locally

```typescript
// scripts/test-webhook.ts
import { Webhook } from 'svix'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/clerk'

async function testWebhook() {
  const payload = {
    type: 'user.created',
    data: {
      id: 'user_test123',
      email_addresses: [
        {
          email_address: 'test@example.com',
        },
      ],
      first_name: 'Test',
      last_name: 'User',
      image_url: 'https://example.com/avatar.jpg',
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  }

  const wh = new Webhook(WEBHOOK_SECRET)
  const headers = wh.sign(JSON.stringify(payload))

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
  })

  console.log('Response:', response.status, await response.text())
}

testWebhook()
```

### 6. Custom UI Components

#### Custom Sign In Form

```typescript
// app/custom-sign-in/page.tsx
'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function CustomSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!isLoaded) return

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        console.error('Sign in not complete:', result)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed')
      console.error('Sign in error:', err)
    }
  }

  async function handleGoogleSignIn() {
    if (!isLoaded) return

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err) {
      console.error('Google sign in error:', err)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/sign-up" className="text-blue-600 hover:text-blue-500">
              create a new account
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm">
                Remember me
              </label>
            </div>

            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            <svg className="mr-2 inline h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### Custom Sign Up with Email Verification

```typescript
// app/custom-sign-up/page.tsx
'use client'

import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function CustomSignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      })

      // Send verification email
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      setVerifying(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed')
      console.error('Sign up error:', err)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()

    if (!isLoaded) return

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/onboarding')
      } else {
        console.error('Verification not complete:', result)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed')
      console.error('Verification error:', err)
    }
  }

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-bold">Verify your email</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a code to {email}
            </p>
          </div>

          <form onSubmit={handleVerify} className="mt-8 space-y-6">
            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium">
                Verification code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Verify email
            </button>

            <button
              type="button"
              onClick={() => setVerifying(false)}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Back to sign up
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/sign-in" className="text-blue-600 hover:text-blue-500">
              sign in to existing account
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### Multi-Step Onboarding Flow

```typescript
// app/onboarding/page.tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    teamSize: '',
    goals: [] as string[],
  })

  if (!isLoaded) return <div>Loading...</div>

  async function handleComplete() {
    if (!user) return

    // Save onboarding data to user metadata
    await user.update({
      unsafeMetadata: {
        onboarding: {
          completed: true,
          ...formData,
          completedAt: new Date().toISOString(),
        },
      },
    })

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">Welcome to the platform!</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get you set up (Step {step} of 3)
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium">What's your role?</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="">Select a role</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="product">Product Manager</option>
                <option value="founder">Founder</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Company name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.role}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium">Team size</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {['1-10', '11-50', '51-200', '200+'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFormData({ ...formData, teamSize: size })}
                    className={`rounded-lg border px-4 py-3 text-center ${
                      formData.teamSize === size
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.teamSize}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium">What are your goals?</label>
              <div className="mt-2 space-y-2">
                {[
                  'Improve team collaboration',
                  'Increase productivity',
                  'Better project management',
                  'Track progress',
                ].map((goal) => (
                  <label key={goal} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            goals: [...formData.goals, goal],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            goals: formData.goals.filter((g) => g !== goal),
                          })
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={formData.goals.length === 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Complete setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

## Real-World Examples

### Example 1: SaaS App with Organizations

This example shows a complete SaaS application with team workspaces, role-based access, and Prisma database sync.

#### Project Structure

```
app/
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── sso-callback/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   └── orgs/
│       ├── page.tsx
│       ├── new/page.tsx
│       └── [orgId]/
│           ├── page.tsx
│           ├── settings/page.tsx
│           └── members/page.tsx
├── api/
│   ├── webhooks/clerk/route.ts
│   └── orgs/[orgId]/
│       ├── route.ts
│       └── members/route.ts
└── actions/
    ├── organizations.ts
    └── members.ts
```

#### Dashboard Layout with Org Switcher

```typescript
// app/(dashboard)/layout.tsx
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { OrgSwitcher } from '@/components/org-switcher'
import { UserNav } from '@/components/user-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center gap-4 px-8">
          <div className="font-bold text-xl">YourApp</div>
          <OrgSwitcher />
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

#### Organization Dashboard

```typescript
// app/(dashboard)/orgs/[orgId]/page.tsx
import { auth, clerkClient } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function OrgDashboardPage({
  params,
}: {
  params: { orgId: string }
}) {
  const { userId, orgId } = auth()

  if (!userId || !orgId || orgId !== params.orgId) {
    redirect('/orgs')
  }

  const organization = await clerkClient.organizations.getOrganization({
    organizationId: params.orgId,
  })

  const members = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: params.orgId,
  })

  // Get org-specific data from your database
  const projects = await db.project.findMany({
    where: { organizationId: params.orgId },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{organization.name}</h1>
        <p className="text-gray-600">{members.length} members</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Projects</h3>
          <p className="text-3xl font-bold">{projects.length}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Members</h3>
          <p className="text-3xl font-bold">{members.length}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Plan</h3>
          <p className="text-3xl font-bold">
            {(organization.publicMetadata.plan as string) || 'Free'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Recent Projects</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border p-4">
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-gray-600">
                Created by {project.author.firstName} {project.author.lastName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### Member Management

```typescript
// app/actions/members.ts
'use server'

import { auth, clerkClient } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { requireOrgAdmin } from '@/lib/auth/permissions'

export async function inviteMember(
  orgId: string,
  email: string,
  role: 'admin' | 'member'
) {
  await requireOrgAdmin(orgId)

  const invitation = await clerkClient.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role,
  })

  revalidatePath(`/orgs/${orgId}/members`)
  return invitation
}

export async function removeMember(orgId: string, userId: string) {
  await requireOrgAdmin(orgId)

  await clerkClient.organizations.deleteOrganizationMembership({
    organizationId: orgId,
    userId,
  })

  revalidatePath(`/orgs/${orgId}/members`)
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: 'admin' | 'member'
) {
  await requireOrgAdmin(orgId)

  await clerkClient.organizations.updateOrganizationMembership({
    organizationId: orgId,
    userId,
    role,
  })

  revalidatePath(`/orgs/${orgId}/members`)
}
```

### Example 2: API Route Protection

Complete API authentication with rate limiting and logging.

```typescript
// lib/api/auth.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export interface AuthContext {
  userId: string
  orgId?: string
  role?: string
}

export async function requireAuth(): Promise<AuthContext> {
  const { userId, orgId } = auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return { userId, orgId: orgId || undefined }
}

export async function requireOrgAuth(): Promise<Required<AuthContext>> {
  const { userId, orgId } = auth()

  if (!userId || !orgId) {
    throw new Error('Organization context required')
  }

  return { userId, orgId, role: 'member' }
}

export function withAuth<T>(
  handler: (req: Request, context: AuthContext) => Promise<T>
) {
  return async (req: Request) => {
    try {
      const context = await requireAuth()
      return await handler(req, context)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.error('API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
```

```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  organizationId: z.string().optional(),
})

export const GET = withAuth(async (req, { userId, orgId }) => {
  const projects = await db.project.findMany({
    where: {
      OR: [
        { authorId: userId },
        { organizationId: orgId },
      ],
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({ projects })
})

export const POST = withAuth(async (req, { userId, orgId }) => {
  const body = await req.json()
  const data = createProjectSchema.parse(body)

  const project = await db.project.create({
    data: {
      ...data,
      authorId: userId,
      organizationId: data.organizationId || orgId,
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
  })

  return NextResponse.json({ project }, { status: 201 })
})
```

## Related Skills

- **next14-app-router** - Next.js App Router patterns and conventions
- **prisma-advanced** - Database modeling and migrations with Prisma
- **react-server-components** - Server and client component patterns
- **zod-validation** - Type-safe schema validation
- **tailwind-ui-patterns** - Building beautiful UIs with Tailwind CSS
- **stripe-integration** - Payment processing for SaaS apps
- **vercel-deployment** - Deploying Next.js apps to production

## Further Reading

### Official Documentation
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js SDK](https://clerk.com/docs/references/nextjs/overview)
- [Clerk Organizations](https://clerk.com/docs/organizations/overview)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)

### Guides
- [Next.js 14 App Router with Clerk](https://clerk.com/docs/quickstarts/nextjs)
- [Multi-tenant SaaS with Organizations](https://clerk.com/docs/organizations/verified-domains)
- [Custom Authentication Flows](https://clerk.com/docs/custom-flows/overview)
- [Syncing Users to Your Database](https://clerk.com/docs/integrations/databases/sync-data)

### Advanced Topics
- [JWT Templates](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Session Management](https://clerk.com/docs/references/nextjs/current-user)
- [SAML SSO](https://clerk.com/docs/authentication/saml/overview)
- [Role-Based Access Control](https://clerk.com/docs/organizations/roles-permissions)

### Community Resources
- [Clerk Discord](https://clerk.com/discord)
- [Clerk GitHub](https://github.com/clerkinc/javascript)
- [Example Applications](https://github.com/clerkinc/clerk-nextjs-examples)
