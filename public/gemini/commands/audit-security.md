# Command: /audit-security

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Security audit of smart contracts using automated tools and best practice analysis

## Description

The `/audit-security` command performs comprehensive security audits on smart contracts, using tools like Slither and Mythril to identify vulnerabilities, reentrancy risks, and security issues. This command integrates automated analysis with best practice recommendations for defense-in-depth security.

This command is essential for production deployments, identifying common vulnerabilities, unsafe patterns, and recommending mitigations before contracts go live.

## Usage

```bash
/audit-security [options]
```

## Options

- `--target` - File or directory to audit
- `--tool` - Security tool (slither, mythril, both)
- `--detectors` - Specific detectors to run (reentrancy, overflow, etc.)
- `--severity` - Minimum severity to report (low, medium, high, critical)
- `--exclude-detectors` - Exclude specific detectors
- `--output` - Report format (terminal, json, html, markdown)
- `--save` - Save report to file
- `--compare-baseline` - Compare against previous audit
- `--fix-suggestions` - Include suggested fixes
- `--exclude-paths` - Exclude files from audit
- `--skip-external-calls` - Don't analyze external call risks

## Arguments

- `target` (optional) - File or directory to audit (default: src/)

## Examples

### Example 1: Quick security audit
```bash
/audit-security src/MyToken.sol --tool slither
```
Runs Slither analysis on MyToken contract, reports all issues.

### Example 2: Deep audit with Mythril
```bash
/audit-security src/ --tool mythril --output html --save audit-report.html
```
Runs Mythril symbolic execution analysis, generates HTML report.

### Example 3: Critical vulnerabilities only
```bash
/audit-security --severity critical --fix-suggestions
```
Shows only critical issues with recommended fixes.

### Example 4: Compare against baseline
```bash
/audit-security --compare-baseline ./reports/previous-audit.json
```
Identifies new vulnerabilities since last audit.

## Security Analysis Workflow

```
1. Initial Scan
   ├─ Parse Solidity files
   ├─ Build AST (Abstract Syntax Tree)
   └─ Identify contracts and functions

2. Automated Detection
   ├─ Slither static analysis
   ├─ Mythril symbolic execution
   └─ Custom vulnerability patterns

3. Category Analysis
   ├─ Reentrancy risks
   ├─ Integer overflow/underflow
   ├─ Unchecked calls and sends
   ├─ Access control issues
   ├─ State management problems
   └─ Gas-related issues

4. Risk Assessment
   ├─ Severity classification
   ├─ Impact analysis
   └─ Exploitability rating

5. Reporting
   ├─ Generate report
   ├─ Suggest mitigations
   └─ Provide code examples
```

## Installation

Install security tools:

```bash
# Slither (Python-based)
pip3 install slither-analyzer

# Mythril (Python-based)
pip3 install mythril

# Solhint (JavaScript-based linter)
npm install --save-dev solhint

# SMTChecker (built into Solidity compiler)
# Enable in compiler settings
```

## Configuration Files

Create `.slither.json`:

```json
{
  "detectors": [
    "reentrancy",
    "shadowing",
    "suicidal",
    "uninitialized-state",
    "uninitialized-local",
    "constable-states",
    "external-function",
    "low-level-calls",
    "naming-convention",
    "pragma",
    "solc-version",
    "unused-state",
    "unused-return",
    "timestamp",
    "assembly",
    "assert-state-change",
    "bad-dom-naming-convention",
    "boolean-equal",
    "calls-loop",
    "constant-functions-asm",
    "constant-functions-state",
    "controlled-delegatecall",
    "divide-before-multiply",
    "erc20-interface",
    "erc721-interface",
    "incorrect-equality",
    "locked-ether",
    "mapping-deletion",
    "multiple-delegatecall",
    "precondition-on-state-variable",
    "reentrancy-benign",
    "reentrancy-events",
    "reentrancy-unlimited-gas",
    "redundant-statements",
    "similar-names",
    "too-many-digits",
    "unchecked-lowlevel",
    "unchecked-send",
    "unchecked-transfer",
    "unprotected-upgrade",
    "valid-type"
  ],
  "exclude_paths": ["test", "mock"],
  "exclude_contracts": ["Mock", "Test"],
  "filter_paths": ["src"]
}
```

## Output Example

```
Security Audit Report
─────────────────────────────────────────────────────

Target: src/MyToken.sol
Tools: Slither, Mythril
Severity Threshold: Low

Total Issues Found: 7
  Critical: 1
  High: 2
  Medium: 3
  Low: 1

════════════════════════════════════════════════════

CRITICAL (1)
────────────

❌ Reentrancy Vulnerability
   File: src/MyToken.sol:145
   Function: withdrawAll()

   Description:
   The function calls external contract before updating state,
   allowing reentrancy attack.

   Vulnerable Code:
   ```solidity
   (bool success, ) = recipient.call{value: balance}("");
   require(success);
   balances[msg.sender] = 0;  // Should be before call
   ```

   Recommendation:
   Use Checks-Effects-Interactions pattern:
   ```solidity
   balances[msg.sender] = 0;  // Update first
   (bool success, ) = recipient.call{value: balance}("");
   require(success);
   ```

   References:
   - CWE-281: Improper Neutralization
   - SWC-107: Reentrancy

════════════════════════════════════════════════════

HIGH (2)
────────

⚠️ Unchecked External Call
   File: src/MyToken.sol:78
   Function: externalTransfer()

   Description:
   External call result not checked, may fail silently.

   Current:
   ```solidity
   token.transferFrom(msg.sender, address(this), amount);
   ```

   Fix:
   ```solidity
   require(token.transferFrom(msg.sender, address(this), amount));
   ```

════════════════════════════════════════════════════

MEDIUM (3)
──────────

⚠️ Missing Input Validation
   File: src/MyToken.sol:42
   Function: setAdmin(address newAdmin)

   Missing checks:
   - newAdmin != address(0)
   - newAdmin != currentAdmin

════════════════════════════════════════════════════

Confidence: High (95%)
Audit Date: 2024-01-15
Auditor: Automated Security Tools
```

## Common Vulnerability Patterns

### 1. Reentrancy (SWC-107)

Vulnerable:
```solidity
function withdraw(uint256 amount) public {
    require(balances[msg.sender] >= amount);

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);

    balances[msg.sender] -= amount;  // After call - VULNERABLE!
}
```

Fixed:
```solidity
function withdraw(uint256 amount) public {
    require(balances[msg.sender] >= amount);

    balances[msg.sender] -= amount;  // Before call

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

### 2. Integer Overflow (SWC-101)

Vulnerable:
```solidity
function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) public {
    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
        total += amounts[i];  // Can overflow
    }
    balances[msg.sender] -= total;
}
```

Fixed:
```solidity
function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) public {
    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
        require(total + amounts[i] >= total);  // Overflow check
        total += amounts[i];
    }
    balances[msg.sender] -= total;
}
```

### 3. Delegatecall to Untrusted Contract (SWC-112)

Vulnerable:
```solidity
function delegateCall(address target, bytes memory data) public {
    (bool success, ) = target.delegatecall(data);  // Untrusted target
    require(success);
}
```

Fixed:
```solidity
function delegateCall(address target, bytes memory data) public onlyAdmin {
    require(whitelistedTargets[target], "Target not whitelisted");
    (bool success, ) = target.delegatecall(data);
    require(success);
}
```

## Manual Audit Checklist

```
Access Control:
- [ ] Only admin functions use onlyOwner/onlyAdmin
- [ ] Role-based access properly implemented
- [ ] No public functions that should be private
- [ ] Initialize functions only callable once

State Management:
- [ ] All state changes properly validated
- [ ] No uninitialized variables
- [ ] Proper event emission for state changes
- [ ] Reentrancy protection (ReentrancyGuard)

External Calls:
- [ ] All external calls checked for success
- [ ] Low-level calls properly wrapped
- [ ] No delegatecall to untrusted contracts
- [ ] Gas limits considered for calls

Math Operations:
- [ ] No integer overflow/underflow (use SafeMath or solc 0.8+)
- [ ] Division before multiplication avoided
- [ ] Proper rounding in price calculations
- [ ] No division by zero

Token Interactions:
- [ ] ERC20 return value checked
- [ ] Safe approval patterns used
- [ ] Proper token balance validation
- [ ] No reentrancy in token transfers
```

## Continuous Security

GitHub Actions workflow:

```yaml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Slither
        run: pip3 install slither-analyzer

      - name: Run Slither
        run: slither src/ --json slither-report.json

      - name: Check Critical Issues
        run: |
          critical=$(jq '.results[] | select(.impact=="High")' slither-report.json | wc -l)
          if [ $critical -gt 0 ]; then
            echo "Critical vulnerabilities found!"
            exit 1
          fi
```

## Professional Audit Services

For production contracts, consider:

- Trail of Bits (High-end audits)
- OpenZeppelin (Community audits)
- Consensys Diligence (Enterprise audits)
- Code4rena (Community contests)
- Sherlock (Insurance-backed audits)

## Related Commands

- `/code-review` - Code review before audit
- `/test-coverage` - Coverage analysis
- `/deploy-hardhat` - Safe deployment practices
- `/verify-contract` - Verify on block explorer

## Notes

- **Automated ≠ Complete**: Tools find common issues, not all vulnerabilities
- **False positives**: Some findings may not apply to your use case
- **Code context**: Tools can't understand business logic
- **Professional review**: High-value contracts need human audits
- **Continuous monitoring**: Run audits on every version
- **Bug bounties**: Consider bug bounties after launch
