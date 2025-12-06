# TanStack Query Expert

> **ID:** `tanstack-query-expert` | **Tier:** 2 | **Token Cost:** 5500

## What This Skill Does

Provides expert-level guidance for building production-ready data synchronization layers with TanStack Query (formerly React Query) v5. Covers the complete lifecycle of server state management: queries, mutations, infinite pagination, prefetching, cache invalidation, optimistic updates, and SSR hydration.

This skill teaches you to build high-performance, offline-capable applications with intelligent caching, automatic background refetching, and sophisticated cache management strategies.

## When to Use

Use this skill when you need to:

- Build data-heavy applications (dashboards, feeds, admin panels)
- Implement real-time data synchronization with stale-while-revalidate patterns
- Handle complex mutation flows with optimistic updates and rollback
- Implement infinite scroll or cursor-based pagination
- Optimize performance with prefetching and SSR hydration
- Debug cache invalidation issues or stale data problems
- Migrate from Redux/MobX to server state management
- Build offline-first applications with cache persistence
- Implement multi-step forms with draft state management
- Handle complex dependency chains between queries

**Do NOT use this skill for:**
- Client-only state (use Zustand, Jotai, or React Context)
- Simple fetch wrappers (vanilla fetch is fine)
- GraphQL (use Apollo Client or urql instead)
- Real-time subscriptions (combine with WebSocket libraries)

## Core Capabilities

### 1. Queries - The Foundation

#### Query Keys: The Identity System

Query keys are the most critical concept in TanStack Query. They serve as the unique identifier, dependency tracker, and cache key for your data.

```typescript
// ❌ BAD: Fragile string keys
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
});

// ✅ GOOD: Structured hierarchical keys
const { data } = useQuery({
  queryKey: ['users', userId, { includeProfile: true }] as const,
  queryFn: () => fetchUser(userId, { includeProfile: true }),
});

// ✅ BEST: Key factory pattern
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: (id: string) => [...userKeys.detail(id), 'profile'] as const,
};

// Usage with type safety
const { data } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
});
```

#### Query Options: Fine-Tuned Control

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

function ProductList({ category, page }: { category: string; page: number }) {
  const { data, isLoading, isPlaceholderData, error } = useQuery({
    // Structured query key with all dependencies
    queryKey: ['products', category, page] as const,

    // Query function with AbortSignal support
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `/api/products?category=${category}&page=${page}`,
        { signal }
      );
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<{ products: Product[]; total: number }>;
    },

    // Stale time: How long data is considered fresh (no refetch)
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Cache time: How long inactive data stays in cache
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)

    // Keep previous data while fetching new page (smooth UX)
    placeholderData: keepPreviousData,

    // Retry failed queries with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry 4xx errors
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch behavior
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when internet reconnects
    refetchOnMount: true, // Refetch on component mount if stale
    refetchInterval: false, // Polling interval (use for real-time data)

    // Only enable query when we have required data
    enabled: !!category,

    // Select and transform data
    select: (data) => ({
      products: data.products,
      total: data.total,
      hasMore: (page + 1) * 20 < data.total,
    }),
  });

  if (isLoading) return <ProductSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return (
    <div>
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {isPlaceholderData && <LoadingOverlay />}
      <Pagination page={page} hasMore={data.hasMore} />
    </div>
  );
}
```

#### Dependent Queries: Waterfall Pattern

```typescript
function UserProfile({ userId }: { userId: string }) {
  // First query: Fetch user
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  });

  // Second query: Depends on first query's data
  const { data: posts } = useQuery({
    queryKey: ['posts', 'user', user?.id],
    queryFn: () => fetchUserPosts(user!.id),
    enabled: !!user?.id, // Only run when user is loaded
  });

  // Third query: Depends on second query's data
  const { data: comments } = useQuery({
    queryKey: ['comments', 'posts', posts?.map(p => p.id)],
    queryFn: () => fetchPostComments(posts!.map(p => p.id)),
    enabled: !!posts && posts.length > 0,
  });

  return (
    <div>
      {user && <UserHeader user={user} />}
      {posts && <PostsList posts={posts} comments={comments} />}
    </div>
  );
}
```

#### Parallel Queries: Maximum Performance

```typescript
function Dashboard() {
  // Option 1: Multiple useQuery hooks (simple)
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  });
  const { data: activity } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: fetchRecentActivity,
  });
  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: fetchUnreadNotifications,
  });

  // Option 2: useQueries for dynamic list
  const userIds = ['user-1', 'user-2', 'user-3'];
  const userQueries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ['users', id],
      queryFn: () => fetchUser(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const allUsersLoaded = userQueries.every((q) => q.isSuccess);
  const anyUserLoading = userQueries.some((q) => q.isLoading);

  return (
    <div>
      <StatsPanel stats={stats} />
      <ActivityFeed activity={activity} />
      <NotificationBell count={notifications?.length} />
      {allUsersLoaded && (
        <UserList users={userQueries.map((q) => q.data!)} />
      )}
    </div>
  );
}
```

### 2. Mutations & Optimistic Updates

#### Basic Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json() as Promise<Post>;
    },

    // Called before mutation function
    onMutate: async (variables) => {
      console.log('Starting mutation with:', variables);
      // Return context for onError rollback
      return { startTime: Date.now() };
    },

    // Called on success
    onSuccess: (data, variables, context) => {
      console.log('Mutation took:', Date.now() - context.startTime, 'ms');

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Or update cache directly
      queryClient.setQueryData<Post[]>(['posts', 'list'], (old) => {
        return old ? [data, ...old] : [data];
      });
    },

    // Called on error
    onError: (error, variables, context) => {
      console.error('Mutation failed:', error);
      toast.error('Failed to create post');
    },

    // Called after either success or error
    onSettled: (data, error, variables, context) => {
      console.log('Mutation settled');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      authorId: 'current-user-id',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
      {mutation.isError && (
        <div className="error">{mutation.error.message}</div>
      )}
    </form>
  );
}
```

#### Optimistic Updates: Instant UI

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function TodoList() {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (todo: Todo) => {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error('Failed to toggle todo');
      return res.json() as Promise<Todo>;
    },

    // Optimistic update
    onMutate: async (updatedTodo) => {
      // Cancel outgoing refetches (don't overwrite optimistic update)
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot previous value for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // Optimistically update cache
      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.id === updatedTodo.id
            ? { ...todo, completed: !todo.completed }
            : todo
        );
      });

      // Return context with snapshot
      return { previousTodos };
    },

    // Rollback on error
    onError: (err, updatedTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to update todo');
    },

    // Refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (todoId: string) => {
      await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });
    },

    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old) => {
        return old?.filter((todo) => todo.id !== todoId) ?? [];
      });

      return { previousTodos };
    },

    onError: (err, todoId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleMutation.mutate(todo)}
            disabled={toggleMutation.isPending}
          />
          <span>{todo.text}</span>
          <button onClick={() => deleteMutation.mutate(todo.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

#### Sequential Mutations: Multi-Step Flows

```typescript
function CheckoutFlow({ cartId }: { cartId: string }) {
  const queryClient = useQueryClient();

  // Step 1: Create order
  const createOrderMutation = useMutation({
    mutationFn: async (cartId: string) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ cartId }),
      });
      return res.json() as Promise<{ orderId: string }>;
    },
  });

  // Step 2: Process payment
  const processPaymentMutation = useMutation({
    mutationFn: async ({
      orderId,
      paymentMethod,
    }: {
      orderId: string;
      paymentMethod: string;
    }) => {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod }),
      });
      return res.json() as Promise<{ paymentId: string }>;
    },
  });

  // Step 3: Confirm order
  const confirmOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate cart and orders
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleCheckout = async (paymentMethod: string) => {
    try {
      // Step 1: Create order
      const { orderId } = await createOrderMutation.mutateAsync(cartId);

      // Step 2: Process payment
      await processPaymentMutation.mutateAsync({ orderId, paymentMethod });

      // Step 3: Confirm order
      await confirmOrderMutation.mutateAsync(orderId);

      toast.success('Order placed successfully!');
      navigate(`/orders/${orderId}`);
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
    }
  };

  const isProcessing =
    createOrderMutation.isPending ||
    processPaymentMutation.isPending ||
    confirmOrderMutation.isPending;

  return (
    <div>
      <button onClick={() => handleCheckout('stripe')} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Complete Purchase'}
      </button>
      {createOrderMutation.isError && <div>Failed to create order</div>}
      {processPaymentMutation.isError && <div>Payment failed</div>}
      {confirmOrderMutation.isError && <div>Failed to confirm order</div>}
    </div>
  );
}
```

### 3. Infinite Queries & Pagination

#### Infinite Scroll with Cursor Pagination

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

function InfiniteFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],

    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const url = `/api/posts?limit=20${pageParam ? `&cursor=${pageParam}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json() as Promise<PostsResponse>;
    },

    // Initial page param
    initialPageParam: null as string | null,

    // Extract next page param from response
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },

    // Extract previous page param (for bidirectional scroll)
    getPreviousPageParam: (firstPage) => undefined,

    // Max pages to keep in memory
    maxPages: 3,

    // Stale time for infinite queries
    staleTime: 5 * 60 * 1000,
  });

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView();

  // Auto-fetch when scrolling into view
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <div>Loading initial posts...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  // Flatten all pages into single array
  const posts = data.pages.flatMap((page) => page.posts);

  return (
    <div>
      <div className="posts">
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <small>By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</small>
          </article>
        ))}
      </div>

      {/* Intersection observer trigger */}
      {hasNextPage && (
        <div ref={ref} className="load-more-trigger">
          {isFetchingNextPage ? 'Loading more...' : 'Scroll to load more'}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="end-message">You've reached the end!</div>
      )}
    </div>
  );
}
```

#### Offset Pagination with Page Numbers

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function ProductGrid() {
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['products', 'paginated', page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}&limit=${limit}`);
      return res.json() as Promise<PaginatedResponse<Product>>;
    },
    placeholderData: keepPreviousData, // Keep old data while fetching
    staleTime: 5 * 60 * 1000,
  });

  // Prefetch next page
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (data?.pagination.page < data?.pagination.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['products', 'paginated', page + 1, limit],
        queryFn: async () => {
          const res = await fetch(`/api/products?page=${page + 1}&limit=${limit}`);
          return res.json();
        },
      });
    }
  }, [data, page, limit, queryClient]);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <div className={`grid ${isPlaceholderData ? 'opacity-50' : ''}`}>
        {data.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {data.pagination.page} of {data.pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((old) => old + 1)}
          disabled={page >= data.pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

#### Bidirectional Infinite Scroll (Chat UI)

```typescript
interface Message {
  id: string;
  content: string;
  authorId: string;
  timestamp: string;
}

interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  prevCursor: string | null;
}

function ChatMessages({ channelId }: { channelId: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = React.useState<number | null>(null);

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['messages', channelId],

    queryFn: async ({ pageParam }) => {
      const url = `/api/channels/${channelId}/messages?${
        pageParam ? `cursor=${pageParam}` : 'initial=true'
      }`;
      const res = await fetch(url);
      return res.json() as Promise<MessagesResponse>;
    },

    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor ?? undefined,
  });

  // Detect scroll position for loading older messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasPreviousPage && !isFetchingPreviousPage) {
      setScrollPos(e.currentTarget.scrollHeight);
      fetchPreviousPage();
    }
  };

  // Restore scroll position after loading older messages
  React.useEffect(() => {
    if (scrollPos && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight - scrollPos;
      setScrollPos(null);
    }
  }, [scrollPos, data]);

  const messages = React.useMemo(
    () => data?.pages.flatMap((page) => page.messages) ?? [],
    [data]
  );

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="messages">
      {isFetchingPreviousPage && <div>Loading older messages...</div>}

      {messages.map((message) => (
        <div key={message.id} className="message">
          <strong>{message.authorId}</strong>
          <p>{message.content}</p>
          <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
        </div>
      ))}

      {isFetchingNextPage && <div>Loading newer messages...</div>}
    </div>
  );
}
```

### 4. Prefetching & SSR

#### Prefetching for Route Transitions

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'next/link';

function PostLink({ postId }: { postId: string }) {
  const queryClient = useQueryClient();

  // Prefetch on hover
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['posts', postId],
      queryFn: () => fetchPost(postId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <Link
      href={`/posts/${postId}`}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter} // Mobile support
    >
      View Post
    </Link>
  );
}

// Or prefetch programmatically
function SearchResults({ query }: { query: string }) {
  const queryClient = useQueryClient();
  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPosts(query),
  });

  // Prefetch all results
  React.useEffect(() => {
    results?.forEach((post) => {
      queryClient.prefetchQuery({
        queryKey: ['posts', post.id],
        queryFn: () => fetchPost(post.id),
      });
    });
  }, [results, queryClient]);

  return (
    <ul>
      {results?.map((post) => (
        <li key={post.id}>
          <PostLink postId={post.id} />
        </li>
      ))}
    </ul>
  );
}
```

#### Next.js App Router SSR with Hydration

```typescript
// app/posts/[id]/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { PostDetail } from './PostDetail';

// Server component - runs on server
export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = new QueryClient();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ['posts', params.id],
    queryFn: () => fetchPost(params.id),
  });

  // Also prefetch related data
  await queryClient.prefetchQuery({
    queryKey: ['posts', params.id, 'comments'],
    queryFn: () => fetchPostComments(params.id),
  });

  return (
    // Hydrate cache on client
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostDetail postId={params.id} />
    </HydrationBoundary>
  );
}

// Client component - uses hydrated data
'use client';

export function PostDetail({ postId }: { postId: string }) {
  // This will use SSR data on initial render
  const { data: post } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: comments } = useQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchPostComments(postId),
  });

  return (
    <article>
      <h1>{post?.title}</h1>
      <div>{post?.content}</div>
      <CommentList comments={comments} />
    </article>
  );
}
```

#### Next.js Pages Router SSR (Legacy)

```typescript
// pages/posts/[id].tsx
import { GetServerSideProps } from 'next';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const postId = context.params?.id as string;

  try {
    await queryClient.prefetchQuery({
      queryKey: ['posts', postId],
      queryFn: () => fetchPost(postId),
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        postId,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default function PostPage({ postId }: { postId: string }) {
  const { data: post } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
  });

  return (
    <div>
      <h1>{post?.title}</h1>
      <p>{post?.content}</p>
    </div>
  );
}

// pages/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### Static Generation with Revalidation

```typescript
// app/products/page.tsx - Static with revalidation
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProductsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
}

'use client';

function ProductList() {
  const { data } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
    staleTime: 60 * 1000, // Match revalidation time
  });

  return (
    <div>
      {data?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 5. Cache Management

#### Cache Invalidation Strategies

```typescript
import { useQueryClient } from '@tanstack/react-query';

function CacheManagement() {
  const queryClient = useQueryClient();

  // 1. Invalidate exact query
  const invalidateExact = () => {
    queryClient.invalidateQueries({
      queryKey: ['posts', '123'],
      exact: true, // Only this exact key
    });
  };

  // 2. Invalidate all queries with prefix
  const invalidatePrefix = () => {
    queryClient.invalidateQueries({
      queryKey: ['posts'], // Matches ['posts'], ['posts', '123'], ['posts', 'list'], etc.
    });
  };

  // 3. Invalidate with predicate
  const invalidateConditional = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Invalidate all posts queries older than 5 minutes
        return (
          query.queryKey[0] === 'posts' &&
          Date.now() - query.state.dataUpdatedAt > 5 * 60 * 1000
        );
      },
    });
  };

  // 4. Invalidate and refetch immediately
  const invalidateAndRefetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['posts'],
      refetchType: 'active', // Only refetch active queries
    });
  };

  // 5. Remove from cache entirely
  const removeFromCache = () => {
    queryClient.removeQueries({
      queryKey: ['posts', '123'],
    });
  };

  // 6. Reset all queries to initial state
  const resetAll = () => {
    queryClient.resetQueries({
      queryKey: ['posts'],
    });
  };

  return <div>Cache controls...</div>;
}
```

#### Manual Cache Updates

```typescript
function ManualCacheUpdates() {
  const queryClient = useQueryClient();

  // 1. Get cached data
  const getCachedPost = (postId: string) => {
    const post = queryClient.getQueryData<Post>(['posts', postId]);
    return post;
  };

  // 2. Set cached data
  const updateCachedPost = (postId: string, newData: Post) => {
    queryClient.setQueryData(['posts', postId], newData);
  };

  // 3. Update with updater function
  const incrementLikes = (postId: string) => {
    queryClient.setQueryData<Post>(['posts', postId], (old) => {
      if (!old) return old;
      return { ...old, likes: old.likes + 1 };
    });
  };

  // 4. Set multiple cache entries
  const setMultiplePosts = (posts: Post[]) => {
    posts.forEach((post) => {
      queryClient.setQueryData(['posts', post.id], post);
    });

    // Also update list cache
    queryClient.setQueryData(['posts', 'list'], posts);
  };

  // 5. Ensure query is loaded
  const ensurePost = async (postId: string) => {
    await queryClient.ensureQueryData({
      queryKey: ['posts', postId],
      queryFn: () => fetchPost(postId),
      staleTime: 5 * 60 * 1000,
    });
  };

  // 6. Fetch query programmatically
  const fetchAndCache = async (postId: string) => {
    const post = await queryClient.fetchQuery({
      queryKey: ['posts', postId],
      queryFn: () => fetchPost(postId),
    });
    return post;
  };

  return <div>Manual cache controls...</div>;
}
```

#### Cache Persistence (Offline Support)

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'REACT_QUERY_CACHE',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Usage in app
export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          // Don't persist errors
          shouldDehydrateQuery: (query) => {
            return query.state.status !== 'error';
          },
        },
      }}
    >
      <AppContent />
    </PersistQueryClientProvider>
  );
}
```

#### Selective Cache Updates (Denormalization)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  likes: number;
}

// When updating a user, also update all posts by that user
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(user),
      });
      return res.json() as Promise<User>;
    },

    onSuccess: (updatedUser) => {
      // Update user cache
      queryClient.setQueryData(['users', updatedUser.id], updatedUser);

      // Update all posts by this user
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          return old.map((post) =>
            post.author.id === updatedUser.id
              ? { ...post, author: updatedUser }
              : post
          );
        }
      );

      // Also update infinite query pages
      queryClient.setQueriesData<InfiniteData<PostsResponse>>(
        { queryKey: ['posts', 'infinite'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.author.id === updatedUser.id
                  ? { ...post, author: updatedUser }
                  : post
              ),
            })),
          };
        }
      );
    },
  });
}
```

### 6. DevTools & Debugging

#### React Query DevTools Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              // Custom retry logic
              if (error instanceof Error && error.message.includes('404')) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools - only shows in development */}
      <ReactQueryDevtools
        initialIsOpen={false}
        position="bottom-right"
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  );
}
```

#### Custom Logger for Debugging

```typescript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
  queryCache: {
    onSuccess: (data, query) => {
      console.log('[Query Success]', query.queryKey, data);
    },
    onError: (error, query) => {
      console.error('[Query Error]', query.queryKey, error);
    },
  },
  mutationCache: {
    onSuccess: (data, variables, context, mutation) => {
      console.log('[Mutation Success]', mutation.options.mutationKey, data);
    },
    onError: (error, variables, context, mutation) => {
      console.error('[Mutation Error]', mutation.options.mutationKey, error);
    },
  },
});
```

#### Query Inspector Hook

```typescript
function useQueryInspector(queryKey: unknown[]) {
  const queryClient = useQueryClient();
  const query = queryClient.getQueryState(queryKey);

  React.useEffect(() => {
    console.log('[Query Inspector]', {
      queryKey,
      status: query?.status,
      dataUpdatedAt: query?.dataUpdatedAt
        ? new Date(query.dataUpdatedAt).toISOString()
        : 'never',
      errorUpdatedAt: query?.errorUpdatedAt
        ? new Date(query.errorUpdatedAt).toISOString()
        : 'never',
      fetchStatus: query?.fetchStatus,
      error: query?.error,
    });
  }, [query]);

  return query;
}

// Usage
function MyComponent() {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  useQueryInspector(['posts']);

  return <div>{data?.length} posts</div>;
}
```

#### Performance Monitoring

```typescript
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

function useQueryPerformance(queryKey: unknown[]) {
  const startTimeRef = useRef<number>(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.query.queryHash === JSON.stringify(queryKey) &&
        event.type === 'updated'
      ) {
        const duration = Date.now() - startTimeRef.current;

        if (duration > 1000) {
          console.warn(
            `[Slow Query] ${JSON.stringify(queryKey)} took ${duration}ms`
          );
        }

        // Send to analytics
        analytics.track('query_performance', {
          queryKey: JSON.stringify(queryKey),
          duration,
          fromCache: event.query.state.fetchStatus === 'idle',
        });
      }
    });

    return unsubscribe;
  }, [queryKey, queryClient]);
}

// Usage
function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  });

  useQueryPerformance(['dashboard', 'stats']);

  return <div>Stats: {data?.total}</div>;
}
```

#### Error Boundary Integration

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
            <AppContent />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  );
}
```

## Real-World Examples

### Example 1: Social Feed with Infinite Scroll

Complete implementation of a Twitter-like feed with infinite scroll, optimistic likes, and real-time updates.

```typescript
// types/feed.ts
export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  isLiked: boolean;
  comments: number;
  createdAt: string;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

// hooks/useFeed.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (filters: { following?: boolean }) =>
    [...feedKeys.lists(), filters] as const,
};

export function useFeed({ following = false }: { following?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: feedKeys.list({ following }),

    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: '20',
        following: String(following),
        ...(pageParam && { cursor: pageParam }),
      });

      const res = await fetch(`/api/feed?${params}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch feed');
      }

      return res.json() as Promise<FeedResponse>;
    },

    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
}

// hooks/useLikePost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedKeys } from './useFeed';

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      isLiked,
    }: {
      postId: string;
      isLiked: boolean;
    }) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to like post');
      return res.json();
    },

    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      // Snapshot previous value
      const previousFeeds = queryClient.getQueriesData({
        queryKey: feedKeys.all,
      });

      // Optimistically update all feed queries
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: feedKeys.all },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !isLiked,
                      likes: isLiked ? post.likes - 1 : post.likes + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { previousFeeds };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFeeds) {
        context.previousFeeds.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to like post');
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

// hooks/useCreatePost.ts
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json() as Promise<Post>;
    },

    onSuccess: (newPost) => {
      // Add new post to all feed queries
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: feedKeys.all },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? { ...page, posts: [newPost, ...page.posts] }
                : page
            ),
          };
        }
      );

      toast.success('Post created!');
    },

    onError: () => {
      toast.error('Failed to create post');
    },
  });
}

// components/Feed.tsx
import { useFeed } from '@/hooks/useFeed';
import { useLikePost } from '@/hooks/useLikePost';
import { useInView } from 'react-intersection-observer';

export function Feed({ following = false }: { following?: boolean }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useFeed({ following });

  const { ref, inView } = useInView();
  const likeMutation = useLikePost();

  // Auto-fetch on scroll
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return <ErrorMessage error={error} />;
  }

  const posts = data.pages.flatMap((page) => page.posts);

  return (
    <div className="feed">
      {posts.map((post) => (
        <article key={post.id} className="post">
          <div className="post-header">
            <img src={post.authorAvatar} alt={post.authorName} />
            <div>
              <strong>{post.authorName}</strong>
              <time>{formatRelativeTime(post.createdAt)}</time>
            </div>
          </div>

          <p className="post-content">{post.content}</p>

          <div className="post-actions">
            <button
              onClick={() =>
                likeMutation.mutate({
                  postId: post.id,
                  isLiked: post.isLiked,
                })
              }
              disabled={likeMutation.isPending}
              className={post.isLiked ? 'liked' : ''}
            >
              <HeartIcon filled={post.isLiked} />
              <span>{post.likes}</span>
            </button>

            <button>
              <CommentIcon />
              <span>{post.comments}</span>
            </button>

            <button>
              <ShareIcon />
            </button>
          </div>
        </article>
      ))}

      {hasNextPage && (
        <div ref={ref} className="load-more">
          {isFetchingNextPage ? <Spinner /> : 'Load more'}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="end-message">You're all caught up!</div>
      )}
    </div>
  );
}

// components/CreatePostForm.tsx
import { useCreatePost } from '@/hooks/useCreatePost';

export function CreatePostForm() {
  const [content, setContent] = React.useState('');
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost.mutate(content, {
      onSuccess: () => {
        setContent('');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="create-post">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={280}
        rows={3}
      />
      <div className="actions">
        <span className="char-count">{content.length}/280</span>
        <button
          type="submit"
          disabled={!content.trim() || createPost.isPending}
        >
          {createPost.isPending ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
```

### Example 2: Admin Dashboard with Optimistic Updates

Complete admin dashboard with bulk operations, real-time stats, and optimistic updates.

```typescript
// types/admin.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  lastLogin: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  revenue: number;
}

// hooks/useDashboardStats.ts
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      });
      return res.json() as Promise<DashboardStats>;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

// hooks/useUsers.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

interface UserFilters {
  page: number;
  limit: number;
  role?: string;
  status?: string;
  search?: string;
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
      });

      return res.json() as Promise<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
      }>;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

// hooks/useBulkUpdateUsers.ts
export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      updates,
    }: {
      userIds: string[];
      updates: Partial<User>;
    }) => {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, updates }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Bulk update failed');
      return res.json();
    },

    onMutate: async ({ userIds, updates }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot
      const previousQueries = queryClient.getQueriesData({
        queryKey: userKeys.lists(),
      });

      // Optimistic update
      queryClient.setQueriesData<{ users: User[]; total: number }>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.map((user) =>
              userIds.includes(user.id) ? { ...user, ...updates } : user
            ),
          };
        }
      );

      return { previousQueries };
    },

    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update users');
    },

    onSuccess: (data, { userIds }) => {
      toast.success(`Updated ${userIds.length} users`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

// components/UserTable.tsx
export function UserTable() {
  const [filters, setFilters] = React.useState<UserFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(
    new Set()
  );

  const { data, isLoading, isPlaceholderData } = useUsers(filters);
  const bulkUpdate = useBulkUpdateUsers();

  const handleBulkAction = (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const updates: Partial<User> = {
      status: action === 'suspend' ? 'suspended' : 'active',
    };

    bulkUpdate.mutate({
      userIds: Array.from(selectedUsers),
      updates,
    });

    setSelectedUsers(new Set());
  };

  if (isLoading) return <TableSkeleton />;
  if (!data) return null;

  return (
    <div>
      <div className="table-controls">
        <input
          type="search"
          placeholder="Search users..."
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
          }
        />

        {selectedUsers.size > 0 && (
          <div className="bulk-actions">
            <span>{selectedUsers.size} selected</span>
            <button onClick={() => handleBulkAction('suspend')}>
              Suspend
            </button>
            <button onClick={() => handleBulkAction('activate')}>
              Activate
            </button>
            <button onClick={() => handleBulkAction('delete')}>Delete</button>
          </div>
        )}
      </div>

      <table className={isPlaceholderData ? 'opacity-50' : ''}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedUsers.size === data.users.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(new Set(data.users.map((u) => u.id)));
                  } else {
                    setSelectedUsers(new Set());
                  }
                }}
              />
            </th>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={(e) => {
                    const next = new Set(selectedUsers);
                    if (e.target.checked) {
                      next.add(user.id);
                    } else {
                      next.delete(user.id);
                    }
                    setSelectedUsers(next);
                  }}
                />
              </td>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>
                <Badge variant={user.role}>{user.role}</Badge>
              </td>
              <td>
                <Badge variant={user.status}>{user.status}</Badge>
              </td>
              <td>{formatRelativeTime(user.lastLogin)}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}

// components/Dashboard.tsx
export function AdminDashboard() {
  const { data: stats } = useDashboardStats();

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={<UsersIcon />}
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          icon={<ActivityIcon />}
        />
        <StatCard
          title="New Today"
          value={stats?.newUsersToday}
          icon={<TrendingUpIcon />}
        />
        <StatCard
          title="Revenue"
          value={`$${stats?.revenue?.toLocaleString()}`}
          icon={<DollarIcon />}
        />
      </div>

      <UserTable />
    </div>
  );
}
```

## Related Skills

- **nextjs-app-router** - Next.js App Router patterns with RSC and Server Actions
- **nextjs-pages-router** - Next.js Pages Router with getServerSideProps/getStaticProps
- **typescript-advanced-types** - Advanced TypeScript patterns for type-safe queries
- **react-performance** - React optimization techniques (memoization, virtualization)
- **api-design-rest** - REST API design patterns that work well with TanStack Query
- **zod-validation** - Runtime validation for query responses
- **react-suspense** - React Suspense integration with TanStack Query
- **offline-first** - Offline-first patterns with cache persistence

## Further Reading

### Official Documentation
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview) - Official documentation
- [Quick Start Guide](https://tanstack.com/query/latest/docs/react/quick-start) - Getting started
- [DevTools Guide](https://tanstack.com/query/latest/docs/react/devtools) - Debugging with DevTools
- [TypeScript Guide](https://tanstack.com/query/latest/docs/react/typescript) - TypeScript integration

### Advanced Topics
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates) - Deep dive into optimistic updates
- [Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries) - Infinite scrolling patterns
- [Prefetching](https://tanstack.com/query/latest/docs/react/guides/prefetching) - Performance optimization
- [SSR/SSG](https://tanstack.com/query/latest/docs/react/guides/ssr) - Server-side rendering guide
- [Cache Management](https://tanstack.com/query/latest/docs/react/guides/caching) - Understanding the cache

### Community Resources
- [TanStack Query Examples](https://tanstack.com/query/latest/docs/react/examples/react/basic) - Official examples
- [Awesome TanStack Query](https://github.com/tanstack/query/discussions/1731) - Community resources
- [Migration Guide v4 to v5](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5) - Upgrading from v4

### Performance
- [React Query and React 18](https://tanstack.com/query/latest/docs/react/guides/react-18) - React 18 features
- [Render Optimization](https://tanstack.com/query/latest/docs/react/guides/render-optimizations) - Minimize re-renders
- [Request Deduplication](https://tanstack.com/query/latest/docs/react/guides/request-deduplication) - Automatic request batching

### Integration Guides
- [Next.js 13+ App Router](https://tanstack.com/query/latest/docs/react/guides/ssr#nextjs-app-directory) - App Router integration
- [GraphQL](https://tanstack.com/query/latest/docs/react/graphql) - Using with GraphQL
- [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations) - Advanced mutation patterns

---

**Version:** 1.0.0
**Last Updated:** 2025-01-05
**Minimum TanStack Query Version:** v5.0.0
**Minimum React Version:** 18.0.0
