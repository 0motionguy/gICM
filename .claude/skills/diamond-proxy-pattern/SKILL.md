---
name: diamond-proxy-pattern
description: "Progressive disclosure skill: Quick reference in 42 tokens, expands to 5600 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [42, 5600]
---

# Diamond Proxy Pattern (EIP-2535)

> Progressive disclosure skill: Quick reference in 42 tokens, expands to 5600 tokens

## Quick Reference (Load: 42 tokens)

Diamond proxy enables multi-facet upgradeable contracts with granular function routing and storage isolation.

**Core concepts:**
- Facets - Separate implementation contracts
- Selectors - Function routing via 4-byte signatures
- Storage - Isolated AppStorage struct
- Loupe functions - Introspection interface
- Cuts - Add/remove/replace facets atomically

**Quick start:**
```solidity
struct AppStorage {
    mapping(address => uint256) balances;
}

function diamondCut(FacetCut[] calldata cuts, address init, bytes calldata data) external {
    LibDiamond.diamondCut(cuts, init, data);
}

// In facet
AppStorage storage s = LibAppStorage.diamondStorage();
s.balances[msg.sender] += amount;
```

## Core Concepts (Expand: +750 tokens)

### Diamond Architecture

Diamond proxy separates interface from implementation:

```solidity
pragma solidity ^0.8.0;

interface IDiamond {
    event DiamondCut(
        FacetCut[] indexed _diamondCut,
        address indexed _init,
        bytes _calldata
    );
}

struct FacetCut {
    address facetAddress;
    FacetCutAction action;
    bytes4[] functionSelectors;
}

enum FacetCutAction {Add, Replace, Remove}

contract Diamond {
    // Diamond delegate calls to facets via fallback
    fallback() external payable {
        address facet = LibDiamond.facetAddress(msg.sig);
        require(facet != address(0), "Diamond: Unknown function");
        _delegatecall(facet);
    }

    function diamondCut(
        FacetCut[] calldata cuts,
        address init,
        bytes calldata data
    ) external onlyOwner {
        LibDiamond.diamondCut(cuts, init, data);
    }

    function _delegatecall(address facet) internal {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {revert(0, returndatasize())}
            default {return(0, returndatasize())}
        }
    }
}
```

**Architecture components:**
- `Diamond` - Main proxy handling delegation
- `FacetCuts` - Describe function routing changes
- `Facets` - Implementation contracts
- `LibDiamond` - Shared upgrade logic
- `AppStorage` - Centralized state

### Function Selectors

Map function signatures to implementations:

```solidity
library LibDiamond {
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage");

    struct DiamondStorage {
        mapping(bytes4 => address) facets;
        mapping(address => bytes4[]) facetSelectors;
        bytes4[] selectors;
        uint16 selectorCount;
        mapping(bytes4 => uint16) selectorIndices;
    }

    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    // Get function selector from signature
    function getSelector(string memory signature) internal pure returns (bytes4) {
        return bytes4(keccak256(abi.encodePacked(signature)));
    }

    // Register selector to facet
    function addSelector(bytes4 selector, address facet) internal {
        DiamondStorage storage ds = diamondStorage();
        require(ds.facets[selector] == address(0), "Selector exists");

        ds.facets[selector] = facet;
        ds.facetSelectors[facet].push(selector);
    }

    // Remove selector
    function removeSelector(bytes4 selector) internal {
        DiamondStorage storage ds = diamondStorage();
        require(ds.facets[selector] != address(0), "Unknown selector");

        address facet = ds.facets[selector];
        delete ds.facets[selector];

        // Remove from facet's selector list
        bytes4[] storage selectors = ds.facetSelectors[facet];
        for (uint i = 0; i < selectors.length; i++) {
            if (selectors[i] == selector) {
                selectors[i] = selectors[selectors.length - 1];
                selectors.pop();
                break;
            }
        }
    }
}
```

**Selector routing rules:**
- Each function has 4-byte signature hash
- Selector maps to facet address
- Multiple selectors per facet allowed
- Remove selector removes routing

### Storage Layout

Centralized storage for all facets:

```solidity
pragma solidity ^0.8.0;

// Storage at specific position
bytes32 constant APP_STORAGE_POSITION = keccak256("app.storage");

struct AppStorage {
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    uint256 totalSupply;
    string name;
    uint8 decimals;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        bytes32 position = APP_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}

// In any facet
contract TransferFacet {
    function transfer(address to, uint256 amount) external {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(s.balances[msg.sender] >= amount, "Insufficient balance");

        s.balances[msg.sender] -= amount;
        s.balances[to] += amount;
    }
}
```

**Storage patterns:**
- Single AppStorage struct
- Deterministic storage position
- All facets access same storage
- Prevents storage collision
- Allows safe upgrades

### Loupe Functions

Introspect diamond structure:

```solidity
interface IDiamondLoupe {
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    function facets() external view returns (Facet[] memory);
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory);
    function facetAddresses() external view returns (address[] memory);
    function facetAddress(bytes4 _functionSelector) external view returns (address);
    function supportsInterface(bytes4 _interfaceId) external view returns (bool);
}

contract LoupeFacet is IDiamondLoupe {
    function facets() external view returns (Facet[] memory facets_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        facets_ = new Facet[](ds.selectorCount);

        uint8 facetIndex;
        address currentFacet = address(0);

        for (uint256 i = 0; i < ds.selectors.length; i++) {
            bytes4 selector = ds.selectors[i];
            address facet = ds.facets[selector];

            if (facet != currentFacet) {
                currentFacet = facet;
                facets_[facetIndex].facetAddress = facet;
            }

            facets_[facetIndex].functionSelectors.push(selector);
        }
    }

    function facetAddress(bytes4 _functionSelector) external view returns (address) {
        return LibDiamond.diamondStorage().facets[_functionSelector];
    }
}
```

## Common Patterns (Expand: +1100 tokens)

### Pattern 1: Multi-Facet Token System

Complete ERC-20 split across multiple facets:

```solidity
pragma solidity ^0.8.0;

bytes32 constant APP_STORAGE_POSITION = keccak256("app.storage");

struct AppStorage {
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    uint256 totalSupply;
    string name;
    string symbol;
    uint8 decimals;
    address owner;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        bytes32 position = APP_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}

contract TransferFacet {
    event Transfer(address indexed from, address indexed to, uint256 value);

    function transfer(address to, uint256 amount) external returns (bool) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(s.balances[msg.sender] >= amount, "Insufficient balance");

        s.balances[msg.sender] -= amount;
        s.balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(s.balances[from] >= amount, "Insufficient balance");
        require(s.allowances[from][msg.sender] >= amount, "Insufficient allowance");

        s.balances[from] -= amount;
        s.balances[to] += amount;
        s.allowances[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }
}

contract ApproveFacet {
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function approve(address spender, uint256 amount) external returns (bool) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        s.allowances[msg.sender][spender] = amount;

        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.allowances[owner][spender];
    }
}

contract InfoFacet {
    function name() external view returns (string memory) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.name;
    }

    function symbol() external view returns (string memory) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.symbol;
    }

    function balanceOf(address account) external view returns (uint256) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.balances[account];
    }

    function totalSupply() external view returns (uint256) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        return s.totalSupply;
    }
}
```

**Multi-facet benefits:**
- Separate concerns by functionality
- Independent facet upgrades
- Shared storage via AppStorage
- Clean interface segregation
- Easy testing per facet

### Pattern 2: Progressive Upgrade Strategy

Upgrade facets without contract redeployment:

```solidity
pragma solidity ^0.8.0;

contract UpgradeFacet {
    event FacetUpgraded(address indexed facet, bytes4[] selectors);

    // Owner-only upgrade function
    function upgradeFacet(
        address newFacet,
        bytes4[] memory selectors
    ) external onlyOwner {
        // Remove old facet functions
        for (uint256 i = 0; i < selectors.length; i++) {
            bytes4 selector = selectors[i];
            address oldFacet = LibDiamond.diamondStorage().facets[selector];

            if (oldFacet != address(0)) {
                LibDiamond.removeSelector(selector);
            }
        }

        // Add new facet functions
        for (uint256 i = 0; i < selectors.length; i++) {
            LibDiamond.addSelector(selectors[i], newFacet);
        }

        emit FacetUpgraded(newFacet, selectors);
    }

    // Multi-facet upgrade
    function upgradeMultiple(
        address[] memory facets,
        bytes4[][] memory selectorArrays
    ) external onlyOwner {
        require(facets.length == selectorArrays.length, "Length mismatch");

        for (uint256 i = 0; i < facets.length; i++) {
            upgradeFacet(facets[i], selectorArrays[i]);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == LibAppStorage.diamondStorage().owner, "Not owner");
        _;
    }
}
```

**Upgrade patterns:**
- Single selector replacement
- Function version management
- Facet retirement (remove all selectors)
- Atomic multi-facet upgrades
- Version tracking via events

### Pattern 3: Facet Initialization

Initialize facet state on deployment:

```solidity
pragma solidity ^0.8.0;

interface IDiamondCut {
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;
}

struct FacetCut {
    address facetAddress;
    FacetCutAction action;
    bytes4[] functionSelectors;
}

enum FacetCutAction {Add, Replace, Remove}

contract DiamondInit {
    function init(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) external {
        AppStorage storage s = LibAppStorage.diamondStorage();

        s.name = _name;
        s.symbol = _symbol;
        s.decimals = _decimals;
        s.totalSupply = _initialSupply * 10 ** uint256(_decimals);
        s.balances[msg.sender] = s.totalSupply;
        s.owner = msg.sender;
    }
}

// Usage during deployment
function deployDiamond() external {
    Diamond diamond = new Diamond();

    FacetCut[] memory cuts = new FacetCut[](3);

    // Transfer facet
    cuts[0].facetAddress = address(new TransferFacet());
    cuts[0].action = FacetCutAction.Add;
    cuts[0].functionSelectors = new bytes4[](2);
    cuts[0].functionSelectors[0] = TransferFacet.transfer.selector;
    cuts[0].functionSelectors[1] = TransferFacet.transferFrom.selector;

    // Approve facet
    cuts[1].facetAddress = address(new ApproveFacet());
    cuts[1].action = FacetCutAction.Add;
    cuts[1].functionSelectors = new bytes4[](2);
    cuts[1].functionSelectors[0] = ApproveFacet.approve.selector;
    cuts[1].functionSelectors[1] = ApproveFacet.allowance.selector;

    // Info facet
    cuts[2].facetAddress = address(new InfoFacet());
    cuts[2].action = FacetCutAction.Add;
    cuts[2].functionSelectors = new bytes4[](4);
    cuts[2].functionSelectors[0] = InfoFacet.name.selector;
    cuts[2].functionSelectors[1] = InfoFacet.symbol.selector;
    cuts[2].functionSelectors[2] = InfoFacet.balanceOf.selector;
    cuts[2].functionSelectors[3] = InfoFacet.totalSupply.selector;

    // Initialize
    DiamondInit init = new DiamondInit();
    bytes memory initData = abi.encodeWithSelector(
        DiamondInit.init.selector,
        "MyToken",
        "MTK",
        uint8(18),
        uint256(1000000)
    );

    IDiamondCut(address(diamond)).diamondCut(cuts, address(init), initData);
}
```

**Initialization patterns:**
- Init contract for setup
- Parameter passing via encoded data
- Atomic state initialization
- One-time execution during cut

## Advanced Techniques (Expand: +1300 tokens)

### Technique 1: Selective Function Routing

Route based on function signature patterns:

```solidity
pragma solidity ^0.8.0;

contract SmartRouter {
    // Route based on function parameter types
    function smartRoute(bytes calldata data) external {
        bytes4 selector = bytes4(data[:4]);

        if (isReadOnly(selector)) {
            // Route to view facet
        } else if (isMutating(selector)) {
            // Route to mutating facet
        } else if (isPrivileged(selector)) {
            // Route to admin facet
        }
    }

    function isReadOnly(bytes4 selector) internal pure returns (bool) {
        // Check against known read-only selectors
        return selector == bytes4(keccak256("balanceOf(address)")) ||
               selector == bytes4(keccak256("totalSupply()"));
    }

    function isMutating(bytes4 selector) internal pure returns (bool) {
        return selector == bytes4(keccak256("transfer(address,uint256)"));
    }

    function isPrivileged(bytes4 selector) internal pure returns (bool) {
        return selector == bytes4(keccak256("diamondCut(...)"));
    }
}
```

### Technique 2: Storage Versioning Within Diamond

Handle schema migrations:

```solidity
pragma solidity ^0.8.0;

bytes32 constant APP_STORAGE_POSITION_V1 = keccak256("app.storage.v1");
bytes32 constant APP_STORAGE_POSITION_V2 = keccak256("app.storage.v2");

struct AppStorageV1 {
    mapping(address => uint256) balances;
    uint256 totalSupply;
}

struct AppStorageV2 {
    mapping(address => uint256) balances;
    uint256 totalSupply;
    mapping(address => bool) blacklist;  // New field
}

library LibAppStorage {
    function getV1() internal pure returns (AppStorageV1 storage) {
        bytes32 position = APP_STORAGE_POSITION_V1;
        assembly {
            ds.slot := position
        }
    }

    function getV2() internal pure returns (AppStorageV2 storage) {
        bytes32 position = APP_STORAGE_POSITION_V2;
        assembly {
            ds.slot := position
        }
    }
}

contract MigrationFacet {
    function migrateToV2() external {
        AppStorageV1 storage v1 = LibAppStorage.getV1();
        AppStorageV2 storage v2 = LibAppStorage.getV2();

        // Copy existing data to new structure
        // Implementation details...
    }
}
```

### Technique 3: Facet Versioning and Backward Compatibility

Support multiple versions of same functionality:

```solidity
pragma solidity ^0.8.0;

contract TransferFacetV1 {
    function transfer(address to, uint256 amount) external {
        // Original implementation
    }
}

contract TransferFacetV2 {
    function transfer(address to, uint256 amount) external {
        // Enhanced with events
    }

    function transferWithData(address to, uint256 amount, bytes calldata data) external {
        // New feature: additional data parameter
    }
}

contract FacetRegistry {
    mapping(string => mapping(uint256 => address)) public facetVersions;
    mapping(string => uint256) public currentVersions;

    function registerFacet(string memory name, uint256 version, address facet) external {
        facetVersions[name][version] = facet;
        if (version > currentVersions[name]) {
            currentVersions[name] = version;
        }
    }

    function getFacetVersion(string memory name, uint256 version)
        external
        view
        returns (address)
    {
        return facetVersions[name][version];
    }

    function getCurrentFacet(string memory name) external view returns (address) {
        uint256 current = currentVersions[name];
        return facetVersions[name][current];
    }
}
```

### Technique 4: Facet Dependency Management

Handle inter-facet dependencies:

```solidity
pragma solidity ^0.8.0;

contract DependencyManager {
    mapping(address => address[]) public facetDependencies;
    mapping(address => bool) public facetActive;

    function addFacet(address facet, address[] memory dependencies) external {
        require(!facetActive[facet], "Facet already active");

        // Verify dependencies are active
        for (uint256 i = 0; i < dependencies.length; i++) {
            require(facetActive[dependencies[i]], "Dependency not active");
        }

        facetDependencies[facet] = dependencies;
        facetActive[facet] = true;
    }

    function removeFacet(address facet) external {
        require(facetActive[facet], "Facet not active");

        // Prevent removal if other facets depend on it
        // Check all facets' dependencies...

        facetActive[facet] = false;
        delete facetDependencies[facet];
    }

    function canRemove(address facet) external view returns (bool) {
        // Implement dependency graph traversal
        // Check if any active facet depends on this one
        return true;
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Complete Diamond DEX Protocol

Full-featured DEX with multiple facets:

```solidity
pragma solidity ^0.8.0;

bytes32 constant APP_STORAGE_POSITION = keccak256("dex.storage");

struct AppStorage {
    mapping(bytes32 => Pool) pools;
    mapping(address => uint256) balances;
    address owner;
    address feeTo;
    uint256 globalFee;
}

struct Pool {
    address token0;
    address token1;
    uint256 reserve0;
    uint256 reserve1;
    uint256 liquidity;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        bytes32 position = APP_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}

contract PoolFacet {
    event PoolCreated(address indexed token0, address indexed token1, bytes32 poolId);
    event LiquidityAdded(bytes32 indexed poolId, uint256 amount0, uint256 amount1);

    function createPool(address token0, address token1) external returns (bytes32) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(token0 != token1, "Same token");
        require(token0 < token1, "Order tokens");

        bytes32 poolId = keccak256(abi.encode(token0, token1));
        require(s.pools[poolId].token0 == address(0), "Pool exists");

        s.pools[poolId] = Pool({
            token0: token0,
            token1: token1,
            reserve0: 0,
            reserve1: 0,
            liquidity: 0
        });

        emit PoolCreated(token0, token1, poolId);
        return poolId;
    }

    function addLiquidity(
        bytes32 poolId,
        uint256 amount0,
        uint256 amount1
    ) external {
        AppStorage storage s = LibAppStorage.diamondStorage();
        Pool storage pool = s.pools[poolId];

        require(pool.token0 != address(0), "Pool not found");

        // Transfer tokens (implementation)
        // Update reserves
        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.liquidity += amount0 + amount1;  // Simplified

        emit LiquidityAdded(poolId, amount0, amount1);
    }
}

contract SwapFacet {
    event Swapped(bytes32 indexed poolId, address indexed user, uint256 amountIn, uint256 amountOut);

    function swap(
        bytes32 poolId,
        address tokenIn,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        Pool storage pool = s.pools[poolId];

        require(pool.token0 != address(0), "Pool not found");
        require(tokenIn == pool.token0 || tokenIn == pool.token1, "Invalid token");

        // Calculate output using AMM formula
        amountOut = _getAmountOut(amountIn, pool, tokenIn);
        require(amountOut > 0, "Insufficient output");

        // Execute swap
        if (tokenIn == pool.token0) {
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
        } else {
            pool.reserve1 += amountIn;
            pool.reserve0 -= amountOut;
        }

        emit Swapped(poolId, msg.sender, amountIn, amountOut);
        return amountOut;
    }

    function _getAmountOut(
        uint256 amountIn,
        Pool memory pool,
        address tokenIn
    ) internal view returns (uint256) {
        uint256 reserve0 = pool.reserve0;
        uint256 reserve1 = pool.reserve1;

        if (tokenIn == pool.token0) {
            return (amountIn * reserve1) / (reserve0 + amountIn);
        } else {
            return (amountIn * reserve0) / (reserve1 + amountIn);
        }
    }
}

contract InfoFacet {
    function getPool(bytes32 poolId) external view returns (
        address token0,
        address token1,
        uint256 reserve0,
        uint256 reserve1,
        uint256 liquidity
    ) {
        AppStorage storage s = LibAppStorage.diamondStorage();
        Pool storage pool = s.pools[poolId];

        return (pool.token0, pool.token1, pool.reserve0, pool.reserve1, pool.liquidity);
    }

    function getPoolId(address token0, address token1) external pure returns (bytes32) {
        require(token0 < token1, "Order tokens");
        return keccak256(abi.encode(token0, token1));
    }
}

contract AdminFacet {
    event FeeUpdated(uint256 newFee);

    function setGlobalFee(uint256 newFee) external onlyOwner {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(newFee <= 10000, "Fee too high"); // Max 100%
        s.globalFee = newFee;
        emit FeeUpdated(newFee);
    }

    modifier onlyOwner() {
        require(msg.sender == LibAppStorage.diamondStorage().owner, "Not owner");
        _;
    }
}
```

### Example 2: Upgradeable Governance Diamond

Multi-faceted governance system:

```solidity
pragma solidity ^0.8.0;

bytes32 constant GOVERNANCE_STORAGE_POSITION = keccak256("governance.storage");

struct Proposal {
    uint256 id;
    address proposer;
    string description;
    uint256 forVotes;
    uint256 againstVotes;
    uint256 deadline;
    bool executed;
}

struct GovernanceStorage {
    mapping(uint256 => Proposal) proposals;
    mapping(uint256 => mapping(address => bool)) hasVoted;
    uint256 proposalCount;
    uint256 votingPeriod;
    uint256 proposalThreshold;
}

library LibGovernanceStorage {
    function diamondStorage() internal pure returns (GovernanceStorage storage gs) {
        bytes32 position = GOVERNANCE_STORAGE_POSITION;
        assembly {
            gs.slot := position
        }
    }
}

contract ProposalFacet {
    event ProposalCreated(uint256 indexed id, address indexed proposer);

    function propose(string memory description) external returns (uint256) {
        GovernanceStorage storage gs = LibGovernanceStorage.diamondStorage();
        uint256 proposalId = gs.proposalCount++;

        gs.proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            deadline: block.timestamp + gs.votingPeriod,
            executed: false
        });

        emit ProposalCreated(proposalId, msg.sender);
        return proposalId;
    }
}

contract VotingFacet {
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    function vote(uint256 proposalId, bool support, uint256 weight) external {
        GovernanceStorage storage gs = LibGovernanceStorage.diamondStorage();

        Proposal storage proposal = gs.proposals[proposalId];
        require(block.timestamp <= proposal.deadline, "Voting closed");
        require(!gs.hasVoted[proposalId][msg.sender], "Already voted");

        gs.hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }
}

contract ExecutionFacet {
    event ProposalExecuted(uint256 indexed proposalId);

    function execute(uint256 proposalId) external {
        GovernanceStorage storage gs = LibGovernanceStorage.diamondStorage();
        Proposal storage proposal = gs.proposals[proposalId];

        require(block.timestamp > proposal.deadline, "Voting ongoing");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
}
```

## Best Practices

**Facet Design**
- Separate by functional domain
- Keep facets independent
- Use shared AppStorage exclusively
- One storage struct per diamond
- Document storage layout

**Selector Management**
- Use function selector constants
- Version function signatures
- Test selector registration
- Maintain selector registry
- Plan for selector conflicts

**Upgrade Safety**
- Verify all facet upgrades
- Test new facet thoroughly
- Use upgrade tests with copies
- Maintain upgrade history
- Plan rollback strategy

**Storage Patterns**
- Never use local storage in facets
- Use deterministic storage positions
- Version AppStorage schema
- Validate storage migrations
- Document storage layout

## Common Pitfalls

**Issue 1: Storage Collision**
```solidity
// ❌ Wrong - multiple storage positions
bytes32 APP_STORAGE_V1 = keccak256("app.v1");
bytes32 APP_STORAGE_V2 = keccak256("app.v2");

// ✅ Correct - single storage position
bytes32 constant APP_STORAGE = keccak256("app.storage");

struct AppStorage {
    uint256 v1data;
    uint256 v2data;
}
```
**Solution:** Use single AppStorage struct that evolves.

**Issue 2: Selector Registration Errors**
```solidity
// ❌ Wrong - forget to register selector
contract NewFacet {
    function newFunction() external {}
}
// Forgot to call diamondCut with this function!

// ✅ Correct - register all selectors
FacetCut[] memory cuts = new FacetCut[](1);
cuts[0].facetAddress = newFacet;
cuts[0].action = FacetCutAction.Add;
cuts[0].functionSelectors = new bytes4[](1);
cuts[0].functionSelectors[0] = NewFacet.newFunction.selector;
```
**Solution:** Verify all selectors in diamondCut calls.

**Issue 3: Delegatecall Context Loss**
```solidity
// ❌ Wrong - msg.sender is diamond in facet
contract TransferFacet {
    function transfer(address to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");  // Always fails!
    }
}

// ✅ Correct - delegatecall preserves msg.sender
contract TransferFacet {
    function transfer(address to, uint256 amount) external {
        AppStorage storage s = LibAppStorage.diamondStorage();
        require(msg.sender == s.owner, "Not owner");  // Works correctly
    }
}
```
**Solution:** Remember delegatecall context is preserved.

**Issue 4: Missing Loupe Implementation**
```solidity
// ❌ Wrong - no facet introspection
contract Diamond {
    // No way to query facet structure
}

// ✅ Correct - include loupe facet
contract LoupeFacet is IDiamondLoupe {
    function facets() external view returns (Facet[] memory) { ... }
    function facetAddress(bytes4 selector) external view returns (address) { ... }
}
```
**Solution:** Implement IDiamondLoupe for contract introspection.

## Resources

**Official Standards**
- [EIP-2535 Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535) - Full specification
- [Diamond Standard Contracts](https://github.com/ethereum/EIPs/issues/2535) - Reference implementation

**Reference Implementations**
- [Nick Mudge Diamond](https://github.com/mudgen/diamond-1-hardhat) - Official implementation
- [Hardhat Diamond Template](https://github.com/mudgen/hardhat-diamond-abi) - Template project

**Tools & Libraries**
- [Diamond ABI Generator](https://github.com/mudgen/diamond-abi) - Generate combined ABI
- [Diamond Deployments](https://github.com/mudgen/diamond-starter) - Deployment utilities

**Related Skills**
- `contract-upgrades` - Upgrade patterns and strategies
- `eip712-typed-signatures` - Signature-based authority in diamonds
- `access-control-patterns` - Role-based facet permissions
