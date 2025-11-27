# EVM/Web3 Command Suite Summary

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


Successfully created 10 comprehensive command markdown files for EVM/Web3 development.

## Files Created

### 1. **deploy-hardhat.md** (245 lines)
Hardhat deployment orchestration with gas estimation, network selection, and Etherscan verification.
- Covers: Network selection, gas estimation, safety checks, verification workflow
- Features: Dry-run mode, constructor args, wait confirmations, multiple network support

### 2. **deploy-foundry.md** (316 lines)
Foundry/Forge deployment with advanced gas optimization and Solidity-native scripting.
- Covers: Foundry scripts, solc optimization, keystore integration, legacy transactions
- Features: Script simulation, gas profiling, complex multi-step deployments, proxy patterns

### 3. **verify-contract.md** (267 lines)
Contract source verification on Etherscan and other block explorers.
- Covers: Single/multi-file verification, constructor argument encoding, flattening
- Features: Async polling, block explorer integration, license selection, bytecode validation

### 4. **test-coverage.md** (334 lines)
Test coverage analysis identifying untested code paths and branch coverage.
- Covers: Foundry coverage, Hardhat solidity-coverage, coverage metrics, improvement strategies
- Features: Threshold checking, HTML reports, CI/CD integration, fuzz testing

### 5. **gas-report.md** (337 lines)
Gas consumption profiling and optimization recommendations.
- Covers: Foundry gas reports, Hardhat gas-reporter, hotspot identification, benchmarking
- Features: Storage optimization, batch operations, baseline comparison, per-function analysis

### 6. **audit-security.md** (416 lines)
Security vulnerability detection using Slither, Mythril, and best practice analysis.
- Covers: Automated detection, vulnerability patterns, manual audit checklist
- Features: Reentrancy detection, integer overflow, unchecked calls, continuous monitoring

### 7. **fork-mainnet.md** (370 lines)
Local Ethereum mainnet fork creation for safe testing and simulation.
- Covers: Foundry anvil, Hardhat forking, block-specific forking, state snapshots
- Features: RPC configuration, test account setup, state manipulation, upgrade testing

### 8. **impersonate-account.md** (354 lines)
Account impersonation on forks for testing authorization and interactions.
- Covers: vm.prank, vm.startPrank, multi-sig simulation, role-based access testing
- Features: Whale simulation, governance testing, authorization validation

### 9. **create-subgraph.md** (483 lines)
The Graph subgraph initialization, schema design, and deployment to Graph Studio.
- Covers: Subgraph manifest, GraphQL schema, event handlers, WASM mappings
- Features: Template scaffolding, ABI integration, local testing, query optimization

### 10. **generate-abi.md** (441 lines)
ABI extraction and generation from Solidity contracts with TypeScript integration.
- Covers: JSON ABI format, TypeScript types, ethers.js integration, ABI validation
- Features: NatSpec documentation, flattening support, frontend integration, TypeChain

## Statistics

- **Total Lines**: 3,463 lines of comprehensive documentation
- **Files**: 10 command files
- **Average Size**: 346 lines per command
- **Range**: 245-483 lines

## Structure Pattern

Each command file follows the established pattern:

1. **Description** - Brief summary of command purpose
2. **Usage** - Syntax with arguments
3. **Options** - Detailed flag descriptions
4. **Arguments** - Positional parameters
5. **Examples** - 3-4 practical, runnable examples with output
6. **Advanced Sections** - Framework-specific setup, configuration files, code examples
7. **Output Examples** - Realistic command output showing progress and results
8. **Best Practices** - Development best practices specific to the command
9. **Related Commands** - Cross-references to complementary commands
10. **Notes** - Important caveats and considerations

## Integration Points

### Deployment Pipeline
```
1. /generate-abi - Create contract interface
2. /deploy-hardhat or /deploy-foundry - Deploy contracts
3. /verify-contract - Verify on Etherscan
4. /fork-mainnet - Test on mainnet fork
5. /impersonate-account - Simulate user interactions
```

### Testing & Optimization
```
1. /test-coverage - Run coverage analysis
2. /gas-report - Profile gas consumption
3. /audit-security - Security vulnerability scan
4. /fork-mainnet - Test with real state
```

### Data Indexing
```
1. /deploy-hardhat - Deploy contract
2. /verify-contract - Verify on explorer
3. /generate-abi - Extract ABI
4. /create-subgraph - Index data with The Graph
```

## Key Features Across All Commands

- **Production-ready**: Safe deployment practices with dry-run modes
- **Multi-network**: Support for mainnet, testnets, L2s (Polygon, Arbitrum, Optimism)
- **Framework agnostic**: Coverage of both Foundry and Hardhat ecosystems
- **Security-first**: Vulnerability detection and best practice enforcement
- **Developer experience**: Clear examples, configuration templates, troubleshooting
- **CI/CD integration**: GitHub Actions workflows and automation patterns
- **Verification**: Etherscan integration and contract verification
- **Testing**: Fork testing, impersonation, coverage analysis
- **Performance**: Gas optimization, profiling, benchmarking
- **Documentation**: NatSpec, TypeScript types, GraphQL schemas

## Usage Examples

Deploy to testnet with verification:
```bash
/deploy-hardhat sepolia --verify
```

Test on mainnet fork with whale:
```bash
/fork-mainnet mainnet --block 17500000
/impersonate-account 0x47ac0Fb4F2D84898b5B171289CB26D7403136112 --amount 100
```

Audit and optimize:
```bash
/audit-security src/ --severity critical
/gas-report --compare-baseline ./reports/baseline.json
/test-coverage --min-coverage 85 --fail-on-low
```

Index contract data:
```bash
/deploy-hardhat sepolia --verify
/generate-abi MyToken --format typescript
/create-subgraph my-token-index --template token
```

## File Locations

All files located at:
```
C:\Users\mirko\OneDrive\Desktop\gICM\.claude\commands\

- deploy-hardhat.md
- deploy-foundry.md
- verify-contract.md
- test-coverage.md
- gas-report.md
- audit-security.md
- fork-mainnet.md
- impersonate-account.md
- create-subgraph.md
- generate-abi.md
```

## Next Steps

These commands are ready for use with Claude Code. They provide comprehensive guidance for:

1. **Smart Contract Development** - Deployment, testing, verification
2. **Security & Auditing** - Vulnerability detection, gas optimization
3. **Testing Infrastructure** - Coverage analysis, fork testing, impersonation
4. **Data Indexing** - Subgraph creation, ABI generation
5. **Multi-Network Support** - Testnet, mainnet, L2 operations

Each command includes practical examples, configuration templates, troubleshooting guides, and best practices specific to EVM/Web3 development workflows.
