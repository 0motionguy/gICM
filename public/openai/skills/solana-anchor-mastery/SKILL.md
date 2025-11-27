# Solana Anchor Mastery

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 34 tokens, expands to 5200 tokens

## Quick Reference (Load: 34 tokens)

Anchor is a framework for Solana programs that provides Rust macros for account validation, PDA derivation, and error handling.

**Core patterns:**
- `#[program]` - Define instruction handlers
- `#[account]` - Define account structures
- `#[derive(Accounts)]` - Validate instruction accounts
- `invoke_signed()` - CPI with PDA signatures

**Quick start:**
```bash
anchor init my_program
anchor build
anchor test
```

## Core Concepts (Expand: +500 tokens)

### Program Structure

Anchor programs consist of three main parts:
1. **Program module** - Instruction handlers marked with `#[program]`
2. **Account structs** - State storage marked with `#[account]`
3. **Context structs** - Account validation marked with `#[derive(Accounts)]`

### Account Validation

Anchor automatically validates accounts using constraints:
- `mut` - Account must be mutable
- `signer` - Account must sign transaction
- `has_one` - Enforce relationship between accounts
- `constraint` - Custom validation expression

### Program Derived Addresses (PDAs)

PDAs are addresses derived from seeds + program ID:
- Deterministic address generation
- No private key (program can sign)
- Used for program-owned accounts
- `bump` seed for canonical PDA

### Error Handling

Custom errors with descriptive messages:
```rust
#[error_code]
pub enum MyError {
    #[msg("Amount exceeds maximum")]
    AmountTooLarge,
}
```

## Common Patterns (Expand: +800 tokens)

### Pattern 1: Initialize State Account

Standard pattern for creating program state:

```rust
use anchor_lang::prelude::*;

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.bump = bump;
        state.counter = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + State::INIT_SPACE,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, State>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct State {
    pub authority: Pubkey,
    pub bump: u8,
    pub counter: u64,
}
```

**Key points:**
- `init` creates account and pays rent
- `payer` specifies who pays rent
- `space = 8 + State::INIT_SPACE` for discriminator + data
- Seeds define PDA derivation
- Bump stored for future transactions

### Pattern 2: Update State with Validation

Secure state updates with authority checks:

```rust
pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let state = &mut ctx.accounts.state;

    require!(
        state.counter < u64::MAX,
        MyError::CounterOverflow
    );

    state.counter = state.counter.checked_add(1)
        .ok_or(MyError::CounterOverflow)?;

    emit!(CounterIncremented {
        counter: state.counter,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump,
        has_one = authority
    )]
    pub state: Account<'info, State>,

    pub authority: Signer<'info>,
}

#[event]
pub struct CounterIncremented {
    pub counter: u64,
    pub timestamp: i64,
}
```

**Security features:**
- `has_one = authority` enforces ownership
- `checked_add()` prevents overflow
- `require!` macro for validation
- Event emission for indexing

### Pattern 3: Token Transfer with CPI

Cross-program invocation to Token program:

```rust
use anchor_spl::token::{self, Transfer, Token, TokenAccount};

pub fn transfer_tokens(
    ctx: Context<TransferTokens>,
    amount: u64
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.from_ata.to_account_info(),
        to: ctx.accounts.to_ata.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
```

**CPI essentials:**
- Build `CpiContext` with accounts
- Use anchor-spl for token operations
- No need for invoke_signed (signer present)

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: PDA Signing for CPIs

When program needs to sign on behalf of PDA:

```rust
pub fn transfer_from_vault(
    ctx: Context<TransferFromVault>,
    amount: u64
) -> Result<()> {
    let state = &ctx.accounts.state;
    let seeds = &[
        b"vault",
        state.authority.as_ref(),
        &[state.vault_bump]
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_ata.to_account_info(),
        to: ctx.accounts.user_ata.to_account_info(),
        authority: ctx.accounts.vault.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(
        cpi_program,
        cpi_accounts,
        signer
    );

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct TransferFromVault<'info> {
    #[account(
        seeds = [b"state"],
        bump = state.bump
    )]
    pub state: Account<'info, State>,

    /// CHECK: PDA signer
    #[account(
        seeds = [b"vault", state.authority.as_ref()],
        bump = state.vault_bump
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
```

**PDA signing workflow:**
1. Reconstruct seeds (must match derivation)
2. Include bump seed
3. Create signer slice: `&[&seeds[..]]`
4. Use `CpiContext::new_with_signer()`

### Technique 2: Realloc Pattern

Dynamically resize accounts:

```rust
pub fn add_item(ctx: Context<AddItem>, item: String) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.items.push(item);
    Ok(())
}

#[derive(Accounts)]
#[instruction(item: String)]
pub struct AddItem<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump,
        realloc = 8 + 32 + 1 + 4 + (state.items.len() + 1) * 36,
        realloc::payer = authority,
        realloc::zero = false
    )]
    pub state: Account<'info, State>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct State {
    pub authority: Pubkey,    // 32
    pub bump: u8,              // 1
    pub items: Vec<String>,    // 4 + n * 36
}
```

**Realloc considerations:**
- Calculate exact space needed
- `realloc::payer` pays rent difference
- `realloc::zero = false` for small increases
- Maximum 10KB increase per transaction

### Technique 3: Account Versioning

Handle schema upgrades gracefully:

```rust
#[account]
pub struct StateV2 {
    pub version: u8,
    pub authority: Pubkey,
    pub bump: u8,
    pub counter: u64,
    pub new_field: Option<Pubkey>, // Added in V2
}

impl StateV2 {
    pub fn migrate_from_v1(v1: StateV1) -> Self {
        Self {
            version: 2,
            authority: v1.authority,
            bump: v1.bump,
            counter: v1.counter,
            new_field: None,
        }
    }
}

pub fn migrate(ctx: Context<Migrate>) -> Result<()> {
    let old_data = ctx.accounts.state_v1.to_account_info().data.borrow();
    let v1: StateV1 = StateV1::try_deserialize(&mut &old_data[8..])?;
    drop(old_data);

    let state_v2 = &mut ctx.accounts.state_v2;
    *state_v2 = StateV2::migrate_from_v1(v1);

    Ok(())
}
```

### Technique 4: Zero-Copy Deserialization

Optimize large accounts with `zero_copy`:

```rust
#[account(zero_copy)]
pub struct LargeState {
    pub authority: Pubkey,
    pub data: [u64; 1000], // 8KB array
}

#[derive(Accounts)]
pub struct UpdateLarge<'info> {
    #[account(
        mut,
        seeds = [b"large"],
        bump
    )]
    pub state: AccountLoader<'info, LargeState>,
}

pub fn update_large(ctx: Context<UpdateLarge>, index: usize, value: u64) -> Result<()> {
    let mut state = ctx.accounts.state.load_mut()?;
    state.data[index] = value;
    Ok(())
}
```

**Zero-copy benefits:**
- No deserialization overhead
- Direct memory access
- Efficient for large arrays
- Use `AccountLoader` instead of `Account`

## Production Examples (Expand: +1500 tokens)

### Example 1: Token Launch with Bonding Curve

Complete token launch program with fair pricing:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};

declare_id!("Launch11111111111111111111111111111111111");

#[program]
pub mod token_launch {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        launch_params: LaunchParams,
        bump: u8,
    ) -> Result<()> {
        let launch = &mut ctx.accounts.launch;
        launch.authority = ctx.accounts.authority.key();
        launch.mint = ctx.accounts.mint.key();
        launch.bump = bump;
        launch.curve_type = launch_params.curve_type;
        launch.initial_price = launch_params.initial_price;
        launch.target_raise = launch_params.target_raise;
        launch.total_raised = 0;
        launch.total_supply = 0;

        Ok(())
    }

    pub fn buy(ctx: Context<Buy>, sol_amount: u64) -> Result<()> {
        let launch = &mut ctx.accounts.launch;

        // Calculate tokens based on bonding curve
        let tokens_to_mint = calculate_tokens(
            launch.curve_type,
            launch.total_supply,
            sol_amount,
            launch.initial_price,
        )?;

        // Transfer SOL to vault
        let cpi_accounts = anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_lang::system_program::transfer(cpi_ctx, sol_amount)?;

        // Mint tokens to buyer
        let seeds = &[
            b"launch",
            launch.mint.as_ref(),
            &[launch.bump]
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.buyer_ata.to_account_info(),
            authority: ctx.accounts.launch.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, tokens_to_mint)?;

        // Update state
        launch.total_raised = launch.total_raised
            .checked_add(sol_amount)
            .ok_or(LaunchError::Overflow)?;
        launch.total_supply = launch.total_supply
            .checked_add(tokens_to_mint)
            .ok_or(LaunchError::Overflow)?;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            sol_amount,
            tokens_minted: tokens_to_mint,
            total_raised: launch.total_raised,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Launch::INIT_SPACE,
        seeds = [b"launch", mint.key().as_ref()],
        bump
    )]
    pub launch: Account<'info, Launch>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(
        mut,
        seeds = [b"launch", mint.key().as_ref()],
        bump = launch.bump,
    )]
    pub launch: Account<'info, Launch>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// CHECK: PDA vault
    #[account(
        mut,
        seeds = [b"vault", launch.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub buyer_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Launch {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub bump: u8,
    pub curve_type: CurveType,
    pub initial_price: u64,
    pub target_raise: u64,
    pub total_raised: u64,
    pub total_supply: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum CurveType {
    Linear,
    Exponential,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct LaunchParams {
    pub curve_type: CurveType,
    pub initial_price: u64,
    pub target_raise: u64,
}

#[error_code]
pub enum LaunchError {
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Target raise exceeded")]
    TargetExceeded,
}

#[event]
pub struct TokensPurchased {
    pub buyer: Pubkey,
    pub sol_amount: u64,
    pub tokens_minted: u64,
    pub total_raised: u64,
}

fn calculate_tokens(
    curve_type: CurveType,
    current_supply: u64,
    sol_amount: u64,
    initial_price: u64,
) -> Result<u64> {
    match curve_type {
        CurveType::Linear => {
            // tokens = sol / price
            Ok(sol_amount.checked_div(initial_price).unwrap_or(0))
        }
        CurveType::Exponential => {
            // Simplified: price increases with supply
            let adjusted_price = initial_price
                .checked_add(current_supply / 1_000_000)
                .unwrap_or(initial_price);
            Ok(sol_amount.checked_div(adjusted_price).unwrap_or(0))
        }
    }
}
```

### Example 2: NFT Staking Program

Stake NFTs to earn rewards:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::metadata::{Metadata, MetadataAccount};

declare_id!("Stake111111111111111111111111111111111111");

#[program]
pub mod nft_staking {
    use super::*;

    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        stake_account.owner = ctx.accounts.owner.key();
        stake_account.nft_mint = ctx.accounts.nft_mint.key();
        stake_account.staked_at = clock.unix_timestamp;
        stake_account.last_claimed = clock.unix_timestamp;
        stake_account.bump = ctx.bumps.stake_account;

        // Transfer NFT to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_nft_ata.to_account_info(),
            to: ctx.accounts.vault_nft_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, 1)?;

        emit!(NftStaked {
            owner: stake_account.owner,
            nft_mint: stake_account.nft_mint,
            timestamp: stake_account.staked_at,
        });

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        // Calculate rewards
        let time_staked = clock.unix_timestamp
            .checked_sub(stake_account.last_claimed)
            .ok_or(StakingError::InvalidTimestamp)?;

        let rewards = (time_staked as u64)
            .checked_mul(REWARD_RATE)
            .ok_or(StakingError::Overflow)?;

        require!(rewards > 0, StakingError::NoRewards);

        // Mint reward tokens
        let pool = &ctx.accounts.reward_pool;
        let seeds = &[
            b"reward_pool",
            &[pool.bump]
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.reward_mint.to_account_info(),
            to: ctx.accounts.owner_reward_ata.to_account_info(),
            authority: ctx.accounts.reward_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, rewards)?;

        stake_account.last_claimed = clock.unix_timestamp;

        emit!(RewardsClaimed {
            owner: stake_account.owner,
            amount: rewards,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [b"stake", nft_mint.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,

    pub nft_mint: Account<'info, Mint>,

    #[account(mut)]
    pub owner_nft_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_nft_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub staked_at: i64,
    pub last_claimed: i64,
    pub bump: u8,
}

const REWARD_RATE: u64 = 100; // tokens per second

#[error_code]
pub enum StakingError {
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("No rewards available")]
    NoRewards,
}
```

## Best Practices

**Account Validation**
- Always use `#[derive(Accounts)]` constraints
- Prefer `has_one` over manual checks
- Use `constraint` for complex validation
- Mark PDAs with appropriate seeds

**Security**
- Use `checked_*` arithmetic methods
- Validate all signer requirements
- Check account ownership
- Verify PDA derivation with bumps
- Emit events for important actions

**Performance**
- Use `zero_copy` for large accounts
- Minimize account size
- Batch related operations
- Cache clock/rent syscalls

**Error Handling**
- Define custom error types
- Use descriptive error messages
- Return `Result<()>` from all handlers
- Propagate errors with `?`

**Testing**
- Write comprehensive integration tests
- Test error conditions
- Verify account state changes
- Test CPI interactions

## Common Pitfalls

**Issue 1: Missing Bump Seeds**
```rust
// ❌ Wrong - bump not stored
#[account]
pub struct State {
    pub authority: Pubkey,
}

// ✅ Correct - bump persisted
#[account]
pub struct State {
    pub authority: Pubkey,
    pub bump: u8,
}
```
**Solution:** Always store bump seeds in state accounts for future PDA derivations.

**Issue 2: Incorrect Space Calculation**
```rust
// ❌ Wrong - space too small
#[account(
    init,
    space = 8 + 32, // Missing bump
)]

// ✅ Correct - use InitSpace
#[account]
#[derive(InitSpace)]
pub struct State {
    pub authority: Pubkey,
    pub bump: u8,
}

#[account(
    init,
    space = 8 + State::INIT_SPACE,
)]
```
**Solution:** Use `InitSpace` derive macro for automatic calculation.

**Issue 3: Arithmetic Overflow**
```rust
// ❌ Wrong - can panic
state.counter = state.counter + 1;

// ✅ Correct - safe arithmetic
state.counter = state.counter
    .checked_add(1)
    .ok_or(MyError::Overflow)?;
```
**Solution:** Always use checked arithmetic in production code.

**Issue 4: Account Reuse Attacks**
```rust
// ❌ Wrong - no account validation
pub struct Update<'info> {
    pub state: Account<'info, State>,
}

// ✅ Correct - enforce PDA derivation
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump
    )]
    pub state: Account<'info, State>,
}
```
**Solution:** Always validate account addresses with seeds/bumps.

## Resources

**Official Documentation**
- [Anchor Book](https://book.anchor-lang.com/) - Complete framework guide
- [Anchor API Reference](https://docs.rs/anchor-lang/) - Rust documentation
- [Solana Cookbook](https://solanacookbook.com/) - Practical examples

**Related Skills**
- `cross-program-invocations` - Advanced CPI patterns
- `anchor-macros-deep-dive` - Macro internals
- `solana-program-optimization` - Performance tuning
- `solana-program-testing` - Testing strategies

**External Resources**
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples) - Official examples
- [Solana Program Library](https://github.com/solana-labs/solana-program-library) - Standard programs
- [Neodyme Security Guide](https://github.com/neodyme-labs/solana-security-txt) - Security best practices
