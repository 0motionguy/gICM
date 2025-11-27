# /test-generate-cases

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


Automatically creates comprehensive test cases for code.

## Usage

```bash
/test-generate-cases <file_path>
```

## What It Does

Analyzes code to generate:
- Unit tests
- Integration tests
- Edge case tests
- Error handling tests
- Mock data and fixtures

## Example

```bash
/test-generate-cases src/contracts/Token.sol
```

Generates:
```solidity
// test/Token.test.sol
describe("Token", function() {
  it("should transfer tokens correctly", async function() {
    // Generated test code
  });

  it("should reject transfers exceeding balance", async function() {
    // Edge case test
  });
});
```

## Web3 Use Cases

- Smart contract test generation
- dApp component testing
- Wallet integration tests

---

**Version:** 1.0.0
