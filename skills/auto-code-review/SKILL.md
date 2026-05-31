---
name: auto-code-review
description: Automated code review and analysis. Performs static analysis, security checks, performance suggestions, and style guide enforcement for Python, JavaScript, TypeScript, and Solidity code.
metadata: {"clawdbot":{"emoji":"🔍","requires":{"bins":["python3"]}}}
---

# Auto Code Review

Automated code review and analysis for multiple languages.

## Features

- **Static Analysis** - Detect bugs, code smells, and anti-patterns
- **Security Checks** - Find vulnerabilities and security issues
- **Performance Suggestions** - Identify optimization opportunities
- **Style Guide Enforcement** - Check code formatting and conventions

## Supported Languages

- **Python** - pylint, flake8 patterns, custom checks
- **JavaScript/TypeScript** - ESLint-style rules
- **Solidity** - Smart contract security patterns

## Usage

### Review a Single File

```bash
python3 {baseDir}/scripts/review.py --file /path/to/file.py
```

**Review with specific checks:**
```bash
python3 {baseDir}/scripts/review.py --file file.py --checks security,performance
```

### Review a Directory

```bash
python3 {baseDir}/scripts/review.py --dir /path/to/project --recursive
```

**Generate report:**
```bash
python3 {baseDir}/scripts/review.py --dir ./src --format json --output report.json
```

### Security Scan

```bash
python3 {baseDir}/scripts/security_check.py --file contract.sol
```

**Full project security audit:**
```bash
python3 {baseDir}/scripts/security_check.py --dir ./ --severity high
```

### Performance Analysis

```bash
python3 {baseDir}/scripts/performance_check.py --file app.py
```

**Check for common bottlenecks:**
```bash
python3 {baseDir}/scripts/performance_check.py --dir ./src --checks all
```

### Style Guide Check

```bash
python3 {baseDir}/scripts/style_check.py --file file.py
```

**Auto-fix style issues:**
```bash
python3 {baseDir}/scripts/style_check.py --file file.py --fix
```

### Git Integration

**Review staged changes:**
```bash
python3 {baseDir}/scripts/git_review.py --staged
```

**Review specific commit:**
```bash
python3 {baseDir}/scripts/git_review.py --commit HEAD~1
```

**Review PR diff:**
```bash
python3 {baseDir}/scripts/git_review.py --diff branch1..branch2
```

## Output Format

### Console Output
```
🔍 Code Review Report
═══════════════════════════════════════

File: src/main.py
───────────────────────────────────────
⚠️  Line 15: Unused import 'json'
   Suggestion: Remove unused import

❌ Line 42: Potential SQL injection
   Severity: HIGH
   Suggestion: Use parameterized queries

💡 Line 58: Inefficient loop pattern
   Suggestion: Use list comprehension

───────────────────────────────────────
Summary: 3 issues (1 error, 1 warning, 1 suggestion)
```

### JSON Output
```json
{
  "success": true,
  "summary": {
    "files_reviewed": 5,
    "total_issues": 12,
    "errors": 2,
    "warnings": 6,
    "suggestions": 4
  },
  "files": [
    {
      "path": "src/main.py",
      "language": "python",
      "issues": [
        {
          "line": 15,
          "severity": "warning",
          "category": "style",
          "message": "Unused import",
          "suggestion": "Remove unused import 'json'"
        }
      ]
    }
  ]
}
```

## Severity Levels

- **CRITICAL** - Security vulnerabilities, likely bugs
- **HIGH** - Probable issues, should fix before merge
- **MEDIUM** - Code smells, style violations
- **LOW** - Suggestions, minor improvements

## Configuration

Create `{baseDir}/.reviewrc.json` for custom rules:

```json
{
  "rules": {
    "max-line-length": 100,
    "max-function-length": 50,
    "max-complexity": 10,
    "require-docstrings": true,
    "security": {
      "check-sql-injection": true,
      "check-hardcoded-secrets": true,
      "check-eval-usage": true
    },
    "performance": {
      "check-loop-efficiency": true,
      "check-list-comprehensions": true
    }
  },
  "exclude": ["tests/", "venv/", "node_modules/"]
}
```

## CI/CD Integration

Add to pre-commit hook:

```bash
#!/bin/bash
# .git/hooks/pre-commit

python3 ~/.openclaw/workspace/skills/auto-code-review/scripts/git_review.py --staged --fail-on-error
```

GitHub Actions example:

```yaml
- name: Code Review
  run: |
    python3 skills/auto-code-review/scripts/review.py --dir . --format json --output review.json
    cat review.json
```
