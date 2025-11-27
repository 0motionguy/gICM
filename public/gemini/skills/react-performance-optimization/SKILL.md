# React Performance Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


**Skill ID:** `react-performance-optimization`
**Domain:** Frontend / React
**Complexity:** Advanced
**Prerequisites:** React fundamentals, JavaScript closures, rendering lifecycle

## Quick Reference

```tsx
// useMemo - Cache expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

// useCallback - Cache function references
const handleClick = useCallback(() => {
  doSomething(a, b)
}, [a, b])

// React.memo - Prevent re-renders
const MemoizedComponent = React.memo(MyComponent)

// Code splitting
const LazyComponent = lazy(() => import('./Component'))

// Virtualization
import { VirtualList } from 'react-virtual'

// Debouncing
const debouncedSearch = useDebouncedValue(searchTerm, 300)

// Web Workers
const worker = useMemo(() => new Worker('./worker.js'), [])
```

## Core Concepts

### 1. React Rendering

**When does a component re-render?**
- State changes (useState, useReducer)
- Props change
- Parent re-renders (unless optimized)
- Context value changes

**What happens during render?**
- Function component body executes
- Virtual DOM created
- Reconciliation (diffing)
- Commit to actual DOM (if changes)

### 2. Profiling

Use React DevTools Profiler to identify performance issues:

```tsx
import { Profiler } from 'react'

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`)
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

### 3. Performance Budget

**Metrics to track:**
- Time to Interactive (TTI): < 3.8s
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1

## Common Patterns

### Pattern 1: Memoization with useMemo & useCallback

```tsx
// Without optimization
function ProductList({ products, filter }) {
  // Re-filters on every render
  const filtered = products.filter(p => p.category === filter)

  // New function on every render
  const handleClick = (id) => {
    navigate(`/product/${id}`)
  }

  return (
    <>
      {filtered.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={handleClick}
        />
      ))}
    </>
  )
}

// With optimization
function ProductList({ products, filter }) {
  // Only re-filters when products or filter changes
  const filtered = useMemo(() => {
    return products.filter(p => p.category === filter)
  }, [products, filter])

  // Function reference stays the same
  const handleClick = useCallback((id) => {
    navigate(`/product/${id}`)
  }, [navigate])

  return (
    <>
      {filtered.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={handleClick}
        />
      ))}
    </>
  )
}
```

### Pattern 2: React.memo for Component Memoization

```tsx
// Expensive component that shouldn't re-render unnecessarily
interface ProductCardProps {
  product: Product
  onClick: (id: string) => void
}

// Without memo - re-renders when parent re-renders
function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div onClick={() => onClick(product.id)}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  )
}

// With memo - only re-renders when props change
const ProductCard = React.memo(({ product, onClick }: ProductCardProps) => {
  return (
    <div onClick={() => onClick(product.id)}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  )
})

// Custom comparison function
const ProductCard = React.memo(
  ({ product, onClick }: ProductCardProps) => {
    // Component
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.product.id === nextProps.product.id &&
           prevProps.product.price === nextProps.product.price
  }
)
```

### Pattern 3: Code Splitting & Lazy Loading

```tsx
import { lazy, Suspense } from 'react'

// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'))
const Analytics = lazy(() => import('./Analytics'))
const Settings = lazy(() => import('./Settings'))

export function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

// Preload on hover
function Navigation() {
  const preloadDashboard = () => {
    import('./Dashboard')
  }

  return (
    <nav>
      <Link
        to="/dashboard"
        onMouseEnter={preloadDashboard}
        onFocus={preloadDashboard}
      >
        Dashboard
      </Link>
    </nav>
  )
}

// Route-based code splitting with Next.js (automatic)
// app/dashboard/page.tsx - automatically code-split
export default function DashboardPage() {
  return <Dashboard />
}
```

### Pattern 4: Virtual Scrolling for Large Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

// Without virtualization - renders 10,000 items
function LargeList({ items }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}

// With virtualization - only renders visible items
function VirtualizedList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated item height
    overscan: 5, // Render 5 items outside viewport
  })

  return (
    <div
      ref={parentRef}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={items[virtualItem.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}

// With react-window (simpler API)
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

## Advanced Techniques

### 1. State Optimization

```tsx
// ❌ Don't: Single state object causes unnecessary re-renders
function UserProfile() {
  const [state, setState] = useState({
    name: '',
    email: '',
    preferences: {},
    notifications: []
  })

  // Changing name re-renders components that only use email
  const updateName = (name) => {
    setState({ ...state, name })
  }
}

// ✅ Do: Split state by usage pattern
function UserProfile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState({})
  const [notifications, setNotifications] = useState([])

  // Or use useReducer for complex state
  const [state, dispatch] = useReducer(userReducer, initialState)
}

// State colocation - move state closer to where it's used
// ❌ Don't: State at top level
function App() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

// ✅ Do: State where it's needed
function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
      <ModalContainer />  {/* State lives here */}
    </div>
  )
}
```

### 2. Context Optimization

```tsx
// ❌ Don't: Single context with all values
const AppContext = createContext({
  user: null,
  theme: 'light',
  notifications: [],
  settings: {}
})

// Changing theme re-renders all consumers
function App() {
  const [state, setState] = useState({
    user: null,
    theme: 'light',
    notifications: [],
    settings: {}
  })

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  )
}

// ✅ Do: Split contexts by usage pattern
const UserContext = createContext(null)
const ThemeContext = createContext('light')
const NotificationsContext = createContext([])

function App() {
  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <NotificationsContext.Provider value={notifications}>
          {children}
        </NotificationsContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  )
}

// Or use context selector pattern
function useContextSelector(selector) {
  const value = useContext(AppContext)
  return useMemo(() => selector(value), [value, selector])
}

// Only re-renders when selected value changes
function UserName() {
  const name = useContextSelector(state => state.user.name)
  return <div>{name}</div>
}
```

### 3. Debouncing & Throttling

```tsx
import { useDeferredValue, useTransition } from 'react'

// React 18: useDeferredValue
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query)

  // Uses deferred value for expensive operation
  const results = useMemo(() => {
    return searchDatabase(deferredQuery)
  }, [deferredQuery])

  return <ResultsList results={results} />
}

// React 18: useTransition for non-urgent updates
function SearchInput() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)  // Urgent - update input immediately

    startTransition(() => {
      // Non-urgent - can be interrupted
      updateSearchResults(value)
    })
  }

  return (
    <input
      value={query}
      onChange={handleChange}
      className={isPending ? 'opacity-50' : ''}
    />
  )
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### 4. Web Workers for Heavy Computation

```tsx
// worker.ts
self.addEventListener('message', (e) => {
  const { type, data } = e.data

  if (type === 'PROCESS_DATA') {
    const result = processLargeDataset(data)
    self.postMessage({ type: 'RESULT', result })
  }
})

// useWorker.ts
function useWorker(workerPath: string) {
  const [worker, setWorker] = useState<Worker | null>(null)

  useEffect(() => {
    const w = new Worker(new URL(workerPath, import.meta.url))
    setWorker(w)
    return () => w.terminate()
  }, [workerPath])

  const postMessage = useCallback((message: any) => {
    worker?.postMessage(message)
  }, [worker])

  return { worker, postMessage }
}

// Component
function DataProcessor({ data }) {
  const [result, setResult] = useState(null)
  const { worker, postMessage } = useWorker('./worker.ts')

  useEffect(() => {
    if (!worker) return

    worker.onmessage = (e) => {
      if (e.data.type === 'RESULT') {
        setResult(e.data.result)
      }
    }

    postMessage({ type: 'PROCESS_DATA', data })
  }, [worker, data, postMessage])

  return <div>{result && <ProcessedData data={result} />}</div>
}
```

## Production Examples

### Example 1: Optimized Data Table

```tsx
import { useMemo, useCallback, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface DataTableProps {
  data: any[]
  columns: Column[]
  onRowClick?: (row: any) => void
}

// Memoized row component
const TableRow = memo(({ row, columns, onClick }) => {
  return (
    <tr onClick={() => onClick?.(row)}>
      {columns.map(column => (
        <td key={column.id}>{row[column.id]}</td>
      ))}
    </tr>
  )
})

export function DataTable({ data, columns, onRowClick }: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtualize rows
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  })

  // Memoize sorted/filtered data
  const processedData = useMemo(() => {
    // Apply sorting, filtering, etc.
    return data.sort((a, b) => a.id - b.id)
  }, [data])

  // Stable callback reference
  const handleRowClick = useCallback((row: any) => {
    onRowClick?.(row)
  }, [onRowClick])

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.id}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const row = processedData[virtualRow.index]
            return (
              <TableRow
                key={row.id}
                row={row}
                columns={columns}
                onClick={handleRowClick}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

### Example 2: Infinite Scroll with Intersection Observer

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

export function InfiniteList() {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  // Fetch next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div>
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page.posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </Fragment>
      ))}

      {/* Sentinel element */}
      <div ref={ref}>
        {isFetchingNextPage ? 'Loading more...' : null}
      </div>
    </div>
  )
}

// Memoized post card
const PostCard = memo(({ post }) => {
  return (
    <article className="border rounded-lg p-4">
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  )
})
```

### Example 3: Optimized Form with Many Fields

```tsx
import { useForm, Controller } from 'react-hook-form'
import { memo } from 'react'

// Memoize individual field components
const FormField = memo(({ label, name, control, rules }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <div>
          <label>{label}</label>
          <input {...field} />
          {error && <span>{error.message}</span>}
        </div>
      )}
    />
  )
})

export function LargeForm() {
  const { control, handleSubmit } = useForm({
    mode: 'onChange',
    // Optimize: only validate on submit
    mode: 'onSubmit',
  })

  const onSubmit = useCallback((data) => {
    console.log(data)
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Each field is memoized - only re-renders on its own change */}
      <FormField
        name="firstName"
        label="First Name"
        control={control}
        rules={{ required: 'Required' }}
      />

      <FormField
        name="lastName"
        label="Last Name"
        control={control}
        rules={{ required: 'Required' }}
      />

      <FormField
        name="email"
        label="Email"
        control={control}
        rules={{
          required: 'Required',
          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
        }}
      />

      {/* ... many more fields ... */}

      <button type="submit">Submit</button>
    </form>
  )
}
```

## Best Practices

### 1. Measure Before Optimizing

```tsx
// Use React DevTools Profiler
// Identify slow components
// Focus on components that:
// - Re-render frequently
// - Have slow render times
// - Cause cascading re-renders

// Add performance marks
performance.mark('render-start')
// ... component render
performance.mark('render-end')
performance.measure('render', 'render-start', 'render-end')
```

### 2. Optimization Checklist

```tsx
// ✅ List virtualization for > 100 items
// ✅ Code splitting for routes
// ✅ Lazy load below-the-fold content
// ✅ Debounce search/autocomplete
// ✅ Memoize expensive calculations
// ✅ Use production builds
// ✅ Enable React strict mode
// ✅ Minimize bundle size
```

### 3. When to Use Each Hook

```tsx
// useMemo - expensive calculations
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.value - b.value)
}, [items])

// useCallback - passing callbacks to memoized children
const handleClick = useCallback(() => {
  doSomething()
}, [])

// React.memo - prevent unnecessary re-renders of expensive components
const ExpensiveChild = React.memo(({ data }) => {
  // Component
})
```

### 4. Bundle Size Optimization

```tsx
// Use dynamic imports
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <Skeleton />,
  ssr: false  // Don't render on server
})

// Import only what you need
import { debounce } from 'lodash-es'  // ✅ Tree-shakeable
import _ from 'lodash'  // ❌ Imports entire library

// Analyze bundle
// npm run build
// npx webpack-bundle-analyzer .next/stats.json
```

## Common Pitfalls

### 1. Premature Optimization

**❌ Don't:**
```tsx
// Wrapping everything in useMemo/useCallback without measuring
const MyComponent = () => {
  const a = useMemo(() => 1 + 1, [])  // Overkill
  const b = useCallback(() => 'hello', [])  // Unnecessary
}
```

**✅ Do:**
```tsx
// Optimize based on profiling data
const MyComponent = () => {
  const a = 2  // Simple value
  const b = 'hello'  // Constant
}
```

### 2. Missing Dependencies

**❌ Don't:**
```tsx
const handleClick = useCallback(() => {
  doSomething(count)
}, [])  // Missing count dependency!
```

**✅ Do:**
```tsx
const handleClick = useCallback(() => {
  doSomething(count)
}, [count])  // Correct dependencies
```

### 3. Incorrect Memoization

**❌ Don't:**
```tsx
// Object created on every render - memo doesn't help
<MemoizedComponent data={{ id: 1, name: 'John' }} />
```

**✅ Do:**
```tsx
// Memoize the object
const data = useMemo(() => ({ id: 1, name: 'John' }), [])
<MemoizedComponent data={data} />
```

### 4. Over-Using Context

**❌ Don't:**
```tsx
// Everything in one context
const AppContext = createContext({
  user, theme, settings, notifications, ...
})

// All consumers re-render on any change
```

**✅ Do:**
```tsx
// Split by update frequency
const UserContext = createContext(user)
const ThemeContext = createContext(theme)
```

## Resources

- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [Million.js](https://million.dev) - React optimization compiler
- [React-window](https://github.com/bvaughn/react-window)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
