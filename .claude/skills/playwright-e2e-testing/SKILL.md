---
name: playwright-e2e-testing
description: "{"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Playwright E2E Testing

## Quick Reference

```typescript
// Basic test structure
import { test, expect } from '@playwright/test';

test('basic navigation', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});

// With fixtures
test('wallet connected test', async ({ page, walletMock }) => {
  await page.goto('/trade');
  await walletMock.connect('phantom');
  await expect(page.locator('[data-testid="wallet-address"]')).toBeVisible();
});

// Visual regression
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixels: 100
});

// API mocking
await page.route('**/api/tokens', async route => {
  await route.fulfill({ json: mockTokenData });
});
```

## Core Concepts

### Test Isolation & Parallelization
Playwright runs tests in parallel across multiple workers, with each test getting a fresh browser context:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Page Object Model (POM)
Encapsulate page logic to reduce duplication and improve maintainability:

```typescript
// e2e/pages/TradePage.ts
import { Page, Locator, expect } from '@playwright/test';

export class TradePage {
  readonly page: Page;
  readonly tokenInput: Locator;
  readonly amountInput: Locator;
  readonly swapButton: Locator;
  readonly successToast: Locator;
  readonly walletBalance: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tokenInput = page.locator('[data-testid="token-select"]');
    this.amountInput = page.locator('[data-testid="amount-input"]');
    this.swapButton = page.locator('button:has-text("Swap")');
    this.successToast = page.locator('[data-toast="success"]');
    this.walletBalance = page.locator('[data-testid="wallet-balance"]');
  }

  async goto() {
    await this.page.goto('/trade');
    await expect(this.tokenInput).toBeVisible();
  }

  async selectToken(symbol: string) {
    await this.tokenInput.click();
    await this.page.locator(`[data-token="${symbol}"]`).click();
    await expect(this.tokenInput).toContainText(symbol);
  }

  async enterAmount(amount: string) {
    await this.amountInput.fill(amount);
    await expect(this.amountInput).toHaveValue(amount);
  }

  async executeSwap() {
    const responsePromise = this.page.waitForResponse('**/api/swap');
    await this.swapButton.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return response.json();
  }

  async waitForSuccess() {
    await expect(this.successToast).toBeVisible({ timeout: 10000 });
  }

  async getBalance(): Promise<string> {
    return await this.walletBalance.textContent() || '0';
  }
}
```

### Custom Fixtures
Extend Playwright's built-in fixtures with domain-specific setup:

```typescript
// e2e/fixtures/wallet.ts
import { test as base, Page } from '@playwright/test';

export interface WalletMock {
  connect(wallet: 'phantom' | 'solflare'): Promise<void>;
  disconnect(): Promise<void>;
  getAddress(): Promise<string>;
  signTransaction(): Promise<void>;
}

type WalletFixtures = {
  walletMock: WalletMock;
};

async function createWalletMock(page: Page): Promise<WalletMock> {
  // Inject wallet mock before page loads
  await page.addInitScript(() => {
    (window as any).solana = {
      isPhantom: true,
      publicKey: null,
      connect: async () => {
        (window as any).solana.publicKey = {
          toString: () => 'MOCK_ADDRESS_123...'
        };
        return { publicKey: (window as any).solana.publicKey };
      },
      disconnect: async () => {
        (window as any).solana.publicKey = null;
      },
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
    };
  });

  return {
    async connect(wallet: 'phantom' | 'solflare') {
      await page.click('[data-testid="connect-wallet"]');
      await page.click(`[data-wallet="${wallet}"]`);
      await page.waitForFunction(() => !!(window as any).solana.publicKey);
    },
    async disconnect() {
      await page.click('[data-testid="wallet-menu"]');
      await page.click('text=Disconnect');
      await page.waitForFunction(() => !(window as any).solana.publicKey);
    },
    async getAddress() {
      return await page.evaluate(() => (window as any).solana.publicKey?.toString());
    },
    async signTransaction() {
      await page.click('button:has-text("Sign")');
      await page.waitForTimeout(500);
    },
  };
}

export const test = base.extend<WalletFixtures>({
  walletMock: async ({ page }, use) => {
    const mock = await createWalletMock(page);
    await use(mock);
  },
});

export { expect } from '@playwright/test';
```

## Common Patterns

### Pattern 1: API Mocking & Network Interception

```typescript
// e2e/tests/token-swap.spec.ts
import { test, expect } from '@playwright/test';
import { TradePage } from '../pages/TradePage';

test.describe('Token Swap', () => {
  let tradePage: TradePage;

  test.beforeEach(async ({ page }) => {
    // Mock Jupiter API
    await page.route('**/v6/quote*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          inputMint: 'SOL',
          outputMint: 'USDC',
          inAmount: '1000000000',
          outAmount: '25000000',
          priceImpactPct: 0.1,
          routePlan: []
        })
      });
    });

    // Mock balance checks
    await page.route('**/api/balance*', async route => {
      const url = new URL(route.request().url());
      const token = url.searchParams.get('token');
      await route.fulfill({
        json: {
          token,
          balance: '100.0',
          uiAmount: 100.0
        }
      });
    });

    tradePage = new TradePage(page);
    await tradePage.goto();
  });

  test('should calculate swap quote', async ({ page }) => {
    await tradePage.selectToken('SOL');
    await tradePage.enterAmount('1.0');

    // Wait for quote to load
    await expect(page.locator('[data-testid="quote-output"]')).toContainText('25');
    await expect(page.locator('[data-testid="price-impact"]')).toContainText('0.1%');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Override with error response
    await page.route('**/v6/quote*', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    );

    await tradePage.selectToken('SOL');
    await tradePage.enterAmount('1.0');

    await expect(page.locator('[role="alert"]')).toContainText('Failed to fetch quote');
  });
});
```

### Pattern 2: Visual Regression Testing

```typescript
// e2e/tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('homepage layout', async ({ page }) => {
    await page.goto('/');

    // Wait for dynamic content
    await page.waitForSelector('[data-testid="token-list"]');
    await page.waitForLoadState('networkidle');

    // Full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      maxDiffPixels: 100,
      animations: 'disabled'
    });
  });

  test('trade page component snapshots', async ({ page }) => {
    await page.goto('/trade');

    // Screenshot specific components
    const swapWidget = page.locator('[data-testid="swap-widget"]');
    await expect(swapWidget).toHaveScreenshot('swap-widget.png', {
      maxDiffPixelRatio: 0.01
    });

    const priceChart = page.locator('[data-testid="price-chart"]');
    await expect(priceChart).toHaveScreenshot('price-chart.png');
  });

  test('responsive layouts', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
        maxDiffPixels: 150
      });
    }
  });

  test('dark mode consistency', async ({ page }) => {
    await page.goto('/');

    // Light mode
    await expect(page).toHaveScreenshot('light-mode.png');

    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(300); // Animation

    // Dark mode
    await expect(page).toHaveScreenshot('dark-mode.png');
  });
});
```

### Pattern 3: Wallet Integration Testing

```typescript
// e2e/tests/wallet-integration.spec.ts
import { test, expect } from '../fixtures/wallet';

test.describe('Wallet Integration', () => {
  test('connect Phantom wallet', async ({ page, walletMock }) => {
    await page.goto('/');

    await walletMock.connect('phantom');

    const address = await walletMock.getAddress();
    expect(address).toBeTruthy();

    // Verify UI updates
    await expect(page.locator('[data-testid="wallet-address"]'))
      .toContainText(address.slice(0, 4));
    await expect(page.locator('[data-testid="connect-wallet"]'))
      .not.toBeVisible();
  });

  test('disconnect wallet', async ({ page, walletMock }) => {
    await page.goto('/');
    await walletMock.connect('phantom');

    await walletMock.disconnect();

    await expect(page.locator('[data-testid="connect-wallet"]')).toBeVisible();
    await expect(page.locator('[data-testid="wallet-address"]')).not.toBeVisible();
  });

  test('sign transaction flow', async ({ page, walletMock }) => {
    await page.goto('/trade');
    await walletMock.connect('phantom');

    // Setup swap
    await page.locator('[data-testid="token-select"]').click();
    await page.locator('[data-token="SOL"]').click();
    await page.locator('[data-testid="amount-input"]').fill('1.0');

    // Execute swap
    await page.click('button:has-text("Swap")');

    // Wait for transaction prompt
    await expect(page.locator('[data-testid="tx-modal"]')).toBeVisible();

    await walletMock.signTransaction();

    // Verify success
    await expect(page.locator('[data-toast="success"]')).toBeVisible();
  });

  test('handle wallet rejection', async ({ page, walletMock }) => {
    await page.goto('/trade');
    await walletMock.connect('phantom');

    await page.evaluate(() => {
      (window as any).solana.signTransaction = async () => {
        throw new Error('User rejected the request');
      };
    });

    await page.locator('[data-testid="token-select"]').click();
    await page.locator('[data-token="SOL"]').click();
    await page.locator('[data-testid="amount-input"]').fill('1.0');
    await page.click('button:has-text("Swap")');

    await expect(page.locator('[role="alert"]'))
      .toContainText('Transaction rejected');
  });
});
```

## Advanced Techniques

### Parallel Test Execution with Sharding

```typescript
// playwright.config.ts - CI Configuration
export default defineConfig({
  // Shard tests across multiple machines
  shard: process.env.SHARD
    ? { current: parseInt(process.env.SHARD), total: parseInt(process.env.TOTAL_SHARDS) }
    : undefined,

  // Example GitHub Actions usage:
  // jobs:
  //   test:
  //     strategy:
  //       matrix:
  //         shard: [1, 2, 3, 4]
  //     steps:
  //       - run: npx playwright test
  //         env:
  //           SHARD: ${{ matrix.shard }}
  //           TOTAL_SHARDS: 4
});
```

### Global Setup & Teardown

```typescript
// e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Setup: Create test accounts, seed data
  await page.goto(process.env.BASE_URL + '/api/test-setup');
  await page.evaluate(() => {
    localStorage.setItem('test-mode', 'true');
  });

  // Save storage state for reuse
  await page.context().storageState({
    path: 'e2e/.auth/storage.json'
  });

  await browser.close();
}

export default globalSetup;

// e2e/global-teardown.ts
async function globalTeardown() {
  // Cleanup: Remove test accounts, clear data
  const response = await fetch(process.env.BASE_URL + '/api/test-teardown', {
    method: 'POST'
  });
  console.log('Cleanup status:', response.status);
}

export default globalTeardown;
```

### Trace Viewer for Debugging

```typescript
// Generate traces on failure
test.use({
  trace: 'on-first-retry',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure'
});

// View traces:
// npx playwright show-trace test-results/trace.zip

// Programmatic trace analysis
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext();
await context.tracing.start({ screenshots: true, snapshots: true });

// ... run test actions

await context.tracing.stop({ path: 'trace.zip' });
```

### Custom Matchers

```typescript
// e2e/matchers/solana.ts
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  async toHaveSolanaAddress(locator, expected) {
    const actual = await locator.textContent();
    const isValidAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(actual || '');

    return {
      message: () => `expected ${actual} to be a valid Solana address`,
      pass: isValidAddress && (!expected || actual === expected),
    };
  },

  async toHaveTokenBalance(page, token, expectedBalance) {
    const balance = await page.locator(`[data-token="${token}"] [data-testid="balance"]`)
      .textContent();
    const numBalance = parseFloat(balance || '0');

    return {
      message: () => `expected ${token} balance ${numBalance} to equal ${expectedBalance}`,
      pass: Math.abs(numBalance - expectedBalance) < 0.01,
    };
  },
});
```

## Production Examples

### Example 1: Complete DEX Trading Flow

```typescript
// e2e/tests/dex-trading-flow.spec.ts
import { test, expect } from '../fixtures/wallet';
import { TradePage } from '../pages/TradePage';

test.describe('DEX Trading Flow', () => {
  test('end-to-end swap execution', async ({ page, walletMock }) => {
    // Mock all required APIs
    await page.route('**/v6/quote*', route =>
      route.fulfill({ json: {
        inAmount: '1000000000',
        outAmount: '25000000',
        priceImpactPct: 0.08
      }})
    );

    await page.route('**/v6/swap', route =>
      route.fulfill({ json: {
        swapTransaction: 'BASE64_ENCODED_TX',
        lastValidBlockHeight: 123456
      }})
    );

    await page.route('**/api/confirm-transaction', route =>
      route.fulfill({ json: { confirmed: true, signature: 'SIG123' }})
    );

    // Start flow
    const tradePage = new TradePage(page);
    await tradePage.goto();
    await walletMock.connect('phantom');

    // Execute swap
    await tradePage.selectToken('SOL');
    await tradePage.enterAmount('1.0');

    // Verify quote
    await expect(page.locator('[data-testid="quote-output"]'))
      .toContainText('25');
    await expect(page.locator('[data-testid="price-impact"]'))
      .toContainText('0.08%');

    // Review and confirm
    await tradePage.swapButton.click();
    await expect(page.locator('[data-testid="review-modal"]')).toBeVisible();
    await page.click('button:has-text("Confirm Swap")');

    // Sign transaction
    await walletMock.signTransaction();

    // Wait for confirmation
    await tradePage.waitForSuccess();

    // Verify transaction signature displayed
    await expect(page.locator('[data-testid="tx-signature"]'))
      .toContainText('SIG123');

    // Verify balance updated
    const newBalance = await tradePage.getBalance();
    expect(parseFloat(newBalance)).toBeGreaterThan(0);
  });
});
```

### Example 2: Bonding Curve Token Launch

```typescript
// e2e/tests/token-launch.spec.ts
import { test, expect } from '../fixtures/wallet';

test.describe('Token Launch', () => {
  test('create and launch token', async ({ page, walletMock }) => {
    await page.goto('/create');
    await walletMock.connect('phantom');

    // Fill token details
    await page.fill('[name="name"]', 'Test Token');
    await page.fill('[name="symbol"]', 'TEST');
    await page.fill('[name="description"]', 'A test token for E2E testing');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/token-image.png');

    // Wait for image preview
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();

    // Submit
    await page.click('button:has-text("Create Token")');

    // Sign transaction
    await expect(page.locator('[data-testid="tx-modal"]')).toBeVisible();
    await walletMock.signTransaction();

    // Wait for success and redirect
    await page.waitForURL(/\/token\/[A-Za-z0-9]+/);

    // Verify token page
    await expect(page.locator('h1')).toContainText('Test Token');
    await expect(page.locator('[data-testid="symbol"]')).toContainText('TEST');

    // Verify bonding curve initialized
    await expect(page.locator('[data-testid="bonding-curve-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="market-cap"]')).toContainText('$');
  });

  test('buy tokens on bonding curve', async ({ page, walletMock }) => {
    await page.goto('/token/TEST_TOKEN_ADDRESS');
    await walletMock.connect('phantom');

    // Enter buy amount
    await page.fill('[data-testid="buy-amount"]', '1.0');

    // Check expected tokens
    await expect(page.locator('[data-testid="expected-tokens"]'))
      .not.toContainText('0');

    // Execute buy
    await page.click('button:has-text("Buy")');
    await walletMock.signTransaction();

    // Verify success
    await expect(page.locator('[data-toast="success"]')).toBeVisible();

    // Check bonding curve updated
    const progress = await page.locator('[data-testid="curve-progress"]').textContent();
    expect(parseFloat(progress || '0')).toBeGreaterThan(0);
  });
});
```

### Example 3: Multi-Step User Journey with Analytics

```typescript
// e2e/tests/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey Analytics', () => {
  let analyticsEvents: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture analytics events
    await page.route('**/api/analytics', route => {
      const postData = route.request().postDataJSON();
      analyticsEvents.push(postData);
      route.fulfill({ status: 200, body: 'OK' });
    });
  });

  test('complete user onboarding journey', async ({ page }) => {
    // Landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Welcome');

    // View featured tokens
    await page.click('[data-testid="featured-tokens"]');
    await page.waitForLoadState('networkidle');

    // Click on a token
    await page.click('[data-testid="token-card"]:first-child');
    await expect(page).toHaveURL(/\/token\//);

    // View token details
    await page.click('[data-testid="token-info-tab"]');
    await page.click('[data-testid="holders-tab"]');

    // Connect wallet prompt
    await page.click('button:has-text("Buy Now")');
    await expect(page.locator('[data-testid="connect-prompt"]')).toBeVisible();

    // Verify analytics captured
    expect(analyticsEvents).toContainEqual(
      expect.objectContaining({ event: 'page_view', page: '/' })
    );
    expect(analyticsEvents).toContainEqual(
      expect.objectContaining({ event: 'token_view' })
    );
    expect(analyticsEvents).toContainEqual(
      expect.objectContaining({ event: 'connect_prompt_shown' })
    );
  });

  test('returning user journey', async ({ page, context }) => {
    // Setup storage state (simulate returning user)
    await context.addCookies([{
      name: 'returning_user',
      value: 'true',
      domain: 'localhost',
      path: '/'
    }]);

    await page.goto('/');

    // Should skip onboarding
    await expect(page.locator('[data-testid="welcome-modal"]')).not.toBeVisible();

    // Should show personalized content
    await expect(page.locator('[data-testid="your-tokens"]')).toBeVisible();
  });
});
```

## Best Practices

1. **Test Data Management**
   - Use fixtures for consistent test data
   - Reset state between tests
   - Mock external dependencies (APIs, blockchain)

2. **Selector Strategy**
   - Prefer `data-testid` attributes
   - Avoid CSS/XPath selectors tied to styling
   - Use role-based selectors for accessibility

3. **Wait Strategies**
   - Use `waitForLoadState('networkidle')` for dynamic content
   - Prefer `waitForResponse` over `waitForTimeout`
   - Set appropriate timeouts for blockchain operations

4. **CI/CD Integration**
   - Run tests in parallel with sharding
   - Use retry logic for flaky tests
   - Generate HTML reports and upload artifacts

5. **Visual Testing**
   - Use consistent viewport sizes
   - Disable animations for stable screenshots
   - Set reasonable diff thresholds

## Common Pitfalls

1. **Race Conditions**
   ```typescript
   // ❌ Bad: May click before button is ready
   await page.click('button:has-text("Submit")');

   // ✅ Good: Wait for button to be enabled
   await expect(page.locator('button:has-text("Submit")')).toBeEnabled();
   await page.click('button:has-text("Submit")');
   ```

2. **Flaky Selectors**
   ```typescript
   // ❌ Bad: Breaks if text changes
   await page.click('text=Submit');

   // ✅ Good: Use stable test IDs
   await page.click('[data-testid="submit-button"]');
   ```

3. **Missing Network Waits**
   ```typescript
   // ❌ Bad: May not wait for API response
   await page.fill('[name="search"]', 'SOL');
   await expect(page.locator('.result')).toBeVisible();

   // ✅ Good: Wait for API call
   await page.fill('[name="search"]', 'SOL');
   await page.waitForResponse('**/api/search*');
   await expect(page.locator('.result')).toBeVisible();
   ```

4. **Hardcoded Waits**
   ```typescript
   // ❌ Bad: Arbitrary timeout
   await page.waitForTimeout(3000);

   // ✅ Good: Wait for specific condition
   await page.waitForSelector('[data-testid="loaded"]');
   ```

5. **Not Cleaning Up**
   ```typescript
   // ❌ Bad: Pollutes other tests
   test('modify settings', async ({ page }) => {
     await page.goto('/settings');
     await page.check('[name="dark-mode"]');
     // No cleanup
   });

   // ✅ Good: Reset state
   test('modify settings', async ({ page, context }) => {
     await page.goto('/settings');
     await page.check('[name="dark-mode"]');
     // Test assertions...

     await test.afterEach(async () => {
       await context.clearCookies();
       await page.evaluate(() => localStorage.clear());
     });
   });
   ```

## Resources

- **Official Docs**: https://playwright.dev
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-playwright
- **Trace Viewer**: https://playwright.dev/docs/trace-viewer
- **VS Code Extension**: https://playwright.dev/docs/getting-started-vscode
- **Community Examples**: https://github.com/microsoft/playwright/tree/main/examples
