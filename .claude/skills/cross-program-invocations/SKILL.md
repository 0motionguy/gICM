---
name: cross-program-invocations
description: "Progressive disclosure skill: Quick reference in 35 tokens, expands to 4200 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [35, 4200]
---

# Cross-Program Invocations (CPI)

> Progressive disclosure skill: Quick reference in 35 tokens, expands to 4200 tokens

## Quick Reference (Load: 35 tokens)

CPI enables Solana programs to call other programs, enabling composability and DeFi protocols.

**Basic CPI pattern:**
```rust
use anchor_lang::prelude::*;

let cpi_accounts = Transfer {
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
};

let cpi_program = ctx.accounts.token_program.to_account_info();
let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

token::transfer(cpi_ctx, amount)?;
```

**PDA signing:**
```rust
let seeds = &[b"vault", &[bump]];
let signer = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer);
```

## Core Concepts (Expand: +500 tokens)

### Program Invocation Types

**invoke()** - Regular CPI without PDA signing:
- Requires actual signer in transaction
- Used when user signature needed
- Cannot sign on behalf of PDAs

**invoke_signed()** - CPI with PDA signing:
- Program signs using PDA seeds
- Enables program-controlled accounts
- Requires correct bump seed

### Account Passing

Accounts must be passed to invoked program:
- All accounts marked `mut` must be mutable
- Signer accounts must be signers
- Account ownership validated by invoked program
- Missing accounts cause transaction failure

### CpiContext Construction

Anchor provides CpiContext wrapper:
- `CpiContext::new()` - No PDA signing
- `CpiContext::new_with_signer()` - PDA signing
- Automatically handles account metadata
- Type-safe account passing

### Privilege Extension

CPIs extend caller privileges:
- Signer privileges pass through
- Writable privileges pass through
- Program ID checked for each CPI
- Prevents unauthorized calls

## Common Patterns (Expand: +850 tokens)

### Pattern 1: Token Transfer CPI

```rust
use anchor_spl::token::{self, Transfer, Token, TokenAccount};

pub fn transfer_tokens(ctx: Context<TransferCtx>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.from.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct TransferCtx<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}
```

### Pattern 2: PDA Authority Transfer

```rust
pub fn transfer_from_vault(
    ctx: Context<TransferFromVault>,
    amount: u64
) -> Result<()> {
    let state = &ctx.accounts.state;

    // Reconstruct PDA seeds
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
    pub state: Account<'info, State>,

    /// CHECK: PDA authority
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

#[account]
pub struct State {
    pub authority: Pubkey,
    pub vault_bump: u8,
}
```

### Pattern 3: Composing Multiple CPIs

```rust
pub fn swap_and_stake(
    ctx: Context<SwapAndStake>,
    amount_in: u64
) -> Result<()> {
    // Step 1: Swap tokens via Jupiter
    let swap_accounts = JupiterSwap {
        user: ctx.accounts.user.to_account_info(),
        // ... Jupiter accounts
    };

    let swap_ctx = CpiContext::new(
        ctx.accounts.jupiter_program.to_account_info(),
        swap_accounts
    );

    jupiter::swap(swap_ctx, amount_in)?;

    // Step 2: Stake received tokens
    let stake_accounts = StakeTokens {
        user: ctx.accounts.user.to_account_info(),
        stake_account: ctx.accounts.stake_account.to_account_info(),
        // ... stake accounts
    };

    let stake_ctx = CpiContext::new(
        ctx.accounts.stake_program.to_account_info(),
        stake_accounts
    );

    staking::stake(stake_ctx, /* amount from swap */)?;

    Ok(())
}
```

### Pattern 4: CPI to Custom Program

```rust
// Define external program interface
pub mod external_program {
    use anchor_lang::prelude::*;

    pub fn process_payment<'info>(
        ctx: CpiContext<'_, '_, '_, 'info, ProcessPayment<'info>>,
        amount: u64,
    ) -> Result<()> {
        let ix = Instruction {
            program_id: ctx.program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new(ctx.accounts.receiver.key(), false),
            ],
            data: PaymentInstruction { amount }.try_to_vec()?,
        };

        solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
            ],
        )?;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct ProcessPayment<'info> {
        pub payer: AccountInfo<'info>,
        pub receiver: AccountInfo<'info>,
    }
}

// Call external program
pub fn call_external(ctx: Context<CallExternal>, amount: u64) -> Result<()> {
    let cpi_accounts = external_program::ProcessPayment {
        payer: ctx.accounts.payer.to_account_info(),
        receiver: ctx.accounts.receiver.to_account_info(),
    };

    let cpi_program = ctx.accounts.external_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    external_program::process_payment(cpi_ctx, amount)?;
    Ok(())
}
```

## Advanced Techniques (Expand: +1100 tokens)

### Technique 1: Dynamic Account Passing

```rust
pub fn dynamic_cpi(
    ctx: Context<DynamicCpi>,
    account_indices: Vec<u8>
) -> Result<()> {
    let account_infos: Vec<AccountInfo> = account_indices
        .iter()
        .map(|&i| ctx.remaining_accounts[i as usize].clone())
        .collect();

    let ix = build_instruction(&account_infos)?;

    solana_program::program::invoke(
        &ix,
        &account_infos,
    )?;

    Ok(())
}
```

### Technique 2: CPI Return Data

```rust
pub fn call_with_return(ctx: Context<CallWithReturn>) -> Result<()> {
    // Make CPI call
    external::calculate(cpi_ctx, input)?;

    // Read return data
    let (program_id, return_data) = solana_program::program::get_return_data()
        .ok_or(ErrorCode::NoReturnData)?;

    require_eq!(
        program_id,
        ctx.accounts.external_program.key(),
        ErrorCode::InvalidReturnProgram
    );

    let result: u64 = u64::from_le_bytes(
        return_data.try_into().map_err(|_| ErrorCode::InvalidReturnData)?
    );

    msg!("CPI returned: {}", result);
    Ok(())
}
```

### Technique 3: Nested PDA Signing

```rust
pub fn nested_cpi(ctx: Context<NestedCpi>) -> Result<()> {
    let state = &ctx.accounts.state;

    // First level PDA
    let vault_seeds = &[
        b"vault",
        state.key().as_ref(),
        &[state.vault_bump]
    ];
    let vault_signer = &[&vault_seeds[..]];

    // Second level PDA (derived from first PDA)
    let inner_seeds = &[
        b"inner",
        ctx.accounts.vault.key().as_ref(),
        &[state.inner_bump]
    ];
    let inner_signer = &[&inner_seeds[..]];

    // Use inner PDA as signer
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        inner_signer
    );

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}
```

### Technique 4: Fallback CPI Handling

```rust
pub fn safe_cpi(ctx: Context<SafeCpi>, amount: u64) -> Result<()> {
    // Attempt primary action
    let result = token::transfer(
        cpi_ctx,
        amount
    );

    match result {
        Ok(_) => {
            msg!("CPI succeeded");
            Ok(())
        }
        Err(e) => {
            msg!("CPI failed: {:?}", e);

            // Execute fallback logic
            let fallback_result = execute_fallback(&ctx)?;

            require!(
                fallback_result,
                ErrorCode::FallbackFailed
            );

            Ok(())
        }
    }
}

fn execute_fallback(ctx: &Context<SafeCpi>) -> Result<bool> {
    // Implement fallback strategy
    msg!("Executing fallback");
    Ok(true)
}
```

## Production Examples (Expand: +1200 tokens)

### Example 1: Vault with Jupiter Integration

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Vault111111111111111111111111111111111111");

#[program]
pub mod vault_swap {
    use super::*;

    pub fn deposit_and_swap(
        ctx: Context<DepositAndSwap>,
        deposit_amount: u64,
        min_out: u64,
    ) -> Result<()> {
        // 1. Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token.to_account_info(),
                    to: ctx.accounts.vault_token.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            deposit_amount,
        )?;

        // 2. Swap via Jupiter using vault authority
        let vault = &ctx.accounts.vault;
        let seeds = &[
            b"vault",
            &[vault.bump]
        ];
        let signer = &[&seeds[..]];

        // Build Jupiter swap instruction
        let swap_accounts = vec![
            AccountMeta::new(ctx.accounts.vault_token.key(), false),
            AccountMeta::new(ctx.accounts.vault_output_token.key(), false),
            AccountMeta::new_readonly(vault.key(), true), // PDA signer
            // ... more Jupiter accounts
        ];

        let swap_ix = Instruction {
            program_id: ctx.accounts.jupiter_program.key(),
            accounts: swap_accounts,
            data: jupiter_swap_data(deposit_amount, min_out),
        };

        solana_program::program::invoke_signed(
            &swap_ix,
            &[
                ctx.accounts.vault_token.to_account_info(),
                ctx.accounts.vault_output_token.to_account_info(),
                vault.to_account_info(),
                ctx.accounts.jupiter_program.to_account_info(),
            ],
            signer,
        )?;

        emit!(SwapExecuted {
            user: ctx.accounts.user.key(),
            amount_in: deposit_amount,
            vault: vault.key(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositAndSwap<'info> {
    #[account(
        seeds = [b"vault"],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_output_token: Account<'info, TokenAccount>,

    pub user: Signer<'info>,

    /// CHECK: Jupiter program
    pub jupiter_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}

fn jupiter_swap_data(amount_in: u64, min_out: u64) -> Vec<u8> {
    // Build Jupiter instruction data
    // Implementation depends on Jupiter API version
    vec![]
}
```

### Example 2: Staking with Metaplex NFT CPI

```rust
use anchor_lang::prelude::*;
use mpl_token_metadata::instruction as mpl_instruction;

#[program]
pub mod nft_staking {
    use super::*;

    pub fn stake_nft(ctx: Context<StakeNft>) -> Result<()> {
        // Verify NFT is from correct collection via Metaplex CPI
        verify_collection_cpi(
            &ctx.accounts.metadata.to_account_info(),
            &ctx.accounts.collection_mint.to_account_info(),
            &ctx.accounts.collection_metadata.to_account_info(),
        )?;

        // Transfer NFT to stake vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_nft_account.to_account_info(),
            to: ctx.accounts.vault_nft_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts
            ),
            1,
        )?;

        // Create stake record
        let stake = &mut ctx.accounts.stake_account;
        stake.owner = ctx.accounts.user.key();
        stake.nft_mint = ctx.accounts.nft_mint.key();
        stake.staked_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

fn verify_collection_cpi(
    metadata: &AccountInfo,
    collection_mint: &AccountInfo,
    collection_metadata: &AccountInfo,
) -> Result<()> {
    // Call Metaplex to verify collection membership
    let ix = mpl_instruction::verify_collection(
        mpl_token_metadata::id(),
        *metadata.key,
        collection_authority.key(),
        payer.key(),
        *collection_mint.key,
        *collection_metadata.key,
        collection_master_edition.key(),
        None,
    );

    solana_program::program::invoke(
        &ix,
        &[
            metadata.clone(),
            collection_authority.clone(),
            // ... other accounts
        ],
    )?;

    Ok(())
}
```

## Best Practices

**Account Validation**
- Verify program IDs before CPI
- Check account ownership
- Validate PDA derivation
- Ensure mutable accounts are marked mut

**Error Handling**
- Handle CPI failures gracefully
- Provide meaningful error messages
- Log CPI failures for debugging
- Implement fallback strategies

**Security**
- Never trust external program data
- Validate all account relationships
- Check return values
- Prevent reentrancy attacks

**Performance**
- Minimize CPI depth (max 4 levels)
- Batch CPIs when possible
- Cache account data
- Reuse CpiContext when safe

## Common Pitfalls

**Issue 1: Missing Signer Seeds**
```rust
// ❌ Wrong - seeds not passed
let cpi_ctx = CpiContext::new(program, accounts);

// ✅ Correct - include signer seeds
let seeds = &[b"vault", &[bump]];
let signer = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer);
```

**Issue 2: Incorrect Bump**
```rust
// ❌ Wrong - hardcoded bump
let seeds = &[b"vault", &[255]];

// ✅ Correct - use stored canonical bump
let seeds = &[b"vault", &[state.bump]];
```

**Issue 3: Missing Account in CPI**
```rust
// ❌ Wrong - system_program missing
token::transfer(cpi_ctx, amount)?;

// ✅ Correct - include all required accounts
#[derive(Accounts)]
pub struct Transfer<'info> {
    // ... token accounts
    pub system_program: Program<'info, System>,
}
```

## Resources

**Official Documentation**
- [Solana CPI Documentation](https://docs.solana.com/developing/programming-model/calling-between-programs)
- [Anchor CPI Guide](https://book.anchor-lang.com/anchor_in_depth/CPIs.html)

**Related Skills**
- `solana-anchor-mastery` - Foundation for CPI
- `solana-program-optimization` - Optimize CPI calls

**External Resources**
- [Anchor SPL](https://github.com/coral-xyz/anchor/tree/master/spl) - CPI helpers
- [Program Examples](https://github.com/solana-labs/solana-program-library) - Production CPIs
