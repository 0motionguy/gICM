---
name: eip712-typed-signatures
description: "Progressive disclosure skill: Quick reference in 38 tokens, expands to 5500 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [38, 5500]
---

# EIP-712 Typed Signatures

> Progressive disclosure skill: Quick reference in 38 tokens, expands to 5500 tokens

## Quick Reference (Load: 38 tokens)

EIP-712 enables typed structured data signing with human-readable domain separation and type hashing.

**Core concepts:**
- `EIP712Domain` - Enforces chain, contract, version
- Type hashing - Keccak256 of field definitions
- Domain separator - Unique per chain/contract
- Signature verification - ECDSA with domain encoding
- Gasless transactions - Meta-transactions without ETH

**Quick start:**
```solidity
bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(
    EIP712_DOMAIN_TYPEHASH,
    keccak256("MyApp"),
    block.chainid,
    address(this)
));

bytes32 digest = keccak256(abi.encodePacked(
    "\x19\x01",
    DOMAIN_SEPARATOR,
    hashStruct(message)
));
```

## Core Concepts (Expand: +650 tokens)

### EIP-712 Domain Structure

The domain separator prevents signature replay attacks across chains and contracts:

```solidity
// Domain type definition
bytes32 constant EIP712_DOMAIN_TYPEHASH = keccak256(bytes(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
));

// Domain separator calculation
bytes32 public DOMAIN_SEPARATOR;

constructor() {
    DOMAIN_SEPARATOR = keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
        keccak256(bytes("MyProtocol")),  // name
        keccak256(bytes("1")),            // version
        block.chainid,                    // chainId
        address(this)                     // verifyingContract
    ));
}
```

**Why domains matter:**
- Prevent cross-chain signature replay
- Prevent contract address confusion
- Version updates invalidate old signatures
- Chain-specific due to `chainId`

### Type Hashing System

Each message type has a unique hash based on field definitions:

```solidity
// Define message structure
struct Transfer {
    address from;
    address to;
    uint256 amount;
    uint256 nonce;
    uint256 deadline;
}

// Type hash for Transfer
bytes32 constant TRANSFER_TYPEHASH = keccak256(bytes(
    "Transfer(address from,address to,uint256 amount,uint256 nonce,uint256 deadline)"
));

// Hash a Transfer message
function hashTransfer(Transfer memory transfer) internal pure returns (bytes32) {
    return keccak256(abi.encode(
        TRANSFER_TYPEHASH,
        transfer.from,
        transfer.to,
        transfer.amount,
        transfer.nonce,
        transfer.deadline
    ));
}
```

**Type hash rules:**
- Include all field types and names
- Order matches field declaration
- Nested structs use their own type hashes
- Array types must include brackets `[]`

### Signature Digest Construction

The final digest combines domain and message hashing:

```solidity
function digest(Transfer memory transfer)
    internal
    view
    returns (bytes32)
{
    bytes32 structHash = hashTransfer(transfer);

    return keccak256(abi.encodePacked(
        "\x19\x01",      // EIP-191 version and scheme
        DOMAIN_SEPARATOR,
        structHash
    ));
}
```

**Digest anatomy:**
- `\x19\x01` - EIP-191 prefix (prevents message signing)
- DOMAIN_SEPARATOR - Chain/contract specific
- structHash - Message hash with type info

### Signature Verification

Recover signer and validate authorization:

```solidity
function recoverSigner(
    bytes32 digest,
    uint8 v,
    bytes32 r,
    bytes32 s
) internal pure returns (address) {
    address recovered = ecrecover(digest, v, r, s);
    require(recovered != address(0), "Invalid signature");
    return recovered;
}

function verify(Transfer memory transfer, uint8 v, bytes32 r, bytes32 s)
    internal
    view
    returns (bool)
{
    bytes32 messageDigest = digest(transfer);
    address signer = recoverSigner(messageDigest, v, r, s);
    return signer == transfer.from;
}
```

## Common Patterns (Expand: +1000 tokens)

### Pattern 1: Permit Function (ERC-20 Approval)

Allow token transfers via signature without pre-approval:

```solidity
pragma solidity ^0.8.0;

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

contract ERC20Permit {
    string public constant name = "Token";
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    mapping(address => uint256) public nonces;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp <= deadline, "Signature expired");

        bytes32 structHash = keccak256(abi.encode(
            PERMIT_TYPEHASH,
            owner,
            spender,
            value,
            nonces[owner]++,
            deadline
        ));

        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            structHash
        ));

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, "Invalid signature");

        allowance[owner][spender] = value;
    }
}
```

**Permit benefits:**
- Single-tx approvals without pre-approval
- Users don't need ETH for approval
- Signature-based access control
- Deadline prevents stale signatures

### Pattern 2: Meta-Transaction System

Enable gasless transactions via relayer:

```solidity
struct MetaTx {
    address from;
    address to;
    uint256 value;
    bytes data;
    uint256 nonce;
    uint256 deadline;
    uint256 gasPrice;
    uint256 gasLimit;
}

bytes32 constant METATX_TYPEHASH = keccak256(bytes(
    "MetaTx(address from,address to,uint256 value,bytes data,uint256 nonce,uint256 deadline,uint256 gasPrice,uint256 gasLimit)"
));

contract MetaTxHandler {
    bytes32 public DOMAIN_SEPARATOR;
    mapping(address => uint256) public nonces;

    constructor() {
        DOMAIN_SEPARATOR = _computeDomainSeparator();
    }

    function executeMetaTx(
        MetaTx calldata tx,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable returns (bytes memory) {
        require(block.timestamp <= tx.deadline, "Expired");
        require(msg.value >= tx.value + (tx.gasLimit * tx.gasPrice), "Insufficient payment");

        bytes32 structHash = keccak256(abi.encode(
            METATX_TYPEHASH,
            tx.from,
            tx.to,
            tx.value,
            keccak256(tx.data),
            nonces[tx.from]++,
            tx.deadline,
            tx.gasPrice,
            tx.gasLimit
        ));

        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            structHash
        ));

        address signer = ecrecover(digest, v, r, s);
        require(signer == tx.from, "Invalid signature");

        (bool success, bytes memory result) = tx.to.call{value: tx.value}(tx.data);
        require(success, "Execution failed");

        // Refund excess gas payment
        uint256 gasUsed = (tx.gasLimit - gasleft()) * tx.gasPrice;
        payable(tx.from).transfer(msg.value - gasUsed - tx.value);

        return result;
    }

    function _computeDomainSeparator() internal view returns (bytes32) {
        return keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("MetaTxHandler")),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }
}
```

**Meta-tx workflow:**
1. User signs transaction off-chain
2. Relayer submits on-chain
3. Contract recovers user from signature
4. Contract refunds relayer for gas

### Pattern 3: Conditional Message Hashing

Support nested structs with proper type encoding:

```solidity
struct Order {
    address maker;
    address token;
    uint256 amount;
    uint256 price;
    OrderDetails details;
}

struct OrderDetails {
    uint256 expiration;
    string memo;
}

bytes32 constant ORDER_DETAILS_TYPEHASH = keccak256(bytes(
    "OrderDetails(uint256 expiration,string memo)"
));

bytes32 constant ORDER_TYPEHASH = keccak256(bytes(
    "Order(address maker,address token,uint256 amount,uint256 price,OrderDetails details)"
));

function hashOrderDetails(OrderDetails memory details)
    internal
    pure
    returns (bytes32)
{
    return keccak256(abi.encode(
        ORDER_DETAILS_TYPEHASH,
        details.expiration,
        keccak256(bytes(details.memo))
    ));
}

function hashOrder(Order memory order)
    internal
    pure
    returns (bytes32)
{
    return keccak256(abi.encode(
        ORDER_TYPEHASH,
        order.maker,
        order.token,
        order.amount,
        order.price,
        hashOrderDetails(order.details)
    ));
}
```

**Nested struct rules:**
- Define typehash for each struct
- Use hash of nested struct in parent encoding
- String/bytes use keccak256 of content
- Arrays need special handling with dynamic encoding

## Advanced Techniques (Expand: +1400 tokens)

### Technique 1: Chain-Aware Domain Separator

Handle domain separator after chain fork:

```solidity
contract ChainAwareDomain {
    bytes32 constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    function getDomainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256(bytes("MyApp")),
            keccak256(bytes("1")),
            block.chainid,  // Current chain
            address(this)
        ));
    }

    function verify(
        bytes32 structHash,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address expectedSigner
    ) public view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            getDomainSeparator(),  // Dynamic separator
            structHash
        ));

        return ecrecover(digest, v, r, s) == expectedSigner;
    }
}
```

**Chain fork handling:**
- Domain separator includes block.chainid
- After fork, signatures remain valid for post-fork chain
- Pre-fork signatures invalid post-fork
- Prevents replay attacks in both chains

### Technique 2: Batch Message Hashing

Efficiently handle multiple messages:

```solidity
struct BatchOrder {
    uint256[] amounts;
    address[] recipients;
    uint256 nonce;
    uint256 deadline;
}

bytes32 constant BATCH_ORDER_TYPEHASH = keccak256(bytes(
    "BatchOrder(uint256[] amounts,address[] recipients,uint256 nonce,uint256 deadline)"
));

function hashBatchOrder(BatchOrder memory order)
    internal
    pure
    returns (bytes32)
{
    return keccak256(abi.encode(
        BATCH_ORDER_TYPEHASH,
        keccak256(abi.encodePacked(order.amounts)),
        keccak256(abi.encodePacked(order.recipients)),
        order.nonce,
        order.deadline
    ));
}

function processBatch(
    BatchOrder calldata order,
    uint8 v,
    bytes32 r,
    bytes32 s
) external {
    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hashBatchOrder(order)
    ));

    address signer = ecrecover(digest, v, r, s);
    require(signer == msg.sender, "Invalid signer");

    require(order.amounts.length == order.recipients.length, "Length mismatch");

    for (uint256 i = 0; i < order.amounts.length; i++) {
        // Process each transfer
        _transfer(order.recipients[i], order.amounts[i]);
    }
}
```

**Batch benefits:**
- Single signature for multiple actions
- Reduced signature verification overhead
- Atomic batch execution
- Gas efficient for bulk operations

### Technique 3: Signature Aggregation

Collect multiple signatures for multi-sig operations:

```solidity
struct MultiSigMessage {
    bytes32 action;
    address target;
    bytes calldata;
    uint256 nonce;
}

struct SignatureSet {
    address[] signers;
    uint8[] v;
    bytes32[] r;
    bytes32[] s;
}

bytes32 constant MULTISIG_TYPEHASH = keccak256(bytes(
    "MultiSigMessage(bytes32 action,address target,bytes calldata,uint256 nonce)"
));

mapping(address => uint256) public nonces;

function verifyMultiSig(
    MultiSigMessage calldata message,
    SignatureSet calldata signatures,
    uint256 threshold
) external view returns (bool) {
    require(signatures.signers.length == signatures.v.length, "Length mismatch");
    require(signatures.v.length == signatures.r.length, "Length mismatch");

    bytes32 structHash = keccak256(abi.encode(
        MULTISIG_TYPEHASH,
        message.action,
        message.target,
        keccak256(message.calldata),
        message.nonce
    ));

    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        structHash
    ));

    uint256 validCount = 0;
    address lastSigner = address(0);

    for (uint256 i = 0; i < signatures.signers.length; i++) {
        address signer = ecrecover(digest, signatures.v[i], signatures.r[i], signatures.s[i]);
        require(signer > lastSigner, "Invalid signature order");  // Prevent duplicates
        lastSigner = signer;

        if (signer == signatures.signers[i]) {
            validCount++;
        }
    }

    return validCount >= threshold;
}
```

**Multi-sig benefits:**
- Distributed authorization
- Threshold verification
- Duplicate signature prevention
- Efficient batch verification

### Technique 4: Time-Limited Signatures

Add temporal constraints to signatures:

```solidity
struct TimeLimitedAction {
    bytes32 action;
    uint256 validFrom;
    uint256 validUntil;
    uint256 nonce;
}

bytes32 constant TIME_LIMITED_TYPEHASH = keccak256(bytes(
    "TimeLimitedAction(bytes32 action,uint256 validFrom,uint256 validUntil,uint256 nonce)"
));

mapping(bytes32 => bool) public executedActions;

function executeTimeLimited(
    TimeLimitedAction calldata action,
    uint8 v,
    bytes32 r,
    bytes32 s
) external {
    require(block.timestamp >= action.validFrom, "Not yet valid");
    require(block.timestamp <= action.validUntil, "Expired");
    require(!executedActions[keccak256(abi.encode(action))], "Already executed");

    bytes32 structHash = keccak256(abi.encode(
        TIME_LIMITED_TYPEHASH,
        action.action,
        action.validFrom,
        action.validUntil,
        action.nonce
    ));

    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        structHash
    ));

    address signer = ecrecover(digest, v, r, s);
    require(signer == owner, "Invalid signer");

    executedActions[keccak256(abi.encode(action))] = true;
    // Execute action
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete ERC-2612 Permit Implementation

Full-featured permit function with best practices:

```solidity
pragma solidity ^0.8.0;

contract ERC20WithPermit {
    // Token state
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public nonces;

    uint8 public decimals = 18;
    uint256 public totalSupply;
    string public constant name = "Permitted Token";
    string public constant symbol = "PERM";

    // EIP-712
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant TRANSFER_FROM_TYPEHASH =
        keccak256("TransferFrom(address from,address to,uint256 amount,uint256 nonce,uint256 deadline)");

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(block.timestamp <= deadline, "Permit: expired");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline)
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, "Permit: invalid signature");

        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function transferWithPermit(
        address from,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool) {
        // Apply permit
        permit(from, msg.sender, amount, deadline, v, r, s);

        // Execute transfer
        return transferFrom(from, to, amount);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
}
```

### Example 2: Gasless Voting System

Vote using signatures without ETH:

```solidity
pragma solidity ^0.8.0;

contract GaslessVoting {
    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    struct Vote {
        uint256 proposalId;
        bool support;
        uint256 weight;
        uint256 nonce;
        uint256 deadline;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public nonces;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 constant VOTE_TYPEHASH = keccak256(
        "Vote(uint256 proposalId,bool support,uint256 weight,uint256 nonce,uint256 deadline)"
    );

    uint256 proposalCount;

    event ProposalCreated(uint256 indexed id, string description, uint256 deadline);
    event VoteCasted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("GaslessVoting")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function createProposal(string memory description, uint256 votingDuration) external {
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingDuration,
            executed: false
        });

        emit ProposalCreated(proposalCount, description, block.timestamp + votingDuration);
        proposalCount++;
    }

    function castVoteBySig(
        Vote calldata vote,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address voter
    ) external {
        require(block.timestamp <= vote.deadline, "Signature expired");
        require(block.timestamp <= proposals[vote.proposalId].deadline, "Voting closed");
        require(!hasVoted[vote.proposalId][voter], "Already voted");

        bytes32 structHash = keccak256(
            abi.encode(VOTE_TYPEHASH, vote.proposalId, vote.support, vote.weight, nonces[voter]++, vote.deadline)
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        address recoveredVoter = ecrecover(digest, v, r, s);
        require(recoveredVoter == voter, "Invalid signature");

        hasVoted[vote.proposalId][voter] = true;

        Proposal storage proposal = proposals[vote.proposalId];
        if (vote.support) {
            proposal.votesFor += vote.weight;
        } else {
            proposal.votesAgainst += vote.weight;
        }

        emit VoteCasted(vote.proposalId, voter, vote.support, vote.weight);
    }

    function getProposal(uint256 id) external view returns (Proposal memory) {
        return proposals[id];
    }
}
```

## Best Practices

**Domain Separator**
- Compute once in constructor
- Include all chain/contract identifiers
- Use consistent type naming
- Never hardcode domain separator (chainid changes)

**Type Hashing**
- Define typehash as constant
- Include function signature in string
- Use exact field order from struct
- Hash dynamic types with keccak256()

**Signature Verification**
- Always check deadline
- Verify nonce increment
- Recover address from signature
- Use checked arithmetic for nonces
- Emit events for auditing

**Security**
- Validate signer matches expected address
- Include chainid for cross-chain safety
- Use ecrecover defensively (may return 0)
- Prevent nonce replay with increment
- Validate message parameters

## Common Pitfalls

**Issue 1: Incorrect Type Hash**
```solidity
// ❌ Wrong - missing field or wrong order
bytes32 constant PERMIT_TYPEHASH = keccak256(
    "Permit(address owner,address spender,uint256 value,uint256 deadline)"
);

// ✅ Correct - matches struct exactly
bytes32 constant PERMIT_TYPEHASH = keccak256(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
);
```
**Solution:** Type hash string must exactly match struct field names and types.

**Issue 2: Missing Domain Separator Update After Fork**
```solidity
// ❌ Wrong - static domain separator
bytes32 constant DOMAIN_SEPARATOR = keccak256(abi.encode(...));

// ✅ Correct - dynamic chainId
bytes32 public DOMAIN_SEPARATOR;

function getDomainSeparator() public view returns (bytes32) {
    return keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
        keccak256(bytes(name)),
        keccak256(bytes("1")),
        block.chainid,  // Current chain
        address(this)
    ));
}
```
**Solution:** Include block.chainid in domain separator for fork safety.

**Issue 3: Unsafe Nonce Handling**
```solidity
// ❌ Wrong - nonce not incremented
function permit(...) external {
    bytes32 structHash = keccak256(abi.encode(
        PERMIT_TYPEHASH,
        owner,
        spender,
        value,
        nonces[owner],  // Not incremented!
        deadline
    ));
}

// ✅ Correct - atomic nonce increment
function permit(...) external {
    bytes32 structHash = keccak256(abi.encode(
        PERMIT_TYPEHASH,
        owner,
        spender,
        value,
        nonces[owner]++,  // Increment atomically
        deadline
    ));
}
```
**Solution:** Increment nonce during hash construction for atomic operations.

**Issue 4: Missing Deadline Check**
```solidity
// ❌ Wrong - allows expired signatures
function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external {
    // Missing deadline check!
    bytes32 structHash = keccak256(abi.encode(...));
}

// ✅ Correct - validates deadline first
function permit(...) external {
    require(block.timestamp <= deadline, "Signature expired");
    bytes32 structHash = keccak256(abi.encode(...));
}
```
**Solution:** Always check deadline before processing signature.

## Resources

**Official Standards**
- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712) - Full specification
- [EIP-2612 Permit Extension](https://eips.ethereum.org/EIPS/eip-2612) - ERC-20 permit standard
- [EIP-191 Signed Data](https://eips.ethereum.org/EIPS/eip-191) - Message signing standard

**Tools & Libraries**
- [eth-sig-util](https://github.com/MetaMask/eth-sig-util) - JavaScript signing library
- [ethers.js](https://docs.ethers.org/) - TypeScript/JavaScript with _signTypedData
- [web3.py](https://web3py.readthedocs.io/) - Python signing support
- [OpenZeppelin ERC2612](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit) - Reference implementation

**Related Skills**
- `account-abstraction-erc4337` - UserOperation signatures
- `multi-sig-wallets` - Multi-signature schemes
- `signature-aggregation` - BLS and batch signatures
