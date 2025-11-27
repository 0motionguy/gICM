# Anchor Macros Deep Dive

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 42 tokens, expands to 5200 tokens

## Quick Reference (Load: 42 tokens)

Anchor macros automate account validation, PDA derivation, and serialization. Master #[account], #[derive(Accounts)], and custom constraints for secure, efficient programs.

**Core macros:**
- `#[program]` - Define instruction handlers
- `#[account]` - Account struct with discriminator
- `#[derive(Accounts)]` - Account validation context
- `#[error_code]` - Custom error types

**Quick example:**
```rust
#[account]
pub struct State {
    pub authority: Pubkey,
}
```

## Core Concepts (Expand: +650 tokens)

### Macro Categories

Anchor provides four main macro types:

**1. Program Macros**
- `#[program]` - Marks instruction handler module
- `declare_id!()` - Declares program ID

**2. Account Macros**
- `#[account]` - Account data structure
- `#[account(zero_copy)]` - Zero-copy accounts
- `#[derive(Accounts)]` - Validation context

**3. Constraint Macros**
- `init` - Initialize account
- `mut` - Mutable account
- `signer` - Must sign transaction
- `seeds` - PDA derivation
- `constraint` - Custom validation

**4. Utility Macros**
- `#[error_code]` - Error definitions
- `#[event]` - Event logging
- `#[constant]` - Program constants

### Account Discriminators

Anchor adds 8-byte discriminator to accounts:
```rust
// Discriminator = first 8 bytes of SHA256("account:MyAccount")
#[account]
pub struct MyAccount {
    pub data: u64,
}

// Space calculation: 8 (discriminator) + 8 (data) = 16 bytes
```

**Purpose:**
- Prevent account confusion
- Type safety at runtime
- Automatic deserialization
- Protection against wrong account types

### Account Validation Flow

Anchor validates accounts in this order:
1. **Ownership check** - Account owned by correct program
2. **Discriminator check** - Correct account type
3. **Constraint validation** - Custom constraints
4. **Deserialization** - Convert bytes to struct
5. **Post-validation** - Additional checks

### Constraint Resolution

Constraints are evaluated at compile-time and runtime:
- **Compile-time** - Type checking, syntax validation
- **Runtime** - PDA derivation, signer verification, balance checks

## Common Patterns (Expand: +1200 tokens)

### Pattern 1: Account Initialization

Complete account setup with all constraints:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + State::INIT_SPACE,
        seeds = [b"state", authority.key().as_ref()],
        bump
    )]
    pub state: Account<'info, State>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct State {
    pub authority: Pubkey,      // 32 bytes
    pub bump: u8,                // 1 byte
    pub counter: u64,            // 8 bytes
    #[max_len(50)]
    pub name: String,            // 4 + 50 bytes
}
// Total space: 8 + 32 + 1 + 8 + 54 = 103 bytes
```

**Key constraints:**
- `init` - Creates and initializes account
- `payer` - Who pays rent
- `space` - Account size in bytes
- `seeds` - PDA derivation seeds
- `bump` - Canonical bump seed

### Pattern 2: Account Validation with has_one

Enforce relationships between accounts:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateState<'info> {
    #[account(
        mut,
        seeds = [b"state"],
        bump = state.bump,
        has_one = authority,        // state.authority == authority.key()
        has_one = treasury,         // state.treasury == treasury.key()
    )]
    pub state: Account<'info, State>,

    pub authority: Signer<'info>,

    /// CHECK: Verified by has_one constraint
    pub treasury: UncheckedAccount<'info>,
}

#[account]
pub struct State {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub bump: u8,
}
```

**has_one benefits:**
- Automatic field comparison
- Clear security semantics
- No manual checking needed
- Compile-time field validation

### Pattern 3: Custom Constraints

Complex validation logic:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Transfer<'info> {
    #[account(
        mut,
        constraint = from.amount >= amount @ ErrorCode::InsufficientFunds,
        constraint = from.owner == authority.key() @ ErrorCode::Unauthorized,
    )]
    pub from: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = to.mint == from.mint @ ErrorCode::MintMismatch,
        constraint = to.key() != from.key() @ ErrorCode::SameAccount,
    )]
    pub to: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
}

#[account]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Mint mismatch")]
    MintMismatch,
    #[msg("Cannot transfer to same account")]
    SameAccount,
}
```

**Constraint syntax:**
- `constraint = <expr>` - Boolean expression
- `@ ErrorCode::Error` - Custom error message
- Access fields directly
- Use instruction parameters

### Pattern 4: Realloc Pattern

Dynamically resize accounts:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(new_item: String)]
pub struct AddItem<'info> {
    #[account(
        mut,
        seeds = [b"list", owner.key().as_ref()],
        bump = list.bump,
        realloc = 8 + 32 + 1 + 4 + (list.items.len() + 1) * (4 + 32),
        realloc::payer = owner,
        realloc::zero = false,
    )]
    pub list: Account<'info, ItemList>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct ItemList {
    pub owner: Pubkey,           // 32 bytes
    pub bump: u8,                // 1 byte
    pub items: Vec<String>,      // 4 + n * (4 + max_len) bytes
}
```

**Realloc constraints:**
- `realloc` - New size calculation
- `realloc::payer` - Who pays rent difference
- `realloc::zero` - Zero new memory
- Max 10KB increase per tx

### Pattern 5: Close Account Pattern

Properly close and reclaim rent:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseAccount<'info> {
    #[account(
        mut,
        close = receiver,           // Send rent to receiver
        has_one = authority,
    )]
    pub account: Account<'info, MyAccount>,

    pub authority: Signer<'info>,

    /// CHECK: Receives rent lamports
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,
}

#[account]
pub struct MyAccount {
    pub authority: Pubkey,
    pub data: u64,
}
```

**Close constraint:**
- Transfers all lamports to target
- Sets account data to zero
- Sets account owner to System Program
- Automatic in Anchor

## Advanced Techniques (Expand: +1600 tokens)

### Technique 1: Custom Account Wrapper

Create reusable account wrappers:

```rust
use anchor_lang::prelude::*;
use std::ops::{Deref, DerefMut};

// Custom wrapper for validated token accounts
#[derive(Clone)]
pub struct ValidatedTokenAccount<'info> {
    account: Account<'info, TokenAccount>,
}

impl<'info> ValidatedTokenAccount<'info> {
    pub fn new(account: Account<'info, TokenAccount>, expected_mint: Pubkey) -> Result<Self> {
        require_keys_eq!(account.mint, expected_mint, ErrorCode::InvalidMint);
        Ok(Self { account })
    }
}

impl<'info> Deref for ValidatedTokenAccount<'info> {
    type Target = Account<'info, TokenAccount>;

    fn deref(&self) -> &Self::Target {
        &self.account
    }
}

impl<'info> DerefMut for ValidatedTokenAccount<'info> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.account
    }
}

// Usage
#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    pub pool: Account<'info, Pool>,
}

impl<'info> Swap<'info> {
    pub fn validate(&self) -> Result<()> {
        // Wrap with validation
        let _validated_a = ValidatedTokenAccount::new(
            self.user_token_a.clone(),
            self.pool.mint_a,
        )?;

        let _validated_b = ValidatedTokenAccount::new(
            self.user_token_b.clone(),
            self.pool.mint_b,
        )?;

        Ok(())
    }
}
```

### Technique 2: Instruction Data Validation

Validate instruction parameters:

```rust
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransferParams {
    pub amount: u64,
    pub memo: String,
}

impl TransferParams {
    pub fn validate(&self) -> Result<()> {
        require!(self.amount > 0, ErrorCode::ZeroAmount);
        require!(self.amount <= 1_000_000_000, ErrorCode::AmountTooLarge);
        require!(self.memo.len() <= 100, ErrorCode::MemoTooLong);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(params: TransferParams)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
}

pub fn transfer(ctx: Context<Transfer>, params: TransferParams) -> Result<()> {
    // Validate parameters
    params.validate()?;

    // Process transfer
    ctx.accounts.from.amount -= params.amount;
    ctx.accounts.to.amount += params.amount;

    Ok(())
}
```

### Technique 3: Macro-Generated Getters

Use macros for cleaner code:

```rust
use anchor_lang::prelude::*;

macro_rules! impl_getters {
    ($struct_name:ident { $($field:ident: $type:ty),* }) => {
        impl $struct_name {
            $(
                pub fn $field(&self) -> $type {
                    self.$field
                }
            )*
        }
    };
}

#[account]
pub struct State {
    pub authority: Pubkey,
    pub counter: u64,
    pub enabled: bool,
}

impl_getters!(State {
    authority: Pubkey,
    counter: u64,
    enabled: bool
});

// Usage
pub fn check_state(state: &State) -> Result<()> {
    let counter = state.counter(); // Generated getter
    require!(counter < 1000, ErrorCode::CounterTooHigh);
    Ok(())
}
```

### Technique 4: Associated Token Account Constraints

Validate ATA derivation:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
pub struct InitializeUserATA<'info> {
    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_ata: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = from_authority,
    )]
    pub from_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = to_authority,
    )]
    pub to_ata: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub from_authority: Signer<'info>,

    /// CHECK: Just receiving tokens
    pub to_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}
```

**ATA constraints:**
- `associated_token::mint` - Token mint
- `associated_token::authority` - ATA owner
- Automatic PDA validation
- No manual address derivation needed

### Technique 5: Multi-Level PDA Derivation

Complex PDA hierarchies:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(game_id: u64, player_id: u64)]
pub struct InitializePlayerGame<'info> {
    // Global state PDA
    #[account(
        seeds = [b"global"],
        bump = global.bump,
    )]
    pub global: Account<'info, Global>,

    // Game PDA (nested under global)
    #[account(
        seeds = [b"game", global.key().as_ref(), &game_id.to_le_bytes()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    // Player PDA (nested under game)
    #[account(
        init,
        payer = authority,
        space = 8 + PlayerState::INIT_SPACE,
        seeds = [
            b"player",
            game.key().as_ref(),
            &player_id.to_le_bytes()
        ],
        bump
    )]
    pub player: Account<'info, PlayerState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Global {
    pub bump: u8,
    pub total_games: u64,
}

#[account]
pub struct Game {
    pub bump: u8,
    pub game_id: u64,
    pub total_players: u64,
}

#[account]
#[derive(InitSpace)]
pub struct PlayerState {
    pub bump: u8,
    pub player_id: u64,
    pub score: u64,
}
```

**Multi-level benefits:**
- Organized account hierarchy
- Predictable addresses
- Scoped relationships
- Easy enumeration

### Technique 6: Event Macros with Indexing

Structured event emission:

```rust
use anchor_lang::prelude::*;

#[event]
pub struct TokensSwapped {
    #[index]
    pub user: Pubkey,
    pub token_in: Pubkey,
    pub token_out: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub timestamp: i64,
}

#[event]
pub struct LimitOrderCreated {
    #[index]
    pub maker: Pubkey,
    #[index]
    pub order_id: u64,
    pub input_mint: Pubkey,
    pub output_mint: Pubkey,
    pub in_amount: u64,
    pub out_amount: u64,
}

pub fn swap(ctx: Context<Swap>, amount_in: u64, amount_out: u64) -> Result<()> {
    // Perform swap logic...

    // Emit event
    emit!(TokensSwapped {
        user: ctx.accounts.user.key(),
        token_in: ctx.accounts.token_a.mint,
        token_out: ctx.accounts.token_b.mint,
        amount_in,
        amount_out,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
```

**Event features:**
- `#[index]` - Indexed for filtering
- Automatic CPI logging
- Off-chain indexing support
- Efficient event parsing

## Production Examples (Expand: +1400 tokens)

### Example 1: Token Vesting with Complex Constraints

Full-featured vesting program:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Vest1111111111111111111111111111111111111");

#[program]
pub mod token_vesting {
    use super::*;

    pub fn create_vesting(
        ctx: Context<CreateVesting>,
        total_amount: u64,
        start_time: i64,
        end_time: i64,
        cliff_time: i64,
    ) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting;

        vesting.beneficiary = ctx.accounts.beneficiary.key();
        vesting.mint = ctx.accounts.mint.key();
        vesting.total_amount = total_amount;
        vesting.released_amount = 0;
        vesting.start_time = start_time;
        vesting.end_time = end_time;
        vesting.cliff_time = cliff_time;
        vesting.bump = ctx.bumps.vesting;

        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.funder_tokens.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.funder.to_account_info(),
                },
            ),
            total_amount,
        )?;

        emit!(VestingCreated {
            beneficiary: vesting.beneficiary,
            total_amount,
            start_time,
            end_time,
        });

        Ok(())
    }

    pub fn release(ctx: Context<Release>) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting;
        let clock = Clock::get()?;

        // Calculate vested amount
        let vested_amount = calculate_vested_amount(
            vesting.total_amount,
            vesting.start_time,
            vesting.end_time,
            vesting.cliff_time,
            clock.unix_timestamp,
        )?;

        let releasable = vested_amount
            .checked_sub(vesting.released_amount)
            .ok_or(ErrorCode::Overflow)?;

        require!(releasable > 0, ErrorCode::NothingToRelease);

        // Transfer from vault
        let seeds = &[
            b"vesting",
            vesting.beneficiary.as_ref(),
            vesting.mint.as_ref(),
            &[vesting.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.beneficiary_tokens.to_account_info(),
                    authority: ctx.accounts.vesting.to_account_info(),
                },
                signer,
            ),
            releasable,
        )?;

        vesting.released_amount += releasable;

        emit!(TokensReleased {
            beneficiary: vesting.beneficiary,
            amount: releasable,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(total_amount: u64, start_time: i64, end_time: i64, cliff_time: i64)]
pub struct CreateVesting<'info> {
    #[account(
        init,
        payer = funder,
        space = 8 + Vesting::INIT_SPACE,
        seeds = [
            b"vesting",
            beneficiary.key().as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        constraint = start_time < end_time @ ErrorCode::InvalidTimeRange,
        constraint = cliff_time >= start_time @ ErrorCode::InvalidCliff,
        constraint = cliff_time <= end_time @ ErrorCode::InvalidCliff,
    )]
    pub vesting: Account<'info, Vesting>,

    #[account(
        init_if_needed,
        payer = funder,
        associated_token::mint = mint,
        associated_token::authority = vesting,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub funder_tokens: Account<'info, TokenAccount>,

    /// CHECK: Beneficiary can be any account
    pub beneficiary: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub funder: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(
        mut,
        seeds = [
            b"vesting",
            vesting.beneficiary.as_ref(),
            vesting.mint.as_ref(),
        ],
        bump = vesting.bump,
        has_one = beneficiary,
        has_one = mint,
    )]
    pub vesting: Account<'info, Vesting>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vesting,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
    )]
    pub beneficiary_tokens: Account<'info, TokenAccount>,

    pub beneficiary: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Vesting {
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub cliff_time: i64,
    pub bump: u8,
}

#[event]
pub struct VestingCreated {
    pub beneficiary: Pubkey,
    pub total_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
}

#[event]
pub struct TokensReleased {
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid time range")]
    InvalidTimeRange,
    #[msg("Invalid cliff time")]
    InvalidCliff,
    #[msg("Nothing to release")]
    NothingToRelease,
    #[msg("Arithmetic overflow")]
    Overflow,
}

fn calculate_vested_amount(
    total: u64,
    start: i64,
    end: i64,
    cliff: i64,
    current: i64,
) -> Result<u64> {
    if current < cliff {
        return Ok(0);
    }

    if current >= end {
        return Ok(total);
    }

    let duration = end - start;
    let elapsed = current - start;

    let vested = (total as u128)
        .checked_mul(elapsed as u128)
        .and_then(|v| v.checked_div(duration as u128))
        .ok_or(ErrorCode::Overflow)?;

    Ok(vested as u64)
}
```

### Example 2: DAO Governance with Macro Patterns

Advanced governance implementation:

```rust
use anchor_lang::prelude::*;

#[program]
pub mod dao_governance {
    use super::*;

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        execution_delay: i64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let governance = &ctx.accounts.governance;

        proposal.id = governance.proposal_count;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.for_votes = 0;
        proposal.against_votes = 0;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.execution_delay = execution_delay;
        proposal.bump = ctx.bumps.proposal;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance.bump,
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [
            b"proposal",
            governance.key().as_ref(),
            &governance.proposal_count.to_le_bytes(),
        ],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        constraint = proposer_token.amount >= governance.min_tokens_to_propose @ ErrorCode::InsufficientTokens,
    )]
    pub proposer_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Governance {
    pub bump: u8,
    pub proposal_count: u64,
    pub min_tokens_to_propose: u64,
    pub voting_period: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub for_votes: u64,
    pub against_votes: u64,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub execution_delay: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    Executed,
}
```

## Best Practices

**Account Constraints**
- Use `has_one` instead of manual checks
- Add custom error messages to constraints
- Validate instruction parameters
- Use `#[derive(InitSpace)]` for automatic space calculation
- Store bump seeds in account data

**PDA Management**
- Use descriptive seed prefixes
- Include relevant identifiers in seeds
- Store bumps for canonical PDAs
- Document PDA derivation patterns
- Validate PDAs with seeds constraint

**Error Handling**
- Define custom error codes
- Use descriptive error messages
- Add error context with `@` syntax
- Return `Result<()>` from all handlers
- Use `require!` for validation

**Performance**
- Use `zero_copy` for large accounts
- Minimize account size with packing
- Cache syscall results
- Use `#[inline]` for hot paths
- Avoid unnecessary clones

**Security**
- Always validate signers
- Check account ownership
- Verify PDA derivation
- Use `has_one` for relationships
- Emit events for important actions

## Common Pitfalls

**Issue 1: Missing InitSpace Derive**
```rust
// ❌ Wrong - manual space calculation error-prone
#[account]
pub struct State {
    pub data: Vec<String>,
}
// space = 8 + 32 + ??? (hard to calculate)

// ✅ Correct - automatic calculation
#[account]
#[derive(InitSpace)]
pub struct State {
    #[max_len(10)]
    pub data: Vec<String>,
}
// space = 8 + State::INIT_SPACE
```

**Issue 2: Not Storing Bump Seeds**
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

**Issue 3: Incorrect Constraint Syntax**
```rust
// ❌ Wrong - missing @ error
#[account(
    constraint = amount > 0
)]

// ✅ Correct - with error
#[account(
    constraint = amount > 0 @ ErrorCode::ZeroAmount
)]
```

## Resources

**Official Documentation**
- [Anchor Book](https://book.anchor-lang.com/) - Complete guide
- [Anchor Macros](https://docs.rs/anchor-lang/latest/anchor_lang/attr.account.html) - Macro docs
- [Space Reference](https://www.anchor-lang.com/docs/space) - Account sizing

**Related Skills**
- `solana-anchor-mastery` - Framework basics
- `solana-program-optimization` - Performance tuning
- `cross-program-invocations` - CPI patterns

**External Resources**
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples) - Official examples
- [Anchor Discord](https://discord.gg/anchor) - Community support
- [Solana Cookbook](https://solanacookbook.com/) - Practical guides
