# Chainlink Automation & Keepers

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 42 tokens, expands to 5800 tokens

## Quick Reference (Load: 42 tokens)

Chainlink Automation enables decentralized execution of smart contracts at predetermined conditions without manual intervention.

**Core patterns:**
- `checkUpkeep()` - Determine if upkeep is needed
- `performUpkeep()` - Execute contract logic when triggered
- Log triggers - Emit events to trigger automation
- Time-based scheduling - Execute on fixed intervals
- Custom logic - Complex conditions evaluated off-chain

**Quick start:**
```solidity
contract MyAutomation is AutomationCompatible {
    function checkUpkeep(bytes calldata) external view returns (bool, bytes memory) {
        return (condition_met, abi.encode(data));
    }

    function performUpkeep(bytes calldata performData) external {
        // Execute automation logic
    }
}
```

## Core Concepts (Expand: +600 tokens)

### Automation Types

Chainlink Automation supports multiple trigger mechanisms:

1. **Time-based** - Execute at fixed intervals (blocks or timestamps)
2. **Custom logic** - Check conditions off-chain, execute on-chain
3. **Log triggers** - React to emitted events
4. **Conditional** - Complex state-dependent logic

### The CheckUpkeep Pattern

`checkUpkeep()` is called off-chain to determine if `performUpkeep()` should execute:

```solidity
function checkUpkeep(bytes calldata checkData)
    external
    view
    returns (bool upkeepNeeded, bytes memory performData)
{
    // Evaluate conditions
    bool needsUpkeep = condition_check();

    // Encode data for performUpkeep
    bytes memory encoded = abi.encode(param1, param2);

    return (needsUpkeep, encoded);
}
```

**Key points:**
- Called off-chain (no gas cost)
- Must be view function
- Returns boolean and encoded data
- Data passed to performUpkeep

### The PerformUpkeep Pattern

`performUpkeep()` executes when automation conditions are met:

```solidity
function performUpkeep(bytes calldata performData) external override {
    // Decode parameters
    (uint256 param1, address param2) = abi.decode(performData, (uint256, address));

    // Execute logic
    // Update state
    // Interact with other contracts
}
```

**Execution context:**
- Executed on-chain by Keepers
- Costs gas (covered by user)
- Must be non-view function
- Should maintain idempotence

### Gas Optimization Strategy

Keepers have gas limits per automation. Key optimizations:

1. **Efficient checkUpkeep** - Minimize off-chain computation
2. **Batch operations** - Process multiple items per call
3. **Storage layout** - Optimize state reads
4. **Calldata encoding** - Minimal data passing

### Event-Based Log Triggers

Log triggers react to contract events:

```solidity
event OrderCreated(uint256 indexed orderId, address indexed user);

function performUpkeep(bytes calldata performData) external override {
    // React to OrderCreated event
    (uint256 orderId,) = abi.decode(performData, (uint256, address));
    processOrder(orderId);
}
```

## Common Patterns (Expand: +1000 tokens)

### Pattern 1: Simple Time-Based Upkeep

Execute function at fixed intervals:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract SimpleTimerUpkeep is AutomationCompatible {
    uint256 public counter;
    uint256 public lastExecutedAt;
    uint256 public executionInterval = 1 days;

    event UpkeepPerformed(uint256 indexed blockNumber);

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        upkeepNeeded = (block.timestamp - lastExecutedAt) > executionInterval;
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata) external override {
        require(
            (block.timestamp - lastExecutedAt) > executionInterval,
            "Time not elapsed"
        );

        counter++;
        lastExecutedAt = block.timestamp;

        emit UpkeepPerformed(block.number);
    }

    function updateInterval(uint256 newInterval) external {
        executionInterval = newInterval;
    }
}
```

**Key aspects:**
- Timestamp-based checking
- Idempotent execution
- Event emission for tracking
- Interval configuration

### Pattern 2: Conditional Logic with State Checks

Execute when specific conditions are met:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract ConditionalUpkeep is AutomationCompatible {
    struct Account {
        uint256 balance;
        uint256 lastInterest;
        bool active;
    }

    mapping(address => Account) public accounts;
    address[] public activeAccounts;
    uint256 public interestRate = 5; // 5% per period

    event InterestApplied(address indexed account, uint256 amount);

    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        address[] memory accountsToProcess = new address[](activeAccounts.length);
        uint256 count = 0;

        for (uint256 i = 0; i < activeAccounts.length; i++) {
            address account = activeAccounts[i];
            Account storage acc = accounts[account];

            // Check if 30 days elapsed since last interest
            if (
                acc.active &&
                block.timestamp - acc.lastInterest > 30 days &&
                acc.balance > 0
            ) {
                accountsToProcess[count] = account;
                count++;
            }
        }

        // Trim array to actual count
        assembly {
            mstore(accountsToProcess, count)
        }

        upkeepNeeded = count > 0;
        performData = abi.encode(accountsToProcess);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        address[] memory accountsToProcess = abi.decode(performData, (address[]));

        for (uint256 i = 0; i < accountsToProcess.length; i++) {
            address account = accountsToProcess[i];
            Account storage acc = accounts[account];

            if (
                acc.active &&
                block.timestamp - acc.lastInterest > 30 days &&
                acc.balance > 0
            ) {
                uint256 interest = (acc.balance * interestRate) / 100;
                acc.balance += interest;
                acc.lastInterest = block.timestamp;

                emit InterestApplied(account, interest);
            }
        }
    }

    function addAccount(address account) external {
        accounts[account].active = true;
        accounts[account].lastInterest = block.timestamp;
        activeAccounts.push(account);
    }

    function deposit(uint256 amount) external {
        accounts[msg.sender].balance += amount;
    }
}
```

**Pattern benefits:**
- State-driven execution
- Off-chain condition checking
- Batch processing efficiency
- Protection against re-execution

### Pattern 3: Event Log Trigger Pattern

React to emitted events:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract OrderAutomation is AutomationCompatible {
    struct Order {
        uint256 id;
        address buyer;
        uint256 amount;
        uint256 createdAt;
        bool fulfilled;
    }

    uint256 nextOrderId = 1;
    mapping(uint256 => Order) public orders;
    uint256 public orderFulfillmentDelay = 24 hours;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 amount
    );
    event OrderFulfilled(uint256 indexed orderId);

    function createOrder(uint256 amount) external {
        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            buyer: msg.sender,
            amount: amount,
            createdAt: block.timestamp,
            fulfilled: false
        });

        // Log trigger will detect this event
        emit OrderCreated(orderId, msg.sender, amount);
    }

    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Automation reads the log from event
        (uint256 orderId) = abi.decode(checkData, (uint256));
        Order storage order = orders[orderId];

        // Check if delay has passed
        bool readyToFulfill =
            !order.fulfilled &&
            block.timestamp >= order.createdAt + orderFulfillmentDelay;

        return (readyToFulfill, checkData);
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256 orderId) = abi.decode(performData, (uint256));
        Order storage order = orders[orderId];

        require(!order.fulfilled, "Order already fulfilled");
        require(
            block.timestamp >= order.createdAt + orderFulfillmentDelay,
            "Not ready for fulfillment"
        );

        order.fulfilled = true;

        // Execute fulfillment logic
        // Transfer tokens, update state, etc.

        emit OrderFulfilled(orderId);
    }
}
```

**Log trigger features:**
- Triggered by event emission
- Data extracted from event logs
- Automatic by Chainlink nodes
- No manual registration needed for event

### Pattern 4: Gas-Optimized Batch Processing

Efficient processing of multiple items within gas limits:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract BatchUpkeep is AutomationCompatible {
    uint256 public constant BATCH_SIZE = 10;

    struct Reward {
        address recipient;
        uint256 amount;
        bool claimed;
    }

    Reward[] public rewards;
    uint256 public nextUnclaimedIndex = 0;

    event BatchRewardsClaimed(uint256 startIdx, uint256 endIdx);

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Check if there are unclaimed rewards
        upkeepNeeded = nextUnclaimedIndex < rewards.length;

        if (upkeepNeeded) {
            uint256 startIdx = nextUnclaimedIndex;
            uint256 endIdx = startIdx + BATCH_SIZE > rewards.length
                ? rewards.length
                : startIdx + BATCH_SIZE;

            performData = abi.encode(startIdx, endIdx);
        }

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256 startIdx, uint256 endIdx) = abi.decode(performData, (uint256, uint256));

        require(startIdx == nextUnclaimedIndex, "Invalid start index");
        require(endIdx <= rewards.length, "Invalid end index");
        require(endIdx - startIdx <= BATCH_SIZE, "Batch too large");

        for (uint256 i = startIdx; i < endIdx; i++) {
            Reward storage reward = rewards[i];
            if (!reward.claimed) {
                reward.claimed = true;
                // Process reward (transfer, etc)
                _processReward(reward.recipient, reward.amount);
            }
        }

        nextUnclaimedIndex = endIdx;
        emit BatchRewardsClaimed(startIdx, endIdx);
    }

    function addReward(address recipient, uint256 amount) external {
        rewards.push(Reward({
            recipient: recipient,
            amount: amount,
            claimed: false
        }));
    }

    function _processReward(address recipient, uint256 amount) internal {
        // Implementation: transfer tokens, mint NFT, etc.
        (bool success,) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

**Optimization techniques:**
- Fixed batch size for predictable gas
- Offset tracking for resumable processing
- Idempotent operations
- Data encoding minimization

## Advanced Techniques (Expand: +1500 tokens)

### Technique 1: Custom Condition Evaluation

Complex off-chain logic with on-chain verification:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract AdvancedConditionUpkeep is AutomationCompatible {
    uint256 public priceThreshold = 100 * 10**18; // $100
    uint256 public lastPrice;
    uint256 public lastUpdate;

    event ThresholdBreached(uint256 newPrice);
    event ExecutionTriggered(uint256 indexed timestamp);

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Complex condition: price moved significantly since last update
        // and 1 hour has elapsed
        bool significant_move = lastPrice > 0 &&
            (lastPrice > priceThreshold || lastPrice < priceThreshold / 2);
        bool time_elapsed = block.timestamp - lastUpdate > 1 hours;

        upkeepNeeded = significant_move && time_elapsed;
        performData = abi.encode(lastPrice);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 triggerPrice = abi.decode(performData, (uint256));

        // Secondary validation
        require(triggerPrice > 0, "Invalid price");
        require(
            block.timestamp - lastUpdate > 1 hours,
            "Too soon"
        );

        // Execute complex logic
        _triggerRiskManagement(triggerPrice);

        lastUpdate = block.timestamp;
        emit ExecutionTriggered(block.timestamp);
    }

    function _triggerRiskManagement(uint256 currentPrice) internal {
        if (currentPrice > priceThreshold) {
            // De-risk: sell positions, reduce leverage
            _executeSellStrategy(currentPrice);
        } else {
            // Accumulate: buy, increase leverage
            _executeBuyStrategy(currentPrice);
        }
    }

    function _executeSellStrategy(uint256 price) internal {
        // Liquidation logic
        emit ThresholdBreached(price);
    }

    function _executeBuyStrategy(uint256 price) internal {
        // Accumulation logic
        emit ThresholdBreached(price);
    }

    function updatePrice(uint256 newPrice) external {
        lastPrice = newPrice;
    }
}
```

### Technique 2: State Machine Automation

Drive contract state transitions via automation:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract StateMachineUpkeep is AutomationCompatible {
    enum AuctionState {
        PENDING,
        LIVE,
        ENDED,
        FINALIZED
    }

    struct Auction {
        uint256 id;
        address seller;
        AuctionState state;
        uint256 startTime;
        uint256 duration;
        uint256 highestBid;
        address highestBidder;
        bool finalized;
    }

    mapping(uint256 => Auction) public auctions;
    uint256 nextAuctionId = 1;

    event AuctionStarted(uint256 indexed auctionId);
    event AuctionEnded(uint256 indexed auctionId);
    event AuctionFinalized(uint256 indexed auctionId, address winner);

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Find auction needing state transition
        for (uint256 i = 1; i < nextAuctionId; i++) {
            Auction storage auction = auctions[i];

            if (auction.state == AuctionState.PENDING &&
                block.timestamp >= auction.startTime) {
                return (true, abi.encode(i, AuctionState.LIVE));
            }

            if (auction.state == AuctionState.LIVE &&
                block.timestamp >= auction.startTime + auction.duration) {
                return (true, abi.encode(i, AuctionState.ENDED));
            }

            if (auction.state == AuctionState.ENDED && !auction.finalized) {
                return (true, abi.encode(i, AuctionState.FINALIZED));
            }
        }

        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256 auctionId, AuctionState newState) = abi.decode(
            performData,
            (uint256, AuctionState)
        );

        Auction storage auction = auctions[auctionId];

        // Validate state transition
        if (newState == AuctionState.LIVE) {
            require(auction.state == AuctionState.PENDING, "Invalid state");
            require(block.timestamp >= auction.startTime, "Not started");
            auction.state = AuctionState.LIVE;
            emit AuctionStarted(auctionId);
        }

        if (newState == AuctionState.ENDED) {
            require(auction.state == AuctionState.LIVE, "Not live");
            require(
                block.timestamp >= auction.startTime + auction.duration,
                "Still live"
            );
            auction.state = AuctionState.ENDED;
            emit AuctionEnded(auctionId);
        }

        if (newState == AuctionState.FINALIZED) {
            require(auction.state == AuctionState.ENDED, "Not ended");
            require(!auction.finalized, "Already finalized");
            auction.finalized = true;

            // Transfer to winner or back to seller
            if (auction.highestBidder != address(0)) {
                // Execute settlement
                _finalizeAuction(auctionId);
            }

            emit AuctionFinalized(auctionId, auction.highestBidder);
        }
    }

    function createAuction(
        uint256 startTime,
        uint256 duration
    ) external {
        uint256 auctionId = nextAuctionId++;
        auctions[auctionId] = Auction({
            id: auctionId,
            seller: msg.sender,
            state: AuctionState.PENDING,
            startTime: startTime,
            duration: duration,
            highestBid: 0,
            highestBidder: address(0),
            finalized: false
        });
    }

    function _finalizeAuction(uint256 auctionId) internal {
        // Settlement logic
    }
}
```

### Technique 3: Dynamic Gas Limit Management

Adapt to changing gas conditions:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract DynamicGasUpkeep is AutomationCompatible {
    uint256 public baseGasLimit = 150000;
    uint256 public maxGasLimit = 500000;
    uint256 public gasLimitPerItem = 30000;

    uint256[] public pendingTransactions;
    mapping(uint256 => bool) public processed;

    event TransactionProcessed(uint256 indexed txId);
    event GasLimitAdjusted(uint256 newLimit);

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (pendingTransactions.length == 0) {
            return (false, "");
        }

        // Calculate optimal batch size based on gas price trends
        uint256 batchSize = _calculateOptimalBatchSize();

        uint256[] memory batch = new uint256[](batchSize);
        uint256 count = 0;

        for (
            uint256 i = 0;
            i < pendingTransactions.length && count < batchSize;
            i++
        ) {
            uint256 txId = pendingTransactions[i];
            if (!processed[txId]) {
                batch[count] = txId;
                count++;
            }
        }

        assembly {
            mstore(batch, count)
        }

        upkeepNeeded = count > 0;
        performData = abi.encode(batch);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory batch = abi.decode(performData, (uint256[]));

        for (uint256 i = 0; i < batch.length; i++) {
            uint256 txId = batch[i];
            if (!processed[txId]) {
                _executeTransaction(txId);
                processed[txId] = true;
                emit TransactionProcessed(txId);
            }
        }
    }

    function _calculateOptimalBatchSize() internal view returns (uint256) {
        // Simple strategy: more items in low gas price environments
        uint256 currentGasPrice = tx.gasprice;

        if (currentGasPrice < 20 gwei) {
            return 15; // Process more items
        } else if (currentGasPrice < 50 gwei) {
            return 8;
        } else {
            return 3; // Conservative in high gas environments
        }
    }

    function updateGasLimits(uint256 newBase, uint256 newMax)
        external
    {
        baseGasLimit = newBase;
        maxGasLimit = newMax;
        emit GasLimitAdjusted(newBase);
    }

    function _executeTransaction(uint256 txId) internal {
        // Transaction execution logic
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Liquidation Automation

Automated liquidation of underwater positions:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract LiquidationAutomation is AutomationCompatible {
    struct Position {
        address owner;
        uint256 collateral;
        uint256 debt;
        uint256 lastUpdate;
        bool active;
    }

    uint256 public collateralRatio = 150; // 150%
    mapping(address => Position) public positions;
    address[] public activePositions;

    event PositionLiquidated(
        address indexed user,
        uint256 collateralSeized,
        uint256 debtRepaid
    );

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        address[] memory atRisk = new address[](activePositions.length);
        uint256 count = 0;

        for (uint256 i = 0; i < activePositions.length; i++) {
            address account = activePositions[i];
            Position storage pos = positions[account];

            if (pos.active && _isUndercollateralized(pos)) {
                atRisk[count] = account;
                count++;
            }
        }

        assembly {
            mstore(atRisk, count)
        }

        upkeepNeeded = count > 0;
        performData = abi.encode(atRisk);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        address[] memory positions_list = abi.decode(performData, (address[]));

        for (uint256 i = 0; i < positions_list.length; i++) {
            address account = positions_list[i];
            Position storage pos = positions[account];

            if (pos.active && _isUndercollateralized(pos)) {
                uint256 debtRepaid = pos.debt;
                uint256 collateralSeized = pos.collateral;

                pos.active = false;
                pos.debt = 0;
                pos.collateral = 0;

                // Distribute seized collateral
                _distributeLiquidation(account, collateralSeized, debtRepaid);

                emit PositionLiquidated(account, collateralSeized, debtRepaid);
            }
        }
    }

    function _isUndercollateralized(Position storage pos)
        internal
        view
        returns (bool)
    {
        if (pos.debt == 0) return false;
        uint256 currentRatio = (pos.collateral * 100) / pos.debt;
        return currentRatio < collateralRatio;
    }

    function _distributeLiquidation(
        address user,
        uint256 collateral,
        uint256 debt
    ) internal {
        // Send collateral to liquidators or treasury
    }
}
```

### Example 2: Reward Distribution

Automated distribution of staking rewards:

```solidity
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract RewardDistribution is AutomationCompatible {
    struct Staker {
        uint256 amount;
        uint256 lastReward;
        bool active;
    }

    address[] public stakers;
    mapping(address => Staker) public stakerInfo;

    uint256 public rewardPerSecond = 1000;
    uint256 public rewardPool;
    uint256 public distributeInterval = 1 days;

    event RewardsDistributed(address[] indexed recipients, uint256[] amounts);

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Find stakers due for rewards
        address[] memory dueFors = new address[](stakers.length);
        uint256 count = 0;

        for (uint256 i = 0; i < stakers.length; i++) {
            Staker storage staker = stakerInfo[stakers[i]];

            if (
                staker.active &&
                block.timestamp - staker.lastReward >= distributeInterval
            ) {
                dueFors[count] = stakers[i];
                count++;
            }
        }

        assembly {
            mstore(dueFors, count)
        }

        upkeepNeeded = count > 0;
        performData = abi.encode(dueFors);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        address[] memory recipients = abi.decode(performData, (address[]));
        uint256[] memory amounts = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            Staker storage staker = stakerInfo[recipients[i]];

            if (
                staker.active &&
                block.timestamp - staker.lastReward >= distributeInterval
            ) {
                uint256 timePassed = block.timestamp - staker.lastReward;
                uint256 reward = (timePassed * rewardPerSecond * staker.amount) /
                    1e18;

                amounts[i] = reward;
                staker.lastReward = block.timestamp;

                // Mint or transfer reward tokens
                _sendReward(recipients[i], reward);
            }
        }

        emit RewardsDistributed(recipients, amounts);
    }

    function _sendReward(address recipient, uint256 amount) internal {
        // Implementation: transfer reward tokens
    }
}
```

## Best Practices

**Upkeep Design**
- Keep checkUpkeep computationally light
- Validate all assumptions in performUpkeep
- Use fixed batch sizes for predictability
- Implement circuit breakers for emergency stops

**Gas Management**
- Estimate gas conservatively
- Profile gas usage on testnet
- Account for network congestion
- Use lower batch sizes in high gas environments

**Reliability**
- Implement idempotent operations
- Validate state hasn't changed mid-execution
- Use re-entrancy guards if calling external contracts
- Monitor execution through events

**Cost Optimization**
- Minimize storage operations in performUpkeep
- Batch related operations together
- Remove processed items from arrays efficiently
- Use indexed events for easy tracking

## Common Pitfalls

**Issue 1: Non-Idempotent Operations**
```solidity
// ❌ Wrong - fails if called twice
function performUpkeep(bytes calldata performData) external override {
    orders[orderId].status = "COMPLETED";
}

// ✅ Correct - safe to call multiple times
function performUpkeep(bytes calldata performData) external override {
    if (orders[orderId].status != "COMPLETED") {
        orders[orderId].status = "COMPLETED";
    }
}
```
**Solution:** Always check current state before modifying.

**Issue 2: Expensive CheckUpkeep**
```solidity
// ❌ Wrong - loops through all items every call
function checkUpkeep(bytes calldata)
    external
    view
    returns (bool, bytes memory)
{
    for (uint256 i = 0; i < 10000; i++) {
        // Process each item
    }
}

// ✅ Correct - track index for pagination
function checkUpkeep(bytes calldata)
    external
    view
    returns (bool, bytes memory)
{
    uint256 endIdx = nextCheckIdx + 100;
    if (endIdx > items.length) endIdx = items.length;

    // Check only next 100 items
}
```
**Solution:** Paginate checks to stay within gas limits.

**Issue 3: Unbounded Arrays**
```solidity
// ❌ Wrong - array can grow unbounded
address[] public allAccounts;

// ✅ Correct - use index tracking for pagination
uint256 public nextProcessIndex;
```
**Solution:** Use offset-based processing rather than fixed arrays.

**Issue 4: Race Conditions**
```solidity
// ❌ Wrong - state can change between check and perform
if (block.timestamp > deadline) {
    // ... time passes ...
    process(); // May be past new deadline
}

// ✅ Correct - re-validate in performUpkeep
require(block.timestamp > deadline, "Not ready");
```
**Solution:** Always re-validate conditions in performUpkeep.

## Resources

**Official Documentation**
- [Chainlink Automation Docs](https://docs.chain.link/chainlink-automation/) - Complete guide
- [Automation Network Contracts](https://github.com/smartcontractkit/chainlink) - Source code
- [Best Practices Guide](https://docs.chain.link/chainlink-automation/automation-introduction/best-practices) - Guidelines

**Related Skills**
- `solidity-gas-optimization` - Advanced gas techniques
- `smart-contract-security` - Security patterns
- `erc4626-vault-implementation` - Vault automation use cases
- `safe-transaction-batching` - Multi-step execution

**External Resources**
- [Automation Examples](https://github.com/smartcontractkit/chainlink-automation-templates) - Official examples
- [Gas Optimization Guide](https://blog.openzeppelin.com/gas-optimization-techniques-in-solidity) - Optimization patterns
- [Keeper Network](https://keepers.chain.link/) - Upkeep registry and monitoring
