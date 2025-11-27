# Command: /simulate-bundle

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Simulate EVM transaction bundles (Flashbots, MEV-Blockers) with execution analysis and state prediction

## Description

The `/simulate-bundle` command simulates executing multiple transactions as an atomic bundle, providing execution outcomes, state changes, MEV analysis, and gas optimization. It enables testing of MEV-protected transactions, flashbots bundles, atomic swaps, and batch operations before on-chain submission, with detailed simulation reports and failure analysis.

This command is essential for validating bundle execution, testing multi-transaction workflows, analyzing MEV impact, and ensuring atomic composability before mainnet execution.

## Usage

```bash
/simulate-bundle [bundle-file] [options]
```

## Arguments

- `bundle-file` - JSON file with transactions (required)
- `--chain` - Network: `mainnet`, `sepolia`, `arbitrum` (required)
- `--block` - Block number for simulation (default: latest)
- `--flashbots` - Simulate as Flashbots bundle
- `--exact-order` - Enforce exact transaction ordering (no reordering)
- `--include-refunds` - Include refund calculations
- `--trace-full` - Show detailed execution trace
- `--compare` - Compare with sequential execution
- `--mev-analysis` - Analyze MEV extraction and slippage
- `--output` - Save simulation results
- `--dry-run` - Simulate without state changes (default: true)

## Examples

### Example 1: Multi-step atomic swap bundle
```bash
/simulate-bundle swap-bundle.json --chain mainnet --flashbots --mev-analysis
```

Input (swap-bundle.json):
```json
{
  "transactions": [
    {
      "to": "0xToken...1111",
      "data": "0xa9059cbb...",
      "value": "0",
      "from": "0xUser...abcd"
    },
    {
      "to": "0xRouter...2222",
      "data": "0x414bf389...",
      "value": "0",
      "from": "0xUser...abcd"
    },
    {
      "to": "0xToken...3333",
      "data": "0x70a08231...",
      "value": "0",
      "from": "0xUser...abcd"
    }
  ],
  "blockNumber": "latest",
  "timestamp": 1699564800
}
```

Output:
```
BUNDLE SIMULATION REPORT
========================

Configuration:
──────────────
Bundle type: Flashbots
Block: 18,456,789
Transactions: 3
Total gas: 187,432

EXECUTION FLOW:
────────────────

[1] ERC20 Approval
────────────────
To: 0xToken...1111
Function: approve(spender, amount)
Spender: 0xRouter...2222
Amount: 100 WETH

State before:
  allowance[user][router]: 0

Execution:
  ✓ Success
  Gas: 22,100
  Events: Approval(user, router, 100 WETH)

State after:
  allowance[user][router]: 100 WETH


[2] Uniswap Swap
────────────────
To: 0xRouter...2222
Function: swapExactTokensForTokens(...)
Parameters:
  amountIn: 100 WETH
  amountOutMin: 90,000 USDC
  path: [WETH, USDC]
  recipient: user
  deadline: 1699564800

State before:
  balanceOf[user][WETH]: 150 WETH
  balanceOf[user][USDC]: 0 USDC

Execution:
  ✓ Success
  Gas: 142,500
  Events:
    - Approval(user, router, 100)
    - Transfer(user, pool, 100 WETH)
    - Swap(...) → 98,250 USDC
    - Transfer(pool, user, 98,250 USDC)

State after:
  balanceOf[user][WETH]: 50 WETH (spent 100)
  balanceOf[user][USDC]: 98,250 USDC (received)

Price paid:
  1 WETH = 982.50 USDC


[3] Balance Check
────────────────
To: 0xToken...3333
Function: balanceOf(account)
Account: user

Execution:
  ✓ Success (static call)
  Gas: 0 (view function)
  Returns: 98,250 USDC

State changes: None


BUNDLE EXECUTION SUMMARY:
──────────────────────────

Overall status: ✓ ATOMIC SUCCESS
All 3 transactions succeeded as atomic bundle.

Gas usage:
  TX1: 22,100 gas (11.8%)
  TX2: 142,500 gas (76.0%)
  TX3: 0 gas (view, non-counted)
  ─────────────
  Total: 164,600 gas (counted for bundle)

Total cost at 35 gwei: 0.00576 ETH ($9.60)

State changes:
  ✓ WETH: user balance -100
  ✓ USDC: user balance +98,250
  ✓ Router allowance set
  ✓ All state transitions valid

MEV ANALYSIS:
──────────────

Sandwich vulnerability: ✓ PROTECTED
  - Bundle ordered before public mempool
  - No prior swaps observable
  - No subsequent swaps from frontrunners

Slippage analysis:
  Expected output: 90,000 USDC minimum
  Actual output: 98,250 USDC
  Slippage: 0% (better than expected)
  Protection: Adequate

MEV extracted: $0.00
  - No sandwich attacks observed
  - No flashloan attacks possible
  - Bundle atomicity preserved

Price impact: 1.7%
  - Market conditions: Good
  - Liquidity depth: 2.3M USDC
  - Pool fee: 0.3%

COMPARISON: SEQUENTIAL VS BUNDLE
──────────────────────────────────

Sequential (3 separate transactions):
  Block inclusion uncertainty: High
  MEV exposure window: ~15 seconds
  Expected slippage: -2.1%
  Expected loss: ~$20.50

Atomic bundle:
  Block inclusion certainty: High
  MEV exposure window: 0 seconds
  Achieved slippage: 0%
  Actual loss: $0.00

Savings: $20.50 (100% improvement)

RECOMMENDATION:
────────────────
✓ Submit as Flashbots bundle
✓ Set block target to current + 1
✓ No additional safeguards needed
✓ Expected execution: Next block
```

### Example 2: Liquidation bundle with MEV optimization
```bash
/simulate-bundle liquidation.json --chain mainnet --trace-full --compare
```

Input (liquidation.json):
```json
{
  "transactions": [
    {
      "name": "Flash Loan",
      "to": "0xAave...1111",
      "data": "0x...",
      "from": "0xLiquidator...abcd"
    },
    {
      "name": "Liquidate",
      "to": "0xCompound...2222",
      "data": "0x...",
      "from": "0xLiquidator...abcd"
    },
    {
      "name": "Repay Flash",
      "to": "0xAave...1111",
      "data": "0x...",
      "from": "0xLiquidator...abcd"
    }
  ]
}
```

Output:
```
LIQUIDATION BUNDLE SIMULATION
=============================

Bundle execution path:
  [1] Request 1M DAI flashloan from Aave
      ↓ executeOperation() callback
  [2] Call Compound liquidate() with flashloaned DAI
      ↓ Seize collateral + earn spread
  [3] Repay 1M DAI + 9 bps fee to Aave
      ↓ Complete bundle

DETAILED EXECUTION TRACE:
───────────────────────────

[Step 1] Aave Flash Loan Request
TX gas: 45,000
  SLOAD pool reserves: 2,100 gas
  Validate amount: 1,500 gas
  Call executeOperation: 15,000 gas
  Event emission: 625 gas

  → Callback to liquidator contract

[Step 2] Liquidator executeOperation()
TX gas: 234,500
  [Step 2a] Compound liquidate()
  Gas: 189,000
    SLOAD user account: 2,100 gas
    SLOAD collateral reserves: 2,100 gas
    Validate bad debt: 3,200 gas
    Seize collateral: 50,000 gas (cold storage write)
    Update reserves: 12,500 gas
    Emit event: 625 gas

  [Step 2b] Calculate profit
  Gas: 23,000
    Math operations: 2,500 gas
    Verify > repay amount: 500 gas
    Store proof: 20,000 gas (cold write)

  [Step 2c] Return funds for repay
  Gas: 22,500
    Check balance: 2,100 gas
    Transfer approval: 20,400 gas

[Step 3] Repay Flash Loan
TX gas: 28,932
  SLOAD debt amount: 2,100 gas
  Check repay amount: 3,200 gas
  Update pool reserves: 2,900 gas (warm write)
  Transfer DAI: 12,500 gas (cold)
  Event emission: 3,132 gas

TOTAL BUNDLE GAS: 308,432 gas
Cost at 45 gwei: 0.0139 ETH ($23.15)

PROFIT ANALYSIS:
───────────────

Liquidated debt: 1,000,000 USDC
Seized collateral: 1,250,000 DAI (25% premium)
Flash loan cost: 9,000 DAI (9 bps fee)
Net profit: 241,000 DAI
  Equivalent: $241,000 at current prices

ROI: 2,410% on gas costs
Execution: Profitable by $240,977

RISKS IDENTIFIED:
─────────────────

✓ No sandwich vulnerability
  - Atomic execution
  - No other liquidators can frontrun

✗ Oracle risk
  - Assumes price stable during execution
  - Flash loan doesn't protect price risk
  - But: < 1 second execution time

✓ Collateral seizure validated
  - Check for seize amount validity
  - Verify no overflow/underflow
  - All state transitions valid

SEQUENTIAL COMPARISON:
──────────────────────

If executed as 3 separate transactions:
  TX1 gas: 45,000
  TX2 gas: 245,000 (higher due to cold reads)
  TX3 gas: 42,500
  Total: 332,500 gas
  Cost: 0.0150 ETH ($25.00)

Loss vs bundle: 2.7% more expensive
Risk: Liquidation could fail between steps

Atomic bundle advantage:
  - All-or-nothing execution
  - 24,068 gas saved
  - Guaranteed profit or complete failure
```

### Example 3: DEX arbitrage bundle
```bash
/simulate-bundle arbitrage.json --chain mainnet --exact-order --output arb-results.json
```

Output:
```
DEX ARBITRAGE BUNDLE SIMULATION
================================

Scenario: Price difference between Uniswap V2 and V3

Setup:
  USDC price on UniV2: 1 WETH = 1,000 USDC
  USDC price on UniV3: 1 WETH = 1,005 USDC
  Arbitrage opportunity: 0.5% spread

BUNDLE EXECUTION:
──────────────────

[1] Buy on cheaper venue (UniV2)
    Input: 10 ETH
    Expected output: 10,000 USDC
    Actual output: 9,950 USDC (0.5% slippage)
    Gas: 123,000

[2] Sell on expensive venue (UniV3)
    Input: 9,950 USDC
    Expected output: 9.95 ETH
    Actual output: 9.88 ETH (0.7% slippage)
    Gas: 145,000

NET RESULT:
────────────
Input: 10 ETH
Output: 9.88 ETH
Net: -0.12 ETH (1.2% loss)
Gas cost: 0.005 ETH equivalent

Total loss: 0.125 ETH ($208)

Conclusion: ✗ UNPROFITABLE
The spread doesn't cover slippage and gas costs.
Do NOT execute this bundle.
```

### Example 4: Multi-protocol interaction
```bash
/simulate-bundle protocol-interaction.json --chain arbitrum --include-refunds
```

Output:
```
MULTI-PROTOCOL BUNDLE SIMULATION
=================================

Sequence:
  1. Approve Curve for USDC
  2. Swap USDC→USDT on Curve
  3. Approve Aave for USDT
  4. Deposit USDT to Aave
  5. Approve Uniswap for aUSDT
  6. Swap aUSDT→USDC on Uniswap
  7. Repay any remainders

EXECUTION RESULTS:
───────────────────

✓ All 7 transactions succeeded
✓ Atomic execution maintained
✓ All approvals valid
✓ All state changes persisted

Gas summary:
  TX1 (Approve): 22,000
  TX2 (Swap): 98,500
  TX3 (Approve): 22,000
  TX4 (Deposit): 112,500
  TX5 (Approve): 22,000
  TX6 (Swap): 145,000
  TX7 (Cleanup): 12,000
  ─────────────
  Total: 434,000 gas

Refund analysis:
  USDC refund: 0 (exact input)
  USDT refund: 0 (fully swapped)
  aUSDT refund: 0 (fully swapped)

NET STATE CHANGE:
──────────────────
Before:  10,000 USDC
After:   10,234 USDC
Profit:  234 USDC
Cost:    0.0217 ETH (~$32)
Net:     +$142 profit

Risk level: Low (no remaining positions)
```

## Best Practices

- **Simulate before submitting**: Always test bundles locally first
- **Check atomic assumptions**: Verify all-or-nothing behavior
- **Analyze MEV exposure**: Ensure bundle provides protection
- **Test edge cases**: Simulate at various block heights
- **Validate profitability**: Include all costs in analysis
- **Monitor gas prices**: Adjust for current network conditions
- **Set block targets**: Specify acceptable block height range
- **Keep private keys safe**: Never submit real bundles without security

## Workflow

The command performs the following steps:

1. **Bundle Parsing**
   - Load JSON bundle file
   - Parse transactions
   - Validate format
   - Extract parameters

2. **State Preparation**
   - Query blockchain state at block
   - Load account balances
   - Retrieve contract storage
   - Set up execution context

3. **Transaction Simulation**
   - Execute TX1 in isolated state
   - Capture state changes
   - Execute TX2 with updated state
   - Continue for all transactions

4. **Analysis**
   - Calculate gas per transaction
   - Analyze state transitions
   - Detect failures/reverts
   - Compute MEV impact

5. **MEV Analysis**
   - Check for sandwich exposure
   - Calculate slippage
   - Compare with sequential
   - Estimate MEV extraction

6. **Report Generation**
   - Format simulation results
   - Create comparison analysis
   - Generate recommendations
   - Produce outputs file

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "evm": {
    "bundle": {
      "simulationBlock": "latest",
      "includeTrace": true,
      "mevAnalysis": true,
      "comparisonMode": true,
      "dryRun": true
    }
  }
}
```

## Bundle JSON Format

```json
{
  "transactions": [
    {
      "to": "0x...",
      "from": "0x...",
      "data": "0x...",
      "value": "0",
      "gas": 200000,
      "gasPrice": "35000000000"
    }
  ],
  "blockNumber": 18456789,
  "minTimestamp": 1699564800,
  "maxTimestamp": 1699564860,
  "revertingTxHashes": []
}
```

## Related Commands

- `/decode-tx` - Decode bundle transactions
- `/estimate-gas` - Estimate bundle gas costs
- `/trace-tx` - Trace bundle execution
- `/snapshot-state` - Create state for simulation

## MEV Analysis Metrics

- **Sandwich vulnerability**: Can transaction be sandwiched?
- **Slippage**: Actual vs expected output difference
- **MEV extracted**: Value captured by frontrunners
- **Price impact**: Market movement from transaction
- **Ordering value**: Benefit of specific transaction order

## Common Bundle Types

1. **Atomic swaps**: Multi-step token exchanges
2. **Liquidations**: Flash loan + liquidate + repay
3. **Arbitrage**: Buy low, sell high across venues
4. **Rebalancing**: Multi-protocol position adjustments
5. **Composable DeFi**: Complex multi-contract interactions

## Gas Cost Estimates

```
Simple approval + swap: 150,000 gas
Flashloan liquidation: 300,000 gas
Multi-protocol bundle: 400,000+ gas
```

## Notes

- **Deterministic**: Same state always produces same result
- **State snapshot**: Simulations accurate to block state
- **Gas estimates**: Include all operations (calldata, storage)
- **Atomic semantics**: All succeed or all fail (for Flashbots)
- **Ordering matters**: Transaction order affects outcomes
- **MEV real**: Bundle protection is only as good as proposer
- **Simulation is not guarantee**: Network conditions may differ
