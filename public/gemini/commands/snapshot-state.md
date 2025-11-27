# Command: /snapshot-state

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Create blockchain state snapshots for testing, debugging, and rollback scenarios

## Description

The `/snapshot-state` command captures the current state of smart contracts, accounts, and storage at a specific block height. It creates restorable snapshots that enable Foundry forking tests, emergency rollbacks, pre/post analysis, and deterministic testing environments. Snapshots include all relevant storage data, balances, nonces, and contract code.

This command is essential for Foundry testing, contract debugging, transaction analysis before/after states, and creating test fixtures that replicate mainnet conditions.

## Usage

```bash
/snapshot-state [options]
```

## Arguments

- `--chain` - Network to snapshot: `mainnet`, `sepolia`, `arbitrum` (required)
- `--block` - Block height for snapshot (default: latest)
- `--contracts` - Comma-separated contract addresses to include
- `--accounts` - Comma-separated EOA addresses to include
- `--output` - Output file path (default: snapshot-{chain}-{block}.json)
- `--format` - Format: `json`, `forge`, `hardhat` (default: json)
- `--include-code` - Include contract bytecode (default: true)
- `--compress` - Compress snapshot (gzip)
- `--create-fork-config` - Auto-generate Foundry forge.toml config
- `--compare` - Compare with previous snapshot
- `--tag` - Label snapshot for organization

## Examples

### Example 1: Snapshot Uniswap state before/after swap
```bash
/snapshot-state --chain mainnet --block 18400000 \
  --contracts 0xE592427A0AEce92De3Edee1F18E0157C05861564 \
  --accounts 0xUser...1234 0xRouter...5678 \
  --output pre-swap-snapshot.json
```

Output:
```
STATE SNAPSHOT CREATED
======================

Chain: Mainnet
Block: 18,400,000
Timestamp: 2023-10-15 14:23:45 UTC

Snapshot file: pre-swap-snapshot.json
Size: 2.3 MB

INCLUDED ACCOUNTS:
──────────────────
0xUser...1234 (EOA)
  Balance: 10.5 ETH
  Nonce: 42
  Code: (EOA - no code)

0xRouter...5678 (Uniswap V3 Router)
  Balance: 0.342 ETH
  Nonce: 1
  Code: 8,456 bytes (verified)

STORAGE DATA:
──────────────
Total slots captured: 1,245
Contracts with storage: 2

Sample storage entries:
  0xRouter...5678:
    Slot 0x0: 0x000...0001 (factory address)
    Slot 0x4: 0xdeadbeef... (permissions)
    ... 243 more slots

SNAPSHOT FEATURES:
──────────────────
✓ All storage included
✓ Account balances captured
✓ Nonce snapshots included
✓ Code snapshots included
✓ Ready for Foundry fork testing
```

### Example 2: Create Foundry fork configuration
```bash
/snapshot-state --chain mainnet --block latest \
  --contracts 0xProtocol...1234 0xToken...5678 0xGovernance...abcd \
  --create-fork-config
```

Output generates `forge.toml`:

```toml
[profile.mainnet-fork]
fork = "https://eth-mainnet.g.alchemy.com/v2/..."
fork_block_number = 18456789

[profile.test]
fork = "https://eth-mainnet.g.alchemy.com/v2/..."
fork_block_number = 18456789

[snapshot]
name = "mainnet-fork-18456789"
created_at = "2024-11-06T12:34:56Z"
contracts = [
  "0xProtocol...1234",
  "0xToken...5678",
  "0xGovernance...abcd"
]
```

And generates test helper:

```solidity
// test/fixtures/MainnetForkFixture.sol
pragma solidity ^0.8.20;

contract MainnetForkFixture {
    // Snapshot data captured at block 18456789
    address constant PROTOCOL = 0xProtocol...1234;
    address constant TOKEN = 0xToken...5678;
    address constant GOVERNANCE = 0xGovernance...abcd;

    uint256 constant FORK_BLOCK = 18456789;

    function setUp() public {
        vm.createSelectFork(vm.envString("MAINNET_RPC"), FORK_BLOCK);
    }
}
```

### Example 3: Compare two snapshots (before/after transaction)
```bash
/snapshot-state --chain mainnet --block 18400000 --output pre-tx.json
# ... execute transaction ...
/snapshot-state --chain mainnet --block 18400001 --output post-tx.json

/snapshot-state --compare pre-tx.json post-tx.json
```

Output:
```
SNAPSHOT COMPARISON REPORT
===========================

Pre-snapshot:  Block 18400000
Post-snapshot: Block 18400001
Diff blocks:   1 (0x1234...abcd transaction)

STATE CHANGES:
──────────────

Account: 0xUser...1234
  Balance: 10.5 ETH → 10.3 ETH (diff: -0.2 ETH)
  Nonce: 42 → 43 (incremented)

Account: 0xToken...5678
  Storage slot 0x10:
    Before: 0x00...01234567
    After:  0x00...56789abc
    Change: +0x33...55625 (14,556,005 units)

  Storage slot 0x11:
    Before: 0x00...000003e8
    After:  0x00...00000000
    Change: -1000 units

Account: 0xPool...abcd
  Balance: 45.234 ETH → 45.432 ETH (diff: +0.198 ETH)
  Storage changed: 3 slots

NEW CONTRACTS:
──────────────
None created

DELETED CONTRACTS:
──────────────────
None deleted

SUMMARY:
─────────
Accounts modified: 3
Storage slots changed: 5
ETH transferred: 0.2 ETH
Gas used: 45,234
Success: Yes
```

### Example 4: Create multi-contract test environment
```bash
/snapshot-state --chain arbitrum \
  --block 195000000 \
  --contracts 0xArbUSD...1234,0xGMX...5678,0xReward...abcd \
  --format forge \
  --tag "arbUSD-gmx-setup"
```

Generates test-ready snapshot:

```solidity
// test/Snapshots.sol
pragma solidity ^0.8.20;

contract ArbUsdGmxSnapshot {
    address constant ARBUSD = 0xArbUSD...1234;
    address constant GMX = 0xGMX...5678;
    address constant REWARD = 0xReward...abcd;

    function restoreArbitrumState() internal {
        // Storage restore data
        vm.store(ARBUSD, bytes32(uint256(0)),
            bytes32(uint256(1000000000000000000)));
        vm.store(ARBUSD, bytes32(uint256(1)),
            bytes32(uint256(0x1234...)));

        // ... more storage
    }

    function testSwapInSnapshot() public {
        restoreArbitrumState();

        // Execute test against snapshot state
        vm.prank(user);
        (bool success,) = ARBUSD.call("");
        assertTrue(success);
    }
}
```

## Best Practices

- **Snapshot before critical transactions**: Create before/after pairs for debugging
- **Use specific block heights**: Match snapshots to known contract states
- **Include relevant contracts only**: Reduce file size by filtering addresses
- **Version snapshots**: Tag with contract versions or event names
- **Archive important snapshots**: Keep snapshots of major deployments
- **Test against snapshots**: Use Foundry forks with snapshots for reliable tests
- **Compare for auditing**: Use comparison to verify state transitions
- **Compress large snapshots**: Save disk space with compression

## Workflow

The command performs the following steps:

1. **Account Discovery**
   - Identify EOA accounts to include
   - Load contract addresses
   - Resolve contract names from explorer

2. **Data Collection**
   - Query account balances at block height
   - Fetch account nonces
   - Retrieve contract code
   - Extract storage slots

3. **Storage Analysis**
   - Read all non-zero storage slots
   - Decode storage layout if ABI available
   - Identify storage patterns
   - Map slot meanings

4. **File Generation**
   - Format data for target format
   - Create snapshot file
   - Generate metadata
   - Create auxiliary files (if requested)

5. **Validation**
   - Verify data integrity
   - Validate block consistency
   - Check storage correctness
   - Confirm file size

6. **Output**
   - Save snapshot file
   - Generate configuration
   - Create helper contracts
   - Produce comparison reports

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "foundry": {
    "snapshot": {
      "includeCode": true,
      "includeStorage": true,
      "compression": "gzip",
      "defaultFormat": "json",
      "autoFork": true,
      "blockOffset": 1
    }
  }
}
```

## Snapshot File Format

JSON snapshot structure:

```json
{
  "metadata": {
    "chain": "mainnet",
    "block": 18400000,
    "timestamp": "2023-10-15T14:23:45Z",
    "created_at": "2024-11-06T12:34:56Z"
  },
  "accounts": {
    "0xUser...1234": {
      "balance": "10500000000000000000",
      "nonce": 42,
      "code": "0x",
      "storage": {}
    },
    "0xContract...5678": {
      "balance": "342000000000000000",
      "nonce": 1,
      "code": "0x608060...",
      "storage": {
        "0x0": "0x000...0001",
        "0x4": "0xdeadbeef..."
      }
    }
  }
}
```

## Using Snapshots in Tests

```solidity
// test/ForkTest.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./Snapshots.sol";

contract ForkTest is Test, Snapshots {
    function setUp() public {
        string memory rpc = vm.envString("MAINNET_RPC");
        vm.createSelectFork(rpc, FORK_BLOCK);
    }

    function testSwapBeforeAfter() public {
        // Snapshot before
        uint256 snapshotBefore = vm.snapshot();

        // Execute swap
        (bool success,) = ROUTER.call(swapData);
        assertTrue(success);

        // Verify state changes
        assertEq(token.balanceOf(user), expectedBalance);

        // Revert to snapshot
        vm.revertToSnapshot(snapshotBefore);

        // State is restored - can test alternative path
        (success,) = ROUTER.call(alternativeSwapData);
        assertTrue(success);
    }
}
```

## Storage Data Example

```
Contract: 0xToken...5678
Storage Layout (from ABI):

Slot 0: _name
  Value: 0x4d7950546f6b656e0000000000000000 (hex for "MyToken")

Slot 1: _symbol
  Value: 0x4d59000000000000000000000000000000 (hex for "MY")

Slot 2: _decimals
  Value: 0x12 (18)

Slot 3: _totalSupply
  Value: 0x056bc75e2d630eb20000 (1,000,000 tokens with 18 decimals)

Slot 4: _balances[user]
  Value: 0x0de0b6b3a7640000 (1 token)

Slot 5: _allowances[user][spender]
  Value: 0xffffffffffffffffffffffffffffffff (unlimited approval)
```

## Related Commands

- `/decode-tx` - Decode transactions affecting snapshot state
- `/trace-tx` - Trace execution from snapshot
- `/upgrade-proxy` - Test proxy upgrades with snapshots
- `/storage-layout` - Analyze storage in snapshot
- `/simulate-bundle` - Test bundles with snapshot state

## Compression Ratios

Typical snapshot sizes:

- Single token account: 2-5 KB
- Full protocol (10 contracts): 50-200 KB
- Major protocol ecosystem: 200KB - 2MB
- With compression: 30-40% of original size

## Related Features

- **Fork testing**: Run tests against mainnet state
- **Rollback testing**: Test recovery from specific states
- **Comparative analysis**: Compare state changes
- **Regression tests**: Create permanent test fixtures
- **Debugging**: Reproduce mainnet issues locally

## Notes

- **Block immutability**: Snapshots are historical and immutable
- **RPC dependent**: Snapshot completeness depends on RPC node
- **Storage limits**: Very large contracts may have size constraints
- **Fork costs**: Fork testing uses RPC calls (may have rate limits)
- **Accuracy**: Snapshots accurately represent blockchain state
- **Reproducibility**: Same snapshot always produces same results
