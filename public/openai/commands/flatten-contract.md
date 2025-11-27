# Command: /flatten-contract

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Flatten Solidity contracts with dependency tree analysis and source code optimization

## Description

The `/flatten-contract` command flattens complex Solidity contracts by merging all imports and dependencies into a single file. It analyzes import dependencies, removes duplicate code, preserves SPDX and pragma directives, and optimizes the output for verification, deployment, or auditing purposes.

This command is essential for preparing contracts for on-chain verification on block explorers, simplifying deployment processes, enabling comprehensive audits, and creating single-file contract bundles.

## Usage

```bash
/flatten-contract [contract-path] [options]
```

## Arguments

- `contract-path` (optional) - Path to main contract file. If omitted, prompts for selection
- `--output` - Output file path (default: flattened-{name}.sol)
- `--include-comments` - Preserve all comments (default: true)
- `--remove-duplicates` - Remove duplicate code sections (default: true)
- `--pragma` - Solidity version: `0.8.20`, `0.7.0`, etc. (auto-detect by default)
- `--spdx` - License: `MIT`, `GPL-3.0`, `Apache-2.0` (default: preserve original)
- `--verify-format` - Format for block explorer (etherscan, blockscout, sourcify)
- `--optimize` - Remove unused imports and contracts
- `--pretty` - Format output with proper spacing and alignment
- `--no-licenses` - Strip license headers

## Examples

### Example 1: Basic contract flattening
```bash
/flatten-contract src/Protocol.sol --output contracts/Protocol-flat.sol
```

Process:
1. Parses Protocol.sol dependencies
2. Maps import tree
3. Resolves transitive imports
4. Removes duplicates
5. Outputs flattened contract

Input structure:
```
Protocol.sol
├── IProtocol.sol
├── Libraries/Math.sol
└── Token.sol
    ├── IERC20.sol
    └── Libraries/Auth.sol
```

Output:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// === IProtocol.sol ===
interface IProtocol { ... }

// === Libraries/Auth.sol ===
library Auth { ... }

// === Libraries/Math.sol ===
library Math { ... }

// === Token.sol ===
contract Token { ... }

// === Protocol.sol ===
contract Protocol { ... }
```

### Example 2: Format for Etherscan verification
```bash
/flatten-contract src/MyToken.sol --verify-format etherscan --pretty
```

Output optimized for Etherscan:
- Single SPDX license at top
- Consistent pragma statement
- No duplicate interfaces
- Properly ordered dependencies
- Comment preservation for documentation

Generated file ready for:
1. Copy → Etherscan Verify tab
2. Select Solidity compiler version
3. Set optimization
4. Verify

### Example 3: Remove unused code
```bash
/flatten-contract src/Complex.sol --optimize --remove-duplicates
```

Analysis output:
```
Dependency Analysis:
===================

Files included: 8
Lines of code: 2,455

Duplicate code removed:
- SafeTransfer (used 3 times, kept 1)
- AccessControl (used 2 times, kept 1)
- Math library (used 4 times, kept 1)

Unused contracts/interfaces found:
- IMigration (0 references) → skipped
- OldVersion (0 references) → skipped
- DebugHelper (1 reference in comments) → skipped

Optimized output:
- Files: 5 (down from 8)
- Lines: 1,847 (down from 2,455)
- Reduction: 24.8%
```

### Example 4: Interactive flattening with dependency tree
```bash
/flatten-contract --interactive
```

Interactive flow:
```
Select contract to flatten:
1. src/Token.sol
2. src/Protocol.sol
3. src/Bridge.sol
4. src/Governance.sol

Choice: 1

Analyzing src/Token.sol...

Dependency Tree:
src/Token.sol
├── @openzeppelin/contracts/token/ERC20/ERC20.sol
│   ├── @openzeppelin/contracts/token/ERC20/IERC20.sol
│   ├── @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol
│   ├── @openzeppelin/contracts/utils/Context.sol
│   └── @openzeppelin/contracts/token/ERC20/ERC20.sol (already seen)
├── @openzeppelin/contracts/access/Ownable.sol
│   └── @openzeppelin/contracts/utils/Context.sol (already seen)
└── src/interfaces/IToken.sol

External dependencies detected: 5
Total lines of code: 1,823

Options:
[1] Flatten with OpenZeppelin
[2] Flatten with custom dependencies only
[3] Flatten minimal (only direct deps)
[4] Cancel

Choice: 1

Output file: flattened-Token.sol (2,147 lines)
Ready for Etherscan verification.
```

## Best Practices

- **Verify before flattening**: Ensure contract passes local tests
- **Use for verification only**: Flatten for block explorer verification, not deployment
- **Deploy from sources**: Use original files for deployment (cleaner audits)
- **Check for duplicates**: Review output for unintended code duplication
- **Format properly**: Use `--pretty` for readable output
- **Preserve licenses**: Maintain license headers for compliance
- **Test flattened version**: Compile and verify flattened contract matches original
- **Document dependencies**: Keep original import structure documented

## Workflow

The command performs the following steps:

1. **Dependency Discovery**
   - Parse main contract file
   - Identify all imports (relative, npm, etc.)
   - Resolve import paths
   - Build dependency graph

2. **Duplicate Detection**
   - Hash contract code sections
   - Identify duplicate libraries/interfaces
   - Flag repeated code
   - Build deduplication map

3. **Ordering**
   - Topological sort of dependencies
   - Ensure declarations before usage
   - Preserve import ordering
   - Resolve circular dependencies

4. **Merging**
   - Extract pragma directives
   - Combine SPDX licenses
   - Merge source files
   - Strip original imports

5. **Optimization** (if enabled)
   - Remove unused contracts
   - Clean up dead code
   - Inline simple utilities
   - Compress whitespace

6. **Output Generation**
   - Format for target (Etherscan, etc.)
   - Add source separation comments
   - Validate syntax
   - Output final file

## Configuration

Configure in `.claude/settings.json`:

```json
{
  "solidity": {
    "flatten": {
      "removeComments": false,
      "removeDuplicates": true,
      "optimizeUnused": false,
      "defaultFormat": "etherscan",
      "preserveLicenses": true,
      "pragmaVersion": "0.8.20"
    }
  }
}
```

## Dependency Resolution

The command handles multiple import styles:

```solidity
// Relative imports
import "./interfaces/IToken.sol";
import "../libraries/Math.sol";

// NPM imports (Hardhat/Foundry)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Absolute imports
import "src/Token.sol";

// Named imports
import { SafeTransfer } from "./libraries/Transfer.sol";

// All of these are properly resolved and deduplicated
```

## Output Examples

### Minimal flattened contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }
}

contract MyToken {
    using SafeMath for uint256;
    uint256 public totalSupply;
}
```

### Full flattened with comments
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Governance interface
interface IGovernance {
    event ProposalCreated(uint256 indexed proposalId);
    function propose(bytes[] calldata calls) external returns (uint256);
}

/// @title Governance implementation
contract Governance is IGovernance {
    /// @notice Create a new proposal
    /// @param calls Array of encoded function calls
    function propose(bytes[] calldata calls) external returns (uint256) {
        // Implementation
    }
}
```

## Verification on Etherscan

After flattening:

1. Go to contract on Etherscan
2. Click "Code" tab
3. Click "Verify and Publish"
4. Select "Solidity (Single File)"
5. Paste flattened contract
6. Match compiler version and settings
7. Click "Verify"

### Common Issues

```bash
# Multi-file upload
Error: Multiple files detected

# Solution: Use /flatten-contract to create single file

# Duplicate definitions
Error: Identifier 'SafeTransfer' already declared

# Solution: Review duplicates with --remove-duplicates flag

# License mismatch
Error: Multiple conflicting licenses

# Solution: Use --spdx to specify single license
```

## Related Commands

- `/upgrade-proxy` - Flatten before upgrading proxy implementations
- `/decode-tx` - Decode transactions for flattened contracts
- `/storage-layout` - Analyze storage in flattened contracts
- `/create-safe` - Deploy flattened contracts via Safe

## Performance Notes

- **Small contracts** (<500 lines): < 1 second
- **Medium projects** (<5 files): 1-3 seconds
- **Large projects** (20+ files): 3-10 seconds
- **OpenZeppelin full** (100+ files): 10-30 seconds

## Notes

- **Compilation**: Always compile flattened contract to verify correctness
- **Readability**: Comment preservation aids auditing and understanding
- **Size limits**: Etherscan has 24KB text limit for single file
- **Gas optimization**: Flattening doesn't affect gas costs
- **Bytecode**: Flattened and non-flattened contracts produce identical bytecode
- **Source verification**: Etherscan verifies flattened source with original bytecode
