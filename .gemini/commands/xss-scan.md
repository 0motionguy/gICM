# /xss-scan

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
XSS (Cross-Site Scripting) vulnerability detection and prevention. Audit sanitization, DOM safety, and Content Security Policy compliance.

## Usage

```bash
/xss-scan
/xss-scan --framework=react
/xss-scan --generate-csp
```

## Features

- **XSS Pattern Detection**: Find potential DOM-based XSS vulnerabilities
- **Framework Analysis**: React, Vue, Angular specific checks
- **Sanitization Audit**: Check HTML sanitization implementations
- **DOM Manipulation Review**: Identify unsafe DOM writes
- **Content Security Policy**: Generate and validate CSP headers
- **Dangerous Functions**: Flag innerHTML, eval, Function constructor
- **Input Validation**: Check user input validation
- **Output Encoding**: Verify proper output encoding
- **Test Payload Generation**: Generate XSS test cases

## Configuration

```yaml
xssScan:
  framework: "react" # react, vue, angular, vanilla
  checkCSP: true
  checkSanitization: true
  testPayloads: true
  generateCSP: true
  strict: true
```

## Example Output

```
XSS Vulnerability Scan Report
=============================

Critical Findings (2)
====================

1. Unescaped User Input Rendered
   File: src/components/UserProfile.tsx:34
   Severity: CRITICAL
   Code:
     const html = { __html: userData.bio };
     return <div dangerouslySetInnerHTML={html} />;

   Risk: Stored XSS if bio contains malicious JS

   Fix:
     return <div>{userData.bio}</div>;
     // React escapes by default

2. Direct innerHTML Assignment
   File: src/utils/dom.js:45
   Severity: CRITICAL
   Code:
     element.innerHTML = userInput;

   Fix:
     import DOMPurify from 'dompurify';
     element.innerHTML = DOMPurify.sanitize(userInput);

High Findings (3)
=================

3. Unsafe DOM Manipulation
   File: src/components/Comment.jsx:67
   Severity: HIGH
   Code:
     el.textContent = comment; // Safe but could be innerHTML

4. Missing Input Validation
   File: src/services/search.ts:89
   Severity: HIGH

5. eval() Usage
   File: src/lib/rules.js:234
   Severity: HIGH
   Code:
     eval(ruleCode); // NEVER use eval()

CSP Policy Analysis
===================

Current CSP Headers: Not set
Recommended CSP:
  script-src: 'nonce-{random}' 'strict-dynamic'
  style-src: 'nonce-{random}'
  img-src: data: https:
  connect-src: https://api.example.com
  object-src: 'none'
  default-src: 'self'

Remediation Steps
=================
1. Never use dangerouslySetInnerHTML with user input
2. Implement HTML sanitization (DOMPurify, sanitize-html)
3. Enable Content Security Policy
4. Use template literals for safe content
5. Validate and encode user input
```

## Options

- `--framework`: Framework detection (react, vue, angular)
- `--generate-csp`: Generate CSP headers
- `--with-payloads`: Include test payloads
- `--output`: Custom report path
- `--strict`: Strict mode (no tolerance)

## See Also

- `/security-audit` - Security testing
- `/sql-injection-scan` - SQL injection testing
- `/idor-scan` - Authorization testing
