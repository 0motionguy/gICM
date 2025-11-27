# Command: /estimate-gas

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Estimate transaction gas costs with optimization suggestions and cost breakdowns

## Description

The `/estimate-gas` command provides detailed gas estimations for EVM transactions with per-operation analysis, optimization recommendations, and cost projections across different gas price scenarios. It analyzes bytecode, identifies expensive operations, suggests improvements, and helps developers optimize smart contract interactions for minimal gas consumption.

This command is essential for budget planning, transaction cost analysis, identifying gas-expensive operations, and implementing gas optimization strategies in development and production.

## Usage

```bash
/estimate-gas [function-call] [options]
```

## Arguments

- `function-call` - Function to estimate: `contract.function(args)` or calldata hex
- `--contract` - Contract address (for existing contract state)
- `--abi` - Path to contract ABI
- `--chain` - Network: `mainnet`, `sepolia`, `arbitrum`, `optimism` (required)
- `--from` - Sender address (for view functions with balances)
- `--value` - Transaction value in ETH (for payable functions)
- `--state` - Block state: `latest`, `pending`, or block number
- `--gwei` - Gas price in gwei for cost calculation (default: current)
- `--optimize` - Show gas optimization opportunities
- `--breakdown` - Detailed per-operation breakdown
- `--compare` - Compare with alternative implementations
- `--batch` - Estimate multiple functions together

## Examples

### Example 1: Simple transfer estimation
```bash
/estimate-gas "transfer(0xabc..., 100)" --chain mainnet --gwei 25
```

Output:
```
GAS ESTIMATION REPORT
====================

Function: ERC20.transfer(address to, uint256 amount)
Parameters:
  to: 0xabc...
  amount: 100

ESTIMATION RESULTS:
──────────────────
Safe Estimate: 65,234 gas
Optimistic: 65,000 gas
Average: 65,200 gas
Range: 64,800 - 66,500 gas

COST BREAKDOWN (at 25 gwei):
────────────────────────────
Base gas: 21,000 gas × 25 gwei = 0.525 ETH ($875)
Function execution: 44,234 gas × 25 gwei = 1.106 ETH ($1,842)
Total: 65,234 gas × 25 gwei = 1.631 ETH ($2,717)

GAS PRICE SCENARIOS:
────────────────────
Low (10 gwei):      0.652 ETH  ($1,087)
Standard (25 gwei): 1.631 ETH  ($2,717)
Fast (50 gwei):     3.262 ETH  ($5,433)
Urgent (100 gwei):  6.523 ETH  ($10,866)

CONFIDENCE: HIGH
Estimate based on live contract state and similar transactions.
```

### Example 2: Complex Uniswap swap with optimization
```bash
/estimate-gas "swapExactTokensForTokens(100 WETH, 90000 USDC, [WETH->USDC], user, deadline)" \
  --contract 0xRouter...5678 \
  --chain mainnet \
  --optimize \
  --breakdown
```

Output:
```
GAS ESTIMATION: UNISWAP V3 SWAP
================================

Function: SwapRouter.swapExactTokensForTokens(...)

OPERATION BREAKDOWN:
────────────────────
21,000 gas - Transaction base cost
2,100 gas  - SLOAD (read swap fee)
20,000 gas - SSTORE (update router state)
2,900 gas  - Transfer WETH from user
    100 gas  - Check allowance
    1,900 gas - Update balance from
    900 gas  - Update balance to
5,200 gas  - Call UniswapPool.swap()
    2,200 gas  - Calculate output amount
    1,500 gas  - Update pool reserves
    1,500 gas  - Transfer USDC to user
8,450 gas  - Event logging and misc

TOTAL: 59,650 gas

OPTIMIZATION OPPORTUNITIES:
──────────────────────────

1. BATCH SWAPS (Save 12,000 gas)
   Current: Single transfer + swap
   Suggested: Use multicall for 2+ swaps
   Savings: 12,000 gas / 18%

2. APPROVE OPTIMIZATION (Save 800 gas)
   Current: approve() call required
   Suggested: Pre-approve larger amount
   Savings: 800 gas / 1.3%

3. PATH OPTIMIZATION (Save 2,200 gas)
   Current: WETH → USDC (direct)
   Suggested: WETH → DAI → USDC (lower fees)
   Note: Cheaper route available
   Savings: 2,200 gas / 3.7%

OPTIMIZATION POTENTIAL: 15,000 gas (25.2%)
Optimized cost: 44,650 gas

RECOMMENDATIONS:
────────────────
✓ Use cheaper pool fee tier if available
✓ Batch multiple swaps with multicall
✓ Check if DAI route is cheaper overall
✓ Consider split swaps for better slippage
```

### Example 3: Batch transaction estimation
```bash
/estimate-gas \
  "approve(router, 100)" \
  "swap(...)" \
  "add_liquidity(...)" \
  --chain arbitrum \
  --batch
```

Output:
```
BATCH GAS ESTIMATION
====================

Transaction 1: approve(router, 100)
  Cost: 22,100 gas
  Type: State modification (SET)

Transaction 2: swap(...)
  Cost: 89,234 gas
  Type: Complex interaction

Transaction 3: add_liquidity(...)
  Cost: 156,789 gas
  Type: State modification (CREATE)

SEQUENTIAL (3 separate txs):
────────────────────────────
Total: 268,123 gas
Total cost (25 gwei): 6.703 ETH

BATCHED (multicall):
────────────────────
Total: 245,800 gas (base fees shared)
Savings: 22,323 gas (8.3% reduction)
Batched cost (25 gwei): 6.145 ETH (savings: $122)

UNBATCHED (Flashbots):
──────────────────────
Total: 268,123 gas (no MEV protection)
Cheaper but higher risk

RECOMMENDATION: Use multicall for batching
```

### Example 4: Storage-heavy contract with state analysis
```bash
/estimate-gas "updateMultiple(state_changes)" \
  --contract 0xComplex...1234 \
  --state latest \
  --breakdown \
  --gwei 30
```

Output:
```
STORAGE-HEAVY OPERATION ANALYSIS
==================================

Function: updateMultiple(...)
Target: 0xComplex...1234

STORAGE ANALYSIS:
─────────────────
Cold SLOAD: 2,100 gas each
  - Slot 0 (owner): 2,100 gas (first read)
  - Slot 5 (totalSupply): 2,100 gas (first read)

Warm SLOAD: 100 gas each
  - Slot 0 (owner): 100 gas (subsequent read)
  - Slot 5 (totalSupply): 100 gas (subsequent read)

Cold SSTORE: 20,000 gas each
  - Slot 10 (newValue): 20,000 gas (first write)
  - Slot 11 (timestamp): 20,000 gas (first write)

Warm SSTORE: 2,900 gas each
  - Slot 10 (update): 2,900 gas (subsequent write)

TOTAL STORAGE COST: 49,400 gas (63%)

GAS BREAKDOWN:
──────────────
Base:           21,000 gas (27%)
Storage reads:  4,200 gas (5%)
Storage writes: 42,200 gas (54%)
Misc:           7,600 gas (10%)
─────────────────────────
TOTAL:          75,000 gas

COST AT 30 GWEI: 2.25 ETH ($3,750)

OPTIMIZATION TIPS:
──────────────────
1. Batch updates to hit warm slots
   → Warm slots cost 95% less
2. Pack variables (uint128 + uint128)
   → Save one storage slot
3. Use mappings instead of arrays
   → Avoid iteration costs
4. Minimize cold reads
   → Cache frequently accessed values

ESTIMATED SAVINGS: 15,000 gas (20%)
```

## Best Practices

- **Always estimate before deployment**: Save money and prevent reverts
- **Consider gas price volatility**: Plan for multiple price scenarios
- **Use optimization suggestions**: Implement recommended improvements
- **Test on testnet**: Verify estimates with real execution
- **Monitor actual costs**: Compare estimates with real transactions
- **Batch operations**: Combine multiple calls when possible
- **Account for MEV**: Add buffer for market conditions
- **Plan reserves**: Always have 10-20% gas buffer

## Workflow

The command performs the following steps:

1. **Function Analysis**
   - Parse function signature and parameters
   - Load contract ABI and bytecode
   - Identify operation types

2. **Gas Calculation**
   - Base transaction cost (21,000)
   - Operation-specific costs
   - Storage operation analysis
   - Call depth evaluation

3. **State Simulation**
   - Simulate against current state
   - Account for existing balances
   - Consider warm/cold slots
   - Evaluate storage changes

4. **Cost Projection**
   - Calculate costs at multiple gas prices
   - Estimate transaction fee range
   - Show cost in ETH and USD

5. **Optimization Analysis**
   - Identify expensive operations
   - Suggest improvements
   - Calculate potential savings
   - Recommend alternatives

6. **Report Generation**
   - Format detailed breakdown
   - Show comparisons
   - Include recommendations

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "evm": {
    "gas": {
      "showBreakdown": true,
      "includeOptimizations": true,
      "scenarios": [10, 25, 50, 100],
      "warningThreshold": 200000,
      "currencyConversion": "USD"
    }
  }
}
```

## Gas Cost Reference

Operation costs in EVM:

```
Base operations:
  Transaction base: 21,000 gas
  Contract creation: 53,000 gas

Storage:
  Cold SLOAD: 2,100 gas
  Warm SLOAD: 100 gas
  Cold SSTORE: 20,000 gas
  Warm SSTORE: 2,900 gas

Arithmetic:
  ADD/SUB: 3 gas
  MUL/DIV: 5 gas

Calls:
  CALL: 700 gas (warm) / 9,700 gas (cold)
  STATICCALL: 700 gas (warm) / 9,700 gas (cold)
  DELEGATECALL: 700 gas (warm) / 9,700 gas (cold)

Memory:
  Per word: 3 gas
  Expansion: scales with size

Logging:
  LOG0: 375 gas + 375 per topic
  LOG1: 375 + 375 + (32 * topic_size)
```

## Gas Optimization Techniques

```solidity
// Use storage packing (saves SSTORE costs)
struct Data {
    uint128 a;  // 16 bytes
    uint128 b;  // 16 bytes (same slot)
}

// Cache hot variables
uint256 cached = value;
for (uint i; i < 100; i++) {
    _update(cached);
}

// Batch updates
function batchUpdate(uint[] calldata ids, uint[] calldata values) external {
    for (uint i; i < ids.length; i++) {
        data[ids[i]] = values[i];  // Warm slots after first write
    }
}
```

## Related Commands

- `/trace-tx` - Trace actual execution for comparison
- `/decode-tx` - Decode transactions to understand gas usage
- `/snapshot-state` - Capture state before/after for analysis
- `/storage-layout` - Understand storage optimization
- `/optimize-contract` - Get detailed optimization recommendations

## Common Gas Traps

```
1. REPEATED COLD READS
   Problem: Multiple SLOAD of same slot
   Solution: Cache in memory

2. UNBOUNDED LOOPS
   Problem: Loop iterations depend on array size
   Solution: Use batching or pagination

3. STORAGE IN LOOPS
   Problem: Writing to storage in loop
   Solution: Accumulate in memory, write once

4. UNNECESSARY TRANSFERS
   Problem: Multiple token transfers
   Solution: Batch or accumulate amounts

5. REDUNDANT APPROVALS
   Problem: approve() called repeatedly
   Solution: Set once to max value
```

## Notes

- **Estimates are not guarantees**: Actual costs vary with network conditions
- **State dependent**: Estimates vary with contract state
- **EIP-1559 enabled**: Costs include base fee + priority fee
- **L2 specific**: Some chains have different gas mechanics
- **MEV considerations**: Competitive transactions may cost more
- **Slippage factors**: Account for price impact on swaps
