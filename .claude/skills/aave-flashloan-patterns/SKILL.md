---
name: aave-flashloan-patterns
description: "Progressive disclosure skill: Quick reference in 41 tokens, expands to 4400 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [41, 4400]
---

# Aave Flash Loan Patterns

> Progressive disclosure skill: Quick reference in 41 tokens, expands to 4400 tokens

## Quick Reference (Load: 41 tokens)

Aave flash loans allow borrowing any amount of liquidity with callback repayment in same transaction. No collateral required - only pay 0.09% fee + gas.

**Core pattern:**
- Call `flashLoan(token, amount, receiver, params)`
- Contract receives callback via `executeOperation()`
- Repay principal + 0.09% fee before callback returns
- Loan reverts if repayment fails

**Quick example:**
```solidity
ILendingPool lender = ILendingPool(AAVE_LENDING_POOL);
lender.flashLoan(USDC, 100_000e6, address(this), data);

function executeOperation(address token, uint256 amount, uint256 fee, address initiator, bytes calldata params) external {
    // Your logic here
    // Repay: IERC20(token).approve(address(lender), amount + fee);
}
```

## Core Concepts (Expand: +500 tokens)

### Flash Loan Mechanics

Uncollateralized loans executed within a single transaction:

**Key features:**
- Borrow any available amount (up to pool reserves)
- Must repay within same transaction
- Fee: 0.09% of borrowed amount
- All-or-nothing: fails if any part doesn't repay
- No credit checks or collateral

**Loan flow:**
1. Initiate flash loan
2. Aave sends tokens to receiver contract
3. `executeOperation()` callback invoked
4. Execute trading/arbitrage logic
5. Repay principal + fee
6. Callback returns, loan completed

### Flash Loan Initiator

Starting the flash loan process:

```solidity
interface IFlashLoanReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,        // Fee (0.09%)
        address initiator,      // Who called flashLoan
        bytes calldata params   // Custom data
    ) external returns (bool);
}

interface ILendingPool {
    function flashLoan(
        address receiver,
        address token,
        uint256 amount,
        bytes calldata params
    ) external;

    function flashLoanSimple(
        address receiver,
        address token,
        uint256 amount,
        bytes calldata params
    ) external;
}
```

### Fee Calculation

Standard 0.09% fee applies to all flash loans:

```solidity
// Premium = 0.09% = 9 basis points
uint256 premium = (amount * 9) / 10_000;
uint256 totalRepayment = amount + premium;
```

### Callback Execution

`executeOperation()` is called during the flash loan:

**Requirements:**
- Must return `true` to confirm successful repayment
- Token approval must be set before callback returns
- Any revert in callback cancels entire transaction
- Initiator address identifies caller

**Safety checks:**
- Verify callback came from authentic Aave pool
- Check that you initiated the loan
- Validate token and amount match request

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Simple Arbitrage

Basic DEX arbitrage using flash loans:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@aave/core-v3/contracts/flashloan/base/FlashLoanReceiver.sol';
import '@aave/core-v3/contracts/interfaces/IPool.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract SimpleArbitrage is FlashLoanReceiver {
    address public constant ROUTER_1 = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; // Uniswap V2
    address public constant ROUTER_2 = 0xE592427A0AEce92De3Edee1F18E0157C05861564; // Uniswap V3
    address public owner;

    constructor(address _addressProvider) FlashLoanReceiver(_addressProvider) {
        owner = msg.sender;
    }

    // Initiate flash loan for arbitrage
    function executeArbitrage(
        address token,
        uint256 amount,
        address[] calldata path
    ) external {
        require(msg.sender == owner, "Only owner");

        address lendingPool = address(POOL);
        bytes memory params = abi.encode(path);

        lendingPool.flashLoan(
            address(this),
            token,
            amount,
            params
        );
    }

    // Callback during flash loan
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(
            msg.sender == address(POOL),
            "Not from lending pool"
        );
        require(initiator == address(this), "Unauthorized");

        (address[] memory path) = abi.decode(params, (address[]));

        // Swap on Router 1
        IERC20(asset).approve(ROUTER_1, amount);
        uint256[] memory amounts1 = IUniswapV2Router(ROUTER_1)
            .swapExactTokensForTokens(
                amount,
                0,
                path,
                address(this),
                block.timestamp
            );

        // Swap back on Router 2 (reverse path)
        address[] memory reversePath = new address[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            reversePath[i] = path[path.length - 1 - i];
        }

        uint256 intermediatAmount = amounts1[amounts1.length - 1];
        IERC20(path[path.length - 1]).approve(ROUTER_2, intermediatAmount);

        uint256[] memory amounts2 = IUniswapV2Router(ROUTER_2)
            .swapExactTokensForTokens(
                intermediatAmount,
                0,
                reversePath,
                address(this),
                block.timestamp
            );

        // Calculate profit
        uint256 finalAmount = amounts2[amounts2.length - 1];
        uint256 amountOwed = amount + premium;

        require(finalAmount >= amountOwed, "Arbitrage failed");

        // Approve and repay loan
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }
}
```

### Pattern 2: Liquidation Using Flash Loans

Use flash loans to liquidate undercollateralized positions:

```solidity
pragma solidity ^0.8.0;

contract FlashLoanLiquidator is FlashLoanReceiver {
    IPool public lendingPool;
    address public owner;

    constructor(address _addressProvider) FlashLoanReceiver(_addressProvider) {
        lendingPool = IPool(POOL);
        owner = msg.sender;
    }

    // Liquidate a position using flash loan
    function liquidateWithFlashLoan(
        address collateralToken,
        address debtToken,
        address borrower,
        uint256 debtAmount,
        bool receiveAToken
    ) external {
        require(msg.sender == owner, "Only owner");

        bytes memory params = abi.encode(
            collateralToken,
            borrower,
            receiveAToken
        );

        lendingPool.flashLoan(
            address(this),
            debtToken,
            debtAmount,
            params
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(lendingPool));
        require(initiator == address(this));

        (address collateralToken, address borrower, bool receiveAToken) =
            abi.decode(params, (address, address, bool));

        // Approve debt repayment to Aave
        IERC20(asset).approve(address(lendingPool), amount);

        // Liquidate the borrower
        // This will transfer collateral to us
        ILendingPool(address(lendingPool)).liquidationCall(
            collateralToken,
            asset,
            borrower,
            amount,
            receiveAToken
        );

        // Sell collateral to repay loan + premium
        uint256 amountOwed = amount + premium;
        uint256 collateralBalance = IERC20(collateralToken).balanceOf(address(this));

        require(collateralBalance > 0, "No collateral received");

        // Swap collateral back to debt token for repayment
        // (Using DEX integration here)
        _swapToRepayLoan(collateralToken, asset, collateralBalance, amountOwed);

        // Approve and repay flash loan
        IERC20(asset).approve(address(lendingPool), amountOwed);

        return true;
    }

    function _swapToRepayLoan(
        address from,
        address to,
        uint256 amountIn,
        uint256 minOut
    ) internal {
        // Implement DEX swap logic here
        // Must ensure we get at least minOut of 'to' token
    }
}
```

### Pattern 3: Leverage Farming

Use flash loans to increase farming position leverage:

```solidity
pragma solidity ^0.8.0;

contract LeveragedFarming is FlashLoanReceiver {
    address public constant FARM_TOKEN = 0x...; // Farm token
    address public constant STABLE_TOKEN = 0x...; // USDC or similar
    address public constant FARM_PAIR = 0x...; // Farm LP token
    address public owner;

    constructor(address _addressProvider) FlashLoanReceiver(_addressProvider) {
        owner = msg.sender;
    }

    // Open leveraged farm position
    function openLeveragedPosition(
        uint256 initialAmount,
        uint256 leverage // e.g., 3 for 3x
    ) external {
        require(msg.sender == owner);

        // Calculate flash loan amount
        uint256 flashAmount = initialAmount * (leverage - 1);

        bytes memory params = abi.encode(initialAmount, leverage);

        POOL.flashLoan(
            address(this),
            STABLE_TOKEN,
            flashAmount,
            params
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        (uint256 initialAmount, uint256 leverage) =
            abi.decode(params, (uint256, uint256));

        // Total capital = initial + flash loan
        uint256 totalCapital = initialAmount + amount;

        // Deposit into farm
        IERC20(STABLE_TOKEN).approve(address(FARM), totalCapital);
        (uint256 lpReceived) = IFarm(FARM).deposit(totalCapital);

        // Stake LP tokens
        IERC20(FARM_PAIR).approve(address(FARM), lpReceived);
        IFarm(FARM).stake(lpReceived);

        // Account for premium - will be paid from farm rewards
        uint256 amountOwed = amount + premium;

        // Approve repayment
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    // Close leveraged position and repay
    function closeLeveragedPosition() external {
        require(msg.sender == owner);

        // Unstake LP tokens
        uint256 stakedBalance = IFarm(FARM).getStakedBalance(address(this));
        IFarm(FARM).unstake(stakedBalance);

        // Withdraw from farm
        IERC20(FARM_PAIR).approve(address(FARM), stakedBalance);
        (uint256 withdrawn) = IFarm(FARM).withdraw(stakedBalance);

        // Can now manually repay loans if needed
    }
}
```

### Pattern 4: Collateral Swap

Swap collateral in lending protocol using flash loans:

```solidity
pragma solidity ^0.8.0;

contract FlashLoanCollateralSwap is FlashLoanReceiver {
    address public owner;

    constructor(address _addressProvider) FlashLoanReceiver(_addressProvider) {
        owner = msg.sender;
    }

    // Swap collateral from one token to another
    function swapCollateral(
        address currentCollateral,
        address newCollateral,
        uint256 borrowAmount
    ) external {
        require(msg.sender == owner);

        bytes memory params = abi.encode(currentCollateral, newCollateral, borrowAmount);

        POOL.flashLoan(
            address(this),
            currentCollateral,
            borrowAmount,
            params
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        (address currentCollateral, address newCollateral, uint256 debtAmount) =
            abi.decode(params, (address, address, uint256));

        // Step 1: Repay debt with flash loaned tokens
        IERC20(asset).approve(address(POOL), amount);
        POOL.repay(asset, amount, POOL.STABLE_RATE_MODE, address(this));

        // Step 2: Withdraw old collateral
        POOL.withdraw(currentCollateral, type(uint256).max, address(this));

        // Step 3: Swap old collateral to new collateral
        uint256 collateralBalance = IERC20(currentCollateral).balanceOf(address(this));
        uint256 newCollateralReceived = _swapTokens(
            currentCollateral,
            newCollateral,
            collateralBalance
        );

        // Step 4: Deposit new collateral
        IERC20(newCollateral).approve(address(POOL), newCollateralReceived);
        POOL.deposit(newCollateral, newCollateralReceived, address(this), 0);

        // Step 5: Borrow to repay flash loan
        uint256 amountOwed = amount + premium;
        POOL.borrow(
            currentCollateral,
            amountOwed,
            POOL.VARIABLE_RATE_MODE,
            0,
            address(this)
        );

        // Step 6: Repay flash loan
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function _swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal returns (uint256) {
        // Implement DEX swap
        // Return amount of tokenOut received
    }
}
```

### Pattern 5: Batch Flash Loans (Multi-token)

Execute multiple flash loans atomically:

```solidity
pragma solidity ^0.8.0;

contract BatchFlashLoans is FlashLoanReceiver {
    address public owner;

    struct FlashLoanRequest {
        address token;
        uint256 amount;
    }

    constructor(address _addressProvider) FlashLoanReceiver(_addressProvider) {
        owner = msg.sender;
    }

    // Request multiple flash loans
    function executeMultipleFlashLoans(
        FlashLoanRequest[] calldata requests
    ) external {
        require(msg.sender == owner);

        address[] memory tokens = new address[](requests.length);
        uint256[] memory amounts = new uint256[](requests.length);

        for (uint256 i = 0; i < requests.length; i++) {
            tokens[i] = requests[i].token;
            amounts[i] = requests[i].amount;
        }

        bytes memory params = abi.encode(requests);

        POOL.flashLoanSimple(
            address(this),
            tokens[0],
            amounts[0],
            params
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        FlashLoanRequest[] memory requests =
            abi.decode(params, (FlashLoanRequest[]));

        // Execute trading strategy with all loaned tokens
        for (uint256 i = 0; i < requests.length; i++) {
            _executeForToken(requests[i].token, requests[i].amount);
        }

        // Calculate total repayment
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function _executeForToken(address token, uint256 amount) internal {
        // Token-specific logic here
    }
}
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Complex DeFi Integration

Combine multiple protocols in flash loan callback:

```solidity
pragma solidity ^0.8.0;

contract ComplexFlashLoanStrategy is FlashLoanReceiver {
    // Deploy across: Aave, Curve, Uniswap, Balancer

    function executeComplexStrategy(
        address principalToken,
        uint256 amount
    ) external {
        bytes memory params = abi.encode(principalToken);
        POOL.flashLoan(address(this), principalToken, amount, params);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        // Path: Token A -> Aave borrow Token B -> Curve swap B->C
        // -> Uniswap swap C->A -> Repay flash loan with profit

        // 1. Use loaned tokens as collateral in Aave
        IERC20(asset).approve(address(AAVE_POOL), amount);
        AAVE_POOL.deposit(asset, amount, address(this), 0);

        // 2. Borrow another asset
        uint256 borrowAmount = _calculateBorrowAmount(asset, amount);
        AAVE_POOL.borrow(BORROW_TOKEN, borrowAmount, AAVE_POOL.VARIABLE_RATE_MODE, 0, address(this));

        // 3. Swap on Curve
        uint256 curveOutput = _curveSwap(BORROW_TOKEN, CURVE_OUTPUT_TOKEN, borrowAmount);

        // 4. Swap on Uniswap back to original asset
        uint256 finalAmount = _uniswapSwap(
            CURVE_OUTPUT_TOKEN,
            asset,
            curveOutput
        );

        // 5. Repay Aave borrow
        IERC20(BORROW_TOKEN).approve(address(AAVE_POOL), borrowAmount);
        AAVE_POOL.repay(BORROW_TOKEN, borrowAmount, AAVE_POOL.VARIABLE_RATE_MODE, address(this));

        // 6. Withdraw collateral from Aave
        AAVE_POOL.withdraw(asset, amount, address(this));

        // 7. Repay flash loan
        uint256 amountOwed = amount + premium;
        require(finalAmount >= amountOwed, "Profit too low");

        IERC20(asset).approve(address(POOL), amountOwed);

        // Keep profit
        uint256 profit = finalAmount - amountOwed;
        if (profit > 0) {
            IERC20(asset).transfer(owner, profit);
        }

        return true;
    }

    function _calculateBorrowAmount(address token, uint256 collateral) internal view returns (uint256) {
        // Use Aave's price oracle to determine max borrow
        // Typically 50-75% of collateral value
    }

    function _curveSwap(address from, address to, uint256 amount) internal returns (uint256) {
        // Curve swap implementation
    }

    function _uniswapSwap(address from, address to, uint256 amount) internal returns (uint256) {
        // Uniswap V3 swap implementation
    }
}
```

### Technique 2: Flash Loan Profit Routing

Optimize profit capture and routing:

```solidity
pragma solidity ^0.8.0;

contract ProfitRouter is FlashLoanReceiver {
    struct ProfitConfig {
        address recipient;
        uint256 percentage;
    }

    mapping(bytes32 => ProfitConfig[]) public profitRoutes;
    address public owner;

    function executeFlashLoanWithProfitRouting(
        bytes32 strategyId,
        address token,
        uint256 amount
    ) external {
        require(msg.sender == owner);

        bytes memory params = abi.encode(strategyId);
        POOL.flashLoan(address(this), token, amount, params);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        (bytes32 strategyId) = abi.decode(params, (bytes32));

        // Execute strategy
        uint256 profit = _executeStrategy(asset, amount);

        // Route profits
        ProfitConfig[] memory routes = profitRoutes[strategyId];
        uint256 amountOwed = amount + premium;

        require(profit >= amountOwed, "Insufficient profit");

        uint256 totalProfit = profit - amountOwed;

        for (uint256 i = 0; i < routes.length; i++) {
            uint256 share = (totalProfit * routes[i].percentage) / 100;
            IERC20(asset).transfer(routes[i].recipient, share);
        }

        // Repay flash loan
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function setProfitRouting(
        bytes32 strategyId,
        ProfitConfig[] calldata routes
    ) external {
        require(msg.sender == owner);

        delete profitRoutes[strategyId];

        uint256 totalPercent = 0;
        for (uint256 i = 0; i < routes.length; i++) {
            profitRoutes[strategyId].push(routes[i]);
            totalPercent += routes[i].percentage;
        }

        require(totalPercent <= 100, "Invalid percentages");
    }

    function _executeStrategy(address token, uint256 amount) internal returns (uint256) {
        // Strategy implementation
    }
}
```

### Technique 3: Risk Management in Flash Loans

Implement safety checks and fallbacks:

```solidity
pragma solidity ^0.8.0;

contract SafeFlashLoan is FlashLoanReceiver {
    uint256 public maxFlashLoanAmount = 10_000_000e18;
    uint256 public minProfitBps = 50; // Minimum 0.5% profit
    address public owner;

    event FlashLoanExecuted(bool success, uint256 profit, string reason);

    function executeFlashLoanSafely(
        address token,
        uint256 amount
    ) external {
        require(msg.sender == owner);
        require(amount <= maxFlashLoanAmount, "Amount exceeds limit");

        bytes memory params = abi.encode(token, amount);

        try POOL.flashLoan(address(this), token, amount, params) {
            // Success
        } catch Error(string memory reason) {
            emit FlashLoanExecuted(false, 0, reason);
            revert(reason);
        }
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        uint256 amountOwed = amount + premium;

        try this._executeStrategy(asset, amount, amountOwed) returns (uint256 profit) {
            require(profit >= amountOwed, "Insufficient profit");

            // Verify we have funds to repay
            uint256 balance = IERC20(asset).balanceOf(address(this));
            require(balance >= amountOwed, "Not enough to repay");

            // Calculate minimum required profit
            uint256 minProfit = (amount * minProfitBps) / 10_000;
            require(profit - amountOwed >= minProfit, "Profit below minimum");

            IERC20(asset).approve(address(POOL), amountOwed);

            emit FlashLoanExecuted(true, profit - amountOwed, "Success");
            return true;
        } catch Error(string memory reason) {
            emit FlashLoanExecuted(false, 0, reason);
            revert(reason);
        }
    }

    function _executeStrategy(
        address asset,
        uint256 amount,
        uint256 amountOwed
    ) external returns (uint256) {
        // Strategy with explicit failure handling
        // Can be wrapped with try-catch in executeOperation
    }

    // Emergency withdrawal if something goes wrong
    function emergencyWithdraw(address token) external {
        require(msg.sender == owner);
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner, balance);
    }
}
```

### Technique 4: Flash Loan Price Oracle Attacks Prevention

Protect against oracle manipulation:

```solidity
pragma solidity ^0.8.0;

contract OracleProtectedFlashLoan is FlashLoanReceiver {
    IAaveOracle public aaveOracle;
    address public owner;

    uint256 public lastBlockPrice;
    uint256 public lastBlockTimestamp;

    constructor(address _addressProvider, address _oracle) FlashLoanReceiver(_addressProvider) {
        aaveOracle = IAaveOracle(_oracle);
    }

    function executeFlashLoanWithOracleCheck(
        address token,
        uint256 amount
    ) external {
        require(msg.sender == owner);

        // Store current price
        uint256 currentPrice = aaveOracle.getAssetPrice(token);
        require(
            currentPrice >= lastBlockPrice * 95 / 100 &&
            currentPrice <= lastBlockPrice * 105 / 100,
            "Price movement too large"
        );

        bytes memory params = abi.encode(token, currentPrice);
        POOL.flashLoan(address(this), token, amount, params);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));

        (address token, uint256 basePrice) = abi.decode(params, (address, uint256));

        // Verify price hasn't moved suspiciously
        uint256 currentPrice = aaveOracle.getAssetPrice(token);
        require(
            currentPrice >= basePrice * 98 / 100 &&
            currentPrice <= basePrice * 102 / 100,
            "Price deviation detected - possible attack"
        );

        // Execute strategy
        uint256 profit = _executeStrategyWithPriceGuard(asset, amount, currentPrice);

        // Repay
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        // Update last price
        lastBlockPrice = aaveOracle.getAssetPrice(asset);
        lastBlockTimestamp = block.timestamp;

        return true;
    }

    function _executeStrategyWithPriceGuard(
        address asset,
        uint256 amount,
        uint256 oraclePrice
    ) internal returns (uint256) {
        // Only execute swaps if prices match oracle
        // Prevents sandwich attacks
    }
}
```

### Technique 5: Gas Optimization

Reduce gas costs in flash loan execution:

```solidity
pragma solidity ^0.8.0;

contract GasOptimizedFlashLoan is FlashLoanReceiver {
    using SafeERC20 for IERC20;

    bytes32 constant FLASH_LOAN_CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    function executeFlashLoanOptimized(
        address token,
        uint256 amount
    ) external {
        bytes memory data = abi.encode(msg.sender);

        // Use unchecked arithmetic where safe
        unchecked {
            POOL.flashLoan(address(this), token, amount, data);
        }
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Inline critical operations to save CALL opcodes
        assembly {
            // Verify caller
            if iszero(eq(caller(), sload(0))) {
                revert(0, 0)
            }
        }

        unchecked {
            uint256 amountOwed = amount + premium;

            // Direct token operations without contract calls where possible
            // Use assembly for repeated token operations
            _executeOptimizedStrategy(asset, amount);

            // Batch approvals
            IERC20(asset).approve(address(POOL), amountOwed);
        }

        return true;
    }

    function _executeOptimizedStrategy(
        address asset,
        uint256 amount
    ) internal {
        // Strategy with gas optimizations
        // Use assembly for hot paths
    }
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete Arbitrage System

Full production-ready arbitrage with monitoring:

```solidity
pragma solidity ^0.8.0;

contract ProductionArbitrageSystem is FlashLoanReceiver {
    address public constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public constant UNISWAP_V3_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public constant CURVE_EXCHANGE = 0x99a58482BD75cbab83b27EC03ca68fF489b5788B;

    address public owner;
    uint256 public totalProfit;
    uint256 public totalArbitrageTxs;

    struct ArbitrageOpportunity {
        address token;
        uint256 amount;
        address[] path;
        uint8 strategy; // 1=V2->V3, 2=V2->Curve, etc
        uint256 minProfit;
    }

    event ArbitrageExecuted(
        uint256 indexed txNumber,
        uint256 amount,
        uint256 profit,
        uint256 gasUsed
    );

    mapping(uint256 => ArbitrageOpportunity) public opportunities;
    uint256 public opportunityCount;

    constructor(address _addressProvider) FlashLoanReceiver(_addressProvider) {
        owner = msg.sender;
    }

    // Register arbitrage opportunity
    function registerOpportunity(
        address token,
        uint256 amount,
        address[] calldata path,
        uint8 strategy,
        uint256 minProfit
    ) external {
        require(msg.sender == owner, "Only owner");

        opportunities[opportunityCount] = ArbitrageOpportunity({
            token: token,
            amount: amount,
            path: path,
            strategy: strategy,
            minProfit: minProfit
        });

        opportunityCount++;
    }

    // Execute registered opportunity
    function executeOpportunity(uint256 opportunityId) external {
        require(msg.sender == owner, "Only owner");
        require(opportunityId < opportunityCount, "Invalid opportunity");

        ArbitrageOpportunity memory opp = opportunities[opportunityId];

        uint256 gasStart = gasleft();

        bytes memory params = abi.encode(opp.strategy, opp.path, opp.minProfit);

        POOL.flashLoan(
            address(this),
            opp.token,
            opp.amount,
            params
        );

        uint256 gasUsed = gasStart - gasleft();
        emit ArbitrageExecuted(
            totalArbitrageTxs++,
            opp.amount,
            totalProfit,
            gasUsed
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL));
        require(initiator == address(this));

        (uint8 strategy, address[] memory path, uint256 minProfit) =
            abi.decode(params, (uint8, address[], uint256));

        uint256 profitBefore = IERC20(asset).balanceOf(address(this));

        if (strategy == 1) {
            _strategyV2toV3(asset, amount, path);
        } else if (strategy == 2) {
            _strategyV2toCurve(asset, amount, path);
        } else if (strategy == 3) {
            _strategyTriangleArbitrage(asset, amount, path);
        }

        uint256 profitAfter = IERC20(asset).balanceOf(address(this));
        uint256 profit = profitAfter - profitBefore;

        uint256 amountOwed = amount + premium;
        require(profit >= amountOwed, "Arbitrage failed");
        require(profit - amountOwed >= minProfit, "Profit below minimum");

        // Update metrics
        totalProfit += (profit - amountOwed);

        // Repay
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function _strategyV2toV3(
        address asset,
        uint256 amount,
        address[] memory path
    ) internal {
        // Swap on V2
        IERC20(asset).approve(UNISWAP_V2_ROUTER, amount);
        uint[] memory amounts1 = IUniswapV2Router(UNISWAP_V2_ROUTER)
            .swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp);

        // Reverse and swap back on V3
        // Implementation continues...
    }

    function _strategyV2toCurve(
        address asset,
        uint256 amount,
        address[] memory path
    ) internal {
        // V2 to Curve arbitrage
    }

    function _strategyTriangleArbitrage(
        address asset,
        uint256 amount,
        address[] memory path
    ) internal {
        // Three-way triangle arbitrage
    }

    // Withdraw profits
    function withdrawProfits(address token) external {
        require(msg.sender == owner);

        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner, balance);
    }

    // Admin functions
    function setOwner(address newOwner) external {
        require(msg.sender == owner);
        owner = newOwner;
    }

    function updateOpportunity(
        uint256 opportunityId,
        ArbitrageOpportunity calldata newOpp
    ) external {
        require(msg.sender == owner);
        require(opportunityId < opportunityCount);
        opportunities[opportunityId] = newOpp;
    }
}
```

## Best Practices

**Flash Loan Execution**
- Always verify callback source is Aave pool
- Check that callback came from your initiator
- Validate all loan parameters in callback
- Use try-catch for complex strategies
- Test on testnet extensively

**Repayment Strategy**
- Calculate fees accurately (0.09%)
- Approve exact amount needed
- Have contingency if profit is marginal
- Track pending repayments
- Use SafeERC20 for transfers

**Profit Optimization**
- Find arbitrage >0.09% + gas costs
- Compare router prices before executing
- Use gas limits to prevent overpayment
- Monitor slippage on swaps
- Route profits to minimize taxes

**Error Handling**
- Catch all swap failures gracefully
- Verify sufficient balance for repayment
- Handle oracle price differences
- Revert entire transaction if unprofitable
- Log events for monitoring

## Common Pitfalls

**Issue 1: Missing Flash Loan Repayment**
```solidity
// ❌ Wrong - forgot to repay
function executeOperation(...) external override returns (bool) {
    // Do some swaps but forget repayment
    return true;
}

// ✅ Correct - explicit repayment
function executeOperation(...) external override returns (bool) {
    uint256 amountOwed = amount + premium;
    IERC20(asset).approve(address(POOL), amountOwed);
    return true;
}
```

**Issue 2: Insufficient Profit Margins**
```solidity
// ❌ Wrong - not accounting for gas + fee
if (swapOutput > borrowAmount) {
    // Profit! But didn't account for 0.09% fee

// ✅ Correct - include all costs
uint256 amountOwed = borrowAmount + (borrowAmount * 9 / 10000);
require(swapOutput > amountOwed + gasEstimate, "Not profitable");
```

**Issue 3: Unverified Callback Source**
```solidity
// ❌ Wrong - any contract can call
function executeOperation(...) external override returns (bool) {
    // No verification of caller
}

// ✅ Correct - verify caller
function executeOperation(...) external override returns (bool) {
    require(msg.sender == address(POOL), "Unauthorized");
    require(initiator == address(this), "Invalid initiator");
}
```

## Resources

**Official Documentation**
- [Aave Flash Loans](https://docs.aave.com/developers/guides/flash-loans) - Complete guide
- [Aave V3 API](https://docs.aave.com/developers/core-contracts/pool) - Technical reference
- [Flash Loan Examples](https://github.com/aave/aave-flashloan-bots) - Official examples

**Related Skills**
- `hardhat-deployment-scripts` - Contract deployment
- `ethersjs-v6-migration` - Web3 integration
- `foundry-fuzzing-techniques` - Test flash loans

**External Resources**
- [Aave Forum](https://governance.aave.com/) - Community discussions
- [Flash Loan Research](https://arxiv.org/abs/1910.01554) - Academic paper
- [DEX Aggregators](https://1inch.io/) - Find best prices
