# ERC-4626 Vault Implementation

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 38 tokens, expands to 6000 tokens

## Quick Reference (Load: 38 tokens)

ERC-4626 is a tokenized vault standard enabling composable yield strategies with standardized accounting.

**Core patterns:**
- `deposit()` / `mint()` - Add assets to vault
- `withdraw()` / `redeem()` - Remove assets from vault
- `previewDeposit()` / `previewRedeem()` - Calculate output without execution
- Share calculations - Proper ratio accounting
- Asset conversion - Assets to shares and vice versa

**Quick start:**
```solidity
contract MyVault is ERC4626, ERC20 {
    constructor(IERC20 asset)
        ERC4626(asset)
        ERC20("Vault", "VAULT") {}

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
```

## Core Concepts (Expand: +650 tokens)

### The Share Model

ERC-4626 uses a shares-to-assets ratio for accounting:

- **Shares**: ERC20 token representing vault ownership
- **Assets**: Underlying tokens deposited in vault
- **Ratio**: Shares = Assets / pricePerShare
- **Price per share**: (totalAssets / totalShares)

### Asset and Share Conversion

Converting between assets and shares requires proper ratio calculations:

```solidity
// Assets to shares
shares = assets * totalSupply / totalAssets

// Shares to assets
assets = shares * totalAssets / totalSupply
```

**Key principle:** More sophisticated vaults accumulate yield, increasing `totalAssets` while `totalSupply` stays constant, raising price per share.

### Preview Functions

ERC-4626 requires preview functions for off-chain calculations:

```solidity
// Before deposit, check how many shares you'll get
uint256 shares = vault.previewDeposit(amount);

// Before withdraw, check how many assets you'll get
uint256 assets = vault.previewWithdraw(amount);

// Before redemption, check assets for shares
uint256 assets = vault.previewRedeem(amount);

// Before mint, check assets needed
uint256 assets = vault.previewMint(amount);
```

**Always return previews with same logic as actual execution** (minus state changes).

### Slippage Protection

Previewed amounts may differ from execution amounts:

```solidity
uint256 expected = vault.previewDeposit(amount);
uint256 minShares = expected * 99 / 100; // Allow 1% slippage
vault.deposit(amount, minShares);
```

### Vault Strategies

Different vault implementations serve different purposes:

1. **Lending vaults** - Lend assets to earn interest
2. **AMM vaults** - Provide LP tokens for trading fees
3. **Staking vaults** - Stake assets for rewards
4. **Derivatives vaults** - Sell options or other derivatives
5. **Aggregator vaults** - Route to best performing strategy

## Common Patterns (Expand: +1200 tokens)

### Pattern 1: Simple Yield-Bearing Vault

Basic vault that accumulates yield:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleYieldVault is ERC4626, ERC20 {
    IERC20 private _asset;
    uint256 public totalYield;

    event YieldGenerated(uint256 amount);

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) ERC4626(asset_) ERC20(name_, symbol_) {
        _asset = asset_;
    }

    // Calculate total assets including generated yield
    function totalAssets() public view override returns (uint256) {
        return _asset.balanceOf(address(this)) + totalYield;
    }

    // Record yield generation (called by yield source)
    function recordYield(uint256 amount) external {
        totalYield += amount;
        emit YieldGenerated(amount);
    }

    // Preview functions with custom logic
    function previewDeposit(uint256 assets)
        public
        view
        override
        returns (uint256)
    {
        return _convertToShares(assets, MathRounding.Down);
    }

    function previewMint(uint256 shares)
        public
        view
        override
        returns (uint256)
    {
        return _convertToAssets(shares, MathRounding.Up);
    }

    function previewWithdraw(uint256 assets)
        public
        view
        override
        returns (uint256)
    {
        return _convertToShares(assets, MathRounding.Up);
    }

    function previewRedeem(uint256 shares)
        public
        view
        override
        returns (uint256)
    {
        return _convertToAssets(shares, MathRounding.Down);
    }

    // Internal conversion functions
    function _convertToShares(uint256 assets, MathRounding rounding)
        internal
        view
        returns (uint256)
    {
        uint256 total = totalAssets();
        uint256 supply = totalSupply();

        if (total == 0 || supply == 0) {
            return assets;
        }

        if (rounding == MathRounding.Down) {
            return (assets * supply) / total;
        } else {
            return ((assets * supply) + total - 1) / total;
        }
    }

    function _convertToAssets(uint256 shares, MathRounding rounding)
        internal
        view
        returns (uint256)
    {
        uint256 total = totalAssets();
        uint256 supply = totalSupply();

        if (supply == 0) {
            return shares;
        }

        if (rounding == MathRounding.Down) {
            return (shares * total) / supply;
        } else {
            return ((shares * total) + supply - 1) / supply;
        }
    }

    enum MathRounding { Down, Up }
}
```

**Pattern benefits:**
- Accumulates yield
- Proper share calculations
- Rounding strategies for security
- Preview functions aligned with execution

### Pattern 2: Lending Vault with Flash Loans

Vault depositing assets in lending protocol:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ILendingPool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
}

interface IAToken is IERC20 {
    function balanceOf(address user) external view returns (uint256);
}

contract LendingVault is ERC4626, ERC20 {
    ILendingPool public lendingPool;
    IAToken public aToken;
    IERC20 public asset;

    constructor(
        IERC20 asset_,
        ILendingPool lendingPool_,
        IAToken aToken_
    ) ERC4626(asset_) ERC20("Lending Vault", "lVAULT") {
        asset = asset_;
        lendingPool = lendingPool_;
        aToken = aToken_;

        // Approve lending pool
        asset_.approve(address(lendingPool), type(uint256).max);
    }

    function totalAssets() public view override returns (uint256) {
        // Balance of interest-bearing tokens (aTokens)
        return aToken.balanceOf(address(this));
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        // Transfer asset from caller
        asset.transferFrom(caller, address(this), assets);

        // Deposit to lending pool
        lendingPool.deposit(address(asset), assets, address(this), 0);

        // Emit deposit event
        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        // Withdraw from lending pool
        lendingPool.withdraw(address(asset), assets, receiver);

        // Emit withdrawal event
        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
```

**Key points:**
- Integration with external protocols
- Deposit/withdraw mirroring
- Interest-bearing token tracking
- Proper approval management

### Pattern 3: Staking Vault with Rewards

Vault staking assets and distributing rewards:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IStakingPool {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function claimRewards() external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract StakingVault is ERC4626, ERC20 {
    IStakingPool public stakingPool;
    IERC20 public asset;
    IERC20 public rewardToken;

    uint256 public lastRewardTime;
    uint256 public accumulatedRewards;

    event RewardsClaimed(uint256 amount);

    constructor(
        IERC20 asset_,
        IStakingPool stakingPool_,
        IERC20 rewardToken_
    ) ERC4626(asset_) ERC20("Staking Vault", "sVAULT") {
        asset = asset_;
        stakingPool = stakingPool_;
        rewardToken = rewardToken_;

        asset_.approve(address(stakingPool_), type(uint256).max);
    }

    function totalAssets() public view override returns (uint256) {
        // Staked balance plus accumulated rewards (valued in asset)
        uint256 staked = stakingPool.balanceOf(address(this));
        uint256 rewards = accumulatedRewards;
        return staked + rewards;
    }

    function claimRewards() external {
        uint256 claimed = stakingPool.claimRewards();
        accumulatedRewards += claimed;
        emit RewardsClaimed(claimed);
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        // Transfer asset from caller
        asset.transferFrom(caller, address(this), assets);

        // Stake in pool
        stakingPool.stake(assets);

        // Emit deposit event
        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        // Unstake from pool
        stakingPool.unstake(assets);

        // Transfer to receiver
        asset.transfer(receiver, assets);

        // Emit withdrawal event
        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
```

### Pattern 4: Multi-Strategy Rebalancing Vault

Distributes deposits across multiple strategies:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IVault {
    function deposit(uint256 amount, address to) external;
    function withdraw(uint256 amount, address to) external;
    function balanceOf(address account) external view returns (uint256);
}

contract MultiStrategyVault is ERC4626, ERC20 {
    IVault[] public strategies;
    uint256[] public allocations; // Percentages (sum to 100)
    IERC20 public asset;

    event StrategyAdded(address indexed strategy, uint256 allocation);
    event Rebalanced(uint256[] balances);

    constructor(IERC20 asset_)
        ERC4626(asset_)
        ERC20("Multi Strategy", "MULTI")
    {
        asset = asset_;
    }

    function totalAssets() public view override returns (uint256) {
        uint256 total = asset.balanceOf(address(this));

        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 balance = strategies[i].balanceOf(address(this));
            // Convert to asset value (simple 1:1 for this example)
            total += balance;
        }

        return total;
    }

    function addStrategy(IVault strategy, uint256 allocation) external {
        strategies.push(strategy);
        allocations.push(allocation);

        emit StrategyAdded(address(strategy), allocation);
    }

    function rebalance() external {
        uint256 total = totalAssets();

        // Withdraw from all strategies first
        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 balance = strategies[i].balanceOf(address(this));
            if (balance > 0) {
                strategies[i].withdraw(balance, address(this));
            }
        }

        // Re-deposit according to allocations
        uint256[] memory newBalances = new uint256[](strategies.length);

        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 amount = (total * allocations[i]) / 100;
            asset.approve(address(strategies[i]), amount);
            strategies[i].deposit(amount, address(this));
            newBalances[i] = amount;
        }

        emit Rebalanced(newBalances);
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        asset.transferFrom(caller, address(this), assets);

        // Allocate to strategies
        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 amount = (assets * allocations[i]) / 100;
            asset.approve(address(strategies[i]), amount);
            strategies[i].deposit(amount, address(this));
        }

        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        // Withdraw from strategies proportionally
        uint256 totalBalance = totalAssets();

        for (uint256 i = 0; i < strategies.length; i++) {
            uint256 strategyBalance = strategies[i].balanceOf(address(this));
            uint256 withdrawAmount = (assets * strategyBalance) / totalBalance;

            if (withdrawAmount > 0) {
                strategies[i].withdraw(withdrawAmount, address(this));
            }
        }

        asset.transfer(receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
```

## Advanced Techniques (Expand: +1500 tokens)

### Technique 1: Flash Loan Resistant Vault

Protected against flash loan attacks:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FlashLoanResistantVault is ERC4626, ERC20 {
    IERC20 public asset;
    uint256 private _lockedProfit;
    uint256 private _lastUpdate;
    uint256 public constant LOCK_TIME = 1 days;

    constructor(IERC20 asset_)
        ERC4626(asset_)
        ERC20("Flash Safe Vault", "FSAFE")
    {
        asset = asset_;
    }

    function totalAssets() public view override returns (uint256) {
        // Gradually unlock profit to prevent flash loan attacks
        uint256 timeElapsed = block.timestamp - _lastUpdate;
        uint256 unlockedProfit = 0;

        if (timeElapsed > 0 && _lockedProfit > 0) {
            unlockedProfit = (_lockedProfit * timeElapsed) / LOCK_TIME;
            if (unlockedProfit > _lockedProfit) {
                unlockedProfit = _lockedProfit;
            }
        }

        return asset.balanceOf(address(this)) + unlockedProfit;
    }

    function recordProfit(uint256 profitAmount) external {
        _lockedProfit += profitAmount;
        _lastUpdate = block.timestamp;
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        asset.transferFrom(caller, address(this), assets);
        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        asset.transfer(receiver, assets);
        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
```

**Protection mechanism:**
- Profit locked for time period
- Linearly unlocked over `LOCK_TIME`
- Prevents price manipulation in single block

### Technique 2: Fee-Bearing Vault

Vault taking fees on yield:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FeeVault is ERC4626, ERC20 {
    IERC20 public asset;

    uint256 public performanceFee = 200; // 2%
    uint256 public constant MAX_FEE = 10000; // 100%
    address public feeRecipient;
    uint256 public accumulatedFees;

    event FeesWithdrawn(uint256 amount);

    constructor(IERC20 asset_, address feeRecipient_)
        ERC4626(asset_)
        ERC20("Fee Vault", "FVAULT")
    {
        asset = asset_;
        feeRecipient = feeRecipient_;
    }

    function totalAssets() public view override returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function setPerformanceFee(uint256 newFee) external {
        require(newFee <= MAX_FEE, "Fee too high");
        performanceFee = newFee;
    }

    function withdrawFees() external {
        require(msg.sender == feeRecipient, "Only fee recipient");

        uint256 fees = accumulatedFees;
        accumulatedFees = 0;

        asset.transfer(feeRecipient, fees);
        emit FeesWithdrawn(fees);
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        asset.transferFrom(caller, address(this), assets);
        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        // Calculate and deduct performance fee
        uint256 fee = (assets * performanceFee) / MAX_FEE;
        accumulatedFees += fee;

        asset.transfer(receiver, assets - fee);
        emit Withdraw(caller, receiver, owner, assets - fee, shares);
    }

    function previewWithdraw(uint256 assets)
        public
        view
        override
        returns (uint256)
    {
        uint256 fee = (assets * performanceFee) / MAX_FEE;
        uint256 assetsAfterFee = assets - fee;
        return _convertToShares(assetsAfterFee, MathRounding.Up);
    }

    function previewRedeem(uint256 shares)
        public
        view
        override
        returns (uint256)
    {
        uint256 assets = _convertToAssets(shares, MathRounding.Down);
        uint256 fee = (assets * performanceFee) / MAX_FEE;
        return assets - fee;
    }

    enum MathRounding { Down, Up }

    function _convertToShares(uint256 assets, MathRounding rounding)
        internal
        view
        returns (uint256)
    {
        uint256 total = totalAssets();
        uint256 supply = totalSupply();

        if (total == 0 || supply == 0) return assets;

        return (assets * supply) / (rounding == MathRounding.Down ? total : total + 1);
    }

    function _convertToAssets(uint256 shares, MathRounding rounding)
        internal
        view
        returns (uint256)
    {
        uint256 total = totalAssets();
        uint256 supply = totalSupply();

        if (supply == 0) return shares;

        return (shares * total) / (rounding == MathRounding.Down ? supply : supply + 1);
    }
}
```

### Technique 3: Adaptive Slippage Vault

Adjusts share pricing based on activity:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AdaptiveSlippageVault is ERC4626, ERC20 {
    IERC20 public asset;

    uint256 public baseSlippage = 100; // 1%
    uint256 public maxSlippage = 500; // 5%
    uint256 public lastDepositTime;
    uint256 public lastWithdrawTime;
    uint256 public depositVolume24h;
    uint256 public withdrawVolume24h;

    event SlippageApplied(uint256 amount);

    constructor(IERC20 asset_)
        ERC4626(asset_)
        ERC20("Adaptive Vault", "ADAPT")
    {
        asset = asset_;
    }

    function totalAssets() public view override returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function getCurrentSlippage() public view returns (uint256) {
        // Increase slippage if high volume
        uint256 totalVolume = depositVolume24h + withdrawVolume24h;
        if (totalVolume == 0) return baseSlippage;

        uint256 volumeRatio = (totalVolume * 10000) / totalAssets();
        uint256 additionalSlippage = (volumeRatio / 100); // 0.01% per 1% volume

        uint256 slippage = baseSlippage + additionalSlippage;
        return slippage > maxSlippage ? maxSlippage : slippage;
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        asset.transferFrom(caller, address(this), assets);

        // Track deposit volume
        depositVolume24h += assets;
        lastDepositTime = block.timestamp;

        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        asset.transfer(receiver, assets);

        // Track withdrawal volume
        withdrawVolume24h += assets;
        lastWithdrawTime = block.timestamp;

        emit Withdraw(caller, receiver, owner, assets, shares);
    }

    function previewDeposit(uint256 assets)
        public
        view
        override
        returns (uint256)
    {
        uint256 slippage = getCurrentSlippage();
        uint256 slippageAmount = (assets * slippage) / 10000;
        return _convertToShares(assets - slippageAmount, MathRounding.Down);
    }

    enum MathRounding { Down, Up }

    function _convertToShares(uint256 assets, MathRounding rounding)
        internal
        view
        returns (uint256)
    {
        uint256 total = totalAssets();
        uint256 supply = totalSupply();

        if (total == 0 || supply == 0) return assets;

        return (assets * supply) / (rounding == MathRounding.Down ? total : total + 1);
    }
}
```

## Production Examples (Expand: +1600 tokens)

### Example 1: Complete Yield Farming Vault

Full implementation with reinvestment:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface ILiquidityPool {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getRewards() external;
    function balanceOf(address account) external view returns (uint256);
}

contract YieldFarmingVault is ERC4626, ERC20, Ownable {
    IERC20 public asset;
    ILiquidityPool public farm;
    IERC20 public rewardToken;
    IUniswapRouter public router;

    uint256 public lastHarvest;
    uint256 public harvestInterval = 1 days;
    uint256 public slippage = 100; // 1%

    event Harvest(uint256 rewardsAmount, uint256 assetsGenerated);
    event HarvestTriggered();

    constructor(
        IERC20 asset_,
        ILiquidityPool farm_,
        IERC20 rewardToken_,
        IUniswapRouter router_
    ) ERC4626(asset_) ERC20("Yield Farm Vault", "YFV") {
        asset = asset_;
        farm = farm_;
        rewardToken = rewardToken_;
        router = router_;

        asset.approve(address(farm), type(uint256).max);
        rewardToken.approve(address(router), type(uint256).max);
    }

    function totalAssets() public view override returns (uint256) {
        return farm.balanceOf(address(this));
    }

    function harvest() external onlyOwner {
        require(
            block.timestamp >= lastHarvest + harvestInterval,
            "Too soon"
        );

        // Claim rewards
        farm.getRewards();

        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        if (rewardBalance == 0) return;

        // Swap rewards to asset
        address[] memory path = new address[](2);
        path[0] = address(rewardToken);
        path[1] = address(asset);

        uint256 minAmount = (rewardBalance * (10000 - slippage)) / 10000;

        uint[] memory amounts = router.swapExactTokensForTokens(
            rewardBalance,
            minAmount,
            path,
            address(this),
            block.timestamp
        );

        uint256 assetsReceived = amounts[amounts.length - 1];

        // Re-deposit into farm
        farm.deposit(assetsReceived);

        lastHarvest = block.timestamp;
        emit Harvest(rewardBalance, assetsReceived);
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        asset.transferFrom(caller, address(this), assets);
        farm.deposit(assets);

        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        farm.withdraw(assets);
        asset.transfer(receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
```

### Example 2: Options Selling Vault

Vault selling covered calls for yield:

```solidity
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC4626/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IOptionsMarket {
    function sellCoveredCall(
        address underlying,
        uint256 amount,
        uint256 strikePrice,
        uint256 expiry
    ) external returns (uint256 premium);

    function settleOption(uint256 optionId) external;
}

contract CoveredCallVault is ERC4626, ERC20 {
    IERC20 public asset;
    IOptionsMarket public optionsMarket;

    uint256 public strikeMultiplier = 110; // 110% current price
    uint256 public constant DENOMINATOR = 100;

    uint256[] public activeOptions;

    event OptionSold(uint256 optionId, uint256 premium);
    event OptionSettled(uint256 optionId);

    constructor(
        IERC20 asset_,
        IOptionsMarket optionsMarket_
    ) ERC4626(asset_) ERC20("Covered Call Vault", "CCV") {
        asset = asset_;
        optionsMarket = optionsMarket_;

        asset.approve(address(optionsMarket_), type(uint256).max);
    }

    function totalAssets() public view override returns (uint256) {
        // Assets in vault plus pledged for calls
        uint256 balance = asset.balanceOf(address(this));

        for (uint256 i = 0; i < activeOptions.length; i++) {
            // In real implementation, track pledge amounts
        }

        return balance;
    }

    function sellCalls(uint256 amount, uint256 strikePrice, uint256 expiry)
        external
    {
        require(amount <= totalAssets(), "Insufficient assets");

        uint256 premium = optionsMarket.sellCoveredCall(
            address(asset),
            amount,
            strikePrice,
            expiry
        );

        emit OptionSold(activeOptions.length, premium);
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        asset.transferFrom(caller, address(this), assets);
        emit Deposit(caller, receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _approve(owner, caller, allowance(owner, caller) - shares);
        }

        asset.transfer(receiver, assets);
        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
```

## Best Practices

**Share Calculations**
- Use rounding up for withdrawals (conservative)
- Use rounding down for deposits (conservative)
- Handle edge cases when totalAssets or totalSupply is zero
- Always test with extreme ratios

**Integration**
- Preview functions must match execution logic exactly
- Handle decimal differences in underlying tokens
- Validate all external contract interactions
- Implement reentrancy guards for ERC20 transfers

**Security**
- Check slippage in peripheral contracts, not core vault
- Use checked arithmetic for all calculations
- Implement withdrawal queues for liquidity constraints
- Regular audits of strategy implementations

**Performance**
- Cache frequently accessed values
- Optimize conversion calculations
- Batch operations when possible
- Monitor gas costs per transaction

## Common Pitfalls

**Issue 1: Preview Mismatch**
```solidity
// ❌ Wrong - preview and execution differ
function previewDeposit(uint256 assets) public view returns (uint256) {
    return assets / 2; // Simple ratio
}

function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal {
    // But actual deposit uses different ratio
    _doSomethingComplicated();
}

// ✅ Correct - logic matches exactly
function previewDeposit(uint256 assets) public view returns (uint256) {
    return _convertToShares(assets, MathRounding.Down);
}

function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal {
    // Uses same _convertToShares logic
    // ... execution ...
}
```
**Solution:** Extract share calculations to internal functions used by both preview and execution.

**Issue 2: Rounding Errors**
```solidity
// ❌ Wrong - can lose value
uint256 shares = (assets * totalSupply()) / totalAssets();

// ✅ Correct - round conservatively
uint256 shares = ((assets * totalSupply()) + totalAssets() - 1) / totalAssets();
```
**Solution:** Always round down for deposits, up for withdrawals.

**Issue 3: Stale Price Data**
```solidity
// ❌ Wrong - uses outdated price
function totalAssets() public view returns (uint256) {
    return getCachedPrice() * amount;
}

// ✅ Correct - uses current state
function totalAssets() public view returns (uint256) {
    return asset.balanceOf(address(this)) + earnedYield();
}
```
**Solution:** Derive totalAssets from on-chain state, not cached values.

**Issue 4: Integer Overflow in Share Mint**
```solidity
// ❌ Wrong - can overflow
uint256 shares = (assets * totalSupply()) / totalAssets();

// ✅ Correct - protect against overflow
require(assets < type(uint256).max / totalSupply(), "Overflow");
uint256 shares = (assets * totalSupply()) / totalAssets();
```
**Solution:** Validate math operations and use SafeMath for critical calculations.

## Resources

**Official Documentation**
- [ERC-4626 Standard](https://eips.ethereum.org/EIPS/eip-4626) - Full specification
- [OpenZeppelin ERC4626](https://docs.openzeppelin.com/contracts/4.x/erc4626) - Implementation guide
- [EIP-4626 Examples](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC4626) - Reference implementations

**Related Skills**
- `solidity-gas-optimization` - Vault optimization
- `smart-contract-security` - Security patterns
- `chainlink-automation-keepers` - Automation triggers
- `merkle-tree-airdrops` - Claim mechanisms

**External Resources**
- [Yearn Finance](https://github.com/yearn/yearn-vaults) - Production vault code
- [Aave aTokens](https://github.com/aave/aave-v3-core) - Lending vault reference
- [Opyn Vaults](https://github.com/opynfinance/squeeth-monorepo) - Options vault examples
