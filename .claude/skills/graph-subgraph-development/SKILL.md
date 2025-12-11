---
name: graph-subgraph-development
description: "Progressive disclosure skill: Quick reference in 45 tokens, expands to 6200 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [45, 6200]
---

# The Graph: Subgraph Development

> Progressive disclosure skill: Quick reference in 45 tokens, expands to 6200 tokens

## Quick Reference (Load: 45 tokens)

The Graph indexes blockchain data enabling efficient querying via GraphQL without scanning full chains.

**Core patterns:**
- Subgraphs - Data indexing definitions for specific smart contracts
- Schema design - GraphQL types and relationships
- Event mapping - Transform blockchain events into entities
- Entity relationships - Define data graph structure
- Handlers - Process events and update state

**Quick start:**
```yaml
dataSources:
  - kind: ethereum/contract
    name: MyToken
    network: mainnet
    source:
      address: "0x..."
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.10
      language: wasm/assemblyscript
      eventHandlers:
        - event: Transfer(indexed from, indexed to, uint256 value)
          handler: handleTransfer
```

## Core Concepts (Expand: +700 tokens)

### Subgraph Structure

A subgraph consists of three main files:

1. **subgraph.yaml** - Configuration and data sources
2. **schema.graphql** - Data types and relationships
3. **mapping code** - Event handlers in AssemblyScript

### Schema Design

GraphQL schema defines queryable entities:

```graphql
type Token @entity {
  id: ID!
  name: String!
  symbol: String!
  decimals: Int!
  totalSupply: BigInt!
  transfers: [Transfer!]! @derivedFrom(field: "token")
}

type Account @entity {
  id: ID!
  balances: [Balance!]! @derivedFrom(field: "account")
  transfers: [Transfer!]! @derivedFrom(field: "from")
}

type Transfer @entity {
  id: ID!
  from: Account!
  to: Account!
  token: Token!
  amount: BigInt!
  timestamp: Int!
  blockNumber: Int!
}
```

**Key features:**
- `@entity` - Marks types as storable
- `ID!` - Primary key (required)
- `@derivedFrom` - Computed relationships
- Relationships via type references
- BigInt for large numbers

### Event Mapping

Map smart contract events to schema updates:

```typescript
import { Transfer as TransferEvent } from "../generated/Token/Token"
import { Token, Account, Transfer } from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  // Load or create entities
  let from = Account.load(event.params.from.toHex())
  if (from == null) {
    from = new Account(event.params.from.toHex())
  }

  let transfer = new Transfer(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  transfer.from = from.id
  transfer.to = event.params.to.toHex()
  transfer.amount = event.params.value
  transfer.timestamp = event.block.timestamp.toI32()

  transfer.save()
  from.save()
}
```

### Entity IDs

Entity IDs must be unique and deterministic:

```typescript
// Simple: use address
let user = new Account(event.params.user.toHex())

// Composite: combine multiple values
let id = event.params.token.toHex() + "-" + event.params.user.toHex()
let balance = new Balance(id)

// With nonce: for events
let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
let transfer = new Transfer(id)
```

### Indexing and Querying

After deployment, query the subgraph:

```graphql
{
  transfers(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    from { id }
    to { id }
    amount
    timestamp
  }
}
```

## Common Patterns (Expand: +1300 tokens)

### Pattern 1: ERC20 Token Subgraph

Index token transfers and balances:

```yaml
# subgraph.yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql

dataSources:
  - kind: ethereum/contract
    name: Token
    network: mainnet
    source:
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
      abi: ERC20
      startBlock: 6000000
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.10
      language: wasm/assemblyscript
      file: ./src/mapping.ts
      entities:
        - Token
        - Account
        - Balance
        - Transfer
      eventHandlers:
        - event: Transfer(indexed from, indexed to, uint256 value)
          handler: handleTransfer
        - event: Approval(indexed owner, indexed spender, uint256 value)
          handler: handleApproval
```

```graphql
# schema.graphql
type Token @entity {
  id: ID!
  symbol: String!
  name: String!
  decimals: Int!
  totalSupply: BigInt!
  totalTransferVolume: BigInt!
  balances: [Balance!]! @derivedFrom(field: "token")
  transfers: [Transfer!]! @derivedFrom(field: "token")
  createdAtBlock: Int!
  createdAtTimestamp: Int!
}

type Account @entity {
  id: ID!
  balances: [Balance!]! @derivedFrom(field: "account")
  sendsTransfers: [Transfer!]! @derivedFrom(field: "from")
  receivesTransfers: [Transfer!]! @derivedFrom(field: "to")
  approvals: [Approval!]! @derivedFrom(field: "owner")
}

type Balance @entity {
  id: ID!
  token: Token!
  account: Account!
  amount: BigInt!
  lastUpdatedBlock: Int!
}

type Transfer @entity {
  id: ID!
  token: Token!
  from: Account!
  to: Account!
  amount: BigInt!
  timestamp: Int!
  block: Int!
  transactionHash: String!
}

type Approval @entity {
  id: ID!
  token: Token!
  owner: Account!
  spender: String!
  amount: BigInt!
  timestamp: Int!
}
```

```typescript
// src/mapping.ts
import { Transfer, Approval } from "../generated/Token/Token"
import { Token, Account, Balance, Transfer as TransferEntity, Approval as ApprovalEntity } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  // Load or create token
  let token = Token.load(event.address.toHex())
  if (token == null) {
    token = new Token(event.address.toHex())
    token.symbol = ""
    token.name = ""
    token.decimals = 18
    token.totalSupply = event.params.value
    token.totalTransferVolume = event.params.value
    token.createdAtBlock = event.block.number.toI32()
    token.createdAtTimestamp = event.block.timestamp.toI32()
  } else {
    token.totalTransferVolume = token.totalTransferVolume.plus(event.params.value)
  }
  token.save()

  // Load or create from account
  let from = Account.load(event.params.from.toHex())
  if (from == null) {
    from = new Account(event.params.from.toHex())
  }
  from.save()

  // Load or create to account
  let to = Account.load(event.params.to.toHex())
  if (to == null) {
    to = new Account(event.params.to.toHex())
  }
  to.save()

  // Update from balance
  let fromBalanceId = event.address.toHex() + "-" + event.params.from.toHex()
  let fromBalance = Balance.load(fromBalanceId)
  if (fromBalance == null) {
    fromBalance = new Balance(fromBalanceId)
    fromBalance.token = token.id
    fromBalance.account = from.id
    fromBalance.amount = new BigInt(0)
  }
  fromBalance.amount = fromBalance.amount.minus(event.params.value)
  fromBalance.lastUpdatedBlock = event.block.number.toI32()
  fromBalance.save()

  // Update to balance
  let toBalanceId = event.address.toHex() + "-" + event.params.to.toHex()
  let toBalance = Balance.load(toBalanceId)
  if (toBalance == null) {
    toBalance = new Balance(toBalanceId)
    toBalance.token = token.id
    toBalance.account = to.id
    toBalance.amount = new BigInt(0)
  }
  toBalance.amount = toBalance.amount.plus(event.params.value)
  toBalance.lastUpdatedBlock = event.block.number.toI32()
  toBalance.save()

  // Create transfer record
  let transfer = new TransferEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  transfer.token = token.id
  transfer.from = from.id
  transfer.to = to.id
  transfer.amount = event.params.value
  transfer.timestamp = event.block.timestamp.toI32()
  transfer.block = event.block.number.toI32()
  transfer.transactionHash = event.transaction.hash.toHex()
  transfer.save()
}

export function handleApproval(event: Approval): void {
  let token = Token.load(event.address.toHex())
  if (token == null) {
    token = new Token(event.address.toHex())
    token.totalSupply = new BigInt(0)
    token.totalTransferVolume = new BigInt(0)
    token.createdAtBlock = event.block.number.toI32()
    token.createdAtTimestamp = event.block.timestamp.toI32()
  }
  token.save()

  let owner = Account.load(event.params.owner.toHex())
  if (owner == null) {
    owner = new Account(event.params.owner.toHex())
  }
  owner.save()

  let approval = new ApprovalEntity(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  approval.token = token.id
  approval.owner = owner.id
  approval.spender = event.params.spender.toHex()
  approval.amount = event.params.value
  approval.timestamp = event.block.timestamp.toI32()
  approval.save()
}
```

### Pattern 2: DEX Subgraph (Uniswap-like)

Index liquidity pools and swaps:

```graphql
# schema.graphql
type Factory @entity {
  id: ID!
  poolCount: Int!
  txCount: Int!
  pairVolume: BigInt!
  pairVolumeUSD: BigDecimal!
  untrackedVolumeUSD: BigDecimal!
}

type Pair @entity {
  id: ID!
  token0: Token!
  token1: Token!
  reserve0: BigInt!
  reserve1: BigInt!
  totalSupply: BigInt!
  createdAtTimestamp: Int!
  createdAtBlockNumber: Int!
}

type Swap @entity {
  id: ID!
  pair: Pair!
  timestamp: Int!
  transaction: Transaction!
  sender: String!
  from: String!
  amount0In: BigInt!
  amount1In: BigInt!
  amount0Out: BigInt!
  amount1Out: BigInt!
  to: String!
  logIndex: BigInt!
}

type Transaction @entity {
  id: ID!
  blockNumber: Int!
  timestamp: Int!
  swaps: [Swap!]!
  mints: [Mint!]!
  burns: [Burn!]!
}
```

```typescript
// src/mapping.ts (excerpt)
import { Swap } from "../generated/Pair/Pair"
import { Swap as SwapEntity, Pair, Transaction } from "../generated/schema"

export function handleSwap(event: Swap): void {
  let pair = Pair.load(event.address.toHex())
  if (pair == null) return

  // Load or create transaction
  let transaction = Transaction.load(event.transaction.hash.toHex())
  if (transaction == null) {
    transaction = new Transaction(event.transaction.hash.toHex())
    transaction.blockNumber = event.block.number.toI32()
    transaction.timestamp = event.block.timestamp.toI32()
    transaction.swaps = []
    transaction.mints = []
    transaction.burns = []
  }

  // Create swap record
  let swap = new SwapEntity(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  swap.pair = pair.id
  swap.timestamp = event.block.timestamp.toI32()
  swap.transaction = transaction.id
  swap.sender = event.params.sender.toHex()
  swap.from = event.params.from.toHex()
  swap.amount0In = event.params.amount0In
  swap.amount1In = event.params.amount1In
  swap.amount0Out = event.params.amount0Out
  swap.amount1Out = event.params.amount1Out
  swap.to = event.params.to.toHex()
  swap.logIndex = event.logIndex
  swap.save()

  // Update pair reserves
  pair.reserve0 = event.params.reserve0
  pair.reserve1 = event.params.reserve1
  pair.save()

  // Update transaction
  let txSwaps = transaction.swaps
  txSwaps.push(swap.id)
  transaction.swaps = txSwaps
  transaction.save()
}
```

### Pattern 3: Staking Pool Subgraph

Track staked amounts and rewards:

```graphql
# schema.graphql
type Pool @entity {
  id: ID!
  name: String!
  stakingToken: Token!
  rewardToken: Token!
  totalStaked: BigInt!
  rewardRate: BigInt!
  createdAt: Int!
  stakers: [Staker!]! @derivedFrom(field: "pool")
  stakes: [Stake!]! @derivedFrom(field: "pool")
}

type Staker @entity {
  id: ID!
  pool: Pool!
  amount: BigInt!
  rewardsClaimed: BigInt!
  lastUpdated: Int!
}

type Stake @entity {
  id: ID!
  pool: Pool!
  staker: Staker!
  amount: BigInt!
  stakedAt: Int!
  timestamp: Int!
}

type Reward @entity {
  id: ID!
  pool: Pool!
  staker: String!
  amount: BigInt!
  timestamp: Int!
}
```

```typescript
// src/mapping.ts (excerpt)
import { Staked, Unstaked, RewardsClaimed } from "../generated/Pool/Pool"
import { Pool, Staker, Stake, Reward } from "../generated/schema"

export function handleStaked(event: Staked): void {
  let pool = Pool.load(event.address.toHex())
  if (pool == null) return

  let stakerId = event.address.toHex() + "-" + event.params.user.toHex()
  let staker = Staker.load(stakerId)
  if (staker == null) {
    staker = new Staker(stakerId)
    staker.pool = pool.id
    staker.amount = new BigInt(0)
    staker.rewardsClaimed = new BigInt(0)
  }

  staker.amount = staker.amount.plus(event.params.amount)
  staker.lastUpdated = event.block.timestamp.toI32()
  staker.save()

  let stake = new Stake(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  stake.pool = pool.id
  stake.staker = stakerId
  stake.amount = event.params.amount
  stake.stakedAt = event.block.timestamp.toI32()
  stake.timestamp = event.block.timestamp.toI32()
  stake.save()

  pool.totalStaked = pool.totalStaked.plus(event.params.amount)
  pool.save()
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let pool = Pool.load(event.address.toHex())
  if (pool == null) return

  let stakerId = event.address.toHex() + "-" + event.params.user.toHex()
  let staker = Staker.load(stakerId)
  if (staker == null) return

  staker.rewardsClaimed = staker.rewardsClaimed.plus(event.params.amount)
  staker.lastUpdated = event.block.timestamp.toI32()
  staker.save()

  let reward = new Reward(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  reward.pool = pool.id
  reward.staker = staker.id
  reward.amount = event.params.amount
  reward.timestamp = event.block.timestamp.toI32()
  reward.save()
}
```

## Advanced Techniques (Expand: +1500 tokens)

### Technique 1: Dynamic Data Sources

Index contracts created at runtime:

```typescript
// src/factory.ts
import { ContractCreated } from "../generated/Factory/Factory"
import { Token as TokenTemplate } from "../generated/templates"

export function handleContractCreated(event: ContractCreated): void {
  // Create dynamic data source for new contract
  TokenTemplate.create(event.params.newContract)
}
```

```yaml
# subgraph.yaml
templates:
  - name: Token
    kind: ethereum/contract
    network: mainnet
    source:
      abi: ERC20
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.10
      language: wasm/assemblyscript
      file: ./src/token.ts
      entities:
        - Token
      eventHandlers:
        - event: Transfer(indexed from, indexed to, uint256 value)
          handler: handleTransfer
```

### Technique 2: Conditional Event Handling

Process events conditionally:

```typescript
import { Transfer } from "../generated/Token/Token"
import { Account, Balance } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  // Skip transfers to zero address
  if (event.params.to.toHex() == "0x0000000000000000000000000000000000000000") {
    return
  }

  // Skip transfers of zero amount
  if (event.params.value.isZero()) {
    return
  }

  // Skip internal transfers (from == to)
  if (event.params.from == event.params.to) {
    return
  }

  // Process only transfers above threshold
  let THRESHOLD = BigInt.fromI32(1000000)
  if (event.params.value.lt(THRESHOLD)) {
    return
  }

  // Continue with transfer logic...
}
```

### Technique 3: Complex Data Aggregation

Aggregate data across multiple sources:

```typescript
import { Swap } from "../generated/Pair/Pair"
import { Pair, DailyData } from "../generated/schema"

export function handleSwap(event: Swap): void {
  let pair = Pair.load(event.address.toHex())
  if (pair == null) return

  // Create daily aggregate
  let dayId = Math.floor(event.block.timestamp.toI32() / 86400)
  let dayIdStr = pair.id + "-" + dayId.toString()

  let daily = DailyData.load(dayIdStr)
  if (daily == null) {
    daily = new DailyData(dayIdStr)
    daily.date = dayId
    daily.pair = pair.id
    daily.dailyVolumeToken0 = new BigInt(0)
    daily.dailyVolumeToken1 = new BigInt(0)
  }

  daily.dailyVolumeToken0 = daily.dailyVolumeToken0.plus(event.params.amount0In)
  daily.dailyVolumeToken1 = daily.dailyVolumeToken1.plus(event.params.amount1In)
  daily.save()
}

type DailyData @entity {
  id: ID!
  date: Int!
  pair: Pair!
  dailyVolumeToken0: BigInt!
  dailyVolumeToken1: BigInt!
}
```

### Technique 4: Entity Relationships and Derived Fields

Use relationships to optimize queries:

```graphql
type Protocol @entity {
  id: ID!
  pools: [Pool!]! @derivedFrom(field: "protocol")
  swaps: [Swap!]! @derivedFrom(field: "protocol")
  totalVolumeUSD: BigDecimal!
  totalFeesUSD: BigDecimal!
}

type Pool @entity {
  id: ID!
  protocol: Protocol!
  token0: Token!
  token1: Token!
  swaps: [Swap!]! @derivedFrom(field: "pool")
  liquidities: [Liquidity!]! @derivedFrom(field: "pool")
}

type Liquidity @entity {
  id: ID!
  pool: Pool!
  user: User!
  amount: BigInt!
  timestamp: Int!
}

type Swap @entity {
  id: ID!
  pool: Pool!
  protocol: Protocol!
  user: User!
  timestamp: Int!
}

type User @entity {
  id: ID!
  swaps: [Swap!]! @derivedFrom(field: "user")
  liquidities: [Liquidity!]! @derivedFrom(field: "user")
}
```

## Production Examples (Expand: +1700 tokens)

### Example 1: Multi-Chain Subgraph

Index the same protocol across multiple chains:

```yaml
# subgraph.yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql

dataSources:
  - kind: ethereum/contract
    name: Factory
    network: mainnet
    source:
      address: "0x1f98431c8ad98523631ae4a59f267346ea3113f7"
      startBlock: 12369621
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.10
      language: wasm/assemblyscript
      file: ./src/factory.ts
      entities:
        - Factory
        - Pool
      eventHandlers:
        - event: PoolCreated(indexed token0, indexed token1, indexed fee, uint24 tickSpacing, address pool)
          handler: handlePoolCreated

  - kind: ethereum/contract
    name: FactoryPolygon
    network: polygon
    source:
      address: "0x1f98431c8ad98523631ae4a59f267346ea3113f7"
      startBlock: 5957206
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.10
      language: wasm/assemblyscript
      file: ./src/factory.ts
      entities:
        - Factory
        - Pool
      eventHandlers:
        - event: PoolCreated(indexed token0, indexed token1, indexed fee, uint24 tickSpacing, address pool)
          handler: handlePoolCreated
```

### Example 2: Comprehensive DeFi Analytics

Complete tracking of swaps, liquidity, and fees:

```typescript
// src/factory.ts
import { PoolCreated } from "../generated/Factory/Factory"
import { Pool as PoolTemplate } from "../generated/templates"
import { Factory, Pool } from "../generated/schema"

export function handlePoolCreated(event: PoolCreated): void {
  // Get or create factory
  let factory = Factory.load("factory")
  if (factory == null) {
    factory = new Factory("factory")
    factory.poolCount = 0
  }

  // Create new pool
  let pool = new Pool(event.params.pool.toHex())
  pool.token0 = event.params.token0.toHex()
  pool.token1 = event.params.token1.toHex()
  pool.fee = event.params.fee
  pool.tickSpacing = event.params.tickSpacing
  pool.liquidity = new BigInt(0)
  pool.sqrtPrice = new BigInt(0)
  pool.feeGrowthGlobal0X128 = new BigInt(0)
  pool.feeGrowthGlobal1X128 = new BigInt(0)
  pool.createdAtTimestamp = event.block.timestamp
  pool.createdAtBlockNumber = event.block.number
  pool.save()

  // Update factory
  factory.poolCount += 1
  factory.save()

  // Create dynamic data source for pool events
  PoolTemplate.create(event.params.pool)
}
```

## Best Practices

**Schema Design**
- Use clear, descriptive entity names
- Design for efficient querying (avoid expensive lookups)
- Use relationships for data that changes together
- Consider pagination for large result sets

**Handler Implementation**
- Validate event data before processing
- Use consistent ID generation across handlers
- Handle edge cases (zero addresses, overflow)
- Optimize storage access patterns

**Performance**
- Minimize entity saves per handler
- Batch updates when possible
- Use efficient data structures
- Monitor sync lag and optimization opportunities

**Testing**
- Test with real contract events
- Verify entity relationships
- Check query performance
- Monitor for indexing errors

## Common Pitfalls

**Issue 1: Inefficient Entity Lookups**
```typescript
// ❌ Wrong - loads entity even if not needed
let entity = MyEntity.load(id)
if (entity == null) {
  entity = new MyEntity(id)
}
entity.save()

// ✅ Correct - conditional creation
let entity = MyEntity.load(id)
if (entity == null) {
  entity = new MyEntity(id)
  entity.field = someValue
  entity.save()
}
```
**Solution:** Only save when creating or modifying entities.

**Issue 2: Incorrect Relationship Setup**
```graphql
// ❌ Wrong - missing @derivedFrom
type User @entity {
  swaps: [Swap!]!
}

// ✅ Correct - use @derivedFrom for reverse relationships
type User @entity {
  id: ID!
  swaps: [Swap!]! @derivedFrom(field: "user")
}

type Swap @entity {
  id: ID!
  user: User!
}
```
**Solution:** Use @derivedFrom to avoid storing redundant data.

**Issue 3: Stale Cache Problems**
```typescript
// ❌ Wrong - loads once and reuses
let pool = Pool.load(id)
// ... later, pool state changes...
// pool object is now stale

// ✅ Correct - reload when needed
let pool = Pool.load(id)
// ... process ...
pool.save()
// Reload if needed later
pool = Pool.load(id)
```
**Solution:** Reload entities after saves or use fresh queries.

**Issue 4: Missing Null Checks**
```typescript
// ❌ Wrong - assumes entity exists
let token = Token.load(tokenAddress)
token.transfers.push(id)

// ✅ Correct - validate before use
let token = Token.load(tokenAddress)
if (token == null) {
  return
}
token.transfers.push(id)
```
**Solution:** Always check for null before accessing entity fields.

## Resources

**Official Documentation**
- [The Graph Documentation](https://thegraph.com/docs/) - Complete guide
- [AssemblyScript API](https://thegraph.com/docs/en/developing/assemblyscript-api/) - Language reference
- [Graph CLI](https://github.com/graphprotocol/graph-cli) - Development tools

**Related Skills**
- `solidity-gas-optimization` - Understand contract efficiency
- `smart-contract-security` - Validate event data
- `chainlink-automation-keepers` - Trigger subgraph updates
- `erc4626-vault-implementation` - Index vault operations

**External Resources**
- [The Graph Examples](https://github.com/graphprotocol/example-subgraphs) - Official examples
- [Uniswap Subgraph](https://github.com/Uniswap/uniswap-v3-subgraph) - Production subgraph
- [OpenZeppelin Subgraph](https://github.com/OpenZeppelin/openzeppelin-subgraphs) - Reference implementation
- [Graph Studio](https://thegraph.com/studio/) - Deployment platform
