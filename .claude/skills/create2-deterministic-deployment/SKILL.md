---
name: create2-deterministic-deployment
description: "Progressive disclosure skill: Quick reference in 40 tokens, expands to 5500 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [40, 5500]
---

# CREATE2 Deterministic Deployment

> Progressive disclosure skill: Quick reference in 40 tokens, expands to 5500 tokens

## Quick Reference (Load: 40 tokens)

CREATE2 enables predictable contract addresses derived from deployer, salt, and bytecode hash.

**Core concepts:**
- Address = keccak256(0xff || deployer || salt || bytecodeHash)
- Pre-calculated addresses before deployment
- Deployer independence via factory contracts
- Cross-chain determinism
- Salt-based uniqueness

**Quick start:**
```solidity
bytes32 salt = keccak256(abi.encode(owner, timestamp));

address predicted = address(uint160(uint256(keccak256(
    abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
))));

MyContract deployed = new MyContract{salt: salt}(args);
require(address(deployed) == predicted);
```

## Core Concepts (Expand: +700 tokens)

### CREATE2 Address Calculation

Deterministic address from components:

```solidity
pragma solidity ^0.8.0;

library CREATE2Helper {
    function computeAddress(
        address deployer,
        bytes32 salt,
        bytes memory bytecode
    ) internal pure returns (address) {
        bytes32 bytecodeHash = keccak256(bytecode);

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),       // CREATE2 magic byte
                deployer,           // Deployer address
                salt,               // Salt value
                bytecodeHash        // Keccak256 of creation code
            )
        );

        return address(uint160(uint256(hash)));
    }

    function computeAddressERC1167(
        address deployer,
        bytes32 salt,
        address implementation
    ) internal pure returns (address) {
        // Minimal proxy bytecode
        bytes memory bytecode = abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );

        return computeAddress(deployer, salt, bytecode);
    }
}

contract DeploymentValidator {
    function predictAddress(
        address deployer,
        bytes32 salt,
        bytes memory bytecode
    ) external pure returns (address) {
        return CREATE2Helper.computeAddress(deployer, salt, bytecode);
    }

    function verifyDeployed(
        address expected,
        address actual
    ) external pure returns (bool) {
        return expected == actual;
    }
}
```

**Address components:**
- `0xff` - CREATE2 opcode identifier
- `deployer` - Address of creator
- `salt` - Arbitrary 32-byte value
- `bytecodeHash` - Keccak256 of creation code
- All packed and hashed via Keccak256

### Salt Generation Strategies

Deterministic and random salt creation:

```solidity
pragma solidity ^0.8.0;

library SaltGenerator {
    // Deterministic salt from known values
    function deterministicSalt(
        address owner,
        uint256 chainId,
        string memory name
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(owner, chainId, name));
    }

    // Salts with versioning
    function versionedSalt(
        bytes32 baseSalt,
        uint256 version
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(baseSalt, version));
    }

    // Sequential salt generation
    function sequentialSalt(
        bytes32 baseSalt,
        uint256 index
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(baseSalt, index));
    }

    // Time-based salt
    function timeSalt(
        bytes32 baseSalt,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(baseSalt, timestamp));
    }

    // Entropy-combined salt
    function entropyMixedSalt(
        bytes32 baseSalt,
        bytes32 randomness
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(baseSalt, randomness));
    }
}

contract SaltProvider {
    bytes32 public baseSalt;
    uint256 public deploymentIndex;

    constructor() {
        baseSalt = keccak256(abi.encode(msg.sender, block.timestamp));
    }

    function getNextSalt() external returns (bytes32) {
        return SaltGenerator.sequentialSalt(baseSalt, deploymentIndex++);
    }

    function predictSalt(uint256 index) external view returns (bytes32) {
        return SaltGenerator.sequentialSalt(baseSalt, index);
    }
}
```

**Salt strategies:**
- Deterministic - Reproducible across chains
- Versioned - Multiple versions of same contract
- Sequential - Progressive deployment
- Entropy-based - Random but verifiable
- Time-based - Timestamp-locked

### Bytecode Independence

Contracts with identical logic, different addresses:

```solidity
pragma solidity ^0.8.0;

// Same bytecode
contract TokenV1 {
    string public name = "Token V1";
    function version() external pure returns (uint256) {
        return 1;
    }
}

// Different bytecode (different version string)
contract TokenV2 {
    string public name = "Token V2";
    function version() external pure returns (uint256) {
        return 2;
    }
}

contract CreateDeployer {
    // These will have different addresses due to different bytecode
    TokenV1 public v1;
    TokenV2 public v2;

    function deployV1(bytes32 salt) external {
        v1 = new TokenV1{salt: salt}();
    }

    function deployV2(bytes32 salt) external {
        v2 = new TokenV2{salt: salt}();
    }

    // If bytecode is identical, same salt = same address
    // Different salt = different address (even with same bytecode)
}
```

## Common Patterns (Expand: +1100 tokens)

### Pattern 1: Factory with Pre-calculated Addresses

Deploy contracts at predictable addresses:

```solidity
pragma solidity ^0.8.0;

interface IToken {
    function initialize(address owner) external;
}

contract TokenFactory {
    event TokenDeployed(address indexed token, bytes32 salt, address indexed owner);

    mapping(bytes32 => address) public deployments;
    address[] public allTokens;

    function computeTokenAddress(address owner, uint256 index)
        public
        view
        returns (address)
    {
        bytes32 salt = keccak256(abi.encode(owner, index));
        bytes32 bytecodeHash = keccak256(type(SimpleToken).creationCode);

        return address(uint160(uint256(
            keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            ))
        )));
    }

    function deployToken(address owner, uint256 index)
        external
        returns (address)
    {
        bytes32 salt = keccak256(abi.encode(owner, index));

        SimpleToken token = new SimpleToken{salt: salt}();
        token.initialize(owner);

        address predictedAddress = computeTokenAddress(owner, index);
        require(address(token) == predictedAddress, "Address mismatch");

        deployments[salt] = address(token);
        allTokens.push(address(token));

        emit TokenDeployed(address(token), salt, owner);
        return address(token);
    }

    function getDeploymentCount() external view returns (uint256) {
        return allTokens.length;
    }

    function getPredictedAddresses(
        address owner,
        uint256 count
    ) external view returns (address[] memory) {
        address[] memory predictions = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            predictions[i] = computeTokenAddress(owner, i);
        }
        return predictions;
    }
}

contract SimpleToken {
    address public owner;
    string public name;
    uint256 public totalSupply;

    function initialize(address _owner) external {
        require(owner == address(0), "Already initialized");
        owner = _owner;
    }
}
```

**Factory benefits:**
- Pre-calculate all addresses
- Store expected addresses on-chain
- Verify deployments match predictions
- Gas-efficient factory pattern
- Auditable deployment history

### Pattern 2: Cross-Chain Wallet Deployment

Deploy same wallet on multiple chains:

```solidity
pragma solidity ^0.8.0;

contract CrossChainWalletFactory {
    mapping(uint256 => mapping(bytes32 => address)) public wallets;
    mapping(address => uint256[]) public userChains;

    event WalletDeployed(
        uint256 indexed chainId,
        address indexed wallet,
        address indexed owner,
        bytes32 salt
    );

    function computeWalletAddress(
        address owner,
        uint256 chainId,
        address deployer
    ) public pure returns (bytes32 salt, address wallet) {
        salt = keccak256(abi.encode(owner, chainId));

        bytes32 bytecodeHash = keccak256(type(CrossChainWallet).creationCode);

        wallet = address(uint160(uint256(
            keccak256(abi.encodePacked(
                bytes1(0xff),
                deployer,
                salt,
                bytecodeHash
            ))
        )));
    }

    function deployWallet(address owner) external returns (address) {
        (bytes32 salt, address predicted) = computeWalletAddress(
            owner,
            block.chainid,
            address(this)
        );

        CrossChainWallet wallet = new CrossChainWallet{salt: salt}(owner);
        require(address(wallet) == predicted, "Address mismatch");

        wallets[block.chainid][salt] = address(wallet);
        userChains[owner].push(block.chainid);

        emit WalletDeployed(block.chainid, address(wallet), owner, salt);

        return address(wallet);
    }

    function getWalletAddress(address owner, uint256 chainId)
        external
        view
        returns (address)
    {
        (, address wallet) = computeWalletAddress(owner, chainId, address(this));
        return wallet;
    }

    function getUserChains(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return userChains[owner];
    }
}

contract CrossChainWallet {
    address public owner;
    mapping(address => uint256) public balances;

    constructor(address _owner) {
        owner = _owner;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    receive() external payable {
        deposit();
    }
}
```

**Cross-chain benefits:**
- Identical addresses across chains
- Same owner across all chains
- No bridge required for discovery
- Trustless address verification
- Chain-aware salt inclusion

### Pattern 3: Proxy Clone Deployment

Deploy minimal proxies at predictable addresses:

```solidity
pragma solidity ^0.8.0;

contract ProxyFactory {
    address public masterImplementation;

    event ProxyDeployed(address indexed proxy, address indexed implementation, bytes32 salt);

    constructor(address _masterImplementation) {
        masterImplementation = _masterImplementation;
    }

    function computeProxyAddress(
        address owner,
        uint256 index
    ) public view returns (address) {
        bytes32 salt = keccak256(abi.encode(owner, index));
        bytes memory proxyBytecode = _getProxyBytecode();
        bytes32 bytecodeHash = keccak256(proxyBytecode);

        return address(uint160(uint256(
            keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            ))
        )));
    }

    function deployProxy(address owner, uint256 index)
        external
        returns (address proxyAddress)
    {
        bytes32 salt = keccak256(abi.encode(owner, index));

        // Create minimal proxy
        bytes memory proxyBytecode = _getProxyBytecodeWithImplementation();
        assembly {
            proxyAddress := create2(0, add(proxyBytecode, 32), mload(proxyBytecode), salt)
        }

        require(proxyAddress != address(0), "Deployment failed");

        address predicted = computeProxyAddress(owner, index);
        require(proxyAddress == predicted, "Address mismatch");

        emit ProxyDeployed(proxyAddress, masterImplementation, salt);

        return proxyAddress;
    }

    function _getProxyBytecode() internal view returns (bytes memory) {
        // ERC1167 minimal proxy
        return abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            masterImplementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );
    }

    function _getProxyBytecodeWithImplementation() internal view returns (bytes memory) {
        return _getProxyBytecode();
    }

    function upgradeImplementation(address newImplementation) external {
        require(msg.sender == owner, "Not owner");
        masterImplementation = newImplementation;
    }

    address public owner;
}
```

**Proxy benefits:**
- Minimal proxy deployment
- Shared implementation
- Predictable proxy addresses
- Gas-efficient cloning
- Single implementation upgrade

## Advanced Techniques (Expand: +1300 tokens)

### Technique 1: Salt-Based Versioning

Multiple versions of same contract type:

```solidity
pragma solidity ^0.8.0;

contract VersionedDeployer {
    mapping(string => mapping(uint256 => address)) public versions;
    mapping(string => uint256) public latestVersions;

    event VersionDeployed(
        string indexed name,
        uint256 indexed version,
        address deployed,
        bytes32 salt
    );

    function predictAddress(
        string memory name,
        uint256 version,
        bytes memory bytecode
    ) public view returns (address) {
        bytes32 salt = keccak256(abi.encode(name, version));
        bytes32 bytecodeHash = keccak256(bytecode);

        return address(uint160(uint256(
            keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            ))
        )));
    }

    function deployVersion(
        string memory name,
        uint256 version,
        bytes memory initCode
    ) external returns (address) {
        bytes32 salt = keccak256(abi.encode(name, version));

        // Deploy using create2
        address deployed;
        assembly {
            deployed := create2(0, add(initCode, 32), mload(initCode), salt)
        }

        require(deployed != address(0), "Deployment failed");

        versions[name][version] = deployed;
        if (version > latestVersions[name]) {
            latestVersions[name] = version;
        }

        emit VersionDeployed(name, version, deployed, salt);
        return deployed;
    }

    function getVersion(string memory name, uint256 version)
        external
        view
        returns (address)
    {
        return versions[name][version];
    }

    function getLatestVersion(string memory name)
        external
        view
        returns (address)
    {
        uint256 version = latestVersions[name];
        return versions[name][version];
    }
}
```

**Versioning benefits:**
- Multiple contract versions
- Unique address per version
- Version history tracking
- Backward compatibility support
- Salt-based organization

### Technique 2: Conditional Pre-funding

Deploy contracts with initial balance:

```solidity
pragma solidity ^0.8.0;

contract PreFundedDeployer {
    mapping(address => uint256) public pendingFunds;

    event FundsPrepared(address indexed target, uint256 amount);
    event ContractDeployed(address indexed contract, uint256 initialFunding);

    // Pre-fund the CREATE2 address
    function prepareFunds(bytes32 salt, uint256 amount)
        external
        payable
    {
        require(msg.value >= amount, "Insufficient ETH");

        // Calculate future address (you know the deployer)
        address predictedAddress = predictAddress(salt);

        // Send funds to predicted address
        (bool ok, ) = payable(predictedAddress).call{value: amount}("");
        require(ok, "Transfer failed");

        pendingFunds[predictedAddress] = amount;
        emit FundsPrepared(predictedAddress, amount);
    }

    function deployWithFunding(bytes32 salt)
        external
        returns (address)
    {
        MyContract contract = new MyContract{salt: salt}();
        address contractAddr = address(contract);

        require(pendingFunds[contractAddr] > 0, "No funds prepared");

        // Contract can now access its funding
        contract.initializeWithFunding(pendingFunds[contractAddr]);
        delete pendingFunds[contractAddr];

        emit ContractDeployed(contractAddr, pendingFunds[contractAddr]);
        return contractAddr;
    }

    function predictAddress(bytes32 salt) public view returns (address) {
        bytes32 bytecodeHash = keccak256(type(MyContract).creationCode);

        return address(uint160(uint256(
            keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            ))
        )));
    }

    receive() external payable {}
}

contract MyContract {
    address public owner;
    uint256 public initialFunding;

    constructor() {
        owner = msg.sender;
    }

    function initializeWithFunding(uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        initialFunding = amount;
    }

    receive() external payable {}
}
```

**Pre-funding benefits:**
- Initial contract balance
- Atomic funding + deployment
- Multi-step initialization
- Gas-efficient funding

### Technique 3: Cross-Contract CREATE2 Coordination

Contracts deploying other contracts via CREATE2:

```solidity
pragma solidity ^0.8.0;

contract CoordinatedDeployer {
    address public controlCenter;

    mapping(address => address[]) public deployedByUser;

    event DeploymentCoordinated(
        address indexed deployer,
        address indexed deployed,
        bytes32 salt
    );

    constructor() {
        controlCenter = msg.sender;
    }

    function predictMultiple(
        address deployer,
        bytes32[] memory salts,
        bytes memory bytecode
    ) external pure returns (address[] memory) {
        address[] memory predictions = new address[](salts.length);
        bytes32 bytecodeHash = keccak256(bytecode);

        for (uint256 i = 0; i < salts.length; i++) {
            predictions[i] = address(uint160(uint256(
                keccak256(abi.encodePacked(
                    bytes1(0xff),
                    deployer,
                    salts[i],
                    bytecodeHash
                ))
            )));
        }

        return predictions;
    }

    function coordinateDeploy(
        bytes32[] memory salts,
        bytes[] memory initCodes
    ) external returns (address[] memory deployed) {
        require(msg.sender == controlCenter, "Not authorized");
        require(salts.length == initCodes.length, "Length mismatch");

        deployed = new address[](salts.length);

        for (uint256 i = 0; i < salts.length; i++) {
            assembly {
                let ptr := add(initCodes, add(32, mul(i, 32)))
                let code := mload(ptr)
                let codeStart := add(code, 32)
                let codeSize := mload(code)

                let result := create2(0, codeStart, codeSize, mload(add(salts, add(32, mul(i, 32)))))
                mstore(add(deployed, add(32, mul(i, 32))), result)
            }

            deployedByUser[msg.sender].push(deployed[i]);
            emit DeploymentCoordinated(msg.sender, deployed[i], salts[i]);
        }

        return deployed;
    }

    function getDeployedContracts(address user)
        external
        view
        returns (address[] memory)
    {
        return deployedByUser[user];
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Complete Deterministic Wallet Factory

Full wallet deployment with address pre-calculation:

```solidity
pragma solidity ^0.8.0;

contract DeterministicWalletFactory {
    bytes32 constant WALLET_SALT_SEED = keccak256("wallet.factory");

    mapping(address => address[]) public userWallets;
    mapping(address => uint256) public walletCount;
    mapping(bytes32 => bool) public deployedSalts;

    event WalletDeployed(
        address indexed owner,
        address indexed wallet,
        bytes32 salt,
        uint256 index
    );

    function predictWalletAddress(address owner, uint256 index)
        public
        view
        returns (address)
    {
        bytes32 salt = _computeSalt(owner, index);
        bytes32 bytecodeHash = keccak256(type(DeterministicWallet).creationCode);

        return address(uint160(uint256(
            keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            ))
        )));
    }

    function deployWallet(address owner, uint256 index)
        external
        returns (address)
    {
        bytes32 salt = _computeSalt(owner, index);
        require(!deployedSalts[salt], "Salt already used");

        address predicted = predictWalletAddress(owner, index);

        DeterministicWallet wallet = new DeterministicWallet{salt: salt}(
            owner,
            block.chainid
        );

        require(address(wallet) == predicted, "Address computation failed");

        deployedSalts[salt] = true;
        userWallets[owner].push(address(wallet));
        walletCount[owner]++;

        emit WalletDeployed(owner, address(wallet), salt, index);

        return address(wallet);
    }

    function getWalletAddresses(address owner)
        external
        view
        returns (address[] memory)
    {
        return userWallets[owner];
    }

    function getPredictedAddresses(address owner, uint256 count)
        external
        view
        returns (address[] memory)
    {
        address[] memory predictions = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            predictions[i] = predictWalletAddress(owner, i);
        }
        return predictions;
    }

    function _computeSalt(address owner, uint256 index)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(WALLET_SALT_SEED, owner, index)
        );
    }
}

contract DeterministicWallet {
    address public owner;
    uint256 public chainId;
    mapping(address => bool) public authorized;

    event ExecutionApproved(address indexed target, bytes data);

    constructor(address _owner, uint256 _chainId) {
        owner = _owner;
        chainId = _chainId;
        authorized[_owner] = true;
    }

    function authorize(address user) external {
        require(msg.sender == owner, "Not owner");
        authorized[user] = true;
    }

    function execute(address target, bytes calldata data)
        external
        payable
        returns (bytes memory)
    {
        require(authorized[msg.sender], "Not authorized");

        (bool success, bytes memory result) = target.call(data);
        require(success, "Call failed");

        emit ExecutionApproved(target, data);
        return result;
    }

    function executeBatch(
        address[] calldata targets,
        bytes[] calldata data
    ) external payable returns (bytes[] memory results) {
        require(authorized[msg.sender], "Not authorized");
        require(targets.length == data.length, "Length mismatch");

        results = new bytes[](targets.length);

        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, bytes memory result) = targets[i].call(data[i]);
            require(success, "Call failed");
            results[i] = result;
        }

        return results;
    }

    receive() external payable {}
}
```

### Example 2: Multi-Chain Deployment Coordinator

Deploy identical contracts across chains:

```solidity
pragma solidity ^0.8.0;

contract MultiChainCoordinator {
    bytes32 constant MULTICHAIN_SALT_SEED = keccak256("multichain");

    struct DeploymentRecord {
        uint256[] chainIds;
        address[] deploymentAddresses;
        bytes32 salt;
        bytes bytecode;
    }

    mapping(bytes32 => DeploymentRecord) public deployments;
    mapping(address => bytes32[]) public userDeployments;

    event MultiChainDeploymentRecorded(
        address indexed deployer,
        uint256[] chainIds,
        address[] addresses,
        bytes32 salt
    );

    function recordDeployment(
        uint256[] calldata chainIds,
        address[] calldata addresses,
        bytes memory bytecode
    ) external {
        require(chainIds.length == addresses.length, "Length mismatch");

        bytes32 salt = keccak256(abi.encode(
            MULTICHAIN_SALT_SEED,
            msg.sender,
            block.timestamp
        ));

        deployments[salt] = DeploymentRecord({
            chainIds: chainIds,
            deploymentAddresses: addresses,
            salt: salt,
            bytecode: bytecode
        });

        userDeployments[msg.sender].push(salt);

        emit MultiChainDeploymentRecorded(msg.sender, chainIds, addresses, salt);
    }

    function predictAddress(
        address deployer,
        uint256 chainId,
        bytes32 salt
    ) external pure returns (address) {
        bytes32 computedSalt = keccak256(abi.encode(salt, chainId));
        // Use bytecodeHash from recorded deployment
        // This would need to be passed or stored
        return address(0);  // Simplified
    }

    function getDeploymentChains(bytes32 salt)
        external
        view
        returns (uint256[] memory)
    {
        return deployments[salt].chainIds;
    }

    function getDeploymentAddresses(bytes32 salt)
        external
        view
        returns (address[] memory)
    {
        return deployments[salt].deploymentAddresses;
    }

    function getUserDeployments(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userDeployments[user];
    }

    function verifyDeployment(
        bytes32 salt,
        uint256 chainId,
        address expectedAddress
    ) external view returns (bool) {
        DeploymentRecord storage record = deployments[salt];

        for (uint256 i = 0; i < record.chainIds.length; i++) {
            if (record.chainIds[i] == chainId) {
                return record.deploymentAddresses[i] == expectedAddress;
            }
        }

        return false;
    }
}
```

## Best Practices

**Address Prediction**
- Always compute before deploying
- Verify match after deployment
- Store predicted addresses on-chain
- Document salt generation
- Test across networks

**Salt Management**
- Use deterministic generation
- Include versioning information
- Prevent salt collision
- Document salt scheme
- Maintain salt registry

**Bytecode Consistency**
- Ensure identical source across deploys
- Account for compiler differences
- Test bytecode matching
- Version contracts explicitly
- Audit initialization logic

**Cross-Chain Deployment**
- Include chainId in salt
- Predict before deployment
- Coordinate deployments
- Document deployment order
- Verify all addresses

## Common Pitfalls

**Issue 1: Bytecode Differences**
```solidity
// ❌ Wrong - different compiler settings = different bytecode
// Contract deployed with Solidity 0.8.0
// Later redeployed with Solidity 0.8.1
// Same source, different bytecode -> different address!

// ✅ Correct - lock compiler version
// pragma solidity ^0.8.0;  <- use locked version
pragma solidity 0.8.20;    // Fixed version

// OR document bytecode changes
```
**Solution:** Use locked compiler versions, verify bytecode before deployment.

**Issue 2: Constructor Arguments in CREATE2**
```solidity
// ❌ Wrong - constructor args change bytecode
bytes memory code = type(MyContract).creationCode;
// This includes constructor encoding!
address predicted = predict(code);

MyContract deployed = new MyContract{salt: salt}(argument);
// Address mismatch if argument changes!

// ✅ Correct - account for constructor in bytecode
bytes memory code = abi.encodePacked(
    type(MyContract).creationCode,
    abi.encode(argument)  // Include constructor arg
);
address predicted = predict(code);
```
**Solution:** Include constructor args in bytecode calculation.

**Issue 3: Deployer Address Matters**
```solidity
// ❌ Wrong - same salt, different deployer = different address
// Deployer A uses salt X -> Address A
// Deployer B uses salt X -> Address B

// ✅ Correct - include deployer in salt or prediction
bytes32 salt = keccak256(abi.encode(msg.sender, index));
address predicted = computeAddress(address(this), salt, bytecode);
```
**Solution:** Remember deployer is part of address calculation.

**Issue 4: Missing Salt Validation**
```solidity
// ❌ Wrong - no salt collision check
function deploy(bytes32 salt) external {
    MyContract c = new MyContract{salt: salt}();
}

// ✅ Correct - prevent double deployment
mapping(bytes32 => bool) public usedSalts;

function deploy(bytes32 salt) external {
    require(!usedSalts[salt], "Salt used");
    usedSalts[salt] = true;
    MyContract c = new MyContract{salt: salt}();
}
```
**Solution:** Track used salts, prevent reuse.

## Resources

**Official Documentation**
- [EIP-1014 CREATE2 Spec](https://eips.ethereum.org/EIPS/eip-1014) - Full specification
- [Solidity CREATE2](https://docs.soliditylang.org/en/latest/control-structures.html#create2) - Language docs

**Reference Implementations**
- [OpenZeppelin Create2](https://docs.openzeppelin.com/) - Reference implementation
- [Uniswap V3 Factory](https://github.com/Uniswap/v3-core/blob/main/contracts/UniswapV3Factory.sol) - Factory pattern

**Tools & Utilities**
- [Create2 Address Predictor](https://github.com/pcaversaccio/create2-address-predictor) - CLI tool
- [Foundry Create2 Utils](https://book.getfoundry.sh/) - Testing support

**Related Skills**
- `contract-upgrades` - Proxy patterns with CREATE2
- `account-abstraction-erc4337` - Wallet creation with CREATE2
- `diamond-proxy-pattern` - Multi-facet initialization
