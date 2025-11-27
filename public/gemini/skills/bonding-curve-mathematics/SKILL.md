# Bonding Curve Mathematics

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Progressive disclosure skill: Quick reference in 36 tokens, expands to 4500 tokens

## Quick Reference (Load: 36 tokens)

Bonding curves define token price as a function of supply, enabling fair and transparent price discovery for token launches.

**Common curve types:**
- **Linear:** `price = basePrice + k * supply`
- **Exponential:** `price = basePrice * e^(k * supply)`
- **Constant Product:** `x * y = k` (Uniswap formula)
- **Sigmoid:** S-curve with price ceiling

**Quick calculation:**
```rust
// Linear bonding curve
pub fn calculate_price(supply: u64, base_price: u64, slope: u64) -> u64 {
    base_price + (slope * supply) / 1_000_000
}
```

## Core Concepts (Expand: +500 tokens)

### Price Discovery Mechanics

Bonding curves automatically adjust token price based on supply:
- **Buy pressure** → Price increases
- **Sell pressure** → Price decreases
- **No order books** → Instant liquidity
- **Deterministic pricing** → No slippage uncertainty

### Integral Calculus in Pricing

Total cost to purchase tokens involves integration:
- **Area under curve** = Total SOL needed
- **Definite integral** from current supply to target supply
- Numerical approximation for complex curves

### Slippage Calculation

Price impact of large purchases:
```
Slippage = (Final Price - Initial Price) / Initial Price
```

### Reserve Management

Bonding curve holds reserves:
- **Virtual reserves** vs. **actual reserves**
- **Backing ratio** = reserves / market cap
- Exit liquidity guarantees

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Linear Bonding Curve Implementation

Simplest curve with constant slope:

```rust
use anchor_lang::prelude::*;

#[account]
pub struct LinearCurve {
    pub base_price: u64,      // Starting price in lamports
    pub slope: u64,           // Price increase per token
    pub current_supply: u64,  // Tokens minted so far
    pub reserve_balance: u64, // SOL held in reserve
}

impl LinearCurve {
    pub fn calculate_buy_price(&self, amount: u64) -> Result<u64> {
        // Price = basePrice + slope * supply
        // Cost = integral from supply to supply+amount
        // Cost = amount * (2 * basePrice + slope * (2 * supply + amount)) / 2

        let current_supply = self.current_supply;
        let new_supply = current_supply
            .checked_add(amount)
            .ok_or(BondingError::Overflow)?;

        // Average price calculation
        let start_price = self.base_price
            .checked_add(
                self.slope
                    .checked_mul(current_supply)
                    .ok_or(BondingError::Overflow)?
                    / 1_000_000
            )
            .ok_or(BondingError::Overflow)?;

        let end_price = self.base_price
            .checked_add(
                self.slope
                    .checked_mul(new_supply)
                    .ok_or(BondingError::Overflow)?
                    / 1_000_000
            )
            .ok_or(BondingError::Overflow)?;

        let average_price = (start_price + end_price) / 2;
        let total_cost = average_price
            .checked_mul(amount)
            .ok_or(BondingError::Overflow)?;

        Ok(total_cost)
    }

    pub fn calculate_sell_return(&self, amount: u64) -> Result<u64> {
        require!(
            amount <= self.current_supply,
            BondingError::InsufficientSupply
        );

        // Same formula as buy, but reversed
        let new_supply = self.current_supply - amount;

        let start_price = self.base_price + (self.slope * new_supply) / 1_000_000;
        let end_price = self.base_price + (self.slope * self.current_supply) / 1_000_000;

        let average_price = (start_price + end_price) / 2;
        let total_return = average_price * amount;

        Ok(total_return)
    }

    pub fn execute_buy(&mut self, amount: u64, payment: u64) -> Result<()> {
        let required_payment = self.calculate_buy_price(amount)?;

        require!(
            payment >= required_payment,
            BondingError::InsufficientPayment
        );

        self.current_supply = self.current_supply
            .checked_add(amount)
            .ok_or(BondingError::Overflow)?;

        self.reserve_balance = self.reserve_balance
            .checked_add(payment)
            .ok_or(BondingError::Overflow)?;

        Ok(())
    }
}

#[error_code]
pub enum BondingError {
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Insufficient supply for sell")]
    InsufficientSupply,
    #[msg("Payment amount insufficient")]
    InsufficientPayment,
}
```

### Pattern 2: Constant Product (xy=k) Curve

Uniswap-style AMM formula:

```rust
#[account]
pub struct ConstantProductCurve {
    pub reserve_token: u64,  // Token reserve
    pub reserve_sol: u64,    // SOL reserve
    pub k: u128,             // Constant product
}

impl ConstantProductCurve {
    pub fn initialize(initial_token: u64, initial_sol: u64) -> Self {
        let k = (initial_token as u128)
            .checked_mul(initial_sol as u128)
            .unwrap();

        Self {
            reserve_token: initial_token,
            reserve_sol: initial_sol,
            k,
        }
    }

    pub fn get_amount_out(
        &self,
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
    ) -> Result<u64> {
        require!(amount_in > 0, BondingError::ZeroAmount);
        require!(reserve_in > 0 && reserve_out > 0, BondingError::InsufficientLiquidity);

        // Apply 0.3% fee
        let amount_in_with_fee = (amount_in as u128)
            .checked_mul(997)
            .ok_or(BondingError::Overflow)?;

        let numerator = amount_in_with_fee
            .checked_mul(reserve_out as u128)
            .ok_or(BondingError::Overflow)?;

        let denominator = (reserve_in as u128)
            .checked_mul(1000)
            .ok_or(BondingError::Overflow)?
            .checked_add(amount_in_with_fee)
            .ok_or(BondingError::Overflow)?;

        let amount_out = numerator
            .checked_div(denominator)
            .ok_or(BondingError::DivisionByZero)?;

        Ok(amount_out as u64)
    }

    pub fn swap_sol_for_tokens(&mut self, sol_in: u64) -> Result<u64> {
        let tokens_out = self.get_amount_out(
            sol_in,
            self.reserve_sol,
            self.reserve_token,
        )?;

        self.reserve_sol = self.reserve_sol
            .checked_add(sol_in)
            .ok_or(BondingError::Overflow)?;

        self.reserve_token = self.reserve_token
            .checked_sub(tokens_out)
            .ok_or(BondingError::InsufficientLiquidity)?;

        Ok(tokens_out)
    }

    pub fn calculate_slippage(&self, sol_in: u64) -> Result<u64> {
        let initial_price = self.get_price();
        let tokens_out = self.get_amount_out(sol_in, self.reserve_sol, self.reserve_token)?;

        let new_reserve_sol = self.reserve_sol + sol_in;
        let new_reserve_token = self.reserve_token - tokens_out;
        let final_price = (new_reserve_sol * 1_000_000) / new_reserve_token;

        let slippage = ((final_price as i128 - initial_price as i128) * 10000)
            / initial_price as i128;

        Ok(slippage.abs() as u64) // Return slippage in basis points
    }

    pub fn get_price(&self) -> u64 {
        (self.reserve_sol * 1_000_000) / self.reserve_token
    }
}
```

### Pattern 3: Exponential Curve with Cap

Price increases exponentially until target reached:

```rust
#[account]
pub struct ExponentialCurve {
    pub base_price: u64,
    pub growth_rate: u64,  // In basis points (100 = 1%)
    pub max_supply: u64,
    pub current_supply: u64,
    pub target_raise: u64,
    pub total_raised: u64,
}

impl ExponentialCurve {
    pub fn calculate_price(&self, supply: u64) -> Result<u64> {
        // price = base_price * (1 + growth_rate)^supply
        // Using approximation for efficiency

        let exponent = supply;
        let rate = self.growth_rate;

        // Simplified exponential: price = base * (1 + rate/10000)^supply
        let mut price = self.base_price;

        for _ in 0..exponent {
            price = price
                .checked_mul(10000 + rate)
                .ok_or(BondingError::Overflow)?
                / 10000;
        }

        Ok(price)
    }

    pub fn calculate_buy_cost(&self, amount: u64) -> Result<u64> {
        let mut total_cost = 0u64;

        for i in 0..amount {
            let supply = self.current_supply + i;
            let price = self.calculate_price(supply)?;
            total_cost = total_cost
                .checked_add(price)
                .ok_or(BondingError::Overflow)?;
        }

        Ok(total_cost)
    }

    pub fn check_graduation(&self) -> bool {
        self.total_raised >= self.target_raise
    }
}
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Sigmoid Curve for Soft Caps

S-shaped curve that approaches price ceiling:

```rust
pub fn sigmoid_price(supply: u64, max_price: u64, midpoint: u64, steepness: f64) -> u64 {
    // price = max_price / (1 + e^(-steepness * (supply - midpoint)))

    let x = (supply as f64 - midpoint as f64) * steepness;
    let exp_term = (-x).exp();
    let sigmoid = 1.0 / (1.0 + exp_term);

    (max_price as f64 * sigmoid) as u64
}
```

### Technique 2: Virtual Reserves for Stable Pricing

Add virtual reserves to prevent initial volatility:

```rust
#[account]
pub struct VirtualAMM {
    pub real_token_reserve: u64,
    pub real_sol_reserve: u64,
    pub virtual_token_reserve: u64,
    pub virtual_sol_reserve: u64,
}

impl VirtualAMM {
    pub fn get_effective_reserves(&self) -> (u64, u64) {
        (
            self.real_token_reserve + self.virtual_token_reserve,
            self.real_sol_reserve + self.virtual_sol_reserve,
        )
    }

    pub fn calculate_swap(&self, sol_in: u64) -> Result<u64> {
        let (token_reserve, sol_reserve) = self.get_effective_reserves();

        // Use virtual reserves for price calculation
        let tokens_out = self.get_amount_out(sol_in, sol_reserve, token_reserve)?;

        // Ensure we don't exceed real reserves
        require!(
            tokens_out <= self.real_token_reserve,
            BondingError::InsufficientLiquidity
        );

        Ok(tokens_out)
    }
}
```

### Technique 3: Price Oracle Integration

Fetch external prices for arbitrage protection:

```rust
use switchboard_v2::AggregatorAccountData;

pub fn validate_price_with_oracle(
    curve_price: u64,
    oracle_account: &AccountInfo,
    max_deviation: u64, // In basis points
) -> Result<()> {
    let aggregator = AggregatorAccountData::new(oracle_account)?;
    let oracle_price = aggregator.get_result()?.try_into()?;

    let deviation = if curve_price > oracle_price {
        ((curve_price - oracle_price) * 10000) / oracle_price
    } else {
        ((oracle_price - curve_price) * 10000) / oracle_price
    };

    require!(
        deviation <= max_deviation,
        BondingError::PriceDeviation
    );

    Ok(())
}
```

### Technique 4: MEV Protection with Commit-Reveal

Prevent frontrunning on bonding curve purchases:

```rust
#[account]
pub struct BuyCommitment {
    pub buyer: Pubkey,
    pub commitment_hash: [u8; 32],
    pub amount: u64,
    pub expiry: i64,
}

pub fn commit_buy(
    ctx: Context<CommitBuy>,
    commitment_hash: [u8; 32],
    amount: u64,
) -> Result<()> {
    let commitment = &mut ctx.accounts.commitment;
    let clock = Clock::get()?;

    commitment.buyer = ctx.accounts.buyer.key();
    commitment.commitment_hash = commitment_hash;
    commitment.amount = amount;
    commitment.expiry = clock.unix_timestamp + 60; // 60 second expiry

    Ok(())
}

pub fn reveal_and_execute(
    ctx: Context<RevealBuy>,
    secret: [u8; 32],
) -> Result<()> {
    let commitment = &ctx.accounts.commitment;
    let clock = Clock::get()?;

    // Verify not expired
    require!(
        clock.unix_timestamp <= commitment.expiry,
        BondingError::CommitmentExpired
    );

    // Verify hash
    let hash = solana_program::hash::hash(&secret);
    require!(
        hash.to_bytes() == commitment.commitment_hash,
        BondingError::InvalidSecret
    );

    // Execute buy at committed price
    let curve = &mut ctx.accounts.curve;
    curve.execute_buy(commitment.amount, ctx.accounts.buyer.lamports())?;

    Ok(())
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Complete Token Launch with Graduation

Full bonding curve program with LP graduation:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};

declare_id!("Curve111111111111111111111111111111111111");

#[program]
pub mod bonding_launch {
    use super::*;

    pub fn create_launch(
        ctx: Context<CreateLaunch>,
        params: LaunchParams,
    ) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        let clock = Clock::get()?;

        launch.creator = ctx.accounts.creator.key();
        launch.mint = ctx.accounts.mint.key();
        launch.curve_type = params.curve_type;
        launch.base_price = params.base_price;
        launch.slope = params.slope;
        launch.target_raise = params.target_raise;
        launch.current_supply = 0;
        launch.reserve_balance = 0;
        launch.is_graduated = false;
        launch.created_at = clock.unix_timestamp;
        launch.bump = ctx.bumps.launch;

        emit!(LaunchCreated {
            launch: launch.key(),
            creator: launch.creator,
            mint: launch.mint,
            target_raise: launch.target_raise,
        });

        Ok(())
    }

    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        token_amount: u64,
        max_sol: u64,
    ) -> Result<()> {
        let launch = &mut ctx.accounts.launch;

        require!(!launch.is_graduated, LaunchError::AlreadyGraduated);

        // Calculate cost
        let cost = launch.calculate_buy_price(token_amount)?;

        require!(cost <= max_sol, LaunchError::SlippageExceeded);

        // Transfer SOL to vault
        let cpi_accounts = anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts),
            cost,
        )?;

        // Mint tokens
        let seeds = &[
            b"launch",
            launch.mint.as_ref(),
            &[launch.bump],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.buyer_ata.to_account_info(),
                    authority: launch.to_account_info(),
                },
                signer,
            ),
            token_amount,
        )?;

        // Update state
        launch.current_supply += token_amount;
        launch.reserve_balance += cost;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            token_amount,
            sol_cost: cost,
            new_price: launch.get_current_price()?,
        });

        // Check for graduation
        if launch.reserve_balance >= launch.target_raise {
            launch.is_graduated = true;

            emit!(LaunchGraduated {
                launch: launch.key(),
                final_supply: launch.current_supply,
                total_raised: launch.reserve_balance,
            });
        }

        Ok(())
    }

    pub fn sell_tokens(
        ctx: Context<SellTokens>,
        token_amount: u64,
        min_sol: u64,
    ) -> Result<()> {
        let launch = &mut ctx.accounts.launch;

        require!(!launch.is_graduated, LaunchError::AlreadyGraduated);

        // Calculate return
        let sol_return = launch.calculate_sell_return(token_amount)?;

        require!(sol_return >= min_sol, LaunchError::SlippageExceeded);

        // Burn tokens
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.seller_ata.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        token::burn(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            token_amount,
        )?;

        // Transfer SOL from vault
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= sol_return;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += sol_return;

        // Update state
        launch.current_supply -= token_amount;
        launch.reserve_balance -= sol_return;

        emit!(TokensSold {
            seller: ctx.accounts.seller.key(),
            token_amount,
            sol_received: sol_return,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLaunch<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Launch::INIT_SPACE,
        seeds = [b"launch", mint.key().as_ref()],
        bump
    )]
    pub launch: Account<'info, Launch>,

    pub mint: Account<'info, Mint>,

    /// CHECK: PDA vault for SOL reserves
    #[account(
        seeds = [b"vault", launch.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Launch {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub curve_type: CurveType,
    pub base_price: u64,
    pub slope: u64,
    pub target_raise: u64,
    pub current_supply: u64,
    pub reserve_balance: u64,
    pub is_graduated: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl Launch {
    pub fn calculate_buy_price(&self, amount: u64) -> Result<u64> {
        match self.curve_type {
            CurveType::Linear => self.linear_buy_price(amount),
            CurveType::Exponential => self.exponential_buy_price(amount),
        }
    }

    fn linear_buy_price(&self, amount: u64) -> Result<u64> {
        let start_price = self.base_price + (self.slope * self.current_supply) / 1_000_000;
        let end_price = self.base_price + (self.slope * (self.current_supply + amount)) / 1_000_000;
        let avg_price = (start_price + end_price) / 2;
        Ok(avg_price * amount)
    }

    fn exponential_buy_price(&self, amount: u64) -> Result<u64> {
        let mut total = 0u64;
        for i in 0..amount {
            let supply = self.current_supply + i;
            let price = self.base_price + (self.slope * supply * supply) / 1_000_000_000_000;
            total = total.checked_add(price).ok_or(LaunchError::Overflow)?;
        }
        Ok(total)
    }

    pub fn get_current_price(&self) -> Result<u64> {
        Ok(self.base_price + (self.slope * self.current_supply) / 1_000_000)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum CurveType {
    Linear,
    Exponential,
}
```

## Best Practices

**Curve Selection**
- Linear for simple, predictable pricing
- Constant product for balanced liquidity
- Exponential for early adopter rewards
- Sigmoid for soft price caps

**Price Calculation**
- Use checked arithmetic everywhere
- Test with boundary values
- Account for precision loss
- Validate against overflow

**Reserve Management**
- Maintain backing ratio
- Separate virtual/real reserves
- Implement emergency withdrawals
- Audit reserve calculations

**Slippage Protection**
- Show estimated price impact
- Set reasonable max slippage
- Implement price limits
- Add transaction deadlines

## Common Pitfalls

**Issue 1: Precision Loss**
```rust
// ❌ Wrong - loses precision
let price = (base_price * supply) / 1000;

// ✅ Correct - use larger multiplier
let price = (base_price * supply) / 1_000_000;
```

**Issue 2: Overflow on Large Supplies**
```rust
// ❌ Wrong - can overflow
let cost = price * amount;

// ✅ Correct - checked multiplication
let cost = price.checked_mul(amount).ok_or(Error::Overflow)?;
```

**Issue 3: Integer Division Before Multiplication**
```rust
// ❌ Wrong - division truncates
let result = (a / b) * c;

// ✅ Correct - multiply first
let result = (a * c) / b;
```

## Resources

**Mathematical Foundations**
- [Bonding Curves Explained](https://yos.io/2018/11/10/bonding-curves/) - Theory and applications
- [Uniswap Whitepaper](https://uniswap.org/whitepaper.pdf) - Constant product formula

**Related Skills**
- `solana-anchor-mastery` - Smart contract implementation
- `jupiter-aggregator-integration` - DEX integration after graduation

**External Resources**
- [Desmos Bonding Curve Calculator](https://www.desmos.com/calculator) - Visualize curves
- [Pump.fun](https://pump.fun) - Production example
