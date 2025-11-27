# Command: /gas-report

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Generate detailed gas consumption reports for smart contract functions

## Description

The `/gas-report` command analyzes gas consumption for all functions in smart contracts, identifying expensive operations and optimization opportunities. Understanding gas costs is critical for user experience, cost optimization, and network efficiency.

This command integrates with Foundry and Hardhat to produce comprehensive gas reports, highlighting hotspots for optimization and comparing costs across different approaches.

## Usage

```bash
/gas-report [options]
```

## Options

- `--framework` - Framework to use (foundry, hardhat, auto)
- `--contract` - Specific contract to analyze
- `--function` - Specific function to analyze
- `--sort-by` - Sort metric (gas, name, avg, median)
- `--output` - Output format (table, json, csv, markdown)
- `--save` - Save report to file
- `--compare-baseline` - Compare against baseline report file
- `--threshold` - Highlight functions exceeding gas threshold
- `--exclude-tests` - Exclude test functions
- `--verbose` - Show additional details

## Arguments

None

## Examples

### Example 1: Generate basic gas report
```bash
/gas-report --output table
```
Shows all functions with their gas costs in terminal table format.

### Example 2: Compare against baseline
```bash
/gas-report --compare-baseline ./reports/baseline.json --threshold 100000
```
Highlights functions that exceed 100,000 gas or have increased from baseline.

### Example 3: Analyze specific contract
```bash
/gas-report --contract MyToken --output markdown --save gas-report.md
```
Generates detailed markdown report for MyToken contract only.

### Example 4: Find expensive functions
```bash
/gas-report --sort-by gas --threshold 500000 --verbose
```
Shows most expensive functions first, highlighting those over 500k gas.

## Gas Report Structure

Sample Foundry output:

```
Gas Report | MyToken
───────────────────────────────────────────────────────────

╭─ Deployment ─────────────────────────────────────────────╮
│ MyToken deployment                         835,420 gas   │
│ Oracle deployment                          285,100 gas   │
│ Vault deployment                         1,240,320 gas   │
╰───────────────────────────────────────────────────────────╯

╭─ MyToken::transfer ───────────────────────────────────────╮
│ Min:      21,200 gas  │ Max:      92,400 gas             │
│ Avg:      45,800 gas  │ Median:   42,300 gas             │
│ Calls:    1,245       │ Uops:     15                      │
╰───────────────────────────────────────────────────────────╯

╭─ MyToken::approve ────────────────────────────────────────╮
│ Min:      22,100 gas  │ Max:      22,100 gas             │
│ Avg:      22,100 gas  │ Median:   22,100 gas             │
│ Calls:    892         │ Uops:     5                       │
╰───────────────────────────────────────────────────────────╯

╭─ MyToken::mint ───────────────────────────────────────────╮
│ Min:      68,300 gas  │ Max:     112,400 gas             │
│ Avg:      82,100 gas  │ Median:   79,500 gas             │
│ Calls:    356         │ Uops:     24                      │
╰───────────────────────────────────────────────────────────╯

Top 5 Most Expensive Functions:
 1. vault.depositAndHarvest()     892,450 gas
 2. token.mint(address,uint256)   112,400 gas
 3. oracle.updatePrices()          98,320 gas
 4. token.transfer(address,uint256) 92,400 gas
 5. vault.withdraw()               78,920 gas
```

## Foundry Gas Report Setup

In `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"
optimizer = true
optimizer_runs = 200
gas_reports = ["MyToken", "Vault", "Oracle"]
```

Run gas report:

```bash
forge test --gas-report
forge test --gas-report > gas-report.txt
```

## Hardhat Gas Report Setup

Install hardhat-gas-reporter:

```bash
npm install --save-dev hardhat-gas-reporter
```

Configure in `hardhat.config.ts`:

```typescript
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: false,
    excludeContracts: ["Test", "Mock"],
    src: "src",
  },
};

export default config;
```

Run with environment variable:

```bash
REPORT_GAS=true npx hardhat test
```

## Gas Optimization Examples

### Example 1: Optimize storage packing

Before (3 storage slots):
```solidity
contract Token {
    address public owner;           // 20 bytes
    uint256 public totalSupply;     // 32 bytes
    bool public paused;             // 1 byte
}
```

After (1 storage slot):
```solidity
contract Token {
    uint256 public totalSupply;     // 32 bytes
    address public owner;           // 20 bytes (packed)
    bool public paused;             // 1 byte (packed)
}
```

Saves ~20,000 gas in initialization.

### Example 2: Use ERC721Enumerable vs custom indexing

Before (expensive):
```solidity
function getTokensByOwner(address owner) external view returns (uint256[] memory) {
    uint256[] memory tokens = new uint256[](totalSupply);
    uint256 count = 0;
    for (uint256 i = 0; i < totalSupply; i++) {
        if (ownerOf(i) == owner) {
            tokens[count++] = i;
        }
    }
    return tokens;
}
```

After (optimized):
```solidity
mapping(address => uint256[]) private ownerTokens;

function getTokensByOwner(address owner) external view returns (uint256[] memory) {
    return ownerTokens[owner];
}
```

Saves 100k+ gas for large collections.

### Example 3: Batch operations

Before (loops):
```solidity
function transferBatch(address[] calldata recipients, uint256[] calldata amounts) external {
    for (uint256 i = 0; i < recipients.length; i++) {
        transfer(recipients[i], amounts[i]);  // 21,000 gas each
    }
}
```

After (optimized):
```solidity
function transferBatchOptimized(address[] calldata recipients, uint256[] calldata amounts) external {
    uint256 len = recipients.length;
    unchecked {
        for (uint256 i; i < len; ++i) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}
```

Saves 5,000-10,000 gas per transfer.

## JSON Report Format

Export for analysis:

```json
{
  "contract": "MyToken",
  "deploymentGas": 835420,
  "functions": [
    {
      "name": "transfer",
      "min": 21200,
      "max": 92400,
      "avg": 45800,
      "median": 42300,
      "calls": 1245
    },
    {
      "name": "approve",
      "min": 22100,
      "max": 22100,
      "avg": 22100,
      "median": 22100,
      "calls": 892
    }
  ],
  "summary": {
    "totalCalls": 2137,
    "avgGasPerCall": 56320,
    "hotspots": ["transfer", "mint"]
  }
}
```

## Gas Profiling Best Practices

1. **Profile during development**: Run gas reports after major changes
2. **Identify hotspots**: Focus optimization on frequently-called functions
3. **Benchmark before/after**: Save baseline for comparison
4. **Consider tradeoffs**: Optimization sometimes reduces readability
5. **Network costs**: Remember L2s have different costs
6. **Test realistic scenarios**: Profile with actual usage patterns
7. **Check for regressions**: Compare against previous versions
8. **Profile storage**: Storage operations are most expensive

## Gas Cost Reference

```
Storage Operations:
- SLOAD (read):                              100 gas
- SSTORE (write, cold):                      22,100 gas
- SSTORE (write, warm):                      2,900 gas
- SSTORE (delete):                           4,800 gas

Memory Operations:
- MLOAD/MSTORE:                              3 gas
- Memory expansion:                          3 + n² gas

Computation:
- ADD/SUB/MUL:                               3 gas
- DIV/MOD:                                   5 gas
- CALL:                                      100-700 gas
- Revert:                                    0 gas

Deployment:
- 16 gas per byte of bytecode
```

## Benchmark Comparison

Create baseline:

```bash
forge test --gas-report > reports/baseline.json
```

Later, compare:

```bash
/gas-report --compare-baseline ./reports/baseline.json
```

Output shows deltas:

```
Function          Baseline  Current   Delta     Change
─────────────────────────────────────────────────────
transfer          45,800    42,100   -3,700    -8.1% ✓
approve           22,100    22,100        0     0.0%
mint              82,100    85,900   +3,800    +4.6%
```

## Related Commands

- `/test-coverage` - Run test coverage analysis
- `/audit-security` - Security audit of contracts
- `/code-review` - Review code for improvements
- `/deploy-hardhat` - Deploy contracts

## Notes

- **Gas varies by network**: L1 (Ethereum) vs L2 (Arbitrum, Optimism)
- **Optimization settings**: Compiler version and runs affect gas
- **Storage layout**: Matters significantly for gas costs
- **Testing vs production**: Test networks may have different costs
- **Upgrades**: Track gas changes across contract versions
