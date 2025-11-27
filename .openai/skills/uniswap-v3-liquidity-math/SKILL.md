# Uniswap V3 Liquidity Math

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 40 tokens, expands to 4500 tokens

## Quick Reference (Load: 40 tokens)

Uniswap V3 uses concentrated liquidity within discrete ticks rather than full-range x*y=k. LPs provide liquidity in specific price ranges for capital efficiency.

**Core concepts:**
- Ticks: Discrete price points (spaced 1 bp apart at 0.01%)
- Tick spacing: Pool configuration (1, 10, 60, 200)
- Liquidity amounts: Q64.96 fixed-point format
- Position ranges: tickLower to tickUpper
- Fees: Earned as price moves through position

**Quick formulas:**
```
Amount0 = liquidity * (1/sqrt(P_upper) - 1/sqrt(P_current))
Amount1 = liquidity * (sqrt(P_current) - sqrt(P_lower))
P = (token1/token0) where ticks = log_1.0001(P)
```

## Core Concepts (Expand: +500 tokens)

### Tick System

Uniswap V3 prices are represented as discrete ticks:

**Tick structure:**
- Price = 1.0001^tick
- Each tick = 0.01% price movement
- Tick spacing: 1 (0.01%), 10 (0.1%), 60 (1%), 200 (2%)
- Valid ticks: multiples of tick spacing
- Range: -887272 to 887272

```solidity
// Tick math
function tickToSqrtRatioX96(int24 tick) public pure returns (uint160) {
    // Converts tick number to sqrt(price) in Q64.96 format
    // Lower tick = lower price = more token0 needed
}

// Price = 1.0001^tick
// sqrt(price) = 1.0001^(tick/2)
```

**Examples:**
- Tick 0: Price = 1.0 (equal value tokens)
- Tick 1: Price = 1.0001
- Tick -1: Price = 0.9999
- Tick 2400: Price ≈ 1.2714
- Tick -2400: Price ≈ 0.7865

### Liquidity Representation

V3 uses Q64.96 fixed-point for accurate math:

**Q64.96 format:**
- 64 bits for integer part
- 96 bits for fractional part
- Enables fixed-point arithmetic without floats
- sqrt ratios are 160-bit integers

```solidity
// sqrtRatioX96 = sqrt(price) * 2^96
// Actual sqrt(price) = sqrtRatioX96 / 2^96

// Liquidity is stored as:
// uint128 liquidity (not individual tokens)
// Convert to token amounts using tick range
```

### Position Accounting

Positions store liquidity across tick ranges:

```solidity
struct Position {
    uint128 liquidity;           // Liquidity amount
    uint256 feeGrowthInside0LastX128;
    uint256 feeGrowthInside1LastX128;
    uint128 tokensOwed0;         // Unclaimed fees
    uint128 tokensOwed1;
}

// Amounts at any price:
// amount0 = liquidity * (1/sqrt(P_upper) - 1/sqrt(P_current))
// amount1 = liquidity * (sqrt(P_current) - sqrt(P_lower))
```

### Fee Mechanics

Fees accrue as price moves through position:

**Fee structure:**
- Pool-level swaps create fees (0.01%, 0.05%, 0.30%, 1.00%)
- Fees distributed proportionally to LPs in active tick
- Fees tracked as accumulated feeGrowth
- Collected via `collect()` function

```solidity
// Fee growth tracking (per unit of liquidity)
// feeGrowthGlobal0X128 - cumulative fees in token0
// feeGrowthInside0LastX128 - fees at last position update
// Earned fees = liquidity * (feeGrowthGlobal - feeGrowthInside)
```

### Tick Liquidity

Net liquidity changes as price crosses ticks:

```solidity
// When price moves across a tick:
// - If moving right (increasing price): liquidityNet changes
// - If moving left (decreasing price): liquidityNet changes opposite
// - Active liquidity = sum of all liquidityNet from lower ticks

// Tracks which ticks have liquidity:
mapping(int24 => TickInfo) ticks;

struct TickInfo {
    uint128 liquidityGross;      // Total liquidity
    int128 liquidityNet;          // Net change (+ when entering, - when exiting)
    uint256 feeGrowthOutside0X128;
    uint256 feeGrowthOutside1X128;
    // ...
}
```

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Calculate Token Amounts for Range

Given liquidity amount and tick range, find required tokens:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/libraries/FixedPoint96.sol';
import '@uniswap/v3-core/contracts/libraries/FullMath.sol';

contract LiquidityCalculator {
    // Calculate token0 amount for given liquidity and range
    function getAmount0(
        uint128 liquidity,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96
    ) public pure returns (uint256 amount0) {
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        if (sqrtRatioCurrentX96 >= sqrtRatioBX96) {
            // Position is completely below market, need max token0
            amount0 = FullMath.mulDiv(
                uint256(liquidity) << FixedPoint96.RESOLUTION,
                sqrtRatioBX96 - sqrtRatioAX96,
                sqrtRatioBX96
            ) / sqrtRatioAX96;
        } else if (sqrtRatioCurrentX96 > sqrtRatioAX96) {
            // Position straddles market, partially active
            amount0 = FullMath.mulDiv(
                uint256(liquidity) << FixedPoint96.RESOLUTION,
                sqrtRatioBX96 - sqrtRatioCurrentX96,
                sqrtRatioBX96
            ) / sqrtRatioCurrentX96;
        }
        // else: position is above market, amount0 = 0
    }

    // Calculate token1 amount for given liquidity and range
    function getAmount1(
        uint128 liquidity,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96
    ) public pure returns (uint256 amount1) {
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        if (sqrtRatioCurrentX96 <= sqrtRatioAX96) {
            // Position is completely above market, need max token1
            amount1 = FullMath.mulMul(
                liquidity,
                sqrtRatioBX96 - sqrtRatioAX96
            );
        } else if (sqrtRatioCurrentX96 < sqrtRatioBX96) {
            // Position straddles market, partially active
            amount1 = FullMath.mulMul(
                liquidity,
                sqrtRatioBX96 - sqrtRatioCurrentX96
            );
        }
        // else: position is below market, amount1 = 0
    }

    // Combined: amounts for both tokens
    function getAmounts(
        uint128 liquidity,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96
    ) external pure returns (uint256 amount0, uint256 amount1) {
        amount0 = getAmount0(liquidity, tickLower, tickUpper, sqrtRatioCurrentX96);
        amount1 = getAmount1(liquidity, tickLower, tickUpper, sqrtRatioCurrentX96);
    }
}
```

### Pattern 2: Calculate Liquidity from Token Amounts

Reverse calculation: given token amounts and range, find liquidity:

```solidity
pragma solidity ^0.8.0;

import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/libraries/FixedPoint96.sol';

contract LiquidityFromAmounts {
    // Get liquidity from amount0 and range
    function getLiquidityFromAmount0(
        uint256 amount0,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96
    ) public pure returns (uint128 liquidity) {
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        require(sqrtRatioCurrentX96 >= sqrtRatioAX96 &&
                sqrtRatioCurrentX96 <= sqrtRatioBX96, "Price out of range");

        // liquidity = amount0 * sqrtRatioCurrent * sqrtRatioB / (sqrtRatioB - sqrtRatioCurrent)
        liquidity = uint128(
            FullMath.mulDiv(
                amount0,
                FixedPoint96.Q96,
                FullMath.mulDiv(
                    sqrtRatioBX96 - sqrtRatioCurrentX96,
                    FixedPoint96.Q96,
                    sqrtRatioCurrentX96
                )
            ) * sqrtRatioBX96 / (sqrtRatioBX96 - sqrtRatioCurrentX96)
        );
    }

    // Get liquidity from amount1 and range
    function getLiquidityFromAmount1(
        uint256 amount1,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96
    ) public pure returns (uint128 liquidity) {
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        // liquidity = amount1 / (sqrtRatioCurrent - sqrtRatioA)
        liquidity = uint128(
            FullMath.mulDiv(
                amount1,
                FixedPoint96.Q96,
                sqrtRatioCurrentX96 - sqrtRatioAX96
            )
        );
    }

    // Get liquidity from both amounts (return minimum)
    function getLiquidity(
        uint256 amount0,
        uint256 amount1,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96
    ) external pure returns (uint128) {
        uint128 liq0 = getLiquidityFromAmount0(amount0, tickLower, tickUpper, sqrtRatioCurrentX96);
        uint128 liq1 = getLiquidityFromAmount1(amount1, tickLower, tickUpper, sqrtRatioCurrentX96);

        // Use the minimum to ensure both amounts available
        return liq0 < liq1 ? liq0 : liq1;
    }
}
```

### Pattern 3: Position Management

Create and update liquidity positions:

```solidity
pragma solidity ^0.8.0;

import '@uniswap/v3-periphery/contracts/NonfungiblePositionManager.sol';

contract PositionManager {
    INonfungiblePositionManager positionManager;

    constructor(address _positionManager) {
        positionManager = INonfungiblePositionManager(_positionManager);
    }

    // Create new position
    function createPosition(
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0,
        uint256 amount1,
        uint256 amount0Min,
        uint256 amount1Min
    ) external returns (
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0Used,
        uint256 amount1Used
    ) {
        // Approve tokens
        IERC20(token0).approve(address(positionManager), amount0);
        IERC20(token1).approve(address(positionManager), amount1);

        // Create position
        (tokenId, liquidity, amount0Used, amount1Used) =
            positionManager.mint(
                INonfungiblePositionManager.MintParams({
                    token0: token0,
                    token1: token1,
                    fee: fee,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    amount0Desired: amount0,
                    amount1Desired: amount1,
                    amount0Min: amount0Min,
                    amount1Min: amount1Min,
                    recipient: msg.sender,
                    deadline: block.timestamp + 60
                })
            );
    }

    // Increase liquidity for existing position
    function increaseLiquidity(
        uint256 tokenId,
        uint256 amount0,
        uint256 amount1,
        uint256 amount0Min,
        uint256 amount1Min
    ) external returns (
        uint128 liquidity,
        uint256 amount0Used,
        uint256 amount1Used
    ) {
        // Get position
        (,,address token0, address token1,,,,,,) =
            positionManager.positions(tokenId);

        // Approve tokens
        IERC20(token0).approve(address(positionManager), amount0);
        IERC20(token1).approve(address(positionManager), amount1);

        // Increase liquidity
        (liquidity, amount0Used, amount1Used) =
            positionManager.increaseLiquidity(
                INonfungiblePositionManager.IncreaseLiquidityParams({
                    tokenId: tokenId,
                    amount0Desired: amount0,
                    amount1Desired: amount1,
                    amount0Min: amount0Min,
                    amount1Min: amount1Min,
                    deadline: block.timestamp + 60
                })
            );
    }

    // Decrease liquidity and collect fees
    function decreaseLiquidity(
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0Min,
        uint256 amount1Min
    ) external returns (uint256 amount0, uint256 amount1) {
        (amount0, amount1) = positionManager.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: liquidity,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: block.timestamp + 60
            })
        );

        // Collect tokens
        (uint256 amount0Collected, uint256 amount1Collected) =
            positionManager.collect(
                INonfungiblePositionManager.CollectParams({
                    tokenId: tokenId,
                    recipient: msg.sender,
                    amount0Max: type(uint128).max,
                    amount1Max: type(uint128).max
                })
            );

        return (amount0Collected, amount1Collected);
    }
}
```

### Pattern 4: Fee Accumulation Tracking

Monitor and claim earned fees:

```solidity
pragma solidity ^0.8.0;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

contract FeeTracker {
    IUniswapV3Pool pool;

    constructor(address _pool) {
        pool = IUniswapV3Pool(_pool);
    }

    // Get earned fees since last collection
    function getPendingFees(
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    ) external view returns (uint256 fees0, uint256 fees1) {
        // Get current fee growth
        (,, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128,,) =
            pool.ticks(tickLower);
        (,, uint256 feeGrowthOutside0X128Upper, uint256 feeGrowthOutside1X128Upper,,) =
            pool.ticks(tickUpper);

        uint256 feeGrowthInside0X128 =
            pool.feeGrowthGlobal0X128() - feeGrowthOutside0X128 - feeGrowthOutside0X128Upper;
        uint256 feeGrowthInside1X128 =
            pool.feeGrowthGlobal1X128() - feeGrowthOutside1X128 - feeGrowthOutside1X128Upper;

        // Calculate earned fees
        fees0 = FullMath.mulDiv(
            feeGrowthInside0X128,
            uint256(liquidity),
            1 << 128
        );
        fees1 = FullMath.mulDiv(
            feeGrowthInside1X128,
            uint256(liquidity),
            1 << 128
        );
    }

    // Collect all fees
    function collectAllFees(uint256 tokenId) external {
        (,,,,,,,,,uint128 tokensOwed0, uint128 tokensOwed1) =
            positionManager.positions(tokenId);

        positionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: msg.sender,
                amount0Max: tokensOwed0,
                amount1Max: tokensOwed1
            })
        );
    }
}
```

### Pattern 5: Price Range Optimization

Find optimal tick ranges for user capital:

```solidity
pragma solidity ^0.8.0;

contract RangeOptimizer {
    // Calculate price range for 50-50 split
    function getBalancedRange(
        uint160 sqrtRatioCurrentX96,
        int24 tickSpacing
    ) external pure returns (int24 tickLower, int24 tickUpper) {
        // For 50-50 split: amount0 = amount1 at current price
        // This requires symmetric range around current tick

        int24 currentTick = TickMath.getTickAtSqrtRatio(sqrtRatioCurrentX96);

        // Round to nearest valid tick
        int24 tickOffset = (currentTick / tickSpacing) * tickSpacing;

        // Create symmetric range (e.g., ±60 ticks for 1% range)
        int24 range = 60;
        tickLower = tickOffset - range;
        tickUpper = tickOffset + range;
    }

    // Calculate range for max efficiency at specific price
    function getConcentratedRange(
        uint160 sqrtRatioCurrentX96,
        uint256 ratioDesired, // 1e18 = 50-50, > 1e18 = more token0
        int24 tickSpacing
    ) external pure returns (int24 tickLower, int24 tickUpper) {
        // Concentrated positions earn more fees but less capital efficiency
        // Adjust range based on desired price ratio

        int24 currentTick = TickMath.getTickAtSqrtRatio(sqrtRatioCurrentX96);
        int24 tickOffset = (currentTick / tickSpacing) * tickSpacing;

        // Tighter range = more concentrated = higher fee yield
        int24 concentration = 20; // Can adjust based on risk tolerance

        tickLower = tickOffset - concentration;
        tickUpper = tickOffset + concentration;
    }

    // Calculate return on capital for different ranges
    function estimateAnnualReturn(
        uint128 liquidity,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96,
        uint256 dailyVolume,
        uint24 fee
    ) external pure returns (uint256 annualFeePercent) {
        // Estimate annual fees based on daily volume and fee tier
        // This is simplified; actual returns vary

        uint256 annualFees = dailyVolume * 365 * fee / 1_000_000;

        // Capital required
        uint256 amount0 = getAmount0(liquidity, tickLower, tickUpper, sqrtRatioCurrentX96);
        uint256 amount1 = getAmount1(liquidity, tickLower, tickUpper, sqrtRatioCurrentX96);
        uint256 totalCapital = amount0 + amount1; // Simplified

        annualFeePercent = (annualFees * 1e18) / totalCapital;
    }
}
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Custom Tick Spacing Logic

Implement custom tick calculations:

```solidity
pragma solidity ^0.8.0;

contract AdvancedTickMath {
    // Get all affected ticks for a swap
    function getTicksAffectedBySwap(
        int24 currentTick,
        int24 tickLower,
        int24 tickUpper,
        int24 tickSpacing
    ) external pure returns (int24[] memory affectedTicks) {
        uint256 count = (uint24(tickUpper - tickLower) / uint24(tickSpacing)) + 1;
        affectedTicks = new int24[](count);

        int24 tick = tickLower;
        for (uint256 i = 0; i < count; i++) {
            affectedTicks[i] = tick;
            tick += tickSpacing;
        }
    }

    // Calculate liquidity withdrawal impact
    function estimateWithdrawalImpact(
        uint128 liquidityToWithdraw,
        uint128 totalLiquidity,
        int24 currentTick,
        int24 tickLower,
        int24 tickUpper
    ) external pure returns (uint256 priceMovement) {
        // Rough estimate: removing liquidity can move price
        // Impact = liquidityWithdrawn / totalLiquidity * tickSize

        if (currentTick > tickLower && currentTick < tickUpper) {
            // Position is active, withdrawal has impact
            uint256 ratio = (uint256(liquidityToWithdraw) * 1e18) / uint256(totalLiquidity);
            priceMovement = (ratio * uint256(tickUpper - currentTick)) / 1e18;
        }
    }

    // Find optimal tick for limit orders
    function findLimitOrderTick(
        uint160 targetPriceSqrtX96,
        int24 tickSpacing
    ) external pure returns (int24 optimalTick) {
        // Find nearest valid tick to target price
        int24 rawTick = TickMath.getTickAtSqrtRatio(targetPriceSqrtX96);

        // Round to nearest valid tick spacing
        optimalTick = (rawTick / tickSpacing) * tickSpacing;

        // If not exact match, round to nearest
        if (rawTick > optimalTick + tickSpacing / 2) {
            optimalTick += tickSpacing;
        }
    }
}
```

### Technique 2: Multi-Tick Position Splitting

Manage liquidity across multiple tick ranges:

```solidity
pragma solidity ^0.8.0;

contract SplitPositionManager {
    struct SplitPosition {
        uint128[] liquidities;
        int24[] tickLowers;
        int24[] tickUppers;
        uint256[] tokenIds;
    }

    // Split capital across multiple ranges
    function createMultiRangePosition(
        uint256 amount0,
        uint256 amount1,
        int24[] calldata tickLowers,
        int24[] calldata tickUppers,
        uint128[] calldata liquidities
    ) external returns (uint256[] memory tokenIds) {
        require(
            tickLowers.length == tickUppers.length &&
            tickLowers.length == liquidities.length,
            "Mismatched arrays"
        );

        tokenIds = new uint256[](tickLowers.length);

        for (uint256 i = 0; i < tickLowers.length; i++) {
            // Create position for each range
            (tokenIds[i],,uint256 used0, uint256 used1) =
                positionManager.mint(
                    INonfungiblePositionManager.MintParams({
                        token0: token0,
                        token1: token1,
                        fee: fee,
                        tickLower: tickLowers[i],
                        tickUpper: tickUppers[i],
                        amount0Desired: (amount0 * liquidities[i]) / totalLiquidity,
                        amount1Desired: (amount1 * liquidities[i]) / totalLiquidity,
                        amount0Min: 0,
                        amount1Min: 0,
                        recipient: msg.sender,
                        deadline: block.timestamp + 60
                    })
                );

            amount0 -= used0;
            amount1 -= used1;
        }

        return tokenIds;
    }

    // Rebalance positions based on new price
    function rebalancePositions(
        uint256[] calldata tokenIds,
        uint160 newSqrtRatioX96
    ) external {
        // Collect fees first
        for (uint256 i = 0; i < tokenIds.length; i++) {
            positionManager.collect(
                INonfungiblePositionManager.CollectParams({
                    tokenId: tokenIds[i],
                    recipient: address(this),
                    amount0Max: type(uint128).max,
                    amount1Max: type(uint128).max
                })
            );
        }

        // Burn all positions
        for (uint256 i = 0; i < tokenIds.length; i++) {
            (,, uint256 liquidity,,,,,) = positionManager.positions(tokenIds[i]);
            positionManager.decreaseLiquidity(
                INonfungiblePositionManager.DecreaseLiquidityParams({
                    tokenId: tokenIds[i],
                    liquidity: uint128(liquidity),
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp + 60
                })
            );
        }

        // Re-create positions based on new price
        // Implementation depends on strategy
    }
}
```

### Technique 3: Slippage and Price Impact Calculation

Accurate slippage estimation for complex positions:

```solidity
pragma solidity ^0.8.0;

contract SlippageCalculator {
    // Estimate price impact of removing liquidity
    function estimatePriceImpactRemoval(
        uint160 currentSqrtRatioX96,
        uint128 liquidityToRemove,
        uint128 activeLiquidity
    ) external pure returns (uint160 newSqrtRatioX96) {
        // Removing liquidity from the active tick affects price
        // Impact = liquidityRemoved / activeLiquidity

        if (activeLiquidity > liquidityToRemove) {
            uint256 ratio = (uint256(liquidityToRemove) * 1e18) / uint256(activeLiquidity);

            // Rough approximation: price moves inversely
            // In practice, use more sophisticated oracle
            uint256 priceMovement = (uint256(currentSqrtRatioX96) * ratio) / 1e18;
            newSqrtRatioX96 = uint160(uint256(currentSqrtRatioX96) - priceMovement);
        }
    }

    // Calculate minimum output to account for slippage
    function calculateMinimumOutput(
        uint256 expectedAmount,
        uint256 slippagePercent // e.g., 50 = 0.50%
    ) external pure returns (uint256 minimumAmount) {
        uint256 slippageBps = slippagePercent * 100; // Convert to bps
        minimumAmount = expectedAmount - (expectedAmount * slippageBps) / 1_000_000;
    }

    // Check if price movement is within acceptable range
    function isPriceWithinTolerance(
        uint160 currentSqrtRatioX96,
        uint160 expectedSqrtRatioX96,
        uint256 tolerancePercent
    ) external pure returns (bool) {
        uint256 priceDifference =
            currentSqrtRatioX96 > expectedSqrtRatioX96 ?
            currentSqrtRatioX96 - expectedSqrtRatioX96 :
            expectedSqrtRatioX96 - currentSqrtRatioX96;

        uint256 priceDifferenceBps =
            (priceDifference * 10_000) / expectedSqrtRatioX96;

        return priceDifferenceBps <= (tolerancePercent * 100);
    }
}
```

### Technique 4: Liquidity Distribution Analysis

Analyze capital efficiency across positions:

```solidity
pragma solidity ^0.8.0;

contract EfficiencyAnalyzer {
    // Calculate capital utilization
    function getCapitalUtilization(
        uint128 liquidity,
        int24 tickLower,
        int24 tickUpper,
        uint160 sqrtRatioCurrentX96,
        uint256 totalDeposited
    ) external pure returns (uint256 utilizationPercent) {
        uint256 amount0 = getAmount0(...);
        uint256 amount1 = getAmount1(...);
        uint256 deployed = amount0 + amount1;

        utilizationPercent = (deployed * 1e18) / totalDeposited;
    }

    // Compare fee earnings vs IL risk
    function getRiskAdjustedReturn(
        uint256 estimatedAnnualFees,
        uint160 tickLowerPrice,
        uint160 tickUpperPrice,
        uint160 currentPrice
    ) external pure returns (int256 impermanentLoss) {
        // If price moves outside range, IL = 0 (no loss, but no fees)
        // If price within range, IL = 2*sqrt(P_current) - P_current - 1

        if (currentPrice < uint160(tickLowerPrice) ||
            currentPrice > uint160(tickUpperPrice)) {
            return 0; // Out of range, no IL but no fees accumulating
        }

        // Calculate IL using geometric mean
        uint256 sqrtLower = uint256(tickLowerPrice);
        uint256 sqrtUpper = uint256(tickUpperPrice);
        uint256 sqrtCurrent = uint256(currentPrice);

        // IL% = 2 * sqrt(price_ratio) - 1 - price_ratio
        // where price_ratio = upper / lower
    }

    // Find optimal fee tier for liquidity
    function getOptimalFeeTier(
        uint256 estimatedDailyVolume,
        uint256 desiredAnnualReturn // e.g., 10% = 1e17
    ) external pure returns (uint24 optimalFee) {
        // Higher volume -> lower fee tier
        // Lower volume -> higher fee tier to compensate

        if (estimatedDailyVolume > 1_000_000 ether) {
            optimalFee = 500; // 0.05%
        } else if (estimatedDailyVolume > 100_000 ether) {
            optimalFee = 3000; // 0.30%
        } else {
            optimalFee = 10000; // 1.00%
        }
    }
}
```

### Technique 5: Flash Loan Integration

Use flash loans for efficient position management:

```solidity
pragma solidity ^0.8.0;

import '@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol';

contract FlashLoanPositionManager is IUniswapV3FlashCallback {
    IUniswapV3Pool public pool;

    // Flash loan to mint position without pre-funding
    function flashMintPosition(
        uint256 amount0,
        uint256 amount1,
        int24 tickLower,
        int24 tickUpper
    ) external {
        pool.flash(
            address(this),
            amount0,
            amount1,
            abi.encode(FlashMintData({
                amount0: amount0,
                amount1: amount1,
                tickLower: tickLower,
                tickUpper: tickUpper
            }))
        );
    }

    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external override {
        FlashMintData memory flashData = abi.decode(data, (FlashMintData));

        // Mint position with borrowed tokens
        (uint256 tokenId,,uint256 amount0Used, uint256 amount1Used) =
            positionManager.mint(
                INonfungiblePositionManager.MintParams({
                    token0: pool.token0(),
                    token1: pool.token1(),
                    fee: pool.fee(),
                    tickLower: flashData.tickLower,
                    tickUpper: flashData.tickUpper,
                    amount0Desired: flashData.amount0,
                    amount1Desired: flashData.amount1,
                    amount0Min: 0,
                    amount1Min: 0,
                    recipient: msg.sender,
                    deadline: block.timestamp + 60
                })
            );

        // Repay flash loan + fees
        IERC20(pool.token0()).transfer(address(pool), amount0Used + fee0);
        IERC20(pool.token1()).transfer(address(pool), amount1Used + fee1);
    }

    struct FlashMintData {
        uint256 amount0;
        uint256 amount1;
        int24 tickLower;
        int24 tickUpper;
    }
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete Concentrated Liquidity Manager

Full LP position management system:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ConcentratedLPManager {
    INonfungiblePositionManager public positionManager;
    IUniswapV3Factory public factory;

    mapping(uint256 => PositionInfo) public positionMetadata;

    struct PositionInfo {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 targetLiquidity;
        uint256 createdAt;
        uint256 feesCollected;
    }

    event PositionCreated(
        uint256 indexed tokenId,
        address indexed token0,
        address indexed token1,
        uint256 liquidity
    );

    event FeesCollected(uint256 indexed tokenId, uint256 fees0, uint256 fees1);

    event PositionRebalanced(uint256 indexed tokenId, uint128 newLiquidity);

    // Create new managed position
    function createManagedPosition(
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0,
        uint256 amount1
    ) external returns (uint256 tokenId) {
        // Approve tokens
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);

        IERC20(token0).approve(address(positionManager), amount0);
        IERC20(token1).approve(address(positionManager), amount1);

        // Create position
        (tokenId,,uint128 liquidity,,) = positionManager.mint(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0,
                amount1Desired: amount1,
                amount0Min: (amount0 * 95) / 100,
                amount1Min: (amount1 * 95) / 100,
                recipient: address(this),
                deadline: block.timestamp + 600
            })
        );

        // Record metadata
        positionMetadata[tokenId] = PositionInfo({
            token0: token0,
            token1: token1,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            targetLiquidity: liquidity,
            createdAt: block.timestamp,
            feesCollected: 0
        });

        emit PositionCreated(tokenId, token0, token1, liquidity);
    }

    // Claim and reinvest fees
    function compoundFees(uint256 tokenId) external returns (uint128 addedLiquidity) {
        PositionInfo storage info = positionMetadata[tokenId];

        // Collect fees
        (uint256 fees0, uint256 fees1) = positionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );

        // Approve for reinvestment
        IERC20(info.token0).approve(address(positionManager), fees0);
        IERC20(info.token1).approve(address(positionManager), fees1);

        // Reinvest fees as additional liquidity
        (uint128 liquidity,uint256 used0, uint256 used1) =
            calculateLiquidityFromAmounts(fees0, fees1, info.tickLower, info.tickUpper);

        positionManager.increaseLiquidity(
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: tokenId,
                amount0Desired: fees0,
                amount1Desired: fees1,
                amount0Min: (fees0 * 95) / 100,
                amount1Min: (fees1 * 95) / 100,
                deadline: block.timestamp + 600
            })
        );

        info.feesCollected += fees0 + fees1; // Rough addition
        addedLiquidity = liquidity;

        emit FeesCollected(tokenId, fees0, fees1);
    }

    // Rebalance position to new range
    function rebalancePosition(
        uint256 tokenId,
        int24 newTickLower,
        int24 newTickUpper
    ) external {
        PositionInfo storage info = positionMetadata[tokenId];

        // Get current liquidity
        (,, uint256 liquidity,,,,,) = positionManager.positions(tokenId);

        // Remove from old position
        (uint256 amount0, uint256 amount1) = positionManager.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: uint128(liquidity),
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp + 600
            })
        );

        // Collect tokens
        positionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );

        // Burn old position NFT
        positionManager.burn(tokenId);

        // Create new position with same capital
        IERC20(info.token0).approve(address(positionManager), amount0);
        IERC20(info.token1).approve(address(positionManager), amount1);

        (uint256 newTokenId, uint128 newLiquidity,,) =
            positionManager.mint(
                INonfungiblePositionManager.MintParams({
                    token0: info.token0,
                    token1: info.token1,
                    fee: info.fee,
                    tickLower: newTickLower,
                    tickUpper: newTickUpper,
                    amount0Desired: amount0,
                    amount1Desired: amount1,
                    amount0Min: (amount0 * 95) / 100,
                    amount1Min: (amount1 * 95) / 100,
                    recipient: address(this),
                    deadline: block.timestamp + 600
                })
            );

        // Update metadata
        info.tickLower = newTickLower;
        info.tickUpper = newTickUpper;

        emit PositionRebalanced(newTokenId, newLiquidity);
    }

    // Internal helper
    function calculateLiquidityFromAmounts(
        uint256 amount0,
        uint256 amount1,
        int24 tickLower,
        int24 tickUpper
    ) internal view returns (uint128 liquidity, uint256 used0, uint256 used1) {
        // Implementation using Uniswap libraries
        // Returns minimum liquidity and actual amounts used
    }
}
```

## Best Practices

**Tick Selection**
- Use round tick numbers for simplicity
- Consider tick spacing (1, 10, 60, 200)
- Wider ranges = lower fees, less capital efficient
- Tighter ranges = higher fees, higher IL risk

**Position Management**
- Monitor price movements against range
- Compound fees regularly for better returns
- Rebalance when price moves significantly
- Account for IL when comparing strategies

**Risk Management**
- Price can move outside range (stop earning fees)
- IL increases with price movement
- Use wider ranges for volatile pairs
- Monitor total capital deployed

**Liquidity Calculations**
- Always check for zero amounts
- Use safe math for fixed-point calculations
- Include slippage (0.5% - 1%) in minimums
- Verify decimal precision matches tokens

## Common Pitfalls

**Issue 1: Invalid Tick Spacing**
```solidity
// ❌ Wrong - not multiple of tick spacing
int24 tickLower = 1000;  // Pool spacing is 60
int24 tickUpper = 2000;

// ✅ Correct - valid spacing
int24 tickLower = 960;   // Multiple of 60
int24 tickUpper = 2040;
```

**Issue 2: Position Out of Range**
```solidity
// ❌ Wrong - ignores out-of-range positions
uint256 amount0 = getAmount0(liquidity, lower, upper, current);

// ✅ Correct - check if in range
if (current >= upper || current <= lower) {
    // Position inactive, check carefully
}
```

**Issue 3: Fee Calculation Precision**
```solidity
// ❌ Wrong - precision loss
uint256 fees = (liquidity * feeGrowth) / (1 << 128);

// ✅ Correct - use FullMath
uint256 fees = FullMath.mulDiv(
    feeGrowth,
    liquidity,
    1 << 128
);
```

## Resources

**Official Documentation**
- [Uniswap V3 Docs](https://docs.uniswap.org/) - Complete guide
- [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf) - Technical details
- [Uniswap SDK](https://github.com/Uniswap/v3-sdk) - JavaScript library

**Related Skills**
- `ethersjs-v6-migration` - Web3 interactions
- `hardhat-deployment-scripts` - Contract deployment
- `foundry-fuzzing-techniques` - Testing math

**External Resources**
- [Uniswap V3 Examples](https://github.com/Uniswap/v3-core/tree/main/contracts) - Code examples
- [Uniswap Analytics](https://info.uniswap.org/) - Real data analysis
- [Concentrated Liquidity Guides](https://docs.uniswap.org/protocol/guides) - Strategy guides
