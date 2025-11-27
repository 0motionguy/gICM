# Command: /verify-contract

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Verify smart contract source code on Etherscan and other block explorers

## Description

The `/verify-contract` command automates contract verification on Etherscan and other block explorers. Verification proves that the on-chain bytecode matches the published source code, enabling users to read and audit the contract logic. This is critical for user trust and security.

This command handles single file verification, multi-file flattening, constructor argument encoding, and verification status polling across different networks and block explorers.

## Usage

```bash
/verify-contract [address] [options]
```

## Options

- `--network` - Block explorer network (etherscan, polygonscan, arbiscan, optimistic-etherscan)
- `--contract-name` - Contract name if not detected
- `--compiler-version` - Solidity compiler version (e.g., v0.8.19)
- `--constructor-args` - Constructor arguments JSON or path to file
- `--contract-file` - Path to contract source file
- `--flatten` - Flatten contract before verification
- `--optimization` - Optimization setting (true/false)
- `--optimizer-runs` - Number of optimizer runs
- `--license` - License identifier (MIT, Apache-2.0, etc.)
- `--api-key` - Block explorer API key
- `--async` - Return immediately without polling for confirmation

## Arguments

- `address` (required) - Contract address to verify

## Examples

### Example 1: Basic verification
```bash
/verify-contract 0x1234...5678 --network sepolia --contract-file src/MyToken.sol
```
Verifies contract on Sepolia Etherscan, auto-detecting compiler version and contract name.

### Example 2: Verification with constructor arguments
```bash
/verify-contract 0xabcd...ef01 --network mainnet --constructor-args '["MyToken", "MTK"]'
```
Verifies on mainnet with constructor arguments provided as JSON array.

### Example 3: Flattened contract verification
```bash
/verify-contract 0x9999...1111 --network polygon --flatten --optimization true --optimizer-runs 999999
```
Verifies on Polygonscan after flattening multi-file contract with production optimization.

### Example 4: Using constructor args file
```bash
/verify-contract 0x5555...6666 --network arbitrum --constructor-args ./config/args.json
```
Verifies on Arbiscan using constructor arguments from external JSON file.

## Verification Process

```
1. Contract Detection
   ├─ Detect contract name from file
   ├─ Identify compiler version from pragma
   └─ Confirm contract address exists on network

2. Preparation
   ├─ Compile contract with matching settings
   ├─ Flatten source if needed
   ├─ Encode constructor arguments
   └─ Calculate code hash for validation

3. Submission
   ├─ Prepare verification request
   ├─ Submit to block explorer API
   └─ Receive submission ID

4. Polling (optional)
   ├─ Poll verification status
   ├─ Wait for block explorer processing
   └─ Display verification URL when complete

5. Validation
   ├─ Verify bytecode matches
   ├─ Confirm source code accuracy
   └─ Display verified contract badge
```

## Configuration Example

Create `foundry.toml` with etherscan settings:

```toml
[etherscan]
mainnet = { key = "${ETHERSCAN_API_KEY}", url = "https://api.etherscan.io" }
sepolia = { key = "${ETHERSCAN_API_KEY}", url = "https://api-sepolia.etherscan.io" }
polygon = { key = "${POLYGONSCAN_API_KEY}", url = "https://api.polygonscan.com" }
arbitrum = { key = "${ARBISCAN_API_KEY}", url = "https://api.arbiscan.io" }
optimism = { key = "${OPTIMISTIC_ETHERSCAN_API_KEY}", url = "https://api-optimistic.etherscan.io" }
```

## Constructor Arguments Encoding

Create `config/constructor-args.json`:

```json
{
  "arguments": [
    "MyToken",
    "MTK",
    18,
    "1000000000000000000000000"
  ],
  "encoded": "0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000d3c21bcecceda1000000000000000000000000000000000000000000000000000000000000000000077f72546b7765f000000000000000000000000000000000000000000000000000"
}
```

## Output Example

```
Contract Verification
─────────────────────

Target: 0x1234...5678 on Sepolia Etherscan

Contract Detection:
✓ Contract: MyToken
✓ File: src/MyToken.sol
✓ Compiler: v0.8.19
✓ Optimization: true (999999 runs)

Compilation Check:
✓ Bytecode matches on-chain code
✓ No mismatches detected

Constructor Arguments:
✓ Arguments encoded correctly
✓ Values: ["MyToken", "MTK"]

Submission:
↓ Submitting to Etherscan...
Submission ID: xyz123abc

Polling Status:
⏳ Pending (1/30 attempts)
↓ Processing verification...
✓ Verification complete!

Result:
✓ Verified on Etherscan
✓ View on Etherscan: https://sepolia.etherscan.io/address/0x1234...5678#code

Success! Contract is now verified and readable on block explorer.
```

## Hardhat Verification Integration

Using Hardhat ethers plugin:

```bash
npx hardhat verify --network sepolia 0x1234...5678 "MyToken" "MTK"
```

In `hardhat.config.ts`:

```typescript
const config: HardhatUserConfig = {
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY!,
      sepolia: process.env.ETHERSCAN_API_KEY!,
      polygon: process.env.POLYGONSCAN_API_KEY!,
      arbitrumOne: process.env.ARBISCAN_API_KEY!,
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY!,
    },
  },
};
```

## Foundry Verification Integration

Using Forge:

```bash
forge verify-contract \
  --compiler-version v0.8.19 \
  --constructor-args 0x... \
  0x1234...5678 \
  src/MyToken.sol:MyToken \
  --verifier etherscan
```

## Troubleshooting Common Issues

### Issue: "Bytecode mismatch"
Cause: Compiler version or settings don't match deployment
Fix: Verify exact compiler version from deployment script/Hardhat config

### Issue: "Invalid constructor arguments"
Cause: Constructor args not properly ABI-encoded
Fix: Use JSON format or get encoded value from deployment transaction

### Issue: "Already Verified"
Cause: Contract address already verified on explorer
Fix: View existing verification URL instead of re-verifying

### Issue: "Source too large"
Cause: Contract exceeds size limits for single submission
Fix: Use `--flatten` option to combine files

## Block Explorer API Keys

Obtain API keys from:

```
Etherscan:        https://etherscan.io/apis
Polygonscan:      https://polygonscan.com/apis
Arbiscan:         https://arbiscan.io/apis
Optimistic Scan:  https://optimistic.etherscan.io/apis
Base Scan:        https://basescan.org/apis
```

## Verification Checklist

- [ ] Contract address is correct and exists on network
- [ ] Source file path is correct
- [ ] Compiler version matches deployment
- [ ] Optimization enabled/disabled matches deployment
- [ ] Constructor arguments (if any) are correctly encoded
- [ ] API key for block explorer is valid
- [ ] Contract is not already verified
- [ ] Source code file compiles without errors

## Best Practices

- **Verify immediately after deployment**: Don't delay verification
- **Use same compiler version**: Must match exact version from deployment
- **Document constructor args**: Save args for future reference
- **Multi-file contracts**: Use flattening for complex contracts
- **License selection**: Choose appropriate SPDX license identifier
- **Test verification**: Verify on testnet first before mainnet
- **Keep records**: Archive verified source code and verification URLs
- **Batch verification**: Verify all contracts before launch

## Verification Status Reference

- **Success**: Contract verified and readable on block explorer
- **Pending**: Verification submitted, waiting for processing (usually 5-30 seconds)
- **Failed**: Invalid arguments, compiler mismatch, or other error
- **Already verified**: Contract address already has verified code

## Related Commands

- `/deploy-hardhat` - Deploy contracts with Hardhat
- `/deploy-foundry` - Deploy contracts with Foundry
- `/code-review` - Review contract code before deployment
- `/audit-security` - Security audit of smart contracts

## Notes

- **Public visibility**: Verified contracts are readable by all users
- **Immutable**: Verification cannot be removed or changed
- **Network-specific**: Each network requires separate verification
- **API rate limits**: Block explorer API keys have rate limits
- **Processing time**: Verification typically takes 30-90 seconds
