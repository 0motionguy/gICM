# Command: /test-coverage

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Analyze test coverage for smart contracts and identify untested code paths

## Description

The `/test-coverage` command runs comprehensive test coverage analysis on smart contracts, identifying which code paths are tested and which are missing test coverage. High coverage ensures critical functionality is tested and reduces production bugs.

This command integrates with Foundry and Hardhat to generate coverage reports, highlighting untested lines, branches, and functions in human-readable format.

## Usage

```bash
/test-coverage [options]
```

## Options

- `--framework` - Test framework (foundry, hardhat, auto-detect)
- `--min-coverage` - Minimum coverage threshold percentage (default: 80)
- `--report-type` - Report format (summary, detailed, html, json)
- `--report-file` - Output file for report
- `--exclude` - Exclude files or patterns from coverage
- `--include` - Only include specific files or patterns
- `--forge-args` - Additional arguments for forge coverage
- `--solidity-coverage-args` - Arguments for solidity-coverage
- `--fail-on-low` - Fail if coverage below threshold
- `--open` - Open HTML report in browser
- `--ci` - Optimize output for CI/CD systems

## Arguments

None

## Examples

### Example 1: Run coverage with summary report
```bash
/test-coverage --report-type summary
```
Runs test coverage and displays summary statistics in terminal.

### Example 2: Generate HTML report and check threshold
```bash
/test-coverage --report-type html --min-coverage 85 --fail-on-low --open
```
Generates detailed HTML coverage report, checks 85% threshold, and opens in browser.

### Example 3: Coverage for specific contract
```bash
/test-coverage --include "src/Token.sol" --report-type detailed
```
Analyzes coverage only for Token contract with detailed line-by-line breakdown.

### Example 4: Coverage with exclusions
```bash
/test-coverage --exclude "src/mocks/**,src/interfaces/**" --report-type json --report-file coverage.json
```
Analyzes coverage excluding mock contracts, outputs JSON for CI/CD integration.

## Coverage Metrics

The command reports:

1. **Line Coverage**: Percentage of code lines executed by tests
2. **Branch Coverage**: Percentage of conditional branches tested
3. **Function Coverage**: Percentage of functions called by tests
4. **Statement Coverage**: Percentage of statements executed

## Foundry Coverage Setup

Install Foundry with coverage support:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Create `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"
optimizer = true
optimizer_runs = 200

# Coverage settings
[profile.coverage]
optimizer = false
optimizer_runs = 0
```

## Hardhat Coverage Setup

Install hardhat-coverage plugin:

```bash
npm install --save-dev solidity-coverage
```

Configure in `hardhat.config.ts`:

```typescript
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    outputs: "./outputs",
  },
  networks: {
    hardhat: {
      blockGasLimit: 30000000,
      allowUnlimitedContractSize: true,
    },
  },
};

export default config;
```

## Example Test File

Create `test/MyToken.t.sol` for Foundry:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";

contract MyTokenTest is Test {
    MyToken token;
    address user = address(0x123);

    function setUp() public {
        token = new MyToken("MyToken", "MTK");
    }

    function test_Transfer() public {
        token.transfer(user, 1000e18);
        assertEq(token.balanceOf(user), 1000e18);
    }

    function test_Approve() public {
        token.approve(user, 500e18);
        assertEq(token.allowance(address(this), user), 500e18);
    }

    function test_TransferFrom() public {
        token.approve(user, 1000e18);

        vm.prank(user);
        token.transferFrom(address(this), user, 500e18);

        assertEq(token.balanceOf(user), 500e18);
    }

    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount > 0 && amount <= token.totalSupply());

        token.transfer(user, amount);
        assertEq(token.balanceOf(user), amount);
    }
}
```

## Output Example

```
Test Coverage Analysis
──────────────────────

Framework: Foundry
Test Directory: test/
Source Directory: src/

Running Tests:
✓ MyTokenTest::test_Transfer
✓ MyTokenTest::test_Approve
✓ MyTokenTest::test_TransferFrom
✓ MyTokenTest::testFuzz_Transfer (256 runs)

Coverage Summary:
════════════════════════════════════════
File                  Lines    Coverage
────────────────────────────────────────
src/MyToken.sol       145      94.5%
src/Vault.sol         89       78.7%
src/Oracle.sol        56       100.0%
════════════════════════════════════════
Total:                290      91.0%

Threshold: 85.0% ✓ PASSED

Untested Lines:
⚠ src/MyToken.sol:125 (Error handling in burn)
⚠ src/Vault.sol:67   (Fallback function)
⚠ src/Vault.sol:73   (Emergency withdrawal)

HTML Report: ./coverage/index.html
```

## Coverage Report Structure

HTML report includes:

```
Coverage Report
├─ Summary
│  ├─ Total Coverage: 91.0%
│  ├─ Lines: 264/290
│  ├─ Branches: 78%
│  └─ Functions: 96%
├─ By File
│  ├─ src/MyToken.sol (94.5%)
│  ├─ src/Vault.sol (78.7%)
│  └─ src/Oracle.sol (100.0%)
└─ Details (Clickable code view)
   ├─ Tested lines: Green
   ├─ Untested lines: Red
   └─ Partial coverage: Yellow
```

## Improving Coverage

1. **Identify uncovered code**: Red lines in HTML report
2. **Write targeted tests**: Create tests for untested paths
3. **Use fuzz testing**: Foundry fuzz tests improve coverage
4. **Test error cases**: Add tests for revert conditions
5. **Branch testing**: Ensure all if/else paths are tested

Example for improving coverage:

```solidity
function test_BurnRevert() public {
    vm.expectRevert("Insufficient balance");
    token.burn(user, 1000e18);
}

function test_WithdrawalRevert() public {
    vm.prank(user);
    vm.expectRevert("Emergency paused");
    vault.emergencyWithdraw();
}

function testFuzz_SafeTransfer(uint256 amount) public {
    if (amount > token.balanceOf(address(this))) {
        vm.expectRevert();
        token.transfer(user, amount);
    } else {
        token.transfer(user, amount);
        assertEq(token.balanceOf(user), amount);
    }
}
```

## CI/CD Integration

GitHub Actions example:

```yaml
name: Coverage

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: foundry-rs/foundry-toolchain@v1

      - name: Run coverage
        run: |
          forge coverage --report json --out coverage.json

      - name: Check threshold
        run: |
          coverage=$(jq '.percent_covered' coverage.json)
          if (( $(echo "$coverage < 85" | bc -l) )); then
            echo "Coverage $coverage% below 85% threshold"
            exit 1
          fi
```

## Best Practices

- **Aim for 85%+ coverage**: Balance between thoroughness and diminishing returns
- **Test edge cases**: Focus on critical paths and error conditions
- **Property-based testing**: Use fuzz tests to find untested branches
- **Regular checks**: Run coverage before every commit
- **Document gaps**: If some code can't be covered, document why
- **Exclude non-critical code**: Skip mocks and interfaces if appropriate
- **Review untested code**: Manually review red-flagged uncovered lines
- **Increment coverage**: Gradually improve coverage over time

## Coverage Goals by Component

```
Core Logic: 95%+ coverage
Token mechanics, trading, governance

Business Logic: 85%+ coverage
Rewards, fees, liquidation

Error Handling: 90%+ coverage
Revert conditions, validation

Utilities: 70%+ coverage
Helpers, interfaces, mocks
```

## Related Commands

- `/code-review` - Review code quality
- `/test-foundry` - Run Foundry tests
- `/test-hardhat` - Run Hardhat tests
- `/audit-security` - Security audit

## Notes

- **Coverage ≠ Quality**: High coverage doesn't guarantee quality tests
- **False confidence**: Always review uncovered code manually
- **Performance impact**: Coverage runs slower than normal tests
- **Excludable paths**: Some code (asserts, requires) can't be practically covered
- **Snapshot testing**: Use snapshots to catch unintended changes
