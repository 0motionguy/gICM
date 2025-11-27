# Merkle Tree Airdrops

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 40 tokens, expands to 5900 tokens

## Quick Reference (Load: 40 tokens)

Merkle trees enable efficient verification of membership in large sets without storing all data on-chain.

**Core patterns:**
- `keccak256(abi.encodePacked(address, amount))` - Leaf creation
- `keccak256(abi.encodePacked(left, right))` - Node hashing
- Merkle proof verification - Off-chain generation, on-chain verification
- Claim contracts - Distribute tokens based on proof
- Large-scale airdrops - Process millions efficiently

**Quick start:**
```solidity
contract MerkleAirdrop {
    bytes32 public merkleRoot;

    function claim(address user, uint256 amount, bytes32[] calldata proof) external {
        require(verify(proof, merkleRoot, keccak256(abi.encodePacked(user, amount))));
        // Transfer tokens to user
    }

    function verify(bytes32[] calldata proof, bytes32 root, bytes32 leaf)
        internal
        pure
        returns (bool)
    {
        bytes32 computed = leaf;
        for (uint i = 0; i < proof.length; i++) {
            computed = keccak256(abi.encodePacked(computed, proof[i]));
        }
        return computed == root;
    }
}
```

## Core Concepts (Expand: +650 tokens)

### The Merkle Tree Structure

A Merkle tree is a binary tree where each node is a hash of its children:

```
          Root (H7)
         /        \
      H5          H6
     /  \        /  \
   H1   H2    H3    H4
   |    |     |     |
  L1   L2    L3    L4
```

**Key properties:**
- Leaves are hashed values of data (addresses + amounts)
- Each parent is hash of sorted children
- Root is single value representing all leaves
- Changing any leaf changes the root

### Merkle Proofs

A Merkle proof is a minimal path proving leaf membership:

```
To prove L2 is in the tree, provide:
- L2 (the leaf)
- H1 (sibling)
- H6 (uncle)

Verification:
1. H2 = hash(L2)
2. H5 = hash(H1, H2)
3. Root = hash(H5, H6)
```

**Proof size:** O(log n), so 1M leaves requires ~20 hashes.

### Efficient Verification

On-chain verification is gas-efficient:

```solidity
function verify(
    bytes32[] calldata proof,
    bytes32 root,
    bytes32 leaf
) internal pure returns (bool) {
    bytes32 computedHash = leaf;

    // Process proof from leaf to root
    for (uint256 i = 0; i < proof.length; i++) {
        bytes32 proofElement = proof[i];

        // Hash in correct order (sorted)
        if (computedHash <= proofElement) {
            computedHash = keccak256(
                abi.encodePacked(computedHash, proofElement)
            );
        } else {
            computedHash = keccak256(
                abi.encodePacked(proofElement, computedHash)
            );
        }
    }

    return computedHash == root;
}
```

### Standard Hashing Patterns

Different projects use different hashing approaches:

1. **Simple hash** - `keccak256(abi.encodePacked(address, amount))`
2. **Compact hash** - Hash addresses/amounts separately, then combine
3. **Double hash** - Apply keccak256 twice to prevent second preimage attacks
4. **Type-aware hash** - Use `abi.encode()` to preserve types

### Common Gotchas

1. **Hash ordering** - Must sort hashes consistently
2. **Leaf format** - Must match what's in the tree
3. **Proof direction** - Walking from leaf to root
4. **Type encoding** - Ensure encoding matches off-chain tree

## Common Patterns (Expand: +1100 tokens)

### Pattern 1: Simple ERC20 Airdrop

Basic merkle-based token distribution:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    IERC20 public token;
    bytes32 public merkleRoot;
    address public admin;

    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256 amount);
    event MerkleRootUpdated(bytes32 newRoot);

    constructor(address token_, bytes32 merkleRoot_) {
        token = IERC20(token_);
        merkleRoot = merkleRoot_;
        admin = msg.sender;
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        require(!claimed[account], "Already claimed");

        // Verify proof
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid proof"
        );

        // Mark as claimed
        claimed[account] = true;

        // Transfer token
        require(token.transfer(account, amount), "Transfer failed");

        emit Claimed(account, amount);
    }

    function updateMerkleRoot(bytes32 newRoot) external {
        require(msg.sender == admin, "Only admin");
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == admin, "Only admin");
        require(token.transfer(admin, amount), "Transfer failed");
    }
}
```

**Key features:**
- Efficient storage (only root on-chain)
- Prevents double-claiming
- Updates root for new campaigns
- Admin withdrawal functionality

### Pattern 2: NFT Allowlist

Merkle-based NFT allowlist for minting:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AllowlistMint is ERC721, Ownable {
    bytes32 public merkleRoot;
    uint256 public nextTokenId = 1;

    mapping(address => uint256) public amountMinted;
    mapping(address => bool) public claimed;

    uint256 public constant MINT_LIMIT = 3;
    uint256 public constant MINT_PRICE = 0.1 ether;

    event AllowlistMint(address indexed user, uint256 tokenId);

    constructor(bytes32 merkleRoot_) ERC721("AllowlistNFT", "ALLOW") {
        merkleRoot = merkleRoot_;
    }

    function mintFromAllowlist(
        uint256 amount,
        bytes32[] calldata proof
    ) external payable {
        require(msg.value == amount * MINT_PRICE, "Invalid payment");
        require(amountMinted[msg.sender] + amount <= MINT_LIMIT, "Exceeds limit");

        // Verify allowlist membership
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Not on allowlist"
        );

        // Mint tokens
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, nextTokenId++);
            emit AllowlistMint(msg.sender, nextTokenId - 1);
        }

        amountMinted[msg.sender] += amount;
    }

    function setMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
    }

    function withdraw() external onlyOwner {
        (bool success,) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}
```

**Features:**
- Allowlist verification
- Mint limits per user
- ETH payment handling
- Merkle root updates

### Pattern 3: Multi-Token Airdrop

Distribute multiple tokens from single merkle tree:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MultiTokenAirdrop {
    IERC20[] public tokens;
    bytes32 public merkleRoot;
    address public admin;

    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256[] amounts);

    constructor(address[] memory tokenAddresses, bytes32 merkleRoot_) {
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            tokens.push(IERC20(tokenAddresses[i]));
        }
        merkleRoot = merkleRoot_;
        admin = msg.sender;
    }

    function claim(
        address account,
        uint256[] calldata amounts,
        bytes32[] calldata proof
    ) external {
        require(!claimed[account], "Already claimed");
        require(amounts.length == tokens.length, "Amounts length mismatch");

        // Create leaf hash from account and all amounts
        bytes32 leaf = keccak256(abi.encodePacked(account, amounts));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid proof"
        );

        claimed[account] = true;

        // Transfer all tokens
        for (uint256 i = 0; i < tokens.length; i++) {
            require(
                tokens[i].transfer(account, amounts[i]),
                "Transfer failed"
            );
        }

        emit Claimed(account, amounts);
    }

    function withdrawAll() external {
        require(msg.sender == admin, "Only admin");

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 balance = tokens[i].balanceOf(address(this));
            if (balance > 0) {
                tokens[i].transfer(admin, balance);
            }
        }
    }
}
```

### Pattern 4: Cumulative Claim with Proof Updates

Update proofs while maintaining claim history:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CumulativeAirdrop {
    IERC20 public token;
    address public admin;

    uint256 public currentWindow;
    mapping(uint256 => bytes32) public merkleRoots;
    mapping(address => uint256) public totalClaimed;
    mapping(address => mapping(uint256 => bool)) public claimedInWindow;

    event Claimed(address indexed account, uint256 window, uint256 amount);
    event NewWindow(uint256 window, bytes32 merkleRoot);

    constructor(address token_) {
        token = IERC20(token_);
        admin = msg.sender;
    }

    function newWindow(bytes32 merkleRoot) external {
        require(msg.sender == admin, "Only admin");
        merkleRoots[currentWindow] = merkleRoot;
        emit NewWindow(currentWindow, merkleRoot);
        currentWindow++;
    }

    function claim(
        uint256 window,
        address account,
        uint256 cumulativeAmount,
        bytes32[] calldata proof
    ) external {
        require(window < currentWindow, "Window not closed yet");
        require(!claimedInWindow[account][window], "Already claimed in window");

        // Verify proof for cumulative amount
        bytes32 leaf = keccak256(abi.encodePacked(account, cumulativeAmount));
        require(
            MerkleProof.verify(proof, merkleRoots[window], leaf),
            "Invalid proof"
        );

        // Calculate difference from previous claims
        uint256 previousClaimed = totalClaimed[account];
        require(cumulativeAmount >= previousClaimed, "Invalid cumulative");

        uint256 amountToTransfer = cumulativeAmount - previousClaimed;
        claimedInWindow[account][window] = true;
        totalClaimed[account] = cumulativeAmount;

        require(token.transfer(account, amountToTransfer), "Transfer failed");

        emit Claimed(account, window, amountToTransfer);
    }
}
```

## Advanced Techniques (Expand: +1400 tokens)

### Technique 1: Compressed Merkle Trees

Optimize for gas using smaller trees:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CompressedMerkle {
    IERC20 public token;
    bytes32 public merkleRoot;
    address public admin;

    uint256 public constant BATCH_SIZE = 256;
    mapping(uint256 => bytes32) public batchRoots;
    mapping(address => mapping(uint256 => bool)) public claimed;

    event Claimed(address indexed account, uint256 batch, uint256 amount);

    constructor(address token_) {
        token = IERC20(token_);
        admin = msg.sender;
    }

    function setBatchRoot(uint256 batchId, bytes32 root) external {
        require(msg.sender == admin, "Only admin");
        batchRoots[batchId] = root;
    }

    function claim(
        uint256 batchId,
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        require(!claimed[account][batchId], "Already claimed");

        // Verify against batch root (much smaller tree)
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(
            MerkleProof.verify(proof, batchRoots[batchId], leaf),
            "Invalid proof"
        );

        claimed[account][batchId] = true;
        require(token.transfer(account, amount), "Transfer failed");

        emit Claimed(account, batchId, amount);
    }
}
```

**Benefits:**
- Smaller proof size per batch
- Easier to generate and update
- Better for incremental distributions

### Technique 2: Merkle Distributor with Native Tokens

Distribute ETH via merkle proofs:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NativeMerkleDistributor {
    bytes32 public merkleRoot;
    address public admin;

    uint256 public totalAllocated;
    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256 amount);

    constructor(bytes32 merkleRoot_) {
        merkleRoot = merkleRoot_;
        admin = msg.sender;
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        require(!claimed[account], "Already claimed");
        require(
            address(this).balance >= amount,
            "Insufficient balance"
        );

        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid proof"
        );

        claimed[account] = true;

        (bool success,) = payable(account).call{value: amount}("");
        require(success, "Transfer failed");

        emit Claimed(account, amount);
    }

    function fundDistributor() external payable {
        totalAllocated += msg.value;
    }

    function withdrawUnused() external {
        require(msg.sender == admin, "Only admin");

        // Calculate unclaimed amount
        uint256 unused = address(this).balance;

        (bool success,) = payable(admin).call{value: unused}("");
        require(success, "Withdraw failed");
    }

    receive() external payable {}
}
```

### Technique 3: Batch Merkle Verification

Verify multiple claims efficiently:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BatchMerkleDistributor {
    IERC20 public token;
    bytes32 public merkleRoot;
    address public admin;

    mapping(address => bool) public claimed;

    event BatchClaimed(address[] accounts, uint256[] amounts);

    constructor(address token_, bytes32 merkleRoot_) {
        token = IERC20(token_);
        merkleRoot = merkleRoot_;
        admin = msg.sender;
    }

    function claimBatch(
        address[] calldata accounts,
        uint256[] calldata amounts,
        bytes32[][] calldata proofs
    ) external {
        require(
            accounts.length == amounts.length &&
            accounts.length == proofs.length,
            "Length mismatch"
        );

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            uint256 amount = amounts[i];

            require(!claimed[account], "Already claimed");

            // Verify proof
            bytes32 leaf = keccak256(abi.encodePacked(account, amount));
            require(
                MerkleProof.verify(proofs[i], merkleRoot, leaf),
                "Invalid proof"
            );

            claimed[account] = true;
            totalAmount += amount;
        }

        require(token.transferFrom(msg.sender, address(this), totalAmount),
                "Transfer from failed");

        for (uint256 i = 0; i < accounts.length; i++) {
            require(token.transfer(accounts[i], amounts[i]),
                    "Transfer failed");
        }

        emit BatchClaimed(accounts, amounts);
    }
}
```

### Technique 4: Dynamic Merkle Trees with Allowance

Merkle-based allowance system for token minting:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleAllowanceMint is ERC20, Ownable {
    bytes32 public merkleRoot;
    mapping(address => uint256) public allowances;
    mapping(address => uint256) public minted;

    event Minted(address indexed user, uint256 amount);
    event AllowanceUsed(address indexed user, uint256 amount);

    constructor(bytes32 merkleRoot_)
        ERC20("Merkle Token", "MERKT")
    {
        merkleRoot = merkleRoot_;
    }

    function claimAllowance(
        address account,
        uint256 allowance,
        bytes32[] calldata proof
    ) external {
        require(allowances[account] == 0, "Already claimed");

        // Verify proof
        bytes32 leaf = keccak256(abi.encodePacked(account, allowance));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid proof"
        );

        allowances[account] = allowance;
    }

    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(
            minted[msg.sender] + amount <= allowances[msg.sender],
            "Exceeds allowance"
        );

        minted[msg.sender] += amount;
        _mint(msg.sender, amount);

        emit Minted(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Uniswap-Style Token Distribution

Complete token distribution with vesting:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract UniswapDistributor {
    using SafeERC20 for IERC20;

    IERC20 public token;
    bytes32 public merkleRoot;
    uint256 public claimPeriodEnds;

    mapping(address => bool) public hasClaimed;

    event Claimed(address account, uint256 amount);

    constructor(
        address token_,
        bytes32 merkleRoot_,
        uint256 claimPeriodEnds_
    ) {
        token = IERC20(token_);
        merkleRoot = merkleRoot_;
        claimPeriodEnds = claimPeriodEnds_;
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) public {
        require(!hasClaimed[account], "Already claimed");
        require(block.timestamp < claimPeriodEnds, "Claim period ended");

        // Verify proof
        bytes32 node = keccak256(abi.encodePacked(account, amount));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, node),
            "Invalid proof"
        );

        hasClaimed[account] = true;
        token.safeTransfer(account, amount);

        emit Claimed(account, amount);
    }

    function claimMultiple(
        address[] calldata accounts,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    ) external {
        for (uint256 i = 0; i < accounts.length; i++) {
            claim(accounts[i], amounts[i], merkleProofs[i]);
        }
    }
}
```

### Example 2: Snapshot-Based Airdrop with Tiers

Merkle-based distribution with user tiers:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract TieredMerkleAirdrop {
    IERC20 public token;
    address public admin;

    enum UserTier { NONE, BRONZE, SILVER, GOLD }

    uint256 public currentRound;
    mapping(uint256 => bytes32) public roundMerkleRoots;
    mapping(address => mapping(uint256 => bool)) public roundClaimed;
    mapping(address => UserTier) public userTier;

    uint256 public constant BRONZE_AMOUNT = 100 ether;
    uint256 public constant SILVER_AMOUNT = 250 ether;
    uint256 public constant GOLD_AMOUNT = 500 ether;

    event RoundStarted(uint256 round, bytes32 merkleRoot);
    event Claimed(address indexed user, uint256 round, uint256 amount);

    constructor(address token_) {
        token = IERC20(token_);
        admin = msg.sender;
    }

    function startRound(bytes32 merkleRoot) external {
        require(msg.sender == admin, "Only admin");
        roundMerkleRoots[currentRound] = merkleRoot;
        emit RoundStarted(currentRound, merkleRoot);
        currentRound++;
    }

    function claim(
        uint256 round,
        address account,
        UserTier tier,
        bytes32[] calldata proof
    ) external {
        require(round < currentRound, "Round not started");
        require(!roundClaimed[account][round], "Already claimed");
        require(tier != UserTier.NONE, "Invalid tier");

        // Verify proof
        bytes32 leaf = keccak256(abi.encodePacked(account, tier));
        require(
            MerkleProof.verify(proof, roundMerkleRoots[round], leaf),
            "Invalid proof"
        );

        roundClaimed[account][round] = true;
        userTier[account] = tier;

        uint256 amount = _getTierAmount(tier);
        require(token.transfer(account, amount), "Transfer failed");

        emit Claimed(account, round, amount);
    }

    function _getTierAmount(UserTier tier) internal pure returns (uint256) {
        if (tier == UserTier.BRONZE) return BRONZE_AMOUNT;
        if (tier == UserTier.SILVER) return SILVER_AMOUNT;
        if (tier == UserTier.GOLD) return GOLD_AMOUNT;
        revert("Invalid tier");
    }

    function withdrawRemaining() external {
        require(msg.sender == admin, "Only admin");
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(admin, balance), "Transfer failed");
    }
}
```

## Best Practices

**Tree Generation**
- Hash leaves with `keccak256(abi.encodePacked(address, amount))`
- Sort hashes before combining (deterministic ordering)
- Use consistent encoding across all leaves
- Store tree data off-chain in database

**Proof Verification**
- Always validate proof length
- Verify against stored root
- Prevent double-claiming with mappings
- Use OpenZeppelin's MerkleProof for safety

**Security**
- Validate leaf format matches tree construction
- Use multiple roots for different campaigns
- Implement time limits on claims
- Check against reentrancy attacks

**Gas Optimization**
- Single proof verification: ~2000 gas
- Batch claims save gas per transaction
- Use Merkle trees for large distributions
- Consider compressed trees for frequent updates

## Common Pitfalls

**Issue 1: Incorrect Leaf Hashing**
```solidity
// ❌ Wrong - different encoding in tree vs contract
// Tree: keccak256(abi.encodePacked(address, amount))
// Contract: keccak256(abi.encode(address, amount))

// ✅ Correct - must match exactly
// Tree and contract both use: keccak256(abi.encodePacked(address, amount))
```
**Solution:** Document exact hashing format used in tree generation.

**Issue 2: Hash Ordering**
```solidity
// ❌ Wrong - assumes proof order
computedHash = keccak256(abi.encodePacked(proof[i], computedHash));

// ✅ Correct - sorts hashes for consistency
if (computedHash <= proof[i]) {
    computedHash = keccak256(abi.encodePacked(computedHash, proof[i]));
} else {
    computedHash = keccak256(abi.encodePacked(proof[i], computedHash));
}
```
**Solution:** Sort hash pairs consistently.

**Issue 3: Missing Double-Claim Prevention**
```solidity
// ❌ Wrong - allows claiming twice
function claim(address user, uint256 amount, bytes32[] proof) external {
    verify(proof, ...);
    token.transfer(user, amount);
}

// ✅ Correct - prevents double-claim
mapping(address => bool) public claimed;

function claim(address user, uint256 amount, bytes32[] proof) external {
    require(!claimed[user], "Already claimed");
    verify(proof, ...);
    claimed[user] = true;
    token.transfer(user, amount);
}
```
**Solution:** Track claimed addresses to prevent double-claiming.

**Issue 4: Proof Validation Bypass**
```solidity
// ❌ Wrong - weak validation
require(MerkleProof.verify(...), "");

// ✅ Correct - explicit validation
bytes32 leaf = keccak256(abi.encodePacked(account, amount));
require(
    MerkleProof.verify(proof, merkleRoot, leaf),
    "Invalid Merkle proof"
);
```
**Solution:** Always validate proof format and length.

## Resources

**Off-Chain Tools**
- [merkletreejs](https://github.com/OpenZeppelin/merkle-tree) - Generate trees in JavaScript
- [ethers.js](https://docs.ethers.org/) - Proof generation utilities
- [hardhat merkle tools](https://github.com/jbx-protocol/juice-contracts) - Hardhat plugins

**Official Documentation**
- [OpenZeppelin MerkleProof](https://docs.openzeppelin.com/contracts/4.x/utilities#merkle_trees) - Implementation guide
- [EIP-1175](https://eips.ethereum.org/EIPS/eip-1175) - Wallet format standard
- [Merkle Tree Explainer](https://en.wikipedia.org/wiki/Merkle_tree) - Conceptual overview

**Related Skills**
- `solidity-gas-optimization` - Optimize claim transactions
- `smart-contract-security` - Verify proof structures
- `erc20-token-standards` - Token mechanics
- `chainlink-automation-keepers` - Automate claim distribution

**External Resources**
- [Uniswap Distributor](https://github.com/Uniswap/governance/blob/master/contracts/UNI.sol) - Reference implementation
- [1inch Distributor](https://github.com/1inch/1inch-governance) - Advanced patterns
- [ENS Registrar](https://github.com/ensdomains/ensdomains-contracts) - Domain distribution
