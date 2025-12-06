# Zustand & Jotai State Management

> **ID:** `zustand-jotai-state`
> **Tier:** 2
> **Token Cost:** 5000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Master modern, lightweight state management with Zustand and Jotai:

- **Zustand Stores:** Create simple, scalable stores with actions and selectors
- **Zustand Middleware:** Persist, immer, devtools, and custom middleware
- **Jotai Atoms:** Atomic state with primitive, derived, and async atoms
- **Jotai Utilities:** atomWithStorage, atomFamily, splitAtom, and more
- **Selection Guide:** When to use Zustand vs Jotai for different use cases
- **DevTools Integration:** Debug state changes with browser extensions
- **TypeScript Support:** Full type safety with inference and generics
- **Performance Optimization:** Prevent unnecessary re-renders

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** zustand, jotai, state, store, atom, global state, persist, middleware
- **Use Zustand when:** You need centralized stores, actions, and middleware
- **Use Jotai when:** You want atomic, bottom-up state composition
- **Use Both when:** Complex apps benefit from Zustand (global) + Jotai (local/form)

**Decision Matrix:**

| Feature | Zustand | Jotai | Winner |
|---------|---------|-------|--------|
| Bundle Size | 1.2kb | 3.4kb | Zustand |
| API Surface | Small | Medium | Zustand |
| Learning Curve | Gentle | Moderate | Zustand |
| Atomic Updates | No | Yes | Jotai |
| Bottom-Up Composition | Hard | Easy | Jotai |
| Server State | Manual | Built-in | Jotai |
| Suspense Support | Manual | Native | Jotai |
| DevTools | Redux DT | Jotai DT | Tie |

## 🚀 Core Capabilities

### 1. Zustand Stores

**Basic Store Creation:**

```typescript
import { create } from 'zustand';

// Basic store with TypeScript
interface BearState {
  bears: number;
  increase: (by: number) => void;
  decrease: (by: number) => void;
  reset: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  decrease: (by) => set((state) => ({ bears: state.bears - by })),
  reset: () => set({ bears: 0 }),
}));

// Usage in components
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <h1>{bears} around here...</h1>;
}

function Controls() {
  const increase = useBearStore((state) => state.increase);
  const decrease = useBearStore((state) => state.decrease);

  return (
    <>
      <button onClick={() => increase(1)}>Add Bear</button>
      <button onClick={() => decrease(1)}>Remove Bear</button>
    </>
  );
}
```

**Advanced Store with Slices:**

```typescript
import { create } from 'zustand';

// Split store into slices for better organization
interface UserSlice {
  user: { id: string; name: string } | null;
  setUser: (user: UserSlice['user']) => void;
  clearUser: () => void;
}

interface CartSlice {
  items: Array<{ id: string; quantity: number }>;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

interface UISlice {
  theme: 'light' | 'dark';
  sidebar: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

// Create slices
const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

const createCartSlice = (set: any): CartSlice => ({
  items: [],
  addItem: (id) =>
    set((state: CartSlice) => {
      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { items: [...state.items, { id, quantity: 1 }] };
    }),
  removeItem: (id) =>
    set((state: CartSlice) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ items: [] }),
});

const createUISlice = (set: any): UISlice => ({
  theme: 'light',
  sidebar: false,
  toggleTheme: () =>
    set((state: UISlice) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  toggleSidebar: () =>
    set((state: UISlice) => ({ sidebar: !state.sidebar })),
});

// Combine slices
type StoreState = UserSlice & CartSlice & UISlice;

const useStore = create<StoreState>((set) => ({
  ...createUserSlice(set),
  ...createCartSlice(set),
  ...createUISlice(set),
}));
```

**Selector Optimization:**

```typescript
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface TodoState {
  todos: Array<{ id: string; text: string; done: boolean }>;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: crypto.randomUUID(), text, done: false }],
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      ),
    })),
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}));

// Bad: Component re-renders on ANY state change
function TodoListBad() {
  const { todos, toggleTodo } = useTodoStore();
  // This extracts the whole state object
}

// Good: Only re-renders when todos change
function TodoListGood() {
  const todos = useTodoStore((state) => state.todos);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
}

// Better: Use shallow for multiple values
function TodoListBetter() {
  const { todos, toggleTodo } = useTodoStore(
    (state) => ({ todos: state.todos, toggleTodo: state.toggleTodo }),
    shallow
  );
}

// Best: Derived selectors
const selectActiveTodos = (state: TodoState) =>
  state.todos.filter((todo) => !todo.done);

const selectCompletedCount = (state: TodoState) =>
  state.todos.filter((todo) => todo.done).length;

function ActiveTodos() {
  const activeTodos = useTodoStore(selectActiveTodos);
  const completedCount = useTodoStore(selectCompletedCount);

  return (
    <div>
      <h2>Active: {activeTodos.length}</h2>
      <h2>Completed: {completedCount}</h2>
      {activeTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
```

**Best Practices:**
- Use selectors to prevent unnecessary re-renders
- Split large stores into slices for better organization
- Keep actions inside the store, not in components
- Use shallow comparison for multiple selector values
- Create derived selectors outside components for reusability

**Gotchas:**
- Don't destructure the entire state: `const { a, b, c } = useStore()` causes re-renders
- Selectors with inline objects/arrays create new references: use `shallow`
- State updates are synchronous, but React batches them
- `set` can take a function or an object, prefer functions for updates based on current state

### 2. Zustand Persistence & Middleware

**Persist Middleware:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; email: string } | null;
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
}

// localStorage persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // Key in storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// sessionStorage persistence
const useSessionStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Custom storage (IndexedDB, AsyncStorage, etc.)
const customStorage = {
  getItem: async (name: string) => {
    const value = await myDB.get(name);
    return value || null;
  },
  setItem: async (name: string, value: string) => {
    await myDB.set(name, value);
  },
  removeItem: async (name: string) => {
    await myDB.delete(name);
  },
};

const useDBStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'db-storage',
      storage: customStorage,
    }
  )
);

// Partial persistence (only persist specific fields)
interface PreferencesState {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  tempData: string; // Don't persist this
  setTheme: (theme: PreferencesState['theme']) => void;
  setLanguage: (lang: string) => void;
}

const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      notifications: true,
      tempData: '',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'preferences-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        // tempData is excluded
      }),
    }
  )
);

// Version migration
interface SettingsV1 {
  theme: string;
}

interface SettingsV2 {
  theme: 'light' | 'dark';
  fontSize: number;
}

const useSettingsStore = create<SettingsV2>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      setTheme: (theme: SettingsV2['theme']) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // Migrate from v1 to v2
          return {
            ...persistedState,
            fontSize: 16, // Add new field
          };
        }
        return persistedState;
      },
    }
  )
);
```

**Immer Middleware:**

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface NestedState {
  user: {
    profile: {
      name: string;
      settings: {
        notifications: boolean;
        privacy: string;
      };
    };
    friends: Array<{ id: string; name: string }>;
  };
  updateName: (name: string) => void;
  toggleNotifications: () => void;
  addFriend: (friend: { id: string; name: string }) => void;
}

// Without immer - verbose and error-prone
const useStoreNoImmer = create<NestedState>((set) => ({
  user: {
    profile: {
      name: '',
      settings: { notifications: true, privacy: 'public' },
    },
    friends: [],
  },
  updateName: (name) =>
    set((state) => ({
      user: {
        ...state.user,
        profile: {
          ...state.user.profile,
          name,
        },
      },
    })),
  toggleNotifications: () =>
    set((state) => ({
      user: {
        ...state.user,
        profile: {
          ...state.user.profile,
          settings: {
            ...state.user.profile.settings,
            notifications: !state.user.profile.settings.notifications,
          },
        },
      },
    })),
  addFriend: (friend) =>
    set((state) => ({
      user: {
        ...state.user,
        friends: [...state.user.friends, friend],
      },
    })),
}));

// With immer - clean and simple
const useStoreWithImmer = create<NestedState>()(
  immer((set) => ({
    user: {
      profile: {
        name: '',
        settings: { notifications: true, privacy: 'public' },
      },
      friends: [],
    },
    updateName: (name) =>
      set((state) => {
        state.user.profile.name = name;
      }),
    toggleNotifications: () =>
      set((state) => {
        state.user.profile.settings.notifications =
          !state.user.profile.settings.notifications;
      }),
    addFriend: (friend) =>
      set((state) => {
        state.user.friends.push(friend);
      }),
  }))
);
```

**DevTools Middleware:**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementBy: (amount: number) => void;
}

// Basic devtools
const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      incrementBy: (amount) =>
        set((state) => ({ count: state.count + amount })),
    }),
    { name: 'CounterStore' }
  )
);

// DevTools with custom action names
const useCounterStoreWithNames = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () =>
        set((state) => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () =>
        set((state) => ({ count: state.count - 1 }), false, 'decrement'),
      incrementBy: (amount) =>
        set(
          (state) => ({ count: state.count + amount }),
          false,
          `incrementBy(${amount})`
        ),
    }),
    { name: 'CounterStore' }
  )
);

// Combine middleware: persist + immer + devtools
interface ComplexState {
  data: {
    items: Array<{ id: string; value: number }>;
  };
  addItem: (value: number) => void;
  updateItem: (id: string, value: number) => void;
}

const useComplexStore = create<ComplexState>()(
  devtools(
    persist(
      immer((set) => ({
        data: { items: [] },
        addItem: (value) =>
          set((state) => {
            state.data.items.push({ id: crypto.randomUUID(), value });
          }),
        updateItem: (id, value) =>
          set((state) => {
            const item = state.data.items.find((i) => i.id === id);
            if (item) item.value = value;
          }),
      })),
      { name: 'complex-storage' }
    ),
    { name: 'ComplexStore' }
  )
);
```

**Custom Middleware:**

```typescript
import { create, StateCreator } from 'zustand';

// Logger middleware
const logger = <T>(config: StateCreator<T>): StateCreator<T> => {
  return (set, get, api) =>
    config(
      (args) => {
        console.log('  applying', args);
        set(args);
        console.log('  new state', get());
      },
      get,
      api
    );
};

// Performance monitor middleware
const perfMonitor = <T>(config: StateCreator<T>): StateCreator<T> => {
  return (set, get, api) =>
    config(
      (args) => {
        const start = performance.now();
        set(args);
        const end = performance.now();
        console.log(`State update took ${end - start}ms`);
      },
      get,
      api
    );
};

// Validation middleware
const validate = <T>(
  config: StateCreator<T>,
  validator: (state: T) => boolean
): StateCreator<T> => {
  return (set, get, api) =>
    config(
      (args) => {
        const nextState = typeof args === 'function' ? args(get()) : args;
        if (validator(nextState as T)) {
          set(args);
        } else {
          console.error('Validation failed:', nextState);
        }
      },
      get,
      api
    );
};

// Usage
interface ValidatedState {
  age: number;
  setAge: (age: number) => void;
}

const useValidatedStore = create<ValidatedState>()(
  logger(
    perfMonitor(
      validate(
        (set) => ({
          age: 0,
          setAge: (age) => set({ age }),
        }),
        (state) => state.age >= 0 && state.age <= 150
      )
    )
  )
);
```

**Best Practices:**
- Use persist for auth tokens, user preferences, and settings
- Combine immer with complex nested state updates
- Use devtools in development, strip in production
- Layer middleware correctly: devtools → persist → immer → store
- Use partialize to exclude sensitive or transient data from persistence

**Gotchas:**
- Middleware order matters: `devtools(persist(immer(...)))`
- Persist middleware is async, check `hasHydrated()` before critical operations
- Immer adds ~3kb to bundle, only use for complex state
- DevTools middleware should wrap other middleware to track all changes

### 3. Jotai Atoms

**Primitive Atoms:**

```typescript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// Basic primitive atoms
const countAtom = atom(0);
const nameAtom = atom('John');
const enabledAtom = atom(true);

// Complex object atom
const userAtom = atom<{ id: string; email: string } | null>(null);

// Array atom
const todosAtom = atom<Array<{ id: string; text: string; done: boolean }>>([]);

// Usage in components
function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Read-only usage (no setter)
function Display() {
  const count = useAtomValue(countAtom);
  return <p>Count: {count}</p>;
}

// Write-only usage (no value)
function Controls() {
  const setCount = useSetAtom(countAtom);
  return <button onClick={() => setCount((c) => c + 1)}>+</button>;
}
```

**Derived Atoms:**

```typescript
import { atom, useAtomValue } from 'jotai';

// Read-only derived atoms
const firstNameAtom = atom('John');
const lastNameAtom = atom('Doe');
const fullNameAtom = atom((get) => {
  const first = get(firstNameAtom);
  const last = get(lastNameAtom);
  return `${first} ${last}`;
});

// Derived with multiple dependencies
const priceAtom = atom(100);
const quantityAtom = atom(2);
const taxRateAtom = atom(0.1);

const subtotalAtom = atom((get) => {
  return get(priceAtom) * get(quantityAtom);
});

const taxAtom = atom((get) => {
  return get(subtotalAtom) * get(taxRateAtom);
});

const totalAtom = atom((get) => {
  return get(subtotalAtom) + get(taxAtom);
});

function Checkout() {
  const subtotal = useAtomValue(subtotalAtom);
  const tax = useAtomValue(taxAtom);
  const total = useAtomValue(totalAtom);

  return (
    <div>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
      <p>Tax: ${tax.toFixed(2)}</p>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}

// Writable derived atoms
const celsiusAtom = atom(0);
const fahrenheitAtom = atom(
  (get) => (get(celsiusAtom) * 9) / 5 + 32,
  (get, set, newFahrenheit: number) => {
    set(celsiusAtom, ((newFahrenheit - 32) * 5) / 9);
  }
);

function TemperatureConverter() {
  const [celsius, setCelsius] = useAtom(celsiusAtom);
  const [fahrenheit, setFahrenheit] = useAtom(fahrenheitAtom);

  return (
    <div>
      <input
        type="number"
        value={celsius}
        onChange={(e) => setCelsius(Number(e.target.value))}
      />
      <span>°C = </span>
      <input
        type="number"
        value={fahrenheit}
        onChange={(e) => setFahrenheit(Number(e.target.value))}
      />
      <span>°F</span>
    </div>
  );
}
```

**Async Atoms:**

```typescript
import { atom, useAtom, useAtomValue } from 'jotai';
import { Suspense } from 'react';

// Basic async atom
const userIdAtom = atom(1);
const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

// Usage with Suspense
function UserProfile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserDetails />
    </Suspense>
  );
}

function UserDetails() {
  const user = useAtomValue(userAtom);
  return <div>{user.name}</div>;
}

// Async atom with write
const searchQueryAtom = atom('');
const searchResultsAtom = atom(
  async (get) => {
    const query = get(searchQueryAtom);
    if (!query) return [];
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  (get, set, newQuery: string) => {
    set(searchQueryAtom, newQuery);
  }
);

function Search() {
  const [query, setQuery] = useAtom(searchQueryAtom);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <Suspense fallback={<div>Searching...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}

function SearchResults() {
  const results = useAtomValue(searchResultsAtom);
  return (
    <ul>
      {results.map((result: any) => (
        <li key={result.id}>{result.title}</li>
      ))}
    </ul>
  );
}

// Async atom with error handling
const dataAtom = atom(async (get) => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
});

// Usage with ErrorBoundary
import { ErrorBoundary } from 'react-error-boundary';

function DataDisplay() {
  return (
    <ErrorBoundary fallback={<div>Error loading data</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Data />
      </Suspense>
    </ErrorBoundary>
  );
}

function Data() {
  const data = useAtomValue(dataAtom);
  return <div>{JSON.stringify(data)}</div>;
}

// Atom with loadable (no Suspense needed)
import { loadable } from 'jotai/utils';

const loadableUserAtom = loadable(userAtom);

function UserWithLoadable() {
  const loadableUser = useAtomValue(loadableUserAtom);

  if (loadableUser.state === 'loading') {
    return <div>Loading...</div>;
  }

  if (loadableUser.state === 'hasError') {
    return <div>Error: {loadableUser.error.message}</div>;
  }

  return <div>{loadableUser.data.name}</div>;
}
```

**Best Practices:**
- Use primitive atoms for simple values
- Use derived atoms for computed values instead of useState
- Use async atoms with Suspense for data fetching
- Keep atoms small and focused (single responsibility)
- Derive atoms from other atoms instead of duplicating state

**Gotchas:**
- Async atoms require Suspense or loadable
- Atom updates trigger only subscribed components
- Don't create atoms inside components (create at module level)
- Atoms are not stored in React tree (they're in Provider)
- Read functions in atoms are pure (no side effects)

### 4. Jotai Utilities

**atomWithStorage:**

```typescript
import { atomWithStorage } from 'jotai/utils';

// localStorage persistence
const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');
const tokenAtom = atomWithStorage<string | null>('auth-token', null);

// sessionStorage persistence
const sessionAtom = atomWithStorage('session-id', '', sessionStorage);

// Custom storage
const asyncStorage = {
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

const userPrefsAtom = atomWithStorage('user-prefs', {}, asyncStorage);

// Custom serialization
const customSerializationAtom = atomWithStorage(
  'custom-data',
  { date: new Date() },
  undefined,
  {
    getOnInit: true,
    serialize: (value) => JSON.stringify({
      ...value,
      date: value.date.toISOString(),
    }),
    deserialize: (str) => {
      const parsed = JSON.parse(str);
      return { ...parsed, date: new Date(parsed.date) };
    },
  }
);
```

**atomFamily:**

```typescript
import { atomFamily } from 'jotai/utils';

// Create atoms dynamically based on parameters
const userAtomFamily = atomFamily((userId: string) =>
  atom(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  })
);

function UserProfile({ userId }: { userId: string }) {
  const user = useAtomValue(userAtomFamily(userId));
  return <div>{user.name}</div>;
}

// With remove functionality
const todoAtomFamily = atomFamily(
  (id: string) => atom({ id, text: '', done: false }),
  (a, b) => a === b // Equality function
);

// Clear all atoms in family
todoAtomFamily.remove('todo-1');

// Form field atoms
interface FieldValue {
  value: string;
  error: string | null;
}

const fieldAtomFamily = atomFamily((fieldName: string) =>
  atom<FieldValue>({ value: '', error: null })
);

function FormField({ name }: { name: string }) {
  const [field, setField] = useAtom(fieldAtomFamily(name));

  return (
    <div>
      <input
        value={field.value}
        onChange={(e) =>
          setField({ value: e.target.value, error: null })
        }
      />
      {field.error && <span>{field.error}</span>}
    </div>
  );
}
```

**splitAtom:**

```typescript
import { atom, useAtom } from 'jotai';
import { splitAtom } from 'jotai/utils';

// Split array atom into individual item atoms
const todosAtom = atom([
  { id: '1', text: 'Learn Jotai', done: false },
  { id: '2', text: 'Build app', done: false },
]);

const todoAtomsAtom = splitAtom(todosAtom);

function TodoList() {
  const [todoAtoms, dispatch] = useAtom(todoAtomsAtom);

  const handleAdd = () => {
    dispatch({
      type: 'insert',
      value: { id: crypto.randomUUID(), text: 'New todo', done: false },
    });
  };

  return (
    <div>
      {todoAtoms.map((todoAtom) => (
        <TodoItem key={`${todoAtom}`} todoAtom={todoAtom} />
      ))}
      <button onClick={handleAdd}>Add Todo</button>
    </div>
  );
}

function TodoItem({ todoAtom }: { todoAtom: any }) {
  const [todo, setTodo] = useAtom(todoAtom);

  return (
    <div>
      <input
        checked={todo.done}
        type="checkbox"
        onChange={(e) => setTodo({ ...todo, done: e.target.checked })}
      />
      <span>{todo.text}</span>
    </div>
  );
}
```

**atomWithReducer:**

```typescript
import { atomWithReducer } from 'jotai/utils';

// Redux-style reducer pattern
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'incrementBy'; payload: number }
  | { type: 'reset' };

const counterAtom = atomWithReducer(0, (state: number, action: Action) => {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    case 'incrementBy':
      return state + action.payload;
    case 'reset':
      return 0;
    default:
      return state;
  }
});

function Counter() {
  const [count, dispatch] = useAtom(counterAtom);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'incrementBy', payload: 10 })}>
        +10
      </button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

**atomWithDefault and atomWithReset:**

```typescript
import { atomWithDefault, atomWithReset, useResetAtom } from 'jotai/utils';

// Lazy initialization
const expensiveAtom = atomWithDefault(() => {
  // This only runs once when first accessed
  return computeExpensiveValue();
});

// Resettable atom
const userInputAtom = atomWithReset('');
const counterAtom = atomWithReset(0);

function Form() {
  const [input, setInput] = useAtom(userInputAtom);
  const resetInput = useResetAtom(userInputAtom);

  const [count, setCount] = useAtom(counterAtom);
  const resetCount = useResetAtom(counterAtom);

  const resetAll = () => {
    resetInput();
    resetCount();
  };

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={resetInput}>Reset Input</button>

      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={resetCount}>Reset Count</button>

      <button onClick={resetAll}>Reset All</button>
    </div>
  );
}
```

**focusAtom and selectAtom:**

```typescript
import { atom, useAtom } from 'jotai';
import { focusAtom, selectAtom } from 'jotai/utils';

// Focus on nested properties
const personAtom = atom({
  name: 'John',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'New York',
  },
});

const nameAtom = focusAtom(personAtom, (optic) => optic.prop('name'));
const cityAtom = focusAtom(personAtom, (optic) =>
  optic.prop('address').prop('city')
);

function PersonForm() {
  const [name, setName] = useAtom(nameAtom);
  const [city, setCity] = useAtom(cityAtom);

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={city} onChange={(e) => setCity(e.target.value)} />
    </div>
  );
}

// Select with equality check
const userAtom = atom({ id: 1, name: 'John', email: 'john@example.com' });
const userIdAtom = selectAtom(userAtom, (user) => user.id);
const userNameAtom = selectAtom(userAtom, (user) => user.name);

// Custom equality
const userDataAtom = selectAtom(
  userAtom,
  (user) => ({ name: user.name, email: user.email }),
  (a, b) => a.name === b.name && a.email === b.email
);
```

**Best Practices:**
- Use atomWithStorage for persisting simple state
- Use atomFamily for dynamic collections (users, posts, etc.)
- Use splitAtom for lists where items update independently
- Use atomWithReducer for complex state logic
- Use focusAtom/selectAtom to avoid creating derived atoms manually

**Gotchas:**
- atomFamily creates new atoms on each call, use remove() to clean up
- splitAtom dispatch has different API than setState
- atomWithStorage is async, may cause hydration mismatches in SSR
- focusAtom requires optics library, selectAtom is simpler for most cases

### 5. Comparison & Selection Guide

**Architecture Comparison:**

```typescript
// ZUSTAND: Top-down, centralized store
import { create } from 'zustand';

const useAppStore = create((set) => ({
  // All app state in one place
  user: null,
  cart: [],
  ui: { theme: 'light', sidebar: false },

  // Actions colocated with state
  setUser: (user) => set({ user }),
  addToCart: (item) =>
    set((state) => ({ cart: [...state.cart, item] })),
  toggleTheme: () =>
    set((state) => ({
      ui: { ...state.ui, theme: state.ui.theme === 'light' ? 'dark' : 'light' },
    })),
}));

// Use anywhere
function Component() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
}

// JOTAI: Bottom-up, atomic composition
import { atom, useAtom, useAtomValue } from 'jotai';

// State scattered as atoms
const userAtom = atom(null);
const cartAtom = atom([]);
const themeAtom = atom('light');
const sidebarAtom = atom(false);

// Derive complex state from atoms
const uiAtom = atom((get) => ({
  theme: get(themeAtom),
  sidebar: get(sidebarAtom),
}));

// Use specific atoms
function Component() {
  const [user, setUser] = useAtom(userAtom);
}
```

**When to Use Zustand:**

1. **Centralized Application State**
```typescript
// E-commerce app with global state
const useShopStore = create((set, get) => ({
  products: [],
  cart: [],
  user: null,

  fetchProducts: async () => {
    const products = await api.getProducts();
    set({ products });
  },

  addToCart: (productId) => {
    const product = get().products.find((p) => p.id === productId);
    if (product) {
      set((state) => ({ cart: [...state.cart, product] }));
    }
  },

  checkout: async () => {
    const { cart, user } = get();
    await api.checkout(user.id, cart);
    set({ cart: [] });
  },
}));
```

2. **Actions Need Access to Full State**
```typescript
// Complex business logic
const useGameStore = create((set, get) => ({
  player: { health: 100, mana: 50 },
  enemies: [],
  score: 0,

  castSpell: (spellId) => {
    const { player, enemies } = get();

    if (player.mana < 10) {
      console.log('Not enough mana');
      return;
    }

    // Complex logic accessing multiple state slices
    const damage = calculateDamage(spellId, player);
    const newEnemies = enemies.map((enemy) => ({
      ...enemy,
      health: enemy.health - damage,
    }));

    set({
      player: { ...player, mana: player.mana - 10 },
      enemies: newEnemies,
      score: get().score + damage,
    });
  },
}));
```

3. **Middleware Requirements**
```typescript
// Need persist, devtools, immer
const useAuthStore = create(
  devtools(
    persist(
      immer((set) => ({
        token: null,
        user: null,
        login: async (credentials) => {
          const { token, user } = await api.login(credentials);
          set((state) => {
            state.token = token;
            state.user = user;
          });
        },
      })),
      { name: 'auth' }
    ),
    { name: 'AuthStore' }
  )
);
```

**When to Use Jotai:**

1. **Form State**
```typescript
// Each field is independent atom
const emailAtom = atom('');
const passwordAtom = atom('');
const rememberMeAtom = atom(false);

// Derived validation
const emailValidAtom = atom((get) => {
  const email = get(emailAtom);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
});

const formValidAtom = atom((get) => {
  return get(emailValidAtom) && get(passwordAtom).length >= 8;
});

function LoginForm() {
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const formValid = useAtomValue(formValidAtom);

  return (
    <form>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={!formValid}>Login</button>
    </form>
  );
}
```

2. **Async Data Fetching with Suspense**
```typescript
// Clean async atoms
const userIdAtom = atom(1);
const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  return api.getUser(id);
});

const postsAtom = atom(async (get) => {
  const user = get(userAtom);
  return api.getPosts(user.id);
});

function Profile() {
  return (
    <Suspense fallback={<Loading />}>
      <UserDetails />
      <Suspense fallback={<div>Loading posts...</div>}>
        <UserPosts />
      </Suspense>
    </Suspense>
  );
}

function UserDetails() {
  const user = useAtomValue(userAtom);
  return <div>{user.name}</div>;
}

function UserPosts() {
  const posts = useAtomValue(postsAtom);
  return <div>{posts.map((p) => <Post key={p.id} post={p} />)}</div>;
}
```

3. **Local Component State That Might Go Global**
```typescript
// Start local
function Counter() {
  const countAtom = useMemo(() => atom(0), []);
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Promote to global by moving atom outside
const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Hybrid Approach:**

```typescript
// Use BOTH in same app
// Zustand for global app state
const useAppStore = create((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

// Jotai for form/local state
const searchQueryAtom = atom('');
const filtersAtom = atom({
  category: 'all',
  priceRange: [0, 1000],
});

const searchResultsAtom = atom(async (get) => {
  const query = get(searchQueryAtom);
  const filters = get(filtersAtom);
  return api.search(query, filters);
});

function SearchPage() {
  const theme = useAppStore((state) => state.theme);

  return (
    <div className={theme}>
      <SearchBar />
      <Filters />
      <Suspense fallback={<div>Searching...</div>}>
        <Results />
      </Suspense>
    </div>
  );
}

function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

function Results() {
  const results = useAtomValue(searchResultsAtom);
  return <div>{results.map((r) => <Result key={r.id} data={r} />)}</div>;
}
```

**Decision Flowchart:**

```
Need state management?
├─ Global app state (auth, theme, etc.)? → Zustand
├─ Complex actions accessing multiple slices? → Zustand
├─ Need middleware (persist, immer, devtools)? → Zustand
├─ Small bundle size critical? → Zustand (1.2kb vs 3.4kb)
│
├─ Form state with validation? → Jotai
├─ Async data fetching with Suspense? → Jotai
├─ Bottom-up composition preferred? → Jotai
├─ Need atomic updates? → Jotai
│
└─ Use both? → Zustand (global) + Jotai (local)
```

**Best Practices:**
- Use Zustand for "app state" (auth, theme, settings)
- Use Jotai for "feature state" (forms, filters, search)
- Don't overthink it: both are excellent, pick one and stick with it
- Migrate gradually if switching libraries
- Hybrid approach works well for large apps

**Gotchas:**
- Don't duplicate state between Zustand and Jotai
- Zustand stores are singletons, Jotai atoms need Provider
- Jotai async atoms require Suspense, Zustand doesn't
- Zustand middleware stacks, Jotai uses separate utilities

### 6. DevTools

**Zustand DevTools:**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Enable Redux DevTools
const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      name: 'CounterStore', // Store name in DevTools
      enabled: process.env.NODE_ENV === 'development', // Only in dev
    }
  )
);

// Custom action names for better debugging
const useStoreWithNames = create(
  devtools((set) => ({
    count: 0,
    increment: () =>
      set(
        (state) => ({ count: state.count + 1 }),
        false, // Don't replace state
        'increment' // Action name in DevTools
      ),
    incrementBy: (value: number) =>
      set(
        (state) => ({ count: state.count + value }),
        false,
        { type: 'incrementBy', value } // Structured action
      ),
  }))
);

// Multiple stores
const useUserStore = create(
  devtools((set) => ({ user: null }), { name: 'UserStore' })
);

const useCartStore = create(
  devtools((set) => ({ items: [] }), { name: 'CartStore' })
);

// Trace actions to component that triggered them
function Counter() {
  const increment = useStore((state) => state.increment);

  return (
    <button
      onClick={() => {
        increment();
        // DevTools will show which component triggered this
      }}
    >
      Increment
    </button>
  );
}

// Time travel debugging
// Install: Redux DevTools Extension
// Open: React App → DevTools → Redux tab
// Features:
// - See all state changes
// - Jump to any previous state
// - Replay actions
// - Export/import state
// - Diff between states
```

**Jotai DevTools:**

```typescript
import { useAtom, useAtomValue } from 'jotai';
import { useAtomsDebugValue, useAtomDevtools } from 'jotai/devtools';

// Method 1: Debug all atoms (hook in root component)
function App() {
  useAtomsDebugValue(); // Shows all atoms in React DevTools

  return <YourApp />;
}

// Method 2: Debug specific atom
const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  // Show this atom in React DevTools with label
  useAtomDevtools(countAtom, { name: 'count' });

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}

// Jotai DevTools Extension (Chrome/Firefox)
// Install from: https://github.com/jotaijs/jotai-devtools
import { DevTools } from 'jotai-devtools';

function App() {
  return (
    <>
      <DevTools />
      <YourApp />
    </>
  );
}

// Features:
// - See all atoms and their values
// - Track atom dependencies
// - View atom update history
// - Visualize atom graph
// - Time travel (with jotai-devtools)

// Custom atom names for debugging
const userAtom = atom({ id: 1, name: 'John' });
userAtom.debugLabel = 'user';

const todosAtom = atom([]);
todosAtom.debugLabel = 'todos';

// Now atoms show up with these names in DevTools
```

**Redux DevTools with Zustand:**

```typescript
// Advanced Redux DevTools features
const useStore = create(
  devtools(
    (set, get) => ({
      count: 0,
      history: [],

      increment: () =>
        set(
          (state) => ({
            count: state.count + 1,
            history: [...state.history, state.count + 1],
          }),
          false,
          'increment'
        ),

      // Action with payload visible in DevTools
      incrementBy: (amount: number) =>
        set(
          (state) => ({
            count: state.count + amount,
            history: [...state.history, state.count + amount],
          }),
          false,
          { type: 'incrementBy', payload: amount }
        ),

      // Async action tracking
      fetchData: async () => {
        set({}, false, 'fetchData/pending');

        try {
          const data = await api.getData();
          set({ data }, false, { type: 'fetchData/fulfilled', payload: data });
        } catch (error) {
          set({}, false, { type: 'fetchData/rejected', error });
        }
      },
    }),
    {
      name: 'AppStore',
      trace: true, // Show component that triggered action
      traceLimit: 25, // Number of stack frames
    }
  )
);

// Use Redux DevTools features:
// 1. State diffing
// 2. Action filtering
// 3. State export/import
// 4. Persist state between reloads
// 5. Lock/unlock state
// 6. Dispatch custom actions
```

**React DevTools with Jotai:**

```typescript
// See atoms in React DevTools Components tab
import { useDebugValue } from 'react';
import { useAtom } from 'jotai';

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  // Show custom label in React DevTools
  useDebugValue(count, (c) => `Count: ${c}`);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Debug atom dependencies
import { useAtomsSnapshot } from 'jotai/devtools';

function DebugPanel() {
  const snapshot = useAtomsSnapshot();

  return (
    <pre>
      {Array.from(snapshot.entries()).map(([atom, value]) => (
        <div key={`${atom}`}>
          {atom.debugLabel}: {JSON.stringify(value)}
        </div>
      ))}
    </pre>
  );
}
```

**Performance Monitoring:**

```typescript
// Zustand: Track render performance
const useStore = create(
  devtools((set) => ({
    count: 0,
    increment: () => {
      const start = performance.now();
      set((state) => ({ count: state.count + 1 }));
      const end = performance.now();
      console.log(`Update took ${end - start}ms`);
    },
  }))
);

// Jotai: Track atom updates
const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  useEffect(() => {
    console.log('Counter rendered with count:', count);
  });

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// React DevTools Profiler
// 1. Open React DevTools
// 2. Go to Profiler tab
// 3. Click record
// 4. Interact with app
// 5. Stop recording
// 6. See which components re-rendered and why
```

**Best Practices:**
- Enable DevTools only in development
- Use custom action names for clarity
- Add debug labels to atoms
- Use Redux DevTools for Zustand
- Use Jotai DevTools extension for Jotai
- Monitor performance with React Profiler
- Use trace option to see which component triggered actions

**Gotchas:**
- DevTools middleware must wrap other middleware
- DevTools add bundle size (~5kb), strip in production
- Too many state updates can slow down DevTools
- Atom debug labels must be set before first use
- React DevTools doesn't show Zustand state by default (use Redux DT)

## 💡 Real-World Examples

### Example 1: E-Commerce Shopping Cart (Zustand)

```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  total: number;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

// Store
export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],
        total: 0,

        addItem: (product) =>
          set((state) => {
            const existing = state.items.find((item) => item.id === product.id);

            if (existing) {
              existing.quantity += 1;
            } else {
              state.items.push({ ...product, quantity: 1 });
            }
          }),

        removeItem: (id) =>
          set((state) => {
            state.items = state.items.filter((item) => item.id !== id);
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            const item = state.items.find((item) => item.id === id);
            if (item) {
              if (quantity <= 0) {
                state.items = state.items.filter((item) => item.id !== id);
              } else {
                item.quantity = quantity;
              }
            }
          }),

        clearCart: () =>
          set((state) => {
            state.items = [];
          }),

        getItemCount: () => {
          return get().items.reduce((sum, item) => sum + item.quantity, 0);
        },

        getSubtotal: () => {
          return get().items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        },

        getTax: () => {
          return get().getSubtotal() * 0.1; // 10% tax
        },

        getTotal: () => {
          return get().getSubtotal() + get().getTax();
        },
      })),
      {
        name: 'cart-storage',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: 'CartStore' }
  )
);

// Components
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>
      <button onClick={() => addItem(product)}>Add to Cart</button>
    </div>
  );
}

function CartSummary() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  return (
    <div className="cart-summary">
      <span>{itemCount} items</span>
      <span>${total.toFixed(2)}</span>
    </div>
  );
}

function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = useCartStore((state) => state.getSubtotal());
  const tax = useCartStore((state) => state.getTax());
  const total = useCartStore((state) => state.getTotal());

  if (items.length === 0) {
    return <div>Your cart is empty</div>;
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.id, parseInt(e.target.value))
              }
            />
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="cart-totals">
        <div>
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div>
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div>
          <strong>Total:</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="cart-actions">
        <button onClick={clearCart}>Clear Cart</button>
        <button>Checkout</button>
      </div>
    </div>
  );
}
```

### Example 2: Advanced Filter System (Jotai)

```typescript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Suspense } from 'react';

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  inStock: boolean;
}

// Base atoms
const searchQueryAtom = atom('');
const selectedCategoryAtom = atomWithStorage<string | null>(
  'filter-category',
  null
);
const priceRangeAtom = atomWithStorage('filter-price', [0, 1000]);
const minRatingAtom = atomWithStorage('filter-rating', 0);
const inStockOnlyAtom = atomWithStorage('filter-stock', false);
const sortByAtom = atomWithStorage<'name' | 'price' | 'rating'>(
  'filter-sort',
  'name'
);

// Fetch products (async atom)
const productsAtom = atom(async () => {
  const response = await fetch('/api/products');
  return (await response.json()) as Product[];
});

// Filtered products (derived atom)
const filteredProductsAtom = atom(async (get) => {
  const products = await get(productsAtom);
  const query = get(searchQueryAtom).toLowerCase();
  const category = get(selectedCategoryAtom);
  const [minPrice, maxPrice] = get(priceRangeAtom);
  const minRating = get(minRatingAtom);
  const inStockOnly = get(inStockOnlyAtom);
  const sortBy = get(sortByAtom);

  let filtered = products.filter((product) => {
    // Search filter
    if (query && !product.name.toLowerCase().includes(query)) {
      return false;
    }

    // Category filter
    if (category && product.category !== category) {
      return false;
    }

    // Price filter
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }

    // Rating filter
    if (product.rating < minRating) {
      return false;
    }

    // Stock filter
    if (inStockOnly && !product.inStock) {
      return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return filtered;
});

// Categories (derived from products)
const categoriesAtom = atom(async (get) => {
  const products = await get(productsAtom);
  const categories = Array.from(new Set(products.map((p) => p.category)));
  return categories.sort();
});

// Stats
const statsAtom = atom(async (get) => {
  const filtered = await get(filteredProductsAtom);
  const all = await get(productsAtom);

  return {
    total: all.length,
    filtered: filtered.length,
    inStock: filtered.filter((p) => p.inStock).length,
    avgPrice:
      filtered.reduce((sum, p) => sum + p.price, 0) / filtered.length || 0,
  };
});

// Reset all filters
const resetFiltersAtom = atom(null, (get, set) => {
  set(searchQueryAtom, '');
  set(selectedCategoryAtom, null);
  set(priceRangeAtom, [0, 1000]);
  set(minRatingAtom, 0);
  set(inStockOnlyAtom, false);
  set(sortByAtom, 'name');
});

// Components
function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);

  return (
    <input
      type="search"
      placeholder="Search products..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function CategoryFilter() {
  const [selected, setSelected] = useAtom(selectedCategoryAtom);
  const categories = useAtomValue(categoriesAtom);

  return (
    <select
      value={selected || ''}
      onChange={(e) => setSelected(e.target.value || null)}
    >
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}

function PriceFilter() {
  const [range, setRange] = useAtom(priceRangeAtom);

  return (
    <div>
      <label>
        Min: ${range[0]}
        <input
          type="range"
          min="0"
          max="1000"
          value={range[0]}
          onChange={(e) => setRange([parseInt(e.target.value), range[1]])}
        />
      </label>
      <label>
        Max: ${range[1]}
        <input
          type="range"
          min="0"
          max="1000"
          value={range[1]}
          onChange={(e) => setRange([range[0], parseInt(e.target.value)])}
        />
      </label>
    </div>
  );
}

function RatingFilter() {
  const [minRating, setMinRating] = useAtom(minRatingAtom);

  return (
    <div>
      <label>Minimum Rating: {minRating}</label>
      <input
        type="range"
        min="0"
        max="5"
        step="0.5"
        value={minRating}
        onChange={(e) => setMinRating(parseFloat(e.target.value))}
      />
    </div>
  );
}

function StockFilter() {
  const [inStockOnly, setInStockOnly] = useAtom(inStockOnlyAtom);

  return (
    <label>
      <input
        type="checkbox"
        checked={inStockOnly}
        onChange={(e) => setInStockOnly(e.target.checked)}
      />
      In Stock Only
    </label>
  );
}

function SortControl() {
  const [sortBy, setSortBy] = useAtom(sortByAtom);

  return (
    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
      <option value="name">Name</option>
      <option value="price">Price</option>
      <option value="rating">Rating</option>
    </select>
  );
}

function FilterStats() {
  const stats = useAtomValue(statsAtom);

  return (
    <div className="stats">
      <span>
        Showing {stats.filtered} of {stats.total} products
      </span>
      <span>{stats.inStock} in stock</span>
      <span>Avg: ${stats.avgPrice.toFixed(2)}</span>
    </div>
  );
}

function ResetButton() {
  const reset = useSetAtom(resetFiltersAtom);

  return <button onClick={() => reset()}>Reset Filters</button>;
}

function ProductList() {
  const products = useAtomValue(filteredProductsAtom);

  if (products.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>{product.category}</p>
          <p>${product.price.toFixed(2)}</p>
          <p>Rating: {product.rating}/5</p>
          <p>{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
        </div>
      ))}
    </div>
  );
}

function FilterPage() {
  return (
    <div className="filter-page">
      <aside className="filters">
        <h2>Filters</h2>
        <SearchBar />

        <Suspense fallback={<div>Loading categories...</div>}>
          <CategoryFilter />
        </Suspense>

        <PriceFilter />
        <RatingFilter />
        <StockFilter />
        <SortControl />
        <ResetButton />
      </aside>

      <main className="products">
        <Suspense fallback={<div>Loading stats...</div>}>
          <FilterStats />
        </Suspense>

        <Suspense fallback={<div>Loading products...</div>}>
          <ProductList />
        </Suspense>
      </main>
    </div>
  );
}

export default FilterPage;
```

## 🔗 Related Skills

- `react-patterns` - Modern React patterns and hooks
- `react-performance` - Optimization techniques for React apps
- `typescript-advanced-types` - Advanced TypeScript for type-safe state
- `react-query-swr` - Server state management with React Query/SWR
- `redux-toolkit` - Alternative state management with Redux
- `form-validation` - Form handling with Jotai atoms or Zustand stores
- `ssr-nextjs` - SSR considerations for state hydration

## 📖 Further Reading

**Zustand:**
- [Official Docs](https://docs.pmnd.rs/zustand)
- [GitHub Repository](https://github.com/pmndrs/zustand)
- [Middleware Guide](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Recipes](https://docs.pmnd.rs/zustand/guides/recipes)

**Jotai:**
- [Official Docs](https://jotai.org)
- [GitHub Repository](https://github.com/pmndrs/jotai)
- [Core API](https://jotai.org/docs/core/atom)
- [Utilities](https://jotai.org/docs/utilities/storage)
- [DevTools](https://jotai.org/docs/tools/devtools)
- [Async Guide](https://jotai.org/docs/guides/async)

**Comparisons:**
- [Zustand vs Redux](https://docs.pmnd.rs/zustand/getting-started/comparison)
- [Jotai vs Recoil](https://jotai.org/docs/basics/comparison)
- [State Management Comparison 2024](https://blog.logrocket.com/state-management-react-2024/)

**Articles:**
- [Zustand: Simple State Management](https://ui.dev/zustand)
- [Jotai: Atomic State Management](https://blog.logrocket.com/jotai-primitive-flexible-state-management-react/)
- [When to use Zustand vs Jotai](https://dev.to/dastasoft/zustand-vs-jotai-lets-talk-about-react-state-management-libraries-1g3a)

**Video Tutorials:**
- [Zustand Crash Course](https://www.youtube.com/watch?v=KCr-UNsM3MI)
- [Jotai Tutorial](https://www.youtube.com/watch?v=eVfw4pRDUIY)
- [Modern State Management in React](https://www.youtube.com/watch?v=bGzanfKVFeU)

---

*This skill is part of OPUS 67 v5.1.0 - "The Precision Update"*
*Last Updated: 2025-12-05*
