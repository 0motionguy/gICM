# Jest Unit Testing

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


## Quick Reference

```typescript
// Basic test structure
describe('TokenSwap', () => {
  it('should calculate correct output amount', () => {
    const result = calculateSwap(1000, 2000, 100);
    expect(result).toBe(95);
  });
});

// Async tests
it('should fetch token price', async () => {
  const price = await getTokenPrice('SOL');
  expect(price).toBeGreaterThan(0);
});

// Mocking
jest.mock('@solana/web3.js');
const mockConnection = {
  getBalance: jest.fn().mockResolvedValue(1000000000)
};

// React component testing
import { render, screen, fireEvent } from '@testing-library/react';

it('should render swap button', () => {
  render(<SwapButton />);
  expect(screen.getByText('Swap')).toBeInTheDocument();
});

// Snapshot testing
expect(component).toMatchSnapshot();
```

## Core Concepts

### Test Structure & Organization

```typescript
// src/__tests__/utils/swap.test.ts
import { calculateSwap, getSwapQuote } from '@/utils/swap';

describe('Swap Utilities', () => {
  // Group related tests
  describe('calculateSwap', () => {
    it('should calculate output amount correctly', () => {
      const input = 100;
      const reserveIn = 10000;
      const reserveOut = 20000;

      const output = calculateSwap(input, reserveIn, reserveOut);

      expect(output).toBe(198);
    });

    it('should handle zero input', () => {
      expect(calculateSwap(0, 10000, 20000)).toBe(0);
    });

    it('should throw on negative input', () => {
      expect(() => calculateSwap(-100, 10000, 20000))
        .toThrow('Input amount must be positive');
    });

    it('should throw on insufficient liquidity', () => {
      expect(() => calculateSwap(100, 0, 20000))
        .toThrow('Insufficient liquidity');
    });
  });

  describe('getSwapQuote', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch quote from API', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: async () => ({ inAmount: 100, outAmount: 198 })
      });
      global.fetch = mockFetch;

      const quote = await getSwapQuote('SOL', 'USDC', 100);

      expect(quote.outAmount).toBe(198);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/quote'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(getSwapQuote('SOL', 'USDC', 100))
        .rejects.toThrow('Network error');
    });
  });
});
```

### Mocking Strategies

```typescript
// Manual mocks: __mocks__/@solana/web3.js
export const Connection = jest.fn().mockImplementation(() => ({
  getBalance: jest.fn().mockResolvedValue(1000000000),
  getAccountInfo: jest.fn().mockResolvedValue(null),
  sendTransaction: jest.fn().mockResolvedValue('SIGNATURE_123'),
}));

export const PublicKey = jest.fn().mockImplementation((key) => ({
  toString: () => key,
  toBase58: () => key,
}));

// Factory functions for complex mocks
export function createMockConnection(overrides = {}) {
  return {
    getBalance: jest.fn().mockResolvedValue(1000000000),
    getAccountInfo: jest.fn().mockResolvedValue({
      lamports: 1000000,
      owner: new PublicKey('OWNER_KEY'),
      data: Buffer.from([]),
      executable: false,
      rentEpoch: 0,
    }),
    sendTransaction: jest.fn().mockResolvedValue('SIGNATURE_123'),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    ...overrides,
  };
}

// Usage in tests
import { createMockConnection } from './__mocks__/@solana/web3.js';

describe('Wallet Service', () => {
  it('should get wallet balance', async () => {
    const mockConnection = createMockConnection({
      getBalance: jest.fn().mockResolvedValue(2500000000),
    });

    const balance = await getWalletBalance(mockConnection, 'WALLET_KEY');

    expect(balance).toBe(2.5);
    expect(mockConnection.getBalance).toHaveBeenCalledWith(
      expect.objectContaining({ toString: expect.any(Function) })
    );
  });
});
```

### React Testing Library Integration

```typescript
// src/components/__tests__/SwapWidget.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapWidget } from '../SwapWidget';

// Mock providers
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WalletProvider>
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  </WalletProvider>
);

describe('SwapWidget', () => {
  it('should render token selection', () => {
    render(<SwapWidget />, { wrapper: MockProviders });

    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /swap/i })).toBeInTheDocument();
  });

  it('should update amount on input', async () => {
    const user = userEvent.setup();
    render(<SwapWidget />, { wrapper: MockProviders });

    const input = screen.getByLabelText('Amount');
    await user.type(input, '100');

    expect(input).toHaveValue('100');
  });

  it('should fetch quote on amount change', async () => {
    const mockGetQuote = jest.fn().mockResolvedValue({
      inAmount: 100,
      outAmount: 198,
      priceImpact: 0.5,
    });

    render(<SwapWidget getQuote={mockGetQuote} />, { wrapper: MockProviders });

    const input = screen.getByLabelText('Amount');
    await userEvent.type(input, '100');

    await waitFor(() => {
      expect(mockGetQuote).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100 })
      );
    });

    expect(screen.getByText('198')).toBeInTheDocument();
  });

  it('should disable swap button when no amount', () => {
    render(<SwapWidget />, { wrapper: MockProviders });

    const swapButton = screen.getByRole('button', { name: /swap/i });
    expect(swapButton).toBeDisabled();
  });

  it('should show error on invalid input', async () => {
    render(<SwapWidget />, { wrapper: MockProviders });

    const input = screen.getByLabelText('Amount');
    await userEvent.type(input, '-100');

    expect(screen.getByText(/invalid amount/i)).toBeInTheDocument();
  });
});
```

## Common Patterns

### Pattern 1: Testing Async Functions with Mocks

```typescript
// src/services/__tests__/tokenService.test.ts
import { getTokenMetadata, getTokenPrice } from '../tokenService';

jest.mock('../api/client');
import { apiClient } from '../api/client';

describe('Token Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenMetadata', () => {
    it('should return token metadata', async () => {
      const mockMetadata = {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        logoUri: 'https://example.com/sol.png',
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockMetadata,
      });

      const result = await getTokenMetadata('SOL_MINT_ADDRESS');

      expect(result).toEqual(mockMetadata);
      expect(apiClient.get).toHaveBeenCalledWith('/tokens/SOL_MINT_ADDRESS');
    });

    it('should cache metadata', async () => {
      const mockMetadata = { name: 'Solana', symbol: 'SOL' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockMetadata });

      // First call
      await getTokenMetadata('SOL_MINT_ADDRESS');
      // Second call
      await getTokenMetadata('SOL_MINT_ADDRESS');

      // Should only fetch once
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Token not found')
      );

      await expect(getTokenMetadata('INVALID_ADDRESS'))
        .rejects.toThrow('Token not found');
    });
  });

  describe('getTokenPrice', () => {
    it('should return token price from Jupiter', async () => {
      const mockPrice = { price: 100.50, timestamp: Date.now() };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPrice });

      const price = await getTokenPrice('SOL');

      expect(price).toBe(100.50);
    });

    it('should retry on failure', async () => {
      (apiClient.get as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { price: 100.50 } });

      const price = await getTokenPrice('SOL');

      expect(price).toBe(100.50);
      expect(apiClient.get).toHaveBeenCalledTimes(3);
    });

    it('should fallback to cached price', async () => {
      // Prime cache
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { price: 100.50 }
      });
      await getTokenPrice('SOL');

      // Fail subsequent request
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('API down'));

      const price = await getTokenPrice('SOL');

      expect(price).toBe(100.50); // Returns cached value
    });
  });
});
```

### Pattern 2: Testing React Hooks

```typescript
// src/hooks/__tests__/useWallet.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../useWallet';
import { WalletProvider } from '@/contexts/WalletContext';

describe('useWallet', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WalletProvider>{children}</WalletProvider>
  );

  it('should connect wallet', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.connected).toBe(false);

    await act(async () => {
      await result.current.connect('phantom');
    });

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
      expect(result.current.publicKey).toBeTruthy();
    });
  });

  it('should disconnect wallet', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('phantom');
    });

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    // Mock wallet rejection
    global.window.solana = {
      connect: jest.fn().mockRejectedValue(new Error('User rejected')),
    };

    await act(async () => {
      await expect(result.current.connect('phantom'))
        .rejects.toThrow('User rejected');
    });

    expect(result.current.connected).toBe(false);
  });

  it('should sign transaction', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect('phantom');
    });

    const mockTx = { /* transaction object */ };

    await act(async () => {
      const signed = await result.current.signTransaction(mockTx);
      expect(signed).toBeDefined();
    });
  });
});
```

### Pattern 3: Snapshot Testing with Dynamic Data

```typescript
// src/components/__tests__/TokenCard.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { TokenCard } from '../TokenCard';

describe('TokenCard', () => {
  const mockToken = {
    address: 'MOCK_ADDRESS_123',
    name: 'Solana',
    symbol: 'SOL',
    price: 100.50,
    change24h: 5.2,
    logoUri: 'https://example.com/sol.png',
    marketCap: 50000000,
    volume24h: 1000000,
  };

  it('should match snapshot', () => {
    const { container } = render(<TokenCard token={mockToken} />);

    // Normalize dynamic content before snapshot
    const normalized = container.innerHTML
      .replace(/MOCK_ADDRESS_\w+/g, 'MOCK_ADDRESS')
      .replace(/\d{4}-\d{2}-\d{2}/g, 'DATE_PLACEHOLDER');

    expect(normalized).toMatchSnapshot();
  });

  it('should match snapshot with positive change', () => {
    const { container } = render(
      <TokenCard token={{ ...mockToken, change24h: 5.2 }} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with negative change', () => {
    const { container } = render(
      <TokenCard token={{ ...mockToken, change24h: -3.1 }} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should update snapshot on prop changes', () => {
    const { container, rerender } = render(<TokenCard token={mockToken} />);
    expect(container.firstChild).toMatchSnapshot('initial');

    rerender(<TokenCard token={{ ...mockToken, price: 110.75 }} />);
    expect(container.firstChild).toMatchSnapshot('updated-price');
  });
});
```

## Advanced Techniques

### Custom Matchers

```typescript
// src/test-utils/matchers.ts
import { expect } from '@jest/globals';

expect.extend({
  toBeValidSolanaAddress(received: string) {
    const isValid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(received);

    return {
      message: () => `expected ${received} to be a valid Solana address`,
      pass: isValid,
    };
  },

  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;

    return {
      message: () =>
        `expected ${received} to be within range ${min}-${max}`,
      pass,
    };
  },

  toHaveTokenBalance(received: any, token: string, amount: number) {
    const balance = received.balances?.[token];
    const pass = balance === amount;

    return {
      message: () =>
        `expected ${token} balance to be ${amount}, but got ${balance}`,
      pass,
    };
  },
});

// Usage
it('should validate Solana address', () => {
  const address = 'GZ1qFzRwN5i3f2e7Jy8j5c6v7b8n9m0l1k2j3h4g5f6d7';
  expect(address).toBeValidSolanaAddress();
});

it('should have correct price range', () => {
  const price = await getTokenPrice('SOL');
  expect(price).toBeWithinRange(50, 200);
});
```

### Test Fixtures & Factories

```typescript
// src/test-utils/factories.ts
import { faker } from '@faker-js/faker';

export const createMockToken = (overrides = {}) => ({
  address: faker.string.alphanumeric(44),
  name: faker.company.name(),
  symbol: faker.string.alpha(3).toUpperCase(),
  decimals: 9,
  price: parseFloat(faker.finance.amount(1, 200, 2)),
  change24h: parseFloat(faker.finance.amount(-10, 10, 2)),
  logoUri: faker.image.url(),
  marketCap: parseFloat(faker.finance.amount(1000000, 100000000, 0)),
  volume24h: parseFloat(faker.finance.amount(100000, 10000000, 0)),
  ...overrides,
});

export const createMockWallet = (overrides = {}) => ({
  publicKey: faker.string.alphanumeric(44),
  connected: true,
  balance: parseFloat(faker.finance.amount(0, 100, 2)),
  tokens: Array.from({ length: 5 }, () => createMockToken()),
  ...overrides,
});

export const createMockTransaction = (overrides = {}) => ({
  signature: faker.string.alphanumeric(88),
  slot: faker.number.int({ min: 100000, max: 200000 }),
  blockTime: faker.date.recent().getTime() / 1000,
  confirmationStatus: 'confirmed',
  err: null,
  ...overrides,
});

// Usage
describe('Token List', () => {
  it('should render multiple tokens', () => {
    const tokens = Array.from({ length: 10 }, () => createMockToken());
    render(<TokenList tokens={tokens} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(10);
  });
});
```

### Parallel Test Execution

```typescript
// jest.config.js
module.exports = {
  // Run tests in parallel
  maxWorkers: '50%', // Use 50% of available CPUs

  // Or specify exact number
  maxWorkers: 4,

  // Test timeout
  testTimeout: 10000,

  // Shard tests across multiple machines (CI)
  shard: process.env.CI ? {
    current: parseInt(process.env.SHARD_INDEX),
    total: parseInt(process.env.TOTAL_SHARDS),
  } : undefined,
};

// package.json scripts
{
  "test": "jest",
  "test:parallel": "jest --maxWorkers=4",
  "test:shard": "jest --shard=$SHARD_INDEX/$TOTAL_SHARDS"
}
```

### Coverage Thresholds

```typescript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/test-utils/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

## Production Examples

### Example 1: Testing Bonding Curve Logic

```typescript
// src/utils/__tests__/bondingCurve.test.ts
import {
  calculateBuyPrice,
  calculateSellPrice,
  getMarketCap,
  getLiquidityPool
} from '../bondingCurve';

describe('Bonding Curve', () => {
  const INITIAL_PRICE = 0.0001;
  const CURVE_CONSTANT = 1e-10;

  describe('calculateBuyPrice', () => {
    it('should calculate correct buy price', () => {
      const currentSupply = 1000000;
      const buyAmount = 10000;

      const price = calculateBuyPrice(
        currentSupply,
        buyAmount,
        CURVE_CONSTANT
      );

      expect(price).toBeGreaterThan(0);
      expect(price).toBeCloseTo(1.005, 3);
    });

    it('should increase price with supply', () => {
      const buyAmount = 10000;

      const price1 = calculateBuyPrice(1000000, buyAmount, CURVE_CONSTANT);
      const price2 = calculateBuyPrice(2000000, buyAmount, CURVE_CONSTANT);

      expect(price2).toBeGreaterThan(price1);
    });

    it('should handle large purchases', () => {
      const currentSupply = 1000000;
      const largeBuy = 100000;

      const price = calculateBuyPrice(currentSupply, largeBuy, CURVE_CONSTANT);

      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(1000); // Sanity check
    });
  });

  describe('calculateSellPrice', () => {
    it('should calculate correct sell price', () => {
      const currentSupply = 1000000;
      const sellAmount = 10000;

      const price = calculateSellPrice(
        currentSupply,
        sellAmount,
        CURVE_CONSTANT
      );

      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(
        calculateBuyPrice(currentSupply, sellAmount, CURVE_CONSTANT)
      );
    });

    it('should throw on sell exceeding supply', () => {
      expect(() =>
        calculateSellPrice(1000000, 2000000, CURVE_CONSTANT)
      ).toThrow('Sell amount exceeds supply');
    });
  });

  describe('getMarketCap', () => {
    it('should calculate market cap', () => {
      const supply = 1000000;
      const price = 1.0;

      const marketCap = getMarketCap(supply, price);

      expect(marketCap).toBe(1000000);
    });
  });

  describe('getLiquidityPool', () => {
    it('should calculate liquidity pool sizes', () => {
      const currentSupply = 1000000;
      const solReserve = 100;

      const pool = getLiquidityPool(currentSupply, solReserve);

      expect(pool.tokenReserve).toBe(currentSupply);
      expect(pool.solReserve).toBe(solReserve);
      expect(pool.k).toBe(currentSupply * solReserve);
    });
  });
});
```

### Example 2: Testing React Context with Providers

```typescript
// src/contexts/__tests__/WalletContext.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WalletProvider, useWallet } from '../WalletContext';

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
  WalletProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('WalletContext', () => {
  const mockWallet = {
    publicKey: { toString: () => 'MOCK_PUBLIC_KEY' },
    connected: true,
    connecting: false,
    disconnecting: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWallet as jest.Mock).mockReturnValue(mockWallet);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WalletProvider>{children}</WalletProvider>
  );

  it('should provide wallet context', () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.publicKey).toBeTruthy();
    expect(result.current.connected).toBe(true);
  });

  it('should connect wallet', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await result.current.connect();
    });

    expect(mockWallet.connect).toHaveBeenCalled();
  });

  it('should handle connection errors', async () => {
    mockWallet.connect.mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useWallet(), { wrapper });

    await act(async () => {
      await expect(result.current.connect()).rejects.toThrow('Connection failed');
    });
  });

  it('should track balance updates', async () => {
    const { result } = renderHook(() => useWallet(), { wrapper });

    // Initial balance
    expect(result.current.balance).toBeUndefined();

    // Simulate balance update
    await act(async () => {
      await result.current.refreshBalance();
    });

    await waitFor(() => {
      expect(result.current.balance).toBeGreaterThan(0);
    });
  });
});
```

### Example 3: Integration Test with Multiple Services

```typescript
// src/__tests__/integration/tokenSwap.test.ts
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { executeSwap, getSwapQuote } from '@/services/swapService';
import { getTokenBalance } from '@/services/tokenService';

jest.mock('@solana/web3.js');
jest.mock('@/services/api');

describe('Token Swap Integration', () => {
  let mockConnection: jest.Mocked<Connection>;
  let userWallet: Keypair;

  beforeEach(() => {
    mockConnection = {
      getBalance: jest.fn().mockResolvedValue(1000000000),
      sendTransaction: jest.fn().mockResolvedValue('SIGNATURE_123'),
      confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
    } as any;

    userWallet = Keypair.generate();
  });

  it('should execute full swap flow', async () => {
    // Step 1: Get initial balances
    const initialSolBalance = await getTokenBalance(
      mockConnection,
      userWallet.publicKey,
      'SOL'
    );
    expect(initialSolBalance).toBe(1.0);

    // Step 2: Get swap quote
    const quote = await getSwapQuote('SOL', 'USDC', 1.0);
    expect(quote.outAmount).toBeGreaterThan(0);
    expect(quote.priceImpact).toBeLessThan(1);

    // Step 3: Execute swap
    const result = await executeSwap(
      mockConnection,
      userWallet,
      quote
    );

    expect(result.signature).toBe('SIGNATURE_123');
    expect(mockConnection.sendTransaction).toHaveBeenCalled();

    // Step 4: Verify balances updated
    const finalSolBalance = await getTokenBalance(
      mockConnection,
      userWallet.publicKey,
      'SOL'
    );
    expect(finalSolBalance).toBeLessThan(initialSolBalance);
  });

  it('should handle slippage correctly', async () => {
    const quote = await getSwapQuote('SOL', 'USDC', 1.0);

    // Simulate price change
    const outdatedQuote = { ...quote, outAmount: quote.outAmount * 0.95 };

    await expect(
      executeSwap(mockConnection, userWallet, outdatedQuote)
    ).rejects.toThrow('Slippage tolerance exceeded');
  });

  it('should rollback on transaction failure', async () => {
    mockConnection.confirmTransaction.mockResolvedValueOnce({
      value: { err: { InstructionError: [0, 'Custom'] } }
    } as any);

    const quote = await getSwapQuote('SOL', 'USDC', 1.0);

    await expect(
      executeSwap(mockConnection, userWallet, quote)
    ).rejects.toThrow('Transaction failed');

    // Verify no balance changes
    const balance = await getTokenBalance(
      mockConnection,
      userWallet.publicKey,
      'SOL'
    );
    expect(balance).toBe(1.0);
  });
});
```

## Best Practices

1. **Test Organization**
   - One test file per source file
   - Group related tests with `describe`
   - Use descriptive test names

2. **Mocking Strategy**
   - Mock external dependencies (APIs, blockchain)
   - Use manual mocks for complex modules
   - Clear mocks between tests

3. **Assertion Quality**
   - Test behavior, not implementation
   - Use specific matchers
   - Avoid testing internal state

4. **Coverage**
   - Aim for 80%+ code coverage
   - Focus on critical paths
   - Don't chase 100% coverage

5. **Performance**
   - Run tests in parallel
   - Use `beforeAll` for expensive setup
   - Mock slow operations

## Common Pitfalls

1. **Not Cleaning Up Mocks**
   ```typescript
   // ❌ Bad: Mocks leak between tests
   jest.mock('./api');

   // ✅ Good: Clear mocks
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

2. **Testing Implementation Details**
   ```typescript
   // ❌ Bad: Tests internal state
   expect(component.state.isLoading).toBe(true);

   // ✅ Good: Tests observable behavior
   expect(screen.getByRole('progressbar')).toBeInTheDocument();
   ```

3. **Async Test Issues**
   ```typescript
   // ❌ Bad: Missing await
   it('fetches data', () => {
     fetchData(); // Promise not awaited
     expect(data).toBeDefined();
   });

   // ✅ Good: Properly handle async
   it('fetches data', async () => {
     await fetchData();
     expect(data).toBeDefined();
   });
   ```

4. **Flaky Tests**
   ```typescript
   // ❌ Bad: Race condition
   it('updates after delay', () => {
     setTimeout(() => setValue(10), 100);
     expect(value).toBe(10); // Fails
   });

   // ✅ Good: Wait for condition
   it('updates after delay', async () => {
     setTimeout(() => setValue(10), 100);
     await waitFor(() => expect(value).toBe(10));
   });
   ```

5. **Snapshot Bloat**
   ```typescript
   // ❌ Bad: Snapshots too large
   expect(entirePage).toMatchSnapshot();

   // ✅ Good: Focused snapshots
   expect(component.find('Button')).toMatchSnapshot();
   ```

## Resources

- **Official Docs**: https://jestjs.io/docs/getting-started
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Jest Cheat Sheet**: https://github.com/sapegin/jest-cheat-sheet
- **Coverage Reports**: https://jestjs.io/docs/configuration#coveragereporters-arraystring--string-options
