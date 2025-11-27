# Command: /fork-mainnet

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Create and manage local Ethereum mainnet forks for testing and simulation

## Description

The `/fork-mainnet` command sets up a local fork of Ethereum mainnet (or other networks) using Foundry or Hardhat. This enables safe testing and simulation of contract interactions with real on-chain state without spending gas or risking mainnet.

This command is essential for testing contract upgrades, complex transactions, and interactions with production contracts in a controlled, reproducible environment.

## Usage

```bash
/fork-mainnet [network] [options]
```

## Options

- `--network` - Network to fork (mainnet, polygon, arbitrum, optimism, etc.)
- `--fork-url` - Custom RPC endpoint URL
- `--block` - Fork at specific block number
- `--port` - Local RPC port (default: 8545)
- `--accounts` - Number of test accounts to create
- `--save-state` - Save fork state snapshot
- `--load-state` - Load previous fork snapshot
- `--timestamp` - Override block timestamp
- `--disable-cache` - Don't cache RPC responses
- `--verbose` - Show detailed RPC logs

## Arguments

- `network` (optional) - Network to fork (default: mainnet)

## Examples

### Example 1: Fork mainnet at current block
```bash
/fork-mainnet mainnet
```
Creates local fork of Ethereum mainnet at latest block on port 8545.

### Example 2: Fork at specific block
```bash
/fork-mainnet mainnet --block 17500000
```
Forks at block 17.5M, useful for reproducing historical issues.

### Example 3: Fork Polygon with state snapshot
```bash
/fork-mainnet polygon --port 8546 --save-state ./snapshots/poly-fork.json
```
Forks Polygon and saves state for later reuse.

### Example 4: Load previous fork snapshot
```bash
/fork-mainnet --load-state ./snapshots/mainnet-fork.json
```
Restores previously saved fork state instead of fetching from RPC.

## Foundry Fork Setup

Create `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"

[rpc_endpoints]
mainnet = "${MAINNET_RPC_URL}"
polygon = "${POLYGON_RPC_URL}"
arbitrum = "${ARBITRUM_RPC_URL}"
optimism = "${OPTIMISM_RPC_URL}"

[profiles.fork]
fork = "mainnet"
fork_block_number = 17500000
```

## Hardhat Fork Setup

Configure in `hardhat.config.ts`:

```typescript
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        enabled: process.env.FORKING === "true",
        url: process.env.MAINNET_RPC_URL!,
        blockNumber: 17500000,
        httpHeaders: {
          Authorization: `Bearer ${process.env.ALCHEMY_API_KEY}`,
        },
      },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
};

export default config;
```

## Starting Local Fork

With Foundry:

```bash
# Start anvil fork server
anvil --fork-url $MAINNET_RPC_URL --fork-block-number 17500000 --port 8545

# In another terminal, connect Hardhat
npx hardhat test --network localhost
```

With Hardhat:

```bash
# Run tests against mainnet fork
FORKING=true npx hardhat test
```

## Fork Testing Examples

Create `test/Fork.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ForkTest is Test {
    // Mainnet addresses
    IERC20 constant USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    address constant USDC_HOLDER = 0x47ac0Fb4F2D84898b5B171289CB26D7403136112;

    function setUp() public {
        // Fork mainnet at specific block
        vm.createSelectFork("mainnet", 17500000);
    }

    function test_USDCTransfer() public {
        uint256 initialBalance = USDC.balanceOf(USDC_HOLDER);
        require(initialBalance > 0, "Test holder has no USDC");

        // Impersonate USDC holder
        vm.prank(USDC_HOLDER);
        USDC.transfer(address(this), 1000e6);

        assertEq(USDC.balanceOf(address(this)), 1000e6);
        assertEq(USDC.balanceOf(USDC_HOLDER), initialBalance - 1000e6);
    }

    function test_SwapUniswapV3() public {
        // Test Uniswap interactions on forked mainnet
        address uniswapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

        // Impersonate USDC holder
        vm.prank(USDC_HOLDER);
        USDC.approve(uniswapRouter, 1000e6);

        // Execute swap (example)
        // This tests real mainnet state and contracts
    }
}
```

## Impersonation on Fork

```solidity
function test_ImpersonateRichAddress() public {
    // Mainnet USDC holder
    address richAddress = 0x47ac0Fb4F2D84898b5B171289CB26D7403136112;

    // Impersonate the address
    vm.prank(richAddress);

    // Now calls come from richAddress
    IERC20(usdc).transfer(address(this), 1000e6);

    // Verify transfer
    assertEq(IERC20(usdc).balanceOf(address(this)), 1000e6);
}
```

## State Manipulation

```solidity
function test_ModifyChainState() public {
    address account = address(0x123);

    // Set balance
    vm.deal(account, 100 ether);
    assertEq(account.balance, 100 ether);

    // Set storage (for ERC20 balances)
    bytes32 balanceSlot = keccak256(abi.encode(account, 0)); // Depends on contract
    vm.store(USDC_ADDRESS, balanceSlot, bytes32(uint256(5000e6)));

    // Set block properties
    vm.warp(block.timestamp + 7 days);
    vm.roll(block.number + 42000);

    // Execute test
    vm.prank(account);
    // ... test code ...
}
```

## Fork State Snapshot and Restore

```solidity
function test_WithSnapshot() public {
    // Create initial state
    address testAccount = makeAddr("test");
    vm.deal(testAccount, 100 ether);

    // Save snapshot
    uint256 snapshot = vm.snapshot();

    // Modify state
    vm.prank(testAccount);
    payable(address(0x999)).transfer(50 ether);
    assertEq(testAccount.balance, 50 ether);

    // Revert to snapshot
    vm.revertToSnapshot(snapshot);
    assertEq(testAccount.balance, 100 ether);
}
```

## Output Example

```
Mainnet Fork Started
────────────────────

Network: Ethereum Mainnet
RPC URL: https://mainnet.infura.io/v3/...
Block Number: 17,500,000
Block Hash: 0xabcd...ef01
Timestamp: 1705000000

Local Fork Details:
Port: 8545
ChainID: 1
Network Name: mainnet
State Cache: Enabled

Test Accounts (20):
Account #0: 0x1234...5678
  Balance: 10,000 ETH
  Nonce: 0

Account #1: 0x2345...6789
  Balance: 10,000 ETH
  Nonce: 0

...19 more accounts...

Fork Ready for Testing
├─ Connect with: http://localhost:8545
├─ View state: https://etherscan.io/block/17500000
└─ Accounts loaded: 20 accounts with 10,000 ETH each

Running tests...
✓ test_USDCTransfer
✓ test_SwapUniswapV3
✓ test_LiquidityPool

Tests passed: 3/3
```

## Advanced Fork Testing

### Testing contract upgrades:

```solidity
function test_ContractUpgrade() public {
    address proxy = 0x1234...5678; // Existing mainnet proxy

    // Deploy new implementation
    MyContractV2 newImpl = new MyContractV2();

    // Get admin (impersonate)
    address admin = 0xadmin...;
    vm.prank(admin);

    // Upgrade proxy
    ITransparentUpgradeableProxy(proxy).upgradeTo(address(newImpl));

    // Test new implementation
    MyContractV2 upgraded = MyContractV2(proxy);
    upgraded.newFunction();
}
```

### Testing governance:

```solidity
function test_GovernanceProposal() public {
    address proposer = 0x...;

    // Create proposal
    vm.prank(proposer);
    uint256 proposalId = governor.propose(
        targets,
        values,
        calldatas,
        description
    );

    // Vote
    vm.warp(block.timestamp + 1);
    vm.prank(voter);
    governor.castVote(proposalId, 1); // 1 = for

    // Execute
    vm.warp(block.timestamp + votingPeriod);
    governor.execute(targets, values, calldatas, keccak256(abi.encodePacked(description)));
}
```

## Best Practices

- **Use snapshots**: Save state between tests to avoid RPC hits
- **Document block numbers**: Record which block you tested against
- **Test real scenarios**: Test against mainnet state, not mocks
- **Verify assumptions**: Confirm contract addresses and state are as expected
- **Test upgrades**: Use forks to test contract upgrades before deployment
- **Monitor RPC costs**: Forking makes many RPC calls; use rate-limited keys
- **Cache responses**: Enable caching to reduce RPC calls and latency
- **Understand fork divergence**: Fork state can diverge from mainnet during tests

## Network Configuration Reference

```toml
[rpc_endpoints]
mainnet = "https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY"
sepolia = "https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY"
polygon = "https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
arbitrum = "https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY"
optimism = "https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY"
base = "https://base-mainnet.g.alchemy.com/v2/YOUR_KEY"
```

## Related Commands

- `/impersonate-account` - Impersonate accounts on fork
- `/test-coverage` - Coverage analysis of fork tests
- `/deploy-hardhat` - Deploy to fork before mainnet
- `/audit-security` - Audit contracts on fork

## Notes

- **Gas-free testing**: No gas costs on local fork
- **State consistency**: Fork reflects mainnet state at block height
- **RPC-dependent**: Fork accuracy depends on RPC node quality
- **Rate limiting**: Heavy fork usage may hit RPC rate limits
- **Latency**: Network latency affects fork creation and tests
- **Storage conflicts**: Similar accounts in tests may conflict with mainnet
