# Command: /upgrade-proxy

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Execute safe UUPS/Transparent proxy upgrades with automated storage validation and safety checks

## Description

The `/upgrade-proxy` command orchestrates secure proxy contract upgrades following best practices for both UUPS (Universal Upgradeable Proxy Standard) and Transparent proxy patterns. It validates storage layout compatibility, performs governance checks, generates upgrade calldata, and executes migrations with full audit trails.

This command is essential for maintaining protocol safety during smart contract upgrades, preventing storage collisions, ensuring governance approval, and enabling seamless contract evolution with zero downtime.

## Usage

```bash
/upgrade-proxy [proxy-address] [new-implementation] [options]
```

## Arguments

- `proxy-address` (optional) - Address of the proxy contract. If omitted, prompts for selection from known proxies
- `new-implementation` (optional) - Address or path to new implementation contract
- `--type` - Proxy type: `uups`, `transparent`, or `beacon` (default: auto-detect)
- `--chain` - Network: `mainnet`, `sepolia`, `arbitrum`, etc. (required)
- `--governance` - Governance type: `safe`, `timelock`, `dao`, `owner` (default: auto-detect)
- `--validate-storage` - Perform storage layout validation (default: true)
- `--migrate` - Run migration function name (e.g., `reinitialize`, `migrateV2`)
- `--dry-run` - Simulate upgrade without execution (default: true)
- `--skip-governance` - Skip governance checks (dangerous, not recommended)
- `--output` - Save upgrade script to file

## Examples

### Example 1: UUPS proxy upgrade with storage validation
```bash
/upgrade-proxy 0x1234...abcd 0x5678...efgh --chain mainnet --type uups
```

Executes:
1. Validates new implementation bytecode
2. Compares storage layouts (old vs new)
3. Checks governance approval status
4. Generates upgrade calldata
5. Simulates execution (dry-run)
6. Awaits governance approval
7. Executes upgrade on-chain

Output:
```
Storage Layout Validation:
✓ Slot 0: value (uint256) - unchanged
✓ Slot 1: owner (address) - unchanged
✓ Slot 2: initialized (bool) - unchanged
+ Slot 3: newFeature (uint256) - ADDED (safe)

Governance Status:
- Type: Timelock (2-day delay)
- Approval: PENDING (3/5 signatures)
- Execution: 2024-11-10 14:30 UTC

Preview:
→ upgradeToAndCall(0x5678...efgh, 0x...)
```

### Example 2: Transparent proxy with migration function
```bash
/upgrade-proxy --chain arbitrum --governance safe --migrate migrateV3
```

Interactive mode:
1. Lists known proxies on Arbitrum
2. Shows current implementation details
3. Allows selection of new implementation from recent deployments
4. Validates storage with migration function
5. Executes via Safe with threshold signatures

Output includes:
- Safe transaction hash (multisig queue)
- Confirmation count
- Execution timestamp
- Migration function results

### Example 3: Beacon proxy upgrade batch
```bash
/upgrade-proxy --type beacon --chain mainnet --output upgrade-script.sh
```

Generates shell script:
```bash
#!/bin/bash
# Beacon Proxy Upgrade Script - Mainnet
# Generated: 2024-11-06

# Validate storage layouts
forge inspect src/Implementation.sol:Implementation storage-layout

# Deploy new implementation
cast send 0xBeacon... "upgradeTo(address)" 0xNewImpl... --private-key $PRIVATE_KEY

# Verify upgrade
cast call 0xBeacon... "implementation()" --rpc-url $RPC_URL
```

### Example 4: Dry-run with detailed analysis
```bash
/upgrade-proxy 0xProxy 0xNewImpl --chain sepolia --dry-run --verbose
```

Output:
```
SIMULATION RESULTS:
=================

Gas Estimation:
  - upgradeTo cost: 45,230 gas
  - Calldata size: 68 bytes
  - Total: ~50,000 gas with overhead

State Changes:
  - implementation: 0xOld... → 0xNewImpl
  - admin: unchanged
  - proxy slots: unchanged

Function Compatibility:
  ✓ All public functions preserved
  ✓ Event signatures compatible
  ✗ One internal function removed (safe)
  ⚠ ABI changes: 2 parameters renamed

Risks Detected:
  - None critical
  - 1 warning: external view function optimization
```

## Best Practices

- **Always validate storage**: Enable storage layout checks to prevent slot collisions
- **Test on testnet first**: Execute full workflow on Sepolia/Goerli before mainnet
- **Use timelock delays**: Implement 48+ hour timelock to allow community response
- **Create snapshot**: Use `/snapshot-state` before upgrade to enable rollback
- **Verify implementation**: Check bytecode and ABI compatibility before upgrade
- **Monitor governance**: Ensure sufficient signer quorum before execution
- **Document changes**: Maintain upgrade notes with migration details
- **Batch migrations**: Use migration functions to update storage in single transaction

## Workflow

The command performs the following steps:

1. **Contract Validation**
   - Fetch proxy code and storage
   - Identify proxy pattern (UUPS/Transparent/Beacon)
   - Verify admin/owner

2. **Storage Layout Analysis**
   - Extract storage layout from current implementation
   - Generate layout for new implementation
   - Compare slots, types, and offsets
   - Flag incompatibilities

3. **Governance Verification**
   - Detect governance mechanism (Safe/Timelock/DAO)
   - Check current approval status
   - Verify signer quorum if multisig
   - Display vote results if DAO

4. **Calldata Generation**
   - Create upgrade function signature
   - Encode migration function call
   - Generate proxy call with delegatecall

5. **Simulation**
   - Run upgrade in Foundry fork
   - Execute migration functions
   - Validate state changes
   - Estimate gas costs

6. **Execution**
   - Queue with governance if required
   - Execute directly if owner/admin
   - Confirm on-chain state
   - Emit upgrade event

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "evm": {
    "proxyUpgrade": {
      "validateStorage": true,
      "performDryRun": true,
      "minTimelockDelay": 172800,
      "requiredSignatures": 3,
      "explorerApi": "etherscan"
    }
  }
}
```

## Storage Validation Details

The command generates comprehensive storage reports:

```
STORAGE LAYOUT COMPARISON:
==========================

OLD IMPLEMENTATION (v1):
Slot  Variable      Type      Size  Offset
0     owner         address   20    0
1     paused        bool      1     20
2     initialized   bool      1     21
3     feePercent    uint16    2     22

NEW IMPLEMENTATION (v2):
Slot  Variable      Type      Size  Offset
0     owner         address   20    0
1     paused        bool      1     20
2     initialized   bool      1     21
3     feePercent    uint16    2     22
4     newFee        uint256   32    24
5     governance    address   20    56

VALIDATION: ✓ PASS
- All existing slots preserved
- New slots appended (safe)
- No collisions detected
```

## Related Commands

- `/flatten-contract` - Flatten contracts before proxy upgrade
- `/snapshot-state` - Create state snapshot for rollback capability
- `/decode-tx` - Decode proxy upgrade transaction data
- `/estimate-gas` - Estimate upgrade execution costs
- `/trace-tx` - Trace upgrade execution for debugging
- `/storage-layout` - Inspect contract storage structure

## Safety Checklist

Before executing any upgrade:

- [ ] Storage layout validated on testnet
- [ ] Migration functions tested in Foundry
- [ ] Governance approval obtained (if applicable)
- [ ] State snapshot created for emergency rollback
- [ ] Implementation bytecode verified
- [ ] Event emissions verified
- [ ] External integrations notified
- [ ] Governance delay enforced (48+ hours)
- [ ] Dry-run simulation passed without errors
- [ ] All signatures collected (multisig)

## Error Handling

```bash
# Storage collision error
Error: Storage layout incompatibility detected
Slot 2: type mismatch
  Old: bool (1 byte)
  New: uint256 (32 bytes)
→ Recommendation: Use gap array in old implementation

# Governance error
Error: Insufficient governance approval
Required: 3 signatures
Current: 1 signature
→ Action: Collect additional signatures or wait for DAO vote

# Implementation validation error
Error: New implementation not verified
→ Action: Deploy new implementation and verify source code
```

## Notes

- **Immutability**: Proxy pattern address cannot change
- **Governance required**: Mainnet upgrades require governance for safety
- **Emergency pause**: Implement pause mechanism for critical issues
- **Event monitoring**: Monitor ProxyUpgraded and Upgraded events
- **ABI preservation**: Maintain backward compatibility for external callers
- **Gap variables**: Leave storage gaps in implementations for future versions
