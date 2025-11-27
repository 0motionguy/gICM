# Command: /create-subgraph

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Initialize and deploy The Graph subgraph for blockchain data indexing

## Description

The `/create-subgraph` command scaffolds and deploys subgraphs for The Graph protocol, enabling real-time blockchain data indexing and querying. Subgraphs transform on-chain events into queryable GraphQL APIs, essential for data-driven dApps.

This command handles subgraph initialization, schema definition, contract ABI integration, and deployment to hosted or decentralized Graph nodes.

## Usage

```bash
/create-subgraph [name] [options]
```

## Options

- `--contract` - Smart contract address to index
- `--network` - Blockchain network (mainnet, polygon, arbitrum, etc.)
- `--abi-path` - Path to contract ABI JSON file
- `--start-block` - Start indexing from block number
- `--template` - Use template (token, nft, exchange, dao)
- `--graph-node` - The Graph Studio endpoint
- `--deploy-key` - Deploy key for authentication
- `--ipfs-hash` - IPFS hash for pinning
- `--save-config` - Save configuration for later use
- `--local` - Deploy locally instead of to Studio

## Arguments

- `name` (required) - Subgraph name (e.g., "my-token-index")

## Examples

### Example 1: Create basic ERC20 subgraph
```bash
/create-subgraph my-token --contract 0x1234...5678 --network mainnet --template token
```
Creates subgraph scaffolding for ERC20 token with event handlers.

### Example 2: Create custom subgraph with ABI
```bash
/create-subgraph vault-indexer --contract 0xabcd...ef01 --abi-path ./abi/Vault.json --start-block 17500000
```
Creates subgraph for custom contract starting from specific block.

### Example 3: Deploy to The Graph Studio
```bash
/create-subgraph nft-marketplace --template nft --deploy-key YOUR_DEPLOY_KEY
```
Scaffolds NFT subgraph and deploys to Graph Studio.

### Example 4: Create with multiple contracts
```bash
/create-subgraph defi-protocol --network polygon --template exchange
```
Creates subgraph for complex DeFi protocol on Polygon.

## Subgraph Directory Structure

```
my-subgraph/
├── src/
│   ├── mappings.ts          # Event handlers
│   └── entities.ts          # Entity definitions
├── subgraph.yaml            # Subgraph manifest
├── schema.graphql           # GraphQL schema
├── abis/
│   ├── MyToken.json
│   └── Vault.json
├── networks.json            # Network configurations
├── package.json
└── README.md
```

## Subgraph YAML Configuration

Create `subgraph.yaml`:

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql

dataSources:
  - kind: ethereum
    name: MyToken
    network: mainnet
    source:
      address: "0x1234567890123456789012345678901234567890"
      abi: MyToken
      startBlock: 17500000
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - Transfer
        - Approval
        - TokenHolder
      abis:
        - name: MyToken
          file: ./abis/MyToken.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,uint256)
          handler: handleTransfer
        - event: Approval(indexed address,indexed address,uint256)
          handler: handleApproval
      file: ./src/mappings.ts

templates:
  - name: VaultTemplate
    kind: ethereum
    network: mainnet
    source:
      abi: Vault
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - Vault
        - Deposit
        - Withdrawal
      abis:
        - name: Vault
          file: ./abis/Vault.json
      eventHandlers:
        - event: Deposit(indexed address,uint256)
          handler: handleDeposit
        - event: Withdrawal(indexed address,uint256)
          handler: handleWithdrawal
      file: ./src/vaults.ts
```

## GraphQL Schema Definition

Create `schema.graphql`:

```graphql
type Transfer @entity(immutable: true) {
  id: Bytes!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type Approval @entity(immutable: true) {
  id: Bytes!
  owner: Bytes!
  spender: Bytes!
  value: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type TokenHolder @entity {
  id: Bytes!
  address: Bytes!
  balance: BigInt!
  totalTransactions: Int!
  updatedAtBlock: BigInt!
  updatedAtTimestamp: BigInt!
}

type TokenDayData @entity {
  id: ID!
  date: Int!
  totalSupply: BigInt!
  totalTransactionVolume: BigInt!
  totalTransactionCount: Int!
}
```

## Event Handler Implementation

Create `src/mappings.ts`:

```typescript
import { Transfer, Approval, MyToken } from "../generated/MyToken/MyToken"
import { Transfer as TransferEntity, TokenHolder } from "../generated/schema"
import { BigInt, log } from "@graphprotocol/graph-ts"

export function handleTransfer(event: Transfer): void {
  let entity = new TransferEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Update sender balance
  let fromHolder = TokenHolder.load(event.params.from)
  if (fromHolder == null) {
    fromHolder = new TokenHolder(event.params.from)
    fromHolder.balance = BigInt.fromI32(0)
    fromHolder.totalTransactions = 0
  }
  fromHolder.balance = fromHolder.balance.minus(event.params.value)
  fromHolder.totalTransactions = fromHolder.totalTransactions + 1
  fromHolder.save()

  // Update recipient balance
  let toHolder = TokenHolder.load(event.params.to)
  if (toHolder == null) {
    toHolder = new TokenHolder(event.params.to)
    toHolder.balance = BigInt.fromI32(0)
    toHolder.totalTransactions = 0
  }
  toHolder.balance = toHolder.balance.plus(event.params.value)
  toHolder.totalTransactions = toHolder.totalTransactions + 1
  toHolder.save()

  log.info("Transfer from {} to {} for {}", [
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ])
}

export function handleApproval(event: Approval): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32())
  let entity = new Approval(id)

  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
```

## Setup and Deployment

Install Graph CLI:

```bash
npm install -g @graphprotocol/graph-cli
```

Initialize subgraph:

```bash
graph init --studio my-subgraph
cd my-subgraph
```

Generate code from ABI:

```bash
graph codegen
```

Build subgraph:

```bash
graph build
```

Deploy to Studio:

```bash
graph deploy --studio my-subgraph
```

## Output Example

```
Subgraph Creation
─────────────────────────────────────────────

Creating: my-token-index
Network: Ethereum Mainnet
Contract: 0x1234...5678
Start Block: 17,500,000

Directory Structure:
├── src/
│   ├── mappings.ts
│   └── utils.ts
├── subgraph.yaml
├── schema.graphql
├── abis/
│   └── MyToken.json
├── networks.json
├── package.json
└── README.md

Configuration:
✓ Data source configured
✓ Event handlers registered
✓ GraphQL schema generated
✓ ABI integrated

Generated Files:
✓ subgraph.yaml (manifest)
✓ schema.graphql (schema)
✓ src/mappings.ts (handlers)

Building subgraph...
✓ Compiled mappings
✓ Generated types
✓ Build successful

Deploying to The Graph Studio...
✓ Connected to Studio
✓ Authenticated
✓ Uploading IPFS: QmXxxx...
✓ Deployed: https://studio.thegraph.com/subgraph/my-subgraph

Subgraph Details:
├─ Name: my-subgraph
├─ Network: Ethereum Mainnet
├─ Entities: 3 (Transfer, Approval, TokenHolder)
├─ Event Handlers: 2
└─ Status: Indexing (0.23%)

GraphQL Endpoint: https://api.studio.thegraph.com/query/xxxxx/my-subgraph/1.0.0
Play Endpoint: https://studio.thegraph.com/subgraph/my-subgraph

First queries available in ~30 seconds.
```

## Example Queries

```graphql
# Get total transfers
query {
  transfers(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
    id
    from
    to
    value
    blockTimestamp
  }
}

# Get user token balance
query {
  tokenHolders(where: { address: "0x1234..." }) {
    address
    balance
    totalTransactions
    updatedAtTimestamp
  }
}

# Get daily volume
query {
  tokenDayDatas(orderBy: date, orderDirection: desc, first: 30) {
    date
    totalTransactionVolume
    totalTransactionCount
    totalSupply
  }
}

# Monitor price changes
query {
  transfers(
    where: { from: "0x0000..." }
    orderBy: blockTimestamp
    orderDirection: desc
    first: 100
  ) {
    to
    value
    blockTimestamp
  }
}
```

## Template-Based Generation

Token template structure:

```solidity
event Transfer(indexed address from, indexed address to, uint256 value);
event Approval(indexed address owner, indexed address spender, uint256 value);
event Mint(indexed address to, uint256 value);
event Burn(indexed address from, uint256 value);
```

NFT template structure:

```solidity
event Transfer(indexed address from, indexed address to, indexed uint256 tokenId);
event Approval(indexed address owner, indexed address approved, indexed uint256 tokenId);
event ApprovalForAll(indexed address owner, indexed address operator, bool approved);
event Minted(indexed address to, uint256 indexed tokenId);
event Burned(uint256 indexed tokenId);
```

## Performance Optimization

```graphql
# Use pagination for large datasets
query {
  transfers(first: 100, skip: 1000) {
    id
    from
    to
    value
  }
}

# Filter by indexed fields (faster)
query {
  transfers(where: { from: "0x1234..." }) {
    from
    to
    value
  }
}

# Aggregate queries
query {
  tokenHolders(
    orderBy: balance
    orderDirection: desc
    first: 10
  ) {
    address
    balance
  }
}
```

## Best Practices

- **Efficient schemas**: Index only necessary fields
- **Event-driven**: Index events, not storage reads
- **Clear naming**: Use descriptive entity and field names
- **Immutable entries**: Mark historical data as immutable
- **Test locally**: Test with Graph CLI before deployment
- **Monitor indexing**: Check sync status and lag
- **Version management**: Track schema versions
- **Documentation**: Document all entities and handlers

## Testing Subgraph Locally

```bash
# Start local Graph node
docker-compose up

# Deploy locally
graph deploy --node http://localhost:8020 my-subgraph

# Query locally
curl -X POST http://localhost:8000/subgraphs/name/my-subgraph -d '{"query":"..."}'
```

## Related Commands

- `/deploy-hardhat` - Deploy contract before indexing
- `/verify-contract` - Verify contract for transparency
- `/code-review` - Review mapping logic
- `/test-coverage` - Test coverage for handlers

## Notes

- **Indexing delay**: Subgraphs have slight delay behind chain head
- **Decentralization**: Hosted service deprecated, use Studio or self-hosted
- **IPFS pinning**: Subgraphs use IPFS for distribution
- **Query limits**: Studio has rate limits for free tier
- **Event purity**: Only index events, no storage reads possible
- **Historical data**: Good for audit trails and analytics
