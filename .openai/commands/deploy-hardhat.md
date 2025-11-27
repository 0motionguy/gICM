# Command: /deploy-hardhat

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Deploy smart contracts to EVM networks using Hardhat with automated verification and gas optimization

## Description

The `/deploy-hardhat` command streamlines smart contract deployment on any EVM-compatible network using Hardhat. It handles network selection, gas estimation, deployment verification, and optional Etherscan verification in a single workflow.

This command is essential for smart contract development, enabling safe deployments with proper configuration management, environment validation, gas optimization, and automatic verification of contract code on block explorers.

## Usage

```bash
/deploy-hardhat [network] [options]
```

## Options

- `--verify` - Automatically verify contract on Etherscan after deployment
- `--constructor-args` - Path to constructor arguments JSON file
- `--gas-limit` - Override gas limit estimate
- `--gas-price` - Set custom gas price (in Gwei)
- `--wait-confirmations` - Number of confirmations to wait (default: 5)
- `--dry-run` - Simulate deployment without broadcasting
- `--skip-compile` - Skip Solidity compilation
- `--script` - Path to custom deployment script (default: scripts/deploy.ts)
- `--force` - Bypass safety checks
- `--tag` - Tag for tracking deployments

## Arguments

- `network` (optional) - Target network (hardhat, localhost, sepolia, mainnet, polygon, arbitrum, etc.)

## Examples

### Example 1: Deploy to Sepolia testnet
```bash
/deploy-hardhat sepolia --verify
```
Deploys contract to Sepolia with automatic Etherscan verification after 5 confirmations.

### Example 2: Deploy to mainnet with custom gas settings
```bash
/deploy-hardhat mainnet --gas-price 25 --wait-confirmations 12 --verify
```
Deploys to Ethereum mainnet with 25 Gwei gas price, waits 12 blocks, and verifies on Etherscan.

### Example 3: Dry-run deployment locally
```bash
/deploy-hardhat hardhat --dry-run
```
Simulates deployment on local Hardhat network to validate configuration without spending gas.

### Example 4: Deploy with constructor arguments
```bash
/deploy-hardhat polygon --constructor-args ./config/constructor-args.json --verify
```
Deploys to Polygon with constructor arguments from JSON file and verifies immediately.

## Pre-Deployment Checklist

The command performs these validation steps:

1. **Environment validation**: Checks `.env` file for required network keys
2. **Compilation check**: Compiles contracts and validates no errors
3. **Network connectivity**: Verifies connection to target RPC endpoint
4. **Account check**: Ensures deployer account has sufficient balance
5. **Gas estimation**: Calculates and displays estimated deployment cost

## Deployment Flow

```
1. Network Selection
   ├─ Validate network configuration
   ├─ Check RPC endpoint availability
   └─ Verify deployer account balance

2. Contract Compilation
   ├─ Check if compilation is needed
   ├─ Compile with optimization settings
   └─ Validate no compilation errors

3. Gas Estimation
   ├─ Estimate deployment gas
   ├─ Calculate total cost in USD
   └─ Display cost breakdown

4. User Confirmation
   ├─ Show deployment details
   ├─ Request approval to proceed
   └─ Optional: Run in dry-run mode first

5. Deployment
   ├─ Submit transaction to network
   ├─ Wait for confirmations
   └─ Log transaction hash and address

6. Verification (if --verify)
   ├─ Submit source code to Etherscan
   ├─ Wait for verification
   └─ Display verified contract URL
```

## Configuration

Add to your `hardhat.config.ts`:

```typescript
const config: HardhatUserConfig = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      chainId: 1,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

Create `.env`:

```env
DEPLOYER_PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

## Example Deployment Script

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from: ${deployer.address}`);

  const Contract = await ethers.getContractFactory("MyToken");
  const contract = await Contract.deploy("MyToken", "MTK");
  await contract.deployed();

  console.log(`Deployed to: ${contract.address}`);
  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Output Example

```
Network: sepolia
RPC: https://sepolia.infura.io/v3/...
Deployer: 0x1234...5678
Balance: 2.50 ETH

Compilation Status:
✓ MyToken.sol compiled
✓ All contracts valid

Gas Estimation:
Estimated gas: 850,000 units
Gas price: 20 Gwei
Estimated cost: $25.50 USD

Proceed with deployment? [y/N]
> y

Deploying MyToken...
Transaction hash: 0xabcd...
Waiting for 5 confirmations...
✓ Confirmed (Block 4567890)

Contract deployed to: 0x9999...1111
Verification: Pending...
✓ Verified on Etherscan
```

## Best Practices

- **Test first**: Always deploy to testnet before mainnet
- **Code review**: Have another developer review deployment scripts
- **Verify immediately**: Use `--verify` to catch code mismatch early
- **Save addresses**: Document deployed contract addresses with dates
- **Check balance**: Ensure deployer has sufficient funds before mainnet deployment
- **Use constructor args file**: Document constructor arguments for future reference
- **Environment management**: Never commit private keys; use environment variables
- **Dry-run for mainnet**: Always run `--dry-run` for mainnet deployments first

## Network Configuration Reference

```
Testnet Networks:
- sepolia (ChainID: 11155111) - Recommended for testing
- goerli (ChainID: 5) - Legacy testnet
- amoy (ChainID: 80002) - Polygon testnet

Mainnet Networks:
- mainnet (ChainID: 1) - Ethereum L1
- polygon (ChainID: 137) - Polygon
- arbitrum (ChainID: 42161) - Arbitrum One
- optimism (ChainID: 10) - Optimism
- base (ChainID: 8453) - Base
```

## Troubleshooting

- **Insufficient funds**: "Transaction underpriced" - Add more ETH to deployer
- **RPC timeout**: Check network connectivity and RPC endpoint health
- **Verification fails**: Ensure compiler version and settings match exactly
- **Constructor args mismatch**: Validate JSON format in constructor-args file

## Related Commands

- `/deploy-foundry` - Deploy using Foundry framework
- `/verify-contract` - Verify contract on Etherscan
- `/gas-report` - Analyze gas consumption
- `/code-review` - Review deployment scripts before deployment

## Notes

- **Immutable**: Smart contract deployments are permanent and cannot be modified
- **Gas costs**: Mainnet deployments cost real ETH; verify in dry-run mode first
- **Chain stability**: Some networks may experience congestion affecting deployment time
- **Network selection**: Ensure private key matches expected network (testnet vs mainnet)
- **Verification key**: Requires Etherscan API key for automatic verification
