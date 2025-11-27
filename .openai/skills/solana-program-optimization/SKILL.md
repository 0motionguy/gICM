# Solana Program Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 40 tokens, expands to 5000 tokens

## Quick Reference (Load: 40 tokens)

Optimize Solana programs by reducing compute units, minimizing account size, and using zero-copy deserialization for maximum performance.

**Core techniques:**
- `Compute Units` - Reduce CU consumption below 200K
- `Zero-Copy` - Eliminate deserialization overhead
- `Account Packing` - Minimize account size and rent
- `Stack Optimization` - Reduce stack frame usage

**Quick check:**
```bash
solana program show --programs
anchor test -- --features test-bpf
```

## Core Concepts (Expand: +600 tokens)

### Compute Unit Budget

Every transaction has compute limits:
- **Default limit**: 200,000 CU per instruction
- **Max per transaction**: 1,400,000 CU
- **Stack depth**: 64 frames max
- **Heap size**: 32KB default, 256KB max
- **Account data**: 10MB per account

### Compute Unit Costs

Common operation costs:
- **Syscall**: ~100-1000 CU
- **SHA256 hash**: ~30 CU
- **ed25519 verify**: ~3,000 CU
- **secp256k1 recover**: ~25,000 CU
- **Account read**: ~CU varies by size
- **CPI call**: ~1,000 CU base

### Memory Layout

Efficient memory usage:
- **Stack**: Limited to 4KB per frame
- **Heap**: Dynamically allocated
- **Account data**: Direct BPF memory
- **Zero-copy**: Reference without allocation
- **Alignment**: 8-byte boundaries

### Performance Metrics

Key optimization targets:
- **Compute units used**: < 50% of limit
- **Account size**: Minimal for rent
- **Transaction size**: < 1232 bytes
- **Stack frames**: < 32 deep
- **Heap allocations**: Minimize

## Common Patterns (Expand: +1100 tokens)

### Pattern 1: Zero-Copy Accounts

Eliminate deserialization overhead:

```rust
use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};

#[account(zero_copy)]
#[repr(C)]
pub struct LargeAccount {
    pub authority: Pubkey,
    pub data: [u64; 1000], // 8KB array accessed directly
    pub metadata: [u8; 256],
}

// Implement Pod and Zeroable for zero-copy
unsafe impl Pod for LargeAccount {}
unsafe impl Zeroable for LargeAccount {}

#[derive(Accounts)]
pub struct UpdateLarge<'info> {
    #[account(mut)]
    pub account: AccountLoader<'info, LargeAccount>,
    pub authority: Signer<'info>,
}

pub fn update_large(ctx: Context<UpdateLarge>, index: usize, value: u64) -> Result<()> {
    let mut account = ctx.accounts.account.load_mut()?;

    // Direct memory access - no deserialization
    account.data[index] = value;

    Ok(())
}
```

**Benefits:**
- Zero deserialization cost
- Constant-time access
- Reduced compute units
- Better for large data structures

**When to use:**
- Arrays > 100 elements
- Frequent updates to large accounts
- Performance-critical paths
- High-throughput programs

### Pattern 2: Account Packing

Minimize account size and rent:

```rust
use anchor_lang::prelude::*;

// ❌ Inefficient - wastes space
#[account]
pub struct Inefficient {
    pub flag1: bool,        // 1 byte + 7 padding = 8 bytes
    pub value: u64,         // 8 bytes
    pub flag2: bool,        // 1 byte + 7 padding = 8 bytes
    pub small_value: u8,    // 1 byte + 7 padding = 8 bytes
}
// Total: 32 bytes (but only uses 11 bytes of data)

// ✅ Efficient - packed layout
#[account]
#[repr(C, packed)]
pub struct Efficient {
    pub value: u64,         // 8 bytes
    pub flag1: bool,        // 1 byte
    pub flag2: bool,        // 1 byte
    pub small_value: u8,    // 1 byte
    // padding added here if needed
}
// Total: 11 bytes (packed tightly)

// Or use bitflags for multiple booleans
#[account]
pub struct BitPacked {
    pub value: u64,         // 8 bytes
    pub flags: u8,          // 8 flags in 1 byte
    pub small_value: u8,    // 1 byte
}

impl BitPacked {
    pub fn get_flag(&self, index: u8) -> bool {
        (self.flags & (1 << index)) != 0
    }

    pub fn set_flag(&mut self, index: u8, value: bool) {
        if value {
            self.flags |= 1 << index;
        } else {
            self.flags &= !(1 << index);
        }
    }
}
```

### Pattern 3: Compute Unit Reduction

Optimize hot paths:

```rust
use anchor_lang::prelude::*;

// ❌ Inefficient - multiple syscalls
pub fn inefficient_transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    let clock = Clock::get()?; // Syscall
    let timestamp = clock.unix_timestamp;

    let clock2 = Clock::get()?; // Duplicate syscall!
    let slot = clock2.slot;

    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(amount < 1000000, ErrorCode::AmountTooLarge);

    // Multiple checks in sequence
    if ctx.accounts.from.amount < amount {
        return Err(ErrorCode::InsufficientFunds.into());
    }

    ctx.accounts.from.amount -= amount;
    ctx.accounts.to.amount += amount;

    Ok(())
}

// ✅ Efficient - optimized
pub fn efficient_transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    // Single syscall
    let clock = Clock::get()?;

    // Combined check using require!
    require!(
        amount > 0 && amount < 1000000 && ctx.accounts.from.amount >= amount,
        ErrorCode::InvalidTransfer
    );

    // Use checked_sub/checked_add to avoid extra checks
    ctx.accounts.from.amount = ctx.accounts.from.amount
        .checked_sub(amount)
        .ok_or(ErrorCode::Overflow)?;

    ctx.accounts.to.amount = ctx.accounts.to.amount
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    Ok(())
}
```

**Optimization techniques:**
- Cache syscall results
- Combine multiple checks
- Use checked arithmetic
- Minimize branching
- Avoid redundant operations

### Pattern 4: Stack Optimization

Reduce stack frame usage:

```rust
use anchor_lang::prelude::*;

// ❌ Heavy stack usage
pub fn heavy_stack(ctx: Context<Process>) -> Result<()> {
    let large_array = [0u8; 4096]; // 4KB on stack!
    let another = [0u64; 500];     // 4KB on stack!

    // Process data...

    Ok(())
}

// ✅ Optimized - use heap or references
pub fn light_stack(ctx: Context<Process>) -> Result<()> {
    // Allocate on heap instead
    let large_array = vec![0u8; 4096];

    // Or use account data directly (zero-copy)
    let account = &ctx.accounts.data.load()?;

    // Process data...

    Ok(())
}

// ✅ Best - use Box for large structs
#[derive(Clone)]
pub struct LargeStruct {
    data: [u8; 2048],
}

pub fn boxed_allocation(ctx: Context<Process>) -> Result<()> {
    // Allocate large struct on heap
    let large = Box::new(LargeStruct {
        data: [0u8; 2048],
    });

    // Use it...

    Ok(())
}
```

### Pattern 5: CPI Optimization

Efficient cross-program invocations:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// ❌ Inefficient CPI
pub fn inefficient_cpi(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    // Creating new CpiContext each time
    for i in 0..5 {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;
    }

    Ok(())
}

// ✅ Efficient CPI
pub fn efficient_cpi(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    // Batch the transfer into a single CPI
    let total_amount = amount.checked_mul(5).ok_or(ErrorCode::Overflow)?;

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    );

    token::transfer(cpi_ctx, total_amount)?;

    Ok(())
}
```

## Advanced Techniques (Expand: +1500 tokens)

### Technique 1: Custom Serialization

Optimize data serialization:

```rust
use anchor_lang::prelude::*;
use std::io::Write;

#[account]
pub struct OptimizedAccount {
    pub authority: Pubkey,
    pub counter: u64,
    pub flags: u8,
}

impl OptimizedAccount {
    // Custom serialization for hot paths
    pub fn serialize_fast(&self, dst: &mut [u8]) -> Result<()> {
        require!(dst.len() >= 41, ErrorCode::BufferTooSmall);

        // Direct memory writes - no Borsh overhead
        dst[0..32].copy_from_slice(&self.authority.to_bytes());
        dst[32..40].copy_from_slice(&self.counter.to_le_bytes());
        dst[40] = self.flags;

        Ok(())
    }

    pub fn deserialize_fast(src: &[u8]) -> Result<Self> {
        require!(src.len() >= 41, ErrorCode::BufferTooSmall);

        Ok(Self {
            authority: Pubkey::new_from_array(
                src[0..32].try_into().unwrap()
            ),
            counter: u64::from_le_bytes(
                src[32..40].try_into().unwrap()
            ),
            flags: src[40],
        })
    }
}

// Usage in instruction
pub fn fast_update(ctx: Context<Update>, new_counter: u64) -> Result<()> {
    let account_info = &ctx.accounts.account.to_account_info();
    let mut data = account_info.try_borrow_mut_data()?;

    // Skip discriminator (first 8 bytes)
    let account_data = &mut data[8..];

    // Fast deserialize
    let mut account = OptimizedAccount::deserialize_fast(account_data)?;

    // Update
    account.counter = new_counter;

    // Fast serialize
    account.serialize_fast(account_data)?;

    Ok(())
}
```

### Technique 2: Compute Budget Optimization

Request optimal compute units:

```rust
use anchor_lang::prelude::*;
use solana_program::compute_budget::ComputeBudgetInstruction;

pub fn create_optimized_transaction() {
    let mut transaction = Transaction::new();

    // Measure actual CU usage first, then set tight limits
    let compute_limit = ComputeBudgetInstruction::set_compute_unit_limit(50_000);
    let compute_price = ComputeBudgetInstruction::set_compute_unit_price(100);

    transaction.add(compute_limit);
    transaction.add(compute_price);

    // Your instructions...
}

// In program: optimize to stay under limits
pub fn optimized_instruction(ctx: Context<Optimized>) -> Result<()> {
    // Target: < 10,000 CU

    // Minimize syscalls
    let clock = Clock::get()?; // ~100 CU

    // Use simple operations
    let result = ctx.accounts.state.value
        .checked_add(1) // ~10 CU
        .ok_or(ErrorCode::Overflow)?;

    ctx.accounts.state.value = result;

    Ok(())
}
```

### Technique 3: Memory Pool Pattern

Reuse allocations:

```rust
use anchor_lang::prelude::*;

#[account(zero_copy)]
#[repr(C)]
pub struct MemoryPool {
    pub slots: [PoolSlot; 100],
    pub free_list: [u16; 100],
    pub free_count: u16,
}

#[repr(C)]
#[derive(Copy, Clone, Pod, Zeroable)]
pub struct PoolSlot {
    pub in_use: u8,
    pub data: [u8; 255],
}

impl MemoryPool {
    pub fn allocate(&mut self) -> Option<usize> {
        if self.free_count == 0 {
            return None;
        }

        self.free_count -= 1;
        let index = self.free_list[self.free_count as usize] as usize;
        self.slots[index].in_use = 1;

        Some(index)
    }

    pub fn deallocate(&mut self, index: usize) {
        self.slots[index].in_use = 0;
        self.free_list[self.free_count as usize] = index as u16;
        self.free_count += 1;
    }

    pub fn get_mut(&mut self, index: usize) -> Option<&mut PoolSlot> {
        if self.slots[index].in_use == 1 {
            Some(&mut self.slots[index])
        } else {
            None
        }
    }
}
```

### Technique 4: Batch Processing

Process multiple operations efficiently:

```rust
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BatchOperation {
    pub index: u16,
    pub value: u64,
}

#[account(zero_copy)]
pub struct BatchState {
    pub data: [u64; 1000],
}

// ❌ Inefficient - one operation per transaction
pub fn single_update(ctx: Context<Update>, index: u16, value: u64) -> Result<()> {
    let mut state = ctx.accounts.state.load_mut()?;
    state.data[index as usize] = value;
    Ok(())
}

// ✅ Efficient - batch operations
pub fn batch_update(
    ctx: Context<Update>,
    operations: Vec<BatchOperation>
) -> Result<()> {
    require!(operations.len() <= 100, ErrorCode::TooManyOperations);

    let mut state = ctx.accounts.state.load_mut()?;

    for op in operations {
        require!((op.index as usize) < state.data.len(), ErrorCode::IndexOutOfBounds);
        state.data[op.index as usize] = op.value;
    }

    Ok(())
}
```

### Technique 5: Lookup Table Optimization

Use Address Lookup Tables for transaction size:

```rust
use anchor_lang::prelude::*;
use solana_program::address_lookup_table;

pub async fn create_lookup_table(
    connection: &RpcClient,
    payer: &Keypair,
    addresses: Vec<Pubkey>,
) -> Result<Pubkey> {
    // Create lookup table
    let slot = connection.get_slot()?;
    let (create_ix, lookup_table_address) =
        address_lookup_table::instruction::create_lookup_table(
            payer.pubkey(),
            payer.pubkey(),
            slot,
        );

    // Extend with addresses (batch in groups of 30)
    let mut extend_instructions = vec![];
    for chunk in addresses.chunks(30) {
        let extend_ix = address_lookup_table::instruction::extend_lookup_table(
            lookup_table_address,
            payer.pubkey(),
            Some(payer.pubkey()),
            chunk.to_vec(),
        );
        extend_instructions.push(extend_ix);
    }

    // Send transactions...

    Ok(lookup_table_address)
}

// Use in versioned transaction
pub fn create_versioned_tx_with_lut(
    instructions: Vec<Instruction>,
    lookup_table: AddressLookupTableAccount,
) -> VersionedTransaction {
    let message = v0::Message::try_compile(
        &payer.pubkey(),
        &instructions,
        &[lookup_table], // Include lookup table
        recent_blockhash,
    ).unwrap();

    VersionedTransaction {
        signatures: vec![],
        message: VersionedMessage::V0(message),
    }
}
```

## Production Examples (Expand: +1200 tokens)

### Example 1: High-Performance DEX

Optimized swap program:

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("DEX11111111111111111111111111111111111111");

#[program]
pub mod optimized_dex {
    use super::*;

    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        // Single syscall for clock
        let clock = Clock::get()?;

        // Load pool state (zero-copy)
        let mut pool = ctx.accounts.pool.load_mut()?;

        // Inline calculation - no function call overhead
        let amount_out = {
            let reserve_in = pool.reserve_a;
            let reserve_out = pool.reserve_b;

            // Constant product formula: x * y = k
            let amount_in_with_fee = amount_in
                .checked_mul(997)
                .ok_or(ErrorCode::Overflow)?;

            let numerator = amount_in_with_fee
                .checked_mul(reserve_out)
                .ok_or(ErrorCode::Overflow)?;

            let denominator = reserve_in
                .checked_mul(1000)
                .ok_or(ErrorCode::Overflow)?
                .checked_add(amount_in_with_fee)
                .ok_or(ErrorCode::Overflow)?;

            numerator / denominator
        };

        // Slippage check
        require!(amount_out >= minimum_amount_out, ErrorCode::SlippageExceeded);

        // Update reserves (in-place)
        pool.reserve_a = pool.reserve_a.checked_add(amount_in).ok_or(ErrorCode::Overflow)?;
        pool.reserve_b = pool.reserve_b.checked_sub(amount_out).ok_or(ErrorCode::Overflow)?;
        pool.last_update = clock.unix_timestamp;

        // Single CPI for token transfer
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_a.to_account_info(),
                to: ctx.accounts.pool_token_a.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount_in)?;

        // Transfer out using PDA
        let seeds = &[b"pool", &[pool.bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_token_b.to_account_info(),
                to: ctx.accounts.user_token_b.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_ctx, amount_out)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(zero_copy)]
    pub pool: AccountLoader<'info, Pool>,

    #[account(mut)]
    pub pool_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account(zero_copy)]
#[repr(C)]
pub struct Pool {
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub bump: u8,
    pub last_update: i64,
}

unsafe impl Pod for Pool {}
unsafe impl Zeroable for Pool {}
```

**Optimizations applied:**
- Zero-copy for pool state
- Inline calculations
- Minimal syscalls
- Checked arithmetic
- Single CPI calls
- Target: < 15,000 CU

### Example 2: Efficient Staking Program

Optimized reward calculation:

```rust
use anchor_lang::prelude::*;

#[program]
pub mod efficient_staking {
    use super::*;

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        let mut stake_account = ctx.accounts.stake_account.load_mut()?;

        // Update rewards before staking more
        let pending_rewards = calculate_rewards(
            stake_account.staked_amount,
            stake_account.last_update,
            clock.unix_timestamp,
        )?;

        stake_account.pending_rewards = stake_account
            .pending_rewards
            .checked_add(pending_rewards)
            .ok_or(ErrorCode::Overflow)?;

        stake_account.staked_amount = stake_account
            .staked_amount
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        stake_account.last_update = clock.unix_timestamp;

        Ok(())
    }
}

// Inline reward calculation
#[inline]
fn calculate_rewards(
    staked_amount: u64,
    last_update: i64,
    current_time: i64,
) -> Result<u64> {
    const REWARD_RATE_PER_SECOND: u64 = 1; // 1 token per second per staked token

    let time_elapsed = current_time
        .checked_sub(last_update)
        .ok_or(ErrorCode::InvalidTimestamp)? as u64;

    staked_amount
        .checked_mul(time_elapsed)
        .and_then(|r| r.checked_mul(REWARD_RATE_PER_SECOND))
        .ok_or(ErrorCode::Overflow.into())
}

#[account(zero_copy)]
#[repr(C)]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub pending_rewards: u64,
    pub last_update: i64,
}

unsafe impl Pod for StakeAccount {}
unsafe impl Zeroable for StakeAccount {}
```

## Best Practices

**Compute Unit Optimization**
- Profile CU usage with `solana program show`
- Target < 50% of compute limit
- Cache syscall results
- Use inline functions
- Minimize branching

**Memory Optimization**
- Use zero-copy for large accounts
- Pack struct fields efficiently
- Minimize heap allocations
- Use stack carefully (< 4KB per frame)
- Consider `#[repr(C, packed)]`

**Account Optimization**
- Minimize account size
- Use bitflags for multiple booleans
- Close accounts when done
- Realloc only when necessary
- Use PDAs efficiently

**Transaction Optimization**
- Use versioned transactions
- Implement address lookup tables
- Batch operations
- Minimize account count
- Use dynamic compute limits

**Testing**
- Measure CU consumption
- Profile memory usage
- Test edge cases
- Benchmark hot paths
- Use compute budget logging

## Common Pitfalls

**Issue 1: Stack Overflow**
```rust
// ❌ Wrong - 4KB array on stack
pub fn bad(ctx: Context<Bad>) -> Result<()> {
    let arr = [0u8; 4096]; // Stack overflow!
    Ok(())
}

// ✅ Correct - use heap or zero-copy
pub fn good(ctx: Context<Good>) -> Result<()> {
    let arr = vec![0u8; 4096]; // On heap
    Ok(())
}
```

**Issue 2: Excessive Syscalls**
```rust
// ❌ Wrong - multiple Clock::get() calls
let time1 = Clock::get()?.unix_timestamp;
let time2 = Clock::get()?.unix_timestamp; // Duplicate!

// ✅ Correct - single syscall
let clock = Clock::get()?;
let time1 = clock.unix_timestamp;
let time2 = clock.unix_timestamp;
```

**Issue 3: Unoptimized Serialization**
```rust
// ❌ Wrong - full Borsh deserialization
let account: MyAccount = Account::try_deserialize(&data)?;

// ✅ Correct - zero-copy
let account = AccountLoader::<MyAccount>::load(&account_info)?;
```

## Resources

**Official Documentation**
- [Solana Program Optimization](https://docs.solana.com/developing/programming-model/runtime#compute-budget) - Compute budget
- [BPF Loader](https://docs.solana.com/developing/on-chain-programs/deploying) - Program deployment
- [Anchor Zero-Copy](https://www.anchor-lang.com/docs/space) - Zero-copy guide

**Performance Tools**
- `solana program show` - View CU usage
- `solana logs` - Debug compute consumption
- [Solana Explorer](https://explorer.solana.com/) - Transaction analysis

**Related Skills**
- `anchor-macros-deep-dive` - Macro optimizations
- `solana-anchor-mastery` - Program structure
- `helius-rpc-optimization` - RPC optimization
- `jupiter-aggregator-integration` - Transaction optimization

**External Resources**
- [Solana Cookbook](https://solanacookbook.com/guides/feature-parity-testing.html) - Testing guides
- [Neodyme Security](https://github.com/neodyme-labs/solana-security-txt) - Security best practices
- [Metaplex Foundation](https://github.com/metaplex-foundation) - Production examples
