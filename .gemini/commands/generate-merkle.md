# Command: /generate-merkle

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Generate Merkle trees and proofs for whitelist verification, airdrops, and data verification

## Description

The `/generate-merkle` command creates Merkle trees from lists of addresses, amounts, or arbitrary data, generating proofs for efficient on-chain verification. It handles multi-level trees, supports different hashing strategies, generates Solidity-compatible proofs, and creates comprehensive merkle tree documentation with verification examples.

This command is essential for efficient airdrops, whitelist management, batch claims, and any application requiring proof-based verification of large datasets.

## Usage

```bash
/generate-merkle [data-file] [options]
```

## Arguments

- `data-file` - Path to CSV/JSON with data to merkle (required)
- `--format` - Input format: `csv`, `json` (default: auto-detect)
- `--amount-column` - Column name for amounts (default: auto-detect)
- `--address-column` - Column name for addresses (default: auto-detect)
- `--hash-function` - Hashing: `keccak256` (default), `sha256`
- `--output` - Output directory for merkle outputs
- `--generate-contract` - Create Solidity verification contract
- `--output-format` - Format: `json`, `solidity`, `hardhat` (default: json)
- `--proof-length` - Limit proof size (limit verification gas)
- `--sort-by` - Sort data before merkle: `address`, `amount`, `natural`
- `--create-fixtures` - Generate test fixtures for Foundry

## Examples

### Example 1: Simple airdrop whitelist
```bash
/generate-merkle whitelist.csv \
  --address-column address \
  --amount-column amount \
  --output merkle_whitelist
```

Input file (whitelist.csv):
```
address,amount,name
0x1111...1111,1000,Alice
0x2222...2222,500,Bob
0x3333...3333,750,Carol
0x4444...4444,1250,David
```

Output structure:
```
merkle_whitelist/
├── merkle.json (root, tree, proofs)
├── addresses.json (participant list)
├── verification.md (documentation)
└── test/
    └── MerkleVerifier.test.ts
```

merkle.json:
```json
{
  "merkleRoot": "0x1234567890abcdef...",
  "totalAmount": 3500,
  "totalParticipants": 4,
  "tree": [
    "0x1234567890abcdef...",
    "0x2345678901bcdef0...",
    "0x3456789012cdef01...",
    "0x4567890123def012..."
  ],
  "proofs": {
    "0x1111...1111": [
      "0x2345678901bcdef0...",
      "0x4567890123def012..."
    ],
    "0x2222...2222": [
      "0x1234567890abcdef...",
      "0x3456789012cdef01..."
    ],
    "0x3333...3333": [
      "0x1234567890abcdef...",
      "0x4567890123def012..."
    ],
    "0x4444...4444": [
      "0x2345678901bcdef0...",
      "0x3456789012cdef01..."
    ]
  }
}
```

### Example 2: Large-scale airdrop with Solidity contract
```bash
/generate-merkle airdrop-data.json \
  --format json \
  --amount-column claimAmount \
  --generate-contract \
  --output-format solidity
```

Generated contract (AirdropVerifier.sol):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AirdropVerifier {
    bytes32 public merkleRoot = 0x1234567890abcdef...;

    IERC20 public token;
    mapping(address => bool) public claimed;

    event Claimed(address indexed user, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function claim(uint256 amount, bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid proof"
        );

        claimed[msg.sender] = true;
        token.transfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    function isEligible(address user, uint256 amount, bytes32[] calldata proof)
        external
        view
        returns (bool)
    {
        if (claimed[user]) return false;

        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
```

### Example 3: Multi-level distribution
```bash
/generate-merkle distributions.json \
  --generate-contract \
  --output multi_merkle
```

Input (distributions.json):
```json
[
  {
    "amount": 1000,
    "address": "0x1111...1111",
    "tier": "gold"
  },
  {
    "amount": 500,
    "address": "0x2222...2222",
    "tier": "silver"
  },
  {
    "amount": 250,
    "address": "0x3333...3333",
    "tier": "bronze"
  }
]
```

Output:
```
Multi-Level Merkle Tree
=======================

Tier Distribution:
──────────────────
GOLD (1 participant):
  Total amount: 1,000
  Merkle root: 0x1234...

SILVER (1 participant):
  Total amount: 500
  Merkle root: 0x5678...

BRONZE (1 participant):
  Total amount: 250
  Merkle root: 0x9abc...

COMBINED ROOT: 0xdef0...

Usage:
  1. Deploy separate verifier per tier (or combined)
  2. Use tier-specific merkle root
  3. Participants claim from appropriate tier
  4. Different claim rates possible per tier
```

### Example 4: Proof verification and testing
```bash
/generate-merkle addresses.csv \
  --create-fixtures \
  --output test_merkles
```

Generated test fixture (MerkleFixture.sol):
```solidity
// test/fixtures/MerkleFixture.sol
pragma solidity ^0.8.20;

contract MerkleFixture {
    bytes32 constant MERKLE_ROOT =
        0x1234567890abcdef...;

    address constant USER_0 = 0x1111...1111;
    uint256 constant AMOUNT_0 = 1000;
    bytes32[] constant PROOF_0 = [
        bytes32(0x2345678901bcdef0...),
        bytes32(0x4567890123def012...)
    ];

    address constant USER_1 = 0x2222...2222;
    uint256 constant AMOUNT_1 = 500;
    bytes32[] constant PROOF_1 = [
        bytes32(0x1234567890abcdef...),
        bytes32(0x3456789012cdef01...)
    ];

    function testProofValidity() internal view {
        // Verify proofs work as expected
        require(verifyProof(USER_0, AMOUNT_0, PROOF_0));
        require(verifyProof(USER_1, AMOUNT_1, PROOF_1));
    }

    function verifyProof(
        address user,
        uint256 amount,
        bytes32[] memory proof
    ) internal pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        return MerkleProof.verify(proof, MERKLE_ROOT, leaf);
    }
}
```

Generated test file:
```solidity
// test/Merkle.test.ts
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

describe('Merkle Verification', () => {
    let merkleRoot: string;
    let tree: MerkleTree;

    beforeAll(() => {
        const leaves = [
            keccak256('0x1111...1111' + '1000'),
            keccak256('0x2222...2222' + '500'),
            keccak256('0x3333...3333' + '750'),
            keccak256('0x4444...4444' + '1250'),
        ];

        tree = new MerkleTree(leaves, keccak256, {
            sortPairs: true,
        });

        merkleRoot = tree.getRoot().toString('hex');
    });

    it('should verify valid proofs', () => {
        const leaf = keccak256('0x1111...1111' + '1000');
        const proof = tree.getProof(leaf);

        expect(tree.verify(proof, leaf, merkleRoot)).toBe(true);
    });

    it('should reject invalid proofs', () => {
        const leaf = keccak256('0x1111...1111' + '999'); // Wrong amount
        const proof = tree.getProof(leaf);

        expect(tree.verify(proof, leaf, merkleRoot)).toBe(false);
    });

    it('should handle all participants', () => {
        const participants = [
            { address: '0x1111...1111', amount: 1000 },
            { address: '0x2222...2222', amount: 500 },
            { address: '0x3333...3333', amount: 750 },
            { address: '0x4444...4444', amount: 1250 },
        ];

        for (const participant of participants) {
            const leaf = keccak256(
                participant.address + participant.amount
            );
            const proof = tree.getProof(leaf);

            expect(tree.verify(proof, leaf, merkleRoot)).toBe(true);
        }
    });
});
```

## Best Practices

- **Always sort consistently**: Use same sort order for tree generation
- **Test proofs first**: Verify all proofs before deployment
- **Save original data**: Keep CSV/JSON for audit trail
- **Version merkle roots**: Track root changes across versions
- **Publish proofs**: Distribute proofs off-chain to users
- **Validate format**: Ensure address/amount format consistent
- **Check for duplicates**: Remove duplicate entries before merkle
- **Document parameters**: Note hash function and sorting method

## Workflow

The command performs the following steps:

1. **Data Loading**
   - Parse input file (CSV/JSON)
   - Extract addresses and amounts
   - Validate data integrity
   - Detect format automatically

2. **Data Preparation**
   - Normalize addresses (lowercase, checksum)
   - Convert amounts to consistent format
   - Remove duplicates
   - Sort if requested

3. **Leaf Generation**
   - Hash each entry (address + amount)
   - Create leaf nodes
   - Ensure consistent hashing

4. **Tree Building**
   - Combine pairs of leaves
   - Hash pairs iteratively
   - Build complete tree structure
   - Calculate root hash

5. **Proof Extraction**
   - Generate proof for each participant
   - Extract sibling hashes needed
   - Minimize proof size
   - Validate all proofs

6. **outputs Generation**
   - Export merkle root
   - Export proofs JSON
   - Generate Solidity contract
   - Create test fixtures
   - Produce documentation

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "merkle": {
    "hashFunction": "keccak256",
    "sortPairs": true,
    "encoding": "abi",
    "includeFixtures": true,
    "autoGenerateContract": true
  }
}
```

## Merkle Tree Examples

### 4-leaf tree structure:
```
                    Root
                   /    \
                 H12     H34
                /  \    /  \
              H1   H2  H3   H4
              |    |   |    |
            Leaf1 Leaf2 Leaf3 Leaf4

Proof for Leaf1: [H2, H34]
Proof for Leaf2: [H1, H34]
Proof for Leaf3: [H4, H12]
Proof for Leaf4: [H3, H12]
```

### Solidity verification:
```solidity
bytes32[] memory proof = [
    0x2345...,  // Sibling of leaf
    0x6789...   // Sibling of parent
];

bytes32 leaf = keccak256(abi.encodePacked(address, amount));
bool isValid = MerkleProof.verify(proof, merkleRoot, leaf);
```

## Data Format Requirements

CSV format:
```
address,amount
0x1111...1111,1000
0x2222...2222,500
```

JSON format:
```json
[
  { "address": "0x1111...1111", "amount": 1000 },
  { "address": "0x2222...2222", "amount": 500 }
]
```

## Merkle Proof Verification

In Solidity using OpenZeppelin:
```solidity
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

function verify(
    bytes32[] calldata proof,
    bytes32 leaf
) external view returns (bool) {
    return MerkleProof.verify(proof, merkleRoot, leaf);
}
```

## Related Commands

- `/decode-tx` - Decode merkle verification transactions
- `/estimate-gas` - Estimate merkle proof verification costs
- `/create-safe` - Use merkles for Safe whitelisting
- `/generate-merkle-distribut` - For large distributions

## Merkle Tree Sizes

Typical merkle tree metrics:

```
Participants | Tree Height | Proof Size | Verify Gas
─────────────┼─────────────┼────────────┼────────────
4            | 2           | 64 bytes   | ~3,000
100          | 7           | 224 bytes  | ~10,500
1000         | 10          | 320 bytes  | ~15,000
10,000       | 14          | 448 bytes  | ~21,000
100,000      | 17          | 544 bytes  | ~25,500
1,000,000    | 20          | 640 bytes  | ~30,000
```

Proof gas cost: ~1,500 gas per hash in proof

## Common Use Cases

1. **Token Airdrops**
   - Store merkle root on-chain
   - Users claim with proof
   - Gas efficient for large airdrops

2. **NFT Whitelist**
   - Whitelist participants
   - Mint with merkle proof
   - No centralized verification

3. **Batch Claims**
   - Distribute across multiple tokens
   - Single proof for all claims
   - Efficient batch processing

4. **Privacy-Preserving Lists**
   - Publish only merkle root
   - Keep list private
   - Prove membership without revealing others

## Performance Notes

- **Tree generation**: O(n) time, O(n) space
- **Proof verification**: O(log n) gas cost
- **Proof generation**: O(log n) time
- **Gas optimization**: Use simple packed encoding

## Notes

- **Proof order matters**: Merkle proofs must be in correct order
- **Immutable once deployed**: Merkle root cannot change (redeploy contract)
- **No privacy in contract**: All addresses visible in verified proofs
- **Sorting essential**: Inconsistent sorting breaks all proofs
- **Hashing consistent**: Use same hash function everywhere
- **Data integrity**: Any change requires new merkle tree
