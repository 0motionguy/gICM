# /sql-injection-scan

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
SQL injection vulnerability detection and prevention. Audit query parameterization, identify unsafe SQL patterns, and verify query safety.

## Usage

```bash
/sql-injection-scan
/sql-injection-scan --deep
/sql-injection-scan --with-remediation
```

## Features

- **Pattern Detection**: Find potentially unsafe SQL patterns
- **Query Analysis**: Check parameterization and prepared statements
- **Code Review**: Scan for string concatenation in queries
- **Database Type Support**: MySQL, PostgreSQL, Oracle, MSSQL, SQLite
- **Dynamic Query Detection**: Find vulnerable dynamic query building
- **ORM Analysis**: Check ORM usage for injection risks
- **Test Case Generation**: Generate test payloads
- **Remediation Guide**: How to fix vulnerabilities
- **Compliance Check**: CWE-89 compliance verification

## Configuration

```yaml
sqlInjectionScan:
  databaseTypes:
    - postgresql
    - mysql
    - oracle
  scanDepth: "full" # quick, standard, full
  includeORM: true
  testPayloads: true
  generateReport: true
```

## Example Output

```
SQL Injection Scan Report
=========================

Vulnerable Patterns Found (3)
=============================

CRITICAL
--------

1. String Concatenation in Query
   File: src/db/users.ts:45
   Severity: CRITICAL
   Code:
     const query = "SELECT * FROM users WHERE id = " + userId;
     db.query(query);

   Vulnerability: Direct string concatenation
   Risk: SQL Injection via userId parameter

   Fix:
     const query = "SELECT * FROM users WHERE id = $1";
     db.query(query, [userId]);

2. Template Literals in SQL
   File: src/services/search.ts:123
   Severity: CRITICAL
   Code:
     db.query(`SELECT * FROM products WHERE name = '${search}'`);

   Fix:
     db.query("SELECT * FROM products WHERE name = $1", [search]);

HIGH
----

3. Dynamic WHERE Clause Building
   File: src/db/filters.ts:78
   Severity: HIGH
   Code:
     let query = "SELECT * FROM orders WHERE 1=1";
     if (userId) query += " AND user_id = " + userId;
     db.query(query);

   Remediation:
     Use parameterized queries with dynamic binding
     Use query builder (Knex, Sequelize, TypeORM)

Summary
=======
Total Issues: 3
Critical: 2 (Fix immediately)
High: 1 (Fix before deployment)

Compliance
==========
CWE-89 (SQL Injection): FAIL
OWASP Top 10 A03:2021: FAIL

Next Steps
==========
1. Fix all critical vulnerabilities
2. Implement parameterized queries
3. Use prepared statements
4. Run automated testing
```

## Options

- `--deep`: Deep scan (slower, more thorough)
- `--with-remediation`: Include fix recommendations
- `--database-type`: Specific database type
- `--output`: Custom report path
- `--auto-fix`: Auto-fix simple issues

## See Also

- `/security-audit` - Security testing
- `/xss-scan` - XSS vulnerabilities
- `/idor-scan` - Authorization testing
