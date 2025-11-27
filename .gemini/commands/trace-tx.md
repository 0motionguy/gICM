# Command: /trace-tx

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Generate detailed execution traces for smart contract transactions with call graphs and gas analysis

## Description

The `/trace-tx` command produces comprehensive execution traces for EVM transactions, showing every operation, state change, function call, and jump within the execution environment. It generates call graphs, gas breakdowns per operation, identifies bottlenecks, and provides analysis for debugging failed transactions and optimizing smart contracts.

This command is essential for understanding complex transaction flows, debugging transaction failures, identifying gas-inefficient operations, and analyzing contract behavior at the bytecode level.

## Usage

```bash
/trace-tx [tx-hash] [options]
```

## Arguments

- `tx-hash` - Transaction hash to trace (required)
- `--chain` - Network: `mainnet`, `sepolia`, `arbitrum`, etc. (required)
- `--depth` - Trace depth: `shallow` (top call), `deep` (all calls), `full` (all ops) (default: deep)
- `--gas-breakdown` - Show per-operation gas costs
- `--storage-ops` - Include storage reads/writes
- `--memory-ops` - Include memory operations
- `--call-graph` - Generate visual call graph
- `--focus` - Focus on specific function or address
- `--format` - Output format: `text`, `json`, `svg` (call graph)
- `--timeline` - Show execution timeline with gas per operation
- `--errors` - Show error details for failed transactions
- `--comparisons` - Compare with similar successful transactions

## Examples

### Example 1: Deep trace of Uniswap swap
```bash
/trace-tx 0x1234...abcd --chain mainnet --depth deep --gas-breakdown
```

Output:
```
TRANSACTION EXECUTION TRACE
===========================

TX: 0x1234...abcd
Status: SUCCESS (0x1)
Block: 18,400,000
Gas used: 187,432 / 200,000 (93.7%)

CALL STACK TRACE:
─────────────────

[0] CALL 0xRouter (SwapRouter.sol:L42)
    FUNCTION: swapExactETHForTokens(uint256 amountOutMin, ...)
    From: 0xUser...1234
    Value: 5.0 ETH
    Gas allocated: 200,000

    └─ [1] CALL 0xPool (UniswapV3Pool.sol:L156)
        FUNCTION: swap(address recipient, bool zeroForOne, int256 amountSpecified, ...)
        From: 0xRouter (delegated)
        Value: 0 ETH
        Gas allocated: 179,823
        Status: SUCCESS

        └─ [2] CALL 0xToken (ERC20.sol:L98)
            FUNCTION: transfer(address to, uint256 amount)
            From: 0xPool
            Value: 0 ETH
            Amount: 18,234.42 USDC
            Gas allocated: 165,234
            Status: SUCCESS

            ├─ SLOAD [0x0] (balanceOf mapping)
            │  Gas: 2,100
            │  Value: 150,000.00 USDC
            │
            └─ SSTORE [0x0] (balanceOf mapping)
               Gas: 2,900
               Old: 150,000.00 USDC
               New: 131,765.58 USDC

        Execution continued in Pool contract...

        └─ [3] EVENT Swap
            Topics[0]: 0x1234...swap_signature
            Topics[1]: 0xRouter (indexed sender)
            Topics[2]: 0xPool (indexed pool)
            Data: amount0In=5.0, amount1Out=18,234.42
            Gas: 350

    ├─ [4] CALL 0xToken2 (USDC Token)
        FUNCTION: transfer(address to, uint256 amount)
        From: 0xRouter
        Value: 0 ETH
        Amount: 18,234.42 USDC
        Gas allocated: 12,400
        Status: SUCCESS

    └─ [5] RETURN
        Output: 18,234.42 (bytes32)
        Gas remaining: 12,568


GAS BREAKDOWN BY OPERATION:
───────────────────────────

[CALL] swapExactETHForTokens
  ├─ Setup/validation: 1,200 gas
  ├─ SLOAD (read state): 4,200 gas
  ├─ Pool.swap() call: 142,000 gas
  ├─ Transfer tokens: 45,000 gas
  ├─ Events: 1,050 gas
  ├─ Cleanup: 2,982 gas
  └─ SUBTOTAL: 196,432 gas

[INTERNAL] Swap execution
  ├─ Math calculations: 850 gas
  ├─ Reserve updates: 20,000 gas
  ├─ Tick updates: 8,500 gas
  ├─ Price oracle update: 3,200 gas
  ├─ Storage writes: 42,000 gas
  └─ SUBTOTAL: 74,550 gas

[ERC20] Token transfer
  ├─ Balance check: 2,100 gas
  ├─ Balance update: 2,900 gas
  ├─ Approval check: 100 gas
  ├─ Event: 375 gas
  └─ SUBTOTAL: 5,475 gas

TOTAL EXECUTED: 187,432 gas


OPERATION TIMELINE:
───────────────────

0μs   (0 gas)     ENTRY swapExactETHForTokens
5μs   (1,200 gas) Validate parameters
12μs  (1,200 gas) SLOAD pool factory
45μs  (4,200 gas) SLOAD reserves
87μs  (2,100 gas) CALL UniswapV3Pool.swap
156μs (58,200 gas) SSTORE reserve updates
234μs (3,200 gas) SSTORE price oracle
287μs (5,200 gas) Calculate output amounts
345μs (2,100 gas) ERC20.transfer CALL
389μs (3,000 gas) Update token balances
412μs (1,050 gas) Emit events
467μs (1,232 gas) Return to caller
─────
Total execution time: 467 microseconds
```

### Example 2: Failed transaction analysis
```bash
/trace-tx 0x5678...efgh --chain mainnet --depth full --errors
```

Output:
```
FAILED TRANSACTION TRACE
========================

TX: 0x5678...efgh
Status: REVERTED (0x0)
Block: 18,400,050
Gas used: 200,000 / 200,000 (100% - out of gas)

FAILURE POINT:
──────────────

Call Stack at failure:
  [0] SwapRouter.swapExactTokensForTokens(...)
  [1] UniswapV3Pool.swap(...)
  [2] ERC20.approve(...)
  [3] REVERT at address 0xToken...abcd, offset 0x1234

Error Type: INSUFFICIENT_ALLOWANCE
Error Message: "ERC20: insufficient allowance"

Root Cause Analysis:
────────────────────
The transaction failed because:

1. User didn't approve enough tokens to SwapRouter
   Expected: 100 WETH
   Current approval: 50 WETH
   Shortfall: 50 WETH

2. Execution trace:
   Step 1: SwapRouter calls Pool.swap(100 WETH)
           Gas: 45,000
   Step 2: Pool calls Token.transferFrom(user, pool, 100)
           Gas: 67,000
   Step 3: ERC20.transferFrom checks allowance
           Gas: 2,100 (SLOAD)
   Step 4: allowance[user][spender] = 50
           REVERT: insufficient allowance
           Gas used: 2,100
           Gas remaining: 0 (OUT OF GAS)

Why out of gas?
  → REVERT happens after gas spent on failed attempt
  → No refund for reverted SSTORE/SLOAD
  → Remaining gas consumed by revert operation

FIXES AVAILABLE:
────────────────
Option 1: Increase approval
  Before: token.approve(router, 50)
  After:  token.approve(router, 100)

Option 2: Use permit() if available
  → Approve and transfer in single transaction
  → Same gas cost, cleaner UX

Option 3: Use safe approval function
  → First approve(0), then approve(amount)
  → Prevents approval reuse attacks
```

### Example 3: Call graph visualization
```bash
/trace-tx 0x9abc...7890 --chain arbitrum --call-graph --format svg
```

Output generates SVG:

```
Transaction Call Graph
======================

user (0xUser...1234)
    │
    └─► SwapRouter (0xRouter...5678)  [187,432 gas]
        │
        ├─► UniswapV3Pool (0xPool...abcd)  [142,000 gas]
        │   │
        │   ├─► ERC20.transfer (0xWETH...1111)  [45,000 gas]
        │   │   └─► emit Transfer event  [350 gas]
        │   │
        │   ├─► SSTORE (reserves)  [20,000 gas]
        │   └─► emit Swap event  [875 gas]
        │
        ├─► ERC20.transfer (0xUSDC...2222)  [12,500 gas]
        │   └─► emit Transfer event  [350 gas]
        │
        └─► Return success  [1,232 gas]

Total gas: 187,432
Depth: 3 levels
Functions called: 5
Events emitted: 3
```

### Example 4: Memory and storage operations trace
```bash
/trace-tx 0xdef0...1234 --chain mainnet --depth full \
  --storage-ops --memory-ops --timeline
```

Output:
```
DETAILED OPERATIONS TRACE
==========================

TX: 0xdef0...1234

EXECUTION TIMELINE WITH OPERATIONS:
────────────────────────────────────

Block | Operation | Cost | Running Total | Details
──────┼───────────┼──────┼───────────────┼─────────────────────────
0     | ENTRY     | 21k  | 21,000        | Transaction base cost
1     | PUSH1     | 3    | 21,003        | Load constant
2     | MSTORE    | 3    | 21,006        | Store in memory[0]
3     | SLOAD     | 2.1k | 23,106        | Read slot 0x0 (owner)
4     | EQ        | 3    | 23,109        | Compare with msg.sender
5     | JUMPI     | 10   | 23,119        | Conditional jump
6     | SLOAD     | 100  | 23,219        | Read slot 0x4 (warm)
7     | ADD       | 3    | 23,222        | Add amounts
8     | SSTORE    | 2.9k | 26,122        | Write to slot 0x4
9     | MLOAD     | 3    | 26,125        | Load from memory
10    | CALL      | 9.7k | 35,825        | CALL to token
11    | PUSH1     | 3    | 35,828        | Result check
12    | JUMPI     | 10   | 35,838        | Success check
13    | REVERT    | 0    | 35,838        | Revert if failed
14    | RETURN    | 0    | 35,838        | Return success

STORAGE OPERATIONS:
───────────────────
READ (SLOAD):
  Slot 0x0: value=0x123...456 (owner address) [2,100 gas]
  Slot 0x4: value=0x000...100 (balance) [100 gas - warm]
  Slot 0x8: value=0x999...999 (total supply) [2,100 gas]

WRITE (SSTORE):
  Slot 0x4: 0x000...100 → 0x000...150 (balance++) [2,900 gas]
  Slot 0xc: 0x000...000 → 0x123...456 (approval) [20,000 gas - cold]

MEMORY OPERATIONS:
──────────────────
MSTORE:
  [0x00]: 0x000...000 → 0x123...456 [3 gas]
  [0x20]: 0x000...000 → 0x888...888 [3 gas]

MLOAD:
  [0x00]: 0x123...456 [3 gas]
  [0x40]: 0x000...000 [3 gas]

Memory expansion:
  Words allocated: 2 (to 0x40)
  Cost: 0 (minimal)
```

## Best Practices

- **Trace failed transactions**: Quickly identify failure points
- **Optimize hot paths**: Find expensive operations in execution trace
- **Verify contract logic**: Confirm expected execution flow
- **Gas profiling**: Identify optimization opportunities
- **Debugging issues**: Understand contract behavior deeply
- **Compare transactions**: Trace similar txs to find differences
- **Analyze storage patterns**: Understand SLOAD/SSTORE behavior
- **Monitor external calls**: Track delegatecalls and value transfers

## Workflow

The command performs the following steps:

1. **Fetch Transaction**
   - Query transaction receipt
   - Get input data and logs
   - Retrieve status and gas used

2. **Execution Simulation**
   - Replay transaction on blockchain state
   - Record all operations
   - Track call stack changes
   - Monitor state changes

3. **Data Collection**
   - Capture function calls with parameters
   - Record storage operations
   - Track memory access
   - Monitor gas consumption

4. **Trace Analysis**
   - Build call graph
   - Calculate gas per operation
   - Identify failed calls
   - Analyze patterns

5. **Report Generation**
   - Format trace output
   - Create timeline
   - Generate visualizations
   - Produce analysis

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "evm": {
    "trace": {
      "maxDepth": 10,
      "includeMemory": false,
      "includeStorage": true,
      "includeGasBreakdown": true,
      "visualizations": true
    }
  }
}
```

## Trace Output Levels

- **Shallow**: Top-level call only
- **Deep**: All external calls (default)
- **Full**: All opcodes and operations

## Operation Cost Reference

```
MEMORY:
  MLOAD/MSTORE: 3 gas
  Memory expansion: per word

STORAGE:
  SLOAD cold: 2,100 gas
  SLOAD warm: 100 gas
  SSTORE cold: 20,000 gas
  SSTORE warm: 2,900 gas

ARITHMETIC:
  ADD/SUB/DIV: 3 gas
  MUL: 5 gas
  SHA3: 30 gas

CALLS:
  CALL cold: 9,700 gas
  CALL warm: 700 gas
  STATICCALL: 700 gas
```

## Related Commands

- `/decode-tx` - Decode transaction calldata
- `/estimate-gas` - Estimate execution costs
- `/snapshot-state` - Capture state for analysis
- `/storage-layout` - Analyze storage structure

## Common Issues in Traces

```
OUT_OF_GAS:
  → Execution exceeded gas limit
  → Review timeline for expensive operations
  → Consider gas optimization

REVERTED_CALL:
  → Child call failed
  → Check error message
  → Verify preconditions

INSUFFICIENT_BALANCE:
  → Account lacked funds
  → Check balance in snapshot
  → Verify amount calculation

STATE_COLLISION:
  → Unexpected storage change
  → Compare with similar transactions
  → Check for storage layout issues
```

## Notes

- **Deterministic**: Same transaction always produces same trace
- **Accurate gas**: Gas counts reflect actual execution
- **State-dependent**: Trace depends on pre-transaction state
- **Timing data**: Microsecond precision for operation timing
- **Replay accuracy**: Traces are precise replays of execution
- **Privacy**: Traces don't expose private data
