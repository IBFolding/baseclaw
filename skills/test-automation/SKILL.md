# test-automation Skill

Automated testing framework for comprehensive test coverage and CI integration.

## Overview

This skill provides tools for:
- Unit test generation
- Integration test runner
- Test coverage reporting
- CI integration

## Quick Start

### 1. Initialize Test Framework

```bash
# Initialize for a Node.js project
~/.openclaw/workspace/skills/test-automation/scripts/init.sh nodejs

# Initialize for a Python project
~/.openclaw/workspace/skills/test-automation/scripts/init.sh python

# Initialize for Go
~/.openclaw/workspace/skills/test-automation/scripts/init.sh go
```

### 2. Generate Unit Tests

```bash
# Generate tests for a specific file
~/.openclaw/workspace/skills/test-automation/scripts/generate-tests.sh src/utils.js

# Generate tests for entire directory
~/.openclaw/workspace/skills/test-automation/scripts/generate-tests.sh src/ --recursive
```

### 3. Run Tests

```bash
# Run all tests
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh

# Run with coverage
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --coverage

# Run only unit tests
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --unit

# Run only integration tests
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --integration
```

### 4. Coverage Report

```bash
# Generate coverage report
~/.openclaw/workspace/skills/test-automation/scripts/coverage.sh

# Generate HTML report
~/.openclaw/workspace/skills/test-automation/scripts/coverage.sh --html

# Check coverage threshold
~/.openclaw/workspace/skills/test-automation/scripts/coverage.sh --threshold 80
```

## Scripts

| Script | Purpose |
|--------|---------|
| `init.sh` | Initialize testing framework for your project |
| `generate-tests.sh` | Auto-generate unit test scaffolding |
| `run-tests.sh` | Run test suites with various options |
| `coverage.sh` | Generate and analyze coverage reports |
| `watch-tests.sh` | Watch mode for continuous testing |
| `ci-integration.sh` | CI-specific test runner |

## Test Organization

### Directory Structure

```
project/
├── src/
│   └── your-code/
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   └── fixtures/      # Test data
└── coverage/          # Coverage reports
```

### Naming Conventions

- Unit tests: `*.test.js`, `*_test.py`, `*_test.go`
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

## Configuration

### Test Config File

Create `test.config.json` in your project root:

```json
{
  "framework": "jest",
  "coverage": {
    "threshold": 80,
    "exclude": ["tests/**", "node_modules/**"]
  },
  "patterns": {
    "unit": "**/*.test.js",
    "integration": "**/*.integration.test.js"
  }
}
```

## CI Integration

### GitHub Actions

The skill integrates with `ci-cd-pipeline`:

```yaml
- name: Run Tests
  run: ~/.openclaw/workspace/skills/test-automation/scripts/ci-integration.sh
  env:
    TEST_FRAMEWORK: jest
    COVERAGE_THRESHOLD: 80
```

## Advanced Usage

### Snapshot Testing

```bash
# Update snapshots
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --update-snapshots
```

### Parallel Testing

```bash
# Run tests in parallel
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --parallel 4
```

### Selective Testing

```bash
# Test only changed files
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --changed

# Test specific pattern
~/.openclaw/workspace/skills/test-automation/scripts/run-tests.sh --grep "auth"
```

## References

- `references/testing-patterns.md` - Common testing patterns
- `references/mock-examples.md` - Mocking examples
- `references/ci-integration.md` - CI/CD integration guide
