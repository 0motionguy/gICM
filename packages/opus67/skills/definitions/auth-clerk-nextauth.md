# Auth Expert (Clerk/NextAuth)

> **ID:** `auth-clerk-nextauth`
> **Tier:** 2
> **Token Cost:** 7000
> **MCP Connections:** context7

## 🎯 What This Skill Does

- Implement Clerk authentication
- NextAuth.js configuration
- Social login providers
- Magic link authentication
- Role-based access control
- Protected routes and middleware
- Session management
- Multi-tenant auth

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** clerk, nextauth, auth, login, signin, session, oauth, social
- **File Types:** N/A
- **Directories:** N/A

## 🚀 Core Capabilities

### 1. Implement Clerk Authentication

Clerk provides a complete authentication solution with beautiful pre-built components, user management dashboard, and organization support.

**Installation & Setup:**
```bash
pnpm add @clerk/nextjs
```

**Environment Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Root Layout Setup (App Router):**
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Middleware Configuration:**
```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**Best Practices:**
- Use `clerkMiddleware` for route protection (v5+ pattern)
- Configure public routes explicitly with `createRouteMatcher`
- Set redirect URLs in environment variables for flexibility
- Use `auth.protect()` for async route protection

**Pre-built Components:**
```tsx
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}

// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

**User Button Component:**
```tsx
import { UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
```

**Gotchas:**
- Middleware must be at root level (not in src/)
- Clerk v5 uses `clerkMiddleware` instead of `authMiddleware`
- Public routes need explicit matching - default protects all
- Webhook routes must be public for Clerk events


### 2. NextAuth.js Configuration

NextAuth.js (now Auth.js) provides flexible authentication with any OAuth provider or custom credentials.

**Installation:**
```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

**Auth Configuration (App Router):**
```ts
// auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },
});
```

**Route Handler:**
```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

**Best Practices:**
- Use JWT strategy with database adapter for performance
- Extend session with custom fields via callbacks
- Generate AUTH_SECRET with `openssl rand -base64 32`
- Use `auth()` function in Server Components for session access

**Type Extensions:**
```ts
// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: string } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
```

**Gotchas:**
- v5 uses `auth()` not `getServerSession()`
- Credentials provider doesn't persist sessions by default
- Must use JWT strategy with Credentials provider
- Edge runtime requires edge-compatible adapter


### 3. Social Login Providers

**Clerk Social Providers:**
```tsx
// Custom OAuth Button
import { useSignIn } from '@clerk/nextjs';

export function SocialButtons() {
  const { signIn } = useSignIn();

  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    await signIn?.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/dashboard',
    });
  };

  return (
    <div className="space-y-2">
      <button onClick={() => handleOAuth('oauth_google')}>Continue with Google</button>
      <button onClick={() => handleOAuth('oauth_github')}>Continue with GitHub</button>
    </div>
  );
}
```

**NextAuth Provider Setup:**
```ts
import Discord from 'next-auth/providers/discord';
import Twitter from 'next-auth/providers/twitter';
import Apple from 'next-auth/providers/apple';

export const { handlers, auth } = NextAuth({
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }),
    Discord({ clientId: process.env.DISCORD_CLIENT_ID!, clientSecret: process.env.DISCORD_CLIENT_SECRET! }),
    Twitter({ clientId: process.env.TWITTER_CLIENT_ID!, clientSecret: process.env.TWITTER_CLIENT_SECRET!, version: '2.0' }),
  ],
});
```

**Best Practices:**
- Enable multiple providers for user convenience
- Implement account linking for same email addresses
- Store access tokens for API access (if needed)

**Gotchas:**
- Each provider has different callback URL requirements
- Apple requires paid developer account
- Some providers require domain verification


### 4. Magic Link Authentication

**Clerk Magic Links:**
```tsx
import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';

export function MagicLinkForm() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn?.create({ strategy: 'email_link', identifier: email, redirectUrl: '/dashboard' });
    setSent(true);
  };

  if (sent) return <p>Check your email for a magic link!</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Send Magic Link</button>
    </form>
  );
}
```

**NextAuth Email Provider:**
```ts
import Email from 'next-auth/providers/email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

Email({
  from: 'noreply@yourdomain.com',
  sendVerificationRequest: async ({ identifier, url }) => {
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: identifier,
      subject: 'Sign in to Your App',
      html: `<a href="${url}">Sign In</a>`,
    });
  },
}),
```

**Best Practices:**
- Set reasonable token expiry (1-24 hours)
- Include clear call-to-action in emails
- Implement rate limiting on email sends


### 5. Role-Based Access Control (RBAC)

**Clerk Organizations & Roles:**
```tsx
import { auth } from '@clerk/nextjs/server';

export async function checkRole(requiredRole: string) {
  const { userId, orgRole } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const roleHierarchy = ['org:admin', 'org:member', 'org:viewer'];
  const userRoleIndex = roleHierarchy.indexOf(orgRole || '');
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  if (userRoleIndex === -1 || userRoleIndex > requiredRoleIndex) {
    throw new Error('Insufficient permissions');
  }
  return true;
}
```

**NextAuth RBAC Implementation:**
```ts
// lib/rbac.ts
export type Role = 'admin' | 'manager' | 'member' | 'viewer';
export type Permission = 'users:read' | 'users:write' | 'users:delete' | 'posts:read' | 'posts:write';

const rolePermissions: Record<Role, Permission[]> = {
  admin: ['users:read', 'users:write', 'users:delete', 'posts:read', 'posts:write'],
  manager: ['users:read', 'users:write', 'posts:read', 'posts:write'],
  member: ['users:read', 'posts:read', 'posts:write'],
  viewer: ['users:read', 'posts:read'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
```

**Server Action with RBAC:**
```ts
'use server';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/rbac';

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  if (!hasPermission(session.user.role as Role, 'users:delete')) throw new Error('Insufficient permissions');

  await prisma.user.delete({ where: { id: userId } });
}
```

**Component-Level RBAC:**
```tsx
import { auth } from '@/auth';
import { hasPermission, Permission, Role } from '@/lib/rbac';

export async function PermissionGate({ permission, fallback = null, children }: {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.role) return fallback;
  if (!hasPermission(session.user.role as Role, permission)) return fallback;
  return <>{children}</>;
}
```


### 6. Protected Routes and Middleware

**Clerk Middleware Patterns:**
```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId, orgRole } = await auth();

  if (isPublicRoute(request)) return NextResponse.next();

  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute(request) && orgRole !== 'org:admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
});
```

**NextAuth Middleware:**
```ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in');
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (isAdminRoute && req.auth?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});
```


### 7. Session Management

**Clerk Session Handling:**
```tsx
// Server Components
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const { userId, sessionId } = await auth();
  const user = await currentUser();
  if (!userId || !user) redirect('/sign-in');

  return <h1>Welcome, {user.firstName}</h1>;
}

// Client Components
'use client';
import { useUser, useAuth } from '@clerk/nextjs';

export function ClientProfile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Not signed in</div>;

  return (
    <div>
      <p>User: {user.fullName}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

**NextAuth Session Handling:**
```tsx
// Server Component
import { auth } from '@/auth';

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  return <p>Welcome, {session.user.name}</p>;
}

// Client Component
'use client';
import { useSession, signOut } from 'next-auth/react';

export function ClientDashboard() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not signed in</div>;

  return (
    <div>
      <p>User: {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```


### 8. Multi-Tenant Authentication

**Clerk Organizations:**
```tsx
import { OrganizationSwitcher } from '@clerk/nextjs';

export function TenantSwitcher() {
  return (
    <OrganizationSwitcher
      afterSelectOrganizationUrl="/org/:slug/dashboard"
      afterCreateOrganizationUrl="/org/:slug/settings"
    />
  );
}

// Access org in Server Components
import { auth } from '@clerk/nextjs/server';

export default async function OrgDashboard() {
  const { orgId, orgSlug, orgRole } = await auth();
  if (!orgId) redirect('/select-org');

  return (
    <div>
      <h1>Org: {orgSlug}</h1>
      <p>Your role: {orgRole}</p>
    </div>
  );
}
```

**Tenant-Scoped Data Access:**
```ts
import { auth } from '@/auth';

export async function getProjects() {
  const session = await auth();
  if (!session?.orgId) throw new Error('No organization selected');

  return prisma.project.findMany({
    where: { organizationId: session.orgId },
  });
}
```


## 💡 Real-World Examples

### Example 1: Complete Auth Flow with Clerk
```tsx
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect();
});

// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
export default function RootLayout({ children }) {
  return <ClerkProvider><html><body>{children}</body></html></ClerkProvider>;
}

// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect('/sign-in');
  return <h1>Welcome, {user?.firstName}!</h1>;
}
```

### Example 2: NextAuth with Prisma & Credentials
```ts
// auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.hashedPassword) return null;
        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        return valid ? user : null;
      },
    }),
  ],
});
```

### Example 3: API Route with Role Check
```ts
// app/api/admin/users/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { hasPermission } from '@/lib/rbac';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(session.user.role, 'users:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await request.json();
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
```

## 🔗 Related Skills

- `prisma-drizzle-orm` - Database adapters for auth
- `trpc-fullstack` - Protected tRPC procedures
- `supabase-developer` - Supabase Auth alternative
- `api-design-specialist` - Protected API design

## 📖 Further Reading

- [Clerk Documentation](https://clerk.com/docs)
- [NextAuth.js v5 Documentation](https://authjs.dev)
- [Clerk + Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [NextAuth Prisma Adapter](https://authjs.dev/reference/adapter/prisma)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
