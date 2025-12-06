# Playwright Pro

> **ID:** `playwright-pro`
> **Tier:** 2
> **Token Cost:** 6000
> **MCP Connections:** playwright

## What This Skill Does

Playwright Pro provides comprehensive browser automation and end-to-end testing expertise using Playwright. This skill covers everything from basic page interactions to advanced testing patterns including the Page Object Model, network interception, visual regression testing, and parallel execution strategies for CI/CD pipelines.

You'll learn to write reliable, maintainable E2E tests that run across Chromium, Firefox, and WebKit browsers, handle complex user flows, mock API responses, and integrate seamlessly into modern development workflows.

## When to Use

**Use Playwright Pro when you need to:**

- Write end-to-end tests for web applications
- Automate browser interactions (form filling, navigation, clicks)
- Test multi-step user flows (authentication, checkout, onboarding)
- Capture screenshots and perform visual regression testing
- Mock API responses and intercept network requests
- Run tests in parallel across multiple browsers
- Set up E2E testing in CI/CD pipelines
- Debug flaky tests and improve test reliability
- Migrate from other testing frameworks (Selenium, Cypress)
- Test SPAs, PWAs, or server-rendered applications

**Don't use this skill when:**

- You only need unit tests (use jest/vitest skills instead)
- You're testing Node.js APIs without a browser (use supertest)
- You need mobile app testing (use Appium or native testing tools)

## Core Capabilities

### 1. Browser Automation

Playwright provides powerful APIs for controlling browsers programmatically.

#### Basic Navigation and Interaction

```typescript
import { test, expect } from '@playwright/test';

test('basic navigation and interaction', async ({ page }) => {
  // Navigate to a URL
  await page.goto('https://example.com');

  // Wait for page load
  await page.waitForLoadState('networkidle');

  // Click elements using various locators
  await page.click('button:has-text("Submit")');
  await page.click('[data-testid="login-button"]');
  await page.locator('text=Sign In').click();

  // Fill form fields
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('#password', 'securePassword123');

  // Type with delay (simulates human typing)
  await page.type('input[name="search"]', 'playwright', { delay: 100 });

  // Select dropdown options
  await page.selectOption('select#country', 'US');

  // Check/uncheck checkboxes
  await page.check('input[type="checkbox"]#terms');
  await page.uncheck('input[type="checkbox"]#newsletter');

  // Upload files
  await page.setInputFiles('input[type="file"]', './test-data/image.png');

  // Multiple file upload
  await page.setInputFiles('input[type="file"]', [
    './file1.pdf',
    './file2.pdf'
  ]);
});
```

#### Advanced Locator Strategies

```typescript
test('advanced locators', async ({ page }) => {
  await page.goto('https://example.com');

  // CSS selectors
  await page.locator('.btn-primary').click();

  // Text matching
  await page.locator('text=Exact match').click();
  await page.locator('text=/regex pattern/i').click();

  // Has-text pseudo-class
  await page.locator('button:has-text("Save")').click();

  // Data attributes (recommended for testing)
  await page.locator('[data-testid="submit-form"]').click();

  // Role-based selectors (accessibility-friendly)
  await page.locator('role=button[name="Submit"]').click();
  await page.locator('role=textbox[name="Email"]').fill('test@example.com');

  // Chaining locators
  const form = page.locator('form#login');
  await form.locator('input[name="username"]').fill('user');
  await form.locator('input[name="password"]').fill('pass');
  await form.locator('button[type="submit"]').click();

  // nth matching
  await page.locator('button.action-btn').nth(2).click();

  // First/last
  await page.locator('.item').first().click();
  await page.locator('.item').last().click();

  // Filter by text
  await page.locator('li').filter({ hasText: 'Active' }).click();

  // Filter by another locator
  await page.locator('article').filter({
    has: page.locator('button.delete')
  }).first().click();
});
```

#### Waiting and Timing

```typescript
test('waiting strategies', async ({ page }) => {
  await page.goto('https://example.com');

  // Wait for specific selector
  await page.waitForSelector('.content-loaded');

  // Wait for element to be visible
  await page.waitForSelector('.modal', { state: 'visible' });

  // Wait for element to be hidden
  await page.waitForSelector('.loading-spinner', { state: 'hidden' });

  // Wait for navigation
  await Promise.all([
    page.waitForNavigation(),
    page.click('a.next-page')
  ]);

  // Wait for specific URL
  await page.waitForURL('**/dashboard');

  // Wait for load state
  await page.waitForLoadState('load'); // DOMContentLoaded
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle'); // No network activity for 500ms

  // Wait for function
  await page.waitForFunction(() => {
    return document.querySelector('.data-ready')?.textContent === 'Ready';
  });

  // Wait for timeout (use sparingly)
  await page.waitForTimeout(1000);

  // Wait for request/response
  const responsePromise = page.waitForResponse('**/api/data');
  await page.click('button.load-data');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
});
```

#### Screenshots and PDFs

```typescript
test('capturing screenshots', async ({ page }) => {
  await page.goto('https://example.com');

  // Full page screenshot
  await page.screenshot({ path: 'screenshot.png', fullPage: true });

  // Viewport screenshot
  await page.screenshot({ path: 'viewport.png' });

  // Element screenshot
  const element = page.locator('.hero-section');
  await element.screenshot({ path: 'hero.png' });

  // Screenshot to buffer (for comparison)
  const buffer = await page.screenshot();

  // Generate PDF
  await page.pdf({ path: 'page.pdf', format: 'A4' });

  // PDF with options
  await page.pdf({
    path: 'document.pdf',
    format: 'Letter',
    printBackground: true,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  });
});
```

#### Browser Context and Multi-Page

```typescript
test('multiple contexts and pages', async ({ browser }) => {
  // Create isolated browser contexts (like incognito)
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  // Different pages in same context share cookies/storage
  const page1 = await context1.newPage();
  const page2 = await context1.newPage();

  await page1.goto('https://example.com/login');
  await page1.fill('input[name="email"]', 'user@example.com');
  await page1.fill('input[name="password"]', 'password');
  await page1.click('button[type="submit"]');

  // page2 will have the same session
  await page2.goto('https://example.com/dashboard');
  await expect(page2.locator('.user-name')).toContainText('user');

  // Handle popups/new windows
  const [newPage] = await Promise.all([
    context1.waitForEvent('page'),
    page1.click('a[target="_blank"]')
  ]);

  await newPage.waitForLoadState();
  expect(newPage.url()).toContain('terms');

  await context1.close();
  await context2.close();
});
```

### 2. E2E Testing

Playwright's test runner provides a robust framework for organizing and running tests.

#### Test Structure

```typescript
import { test, expect } from '@playwright/test';

// Basic test
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

// Test with description
test('user can login', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('https://example.com/dashboard');
});

// Grouped tests
test.describe('Authentication', () => {
  test('successful login', async ({ page }) => {
    // Test code
  });

  test('failed login shows error', async ({ page }) => {
    // Test code
  });

  test('logout works', async ({ page }) => {
    // Test code
  });
});

// Nested groups
test.describe('E-commerce', () => {
  test.describe('Product Browsing', () => {
    test('can view product details', async ({ page }) => {
      // Test code
    });
  });

  test.describe('Shopping Cart', () => {
    test('can add items to cart', async ({ page }) => {
      // Test code
    });
  });
});
```

#### Hooks and Setup

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard Tests', () => {
  // Runs before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  // Runs after each test
  test.afterEach(async ({ page }) => {
    // Cleanup code
    await page.click('[data-testid="logout"]');
  });

  // Runs once before all tests
  test.beforeAll(async ({ browser }) => {
    // One-time setup
    const context = await browser.newContext();
    const page = await context.newPage();
    // Seed test data, etc.
    await context.close();
  });

  // Runs once after all tests
  test.afterAll(async () => {
    // Cleanup
  });

  test('can view analytics', async ({ page }) => {
    await page.click('[data-testid="analytics-tab"]');
    await expect(page.locator('.chart')).toBeVisible();
  });
});
```

#### Assertions

```typescript
test('comprehensive assertions', async ({ page }) => {
  await page.goto('https://example.com');

  // Page assertions
  await expect(page).toHaveTitle('Example Domain');
  await expect(page).toHaveURL('https://example.com/');
  await expect(page).toHaveURL(/example\.com/);

  // Element visibility
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.loading')).toBeHidden();
  await expect(page.locator('.optional')).not.toBeVisible();

  // Element state
  await expect(page.locator('button')).toBeEnabled();
  await expect(page.locator('button.disabled')).toBeDisabled();
  await expect(page.locator('input[type="checkbox"]')).toBeChecked();
  await expect(page.locator('input#email')).toBeFocused();

  // Text content
  await expect(page.locator('h1')).toHaveText('Welcome');
  await expect(page.locator('h1')).toContainText('Wel');
  await expect(page.locator('.description')).toHaveText(/pattern/i);

  // Attributes
  await expect(page.locator('a')).toHaveAttribute('href', '/about');
  await expect(page.locator('img')).toHaveAttribute('alt', /logo/i);

  // CSS
  await expect(page.locator('.button')).toHaveCSS('color', 'rgb(255, 0, 0)');

  // Count
  await expect(page.locator('.list-item')).toHaveCount(5);

  // Value
  await expect(page.locator('input[name="email"]')).toHaveValue('user@example.com');

  // Screenshot comparison
  await expect(page).toHaveScreenshot('homepage.png');

  // Custom assertions
  const text = await page.locator('.price').textContent();
  expect(text).toMatch(/\$\d+\.\d{2}/);

  // Soft assertions (don't stop test on failure)
  await expect.soft(page.locator('.header')).toBeVisible();
  await expect.soft(page.locator('.footer')).toBeVisible();
});
```

#### Fixtures

```typescript
// fixtures.ts
import { test as base, expect } from '@playwright/test';

type MyFixtures = {
  authenticatedPage: Page;
  testUser: { email: string; password: string };
};

export const test = base.extend<MyFixtures>({
  // Create a test user fixture
  testUser: async ({}, use) => {
    const user = {
      email: `test-${Date.now()}@example.com`,
      password: 'testPassword123'
    };
    await use(user);
    // Cleanup after test
    // await deleteUser(user.email);
  },

  // Create authenticated page fixture
  authenticatedPage: async ({ browser, testUser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login
    await page.goto('https://example.com/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await use(page);

    // Cleanup
    await context.close();
  }
});

export { expect };

// Usage in test file
import { test, expect } from './fixtures';

test('can create post', async ({ authenticatedPage, testUser }) => {
  // Already logged in via fixture
  await authenticatedPage.goto('https://example.com/posts/new');
  await authenticatedPage.fill('[name="title"]', 'My Post');
  await authenticatedPage.click('button[type="submit"]');
  await expect(authenticatedPage.locator('.success')).toBeVisible();
});
```

#### Parameterized Tests

```typescript
// Test multiple browsers
const browsers = ['chromium', 'firefox', 'webkit'];

for (const browserName of browsers) {
  test(`works on ${browserName}`, async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page.locator('h1')).toBeVisible();
  });
}

// Test with different data
const testData = [
  { email: 'user1@example.com', name: 'User One' },
  { email: 'user2@example.com', name: 'User Two' },
  { email: 'user3@example.com', name: 'User Three' }
];

for (const data of testData) {
  test(`registration for ${data.name}`, async ({ page }) => {
    await page.goto('https://example.com/register');
    await page.fill('[name="email"]', data.email);
    await page.fill('[name="name"]', data.name);
    await page.click('button[type="submit"]');
    await expect(page.locator('.success')).toContainText(data.name);
  });
}
```

### 3. Page Object Model

The Page Object Model (POM) organizes test code by creating classes that represent pages or components.

#### Basic Page Object

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('https://example.com/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async waitForNavigation() {
    await this.page.waitForURL('**/dashboard');
  }
}

// Usage in test
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.waitForNavigation();
  await expect(page).toHaveURL(/dashboard/);
});

test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('wrong@example.com', 'wrongpass');
  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

#### Advanced Page Object with Components

```typescript
// components/NavBar.ts
import { Page, Locator } from '@playwright/test';

export class NavBar {
  readonly page: Page;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoutButton = page.locator('[data-testid="logout"]');
    this.settingsLink = page.locator('[data-testid="settings"]');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async goToSettings() {
    await this.userMenu.click();
    await this.settingsLink.click();
  }
}

// pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { NavBar } from '../components/NavBar';

export class DashboardPage {
  readonly page: Page;
  readonly navBar: NavBar;
  readonly welcomeMessage: Locator;
  readonly analyticsCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBar = new NavBar(page);
    this.welcomeMessage = page.locator('.welcome-message');
    this.analyticsCard = page.locator('[data-testid="analytics-card"]');
  }

  async goto() {
    await this.page.goto('https://example.com/dashboard');
  }

  async getWelcomeText(): Promise<string> {
    return await this.welcomeMessage.textContent() || '';
  }

  async viewAnalytics() {
    await this.analyticsCard.click();
  }
}

// Usage
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test('full user journey', async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');

  // Dashboard
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  const welcome = await dashboard.getWelcomeText();
  expect(welcome).toContain('Welcome');

  // Logout
  await dashboard.navBar.logout();
  await expect(page).toHaveURL(/login/);
});
```

#### Base Page Pattern

```typescript
// pages/BasePage.ts
import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseURL = 'https://example.com';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(`${this.baseURL}${path}`);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  async clickByText(text: string) {
    await this.page.locator(`text=${text}`).click();
  }

  async waitForText(text: string) {
    await this.page.locator(`text=${text}`).waitFor();
  }
}

// pages/ProductPage.ts
import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly addToCartButton: Locator;
  readonly priceLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.locator('h1.product-title');
    this.addToCartButton = page.locator('button.add-to-cart');
    this.priceLabel = page.locator('.price');
  }

  async gotoProduct(productId: string) {
    await this.goto(`/products/${productId}`);
    await this.waitForPageLoad();
  }

  async addToCart() {
    await this.addToCartButton.click();
    await this.waitForText('Added to cart');
  }

  async getPrice(): Promise<string> {
    return await this.priceLabel.textContent() || '';
  }
}
```

### 4. Network Interception

Control network requests and responses for testing and mocking.

#### Basic Request Interception

```typescript
test('intercept API request', async ({ page }) => {
  // Intercept and modify requests
  await page.route('**/api/users', async (route) => {
    // Modify request
    const request = route.request();
    const headers = {
      ...request.headers(),
      'x-custom-header': 'test-value'
    };

    await route.continue({ headers });
  });

  // Block specific requests
  await page.route('**/analytics/**', (route) => route.abort());

  // Fulfill with mock data
  await page.route('**/api/config', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ theme: 'dark', language: 'en' })
    });
  });

  await page.goto('https://example.com');
});
```

#### Mock API Responses

```typescript
test('mock user data', async ({ page }) => {
  // Mock user profile API
  await page.route('**/api/user/profile', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      })
    });
  });

  // Mock products list
  await page.route('**/api/products', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: [
          { id: 1, name: 'Product 1', price: 29.99 },
          { id: 2, name: 'Product 2', price: 39.99 }
        ]
      })
    });
  });

  await page.goto('https://example.com/dashboard');
  await expect(page.locator('.user-name')).toHaveText('Test User');
  await expect(page.locator('.product-item')).toHaveCount(2);
});
```

#### Testing Error States

```typescript
test('handles 500 error', async ({ page }) => {
  await page.route('**/api/data', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server Error'
      })
    });
  });

  await page.goto('https://example.com/data');
  await expect(page.locator('.error-message')).toContainText('Server Error');
});

test('handles network timeout', async ({ page }) => {
  await page.route('**/api/slow', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    route.abort('timedout');
  });

  await page.goto('https://example.com');
  await page.click('button.load-slow-data');
  await expect(page.locator('.timeout-message')).toBeVisible();
});
```

#### Request/Response Inspection

```typescript
test('verify request payload', async ({ page }) => {
  // Capture request
  const [request] = await Promise.all([
    page.waitForRequest('**/api/submit'),
    page.click('button[type="submit"]')
  ]);

  const postData = request.postDataJSON();
  expect(postData.email).toBe('user@example.com');
  expect(postData.newsletter).toBe(true);
});

test('verify response data', async ({ page }) => {
  // Capture response
  const [response] = await Promise.all([
    page.waitForResponse('**/api/products'),
    page.goto('https://example.com/shop')
  ]);

  expect(response.status()).toBe(200);
  const json = await response.json();
  expect(json.products).toHaveLength(10);
});

test('track all API calls', async ({ page }) => {
  const apiCalls: string[] = [];

  page.on('request', (request) => {
    if (request.url().includes('/api/')) {
      apiCalls.push(request.url());
    }
  });

  await page.goto('https://example.com');
  await page.click('button.load-more');

  expect(apiCalls).toContain('https://example.com/api/products');
  expect(apiCalls).toContain('https://example.com/api/user');
});
```

#### Advanced Mocking with HAR Files

```typescript
test('replay HAR file', async ({ page }) => {
  // Record HAR
  await page.routeFromHAR('./hars/api-mocks.har', {
    url: '**/api/**',
    update: false // Set to true to update HAR file
  });

  await page.goto('https://example.com');
  // All API calls will use responses from HAR file
});

// Generate HAR file
test('record HAR', async ({ page }) => {
  await page.routeFromHAR('./hars/new-recording.har', {
    url: '**/api/**',
    update: true // Record new responses
  });

  await page.goto('https://example.com');
  await page.click('button.load-data');
  // HAR file will be created with recorded responses
});
```

### 5. Visual Testing

Compare screenshots to detect visual regressions.

#### Basic Screenshot Comparison

```typescript
test('visual regression test', async ({ page }) => {
  await page.goto('https://example.com');

  // First run creates baseline, subsequent runs compare
  await expect(page).toHaveScreenshot('homepage.png');

  // Test specific element
  const header = page.locator('.header');
  await expect(header).toHaveScreenshot('header.png');

  // Full page screenshot
  await expect(page).toHaveScreenshot('full-page.png', {
    fullPage: true
  });
});
```

#### Screenshot Options

```typescript
test('screenshot with options', async ({ page }) => {
  await page.goto('https://example.com');

  // Ignore specific elements (useful for dynamic content)
  await expect(page).toHaveScreenshot('page-no-ads.png', {
    mask: [page.locator('.ad-banner'), page.locator('.timestamp')]
  });

  // Set threshold for acceptable differences (0-1)
  await expect(page).toHaveScreenshot('flexible.png', {
    maxDiffPixels: 100,
    threshold: 0.2
  });

  // Clip to specific area
  await expect(page).toHaveScreenshot('cropped.png', {
    clip: { x: 0, y: 0, width: 800, height: 600 }
  });

  // Animations can cause flakiness - disable them
  await expect(page).toHaveScreenshot('no-animations.png', {
    animations: 'disabled'
  });
});
```

#### Mobile and Responsive Testing

```typescript
test('responsive screenshots', async ({ page }) => {
  await page.goto('https://example.com');

  // Desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page).toHaveScreenshot('desktop.png');

  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page).toHaveScreenshot('tablet.png');

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('mobile.png');
});

test('mobile device emulation', async ({ page }) => {
  await page.goto('https://example.com');

  // Emulate iPhone 13
  await page.emulate({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  await expect(page).toHaveScreenshot('iphone13.png');
});
```

#### Component Visual Testing

```typescript
test.describe('Button Component Visual Tests', () => {
  test('primary button', async ({ page }) => {
    await page.goto('https://example.com/components');
    const button = page.locator('.btn-primary').first();
    await expect(button).toHaveScreenshot('btn-primary.png');
  });

  test('button hover state', async ({ page }) => {
    await page.goto('https://example.com/components');
    const button = page.locator('.btn-primary').first();
    await button.hover();
    await expect(button).toHaveScreenshot('btn-primary-hover.png');
  });

  test('disabled button', async ({ page }) => {
    await page.goto('https://example.com/components');
    const button = page.locator('.btn-primary.disabled').first();
    await expect(button).toHaveScreenshot('btn-primary-disabled.png');
  });
});
```

#### Dark Mode Testing

```typescript
test('dark mode visual', async ({ page }) => {
  await page.goto('https://example.com');

  // Test light mode
  await expect(page).toHaveScreenshot('light-mode.png');

  // Switch to dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page).toHaveScreenshot('dark-mode.png');

  // Or click dark mode toggle
  await page.click('[data-testid="theme-toggle"]');
  await page.waitForTimeout(500); // Wait for transition
  await expect(page).toHaveScreenshot('dark-mode-toggled.png');
});
```

### 6. Parallel Execution

Run tests faster with parallel execution and sharding.

#### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test match pattern
  testMatch: '**/*.spec.ts',

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Emulate timezone
    timezoneId: 'America/New_York',

    // Emulate locale
    locale: 'en-US',

    // Default navigation timeout
    navigationTimeout: 15000,

    // Default action timeout
    actionTimeout: 10000
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] }
    }
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
```

#### Sharding for CI

```typescript
// playwright.config.ts - CI specific
export default defineConfig({
  // ... other config

  // When running with --shard flag
  // Example: npx playwright test --shard=1/4
  workers: 1, // Use 1 worker per shard

  reporter: [
    ['blob', { outputDir: 'blob-report' }] // For merging later
  ]
});
```

#### GitHub Actions Integration

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}

      - name: Upload blob report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report
          retention-days: 1

  merge-reports:
    if: always()
    needs: [test]
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Download blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 30
```

#### Advanced GitHub Actions with Matrix

```yaml
name: Cross-Browser Testing

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    timeout-minutes: 60
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        browser: [chromium, firefox, webkit]
        exclude:
          # WebKit tests are flaky on Windows
          - os: windows-latest
            browser: webkit

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run tests
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.os }}-${{ matrix.browser }}
          path: test-results/
          retention-days: 7
```

#### Docker Integration

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Run tests
CMD ["npx", "playwright", "test"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  playwright:
    build: .
    environment:
      - CI=true
    volumes:
      - ./test-results:/app/test-results
      - ./playwright-report:/app/playwright-report
    command: npx playwright test --workers=4
```

#### Custom Test Grouping

```typescript
// tests/critical.spec.ts
import { test } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe.configure({ mode: 'serial' }); // Run serially

  test('user can sign up', async ({ page }) => {
    // Test code
  });

  test('user can login', async ({ page }) => {
    // Test code
  });

  test('user can purchase', async ({ page }) => {
    // Test code
  });
});

// Run only critical tests
// npx playwright test critical.spec.ts
```

#### Tag-Based Filtering

```typescript
// Tag tests
test('login @smoke @critical', async ({ page }) => {
  // Test code
});

test('analytics @slow', async ({ page }) => {
  // Test code
});

test('settings @admin', async ({ page }) => {
  // Test code
});

// Run only smoke tests
// npx playwright test --grep @smoke

// Run all except slow tests
// npx playwright test --grep-invert @slow

// Run smoke OR critical
// npx playwright test --grep "@smoke|@critical"
```

## Real-World Examples

### Example 1: Full Authentication Flow Test

Complete implementation of signup, login, and session persistence testing with Page Object Model.

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';

type AuthFixtures = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  dashboardPage: DashboardPage;
  testUser: {
    email: string;
    password: string;
    name: string;
  };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const timestamp = Date.now();
    const user = {
      email: `test-${timestamp}@example.com`,
      password: 'SecurePass123!',
      name: 'Test User'
    };

    await use(user);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  }
});

export { expect } from '@playwright/test';

// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible' });
  }

  async getErrorText(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}

// tests/auth.spec.ts
import { test, expect } from '../fixtures/auth.fixture';

test.describe('Authentication Flow', () => {
  test('complete signup and login flow', async ({
    page,
    signupPage,
    loginPage,
    dashboardPage,
    testUser
  }) => {
    await page.route('**/api/verify-email', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ verified: true })
      });
    });

    await signupPage.goto();
    await signupPage.signup(testUser.name, testUser.email, testUser.password);
    await dashboardPage.waitForLoad();
    const welcomeText = await dashboardPage.getWelcomeText();
    expect(welcomeText).toContain(testUser.name);

    await dashboardPage.logout();
    await expect(page).toHaveURL(/login/);

    await loginPage.login(testUser.email, testUser.password);
    await dashboardPage.waitForLoad();
  });
});
```

### Example 2: E-commerce Checkout Test

End-to-end test of product browsing, cart management, and checkout flow.

```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { ProductListPage } from '../pages/ProductListPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('E-commerce Checkout Flow', () => {
  test('complete purchase flow', async ({ page }) => {
    await page.route('**/api/payments', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 'ORD-12345'
        })
      });
    });

    const productList = new ProductListPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await productList.goto();
    await productList.selectProduct(0);
    await cart.goto();
    await cart.proceedToCheckout();

    await checkout.fillShippingInfo({
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'New York',
      zip: '10001'
    });

    await checkout.fillPaymentInfo({
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvc: '123'
    });

    await checkout.placeOrder();
  });
});
```

## Related Skills

- **javascript-testing-patterns** - General JavaScript testing strategies
- **typescript-advanced-types** - Type-safe test fixtures and page objects
- **modern-javascript-patterns** - Async/await patterns for test code
- **cicd-automation:github-actions-templates** - CI/CD integration for automated testing

## Further Reading

**Official Documentation:**
- [Playwright Documentation](https://playwright.dev/) - Complete API reference
- [Best Practices](https://playwright.dev/docs/best-practices) - Testing best practices
- [Test Fixtures](https://playwright.dev/docs/test-fixtures) - Custom fixture patterns
- [Page Object Models](https://playwright.dev/docs/pom) - POM guide

**Advanced Topics:**
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots) - Screenshot testing
- [Network Interception](https://playwright.dev/docs/network) - Request/response mocking
- [Browser Contexts](https://playwright.dev/docs/browser-contexts) - Isolated sessions
- [Trace Viewer](https://playwright.dev/docs/trace-viewer) - Debugging failed tests
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing) - A11y validation

**Tools & Extensions:**
- [Playwright Test VSCode Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) - IDE integration
- [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector) - Interactive debugging
- [Codegen](https://playwright.dev/docs/codegen) - Generate tests from browser actions
- [HAR Files](https://playwright.dev/docs/mock#mock-with-har-files) - Record/replay network traffic

**Migration Guides:**
- [From Puppeteer](https://playwright.dev/docs/puppeteer) - Puppeteer to Playwright
- [From Selenium](https://playwright.dev/docs/selenium) - Selenium migration
- [From Cypress](https://www.checklyhq.com/learn/headless/cypress-to-playwright/) - Cypress comparison

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
