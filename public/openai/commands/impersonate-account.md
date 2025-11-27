# Command: /impersonate-account

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Impersonate blockchain accounts for testing contract interactions without private keys

## Description

The `/impersonate-account` command enables testing of contract interactions by impersonating accounts on local forks, without requiring private keys. This is essential for testing access controls, simulating user interactions, and validating authorization logic on mainnet forks.

This command is typically used in conjunction with fork testing, allowing developers to simulate actions from any account including whales, protocols, and multi-sig wallets.

## Usage

```bash
/impersonate-account [address] [options]
```

## Options

- `--fork-url` - Custom RPC endpoint for fork
- `--block` - Block number to fork at
- `--amount` - Fund account with ETH (in ether)
- `--token` - Fund with specific token (address)
- `--token-amount` - Amount of token to fund
- `--function` - Execute function as impersonated account
- `--params` - Function parameters (JSON)
- `--script` - Path to test script to run
- `--verbose` - Show detailed transaction logs

## Arguments

- `address` (required) - Ethereum address to impersonate

## Examples

### Example 1: Impersonate Uniswap team wallet
```bash
/impersonate-account 0x1111111254fb6c44bac0bed2854e76f90643097d
```
Impersonates Uniswap router, enabling testing of Uniswap interactions.

### Example 2: Fund and impersonate account
```bash
/impersonate-account 0xabcd...ef01 --amount 100 --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --token-amount 1000000
```
Impersonates account and funds it with 100 ETH and 1M USDC.

### Example 3: Execute function as impersonated account
```bash
/impersonate-account 0x2222...2222 --function "approve(address,uint256)" --params '["0x3333...",1000000000]'
```
Executes approve function as the impersonated account.

### Example 4: Run test script as impersonated account
```bash
/impersonate-account 0x9999...9999 --script ./test/admin-actions.ts
```
Runs entire test script with impersonated admin account as sender.

## Foundry Impersonation

### Using vm.prank()

```solidity
function test_TransferAsRichAccount() public {
    address richAccount = 0x47ac0Fb4F2D84898b5B171289CB26D7403136112;

    // Impersonate for next transaction only
    vm.prank(richAccount);
    USDC.transfer(address(this), 1000e6);

    // After prank, calls are from original sender
    assertEq(USDC.balanceOf(address(this)), 1000e6);
}
```

### Using vm.startPrank() / vm.stopPrank()

```solidity
function test_MultipleActionsAsImpersonated() public {
    address admin = 0x1234...5678;

    // Start impersonation
    vm.startPrank(admin);

    // All calls are from admin
    token.mint(address(this), 1000 ether);
    token.setMinter(address(0x999), true);

    // Stop impersonation
    vm.stopPrank();

    // Calls are from original sender again
    assertEq(token.balanceOf(address(this)), 1000 ether);
}
```

## Advanced Impersonation Examples

### Impersonate multi-sig signer

```solidity
function test_MultiSigExecution() public {
    address signer1 = 0x1111...1111;
    address signer2 = 0x2222...2222;
    address signer3 = 0x3333...3333;

    // Create proposal
    bytes32 proposalId = multiSig.createProposal(
        target,
        value,
        data,
        description
    );

    // Sign as signers
    vm.prank(signer1);
    multiSig.sign(proposalId);

    vm.prank(signer2);
    multiSig.sign(proposalId);

    vm.prank(signer3);
    multiSig.sign(proposalId);

    // Execute with 3/3 signatures
    multiSig.execute(proposalId);
}
```

### Impersonate protocol governance

```solidity
function test_GovernanceAction() public {
    address governor = 0x1E4b034D9d6d72B58760681e4D15d3E7221b42C1; // Curve DAO

    vm.prank(governor);
    vault.updateFeeStructure(newFees);

    assertEq(vault.feePercentage(), newFees);
}
```

### Impersonate token controller for minting

```solidity
function test_MintViaController() public {
    address minterRole = 0x...;
    uint256 initialSupply = token.totalSupply();

    vm.prank(minterRole);
    token.mint(recipient, 1000 ether);

    assertEq(
        token.totalSupply(),
        initialSupply + 1000 ether
    );
}
```

## Common Impersonated Accounts

```
Uniswap V3 Router:
0xE592427A0AEce92De3Edee1F18E0157C05861564

USDC Holder (Binance):
0x47ac0Fb4F2D84898b5B171289CB26D7403136112

Curve DAO:
0x1E4b034D9d6d72B58760681e4D15d3E7221b42C1

Aave Governance:
0xEE56e2B3D491590B5b31738cc129d13EeD4e8a8b

OpenZeppelin Timelock:
0x6F3380DAeDA72C7F4344375410292b09F6e9b38f

Polygon Bridge:
0x28e4F3a7f651294B9564800b2D01f35189A5bFbE
```

## Output Example

```
Account Impersonation
─────────────────────────────────────────────

Target Account: 0x47ac0Fb4F2D84898b5B171289CB26D7403136112
Account Type: Whale (USDC Holder)
Balance: 4,235,892.45 USDC
ETH Balance: 15.23 ETH

Mainnet Fork:
Network: Ethereum Mainnet
Block: 17,500,000
RPC: https://eth-mainnet.alchemyapi.io/v2/...

Impersonation Status: Active
├─ Address: 0x47ac...6112
├─ Start Block: 17500000
├─ State Modification: Enabled
└─ Time Lock: Disabled

Available Actions:
✓ Execute transactions (no signature required)
✓ Modify state variables
✓ Call protected functions
✓ Transfer tokens
✗ Access private keys (not needed)

Running Test Script:
test/whale-actions.ts

Transaction Log:
1. Transfer USDC to 0x1234...5678
   From: 0x47ac...6112
   Value: 1,000,000 USDC
   Status: ✓ Success

2. Approve UniswapV3Router
   From: 0x47ac...6112
   Token: USDC
   Amount: 10,000,000 USDC
   Status: ✓ Success

Test Results:
✓ test_WhaleLiquidity: 1.234s
✓ test_WhaleSwap: 0.892s
✓ test_WhaleStake: 0.756s

All tests passed!
```

## Testing Authorization

```solidity
function test_OnlyAdminRevert() public {
    address admin = 0xadmin...;
    address hacker = address(0x999);

    // Admin can execute
    vm.prank(admin);
    vault.withdraw(1000 ether);

    // Non-admin cannot
    vm.prank(hacker);
    vm.expectRevert("OnlyAdmin");
    vault.withdraw(1000 ether);
}
```

## Testing Role-Based Access

```solidity
function test_RoleBasedAccess() public {
    address admin = 0xadmin...;
    address minter = 0xmint...;
    address burner = 0xburn...;

    // Admin grants roles
    vm.startPrank(admin);
    token.grantRole(MINTER_ROLE, minter);
    token.grantRole(BURNER_ROLE, burner);
    vm.stopPrank();

    // Minter can mint
    vm.prank(minter);
    token.mint(address(this), 1000 ether);

    // Burner can burn
    vm.prank(burner);
    token.burn(address(this), 500 ether);

    // Minter cannot burn
    vm.prank(minter);
    vm.expectRevert("BurnerRoleRequired");
    token.burn(address(this), 500 ether);
}
```

## Temporary Impersonation

```solidity
function test_TemporaryImpersonation() public {
    address mainAdmin = 0xmain...;
    address tempAdmin = 0xtemp...;

    // Impersonate for single transaction
    vm.prank(mainAdmin);
    vault.setAdmin(tempAdmin, true);

    // Verify mainAdmin is no longer sender
    assertEq(msg.sender, address(this)); // Original sender

    // tempAdmin can now act
    vm.prank(tempAdmin);
    vault.withdraw(1000 ether);
}
```

## Best Practices

- **Fork first**: Always impersonate on fork, never on real network
- **Document source**: Record where impersonated address came from
- **Verify balance**: Check account has required tokens before testing
- **Use snapshots**: Save fork state before impersonation tests
- **Clean up**: Use vm.stopPrank() to end impersonation
- **Test reversions**: Verify unauthorized accounts properly revert
- **Log transactions**: Log all impersonated actions for audit
- **Isolate tests**: Use separate tests for each impersonated account

## Hardhat Impersonation

```typescript
describe("Impersonation Tests", () => {
  it("should transfer as whale", async () => {
    const whaleAddress = "0x47ac0Fb4F2D84898b5B171289CB26D7403136112";

    // Impersonate whale
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whaleAddress],
    });

    const whale = await ethers.getSigner(whaleAddress);
    const usdc = await ethers.getContractAt("IERC20", usdcAddress);

    // Transfer as whale
    await usdc.connect(whale).transfer(recipient, ethers.parseUnits("1000", 6));

    // Stop impersonation
    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [whaleAddress],
    });
  });
});
```

## Related Commands

- `/fork-mainnet` - Create local fork
- `/test-coverage` - Coverage analysis of tests
- `/audit-security` - Security audit before deployment
- `/deploy-hardhat` - Deploy to fork for testing

## Notes

- **No private key required**: Impersonation bypasses signature verification
- **Fork-only**: Can only impersonate on local forks, not real networks
- **State modification**: Can modify blockchain state during impersonation
- **All transactions succeed**: No signature validation on fork
- **Nonce management**: Nonces still increment normally
- **Revert messages**: Still apply (onlyAdmin, etc.) based on msg.sender
