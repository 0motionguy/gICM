# @gicm/activity-logger

On-chain activity logging for gICM - SQLite, Solana, and Arweave support.

## Installation

```bash
npm install @gicm/activity-logger
# or
pnpm add @gicm/activity-logger
```

## Features

- **SQLite Storage** - Local activity logging with SQLite
- **Solana Memos** - On-chain activity anchoring via SPL Memo
- **Arweave Archival** - Permanent storage via Irys/Arweave

## Usage

```typescript
import { ActivityLogger } from "@gicm/activity-logger";

const logger = new ActivityLogger({
  sqlite: { path: "./logs.db" },
  solana: { rpcUrl: process.env.SOLANA_RPC_URL },
});

await logger.log({
  type: "trade",
  action: "swap",
  data: { from: "SOL", to: "USDC", amount: 100 },
});
```

## Exports

```typescript
// Main logger
import { ActivityLogger } from "@gicm/activity-logger";

// SQLite storage
import { SQLiteLogger } from "@gicm/activity-logger/db";

// Solana integration
import { SolanaLogger } from "@gicm/activity-logger/solana";

// Arweave integration
import { ArweaveLogger } from "@gicm/activity-logger/arweave";
```

## License

MIT
