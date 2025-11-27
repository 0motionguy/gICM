# Multicall Aggregation Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 40 tokens, expands to 5400 tokens

## Quick Reference (Load: 40 tokens)

Multicall3 aggregates multiple contract calls into single transaction with error handling and block number tracking.

**Core concepts:**
- `aggregate3()` - Execute calls with error tolerance
- `aggregate3Value()` - Include ETH payments
- Batch execution - Atomic all-or-nothing
- Error handling - Continue on failure
- Block context - Retrieve historical state

**Quick start:**
```solidity
IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](2);
calls[0] = IMulticall3.Call3({
    target: token,
    allowFailure: false,
    callData: abi.encodeWithSignature("balanceOf(address)", user)
});
calls[1] = IMulticall3.Call3({
    target: token,
    allowFailure: true,
    callData: abi.encodeWithSignature("transfer(address,uint256)", to, amount)
});
IMulticall3(multicall).aggregate3(calls);
```

## Core Concepts (Expand: +700 tokens)

### Multicall3 Architecture

Multicall3 provides gas-efficient contract call aggregation:

```solidity
interface IMulticall3 {
    struct Call {
        address target;
        bytes callData;
    }

    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Call3Value {
        address target;
        bool allowFailure;
        uint256 value;
        bytes callData;
    }

    function aggregate(Call[] calldata calls) external payable returns (
        uint256 blockNumber,
        bytes[] memory returnData
    );

    function aggregate3(Call3[] calldata calls) external payable returns (
        Result[] memory returnData
    );

    function aggregate3Value(Call3Value[] calldata calls) external payable returns (
        Result[] memory returnData
    );
}

struct Result {
    bool success;
    bytes returnData;
}
```

**Three aggregation modes:**
1. `aggregate()` - Basic multi-call, all must succeed
2. `aggregate3()` - Per-call failure control
3. `aggregate3Value()` - Sends ETH with calls

### Error Handling Strategies

Control failure behavior per call:

```solidity
// Force all calls to succeed
IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](3);
calls[0] = IMulticall3.Call3({
    target: token,
    allowFailure: false,  // Fails entire batch if this fails
    callData: abi.encodeWithSignature("transfer(address,uint256)", to, amount)
});

// Allow specific calls to fail
calls[1] = IMulticall3.Call3({
    target: risky,
    allowFailure: true,  // Continue if this fails
    callData: abi.encodeWithSignature("risky()")
});

// Check results
IMulticall3.Result[] memory results = IMulticall3(multicall).aggregate3(calls);

if (results[0].success) {
    // Process token transfer
}

if (!results[1].success) {
    // Handle risky call failure
}
```

**Failure handling rules:**
- `allowFailure: false` - Reverts entire transaction
- `allowFailure: true` - Returns error in result
- Always check `success` flag before decoding
- Combine strict and lenient calls strategically

### Block Number Context

Retrieve state at specific block:

```solidity
function multiCallWithBlockNumber() external returns (uint256, bytes[] memory) {
    IMulticall3.Call[] memory calls = new IMulticall3.Call[](2);

    calls[0] = IMulticall3.Call({
        target: token1,
        callData: abi.encodeWithSignature("balanceOf(address)", user)
    });

    calls[1] = IMulticall3.Call({
        target: token2,
        callData: abi.encodeWithSignature("totalSupply()")
    });

    // Returns block number and all results
    (uint256 blockNumber, bytes[] memory results) =
        IMulticall3(MULTICALL3).aggregate(calls);

    // All results represent state at blockNumber
    return (blockNumber, results);
}
```

**Block context uses:**
- Read consistent state across contracts
- Validate block-specific conditions
- Historical data analysis
- State snapshot verification

### Value Transfers in Batch

Send ETH to multiple contracts atomically:

```solidity
IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](2);

calls[0] = IMulticall3.Call3Value({
    target: vault1,
    allowFailure: false,
    value: 0.5 ether,  // Send ETH
    callData: abi.encodeWithSignature("deposit()")
});

calls[1] = IMulticall3.Call3Value({
    target: vault2,
    allowFailure: true,
    value: 0.3 ether,
    callData: abi.encodeWithSignature("deposit()")
});

IMulticall3(MULTICALL3).aggregate3Value{value: 0.8 ether}(calls);
```

## Common Patterns (Expand: +1000 tokens)

### Pattern 1: Portfolio Balance Aggregator

Query multiple token balances in single call:

```solidity
pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);
}

contract PortfolioBalanceReader {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct TokenBalance {
        address token;
        uint256 balance;
        bool success;
    }

    function getBalances(address user, address[] calldata tokens)
        external
        returns (TokenBalance[] memory)
    {
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            calls[i] = IMulticall3.Call3({
                target: tokens[i],
                allowFailure: true,  // Continue if token call fails
                callData: abi.encodeWithSignature("balanceOf(address)", user)
            });
        }

        IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);

        TokenBalance[] memory balances = new TokenBalance[](tokens.length);

        for (uint256 i = 0; i < results.length; i++) {
            balances[i].token = tokens[i];
            balances[i].success = results[i].success;

            if (results[i].success) {
                balances[i].balance = abi.decode(results[i].returnData, (uint256));
            }
        }

        return balances;
    }

    function getTotalBalance(address user, address[] calldata tokens, uint8[] calldata weights)
        external
        returns (uint256 total)
    {
        require(tokens.length == weights.length, "Length mismatch");

        TokenBalance[] memory balances = getBalances(user, tokens);

        for (uint256 i = 0; i < balances.length; i++) {
            if (balances[i].success) {
                total += balances[i].balance * weights[i];
            }
        }

        return total / 100;  // Weighted average
    }
}
```

**Portfolio benefits:**
- Single RPC call for all balances
- Handles missing/reverted tokens gracefully
- Weighted balance calculation
- Gas-efficient state reading

### Pattern 2: Price Oracle Aggregator

Fetch prices from multiple DEXs simultaneously:

```solidity
pragma solidity ^0.8.0;

interface IUniswapV3Pool {
    function slot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    );
}

interface ICurvePool {
    function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256);
}

interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);
}

contract PriceAggregator {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct PriceSource {
        address pool;
        uint256 price;
        bool success;
        string source;
    }

    function aggregatePrices(address token0, address token1, address[] calldata pools)
        external
        returns (PriceSource[] memory)
    {
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            // Try to get price from each pool
            calls[i] = IMulticall3.Call3({
                target: pools[i],
                allowFailure: true,
                callData: abi.encodeWithSignature(
                    "get_dy(int128,int128,uint256)",
                    int128(0),
                    int128(1),
                    1e18
                )
            });
        }

        IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);

        PriceSource[] memory prices = new PriceSource[](pools.length);

        for (uint256 i = 0; i < results.length; i++) {
            prices[i].pool = pools[i];
            prices[i].success = results[i].success;

            if (results[i].success) {
                prices[i].price = abi.decode(results[i].returnData, (uint256));
                prices[i].source = "Curve";
            }
        }

        return prices;
    }

    function getMedianPrice(address token0, address token1, address[] calldata pools)
        external
        returns (uint256)
    {
        PriceSource[] memory prices = aggregatePrices(token0, token1, pools);

        uint256[] memory validPrices = new uint256[](pools.length);
        uint256 count = 0;

        for (uint256 i = 0; i < prices.length; i++) {
            if (prices[i].success) {
                validPrices[count++] = prices[i].price;
            }
        }

        require(count > 0, "No valid prices");

        // Calculate median
        _quickSort(validPrices, 0, int256(count - 1));

        if (count % 2 == 0) {
            return (validPrices[count / 2 - 1] + validPrices[count / 2]) / 2;
        } else {
            return validPrices[count / 2];
        }
    }

    function _quickSort(uint256[] memory arr, int256 left, int256 right) internal pure {
        int256 i = left;
        int256 j = right;
        if (i == j) return;
        uint256 pivot = arr[uint256(left + (right - left) / 2)];

        while (i <= j) {
            while (arr[uint256(i)] < pivot) i++;
            while (arr[uint256(j)] > pivot) j--;
            if (i <= j) {
                (arr[uint256(i)], arr[uint256(j)]) = (arr[uint256(j)], arr[uint256(i)]);
                i++;
                j--;
            }
        }
        if (left < j) _quickSort(arr, left, j);
        if (i < right) _quickSort(arr, i, right);
    }
}
```

**Oracle aggregation benefits:**
- Atomic price snapshot across pools
- Median price calculation for stability
- Graceful handling of unavailable pools
- Single transaction overhead

### Pattern 3: Complex State Validation

Verify protocol invariants in batch:

```solidity
pragma solidity ^0.8.0;

interface IPool {
    function reserve0() external view returns (uint256);
    function reserve1() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);
}

contract PoolValidator {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct PoolState {
        address pool;
        uint256 reserve0;
        uint256 reserve1;
        uint256 liquidity;
    }

    struct ValidationResult {
        bool isHealthy;
        string error;
        uint256 depthScore;
    }

    function validatePools(address[] calldata pools)
        external
        returns (ValidationResult[] memory)
    {
        // Each pool has 3 calls (reserve0, reserve1, totalSupply)
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](pools.length * 3);

        uint256 callIndex = 0;
        for (uint256 i = 0; i < pools.length; i++) {
            // reserve0
            calls[callIndex++] = IMulticall3.Call3({
                target: pools[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("reserve0()")
            });

            // reserve1
            calls[callIndex++] = IMulticall3.Call3({
                target: pools[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("reserve1()")
            });

            // totalSupply
            calls[callIndex++] = IMulticall3.Call3({
                target: pools[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("totalSupply()")
            });
        }

        IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);

        ValidationResult[] memory validations = new ValidationResult[](pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            uint256 resultIdx = i * 3;

            bool allSuccess = results[resultIdx].success &&
                            results[resultIdx + 1].success &&
                            results[resultIdx + 2].success;

            if (!allSuccess) {
                validations[i].isHealthy = false;
                validations[i].error = "Failed to fetch pool state";
                continue;
            }

            uint256 reserve0 = abi.decode(results[resultIdx].returnData, (uint256));
            uint256 reserve1 = abi.decode(results[resultIdx + 1].returnData, (uint256));
            uint256 liquidity = abi.decode(results[resultIdx + 2].returnData, (uint256));

            // Validate invariants
            if (reserve0 == 0 || reserve1 == 0) {
                validations[i].isHealthy = false;
                validations[i].error = "Empty reserves";
            } else if (liquidity == 0) {
                validations[i].isHealthy = false;
                validations[i].error = "No liquidity";
            } else {
                validations[i].isHealthy = true;
                // Calculate depth score (normalized reserves)
                validations[i].depthScore = (reserve0 + reserve1) / 2;
            }
        }

        return validations;
    }
}
```

**Validation patterns:**
- Batch consistency checking
- Protocol invariant verification
- Health score calculation
- Atomic state snapshots

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Chained Multicall Execution

Execute dependent calls sequentially:

```solidity
pragma solidity ^0.8.0;

contract ChainedExecution {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct ChainStep {
        address target;
        bytes callData;
        bool allowFailure;
    }

    function executeChained(ChainStep[] calldata steps) external returns (bytes[] memory) {
        bytes[] memory results = new bytes[](steps.length);

        for (uint256 i = 0; i < steps.length; i++) {
            // Build call array for this step only
            IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](1);

            calls[0] = IMulticall3.Call3({
                target: steps[i].target,
                allowFailure: steps[i].allowFailure,
                callData: steps[i].callData
            });

            IMulticall3.Result[] memory stepResults =
                IMulticall3(MULTICALL3).aggregate3(calls);

            require(stepResults[0].success || steps[i].allowFailure, "Step failed");
            results[i] = stepResults[0].returnData;

            // Can use results[i] to build next step if needed
        }

        return results;
    }

    function executeDependentSwaps(address[] calldata pools, uint256[] calldata amounts)
        external
        returns (uint256[] memory)
    {
        require(pools.length == amounts.length, "Length mismatch");

        uint256[] memory outputs = new uint256[](pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            // Get output amount
            bytes memory getAmountCallData = abi.encodeWithSignature(
                "getAmountOut(uint256)",
                amounts[i]
            );

            IMulticall3.Call3[] memory getCalls = new IMulticall3.Call3[](1);
            getCalls[0] = IMulticall3.Call3({
                target: pools[i],
                allowFailure: false,
                callData: getAmountCallData
            });

            IMulticall3.Result[] memory amountResults =
                IMulticall3(MULTICALL3).aggregate3(getCalls);

            uint256 outputAmount = abi.decode(amountResults[0].returnData, (uint256));
            outputs[i] = outputAmount;

            // Use output for next swap
            if (i + 1 < pools.length) {
                amounts[i + 1] = outputAmount;
            }
        }

        return outputs;
    }
}
```

**Chained execution use cases:**
- Sequential contract dependencies
- Output-based routing
- Conditional call chains
- Multi-step atomic operations

### Technique 2: Batched Permitting

Apply multiple permits atomically:

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

interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);
}

contract BatchPermitter {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct PermitData {
        address token;
        uint256 amount;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function batchPermit(
        address owner,
        address spender,
        PermitData[] calldata permits
    ) external {
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](permits.length);

        for (uint256 i = 0; i < permits.length; i++) {
            calls[i] = IMulticall3.Call3({
                target: permits[i].token,
                allowFailure: true,  // Continue if permit fails
                callData: abi.encodeWithSignature(
                    "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",
                    owner,
                    spender,
                    permits[i].amount,
                    permits[i].deadline,
                    permits[i].v,
                    permits[i].r,
                    permits[i].s
                )
            });
        }

        IMulticall3(MULTICALL3).aggregate3(calls);
    }
}
```

**Batch permitting benefits:**
- Single transaction for multiple approvals
- Gasless permit integration
- Atomic multi-token operations
- Handles permit failures gracefully

### Technique 3: View Function Batching with Calldata Encoding

Efficiently encode complex batch calls:

```solidity
pragma solidity ^0.8.0;

contract BatchCallDataBuilder {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct CallDescription {
        address target;
        string signature;
        bytes[] params;
        bool allowFailure;
    }

    function buildAndExecuteCalls(CallDescription[] calldata descriptions)
        external
        returns (bytes[] memory)
    {
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](descriptions.length);

        for (uint256 i = 0; i < descriptions.length; i++) {
            calls[i] = IMulticall3.Call3({
                target: descriptions[i].target,
                allowFailure: descriptions[i].allowFailure,
                callData: _encodeCall(descriptions[i].signature, descriptions[i].params)
            });
        }

        IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);

        bytes[] memory decodedResults = new bytes[](results.length);
        for (uint256 i = 0; i < results.length; i++) {
            decodedResults[i] = results[i].returnData;
        }

        return decodedResults;
    }

    function _encodeCall(string memory signature, bytes[] memory params)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory encoded = abi.encodeWithSignature(signature);
        for (uint256 i = 0; i < params.length; i++) {
            encoded = bytes.concat(encoded, params[i]);
        }
        return encoded;
    }
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete DEX Aggregator

Query multiple pools and execute optimal swap:

```solidity
pragma solidity ^0.8.0;

interface ISwapPool {
    function getAmountOut(uint256 amountIn) external view returns (uint256);
    function swap(uint256 amountOut, address recipient) external payable;
}

interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);

    function aggregate3Value(Call3Value[] calldata calls) external payable returns (Result[] memory);
}

struct Call3Value {
    address target;
    bool allowFailure;
    uint256 value;
    bytes callData;
}

contract DEXAggregator {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    event SwapExecuted(address indexed pool, uint256 inputAmount, uint256 outputAmount);

    struct QuoteResult {
        address pool;
        uint256 outputAmount;
        bool available;
    }

    function findBestSwap(address[] calldata pools, uint256 inputAmount)
        external
        returns (address bestPool, uint256 bestOutput)
    {
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            calls[i] = IMulticall3.Call3({
                target: pools[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("getAmountOut(uint256)", inputAmount)
            });
        }

        IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);

        bestOutput = 0;
        for (uint256 i = 0; i < results.length; i++) {
            if (results[i].success) {
                uint256 output = abi.decode(results[i].returnData, (uint256));
                if (output > bestOutput) {
                    bestOutput = output;
                    bestPool = pools[i];
                }
            }
        }

        require(bestPool != address(0), "No available swaps");
        return (bestPool, bestOutput);
    }

    function swapWithAggregation(
        address[] calldata pools,
        uint256 inputAmount,
        uint256 minOutput
    ) external payable returns (uint256 outputAmount) {
        require(msg.value >= inputAmount, "Insufficient ETH");

        (address bestPool, uint256 expectedOutput) = findBestSwap(pools, inputAmount);
        require(expectedOutput >= minOutput, "Slippage exceeded");

        // Execute swap
        IMulticall3.Call3Value[] memory swapCalls = new IMulticall3.Call3Value[](1);
        swapCalls[0] = IMulticall3.Call3Value({
            target: bestPool,
            allowFailure: false,
            value: inputAmount,
            callData: abi.encodeWithSignature("swap(uint256,address)", expectedOutput, msg.sender)
        });

        IMulticall3(MULTICALL3).aggregate3Value{value: inputAmount}(swapCalls);

        emit SwapExecuted(bestPool, inputAmount, expectedOutput);
        return expectedOutput;
    }

    function batchSwaps(
        address[] calldata pools,
        uint256[] calldata amounts,
        uint256[] calldata minOutputs
    ) external payable {
        require(pools.length == amounts.length, "Length mismatch");
        require(amounts.length == minOutputs.length, "Length mismatch");

        uint256 totalInput = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalInput += amounts[i];
        }
        require(msg.value >= totalInput, "Insufficient ETH");

        for (uint256 i = 0; i < pools.length; i++) {
            swapWithAggregation(_singletonArray(pools[i]), amounts[i], minOutputs[i]);
        }
    }

    function _singletonArray(address item) internal pure returns (address[] memory) {
        address[] memory arr = new address[](1);
        arr[0] = item;
        return arr;
    }
}
```

### Example 2: Account Balance Checker with Staking Status

Complex multi-contract portfolio view:

```solidity
pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

interface IStaking {
    function stakedBalance(address) external view returns (uint256);
    function earned(address) external view returns (uint256);
}

interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);
}

contract PortfolioChecker {
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    struct TokenInfo {
        address token;
        uint256 balance;
    }

    struct StakingInfo {
        address stakingContract;
        uint256 staked;
        uint256 earned;
    }

    struct PortfolioSnapshot {
        TokenInfo[] tokens;
        StakingInfo[] staking;
        uint256 totalValue;
    }

    function getFullPortfolio(
        address user,
        address[] calldata tokens,
        address[] calldata stakingContracts
    ) external returns (PortfolioSnapshot memory portfolio) {
        // Build calls: 1 per token + 2 per staking contract (staked + earned)
        uint256 callCount = tokens.length + (stakingContracts.length * 2);
        IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](callCount);

        uint256 callIdx = 0;

        // Token balances
        for (uint256 i = 0; i < tokens.length; i++) {
            calls[callIdx++] = IMulticall3.Call3({
                target: tokens[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("balanceOf(address)", user)
            });
        }

        // Staking info
        for (uint256 i = 0; i < stakingContracts.length; i++) {
            // Staked balance
            calls[callIdx++] = IMulticall3.Call3({
                target: stakingContracts[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("stakedBalance(address)", user)
            });

            // Earned rewards
            calls[callIdx++] = IMulticall3.Call3({
                target: stakingContracts[i],
                allowFailure: true,
                callData: abi.encodeWithSignature("earned(address)", user)
            });
        }

        IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);

        // Parse token results
        portfolio.tokens = new TokenInfo[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            portfolio.tokens[i].token = tokens[i];
            if (results[i].success) {
                portfolio.tokens[i].balance = abi.decode(results[i].returnData, (uint256));
            }
        }

        // Parse staking results
        portfolio.staking = new StakingInfo[](stakingContracts.length);
        uint256 stakingResultIdx = tokens.length;

        for (uint256 i = 0; i < stakingContracts.length; i++) {
            portfolio.staking[i].stakingContract = stakingContracts[i];

            if (results[stakingResultIdx].success) {
                portfolio.staking[i].staked = abi.decode(
                    results[stakingResultIdx].returnData,
                    (uint256)
                );
            }

            if (results[stakingResultIdx + 1].success) {
                portfolio.staking[i].earned = abi.decode(
                    results[stakingResultIdx + 1].returnData,
                    (uint256)
                );
            }

            stakingResultIdx += 2;
        }

        return portfolio;
    }
}
```

## Best Practices

**Call Design**
- Set `allowFailure: true` for non-critical calls
- Use `allowFailure: false` only for required operations
- Always check `success` flag before decoding
- Include detailed error handling in client code

**Performance**
- Batch all independent calls
- Leverage view function optimization
- Use aggregate3 for flexible failure handling
- Avoid unnecessary eth value transfers

**Safety**
- Validate decoded return data
- Check array lengths match expectations
- Handle partial failures gracefully
- Test with failing mock contracts

**Gas Efficiency**
- Combine multiple queries per transaction
- Minimize number of separate multicalls
- Use appropriate aggregate function variant
- Account for multicall contract overhead

## Common Pitfalls

**Issue 1: Assuming All Calls Succeed**
```solidity
// ❌ Wrong - crashes if any call fails
IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](2);
calls[0] = IMulticall3.Call3({
    target: token,
    allowFailure: true,
    callData: abi.encodeWithSignature("balanceOf(address)", user)
});

IMulticall3.Result[] memory results = IMulticall3(MULTICALL3).aggregate3(calls);
uint256 balance = abi.decode(results[0].returnData, (uint256));  // May crash!

// ✅ Correct - check success flag
if (results[0].success) {
    uint256 balance = abi.decode(results[0].returnData, (uint256));
}
```
**Solution:** Always verify `success` flag before decoding return data.

**Issue 2: Incorrect Result Indexing**
```solidity
// ❌ Wrong - result indices misaligned with calls
for (uint256 i = 0; i < pools.length; i++) {
    calls[i * 2] = call1;     // 2 calls per pool
    calls[i * 2 + 1] = call2;
}
// Results array has same indexing!
uint256 idx = i * 2;
decode(results[idx]);        // Correct
decode(results[i]);          // Wrong!

// ✅ Correct - maintain consistent indexing
uint256 resultIdx = i * 2;
decode(results[resultIdx]);
decode(results[resultIdx + 1]);
```
**Solution:** Track call index carefully, especially with variable-sized batches.

**Issue 3: Forgetting Aggregate Function Variant**
```solidity
// ❌ Wrong - aggregate3Value needs msg.value
IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](1);
calls[0] = IMulticall3.Call3Value({
    target: vault,
    allowFailure: false,
    value: 1 ether,
    callData: abi.encodeWithSignature("deposit()")
});
IMulticall3(MULTICALL3).aggregate3(calls);  // Wrong function!

// ✅ Correct - use aggregate3Value with msg.value
IMulticall3(MULTICALL3).aggregate3Value{value: 1 ether}(calls);
```
**Solution:** Match function to call type (aggregate3 vs aggregate3Value).

**Issue 4: Misaligned Value Transfers**
```solidity
// ❌ Wrong - value doesn't match actual needs
IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](2);
calls[0] = IMulticall3.Call3Value({target: a, value: 1 ether, ...});
calls[1] = IMulticall3.Call3Value({target: b, value: 0.5 ether, ...});
IMulticall3(MULTICALL3).aggregate3Value{value: 0.5 ether}(calls);  // Too little!

// ✅ Correct - sum all values
IMulticall3(MULTICALL3).aggregate3Value{value: 1.5 ether}(calls);
```
**Solution:** Sum all call values and match msg.value.

## Resources

**Official Implementations**
- [Multicall3 Contract](https://github.com/mds1/multicall) - Reference implementation
- [0xSequence Multicall](https://github.com/0xsequence/sequence.js) - Alternative implementation

**Integration Guides**
- [Ethers.js Multicall](https://docs.ethers.org/) - JavaScript integration
- [Web3.py Multicall](https://web3py.readthedocs.io/) - Python integration
- [Subgraph Batching](https://thegraph.com/) - GraphQL batching patterns

**Related Skills**
- `eip712-typed-signatures` - Batch signature collection
- `flashbots-mev` - MEV-protected multicall bundles
- `contract-upgrades` - Upgrade batch operations
