# Command: /generate-abi

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Generate and extract contract ABIs (Application Binary Interface) from Solidity source code

## Description

The `/generate-abi` command generates ABIs from Solidity contracts, essential for contract interaction, frontend integration, and verification. It handles both simple extraction from compiled outputs and custom ABI generation with flattening support.

This command is critical for dApp development, ensuring frontend applications can properly interact with deployed contracts through correctly formatted ABIs.

## Usage

```bash
/generate-abi [contract] [options]
```

## Options

- `--source-file` - Path to Solidity source file
- `--compiler-version` - Solc compiler version
- `--output` - Output file path
- `--format` - Output format (json, typescript, interface)
- `--include-natspec` - Include NatSpec documentation
- `--flatten` - Flatten multi-file contracts
- `--optimize` - Include optimization settings
- `--only-public` - Only public/external functions
- `--prettify` - Pretty-print JSON output
- `--extract-events` - Extract only event definitions
- `--extract-functions` - Extract only function definitions
- `--ts-types` - Generate TypeScript type definitions

## Arguments

- `contract` (required) - Contract name or path

## Examples

### Example 1: Generate ABI from Solidity file
```bash
/generate-abi MyToken --source-file ./src/MyToken.sol
```
Generates ABI from MyToken contract and saves to ABIs directory.

### Example 2: Generate TypeScript types
```bash
/generate-abi Vault --source-file ./src/Vault.sol --format typescript --ts-types
```
Creates TypeScript interfaces and type definitions for contract interaction.

### Example 3: Generate with documentation
```bash
/generate-abi Oracle --source-file ./src/Oracle.sol --include-natspec --prettify
```
Generates ABI with NatSpec comments and pretty JSON formatting.

### Example 4: Extract from compiled outputs
```bash
/generate-abi MyToken --format json --output ./abi/MyToken.json
```
Extracts ABI from compiled outputs in build output directory.

## Foundry ABI Generation

Build contracts and extract ABI:

```bash
forge build

# ABI is auto-generated in out/ directory
cat out/MyToken.sol/MyToken.json | jq '.abi' > abi/MyToken.json
```

Create helper script `scripts/generate-abi.sh`:

```bash
#!/bin/bash

CONTRACT_NAME=$1
OUTPUT_DIR="${2:-.}"

forge build
jq '.abi' "out/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json" > "${OUTPUT_DIR}/${CONTRACT_NAME}.json"

echo "ABI generated: ${OUTPUT_DIR}/${CONTRACT_NAME}.json"
```

## Hardhat ABI Generation

Hardhat auto-generates ABIs during compilation:

```bash
npx hardhat compile
```

ABIs are saved in `outputs/contracts/` directory:

```
outputs/
└── contracts/
    ├── MyToken.sol/
    │   └── MyToken.json (contains ABI)
    └── Vault.sol/
        └── Vault.json (contains ABI)
```

Extract and copy:

```bash
cp outputs/contracts/MyToken.sol/MyToken.json ./abi/MyToken.json
```

## ABI JSON Structure

Standard ABI format:

```json
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "initialSupply",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  }
]
```

## TypeScript Type Generation

Generate typed contract interface:

```typescript
export interface MyTokenABI {
  transfer: {
    name: "transfer";
    type: "function";
    inputs: [
      { name: "to"; type: "address" },
      { name: "amount"; type: "uint256" }
    ];
    outputs: [{ type: "bool" }];
    stateMutability: "nonpayable";
  };
  balanceOf: {
    name: "balanceOf";
    type: "function";
    inputs: [{ name: "account"; type: "address" }];
    outputs: [{ type: "uint256" }];
    stateMutability: "view";
  };
}

export interface MyTokenEvents {
  Transfer: {
    name: "Transfer";
    inputs: [
      { name: "from"; type: "address"; indexed: true },
      { name: "to"; type: "address"; indexed: true },
      { name: "value"; type: "uint256"; indexed: false }
    ];
  };
  Approval: {
    name: "Approval";
    inputs: [
      { name: "owner"; type: "address"; indexed: true },
      { name: "spender"; type: "address"; indexed: true },
      { name: "value"; type: "uint256"; indexed: false }
    ];
  };
}
```

## Using ethers.js with ABI

Frontend contract interaction:

```typescript
import { ethers } from "ethers";
import MyTokenABI from "./abi/MyToken.json";

const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY"
);

const contractAddress = "0x1234567890123456789012345678901234567890";
const contract = new ethers.Contract(contractAddress, MyTokenABI, provider);

// Read function
const balance = await contract.balanceOf("0xUser...");
console.log("Balance:", ethers.formatUnits(balance, 18));

// Write function (requires signer)
const signer = provider.getSigner();
const contractWithSigner = contract.connect(signer);
const tx = await contractWithSigner.transfer(
  "0xRecipient...",
  ethers.parseUnits("100", 18)
);
await tx.wait();
```

## Flattening Multi-File Contracts

Create flattened ABI for complex contracts:

```bash
# Using Foundry
forge flatten src/MyToken.sol > flattened/MyToken.sol

# Using Hardhat
npx hardhat flatten contracts/MyToken.sol > flattened/MyToken.sol
```

Then generate ABI from flattened file:

```bash
solc --abi --optimize flattened/MyToken.sol
```

## Output Example

```
ABI Generation
──────────────────────────────────────────────

Source File: src/MyToken.sol
Contract: MyToken
Compiler: solc 0.8.19

Analysis:
✓ Functions: 12
  ├─ 2 public state-changing
  ├─ 4 public view/pure
  ├─ 3 external payable
  └─ 3 internal
✓ Events: 4
  ├─ Transfer
  ├─ Approval
  ├─ Mint
  └─ Burn
✓ Custom types: 0

Generating ABI...
✓ Function signatures extracted
✓ Event definitions mapped
✓ Constructor arguments identified
✓ Modifiers documented

Output Formats:
✓ JSON: abi/MyToken.json (2.3 KB)
✓ TypeScript: abi/MyToken.ts (4.1 KB)
✓ HTML: docs/MyToken.html (8.5 KB)

Summary:
Functions: 12
Events: 4
Constructor: Yes
Fallback: No
Receive: No

NatSpec Documentation:
✓ @notice comments included
✓ @param descriptions added
✓ @return annotations mapped

TypeScript Interface Generated:
export interface MyTokenABI {
  transfer(to: string, amount: BigNumberish): Promise<ContractTransaction>;
  balanceOf(account: string): Promise<BigNumber>;
  approve(spender: string, amount: BigNumberish): Promise<ContractTransaction>;
  ...
}

Ready for Frontend Integration!
├─ Ethers.js compatible
├─ Web3.js compatible
├─ viem compatible
└─ TypeScript strict mode compatible
```

## Contract ABI Validation

Validate ABI before use:

```typescript
// Check function exists
const hasTransfer = abi.some(
  (item) => item.type === "function" && item.name === "transfer"
);

// Check event exists
const hasTransferEvent = abi.some(
  (item) => item.type === "event" && item.name === "Transfer"
);

// Validate function signature
const transferFunction = abi.find(
  (item) => item.type === "function" && item.name === "transfer"
);
const isCorrectSignature =
  transferFunction.inputs.length === 2 &&
  transferFunction.outputs[0].type === "bool";
```

## ABI Documentation Generation

Generate human-readable documentation:

```bash
# Using solc
solc --devdoc src/MyToken.sol --output-dir ./docs

# Output: MyToken.devdoc (for developers)
# Output: MyToken.userdoc (for users)
```

DevDoc example:

```json
{
  "kind": "dev",
  "methods": {
    "transfer(address,uint256)": {
      "author": "Example Author",
      "details": "Transfers tokens to another address",
      "params": {
        "to": "Recipient address",
        "amount": "Amount to transfer"
      },
      "returns": {
        "_0": "Success status"
      }
    }
  }
}
```

## ABI Best Practices

- **Keep ABIs updated**: Regenerate after contract changes
- **Version control**: Track ABI changes alongside code
- **Frontend testing**: Test ABI integration before deployment
- **Documentation**: Include NatSpec for clarity
- **Validation**: Verify ABI before using in production
- **Standard compliance**: Ensure ERC standard compliance
- **Event indexing**: Mark indexed parameters correctly
- **Error handling**: Document revert conditions

## Using TypeChain for Type Safety

Generate strongly-typed contract wrappers:

```bash
npm install --save-dev typechain @typechain/ethers-v6

# Generate types
typechain --target ethers-v6 'abi/**/*.json'
```

Output generates:

```typescript
import { MyToken } from "../typechain-types";

const contract: MyToken = new ethers.Contract(
  address,
  abi,
  signer
) as MyToken;

// Fully typed!
await contract.transfer(recipient, amount);
```

## Related Commands

- `/deploy-hardhat` - Deploy contracts
- `/deploy-foundry` - Foundry deployments
- `/verify-contract` - Contract verification
- `/code-review` - Review contract code

## Notes

- **ABI is contract interface**: Defines how external callers interact
- **Must match deployed code**: ABI must correspond to deployed contract
- **Immutable after deployment**: Cannot change contract interface
- **Standard formats**: JSON is universal standard
- **Debugging**: ABI mismatches cause runtime errors
- **Backwards compatibility**: Old ABIs may not work with new contracts
