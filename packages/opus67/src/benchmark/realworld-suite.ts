/**
 * OPUS 67 Real-World Task Suite
 * Practical coding scenarios for benchmarking
 */

import type { BenchmarkTask } from "./multi-model-benchmark.js";

export interface RealWorldTask {
  id: string;
  name: string;
  description: string;
  prompt: string;
  expectedBehaviors: string[];
  difficulty: "easy" | "medium" | "hard";
  category:
    | "component"
    | "api"
    | "database"
    | "bugfix"
    | "review"
    | "architecture"
    | "testing"
    | "documentation";
  skills: string[]; // OPUS 67 skills that help with this task
}

/**
 * Real-world coding tasks
 */
export const REALWORLD_TASKS: RealWorldTask[] = [
  // === REACT COMPONENT ===
  {
    id: "rw-001",
    name: "Data Table Component",
    description: "Build a sortable, filterable data table with pagination",
    prompt: `Create a React TypeScript component for a data table with the following features:
- Accept an array of data objects as props
- Sortable columns (click header to sort)
- Filterable rows (search input)
- Pagination (10, 25, 50 items per page)
- Loading and empty states
- Use TypeScript generics for type safety
- Use Tailwind CSS for styling`,
    expectedBehaviors: [
      "Component accepts generic data type",
      "Sorting works on all columns",
      "Filter searches across all fields",
      "Pagination is functional",
      "Loading state shows skeleton/spinner",
      "Empty state has helpful message",
      "Fully typed with no 'any'",
    ],
    difficulty: "medium",
    category: "component",
    skills: ["react-typescript-master", "tailwind-css-pro", "shadcn-ui-expert"],
  },
  {
    id: "rw-002",
    name: "Form with Validation",
    description: "Build a multi-step form with Zod validation",
    prompt: `Create a React TypeScript multi-step registration form:
- Step 1: Personal info (name, email, password)
- Step 2: Address (street, city, zip, country)
- Step 3: Preferences (newsletter, marketing emails)
- Step 4: Review and submit
- Use react-hook-form and Zod for validation
- Show validation errors inline
- Allow navigation between steps
- Show progress indicator`,
    expectedBehaviors: [
      "Three steps with proper routing",
      "Zod schemas for each step",
      "Inline error display",
      "Progress indicator works",
      "Can navigate back without losing data",
      "Submit shows all collected data",
    ],
    difficulty: "medium",
    category: "component",
    skills: ["react-typescript-master", "form-validation-pro"],
  },

  // === API ENDPOINT ===
  {
    id: "rw-003",
    name: "REST API with Auth",
    description: "Build a secure REST API endpoint with JWT authentication",
    prompt: `Create a Next.js API route for user management:
- POST /api/users - Create user (admin only)
- GET /api/users - List users (authenticated)
- GET /api/users/[id] - Get user (authenticated, own profile or admin)
- PUT /api/users/[id] - Update user (authenticated, own profile or admin)
- DELETE /api/users/[id] - Delete user (admin only)
- Validate all inputs with Zod
- Return proper HTTP status codes
- Include error handling middleware`,
    expectedBehaviors: [
      "JWT authentication works",
      "Role-based authorization (user/admin)",
      "All inputs are validated",
      "Proper HTTP status codes",
      "Error responses are structured",
      "Rate limiting on sensitive endpoints",
    ],
    difficulty: "hard",
    category: "api",
    skills: ["nodejs-api-architect", "nextjs-14-expert", "security-patterns"],
  },
  {
    id: "rw-004",
    name: "GraphQL Resolver",
    description: "Implement a GraphQL resolver with DataLoader",
    prompt: `Create a GraphQL resolver for a blog application:
- Query: posts, post(id), users, user(id)
- Mutation: createPost, updatePost, deletePost
- Use DataLoader to prevent N+1 queries
- Include proper error handling
- Add field-level authorization`,
    expectedBehaviors: [
      "All queries work correctly",
      "Mutations handle auth",
      "DataLoader prevents N+1",
      "Errors are properly formatted",
      "Field-level permissions work",
    ],
    difficulty: "hard",
    category: "api",
    skills: ["graphql-api-designer", "nodejs-api-architect"],
  },

  // === DATABASE SCHEMA ===
  {
    id: "rw-005",
    name: "E-Commerce Schema",
    description: "Design a database schema for an e-commerce platform",
    prompt: `Design a PostgreSQL schema for an e-commerce platform:
- Users with profiles and addresses
- Products with categories, variants, and pricing
- Orders with line items and status tracking
- Inventory management
- Reviews and ratings
- Include proper indexes
- Write Prisma schema or raw SQL DDL`,
    expectedBehaviors: [
      "All tables are normalized",
      "Foreign keys are correct",
      "Indexes on common queries",
      "Soft deletes where appropriate",
      "Audit columns (created_at, updated_at)",
      "Proper enum types",
    ],
    difficulty: "hard",
    category: "database",
    skills: ["database-schema-expert", "prisma-expert"],
  },
  {
    id: "rw-006",
    name: "Migration Script",
    description: "Write a database migration for a schema change",
    prompt: `Write a Prisma migration to:
1. Add a 'subscription' table with plans and billing
2. Add a 'subscription_id' to the users table
3. Migrate existing 'plan_type' column data to the new subscription system
4. Handle rollback safely
5. Ensure zero-downtime deployment compatibility`,
    expectedBehaviors: [
      "New tables are created correctly",
      "Data is migrated properly",
      "Foreign keys are added",
      "Rollback script works",
      "Can run without downtime",
    ],
    difficulty: "medium",
    category: "database",
    skills: ["database-schema-expert", "prisma-expert"],
  },

  // === BUG FIXING ===
  {
    id: "rw-007",
    name: "Race Condition Fix",
    description: "Debug and fix a race condition in async code",
    prompt: `Debug this code that has a race condition causing double charges:

\`\`\`typescript
async function processPayment(orderId: string) {
  const order = await db.orders.findUnique({ where: { id: orderId } });

  if (order.status === 'pending') {
    await stripe.charges.create({ amount: order.total });
    await db.orders.update({
      where: { id: orderId },
      data: { status: 'paid' }
    });
  }
}
\`\`\`

The problem: When two requests come in simultaneously, both see 'pending' and charge twice.
Fix the race condition while maintaining data consistency.`,
    expectedBehaviors: [
      "Race condition is identified",
      "Solution uses proper locking or atomic operations",
      "No double charges possible",
      "Error handling is added",
      "Transaction is used appropriately",
    ],
    difficulty: "hard",
    category: "bugfix",
    skills: ["debugging-expert", "nodejs-api-architect"],
  },
  {
    id: "rw-008",
    name: "Memory Leak Fix",
    description: "Find and fix a memory leak in a React component",
    prompt: `Debug this React component that causes a memory leak:

\`\`\`typescript
function LivePrice({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(\`wss://api.example.com/\${symbol}\`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data) as { price: number };
      setPrice(data.price);
    };
    // BUG: Missing cleanup
  }, [symbol]);

  return <div>\${price}</div>;
}
\`\`\`

Identify the memory leak and provide the fix.`,
    expectedBehaviors: [
      "Memory leak is identified",
      "Cleanup function is added",
      "WebSocket is properly closed",
      "Edge cases are handled",
    ],
    difficulty: "medium",
    category: "bugfix",
    skills: ["react-typescript-master", "debugging-expert"],
  },

  // === CODE REVIEW ===
  {
    id: "rw-009",
    name: "Security Review",
    description: "Review code for security vulnerabilities",
    prompt: `Review this authentication code for security issues:

\`\`\`typescript
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.query(
    \`SELECT * FROM users WHERE email = '\${email}'\`
  );

  if (user && password === user.password) {
    const token = jwt.sign({ id: user.id }, 'secret123');
    res.cookie('token', token);
    res.json({ success: true, message: 'Logged in as ' + email });
  } else {
    res.json({ success: false, message: 'Invalid ' + email });
  }
});
\`\`\`

Identify all security vulnerabilities and provide fixes.`,
    expectedBehaviors: [
      "SQL injection identified",
      "Plaintext password storage identified",
      "Hardcoded JWT secret identified",
      "Missing httpOnly cookie identified",
      "User enumeration vulnerability identified",
      "All fixes provided",
    ],
    difficulty: "medium",
    category: "review",
    skills: ["security-expert", "smart-contract-auditor"],
  },
  {
    id: "rw-010",
    name: "Performance Review",
    description: "Review code for performance issues",
    prompt: `Review this React component for performance issues:

\`\`\`typescript
function UserList({ users }: { users: User[] }) {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      {sorted.map(user => (
        <UserCard user={user} onClick={() => console.log(user)} />
      ))}
    </div>
  );
}
\`\`\`

Identify performance issues and provide optimized version.`,
    expectedBehaviors: [
      "Missing key prop identified",
      "Unnecessary re-renders identified",
      "useMemo for filtering/sorting suggested",
      "useCallback for onClick suggested",
      "Virtualization for large lists suggested",
    ],
    difficulty: "medium",
    category: "review",
    skills: ["react-typescript-master", "performance-optimization"],
  },

  // === ARCHITECTURE ===
  {
    id: "rw-011",
    name: "Microservices Design",
    description: "Design a microservices architecture for e-commerce",
    prompt: `Design a microservices architecture for an e-commerce platform:
- User Service (auth, profiles)
- Product Service (catalog, inventory)
- Order Service (cart, checkout, orders)
- Payment Service (payments, refunds)
- Notification Service (email, push)

For each service define:
1. API endpoints
2. Database schema
3. Event bus messages (pub/sub)
4. Dependencies on other services
5. Scaling strategy`,
    expectedBehaviors: [
      "Clear service boundaries",
      "Event-driven communication",
      "Proper data ownership",
      "Idempotent operations",
      "Circuit breaker patterns",
      "Observability strategy",
    ],
    difficulty: "hard",
    category: "architecture",
    skills: ["architecture-expert", "system-design-pro"],
  },
  {
    id: "rw-012",
    name: "Caching Strategy",
    description: "Design a caching strategy for high-traffic API",
    prompt: `Design a multi-layer caching strategy for a social media API:
- 10M DAU, 100M posts, 1B reads/day
- Posts are mostly static but can be edited
- Comments are frequently added
- User profiles are read-heavy

Include:
1. Cache layers (CDN, Redis, in-memory)
2. Invalidation strategies
3. Cache-aside vs read-through patterns
4. Hot key handling
5. Cache warming strategy`,
    expectedBehaviors: [
      "Multi-layer caching defined",
      "TTL strategies per data type",
      "Invalidation patterns clear",
      "Hot key solution provided",
      "Cost/performance tradeoffs explained",
    ],
    difficulty: "hard",
    category: "architecture",
    skills: ["redis-caching-pro", "system-design-pro"],
  },

  // === TESTING ===
  {
    id: "rw-013",
    name: "Unit Test Suite",
    description: "Write comprehensive unit tests for a service",
    prompt: `Write unit tests for this OrderService:

\`\`\`typescript
class OrderService {
  constructor(
    private db: Database,
    private paymentService: PaymentService,
    private inventoryService: InventoryService
  ) {}

  async createOrder(userId: string, items: CartItem[]): Promise<Order> {
    // Validate items
    // Check inventory
    // Calculate total
    // Process payment
    // Create order record
    // Update inventory
    // Return order
  }
}
\`\`\`

Write tests covering:
- Happy path
- Validation errors
- Inventory issues
- Payment failures
- Partial failures (rollback)`,
    expectedBehaviors: [
      "All dependencies are mocked",
      "Happy path is tested",
      "Error cases are covered",
      "Rollback behavior tested",
      "Edge cases handled",
      "Test isolation maintained",
    ],
    difficulty: "medium",
    category: "testing",
    skills: ["testing-expert", "jest-testing-pro"],
  },
  {
    id: "rw-014",
    name: "E2E Test Suite",
    description: "Write end-to-end tests for checkout flow",
    prompt: `Write Playwright E2E tests for an e-commerce checkout flow:
1. Add items to cart
2. Proceed to checkout
3. Enter shipping address
4. Select payment method
5. Review order
6. Complete purchase
7. Verify confirmation page

Include:
- Test fixtures for authentication
- Mock payment service responses
- Visual regression snapshots
- Error state testing`,
    expectedBehaviors: [
      "Full flow is tested",
      "Auth fixtures are reusable",
      "Payment is mocked",
      "Error states are tested",
      "Screenshots for regressions",
      "Tests are isolated",
    ],
    difficulty: "medium",
    category: "testing",
    skills: ["testing-expert", "playwright-expert"],
  },

  // === DOCUMENTATION ===
  {
    id: "rw-015",
    name: "API Documentation",
    description: "Generate OpenAPI documentation from code",
    prompt: `Generate OpenAPI 3.0 documentation for this API:

\`\`\`typescript
// GET /api/products
// Query: search?, category?, minPrice?, maxPrice?, sort?, page?, limit?
// Response: { products: Product[], total: number, page: number }

// GET /api/products/:id
// Response: Product | 404

// POST /api/products (admin)
// Body: { name, description, price, category, inventory }
// Response: Product | 400 | 401

// PUT /api/products/:id (admin)
// Body: Partial<Product>
// Response: Product | 400 | 401 | 404

// DELETE /api/products/:id (admin)
// Response: 204 | 401 | 404
\`\`\`

Include:
- Full request/response schemas
- Authentication requirements
- Error responses
- Examples for each endpoint`,
    expectedBehaviors: [
      "Valid OpenAPI 3.0 spec",
      "All endpoints documented",
      "Schemas are complete",
      "Auth is documented",
      "Examples are provided",
      "Error responses included",
    ],
    difficulty: "medium",
    category: "documentation",
    skills: ["technical-writer-pro", "api-documentation"],
  },
  {
    id: "rw-016",
    name: "README Generator",
    description: "Generate a comprehensive README for a project",
    prompt: `Generate a README.md for an npm package with:
- Package name: @gicm/opus67
- Purpose: AI enhancement layer for Claude Code
- Features: 141 skills, 82 MCPs, 10 modes, 107 agents
- Installation: npx create-opus67@latest

Include:
- Badges (npm version, license, downloads)
- Quick start guide
- Feature overview with examples
- Configuration options
- CLI commands
- Contributing guide
- License`,
    expectedBehaviors: [
      "Professional formatting",
      "Clear quick start",
      "Feature examples",
      "Configuration documented",
      "CLI documented",
      "Contributing section",
    ],
    difficulty: "easy",
    category: "documentation",
    skills: ["technical-writer-pro", "readme-expert"],
  },
];

/**
 * Convert real-world tasks to benchmark tasks
 */
export function realworldToTasks(): BenchmarkTask[] {
  return REALWORLD_TASKS.map((task) => ({
    id: task.id,
    name: task.name,
    category: "realworld",
    prompt: task.prompt,
    difficulty: task.difficulty,
    tags: [task.category, ...task.skills],
  }));
}

/**
 * Get tasks by category
 */
export function getByCategory(
  category: RealWorldTask["category"]
): RealWorldTask[] {
  return REALWORLD_TASKS.filter((t) => t.category === category);
}

/**
 * Get tasks that use specific skills
 */
export function getBySkill(skill: string): RealWorldTask[] {
  return REALWORLD_TASKS.filter((t) => t.skills.includes(skill));
}

/**
 * Get benchmark statistics
 */
export function getStats() {
  return {
    total: REALWORLD_TASKS.length,
    byCategory: {
      component: getByCategory("component").length,
      api: getByCategory("api").length,
      database: getByCategory("database").length,
      bugfix: getByCategory("bugfix").length,
      review: getByCategory("review").length,
      architecture: getByCategory("architecture").length,
      testing: getByCategory("testing").length,
      documentation: getByCategory("documentation").length,
    },
    byDifficulty: {
      easy: REALWORLD_TASKS.filter((t) => t.difficulty === "easy").length,
      medium: REALWORLD_TASKS.filter((t) => t.difficulty === "medium").length,
      hard: REALWORLD_TASKS.filter((t) => t.difficulty === "hard").length,
    },
  };
}
