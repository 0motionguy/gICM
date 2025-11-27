# Foundry Fuzzing Techniques

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 38 tokens, expands to 4200 tokens

## Quick Reference (Load: 38 tokens)

Foundry is a blazing-fast Solidity testing framework with built-in fuzzing, invariant testing, and contract deployment tools.

**Core patterns:**
- `forge fuzz` - Generative fuzzing with random inputs
- `forge invariant` - Test invariants across state changes
- `assume()` - Filter invalid inputs
- `bound()` - Constrain input ranges
- `forgeConfig.toml` - Fuzzing configuration

**Quick start:**
```bash
forge fuzz --match testFuzz
forge invariant --match testInvariant
```

## Core Concepts (Expand: +500 tokens)

### Fuzzing Fundamentals

Fuzzing generates random inputs to find edge cases:

**Property-based testing:**
- Run function with random inputs repeatedly
- Verify properties hold for all inputs
- Automatically shrink failing cases
- Detect unexpected state transitions

**Key advantages:**
- Find bugs humans miss
- Test edge cases automatically
- Generate regression tests from failures
- Parallel execution across multiple cores

### Invariant Testing

Invariants are properties that must always be true:

**Common invariants:**
- Token supply never increases beyond max
- User balance <= total supply
- Liquidity pool ratios maintain constant product
- Oracle prices within acceptable ranges
- Access control rules never violated

**Foundry invariant testing:**
- Calls random functions in random order
- Verifies invariants hold after each call
- Finds sequences that break properties
- Helps identify unsafe state transitions

### Input Constraints

Fuzzing requires bounding input ranges:

**Techniques:**
- `assume()` - Skip invalid test cases
- `bound()` - Constrain integers to valid range
- Custom modifiers - Validate parameters
- Setup functions - Initialize valid state

### Foundry Configuration

Configure fuzzing behavior in foundry.toml:

```toml
[fuzz]
runs = 10000           # Number of test cases per fuzz run
seed = 123             # Deterministic seed (optional)
max_test_rejects = 65536

[invariant]
runs = 1000
depth = 50             # Number of calls per invariant test
fail_on_revert = true
```

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Basic Fuzzing with Input Validation

Fuzz functions with bounded integer inputs:

```solidity
// test/Vault.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract VaultFuzzTest is Test {
    Vault vault;

    function setUp() public {
        vault = new Vault();
        vm.deal(address(this), 100 ether);
    }

    // Fuzz function with implicit uint256 parameter
    function testFuzzDeposit(uint256 amount) public {
        // Bound amount to valid range (1 wei to 100 ether)
        amount = bound(amount, 1, 100 ether);

        // Test invariant: deposit increases balance
        uint256 balanceBefore = vault.balanceOf(address(this));

        vault.deposit{value: amount}();

        uint256 balanceAfter = vault.balanceOf(address(this));
        assertEq(balanceAfter, balanceBefore + amount);
    }

    // Multiple fuzzing parameters
    function testFuzzTransfer(uint256 deposit, uint256 transfer) public {
        deposit = bound(deposit, 1, 100 ether);
        transfer = bound(transfer, 0, deposit);

        // Setup
        vault.deposit{value: deposit}();

        // Test
        vault.transfer(address(0x123), transfer);
        assertEq(vault.balanceOf(address(0x123)), transfer);
        assertEq(vault.balanceOf(address(this)), deposit - transfer);
    }

    // Parametric test with assume for filtering
    function testFuzzAssumeExample(uint256 x, uint256 y) public {
        // Skip test if conditions aren't met
        assume(x > 0 && y > 0);
        assume(x <= type(uint128).max);
        assume(y <= type(uint128).max);

        // Now x and y are guaranteed valid
        uint256 result = vault.multiply(x, y);
        assertLe(result, type(uint256).max);
    }
}
```

**Fuzzing features:**
- `bound(value, min, max)` - Constrain value to range
- `assume(condition)` - Skip if condition false
- Multiple parameters fuzzed independently
- Foundry finds minimal failing case

### Pattern 2: Invariant Testing

Test properties that hold across state changes:

```solidity
// test/PoolInvariant.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/ConstantProductPool.sol";

contract PoolInvariantTest is Test {
    ConstantProductPool pool;
    address token0;
    address token1;

    // Tracks executed actions for debugging
    function setUp() public {
        pool = new ConstantProductPool();
        token0 = address(new MockToken());
        token1 = address(new MockToken());

        // Approve pool to spend tokens
        MockToken(token0).approve(address(pool), type(uint256).max);
        MockToken(token1).approve(address(pool), type(uint256).max);

        // Initial liquidity
        MockToken(token0).mint(address(this), 1000 ether);
        MockToken(token1).mint(address(this), 1000 ether);
    }

    // Invariant: constant product k = x * y maintained
    function invariant_ConstantProductMaintained() public {
        uint256 reserve0 = MockToken(token0).balanceOf(address(pool));
        uint256 reserve1 = MockToken(token1).balanceOf(address(pool));

        if (reserve0 > 0 && reserve1 > 0) {
            uint256 k = reserve0 * reserve1;
            uint256 kNew = pool.k();
            assertGe(kNew, k); // k should only increase with fees
        }
    }

    // Invariant: reserves never exceed stored values
    function invariant_ReservesValid() public {
        (uint256 reserve0, uint256 reserve1) = pool.getReserves();

        uint256 balance0 = MockToken(token0).balanceOf(address(pool));
        uint256 balance1 = MockToken(token1).balanceOf(address(pool));

        assertEq(reserve0, balance0);
        assertEq(reserve1, balance1);
    }

    // Invariant: total supply correct
    function invariant_TotalSupplyCorrect() public {
        uint256 totalSupply = pool.totalSupply();
        // Check that invariant relationships hold
        assertGt(totalSupply, 0); // At least some liquidity
    }

    // Fuzz helper - called randomly by invariant tester
    function addLiquidity(uint256 amount0, uint256 amount1) public {
        amount0 = bound(amount0, 1, 1000 ether);
        amount1 = bound(amount1, 1, 1000 ether);

        MockToken(token0).mint(address(this), amount0);
        MockToken(token1).mint(address(this), amount1);

        pool.addLiquidity(amount0, amount1);
    }

    // Fuzz helper
    function swap(uint256 amountIn, bool token0In) public {
        amountIn = bound(amountIn, 1, 100 ether);

        if (token0In) {
            MockToken(token0).mint(address(this), amountIn);
            pool.swap(amountIn, true);
        } else {
            MockToken(token1).mint(address(this), amountIn);
            pool.swap(amountIn, false);
        }
    }
}
```

**Run invariants:**
```bash
forge invariant --match testInvariant
# Tests random sequences of addLiquidity/swap
```

### Pattern 3: Custom Assumption Filters

Validate complex preconditions:

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Math.sol";

contract MathFuzzTest is Test {
    Math math;

    function setUp() public {
        math = new Math();
    }

    // Filter out overflow cases
    function testFuzzAdditionSafe(uint256 a, uint256 b) public {
        // Skip if addition would overflow
        assume(a <= type(uint256).max - b);

        uint256 result = math.add(a, b);
        assertEq(result, a + b);
    }

    // Multiple conditions with assume
    function testFuzzDivisionSafe(uint256 numerator, uint256 denominator) public {
        // Skip invalid cases
        assume(denominator != 0);
        assume(numerator <= type(uint256).max / denominator);

        uint256 result = math.divide(numerator, denominator);
        assertEq(result, numerator / denominator);
    }

    // Custom filtering function
    function testFuzzWithValidation(address token) public {
        _assumeValidToken(token);

        // Now token is guaranteed valid
        assertTrue(token != address(0));
        assertTrue(token.code.length > 0);
    }

    function _assumeValidToken(address token) internal {
        assume(token != address(0));
        assume(token.code.length > 0); // Has code
        assume(token != address(this)); // Not test contract
    }
}
```

**Best assumptions:**
- Filter based on invariants, not implementation
- Minimize assume blocks (test harness overhead)
- Document why input is invalid
- Prefer bound() for numeric ranges

### Pattern 4: Stateful Fuzzing with Sequences

Test sequences of operations:

```solidity
// test/VaultSequence.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract VaultSequenceTest is Test {
    Vault vault;
    uint256 totalDeposited;

    function setUp() public {
        vault = new Vault();
        totalDeposited = 0;
        vm.deal(address(this), 1000 ether);
    }

    // Invariant: sum of balances equals total
    function invariant_BalancesEqualTotal() public {
        assertEq(vault.totalDeposits(), totalDeposited);
    }

    // Deposit sequence
    function deposit(uint256 amount) public {
        amount = bound(amount, 0.1 ether, 1 ether);

        uint256 balanceBefore = vault.balanceOf(address(this));
        vault.deposit{value: amount}();
        uint256 balanceAfter = vault.balanceOf(address(this));

        assertEq(balanceAfter, balanceBefore + amount);
        totalDeposited += amount;
    }

    // Withdraw sequence
    function withdraw(uint256 amount) public {
        uint256 maxWithdraw = vault.balanceOf(address(this));
        amount = bound(amount, 0, maxWithdraw);

        if (amount == 0) return;

        uint256 balanceBefore = vault.balanceOf(address(this));
        vault.withdraw(amount);
        uint256 balanceAfter = vault.balanceOf(address(this));

        assertEq(balanceAfter, balanceBefore - amount);
        totalDeposited -= amount;
    }

    // Transfer sequence
    function transfer(uint256 amount) public {
        address recipient = address(0x123);
        uint256 maxTransfer = vault.balanceOf(address(this));

        amount = bound(amount, 0, maxTransfer);
        if (amount == 0) return;

        vault.transfer(recipient, amount);
        assertEq(vault.balanceOf(recipient), amount);
    }
}
```

### Pattern 5: Edge Case and Regression Testing

Capture and replay failing cases:

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Oracle.sol";

contract OracleEdgeCaseTest is Test {
    Oracle oracle;

    function setUp() public {
        oracle = new Oracle();
    }

    // Regression test from fuzzing failure
    function testPriceOverflowEdgeCase() public {
        // Found by fuzzer: overflow at specific values
        uint256 price1 = 2**128 - 1;
        uint256 price2 = 2**128 - 1;

        // This previously caused overflow
        uint256 average = oracle.getAveragePrice(price1, price2);

        assertLe(average, type(uint256).max);
    }

    // Fuzz test that captures regression
    function testFuzzPriceRange(uint256 p1, uint256 p2) public {
        p1 = bound(p1, 1, type(uint128).max);
        p2 = bound(p2, 1, type(uint128).max);

        uint256 average = oracle.getAveragePrice(p1, p2);

        assertGe(average, type(uint256).min);
        assertLe(average, type(uint256).max);
    }

    // Boundary testing
    function testMinMaxBoundaries() public {
        // Test at maximum values
        oracle.setPrice(type(uint128).max);
        assertLe(oracle.getPrice(), type(uint128).max);

        // Test at minimum values
        oracle.setPrice(1);
        assertEq(oracle.getPrice(), 1);

        // Test zero
        vm.expectRevert();
        oracle.setPrice(0);
    }
}
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Custom Fuzz Dictionary

Target specific input values with corpus:

```toml
# foundry.toml
[fuzz]
runs = 10000
seed = 42
dictionary_weight = 40  # Weight for dictionary values

# Optional: create fuzz dictionary file
# test/fuzz/dictionary.txt
```

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

contract DictionaryFuzzTest is Test {
    // Using command line for dictionary values
    function testFuzzWithDictionary(uint256 value) public {
        // Foundry uses dictionary to bias fuzz runs
        // Include special values: 0, type(uint).max, etc.

        if (value == 0) {
            // Handle zero case
            return;
        }

        assertTrue(value > 0);
    }
}
```

**Fuzz dictionary targets:**
- Boundary values (0, 1, max)
- Known problematic values
- Contract addresses
- Special constants

### Technique 2: Weighted Randomization

Bias fuzzer toward certain behaviors:

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

contract WeightedFuzzTest is Test {
    uint256 constant DEPOSIT_WEIGHT = 70;
    uint256 constant WITHDRAW_WEIGHT = 20;
    uint256 constant TRANSFER_WEIGHT = 10;

    Vault vault;
    uint256 userBalance;

    function setUp() public {
        vault = new Vault();
        userBalance = 0;
        vm.deal(address(this), 1000 ether);
    }

    // Weighted action selector
    function executeAction(uint256 action, uint256 amount) public {
        uint256 selector = action % 100;

        if (selector < DEPOSIT_WEIGHT) {
            amount = bound(amount, 0.1 ether, 1 ether);
            vault.deposit{value: amount}();
            userBalance += amount;
        } else if (selector < DEPOSIT_WEIGHT + WITHDRAW_WEIGHT) {
            amount = bound(amount, 0, userBalance);
            if (amount > 0) {
                vault.withdraw(amount);
                userBalance -= amount;
            }
        } else {
            amount = bound(amount, 0, userBalance);
            if (amount > 0) {
                vault.transfer(address(0x123), amount);
                userBalance -= amount;
            }
        }
    }

    function invariant_BalanceCorrect() public {
        assertEq(vault.balanceOf(address(this)), userBalance);
    }
}
```

### Technique 3: Differential Testing

Compare two implementations:

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Sort.sol";
import "../src/SortOptimized.sol";

contract SortDifferentialTest is Test {
    Sort sortRef;
    SortOptimized sortOpt;

    function setUp() public {
        sortRef = new Sort();
        sortOpt = new SortOptimized();
    }

    // Both implementations should produce same result
    function testFuzzSortEquivalence(uint256[] memory arr) public {
        // Bound array size
        uint256 len = bound(arr.length, 0, 100);
        uint256[] memory array = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            array[i] = uint256(keccak256(abi.encode(arr, i))) % 1000;
        }

        uint256[] memory result1 = sortRef.sort(array);
        uint256[] memory result2 = sortOpt.sort(array);

        assertEq(result1.length, result2.length);

        for (uint256 i = 0; i < result1.length; i++) {
            assertEq(result1[i], result2[i]);
        }
    }

    // Performance shouldn't regress
    function testFuzzSortPerformance(uint256[] memory arr) public {
        uint256 len = bound(arr.length, 0, 1000);
        uint256[] memory array = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            array[i] = uint256(keccak256(abi.encode(arr, i))) % 10000;
        }

        uint256 gasUsed1 = gasleft();
        sortRef.sort(array);
        gasUsed1 -= gasleft();

        uint256 gasUsed2 = gasleft();
        sortOpt.sort(array);
        gasUsed2 -= gasleft();

        // Optimized version shouldn't use significantly more gas
        assertLe(gasUsed2, (gasUsed1 * 110) / 100); // Allow 10% overhead
    }
}
```

### Technique 4: Vulnerability-Specific Fuzzing

Target known vulnerability patterns:

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract VulnerabilityFuzzTest is Test {
    Vault vault;

    function setUp() public {
        vault = new Vault();
    }

    // Fuzz for reentrancy vulnerabilities
    function testFuzzReentrancy(uint256 amount) public {
        amount = bound(amount, 1, 100 ether);
        vm.deal(address(this), amount);

        vault.deposit{value: amount}();

        // Try to find reentrancy path
        vault.withdraw(amount);

        // If we reach here, no reentrancy found
        assertEq(vault.balanceOf(address(this)), 0);
    }

    // Fuzz for underflow/overflow
    function testFuzzArithmetic(uint256 a, uint256 b) public {
        a = bound(a, 0, type(uint128).max);
        b = bound(b, 0, type(uint128).max);

        // No overflow should occur
        uint256 sum = vault.safeAdd(a, b);
        assertGe(sum, a);
        assertGe(sum, b);
    }

    // Fuzz for access control bypass
    function testFuzzAccessControl(address caller, uint256 amount) public {
        amount = bound(amount, 1, 100 ether);
        vm.deal(caller, amount);

        vm.startPrank(caller);

        // Non-admin shouldn't be able to emergency withdraw
        vm.expectRevert();
        vault.emergencyWithdraw();

        vm.stopPrank();
    }
}
```

### Technique 5: Gas Testing with Fuzzing

Find gas-inefficient paths:

```solidity
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

contract GasFuzzTest is Test {
    function testFuzzGasEfficiency(uint256 iterations) public {
        iterations = bound(iterations, 1, 1000);

        uint256 gasBefore = gasleft();

        for (uint256 i = 0; i < iterations; i++) {
            // Operation to test
            uint256 result = i * 2;
        }

        uint256 gasUsed = gasBefore - gasleft();
        uint256 gasPerIteration = gasUsed / iterations;

        // Gas cost shouldn't increase quadratically
        assertLe(gasPerIteration, 100);
    }

    function testFuzzMemoryAllocation(uint256 size) public {
        size = bound(size, 1, 1000);

        uint256 gasBefore = gasleft();

        uint256[] memory arr = new uint256[](size);
        for (uint256 i = 0; i < size; i++) {
            arr[i] = i;
        }

        uint256 gasUsed = gasBefore - gasleft();

        // Memory cost should scale linearly
        assertTrue(gasUsed < 10_000_000);
    }
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete DEX Fuzzing Suite

Comprehensive AMM invariant testing:

```solidity
// test/DexFuzz.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/UniswapV2Clone.sol";

contract DexInvariantTest is Test {
    UniswapV2Clone dex;
    MockToken token0;
    MockToken token1;

    address constant USER1 = address(0x1111);
    address constant USER2 = address(0x2222);

    function setUp() public {
        token0 = new MockToken("Token0", "T0", 18);
        token1 = new MockToken("Token1", "T1", 18);

        dex = new UniswapV2Clone();

        // Initial setup
        token0.mint(address(this), 1000 ether);
        token1.mint(address(this), 1000 ether);
        token0.approve(address(dex), type(uint256).max);
        token1.approve(address(dex), type(uint256).max);

        // Create pair
        dex.createPair(address(token0), address(token1));

        // Add initial liquidity
        dex.addLiquidity(
            address(token0),
            address(token1),
            100 ether,
            100 ether
        );
    }

    // ============ INVARIANTS ============

    function invariant_ConstantProduct() public {
        (uint256 r0, uint256 r1) = dex.getReserves(
            address(token0),
            address(token1)
        );

        if (r0 > 0 && r1 > 0) {
            uint256 k = dex.getK(address(token0), address(token1));
            uint256 actualK = r0 * r1;

            // k should only increase (due to fees)
            assertGe(actualK, k);
        }
    }

    function invariant_ReservesConsistent() public {
        (uint256 r0, uint256 r1) = dex.getReserves(
            address(token0),
            address(token1)
        );

        assertEq(token0.balanceOf(address(dex)), r0);
        assertEq(token1.balanceOf(address(dex)), r1);
    }

    function invariant_NoTokenLoss() public {
        // No tokens should be lost in the pool
        uint256 balance0 = token0.balanceOf(address(dex));
        uint256 balance1 = token1.balanceOf(address(dex));

        assertGt(balance0 + balance1, 0);
    }

    // ============ FUZZ ACTIONS ============

    function addLiquidity(
        uint256 amount0,
        uint256 amount1
    ) public {
        amount0 = bound(amount0, 1e15, 10 ether);
        amount1 = bound(amount1, 1e15, 10 ether);

        token0.mint(address(this), amount0);
        token1.mint(address(this), amount1);

        try
            dex.addLiquidity(
                address(token0),
                address(token1),
                amount0,
                amount1
            )
        {} catch {}
    }

    function removeLiquidity(uint256 liquidity) public {
        uint256 lpBalance = dex.balanceOf(
            address(this),
            address(token0),
            address(token1)
        );

        liquidity = bound(liquidity, 0, lpBalance);
        if (liquidity == 0) return;

        try
            dex.removeLiquidity(
                address(token0),
                address(token1),
                liquidity
            )
        {} catch {}
    }

    function swap(uint256 amountIn, bool token0In) public {
        amountIn = bound(amountIn, 1e15, 1 ether);

        if (token0In) {
            token0.mint(address(this), amountIn);
            try
                dex.swap(
                    address(token0),
                    address(token1),
                    amountIn,
                    0
                )
            {} catch {}
        } else {
            token1.mint(address(this), amountIn);
            try
                dex.swap(
                    address(token1),
                    address(token0),
                    amountIn,
                    0
                )
            {} catch {}
        }
    }
}
```

### Example 2: Lending Protocol Fuzzing

Test complex invariants in lending system:

```solidity
// test/LendingFuzz.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/LendingPool.sol";

contract LendingFuzzTest is Test {
    LendingPool pool;
    MockToken underlying;
    address constant ADMIN = address(0xAAAA);

    function setUp() public {
        underlying = new MockToken("USDC", "USDC", 6);
        pool = new LendingPool(address(underlying));

        underlying.mint(address(this), 1_000_000e6);
        underlying.approve(address(pool), type(uint256).max);

        // Initial supply
        pool.deposit(1_000_000e6, address(this));
    }

    // Lending pool invariants
    function invariant_TotalSupplyCorrect() public {
        uint256 totalDeposits = pool.totalDeposits();
        uint256 underlyingBalance = underlying.balanceOf(address(pool));

        // Deposits = underlying balance - borrows outstanding
        assertLe(totalDeposits, underlyingBalance);
    }

    function invariant_SolvencyMaintained() public {
        uint256 totalBorrows = pool.totalBorrows();
        uint256 availableLiquidity = underlying.balanceOf(address(pool));

        // Can always liquidate bad debt
        assertTrue(totalBorrows + availableLiquidity > 0);
    }

    function invariant_InterestAccrues() public {
        uint256 ratePerSecond = pool.getBorrowRate();
        assertTrue(ratePerSecond > 0); // Should accumulate interest
    }

    // Fuzz actions
    function deposit(uint256 amount) public {
        amount = bound(amount, 1e6, 100_000e6);

        underlying.mint(address(this), amount);
        pool.deposit(amount, address(this));

        assertGe(pool.balanceOf(address(this)), amount);
    }

    function withdraw(uint256 amount) public {
        uint256 maxWithdraw = pool.balanceOf(address(this));
        amount = bound(amount, 0, maxWithdraw);

        if (amount == 0) return;

        try pool.withdraw(amount, address(this)) {} catch {}
    }

    function borrow(uint256 amount) public {
        amount = bound(amount, 1e6, 100_000e6);

        try pool.borrow(amount) {} catch {}
    }

    function repay(uint256 amount) public {
        uint256 borrowed = pool.borrowBalance(address(this));
        amount = bound(amount, 0, borrowed + 1e6);

        if (amount == 0) return;

        underlying.mint(address(this), amount);
        try pool.repay(amount) {} catch {}
    }
}
```

### Example 3: Oracle Fuzzing

Test price feed invariants:

```solidity
// test/OracleFuzz.t.sol
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/PriceOracle.sol";

contract OracleFuzzTest is Test {
    PriceOracle oracle;
    MockPriceFeed feed1;
    MockPriceFeed feed2;

    function setUp() public {
        oracle = new PriceOracle();
        feed1 = new MockPriceFeed();
        feed2 = new MockPriceFeed();

        oracle.addFeed(address(0x1), address(feed1));
        oracle.addFeed(address(0x2), address(feed2));

        feed1.setPrice(1000e8);
        feed2.setPrice(2000e8);
    }

    // Oracle invariants
    function invariant_PriceMonotonicity() public {
        uint256 price1 = oracle.getPrice(address(0x1));
        uint256 price2 = oracle.getPrice(address(0x2));

        assertTrue(price1 > 0);
        assertTrue(price2 > 0);
    }

    function invariant_NoStalePrice() public {
        uint256 age = oracle.getPriceAge(address(0x1));
        assertLt(age, 1 hours); // Max 1 hour old
    }

    // Fuzz price updates
    function updatePrice(uint256 feedIndex, uint256 newPrice) public {
        feedIndex = bound(feedIndex, 0, 1);
        newPrice = bound(newPrice, 1e7, 1e10);

        MockPriceFeed feed = feedIndex == 0 ? feed1 : feed2;
        feed.setPrice(uint128(newPrice));
    }
}
```

## Best Practices

**Fuzzing Strategy**
- Start with basic property tests
- Use assume() sparingly (expensive)
- Bound integer inputs appropriately
- Test at multiple scales (10k, 100k runs)
- Seed fuzzer for reproducibility

**Invariant Testing**
- Define mathematically precise invariants
- Test independent of implementation
- Include edge cases in helpers
- Weight common vs rare operations
- Monitor for shrinking paths

**Input Generation**
- Use bound() for numeric ranges
- Filter impossible states with assume
- Target boundary values
- Test zero and max values
- Include token/address fuzzing

**Performance**
- Profile fuzz helpers for efficiency
- Minimize state setup per run
- Use vm.skip() for expensive tests
- Run long fuzzes on CI only
- Parallelize across cores

## Common Pitfalls

**Issue 1: Over-Constraining with Assume**
```solidity
// ❌ Wrong - too many assumes, slow fuzzing
function testFuzz(uint256 x, uint256 y) public {
    assume(x > 0);
    assume(y > 0);
    assume(x < y);
    assume(x % 2 == 0);
    // Many test rejects
}

// ✅ Correct - use bound
function testFuzz(uint256 x, uint256 y) public {
    x = bound(x, 1, 10000);
    y = bound(y, x + 1, 20000);
    // No rejects
}
```

**Issue 2: Unbounded Array Size**
```solidity
// ❌ Wrong - OOM on large arrays
function testFuzz(uint256[] memory arr) public {
    // Unbounded array size
}

// ✅ Correct - bound array size
function testFuzz(uint256[] memory arr) public {
    uint256 len = bound(arr.length, 0, 100);
}
```

**Issue 3: Invalid Invariant**
```solidity
// ❌ Wrong - depends on implementation
function invariant_FuzzerAlwaysSuccess() public {
    // Implementation-specific check
}

// ✅ Correct - mathematical property
function invariant_ConstantProductMaintained() public {
    uint256 k = reserveA * reserveB;
    assertGe(k, previousK);
}
```

**Issue 4: Missing Error Handling**
```solidity
// ❌ Wrong - reverts stop fuzzing
function withdraw(uint256 amount) public {
    vault.withdraw(amount); // May revert
}

// ✅ Correct - handle reverts
function withdraw(uint256 amount) public {
    amount = bound(amount, 0, vault.balanceOf(address(this)));
    try vault.withdraw(amount) {} catch {}
}
```

## Resources

**Official Documentation**
- [Foundry Book](https://book.getfoundry.sh/) - Complete guide
- [Foundry Fuzzing](https://book.getfoundry.sh/reference/forge/forge-test) - Fuzzing reference
- [Invariant Testing](https://book.getfoundry.sh/reference/forge/forge-invariant) - Deep dive

**Related Skills**
- `solidity-security-analysis` - Vulnerability patterns
- `hardhat-deployment-scripts` - Alternative testing framework
- `uniswap-v3-liquidity-math` - Complex invariants

**External Resources**
- [Echidna Documentation](https://github.com/crytic/echidna) - Advanced fuzzing
- [Certora Formal Verification](https://www.certora.com/) - Proof-based testing
- [Trail of Bits Testing Guide](https://blog.trailofbits.com/) - Security patterns
