# Command: /decode-tx

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Decode EVM transaction calldata and logs with ABI analysis and human-readable output

## Description

The `/decode-tx` command decodes complex transaction data into human-readable function calls and parameter values. It parses function selectors, decodes calldata arguments, interprets event logs, identifies function signatures from 4-byte databases, and provides comprehensive transaction analysis for debugging, auditing, and understanding contract interactions.

This command is essential for understanding token transfers, complex DeFi operations, multi-call transactions, delegate calls, and any on-chain activity requiring deep transaction inspection.

## Usage

```bash
/decode-tx [tx-hash] [options]
```

## Arguments

- `tx-hash` - Transaction hash to decode (required)
- `--chain` - Network: `mainnet`, `sepolia`, `arbitrum`, etc. (required)
- `--abi` - Path to contract ABI file
- `--calldata` - Raw calldata string (0x...) if not fetching from on-chain
- `--function-only` - Show only function call, skip logs
- `--logs-only` - Show only event logs
- `--include-state` - Include state changes (requires state tracking)
- `--format` - Output format: `json`, `yaml`, `markdown` (default: formatted text)
- `--depth` - Call depth analysis: `shallow` (direct call), `deep` (full trace)
- `--trace` - Show call trace tree with gas per call
- `--storage` - Include storage read/writes

## Examples

### Example 1: Decode complex swap transaction
```bash
/decode-tx 0x1234...abcd --chain mainnet
```

Output:
```
TRANSACTION DECODED
===================

TX Hash: 0x1234...abcd
From: 0xUser...1234
To: 0xRouter...5678 (Uniswap V3 Router)
Value: 0 ETH
Gas Used: 187,432

FUNCTION CALL:
──────────────
Function: multicall(uint256 deadline, bytes[] calls)
  Parameter[0] deadline: 1699564800 (Unix: 2023-11-10 12:00:00 UTC)
  Parameter[1] calls (bytes[] array with 3 elements):

    [0] Function: swap_exact_tokens_for_tokens
        WETH: 10.5 (0x...aed4)
        → USDC: 18,234.42 (0x...d925)
        Path: WETH → USDC (fee: 0.3%)
        Min output: 18,000 USDC
        Deadline: 1699564800

    [1] Function: swap_exact_tokens_for_eth
        USDC: 18,234.42
        → ETH: 5.127 (estimated)
        Min output: 5.0 ETH
        Deadline: 1699564800

    [2] Function: refund_eth
        Recipient: 0xUser...1234
        Amount: All remaining ETH

EVENT LOGS:
──────────
Log[0] Transfer(address indexed from, address indexed to, uint256 value)
  from: 0xUser...1234
  to: 0xRouter...5678
  value: 10.5 WETH

Log[1] Swap(address indexed sender, uint256 amount0In, uint256 amount1Out, ...)
  sender: 0xRouter...5678
  amount0In: 10.5 WETH
  amount1Out: 18,234.42 USDC
  sqrtPriceX96After: 1851...
  liquidity: 12,324,556

Log[2] Transfer(address indexed from, address indexed to, uint256 value)
  from: 0xRouter...5678
  to: 0xUser...1234
  value: 18,234.42 USDC

EXECUTION SUMMARY:
──────────────────
Status: Success (0x1)
Gas: 187,432 / 200,000 (93.7% used)
Effective Gas Price: 45.3 gwei
Total Cost: 0.00849 ETH ($14.23)

DECODED INTENT:
User swapped 10.5 WETH for 18,234.42 USDC through Uniswap V3
and then swapped USDC back for ETH with refund.
```

### Example 2: Bridge transfer with ABI
```bash
/decode-tx 0x5678...efgh --chain arbitrum --abi src/Bridge.json --depth deep
```

Output:
```
BRIDGE TRANSACTION ANALYSIS
============================

TX: 0x5678...efgh
From: 0xBridge...1234
To: 0xGateway...5678

CALL TRACE:
──────────
├─ Gateway.lock(bytes32 txId, address token, uint256 amount)
│  └─ Gas: 23,400 (12.5%)
│     ├─ ERC20.balanceOf(address account)
│     │  └─ Gas: 2,100 (STATICCALL)
│     │     Returns: 500,000 BRIDGE
│     │
│     └─ ERC20.transferFrom(address from, address to, uint256 amount)
│        └─ Gas: 21,200 (CALL)
│           ├─ _approve(spender, ...)
│           │  └─ Gas: 0 (already approved)
│           │
│           └─ Transfer event emitted
│              from: 0xBridge...
│              to: 0xGateway...
│              value: 100,000 BRIDGE

└─ EventLog.recordBridge(...)
   └─ Gas: 12,400
      Events: BridgeLocked, CrossChainInitiated

STORAGE CHANGES:
────────────────
0xGateway...5678:
  balances[0xBridge...1234]: 0 → 100,000
  totalLocked: 5,000,000 → 5,100,000
  pendingTxs: 1234 → 1235

STATE SUMMARY:
──────────────
✓ Funds locked successfully
✓ Bridge gateway updated
✓ Cross-chain message queued
```

### Example 3: Decode raw calldata without transaction
```bash
/decode-tx --calldata 0xa9059cbb000000000000000000000000\
abcd1234...0000000000000000000000000000000000000000000000\
0000000000000000000000000de0b6b3a7640000
```

Output:
```
CALLDATA DECODED
================

Function: transfer(address to, uint256 amount)
  to: 0xabcd1234...
  amount: 1000000000000000000 (1.0 with 18 decimals)

Source: ERC20 Token Transfer
Function ID: 0xa9059cbb
Estimated cost: ~45,000 gas
```

### Example 4: Complex governance proposal with full trace
```bash
/decode-tx 0x9abc...7890 --chain mainnet --format json --include-state
```

Output (JSON format):
```json
{
  "hash": "0x9abc...7890",
  "from": "0xProposer...1234",
  "to": "0xGovernance...5678",
  "function": {
    "name": "castVote",
    "selector": "0x15f73940",
    "parameters": {
      "proposalId": 42,
      "support": 1,
      "reason": "Supports better capital efficiency"
    }
  },
  "logs": [
    {
      "event": "VoteCast",
      "indexed": {
        "voter": "0xProposer...1234",
        "proposalId": 42
      },
      "data": {
        "support": 1,
        "weight": 150000,
        "reason": "Supports better capital efficiency"
      }
    }
  ],
  "gasUsed": 89234,
  "status": 1,
  "summary": "Vote cast in favor of proposal 42 with 150k voting power"
}
```

## Best Practices

- **Always verify contracts**: Cross-check decoded functions with verified contracts
- **Check transaction status**: Ensure transaction succeeded before analyzing results
- **Use official ABIs**: Fetch ABIs from contract verification sources
- **Analyze context**: Consider transaction context and user intent
- **Monitor gas**: Watch for unexpected high gas consumption
- **Trace deep calls**: Use `--depth deep` for complex transactions
- **Archive data**: Store decoded transactions for audit trails
- **Cross-reference**: Compare with other tools for validation

## Workflow

The command performs the following steps:

1. **Transaction Fetch**
   - Query RPC for transaction details
   - Retrieve input data and logs
   - Get gas estimates and status

2. **Function Identification**
   - Extract function selector (first 4 bytes)
   - Query 4-byte function signature database
   - Match against provided ABI

3. **Calldata Decoding**
   - Parse function parameters from calldata
   - Decode dynamic types (arrays, strings)
   - Convert to human-readable format

4. **ABI Analysis**
   - Load contract ABI
   - Match function signatures
   - Identify parameter types
   - Resolve type encoding

5. **Log Parsing**
   - Decode indexed topics
   - Parse event parameters
   - Match to contract events

6. **Output Generation**
   - Format results for readability
   - Show call trace if available
   - Include gas analysis
   - Add summary interpretation

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "evm": {
    "decode": {
      "verbose": true,
      "includeTrace": true,
      "showGasBreakdown": true,
      "functionDatabase": "4byte.directory",
      "autoLoadAbi": true
    }
  }
}
```

## Function Signature Resolution

The command uses multiple resolution methods:

1. **Provided ABI** - Most accurate
2. **4Byte.directory** - Database of common function selectors
3. **Etherscan API** - Verified contract ABIs
4. **OpenChain** - Additional function databases

Common function selectors:

```
0xa9059cbb - ERC20 transfer(address,uint256)
0x23b872dd - ERC20 transferFrom(address,address,uint256)
0x095ea7b3 - ERC20 approve(address,uint256)
0xddf252ad - ERC20 Transfer event
0x8cc6fd33 - Uniswap swap()
0xec28f946 - Uniswap swapExactETHForTokens()
```

## Log Decoding Details

Event logs are decoded with:

```
Event: Transfer(address indexed from, address indexed to, uint256 value)
Topics:
  [0] Keccak256("Transfer(address,indexed,address indexed,uint256)")
  [1] 0x0000... (from address)
  [2] 0x1234... (to address)
Data:
  [0] 0x0000...0001 (value = 1)
```

## Related Commands

- `/trace-tx` - Generate full execution trace
- `/estimate-gas` - Estimate transaction costs
- `/storage-layout` - Analyze storage reads/writes
- `/snapshot-state` - Capture state before/after transaction
- `/simulate-bundle` - Simulate bundle transactions together

## Common Patterns Detected

The command recognizes:

- **Token transfers**: Detects ERC20/721/1155 transfers
- **Swaps**: Identifies DEX operations
- **Governance**: Recognizes voting and proposal mechanisms
- **Bridge operations**: Detects cross-chain transfers
- **Contract deployment**: Identifies contract creation
- **Delegatecalls**: Shows delegation patterns
- **Multi-calls**: Parses batch operations

## Limitations

- Unverified contracts: Only selector visible (0x...)
- Dynamic calls: Some complex patterns may be partially decoded
- Storage ops: Requires separate trace analysis
- Off-chain data: Cannot decode arbitrary calldata without ABI
- Reverted transactions: Limited error information available

## Notes

- **Deterministic**: Same transaction always decodes identically
- **Network-specific**: Transaction must exist on specified network
- **Real-time**: Fetches latest data from RPC
- **Privacy**: No personal data exposure
- **Gas included**: All gas calculations are accurate
- **Indexed logs**: Parameters can be filtered from topics
- **Fallback function**: Fallback calls show as 0x0000...
