# Command: /deploy-foundry

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Deploy and manage smart contracts using Foundry (Forge) with advanced gas optimization and verification

## Description

The `/deploy-foundry` command enables deployment of smart contracts using Foundry, featuring superior performance, advanced gas optimization, and seamless contract verification. Foundry provides faster compilation, better gas reports, and powerful scripting capabilities for complex deployments.

This command is essential for developers who need precise control over deployment parameters, advanced gas optimization, and integration with Solidity-native scripting for sophisticated multi-step deployments.

## Usage

```bash
/deploy-foundry [network] [options]
```

## Options

- `--script` - Path to deployment script (default: script/Deploy.s.sol)
- `--verify` - Verify contract on Etherscan after deployment
- `--broadcast` - Actually broadcast transactions (required for real deployments)
- `--slow` - Wait longer for confirmations
- `--skip-simulation` - Skip simulation before broadcast
- `--keystore` - Use keystore file instead of env variable
- `--password-file` - Path to keystore password file
- `--sender` - Override sender address
- `--gas-limit` - Set gas limit for deployment
- `--priority-gas-price` - Set priority gas price (EIP-1559)
- `--legacy` - Use legacy transactions (non-EIP-1559)
- `--optimizer-runs` - Set compiler optimization runs

## Arguments

- `network` (optional) - Target network configuration from foundry.toml

## Examples

### Example 1: Deploy to Sepolia with verification
```bash
/deploy-foundry sepolia --broadcast --verify
```
Deploys contract using Forge script, broadcasts to Sepolia, and verifies on Etherscan.

### Example 2: Simulate before deployment
```bash
/deploy-foundry mainnet --sender 0x1234... --gas-limit 2000000
```
Runs simulation with custom sender and gas limit, showing gas costs without broadcasting.

### Example 3: Deploy with keystore
```bash
/deploy-foundry polygon --broadcast --keystore ./keystore --password-file ./pwd.txt --verify
```
Uses encrypted keystore for transaction signing, more secure than env variables.

### Example 4: Legacy transaction deployment
```bash
/deploy-foundry arbitrum --broadcast --legacy --gas-limit 3000000
```
Deploys using legacy transaction type on Arbitrum with explicit gas limit.

## Deployment Script Structure

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        MyToken token = new MyToken("MyToken", "MTK", 1000000e18);

        vm.stopBroadcast();

        console.log("Token deployed to:", address(token));
    }
}
```

## Foundry Configuration

Create `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"
optimizer = true
optimizer_runs = 200

[profile.production]
optimizer_runs = 999999

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC_URL}"
mainnet = "${MAINNET_RPC_URL}"
polygon = "${POLYGON_RPC_URL}"
arbitrum = "${ARBITRUM_RPC_URL}"
optimism = "${OPTIMISM_RPC_URL}"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
mainnet = { key = "${ETHERSCAN_API_KEY}" }
polygon = { key = "${POLYGONSCAN_API_KEY}" }
arbitrum = { key = "${ARBISCAN_API_KEY}" }
optimism = { key = "${OPTIMISTIC_ETHERSCAN_API_KEY}" }
```

## Environment Setup

Create `.env.foundry`:

```env
# Deployment Keys
PRIVATE_KEY=0x...
DEPLOYER=0x1234...5678

# RPC Endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Block Explorer API Keys
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_KEY
ARBISCAN_API_KEY=YOUR_ARBISCAN_KEY
OPTIMISTIC_ETHERSCAN_API_KEY=YOUR_OPTIMISM_KEY
```

## Pre-Deployment Validation

The command performs:

1. **Script validation**: Checks deployment script syntax
2. **Build verification**: Compiles all contracts
3. **RPC connectivity**: Verifies network connection
4. **Account balance**: Ensures sufficient funds
5. **Simulation**: Runs dry simulation to estimate costs

## Deployment Workflow

```
1. Environment Check
   ├─ Load .env.foundry
   ├─ Validate RPC endpoint
   └─ Check deployer balance

2. Compilation
   ├─ Compile all contracts
   ├─ Verify no errors
   └─ Display gas estimates

3. Script Simulation
   ├─ Run script in simulation mode
   ├─ Show expected state changes
   └─ Display gas costs

4. User Confirmation
   ├─ Show transaction details
   ├─ Request approval
   └─ Offer to save deployment data

5. Broadcast (if --broadcast)
   ├─ Submit transactions
   ├─ Wait for confirmations
   └─ Log deployment addresses

6. Verification (if --verify)
   ├─ Submit to block explorer
   ├─ Poll for verification
   └─ Show verification URL
```

## Advanced Script Example

Create `script/DeployWithProxy.s.sol`:

```solidity
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployProxyScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy implementation
        MyToken implementation = new MyToken();

        // Deploy proxy
        bytes memory initData = abi.encodeCall(
            MyToken.initialize,
            ("MyToken", "MTK", 1000000e18)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        vm.stopBroadcast();

        console.log("Implementation:", address(implementation));
        console.log("Proxy:", address(proxy));
    }
}
```

## Output Example

```
Foundry Deployment
─────────────────

Network: sepolia
RPC: https://sepolia.infura.io/v3/...
Deployer: 0x1234...5678
Balance: 3.50 ETH

Compilation:
✓ MyToken.sol
✓ All contracts compiled

Simulation Results:
Gas Estimates:
  MyToken deployment: 850,000 gas
  Estimated cost: $28.50 USD

Transaction Details:
  From: 0x1234...5678
  Contract: MyToken
  Value: 0 ETH

Proceed with broadcast? [y/N]
> y

Broadcasting...
Transaction hash: 0xabcd...
Waiting for confirmations...
✓ Confirmed (Block 4567890)

Contract deployed to: 0x9999...1111

Verifying contract...
✓ Verified on Etherscan
Verification URL: https://sepolia.etherscan.io/address/0x9999...1111
```

## Best Practices

- **Use Foundry over Hardhat**: Better performance and gas reporting
- **Optimizer settings**: Set `optimizer_runs` to 999999 for production
- **Script organization**: Separate deployment scripts for different networks
- **Test scripts**: Run scripts with `forge script --sig "run()" script/Deploy.s.sol`
- **Keystore security**: Store private keys in encrypted keystores, not env files
- **Simulate first**: Always simulate with `--skip-simulation=false` before broadcast
- **Version pinning**: Lock solc version in foundry.toml for reproducibility
- **Gas profiling**: Use Foundry's gas profiling to optimize contracts

## Forge Commands Reference

```bash
# Compilation and checking
forge build                          # Compile all contracts
forge check                          # Static analysis

# Testing and scripting
forge test                           # Run tests
forge script script/Deploy.s.sol     # Simulate deployment
forge script script/Deploy.s.sol --broadcast  # Real deployment

# Verification and inspection
forge flatten src/MyToken.sol        # Flatten for verification
forge inspect MyToken storage        # Inspect contract storage
```

## Deployment Verification

```bash
# Verify after deployment
forge verify-contract \
  --compiler-version v0.8.19 \
  0x9999...1111 \
  src/MyToken.sol:MyToken
```

## Related Commands

- `/deploy-hardhat` - Deploy using Hardhat framework
- `/verify-contract` - Verify contract on Etherscan
- `/gas-report` - Analyze gas consumption
- `/test-coverage` - Run coverage analysis on contracts

## Notes

- **Performance**: Foundry is significantly faster than Hardhat
- **Gas accuracy**: Forge provides precise gas estimates
- **Solidity scripting**: Write deployments in Solidity, not JavaScript
- **No private keys in commits**: Use .env files and .gitignore
- **Reproducibility**: Lock compiler version for consistent deployments
