# Smart Contract Security Auditing

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Vulnerabilities: reentrancy, overflow, frontrunning audit strategies and tools.

## Core Concepts

### Reentrancy
Prevent calling contracts from exploiting state.

```solidity
// VULNERABLE
function withdraw(uint amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount;  // State change AFTER external call
}

// SECURE: Use checks-effects-interactions pattern
function withdraw(uint amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;  // State change FIRST
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}

// OR: Use ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    function withdraw(uint amount) external nonReentrant {
        // Protected
    }
}
```

### Integer Overflow/Underflow
Modern Solidity 0.8+ protects, but still relevant for lower versions.

```solidity
// Solidity 0.7 - VULNERABLE
function add(uint a, uint b) public pure returns (uint) {
    return a + b;  // Can overflow!
}

// Solidity 0.8+ - SAFE (reverts on overflow)
function add(uint a, uint b) public pure returns (uint) {
    return a + b;  // Automatic overflow protection
}
```

### Front-Running
Miners observing transaction pool and exploiting ordering.

```solidity
// VULNERABLE: Predictable price change
function buyTokens(uint maxPrice) external payable {
    require(getPrice() <= maxPrice);
    uint tokens = msg.value / getPrice();
    transfer(msg.sender, tokens);
}

// SECURE: Commit-reveal pattern
mapping(bytes32 => uint) pendingBids;

function submitBid(bytes32 hash) external payable {
    pendingBids[hash] = msg.value;
}

function revealBid(uint amount) external {
    require(keccak256(abi.encode(amount)) == someHash);
    // Process bid
}
```

### Access Control
Validate msg.sender properly.

```solidity
contract Secure {
    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
```

## Best Practices

1. **Automated Tools**: Use Slither, MythX
2. **Manual Review**: Understand code intent
3. **Testing**: Comprehensive test coverage
4. **Audits**: Professional security review before mainnet
5. **Monitoring**: Track deployed contract behavior

## Related Skills

- Zero-Knowledge Proofs
- Blockchain Consensus Mechanisms
- Solana Program Optimization

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1456 | **Remixes**: 523
