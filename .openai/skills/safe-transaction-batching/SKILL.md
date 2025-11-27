# Safe Transaction Batching & Multi-Sig Execution

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 44 tokens, expands to 6100 tokens

## Quick Reference (Load: 44 tokens)

Safe (formerly Gnosis Safe) enables multi-signature wallet management with transaction batching via MultiSend contracts.

**Core patterns:**
- MultiSend batching - Execute multiple transactions atomically
- Signature collection - Accumulate signatures from signers
- Execution flow - Bundle, sign, submit, execute
- Nonce management - Prevent replay attacks
- Gas optimization - Batch calls efficiently

**Quick start:**
```solidity
// MultiSend contract batches operations
bytes[] memory txs = new bytes[](2);
txs[0] = abi.encodePacked(uint8(0), to1, value1, data1);
txs[1] = abi.encodePacked(uint8(0), to2, value2, data2);

multiSend.multiSend(abi.encodePacked(txs));
```

## Core Concepts (Expand: +700 tokens)

### Safe Architecture

Safe is a smart contract wallet controlled by multiple signers:

**Key components:**
1. **Safe contract** - Multi-sig wallet logic
2. **Modules** - Extensions for custom logic
3. **Guard** - Transaction validation hooks
4. **Fallback handler** - Extended interface support
5. **MultiSend** - Batch transaction execution

### MultiSend Encoding

MultiSend batches operations in a specific format:

```
Each transaction encoded as:
[operation (1 byte)] [to (20 bytes)] [value (32 bytes)] [dataLength (32 bytes)] [data (variable)]

operation: 0 = call, 1 = delegatecall
to: target contract address
value: ETH to send (0 for most operations)
dataLength: Length of calldata
data: Function call encoded
```

### Transaction Flow

Standard Safe transaction execution:

1. **Create transaction** - Build calldata
2. **Collect signatures** - Get approval from signers
3. **Submit transaction** - Send to Safe contract
4. **Execute** - Safe validates and executes

### Signature Generation

Each signer produces a signature proving approval:

```solidity
bytes memory signature = sign(
    txHash,
    nonce,
    gasPrice,
    gasLimit,
    refundReceiver,
    threshold
)
```

**Signature types:**
- Contract signature - Via deployed contract validation
- Externally owned account - Standard ECDSA
- Pre-approved - Stored on-chain authorization

### Nonce and Ordering

Safe uses nonces to prevent replay attacks:

- **Linear nonce** - Transactions must execute in order
- **Dynamic nonce** - Any order execution (higher nonce wins)
- Nonce prevents same transaction from executing twice

## Common Patterns (Expand: +1200 tokens)

### Pattern 1: Simple Multi-Sig Transaction

Execute single transaction requiring multiple signatures:

```solidity
pragma solidity ^0.8.16;

interface ISafe {
    function execTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address refundReceiver,
        bytes memory signatures
    ) external payable returns (bool);

    function getTransactionHash(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address refundReceiver,
        uint256 nonce
    ) external view returns (bytes32);
}

contract SafeTransactionExecutor {
    ISafe public safe;
    address public treasury;

    event TransactionExecuted(address indexed to, uint256 value, bytes data);

    constructor(address safe_) {
        safe = ISafe(safe_);
    }

    function executeSafeTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        bytes memory signatures
    ) external {
        // Get transaction hash
        bytes32 txHash = safe.getTransactionHash(
            to,
            value,
            data,
            0, // operation: CALL
            0, // safeTxGas
            0, // baseGas
            0, // gasPrice
            address(0), // gasToken
            address(0), // refundReceiver
            0  // nonce
        );

        // Execute transaction
        require(
            safe.execTransaction(
                to,
                value,
                data,
                0,
                0,
                0,
                0,
                address(0),
                address(0),
                signatures
            ),
            "Transaction failed"
        );

        emit TransactionExecuted(to, value, data);
    }
}
```

**Key aspects:**
- txHash computation with transaction parameters
- Signature aggregation (all signer sigs concatenated)
- Execution validation by Safe contract

### Pattern 2: MultiSend Batch Execution

Execute multiple transactions atomically:

```solidity
pragma solidity ^0.8.16;

interface IMultiSend {
    function multiSend(bytes memory transactions) external payable;
}

contract MultiSendBatcher {
    IMultiSend public multiSend;

    struct SafeTransaction {
        address to;
        uint256 value;
        bytes data;
        uint8 operation; // 0 = CALL, 1 = DELEGATECALL
    }

    constructor(address multiSend_) {
        multiSend = IMultiSend(multiSend_);
    }

    function batchTransactions(SafeTransaction[] calldata transactions)
        external
    {
        // Encode all transactions into single MultiSend calldata
        bytes memory encodedTxs = encodeBatch(transactions);

        // Execute via MultiSend
        multiSend.multiSend(encodedTxs);
    }

    function encodeBatch(SafeTransaction[] calldata transactions)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory encoded;

        for (uint256 i = 0; i < transactions.length; i++) {
            SafeTransaction calldata tx = transactions[i];

            // Encode: operation (1) + to (20) + value (32) + dataLength (32) + data
            encoded = abi.encodePacked(
                encoded,
                uint8(tx.operation),
                tx.to,
                tx.value,
                uint256(tx.data.length),
                tx.data
            );
        }

        return encoded;
    }

    // Helper to create safe transaction
    function _createSafeTransaction(
        address to,
        uint256 value,
        bytes memory data
    ) internal pure returns (SafeTransaction memory) {
        return SafeTransaction({
            to: to,
            value: value,
            data: data,
            operation: 0 // CALL
        });
    }
}
```

**Batching benefits:**
- Atomic execution (all or nothing)
- Single signature set required
- Gas efficient for multiple operations
- Revert on any failure

### Pattern 3: Signature Collection & Verification

Collect and aggregate signatures from multiple signers:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SignatureCollector {
    using ECDSA for bytes32;

    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public threshold;

    event SignerAdded(address indexed signer);
    event SignatureCollected(bytes32 txHash, address signer);

    constructor(address[] memory signers_, uint256 threshold_) {
        signers = signers_;
        threshold = threshold_;

        for (uint256 i = 0; i < signers_.length; i++) {
            isSigner[signers_[i]] = true;
        }
    }

    function getSignatureHash(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 nonce
    ) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                to,
                value,
                keccak256(data),
                nonce
            )
        );
    }

    function verifySignature(
        bytes32 txHash,
        bytes calldata signature,
        address signer
    ) public pure returns (bool) {
        // Prepare message hash (matches Safe's format)
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                txHash
            )
        );

        // Recover signer from signature
        address recovered = messageHash.recover(signature);
        return recovered == signer;
    }

    function aggregateSignatures(
        address[] calldata signers_,
        bytes[] calldata signatures
    ) external view returns (bytes memory) {
        require(signers_.length >= threshold, "Not enough signers");
        require(signers_.length == signatures.length, "Length mismatch");

        // Sort signers and signatures
        (address[] memory sortedSigners, bytes[] memory sortedSigs) =
            _sortSignatures(signers_, signatures);

        // Concatenate sorted signatures
        bytes memory aggregated;
        for (uint256 i = 0; i < sortedSigs.length; i++) {
            aggregated = abi.encodePacked(aggregated, sortedSigs[i]);
        }

        return aggregated;
    }

    function _sortSignatures(
        address[] memory signers_,
        bytes[] memory signatures
    ) internal view returns (address[] memory, bytes[] memory) {
        // Sort by signer address (Safe requirement)
        // Implementation uses simple bubble sort for clarity
        for (uint256 i = 0; i < signers_.length; i++) {
            for (uint256 j = i + 1; j < signers_.length; j++) {
                if (signers_[i] > signers_[j]) {
                    // Swap signers
                    address tempSigner = signers_[i];
                    signers_[i] = signers_[j];
                    signers_[j] = tempSigner;

                    // Swap signatures
                    bytes memory tempSig = signatures[i];
                    signatures[i] = signatures[j];
                    signatures[j] = tempSig;
                }
            }
        }

        return (signers_, signatures);
    }
}
```

### Pattern 4: Safe with ERC20 Token Operations

Batch token approvals and transfers:

```solidity
pragma solidity ^0.8.16;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SafeTokenBatcher {
    struct TokenOperation {
        address token;
        address target;
        uint256 amount;
        bytes4 functionSelector; // approve or transfer
    }

    address public multiSend;

    constructor(address multiSend_) {
        multiSend = multiSend_;
    }

    function batchTokenApprovals(
        address[] calldata tokens,
        address[] calldata spenders,
        uint256[] calldata amounts
    ) external pure returns (bytes memory) {
        require(
            tokens.length == spenders.length &&
            tokens.length == amounts.length,
            "Length mismatch"
        );

        bytes memory encodedTxs;

        for (uint256 i = 0; i < tokens.length; i++) {
            // Encode ERC20 approve call
            bytes memory callData = abi.encodeWithSignature(
                "approve(address,uint256)",
                spenders[i],
                amounts[i]
            );

            // Add to batch
            encodedTxs = abi.encodePacked(
                encodedTxs,
                uint8(0), // operation: CALL
                tokens[i],
                uint256(0), // value: 0
                uint256(callData.length),
                callData
            );
        }

        return encodedTxs;
    }

    function batchTokenTransfers(
        address[] calldata tokens,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external pure returns (bytes memory) {
        require(
            tokens.length == recipients.length &&
            tokens.length == amounts.length,
            "Length mismatch"
        );

        bytes memory encodedTxs;

        for (uint256 i = 0; i < tokens.length; i++) {
            bytes memory callData = abi.encodeWithSignature(
                "transfer(address,uint256)",
                recipients[i],
                amounts[i]
            );

            encodedTxs = abi.encodePacked(
                encodedTxs,
                uint8(0), // operation: CALL
                tokens[i],
                uint256(0), // value: 0
                uint256(callData.length),
                callData
            );
        }

        return encodedTxs;
    }
}
```

## Advanced Techniques (Expand: +1500 tokens)

### Technique 1: Conditional Execution Guards

Add validation before transaction execution:

```solidity
pragma solidity ^0.8.16;

interface IGuard {
    function checkTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address refundReceiver,
        bytes calldata signatures,
        address msgSender
    ) external;

    function checkAfterExecution(bytes32 txHash, bool success) external;
}

contract SafeGuard is IGuard {
    address public safe;
    address public owner;

    uint256 public dailyLimit = 100 ether;
    uint256 public lastResetTime;
    uint256 public spentToday;

    mapping(address => uint256) public approvedRecipients;

    event TransactionApproved(address indexed to, uint256 amount);
    event LimitExceeded(address indexed to, uint256 amount);

    constructor(address safe_) {
        safe = safe_;
        owner = msg.sender;
        lastResetTime = block.timestamp;
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address refundReceiver,
        bytes calldata signatures,
        address msgSender
    ) external override {
        require(msg.sender == safe, "Only Safe can call");

        // Reset daily limit if new day
        if (block.timestamp >= lastResetTime + 1 days) {
            spentToday = 0;
            lastResetTime = block.timestamp;
        }

        // Check daily limit for ETH transfers
        if (value > 0) {
            require(
                spentToday + value <= dailyLimit,
                "Daily limit exceeded"
            );
            spentToday += value;
        }

        // Check recipient whitelist
        if (approvedRecipients[to] > 0) {
            require(value <= approvedRecipients[to], "Recipient limit exceeded");
        }

        emit TransactionApproved(to, value);
    }

    function checkAfterExecution(bytes32 txHash, bool success) external override {
        // Post-execution validation
        require(msg.sender == safe, "Only Safe can call");
        // Log execution result, etc.
    }

    function updateApprovedRecipient(address recipient, uint256 limit) external {
        require(msg.sender == owner, "Only owner");
        approvedRecipients[recipient] = limit;
    }

    function setDailyLimit(uint256 newLimit) external {
        require(msg.sender == owner, "Only owner");
        dailyLimit = newLimit;
    }
}
```

### Technique 2: Chain of Responsibility for Signers

Multiple signature tiers with escalating requirements:

```solidity
pragma solidity ^0.8.16;

contract HierarchicalSigners {
    enum SignatureLevel { NONE, LEVEL1, LEVEL2, LEVEL3 }

    struct SignatureRequirement {
        uint256 minAmount;
        uint256 requiredSignatures;
        address[] signers;
    }

    mapping(SignatureLevel => SignatureRequirement) public requirements;

    constructor(
        address[] memory level1Signers,
        address[] memory level2Signers,
        address[] memory level3Signers
    ) {
        // Level 1: up to 10 ETH, requires 1 sig
        requirements[SignatureLevel.LEVEL1] = SignatureRequirement({
            minAmount: 0,
            requiredSignatures: 1,
            signers: level1Signers
        });

        // Level 2: 10-100 ETH, requires 2 sigs
        requirements[SignatureLevel.LEVEL2] = SignatureRequirement({
            minAmount: 10 ether,
            requiredSignatures: 2,
            signers: level2Signers
        });

        // Level 3: >100 ETH, requires 3 sigs
        requirements[SignatureLevel.LEVEL3] = SignatureRequirement({
            minAmount: 100 ether,
            requiredSignatures: 3,
            signers: level3Signers
        });
    }

    function getRequiredSignatures(uint256 amount)
        external
        view
        returns (SignatureLevel, uint256)
    {
        if (amount < 10 ether) {
            return (
                SignatureLevel.LEVEL1,
                requirements[SignatureLevel.LEVEL1].requiredSignatures
            );
        } else if (amount < 100 ether) {
            return (
                SignatureLevel.LEVEL2,
                requirements[SignatureLevel.LEVEL2].requiredSignatures
            );
        } else {
            return (
                SignatureLevel.LEVEL3,
                requirements[SignatureLevel.LEVEL3].requiredSignatures
            );
        }
    }
}
```

### Technique 3: Delayed Execution with Timelock

Queue transactions with time delay:

```solidity
pragma solidity ^0.8.16;

contract SafeTimelock {
    address public safe;
    uint256 public constant DELAY = 2 days;

    bytes32[] public queue;
    mapping(bytes32 => bool) public isQueued;
    mapping(bytes32 => bool) public isExecuted;

    event TransactionQueued(bytes32 indexed txHash, uint256 executeTime);
    event TransactionExecuted(bytes32 indexed txHash);
    event TransactionCancelled(bytes32 indexed txHash);

    constructor(address safe_) {
        safe = safe_;
    }

    function queueTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 executeTime
    ) external returns (bytes32) {
        require(msg.sender == safe, "Only Safe");
        require(executeTime >= block.timestamp + DELAY, "Too soon");

        bytes32 txHash = keccak256(
            abi.encodePacked(to, value, data, executeTime)
        );

        require(!isQueued[txHash], "Already queued");

        isQueued[txHash] = true;
        queue.push(txHash);

        emit TransactionQueued(txHash, executeTime);
        return txHash;
    }

    function executeTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 executeTime
    ) external {
        bytes32 txHash = keccak256(
            abi.encodePacked(to, value, data, executeTime)
        );

        require(isQueued[txHash], "Not queued");
        require(!isExecuted[txHash], "Already executed");
        require(block.timestamp >= executeTime, "Too early");

        isExecuted[txHash] = true;

        // Execute transaction via Safe
        // Implementation depends on Safe version

        emit TransactionExecuted(txHash);
    }

    function cancelTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 executeTime
    ) external {
        require(msg.sender == safe, "Only Safe");

        bytes32 txHash = keccak256(
            abi.encodePacked(to, value, data, executeTime)
        );

        require(isQueued[txHash], "Not queued");
        require(!isExecuted[txHash], "Already executed");

        isQueued[txHash] = false;

        emit TransactionCancelled(txHash);
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Governance Safe with Voting

Safe controlled by DAO with voting:

```solidity
pragma solidity ^0.8.16;

contract GovernanceSafe {
    address public safe;
    address public votingToken;
    uint256 public proposalCount;

    enum ProposalState { PENDING, VOTING, APPROVED, EXECUTED, REJECTED }

    struct Proposal {
        uint256 id;
        address proposer;
        address target;
        uint256 value;
        bytes data;
        ProposalState state;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant QUORUM = 100e18; // 100 tokens minimum

    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        address target
    );
    event VoteCast(uint256 indexed id, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed id);

    constructor(address safe_, address votingToken_) {
        safe = safe_;
        votingToken = votingToken_;
    }

    function proposeTransaction(
        address target,
        uint256 value,
        bytes calldata data
    ) external returns (uint256) {
        uint256 id = proposalCount++;

        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            target: target,
            value: value,
            data: data,
            state: ProposalState.PENDING,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD
        });

        emit ProposalCreated(id, msg.sender, target);
        return id;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.state == ProposalState.PENDING, "Invalid state");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        // Check voting power (simplified)
        uint256 votingPower = _getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.state == ProposalState.PENDING, "Not pending");
        require(block.timestamp >= proposal.endTime, "Voting ongoing");

        if (proposal.votesFor > proposal.votesAgainst &&
            proposal.votesFor >= QUORUM) {
            proposal.state = ProposalState.APPROVED;

            // Execute via Safe
            // Implementation calls Safe.execTransaction

            proposal.state = ProposalState.EXECUTED;
            emit ProposalExecuted(proposalId);
        } else {
            proposal.state = ProposalState.REJECTED;
        }
    }

    function _getVotingPower(address account) internal view returns (uint256) {
        // Return token balance as voting power
        // Implementation depends on voting token
        return 0; // Simplified
    }
}
```

### Example 2: Treasury Management Safe

Safe managing protocol treasury with spending policies:

```solidity
pragma solidity ^0.8.16;

contract TreasurySafe {
    address public safe;
    address public governance;

    struct SpendingPolicy {
        address asset;
        uint256 dailyLimit;
        uint256 monthlyLimit;
        address[] approvedRecipients;
    }

    mapping(address => SpendingPolicy) public policies;
    mapping(address => mapping(uint256 => uint256)) public dailySpent;
    mapping(address => mapping(uint256 => uint256)) public monthlySpent;

    event PolicyUpdated(address indexed asset, uint256 dailyLimit);
    event TransactionApproved(address indexed asset, uint256 amount);

    constructor(address safe_, address governance_) {
        safe = safe_;
        governance = governance_;
    }

    function setPolicy(
        address asset,
        uint256 dailyLimit,
        uint256 monthlyLimit,
        address[] calldata approvedRecipients
    ) external {
        require(msg.sender == governance, "Only governance");

        policies[asset] = SpendingPolicy({
            asset: asset,
            dailyLimit: dailyLimit,
            monthlyLimit: monthlyLimit,
            approvedRecipients: approvedRecipients
        });

        emit PolicyUpdated(asset, dailyLimit);
    }

    function validateSpending(
        address asset,
        address recipient,
        uint256 amount
    ) external view returns (bool) {
        SpendingPolicy storage policy = policies[asset];

        // Check daily limit
        uint256 today = block.timestamp / 1 days;
        if (dailySpent[asset][today] + amount > policy.dailyLimit) {
            return false;
        }

        // Check monthly limit
        uint256 month = block.timestamp / 30 days;
        if (monthlySpent[asset][month] + amount > policy.monthlyLimit) {
            return false;
        }

        // Check recipient whitelist
        for (uint256 i = 0; i < policy.approvedRecipients.length; i++) {
            if (policy.approvedRecipients[i] == recipient) {
                return true;
            }
        }

        return false;
    }
}
```

## Best Practices

**Transaction Construction**
- Calculate txHash consistently (matches Safe format)
- Include proper nonce handling
- Set realistic gas estimates
- Use MultiSend for batch operations

**Signature Management**
- Sort signatures by signer address
- Validate all signatures exist and are valid
- Implement signature recovery verification
- Use OpenZeppelin ECDSA utilities

**Execution Safety**
- Implement guards for critical operations
- Add time locks for sensitive transactions
- Validate execution context (msg.sender, chain)
- Monitor for failed transactions

**Gas Optimization**
- Batch related operations
- Pre-calculate gas costs
- Optimize MultiSend encoding
- Consider delegatecall for complex logic

## Common Pitfalls

**Issue 1: Incorrect Signature Sorting**
```solidity
// ❌ Wrong - unsorted signatures
bytes memory sigs = sig1 + sig2 + sig3;
safe.execTransaction(..., sigs);

// ✅ Correct - sorted by signer address
// Sort signatures before concatenating
address[] signers = [signer1, signer2, signer3];
bytes[] sigs = [sig1, sig2, sig3];
// Sort both by signer address
// Concatenate in order
```
**Solution:** Always sort signatures and signers by address.

**Issue 2: Wrong Nonce Handling**
```solidity
// ❌ Wrong - nonce not incremented
safe.execTransaction(..., nonce=0);
safe.execTransaction(..., nonce=0); // Same nonce fails

// ✅ Correct - increment nonce
safe.execTransaction(..., nonce=0);
safe.execTransaction(..., nonce=1);
```
**Solution:** Increment nonce for sequential transactions.

**Issue 3: Insufficient Signatures**
```solidity
// ❌ Wrong - doesn't meet threshold
uint256 threshold = 3;
bytes sigs = sig1 + sig2; // Only 2 signatures

// ✅ Correct - meet or exceed threshold
bytes sigs = sig1 + sig2 + sig3; // 3 signatures
```
**Solution:** Always provide threshold-required signatures.

**Issue 4: Invalid MultiSend Encoding**
```solidity
// ❌ Wrong - incorrect format
bytes memory txs = abi.encode(to, value, data);

// ✅ Correct - proper MultiSend format
bytes memory txs = abi.encodePacked(
    uint8(0),
    to,
    uint256(value),
    uint256(data.length),
    data
);
```
**Solution:** Use correct MultiSend encoding format.

## Resources

**Official Documentation**
- [Safe Documentation](https://safe.global/resources) - Complete guide
- [Safe Contracts](https://github.com/safe-global/safe-contracts) - Source code
- [Safe API](https://safe.global/api) - API reference

**Related Skills**
- `solidity-gas-optimization` - Optimize Safe operations
- `smart-contract-security` - Multi-sig security patterns
- `erc4626-vault-implementation` - Safe vault management
- `chainlink-automation-keepers` - Automate Safe execution

**External Resources**
- [Safe Transaction Service](https://safe.global/transaction-service) - Off-chain service
- [Safe CLI](https://github.com/safe-global/safe-cli) - Command-line tool
- [MultiSend Examples](https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/MultiSend.sol) - Reference implementation
- [Safe UI](https://app.safe.global) - Web interface
