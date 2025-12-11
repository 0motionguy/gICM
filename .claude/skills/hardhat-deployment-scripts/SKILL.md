---
name: hardhat-deployment-scripts
description: "Progressive disclosure skill: Quick reference in 42 tokens, expands to 4300 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [42, 4300]
---

# Hardhat Deployment Scripts

> Progressive disclosure skill: Quick reference in 42 tokens, expands to 4300 tokens

## Quick Reference (Load: 42 tokens)

Hardhat is Ethereum's development environment with built-in task system for deploying contracts, managing networks, and verifying code.

**Core patterns:**
- `hardhat.config.js` - Define networks and plugins
- `deployments/` - Track deployed addresses
- `scripts/deploy.js` - Contract deployment logic
- `verify.js` - Etherscan verification
- Network configs with RPC URLs and private keys

**Quick start:**
```bash
npx hardhat deploy --network mainnet
npx hardhat verify --network mainnet CONTRACT_ADDRESS "constructor args"
```

## Core Concepts (Expand: +500 tokens)

### Hardhat Configuration

Central config file for networks, accounts, and plugins:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

module.exports = {
  solidity: "0.8.24",

  networks: {
    hardhat: {
      // Local testing network
      allowUnlimitedContractSize: true,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },

  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
      mainnet: "0x...", // Override for mainnet
    },
  },
};
```

### Deployment Fundamentals

Deployment scripts handle contract instantiation and initialization:

**Key concepts:**
- `ethers.getContractFactory()` - Get contract ABI and bytecode
- `deploy()` - Create contract instance and broadcast tx
- Deployment tracking with hardhat-deploy plugin
- Constructor parameter validation
- Network-specific deployments

### Network Management

Different configurations for mainnet, testnets, and local:

**Mainnet:**
- Use RPC providers (Infura, Alchemy, QuickNode)
- Set appropriate gas prices
- Use funded accounts only
- Enable safety checks

**Testnets:**
- Faster feedback loop
- Faucets for test ETH
- Chain explorers for verification
- Cost-free testing

**Local:**
- Hardhat node for instant feedback
- Fork mainnet state for testing
- No RPC dependencies

### Gas Optimization Strategies

Deployment costs depend on:
- Bytecode size (contract complexity)
- Constructor parameters (fixed overhead + data)
- Network gas prices (fluctuate hourly)
- Gas limit and priority fees

```javascript
// Estimate deployment gas
const factory = await ethers.getContractFactory("MyContract");
const estimatedGas = await ethers.provider.estimateGas(
  factory.getDeployTransaction(arg1, arg2)
);
console.log("Estimated gas:", estimatedGas.toString());
```

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Basic Deployment Script

Standard deployment with validation and logging:

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy contract
  const MyContract = await ethers.getContractFactory("MyContract");
  const contract = await MyContract.deploy("initialOwner");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("MyContract deployed to:", contractAddress);

  // Verify deployment
  const code = await deployer.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }

  return { contract, contractAddress };
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

**Run deployment:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Pattern 2: Multi-Contract Deployment

Deploy interdependent contracts with proper ordering:

```javascript
// scripts/deployAll.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=== Starting Deployment ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);

  // Step 1: Deploy Token
  console.log("\n[1/3] Deploying Token...");
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy("MyToken", "MYT", ethers.parseEther("1000000"));
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("Token deployed:", tokenAddr);

  // Step 2: Deploy Staking contract
  console.log("\n[2/3] Deploying Staking...");
  const Staking = await ethers.getContractFactory("StakingPool");
  const staking = await Staking.deploy(tokenAddr);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("Staking deployed:", stakingAddr);

  // Step 3: Deploy Governor
  console.log("\n[3/3] Deploying Governor...");
  const Governor = await ethers.getContractFactory("MyGovernor");
  const governor = await Governor.deploy(
    tokenAddr,
    stakingAddr,
    100, // voting delay
    45818 // voting period
  );
  await governor.waitForDeployment();
  const governorAddr = await governor.getAddress();
  console.log("Governor deployed:", governorAddr);

  // Save addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    token: tokenAddr,
    staking: stakingAddr,
    governor: governorAddr,
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployments/${deployment.network}-${Date.now()}.json`,
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n=== Deployment Complete ===");
  console.log(JSON.stringify(deployment, null, 2));

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Pattern 3: Proxy Pattern Deployment

Deploy upgradeable contracts using UUPS proxy:

```javascript
// scripts/deployUpgradeable.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying upgradeable contract...");

  // Deploy proxy + implementation
  const MyContractV1 = await ethers.getContractFactory("MyContractV1");
  const proxy = await upgrades.deployProxy(MyContractV1, {
    initializer: "initialize",
  });

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("Proxy deployed to:", proxyAddress);
  console.log("Implementation:", await upgrades.erc1967.getImplementationAddress(proxyAddress));

  return proxyAddress;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Pattern 4: Contract Verification

Verify contract source on Etherscan:

```javascript
// scripts/verify.js
const { ethers } = require("hardhat");

async function verifyContract(address, constructorArgs = []) {
  try {
    console.log(`Verifying contract at ${address}...`);

    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });

    console.log("Contract verified successfully");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

// Or create verification file for later batch verification
async function saveVerificationData(address, contractName, args) {
  const fs = require("fs");
  const data = {
    address,
    contractName,
    constructorArguments: args,
    network: (await ethers.provider.getNetwork()).name,
  };

  fs.appendFileSync("verify.json", JSON.stringify(data) + "\n");
}

module.exports = { verifyContract, saveVerificationData };
```

### Pattern 5: Environment-Aware Deployment

Deploy different configurations per network:

```javascript
// scripts/deployEnv.js
const { ethers } = require("hardhat");

const NETWORK_CONFIG = {
  hardhat: {
    owner: "0x0000000000000000000000000000000000000000",
    initialSupply: ethers.parseEther("1000000"),
  },
  sepolia: {
    owner: process.env.SEPOLIA_OWNER || ethers.ZeroAddress,
    initialSupply: ethers.parseEther("100000"),
  },
  mainnet: {
    owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE", // DAO
    initialSupply: ethers.parseEther("10000000"),
  },
};

async function main() {
  const network = await ethers.provider.getNetwork();
  const config = NETWORK_CONFIG[network.name];

  if (!config) {
    throw new Error(`No config for network: ${network.name}`);
  }

  console.log(`Deploying to ${network.name}`);
  console.log("Config:", config);

  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(config.owner, config.initialSupply);

  await token.waitForDeployment();
  console.log("Token deployed:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Safe Deployment with Deterministic Addresses

Use CREATE2 for predictable addresses:

```javascript
// scripts/deployCreate2.js
const { ethers } = require("hardhat");

async function deployWithCreate2(contractName, args = [], salt = 0) {
  const Factory = await ethers.getContractFactory(contractName);

  // Calculate deployment address
  const deploymentData = Factory.getDeployTransaction(...args).data;
  const create2Factory = await ethers.getContractAt(
    "ICreate2Factory",
    "0x4e59b44847b379578588920eA3601C95577B7c3D" // CREATE2 deployer
  );

  const initCodeHash = ethers.keccak256(deploymentData);
  const saltBytes = ethers.zeroPadValue(
    ethers.toBeHex(salt),
    32
  );

  const predictedAddress = ethers.getCreate2Address(
    await create2Factory.getAddress(),
    saltBytes,
    initCodeHash
  );

  console.log("Predicted address:", predictedAddress);

  // Deploy
  const tx = await create2Factory.deploy(0, saltBytes, deploymentData);
  const receipt = await tx.wait();

  console.log("Deployed to:", receipt.contractAddress);
  return receipt.contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Technique 2: Deployment with State Initialization

Deploy and initialize complex state atomically:

```javascript
// scripts/deployWithInit.js
async function deployAndInit() {
  const [deployer] = await ethers.getSigners();

  // Deploy contract
  const Protocol = await ethers.getContractFactory("Protocol");
  const protocol = await Protocol.deploy();
  await protocol.waitForDeployment();
  const protocolAddr = await protocol.getAddress();

  // Initialize state
  console.log("Initializing protocol...");

  const initTx = await protocol.initialize(
    deployer.address,
    ethers.parseEther("0.1"), // minStake
    100, // protocolFee (in bps)
    3600, // cooldownPeriod
    ethers.ZeroAddress // treasury
  );

  await initTx.wait();
  console.log("Protocol initialized");

  // Verify initialization
  const isInit = await protocol.initialized();
  console.log("Initialized:", isInit);

  return protocolAddr;
}
```

### Technique 3: Batch Deployment with Parallelization

Deploy multiple contracts efficiently:

```javascript
// scripts/deployBatch.js
async function deployBatch(contracts) {
  const [deployer] = await ethers.getSigners();
  const deployed = {};

  console.log(`Deploying ${contracts.length} contracts in parallel...`);

  // Get all factories in parallel
  const factories = await Promise.all(
    contracts.map(c => ethers.getContractFactory(c.name))
  );

  // Deploy all in parallel
  const deployments = await Promise.all(
    factories.map((factory, i) => {
      console.log(`Deploying ${contracts[i].name}...`);
      return factory.deploy(...(contracts[i].args || []));
    })
  );

  // Wait for all confirmations
  const receipts = await Promise.all(
    deployments.map(d => d.waitForDeployment())
  );

  for (let i = 0; i < contracts.length; i++) {
    const address = await deployments[i].getAddress();
    deployed[contracts[i].name] = address;
    console.log(`${contracts[i].name}: ${address}`);
  }

  return deployed;
}

const contractsToDeploy = [
  { name: "Token", args: ["MyToken", "MYT"] },
  { name: "Router", args: [] },
  { name: "Factory", args: [] },
];

deployBatch(contractsToDeploy);
```

### Technique 4: Gas Price Management

Optimize deployment costs based on network conditions:

```javascript
// scripts/deployWithGasOptimization.js
async function estimateDeploymentCost(contractName, args = []) {
  const factory = await ethers.getContractFactory(contractName);
  const deployTx = factory.getDeployTransaction(...args);

  const provider = ethers.provider;
  const gasPrice = await provider.getGasPrice();
  const gasEstimate = await provider.estimateGas(deployTx);

  const deploymentCost = gasEstimate * gasPrice;

  console.log(`Gas estimate: ${gasEstimate.toString()}`);
  console.log(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  console.log(`Estimated cost: ${ethers.formatEther(deploymentCost)} ETH`);

  return { gasEstimate, gasPrice, deploymentCost };
}

async function deployWithGasOptimization(contractName, args = []) {
  const { gasEstimate, gasPrice } = await estimateDeploymentCost(contractName, args);

  // Add 10% buffer to gas estimate
  const bufferedGas = (gasEstimate * BigInt(110)) / BigInt(100);

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args, {
    gasLimit: bufferedGas,
    gasPrice: gasPrice,
  });

  const receipt = await contract.deploymentTransaction().wait();

  const actualCost = receipt.gasUsed * receipt.gasPrice;
  console.log(`Actual deployment cost: ${ethers.formatEther(actualCost)} ETH`);

  return contract;
}
```

### Technique 5: Deployment Verification Utilities

Comprehensive post-deployment checks:

```javascript
// scripts/verifyDeployment.js
async function verifyDeployment(contractAddress, expectedName) {
  const provider = ethers.provider;

  // 1. Check contract exists
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("No contract code at address");
  }

  // 2. Verify bytecode matches
  const contractFactory = await ethers.getContractFactory(expectedName);
  const expectedBytecode = contractFactory.bytecode;

  // Note: Runtime bytecode won't match due to metadata hash
  console.log("Contract deployed successfully");

  // 3. Check deployment block
  const tx = await provider.getTransaction(contractAddress);
  if (tx) {
    console.log("Deployment tx:", tx.hash);
  }

  // 4. Verify initialization state
  const contract = contractFactory.attach(contractAddress);
  const owner = await contract.owner?.();
  console.log("Owner:", owner);

  return true;
}

module.exports = { verifyDeployment };
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Full DeFi Protocol Deployment

Complete DEX/Staking deployment with verification:

```javascript
// scripts/deployDeFi.js
const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=== DeFi Protocol Deployment ===");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);

  const addresses = {};

  // 1. Deploy Token
  console.log("\n[1/5] Deploying governance token...");
  const Token = await ethers.getContractFactory("GovernanceToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  addresses.token = await token.getAddress();
  console.log("Token:", addresses.token);

  // 2. Deploy Factory
  console.log("\n[2/5] Deploying factory...");
  const Factory = await ethers.getContractFactory("PairFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  addresses.factory = await factory.getAddress();
  console.log("Factory:", addresses.factory);

  // 3. Deploy Router
  console.log("\n[3/5] Deploying router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(
    addresses.factory,
    ethers.ZeroAddress // WETH - replace in production
  );
  await router.waitForDeployment();
  addresses.router = await router.getAddress();
  console.log("Router:", addresses.router);

  // 4. Deploy Staking (Upgradeable)
  console.log("\n[4/5] Deploying staking contract...");
  const Staking = await ethers.getContractFactory("StakingPoolV1");
  const staking = await upgrades.deployProxy(Staking, [addresses.token], {
    initializer: "initialize",
    kind: "uups",
  });
  await staking.waitForDeployment();
  addresses.staking = await staking.getAddress();
  console.log("Staking:", addresses.staking);

  // 5. Deploy Governor
  console.log("\n[5/5] Deploying governance...");
  const Governor = await ethers.getContractFactory("Governor");
  const governor = await Governor.deploy(
    addresses.token,
    addresses.staking,
    45818, // 1 week
    1, // 1 block voting delay
    ethers.parseEther("10000") // proposal threshold
  );
  await governor.waitForDeployment();
  addresses.governor = await governor.getAddress();
  console.log("Governor:", addresses.governor);

  // Save deployment
  const deployment = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    addresses,
  };

  const filename = `deployments/defi-${network.name}-${Date.now()}.json`;
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));

  console.log("\n=== Deployment Complete ===");
  console.log(JSON.stringify(deployment, null, 2));

  // Verification tasks (deferred)
  console.log("\n=== Verification Instructions ===");
  for (const [name, address] of Object.entries(addresses)) {
    console.log(`npx hardhat verify --network ${network.name} ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Example 2: NFT Collection with Metadata

Deploy NFT contract with IPFS metadata:

```javascript
// scripts/deployNFT.js
const { ethers } = require("hardhat");

async function deployNFT(baseURI) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying NFT collection...");
  console.log("Base URI:", baseURI);

  // Deploy NFT contract
  const NFT = await ethers.getContractFactory("ERC721Collection");
  const nft = await NFT.deploy(
    "MyNFT",
    "MNFT",
    baseURI,
    ethers.parseEther("0.1") // mint price
  );

  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("NFT deployed:", nftAddress);

  // Initialize collection
  const initTx = await nft.initialize(deployer.address, 10000); // max supply
  await initTx.wait();

  // Test mint
  const mintTx = await nft.mint(1, { value: ethers.parseEther("0.1") });
  const mintReceipt = await mintTx.wait();
  console.log("Test mint successful");

  // Verify metadata
  const tokenURI = await nft.tokenURI(1);
  console.log("Token URI:", tokenURI);

  return nftAddress;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Example 3: Smart Contract Interaction After Deployment

Deploy and immediately interact with contract:

```javascript
// scripts/deployAndInteract.js
async function deployAndInteract() {
  const [owner, addr1] = await ethers.getSigners();

  // Deploy
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(ethers.parseEther("1000000"));
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();

  console.log("Token deployed:", tokenAddr);

  // Interact
  console.log("\nInitial supply:", await token.totalSupply());

  // Transfer tokens
  let tx = await token.transfer(addr1.address, ethers.parseEther("100"));
  await tx.wait();
  console.log("Transferred 100 tokens to addr1");

  // Check balance
  const balance = await token.balanceOf(addr1.address);
  console.log("addr1 balance:", ethers.formatEther(balance));

  // Approve
  tx = await token.connect(addr1).approve(tokenAddr, ethers.parseEther("50"));
  await tx.wait();
  console.log("Approved 50 tokens for spending");

  const allowance = await token.allowance(addr1.address, tokenAddr);
  console.log("Allowance:", ethers.formatEther(allowance));

  return tokenAddr;
}
```

## Best Practices

**Deployment Scripts**
- Always validate constructor arguments
- Check account balance before deployment
- Wait for confirmations before proceeding
- Log all addresses and tx hashes
- Store deployments in version control

**Network Configuration**
- Use environment variables for sensitive data
- Set different RPC providers for different networks
- Configure gas limits based on network
- Set timeouts for long-running deployments
- Use network-specific account management

**Verification**
- Save deployment data immediately after deploy
- Verify contracts on block explorers
- Document constructor arguments separately
- Enable source code visibility for transparency

**Gas Optimization**
- Estimate gas before deploying
- Use appropriate gas limits
- Monitor network gas prices
- Batch deployments when possible
- Optimize contract bytecode size

**Error Handling**
- Check RPC provider connectivity
- Validate account has sufficient balance
- Handle deployment timeouts gracefully
- Retry failed transactions appropriately
- Log detailed error messages

## Common Pitfalls

**Issue 1: Constructor Argument Type Mismatch**
```javascript
// ❌ Wrong - string instead of address
const token = await Token.deploy("0x...");

// ✅ Correct - proper type
const token = await Token.deploy(ethers.getAddress("0x..."));
```

**Issue 2: Missing Network Configuration**
```javascript
// ❌ Wrong - no networks defined
module.exports = { solidity: "0.8.24" };

// ✅ Correct - networks properly configured
module.exports = {
  solidity: "0.8.24",
  networks: {
    mainnet: { url: process.env.RPC_URL, accounts: [process.env.PK] }
  }
};
```

**Issue 3: Insufficient Account Balance**
```javascript
// ❌ Missing balance check
const contract = await Contract.deploy();

// ✅ Check balance first
const balance = await deployer.provider.getBalance(deployer);
if (balance < estimatedCost) throw new Error("Insufficient balance");
```

**Issue 4: Not Waiting for Confirmations**
```javascript
// ❌ Proceeding too fast
const tx = contract.deploy();
const addr = await contract.getAddress(); // May not be ready

// ✅ Wait for deployment
const deployed = await contract.waitForDeployment();
const addr = await deployed.getAddress();
```

**Issue 5: Hardcoded Addresses**
```javascript
// ❌ Wrong - hardcoded address
const usdc = await Token.attach("0x...");

// ✅ Correct - use environment or config
const usdc = await Token.attach(process.env.USDC_ADDRESS);
```

## Resources

**Official Documentation**
- [Hardhat Docs](https://hardhat.org/docs) - Complete framework guide
- [Hardhat Deploy Plugin](https://github.com/wighawag/hardhat-deploy) - Deploy system
- [Etherscan API](https://etherscan.io/apis) - Contract verification

**Related Skills**
- `ethersjs-v6-migration` - Ethers.js interaction patterns
- `solidity-gas-optimization` - Reduce deployment costs
- `web3-wallet-integration` - Signer management

**External Resources**
- [Hardhat Examples](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core/sample-projects) - Official samples
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/) - Production contracts
- [Ethereum Gas Tracker](https://ethgasstation.info/) - Real-time gas prices
