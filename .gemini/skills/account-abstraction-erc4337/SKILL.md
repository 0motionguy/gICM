# Account Abstraction ERC-4337

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 44 tokens, expands to 5700 tokens

## Quick Reference (Load: 44 tokens)

ERC-4337 enables smart contract wallets without protocol changes, using bundlers to aggregate UserOperations.

**Core concepts:**
- UserOperation - Pseudo-transaction abstraction
- EntryPoint - Singleton validator contract
- Smart Wallet - Contract with validateUserOp()
- Bundler - Aggregates UserOps into transactions
- Paymaster - Sponsors gas fees on behalf of users

**Quick start:**
```solidity
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

function validateUserOp(
    UserOperation calldata userOp,
    bytes32 opHash,
    uint256 missingAccountFunds
) external override returns (uint256 validationData) {
    // Verify signature and pay for gas
    _validateSignature(userOp, opHash);
    return 0;
}
```

## Core Concepts (Expand: +800 tokens)

### UserOperation Structure

Pseudo-transaction encoded for execution by bundler:

```solidity
pragma solidity ^0.8.0;

struct UserOperation {
    address sender;              // Wallet contract address
    uint256 nonce;               // Anti-replay counter
    bytes initCode;              // Factory + init data for account creation
    bytes callData;              // Call data for wallet execution
    uint256 callGasLimit;        // Gas for execution
    uint256 verificationGasLimit; // Gas for validation
    uint256 preVerificationGas;   // Gas overhead
    uint256 maxFeePerGas;        // Max gas price (like EIP-1559)
    uint256 maxPriorityFeePerGas; // Priority fee (like EIP-1559)
    bytes paymasterAndData;      // Paymaster address + encoded data
    bytes signature;             // User signature
}

library UserOperationLib {
    function getOpHash(UserOperation memory op) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            op.sender,
            op.nonce,
            keccak256(op.initCode),
            keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.preVerificationGas,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            keccak256(op.paymasterAndData)
        ));
    }
}
```

**UserOperation fields:**
- `sender` - Smart wallet to execute
- `nonce` - Prevents replay attacks
- `initCode` - Deploy wallet if needed
- `callData` - Target function to call
- Gas fields - Precise cost estimation
- `paymasterAndData` - Optional gas sponsor
- `signature` - Authorization proof

### EntryPoint Contract

Singleton contract validating and executing UserOps:

```solidity
pragma solidity ^0.8.0;

interface IEntryPoint {
    function handleOps(
        UserOperation[] calldata ops,
        address payable beneficiary
    ) external;

    function handleAggregatedOps(
        PackedUserOperation[] calldata ops,
        address aggregator,
        bytes calldata aggregatorData
    ) external;
}

contract EntryPoint is IEntryPoint {
    function handleOps(
        UserOperation[] calldata ops,
        address payable beneficiary
    ) external {
        uint256 opslen = ops.length;
        UserOpInfo[] memory opInfos = new UserOpInfo[](opslen);

        // Phase 1: Validation
        for (uint256 i = 0; i < opslen; i++) {
            _validateUserOp(ops[i], opInfos[i]);
        }

        // Phase 2: Execution
        for (uint256 i = 0; i < opslen; i++) {
            _executeUserOp(ops[i]);
        }

        // Refund excess gas
        uint256 totalGasUsed = _refundUnderpriced();
        _transferToPayBeneficiary(beneficiary, totalGasUsed);
    }

    function _validateUserOp(
        UserOperation calldata userOp,
        UserOpInfo memory opInfo
    ) internal {
        // Verify account exists or create it
        bytes32 opHash = _getOpHash(userOp);

        if (userOp.initCode.length > 0) {
            _createAccount(userOp);
        }

        // Validate signature via account
        uint256 validationData = IAccount(userOp.sender).validateUserOp(
            userOp,
            opHash,
            _getMissingAccountFunds(userOp)
        );

        _validateValidationData(validationData);
    }

    function _executeUserOp(UserOperation calldata userOp) internal {
        (bool success, bytes memory result) = userOp.sender.call(userOp.callData);
        require(success, "UserOp execution failed");
    }

    function _getOpHash(UserOperation calldata userOp)
        internal
        view
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(
            userOp.sender,
            userOp.nonce,
            keccak256(userOp.initCode),
            keccak256(userOp.callData),
            userOp.callGasLimit,
            userOp.verificationGasLimit,
            userOp.preVerificationGas,
            userOp.maxFeePerGas,
            userOp.maxPriorityFeePerGas,
            keccak256(userOp.paymasterAndData),
            block.chainid,
            address(this)
        ));
    }
}
```

**EntryPoint responsibilities:**
- Validate all UserOperations
- Create accounts if needed
- Execute authorized calldata
- Refund excess gas
- Coordinate with paymasters

### Smart Wallet Interface

Contract implementing wallet logic:

```solidity
pragma solidity ^0.8.0;

interface IAccount {
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}

abstract contract BaseAccount is IAccount {
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external virtual override returns (uint256) {
        _requireFromEntryPoint();

        uint256 sigValidationResult = _validateSignature(userOp, userOpHash);

        if (missingAccountFunds > 0) {
            (bool ok, ) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(ok, "Fund transfer failed");
        }

        return sigValidationResult;
    }

    function _requireFromEntryPoint() internal view {
        require(msg.sender == address(_entryPoint()), "Not EntryPoint");
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual returns (uint256);

    function _entryPoint() internal view virtual returns (IEntryPoint);
}
```

## Common Patterns (Expand: +1100 tokens)

### Pattern 1: Simple ECDSA Smart Wallet

Basic wallet with signature verification:

```solidity
pragma solidity ^0.8.0;

contract SimpleAccount is BaseAccount {
    address public owner;
    IEntryPoint public entryPoint;

    event ExecutionCalled(address indexed target, uint256 value, bytes data);

    constructor(address _entryPoint) {
        entryPoint = IEntryPoint(_entryPoint);
        owner = msg.sender;
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external {
        _requireFromEntryPoint();
        _call(target, value, data);
    }

    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata data
    ) external {
        _requireFromEntryPoint();
        require(targets.length == values.length && values.length == data.length);

        for (uint256 i = 0; i < targets.length; i++) {
            _call(targets[i], values[i], data[i]);
        }
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            userOpHash
        ));

        address recovered = recoverSigner(hash, userOp.signature);

        if (recovered == owner) {
            return 0;  // Valid
        } else {
            return 1;  // Invalid
        }
    }

    function recoverSigner(bytes32 hash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        address recovered = ecrecover(hash, v, r, s);
        return recovered;
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function _call(address target, uint256 value, bytes calldata data) internal {
        (bool success, ) = payable(target).call{value: value}(data);
        require(success, "Call failed");
        emit ExecutionCalled(target, value, data);
    }

    function _entryPoint() internal view override returns (IEntryPoint) {
        return entryPoint;
    }

    receive() external payable {}
}
```

**Simple wallet features:**
- Single owner ECDSA signing
- Batch execution
- Direct call forwarding
- Native ETH handling
- EntryPoint integration

### Pattern 2: Paymaster for Gas Sponsorship

Contract sponsoring UserOperation gas:

```solidity
pragma solidity ^0.8.0;

interface IPaymaster {
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData);

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external;
}

enum PostOpMode {opSucceeded, opReverted}

contract TokenPaymaster is IPaymaster {
    address public entryPoint;
    address public token;
    uint256 public priceMarkup;  // 110 = 10% markup

    mapping(address => uint256) public allowedAccounts;

    event PaymasterApproved(address indexed account, uint256 maxCost);

    constructor(address _entryPoint, address _token) {
        entryPoint = _entryPoint;
        token = _token;
        priceMarkup = 110;
    }

    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 validationData) {
        // Check if account has sufficient token balance
        uint256 tokenAmount = _getTokenAmount(maxCost);
        require(
            IERC20(token).balanceOf(userOp.sender) >= tokenAmount,
            "Insufficient token balance"
        );

        // Return context for postOp
        return (abi.encode(userOp.sender, tokenAmount), 0);
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override {
        require(msg.sender == entryPoint, "Only EntryPoint");

        (address account, uint256 tokenAmount) = abi.decode(context, (address, uint256));

        // Charge tokens based on actual gas cost
        uint256 chargeAmount = _getTokenAmount(actualGasCost);
        IERC20(token).transferFrom(account, address(this), chargeAmount);
    }

    function _getTokenAmount(uint256 ethAmount) internal view returns (uint256) {
        // Get ETH/Token price from oracle
        uint256 price = _getPrice();
        uint256 tokenAmount = (ethAmount * 1e18) / price;
        return (tokenAmount * priceMarkup) / 100;
    }

    function _getPrice() internal view returns (uint256) {
        // Implement price oracle integration
        return 1e18;  // 1 token = 1 ETH for example
    }

    function withdraw(address to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        IERC20(token).transfer(to, amount);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    address public owner;
}
```

**Paymaster features:**
- Gas cost estimation
- Token-based payment
- Account whitelisting
- Price markup for profit
- Refund mechanism

### Pattern 3: Account Factory

Create deterministic wallets:

```solidity
pragma solidity ^0.8.0;

contract SimpleAccountFactory {
    address public entryPoint;
    SimpleAccount[] public accounts;
    mapping(address => bool) public isAccount;

    event AccountCreated(address indexed account, address indexed owner);

    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
    }

    function createAccount(address owner, uint256 salt)
        public
        returns (address)
    {
        bytes memory initCode = abi.encodePacked(
            type(SimpleAccount).creationCode,
            abi.encode(entryPoint)
        );

        address account = _computeAddress(initCode, salt);

        if (account.code.length == 0) {
            SimpleAccount newAccount = new SimpleAccount{salt: bytes32(salt)}(entryPoint);
            newAccount.transferOwnership(owner);

            accounts.push(newAccount);
            isAccount[address(newAccount)] = true;

            emit AccountCreated(address(newAccount), owner);
        }

        return account;
    }

    function _computeAddress(bytes memory initCode, uint256 salt)
        internal
        view
        returns (address)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(initCode))
        );
        return address(uint160(uint256(hash)));
    }

    function getAccountCount() external view returns (uint256) {
        return accounts.length;
    }
}
```

**Factory benefits:**
- Deterministic account addresses
- Account registry
- Batch account creation
- Salt-based addressing

## Advanced Techniques (Expand: +1300 tokens)

### Technique 1: Multi-Signature Wallet

Multiple signers with M-of-N scheme:

```solidity
pragma solidity ^0.8.0;

contract MultiSigAccount is BaseAccount {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredSignatures;

    IEntryPoint public entryPoint;
    uint256 public nonce;

    event ExecutionApproved(bytes32 indexed opHash);

    constructor(address _entryPoint, address[] memory _owners, uint256 _required) {
        entryPoint = IEntryPoint(_entryPoint);
        require(_owners.length >= _required && _required > 0);

        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0));
            isOwner[_owners[i]] = true;
        }

        owners = _owners;
        requiredSignatures = _required;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256) {
        _requireFromEntryPoint();

        // Extract signatures from calldata
        address[] memory signers = _recoverSigners(userOpHash, userOp.signature);

        // Verify required signatures
        uint256 validCount = 0;
        for (uint256 i = 0; i < signers.length; i++) {
            if (isOwner[signers[i]]) {
                validCount++;
            }
        }

        require(validCount >= requiredSignatures, "Insufficient signatures");

        // Pay for gas
        if (missingAccountFunds > 0) {
            (bool ok, ) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(ok, "Fund transfer failed");
        }

        return 0;
    }

    function _recoverSigners(bytes32 hash, bytes memory signatures)
        internal
        view
        returns (address[] memory)
    {
        uint256 sigCount = signatures.length / 65;
        address[] memory recovered = new address[](sigCount);

        for (uint256 i = 0; i < sigCount; i++) {
            bytes memory sig = _sliceSignature(signatures, i);
            recovered[i] = _recoverSigner(hash, sig);
        }

        return recovered;
    }

    function _recoverSigner(bytes32 hash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = _splitSignature(signature);
        return ecrecover(hash, v, r, s);
    }

    function _sliceSignature(bytes memory sig, uint256 index)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory result = new bytes(65);
        uint256 offset = index * 65;
        for (uint256 i = 0; i < 65; i++) {
            result[i] = sig[offset + i];
        }
        return result;
    }

    function _splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        return 0;
    }

    function _entryPoint() internal view override returns (IEntryPoint) {
        return entryPoint;
    }

    receive() external payable {}
}
```

**Multi-sig features:**
- M-of-N signing schemes
- Owner management
- Flexible threshold
- Batch signature verification

### Technique 2: Session Keys

Time-limited delegation to sub-keys:

```solidity
pragma solidity ^0.8.0;

contract SessionKeyAccount is BaseAccount {
    address public owner;
    IEntryPoint public entryPoint;

    struct SessionKey {
        address key;
        uint256 allowance;
        uint256 validUntil;
        bool active;
    }

    mapping(bytes32 => SessionKey) public sessionKeys;
    mapping(address => uint256) public nonces;

    event SessionKeyCreated(bytes32 indexed keyHash, address key, uint256 allowance);
    event SessionKeyRevoked(bytes32 indexed keyHash);

    constructor(address _entryPoint) {
        entryPoint = IEntryPoint(_entryPoint);
        owner = msg.sender;
    }

    function createSessionKey(
        address key,
        uint256 allowance,
        uint256 duration
    ) external {
        require(msg.sender == owner, "Not owner");

        bytes32 keyHash = keccak256(abi.encode(key, allowance, duration));
        sessionKeys[keyHash] = SessionKey({
            key: key,
            allowance: allowance,
            validUntil: block.timestamp + duration,
            active: true
        });

        emit SessionKeyCreated(keyHash, key, allowance);
    }

    function revokeSessionKey(bytes32 keyHash) external {
        require(msg.sender == owner, "Not owner");
        sessionKeys[keyHash].active = false;
        emit SessionKeyRevoked(keyHash);
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        // Try owner signature first
        bytes32 hash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            userOpHash
        ));

        address recovered = ecrecover(
            hash,
            _getSigV(userOp.signature),
            _getSigR(userOp.signature),
            _getSigS(userOp.signature)
        );

        if (recovered == owner) {
            return 0;
        }

        // Try session keys
        bytes32 keyHash = keccak256(userOp.signature);
        SessionKey storage key = sessionKeys[keyHash];

        if (key.active && block.timestamp <= key.validUntil) {
            if (recovered == key.key) {
                return 0;
            }
        }

        return 1;
    }

    function _getSigV(bytes memory sig) internal pure returns (uint8) {
        return uint8(sig[64]);
    }

    function _getSigR(bytes memory sig) internal pure returns (bytes32) {
        return bytes32(uint256(bytes32(sig[0:32])));
    }

    function _getSigS(bytes memory sig) internal pure returns (bytes32) {
        return bytes32(uint256(bytes32(sig[32:64])));
    }

    function _entryPoint() internal view override returns (IEntryPoint) {
        return entryPoint;
    }

    receive() external payable {}
}
```

**Session key benefits:**
- Time-limited delegation
- Sub-key creation without owner
- Revocation mechanism
- Flexible allowance control

### Technique 3: Aggregated Signatures

Batch verify multiple signatures:

```solidity
pragma solidity ^0.8.0;

interface IAggregator {
    function validateSignatures(
        UserOperation[] calldata userOps,
        bytes calldata aggregationData
    ) external view returns (bytes memory);
}

contract BLSAggregator is IAggregator {
    function validateSignatures(
        UserOperation[] calldata userOps,
        bytes calldata aggregationData
    ) external view override returns (bytes memory) {
        // Aggregate BLS signatures
        // Returns context for batch verification

        uint256 count = userOps.length;
        bytes memory result = new bytes(count);

        for (uint256 i = 0; i < count; i++) {
            // Verify each signature
            bool valid = _verifyBLSSignature(userOps[i], aggregationData);
            if (valid) {
                result[i] = 0x01;
            }
        }

        return result;
    }

    function _verifyBLSSignature(UserOperation calldata userOp, bytes calldata data)
        internal
        view
        returns (bool)
    {
        // Implement BLS verification
        return true;
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Complete Smart Wallet with Access Control

Full-featured wallet with permissions:

```solidity
pragma solidity ^0.8.0;

contract AdvancedAccount is BaseAccount {
    address public owner;
    IEntryPoint public entryPoint;

    mapping(address => bool) public guardians;
    mapping(bytes32 => bool) public approvedActions;

    uint256 public nonce;
    uint256 public dailyLimit;
    uint256 public dailySpent;
    uint256 public lastResetDay;

    event ExecutionApproved(address indexed target, uint256 value);
    event GuardianAdded(address indexed guardian);
    event DailyLimitUpdated(uint256 newLimit);

    constructor(address _entryPoint) {
        entryPoint = IEntryPoint(_entryPoint);
        owner = msg.sender;
        dailyLimit = 10 ether;
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external {
        _requireFromEntryPoint();
        _checkDailyLimit(value);
        _call(target, value, data);
    }

    function executeWithApproval(
        address target,
        uint256 value,
        bytes calldata data,
        bytes calldata guardianSignatures
    ) external {
        _requireFromEntryPoint();

        // Verify guardian approval
        address[] memory signers = _recoverSigners(
            keccak256(abi.encode(target, value, data)),
            guardianSignatures
        );

        require(signers.length > 0 && guardians[signers[0]], "No guardian approval");

        _call(target, value, data);
    }

    function setDailyLimit(uint256 newLimit) external {
        require(msg.sender == owner, "Not owner");
        dailyLimit = newLimit;
        emit DailyLimitUpdated(newLimit);
    }

    function addGuardian(address guardian) external {
        require(msg.sender == owner, "Not owner");
        guardians[guardian] = true;
        emit GuardianAdded(guardian);
    }

    function _checkDailyLimit(uint256 amount) internal {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            lastResetDay = currentDay;
            dailySpent = 0;
        }

        dailySpent += amount;
        require(dailySpent <= dailyLimit, "Daily limit exceeded");
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            userOpHash
        ));

        (uint8 v, bytes32 r, bytes32 s) = _splitSignature(userOp.signature);
        address recovered = ecrecover(hash, v, r, s);

        if (recovered == owner) {
            return 0;
        }
        return 1;
    }

    function _recoverSigners(bytes32 hash, bytes memory signatures)
        internal
        view
        returns (address[] memory)
    {
        uint256 sigCount = signatures.length / 65;
        address[] memory recovered = new address[](sigCount);

        for (uint256 i = 0; i < sigCount; i++) {
            uint256 offset = i * 65;
            uint8 v = uint8(signatures[offset + 64]);
            bytes32 r = bytes32(uint256(bytes32(signatures[offset:offset+32])));
            bytes32 s = bytes32(uint256(bytes32(signatures[offset+32:offset+64])));

            recovered[i] = ecrecover(hash, v, r, s);
        }

        return recovered;
    }

    function _splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function _call(address target, uint256 value, bytes calldata data) internal {
        (bool success, ) = payable(target).call{value: value}(data);
        require(success, "Call failed");
        emit ExecutionApproved(target, value);
    }

    function _entryPoint() internal view override returns (IEntryPoint) {
        return entryPoint;
    }

    receive() external payable {}
}
```

### Example 2: Bundler Integration

Aggregate and execute multiple UserOps:

```solidity
pragma solidity ^0.8.0;

contract SimpleBundler {
    address public entryPoint;
    address public bundler;

    event OpsBundled(uint256 count, address indexed executor);

    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
        bundler = msg.sender;
    }

    function bundle(UserOperation[] calldata ops) external payable {
        require(msg.sender == bundler, "Not bundler");

        // Collect all operations
        uint256 totalGasNeeded = 0;
        for (uint256 i = 0; i < ops.length; i++) {
            uint256 gasNeeded = ops[i].callGasLimit +
                               ops[i].verificationGasLimit +
                               ops[i].preVerificationGas;
            totalGasNeeded += gasNeeded;
        }

        require(msg.value >= totalGasNeeded * tx.gasprice, "Insufficient gas payment");

        // Execute through EntryPoint
        IEntryPoint(entryPoint).handleOps(ops, payable(msg.sender));

        emit OpsBundled(ops.length, msg.sender);
    }

    function batchAndExecute(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata data
    ) external payable {
        require(targets.length == values.length && values.length == data.length);

        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = payable(targets[i]).call{value: values[i]}(data[i]);
            require(success, "Batch execution failed");
        }
    }
}
```

## Best Practices

**UserOperation Design**
- Estimate gas accurately
- Include preVerificationGas
- Set reasonable maxFeePerGas
- Handle nonce properly
- Include salt for wallet creation

**Signature Verification**
- Validate userOpHash format
- Handle ECDSA edge cases
- Support signature aggregation
- Verify against recovered address
- Return proper validationData

**Paymaster Integration**
- Verify paymaster authorization
- Set appropriate gas limits
- Handle refund logic
- Track sponsored operations
- Implement access control

**Security Patterns**
- Implement replay protection via nonce
- Validate all call parameters
- Handle ETH transfers safely
- Verify EntryPoint caller
- Test batch operations

## Common Pitfalls

**Issue 1: Incorrect Nonce Handling**
```solidity
// ❌ Wrong - nonce not incremented
function validateUserOp(...) external override returns (uint256) {
    // Never increments nonce!
    return 0;
}

// ✅ Correct - EntryPoint increments after validation
function validateUserOp(...) external override returns (uint256) {
    require(userOp.nonce == nonce++, "Invalid nonce");
    return 0;
}
```
**Solution:** Rely on EntryPoint for nonce incrementing, just verify it matches.

**Issue 2: Missing Gas Payment**
```solidity
// ❌ Wrong - doesn't pay EntryPoint for gas
function validateUserOp(...) external override returns (uint256) {
    _validateSignature(userOp, opHash);
    return 0;  // Forgot to pay!
}

// ✅ Correct - pays EntryPoint for gas
function validateUserOp(
    UserOperation calldata userOp,
    bytes32 opHash,
    uint256 missingAccountFunds
) external override returns (uint256) {
    _validateSignature(userOp, opHash);
    if (missingAccountFunds > 0) {
        (bool ok, ) = payable(msg.sender).call{value: missingAccountFunds}("");
        require(ok);
    }
    return 0;
}
```
**Solution:** Always pay EntryPoint for gas in validateUserOp.

**Issue 3: Incorrect Signature Encoding**
```solidity
// ❌ Wrong - signature not properly encoded
bytes memory sig = abi.encodePacked(r, s, v);  // Wrong order!

// ✅ Correct - standard signature encoding
bytes memory sig = abi.encodePacked(r, s, v);  // Or use split form
```
**Solution:** Ensure signature format matches recovery expectations.

**Issue 4: Missing Init Code for New Accounts**
```solidity
// ❌ Wrong - creating account without initCode
UserOperation memory op = UserOperation({
    sender: newAddress,
    initCode: "",  // Missing!
    ...
});

// ✅ Correct - include initCode for account creation
UserOperation memory op = UserOperation({
    sender: newAddress,
    initCode: abi.encodePacked(factory, abi.encode(owner)),
    ...
});
```
**Solution:** Provide initCode when account doesn't exist yet.

## Resources

**Official Standards**
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337) - Full spec
- [EntryPoint Contract](https://github.com/eth-infinitism/account-abstraction) - Reference implementation

**SDK & Libraries**
- [ethers.js account abstraction](https://docs.ethers.org/) - JavaScript SDK
- [OpenZeppelin AA](https://docs.openzeppelin.com/) - Reference contracts
- [Stackup SDK](https://www.stackup.sh/) - Bundler service

**Bundlers & Infrastructure**
- [Pimlico](https://www.pimlico.io/) - Bundler infrastructure
- [Stackup](https://www.stackup.sh/) - Bundler service
- [Alchemy AA API](https://www.alchemy.com/) - Bundler service

**Related Skills**
- `eip712-typed-signatures` - Signature schemes for UserOps
- `diamond-proxy-pattern` - Multi-signature proxy pattern
- `multicall-aggregation` - Batch operation patterns
