# Command: /create-safe

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Create and deploy Gnosis Safe multisig wallets with configurable signers and governance

## Description

The `/create-safe` command deploys Gnosis Safe multisig contracts with specified owners, threshold requirements, and optional delayed execution. It handles Safe factory interactions, generates deployment outputs, and provides Safe address prediction, transaction queuing interfaces, and governance configuration documentation.

This command is essential for setting up secure multisig wallets for protocol governance, treasury management, and decentralized operation of smart contract systems.

## Usage

```bash
/create-safe [options]
```

## Arguments

- `--chain` - Network: `mainnet`, `sepolia`, `arbitrum`, `optimism` (required)
- `--owners` - Comma-separated signer addresses (required)
- `--threshold` - Number of signatures required (default: majority)
- `--name` - Safe name for identification
- `--salt` - Deployment salt for address prediction (default: random)
- `--version` - Safe version: `1.1.1`, `1.2.2`, `1.3.0`, `1.4.1` (default: latest)
- `--delay` - Execution delay in seconds (for governance)
- `--guard` - Guard contract address (optional)
- `--fallback-handler` - Fallback handler contract (optional)
- `--simulate` - Simulate deployment without execution
- `--output` - Output deployment outputs to file
- `--with-timelock` - Add Timelock module for delayed execution
- `--with-roles` - Add role-based access control module

## Examples

### Example 1: Basic multisig Safe creation
```bash
/create-safe \
  --owners 0x1111...1111,0x2222...2222,0x3333...3333 \
  --threshold 2 \
  --chain mainnet \
  --name "Treasury Safe"
```

Output:
```
GNOSIS SAFE DEPLOYMENT
======================

Configuration:
──────────────
Name: Treasury Safe
Chain: Mainnet
Version: 1.4.1 (latest)
Owners: 3
Threshold: 2/3 (66.7%)

OWNERS:
─────────
[0] 0x1111...1111 (Alice)
[1] 0x2222...2222 (Bob)
[2] 0x3333...3333 (Carol)

Safe Address (predicted):
  0xabcd...efgh

Deployment Steps:
─────────────────
1. Deploy Safe singleton (if not exists)
2. Create Safe proxy via factory
3. Initialize with owners and threshold
4. Emit SafeCreated event

TRANSACTION DETAILS:
────────────────────
To: 0xSafeFactory...1234 (Gnosis Safe Factory)
Function: createProxyWithCallback(
  singleton: 0xSafeSingleton...5678,
  initializer: 0x... (init calldata),
  saltNonce: 42,
  callback: 0x0000...0000,
  guard: 0x0000...0000
)

Estimated Gas: 345,000 gas
Estimated Cost: 0.0172 ETH (25 gwei)

DEPLOYMENT STEPS:
──────────────────
1. Send deployment transaction
   From: 0xDeployer...abcd (must be current caller)
   To: Safe Factory
   Value: 0 ETH (funding handled separately)

2. Wait for confirmation (1 block)

3. Safe created at: 0xabcd...efgh

IMPORTANT NOTES:
────────────────
✓ Owners must exist before Safe creation
✓ Current user becomes deployer (no owner role automatically)
✓ Safe address is deterministic (same for same owners/threshold)
✓ Threshold cannot exceed owner count
✓ Safe starts with 0 ETH (must be funded separately)

Next steps:
  1. Fund Safe: send ETH or tokens to 0xabcd...efgh
  2. Propose transactions: Use Safe UI or /queue-tx command
  3. Sign transactions: Each owner signs in Safe UI
  4. Execute transactions: After threshold signatures

DEPLOYMENT outputs:
─────────────────────
Safe Singleton: 0xSafeSingleton...5678 (v1.4.1)
Safe Proxy: 0xabcd...efgh
Factory: 0xSafeFactory...1234
Init Code: 0x608060... (Safe creation bytecode)
```

### Example 2: Governance Safe with timelock and guard
```bash
/create-safe \
  --owners 0xGovernance...1111,0xMultisig...2222 \
  --threshold 1 \
  --chain mainnet \
  --with-timelock \
  --delay 172800 \
  --name "Protocol Governance" \
  --output governance-safe.json
```

Output:
```
GOVERNANCE SAFE DEPLOYMENT
===========================

Safe Configuration:
──────────────────
Name: Protocol Governance
Chain: Mainnet
Version: 1.4.1
Owners: 2
Threshold: 1/2 (50%)

Modules:
  ✓ Timelock (2-day delay)
  ✓ Guard (transaction validation)

OWNERS:
─────────
[0] 0xGovernance...1111 (Governance Contract)
[1] 0xMultisig...2222 (Emergency Admin)

Safe Address: 0xGovSafe...abcd

EXECUTION FLOW:
────────────────
1. Governance submits transaction to Safe
   Status: PENDING (in Timelock queue)

2. Timelock counts down (2 days = 172,800 seconds)
   Status: PENDING → EXECUTABLE (after delay)

3. Any address can execute transaction
   Status: EXECUTABLE → EXECUTED
   Execution by anyone ensures censorship-resistance

TRANSACTION STATES:
────────────────────
PENDING
  └─ Governance votes YES
     └─ Transaction queued in Timelock
        └─ 2-day countdown starts

EXECUTABLE (after delay)
  └─ Anyone can execute
     └─ No additional voting needed
        └─ Transaction executes on-chain

EXECUTED
  └─ Confirmation: SafeExecuted event
     └─ State changes applied
        └─ Transaction complete

Deployed outputs:
────────────────────
safe: 0xGovSafe...abcd
timelock: 0xTimelock...efgh
guard: 0xGuard...ijkl
factory: 0xSafeFactory...1234

Configuration file: governance-safe.json
```

### Example 3: Role-based access Safe
```bash
/create-safe \
  --owners 0xAdmin...1111,0xTreasurer...2222,0xMultisig...3333 \
  --threshold 2 \
  --chain arbitrum \
  --with-roles \
  --name "Role-Based Treasury" \
  --simulate
```

Output:
```
ROLE-BASED SAFE DEPLOYMENT (SIMULATION)
========================================

Safe Configuration:
──────────────────
Name: Role-Based Treasury
Chain: Arbitrum
Version: 1.4.1
Owners: 3
Threshold: 2/3 (66.7%)

Modules:
  ✓ Roles Module (access control)

OWNERS & ROLES:
─────────────────
[0] 0xAdmin...1111 (ROLE_ADMIN)
    Permissions:
      - Add/remove roles
      - Modify role permissions
      - Emergency pause
      - Full control

[1] 0xTreasurer...2222 (ROLE_TREASURER)
    Permissions:
      - Transfer up to $1M/day
      - Approve tokens
      - Manage liquidity
      - Cannot add/remove roles

[2] 0xMultisig...3333 (ROLE_SIGNER)
    Permissions:
      - Sign transactions
      - Cannot initiate transfers
      - Cannot modify roles

DEPLOYMENT SIMULATION:
──────────────────────
Step 1: Deploy Safe singleton ✓
  Gas: 2,345,000

Step 2: Deploy Roles module ✓
  Gas: 1,234,000

Step 3: Deploy transaction guard ✓
  Gas: 456,000

Step 4: Create Safe proxy ✓
  Gas: 345,000

Step 5: Initialize Safe with owners ✓
  Gas: 234,000

Step 6: Enable Roles module ✓
  Gas: 123,000

TOTAL GAS ESTIMATE: 4,737,000 gas
TOTAL COST: 0.2368 ETH (at 25 gwei on Arbitrum: ~$2.37)

Safe Address (predicted): 0xRoleSafe...abcd

SIMULATION RESULT: ✓ SUCCESS
Ready for deployment. Execute with --no-simulate to deploy.
```

### Example 4: Upgrade existing multisig
```bash
/create-safe --chain mainnet --upgrade 0xOldSafe...1234 --new-version 1.4.1
```

Output:
```
SAFE UPGRADE ANALYSIS
====================

Current Safe: 0xOldSafe...1234
Current Version: 1.2.2
Target Version: 1.4.1

UPGRADE PATH:
──────────────
v1.2.2 → v1.4.1

CHANGES:
─────────
Security improvements:
  ✓ Batch transactions support
  ✓ Improved signature validation
  ✓ Enhanced access control
  ✓ Gas optimization

New features:
  ✓ Flexible token callback
  ✓ Domain separator caching
  ✓ Guard enforcement improvements
  ✓ Module pagination support

UPGRADE PROCEDURE:
──────────────────
1. Safe must approve upgrade (multisig vote)
2. Call changeMasterCopy(newSingleton)
3. All existing owners/threshold preserved
4. No state loss
5. Backward compatible

UPGRADE TRANSACTION:
────────────────────
To: 0xOldSafe...1234
Function: changeMasterCopy(address newMasterCopy)
NewMasterCopy: 0xSafev1.4.1...singleton

Approvals needed: 2/3 (current threshold)
Estimated gas: 45,000

SAFETY: ✓ SAFE
All storage preserved. No functionality loss.
```

## Best Practices

- **Choose appropriate threshold**: n-of-m where n > m/2 prevents deadlock
- **Geographically distribute signers**: Mitigate single-location risks
- **Use different key types**: Mix hardware wallets, hot wallets, contracts
- **Test on testnet first**: Verify workflow before mainnet deployment
- **Document signer procedures**: Create operational playbook
- **Regular signer rotation**: Plan for key updates
- **Backup signer access**: Ensure signers can access keys when needed
- **Monitor pending transactions**: Track Safe queue regularly

## Workflow

The command performs the following steps:

1. **Validation**
   - Verify owner addresses
   - Check threshold validity
   - Validate chain configuration
   - Confirm Safe version availability

2. **Address Prediction**
   - Calculate deterministic Safe address
   - Show before deployment
   - Allow address verification

3. **Module Configuration**
   - Deploy Guard if specified
   - Deploy Timelock if specified
   - Deploy Roles if specified
   - Setup initialization data

4. **Safe Creation**
   - Call Safe factory
   - Pass initialization parameters
   - Setup ownership
   - Configure threshold

5. **outputs Generation**
   - Create deployment record
   - Generate ABI files
   - Create configuration export
   - Produce documentation

6. **Deployment Verification**
   - Confirm Safe creation
   - Verify owners set correctly
   - Check threshold configuration
   - Emit SafeCreated event

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "safe": {
    "defaultVersion": "1.4.1",
    "defaultThresholdPercent": 66,
    "deployerAddress": "0x...",
    "modules": {
      "timelock": true,
      "guard": true,
      "roles": false
    },
    "defaultDelay": 172800
  }
}
```

## Safe Addresses by Network

Common Gnosis Safe Factory addresses:

```
Mainnet:      0xa6B71E26C5e0845f74c812102Ca7114b6a8ee50b
Sepolia:      0x4e1DCf7AD4e460CafFaC5582ad7934694F3C0DaY
Arbitrum:     0xa6B71E26C5e0845f74c812102Ca7114b6a8ee50b
Optimism:     0xa6B71E26C5e0845f74c812102Ca7114b6a8ee50b
Polygon:      0xa6B71E26C5e0845f74c812102Ca7114b6a8ee50b
```

## Multisig Examples

```solidity
// 2-of-3 multisig (typical)
Safe with owners:
  [0x1111...1111, 0x2222...2222, 0x3333...3333]
Threshold: 2
Decision: Any 2 of 3 owners can approve transaction

// 3-of-5 multisig (governance)
Safe with owners:
  [0x1111...1111, 0x2222...2222, 0x3333...3333,
   0x4444...4444, 0x5555...5555]
Threshold: 3
Decision: Need 3 out of 5 for transaction execution

// 1-of-2 multisig (with timelock)
Safe with owners:
  [0xGovernance, 0xEmergency]
Threshold: 1
Timelock: 2 days
Decision: Governance alone decides, but with 2-day delay
          Emergency owner can execute immediately if critical
```

## Related Commands

- `/decode-tx` - Decode Safe transactions
- `/estimate-gas` - Estimate Safe operation costs
- `/queue-tx` - Queue transaction in Safe
- `/snapshot-state` - Capture Safe state

## Advanced Configuration

### Guard Contract
Validates all transactions before execution:
```solidity
interface IGuard {
    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGasEstimate,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external;
}
```

### Fallback Handler
Allows Safe to handle calls to non-existent functions:
```solidity
interface IFallbackHandler {
    function handle(
        address sender,
        uint256 value,
        bytes calldata data
    ) external returns (bytes memory result);
}
```

## Cost Analysis

Typical deployment costs:

```
Safe v1.4.1:
  Factory: ~0.002 ETH
  Singleton (if new): ~0.05 ETH
  Guard module: ~0.01 ETH
  Timelock module: ~0.015 ETH
  Roles module: ~0.02 ETH

Total for basic 3-of-5: ~0.002 ETH (first deploy)
Total for fully-featured: ~0.097 ETH
```

## Notes

- **Deterministic addresses**: Same owners always produce same address
- **Owner order matters**: Different owner order = different address
- **No owner privileges**: Being Safe deployer doesn't grant ownership
- **Chain-specific**: Safe address different per chain
- **Version-specific**: Different versions use different singletons
- **Immutable design**: Cannot change owners/threshold after creation (must recreate Safe)
- **Master copy**: All Safes share same singleton for gas efficiency
