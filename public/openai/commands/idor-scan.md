# /idor-scan

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
IDOR (Insecure Direct Object Reference) vulnerability scanning. Test authorization, resource access, and enumeration attack vectors.

## Usage

```bash
/idor-scan
/idor-scan --endpoints=/api/**
/idor-scan --test-ids=1,2,3,admin
```

## Features

- **Endpoint Discovery**: Find all API endpoints with ID parameters
- **Authorization Testing**: Test if users can access other users' resources
- **ID Enumeration**: Attempt sequential ID access
- **Cross-User Testing**: Test access across different user accounts
- **Parameter Mutation**: Test different parameter formats
- **Response Analysis**: Compare responses for authorization leaks
- **Privilege Escalation**: Test admin/superuser access
- **Test Report**: Detailed findings with proof-of-concept
- **Automated Scanning**: Define and run custom test suites

## Configuration

```yaml
idorScanning:
  targetEndpoints: "/api/**"
  testUsers:
    - id: 1
      token: "Bearer user1_token"
    - id: 2
      token: "Bearer user2_token"
  idPatterns:
    - numeric: [1, 2, 3, 999, 'admin']
    - uuid: []
    - slug: []
  compareResponses: true
  reportFindings: true
```

## Example Output

```
IDOR Vulnerability Scan Report
===============================

Critical Findings (3)
=====================

1. GET /api/users/:id - Authorization Bypass
   Severity: CRITICAL
   Status: Confirmed Vulnerable

   Test Case:
     Authenticated as: user@example.com (ID: 123)
     Endpoint: GET /api/users/456
     Expected: 403 Unauthorized
     Actual: 200 OK + Full User Data

   Exposed Data:
     - Full name
     - Email address
     - Phone number
     - Payment methods

   Remediation:
     [ ] Add authorization check in endpoint
     [ ] Verify user ID matches request ID
     [ ] Log unauthorized access attempts

2. GET /api/orders/:orderId - Enumeration
   Severity: HIGH
   Status: Confirmed Vulnerable

   Finding: Can enumerate all orders via sequential IDs
   Impact: View other users' order history

Medium Findings (2)
===================

3. GET /api/documents/:id - Information Disclosure
4. PATCH /api/profile/:id - Update Other User's Profile

Remediation Priority
====================
1. Fix user data endpoint (Critical)
2. Add authorization to all resource endpoints
3. Implement proper access control checks
```

## Options

- `--endpoints`: Target endpoints pattern
- `--test-ids`: IDs to test (numeric, UUID, enum)
- `--test-users`: Test user credentials
- `--output`: Custom report path
- `--auto-remediate`: Show fix recommendations

## See Also

- `/security-audit` - Security testing
- `/secrets-scan` - Secrets scanning
- `/cors-config` - CORS security
