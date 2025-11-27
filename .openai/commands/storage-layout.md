# Command: /storage-layout

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Analyze and visualize smart contract storage layouts with slot mapping and optimization suggestions

## Description

The `/storage-layout` command inspects Solidity contract storage layouts, generating detailed maps of storage slots, variable types, sizes, and packing efficiency. It validates storage compatibility across contract versions, identifies packing opportunities, detects padding waste, and provides optimization recommendations for reduced gas costs.

This command is essential for proxy upgrades, storage optimization, understanding variable memory, and ensuring storage layout compatibility during contract evolution.

## Usage

```bash
/storage-layout [contract-path] [options]
```

## Arguments

- `contract-path` (optional) - Path to Solidity contract file
- `--contract` - Contract name to analyze (if multiple in file)
- `--output` - Output format: `json`, `table`, `markdown` (default: table)
- `--compare` - Compare with another contract's layout
- `--visualize` - Generate visual layout diagram
- `--check-gaps` - Verify storage gaps for upgradeability
- `--optimize` - Show variable reordering suggestions
- `--efficiency` - Report packing efficiency percentage
- `--include-inherited` - Include parent contract storage
- `--validate-proxy` - Check compatibility with proxy pattern

## Examples

### Example 1: Basic storage layout analysis
```bash
/storage-layout src/Token.sol --contract MyToken --output table
```

Output:
```
STORAGE LAYOUT ANALYSIS: MyToken
================================

Contract: src/Token.sol:MyToken
Type: ERC20 + Custom
Inheritance: Ownable, ERC20Upgradeable

STORAGE MAPPING:
────────────────

Slot  Variable              Type                Size   Offset   Packing
────────────────────────────────────────────────────────────────────────
0     owner                 address             20     0        20/32 (62.5%)
      padding               (gap)               12     20

1     paused                bool                1      0        1/32 (3.1%)
      initialized           bool                1      1
      version               uint8               1      2
      padding               (gap)               29     3

2     _balances             mapping             32     0        32/32 (100%)

3     _allowances           mapping             32     0        32/32 (100%)

4     _totalSupply          uint256             32     0        32/32 (100%)

5     _decimals             uint8               1      0        1/32 (3.1%)
      _name                 string              32*    1
      _symbol               string              32*    (dyn)

6     feePercent            uint16              2      0        2/32 (6.25%)
      treasury              address             20     2
      padding               (gap)               10     22

7-19  __gap                 uint256[13]         416    0        416/416 (100%)

TOTAL STORAGE: 7 slots used + 13 gap slots = 20 slots total
PACKING EFFICIENCY: 76.3%
OPTIMIZATION: GOOD


DETAILED BREAKDOWN:
───────────────────

Slot 0 (owner - Ownable):
  └─ address owner @ offset 0 (20 bytes)
  └─ [12 bytes wasted]

Slot 1 (state flags):
  ├─ bool paused @ offset 0 (1 byte)
  ├─ bool initialized @ offset 1 (1 byte)
  ├─ uint8 version @ offset 2 (1 byte)
  └─ [29 bytes wasted]

Slot 2-3 (ERC20 mappings):
  ├─ mapping _balances
  └─ mapping _allowances

Slot 4 (_totalSupply):
  └─ uint256 _totalSupply @ offset 0 (32 bytes)

Slot 5 (string storage):
  ├─ uint8 _decimals @ offset 0 (1 byte)
  ├─ string _name
  └─ string _symbol

Slot 6 (custom):
  ├─ uint16 feePercent @ offset 0 (2 bytes)
  ├─ address treasury @ offset 2 (20 bytes)
  └─ [10 bytes wasted]

Slots 7-19 (upgrade gap):
  └─ uint256[13] __gap for future storage


PACKING ANALYSIS:
─────────────────

Efficiently packed slots: 3/7 (42.8%)
  - Slot 2: mapping (always 100%)
  - Slot 3: mapping (always 100%)
  - Slot 4: uint256 (always 100%)

Under-utilized slots: 4/7 (57.2%)
  - Slot 0: 20/32 bytes used (62.5%)
  - Slot 1: 3/32 bytes used (9.4%) ← MAJOR WASTE
  - Slot 5: dynamic size (string)
  - Slot 6: 22/32 bytes used (68.75%)

Space wasted: 52 bytes (6.5% of used storage)
```

### Example 2: Compare two contract versions
```bash
/storage-layout src/Token.sol --compare src/TokenV2.sol --optimize
```

Output:
```
STORAGE LAYOUT COMPARISON
==========================

VERSION 1 (Token.sol):
Slots used: 7
State vars: 11
Packing efficiency: 76.3%

VERSION 2 (TokenV2.sol):
Slots used: 8
State vars: 13
Packing efficiency: 68.9%

LAYOUT DIFF:
─────────────────────────────────────────────────────────────────

Slot  V1 Variable          V2 Variable          Status
────────────────────────────────────────────────────────────────
0     owner (address)     owner (address)      ✓ UNCHANGED
1     paused (bool)       paused (bool)        ✓ UNCHANGED
      initialized (bool)  initialized (bool)   ✓ UNCHANGED
      version (uint8)     version (uint8)      ✓ UNCHANGED
2     _balances (map)     _balances (map)      ✓ UNCHANGED
3     _allowances (map)   _allowances (map)    ✓ UNCHANGED
4     _totalSupply (u256) _totalSupply (u256)  ✓ UNCHANGED
5     _decimals (u8)      _decimals (u8)       ✓ UNCHANGED
      _name (string)      _name (string)       ✓ UNCHANGED
      _symbol (string)    _symbol (string)     ✓ UNCHANGED
6     feePercent (u16)    feePercent (u16)     ✓ UNCHANGED
      treasury (addr)     treasury (addr)      ✓ UNCHANGED
      [NEW] newFeature (u256)                  + ADDED
7     __gap[13]           __gap[12]            ⚠ ADJUSTED (gap reduced)

COMPATIBILITY: ✓ FULLY COMPATIBLE
All existing slots preserved. New variables added to unused slots.
Safe for proxy upgrade.


OPTIMIZATION SUGGESTIONS:
───────────────────────────

Reordered V1 (current):
  Slot 0: owner (20b) + padding (12b)
  Slot 1: paused (1b) + initialized (1b) + version (1b) + padding (29b)
  ...

Reordered V1 (optimized):
  Slot 0: owner (20b) + paused (1b) + initialized (1b) + version (1b) + padding (9b)
  Slot 1: treasury (20b) + feePercent (2b) + padding (10b)
  ...

Savings: 1 storage slot (32 bytes)
Cost: None (same gas for read/write)
Deployment: Requires reordering in source code

Apply optimization? [Y/n]
```

### Example 3: Visualize layout diagram
```bash
/storage-layout src/Protocol.sol --visualize --output markdown
```

Output:
```
VISUAL STORAGE LAYOUT
====================

Protocol Storage Map (32-byte words)

     0                16                32
     ├────────────────┼────────────────┤
  0  │   owner       │    _paused     │  Slot 0
     │  (address)    │      (bool)    │
     ├────────────────┴────────────────┤
  1  │   feeRecipient  (address)      │  Slot 1
     │                                 │
     ├─────────────────────────────────┤
  2  │   _totalSupply (uint256)        │  Slot 2
     │                                 │
     ├─────────────────────────────────┤
  3  │   _balances → [mapping hash]    │  Slot 3
     │                                 │
     ├─────────────────────────────────┤
  4  │   _allowances → [mapping hash]  │  Slot 4
     │                                 │
     ├─────────────────────────────────┤
  5  │   governance (address)          │  Slot 5
     │                                 │
     ├─────────────────────────────────┤
 6-99│   __gap for future upgrades     │  Slots 6-99
     │   (uint256[94])                 │
     │                                 │
     └─────────────────────────────────┘

Legend:
  ⬛ Fully utilized (32 bytes)
  ▓ Partially utilized
  ░ Wasted space / gaps
  → Mapping reference
```

### Example 4: Validate proxy upgrade safety
```bash
/storage-layout src/Implementation.sol --validate-proxy \
  --contract OldImplementation,NewImplementation
```

Output:
```
PROXY UPGRADE VALIDATION
========================

Old Implementation: OldImplementation
New Implementation: NewImplementation
Pattern: UUPS

STORAGE VALIDATION:
───────────────────

✓ Slot 0: owner (address) - COMPATIBLE
  Old size: 20 bytes
  New size: 20 bytes
  Status: OK

✓ Slot 1: paused (bool) - COMPATIBLE
  Old size: 1 byte
  New size: 1 byte
  Status: OK

✓ Slot 2: _totalSupply (uint256) - COMPATIBLE
  Old size: 32 bytes
  New size: 32 bytes
  Status: OK

✓ Slot 3: _balances (mapping) - COMPATIBLE
  Old size: 32 bytes (mapping)
  New size: 32 bytes (mapping)
  Status: OK (mappings always same size)

✓ Slot 4: _allowances (mapping) - COMPATIBLE
  Old size: 32 bytes (mapping)
  New size: 32 bytes (mapping)
  Status: OK

✓ Slot 5: feePercent (uint16) - COMPATIBLE
  Old offset: 0
  New offset: 0
  Status: OK

+ Slot 6: [NEW] newFeature (uint256) - ADDED
  Status: OK (using gap space)

UPGRADE SAFETY: ✓ FULLY COMPATIBLE
All existing storage slots preserved.
New variables properly placed in gap.
Safe to proceed with upgrade.

Risks detected: NONE
Warnings: NONE
```

## Best Practices

- **Always validate before upgrades**: Check storage compatibility
- **Use storage gaps**: Reserve slots for future upgrades
- **Pack variables efficiently**: Group small types together
- **Document storage**: Comment important storage decisions
- **Test layout changes**: Verify on testnet before mainnet
- **Monitor gap usage**: Track how many gap slots remain
- **Consider future needs**: Plan for anticipated storage expansion
- **Review inherited storage**: Understand parent contracts' layouts

## Workflow

The command performs the following steps:

1. **Contract Parsing**
   - Load Solidity source code
   - Parse storage declarations
   - Identify state variables
   - Trace inheritance chain

2. **Storage Calculation**
   - Assign slot numbers
   - Calculate offsets within slots
   - Determine packing
   - Identify gaps

3. **Analysis**
   - Calculate packing efficiency
   - Identify optimization opportunities
   - Detect potential conflicts
   - Generate recommendations

4. **Comparison** (if applicable)
   - Compare with reference layout
   - Identify additions/removals
   - Verify compatibility
   - Check for collisions

5. **Report Generation**
   - Format output (table/JSON/markdown)
   - Create visualizations
   - Generate recommendations
   - Produce validation results

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "solidity": {
    "storage": {
      "includeGaps": true,
      "validateUpgradeable": true,
      "optimizationRecommendations": true,
      "visualizations": true
    }
  }
}
```

## Storage Layout Rules

Solidity storage packing:

1. **Slot allocation**: Each state var gets slot(s)
2. **Type-dependent**:
   - Fixed-size (uint, address, bool): pack multiple in one slot
   - Dynamic (string, bytes, array): use one slot + data storage
   - Mapping: use one slot, data stored elsewhere

3. **Packing order**: Variables stored in declaration order
4. **Type size**:
   - uint8-uint256: 1-32 bytes (packs)
   - address: 20 bytes (packs)
   - bool: 1 byte (packs)
   - string/bytes: 32 bytes (header only)
   - array: 32 bytes (header only)
   - mapping: 32 bytes (header only)

Example packing:
```solidity
uint256 a;      // Slot 0
uint128 b;      // Slot 1, offset 0
uint128 c;      // Slot 1, offset 16 (packed with b)
uint8 d;        // Slot 2, offset 0
bool e;         // Slot 2, offset 1 (packed with d)
address f;      // Slot 2, offset 2 (packed with d, e)
// Space from offset 22-31 is wasted
```

## Upgrade Gap Patterns

```solidity
// Base contract with upgrade gaps
abstract contract BaseUpgradeable {
    address public owner;
    uint256[50] __gap;  // Reserve 50 slots for future use
}

// Child contract can add new storage
contract ChildUpgradeable is BaseUpgradeable {
    uint256 public newFeature;
    uint256[49] __gap;  // Reduce gap since we added 1 slot
}
```

## Related Commands

- `/upgrade-proxy` - Validate before proxy upgrades
- `/snapshot-state` - Capture storage state
- `/decode-tx` - Analyze storage operations in transactions
- `/estimate-gas` - Estimate costs of storage operations
- `/trace-tx` - Trace storage access patterns

## Performance Notes

- **Gas for SLOAD**: Cold=2,100, Warm=100
- **Gas for SSTORE**: Cold=20,000, Warm=2,900
- **Packing saves**: 1 less SLOAD/SSTORE per packed variable
- **Example**: 3 bool variables packed = saves 2 SLOADs = 4,200 gas

## Common Layout Issues

```
1. SLOT COLLISION
   Problem: Variable overwrites another after upgrade
   Prevention: Always use __gap array

2. UNINTENDED PACKING
   Problem: Variables pack unexpectedly
   Solution: Use explicit spacing or comments

3. MAPPING SIZE
   Problem: Mapping counted as 32 bytes
   Reality: Only header stored, data elsewhere
   Impact: Often misunderstood in calculations

4. INHERITANCE ORDERING
   Problem: Parent storage before child storage
   Solution: Understand C3 linearization
```

## Notes

- **Deterministic**: Same contract always produces same layout
- **Version-specific**: Different compiler versions may vary
- **Proxy-essential**: Critical for upgradeable contracts
- **Gas-related**: Packing affects gas costs
- **Irreversible**: Storage layout set at deployment
- **Chain-independent**: Layout same across all EVM chains
