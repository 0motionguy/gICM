# DB Commander

> **ID:** `db-commander`
> **Tier:** 2
> **Token Cost:** 7000
> **MCP Connections:** supabase

## 🎯 What This Skill Does

- Supabase operations
- SQL execution
- Migration management
- Type generation

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** supabase, database, sql, migrate
- **File Types:** N/A
- **Directories:** N/A

## 🚀 Core Capabilities

### 1. Supabase Operations

Supabase provides a full Postgres database with real-time subscriptions, authentication, and storage.

**Client Setup:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );
}
```

**CRUD Operations:**
```typescript
// Select with filters
const { data: users, error } = await supabase
  .from('users')
  .select('id, email, profile:profiles(*)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);

// Insert single row
const { data: user, error } = await supabase
  .from('users')
  .insert({ email: 'user@example.com', name: 'John' })
  .select()
  .single();

// Insert multiple rows
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Post 1', user_id: userId },
    { title: 'Post 2', user_id: userId },
  ])
  .select();

// Upsert (insert or update)
const { data, error } = await supabase
  .from('users')
  .upsert({ id: userId, email: 'new@example.com' }, { onConflict: 'id' })
  .select();

// Update with filters
const { data, error } = await supabase
  .from('posts')
  .update({ status: 'published', published_at: new Date().toISOString() })
  .eq('id', postId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

**Advanced Queries:**
```typescript
// Join tables with foreign key
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    author:users!posts_author_id_fkey (
      id,
      name,
      avatar_url
    ),
    comments (
      id,
      content,
      user:users (name)
    )
  `)
  .eq('status', 'published');

// Full-text search
const { data } = await supabase
  .from('posts')
  .select()
  .textSearch('title', 'nextjs react', { type: 'websearch' });

// Range queries
const { data } = await supabase
  .from('products')
  .select()
  .gte('price', 10)
  .lte('price', 100);

// Array contains
const { data } = await supabase
  .from('posts')
  .select()
  .contains('tags', ['javascript', 'react']);

// JSON field query
const { data } = await supabase
  .from('users')
  .select()
  .eq('metadata->theme', 'dark');

// Count without fetching data
const { count } = await supabase
  .from('posts')
  .select('*', { count: 'exact', head: true });
```

**Real-time Subscriptions:**
```typescript
// Subscribe to table changes
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE, or *
      schema: 'public',
      table: 'posts',
      filter: 'user_id=eq.' + userId,
    },
    (payload) => {
      console.log('Change received:', payload);
      if (payload.eventType === 'INSERT') {
        addPost(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        updatePost(payload.new);
      } else if (payload.eventType === 'DELETE') {
        removePost(payload.old.id);
      }
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

**Best Practices:**
- Use `.single()` when expecting one row (throws if 0 or >1)
- Always handle errors from Supabase operations
- Use RLS (Row Level Security) for authorization
- Prefer Server Components for data fetching

**Gotchas:**
- Supabase client caches connections - reuse clients
- Real-time requires enabling replication for tables
- `.select()` after insert/update to get returned data
- Foreign key relationships require proper naming convention


### 2. SQL Execution

Execute raw SQL for complex queries, stored procedures, and database functions.

**Direct SQL Queries:**
```typescript
// Execute raw SQL
const { data, error } = await supabase.rpc('exec_sql', {
  query: 'SELECT * FROM users WHERE email LIKE $1',
  params: ['%@example.com']
});

// Using postgres.js for complex queries
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

// Tagged template literal (safe from injection)
const users = await sql`
  SELECT u.*, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  WHERE u.created_at > ${oneWeekAgo}
  GROUP BY u.id
  ORDER BY post_count DESC
  LIMIT 10
`;

// Transactions
await sql.begin(async (tx) => {
  const [user] = await tx`
    INSERT INTO users (email, name)
    VALUES (${email}, ${name})
    RETURNING *
  `;

  await tx`
    INSERT INTO profiles (user_id, bio)
    VALUES (${user.id}, ${bio})
  `;

  await tx`
    INSERT INTO audit_log (action, user_id)
    VALUES ('user_created', ${user.id})
  `;
});
```

**Database Functions (RPC):**
```sql
-- Create function in Supabase SQL Editor
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'post_count', (SELECT COUNT(*) FROM posts WHERE author_id = user_id),
    'comment_count', (SELECT COUNT(*) FROM comments WHERE user_id = user_id),
    'like_count', (SELECT COUNT(*) FROM likes WHERE user_id = user_id)
  );
$$ LANGUAGE SQL STABLE;
```

```typescript
// Call function from client
const { data: stats, error } = await supabase
  .rpc('get_user_stats', { user_id: userId });
```

**Stored Procedures:**
```sql
-- Create procedure for complex operations
CREATE OR REPLACE FUNCTION transfer_credits(
  from_user UUID,
  to_user UUID,
  amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Check balance
  IF (SELECT credits FROM users WHERE id = from_user) < amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Perform transfer
  UPDATE users SET credits = credits - amount WHERE id = from_user;
  UPDATE users SET credits = credits + amount WHERE id = to_user;

  -- Log transaction
  INSERT INTO credit_transfers (from_user, to_user, amount)
  VALUES (from_user, to_user, amount);
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Call stored procedure
const { error } = await supabase.rpc('transfer_credits', {
  from_user: fromUserId,
  to_user: toUserId,
  amount: 100,
});
```

**Best Practices:**
- Use parameterized queries to prevent SQL injection
- Create database functions for complex logic
- Use transactions for multi-step operations
- Keep business logic in database for consistency

**Gotchas:**
- RPC functions need `SECURITY DEFINER` to bypass RLS
- Use `STABLE` or `IMMUTABLE` for cacheable functions
- Postgres uses 1-based array indexing
- `RETURNING *` is needed to get inserted/updated rows


### 3. Migration Management

Manage database schema changes with Supabase migrations.

**Supabase CLI Setup:**
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize in project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Pull existing schema
supabase db pull
```

**Creating Migrations:**
```bash
# Create new migration
supabase migration new create_users_table
```

```sql
-- supabase/migrations/20241206000000_create_users_table.sql

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Migration Workflow:**
```bash
# Run migrations locally
supabase db reset

# Check migration status
supabase migration list

# Apply to remote
supabase db push

# Diff local vs remote
supabase db diff

# Generate migration from diff
supabase db diff -f add_posts_table
```

**Seed Data:**
```sql
-- supabase/seed.sql
INSERT INTO public.users (id, email, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin'),
  ('00000000-0000-0000-0000-000000000002', 'test@example.com', 'Test User');

INSERT INTO public.posts (title, author_id, status) VALUES
  ('Welcome Post', '00000000-0000-0000-0000-000000000001', 'published'),
  ('Draft Post', '00000000-0000-0000-0000-000000000002', 'draft');
```

```bash
# Reset and seed
supabase db reset
```

**Row Level Security (RLS):**
```sql
-- Enable RLS on table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Public posts are viewable"
  ON posts FOR SELECT
  USING (status = 'published');

-- Policy: Users can CRUD their own posts
CREATE POLICY "Users can manage own posts"
  ON posts FOR ALL
  USING (auth.uid() = author_id);

-- Policy: Admins can manage all posts
CREATE POLICY "Admins can manage all posts"
  ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

**Best Practices:**
- One migration per logical change
- Use descriptive migration names with timestamps
- Always add down migration for rollback
- Test migrations locally before pushing

**Gotchas:**
- Migrations are immutable once pushed
- `db reset` deletes all data locally
- RLS policies are additive (OR logic)
- Use `WITH CHECK` for insert/update validation


### 4. Type Generation

Generate TypeScript types from your Supabase schema.

**Generate Types:**
```bash
# Generate types from remote database
supabase gen types typescript --project-id your-project-ref > lib/database.types.ts

# Generate from local database
supabase gen types typescript --local > lib/database.types.ts
```

**Generated Types Structure:**
```typescript
// lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          author_id: string;
          status: 'draft' | 'published';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          author_id: string;
          status?: 'draft' | 'published';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string | null;
          author_id?: string;
          status?: 'draft' | 'published';
          created_at?: string;
        };
      };
    };
    Functions: {
      get_user_stats: {
        Args: { user_id: string };
        Returns: Json;
      };
    };
    Enums: {
      post_status: 'draft' | 'published';
    };
  };
}
```

**Type-Safe Client:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Usage with full type safety
const supabase = createClient();

// Types are inferred!
const { data: users } = await supabase
  .from('users')
  .select('id, email, name');
// users: { id: string; email: string; name: string | null }[] | null

// Insert with type checking
const { data: newPost } = await supabase
  .from('posts')
  .insert({
    title: 'My Post',
    author_id: userId,
    // status: 'invalid' // TypeScript error!
  })
  .select()
  .single();
```

**Helper Types:**
```typescript
// lib/supabase/helpers.ts
import { Database } from './database.types';

// Table row types
export type User = Database['public']['Tables']['users']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

// Enum types
export type PostStatus = Database['public']['Enums']['post_status'];

// Join types
export type PostWithAuthor = Post & {
  author: User;
};

// Usage
function createUser(data: UserInsert): Promise<User> {
  // ...
}
```

**Automated Type Generation:**
```json
// package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $PROJECT_REF > lib/database.types.ts",
    "db:types:local": "supabase gen types typescript --local > lib/database.types.ts"
  }
}
```

```yaml
# .github/workflows/types.yml
name: Generate Types

on:
  push:
    paths:
      - 'supabase/migrations/**'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase gen types typescript --project-id ${{ secrets.PROJECT_REF }} > lib/database.types.ts
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: regenerate database types'
```

**Best Practices:**
- Regenerate types after every migration
- Create helper types for common patterns
- Use strict TypeScript for full benefit
- Commit generated types to version control

**Gotchas:**
- Types don't include RLS logic
- Nullable columns become `T | null`
- JSON columns are typed as `Json`
- Foreign key relationships need explicit select


## 💡 Real-World Examples

### Example 1: Full CRUD with Type Safety
```typescript
// lib/posts.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Post, PostInsert, PostUpdate } from '@/lib/supabase/helpers';

export async function getPosts(userId: string): Promise<Post[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPost(post: PostInsert): Promise<Post> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, updates: PostUpdate): Promise<Post> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

### Example 2: Real-time Dashboard
```typescript
// components/LiveDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Post } from '@/lib/supabase/helpers';

export function LiveDashboard({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .then(({ data }) => setPosts(data || []));

    // Subscribe to changes
    const channel = supabase
      .channel('user-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `author_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new as Post : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### Example 3: Complex Migration
```sql
-- supabase/migrations/20241206000000_add_comments_system.sql

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get comment tree
CREATE OR REPLACE FUNCTION get_comment_tree(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id UUID,
  user_name TEXT,
  parent_id UUID,
  depth INTEGER,
  created_at TIMESTAMPTZ
) AS $$
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level comments
  SELECT
    c.id,
    c.content,
    c.user_id,
    u.name as user_name,
    c.parent_id,
    0 as depth,
    c.created_at
  FROM comments c
  JOIN users u ON u.id = c.user_id
  WHERE c.post_id = p_post_id AND c.parent_id IS NULL

  UNION ALL

  -- Recursive case: replies
  SELECT
    c.id,
    c.content,
    c.user_id,
    u.name as user_name,
    c.parent_id,
    ct.depth + 1,
    c.created_at
  FROM comments c
  JOIN users u ON u.id = c.user_id
  JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT * FROM comment_tree
ORDER BY created_at;
$$ LANGUAGE SQL STABLE;

-- Trigger for updated_at
CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## 🔗 Related Skills

- `prisma-drizzle-orm` - ORM alternatives for Supabase
- `supabase-developer` - Full Supabase platform features
- `auth-clerk-nextauth` - Authentication integrations
- `realtime-multiplayer` - Real-time features

## 📖 Further Reading

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
