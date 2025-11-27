# Ethers.js v6 Migration

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 45 tokens, expands to 4400 tokens

## Quick Reference (Load: 45 tokens)

Ethers.js v6 is a complete rewrite with breaking changes: BigNumber removed, JsonRpcProvider replaces ethers.providers, contract factories simplified, and BigInt native support.

**Key breaking changes:**
- `BigNumber` → `BigInt` (native JS)
- `ethers.provider` → `JsonRpcProvider` constructor
- `Contract.attach()` returns instance directly
- `ethers.utils` utilities moved or renamed
- Event filter and listener API changes

**Quick migration:**
```javascript
// v5: const ethers = require('ethers')
// v6:
import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider(RPC_URL);
const balance = await provider.getBalance(address); // Returns BigInt
```

## Core Concepts (Expand: +500 tokens)

### Number Handling: BigNumber to BigInt

v6 uses native JavaScript BigInt instead of BigNumber:

**BigNumber (v5):**
```javascript
const balance = ethers.BigNumber.from("1000000000000000000");
const result = balance.mul(2);
const string = balance.toString();
```

**BigInt (v6):**
```javascript
const balance = BigInt("1000000000000000000");
const result = balance * BigInt(2);
const string = balance.toString();

// Or use ethers helpers:
const balance = ethers.parseEther("1.0"); // Returns BigInt
const formatted = ethers.formatEther(balance); // Returns string
```

**Key differences:**
- No methods on BigInt (use operators: `+`, `-`, `*`, `/`, `%`)
- Ethers provides `parseUnits()`, `formatUnits()` for conversions
- All contract values return BigInt
- Can't mix BigInt with Number

### Provider Architecture

Complete redesign of provider system:

**v5 structure:**
```javascript
const provider = ethers.getDefaultProvider("mainnet");
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(pk, provider);
```

**v6 structure:**
```javascript
// Standard provider
const provider = new ethers.JsonRpcProvider(rpcUrl, chainId, {
  staticNetwork: true,
  polling: { interval: 12000 },
});

// Abstract signers
const wallet = new ethers.Wallet(pk, provider);
const browserSigner = await window.ethereum.request({...}); // BrowserProvider
```

**Provider improvements:**
- Single `JsonRpcProvider` for RPC connections
- Built-in polling configuration
- Better error handling
- Automatic network detection

### Contract Interactions

Simplified contract factory and interaction patterns:

**v5:**
```javascript
const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy(...args);

const instance = new ethers.Contract(address, abi, signer);
```

**v6:**
```javascript
const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy(...args);

const instance = new ethers.Contract(address, abi, signer);
// Same API but under the hood improved
```

### Utility Function Changes

Many utils moved or renamed:

```javascript
// v5 vs v6 utilities
ethers.utils.getAddress() → ethers.getAddress()
ethers.utils.toChecksumAddress() → ethers.getAddress()
ethers.utils.parseEther() → ethers.parseEther()
ethers.utils.formatEther() → ethers.formatEther()
ethers.utils.keccak256() → ethers.keccak256()
ethers.utils.solidityKeccak256() → ethers.solidityKeccak256()
ethers.utils.id() → ethers.id()
ethers.utils.toBeHex() → ethers.toBeHex()
ethers.utils.AbiCoder → ethers.AbiCoder
```

### Type System

Improved TypeScript support:

**v5:**
```typescript
const balance: ethers.BigNumber = await provider.getBalance(address);
const value = ethers.BigNumber.from(amount);
```

**v6:**
```typescript
const balance: bigint = await provider.getBalance(address);
const value = BigInt(amount);
type Address = string; // Just a string
interface TransactionResponse { /* ... */ }
```

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Basic Migration from v5

Step-by-step conversion of simple v5 code:

```javascript
// ===== v5 CODE =====
const ethers = require('ethers');

async function getBalance(address) {
  const provider = ethers.getDefaultProvider('mainnet');
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

async function sendTransaction(pk, to, amount) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(pk, provider);

  const tx = await signer.sendTransaction({
    to: to,
    value: ethers.utils.parseEther(amount),
  });

  const receipt = await tx.wait();
  return receipt;
}

// ===== v6 CODE (MIGRATED) =====
import { ethers } from 'ethers';

async function getBalance(address) {
  const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/...');
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance); // Utils moved to top level
}

async function sendTransaction(pk, to, amount) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(pk, provider);

  const tx = await signer.sendTransaction({
    to: to,
    value: ethers.parseEther(amount), // Utility moved
  });

  const receipt = await tx.wait(); // Same API
  return receipt;
}
```

### Pattern 2: Contract Interaction Migration

Update contract instance creation:

```javascript
// ===== v5 CODE =====
const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
const balance = await contract.balanceOf(userAddress);
const decimals = await contract.decimals();

const tx = await contract.transfer(recipient, ethers.utils.parseUnits('100', decimals));
const receipt = await tx.wait();

// ===== v6 CODE =====
const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
const balance = await contract.balanceOf(userAddress); // Returns bigint
const decimals = await contract.decimals(); // Returns bigint

const tx = await contract.transfer(
  recipient,
  ethers.parseUnits('100', decimals) // decimals already bigint
);
const receipt = await tx.wait();
```

### Pattern 3: BigNumber Operations

Convert mathematical operations:

```javascript
// ===== v5 CODE =====
function calculatePriceImpact(inputAmount, reserveIn, reserveOut) {
  const inputWithFee = inputAmount.mul(997); // BigNumber
  const numerator = inputWithFee.mul(reserveOut);
  const denominator = reserveIn.mul(1000).add(inputWithFee);

  return numerator.div(denominator);
}

// ===== v6 CODE =====
function calculatePriceImpact(inputAmount, reserveIn, reserveOut) {
  // All values are now bigint
  const inputWithFee = inputAmount * BigInt(997);
  const numerator = inputWithFee * reserveOut;
  const denominator = reserveIn * BigInt(1000) + inputWithFee;

  return numerator / denominator;
}
```

### Pattern 4: Event Listening Migration

Updated event filter and listener API:

```javascript
// ===== v5 CODE =====
contract.on('Transfer', (from, to, amount, event) => {
  console.log(`Transferred ${amount} from ${from} to ${to}`);
});

contract.once('Approval', (owner, spender, amount) => {
  console.log(`Approved ${amount}`);
});

// ===== v6 CODE =====
contract.on('Transfer', (from, to, amount, event) => {
  console.log(`Transferred ${amount} from ${from} to ${to}`);
});

contract.once('Approval', (owner, spender, amount) => {
  console.log(`Approved ${amount}`);
});

// Or use filters
const filter = contract.filters.Transfer(userAddress);
const events = await contract.queryFilter(filter, startBlock, endBlock);
```

### Pattern 5: Signer Management

Update signer creation and usage:

```javascript
// ===== v5 CODE =====
const signer = new ethers.Wallet(privateKey, provider);
const address = signer.address;

const signedMessage = await signer.signMessage(message);
const recoveredAddress = ethers.utils.verifyMessage(message, signedMessage);

// ===== v6 CODE =====
const signer = new ethers.Wallet(privateKey, provider);
const address = signer.address; // Same

const signedMessage = await signer.signMessage(
  ethers.toUtf8Bytes(message) // Must encode message
);
const recoveredAddress = ethers.verifyMessage(
  ethers.toUtf8Bytes(message),
  signedMessage
);
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Type-Safe Contract Interaction

Use TypeChain or ethers.TypedContract:

```typescript
// With TypeChain generation
import type { ERC20 } from './typechain-types';

async function interactWithToken(address: string, provider: ethers.Provider) {
  const token: ERC20 = ERC20__factory.connect(address, provider);

  // Type-safe contract calls
  const balance: bigint = await token.balanceOf(address);
  const decimals: bigint = await token.decimals();

  return ethers.formatUnits(balance, decimals);
}

// Manual typing
interface IERC20 {
  balanceOf(account: string): Promise<bigint>;
  transfer(to: string, amount: bigint): Promise<{ hash: string }>;
  decimals(): Promise<bigint>;
}

const token = new ethers.Contract(address, ERC20_ABI, signer) as IERC20;
const balance = await token.balanceOf(userAddress);
```

### Technique 2: Batch Operations with Multicall

Efficient batch querying:

```javascript
import { ethers } from 'ethers';

async function batchTokenQueries(tokenAddresses, userAddress, provider) {
  const multicallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11'; // Multicall3
  const multicall = new ethers.Contract(
    multicallAddress,
    MULTICALL_ABI,
    provider
  );

  const calls = tokenAddresses.map(token => ({
    target: token,
    callData: new ethers.Contract(
      token,
      ERC20_ABI,
      provider
    ).interface.encodeFunctionData('balanceOf', [userAddress]),
  }));

  const [blockNumber, returnData] = await multicall.aggregate3([
    ...calls.map(call => ({
      ...call,
      allowFailure: true,
    })),
  ]);

  return returnData.map((data, i) => {
    const iface = new ethers.Contract(tokenAddresses[i], ERC20_ABI).interface;
    const [balance] = iface.decodeFunctionResult('balanceOf', data.returnData);
    return balance;
  });
}
```

### Technique 3: Gas Estimation and Optimization

Improved gas calculation in v6:

```javascript
async function optimizeTransactionGas(signer, contractCall) {
  const provider = signer.provider;

  // Get current gas price
  const feeData = await provider.getFeeData();
  console.log('Max fee per gas:', ethers.formatUnits(feeData.maxFeePerGas, 'gwei'));
  console.log('Max priority fee:', ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'));

  // Estimate gas
  const estimatedGas = await contractCall.estimateGas({
    from: await signer.getAddress(),
  });

  // Add buffer
  const gasLimit = (estimatedGas * BigInt(110)) / BigInt(100);

  return {
    gasLimit,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  };
}

async function sendOptimizedTransaction(signer, tx) {
  const gasData = await optimizeTransactionGas(signer, tx);

  const response = await signer.sendTransaction({
    ...tx,
    ...gasData,
  });

  return response.wait();
}
```

### Technique 4: Custom Error Handling

Better error detection in v6:

```javascript
import { ethers } from 'ethers';

async function executeWithErrorHandling(contract, functionCall) {
  try {
    const tx = await functionCall();
    return await tx.wait();
  } catch (error) {
    // Parse different error types
    if (error instanceof ethers.ContractTransactionResponse) {
      console.error('Transaction reverted:', error);
    } else if (error instanceof ethers.JsonRpcError) {
      console.error('RPC error:', error.code, error.message);
    } else if (error instanceof ethers.EnsError) {
      console.error('ENS resolution failed:', error);
    } else if (error instanceof ethers.NetworkError) {
      console.error('Network error:', error);
    } else {
      console.error('Unknown error:', error);
    }

    throw error;
  }
}

// Decode revert reasons
function decodeRevertReason(error) {
  if (error.data && error.data.startsWith('0x')) {
    const reason = ethers.toUtf8String('0x' + error.data.slice(138));
    return reason;
  }
  return null;
}
```

### Technique 5: Advanced Signing and Verification

EIP-712 typed data signing:

```javascript
const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

const Permit = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

async function signPermit(signer, domain, permit) {
  const signature = await signer.signTypedData(domain, { Permit }, permit);

  const sig = ethers.Signature.from(signature);
  return {
    v: sig.v,
    r: sig.r,
    s: sig.s,
  };
}

async function verifyPermit(domain, permit, signature) {
  const recovered = ethers.verifyTypedData(
    domain,
    { Permit },
    permit,
    signature
  );

  return recovered === permit.owner;
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete Token Interaction Migration

Full v5 → v6 migration of token swapping logic:

```javascript
// ===== v5 TOKEN SWAPPER =====
const { ethers } = require('ethers');

class TokenSwapper {
  constructor(routerAddress, privateKey, rpcUrl) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.router = new ethers.Contract(routerAddress, ROUTER_ABI, this.signer);
  }

  async swapExactTokensForTokens(
    amountIn,
    minAmountOut,
    path,
    deadline
  ) {
    const parsedAmountIn = ethers.utils.parseUnits(amountIn, 18);

    const tx = await this.router.swapExactTokensForTokens(
      parsedAmountIn,
      ethers.utils.parseUnits(minAmountOut, 18),
      path,
      this.signer.address,
      deadline
    );

    const receipt = await tx.wait();
    return receipt;
  }

  async getAmountsOut(amountIn, path) {
    const parsedAmount = ethers.utils.parseUnits(amountIn, 18);
    const amounts = await this.router.getAmountsOut(parsedAmount, path);
    return amounts.map(a => ethers.utils.formatUnits(a, 18));
  }
}

// ===== v6 TOKEN SWAPPER (MIGRATED) =====
import { ethers } from 'ethers';

class TokenSwapper {
  constructor(routerAddress, privateKey, rpcUrl) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.router = new ethers.Contract(routerAddress, ROUTER_ABI, this.signer);
  }

  async swapExactTokensForTokens(
    amountIn,
    minAmountOut,
    path,
    deadline
  ) {
    const parsedAmountIn = ethers.parseUnits(amountIn, 18); // Returns bigint

    const tx = await this.router.swapExactTokensForTokens(
      parsedAmountIn,
      ethers.parseUnits(minAmountOut, 18),
      path,
      this.signer.address,
      deadline
    );

    const receipt = await tx.wait();
    return receipt;
  }

  async getAmountsOut(amountIn, path) {
    const parsedAmount = ethers.parseUnits(amountIn, 18);
    const amounts = await this.router.getAmountsOut(parsedAmount, path);
    return amounts.map(a => ethers.formatUnits(a, 18)); // Returns string
  }
}
```

### Example 2: DeFi Protocol Interaction

Complete DEX swap with contract calls:

```javascript
import { ethers } from 'ethers';

async function executeSwap(
  tokenInAddress,
  tokenOutAddress,
  amountIn,
  minAmountOut,
  slippage = 0.5
) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  // Get token contracts
  const tokenIn = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);
  const tokenOut = new ethers.Contract(tokenOutAddress, ERC20_ABI, signer);

  // Get decimals
  const decimalsIn = await tokenIn.decimals();
  const decimalsOut = await tokenOut.decimals();

  // Parse amount
  const parsedAmountIn = ethers.parseUnits(amountIn, decimalsIn);

  // Check approval
  const allowance = await tokenIn.allowance(
    signer.address,
    ROUTER_ADDRESS
  );

  if (allowance < parsedAmountIn) {
    console.log('Approving token...');
    const approveTx = await tokenIn.approve(
      ROUTER_ADDRESS,
      ethers.MaxUint256
    );
    await approveTx.wait();
  }

  // Prepare swap
  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
  const minParsedOut = ethers.parseUnits(minAmountOut, decimalsOut);

  // Execute swap
  console.log('Executing swap...');
  const swapTx = await router.swapExactTokensForTokens(
    parsedAmountIn,
    minParsedOut,
    [tokenInAddress, tokenOutAddress],
    signer.address,
    Math.floor(Date.now() / 1000) + 60 * 20 // 20 min deadline
  );

  const receipt = await swapTx.wait();
  console.log('Swap complete:', receipt.hash);

  // Get output amount
  const finalBalance = await tokenOut.balanceOf(signer.address);
  const formattedOutput = ethers.formatUnits(finalBalance, decimalsOut);

  return {
    txHash: receipt.hash,
    amountOut: formattedOutput,
  };
}
```

### Example 3: NFT Interaction Migration

Complete NFT minting and trading:

```javascript
import { ethers } from 'ethers';

class NFTTrader {
  constructor(collectionAddress, privateKey, rpcUrl) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.collection = new ethers.Contract(
      collectionAddress,
      ERC721_ABI,
      this.signer
    );
  }

  async mint(uri, paymentAmount) {
    const tx = await this.collection.mint(uri, {
      value: ethers.parseEther(paymentAmount),
    });

    const receipt = await tx.wait();
    const event = receipt.logs[0]; // Get transfer event

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };
  }

  async transfer(to, tokenId) {
    const tx = await this.collection.transferFrom(
      this.signer.address,
      to,
      tokenId
    );

    return tx.wait();
  }

  async approve(operator, tokenId) {
    const tx = await this.collection.approve(operator, tokenId);
    return tx.wait();
  }

  async setApprovalForAll(operator, approved = true) {
    const tx = await this.collection.setApprovalForAll(operator, approved);
    return tx.wait();
  }

  async listOnMarketplace(tokenId, marketplaceAddress, price) {
    // First approve marketplace
    await this.approve(marketplaceAddress, tokenId);

    // Then list
    const marketplace = new ethers.Contract(
      marketplaceAddress,
      MARKETPLACE_ABI,
      this.signer
    );

    const tx = await marketplace.list(
      this.collection.target,
      tokenId,
      ethers.parseEther(price)
    );

    return tx.wait();
  }
}
```

## Best Practices

**Numeric Handling**
- Use BigInt for all contract values
- Use parseUnits() for user input
- Use formatUnits() for display
- Avoid Number type for large values
- Be explicit about decimal places

**Provider Configuration**
- Always specify RPC URL explicitly
- Configure polling intervals
- Set staticNetwork for known networks
- Handle network switches gracefully
- Use fallback providers for reliability

**Contract Interaction**
- Always import types with TypeChain
- Use contract.target for address
- Handle all possible error types
- Estimate gas before sending
- Add buffer to gas estimates

**Error Handling**
- Check error instanceof types
- Parse revert reasons when possible
- Log gas used for debugging
- Handle network timeouts
- Retry with exponential backoff

**Security**
- Store private keys in environment variables
- Use ethers.ZeroAddress for null checks
- Validate all user input
- Check allowances before transfers
- Verify signatures with verifyMessage()

## Common Pitfalls

**Issue 1: Forgetting BigInt Type Conversions**
```javascript
// ❌ Wrong - type mismatch
const amount = "1000000000000000000";
const tx = await contract.transfer(recipient, amount); // Wrong type

// ✅ Correct - explicit conversion
const amount = ethers.parseEther("1.0"); // BigInt
const tx = await contract.transfer(recipient, amount);
```

**Issue 2: Missing Message Encoding**
```javascript
// ❌ Wrong - can't sign raw string
const sig = await signer.signMessage("hello");

// ✅ Correct - encode first
const sig = await signer.signMessage(ethers.toUtf8Bytes("hello"));
```

**Issue 3: Comparing BigInt with Number**
```javascript
// ❌ Wrong - comparing different types
if (balance > 1000) { } // balance is bigint, 1000 is number

// ✅ Correct - same types
if (balance > BigInt(1000)) { }
if (balance > 1000n) { }
```

**Issue 4: Not Waiting for Deployment**
```javascript
// ❌ Wrong - may not be deployed
const contract = await factory.deploy();
const value = await contract.someFunction();

// ✅ Correct - wait for deployment
const contract = await factory.deploy();
await contract.waitForDeployment();
const value = await contract.someFunction();
```

**Issue 5: Hardcoded Addresses**
```javascript
// ❌ Wrong - what if network changes?
const router = new ethers.Contract("0x1111...", ROUTER_ABI, signer);

// ✅ Correct - network-aware
const ROUTER_ADDRESSES = {
  1: "0x...", // mainnet
  11155111: "0x...", // sepolia
};
const chainId = (await provider.getNetwork()).chainId;
const routerAddr = ROUTER_ADDRESSES[chainId];
```

## Resources

**Official Documentation**
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/) - Complete reference
- [Migration Guide](https://docs.ethers.org/v6/migration/) - Step-by-step guide
- [API Reference](https://docs.ethers.org/v6/api/) - Full API docs

**Related Skills**
- `hardhat-deployment-scripts` - Hardhat integration
- `web3-wallet-integration` - Signer patterns
- `uniswap-v3-liquidity-math` - Complex interactions

**External Resources**
- [Ethers.js GitHub](https://github.com/ethers-io/ethers.js) - Source code
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/) - ABIs
- [TypeChain](https://github.com/dethcrypto/TypeChain) - Type generation
