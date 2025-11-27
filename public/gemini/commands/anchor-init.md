# /anchor-init

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


Initializes a new Solana Anchor program with best practices.

## Usage

```bash
/anchor-init <program_name> [--template=basic|token|nft|defi]
```

## Features

- Creates Anchor workspace structure
- Generates program boilerplate
- Sets up test environment
- Configures deployment scripts
- Includes security patterns
- Web3.js/Anchor.ts client setup

## Templates

### Basic Template
- Simple program with initialize instruction
- PDA examples
- Account validation
- Error handling

### Token Template
- SPL token integration
- Token minting/burning
- Transfer hooks
- Metadata program integration

### NFT Template
- Metaplex integration
- Collection management
- Royalty enforcement
- Candy machine compatible

### DeFi Template
- Liquidity pool structure
- Swap functionality
- Fee distribution
- Oracle integration

## Generated Structure

```
program_name/
├── programs/
│   └── program_name/
│       ├── src/
│       │   ├── lib.rs
│       │   ├── state.rs
│       │   ├── instructions/
│       │   └── errors.rs
│       └── Cargo.toml
├── tests/
│   └── program_name.ts
├── app/
│   └── client.ts
├── migrations/
│   └── deploy.ts
└── Anchor.toml
```

## Example

```bash
/anchor-init token-launcher --template=defi
```

Generates:
- Bonding curve program
- Liquidity pool management
- Fee collection mechanism
- Admin controls
- Comprehensive tests
- TypeScript client

## Security Features

- Signer checks
- Account ownership validation
- Overflow protection
- Reentrancy guards
- Access control patterns

## Web3 Integration

Automatically includes:
- Connection setup
- Wallet adapter
- Program IDL
- TypeScript types
- Test helpers

---

**Version:** 1.0.0
